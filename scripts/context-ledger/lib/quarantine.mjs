/**
 * QUARANTINE REGISTER -- the non-capture terminal record.
 *
 * When pre-admission scanning finds credential material, the source must leave
 * NO trace in the evidence ledger. Not a blob, not a ciphertext, not a
 * contentHash. A hash of credential-bearing bytes is still derived from those
 * bytes and is a verification oracle for anyone holding a candidate value, so
 * "we only stored the hash" is not a defence.
 *
 * But a source that simply vanishes is the other failure. Final accounting
 * would show a smaller number with no way to tell refusal from loss. So the
 * refusal itself is recorded -- in a SEPARATE, independently hash-chained
 * register holding metadata only.
 *
 * WHY A SEPARATE CHAIN RATHER THAN A LEDGER ENTRY WITH redactionState:
 * evidence-ledger-entry-v1 requires contentHash, encryption.plaintextHash,
 * encryption.ciphertextHash and a storageLocator. Every one of those can only
 * be produced by admitting the bytes. Representing a quarantined source there
 * would force exactly the capture the state exists to prevent. The entry
 * schema's redactionState enum remains available for a future DERIVED redacted
 * object, which is a different artefact with a different content identity and
 * is out of scope here.
 *
 * The register reuses appendEntry -- same CAS, same prevHash/entryHash chain,
 * same immutable one-file-per-entry shape -- pointed at its own root. Refusals
 * are as tamper-evident as captures, using code that is already proven, rather
 * than a second hand-written chain that would need proving again.
 */
import path from 'node:path';
import { appendEntry, scanEntries, reconstructHead } from './ledger.mjs';
import { assertEmissionClean } from './secret-detector.mjs';
import { hashCanonical } from './canonical.mjs';

export const QUARANTINE_SCHEMA = 'quarantine-register-entry-v1@1.0.0';
export const QUARANTINE_DISPOSITION = 'QUARANTINED_SECRET';

/**
 * Stable identity for ONE refusal, so re-scanning an unchanged source does not
 * mint a second record of the same event.
 *
 * Derived from METADATA ONLY -- location, size, mtime, scanner version and the
 * OFFSETS of the findings. Never from the file's bytes and never from a matched
 * value, so it cannot become a confirmation oracle. The obvious identity
 * (a content hash) is exactly the thing this state exists to never produce.
 *
 * Changing the file changes its size or mtime; changing the detector changes
 * the scanner version; either produces a new refusal, which is correct -- a
 * re-scan under new coverage IS a new event.
 */
export function computeRefusalId({ sourcePath, byteSize, sourceMtime, scannerVersion, findings }) {
  return hashCanonical({
    sourcePath, byteSize: byteSize ?? null, sourceMtime: sourceMtime ?? null, scannerVersion,
    findings: (findings ?? []).map((f) => ({ detectorId: f.detectorId, offset: f.offset, length: f.length })),
  });
}

/** Index the persisted register so a replay can be detected before appending. */
export function buildRefusalIndex(registerRoot) {
  const idx = new Map();
  for (const e of scanEntries(registerRoot)) if (e.refusalId) idx.set(e.refusalId, e);
  return idx;
}

export function quarantineRoots(baseRoot) {
  return {
    registerRoot: path.join(baseRoot, 'quarantine-register'),
    registerMetaRoot: path.join(baseRoot, 'quarantine-register-head'),
  };
}

/**
 * Record one refusal.
 *
 * `scan` is the detector result. Only detectorId/severity/offset/length survive
 * into the register; the detector never produced anything else, and this
 * function re-asserts that by scanning the record it is about to write. An
 * artefact that DESCRIBES a leak must not BE the leak -- that is the standard
 * way redaction tooling fails.
 */
export function recordQuarantine({
  registerRoot, registerMetaRoot, source, scan, machineId,
  detectedAt = new Date().toISOString(), scannerVersion = 'context-ledger/lib/secret-detector.mjs@v1',
  refusalIndex = null,
}) {
  const findings = scan.findings.map((f) => ({
    detectorId: f.detectorId, severity: f.severity, offset: f.offset, length: f.length, redacted: f.redacted,
  }));
  const refusalId = computeRefusalId({
    sourcePath: source.absPath, byteSize: source.byteSize, sourceMtime: source.mtime, scannerVersion, findings,
  });

  // Re-scanning an unchanged source is not a new refusal. Without this the
  // register grows by the whole quarantine set on every run and starts to
  // read as though the same credential were found again and again.
  const index = refusalIndex ?? buildRefusalIndex(registerRoot);
  const existing = index.get(refusalId);
  if (existing) return { entry: existing, entryPath: null, duplicate: true };

  const body = {
    schemaVersion: QUARANTINE_SCHEMA,
    disposition: QUARANTINE_DISPOSITION,
    refusalId,

    // The two facts that make this record safe, asserted rather than implied.
    payloadCaptured: false,
    contentHashWithheld: true,

    sourceSystem: source.sourceSystem,
    sourceClass: source.sourceClass,
    sourceRootId: source.sourceRootId ?? null,
    sourcePath: source.absPath,
    relativePath: source.relativePath ?? null,
    byteSize: source.byteSize ?? null,
    sourceMtime: source.mtime ?? null,

    detectedAt,
    machineId,
    scannerVersion,

    detection: {
      findingCount: scan.findingCount,
      detectorIds: scan.detectorIds,
      countsByDetector: scan.countsByDetector,
      highestSeverity: scan.highestSeverity,
      // Location and shape only. No value, no surrounding bytes, no digest of
      // the value -- a digest would let anyone with a guess confirm it.
      findings,
    },

    remediation: 'ROTATE_CREDENTIAL_THEN_HUMAN_REVIEW_BEFORE_ANY_RE_ADMISSION',
  };

  assertEmissionClean(body, 'quarantine-register-entry');

  const appended = appendEntry({ vaultRoot: registerRoot, metaRoot: registerMetaRoot, body });
  index.set(refusalId, appended.entry);
  return { entry: appended.entry, entryPath: appended.entryPath, duplicate: appended.duplicate };
}

export function readQuarantineRegister(registerRoot) {
  return scanEntries(registerRoot);
}

/**
 * Verify the register the same way the evidence chain is verified, and assert
 * the two safety fields on every record. A register that could be silently
 * edited would let a refusal be rewritten into a capture after the fact.
 */
export function verifyQuarantineRegister(registerRoot) {
  const entries = scanEntries(registerRoot);
  if (entries.length === 0) return { verified: true, count: 0, chainLength: 0, violations: [] };
  let chainLength = 0;
  const violations = [];
  try {
    chainLength = reconstructHead(registerRoot).length;
  } catch (e) {
    violations.push({ code: e.message });
  }
  for (const e of entries) {
    if (e.schemaVersion !== QUARANTINE_SCHEMA) violations.push({ code: 'WRONG_SCHEMA', entryHash: e.entryHash });
    if (e.payloadCaptured !== false) violations.push({ code: 'REGISTER_CLAIMS_PAYLOAD_CAPTURED', entryHash: e.entryHash });
    if (e.contentHashWithheld !== true) violations.push({ code: 'REGISTER_DID_NOT_WITHHOLD_CONTENT_HASH', entryHash: e.entryHash });
    if (e.contentHash !== undefined) violations.push({ code: 'REGISTER_CARRIES_CONTENT_HASH', entryHash: e.entryHash });
    if (e.encryption !== undefined) violations.push({ code: 'REGISTER_CARRIES_ENCRYPTION_ENVELOPE', entryHash: e.entryHash });
    if (!Array.isArray(e.detection?.detectorIds) || e.detection.detectorIds.length === 0) {
      violations.push({ code: 'REGISTER_ENTRY_WITHOUT_DETECTOR_ID', entryHash: e.entryHash });
    }
    if (!e.refusalId) violations.push({ code: 'REGISTER_ENTRY_WITHOUT_REFUSAL_ID', entryHash: e.entryHash });
    for (const f of e.detection?.findings ?? []) {
      if (Object.keys(f).sort().join(',') !== 'detectorId,length,offset,redacted,severity') {
        violations.push({ code: 'REGISTER_FINDING_CARRIES_UNEXPECTED_FIELD', entryHash: e.entryHash });
      }
    }
  }
  // Two records of one refusal is duplicated evidence of a single event.
  const seen = new Set(); const dupes = new Set();
  for (const e of entries) { if (e.refusalId) { if (seen.has(e.refusalId)) dupes.add(e.refusalId); else seen.add(e.refusalId); } }
  for (const d of dupes) violations.push({ code: 'DUPLICATE_REFUSAL_RECORDED', refusalId: d });

  return {
    verified: violations.length === 0 && chainLength === entries.length,
    count: entries.length, distinctRefusals: seen.size, duplicateRefusals: dupes.size,
    chainLength, violations,
  };
}
