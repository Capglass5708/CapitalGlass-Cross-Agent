/**
 * Encrypt-first. Evidence is encrypted in WSL before ANY storage target sees it.
 *
 * Neither drive is trusted for confidentiality -- and DSM share encryption is
 * DISABLED on this NAS, so relying on it would be relying on nothing.
 *
 * AES-256-GCM: authenticated encryption. A plain stream cipher would give
 * confidentiality with no tamper detection, quietly undercutting the integrity
 * scrub the whole design leans on. A misuse-resistant AEAD (AES-GCM-SIV) would
 * be preferable, but this OpenSSL exposes no SIV cipher (checked: 0 available),
 * so it is not an option here rather than a choice declined.
 *
 * KEY SEPARATION. The master key is never used directly. HKDF-SHA256 derives
 * two independent subkeys under distinct info labels:
 *
 *     encKey   = HKDF(master, info="context-ledger/v1/aes-256-gcm/enc")
 *     nonceKey = HKDF(master, info="context-ledger/v1/nonce-derivation")
 *
 * The encryption key therefore never doubles as a MAC key. An earlier revision
 * derived the nonce with HMAC keyed by the encryption key itself -- keyed and
 * domain-separated, so not the classic "truncated public hash" mistake, but
 * still cross-purpose reuse of one key. Fixed here, while no real evidence
 * exists: changing derivation changes ciphertext for the same plaintext, which
 * is free today and expensive once the vault holds anything.
 *
 * DETERMINISTIC NONCE, deliberately:
 *   - identical plaintext must produce identical bytes, or the two
 *     destinations could not be byte-compared and dedup would break;
 *   - it leaks only equality-of-plaintexts, which the ledger already publishes
 *     as plaintextHash, so no NEW information is exposed;
 *   - distinct plaintexts get distinct nonces, so GCM's catastrophic failure
 *     mode -- nonce reuse across different messages under one key -- does not
 *     arise from normal operation.
 *
 * The residual risk is a 96-bit nonce collision between two DISTINCT
 * plaintexts. At ~2^48 objects the birthday bound makes this negligible, but
 * "negligible" is not "detected": assertNoNonceCollision() below turns the
 * impossible-but-catastrophic case into a loud NONCE_COLLISION incident rather
 * than silent plaintext disclosure.
 */
import { createCipheriv, createDecipheriv, createHmac, hkdfSync, timingSafeEqual } from 'node:crypto';
import { sha256Prefixed } from './canonical.mjs';

export const ALGORITHM = 'AES-256-GCM';

/** Key material never appears in a receipt, a path, or Git. Callers pass it in from Doppler. */
export function resolveKey(keyMaterial) {
  const key = Buffer.isBuffer(keyMaterial) ? keyMaterial : Buffer.from(String(keyMaterial), 'base64');
  if (key.length !== 32) throw new TypeError(`AES-256-GCM requires a 32-byte key (got ${key.length})`);
  return key;
}

const SALT = Buffer.from('capital-glass-context-ledger-v1');
const INFO_ENC = 'context-ledger/v1/aes-256-gcm/enc';
const INFO_NONCE = 'context-ledger/v1/nonce-derivation';

/** Two independent subkeys. The master key is never used to encrypt or to MAC. */
export function deriveSubkeys(masterKeyMaterial) {
  const master = resolveKey(masterKeyMaterial);
  return {
    encKey: Buffer.from(hkdfSync('sha256', master, SALT, INFO_ENC, 32)),
    nonceKey: Buffer.from(hkdfSync('sha256', master, SALT, INFO_NONCE, 32)),
  };
}

function deriveNonce(nonceKey, plaintextHash) {
  return createHmac('sha256', nonceKey).update(plaintextHash).digest().subarray(0, 12);
}

/**
 * Detect the impossible-but-catastrophic case: one nonce serving two distinct
 * plaintexts under one key. Feed it ledger entries; it is cheap enough to run
 * in the periodic integrity scrub.
 */
export function assertNoNonceCollision(entries) {
  const seen = new Map();
  for (const e of entries) {
    const n = e?.encryption?.nonce;
    const ph = e?.encryption?.plaintextHash;
    if (!n || !ph) continue;
    const prior = seen.get(n);
    if (prior && prior !== ph) {
      const err = new Error('NONCE_COLLISION');
      err.nonce = n; err.plaintextHashes = [prior, ph];
      throw err;
    }
    seen.set(n, ph);
  }
  return { checked: seen.size, collisions: 0 };
}

export function encryptObject({ plaintext, key, plaintextHash }) {
  const { encKey, nonceKey } = deriveSubkeys(key);
  const iv = deriveNonce(nonceKey, plaintextHash);
  const c = createCipheriv('aes-256-gcm', encKey, iv);
  const body = Buffer.concat([c.update(plaintext), c.final()]);
  const tag = c.getAuthTag();
  // Stored layout: [12-byte nonce][16-byte tag][ciphertext]. Self-describing,
  // so a restore needs only the key -- not a side-channel of parameters.
  const blob = Buffer.concat([iv, tag, body]);
  return { blob, ciphertextHash: sha256Prefixed(blob), nonce: iv.toString('hex'), algorithm: ALGORITHM };
}

export function decryptObject({ blob, key }) {
  const { encKey } = deriveSubkeys(key);
  if (blob.length < 28) throw new Error('blob too short to contain nonce+tag');
  const iv = blob.subarray(0, 12);
  const tag = blob.subarray(12, 28);
  const body = blob.subarray(28);
  const d = createDecipheriv('aes-256-gcm', encKey, iv);
  d.setAuthTag(tag);
  // GCM throws here on any tampering -- authentication, not just decryption.
  return Buffer.concat([d.update(body), d.final()]);
}

export function hashesEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
