/**
 * W4 — material missions must emit graph dividend (semantic nodes + attachment edges).
 */
import { SEMANTIC_KINDS } from './semantic-classifier-v1.mjs';
import { countSemanticGraphAttachment } from './semantic-relationship-builder-v1.mjs';

export function evaluateGraphDividendGate({ handoff, derivedObjects, relationships }) {
  const material = handoff?.mission?.material === true;
  if (!material) {
    return { required: false, pass: true, milestone: 'GRAPH_DIVIDEND_NOT_REQUIRED' };
  }

  const semanticObjects = derivedObjects.filter((o) => SEMANTIC_KINDS.includes(o.identity.kind));
  const attachment = countSemanticGraphAttachment(derivedObjects, relationships);
  const pass = semanticObjects.length > 0 && attachment.orphans === 0 && attachment.attached === attachment.total;

  return {
    required: true,
    pass,
    milestone: pass ? 'MATERIAL_WORK_INTELLIGENCE_DIVIDEND_ENFORCED_V1_PASS' : 'MATERIAL_WORK_INTELLIGENCE_DIVIDEND_V1_HOLD',
    semanticObjectCount: semanticObjects.length,
    graphAttachment: attachment,
    blockers: pass ? [] : ['SEMANTIC_OBJECTS_MISSING', 'GRAPH_ATTACHMENT_INCOMPLETE'].filter((code) => {
      if (code === 'SEMANTIC_OBJECTS_MISSING') return semanticObjects.length === 0;
      return attachment.orphans > 0;
    }),
  };
}

export function buildGraphDeltaReceipt({
  missionId,
  workPackageId,
  baselineNodes = 184,
  baselineEdges = 302,
  derivedObjects,
  relationships,
  reconciliation = null,
  semanticPreservationRatio = 1,
}) {
  const semanticObjects = derivedObjects.filter((o) => SEMANTIC_KINDS.includes(o.identity.kind));
  const evidenceEdges = relationships.filter((e) =>
    ['PROVEN_BY', 'EVIDENCED_BY'].includes(e.relationship),
  ).length;
  const missionEdges = relationships.filter((e) => e.relationship === 'OBSERVED_IN').length;

  return {
    schema: 'graph-delta-receipt-v1@1.0.0',
    missionId,
    workPackageId,
    recordedAt: new Date().toISOString(),
    baselineNodes,
    baselineEdges,
    nodesCreated: semanticObjects.length,
    nodesReinforced: reconciliation?.duplicateNodesPrevented ?? 0,
    nodesCorrected: 0,
    nodesSuperseded: 0,
    semanticNodesCreated: semanticObjects.length,
    edgesCreated: relationships.length,
    evidenceEdgesCreated: evidenceEdges,
    missionEdgesCreated: missionEdges,
    structuralEdgesCreated: relationships.filter((e) => e.relationship === 'PROJECTED_FROM').length,
    utilizationEdgesCreated: 0,
    duplicateNodesPrevented: reconciliation?.duplicateNodesPrevented ?? 0,
    conflictsDetected: 0,
    orphanNodesCreated: countSemanticGraphAttachment(derivedObjects, relationships).orphans,
    inferredRelationships: relationships.filter((e) => e.verificationState === 'inferred').length,
    verifiedRelationships: relationships.filter((e) => e.verificationState !== 'inferred').length,
    semanticPreservationRatio,
  };
}
