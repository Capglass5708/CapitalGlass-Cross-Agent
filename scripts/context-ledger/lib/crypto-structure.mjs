/**
 * Key-free structural validation of a persisted context-ledger-crypto-v2 object.
 *
 * WHAT THIS PROVES: that a stored blob is SHAPED like a crypto-v2 envelope --
 * enough framing for a nonce, an authentication tag, and a non-empty ciphertext
 * payload, optionally agreeing with an expected ciphertext hash.
 *
 * WHAT THIS DOES NOT PROVE, and must never be reported as:
 *   - that the object is DECRYPTABLE. That needs the key.
 *   - that its KEY VERSION is valid, or even known. The blob layout is
 *     [12-byte nonce][16-byte tag][ciphertext] and carries NO key-version
 *     field. Key version lives in the ledger entry's encryption metadata.
 *
 * This distinction is the whole point of the module. A verifier that can reach
 * a destination but not the ledger can establish structure and nothing more,
 * and it must say so in those words rather than implying recoverability.
 */
import { sha256Prefixed } from './canonical.mjs';

export const NONCE_BYTES = 12;
export const TAG_BYTES = 16;
export const HEADER_BYTES = NONCE_BYTES + TAG_BYTES;      // 28
export const MIN_BLOB_BYTES = HEADER_BYTES + 1;           // a real payload is never zero-length

export const STRUCTURE_VERDICT = {
  VALID: 'CONTEXT_LEDGER_CRYPTO_V2_STRUCTURE_VALID',
  INVALID: 'CONTEXT_LEDGER_CRYPTO_V2_STRUCTURE_INVALID',
};

export const STRUCTURE_DEFECT = {
  NOT_A_BUFFER: 'NOT_A_BUFFER',
  BELOW_MINIMUM_LENGTH: 'BELOW_MINIMUM_LENGTH',
  TRUNCATED_NONCE: 'TRUNCATED_NONCE',
  TRUNCATED_TAG: 'TRUNCATED_TAG',
  EMPTY_CIPHERTEXT_PAYLOAD: 'EMPTY_CIPHERTEXT_PAYLOAD',
  CIPHERTEXT_HASH_MISMATCH: 'CIPHERTEXT_HASH_MISMATCH',
};

/**
 * Validate the physical object alone. No key, no ledger, no network.
 *
 * @param {Buffer} blob                      bytes exactly as persisted
 * @param {string|null} expectedCiphertextHash  sha256-prefixed hash, when the
 *        caller has one from an independent source. Supplying it upgrades the
 *        check from "shaped correctly" to "shaped correctly AND is the object
 *        the caller meant"; omitting it is legitimate and simply proves less.
 */
export function validateCryptoV2Structure(blob, { expectedCiphertextHash = null } = {}) {
  const defects = [];
  const checks = {
    isBuffer: false,
    minimumLength: false,
    nonceFraming: false,
    tagFraming: false,
    nonEmptyCiphertext: false,
    ciphertextHashAgreement: null,   // null = not asserted, not "passed"
  };

  if (!Buffer.isBuffer(blob)) {
    defects.push(STRUCTURE_DEFECT.NOT_A_BUFFER);
    return finish(checks, defects, null, null);
  }
  checks.isBuffer = true;

  const len = blob.length;
  if (len < MIN_BLOB_BYTES) {
    defects.push(STRUCTURE_DEFECT.BELOW_MINIMUM_LENGTH);
    // Say WHICH field the truncation lands in -- "too short" alone does not
    // tell an operator whether they have a damaged header or an empty payload.
    if (len < NONCE_BYTES) defects.push(STRUCTURE_DEFECT.TRUNCATED_NONCE);
    else if (len < HEADER_BYTES) defects.push(STRUCTURE_DEFECT.TRUNCATED_TAG);
    else defects.push(STRUCTURE_DEFECT.EMPTY_CIPHERTEXT_PAYLOAD);
    return finish(checks, defects, null, null);
  }

  checks.minimumLength = true;
  checks.nonceFraming = true;
  checks.tagFraming = true;
  checks.nonEmptyCiphertext = len > HEADER_BYTES;
  if (!checks.nonEmptyCiphertext) defects.push(STRUCTURE_DEFECT.EMPTY_CIPHERTEXT_PAYLOAD);

  const observedHash = sha256Prefixed(blob);
  if (expectedCiphertextHash !== null && expectedCiphertextHash !== undefined) {
    checks.ciphertextHashAgreement = observedHash === expectedCiphertextHash;
    if (!checks.ciphertextHashAgreement) defects.push(STRUCTURE_DEFECT.CIPHERTEXT_HASH_MISMATCH);
  }

  return finish(checks, defects, blob, observedHash);
}

function finish(checks, defects, blob, observedHash) {
  return {
    verdict: defects.length === 0 ? STRUCTURE_VERDICT.VALID : STRUCTURE_VERDICT.INVALID,
    envelopeVersionAsserted: 'context-ledger-crypto-v2',
    // Stated explicitly so no consumer can read a structural pass as recoverability.
    provesDecryptable: false,
    provesKeyVersion: false,
    keyVersionSource: 'LEDGER_ENTRY_ENCRYPTION_METADATA',
    checks,
    defects,
    nonceHex: blob ? blob.subarray(0, NONCE_BYTES).toString('hex') : null,
    tagHex: blob ? blob.subarray(NONCE_BYTES, HEADER_BYTES).toString('hex') : null,
    ciphertextByteLength: blob ? Math.max(0, blob.length - HEADER_BYTES) : null,
    byteLength: blob ? blob.length : null,
    observedCiphertextHash: observedHash,
  };
}

export function isStructurallyValid(result) {
  return result?.verdict === STRUCTURE_VERDICT.VALID;
}
