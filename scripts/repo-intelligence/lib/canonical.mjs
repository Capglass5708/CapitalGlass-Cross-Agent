/**
 * Deterministic canonical JSON + hashing.
 * Key order is sorted recursively so the same logical value always hashes
 * identically regardless of construction order. This is the basis of every
 * content-addressed id the compiler emits.
 */
import crypto from 'node:crypto';

export function canonicalize(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(canonicalize);
  const out = {};
  for (const key of Object.keys(value).sort()) {
    if (value[key] === undefined) continue;
    out[key] = canonicalize(value[key]);
  }
  return out;
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

export function sha256(input) {
  const text = typeof input === 'string' ? input : canonicalJson(input);
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

export function sha256Prefixed(input) {
  return `sha256:${sha256(input)}`;
}

/** Stable JSON file output: canonical ordering + trailing newline. */
export function writeJson(fs, filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(canonicalize(value), null, 2)}\n`);
}
