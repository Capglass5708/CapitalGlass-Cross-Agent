import { hashCanonicalJson } from '../../harvest/lib/hash.mjs';
import { DERIVATION_VERSION } from './constants.mjs';

function normalizeHash(value) {
  return String(value).replace(/^sha256:/, '').toLowerCase();
}

export function buildLedgerId(closeoutHash) {
  const digest = hashCanonicalJson(`${normalizeHash(closeoutHash)}:${DERIVATION_VERSION}`);
  return `oi:ledger:${digest.slice(0, 24)}`;
}

export function buildObjectId(kind, ledgerId, closeoutHash) {
  const digest = hashCanonicalJson(`${ledgerId}:${kind}:${normalizeHash(closeoutHash)}:${DERIVATION_VERSION}`);
  return `oi:${kind.toLowerCase().replace(/_/g, '-')}:${digest.slice(0, 16)}`;
}

export function buildSemanticObjectId(kind, ledgerId, closeoutHash, conceptKey) {
  const digest = hashCanonicalJson(
    `${ledgerId}:${kind}:${conceptKey}:${normalizeHash(closeoutHash)}:${DERIVATION_VERSION}`,
  );
  return `oi:${kind.toLowerCase().replace(/_/g, '-')}:${digest.slice(0, 16)}`;
}

export function buildWorkPackageAnchorId(workPackageId) {
  const digest = hashCanonicalJson(`workpackage:${workPackageId}:${DERIVATION_VERSION}`);
  return `oi:workpackage:${digest.slice(0, 16)}`;
}

export function buildRelationshipId(fromId, toId, relationship) {
  const digest = hashCanonicalJson(`${fromId}:${toId}:${relationship}:${DERIVATION_VERSION}`);
  return `oi:rel:${digest.slice(0, 16)}`;
}

export function buildEnvelopeContentHash(envelope) {
  const clone = structuredClone(envelope);
  clone.identity.contentHash = 'sha256:pending';
  return `sha256:${hashCanonicalJson(clone)}`;
}
