import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { bundleLayout } from "./l-durable-bundle-lib.mjs";
import { phaseBOperationsDir } from "./publication-pointer-candidate-lib.mjs";
import { resolveAppBuilderRoot } from "../../index/lib/resolve-repo-roots.mjs";

export const SUPABASE_PROJECTION_RECEIPT_SCHEMA = "harvest-supabase-projection-receipt-v1@1.0.0";
export const PROJECTION_INPUT_SCHEMA = "harvest-supabase-projection-input-v1@1.0.0";
export const PROJECTION_INPUT_FILENAME = "harvest-supabase-projection-input-v1.json";

/**
 * CG_CROSS_AGENT_SEED_MIGRATION_V1 retired the AppBuilder snapshot projection
 * (coordination.cross_agent_harvest_snapshots). It duplicated the Hub cross-agent-harvest domain and
 * nothing read it; seeds now reach agents through CG-AppBuilder-MCP's cross-agent-harvest producer
 * (Hub seed verified against Git → harvest package → Hub harvest object → startup packet). The layer
 * is reported NOT_REQUIRED with an explicit verdict so Phase B neither invokes the retired route nor
 * degrades because of it.
 */
export const SNAPSHOT_ROUTE_RETIRED = Object.freeze({
  ok: true,
  status: "NOT_REQUIRED",
  verdict: "SUPABASE_SNAPSHOT_ROUTE_RETIRED",
  retiredBy: "cg-cross-agent-seed-migration-v1",
  canonicalRoute: "CG-AppBuilder-MCP: npm run compounding:cross-agent-producer",
});

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function listJsonBasenames(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.replace(/\.json$/, ""));
}

/**
 * Build compact projection input from L: durable bundle metadata only.
 * Does not read Cross-Agent Git worktree harvest directories.
 */
export function buildCompactProjectionInput(hubRoot, context, phaseBVerdict = "PHASE_B_COMPLETE") {
  const layout = bundleLayout(hubRoot, context.harvestId, context.payloadHash);
  const payloadRoot = path.join(layout.catalogRoot, "payload");
  const manifestPath = path.join(payloadRoot, "harvest-manifest-v1.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error("MISSING_L_DURABLE_MANIFEST");
  }

  const manifest = readJson(manifestPath);
  const bundlePath = path.join(payloadRoot, "thread-autopsy-bundle.json");
  const bundle = fs.existsSync(bundlePath) ? readJson(bundlePath) : null;

  const packetIds = (manifest.packets ?? []).map((packet) => packet.packetId).filter(Boolean);
  const ownerRepos = [
    ...new Set((manifest.packets ?? []).map((packet) => packet.ownerRepo).filter(Boolean)),
  ];
  const seedIds = listJsonBasenames(path.join(payloadRoot, "seed-packets"));

  return {
    schemaVersion: PROJECTION_INPUT_SCHEMA,
    harvestId: context.harvestId,
    manifestHash: context.manifestHash,
    payloadHash: context.payloadHash,
    authoritySourceCommit: context.authoritySourceCommit,
    lDurablePath: context.durablePath,
    phaseBVerdict,
    harvestTier: context.harvestTier ?? manifest.threadAutopsy?.tier ?? "T1",
    retrievalEligible: context.retrievalEligible ?? true,
    aiCacheEligible: context.aiCacheEligible ?? false,
    subject:
      manifest.packets?.[0]?.packetTitle ??
      bundle?.roiBacklog?.[0]?.title ??
      context.harvestId,
    ownerRepos,
    packetIds,
    seedIds,
    blockerCount: bundle?.doNotAdvanceMap?.length ?? 0,
    openActionCount: bundle?.roiBacklog?.length ?? 0,
    compactSummary: {
      tier: context.harvestTier ?? manifest.threadAutopsy?.tier ?? "T1",
      packetCount: packetIds.length,
      seedCount: seedIds.length,
      wasteLedgerStatus: bundle?.wasteLedgerStatus ?? null,
    },
    supersedes: context.supersedes ?? [],
    generatedAt: new Date().toISOString(),
  };
}

export function writeProjectionInputToOperations(hubRoot, harvestId, payloadHash, input) {
  const ops = phaseBOperationsDir(hubRoot, harvestId, payloadHash);
  const inputPath = path.join(ops.dir, PROJECTION_INPUT_FILENAME);
  writeJson(inputPath, input);
  return {
    inputPath,
    inputRel: path.relative(hubRoot, inputPath).replace(/\\/g, "/"),
  };
}

function mapProjectorVerdict(receipt) {
  switch (receipt.verdict) {
    case "ROUTE_RETIRED":
      return { ...SNAPSHOT_ROUTE_RETIRED };
    case "PROJECTION_INSERTED":
    case "PROJECTION_SUPERSEDED":
      return {
        ok: true,
        status: "IN_SYNC",
        verdict: receipt.verdict,
      };
    case "NOOP_CURRENT":
    case "DRY_RUN_PASS":
      return {
        ok: true,
        status: "NOOP_CURRENT",
        verdict: "NOOP_CURRENT",
      };
    case "BLOCKED_PROJECTION_IDENTITY_CONFLICT":
      return {
        ok: false,
        status: "BLOCKED_IDENTITY_CONFLICT",
        verdict: receipt.verdict,
      };
    case "BLOCKED_SUPABASE_PAYLOAD_DUPLICATION":
    case "BLOCKED_OPERATOR_APPROVAL":
      return {
        ok: false,
        status: "FAILED_REQUIRED",
        verdict: receipt.verdict,
      };
    default:
      return {
        ok: false,
        status: "FAILED_REQUIRED",
        verdict: receipt.verdict ?? "SUPABASE_PROJECTION_FAIL",
        error: receipt.error,
      };
  }
}

export function invokeAppBuilderProjector({
  inputPath,
  apply = true,
  appBuilderRoot = null,
  crossAgentRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.."),
  useMemoryStore = true,
  memoryStoreFile = null,
} = {}) {
  const builderRoot = appBuilderRoot ?? resolveAppBuilderRoot(crossAgentRoot);
  const projectorPath = path.join(
    builderRoot,
    "scripts/cross-agent-harvest-projection/project-harvest-snapshot.mjs",
  );
  if (!fs.existsSync(projectorPath)) {
    throw new Error(`MISSING_APPBUILDER_PROJECTOR:${projectorPath}`);
  }

  const args = [
    projectorPath,
    `--input=${inputPath}`,
    "--json",
    ...(apply ? ["--apply"] : []),
    ...(memoryStoreFile
      ? [`--memory-store-file=${memoryStoreFile}`]
      : useMemoryStore
        ? ["--memory-store"]
        : []),
  ];

  const proc = spawnSync("node", args, {
    cwd: builderRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      CROSS_AGENT_HARVEST_PROJECTION_APPROVED: apply ? "1" : "0",
      ...(useMemoryStore ? { CROSS_AGENT_HARVEST_PROJECTION_USE_MEMORY: "1" } : {}),
    },
  });

  if (!proc.stdout?.trim()) {
    return {
      ok: false,
      status: "FAILED_REQUIRED",
      verdict: "SUPABASE_PROJECTION_FAIL",
      error: proc.stderr?.trim() || "empty_projector_output",
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(proc.stdout.trim());
  } catch (error) {
    return {
      ok: false,
      status: "FAILED_REQUIRED",
      verdict: "SUPABASE_PROJECTION_FAIL",
      error: `invalid_projector_json:${error.message}`,
    };
  }

  const receipt = parsed.receipt ?? parsed;
  const mapped = mapProjectorVerdict(receipt);
  return {
    ...mapped,
    sourcePayloadHash: receipt.payloadHash,
    receipt,
    projectorExitCode: proc.status,
  };
}

/**
 * Supabase compact projection layer for Phase B. An injected projector is still honoured (layer-policy
 * tests); the default AppBuilder snapshot route is retired — see SNAPSHOT_ROUTE_RETIRED.
 */
export function applySupabaseProjection(context, options = {}) {
  if (options.skipApply) {
    return {
      ok: true,
      status: "SKIPPED",
      verdict: "SUPABASE_SKIPPED",
      skipReason: "skip-supabase",
    };
  }

  if (options.simulateFailure) {
    return {
      ok: false,
      status: "FAILED_REQUIRED",
      verdict: "SUPABASE_PROJECTION_FAIL",
      error: options.simulateFailure,
    };
  }

  if (options.projector) {
    const input = options.buildInput
      ? options.buildInput(context)
      : buildCompactProjectionInput(options.hubRoot, context, options.phaseBVerdict);
    const inputWrite = writeProjectionInputToOperations(
      options.hubRoot,
      context.harvestId,
      context.payloadHash,
      input,
    );
    const result = options.projector({ input, inputPath: inputWrite.inputPath, context });
    if (result.payloadHash && result.payloadHash !== context.payloadHash) {
      return {
        ok: false,
        status: "FAILED_REQUIRED",
        verdict: "SUPABASE_PROJECTION_FAIL",
        error: "payload_hash_mismatch",
      };
    }
    return result;
  }

  // The default route was the AppBuilder snapshot projector, which is retired: nothing is written.
  return { ...SNAPSHOT_ROUTE_RETIRED };
}

export function clearSupabaseProjectionMemory() {
  // Wave 4 uses AppBuilder memory store; kept for test compatibility.
}
