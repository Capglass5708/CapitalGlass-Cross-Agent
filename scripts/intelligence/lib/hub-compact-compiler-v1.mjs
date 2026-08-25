import { HUB_COMPACT_SCHEMA } from './constants.mjs';

export function compileHubCompactPayload({
  ledger,
  derivedObjects,
  relationships,
  mode,
  generatedAt = new Date().toISOString(),
}) {
  return {
    schemaVersion: HUB_COMPACT_SCHEMA,
    mode,
    generatedAt,
    ledgerId: ledger.ledgerId,
    workPackageId: ledger.workPackageId,
    closeoutHash: ledger.closeoutHash,
    authorityFingerprint: ledger.authorityFingerprint,
    evidenceReality: ledger.evidenceReality,
    progressionAuthority: false,
    objects: derivedObjects.map((object) => ({
      objectId: object.identity.objectId,
      kind: object.identity.kind,
      contentHash: object.identity.contentHash,
      evidenceReality: object.evidenceReality,
      measurementQuality: object.measurement?.measurementQuality,
      correlation: object.extensions?.correlationMarkers ?? null,
      // proposal 3: freshness/provenance carried through to the Hub-facing compact payload
      sourceRepo: object.extensions?.provenance?.sourceRepo ?? null,
      sourceSha: object.extensions?.provenance?.sourceSha ?? null,
      indexedSha: object.extensions?.provenance?.indexedSha ?? null,
      publishedAt: generatedAt,
    })),
    relationships: relationships.map((edge) => ({
      relationshipId: edge.relationshipId,
      from: edge.from,
      to: edge.to,
      relationship: edge.relationship,
    })),
    writes: {
      lDrive: false,
      zDrive: false,
      supabase: mode === 'shared-dev-hub' ? 'SHARED_DEV_HUB_TARGET' : false,
    },
  };
}
