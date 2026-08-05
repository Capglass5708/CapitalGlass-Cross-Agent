import fs from "node:fs";
import path from "node:path";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJsonAtomic(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temp = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temp, filePath);
}

/**
 * Sync Git do-not-advance-registry to L: BY-KIND/do-not-advance.json
 */
export function syncDoNotAdvanceToHub({ repoRoot, hubRoot }) {
  const registryPath = path.join(repoRoot, "work-progress/do-not-advance-registry.json");
  if (!fs.existsSync(registryPath)) {
    return { ok: false, errors: ["work-progress/do-not-advance-registry.json missing"] };
  }

  const registry = readJson(registryPath);
  const slice = {
    schemaVersion: registry.hubSliceSchema ?? "intelligence-hub-do-not-advance-slice-v1@1.0.0",
    updatedAt: new Date().toISOString(),
    sourceCommitSha: registry.sourceCommitSha ?? null,
    entryCount: registry.entries?.length ?? 0,
    entries: (registry.entries ?? []).map((e) => ({
      claimId: e.claimId,
      forbiddenUntil: e.forbiddenUntil,
      ownerRepo: e.ownerRepo,
      proofCommandIds: e.proofCommandIds ?? [],
    })),
  };

  const dest = path.join(hubRoot, "00-master-index/BY-KIND/do-not-advance.json");
  writeJsonAtomic(dest, slice);
  return { ok: true, path: dest, entryCount: slice.entryCount };
}

const LANE_ROW =
  "| Thread autopsy harvest | `BY-KIND/thread-autopsy-index.json` | Closeout autopsy, wrong-move patterns, duplicate-work prevention — **explicit retrieval only** |";

const LANE_MARKER = "**Preflight:** use only open-actions + blockers slices by default.";

/**
 * Register thread-autopsy-index in INDEX.json and AGENT_START_HERE.md on L:
 */
export function registerThreadAutopsyHubIndex({ hubRoot, gitHead }) {
  const errors = [];
  const masterIndexPath = path.join(hubRoot, "00-master-index/INDEX.json");
  const startHerePath = path.join(hubRoot, "00-master-index/AGENT_START_HERE.md");
  const sliceRel = "00-master-index/BY-KIND/thread-autopsy-index.json";
  const slicePath = path.join(hubRoot, sliceRel);

  if (!fs.existsSync(slicePath)) {
    writeJsonAtomic(slicePath, {
      schemaVersion: "intelligence-hub-thread-autopsy-index-slice-v1@1.0.0",
      sourceCommitSha: gitHead,
      updatedAt: new Date().toISOString(),
      harvestCount: 0,
      harvests: [],
      criticalSeedIds: [],
      retrievalHint:
        "Load individual seeds from 02-catalog/knowledge-objects/cross-agent-harvest/<seedId>.json",
    });
  }

  if (fs.existsSync(masterIndexPath)) {
    const index = readJson(masterIndexPath);
    index.activeWorkLedger = index.activeWorkLedger ?? { slices: {} };
    index.activeWorkLedger.slices = index.activeWorkLedger.slices ?? {};
    if (!index.activeWorkLedger.slices["thread-autopsy-index"]) {
      index.activeWorkLedger.slices["thread-autopsy-index"] = {
        path: sliceRel,
        sourcePath: "CapitalGlass-Cross-Agent/work-progress/harvest-packet-registry.json",
        explicitRetrievalOnly: true,
        generatedAt: new Date().toISOString(),
      };
      index.updatedAt = new Date().toISOString();
      writeJsonAtomic(masterIndexPath, index);
    }
  } else {
    errors.push(`INDEX.json missing at ${masterIndexPath}`);
  }

  if (fs.existsSync(startHerePath)) {
    let content = fs.readFileSync(startHerePath, "utf8");
    if (!content.includes("thread-autopsy-index.json")) {
      if (content.includes("| Host authority |")) {
        content = content.replace(
          "| Host authority |",
          `${LANE_ROW}\n| Host authority |`,
        );
      } else if (content.includes(LANE_MARKER)) {
        content = content.replace(LANE_MARKER, `${LANE_ROW}\n\n${LANE_MARKER}`);
      }
      fs.writeFileSync(startHerePath, content, "utf8");
    }
  } else {
    errors.push(`AGENT_START_HERE.md missing at ${startHerePath}`);
  }

  return { ok: errors.length === 0, errors, slicePath: sliceRel };
}

const PROMPT_HARVEST_LANE_ROW =
  "| Prompt harvest index | `BY-KIND/prompt-harvest-index.json` | Approved harvest prompt metadata (compact) — **explicit retrieval only** |";

/**
 * Merge per-harvest prompt-harvest-index-slice.json into L: BY-KIND aggregate.
 */
export function upsertPromptHarvestHubIndex({ repoRoot, hubRoot, harvestId, gitHead }) {
  const runSlicePath = path.join(
    repoRoot,
    "artifacts/agent-runs",
    harvestId,
    "prompt-harvest-index-slice.json",
  );
  if (!fs.existsSync(runSlicePath)) {
    return { ok: true, skipped: true, reason: "no-prompt-harvest-slice" };
  }

  const runSlice = readJson(runSlicePath);
  const indexRel = "00-master-index/BY-KIND/prompt-harvest-index.json";
  const indexPath = path.join(hubRoot, indexRel);

  let existing = {
    schemaVersion: "intelligence-hub-prompt-harvest-index-slice-v1@1.0.0",
    sourceCommitSha: gitHead,
    updatedAt: new Date().toISOString(),
    recordCount: 0,
    harvestIds: [],
    records: [],
    retrievalHint:
      "Compact approved prompt metadata only — load full bodies from PromptOps / git catalog delta",
  };
  if (fs.existsSync(indexPath)) {
    existing = { ...existing, ...readJson(indexPath) };
  }

  const byPromptId = new Map((existing.records ?? []).map((r) => [r.promptId, r]));
  for (const record of runSlice.records ?? []) {
    byPromptId.set(record.promptId, record);
  }

  const harvestIds = [...new Set([...(existing.harvestIds ?? []), harvestId])];
  const records = [...byPromptId.values()];

  const slice = {
    schemaVersion: "intelligence-hub-prompt-harvest-index-slice-v1@1.0.0",
    sourceCommitSha: gitHead,
    updatedAt: new Date().toISOString(),
    recordCount: records.length,
    harvestIds,
    records,
    retrievalHint: existing.retrievalHint,
  };
  writeJsonAtomic(indexPath, slice);
  return { ok: true, slicePath: indexRel, recordCount: records.length, harvestId };
}

/**
 * Register prompt-harvest-index in INDEX.json and AGENT_START_HERE.md on L:
 */
export function registerPromptHarvestHubIndex({ hubRoot, gitHead }) {
  const errors = [];
  const masterIndexPath = path.join(hubRoot, "00-master-index/INDEX.json");
  const startHerePath = path.join(hubRoot, "00-master-index/AGENT_START_HERE.md");
  const sliceRel = "00-master-index/BY-KIND/prompt-harvest-index.json";
  const slicePath = path.join(hubRoot, sliceRel);

  if (!fs.existsSync(slicePath)) {
    writeJsonAtomic(slicePath, {
      schemaVersion: "intelligence-hub-prompt-harvest-index-slice-v1@1.0.0",
      sourceCommitSha: gitHead,
      updatedAt: new Date().toISOString(),
      recordCount: 0,
      harvestIds: [],
      records: [],
      retrievalHint:
        "Compact approved prompt metadata only — load full bodies from PromptOps / git catalog delta",
    });
  }

  if (fs.existsSync(masterIndexPath)) {
    const index = readJson(masterIndexPath);
    index.activeWorkLedger = index.activeWorkLedger ?? { slices: {} };
    index.activeWorkLedger.slices = index.activeWorkLedger.slices ?? {};
    if (!index.activeWorkLedger.slices["prompt-harvest-index"]) {
      index.activeWorkLedger.slices["prompt-harvest-index"] = {
        path: sliceRel,
        sourcePath: "CapitalGlass-Cross-Agent/work-progress/harvest-prompt-catalog-delta.json",
        explicitRetrievalOnly: true,
        generatedAt: new Date().toISOString(),
      };
      index.updatedAt = new Date().toISOString();
      writeJsonAtomic(masterIndexPath, index);
    }
  } else {
    errors.push(`INDEX.json missing at ${masterIndexPath}`);
  }

  if (fs.existsSync(startHerePath)) {
    let content = fs.readFileSync(startHerePath, "utf8");
    if (!content.includes("prompt-harvest-index.json")) {
      if (content.includes("| Thread autopsy harvest |")) {
        content = content.replace(
          "| Thread autopsy harvest |",
          `${PROMPT_HARVEST_LANE_ROW}\n| Thread autopsy harvest |`,
        );
      } else if (content.includes(LANE_MARKER)) {
        content = content.replace(LANE_MARKER, `${PROMPT_HARVEST_LANE_ROW}\n\n${LANE_MARKER}`);
      }
      fs.writeFileSync(startHerePath, content, "utf8");
    }
  } else {
    errors.push(`AGENT_START_HERE.md missing at ${startHerePath}`);
  }

  return { ok: errors.length === 0, errors, slicePath: sliceRel };
}
