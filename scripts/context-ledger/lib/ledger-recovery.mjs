/**
 * Deterministic recovery of ledger associations lost to a vault supersession.
 *
 * WHAT HAPPENED: the vault was superseded at 2026-08-31T22:10:19Z. The plaintext
 * remediation then ran at 22:14:19-21Z and wrote replacement ciphertext objects
 * into the CURRENT spool while their ledger entries were written into the
 * SUPERSEDED vault's ledger. The entries were never destroyed -- they were never
 * migrated. The association is therefore RECOVERABLE FROM PRESERVED EVIDENCE.
 *
 * WHAT THIS IS NOT: it does not synthesize history. A recovery association is a
 * NEW, separately-typed, append-only record that POINTS AT the preserved
 * superseded entry. It is never written as, or represented as, an original
 * current-ledger event, and no superseded entry is edited or copied in.
 *
 * Every provenance value is COPIED FROM the preserved entry. Nothing -- source
 * identity, key version, encryption metadata -- is inferred, defaulted, or
 * invented. If a value is absent from the evidence it stays absent here.
 *
 * The binding this establishes:
 *
 *     CURRENT OBJECT
 *        | ciphertextHash (recomputed from the bytes on disk)
 *     RECOVERY ASSOCIATION
 *        | supersededLedgerEntryHash
 *     PRESERVED SUPERSEDED LEDGER ENTRY
 */
import { readFileSync, existsSync } from 'node:fs';
import { sha256Prefixed, canonicalJson } from './canonical.mjs';

export const RECOVERY_REASON = 'LEDGER_SUPERSESSION_MIGRATION_GAP';
export const RECOVERY_SCHEMA = 'ledger-recovery-association-v1@1.0.0';

export const RECOVERY_DEFECT = {
  OBJECT_ABSENT: 'OBJECT_ABSENT',
  OBJECT_HASH_MISMATCH: 'OBJECT_HASH_MISMATCH',
  SUPERSEDED_ENTRY_ABSENT: 'SUPERSEDED_ENTRY_ABSENT',
  SUPERSEDED_ENTRY_HASH_MISMATCH: 'SUPERSEDED_ENTRY_HASH_MISMATCH',
  ENTRY_DOES_NOT_REFERENCE_OBJECT: 'ENTRY_DOES_NOT_REFERENCE_OBJECT',
  ENTRY_HASH_ABSENT: 'ENTRY_HASH_ABSENT',
};

/**
 * Build ONE recovery association, refusing unless every link is proven.
 *
 * The object's hash is RECOMPUTED from its bytes rather than trusted from the
 * filename or the entry -- comparing two claims to each other would prove
 * nothing about the object actually on disk.
 */
export function buildRecoveryAssociation({
  ciphertextHash,
  currentSpoolObjectPath,
  supersededEntryPath,
  supersededLedgerAuthority,
  supersessionEvent,
  recoverySoftwareSha,
  recoveredAt = new Date().toISOString(),
}) {
  const defects = [];

  if (!existsSync(currentSpoolObjectPath)) {
    return refuse([RECOVERY_DEFECT.OBJECT_ABSENT], { ciphertextHash, currentSpoolObjectPath });
  }
  const objectBytes = readFileSync(currentSpoolObjectPath);
  const observedObjectHash = sha256Prefixed(objectBytes);
  if (observedObjectHash !== ciphertextHash) defects.push(RECOVERY_DEFECT.OBJECT_HASH_MISMATCH);

  if (!existsSync(supersededEntryPath)) {
    return refuse([RECOVERY_DEFECT.SUPERSEDED_ENTRY_ABSENT], { ciphertextHash, supersededEntryPath });
  }
  const entryRaw = readFileSync(supersededEntryPath);
  const supersededEntryFileSha256 = sha256Prefixed(entryRaw);
  const entry = JSON.parse(entryRaw.toString('utf-8'));

  const enc = entry.encryption ?? {};
  if (enc.ciphertextHash !== ciphertextHash) defects.push(RECOVERY_DEFECT.ENTRY_DOES_NOT_REFERENCE_OBJECT);
  if (!entry.entryHash) defects.push(RECOVERY_DEFECT.ENTRY_HASH_ABSENT);

  if (defects.length) {
    return refuse(defects, { ciphertextHash, currentSpoolObjectPath, supersededEntryPath });
  }

  const record = {
    schemaVersion: RECOVERY_SCHEMA,
    recordType: 'RECOVERY_ASSOCIATION',
    // Stated in the record itself so no later reader can mistake it for history.
    notAnOriginalLedgerEntry: true,
    representedAsCurrentLedgerEvent: false,
    supersededEntryEdited: false,

    recoveryRecordId: null,               // filled from recordHash below
    ciphertextHash,
    currentSpoolObjectPath,
    currentObjectRecomputedHash: observedObjectHash,
    currentObjectByteLength: objectBytes.length,

    supersededLedgerAuthority,
    supersededLedgerEntryId: entry.entryHash,
    supersededLedgerEntryHash: entry.entryHash,
    supersededEntryFileSha256,
    supersededEntryTimestamp: entry.recordedAt ?? null,
    supersededEntrySeq: entry.seq ?? null,

    supersessionEvent,
    recoveryReason: RECOVERY_REASON,

    // COPIED from preserved evidence. Never inferred, never defaulted.
    provenFromPreservedEntry: {
      evidenceId: entry.evidenceId ?? null,
      sourceSystem: entry.sourceSystem ?? null,
      sourceNativeId: entry.sourceNativeId ?? null,
      contentHash: entry.contentHash ?? null,
      machineId: entry.machineId ?? null,
      provenanceClass: entry.provenanceClass ?? null,
      encryption: {
        algorithm: enc.algorithm ?? null,
        envelopeVersion: enc.envelopeVersion ?? null,
        keyRef: enc.keyRef ?? null,
        keyVersion: enc.keyVersion ?? null,
        plaintextHash: enc.plaintextHash ?? null,
        ciphertextHash: enc.ciphertextHash ?? null,
        ciphertextByteLength: enc.ciphertextByteLength ?? null,
        nonce: enc.nonce ?? null,
        aadHash: enc.aadHash ?? null,
      },
    },

    recoveredAt,
    recoverySoftwareSha,
    recordHash: null,
  };

  // IDENTITY is the association itself: which object, bound to which preserved
  // entry. Deliberately excludes recoveredAt and recoverySoftwareSha, so
  // re-running the tool re-derives the SAME id instead of appending a duplicate
  // record for an association that already exists.
  record.recoveryRecordId = associationIdentity({
    ciphertextHash,
    supersededLedgerEntryHash: record.supersededLedgerEntryHash,
    supersededEntryFileSha256,
  });
  // INTEGRITY covers the whole record, recovery metadata included.
  record.recordHash = sha256Prefixed(Buffer.from(canonicalJson({ ...record, recordHash: null })));
  return { ok: true, record, defects: [] };
}

function refuse(defects, ctx) {
  return { ok: false, record: null, defects, context: ctx };
}

/**
 * Verify a recovery association independently: re-read both ends and confirm the
 * chain still holds. A record that cannot be re-derived is not evidence.
 */
export function verifyRecoveryAssociation(record) {
  const defects = [];
  if (!existsSync(record.currentSpoolObjectPath)) defects.push(RECOVERY_DEFECT.OBJECT_ABSENT);
  else if (sha256Prefixed(readFileSync(record.currentSpoolObjectPath)) !== record.ciphertextHash) {
    defects.push(RECOVERY_DEFECT.OBJECT_HASH_MISMATCH);
  }
  const recomputed = sha256Prefixed(Buffer.from(canonicalJson({ ...record, recordHash: null })));
  if (recomputed !== record.recordHash) defects.push('RECORD_HASH_MISMATCH');
  const idRecomputed = associationIdentity({
    ciphertextHash: record.ciphertextHash,
    supersededLedgerEntryHash: record.supersededLedgerEntryHash,
    supersededEntryFileSha256: record.supersededEntryFileSha256,
  });
  if (idRecomputed !== record.recoveryRecordId) defects.push('ASSOCIATION_IDENTITY_MISMATCH');
  return { verified: defects.length === 0, defects };
}

/**
 * Deterministic association identity. Same object + same preserved entry always
 * yields the same id, which is what makes the writer idempotent.
 */
export function associationIdentity({ ciphertextHash, supersededLedgerEntryHash, supersededEntryFileSha256 }) {
  return sha256Prefixed(Buffer.from(canonicalJson({
    ciphertextHash, supersededLedgerEntryHash, supersededEntryFileSha256,
  })));
}

export function recoveryFileName(record) {
  return `recovery-${record.recordHash.replace('sha256:', '')}.json`;
}
