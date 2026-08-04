export const SUPABASE_PROJECTION_RECEIPT_SCHEMA = "harvest-supabase-projection-receipt-v1@1.0.0";

/**
 * Build compact Supabase projection payload — no autopsy bodies, seed packets, or QA indexes.
 */
export function projectHarvestPointer(context) {
  const {
    harvestId,
    manifestHash,
    payloadHash,
    authoritySourceCommit,
    durablePath,
    phaseBStatus,
    retrievalEligible,
    aiCacheEligible,
  } = context;

  return {
    schemaVersion: "harvest-supabase-pointer-projection-v1@1.0.0",
    harvestId,
    manifestHash,
    payloadHash,
    authoritySourceCommit,
    lDurablePath: durablePath,
    phaseBStatus: phaseBStatus ?? "PHASE_B_PENDING",
    retrievalEligible: retrievalEligible ?? false,
    aiCacheEligible: aiCacheEligible ?? false,
    projectedAt: new Date().toISOString(),
  };
}

const projectionMemory = new Map();

function projectionKey(harvestId, payloadHash) {
  return `${harvestId}::${payloadHash}`;
}

/**
 * Apply compact Supabase projection. Wave 3 uses in-memory store for tests;
 * live apply remains feature-gated until Wave 4 snapshot ingest.
 */
export function applySupabaseProjection(context, options = {}) {
  const payload = projectHarvestPointer(context);

  if (options.skipApply) {
    return {
      ok: true,
      status: "SKIPPED",
      verdict: "SUPABASE_SKIPPED",
      skipReason: "skip-supabase",
      payload,
    };
  }

  if (options.simulateFailure) {
    return {
      ok: false,
      status: "FAILED_REQUIRED",
      verdict: "SUPABASE_PROJECTION_FAIL",
      error: options.simulateFailure,
      payload,
    };
  }

  const key = projectionKey(context.harvestId, context.payloadHash);
  const existing = options.store?.get(key) ?? projectionMemory.get(key);

  if (existing && existing.payloadHash === context.payloadHash) {
    return {
      ok: true,
      status: "NOOP_CURRENT",
      verdict: "NOOP_CURRENT",
      sourcePayloadHash: context.payloadHash,
      payload: existing,
    };
  }

  const store = options.store ?? projectionMemory;
  store.set(key, payload);

  return {
    ok: true,
    status: "IN_SYNC",
    verdict: "SUPABASE_PROJECTION_PASS",
    sourcePayloadHash: context.payloadHash,
    payload,
  };
}

export function clearSupabaseProjectionMemory() {
  projectionMemory.clear();
}
