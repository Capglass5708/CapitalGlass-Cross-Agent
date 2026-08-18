import { buildRelationshipId, buildWorkPackageAnchorId } from './ids.mjs';
import { SEMANTIC_KINDS } from './semantic-classifier-v1.mjs';

function isSemanticObject(object) {
  return SEMANTIC_KINDS.includes(object.identity.kind);
}

export function buildSemanticRelationshipEdges({ ledger, derivedObjects, handoff, closeout }) {
  const edges = [];
  const workPackageAnchor = buildWorkPackageAnchorId(ledger.workPackageId);
  const semanticObjects = derivedObjects.filter(isSemanticObject);
  const failures = semanticObjects.filter((o) => o.identity.kind === 'FAILURE');
  const rootCauses = semanticObjects.filter((o) => o.identity.kind === 'ROOT_CAUSE');
  const remediations = semanticObjects.filter((o) => o.identity.kind === 'REMEDIATION');

  for (const object of semanticObjects) {
    edges.push({
      relationshipId: buildRelationshipId(object.identity.objectId, workPackageAnchor, 'OBSERVED_IN'),
      from: object.identity.objectId,
      to: workPackageAnchor,
      relationship: 'OBSERVED_IN',
      derivationVersion: ledger.derivationVersion,
      verificationState: object.extensions?.semantic?.verificationState ?? 'verified',
    });
    edges.push({
      relationshipId: buildRelationshipId(object.identity.objectId, ledger.closeoutHash, 'PROVEN_BY'),
      from: object.identity.objectId,
      to: ledger.closeoutHash,
      relationship: 'PROVEN_BY',
      derivationVersion: ledger.derivationVersion,
      verificationState: object.extensions?.semantic?.verificationState ?? 'verified',
    });
    const primaryRepo = closeout?.primaryRepo ?? handoff?.mission?.repo ?? null;
    if (primaryRepo) {
      const repoAnchor = `oi:repository:${primaryRepo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      edges.push({
        relationshipId: buildRelationshipId(object.identity.objectId, repoAnchor, 'ABOUT'),
        from: object.identity.objectId,
        to: repoAnchor,
        relationship: 'ABOUT',
        derivationVersion: ledger.derivationVersion,
        verificationState: object.extensions?.semantic?.verificationState ?? 'verified',
      });
    }
  }

  if (failures.length > 0 && rootCauses.length > 0) {
    edges.push({
      relationshipId: buildRelationshipId(failures[0].identity.objectId, rootCauses[0].identity.objectId, 'FAILED_BECAUSE_OF'),
      from: failures[0].identity.objectId,
      to: rootCauses[0].identity.objectId,
      relationship: 'FAILED_BECAUSE_OF',
      derivationVersion: ledger.derivationVersion,
      verificationState: 'inferred',
    });
  }
  if (rootCauses.length > 0 && remediations.length > 0) {
    edges.push({
      relationshipId: buildRelationshipId(rootCauses[0].identity.objectId, remediations[0].identity.objectId, 'CORRECTED_BY'),
      from: rootCauses[0].identity.objectId,
      to: remediations[0].identity.objectId,
      relationship: 'CORRECTED_BY',
      derivationVersion: ledger.derivationVersion,
      verificationState: 'inferred',
    });
  }

  const patterns = semanticObjects.filter((o) => o.identity.kind === 'SUCCESS_PATTERN');
  const capabilities = semanticObjects.filter((o) => o.identity.kind === 'CAPABILITY_SIGNAL');
  if (patterns.length > 0 && capabilities.length > 0) {
    edges.push({
      relationshipId: buildRelationshipId(patterns[0].identity.objectId, capabilities[0].identity.objectId, 'REINFORCES'),
      from: patterns[0].identity.objectId,
      to: capabilities[0].identity.objectId,
      relationship: 'REINFORCES',
      derivationVersion: ledger.derivationVersion,
      verificationState: 'verified',
    });
    edges.push({
      relationshipId: buildRelationshipId(capabilities[0].identity.objectId, patterns[0].identity.objectId, 'ENABLES'),
      from: capabilities[0].identity.objectId,
      to: patterns[0].identity.objectId,
      relationship: 'ENABLES',
      derivationVersion: ledger.derivationVersion,
      verificationState: 'inferred',
    });
  }

  const opportunities = semanticObjects.filter((o) => o.identity.kind === 'FUTURE_OPPORTUNITY');
  for (const opportunity of opportunities) {
    for (const capability of capabilities) {
      edges.push({
        relationshipId: buildRelationshipId(opportunity.identity.objectId, capability.identity.objectId, 'ENABLED_BY'),
        from: opportunity.identity.objectId,
        to: capability.identity.objectId,
        relationship: 'ENABLED_BY',
        derivationVersion: ledger.derivationVersion,
        verificationState: 'inferred',
      });
    }
  }

  return edges;
}

export function countSemanticGraphAttachment(derivedObjects, relationships) {
  const semanticIds = new Set(derivedObjects.filter(isSemanticObject).map((o) => o.identity.objectId));
  let attached = 0;
  let orphans = 0;
  for (const objectId of semanticIds) {
    const hasObserved = relationships.some((e) => e.from === objectId && e.relationship === 'OBSERVED_IN');
    const hasProven = relationships.some(
      (e) => e.from === objectId && (e.relationship === 'PROVEN_BY' || e.relationship === 'EVIDENCED_BY'),
    );
    if (hasObserved && hasProven) attached += 1;
    else orphans += 1;
  }
  return { attached, orphans, total: semanticIds.size };
}
