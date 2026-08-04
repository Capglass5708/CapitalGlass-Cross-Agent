import { resolveHubRoot } from "./l-durable-bundle-lib.mjs";
import {
  createDefaultLDurablePublisher,
  createDefaultLayerVerifier,
  createDefaultOperationWriter,
  createDefaultSupabaseProjector,
  createDefaultZPublisher,
  runPhaseBPublication,
} from "./phase-b-publication-orchestrator-lib.mjs";

/**
 * Phase B v2 entry for harvest:publish-intelligence-full --pipeline=phase-b-v2.
 * Does not mutate Git or artifacts/agent-runs source trees.
 */
export function publishIntelligencePhaseB({
  harvestId,
  payloadHash,
  hubRoot = resolveHubRoot(),
  skipSupabase = false,
  zCacheRoot = null,
} = {}) {
  if (!payloadHash) {
    return {
      ok: false,
      phaseBVerdict: "PHASE_B_BLOCKED",
      errors: ["--payload-hash is required for phase-b-v2 pipeline"],
    };
  }

  const zOptions = zCacheRoot ? { zCacheRoot } : {};
  const supabaseOptions = skipSupabase ? { skipApply: true } : {};

  const result = runPhaseBPublication({
    hubRoot,
    harvestId,
    payloadHash,
    skipSupabase,
    lDurablePublisher: createDefaultLDurablePublisher(),
    zPublisher: createDefaultZPublisher(zOptions),
    supabaseProjector: createDefaultSupabaseProjector(supabaseOptions),
    layerVerifier: createDefaultLayerVerifier(),
    operationWriter: createDefaultOperationWriter(),
  });

  return {
    ...result,
    pipeline: "phase-b-v2",
    verdict: result.phaseBVerdict,
  };
}
