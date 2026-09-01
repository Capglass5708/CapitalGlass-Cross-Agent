/**
 * Storage pipeline readiness -- LOCAL PROOFS ONLY.
 *
 * These prove the selector, the structural validator, the destination-exec
 * interface and the protected-set accounting. They prove NOTHING about remote
 * storage: no canonical destination has been adjudicated, so every path that
 * would touch one is expected to REFUSE, and several tests assert exactly that.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';

import { sha256Prefixed } from '../context-ledger/lib/canonical.mjs';
import {
  TRANSPORT_ID, NATIVE_PRODUCTION, STORAGE_AUTHORITY_STATE, SELECTOR_REFUSAL,
  selectTransport, classifyNativeProduction, assertNativeProductionTransport,
  missingConfiguration, NATIVE_TRANSPORT_PIPELINE_INTEGRATION,
} from '../context-ledger/lib/transport-selector.mjs';
import {
  validateCryptoV2Structure, STRUCTURE_VERDICT, STRUCTURE_DEFECT,
  NONCE_BYTES, HEADER_BYTES, MIN_BLOB_BYTES,
} from '../context-ledger/lib/crypto-structure.mjs';
import {
  EXEC_MECHANISM, EXEC_REFUSAL, assertIndependentOfTransport,
  resolveDestinationHashExecutor, destinationHashCapabilityStatus,
  DESTINATION_HASH_CAPABILITY,
} from '../context-ledger/lib/destination-exec.mjs';
import {
  EXPECTED_COUNTS, PROTECTED_SET_MEMBER, OBJECT_CLASS, CLOSURE_DEFECT,
  PROVISIONAL_KEY_VERSION_STATE, verifyObjectClosure, describeProvisionalObject,
  keyVersionPopulation, buildProtectedSetManifest, assertManifestAccounting,
} from '../context-ledger/lib/protected-set.mjs';

// A PROVEN authority stub. Real authority is CONFLICTED; this exists only so
// the selector's later stages are reachable in test.
const PROVEN_AUTHORITY = {
  state: STORAGE_AUTHORITY_STATE.PROVEN,
  authorityId: 'test-authority',
  host: 'test-host',
  objectRoot: '/test/objects',
};
const FS_ENV = { SYNOLOGY_SERVICE_USERNAME: 'u', SYNOLOGY_SERVICE_PASSWORD: 'p' };
const SCP_ENV = { WESLEYDESK_SSH_HOST: 'h', WESLEYDESK_SSH_USER: 'u', WESLEYDESK_SSH_KEY: 'k' };

/* ---------------- TASK 1: transport selector ---------------- */

test('FileStation is selectable and binds a receipt transport identity', () => {
  const r = selectTransport({
    transportId: TRANSPORT_ID.FILESTATION_HTTPS, role: 'primary',
    storageAuthority: PROVEN_AUTHORITY, env: FS_ENV,
  });
  assert.equal(r.transportIdentity.transportId, TRANSPORT_ID.FILESTATION_HTTPS);
  assert.equal(r.transportIdentity.nativeProduction, NATIVE_PRODUCTION.ELIGIBLE);
  assert.equal(r.transportIdentity.authorityId, 'test-authority');
  assert.equal(r.adapter.kind, TRANSPORT_ID.FILESTATION_HTTPS);
});

test('SCP is selectable', () => {
  const r = selectTransport({
    transportId: TRANSPORT_ID.SCP, role: 'backup',
    storageAuthority: PROVEN_AUTHORITY, env: SCP_ENV,
  });
  assert.equal(r.transportIdentity.transportId, TRANSPORT_ID.SCP);
  assert.equal(r.adapter.kind, TRANSPORT_ID.SCP);
});

test('the destination comes from the authority, never from the transport', () => {
  const r = selectTransport({
    transportId: TRANSPORT_ID.FILESTATION_HTTPS, role: 'primary',
    storageAuthority: PROVEN_AUTHORITY, env: FS_ENV,
  });
  assert.equal(r.adapter.objectRoot, PROVEN_AUTHORITY.objectRoot);
  assert.equal(r.adapter.host, PROVEN_AUTHORITY.host);
  // and with no authority at all, selection refuses rather than inventing one
  assert.throws(
    () => selectTransport({ transportId: TRANSPORT_ID.FILESTATION_HTTPS, env: FS_ENV }),
    (e) => e.refusal === SELECTOR_REFUSAL.STORAGE_AUTHORITY_REQUIRED,
  );
});

test('a CONFLICTED authority cannot produce a live adapter', () => {
  assert.throws(
    () => selectTransport({
      transportId: TRANSPORT_ID.FILESTATION_HTTPS, env: FS_ENV,
      storageAuthority: { ...PROVEN_AUTHORITY, state: STORAGE_AUTHORITY_STATE.CONFLICTED },
    }),
    (e) => e.refusal === SELECTOR_REFUSAL.STORAGE_AUTHORITY_NOT_PROVEN,
  );
});

test('an unknown transport is refused', () => {
  assert.throws(
    () => selectTransport({ transportId: 'MADE_UP', storageAuthority: PROVEN_AUTHORITY }),
    (e) => e.refusal === SELECTOR_REFUSAL.TRANSPORT_NOT_IN_REGISTRY,
  );
});

test('missing transport configuration is refused, and names only variables', () => {
  assert.deepEqual(missingConfiguration(TRANSPORT_ID.FILESTATION_HTTPS, {}), [
    'SYNOLOGY_SERVICE_USERNAME', 'SYNOLOGY_SERVICE_PASSWORD',
  ]);
  assert.throws(
    () => selectTransport({
      transportId: TRANSPORT_ID.FILESTATION_HTTPS, storageAuthority: PROVEN_AUTHORITY, env: {},
    }),
    (e) => e.refusal === SELECTOR_REFUSAL.TRANSPORT_CONFIGURATION_INCOMPLETE
        && e.missingConfigurationNames.length === 2,
  );
});

test('DRVFS can never satisfy native production classification', () => {
  assert.equal(classifyNativeProduction(TRANSPORT_ID.DRVFS_MOUNT), NATIVE_PRODUCTION.INELIGIBLE);
  assert.throws(
    () => assertNativeProductionTransport(TRANSPORT_ID.DRVFS_MOUNT),
    (e) => e.refusal === SELECTOR_REFUSAL.DRVFS_NOT_NATIVE_PRODUCTION_TRANSPORT,
  );
  assert.throws(
    () => selectTransport({
      transportId: TRANSPORT_ID.DRVFS_MOUNT, storageAuthority: PROVEN_AUTHORITY,
      requireNativeProduction: true,
    }),
    (e) => e.refusal === SELECTOR_REFUSAL.DRVFS_NOT_NATIVE_PRODUCTION_TRANSPORT,
  );
});

test('the unimplemented SshRsync stub can never become a silent fallback success', () => {
  // Refused even with authority PROVEN and configuration complete -- the
  // not-implemented check runs first precisely so nothing downstream can
  // rescue it into an apparent success.
  assert.throws(
    () => selectTransport({
      transportId: TRANSPORT_ID.SSH_RSYNC, storageAuthority: PROVEN_AUTHORITY, env: FS_ENV,
    }),
    (e) => e.refusal === SELECTOR_REFUSAL.TRANSPORT_NOT_IMPLEMENTED
        && e.reason === 'SSH_RSYNC_TRANSPORT_NOT_IMPLEMENTED_AWAITING_REAL_STORAGE',
  );
});

test('an unspecified transport does not default to anything', () => {
  assert.throws(
    () => selectTransport({ storageAuthority: PROVEN_AUTHORITY }),
    (e) => e.refusal === SELECTOR_REFUSAL.TRANSPORT_NOT_SPECIFIED,
  );
});

test('pipeline integration is IMPLEMENTED_UNPROVEN, not PROVEN', () => {
  assert.equal(NATIVE_TRANSPORT_PIPELINE_INTEGRATION, 'IMPLEMENTED_UNPROVEN');
});

/* ---------------- TASK 2: structural validator ---------------- */

function wellFormedBlob(payloadBytes = 64) {
  return Buffer.concat([randomBytes(NONCE_BYTES), randomBytes(16), randomBytes(payloadBytes)]);
}

test('a well-formed crypto-v2 object validates structurally, without a key', () => {
  const blob = wellFormedBlob();
  const r = validateCryptoV2Structure(blob);
  assert.equal(r.verdict, STRUCTURE_VERDICT.VALID);
  assert.equal(r.ciphertextByteLength, blob.length - HEADER_BYTES);
  // and it refuses to imply more than it proved
  assert.equal(r.provesDecryptable, false);
  assert.equal(r.provesKeyVersion, false);
  assert.equal(r.keyVersionSource, 'LEDGER_ENTRY_ENCRYPTION_METADATA');
});

test('hash agreement is asserted only when an expected hash is supplied', () => {
  const blob = wellFormedBlob();
  assert.equal(validateCryptoV2Structure(blob).checks.ciphertextHashAgreement, null);
  const ok = validateCryptoV2Structure(blob, { expectedCiphertextHash: sha256Prefixed(blob) });
  assert.equal(ok.checks.ciphertextHashAgreement, true);
});

test('negative: truncated nonce', () => {
  const r = validateCryptoV2Structure(randomBytes(NONCE_BYTES - 1));
  assert.equal(r.verdict, STRUCTURE_VERDICT.INVALID);
  assert.ok(r.defects.includes(STRUCTURE_DEFECT.TRUNCATED_NONCE));
});

test('negative: truncated authentication tag', () => {
  const r = validateCryptoV2Structure(randomBytes(HEADER_BYTES - 1));
  assert.equal(r.verdict, STRUCTURE_VERDICT.INVALID);
  assert.ok(r.defects.includes(STRUCTURE_DEFECT.TRUNCATED_TAG));
});

test('negative: zero-length ciphertext payload', () => {
  const r = validateCryptoV2Structure(randomBytes(HEADER_BYTES));
  assert.equal(r.verdict, STRUCTURE_VERDICT.INVALID);
  assert.ok(r.defects.includes(STRUCTURE_DEFECT.EMPTY_CIPHERTEXT_PAYLOAD));
  assert.equal(MIN_BLOB_BYTES, HEADER_BYTES + 1);
});

test('negative: malformed framing (not a buffer)', () => {
  const r = validateCryptoV2Structure('not-bytes');
  assert.equal(r.verdict, STRUCTURE_VERDICT.INVALID);
  assert.ok(r.defects.includes(STRUCTURE_DEFECT.NOT_A_BUFFER));
});

test('negative: ciphertext hash mismatch', () => {
  const r = validateCryptoV2Structure(wellFormedBlob(), { expectedCiphertextHash: sha256Prefixed(Buffer.from('other')) });
  assert.equal(r.verdict, STRUCTURE_VERDICT.INVALID);
  assert.ok(r.defects.includes(STRUCTURE_DEFECT.CIPHERTEXT_HASH_MISMATCH));
});

test('negative: missing ledger association is a closure defect, not a structural one', () => {
  const blob = wellFormedBlob();
  // The object alone is structurally fine ...
  assert.equal(validateCryptoV2Structure(blob).verdict, STRUCTURE_VERDICT.VALID);
  // ... and still not recoverable, because structure is not the whole chain.
  const c = verifyObjectClosure({ ciphertextHash: sha256Prefixed(blob), objectPresent: true, ledgerEntry: null });
  assert.equal(c.recoverable, false);
  assert.ok(c.defects.includes(CLOSURE_DEFECT.LEDGER_ENTRY_ABSENT));
});

/* ---------------- TASK 3: destination-side execution ---------------- */

test('transport read-back is refused as a verification mechanism', () => {
  assert.throws(
    () => assertIndependentOfTransport(EXEC_MECHANISM.TRANSPORT_READBACK),
    (e) => e.refusal === EXEC_REFUSAL.MECHANISM_READS_BACK_THROUGH_TRANSPORT,
  );
});

test('independent mechanisms are accepted by the guard', () => {
  assert.equal(assertIndependentOfTransport(EXEC_MECHANISM.SSH_REMOTE_SHA256SUM), true);
  assert.equal(assertIndependentOfTransport(EXEC_MECHANISM.DSM_API_REMOTE_HASH), true);
});

test('executors fail closed and never broaden the SSH allowlist', async () => {
  const ex = resolveDestinationHashExecutor({
    role: 'primary', storageAuthority: PROVEN_AUTHORITY,
    mechanismId: EXEC_MECHANISM.SSH_REMOTE_SHA256SUM,
  });
  await assert.rejects(() => ex.hashAt('objects/sha256/aa/deadbeef'),
    (e) => e.refusal === EXEC_REFUSAL.ALLOWLIST_EXPANSION_REQUIRED);
});

test('DSM execution is not authorized for this mission', async () => {
  const ex = resolveDestinationHashExecutor({
    role: 'primary', storageAuthority: PROVEN_AUTHORITY,
    mechanismId: EXEC_MECHANISM.DSM_API_REMOTE_HASH,
  });
  await assert.rejects(() => ex.hashAt('objects/sha256/aa/deadbeef'),
    (e) => e.refusal === EXEC_REFUSAL.DESTINATION_EXECUTION_NOT_AUTHORIZED);
});

test('an unproven authority cannot resolve a destination executor', () => {
  assert.throws(
    () => resolveDestinationHashExecutor({
      storageAuthority: { state: 'CONFLICTED' }, mechanismId: EXEC_MECHANISM.SSH_REMOTE_SHA256SUM,
    }),
    (e) => e.refusal === EXEC_REFUSAL.STORAGE_AUTHORITY_NOT_PROVEN,
  );
});

test('Phase 0E capability reports IMPLEMENTED_UNPROVEN, not available', () => {
  const s = destinationHashCapabilityStatus();
  assert.equal(s.PRIMARY_DESTINATION_HASH_EXECUTION, DESTINATION_HASH_CAPABILITY.IMPLEMENTED_UNPROVEN);
  assert.equal(s.BACKUP_DESTINATION_HASH_EXECUTION, DESTINATION_HASH_CAPABILITY.IMPLEMENTED_UNPROVEN);
  assert.ok(s.blockers.length >= 3);
});

/* ---------------- TASK 4: protected set ---------------- */

test('the ledger is a member of the protected set', () => {
  assert.ok(PROTECTED_SET_MEMBER.includes('ledgerEntries'));
  assert.ok(PROTECTED_SET_MEMBER.includes('ledgerChainMetadata'));
  const m = buildProtectedSetManifest({});
  assert.equal(m.ledgerIsProtectedSetMember, true);
});

test('the population split is permanently explicit', () => {
  assert.equal(EXPECTED_COUNTS.PRODUCTION_EXPECTED_COUNT, 13998);
  assert.equal(EXPECTED_COUNTS.PROVISIONAL_EXPECTED_COUNT, 7);
  assert.equal(EXPECTED_COUNTS.PRESERVATION_EXPECTED_COUNT, 14005);
  assert.equal(
    EXPECTED_COUNTS.PRODUCTION_EXPECTED_COUNT + EXPECTED_COUNTS.PROVISIONAL_EXPECTED_COUNT,
    EXPECTED_COUNTS.PRESERVATION_EXPECTED_COUNT,
  );
});

test('a manifest whose counts disagree with the adjudication is refused', () => {
  const m = buildProtectedSetManifest({ productionObjects: ['a'], provisionalObjects: ['b'] });
  assert.throws(() => assertManifestAccounting(m), (e) => e.message === 'PROTECTED_SET_ACCOUNTING_REFUSED');
});

test('a full closure over a ledger-bound object is recoverable', () => {
  const blob = wellFormedBlob();
  const ch = sha256Prefixed(blob);
  const entry = {
    encryption: {
      ciphertextHash: ch, plaintextHash: sha256Prefixed(Buffer.from('pt')),
      keyVersion: 'v1', keyRef: 'CONTEXT_LEDGER_EVIDENCE_KEY_V1',
    },
  };
  const c = verifyObjectClosure({
    ciphertextHash: ch, objectPresent: true, objectBytes: blob, ledgerEntry: entry,
    keyCustodyResolver: (v, ref) => ({ vault: 'IT_VAULT', keyVersion: v, keyRef: ref }),
  });
  assert.equal(c.recoverable, true);
  assert.equal(c.keyVersion, 'v1');
  assert.equal(c.keyCustodyPointer.vault, 'IT_VAULT');
  // the pointer carries no secret material
  assert.ok(!JSON.stringify(c.keyCustodyPointer).includes('KEY_MATERIAL'));
});

test('key version absent from the ledger is a defect, never inferred', () => {
  const blob = wellFormedBlob();
  const ch = sha256Prefixed(blob);
  const c = verifyObjectClosure({
    ciphertextHash: ch, objectPresent: true, objectBytes: blob,
    ledgerEntry: { encryption: { ciphertextHash: ch, plaintextHash: 'sha256:x' } },
  });
  assert.equal(c.recoverable, false);
  assert.ok(c.defects.includes(CLOSURE_DEFECT.KEY_VERSION_UNKNOWN));
  assert.equal(c.keyVersion, null);
});

test('a resolvable key version with no custody pointer still fails', () => {
  const blob = wellFormedBlob();
  const ch = sha256Prefixed(blob);
  const c = verifyObjectClosure({
    ciphertextHash: ch, objectPresent: true, objectBytes: blob,
    ledgerEntry: { encryption: { ciphertextHash: ch, plaintextHash: 'sha256:x', keyVersion: 'v1' } },
    keyCustodyResolver: () => null,
  });
  assert.equal(c.recoverable, false);
  assert.ok(c.defects.includes(CLOSURE_DEFECT.KEY_CUSTODY_POINTER_UNRESOLVABLE));
});

test('provisional orphans are preserved, not promoted, and never given a manufactured entry', () => {
  const d = describeProvisionalObject({ ciphertextHash: 'sha256:orphan', objectPresent: true });
  assert.equal(d.classification, OBJECT_CLASS.PROVISIONAL);
  assert.equal(d.objectPreserved, true);
  assert.equal(d.ledgerAssociation, 'ABSENT');
  assert.equal(d.ledgerAssociationIsEvidence, true);
  assert.equal(d.manufacturedLedgerEntry, false);
  assert.equal(d.certifiedProduction, false);
  assert.equal(d.keyVersionState, PROVISIONAL_KEY_VERSION_STATE.UNKNOWN);
});

test('a provisional key version is reported only when other evidence supplies it', () => {
  const d = describeProvisionalObject({
    ciphertextHash: 'sha256:orphan', objectPresent: true,
    keyVersionEvidence: { keyVersion: 'v1', source: 'capture-batch-manifest' },
  });
  assert.equal(d.keyVersionState, PROVISIONAL_KEY_VERSION_STATE.KNOWN_FROM_OTHER_EVIDENCE);
  assert.equal(d.keyVersion, 'v1');
  assert.equal(d.keyVersionEvidenceSource, 'capture-batch-manifest');
});

test('key version population counts by version and reports unknowns separately', () => {
  const r = keyVersionPopulation([
    { encryption: { keyVersion: 'v1' } }, { encryption: { keyVersion: 'v1' } },
    { encryption: { keyVersion: 'v2' } }, { encryption: {} },
  ]);
  assert.deepEqual(r.KEY_VERSION_POPULATION, { v1: 2, v2: 1 });
  assert.equal(r.UNKNOWN_KEY_VERSION_COUNT, 1);
});
