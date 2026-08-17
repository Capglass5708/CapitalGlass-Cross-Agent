import { hashCanonicalJson } from '../../harvest/lib/hash.mjs';
import { DERIVATION_VERSION } from './constants.mjs';

export const OPERATIONAL_INTELLIGENCE_DOMAIN = 'OPERATIONAL_INTELLIGENCE';
export const OPERATIONAL_MISSION_LEDGER_DOMAIN = 'OPERATIONAL_MISSION_LEDGER';
export const EVIDENCE_DOMAIN = 'EVIDENCE';

export function domainForObjectId(objectId) {
  if (String(objectId).startsWith('oi:ledger:')) return OPERATIONAL_MISSION_LEDGER_DOMAIN;
  if (String(objectId).startsWith('sha256:')) return EVIDENCE_DOMAIN;
  if (/^[0-9a-f]{64}$/i.test(String(objectId))) return EVIDENCE_DOMAIN;
  return OPERATIONAL_INTELLIGENCE_DOMAIN;
}

export function normalizeBodyHash(contentHash) {
  const raw = String(contentHash ?? '').replace(/^sha256:/, '').toLowerCase();
  return `sha256:${raw}`;
}

export function buildRelationshipHash({ relationshipId, relationshipType, fromDomain, fromObjectId, toDomain, toObjectId }) {
  return `sha256:${hashCanonicalJson({
    relationshipId,
    relationshipType,
    fromDomain,
    fromObjectId,
    toDomain,
    toObjectId,
    derivationVersion: DERIVATION_VERSION,
  })}`;
}

export function mapKnowledgeObjectRow({ ledger, object }) {
  const bodyHash = normalizeBodyHash(object.identity.contentHash);
  return {
    knowledgeObjectId: object.identity.objectId,
    knowledgeDomain: OPERATIONAL_INTELLIGENCE_DOMAIN,
    knowledgeObjectType: object.identity.kind,
    bodyHash,
    schemaHash: null,
    canonicalizationVersion: object.identity.derivationVersion,
    provenanceClass: 'DERIVED',
    placementState: 'INDEXED',
    authoritySystem: 'github',
    authorityRepository: ledger.source.repo,
    authorityPath: `intelligence/derived/${ledger.ledgerId}/${object.identity.objectId}.json`,
    authorityCommit: ledger.source.commitSha,
    objectStorePath: null,
    cacheEligibility: object.futureUse?.retrievalEligible ? 'eligible' : 'summary_only',
    freshnessState: 'CURRENT',
    metadata: {
      ledgerId: ledger.ledgerId,
      workPackageId: ledger.workPackageId,
      closeoutHash: ledger.closeoutHash,
      authorityFingerprint: ledger.authorityFingerprint,
      evidenceReality: object.evidenceReality,
      measurementQuality: object.measurement?.measurementQuality ?? null,
      progressionAuthority: false,
      authorityClass: 'DERIVED_INTELLIGENCE',
    },
  };
}

export function mapRelationshipRow({ ledger, edge }) {
  const fromDomain = domainForObjectId(edge.from);
  const toDomain = domainForObjectId(edge.to);
  const relationshipId = edge.relationshipId;
  const relationshipType = edge.relationship;
  return {
    relationshipId,
    relationshipType,
    fromDomain,
    fromObjectId: edge.from,
    toDomain,
    toObjectId: edge.to,
    authorityRepository: ledger.source.repo,
    authorityCommit: ledger.source.commitSha,
    verificationState: 'VERIFIED',
    relationshipHash: buildRelationshipHash({
      relationshipId,
      relationshipType,
      fromDomain,
      fromObjectId: edge.from,
      toDomain,
      toObjectId: edge.to,
    }),
    metadata: {
      ledgerId: ledger.ledgerId,
      workPackageId: ledger.workPackageId,
      derivationVersion: edge.derivationVersion ?? DERIVATION_VERSION,
    },
  };
}

export function buildSupabaseProjectionManifest({ ledger, derivedObjects, relationships }) {
  return {
    schemaVersion: 'operational-intelligence-supabase-projection-v1@1.0.0',
    ledgerId: ledger.ledgerId,
    workPackageId: ledger.workPackageId,
    closeoutHash: ledger.closeoutHash,
    authorityFingerprint: ledger.authorityFingerprint,
    evidenceReality: ledger.evidenceReality,
    knowledgeObjects: derivedObjects.map((object) => mapKnowledgeObjectRow({ ledger, object })),
    relationships: relationships.map((edge) => mapRelationshipRow({ ledger, edge })),
  };
}
