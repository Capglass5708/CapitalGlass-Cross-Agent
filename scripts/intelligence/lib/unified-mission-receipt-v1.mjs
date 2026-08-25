/**
 * Builds the single end-to-end mission receipt Wesley specified, from real
 * preflight + goldmine outputs (contracts/intelligence/unified-mission-receipt-v1.schema.json).
 * Fields this repo can populate for real (preflight, aiCache, lHub,
 * supabaseProjection diagnostic, goldmine, graphDividend, newNodes,
 * relationshipsReinforced) come from actual code that ran in this process.
 * waverunner and cacheRefresh are owned by systems outside this repo's
 * access -- always NOT_YET_INTEGRATED unless a caller supplies real evidence,
 * never inferred or defaulted to a success value.
 */
import fs from 'node:fs';
import path from 'node:path';

export const UNIFIED_RECEIPT_SCHEMA = 'unified-mission-receipt-v1@1.0.0';

export function buildUnifiedMissionReceipt({
  mission,
  preflightResult,
  preflightReceiptPath = null,
  goldmineReceipt = null,
  waverunner = null,
  cacheRefresh = null,
} = {}) {
  if (!preflightResult) {
    throw new Error('buildUnifiedMissionReceipt requires a real preflightResult from runIntelligencePreflight()');
  }

  const cacheLane = preflightResult.laneChecks?.find((l) => l.plane === 'HOT_AI_CACHE') ?? null;
  const lHubLane = preflightResult.laneChecks?.find((l) => l.plane === 'L_DRIVE') ?? null;
  const supabaseLane = preflightResult.laneChecks?.find((l) => l.plane === 'SUPABASE') ?? null;

  return {
    schema: UNIFIED_RECEIPT_SCHEMA,
    generatedAt: new Date().toISOString(),
    mission: mission ?? preflightResult.mission ?? 'unspecified',
    preflight: preflightResult.outcome === 'ALL_HUB_PLANES_UNAVAILABLE' ? 'FAIL' : 'PASS',
    aiCache: cacheLane?.cacheStatus ?? 'CACHE_ROOT_UNAVAILABLE',
    // A null lane means the ladder short-circuited before this plane was
    // ever probed (e.g. a fresh hot-cache hit) -- that must read NOT_CHECKED,
    // never UNAVAILABLE, which would falsely claim the plane was tried and failed.
    lHub: !lHubLane ? 'NOT_CHECKED' : lHubLane.available ? 'VERIFIED' : 'UNAVAILABLE',
    supabaseProjection: !supabaseLane ? 'NOT_CHECKED' : supabaseLane.available ? 'CURRENT' : 'UNAVAILABLE',
    waverunner: waverunner ?? 'NOT_YET_INTEGRATED',
    goldmine: goldmineReceipt?.verdict ?? 'NOT_RUN',
    graphDividend: goldmineReceipt?.graphDividend ?? 'NOT_RUN',
    newNodes: goldmineReceipt?.newKnowledgeNodes ?? 0,
    relationshipsReinforced: goldmineReceipt?.relationshipsReinforced ?? 0,
    cacheRefresh: cacheRefresh ?? 'NOT_YET_INTEGRATED',
    preflightReceiptPath,
    goldmineReceiptPath: goldmineReceipt?.receiptPath ?? null,
  };
}

export function writeUnifiedMissionReceipt(receipt, outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });
  const stamp = receipt.generatedAt.replace(/[:.]/g, '-');
  const receiptPath = path.join(outputDir, `unified-mission-receipt-${stamp}.json`);
  fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  return receiptPath;
}
