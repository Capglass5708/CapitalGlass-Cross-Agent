import { inferHarvestTier } from "./publication-identity-lib.mjs";
import { PHASE_B_VERDICTS } from "./publication-layer-verdict-lib.mjs";

export const REQUIRED_LAYER_VERDICTS = {
  OPERATIONAL: "HARVEST_PUBLICATION_AUTHORITY_OPERATIONAL",
  DEGRADED: "HARVEST_DURABLE_DERIVED_DEGRADED",
  PHASE_B_DEGRADED: "PHASE_B_DEGRADED",
  BLOCKED: "HARVEST_PUBLICATION_FAILED",
  NOOP: "NOOP_CURRENT",
};

const TIER_LAYER_POLICY = {
  T0: { l: false, supabase: false, z: false, ledger: false, retrieval: false },
  T1: { l: true, supabase: true, z: false, ledger: true, retrieval: false },
  T2: { l: true, supabase: true, z: true, ledger: true, retrieval: true },
  T3: { l: true, supabase: true, z: true, ledger: true, retrieval: true },
};

export function getRequiredLayerPolicy(manifest) {
  const tier = inferHarvestTier(manifest);
  return { tier, layers: TIER_LAYER_POLICY[tier] ?? TIER_LAYER_POLICY.T1 };
}

/**
 * Compute legacy-path operational verdict — never unqualified OPERATIONAL when required layer skipped.
 */
export function computeLegacyPublicationVerdict({
  manifest,
  skipLedgerSync = false,
  skipSupabaseProjection = false,
  lPublishOk = true,
  hubPublishOk = true,
  supabaseProjection = null,
  allNoop = false,
}) {
  const { tier, layers } = getRequiredLayerPolicy(manifest);

  if (allNoop) {
    return { ok: true, verdict: REQUIRED_LAYER_VERDICTS.NOOP, tier };
  }

  if (!lPublishOk || !hubPublishOk) {
    return { ok: false, verdict: REQUIRED_LAYER_VERDICTS.BLOCKED, tier };
  }

  const degradedReasons = [];

  if (layers.ledger && skipLedgerSync) {
    degradedReasons.push("SKIPPED_REQUIRED:ledger_sync");
  }
  if (layers.supabase && skipSupabaseProjection) {
    degradedReasons.push("SKIPPED_REQUIRED:supabase_projection");
  }
  if (layers.supabase && supabaseProjection?.ok === false) {
    degradedReasons.push("FAILED_REQUIRED:supabase_projection");
  }

  if (degradedReasons.length > 0) {
    return {
      ok: true,
      degraded: true,
      verdict:
        tier === "T3"
          ? REQUIRED_LAYER_VERDICTS.BLOCKED
          : REQUIRED_LAYER_VERDICTS.DEGRADED,
      phaseBVerdict: PHASE_B_VERDICTS.DEGRADED,
      tier,
      degradedReasons,
      allowOperationalReceipt: false,
    };
  }

  return {
    ok: true,
    degraded: false,
    verdict: REQUIRED_LAYER_VERDICTS.OPERATIONAL,
    phaseBVerdict: PHASE_B_VERDICTS.COMPLETE,
    tier,
    allowOperationalReceipt: true,
  };
}
