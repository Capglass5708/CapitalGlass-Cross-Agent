/**
 * W1 semantic classifier — project harvest/closeout fields into addressable semantic candidates.
 */
import { hashCanonicalJson } from '../../harvest/lib/hash.mjs';

export const SEMANTIC_CLASSIFIER_VERSION = 'semantic-classifier-v1@1.0.0';

export const SEMANTIC_KINDS = [
  'VERIFIED_TRUTH',
  'DECISION',
  'RESULT',
  'FAILURE',
  'ROOT_CAUSE',
  'REMEDIATION',
  'CORRECTION',
  'SUCCESS_PATTERN',
  'FASTER_PATH',
  'REPEATED_WORK',
  'BLOCKER',
  'RISK',
  'PROTOCOL_IMPROVEMENT',
  'CAPABILITY_SIGNAL',
  'FUTURE_OPPORTUNITY',
];

const SKIP_PATHS = new Set([
  'schemaVersion',
  'recordedAt',
  'generatedAt',
  'updatedAt',
  'evaluatedAt',
  'tokens',
  'tokenUsageReport',
  'executionContext',
  'reuseLineage',
  'aiCacheEvidence.receipts',
]);

function normalizeConceptKey(kind, sourcePath, claim) {
  const digest = hashCanonicalJson({ kind, sourcePath, claim });
  return `${kind.toLowerCase()}:${digest.slice(0, 20)}`;
}

function pushCandidate(candidates, seen, { kind, sourcePath, claim, material = true, verificationState = 'verified' }) {
  if (!SEMANTIC_KINDS.includes(kind)) return;
  if (!claim || (typeof claim === 'string' && claim.trim().length < 1)) return;
  const conceptKey = normalizeConceptKey(kind, sourcePath, claim);
  if (seen.has(conceptKey)) return;
  seen.add(conceptKey);
  candidates.push({
    kind,
    sourcePath,
    claim: typeof claim === 'string' ? claim : JSON.stringify(claim),
    conceptKey,
    material,
    verificationState,
  });
}

function classifyPathValue(path, value, candidates, seen) {
  if (SKIP_PATHS.has(path) || path.includes('.tokens.')) return;

  if (path === 'outcome' && typeof value === 'string') {
    pushCandidate(candidates, seen, { kind: 'RESULT', sourcePath: path, claim: value });
    if (value === 'PASS' || value === 'PROVEN') {
      pushCandidate(candidates, seen, { kind: 'VERIFIED_TRUTH', sourcePath: path, claim: `outcome:${value}` });
    }
    if (value === 'FAIL' || value === 'BLOCKED' || value === 'HOLD') {
      pushCandidate(candidates, seen, { kind: 'FAILURE', sourcePath: path, claim: value });
    }
    return;
  }

  if (path.endsWith('.proven') && value === true) {
    pushCandidate(candidates, seen, { kind: 'VERIFIED_TRUTH', sourcePath: path, claim: 'proven:true' });
  }
  if (path.endsWith('.allGatesPass') && value === true) {
    pushCandidate(candidates, seen, { kind: 'VERIFIED_TRUTH', sourcePath: path, claim: 'allGatesPass:true' });
  }
  if (path.endsWith('.decision') && typeof value === 'string') {
    pushCandidate(candidates, seen, { kind: 'DECISION', sourcePath: path, claim: value });
  }
  if (path.endsWith('.decisiveAnswer') && typeof value === 'string') {
    pushCandidate(candidates, seen, { kind: 'DECISION', sourcePath: path, claim: value });
  }
  if (path.endsWith('.terminalMilestone') && typeof value === 'string') {
    pushCandidate(candidates, seen, { kind: 'RESULT', sourcePath: path, claim: value });
  }
  if (path === 'task' && typeof value === 'string' && value.length >= 8) {
    pushCandidate(candidates, seen, { kind: 'RESULT', sourcePath: path, claim: value });
  }
  if (path === 'chatSummary' && typeof value === 'string' && value.length >= 20) {
    pushCandidate(candidates, seen, { kind: 'RESULT', sourcePath: path, claim: value.slice(0, 240) });
    if (/incident|root cause|FI-|failure/i.test(value)) {
      pushCandidate(candidates, seen, { kind: 'ROOT_CAUSE', sourcePath: path, claim: value.slice(0, 240) });
    }
    if (/next durable fix|nextAction|opportunity/i.test(value)) {
      pushCandidate(candidates, seen, { kind: 'FUTURE_OPPORTUNITY', sourcePath: path, claim: value.slice(0, 240) });
    }
  }
  if (path === 'cheapestRedo' && value) {
    const claim = typeof value === 'string' ? value : JSON.stringify(value);
    pushCandidate(candidates, seen, { kind: 'REMEDIATION', sourcePath: path, claim });
  }
  if (path === 'nextAction' || path.endsWith('nextAction')) {
    if (typeof value === 'string') pushCandidate(candidates, seen, { kind: 'FUTURE_OPPORTUNITY', sourcePath: path, claim: value });
    return;
  }
  if (path === 'cheapSingleAgentOk' || path.endsWith('.cheapSingleAgentOk')) {
    if (value === true) pushCandidate(candidates, seen, { kind: 'FASTER_PATH', sourcePath: path, claim: 'cheapSingleAgentOk:true' });
    return;
  }
  if (path === 'priorIntelligenceReused' || path.endsWith('.priorIntelligenceReused')) {
    if (value === true) pushCandidate(candidates, seen, { kind: 'SUCCESS_PATTERN', sourcePath: path, claim: 'priorIntelligenceReused:true' });
    return;
  }
  if (path === 'crossRepoReuseProven' || path.endsWith('.crossRepoReuseProven')) {
    if (value === true) pushCandidate(candidates, seen, { kind: 'SUCCESS_PATTERN', sourcePath: path, claim: 'crossRepoReuseProven:true' });
    return;
  }
  if (path === 'measuredWorkAvoided' || path.endsWith('.measuredWorkAvoided')) {
    if (value === true) pushCandidate(candidates, seen, { kind: 'FASTER_PATH', sourcePath: path, claim: 'measuredWorkAvoided:true' });
    return;
  }
  if (path === 'duplicateExternalEffects' || path.endsWith('.duplicateExternalEffects')) {
    if (typeof value === 'number' && value > 0) pushCandidate(candidates, seen, { kind: 'REPEATED_WORK', sourcePath: path, claim: String(value) });
    return;
  }
  if (
    path === 'falseReuseCount' ||
    path === 'authorityCollapseCount' ||
    path.endsWith('.falseReuseCount') ||
    path.endsWith('.authorityCollapseCount')
  ) {
    if (typeof value === 'number' && value > 0) pushCandidate(candidates, seen, { kind: 'RISK', sourcePath: path, claim: `${path}:${value}` });
    return;
  }
  if (path === 'failedGates' || path.endsWith('.failedGates')) {
    if (Array.isArray(value)) {
      for (const gate of value) {
        pushCandidate(candidates, seen, { kind: 'BLOCKER', sourcePath: path, claim: String(gate) });
        pushCandidate(candidates, seen, { kind: 'FAILURE', sourcePath: path, claim: String(gate) });
      }
    }
    return;
  }
  if (path === 'blockers' || path.endsWith('.blockers')) {
    if (Array.isArray(value)) {
      for (const blocker of value) {
        pushCandidate(candidates, seen, { kind: 'BLOCKER', sourcePath: path, claim: String(blocker) });
      }
    }
    return;
  }
  if (path.includes('correlation') && path.endsWith('.capabilityId') && typeof value === 'string') {
    pushCandidate(candidates, seen, { kind: 'CAPABILITY_SIGNAL', sourcePath: path, claim: value });
  }
  if (path === 'protocolVersion' || path.endsWith('.protocolVersion')) {
    if (typeof value === 'string') pushCandidate(candidates, seen, { kind: 'PROTOCOL_IMPROVEMENT', sourcePath: path, claim: value });
    return;
  }
  if (path === 'correction' || path.endsWith('.correction') || path.includes('Corrected')) {
    pushCandidate(candidates, seen, { kind: 'CORRECTION', sourcePath: path, claim: String(value) });
    return;
  }
}

function walkValue(value, path, candidates, seen, depth = 0) {
  if (depth > 8 || value === null || value === undefined) return;
  classifyPathValue(path, value, candidates, seen);
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length && i < 20; i += 1) {
      walkValue(value[i], `${path}[${i}]`, candidates, seen, depth + 1);
    }
    return;
  }
  if (typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      const childPath = path ? `${path}.${key}` : key;
      walkValue(child, childPath, candidates, seen, depth + 1);
    }
  }
}

export function classifySemanticCandidates(closeout) {
  const candidates = [];
  const seen = new Set();
  walkValue(closeout ?? {}, '', candidates, seen);
  return candidates;
}

export function inventorySemanticSources(closeout) {
  const candidates = classifySemanticCandidates(closeout);
  const byKind = {};
  for (const kind of SEMANTIC_KINDS) byKind[kind] = 0;
  for (const candidate of candidates) {
    byKind[candidate.kind] = (byKind[candidate.kind] ?? 0) + 1;
  }
  return {
    schema: 'w1-semantic-source-inventory-v1@1.0.0',
    classifierVersion: SEMANTIC_CLASSIFIER_VERSION,
    candidateCount: candidates.length,
    byKind,
    candidates,
  };
}

export function buildClassificationMatrix(missionResults) {
  return {
    schema: 'w1-semantic-classification-matrix-v1@1.0.0',
    classifierVersion: SEMANTIC_CLASSIFIER_VERSION,
    missionCount: missionResults.length,
    missions: missionResults.map((result) => ({
      missionId: result.missionId,
      materialCandidateCount: result.inventory.candidateCount,
      derivedSemanticCount: result.derivedSemanticCount,
      preservedCount: result.preservedCount,
      semanticPreservationRatio: result.semanticPreservationRatio,
      byKind: result.inventory.byKind,
    })),
  };
}

export function normalizeEvidenceToCloseout(evidence, workPackageId) {
  if (!evidence || typeof evidence !== 'object') {
    return {
      workPackageId,
      task: workPackageId,
      outcome: 'PASS',
      missionClass: 'fix',
      material: true,
    };
  }
  return {
    workPackageId,
    missionClass: evidence.missionClass ?? 'fix',
    material: evidence.material !== false,
    task: evidence.task ?? evidence.summary ?? evidence.decisiveQuestion ?? workPackageId,
    outcome: evidence.outcome ?? (evidence.proven === true ? 'PASS' : null),
  ...evidence,
  };
}
