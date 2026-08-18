import { buildOperationalEnvelope } from './envelope-builder-v1.mjs';
import { projectCorrelationMarkersForEnvelope } from './correlation-markers-v1.mjs';
import {
  classifySemanticCandidates,
  SEMANTIC_KINDS,
} from './semantic-classifier-v1.mjs';

const OPERATIONAL_KINDS = ['MISSION_MEASUREMENT', 'RECEIPT_LEVERAGE_SIGNAL'];

export function buildSemanticDerivedObjects({
  ledger,
  handoff,
  closeout,
  evidenceReality,
  measurementQuality,
  generatedAt,
  correlationProjection,
}) {
  const candidates = classifySemanticCandidates(closeout);
  const objects = [];
  for (const candidate of candidates) {
    if (!SEMANTIC_KINDS.includes(candidate.kind)) continue;
    if (candidate.verificationState === 'verified' && candidate.kind === 'VERIFIED_TRUTH' && !candidate.claim) {
      continue;
    }
    const envelope = buildOperationalEnvelope({
      kind: candidate.kind,
      ledger,
      handoff,
      evidenceReality,
      measurementQuality,
      generatedAt,
      conceptKey: candidate.conceptKey,
      confidenceBasis: ['closeout-hash-verified', 'semantic-classifier-v1'],
      confidenceScore: candidate.verificationState === 'verified' ? 0.85 : 0.6,
      measurementMetrics: {
        sourcePath: candidate.sourcePath,
        conceptKey: candidate.conceptKey,
      },
      extensions: {
        semantic: {
          conceptKey: candidate.conceptKey,
          sourcePath: candidate.sourcePath,
          claim: candidate.claim,
          verificationState: candidate.verificationState,
          classificationVersion: 'semantic-classifier-v1@1.0.0',
        },
        ...(correlationProjection ? { correlationMarkers: correlationProjection } : {}),
      },
    });
    objects.push(envelope);
  }
  return { objects, candidates };
}

export function buildDerivedObjects({
  ledger,
  handoff,
  closeout,
  evidenceReality,
  measurementQuality,
  generatedAt = new Date().toISOString(),
}) {
  const objects = [];

  const correlationProjection = projectCorrelationMarkersForEnvelope(closeout?.correlation);

  const missionMeasurement = buildOperationalEnvelope({
    kind: 'MISSION_MEASUREMENT',
    ledger,
    handoff,
    evidenceReality,
    measurementQuality,
    generatedAt,
    measurementMetrics: {
      material: handoff.mission.material === true,
      missionClass: handoff.mission.missionClass,
      outcome: closeout?.outcome ?? null,
    },
    extensions: {
      missionSummary: {
        task: closeout?.task ?? null,
        outcome: closeout?.outcome ?? null,
        hostMode: closeout?.hostMode ?? null,
      },
      ...(correlationProjection ? { correlationMarkers: correlationProjection } : {}),
    },
  });
  objects.push(missionMeasurement);

  if (closeout?.aiCacheHit === true || closeout?.aiCacheEvidence?.cacheKeyHash || closeout?.bibleCache?.cacheKeyHash) {
    const receiptLeverage = buildOperationalEnvelope({
      kind: 'RECEIPT_LEVERAGE_SIGNAL',
      ledger,
      handoff,
      evidenceReality,
      measurementQuality: closeout?.aiCacheHit === true ? 'CACHE_VERIFIED' : measurementQuality,
      generatedAt,
      confidenceBasis: ['closeout-hash-verified', 'cache-evidence-present'],
      measurementMetrics: {
        aiCacheHit: closeout?.aiCacheHit ?? null,
        cacheKeyHash: closeout?.aiCacheEvidence?.cacheKeyHash ?? closeout?.bibleCache?.cacheKeyHash ?? null,
      },
      extensions: {
        reuseDecision: closeout?.bibleCache?.reuseDecision ?? null,
        ...(correlationProjection ? { correlationMarkers: correlationProjection } : {}),
      },
    });
    objects.push(receiptLeverage);
  }

  const semantic = buildSemanticDerivedObjects({
    ledger,
    handoff,
    closeout,
    evidenceReality,
    measurementQuality,
    generatedAt,
    correlationProjection,
  });
  objects.push(...semantic.objects);

  return objects;
}

export function measureSemanticPreservation(candidates, derivedObjects) {
  const semanticObjects = derivedObjects.filter((o) => SEMANTIC_KINDS.includes(o.identity.kind));
  const derivedKeys = new Set(
    semanticObjects.map((o) => o.extensions?.semantic?.conceptKey).filter(Boolean),
  );
  const material = candidates.filter((c) => c.material);
  const preserved = material.filter((c) => derivedKeys.has(c.conceptKey));
  return {
    materialCount: material.length,
    preservedCount: preserved.length,
    derivedSemanticCount: semanticObjects.length,
    semanticPreservationRatio: material.length > 0 ? preserved.length / material.length : 1,
    operationalKindsPreserved: OPERATIONAL_KINDS.every((kind) =>
      derivedObjects.some((o) => o.identity.kind === kind),
    ),
  };
}
