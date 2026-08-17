import { buildOperationalEnvelope } from './envelope-builder-v1.mjs';
import { projectCorrelationMarkersForEnvelope } from './correlation-markers-v1.mjs';

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

  return objects;
}
