/**
 * Canonical JSON + hashing. One canonicalizer only.
 *
 * Two canonicalizers that disagree by a single byte silently fork the object
 * store: the same logical object hashes two ways, dedup breaks, and remote
 * verification starts reporting mismatches that are really serialization
 * differences. Rules match CONTENT_HASH_CONTRACT: UTF-8, keys sorted
 * lexicographically at every level, no insignificant whitespace, undefined
 * dropped, no trailing newline.
 */
import { createHash } from 'node:crypto';

export function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`;
}

export const sha256Hex = (buf) => createHash('sha256').update(buf).digest('hex');
export const sha256Prefixed = (buf) => `sha256:${sha256Hex(buf)}`;
export const hashCanonical = (obj) => sha256Prefixed(Buffer.from(canonicalJson(obj), 'utf8'));

/** Content-addressed path: 01-object-store/sha256/{aa}/{hash} */
export function objectStorePath(contentHash) {
  const hex = String(contentHash).replace(/^sha256:/, '');
  if (!/^[a-f0-9]{64}$/.test(hex)) throw new TypeError(`not a sha256 hash: ${contentHash}`);
  return `objects/sha256/${hex.slice(0, 2)}/${hex}`;
}
