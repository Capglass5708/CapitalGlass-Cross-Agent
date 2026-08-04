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
      CROSS_AGENT_HARVEST_PROJECTION_USE_MEMORY: useMemoryStore ? "1" : "0",
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
 * Apply compact Supabase projection via AppBuilder snapshot projector.
 * Reads durable context from L: only — never the live Cross-Agent worktree.
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

  if (!options.hubRoot) {
    throw new Error("MISSING_HUB_ROOT_FOR_SUPABASE_PROJECTION");
  }

  const input = buildCompactProjectionInput(
    options.hubRoot,
    context,
    options.phaseBVerdict ?? "PHASE_B_IN_PROGRESS",
  );
  const inputWrite = writeProjectionInputToOperations(
    options.hubRoot,
    context.harvestId,
    context.payloadHash,
    input,
  );
  const memoryStoreFile =
    options.memoryStoreFile ??
    (options.useMemoryStore !== false
      ? path.join(inputWrite.inputPath, "..", "projection-memory-store.json")
      : null);

  const result = invokeAppBuilderProjector({
    inputPath: inputWrite.inputPath,
    apply: options.apply !== false,
    appBuilderRoot: options.appBuilderRoot,
    crossAgentRoot: options.crossAgentRoot,
    useMemoryStore: options.useMemoryStore !== false && !memoryStoreFile,
    memoryStoreFile,
  });

  if (result.receipt?.payloadHash && result.receipt.payloadHash !== context.payloadHash) {
    return {
      ok: false,
      status: "FAILED_REQUIRED",
      verdict: "SUPABASE_PROJECTION_FAIL",
      error: "payload_hash_mismatch",
      inputPath: inputWrite.inputPath,
    };
  }

  return {
    ...result,
    inputPath: inputWrite.inputPath,
    inputRel: inputWrite.inputRel,
    payload: input,
  };
}

export function clearSupabaseProjectionMemory() {
  // Wave 4 uses AppBuilder memory store; kept for test compatibility.
}
