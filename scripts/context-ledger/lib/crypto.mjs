/**
 * Encrypt-first. Evidence is encrypted in WSL before ANY storage target sees it.
 *
 * Neither drive is trusted for confidentiality -- and DSM share encryption is
 * DISABLED on this NAS, so relying on it would be relying on nothing.
 *
 * AES-256-GCM specifically: authenticated encryption. A plain stream cipher
 * would give confidentiality with no tamper detection, quietly undercutting the
 * integrity scrub that the whole design leans on.
 *
 * Deterministic nonce, derived from (key, plaintextHash). This is deliberate:
 *   - identical plaintext must produce identical ciphertext, or the two
 *     destinations could not be byte-compared and dedup would break;
 *   - it leaks only equality-of-plaintexts, which the ledger already publishes
 *     as plaintextHash, so no NEW information is exposed;
 *   - different plaintexts get different nonces, so the catastrophic GCM
 *     failure mode (nonce reuse across distinct messages under one key) does
 *     not arise.
 */
import { createCipheriv, createDecipheriv, createHmac, timingSafeEqual } from 'node:crypto';
import { sha256Prefixed } from './canonical.mjs';

export const ALGORITHM = 'AES-256-GCM';

/** Key material never appears in a receipt, a path, or Git. Callers pass it in from Doppler. */
export function resolveKey(keyMaterial) {
  const key = Buffer.isBuffer(keyMaterial) ? keyMaterial : Buffer.from(String(keyMaterial), 'base64');
  if (key.length !== 32) throw new TypeError(`AES-256-GCM requires a 32-byte key (got ${key.length})`);
  return key;
}

function deriveNonce(key, plaintextHash) {
  return createHmac('sha256', key).update(`nonce:${plaintextHash}`).digest().subarray(0, 12);
}

export function encryptObject({ plaintext, key, plaintextHash }) {
  const k = resolveKey(key);
  const iv = deriveNonce(k, plaintextHash);
  const c = createCipheriv('aes-256-gcm', k, iv);
  const body = Buffer.concat([c.update(plaintext), c.final()]);
  const tag = c.getAuthTag();
  // Stored layout: [12-byte nonce][16-byte tag][ciphertext]. Self-describing,
  // so a restore needs only the key -- not a side-channel of parameters.
  const blob = Buffer.concat([iv, tag, body]);
  return { blob, ciphertextHash: sha256Prefixed(blob), nonce: iv.toString('hex'), algorithm: ALGORITHM };
}

export function decryptObject({ blob, key }) {
  const k = resolveKey(key);
  if (blob.length < 28) throw new Error('blob too short to contain nonce+tag');
  const iv = blob.subarray(0, 12);
  const tag = blob.subarray(12, 28);
  const body = blob.subarray(28);
  const d = createDecipheriv('aes-256-gcm', k, iv);
  d.setAuthTag(tag);
  // GCM throws here on any tampering -- authentication, not just decryption.
  return Buffer.concat([d.update(body), d.final()]);
}

export function hashesEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
