import fs from "node:fs";
import path from "node:path";

import { hashFileContent } from "./hash.mjs";
import { collectGitProtocolHashes } from "./z-mirror-authority-guard.mjs";
import { runPublicationCapabilityPreflight } from "./publication-capability-preflight.mjs";

function listSeedPacketIds(runDir) {
  const seedDir = path.join(runDir, "seed-packets");
  if (!fs.existsSync(seedDir)) return [];
  return fs
    .readdirSync(seedDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        const doc = JSON.parse(fs.readFileSync(path.join(seedDir, f), "utf8"));
        return doc.seedId ?? path.basename(f, ".json");
      } catch {
        return path.basename(f, ".json");
      }
    });
}

/**
 * Side-effect-free publication impact preview.
 */
export function buildPublicationDryRun({
  repoRoot,
  harvestId,
  hubRoot = "/mnt/l/Capital-Glass-Intelligence-Hub",
}) {
  const runDir = path.join(repoRoot, "artifacts/agent-runs", harvestId);
  const manifestPath = path.join(runDir, "harvest-manifest-v1.json");
  const capability = runPublicationCapabilityPreflight({ repoRoot, hubRoot });
  const protocolHashes = collectGitProtocolHashes(repoRoot);

  const report = {
    schemaVersion: "harvest-publication-dry-run-v1@1.0.0",
    harvestId,
    sourceCommitSha: null,
    plannedCreates: [],
    plannedUpdates: [],
    plannedDeletes: [],
    indexMutations: ["00-master-index/BY-KIND/thread-autopsy-index.json"],
    seedRegistrations: listSeedPacketIds(runDir),
    promptCandidates: [],
    supabaseProjection: {
      threadAutopsy: capability.capabilities.supabase === "AVAILABLE" ? "PLANNED" : "SKIPPED_OPTIONAL_UNAVAILABLE",
      harvestPrompts: capability.capabilities.supabase === "AVAILABLE" ? "PLANNED" : "SKIPPED_OPTIONAL_UNAVAILABLE",
    },
    zMirrorPlan: {
      direction: "git-to-z",
      waveSdlcSourceReady: capability.capabilities.zWaveSdlcSource === "AVAILABLE",
    },
    lPublicationPlan: {
      catalogRoot: "02-catalog/knowledge-objects/cross-agent-harvest",
      seedCount: listSeedPacketIds(runDir).length,
    },
    hotRoutingPlan: { layer: "c-hot-routing", optional: true },
    authorityWarnings: [],
    staleSources: [],
    expectedContentHashes: { gitProtocol: protocolHashes },
    requiredGateReadiness: {},
    optionalCapabilityReadiness: capability.capabilities,
    dryRunVerdict: "DRY_RUN_PASS",
  };

  if (!fs.existsSync(manifestPath)) {
    report.dryRunVerdict = "DRY_RUN_BLOCKED";
    report.authorityWarnings.push("harvest-manifest-v1.json missing");
    return report;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  report.sourceCommitSha = manifest.sourceCommitSha;

  const promptPath = path.join(runDir, "prompt-candidates.json");
  if (fs.existsSync(promptPath)) {
    const prompts = JSON.parse(fs.readFileSync(promptPath, "utf8"));
    report.promptCandidates = (prompts.candidates ?? []).map((c) => c.promptCandidateId);
  }

  if (capability.preflightVerdict === "PREFLIGHT_BLOCKED") {
    report.dryRunVerdict = "DRY_RUN_BLOCKED";
    report.authorityWarnings.push(...capability.blockers);
  }

  if (capability.capabilities.zWaveSdlcSource !== "AVAILABLE") {
    report.staleSources.push("Data-Extraction/docs/platform/CURSOR_HARVEST_INGEST_CLOSEOUT_WAVE_SDLC_V1.md");
    if (capability.capabilities.zDrive === "AVAILABLE") {
      report.dryRunVerdict = report.dryRunVerdict === "DRY_RUN_BLOCKED" ? "DRY_RUN_BLOCKED" : "DRY_RUN_WARN";
      report.authorityWarnings.push("WARN_OPTIONAL_Z_UNAVAILABLE");
    }
  }

  if (report.plannedDeletes.length > 0) {
    report.dryRunVerdict = "DRY_RUN_BLOCKED";
    report.authorityWarnings.push("BLOCK_DRY_RUN_DESTRUCTIVE");
  }

  for (const seedId of report.seedRegistrations) {
    report.plannedCreates.push(`02-catalog/knowledge-objects/cross-agent-harvest/${seedId}.json`);
  }

  return report;
}

export function assertDryRunSideEffectFree({ repoRoot, beforeHashes }) {
  const after = collectGitProtocolHashes(repoRoot);
  const regressions = [];
  for (const [name, before] of Object.entries(beforeHashes)) {
    const afterEntry = after[name];
    if (!afterEntry) {
      regressions.push({ file: name, issue: "deleted" });
      continue;
    }
    if (afterEntry.markers.laneCMentions < before.markers.laneCMentions) {
      regressions.push({ file: name, issue: "lane-c-regression", before: before.markers, after: afterEntry.markers });
    }
  }
  return { ok: regressions.length === 0, regressions };
}
