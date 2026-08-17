import { buildRelationshipId } from './ids.mjs';
import { buildCorrelationRelationshipEdges } from './correlation-markers-v1.mjs';

export function buildRelationshipEdges({ ledger, derivedObjects, closeout = null }) {
  const edges = [];
  for (const object of derivedObjects) {
    edges.push({
      relationshipId: buildRelationshipId(ledger.ledgerId, object.identity.objectId, 'PROJECTED_FROM'),
      from: ledger.ledgerId,
      to: object.identity.objectId,
      relationship: 'PROJECTED_FROM',
      derivationVersion: ledger.derivationVersion,
    });
    edges.push({
      relationshipId: buildRelationshipId(object.identity.objectId, ledger.ledgerId, 'DERIVED_FROM'),
      from: object.identity.objectId,
      to: ledger.ledgerId,
      relationship: 'DERIVED_FROM',
      derivationVersion: ledger.derivationVersion,
    });
    for (const evidenceRef of ledger.evidenceRefs ?? []) {
      edges.push({
        relationshipId: buildRelationshipId(object.identity.objectId, evidenceRef.contentHash, 'EVIDENCED_BY'),
        from: object.identity.objectId,
        to: evidenceRef.contentHash,
        relationship: 'EVIDENCED_BY',
        derivationVersion: ledger.derivationVersion,
      });
    }
  }
  edges.push(
    ...buildCorrelationRelationshipEdges({
      ledger,
      correlationBlock: closeout?.correlation ?? null,
      derivedObjects,
    }),
  );
  return edges;
}
