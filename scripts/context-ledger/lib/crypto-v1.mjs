import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { sha256Prefixed } from './canonical-v1.mjs';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;
const TAG_BYTES = 16;

export function decodeKeyMaterial(raw) {
  const trimmed = raw.trim();
  if (/^[A-Fa-f0-9]{64}$/.test(trimmed)) return Buffer.from(trimmed, 'hex');
  return Buffer.from(trimmed, 'base64');
}

export function encryptAes256Gcm(plaintext, keyMaterial) {
  const key = decodeKeyMaterial(keyMaterial);
  if (key.length !== 32) throw new Error(`AES-256 key must be 32 bytes, got ${key.length}`);
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_BYTES });
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  const envelope = Buffer.concat([iv, tag, ciphertext]);
  return {
    envelope,
    iv: iv.toString('base64'),
    plaintextHash: sha256Prefixed(plaintext),
    ciphertextHash: sha256Prefixed(envelope),
  };
}

export function decryptAes256Gcm(envelope, keyMaterial) {
  const key = decodeKeyMaterial(keyMaterial);
  if (envelope.length < IV_BYTES + TAG_BYTES + 1) throw new Error('ciphertext envelope too short');
  const iv = envelope.subarray(0, IV_BYTES);
  const tag = envelope.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ciphertext = envelope.subarray(IV_BYTES + TAG_BYTES);
  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_BYTES });
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
