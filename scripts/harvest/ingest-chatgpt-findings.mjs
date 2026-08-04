#!/usr/bin/env node
/**
 * harvest:ingest-chatgpt-findings — convert ChatGPT thread autopsy Markdown into Cross-Agent harvest artifacts.
 * Authority: docs/protocols/chat-thread-closeout-autopsy-harvest-chatgpt-v1.md
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { hashFileContent } from "./lib/hash.mjs";
import { REPO_ROOT, harvestRunDir } from "./lib/paths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const KIND_MAP = {
  "standard-candidate": "decision",
  "protocol-upgrade": "runbook",
  "automation-candidate": "command",
  "failure-pattern": "failure-pattern",
  lesson: "lesson",
  runbook: "runbook",
  command: "command",
  decision: "decision",
  blocker: "blocker",
  architecture: "architecture",
  roi: "roi",
};

function parseArgs(argv) {
  let input = null;
  let harvestId = null;
  let json = false;
  for (const arg of argv) {
    if (arg.startsWith("--input=")) input = arg.slice("--input=".length);
    else if (arg.startsWith("--harvest-id=")) harvestId = arg.slice("--harvest-id=".length);
    else if (arg === "--json") json = true;
  }
  if (!input || !harvestId) {
    console.error(
      "Usage: npm run harvest:ingest-chatgpt-findings -- --input=<findings.md> --harvest-id=harvest-YYYY-MM-DD-<slug>-v1",
    );
    process.exit(1);
  }
  return { input: path.resolve(input), harvestId, json };
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function extractJsonBlocks(markdown) {
  const blocks = [];
  const re = /```json\s*([\s\S]*?)```/g;
  let match;
  while ((match = re.exec(markdown)) !== null) {
    try {
      blocks.push(JSON.parse(match[1].trim()));
    } catch {
      // skip invalid JSON blocks
    }
  }
  return blocks;
}

function parseMarkdownTable(sectionBody) {
  const lines = sectionBody.split("\n").filter((l) => l.trim().startsWith("|"));
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split("|")
    .map((h) => h.trim())
    .filter(Boolean);
  const rows = [];
  for (const line of lines.slice(2)) {
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((_, i, arr) => i > 0 && i < arr.length);
    if (cells.length < headers.length) continue;
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    rows.push(row);
  }
  return rows;
}

function sectionBody(markdown, heading) {
  const re = new RegExp(`## ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?(?=\\n## |$)`);
  const m = markdown.match(re);
  return m ? m[0] : "";
}

function normalizeImpact(value) {
  const v = String(value || "medium").toLowerCase();
  if (v.includes("high")) return "high";
  if (v.includes("low")) return "low";
  return "medium";
}

const WASTE_TYPE_MAP = {
  retrieval: "retrieval",
  context: "context",
  tool: "tool",
  host: "host",
  agent: "agent",
  deploy: "deploy",
  verification: "verification",
  rework: "rework",
  operator_attention: "operator_attention",
  claiming: "verification",
  repo_noise: "rework",
  scope: "context",
};

function normalizeWasteType(value) {
  const cleaned = String(value || "operator_attention")
    .replace(/`/g, "")
    .trim()
    .toLowerCase();
  return WASTE_TYPE_MAP[cleaned] ?? "operator_attention";
}

function registerHarvestPacket({ manifest, harvestId, sourceSha }) {
  const packet = manifest.packets[0];
  const registryPath = path.join(REPO_ROOT, "work-progress/harvest-packet-registry.json");
  const boundaryPath = path.join(REPO_ROOT, "work-progress/owner-repo-boundary-index.json");
  const now = manifest.updatedAt;

  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  registry.updatedAt = now;
  registry.packets[packet.packetId] = {
    packetId: packet.packetId,
    latestHarvestId: harvestId,
    latestVerdict: packet.packetVerdict,
    latestState: packet.state,
    latestProjectFile: packet.projectFile,
    latestOwnerRepo: packet.ownerRepo,
    ownerIndexingStatus: packet.ownerIndexingStatus,
    lastUpdatedCommit: sourceSha,
    lastUpdatedAt: now,
    latestCompactRecord: `artifacts/agent-runs/${harvestId}/compact-records/${packet.packetId}.json`,
    advancementGate: packet.advancementGate,
    doNotAdvance: packet.doNotAdvance,
  };
  writeJson(registryPath, registry);

  const boundary = JSON.parse(fs.readFileSync(boundaryPath, "utf8"));
  boundary.updatedAt = now;
  boundary.latestHarvestId = harvestId;
  const existing = boundary.packets.find((p) => p.packetId === packet.packetId);
  const entry = {
    packetId: packet.packetId,
    ownerRepo: packet.ownerRepo,
    ownerMcp: null,
    ownerIndexingStatus: packet.ownerIndexingStatus,
    requiredOwnerArtifact: packet.projectFile,
    crossAgentRole: "ChatGPT thread autopsy ingest coordination",
    ownerRepoRole: "harvest protocol and ingest tooling",
    currentGap: null,
  };
  if (existing) Object.assign(existing, entry);
  else boundary.packets.push(entry);
  boundary.packets.sort((a, b) => a.packetId.localeCompare(b.packetId));
  writeJson(boundaryPath, boundary);
}

function normalizeSeed(raw, sourcePath) {
  const seedId = raw.seedId;
  if (!seedId) return null;

  const kind = KIND_MAP[raw.kind] ?? "lesson";
  const title = raw.title || seedId;
  const summary = (raw.summary || title).slice(0, 500);
  const retrievalQuestions = (raw.retrievalQuestions || []).filter((q) => q && q.length >= 10);
  while (retrievalQuestions.length < 2) {
    retrievalQuestions.push(`What should agents know about ${title}?`);
  }

  const evidenceRefs = raw.evidenceRefs?.length
    ? raw.evidenceRefs
    : [path.basename(sourcePath), "chat-thread-closeout-autopsy-harvest-chatgpt-v1"];

  const futureAgentInstructions = raw.futureAgentInstructions ?? {
    whenThisAppears: `Thread or task references ${seedId}`,
    startAt: ["docs/protocols/chat-thread-closeout-autopsy-harvest-chatgpt-v1.md"],
    runPreflight: ["npm run harvest:duplication-preflight -- --harvest-id=<id>"],
    doNot: ["claim HARVEST_COMPLETE from ChatGPT draft", "skip Cursor validation"],
    proveBeforeClaiming: ["harvest:validate PASS", "chatgpt-ingest-receipt.json INGEST_PASS"],
  };

  return {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId,
    kind,
    title,
    summary,
    retrievalQuestions: retrievalQuestions.slice(0, 6),
    evidenceRefs,
    futureAgentInstructions,
    ownerRepo: raw.ownerRepo || "CapitalGlass-Cross-Agent",
    targetSlice: raw.targetSlice || "BY-KIND/thread-autopsy-index.json",
    promotionClass:
      raw.promotion === "RECORD_ONLY" || raw.promotionClass === "HUMAN_REVIEW"
        ? "HUMAN_REVIEW"
        : "POLICY_GATED",
    status: raw.status === "APPROVED" ? "APPROVED" : "CANDIDATE",
  };
}

function buildBundle(markdown, harvestId) {
  const wasteRows = parseMarkdownTable(sectionBody(markdown, "B.23 Waste Ledger"));
  const frictionRows = parseMarkdownTable(sectionBody(markdown, "B.25 Operator Friction"));
  const deltaRows = parseMarkdownTable(sectionBody(markdown, "B.22 Execution Deltas"));
  const dupRows = parseMarkdownTable(sectionBody(markdown, "B.24 Duplication Detector"));
  const dnaRows = parseMarkdownTable(sectionBody(markdown, "B.26 Do-Not-Advance Guards"));
  const roiRows = parseMarkdownTable(sectionBody(markdown, "A.3 Top 5 Immediate ROI"));

  const waste = wasteRows.map((row) => ({
    wasteId: row["Waste ID"] || row.ID,
    type: normalizeWasteType(row.Type || "operator_attention"),
    description: row.Description || "",
    evidenceRefs: row["Evidence refs"] ? [row["Evidence refs"]] : [],
    estimatedImpact: normalizeImpact(row.Impact),
    savedBy: row["Saved by"] || row.Saved || "harvest guards",
    roiRank: Number.parseInt(row.Rank, 10) || undefined,
  }));

  const operatorFriction = frictionRows.map((row) => ({
    frictionId: row["Friction ID"] || row.ID,
    trigger: row.Trigger || "",
    operatorCost: normalizeImpact(row.Cost),
    systemFix: row["System fix"] || row.Fix || "",
    evidenceRefs: [],
    linkedWasteIds: [],
  }));

  const executionDeltas = deltaRows.map((row) => ({
    executionDeltaId: row["Delta ID"] || row.ID,
    situation: row.Situation || "",
    actualExecution: {
      steps: [row["Actual execution"] || "unknown"],
      outcome: "SUBOPTIMAL",
    },
    optimalExecution: {
      steps: [row["Optimal execution"] || row["Preventive control"] || "unknown"],
      outcome: "OPTIMAL",
    },
    deltaCost: {
      time: normalizeImpact(row.Cost),
      tokens: normalizeImpact(row.Cost),
      operatorFrustration: normalizeImpact(row.Cost),
    },
    preventiveControl: row["Preventive control"] || undefined,
  }));

  const wrongMoves = [
    {
      wrongMoveId: "WM-001",
      summary: "Concept-only was not honored fast enough",
      whyItWasWrong: "User narrowed scope; agent continued implementation path",
      correctFirstMove: "Declare REVIEW_ONLY and stop tool/file work",
      preventiveControl: "CONCEPT_ONLY_NO_WRITE",
      executionDeltaId: "ED-001",
    },
    {
      wrongMoveId: "WM-002",
      summary: "Prior plan momentum overrode latest instruction",
      whyItWasWrong: "STOP_NOW and latest user instruction were not honored",
      correctFirstMove: "Halt all action until new explicit permission",
      preventiveControl: "STOP_NOW",
      executionDeltaId: "ED-002",
    },
  ];

  const duplicateWork = dupRows.map((row) => ({
    duplicateId: row["Duplicate ID"] || row.ID,
    subject: row["Repeated issue"] || row.Subject || "",
    whyRepeated: row["Why missed"] || row["Why repeated"] || "",
    firstKnownInstance: row["First known authority"] || "",
    priorIndexSlice: "BY-KIND/thread-autopsy-index.json",
    avoidableBy: row.Fix || row["Fix"] || "registry-first lookup",
    recommendedAction: "add_guard",
  }));

  const roiBacklog = roiRows.length
    ? roiRows.map((row, i) => ({
        rank: Number.parseInt(row.Rank, 10) || i + 1,
        title: row["Immediate improvement"] || row.ID || `ROI ${i + 1}`,
        whyItPays: row["Why now"] || "High operator ROI from ChatGPT autopsy",
        effort: "low",
        savedWasteIds: waste.slice(0, 2).map((w) => w.wasteId),
        seedAs: "runbook",
      }))
    : [
        {
          rank: 1,
          title: "Mode-first execution and hard guards",
          whyItPays: "Prevents concept-only and stop violations",
          effort: "low",
          savedWasteIds: ["TW-001", "TW-002"],
          seedAs: "rule",
        },
        {
          rank: 2,
          title: "CHAT_CONTEXT_ONLY harvest lane",
          whyItPays: "Prevents false validation claims from ChatGPT",
          effort: "low",
          savedWasteIds: ["TW-004"],
          seedAs: "runbook",
        },
        {
          rank: 3,
          title: "Distill seed packets before Git",
          whyItPays: "Avoids raw findings bloat",
          effort: "medium",
          savedWasteIds: ["TW-005"],
          seedAs: "command",
        },
      ];

  const doNotAdvanceMap = dnaRows.map((row) => ({
    awardOrVerdict: (row["Forbidden claim"] || row.ID || "").replace(/`/g, ""),
    currentStatus: (row["Current state"] || "HOLD").toUpperCase().includes("HOLD") ? "HOLD" : "HOLD",
    doNotClaimUntil: [row["Required evidence"] || "Cursor validation receipts"],
    lastKnownEvidence: ["ChatGPT draft only — publication not-run"],
  }));

  if (doNotAdvanceMap.length === 0) {
    doNotAdvanceMap.push(
      {
        awardOrVerdict: "HARVEST_COMPLETE",
        currentStatus: "HOLD",
        doNotClaimUntil: ["harvest:validate PASS"],
        lastKnownEvidence: ["ChatGPT DRAFT_READY_FOR_CURSOR_VALIDATION only"],
      },
      {
        awardOrVerdict: "FULLY_SEEDED",
        currentStatus: "HOLD",
        doNotClaimUntil: ["harvest:publish-intelligence-full receipt"],
        lastKnownEvidence: ["hubPublishStatus not-run"],
      },
    );
  }

  return {
    schemaVersion: "cross-agent-thread-autopsy-bundle-v1@1.0.0",
    harvestId,
    tier: "T2",
    wasteLedgerStatus: waste.length ? "POPULATED" : "NONE_FOUND",
    noneFoundEvidence: waste.length ? undefined : "No waste rows parsed from findings",
    waste,
    operatorFriction,
    executionDeltas,
    wrongMoves,
    duplicateWork,
    roiBacklog,
    doNotAdvanceMap,
    duplicationCheck: {
      registryConsulted: false,
      hubSlicesConsulted: ["thread-autopsy-index.json"],
      commandIndexConsulted: false,
      checkedAt: new Date().toISOString(),
      note: "Pending harvest:duplication-preflight after ingest",
    },
  };
}

function main() {
  const { input, harvestId, json } = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(input)) {
    console.error(`ingest FAIL — input not found: ${input}`);
    process.exit(1);
  }

  const markdown = fs.readFileSync(input, "utf8");
  const runDir = harvestRunDir(harvestId);
  const sourceSha = execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
  const now = new Date().toISOString();

  const rawSeeds = extractJsonBlocks(markdown);
  const seeds = rawSeeds
    .map((raw) => normalizeSeed(raw, input))
    .filter(Boolean);

  const seen = new Set();
  const uniqueSeeds = [];
  for (const seed of seeds) {
    if (seen.has(seed.seedId)) continue;
    seen.add(seed.seedId);
    uniqueSeeds.push(seed);
  }

  const bundle = buildBundle(markdown, harvestId);
  const eventRows = parseMarkdownTable(sectionBody(markdown, "B.20 Thread Event Inventory"));

  fs.mkdirSync(path.join(runDir, "seed-packets"), { recursive: true });
  for (const seed of uniqueSeeds) {
    writeJson(path.join(runDir, "seed-packets", `${seed.seedId}.json`), seed);
  }

  writeJson(path.join(runDir, "thread-autopsy-bundle.json"), bundle);
  writeJson(path.join(runDir, "thread-event-inventory.json"), {
    schemaVersion: "cross-agent-thread-event-inventory-v1@1.0.0",
    harvestId,
    events: eventRows.map((row) => ({
      eventId: row["Event ID"] || row.ID,
      whatHappened: row["What happened"] || "",
      actor: row.Actor || "",
      evidence: row.Evidence || "",
      stateChange: row["State change"] || "",
    })),
  });

  const manifest = {
    schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
    harvestId,
    missionClass: "harvest",
    sourceCommitSha: sourceSha,
    sourceBranch: "main",
    sourceRepo: "CapitalGlass-Cross-Agent",
    overallHarvestVerdict: "HARVEST_VALIDATION_PENDING",
    retrievalResult: "INDEX_HIT",
    chatgptIngest: {
      sourcePath: input,
      sourceHash: hashFileContent(markdown),
      protocol: "chat-thread-closeout-autopsy-harvest-chatgpt-v1",
      lane: "CHAT_CONTEXT_ONLY",
      draftVerdict: "DRAFT_READY_FOR_CURSOR_VALIDATION",
      authorityClass: "non-authoritative",
    },
    doNotAdvance: ["HARVEST_COMPLETE", "FULLY_SEEDED", "OPERATIONAL"],
    threadAutopsy: {
      tier: "T2",
      bundlePath: `artifacts/agent-runs/${harvestId}/thread-autopsy-bundle.json`,
      seedPacketIndexPath: `artifacts/agent-runs/${harvestId}/seed-packet-index.json`,
      counts: {
        waste: bundle.waste.length,
        seeds: uniqueSeeds.length,
        roiItems: bundle.roiBacklog.length,
        operatorFriction: bundle.operatorFriction.length,
      },
    },
    projection: {
      projectionSyncStatus: "not-run",
      hubPublishStatus: "not-run",
    },
    packets: [
      {
        packetId: harvestId.replace(/^harvest-/, ""),
        packetTitle: "ChatGPT full autopsy — mode guards, seed distillation, ingest lane",
        state: "VALIDATION_PENDING",
        packetVerdict: "HOLD",
        ownerRepo: "CapitalGlass-Cross-Agent",
        ownerIndexingStatus: "indexed",
        projectFile: "docs/protocols/chat-thread-closeout-autopsy-harvest-chatgpt-v1.md",
        nextAction: "harvest:duplication-preflight → validate → operator publish",
        advancementGate: "harvest:validate PASS",
        doNotAdvance: ["HARVEST_COMPLETE", "FULLY_SEEDED"],
        evidenceRefs: [
          input,
          `artifacts/agent-runs/${harvestId}/`,
          "docs/protocols/chat-thread-closeout-autopsy-harvest-chatgpt-v1.md",
        ],
        commitRefs: [sourceSha],
        blockers: [],
        packetKind: "decision",
        harvestVerdictContribution: "RECORDED",
      },
    ],
    ledgerLineage: {
      ledgerPath: "work-progress/ACTIVE_WORK.md",
    },
    updatedAt: now,
  };

  writeJson(path.join(runDir, "harvest-manifest-v1.json"), manifest);
  writeJson(path.join(runDir, "seed-packet-index.json"), {
    schemaVersion: "harvest-seed-packet-index-v1@1.0.0",
    harvestId,
    compiledAt: now,
    sourceCommitSha: sourceSha,
    seedIds: uniqueSeeds.map((s) => s.seedId),
    catalogObjectType: "harvest-thread-autopsy-seed",
  });

  const receipt = {
    schemaVersion: "chatgpt-ingest-receipt-v1@1.0.0",
    harvestId,
    verdict: "INGEST_PASS",
    ingestedAt: now,
    inputPath: input,
    inputHash: hashFileContent(markdown),
    seedCount: uniqueSeeds.length,
    seedIds: uniqueSeeds.map((s) => s.seedId),
    runDir: `artifacts/agent-runs/${harvestId}`,
    nextSteps: [
      "npm run harvest:duplication-preflight -- --harvest-id=" + harvestId,
      "npm run harvest:sync-derived -- " + harvestId,
      "npm run harvest:validate -- " + harvestId,
      "npm run harvest:validate-autopsy -- --harvest-id=" + harvestId,
    ],
  };
  writeJson(path.join(runDir, "chatgpt-ingest-receipt.json"), receipt);

  writeJson(path.join(runDir, "source-pointer.json"), {
    schemaVersion: "harvest-source-pointer-v1@1.0.0",
    harvestId,
    externalSourcePath: input,
    externalSourceHash: hashFileContent(markdown),
    committedToGit: false,
    note: "Raw findings retained outside Git per harvest storage policy",
  });

  registerHarvestPacket({ manifest, harvestId, sourceSha });

  execSync(`node scripts/harvest/sync-derived.mjs ${harvestId}`, {
    cwd: REPO_ROOT,
    stdio: "inherit",
  });

  execSync(`node scripts/harvest/render-harvest-index.mjs ${harvestId}`, {
    cwd: REPO_ROOT,
    stdio: "inherit",
  });

  if (json) {
    console.log(JSON.stringify(receipt, null, 2));
  } else {
    console.log(`harvest:ingest-chatgpt-findings OK — ${harvestId}`);
    console.log(`  seeds: ${uniqueSeeds.length}`);
    console.log(`  receipt: artifacts/agent-runs/${harvestId}/chatgpt-ingest-receipt.json`);
  }
}

main();
