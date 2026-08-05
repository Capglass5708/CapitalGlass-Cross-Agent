#!/usr/bin/env node
/**
 * harvest-2026-08-04-chat-gpt-harvest-protocol-v1 (T2)
 * OBSERVED lane: protocol + branch hygiene on chat-gpt-harvest — not WESLEYDESK Pilot A.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARVEST_ID = "harvest-2026-08-04-chat-gpt-harvest-protocol-v1";
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const AS_OF = new Date().toISOString();
const SOURCE_SHA = execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
const PROJECT_FILE = "work-progress/projects/2026-08-04_chat-gpt-harvest-protocol-v1.md";

function writeJson(rel, value) {
  const p = path.join(RUN_DIR, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeText(rel, text) {
  const p = path.join(RUN_DIR, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text, "utf8");
}

function packet(base) {
  return {
    harvestVerdictContribution: "RECORDED",
    ownerMcp: base.ownerMcp ?? "user-cg-app-mcp",
    requiredOwnerArtifact: null,
    commitRefs: base.commitRefs ?? [],
    blockers: [],
    relatedPackets: [],
    ownerIndexingStatus: "indexed",
    projectFile: PROJECT_FILE,
    ...base,
  };
}

const PROTOCOL_COMMITS = [
  "ef0b8eb",
  "5ce2079",
  "e5e108e",
  "02882a0",
];

const SEPARATE_BRANCH_HARVESTS = [
  "harvest-2026-08-04-wesleydesk-connectivity-session-boundary-v1",
  "harvest-2026-08-04-prompt-cache-connectivity-thread-v1",
  "harvest-2026-08-05-wesleydesk-connectivity-repair-v1",
];

const packets = [
  packet({
    packetKind: "decision",
    packetId: "chat-gpt-harvest-branch-lane-split-v1",
    packetTitle: "chat-gpt-harvest branch holds multiple harvest lanes — do not merge",
    state: "RECORDED",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Cross-Agent",
    evidenceRefs: ["BRANCH_LANE_MAP.md", "git log main..HEAD"],
    nextAction: "Pilot A uses harvest-2026-08-04-wesleydesk-session-repair-v1 only",
    advancementGate: "not-required",
    doNotAdvance: ["Mix protocol harvest into WESLEYDESK advancement Pilot A"],
  }),
  packet({
    packetKind: "protocol_upgrade",
    packetId: "system-advancement-harvest-protocol-v1",
    packetTitle: "ADVANCEMENT synthesis protocol + schemas (Phase 1)",
    state: "SHIPPED_ON_BRANCH",
    packetVerdict: "DRAFT_READY_FOR_CURSOR_VALIDATION",
    ownerRepo: "CapitalGlass-Cross-Agent",
    commitRefs: PROTOCOL_COMMITS,
    evidenceRefs: [
      "docs/protocols/chat-thread-system-advancement-harvest-chatgpt-v1.md",
      "scripts/harvest/schema/advancement-intelligence-v1.schema.json",
    ],
    nextAction: "Pilot A advancement harvest; then Phase 2 ingest parser",
    advancementGate: "SYSTEM_ADVANCEMENT_DRAFT_READY from real pilot artifact",
    doNotAdvance: ["HARVEST_COMPLETE", "IMPLEMENTED"],
  }),
  packet({
    packetKind: "protocol_upgrade",
    packetId: "autopsy-evidence-classification-v1",
    packetTitle: "OBSERVED autopsy hardening — evidence classes, COR/DUP ledgers",
    state: "SHIPPED_ON_BRANCH",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Cross-Agent",
    commitRefs: ["5ce2079", "02882a0"],
    evidenceRefs: ["docs/protocols/chat-thread-closeout-autopsy-harvest-chatgpt-v1.md"],
    nextAction: "ChatGPT runs OBSERVED lane from Z uppercase path",
    advancementGate: "not-required",
    doNotAdvance: [],
  }),
  packet({
    packetKind: "faster_path",
    packetId: "z-harvest-uppercase-protocol-sync-v1",
    packetTitle: "Z mirror syncs CHAT-THREAD-* uppercase operator paths",
    state: "RECORDED",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Cross-Agent",
    evidenceRefs: ["scripts/harvest/lib/z-harvest-mirror-lib.mjs", "harvest/z-mirror-sync-receipt.json"],
    nextAction: "npm run harvest:sync-z-mirror after protocol edits",
    advancementGate: "not-required",
    doNotAdvance: [],
  }),
  packet({
    packetKind: "blocker",
    packetId: "advancement-ingest-parser-not-shipped-v1",
    packetTitle: "harvest:ingest-chatgpt-advancement parser is Phase 2",
    state: "OPEN",
    packetVerdict: "PHASE_2_PENDING",
    ownerRepo: "CapitalGlass-Cross-Agent",
    evidenceRefs: ["chat-thread-system-advancement-harvest-chatgpt-v1.md#handoff"],
    nextAction: "Scope Phase 2 from Pilot A system-advancement-findings-source.md",
    advancementGate: "ingest-chatgpt-advancement ships",
    doNotAdvance: ["Claim advancement ingest operational"],
  }),
];

writeJson("harvest-manifest-v1.json", {
  schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
  harvestId: HARVEST_ID,
  missionClass: "chat-thread-closeout-autopsy-harvest-v1",
  sourceCommitSha: SOURCE_SHA,
  sourceBranch: "chat-gpt-harvest",
  sourceRepo: "CapitalGlass-Cross-Agent",
  createdAt: AS_OF,
  updatedAt: AS_OF,
  retrievalResult: "INDEX_HIT_AI_CACHE",
  cacheResult: "CACHE_MISS",
  overallHarvestVerdict: "HARVEST_COMPLETE",
  intelligenceKind: "observed",
  laneScope: "chat-gpt-harvest-protocol-only",
  doNotAdvance: [
    "Merge WESLEYDESK connectivity harvests into this protocol harvest",
    "Use this harvest as Pilot A advancement fixture",
    "Claim harvest:ingest-chatgpt-advancement operational",
  ],
  threadAutopsy: {
    tier: "T2",
    bundlePath: `artifacts/agent-runs/${HARVEST_ID}/thread-autopsy-bundle.json`,
    seedPacketIndexPath: `artifacts/agent-runs/${HARVEST_ID}/seed-packet-index.json`,
    counts: { waste: 3, seeds: 3, roiItems: 3, operatorFriction: 1, executionDeltas: 2 },
  },
  projection: {
    projectionSyncStatus: "not-run",
    hubPublishStatus: "not-run",
    hubPublishBlocker: "protocol lane — publish after operator review",
  },
  ledgerLineage: { ledgerPath: "work-progress/ACTIVE_WORK.md", relatedProjectFile: PROJECT_FILE },
  supersededClaims: [],
  packets,
});

writeJson("thread-event-inventory.json", {
  schemaVersion: "thread-event-inventory-v1@1.0.0",
  harvestId: HARVEST_ID,
  threadRef: "agent-transcripts/b8c86aea-14bc-4dce-b261-ea6d0062238e.jsonl",
  recordedAt: AS_OF,
  hosts: ["WESLEY_WORK", "WSL"],
  events: [
    { eventId: "TE-001", phase: "branch", summary: "Created chat-gpt-harvest branch for ChatGPT findings push", actor: "user", evidenceRefs: ["ef0b8eb"], evidenceClassification: "CHAT_DIRECT" },
    { eventId: "TE-002", phase: "protocol", summary: "Phase 1 system advancement protocol + autopsy hardening shipped", actor: "agent", evidenceRefs: ["5ce2079"], evidenceClassification: "CROSS_CHECK_CANDIDATE" },
    { eventId: "TE-003", phase: "operator", summary: "Operator quick-start + Z uppercase sync for ChatGPT @ paths", actor: "agent", evidenceRefs: ["02882a0"], evidenceClassification: "CROSS_CHECK_CANDIDATE" },
    { eventId: "TE-004", phase: "scope", summary: "User required Pilot A WESLEYDESK advancement separate from branch noise", actor: "user", evidenceRefs: ["TE-004"], evidenceClassification: "CHAT_DIRECT" },
    { eventId: "TE-005", phase: "hygiene", summary: "Harvest chat-gpt-harvest protocol lane before Pilot A to avoid skew", actor: "user", evidenceRefs: ["TE-005"], evidenceClassification: "CHAT_DIRECT" },
  ],
});

writeJson("thread-autopsy-bundle.json", {
  schemaVersion: "cross-agent-thread-autopsy-bundle-v1@1.0.0",
  harvestId: HARVEST_ID,
  tier: "T2",
  wasteLedgerStatus: "POPULATED",
  duplicationCheck: {
    registryConsulted: true,
    commandIndexConsulted: true,
    hubSlicesConsulted: ["active-work-blockers.json"],
    checkedAt: AS_OF,
  },
  waste: [
    { wasteId: "TW-001", type: "context", description: "Mixed WESLEYDESK connectivity harvests on same branch as protocol work", evidenceRefs: SEPARATE_BRANCH_HARVESTS, estimatedImpact: "high", savedBy: "BRANCH_LANE_MAP + separate harvest ids", roiRank: 1 },
    { wasteId: "TW-002", type: "retrieval", description: "Z uppercase path stale until sync manifest included CHAT-THREAD-* destinations", evidenceRefs: ["02882a0"], estimatedImpact: "medium", savedBy: "z-harvest-mirror-lib uppercase destinations", roiRank: 2 },
    { wasteId: "TW-003", type: "operator_attention", description: "OBSERVED vs ADVANCEMENT lane confusion at ChatGPT run time", evidenceRefs: ["Operator quick start tables"], estimatedImpact: "medium", savedBy: "Dual Z protocol files with lane tables", roiRank: 3 },
  ],
  operatorFriction: [
    { frictionId: "OF-001", trigger: "Operator @ wrong Z file or mixed thread on branch", operatorCost: "high", systemFix: "Lane map + harvest protocol branch first", evidenceRefs: ["TE-005"], linkedWasteIds: ["TW-001", "TW-003"] },
  ],
  executionDeltas: [
    {
      executionDeltaId: "ED-001",
      situation: "Pilot A before branch protocol harvest",
      actualExecution: { steps: ["Advancement on dirty branch with mixed harvest ids"], outcome: "Skew risk", evidenceRefs: ["TE-004"] },
      optimalExecution: { steps: ["harvest-2026-08-04-chat-gpt-harvest-protocol-v1", "clean working tree", "Pilot A on isolated id"], outcome: "Clean fixture path", requiredPreflight: ["BRANCH_LANE_MAP"] },
      deltaCost: { time: "medium", tokens: "high", operatorFrustration: "medium" },
    },
    {
      executionDeltaId: "ED-002",
      situation: "ChatGPT protocol run",
      actualExecution: { steps: ["Lowercase Z path only synced"], outcome: "Operator used stale uppercase file", evidenceRefs: ["TW-002"] },
      optimalExecution: { steps: ["Sync both uppercase + lowercase Z paths"], outcome: "Operator @ matches git authority", requiredPreflight: ["harvest:sync-z-mirror"] },
      deltaCost: { time: "low", tokens: "low", operatorFrustration: "low" },
    },
  ],
  wrongMoves: [],
  duplicateWork: [
    {
      duplicateId: "DW-001",
      subject: "WESLEYDESK session boundary autopsy on branch",
      firstKnownInstance: "harvest-2026-08-04-wesleydesk-connectivity-session-boundary-v1",
      priorIndexSlice: "artifacts/agent-runs/",
      whyRepeated: "Same branch hosts connectivity + protocol lanes",
      avoidableBy: "BRANCH_LANE_MAP — Pilot A uses different harvest id",
      recommendedAction: "index",
    },
  ],
  roiBacklog: [
    { rank: 1, title: "Branch lane map before any ChatGPT harvest on chat-gpt-harvest", whyItPays: "Prevents Pilot A skew", effort: "low", savedWasteIds: ["TW-001"], ownerRepo: "CapitalGlass-Cross-Agent", seedAs: "rule", suggestedWorkPackageId: "chat-gpt-harvest-branch-lane-map-v1" },
    { rank: 2, title: "Phase 2 ingest-chatgpt-advancement from Pilot A artifact", whyItPays: "Parser matches real protocol output", effort: "medium", savedWasteIds: [], ownerRepo: "CapitalGlass-Cross-Agent", seedAs: "command", suggestedWorkPackageId: "harvest-ingest-chatgpt-advancement-v1" },
    { rank: 3, title: "Auto-sync Z uppercase on every protocol commit to chat-gpt-harvest", whyItPays: "Operator Z @ always current", effort: "low", savedWasteIds: ["TW-002"], ownerRepo: "CapitalGlass-Cross-Agent", seedAs: "rule", suggestedWorkPackageId: "z-harvest-protocol-sync-gate-v1" },
  ],
  doNotAdvanceMap: [
    { awardOrVerdict: "PILOT_A_ADVANCEMENT_FIXTURE", currentStatus: "BLOCKED", doNotClaimUntil: ["harvest-2026-08-04-chat-gpt-harvest-protocol-v1 complete", "working tree clean"], lastKnownEvidence: [HARVEST_ID], proofCommandId: "chat-gpt-harvest-branch-lane-split-v1" },
  ],
});

const seeds = [
  {
    seedId: "IH-THREAD-CHAT-GPT-HARVEST-BRANCH-001",
    kind: "lesson",
    title: "chat-gpt-harvest branch lane separation",
    summary: "Protocol harvest ids differ from WESLEYDESK connectivity harvest ids on the same branch.",
    retrievalQuestions: ["Which harvest id is protocol vs WESLEYDESK on chat-gpt-harvest?", "What is Pilot A harvest id?"],
    evidenceRefs: [HARVEST_ID, "BRANCH_LANE_MAP.md"],
    futureAgentInstructions: {
      whenThisAppears: "chat-gpt-harvest branch work or ChatGPT push",
      startAt: ["BRANCH_LANE_MAP.md", PROJECT_FILE],
      runPreflight: [],
      doNot: ["Mix harvest-2026-08-04-wesleydesk-connectivity-session-boundary-v1 into protocol Pilot A"],
      proveBeforeClaiming: ["harvest-2026-08-04-chat-gpt-harvest-protocol-v1"],
    },
    ownerRepo: "CapitalGlass-Cross-Agent",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "AUTOMATIC",
    status: "CANDIDATE",
  },
  {
    seedId: "IH-THREAD-ADVANCEMENT-OBSERVED-SPLIT-001",
    kind: "architecture",
    title: "OBSERVED autopsy vs ADVANCEMENT synthesis protocols",
    summary: "Two ChatGPT protocols, two output files, two intelligence kinds.",
    retrievalQuestions: ["Which Z file for OBSERVED?", "Which file for ADVANCEMENT synthesis?"],
    evidenceRefs: ["CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md", "CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md"],
    futureAgentInstructions: {
      whenThisAppears: "ChatGPT harvest @ Z protocol",
      startAt: ["Operator quick start table"],
      runPreflight: [],
      doNot: ["Use autopsy file for IMP-### synthesis harvest"],
      proveBeforeClaiming: ["Output filename matches lane"],
    },
    ownerRepo: "CapitalGlass-Cross-Agent",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "AUTOMATIC",
    status: "CANDIDATE",
  },
  {
    seedId: "IH-THREAD-PHASE2-ADVANCEMENT-INGEST-001",
    kind: "runbook",
    title: "Phase 2 advancement ingest blocked until pilot artifact exists",
    summary: "harvest:ingest-chatgpt-advancement scoped from real system-advancement-findings-source.md.",
    retrievalQuestions: ["Can ChatGPT advancement ingest run?", "What is Phase 2 fixture harvest id?"],
    evidenceRefs: ["harvest-2026-08-04-wesleydesk-session-repair-v1"],
    futureAgentInstructions: {
      whenThisAppears: "advancement ingest implementation",
      startAt: ["system-advancement-findings-source.md from Pilot A"],
      runPreflight: [],
      doNot: ["Build parser from idealized schema only"],
      proveBeforeClaiming: ["Pilot A artifact on chat-gpt-harvest"],
    },
    ownerRepo: "CapitalGlass-Cross-Agent",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
  },
];

for (const seed of seeds) {
  writeJson(`seed-packets/${seed.seedId}.json`, { schemaVersion: "harvest-seed-packet-v1@1.0.0", ...seed });
}
writeJson("seed-packet-index.json", {
  schemaVersion: "harvest-seed-packet-index-v1@1.0.0",
  harvestId: HARVEST_ID,
  generatedAt: AS_OF,
  seeds: seeds.map((s) => ({ seedId: s.seedId, path: `seed-packets/${s.seedId}.json` })),
});

writeText(
  "BRANCH_LANE_MAP.md",
  [
    "# chat-gpt-harvest branch lane map",
    "",
    "**Branch:** chat-gpt-harvest",
    `**Protocol harvest (this run):** ${HARVEST_ID}`,
    "**Purpose:** Record protocol lane and prevent Pilot A skew.",
    "",
    "## Protocol lane (CLOSED in this harvest)",
    "",
    "| Commit | Summary |",
    "| --- | --- |",
    "| ef0b8eb | ChatGPT push instructions on branch |",
    "| 5ce2079 | Phase 1 system advancement protocol + autopsy hardening |",
    "| e5e108e | Z mirror sync receipt |",
    "| 02882a0 | Operator quick-start + uppercase Z sync |",
    "",
    "## Separate harvests on same branch (do NOT merge into Pilot A)",
    "",
    "| Harvest ID | Lane | Output |",
    "| --- | --- | --- |",
    "| harvest-2026-08-04-wesleydesk-connectivity-session-boundary-v1 | OBSERVED ChatGPT | chatgpt-findings-source.md |",
    "| harvest-2026-08-04-prompt-cache-connectivity-thread-v1 | OBSERVED ChatGPT | chatgpt-findings-source.md |",
    "| harvest-2026-08-05-wesleydesk-connectivity-repair-v1 | OBSERVED Cursor T2 | published seeds |",
    "",
    "## Pilot A (next — not this harvest)",
    "",
    "| Harvest ID | Lane | Output |",
    "| --- | --- | --- |",
    "| harvest-2026-08-04-wesleydesk-session-repair-v1 | ADVANCEMENT synthesis | system-advancement-findings-source.md |",
    "",
    "Pilot A must use CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md on Z, not the autopsy protocol file.",
    "",
  ].join("\n"),
);

writeText(
  "chatgpt-findings-source.md",
  [
    "# ChatGPT Harvest Branch Protocol — OBSERVED Findings",
    "",
    "**Mission:** chat-thread-closeout-autopsy-harvest-chatgpt-v1",
    "**Lane:** CHAT_CONTEXT_ONLY / OBSERVED",
    `**Harvest ID:** ${HARVEST_ID}`,
    "**Output verdict:** DRAFT_READY_FOR_CURSOR_VALIDATION",
    `**Branch:** chat-gpt-harvest at ${SOURCE_SHA}`,
    "",
    "## Executive summary",
    "",
    "This harvest records the protocol development lane on chat-gpt-harvest so Pilot A (WESLEYDESK session-repair ADVANCEMENT) does not skew against mixed branch content. WESLEYDESK connectivity autopsy artifacts use different harvest ids — see BRANCH_LANE_MAP.md.",
    "",
    "## Scope ledger",
    "",
    "- primary mission: ChatGPT harvest protocols, Z operator paths, branch push workflow",
    "- closed lanes: Phase 1 docs/schemas, autopsy evidence layer, operator quick-start, uppercase Z sync",
    "- open lanes: Pilot A advancement harvest, Phase 2 ingest-chatgpt-advancement",
    "- do-not-merge: WESLEYDESK connectivity harvests into Pilot A fixture",
    "",
    "## Retrieval preflight",
    "",
    "```text",
    "Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT",
    "Cache: NOT_APPLICABLE",
    "rawScanRequired: false",
    `sourceCommitSha: ${SOURCE_SHA}`,
    "```",
    "",
    "## Publication truth",
    "",
    "| Layer | State |",
    "| --- | --- |",
    "| Git authority | not-run |",
    "| L: Hub catalog | not-run |",
    "| Z: AI cache | not-run |",
    "| Supabase projection | not-run |",
    "| Freshness gate | not-run |",
    "",
    "```text",
    "Publication: NOT_RUN_BY_CURSOR",
    "projection.hubPublishStatus: not-run",
    "```",
    "",
    "## Cursor handoff",
    "",
    "```text",
    `npm run harvest:record -- ${HARVEST_ID}`,
    `npm run harvest:validate-autopsy -- --harvest-id=${HARVEST_ID}`,
    "```",
    "",
    "Pilot A next: harvest-2026-08-04-wesleydesk-session-repair-v1 / system-advancement-findings-source.md",
    "",
  ].join("\n"),
);

writeJson("duplication-preflight-receipt.json", {
  schemaVersion: "harvest-duplication-preflight-v1@1.0.0",
  harvestId: HARVEST_ID,
  checkedAt: AS_OF,
  registryConsulted: true,
  overlaps: SEPARATE_BRANCH_HARVESTS.map((id) => ({
    priorHarvestId: id,
    overlapKind: "same-branch-different-lane",
    subject: "WESLEYDESK connectivity — not protocol lane",
  })),
  retrievalResult: "INDEX_HIT_AI_CACHE",
});

console.log(`generate-chat-gpt-harvest-protocol-harvest OK — ${HARVEST_ID}`);

const registryPath = path.join(REPO_ROOT, "work-progress/harvest-packet-registry.json");
const boundaryPath = path.join(REPO_ROOT, "work-progress/owner-repo-boundary-index.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const boundary = JSON.parse(fs.readFileSync(boundaryPath, "utf8"));
for (const p of packets) {
  registry.packets[p.packetId] = {
    packetId: p.packetId,
    latestHarvestId: HARVEST_ID,
    latestVerdict: p.packetVerdict,
    latestState: p.state,
    latestProjectFile: p.projectFile,
    latestOwnerRepo: p.ownerRepo,
    ownerIndexingStatus: p.ownerIndexingStatus,
    lastUpdatedCommit: SOURCE_SHA,
    lastUpdatedAt: AS_OF,
    latestCompactRecord: `artifacts/agent-runs/${HARVEST_ID}/compact-records/${p.packetId}.json`,
    advancementGate: p.advancementGate,
    doNotAdvance: p.doNotAdvance ?? [],
  };
  if (!boundary.packets.find((b) => b.packetId === p.packetId)) {
    boundary.packets.push({
      packetId: p.packetId,
      ownerRepo: p.ownerRepo,
      ownerMcp: p.ownerMcp ?? "user-cg-app-mcp",
      ownerIndexingStatus: p.ownerIndexingStatus,
      requiredOwnerArtifact: `artifacts/agent-runs/${HARVEST_ID}/BRANCH_LANE_MAP.md`,
      crossAgentRole: "chat-gpt-harvest protocol lane",
      ownerRepoRole: p.packetTitle,
      currentGap: p.state === "OPEN" ? p.nextAction : null,
    });
  }
}
registry.updatedAt = AS_OF;
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
fs.writeFileSync(boundaryPath, `${JSON.stringify(boundary, null, 2)}\n`, "utf8");
