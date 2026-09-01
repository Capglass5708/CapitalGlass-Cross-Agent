/**
 * THE capture funnel. One path in, for every source class.
 *
 * Seven adapters that each know how to write a ledger entry would be seven
 * chances to skip the secret scan, seven definitions of "captured", and seven
 * places for the durability gate to be forgotten. So adapters do exactly one
 * thing: they DISCOVER and CLASSIFY. Admission, scanning, hashing, encryption,
 * ledger binding and retrievability all happen here, once.
 *
 * ORDER IS THE SECURITY PROPERTY:
 *
 *   stat -> hash -> SCAN -> [refuse] -> read -> re-hash -> validate
 *        -> spool -> encrypt -> ledger -> retrievability proof
 *
 * The scan precedes every write. Nothing reaches the spool, the object store,
 * a storage leg or the ledger before it has been looked at, because in an
 * immutable archive there is no "undo" after the fact.
 *
 * RAW MEANS RAW. The bytes hashed, spooled and encrypted are the bytes the
 * source held, unmodified. Nothing is scrubbed, normalised, re-encoded or
 * redacted on the way in. A redact-then-hash pipeline produces a hash of
 * something that never existed and then calls it the source's identity, which
 * quietly destroys the only thing an evidence archive is for. A source is
 * either admitted whole or refused whole.
 */
import { readFileSync, statSync, createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

import { sha256Prefixed, objectStorePath } from './canonical.mjs';
import { encryptObject, decryptObject, DEFAULT_KEY_VERSION } from './crypto.mjs';
import { protectObject, spoolWrite, STATE } from './worker.mjs';
import { scanEntries, entryFileName, computeEntryHash, ENTRY_DIR } from './ledger.mjs';
import { scanFile, VERDICT as SCAN_VERDICT } from './secret-detector.mjs';
import { recordQuarantine, buildRefusalIndex } from './quarantine.mjs';
import { resolveProvenance } from './provenance.mjs';
import { MILESTONE, TERMINAL, REQUIREMENT } from './source-state.mjs';

export const CAPTURE_MODE = {
  /** Real estate sources. Requires production key authority and real remote legs. */
  REAL: 'REAL',
  /** Synthetic fixtures. Proves software behaviour only; never production acceptance. */
  FIXTURE: 'FIXTURE',
};

export const KEY_AUTHORITY = {
  PRODUCTION: 'PRODUCTION',
  TEST_ONLY: 'TEST_ONLY',
};

export const RETRIEVAL_SCOPE = {
  /** Reconstructed from the local write-ahead spool. Says nothing about durability. */
  LOCAL_SPOOL: 'RETRIEVABLE_FROM_LOCAL_SPOOL',
  /** Reconstructed from a verified remote destination. Requires storage authority. */
  REMOTE_VERIFIED: 'RETRIEVABLE_FROM_VERIFIED_REMOTE',
};

const NL = String.fromCharCode(10);
const MAX_ADMISSIBLE_BYTES = 128 * 1024 * 1024;
export const SCANNER_VERSION = 'context-ledger/lib/secret-detector.mjs@v1';

/**
 * Per-destination replication status, reported for EACH leg separately.
 *
 * A successful write is not verification. rsync exiting 0 says the bytes left
 * here, not that they arrived intact -- and an aggregated "replication: ok"
 * would let one healthy leg mask a silent second one. Four states, so
 * "unreachable", "never configured" and "written but never re-read" can never
 * collapse into a single reassuring word.
 */
export const LEG_STATUS = {
  VERIFIED: 'VERIFIED',            // re-hashed AT the destination and equal
  NOT_REACHABLE: 'NOT_REACHABLE',  // transport refused or the target was unreachable
  NOT_CONFIGURED: 'NOT_CONFIGURED',// no destination was supplied at all
  NOT_PROVEN: 'NOT_PROVEN',        // something happened, but no read-back proved it
};

/**
 * Derive each leg's status from what was OBSERVED, never from what was
 * attempted. The default is NOT_PROVEN: a leg is guilty until re-read.
 */
export function legStatusFrom(leg, transport) {
  if (!transport) return { status: LEG_STATUS.NOT_CONFIGURED, rootId: null, host: null, transport: null, observedHash: null, error: null, realRemote: false };
  const base = {
    rootId: transport.id ?? null, host: transport.host ?? null, transport: transport.kind ?? null,
    realRemote: transport.isRealRemote === true,
    observedHash: leg?.hash ?? null, error: leg?.error ?? null,
  };
  if (leg?.error) return { ...base, status: LEG_STATUS.NOT_REACHABLE };
  if (leg?.verified === true && leg?.hash) return { ...base, status: LEG_STATUS.VERIFIED };
  return { ...base, status: LEG_STATUS.NOT_PROVEN };
}

/**
 * Admission guards.
 *
 * The two ways a real capture could quietly become a fiction:
 *   1. a scratch key encrypting production evidence, producing an archive
 *      nobody can decrypt later and an acceptance claim nobody can trust;
 *   2. a local fixture standing in as a storage leg, which VERIFIES happily and
 *      therefore satisfies the three-way FULLY_PROTECTED test with no remote
 *      involved at all.
 *
 * Both are refused before any byte is written, not detected afterwards.
 */
export function assertRealCaptureAdmissible({ mode, keyAuthority, primary, backup }) {
  if (mode !== CAPTURE_MODE.REAL) return { admissible: true, mode };
  if (keyAuthority !== KEY_AUTHORITY.PRODUCTION) {
    const e = new Error('TEST_KEY_FORBIDDEN_ON_REAL_CAPTURE_PATH');
    e.keyAuthority = keyAuthority;
    throw e;
  }
  for (const [name, t] of [['primary', primary], ['backup', backup]]) {
    if (t?.isRealRemote !== true) {
      const e = new Error('REAL_CAPTURE_FORBIDS_NON_REMOTE_DURABILITY_LEG');
      e.leg = name; e.transport = t?.kind ?? null;
      throw e;
    }
  }
  if (primary.id === backup.id) {
    const e = new Error('DURABILITY_LEGS_NOT_INDEPENDENT'); e.id = primary.id; throw e;
  }
  return { admissible: true, mode };
}

/**
 * Post-condition on the existing FULLY_PROTECTED gate. It is not a second gate
 * and it does not relax the first: it refuses the one shape the first gate
 * cannot see, namely three matching hashes that all came from something local.
 */
export function assertNoUnearnedProtection(result, { primary, backup, mode = CAPTURE_MODE.REAL }) {
  if (result.state !== STATE.FULLY_PROTECTED) return { checked: true, promoted: false };
  if (result.allThreeMatch !== true) {
    const e = new Error('FULLY_PROTECTED_WITHOUT_THREE_WAY_MATCH'); e.state = result.state; throw e;
  }
  // A FIXTURE run is allowed to reach FULLY_PROTECTED against fixture legs --
  // that is what proves the gate works at all -- and the entry it writes
  // records transportRealRemote:false, so the result cannot be read as remote
  // success. Only a REAL capture is forbidden from promoting on local legs.
  if (mode === CAPTURE_MODE.REAL && (primary.isRealRemote !== true || backup.isRealRemote !== true)) {
    const e = new Error('FULLY_PROTECTED_CLAIMED_ON_NON_REMOTE_LEGS');
    e.primary = primary.kind; e.backup = backup.kind;
    throw e;
  }
  return { checked: true, promoted: true };
}

export function sha256FileStream(absPath) {
  return new Promise((resolve, reject) => {
    const h = createHash('sha256');
    const s = createReadStream(absPath);
    s.on('error', reject);
    s.on('data', (c) => h.update(c));
    s.on('end', () => resolve(`sha256:${h.digest('hex')}`));
  });
}

/**
 * NORMALIZATION, not admission control.
 *
 * This function used to REFUSE sources: a NUL byte became CORRUPT_REFUSED, an
 * unparseable JSONL record became MALFORMED_REFUSED. That is backwards for an
 * evidence archive. Raw evidence is bytes; a text parser failing to interpret
 * them is a fact about the PARSER's reach, not about whether the bytes are
 * evidence. Refusing on it discarded four real Claude sessions to satisfy a
 * JSONL reader, and a source that resists normalization is often the one most
 * worth keeping.
 *
 * Nothing is refused here and nothing is rewritten. Raw bytes are always
 * admitted unmodified; this reports, truthfully and separately, how far
 * normalization got:
 *
 *   NORMALIZED             fully interpreted as the declared format
 *   PARTIAL_NORMALIZATION  a torn FINAL record, which is what an append-only
 *                          log being written right now looks like
 *   NORMALIZATION_FAILED   a record in the middle is not the declared format
 *   BINARY_TEXT_VARIANT    control bytes present; not text in the usual sense,
 *                          still perfectly good evidence
 *
 * captureCompleteness carries the same fact into the immutable entry, so a
 * reader never has to infer interpretability from silence.
 */
export function validateFormat(buffer, format) {
  const out = {
    ok: true, malformed: false, partial: false, corrupt: false,
    normalization: 'NORMALIZED', captureCompleteness: 'COMPLETE',
    reason: null, recordCount: null,
  };
  if (format === 'none') return out;

  // Control bytes are RECORDED, never used to reject. The bytes are the record.
  const hasNul = buffer.includes(0);

  const finish = (over) => {
    const r = { ...out, ...over };
    if (hasNul && r.normalization === 'NORMALIZED') {
      r.normalization = 'BINARY_TEXT_VARIANT';
      r.captureCompleteness = 'PARTIAL';
      r.reason = r.reason ?? 'CONTROL_BYTE_PRESENT_RAW_BYTES_ADMITTED_UNMODIFIED';
    } else if (hasNul) {
      r.binaryTextVariant = true;
    }
    return r;
  };

  if (format === 'json') {
    try { JSON.parse(buffer.toString('utf8')); } catch {
      return finish({ normalization: 'NORMALIZATION_FAILED', captureCompleteness: 'PARTIAL', reason: 'JSON_PARSE_FAILED' });
    }
    return finish({ recordCount: 1 });
  }

  if (format === 'jsonl') {
    const text = buffer.toString('utf8');
    const endsClean = text.length === 0 || text.endsWith(NL);
    const all = text.split(NL);
    const lines = endsClean ? all : all.slice(0, -1);
    let count = 0;
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (line.trim() === '') continue;
      try { JSON.parse(line); count += 1; } catch {
        return finish({ normalization: 'NORMALIZATION_FAILED', captureCompleteness: 'PARTIAL', reason: `JSONL_RECORD_${i}_NOT_JSON`, recordCount: count });
      }
    }
    if (!endsClean) {
      const tail = text.slice(text.lastIndexOf(NL) + 1);
      let tailOk = false;
      try { JSON.parse(tail); tailOk = true; } catch { tailOk = false; }
      if (!tailOk) {
        return finish({ normalization: 'PARTIAL_NORMALIZATION', captureCompleteness: 'LOWER_BOUND', reason: 'TRAILING_INCOMPLETE_RECORD', recordCount: count });
      }
      count += 1;
    }
    return finish({ recordCount: count });
  }

  return finish({});
}

/** evidenceId must be computed exactly as worker.protectObject computes it. */
export function evidenceIdFor(sourceSystem, sourceNativeId, contentHash) {
  return `${sourceSystem}:${sourceNativeId ?? 'unidentified'}:${contentHash}`;
}

/** Index of what the PERSISTED ledger already knows, so replay can be detected before writing. */
export function buildObservationIndex(vaultRoot) {
  const idx = new Map();
  for (const e of scanEntries(vaultRoot)) if (e.evidenceId) idx.set(e.evidenceId, e);
  return idx;
}

/**
 * Capture one source, end to end.
 *
 * Mutates `record` (a SourceRecord) so the caller's accounting table and the
 * capture path can never disagree about what happened -- there is only one
 * copy of that fact.
 */
export async function captureSource({
  record,
  key, keyRef, keyVersion = DEFAULT_KEY_VERSION, keyAuthority,
  spoolRoot, vaultRoot, metaRoot, primary, backup,
  registerRoot, registerMetaRoot,
  mode = CAPTURE_MODE.REAL,
  machineId,
  workPackageId = null,
  expectedSha256 = null,
  format = 'text',
  observationIndex = null,
  refusalIndex = null,
  aad = {},
  maxBytes = MAX_ADMISSIBLE_BYTES,
}) {
  assertRealCaptureAdmissible({ mode, keyAuthority, primary, backup });

  if (record.requirement !== REQUIREMENT.REQUIRED_CAPTURE) {
    const e = new Error('CAPTURE_ATTEMPTED_ON_NON_REQUIRED_SOURCE');
    e.sourceId = record.sourceId; e.requirement = record.requirement;
    throw e;
  }

  // ---- 1. does the source still exist, and is it a thing we can read? ----
  let st;
  try { st = statSync(record.absPath); } catch (err) {
    record.terminate(TERMINAL.SOURCE_UNAVAILABLE, String(err?.code ?? 'STAT_FAILED'));
    return { record, outcome: record.terminal };
  }
  if (!st.isFile()) {
    record.terminate(TERMINAL.SOURCE_UNAVAILABLE, 'NOT_A_REGULAR_FILE');
    return { record, outcome: record.terminal };
  }
  record.byteSize = st.size;
  record.mtime = st.mtime.toISOString();

  if (st.size > maxBytes) {
    record.terminate(TERMINAL.EXCLUDED_BY_POLICY, `SIZE_LIMIT_EXCEEDED:${st.size}>${maxBytes}`);
    return { record, outcome: record.terminal };
  }

  // ---- 2. identity BEFORE the copy ----
  let hashBefore;
  try { hashBefore = await sha256FileStream(record.absPath); } catch (err) {
    record.terminate(TERMINAL.SOURCE_UNAVAILABLE, String(err?.code ?? 'READ_FAILED'));
    return { record, outcome: record.terminal };
  }

  // ---- 3. PRE-ADMISSION SCAN. Nothing has been written yet. ----
  let scan;
  try { scan = await scanFile(record.absPath); } catch (err) {
    record.terminate(TERMINAL.SOURCE_UNAVAILABLE, `SCAN_READ_FAILED:${err?.code ?? 'ERR'}`);
    return { record, outcome: record.terminal };
  }

  // CAPTURE_ATTEMPTED is evidenced by a scan that actually ran across the whole
  // file -- scannedBytes is checkable against byteSize -- not by our intention
  // to capture. A quarantined source reaches this rung and no further.
  record.reach(MILESTONE.CAPTURE_ATTEMPTED, {
    observedBy: 'pre-admission-secret-scan',
    scannerVersion: SCANNER_VERSION,
    scannedBytes: scan.scannedBytes,
    scanVerdict: scan.verdict,
    detectorsFired: scan.detectorIds,
    sourceHashBeforeCapture: hashBefore,
  });

  if (scan.verdict === SCAN_VERDICT.SECRET_DETECTED) {
    const q = recordQuarantine({
      registerRoot, registerMetaRoot, machineId,
      source: {
        sourceSystem: record.sourceSystem, sourceClass: record.sourceClass,
        sourceRootId: record.sourceRootId, absPath: record.absPath,
        relativePath: record.relativePath, byteSize: record.byteSize, mtime: record.mtime,
      },
      scan, refusalIndex,
    });
    // Detector ids and counts only. The record deliberately carries no
    // contentHash: hashing credential-bearing bytes would still derive an
    // artefact from them and would still be a confirmation oracle.
    record.quarantine = {
      detectorIds: scan.detectorIds,
      findingCount: scan.findingCount,
      highestSeverity: scan.highestSeverity,
      registerEntryHash: q.entry.entryHash,
      refusalId: q.entry.refusalId,
      replayOfExistingRefusal: q.duplicate === true,
    };
    record.terminate(TERMINAL.QUARANTINED_SECRET, 'CREDENTIAL_MATERIAL_DETECTED_PRE_ADMISSION');
    return { record, outcome: record.terminal, quarantined: true };
  }

  // ---- 4. read the bytes, then re-establish identity ----
  let buffer;
  try { buffer = readFileSync(record.absPath); } catch (err) {
    record.terminate(TERMINAL.SOURCE_UNAVAILABLE, String(err?.code ?? 'READ_FAILED'));
    return { record, outcome: record.terminal };
  }
  const contentHash = sha256Prefixed(buffer);

  // Hash before AND after. If the source moved under us, the bytes we hold and
  // the bytes we scanned are not provably the same bytes -- and an unscanned
  // difference is precisely the case that could carry a credential.
  let stAfter;
  try { stAfter = statSync(record.absPath); } catch { stAfter = null; }
  const changed = contentHash !== hashBefore
    || stAfter === null
    || stAfter.size !== st.size
    || stAfter.mtimeMs !== st.mtimeMs;
  if (changed) {
    record.terminate(TERMINAL.SOURCE_CHANGED_DURING_CAPTURE, 'SOURCE_HASH_OR_STAT_CHANGED_MID_CAPTURE');
    return { record, outcome: record.terminal };
  }

  // ---- 5. independent integrity expectation, when the caller has one ----
  if (expectedSha256 && expectedSha256 !== contentHash) {
    record.detail.expectedSha256 = expectedSha256;
    record.detail.observedSha256 = contentHash;
    record.terminate(TERMINAL.CORRUPT_REFUSED, 'CONTENT_HASH_DOES_NOT_MATCH_DECLARED_MANIFEST_HASH');
    return { record, outcome: record.terminal };
  }

  // ---- 6. normalization, which NEVER refuses admissible bytes ----
  //
  // Raw evidence is bytes. A NUL byte or an unparseable record says the text
  // NORMALISER cannot fully interpret the source -- it does not say the source
  // is not evidence, and refusing on it loses a real transcript to satisfy a
  // parser. Normalization reports its own truthful state alongside the capture;
  // the raw bytes are admitted unmodified either way.
  const v = validateFormat(buffer, format);
  const normalizationState = v.normalization;
  const captureCompleteness = v.captureCompleteness;
  record.detail.recordCount = v.recordCount;
  record.detail.normalizationState = normalizationState;
  record.detail.normalizationReason = v.reason;
  record.detail.captureCompleteness = captureCompleteness;

  // ---- 7. provenance, resolved from the admitted bytes only ----
  const provenance = resolveProvenance({
    absPath: record.absPath,
    sourceSystem: record.sourceSystem,
    buffer,
    sourceRootId: record.sourceRootId,
    relativePath: record.relativePath,
    workPackageId,
  });
  record.provenance = provenance;

  const sourceNativeId = record.sourceNativeId ?? `${record.sourceRootId}:${record.relativePath}`;
  const evidenceId = evidenceIdFor(record.sourceSystem, sourceNativeId, contentHash);

  // The envelope is deterministic, so computing it here gives both the spool
  // ADDRESS (ciphertextHash) and, on a replay, a way to re-materialise the
  // encrypted object without minting a second ledger observation.
  const envelope = encryptObject({ plaintext: buffer, key, plaintextHash: contentHash, aad, keyVersion });

  // ---- 8. replay check BEFORE appending ----
  // Re-ingesting an unchanged source must not mint a second observation. The
  // ledger stamps a fresh recordedAt on every append, so identical bytes would
  // otherwise produce a NEW entryHash every run -- a growing chain of
  // manufactured evidence that all describes one unchanged file.
  const index = observationIndex ?? buildObservationIndex(vaultRoot);
  const existing = index.get(evidenceId);
  let ledgerEntry;
  let duplicate = false;

  if (existing) {
    duplicate = true;
    ledgerEntry = existing;
    // The encrypted object is content-addressed and idempotent, so this is a
    // no-op when it is already present and a repair when it is not.
    spoolWrite(spoolRoot, envelope.blob, envelope.ciphertextHash);
    record.evidenceId = existing.evidenceId;
    record.ledgerEntryHash = existing.entryHash;
    record.durabilityState = existing.durabilityState;
    record.replication = {
      primary: { status: LEG_STATUS.NOT_PROVEN, rootId: primary?.id ?? null, host: primary?.host ?? null, transport: primary?.kind ?? null, realRemote: primary?.isRealRemote === true, observedHash: null, error: null },
      backup: { status: LEG_STATUS.NOT_PROVEN, rootId: backup?.id ?? null, host: backup?.host ?? null, transport: backup?.kind ?? null, realRemote: backup?.isRealRemote === true, observedHash: null, error: null },
      durabilityState: existing.durabilityState ?? null,
      allThreeMatch: existing.durabilityProof?.allThreeMatch === true,
      note: 'REPLAY_DID_NOT_RE_ATTEMPT_REPLICATION',
    };
  } else {
    const result = protectObject({
      plaintext: buffer, key, keyRef, keyVersion,
      spoolRoot, vaultRoot, metaRoot, primary, backup,
      sourceSystem: record.sourceSystem, sourceNativeId, machineId, aad,
      captureTimestamp: new Date().toISOString(),
      extraBody: {
        sourceObservation: {
          sourceRootId: record.sourceRootId,
          sourcePath: record.absPath,
          relativePath: record.relativePath,
          byteSize: record.byteSize,
          sourceMtime: record.mtime,
        },
        sourceTimestamp: provenance.sourceTimestamp,
        sessionBinding: provenance.sessionBinding,
        repoBinding: provenance.repoBinding,
        captureCompleteness,
        normalizationState,
        redactionState: 'NONE',
        supersededBy: null,
        continuationOf: null,
        // Which fields could not be resolved, named in the immutable record.
        // A null branch that is silently null is indistinguishable from a
        // resolver bug; a null branch listed here is a known gap.
        provenanceResolution: {
          completeness: provenance.completeness,
          unresolvedFields: provenance.unresolvedFields,
          resolver: provenance.resolver,
          headerStatus: provenance.headerStatus,
        },
      },
    });

    assertNoUnearnedProtection(result, { primary, backup, mode });

    if (result.ciphertextHash !== envelope.ciphertextHash) {
      // Deterministic encryption is what lets both destinations be byte
      // compared. Two encryptions of one object disagreeing breaks that.
      record.terminate(TERMINAL.CAPTURE_FAILED, 'ENCRYPTION_NOT_DETERMINISTIC_FOR_THIS_OBJECT');
      return { record, outcome: record.terminal };
    }

    ledgerEntry = result.ledgerEntry;
    record.evidenceId = result.ledgerEntry.evidenceId;
    record.ledgerEntryHash = result.ledgerEntry.entryHash;
    record.durabilityState = result.state;
    record.detail.storageIncidents = result.incidents.map((i) => i.code);
    record.detail.ciphertextHash = result.ciphertextHash;
    record.replication = {
      primary: legStatusFrom(result.legs?.primary, primary),
      backup: legStatusFrom(result.legs?.backup, backup),
      // Never inferred from a successful write. Both legs must be VERIFIED, and
      // the existing three-way hash gate in worker.mjs is what promotes.
      durabilityState: result.state,
      allThreeMatch: result.allThreeMatch === true,
    };
    index.set(evidenceId, ledgerEntry);
  }

  // ---- 9. CAPTURED: an independent stat of the ENCRYPTED spool object ----
  const spoolObjectPath = path.join(spoolRoot, objectStorePath(envelope.ciphertextHash));
  let spoolStat;
  try { spoolStat = statSync(spoolObjectPath); } catch {
    record.terminate(TERMINAL.CAPTURE_FAILED, 'SPOOL_OBJECT_NOT_OBSERVABLE_AFTER_WRITE');
    return { record, outcome: record.terminal, ledgerEntry, duplicate };
  }
  record.reach(MILESTONE.CAPTURED, {
    observedBy: 'independent-stat-of-encrypted-spool-object',
    spoolObjectPath,
    spoolPayload: 'CIPHERTEXT',
    spoolAddress: envelope.ciphertextHash,
    observedByteSize: spoolStat.size,
    expectedCiphertextByteLength: envelope.blob.length,
    byteSizesEqual: spoolStat.size === envelope.blob.length,
    sourcePlaintextNeverWrittenToDisk: true,
  });

  // ---- 10. HASHED: three independently computed digests must agree ----
  //
  // A stream over the source before the copy, a digest of the buffer we read,
  // and a digest of the plaintext RECOVERED by decrypting the persisted spool
  // object. Any two could agree by sharing a bug; all three agreeing is a fact
  // about the bytes -- and the third now also proves the object at rest is
  // genuinely the encrypted form of this source.
  const storedBlob = readFileSync(spoolObjectPath);
  if (sha256Prefixed(storedBlob) !== envelope.ciphertextHash) {
    record.terminate(TERMINAL.CAPTURE_FAILED, 'SPOOL_CIPHERTEXT_HASH_MISMATCH');
    return { record, outcome: record.terminal, ledgerEntry, duplicate };
  }
  let recoveredHash;
  try { recoveredHash = sha256Prefixed(decryptObject({ blob: storedBlob, key, aad })); } catch {
    record.terminate(TERMINAL.CAPTURE_FAILED, 'SPOOL_OBJECT_FAILED_AUTHENTICATED_DECRYPTION');
    return { record, outcome: record.terminal, ledgerEntry, duplicate };
  }
  if (contentHash !== hashBefore || recoveredHash !== contentHash) {
    record.detail.hashDisagreement = { hashBefore, contentHash, recoveredHash };
    record.terminate(TERMINAL.CAPTURE_FAILED, 'SPOOL_IDENTITY_DIVERGED');
    return { record, outcome: record.terminal, ledgerEntry, duplicate };
  }
  record.contentHash = contentHash;
  record.reach(MILESTONE.HASHED, {
    observedBy: 'three-independent-digests',
    sourceStreamHash: hashBefore,
    admittedBufferHash: contentHash,
    plaintextRecoveredFromPersistedSpoolObject: recoveredHash,
    allThreeEqual: true,
    algorithm: 'sha256',
  });

  // ---- 11. PROVENANCE_BOUND: re-read the entry FROM DISK ----
  // The in-memory object protectObject just handed back proves only that the
  // writer agrees with itself.
  const entryPath = path.join(vaultRoot, ENTRY_DIR, entryFileName(ledgerEntry.entryHash));
  let persisted;
  try { persisted = JSON.parse(readFileSync(entryPath, 'utf8')); } catch {
    record.terminate(TERMINAL.CAPTURE_FAILED, 'LEDGER_ENTRY_NOT_READABLE_FROM_PERSISTED_LAYER');
    return { record, outcome: record.terminal, ledgerEntry, duplicate };
  }
  const recomputed = computeEntryHash(persisted, persisted.prevHash);
  if (recomputed !== persisted.entryHash || persisted.contentHash !== contentHash || persisted.evidenceId !== evidenceId) {
    record.detail.ledgerMismatch = { recomputed, stored: persisted.entryHash };
    record.terminate(TERMINAL.CAPTURE_FAILED, 'PERSISTED_LEDGER_ENTRY_DOES_NOT_MATCH_CAPTURE');
    return { record, outcome: record.terminal, ledgerEntry, duplicate };
  }
  record.reach(MILESTONE.PROVENANCE_BOUND, {
    observedBy: 're-read-of-persisted-ledger-entry',
    entryPath,
    entryHash: persisted.entryHash,
    entryHashRecomputedAndEqual: true,
    evidenceId: persisted.evidenceId,
    contentHashInLedger: persisted.contentHash,
    provenanceCompleteness: persisted.provenanceResolution?.completeness ?? null,
    unresolvedProvenanceFields: persisted.provenanceResolution?.unresolvedFields ?? null,
    replayOfExistingObservation: duplicate,
  });

  // ---- 12. retrievability, proven by reconstruction ----
  const proof = proveRetrievable({ spoolRoot, contentHash, ciphertextHash: envelope.ciphertextHash, buffer, key, keyVersion, aad });
  record.detail.retrieval = proof;
  if (!proof.retrievable) {
    record.terminate(TERMINAL.CAPTURE_FAILED, `RETRIEVABILITY_NOT_PROVEN:${proof.reason}`);
    return { record, outcome: record.terminal, ledgerEntry, duplicate };
  }
  record.reach(MILESTONE.RETRIEVABLE, {
    observedBy: 'decryption-of-persisted-encrypted-object',
    scope: proof.scope,
    reconstructedHash: proof.reconstructedHash,
    byteEqualToSource: true,
    remoteRetrievalProven: false,
  });

  record.terminate(TERMINAL.ARCHIVED, duplicate ? 'REPLAY_MATCHED_EXISTING_OBSERVATION' : 'CAPTURED_THIS_RUN');

  return { record, outcome: record.terminal, ledgerEntry, duplicate };
}

/**
 * Retrievability = "the bytes came back", not "we wrote the bytes".
 *
 * The only copy at rest is ENCRYPTED, so recovery is a real decryption of a
 * real file, not a re-read of a plaintext we had already written. Three
 * independent steps, none of which trusts the buffer still in memory:
 *
 *   a) read the persisted object at its ciphertext CONTENT ADDRESS and re-hash
 *      it -- proves the stored object is the one the ledger names;
 *   b) authenticated-decrypt it -- GCM proves it has not been tampered with;
 *   c) hash and byte-compare the recovered plaintext against the source.
 *
 * SCOPE IS LOCAL AND SAYS SO. This proves the object can be reconstructed from
 * the write-ahead spool on this machine. It proves nothing about the Synology,
 * nothing about a mounted share, and nothing about durability. Naming it
 * RETRIEVABLE_FROM_LOCAL_SPOOL keeps the two claims impossible to confuse.
 */
export function proveRetrievable({ spoolRoot, contentHash, ciphertextHash, buffer, key, keyVersion = DEFAULT_KEY_VERSION, aad = {} }) {
  const scope = RETRIEVAL_SCOPE.LOCAL_SPOOL;
  const address = ciphertextHash ?? encryptObject({ plaintext: buffer, key, plaintextHash: contentHash, aad, keyVersion }).ciphertextHash;
  const abs = path.join(spoolRoot, objectStorePath(address));

  let stored;
  try { stored = readFileSync(abs); } catch (err) {
    return { retrievable: false, reason: `SPOOL_OBJECT_UNREADABLE:${err?.code ?? 'ERR'}`, scope };
  }
  if (sha256Prefixed(stored) !== address) {
    return { retrievable: false, reason: 'SPOOL_OBJECT_CIPHERTEXT_HASH_MISMATCH', scope };
  }

  let plaintext;
  try { plaintext = decryptObject({ blob: stored, key, aad }); } catch {
    return { retrievable: false, reason: 'SPOOL_OBJECT_FAILED_AUTHENTICATED_DECRYPTION', scope };
  }
  const recovered = sha256Prefixed(plaintext);
  if (recovered !== contentHash) {
    return { retrievable: false, reason: 'RECOVERED_PLAINTEXT_HASH_MISMATCH', scope };
  }
  if (buffer && !plaintext.equals(buffer)) {
    return { retrievable: false, reason: 'RECOVERED_PLAINTEXT_BYTES_DIFFER_FROM_SOURCE', scope };
  }

  return {
    retrievable: true,
    scope,
    reconstructedHash: recovered,
    ciphertextHash: address,
    storedPayload: 'CIPHERTEXT',
    plaintextAtRest: false,
    recoveredByteLength: plaintext.length,
    remoteRetrievalProven: false,
  };
}
