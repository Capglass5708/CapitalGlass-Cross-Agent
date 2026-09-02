#!/usr/bin/env node
/**
 * ESTATE-WIDE IMMUTABLE CONTEXT TEXT CAPTURE -- orchestrator.
 *
 * Census -> admission plan -> ONE capture funnel -> accounting -> proof.
 *
 * The orchestrator deliberately does no capturing of its own. It decides WHICH
 * sources are in scope for this run and it writes the proof; everything between
 * those two points is scripts/context-ledger/lib/capture.mjs. Seven adapters
 * that each knew how to write a ledger entry would be seven chances to skip the
 * pre-admission scan.
 *
 * SCOPE IS DECLARED BEFORE CAPTURE, NEVER AFTER. Every discovered source is
 * assigned REQUIRED_CAPTURE or an explicit non-required requirement up front.
 * Choosing the scope after seeing which captures succeeded is how a sample
 * silently becomes "everything that worked".
 *
 * KEY MATERIAL is read from the process environment and never from a file, a
 * flag or an argv value. It is never printed, never written, never hashed and
 * never compared. The only thing this script ever reports about the key is
 * whether one of the right SHAPE was present.
 */
import { mkdirSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';

import { runCensus } from './lib/discovery.mjs';
import { SourceRecord, REQUIREMENT, TERMINAL, CENSUS_STATUS, MILESTONE } from './lib/source-state.mjs';
import { captureSource, buildObservationIndex, CAPTURE_MODE, KEY_AUTHORITY, RETRIEVAL_SCOPE } from './lib/capture.mjs';
import { quarantineRoots, verifyQuarantineRegister, readQuarantineRegister, buildRefusalIndex } from './lib/quarantine.mjs';
import { accountClass, reconcileArchived, evaluateEstate, assertNoQuarantinedMaterialInLedger, ESTATE_VERDICT } from './lib/estate-completeness.mjs';
import { migratePlaintextSpool, auditSpoolForPlaintext } from './lib/estate-api.mjs';
import { scanEntries, reconstructHead } from './lib/ledger.mjs';
import { SshRsyncTransport, LocalFixtureTransport } from './lib/transport.mjs';
import { resolveProductionKey, KEY_ENV_CANDIDATES } from './lib/estate-api.mjs';
import { assertEmissionClean } from './lib/secret-detector.mjs';
import { validate } from './lib/schema-validate.mjs';
import { MACHINE_ID } from './lib/provenance.mjs';
import { assertBoundProse } from './lib/quantitative-prose.mjs';

const HOME = os.homedir();
// The evidence key's real NAME in the approved secret system, resolved by the
// shared resolver rather than assumed here. A second copy of that rule would
// eventually disagree with the first, and keyRef in a ledger entry has to be
// the name the secret system actually uses or the entry traces to nothing.
const KEY_ENV_NAME = KEY_ENV_CANDIDATES[0];

function arg(name, fallback = null) {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}
const flag = (name) => process.argv.slice(2).includes(`--${name}`);

/**
 * Per-class admission plan.
 *
 * `cap` bounds how many sources THIS run admits. Anything beyond the cap is
 * terminated DEFERRED_OUT_OF_RUN_SCOPE -- an explicit, counted state, not a
 * silent omission. Selection is the first N by sorted sourceId so a re-run
 * admits the same set; a random or mtime-ordered sample would make replay
 * idempotence untestable.
 */
/**
 * PRODUCTION PLAN: no caps.
 *
 * Every discovered source in every class is REQUIRED_CAPTURE. Caps existed
 * because the ledger's fork check was quadratic and a full run was infeasible;
 * that is fixed, so the reason is gone and the cap has to go with it. A cap
 * kept "for safety" would silently keep 16,205 sources out of the archive while
 * the matrix reported completeness.
 *
 * chatgpt is NOT_APPLICABLE by census, not by cap: the roots were looked at and
 * are genuinely absent, which is a measured zero.
 */
const DEFAULT_PLAN = {
  'claude-code-preserved': { cap: Infinity },
  'claude-code-live': { cap: Infinity },
  documents: { cap: Infinity },
  waverunner: { cap: Infinity },
  cursor: { cap: Infinity },
  git: { cap: Infinity },
  human: { cap: Infinity },
  chatgpt: { cap: 0, requirement: REQUIREMENT.NOT_APPLICABLE },
};

function resolvePreservedCorpusRoot(explicit) {
  if (explicit) return explicit;
  const base = path.join(HOME, '.capital-glass', 'evidence-preservation', 'claude-code');
  if (!existsSync(base)) return null;
  const runs = readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
  return runs.length ? path.join(base, runs[runs.length - 1]) : null;
}

/**
 * Key resolution.
 *
 * Presence and SHAPE only. resolveKey throws unless the material is exactly 32
 * bytes, which is a structural check on length -- no comparison against a known
 * value, no logging, no persistence. If the variable is absent this returns
 * UNAVAILABLE and the caller refuses to run in REAL mode rather than inventing
 * a key or capturing unencrypted while implying protection.
 */
function resolveKeyAuthority(mode) {
  if (mode === CAPTURE_MODE.REAL) return resolveProductionKey();
  // FIXTURE mode never touches the secret store at all.
  return { authority: KEY_AUTHORITY.TEST_ONLY, key: null, sourcedFrom: 'TEST_LOCAL_RANDOM', usable: false, reason: 'FIXTURE_MODE', keyRef: null, keyVersion: null };
}

export async function runEstateCapture({
  mode = CAPTURE_MODE.REAL,
  productionRun = true,
  vaultBase,
  preservedCorpusRoot,
  gitScopeRoot,
  gitScopePaths = ['scripts/context-ledger', 'contracts/context-ledger'],
  plan = DEFAULT_PLAN,
  workPackageId = 'ESTATE_WIDE_IMMUTABLE_CONTEXT_TEXT_CAPTURE_V1',
  key, keyAuthority, keySourcedFrom, keyRef = KEY_ENV_CANDIDATES[0], keyVersion = 'v1',
  primary, backup,
  runId = randomUUID(),
  onProgress = null,
} = {}) {
  const startedAt = new Date().toISOString();

  const spoolRoot = path.join(vaultBase, 'spool');
  const vaultRoot = path.join(vaultBase, 'vault');
  const metaRoot = path.join(vaultBase, 'meta');
  const { registerRoot, registerMetaRoot } = quarantineRoots(vaultBase);
  for (const d of [spoolRoot, vaultRoot, metaRoot, registerRoot, registerMetaRoot]) mkdirSync(d, { recursive: true, mode: 0o700 });

  // ---- CENSUS (independent of the capture funnel) ----
  const repoRoots = (await import('./lib/discovery.mjs')).estateRepoRoots();
  const census = runCensus({
    preservedCorpusRoot,
    repoRoots,
    gitScopeRoot,
    gitScopePaths,
    chatgptRoots: [
      path.join(HOME, 'chatgpt-export'),
      path.join(HOME, '.capital-glass', 'chatgpt-export'),
      '/mnt/c/Users/wesle/Downloads/chatgpt-export',
    ],
  });

  // ---- ADMISSION PLAN, declared before any capture ----
  const classRecords = new Map();
  for (const c of census) {
    const p = plan[c.sourceClass] ?? { cap: 0 };
    const records = [];
    const sorted = [...c.files].sort((a, b) => `${a.sourceRootId}:${a.relativePath}`.localeCompare(`${b.sourceRootId}:${b.relativePath}`));
    sorted.forEach((f, i) => {
      const requirement = p.requirement
        ?? (i < p.cap ? REQUIREMENT.REQUIRED_CAPTURE : REQUIREMENT.DEFERRED_OUT_OF_RUN_SCOPE);
      const cappedOut = requirement === REQUIREMENT.DEFERRED_OUT_OF_RUN_SCOPE;
      const r = new SourceRecord({
        sourceId: `${c.sourceClass}:${f.sourceRootId}:${f.relativePath}`,
        sourceSystem: c.sourceSystem,
        sourceClass: c.sourceClass,
        absPath: f.absPath,
        relativePath: f.relativePath,
        sourceRootId: f.sourceRootId,
        requirement,
        classificationRule: c.description,
      });
      r.detail.format = f.format;
      r.detail.expectedSha256 = f.expectedSha256 ?? null;
      records.push(r);
    });
    classRecords.set(c.sourceClass, records);
  }

  // ---- CAPTURE ----
  const observationIndex = buildObservationIndex(vaultRoot);
  // Refusals are replay-checked the same way captures are. Re-scanning an
  // unchanged source must not record the same credential finding twice.
  const refusalIndex = buildRefusalIndex(registerRoot);
  const captureErrors = [];
  let processed = 0;

  for (const c of census) {
    const records = classRecords.get(c.sourceClass);
    for (const record of records) {
      if (record.requirement !== REQUIREMENT.REQUIRED_CAPTURE) {
        // Non-required sources are terminated IMMEDIATELY and explicitly. A
        // discovered source with no terminal state is the disappearance the
        // accounting exists to catch, so nothing is left dangling.
        record.terminate(
          record.requirement === REQUIREMENT.NOT_APPLICABLE ? TERMINAL.NOT_APPLICABLE
            : record.requirement === REQUIREMENT.EXCLUDED_BY_POLICY ? TERMINAL.EXCLUDED_BY_POLICY
              : TERMINAL.DEFERRED_OUT_OF_RUN_SCOPE,
          c.note ?? 'RUN_SCOPE_CAP',
        );
        continue;
      }
      try {
        await captureSource({
          record, key, keyRef, keyVersion, keyAuthority,
          spoolRoot, vaultRoot, metaRoot, primary, backup,
          registerRoot, registerMetaRoot,
          mode, machineId: MACHINE_ID, workPackageId,
          expectedSha256: record.detail.expectedSha256,
          format: record.detail.format ?? 'text',
          observationIndex, refusalIndex,
        });
      } catch (err) {
        // A pipeline error is recorded as CAPTURE_FAILED, never swallowed and
        // never allowed to drop the source out of the accounting.
        captureErrors.push({ sourceId: record.sourceId, code: err?.message ?? 'UNKNOWN' });
        if (!record.isTerminated()) record.terminate(TERMINAL.CAPTURE_FAILED, String(err?.message ?? 'UNKNOWN'));
      }
      processed += 1;
      if (onProgress && processed % 100 === 0) onProgress({ processed });
    }
  }

  // ---- ACCOUNTING ----
  const classAccounts = census.map((c) => accountClass({
    sourceClass: c.sourceClass,
    sourceSystem: c.sourceSystem,
    censusStatus: c.censusStatus,
    censusNote: c.note,
    records: classRecords.get(c.sourceClass),
    productionRun,
  }));

  const allRecords = census.flatMap((c) => classRecords.get(c.sourceClass));

  // ---- LEDGER READBACK from the persisted layer ----
  const persistedEntries = scanEntries(vaultRoot);
  let chainVerified = false;
  let chainLength = 0;
  try {
    const rebuilt = reconstructHead(vaultRoot);
    chainLength = rebuilt.length;
    chainVerified = chainLength === persistedEntries.length;
  } catch { chainVerified = false; }

  const archivedReconciliation = reconcileArchived({
    records: allRecords,
    ledgerEvidenceIds: persistedEntries.map((e) => e.evidenceId),
  });

  const quarantinedRecords = allRecords.filter((r) => r.terminal === TERMINAL.QUARANTINED_SECRET);
  const quarantineLedgerCheck = assertNoQuarantinedMaterialInLedger({
    quarantinedRecords, ledgerEntries: persistedEntries,
  });
  const registerVerification = verifyQuarantineRegister(registerRoot);

  // ---- CONTRACT VALIDATION of every persisted entry ----
  const entrySchema = JSON.parse(
    (await import('node:fs')).readFileSync(
      path.join(gitScopeRoot, 'contracts/context-ledger/evidence-ledger-entry-v1.schema.json'), 'utf8'),
  );
  let schemaViolations = 0;
  const schemaErrorSample = [];
  for (const e of persistedEntries) {
    const v = validate(e, entrySchema);
    if (!v.valid) {
      schemaViolations += 1;
      if (schemaErrorSample.length < 5) schemaErrorSample.push({ entryHash: e.entryHash, errors: v.errors.slice(0, 6) });
    }
  }

  // The refusal register is held to its own contract too. An unvalidated
  // register is where a "valueSample" field would eventually appear.
  const registerSchema = JSON.parse(
    (await import('node:fs')).readFileSync(
      path.join(gitScopeRoot, 'contracts/context-ledger/quarantine-register-entry-v1.schema.json'), 'utf8'),
  );
  const registerEntries = readQuarantineRegister(registerRoot);
  let registerSchemaViolations = 0;
  for (const e of registerEntries) {
    const v = validate(e, registerSchema);
    if (!v.valid) {
      registerSchemaViolations += 1;
      if (schemaErrorSample.length < 8) schemaErrorSample.push({ register: e.entryHash, errors: v.errors.slice(0, 6) });
    }
  }
  if (registerSchemaViolations > 0) registerVerification.verified = false;

  const archivedCount = allRecords.filter((r) => r.terminal === TERMINAL.ARCHIVED).length;
  const durabilityStates = persistedEntries.map((e) => e.durabilityState);
  const fullyProtectedCount = durabilityStates.filter((s) => s === 'FULLY_PROTECTED').length;
  const ORDER = ['CAPTURED_LOCAL', 'HASHED_ENCRYPTED', 'PRIMARY_VERIFIED', 'BACKUP_VERIFIED', 'FULLY_PROTECTED'];
  const highest = durabilityStates.length
    ? ORDER[Math.max(...durabilityStates.map((s) => Math.max(0, ORDER.indexOf(s))))]
    : null;

  // ---- ENCRYPT-FIRST REMEDIATION AND INDEPENDENT AUDIT ----
  // Prove the encrypted replacement for every legacy plaintext object before
  // removing it, then audit the spool by looking at the BYTES rather than
  // trusting the step that just ran.
  const spoolRemediation = migratePlaintextSpool({ vaultBase, key });
  const spoolAudit = auditSpoolForPlaintext(vaultBase);

  const verdict = evaluateEstate({
    classes: classAccounts,
    archivedReconciliation,
    quarantineLedgerCheck,
    ledgerReadFromPersistedLayer: true,
    ledgerChainVerified: chainVerified,
    censusIndependent: true,
    quarantineRegisterVerified: registerVerification.verified,
    storageAuthorityProven: fullyProtectedCount > 0 && fullyProtectedCount === archivedCount,
  });

  const completedAt = new Date().toISOString();

  const proof = {
    schemaVersion: 'estate-capture-completeness-v1@1.0.0',
    recordedAt: completedAt,
    run: {
      runId, mode, machineId: MACHINE_ID, workPackageId, startedAt, completedAt,
      vaultRoot, spoolRoot,
      productionRun,
      selectionPolicy: productionRun
        ? 'No cap. Every discovered source in every class is REQUIRED_CAPTURE and terminates in exactly one explicit state.'
        : 'SAMPLED TEST RUN: a per-class cap bounded this run. It may not be presented as estate-wide completeness.',
    },
    keyAuthority: {
      authority: keyAuthority,
      keyRef,
      keyVersion,
      sourcedFrom: keySourcedFrom,
      materialEverWrittenToDisk: false,
      materialEverLogged: false,
    },
    censusIndependence: {
      censusModule: 'scripts/context-ledger/lib/discovery.mjs',
      captureModule: 'scripts/context-ledger/lib/capture.mjs',
      sharesClassificationLogic: false,
      sharedPrimitives: ['node:fs readdirSync/statSync', 'node:path'],
    },
    classes: classAccounts.map((c) => ({
      byTerminalClass: c.byTerminalClass, capOnlyDeferrals: c.capOnlyDeferrals,
      sourceClass: c.sourceClass, sourceSystem: c.sourceSystem, censusStatus: c.censusStatus, censusNote: c.censusNote,
      discovered: c.discovered, required: c.required, notRequired: c.notRequired,
      archived: c.archived, quarantined: c.quarantined, refused: c.refused,
      unaccounted: c.unaccounted, unterminated: c.unterminated, terminated: c.terminated,
      byTerminal: c.byTerminal, byMilestone: c.byMilestone,
      requiredSetHash: c.requiredSetHash, terminatedSetHash: c.terminatedSetHash,
      archivedSetHash: c.archivedSetHash, quarantinedSetHash: c.quarantinedSetHash,
      duplicateSourceIds: c.duplicateSourceIds ?? [],
      classComplete: c.classComplete, failures: c.failures,
    })),
    archivedReconciliation: {
      counts: archivedReconciliation.counts,
      expectedSetHash: archivedReconciliation.expectedSetHash,
      capturedSetHash: archivedReconciliation.capturedSetHash,
      ledgerSetHash: archivedReconciliation.ledgerSetHash,
      countsEqual: archivedReconciliation.countsEqual,
      setsEqual: archivedReconciliation.setsEqual,
      equal: archivedReconciliation.equal,
      countsMaskedADiscrepancy: archivedReconciliation.countsMaskedADiscrepancy,
      refusedCount: archivedReconciliation.refusedCount,
      missingCapturedRecords: archivedReconciliation.missingCapturedRecords.slice(0, 50),
      duplicateCapturedRecords: archivedReconciliation.duplicateCapturedRecords.slice(0, 50),
      missingLedgerObservations: archivedReconciliation.missingLedgerObservations.slice(0, 50),
    },
    quarantine: {
      registerVerified: registerVerification.verified,
      registerCount: registerVerification.count,
      distinctRefusals: registerVerification.distinctRefusals ?? null,
      duplicateRefusals: registerVerification.duplicateRefusals ?? null,
      registerChainLength: registerVerification.chainLength,
      ledgerCrossCheckClean: quarantineLedgerCheck.clean,
      detectorIdsObserved: [...new Set(quarantinedRecords.flatMap((r) => r.quarantine?.detectorIds ?? []))].sort(),
      violations: [...registerVerification.violations, ...quarantineLedgerCheck.violations,
        ...(registerSchemaViolations > 0 ? [{ code: 'REGISTER_ENTRIES_FAILED_CONTRACT', count: registerSchemaViolations }] : [])],
    },
    ledgerReadback: {
      readFromPersistedLayer: true,
      ledgerRoot: vaultRoot,
      observationCount: persistedEntries.length,
      chainVerified,
      chainLength,
      entriesSchemaValid: schemaViolations === 0,
      schemaViolationCount: schemaViolations,
    },
    encryptAtRest: {
      spoolPayload: 'CIPHERTEXT',
      plaintextAtRest: spoolAudit.verdict,
      objectsAudited: spoolAudit.objectsScanned,
      plaintextSuspects: spoolAudit.plaintextSuspects,
      legacyPlaintextFound: spoolRemediation.plaintextObjectsFound,
      legacyPlaintextVerifiedReplaced: spoolRemediation.plaintextObjectsVerified,
      legacyPlaintextRemoved: spoolRemediation.plaintextObjectsRemoved,
      legacyPlaintextRetained: spoolRemediation.plaintextObjectsRetained,
      removalEvidence: 'each removal required: encrypted replacement present, ciphertext hash matching the ledger, authenticated decryption, recovered identity match, and byte-identical recovery',
    },
    storageAuthority: {
      // NOT_PROVEN unless real remote legs actually verified. Configuration
      // presence is never evidence of durability.
      // PROVEN requires EVERY archived object to have reached FULLY_PROTECTED.
      //
      // "at least one object is durable" is not a durability claim about the
      // archive, and a single replicated canary flipping the whole run to
      // PROVEN is precisely the aggregate that lets a proof overstate itself.
      // The canary proves the replication PATH works; it says nothing about
      // the other 17,669 objects, which were never sent anywhere.
      status: (fullyProtectedCount > 0 && fullyProtectedCount === archivedCount) ? 'PROVEN' : 'NOT_PROVEN',
      scope: fullyProtectedCount === 0 ? 'NO_OBJECT_REPLICATED'
        : (fullyProtectedCount === archivedCount ? 'ALL_ARCHIVED_OBJECTS_REPLICATED' : 'CANARY_ONLY_REPLICATION_PATH_PROVEN'),
      archivedObjects: archivedCount,
      primaryVerified: false,
      backupVerified: false,
      fullyProtectedCount,
      highestObservedDurabilityState: highest,
      retrievalScope: RETRIEVAL_SCOPE.LOCAL_SPOOL,
      reason: fullyProtectedCount === 0
        ? 'REMOTE_TRANSPORT_NOT_PROVISIONED: the ssh-rsync adapter refuses rather than pretending, so both legs are unverified and every entry carries the truthful lower durability state.'
        : (fullyProtectedCount === archivedCount
          ? 'EVERY_ARCHIVED_OBJECT_VERIFIED_ON_BOTH_REMOTE_LEGS'
          : assertBoundProse(
              `REPLICATION PATH PROVEN BY CANARY ONLY: ${fullyProtectedCount} of ${archivedCount} archived objects reached FULLY_PROTECTED on both real remote legs. The remaining objects were never replicated, so estate durability is NOT proven. The drvfs route is not a bulk replication path.`,
              { derived: [fullyProtectedCount, archivedCount], context: 'storageAuthority.reason' },
            )),
    },
    verdict: verdict.verdict,
    failures: [
      ...verdict.failures,
      ...(spoolAudit.verdict === 'NONE_FOR_PRODUCTION_CAPTURE' ? [] : ['PLAINTEXT_PRESENT_IN_SPOOL']),
      ...(spoolRemediation.plaintextObjectsRetained > 0 ? ['LEGACY_PLAINTEXT_RETAINED_UNVERIFIED'] : []),
    ],
    accountingTablePath: null,
    notes: `captureErrors=${captureErrors.length}; schemaErrorSample=${JSON.stringify(schemaErrorSample).length > 2 ? 'present' : 'none'}`,
  };

  if (spoolAudit.verdict !== 'NONE_FOR_PRODUCTION_CAPTURE' || spoolRemediation.plaintextObjectsRetained > 0) {
    proof.verdict = ESTATE_VERDICT.INCOMPLETE;
  }

  return {
    proof, records: allRecords, census, classAccounts, persistedEntries, spoolRemediation, spoolAudit,
    registerEntries: readQuarantineRegister(registerRoot),
    captureErrors, schemaErrorSample, verdict,
  };
}

async function main() {
  const mode = flag('fixture') ? CAPTURE_MODE.FIXTURE : CAPTURE_MODE.REAL;
  const gitScopeRoot = arg('git-scope-root', process.cwd());
  const vaultBase = arg('vault-base', path.join(HOME, '.capital-glass', 'context-ledger', 'estate-capture-v1'));
  const preservedCorpusRoot = resolvePreservedCorpusRoot(arg('preserved-corpus'));
  const receiptDir = arg('receipt-dir', path.join(gitScopeRoot, 'artifacts', 'agent-runs', 'ESTATE_WIDE_IMMUTABLE_CONTEXT_TEXT_CAPTURE_V1'));

  const keyInfo = resolveKeyAuthority(mode);
  if (mode === CAPTURE_MODE.REAL && !keyInfo.usable) {
    // Never invent a key, never capture unencrypted while implying protection,
    // never read a secret store directly. This is an operator boundary.
    console.error(JSON.stringify({
      verdict: 'OPERATOR_ACTION_REQUIRED',
      code: 'ENCRYPTION_KEY_AUTHORITY_UNAVAILABLE',
      reason: keyInfo.reason,
      acceptedEnvNames: KEY_ENV_CANDIDATES,
      remedy: "Run under 'doppler run --project cg-mcp --config dev --' so the evidence key is injected into the environment.",
    }, null, 2));
    process.exit(3);
  }

  const plan = { ...DEFAULT_PLAN };
  const capOverride = arg('cap');
  // A cap makes this a SAMPLED TEST run, and the run says so. It may never be
  // used to claim estate-wide production completeness.
  const productionRun = capOverride === null && arg('only') === null;
  if (capOverride !== null) {
    for (const k of Object.keys(plan)) if (plan[k].cap !== 0) plan[k] = { ...plan[k], cap: Number(capOverride) };
  }
  if (arg('only')) {
    const only = arg('only').split(',');
    for (const k of Object.keys(plan)) if (!only.includes(k)) plan[k] = { ...plan[k], cap: 0, requirement: REQUIREMENT.DEFERRED_OUT_OF_RUN_SCOPE };
  }

  // Real remote legs. SshRsyncTransport is the honest adapter for storage that
  // does not exist yet: it refuses instead of pretending, so both legs stay
  // unverified and no entry can reach FULLY_PROTECTED.
  const primary = new SshRsyncTransport({ id: 'synology-cg-context-ledger', host: 'cg-server' });
  const backup = new SshRsyncTransport({ id: 'wesleydesk-backup', host: 'wesleydesk' });

  const t0 = Date.now();
  const out = await runEstateCapture({
    mode, vaultBase, preservedCorpusRoot, gitScopeRoot, plan, productionRun,
    key: keyInfo.key, keyAuthority: keyInfo.authority, keySourcedFrom: keyInfo.sourcedFrom,
    keyRef: keyInfo.keyRef, keyVersion: keyInfo.keyVersion,
    primary, backup,
    onProgress: ({ processed }) => process.stderr.write(`  ..${processed}\n`),
  });

  mkdirSync(receiptDir, { recursive: true });
  const stamp = out.proof.recordedAt.replace(/[:.]/g, '-');

  // Every artifact is scanned before it is written. An accounting table that
  // describes quarantined material must not itself become the leak.
  assertEmissionClean(out.proof, 'estate-capture-proof');
  const table = out.records.map((r) => r.toAccountingRow());
  assertEmissionClean(table, 'estate-capture-accounting-table');

  const proofPath = path.join(receiptDir, `estate-capture-proof-${stamp}.json`);
  // The per-source accounting table stays OUT of Git: it is a row per estate
  // source, including absolute paths across every repository and both home
  // trees. The proof receipt (aggregates and hashes) is mission evidence and
  // belongs in artifacts/agent-runs; the table it points at does not.
  const accountingDir = path.join(vaultBase, 'accounting');
  mkdirSync(accountingDir, { recursive: true, mode: 0o700 });
  const tablePath = path.join(accountingDir, `estate-capture-accounting-${stamp}.json`);
  out.proof.accountingTablePath = tablePath;
  writeFileSync(tablePath, `${JSON.stringify(table, null, 2)}\n`);
  writeFileSync(proofPath, `${JSON.stringify(out.proof, null, 2)}\n`);

  const proofSchema = JSON.parse(
    (await import('node:fs')).readFileSync(path.join(gitScopeRoot, 'contracts/context-ledger/estate-capture-completeness-v1.schema.json'), 'utf8'),
  );
  const pv = validate(out.proof, proofSchema);

  console.log(JSON.stringify({
    verdict: out.proof.verdict,
    mode, keyAuthority: keyInfo.authority, keySourcedFrom: keyInfo.sourcedFrom, keyRef: keyInfo.keyRef, keyVersion: keyInfo.keyVersion,
    elapsedMs: Date.now() - t0,
    proofPath, tablePath,
    proofSchemaValid: pv.valid,
    proofSchemaErrors: pv.errors.slice(0, 10),
    classes: out.proof.classes.map((c) => ({
      sourceClass: c.sourceClass, discovered: c.discovered, required: c.required,
      archived: c.archived, quarantined: c.quarantined, refused: c.refused, unaccounted: c.unaccounted,
      complete: c.classComplete,
    })),
    archivedReconciliation: out.proof.archivedReconciliation.counts,
    reconciliationEqual: out.proof.archivedReconciliation.equal,
    quarantine: { count: out.proof.quarantine.registerCount, verified: out.proof.quarantine.registerVerified, crossCheckClean: out.proof.quarantine.ledgerCrossCheckClean, detectorIds: out.proof.quarantine.detectorIdsObserved },
    ledgerReadback: out.proof.ledgerReadback,
    storageAuthority: out.proof.storageAuthority,
    failures: out.proof.failures.slice(0, 30),
    captureErrors: out.captureErrors.slice(0, 10),
    schemaErrorSample: out.schemaErrorSample,
  }, null, 2));

  process.exit(out.proof.verdict === ESTATE_VERDICT.COMPLETE && pv.valid ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(`estate capture failed: ${e?.message ?? e}`); process.exit(1); });
}
