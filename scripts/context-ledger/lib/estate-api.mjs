/**
 * PUBLIC SURFACE for the immutable context text capture pipeline.
 *
 * Everything an INDEPENDENT verifier needs, callable from a cold process with
 * no in-memory state from the run that ingested. Nothing here requires reaching
 * into ledger internals: a proof that can only be produced by hand-driving the
 * append primitive is a proof about the person driving it.
 *
 * Reading is separated from writing on purpose. `captureOneSource` is the only
 * function that mutates anything; every other export is read-only and can be
 * pointed at a copy of the vault, which is what makes tamper experiments
 * possible without touching authoritative evidence.
 */
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, cpSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { sha256Prefixed, objectStorePath } from './canonical.mjs';
import { scanEntries, reconstructHead, computeEntryHash, entryFileName, appendEntry, readHead, restoreHead, ENTRY_DIR } from './ledger.mjs';
import { decryptObject, encryptObject, resolveKey, DEFAULT_KEY_VERSION } from './crypto.mjs';
import { SourceRecord, REQUIREMENT, TERMINAL, MILESTONE, CENSUS_STATUS } from './source-state.mjs';
import { captureSource, CAPTURE_MODE, KEY_AUTHORITY, LEG_STATUS, buildObservationIndex, RETRIEVAL_SCOPE } from './capture.mjs';
import { quarantineRoots, verifyQuarantineRegister } from './quarantine.mjs';
import { accountClass, reconcileArchived, assertNoQuarantinedMaterialInLedger } from './estate-completeness.mjs';
import { formatFor } from './discovery.mjs';
import { MACHINE_ID } from './provenance.mjs';

/**
 * Accepted names for the evidence key, most specific first.
 *
 * keyRef in a ledger entry is the NAME of the key in the approved secret
 * system, so it has to be the name that system actually uses -- guessing a
 * tidier one would produce entries nobody can trace back to a real secret. The
 * version suffix is read from the name rather than assumed, because old
 * evidence must stay decryptable across rotations and the entry is the only
 * place that records which generation encrypted it.
 */
export const KEY_ENV_CANDIDATES = ['CONTEXT_LEDGER_EVIDENCE_KEY_V1', 'CONTEXT_LEDGER_EVIDENCE_KEY'];
export const KEY_ENV_NAME = KEY_ENV_CANDIDATES[0];
export const KEY_REF = KEY_ENV_CANDIDATES[0];

export function keyVersionFromName(name) {
  const m = /_V(\d+)$/i.exec(String(name));
  return m ? `v${m[1]}` : DEFAULT_KEY_VERSION;
}

/** Standard vault layout, so a verifier addresses the same directories we do. */
export function vaultLayout(vaultBase) {
  const q = quarantineRoots(vaultBase);
  return {
    vaultBase,
    spoolRoot: path.join(vaultBase, 'spool'),
    vaultRoot: path.join(vaultBase, 'vault'),
    metaRoot: path.join(vaultBase, 'meta'),
    registerRoot: q.registerRoot,
    registerMetaRoot: q.registerMetaRoot,
  };
}

export function ensureVault(vaultBase) {
  const l = vaultLayout(vaultBase);
  for (const d of [l.spoolRoot, l.vaultRoot, l.metaRoot, l.registerRoot, l.registerMetaRoot]) {
    mkdirSync(d, { recursive: true, mode: 0o700 });
  }
  // Crash recovery runs on every open, not on request. See recoverHead.
  l.headRecovery = recoverHead(vaultBase);
  return l;
}

/**
 * Resume after an interrupted capture.
 *
 * The head pointer is a cache; the chain is the authority. Two interruptions
 * matter and they look different on disk:
 *
 *   - head file lost entirely -> rebuild it by walking the chain;
 *   - process died BETWEEN writing an immutable entry and updating the head ->
 *     the head is present but STALE, pointing at the entry before the tip.
 *
 * The second is the dangerous one. A stale head makes the next append claim a
 * predecessor that already has a successor, and the ledger correctly refuses it
 * as FORK_DETECTED -- so an interrupted run would stay permanently wedged,
 * refusing every subsequent capture, until someone rebuilt the head by hand.
 * Recovering here turns that into a resume.
 *
 * Recovery only ever moves the pointer to the chain's real tip. It never
 * rewrites, merges or discards an entry, and a genuine fork still throws.
 */
export function recoverHead(vaultBase) {
  const { vaultRoot, metaRoot } = vaultLayout(vaultBase);
  const entries = scanEntries(vaultRoot);
  if (entries.length === 0) return { action: 'NO_ENTRIES', chainLength: 0 };
  let rebuilt;
  try { rebuilt = reconstructHead(vaultRoot); } catch (e) {
    // A real fork or a broken chain is an incident for a human, never something
    // to paper over by picking a branch.
    return { action: 'CHAIN_UNRESOLVED', code: e.message, chainLength: 0 };
  }
  const head = readHead(metaRoot);
  if (head && head.entryHash === rebuilt.head.entryHash) {
    return { action: 'HEAD_CURRENT', entryHash: head.entryHash, chainLength: rebuilt.length };
  }
  restoreHead(metaRoot, rebuilt.head);
  return {
    action: head ? 'STALE_HEAD_ADVANCED_TO_CHAIN_TIP' : 'MISSING_HEAD_REBUILT_FROM_CHAIN',
    previousEntryHash: head?.entryHash ?? null,
    entryHash: rebuilt.head.entryHash,
    chainLength: rebuilt.length,
  };
}

/**
 * Key authority.
 *
 * PRODUCTION material arrives only through the process environment, injected by
 * the approved secret system. It is never read from a file, never taken from
 * argv (which would put it in the process table), never logged, never hashed
 * and never compared against anything. The only fact ever reported about it is
 * whether material of the correct SHAPE was present.
 *
 * TEST_ONLY material is generated locally and may prove software behaviour. It
 * is refused on the real capture path, because evidence encrypted under a
 * scratch key is evidence nobody can decrypt later, and acceptance manufactured
 * with one is acceptance of nothing.
 */
export function resolveProductionKey() {
  const found = KEY_ENV_CANDIDATES.find((n) => process.env[n]);
  if (!found) {
    return {
      usable: false, authority: null, key: null, sourcedFrom: 'UNAVAILABLE',
      keyRef: null, keyVersion: null,
      reason: `NONE_OF_[${KEY_ENV_CANDIDATES.join(',')}]_PRESENT_IN_ENVIRONMENT`,
    };
  }
  try {
    // resolveKey checks LENGTH only -- 32 bytes for AES-256. No comparison
    // against a known value, nothing logged, nothing persisted.
    const key = resolveKey(process.env[found]);
    return {
      usable: true, authority: KEY_AUTHORITY.PRODUCTION, key,
      sourcedFrom: 'DOPPLER_ENV_INJECTION',
      keyRef: found, keyVersion: keyVersionFromName(found),
      reason: 'PRODUCTION_KEY_PRESENT_AND_CORRECTLY_SIZED',
    };
  } catch {
    return {
      usable: false, authority: null, key: null, sourcedFrom: 'UNAVAILABLE',
      keyRef: found, keyVersion: keyVersionFromName(found),
      reason: 'KEY_MATERIAL_PRESENT_BUT_NOT_32_BYTES_FOR_AES_256',
    };
  }
}

/**
 * REAL ADAPTER ENTRY POINT -- one source, the complete path.
 *
 *   pre-admission scan -> raw admission -> content identity -> encryption
 *   -> immutable ledger append -> persisted-layer read-back
 *   -> retrievability -> completeness accounting
 *
 * Same funnel the estate run uses. There is no second, easier path that a proof
 * could take, which is the point: if this returns ARCHIVED, the estate run
 * would have done exactly the same thing to the same bytes.
 */
export async function captureOneSource({
  absPath,
  sourceSystem = 'documents',
  sourceClass = 'single-source',
  sourceRootId = null,
  relativePath = null,
  vaultBase,
  key,
  keyAuthority,
  keyRef = KEY_REF,
  keyVersion = DEFAULT_KEY_VERSION,
  mode = CAPTURE_MODE.REAL,
  primary,
  backup,
  format = null,
  workPackageId = null,
  expectedSha256 = null,
}) {
  const layout = ensureVault(vaultBase);
  const rootId = sourceRootId ?? 'adhoc';
  const rel = relativePath ?? path.basename(absPath);

  const record = new SourceRecord({
    sourceId: `${sourceClass}:${rootId}:${rel}`,
    sourceSystem, sourceClass, absPath, relativePath: rel, sourceRootId: rootId,
    requirement: REQUIREMENT.REQUIRED_CAPTURE,
    classificationRule: 'explicit single-source admission',
  });

  const result = await captureSource({
    record,
    key, keyRef, keyVersion, keyAuthority,
    spoolRoot: layout.spoolRoot, vaultRoot: layout.vaultRoot, metaRoot: layout.metaRoot,
    primary, backup,
    registerRoot: layout.registerRoot, registerMetaRoot: layout.registerMetaRoot,
    mode, machineId: MACHINE_ID, workPackageId,
    expectedSha256,
    format: format ?? formatFor(absPath),
    observationIndex: buildObservationIndex(layout.vaultRoot),
  });

  // Completeness accounting for this one source, produced by the SAME judge the
  // estate run uses -- not a simplified variant that could pass differently.
  const account = accountClass({
    sourceClass, sourceSystem, censusStatus: CENSUS_STATUS.COMPLETE, records: [record],
  });
  const persisted = scanEntries(layout.vaultRoot);
  const reconciliation = reconcileArchived({ records: [record], ledgerEvidenceIds: persisted.map((e) => e.evidenceId) });
  const quarantineCheck = assertNoQuarantinedMaterialInLedger({
    quarantinedRecords: record.terminal === TERMINAL.QUARANTINED_SECRET ? [record] : [],
    ledgerEntries: persisted,
  });

  return {
    sourceId: record.sourceId,
    terminal: record.terminal,
    terminalReason: record.terminalReason,
    quarantined: record.terminal === TERMINAL.QUARANTINED_SECRET,
    quarantineDetectorIds: record.quarantine?.detectorIds ?? null,

    // Content identity is the PLAINTEXT hash of the admitted bytes. The
    // ciphertext hash is a storage address and is reported under `encryption`
    // only, never alongside contentHash where the two could be compared.
    contentHash: record.contentHash,
    evidenceId: record.evidenceId,
    entryHash: record.ledgerEntryHash,
    duplicate: result.duplicate === true,

    milestones: record.milestones,
    milestoneEvidence: record.milestoneEvidence,
    replication: record.replication ?? null,
    durabilityState: record.durabilityState,
    provenance: record.provenance,

    accounting: account,
    reconciliation,
    quarantineCrossCheckClean: quarantineCheck.clean,
    ledgerObservationCount: persisted.length,
    vault: layout,
  };
}

// ---------------------------------------------------------------------------
// INDEPENDENT LOOKUP -- cold process, no shared state with the ingesting run.
// ---------------------------------------------------------------------------

/** Resolve by entryHash. Reads only the immutable entry files. */
export function lookupByEntryHash(vaultBase, entryHash) {
  const { vaultRoot } = vaultLayout(vaultBase);
  const p = path.join(vaultRoot, ENTRY_DIR, entryFileName(entryHash));
  if (!existsSync(p)) return { found: false, entryHash, reason: 'NO_ENTRY_FILE_FOR_THAT_HASH' };
  const entry = JSON.parse(readFileSync(p, 'utf8'));
  const recomputed = computeEntryHash(entry, entry.prevHash);
  return {
    found: true, entryPath: p, entry,
    entryHashRecomputed: recomputed,
    entryHashValid: recomputed === entry.entryHash && entry.entryHash === entryHash,
  };
}

/**
 * Resolve by contentHash. One blob can carry MANY observations -- the same
 * bytes seen in the WSL tree and in the Windows mirror are two facts about
 * where they were, not one fact counted twice -- so this returns a list.
 */
export function lookupByContentHash(vaultBase, contentHash) {
  const { vaultRoot, spoolRoot } = vaultLayout(vaultBase);
  const entries = scanEntries(vaultRoot).filter((e) => e.contentHash === contentHash);
  // The object at rest is the ENCRYPTED form, addressed by ciphertextHash.
  // contentHash is the object's IDENTITY, never its location.
  const ciphertextHash = entries[0]?.encryption?.ciphertextHash ?? null;
  const objectPath = ciphertextHash ? path.join(spoolRoot, objectStorePath(ciphertextHash)) : null;
  const objectPresent = Boolean(objectPath && existsSync(objectPath));
  return {
    found: entries.length > 0,
    contentHash,
    observationCount: entries.length,
    entryHashes: entries.map((e) => e.entryHash),
    evidenceIds: entries.map((e) => e.evidenceId),
    observations: entries.map((e) => ({
      entryHash: e.entryHash, evidenceId: e.evidenceId, sourceSystem: e.sourceSystem,
      sourceNativeId: e.sourceNativeId, relativePath: e.sourceObservation?.relativePath ?? null,
      durabilityState: e.durabilityState, captureTimestamp: e.captureTimestamp,
    })),
    objectPresent,
    objectPath: objectPresent ? objectPath : null,
    storedPayload: objectPresent ? 'CIPHERTEXT' : null,
    plaintextAtRest: false,
  };
}

// ---------------------------------------------------------------------------
// RESTORE -- returns the EXACT admitted bytes.
// ---------------------------------------------------------------------------

/**
 * Reconstruct the admitted plaintext from the ENCRYPTED object at rest.
 *
 * A key is now mandatory, and that is the point: nothing readable exists on
 * disk without it. The object is ADDRESSED by ciphertextHash but its IDENTITY
 * is the plaintext contentHash, and conflating those is the specific bug that
 * makes a correct restore look like corruption. This returns plaintext and
 * verifies it against contentHash only; it never hands back a ciphertext hash
 * beside a source hash, because two hashes printed side by side will eventually
 * be compared by somebody.
 */
export function restoreAdmittedBytes({ vaultBase, contentHash, key = null, aad = {}, keyVersion = DEFAULT_KEY_VERSION }) {
  const { spoolRoot, vaultRoot } = vaultLayout(vaultBase);
  const scope = RETRIEVAL_SCOPE.LOCAL_SPOOL;

  // The ciphertext address comes from the immutable ledger, not from a guess.
  const entry = scanEntries(vaultRoot).find((e) => e.contentHash === contentHash);
  if (!entry) return { restored: false, reason: 'NO_LEDGER_ENTRY_FOR_THAT_CONTENT_HASH', scope, contentHash };
  const ciphertextHash = entry.encryption?.ciphertextHash ?? null;
  if (!ciphertextHash) return { restored: false, reason: 'ENTRY_RECORDS_NO_CIPHERTEXT_ADDRESS', scope, contentHash };

  const objectPath = path.join(spoolRoot, objectStorePath(ciphertextHash));
  if (!existsSync(objectPath)) {
    return { restored: false, reason: 'ENCRYPTED_OBJECT_NOT_PRESENT_IN_LOCAL_SPOOL', scope, contentHash };
  }
  const stored = readFileSync(objectPath);
  if (sha256Prefixed(stored) !== ciphertextHash) {
    return { restored: false, reason: 'STORED_OBJECT_CIPHERTEXT_HASH_MISMATCH', scope, contentHash };
  }
  if (!key) {
    // Refusing here is the honest answer: without key authority the plaintext
    // is not recoverable by anyone, which is exactly what encrypt-first means.
    return { restored: false, reason: 'KEY_AUTHORITY_REQUIRED_PLAINTEXT_IS_NOT_AT_REST', scope, contentHash, objectPresent: true };
  }

  let plaintext;
  try { plaintext = decryptObject({ blob: stored, key, aad }); } catch {
    return { restored: false, reason: 'AUTHENTICATED_DECRYPTION_FAILED', scope, contentHash };
  }
  const restoredHash = sha256Prefixed(plaintext);

  return {
    restored: true,
    scope,
    plaintext,
    contentHash,
    restoredHash,
    hashMatches: restoredHash === contentHash,
    byteLength: plaintext.length,
    objectPath,
    storedPayload: 'CIPHERTEXT',
    plaintextAtRest: false,
    remoteRetrievalProven: false,
    envelopeRoundTrip: { verified: restoredHash === contentHash, byteLength: plaintext.length },
  };
}

// ---------------------------------------------------------------------------
// VERIFICATION -- tamper detection, safe on an isolated copy.
// ---------------------------------------------------------------------------

/**
 * Copy a vault so tamper experiments never touch authoritative evidence.
 * Verification is read-only, so a verifier may equally point the functions
 * below straight at the real vault; this exists so DESTRUCTIVE probes have
 * somewhere safe to happen.
 */
export function isolateVault(vaultBase, destBase = null) {
  const dest = destBase ?? path.join(os.tmpdir(), `ctx-ledger-isolate-${process.pid}-${Date.now()}`);
  mkdirSync(dest, { recursive: true });
  cpSync(vaultBase, dest, { recursive: true });
  return dest;
}

/**
 * Verify ONE entry three ways, reported separately.
 *
 * A single boolean would let any one of these mask the others: metadata
 * tampering, chain-link tampering and payload tampering are different attacks
 * and a verifier needs to see which one fired.
 */
export function verifyEntry(vaultBase, entryHash, { checkPayload = true } = {}) {
  const { vaultRoot, spoolRoot } = vaultLayout(vaultBase);
  const p = path.join(vaultRoot, ENTRY_DIR, entryFileName(entryHash));
  if (!existsSync(p)) return { verified: false, code: 'ENTRY_NOT_FOUND', entryHash };

  let entry;
  try { entry = JSON.parse(readFileSync(p, 'utf8')); } catch {
    return { verified: false, code: 'ENTRY_UNPARSEABLE', entryHash };
  }

  // 1. metadata integrity: entryHash covers every field except itself.
  const recomputed = computeEntryHash(entry, entry.prevHash);
  const metadataIntact = recomputed === entry.entryHash;

  // 2. filename binding: the file is NAMED from its own hash, so a tampered
  //    entry no longer lives where its content says it should.
  const filenameBindsHash = path.basename(p) === entryFileName(entry.entryHash);

  // 3. chain link: prevHash must resolve to a real predecessor (or be genesis).
  let chainLinkIntact = true;
  let chainLinkReason = 'GENESIS';
  if (entry.prevHash !== null && entry.prevHash !== undefined) {
    const prevPath = path.join(vaultRoot, ENTRY_DIR, entryFileName(entry.prevHash));
    if (!existsSync(prevPath)) { chainLinkIntact = false; chainLinkReason = 'PREV_ENTRY_MISSING'; }
    else {
      const prev = JSON.parse(readFileSync(prevPath, 'utf8'));
      chainLinkIntact = prev.entryHash === entry.prevHash;
      chainLinkReason = chainLinkIntact ? 'PREV_RESOLVED' : 'PREV_HASH_DOES_NOT_MATCH_PREDECESSOR';
    }
  }

  // 4. payload integrity: re-hash the stored object at its content address.
  // 4. payload integrity: re-hash the stored object at its CIPHERTEXT address.
  //    The plaintext hash is the object's identity, not its location; only the
  //    encrypted form exists at rest.
  let payload = { checked: false };
  const ciphertextHash = entry.encryption?.ciphertextHash ?? null;
  if (checkPayload && ciphertextHash) {
    const objPath = path.join(spoolRoot, objectStorePath(ciphertextHash));
    if (!existsSync(objPath)) payload = { checked: true, present: false, intact: false, reason: 'OBJECT_ABSENT', payloadClass: 'CIPHERTEXT' };
    else {
      const bytes = readFileSync(objPath);
      const observed = sha256Prefixed(bytes);
      const intact = observed === ciphertextHash;
      payload = {
        checked: true, present: true, intact, payloadClass: 'CIPHERTEXT',
        byteLength: bytes.length,
        byteLengthMatchesLedger: entry.encryption?.ciphertextByteLength == null ? null : bytes.length === entry.encryption.ciphertextByteLength,
        reason: intact ? 'OK' : 'PAYLOAD_HASH_MISMATCH',
      };
    }
  }

  const verified = metadataIntact && filenameBindsHash && chainLinkIntact && (!payload.checked || payload.intact);
  return {
    verified, entryHash,
    metadataIntact, entryHashRecomputed: recomputed, filenameBindsHash,
    chainLinkIntact, chainLinkReason, payload,
    code: verified ? 'ENTRY_VERIFIED'
      : !metadataIntact ? 'ENTRY_METADATA_TAMPERED'
        : !chainLinkIntact ? 'CHAIN_LINK_TAMPERED'
          : !filenameBindsHash ? 'ENTRY_FILENAME_DOES_NOT_BIND_HASH'
            : 'PAYLOAD_TAMPERED',
  };
}

/** Walk the whole chain and every entry. Read-only. */
export function verifyChain(vaultBase, { checkPayload = true } = {}) {
  const { vaultRoot } = vaultLayout(vaultBase);
  const entries = scanEntries(vaultRoot);
  let chain = { ok: false, length: 0, code: null };
  try {
    const r = reconstructHead(vaultRoot);
    chain = { ok: r.length === entries.length, length: r.length, code: r.length === entries.length ? 'CHAIN_COMPLETE' : 'CHAIN_ORPHAN_ENTRIES' };
  } catch (e) {
    chain = { ok: false, length: 0, code: e.message };
  }
  const perEntry = entries.map((e) => verifyEntry(vaultBase, e.entryHash, { checkPayload }));
  const failed = perEntry.filter((r) => !r.verified);
  return {
    verified: chain.ok && failed.length === 0,
    entryCount: entries.length,
    chain,
    failedCount: failed.length,
    failures: failed.slice(0, 20),
  };
}

/**
 * CAS probe. Exercised on an ISOLATED copy so the authoritative head is never
 * advanced by a test: a probe that mutates production evidence to prove
 * production evidence is safe has already lost the argument.
 */
export function casProbe(vaultBase) {
  const isolated = isolateVault(vaultBase);
  const { vaultRoot, metaRoot } = vaultLayout(isolated);
  const head = readHead(metaRoot);
  const currentHead = head?.entryHash ?? null;

  let staleRefused = false;
  let staleCode = null;
  try {
    appendEntry({
      vaultRoot, metaRoot,
      body: { schemaVersion: 'cas-probe', note: 'stale predecessor probe' },
      // Deliberately wrong: claims genesis when a head already exists (or claims
      // a fabricated head when the chain is empty).
      expectedPrevHash: currentHead === null ? 'sha256:'.padEnd(71, '0') : null,
    });
  } catch (e) {
    staleRefused = e.message === 'CAS_PRECONDITION_FAILED';
    staleCode = e.message;
  }

  let correctAccepted = false;
  let correctCode = null;
  try {
    const r = appendEntry({
      vaultRoot, metaRoot,
      body: { schemaVersion: 'cas-probe', note: 'correct predecessor probe' },
      expectedPrevHash: currentHead,
    });
    correctAccepted = Boolean(r.entry?.entryHash);
  } catch (e) { correctCode = e.message; }

  return {
    isolatedVault: isolated,
    observedHead: currentHead,
    staleExpectedPrevHashRefused: staleRefused,
    staleRefusalCode: staleCode,
    correctExpectedPrevHashAccepted: correctAccepted,
    correctFailureCode: correctCode,
    authoritativeVaultUntouched: true,
  };
}

/** Quarantine register status, read from the persisted register. */
export function quarantineStatus(vaultBase) {
  const { registerRoot, vaultRoot } = vaultLayout(vaultBase);
  const v = verifyQuarantineRegister(registerRoot);
  const entries = scanEntries(registerRoot);
  return {
    verified: v.verified, count: v.count, distinctRefusals: v.distinctRefusals ?? null,
    duplicateRefusals: v.duplicateRefusals ?? null, chainLength: v.chainLength, violations: v.violations,
    // Metadata only, exactly as the register stores it.
    records: entries.map((e) => ({
      entryHash: e.entryHash, refusalId: e.refusalId ?? null, sourcePath: e.sourcePath, sourceSystem: e.sourceSystem,
      byteSize: e.byteSize, detectorIds: e.detection?.detectorIds ?? [],
      findingCount: e.detection?.findingCount ?? 0, detectedAt: e.detectedAt,
      payloadCaptured: e.payloadCaptured, contentHashWithheld: e.contentHashWithheld,
    })),
    evidenceLedgerEntryCount: scanEntries(vaultRoot).length,
  };
}

/**
 * PLAINTEXT SPOOL REMEDIATION.
 *
 * The spool previously held admitted plaintext. Those objects are real evidence
 * and must not be destroyed to fix the defect that created them -- losing
 * evidence to improve safety is a worse outcome than the unsafe state, because
 * the unsafe state is recoverable and the loss is not.
 *
 * So this proves the replacement BEFORE removing anything, per object:
 *
 *   1. the object's address matches a contentHash in the immutable ledger, so
 *      it is genuinely a plaintext object and not something else;
 *   2. the entry names a ciphertextHash, and that encrypted object EXISTS;
 *   3. the encrypted object re-hashes to the ciphertextHash the ledger records;
 *   4. it authenticated-decrypts;
 *   5. the recovered plaintext hashes to the SAME contentHash, and its bytes
 *      are byte-identical to the plaintext file about to be removed.
 *
 * Only after all five does the plaintext file get unlinked. Any failure leaves
 * it exactly where it is, marked RETAINED_UNVERIFIED, and the run reports it
 * rather than quietly skipping it. `dryRun` proves the whole chain and removes
 * nothing.
 */
const existsSyncSafe = (p2) => { try { return existsSync(p2); } catch { return false; } };

function printableRatioOf(buf, sampleBytes = 4096) {
  const head = buf.subarray(0, Math.min(sampleBytes, buf.length));
  if (head.length === 0) return 0;
  let printable = 0;
  for (const b of head) if (b === 9 || b === 10 || b === 13 || (b >= 32 && b < 127)) printable += 1;
  return printable / head.length;
}

export function migratePlaintextSpool({ vaultBase, key, dryRun = false, aad = {}, replacementVaultBase = null, createReplacement = true }) {
  const { spoolRoot } = vaultLayout(vaultBase);
  // The REPLACEMENT authority may live in a different vault: when a vault is
  // superseded and rebuilt, the rebuilt one is what proves the old plaintext is
  // safe to remove. Defaults to the same vault.
  const replacement = vaultLayout(replacementVaultBase ?? vaultBase);
  const startedAt = new Date().toISOString();

  const byContentHash = new Map();
  for (const e of scanEntries(replacement.vaultRoot)) if (e.contentHash) byContentHash.set(e.contentHash, e);
  // A superseded vault keeps its own entries; they still name the ciphertext
  // address that a replacement must reproduce.
  const localByContentHash = new Map();
  if (replacementVaultBase) {
    for (const e of scanEntries(vaultLayout(vaultBase).vaultRoot)) if (e.contentHash) localByContentHash.set(e.contentHash, e);
  }
  let createdReplacements = 0;

  const objects = [];
  const objRoot = path.join(spoolRoot, 'objects', 'sha256');
  if (existsSync(objRoot)) {
    for (const shard of readdirSync(objRoot)) {
      const shardDir = path.join(objRoot, shard);
      let names = [];
      try { names = readdirSync(shardDir); } catch { continue; }
      for (const n of names) objects.push({ address: `sha256:${n}`, abs: path.join(shardDir, n) });
    }
  }

  const removed = [];
  const retained = [];
  let ciphertextObjects = 0;

  for (const o of objects) {
    // CLASSIFY BY BYTES, not by ledger membership.
    //
    // "No ledger entry, therefore it is ciphertext" is an inference, and it was
    // wrong: when the replacement authority is a DIFFERENT vault, a genuine
    // plaintext object whose entry lives elsewhere looks unreferenced and gets
    // skipped as if it were already encrypted. AES-GCM output is
    // indistinguishable from random, so the bytes themselves settle it.
    let bytes;
    try { bytes = readFileSync(o.abs); } catch { continue; }
    const looksPlaintext = printableRatioOf(bytes) > 0.85;
    const entry = byContentHash.get(o.address) ?? localByContentHash.get(o.address) ?? null;
    if (!looksPlaintext && !entry) { ciphertextObjects += 1; continue; }
    if (!looksPlaintext && entry) { ciphertextObjects += 1; continue; }
    if (looksPlaintext && !entry) {
      retained.push({
        removedObject: { identityHash: o.address, path: o.abs, byteSize: (() => { try { return statSync(o.abs).size; } catch { return null; } })() },
        reason: 'PLAINTEXT_OBJECT_WITH_NO_LEDGER_ENTRY_IN_EITHER_VAULT',
        disposition: 'RETAINED_UNVERIFIED',
      });
      continue;
    }

    const record = {
      plaintextAddress: o.address, path: o.abs,
      entryHash: entry.entryHash, evidenceId: entry.evidenceId,
      ciphertextHash: entry.encryption?.ciphertextHash ?? null,
      byteSize: (() => { try { return statSync(o.abs).size; } catch { return null; } })(),
    };

    const fail = (reason) => { retained.push({ ...record, reason, disposition: 'RETAINED_UNVERIFIED' }); };

    if (!record.ciphertextHash) { fail('ENTRY_RECORDS_NO_CIPHERTEXT_HASH'); continue; }
    let encPath = path.join(replacement.spoolRoot, objectStorePath(record.ciphertextHash));

    // A replacement does not have to pre-exist -- it has to EXIST AND BE PROVEN
    // before the plaintext is removed. Encryption is deterministic, so
    // re-encrypting these exact bytes must reproduce the ciphertextHash the
    // ledger already recorded. If it does not, something is wrong with the
    // object or the key and nothing is removed.
    if (!existsSync(encPath) && createReplacement) {
      const rebuilt = encryptObject({ plaintext: bytes, key, plaintextHash: o.address, aad, keyVersion: entry.encryption?.keyVersion ?? DEFAULT_KEY_VERSION });
      if (rebuilt.ciphertextHash !== record.ciphertextHash) { fail('REBUILT_CIPHERTEXT_HASH_DOES_NOT_MATCH_LEDGER'); continue; }
      const target = path.join(replacement.spoolRoot, objectStorePath(rebuilt.ciphertextHash));
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, rebuilt.blob, { mode: 0o600 });
      encPath = target;
      createdReplacements += 1;
    }
    if (!existsSync(encPath)) { fail('ENCRYPTED_REPLACEMENT_ABSENT'); continue; }

    let enc;
    try { enc = readFileSync(encPath); } catch { fail('ENCRYPTED_REPLACEMENT_UNREADABLE'); continue; }
    if (sha256Prefixed(enc) !== record.ciphertextHash) { fail('ENCRYPTED_REPLACEMENT_HASH_MISMATCH'); continue; }

    let recovered;
    try { recovered = decryptObject({ blob: enc, key, aad }); } catch { fail('ENCRYPTED_REPLACEMENT_FAILED_DECRYPTION'); continue; }
    if (sha256Prefixed(recovered) !== o.address) { fail('RECOVERED_PLAINTEXT_IDENTITY_MISMATCH'); continue; }

    let original;
    try { original = readFileSync(o.abs); } catch { fail('PLAINTEXT_OBJECT_UNREADABLE'); continue; }
    if (!recovered.equals(original)) { fail('RECOVERED_PLAINTEXT_BYTES_DIFFER_FROM_ORIGINAL'); continue; }

    // A per-object BINDING, not a log line. "Removed 1,201 objects" cannot be
    // checked by anyone later; this links each removed plaintext object to the
    // exact replacement that justified removing it, the ledger entry that
    // replacement is bound to, and the named checks that were actually run.
    const verifiedAt = new Date().toISOString();
    const proof = {
      removedObject: {
        identityHash: o.address,          // sha256 of the plaintext bytes
        path: o.abs,
        byteSize: record.byteSize,
      },
      replacementCreatedDuringRemediation: createdReplacements > 0 && !existsSyncSafe(encPath) ? false : undefined,
      replacement: {
        contentHash: entry.contentHash,   // same identity, proven by decryption
        ciphertextHash: record.ciphertextHash,
        objectPath: encPath,
        ciphertextByteLength: enc.length,
        recoveredByteLength: recovered.length,
      },
      boundToLedgerEntry: {
        entryHash: entry.entryHash,
        evidenceId: entry.evidenceId,
        sourceSystem: entry.sourceSystem ?? null,
        relativePath: entry.sourceObservation?.relativePath ?? null,
        contentHashInLedger: entry.contentHash,
      },
      integrityChecks: [
        { check: 'ENCRYPTED_REPLACEMENT_PRESENT', result: 'PASS' },
        { check: 'CIPHERTEXT_HASH_EQUALS_LEDGER_VALUE', result: 'PASS', expected: record.ciphertextHash },
        { check: 'AUTHENTICATED_DECRYPTION', result: 'PASS', algorithm: 'AES-256-GCM' },
        { check: 'RECOVERED_PLAINTEXT_HASH_EQUALS_REMOVED_OBJECT_IDENTITY', result: 'PASS', expected: o.address },
        { check: 'RECOVERED_BYTES_IDENTICAL_TO_REMOVED_OBJECT', result: 'PASS' },
      ],
      allChecksPassed: true,
      verifiedAt,
      disposition: dryRun ? 'VERIFIED_WOULD_REMOVE' : 'REMOVED_AFTER_VERIFIED_REPLACEMENT',
      removedAt: null,
    };
    if (!dryRun) {
      try { rmSync(o.abs, { force: true }); } catch { fail('UNLINK_FAILED'); continue; }
      proof.removedAt = new Date().toISOString();
    }
    removed.push(proof);
  }

  return {
    startedAt, completedAt: new Date().toISOString(),
    dryRun,
    spoolRoot,
    replacementVaultRoot: replacement.vaultRoot,
    replacementsCreatedDuringRemediation: createdReplacements,
    objectsScanned: objects.length,
    ciphertextObjects,
    plaintextObjectsFound: removed.length + retained.length,
    plaintextObjectsRemoved: dryRun ? 0 : removed.length,
    plaintextObjectsVerified: removed.length,
    plaintextObjectsRetained: retained.length,
    removed, retained,
    // The end-state claim this whole function exists to be able to make.
    plaintextAtRest: retained.length === 0 && !dryRun ? 'NONE_FOR_PRODUCTION_CAPTURE' : 'PRESENT',
  };
}

/**
 * Independent audit of the spool: does any object at rest decode as plaintext?
 *
 * Deliberately does NOT consult the ledger or the migration's own bookkeeping.
 * It looks at the bytes: an AES-GCM blob is indistinguishable from random, so a
 * mostly-printable UTF-8 object is plaintext no matter what any receipt says.
 */
export function auditSpoolForPlaintext(vaultBase, { sampleBytes = 4096 } = {}) {
  const { spoolRoot } = vaultLayout(vaultBase);
  const objRoot = path.join(spoolRoot, 'objects', 'sha256');
  const suspects = [];
  let scanned = 0;
  if (existsSync(objRoot)) {
    for (const shard of readdirSync(objRoot)) {
      let names = [];
      try { names = readdirSync(path.join(objRoot, shard)); } catch { continue; }
      for (const n of names) {
        const abs = path.join(objRoot, shard, n);
        let buf;
        try { buf = readFileSync(abs); } catch { continue; }
        scanned += 1;
        const head = buf.subarray(0, Math.min(sampleBytes, buf.length));
        let printable = 0;
        for (const b of head) if (b === 9 || b === 10 || b === 13 || (b >= 32 && b < 127)) printable += 1;
        const ratio = head.length === 0 ? 0 : printable / head.length;
        if (ratio > 0.85) suspects.push({ path: abs, address: `sha256:${n}`, printableRatio: Number(ratio.toFixed(3)), byteLength: buf.length });
      }
    }
  }
  return {
    objectsScanned: scanned,
    plaintextSuspects: suspects.length,
    suspects: suspects.slice(0, 25),
    verdict: suspects.length === 0 ? 'NONE_FOR_PRODUCTION_CAPTURE' : 'PLAINTEXT_PRESENT',
  };
}
