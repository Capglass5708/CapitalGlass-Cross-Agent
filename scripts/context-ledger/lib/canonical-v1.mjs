import { createHash } from 'node:crypto';

export function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`;
}

export function sha256Hex(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

export function sha256Prefixed(buffer) {
  return `sha256:${sha256Hex(buffer)}`;
}

export function entryHash(entryWithoutHash, prevHash) {
  const body = canonicalJson(entryWithoutHash);
  const chain = prevHash ?? 'null';
  return sha256Prefixed(Buffer.from(`${body}${chain}`, 'utf8'));
}

export function evidenceId(sourceSystem, sourceNativeId, contentHash) {
  return sha256Prefixed(Buffer.from(`${sourceSystem}|${sourceNativeId}|${contentHash}`, 'utf8'));
}

export function objectRelPath(ciphertextHash) {
  const hex = ciphertextHash.replace(/^sha256:/, '');
  return `objects/sha256/${hex.slice(0, 2)}/${hex}`;
}
