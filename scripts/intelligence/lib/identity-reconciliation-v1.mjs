/**
 * W2 — knowledge identity reconciliation via SAME_AS aliases (no ID migration).
 */
import { buildRelationshipId } from './ids.mjs';
import { DERIVATION_VERSION } from './constants.mjs';

export function buildPreferredObjectId(object) {
  return object.identity.objectId;
}

export function buildLegacyAliasId(legacyKey) {
  return `intel:${String(legacyKey).replace(/[^a-zA-Z0-9:_-]/g, '-')}`;
}

export function reconcileSemanticIdentities({ derivedObjects, ledger }) {
  const semanticObjects = derivedObjects.filter((o) => o.extensions?.semantic?.conceptKey);
  const byConcept = new Map();
  const aliases = [];
  const edges = [];
  let duplicateNodesPrevented = 0;

  for (const object of semanticObjects) {
    const conceptKey = object.extensions.semantic.conceptKey;
    const preferred = byConcept.get(conceptKey);
    if (!preferred) {
      byConcept.set(conceptKey, object);
      continue;
    }
    duplicateNodesPrevented += 1;
    const legacyId = buildLegacyAliasId(conceptKey);
    aliases.push({
      legacyId,
      preferredObjectId: buildPreferredObjectId(preferred),
      conceptKey,
      relationship: 'SAME_AS',
    });
    edges.push({
      relationshipId: buildRelationshipId(legacyId, preferred.identity.objectId, 'SAME_AS'),
      from: legacyId,
      to: preferred.identity.objectId,
      relationship: 'SAME_AS',
      derivationVersion: ledger.derivationVersion,
      verificationState: 'verified',
    });
    edges.push({
      relationshipId: buildRelationshipId(legacyId, `kce:unit:${conceptKey}`, 'PROJECTS_TO'),
      from: legacyId,
      to: `kce:unit:${conceptKey}`,
      relationship: 'PROJECTS_TO',
      derivationVersion: ledger.derivationVersion,
      verificationState: 'inferred',
    });
  }

  return {
    schema: 'knowledge-identity-reconciliation-v1@1.0.0',
    reconciliationVersion: DERIVATION_VERSION,
    aliasCount: aliases.length,
    duplicateNodesPrevented,
    historicalIdResolution: aliases.length === 0 || aliases.every((a) => a.preferredObjectId),
    aliases,
    edges,
    uniqueSemanticObjects: [...byConcept.values()],
  };
}
