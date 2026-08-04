import fs from "node:fs";
import path from "node:path";

import { hashCanonicalJson } from "./hash.mjs";

const SEED_BLOCK_RE = /```json\s*\n([\s\S]*?"seedId"[\s\S]*?)\n```/g;

function readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function extractSeedPackets(markdown) {
  const seeds = [];
  let match;
  while ((match = SEED_BLOCK_RE.exec(markdown)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.seedId && parsed.schemaVersion?.includes("harvest-seed-packet")) {
        seeds.push(parsed);
      }
    } catch {
      // skip invalid blocks
    }
  }
  return seeds;
}

function extractSectionTableRows(markdown, sectionHeading) {
  const re = new RegExp(
    `##+ ${sectionHeading}[\\s\\S]*?\\n\\|[^\\n]+\\|\\n\\|[-| ]+\\|\\n([\\s\\S]*?)(?=\\n##|$)`,
    "i",
  );
  const m = markdown.match(re);
  if (!m) return [];
  return m[1]
    .trim()
    .split("\n")
    .filter((line) => line.startsWith("|"))
    .map((line) => line.split("|").map((c) => c.trim()).filter(Boolean));
}

function parseSummaryVerdict(markdown) {
  const tier = markdown.match(/Tier:\s*`?(T[0-3])`?/i)?.[1] ?? "T2";
  const verdict =
    markdown.match(/VERDICT:\s*([A-Z_]+)/i)?.[1] ?? "DRAFT_READY_FOR_CURSOR_VALIDATION";
  return { tier, verdict };
}

function buildThreadEventInventory(markdown) {
  const rows = extractSectionTableRows(markdown, "3\\. Thread Event Inventory");
  return rows.map((cols) => ({
    eventId: cols[0],
    description: cols[1],
    actor: cols[2],
    evidenceRefs: [cols[3]].filter(Boolean),
    stateChange: cols[4] ?? "",
  }));
}

function buildWasteLedger(markdown) {
  const rows = extractSectionTableRows(markdown, "6\\. Waste Ledger");
  return rows.map((cols) => ({
    wasteId: cols[0],
    type: cols[1]?.replace(/`/g, "") ?? "context",
    description: cols[2],
    evidenceRefs: [cols[3]].filter(Boolean),
    savedBy: cols[4],
    estimatedImpact: (cols[5] ?? "medium").toLowerCase(),
    roiRank: null,
  }));
}

function buildOperatorFriction(markdown) {
  const rows = extractSectionTableRows(markdown, "8\\. Operator Friction");
  return rows.map((cols) => ({
    frictionId: cols[0],
    trigger: cols[1],
    operatorCost: (cols[2] ?? "medium").toLowerCase(),
    systemFix: cols[3],
    evidenceRefs: [cols[4]].filter(Boolean),
    linkedWasteIds: [],
  }));
}

function buildDuplicateWork(markdown) {
  const rows = extractSectionTableRows(markdown, "7\\. Duplication Detector");
  return rows.map((cols) => ({
    duplicateId: cols[0],
    subject: cols[1],
    whyRepeated: cols[2],
    firstKnownInstance: cols[2],
    priorIndexSlice: "BY-KIND/thread-autopsy-index.json",
    whyMissed: cols[3],
    avoidableBy: cols[4],
    recommendedAction: cols[4],
  }));
}

function buildRoiBacklog(markdown) {
  const rows = extractSectionTableRows(markdown, "9\\. ROI Backlog");
  return rows
    .filter((cols) => /^\d+$/.test(cols[0]))
    .map((cols) => ({
      rank: Number(cols[0]),
      title: cols[1],
      whyItPays: cols[2],
      effort: (cols[3] ?? "medium").toLowerCase(),
      savedWasteIds: [],
      seedAs: "protocol-upgrade",
    }));
}

function buildExecutionDeltas(markdown) {
  const rows = extractSectionTableRows(markdown, "5\\. Execution Deltas");
  return rows.map((cols) => ({
    executionDeltaId: cols[0],
    situation: cols[1],
    actualExecution: { steps: [cols[2]], outcome: "FAIL" },
    optimalExecution: { steps: [cols[3]], outcome: "Would improve" },
    deltaCost: {
      time: "medium",
      tokens: "medium",
      operatorFrustration: (cols[5] ?? "").includes("high") ? "high" : "medium",
    },
    preventiveControl: cols[4],
  }));
}

function buildDoNotAdvanceMap(markdown) {
  const rows = extractSectionTableRows(markdown, "10\\. Do-Not-Advance Guards");
  return rows.map((cols) => ({
    awardOrVerdict: cols[0],
    currentStatus: (cols[3] ?? "HOLD").toUpperCase(),
    doNotClaimUntil: [cols[2]].filter(Boolean),
    lastKnownEvidence: [cols[1]].filter(Boolean),
  }));
}

function buildManifest({ harvestId, tier, verdict, seeds, sourcePath, gitHead }) {
  return {
    schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
    harvestId,
    missionClass: "harvest",
    sourceCommitSha: gitHead,
    sourceBranch: "main",
    sourceRepo: "CapitalGlass-Cross-Agent",
    overallHarvestVerdict: verdict === "HARVEST_PARTIAL" ? "HARVEST_PARTIAL" : "HARVEST_COMPLETE",
    retrievalResult: "INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT",
    ingestionLane: "CHATGPT_VISIBLE_CONTEXT",
    sourceFindingsPath: sourcePath,
    doNotAdvance: [
      "FULLY_SEEDED",
      "INDEX_HIT_FROM_CHAT_CONTEXT",
      "PUBLISH_PASS_FROM_CHAT_CONTEXT",
    ],
    threadAutopsy: {
      tier,
      bundlePath: `artifacts/agent-runs/${harvestId}/thread-autopsy-bundle.json`,
      counts: {
        waste: 0,
        seeds: seeds.length,
        roiItems: 0,
        operatorFriction: 0,
      },
    },
    projection: {
      projectionSyncStatus: "not-run",
      hubPublishStatus: "not-run",
    },
    packets: [
      {
        packetId: `${harvestId}-chatgpt-ingest-v1`,
        packetTitle: "ChatGPT thread autopsy findings ingest",
        state: "DRAFT_READY_FOR_CURSOR_VALIDATION",
        packetVerdict: verdict,
        ownerRepo: "CapitalGlass-Cross-Agent",
        ownerIndexingStatus: "not-required",
        projectFile: `artifacts/agent-runs/${harvestId}/chatgpt-findings-source.md`,
        nextAction: "Run harvest:duplication-preflight and validate",
        advancementGate: "harvest:validate-autopsy PASS",
        doNotAdvance: ["FULLY_SEEDED"],
        evidenceRefs: [sourcePath],
        commitRefs: [],
        blockers: [],
      },
    ],
  };
}

/**
 * Ingest a ChatGPT findings Markdown file into Cross-Agent harvest artifacts.
 */
export function ingestChatGptFindings({
  repoRoot,
  inputPath,
  harvestId,
  gitHead,
  markdown = null,
}) {
  const errors = [];
  const md = markdown ?? fs.readFileSync(inputPath, "utf8");
  const { tier, verdict } = parseSummaryVerdict(md);
  const seeds = extractSeedPackets(md);
  const waste = buildWasteLedger(md);
  const operatorFriction = buildOperatorFriction(md);
  const duplicateWork = buildDuplicateWork(md);
  const roiBacklog = buildRoiBacklog(md);
  const executionDeltas = buildExecutionDeltas(md);
  const doNotAdvanceMap = buildDoNotAdvanceMap(md);
  const threadEvents = buildThreadEventInventory(md);

  if (seeds.length === 0) errors.push("no seed packet JSON blocks found in findings file");

  const runDir = path.join(repoRoot, "artifacts/agent-runs", harvestId);
  fs.mkdirSync(path.join(runDir, "seed-packets"), { recursive: true });

  const bundle = {
    schemaVersion: "cross-agent-thread-autopsy-bundle-v1@1.0.0",
    harvestId,
    tier,
    ingestionLane: "CHATGPT_VISIBLE_CONTEXT",
    wasteLedgerStatus: waste.length > 0 ? "POPULATED" : "NONE_FOUND",
    noneFoundEvidence: waste.length === 0 ? "ChatGPT draft — no waste rows parsed" : undefined,
    waste,
    operatorFriction,
    executionDeltas,
    wrongMoves: [],
    duplicateWork,
    roiBacklog,
    doNotAdvanceMap,
    duplicationCheck: {
      registryConsulted: false,
      commandIndexConsulted: false,
      hubSlicesConsulted: [],
      checkedAt: new Date().toISOString(),
      chatContextNote: "Must run harvest:duplication-preflight in Cursor before validate PASS",
    },
  };

  const manifest = buildManifest({
    harvestId,
    tier,
    verdict,
    seeds,
    sourcePath: inputPath,
    gitHead,
  });
  manifest.threadAutopsy.counts = {
    waste: waste.length,
    seeds: seeds.length,
    roiItems: roiBacklog.length,
    operatorFriction: operatorFriction.length,
  };

  for (const seed of seeds) {
    const dest = path.join(runDir, "seed-packets", `${seed.seedId}.json`);
    fs.writeFileSync(dest, `${JSON.stringify(seed, null, 2)}\n`, "utf8");
  }

  fs.writeFileSync(path.join(runDir, "chatgpt-findings-source.md"), md, "utf8");
  fs.writeFileSync(
    path.join(runDir, "thread-event-inventory.json"),
    `${JSON.stringify({ events: threadEvents }, null, 2)}\n`,
    "utf8",
  );
  fs.writeFileSync(
    path.join(runDir, "thread-autopsy-bundle.json"),
    `${JSON.stringify(bundle, null, 2)}\n`,
    "utf8",
  );
  fs.writeFileSync(
    path.join(runDir, "harvest-manifest-v1.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  const receipt = {
    schemaVersion: "cross-agent-chatgpt-findings-ingest-receipt-v1@1.0.0",
    harvestId,
    ingestedAt: new Date().toISOString(),
    sourcePath: inputPath,
    seedCount: seeds.length,
    verdict: errors.length ? "INGEST_PARTIAL" : "INGEST_PASS",
    errors,
    nextSteps: [
      "npm run harvest:duplication-preflight -- --harvest-id=" + harvestId,
      "npm run harvest:sync-derived -- " + harvestId,
      "npm run harvest:validate-autopsy -- --harvest-id=" + harvestId,
    ],
  };
  receipt.contentHash = hashCanonicalJson(receipt);
  fs.writeFileSync(
    path.join(runDir, "chatgpt-ingest-receipt.json"),
    `${JSON.stringify(receipt, null, 2)}\n`,
    "utf8",
  );

  return {
    ok: errors.length === 0,
    harvestId,
    runDir,
    receipt,
    seedCount: seeds.length,
    errors,
  };
}
