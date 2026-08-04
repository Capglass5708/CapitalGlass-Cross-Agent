#!/usr/bin/env node
/**
 * One-shot generator: harvest-2026-08-04-three-way-improvement-slice6-thread-v1 (T2 autopsy)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARVEST_ID = "harvest-2026-08-04-three-way-improvement-slice6-thread-v1";
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const AS_OF = "2026-08-04T02:30:00.000Z";
const SOURCE_SHA = execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();

function writeJson(rel, value) {
  const p = path.join(RUN_DIR, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function packet(base) {
  return {
    harvestVerdictContribution: "RECORDED",
    ownerMcp: base.ownerMcp || null,
    requiredOwnerArtifact: base.requiredOwnerArtifact || null,
    commitRefs: base.commitRefs || [],
    blockers: base.blockers || [],
    relatedPackets: base.relatedPackets || [],
    packetKind: base.packetKind,
    ...base,
  };
}

const packets = [
  packet({
    packetId: "direct-connect-persistent-controller-v1",
    packetKind: "faster_path",
    packetTitle: "Direct Connect persistent controller (RYZEN9DESK)",
    state: "INSTALLED_PERSISTENCE_UNPROVEN",
    packetVerdict: "HOLD",
    ownerRepo: "CapitalGlass-Office-Admin",
    ownerIndexingStatus: "indexed",
    projectFile: "work-progress/projects/2026-08-03_direct-connect-persistent-controller-v1.md",
    evidenceRefs: [
      "Z:/Office/Wes/Direct Connect/Ryzen Direct Connect/persistent-controller/TEST_PROTOCOL.md",
      "thread-autopsy-bundle.json#ED-001",
    ],
    nextAction:
      "Cold reboot persistence proof on RYZEN9DESK; separate from WESLEYDESK Cross-Agent runner (WesleyDesk Direct Connect kit)",
    advancementGate: "direct-connect-cold-reboot-persistence proof",
    doNotAdvance: ["PERSISTENT_AVAILABILITY_PASS"],
  }),
  packet({
    packetId: "ryzen9desk-managed-executor-v1",
    packetKind: "evidence",
    packetTitle: "RYZEN9DESK managed executor",
    state: "FULL_ACCEPTANCE_READONLY_PASS",
    packetVerdict: "PASS",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "indexed",
    projectFile: "work-progress/projects/2026-08-03_ryzen9desk-managed-executor-v1.md",
    evidenceRefs: ["CG-AppBuilder-MCP PR #268 merge 8fe7cf05"],
    nextAction: "Prove persistent availability via direct-connect-persistent-controller-v1",
    advancementGate: "PERSISTENT_AVAILABILITY_PASS after cold reboot",
    doNotAdvance: ["MANAGED_EXECUTOR_ONLINE without persistence proof"],
  }),
  packet({
    packetId: "complete-project-folder-synology-intelligence-publication-v1",
    packetKind: "evidence",
    packetTitle: "Synology intelligence publication complete",
    state: "PUBLICATION_COMPLETE",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Cross-Agent",
    ownerIndexingStatus: "indexed",
    projectFile:
      "work-progress/projects/2026-08-03_complete-project-folder-synology-intelligence-publication-v1.md",
    evidenceRefs: ["harvest-project-folder-synology-primary-chat-v1"],
    nextAction: "Recurring index:freshness-gate after ledger edits",
    advancementGate: "not-required",
    doNotAdvance: [],
  }),
  packet({
    packetId: "intelligence-hub-index-ai-cache-freshness-v1",
    packetKind: "evidence",
    packetTitle: "Intelligence Hub index + AI cache freshness",
    state: "FOUNDATION_PASS",
    packetVerdict: "PASS",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "indexed",
    projectFile: "work-progress/projects/2026-08-03_intelligence-hub-index-ai-cache-freshness-v1.md",
    evidenceRefs: ["L:/Capital-Glass-Intelligence-Hub/00-master-index"],
    nextAction: "cross-agent-index-auto-publisher-activation-v1 when operator enables",
    advancementGate: "not-required",
    doNotAdvance: [],
  }),
  packet({
    packetId: "cross-agent-index-auto-publisher-activation-v1",
    packetKind: "blocker",
    packetTitle: "Cross-Agent index auto-publisher activation",
    state: "STAGED_NOT_ACTIVE",
    packetVerdict: "HOLD",
    ownerRepo: "CapitalGlass-Cross-Agent",
    ownerIndexingStatus: "indexed",
    projectFile: "work-progress/projects/2026-08-03_cross-agent-index-auto-publisher-activation-v1.md",
    evidenceRefs: ["Slice 6 used local publisher break-glass at acd94ba"],
    nextAction: "Enable scheduled publisher on WESLEYDESK after operator approval",
    advancementGate: "post-commit publication receipt on new Cross-Agent commit",
    doNotAdvance: ["AUTO_PUBLISHER_V1_1_ACTIVE"],
  }),
  packet({
    packetId: "three-way-agent-improvement-intelligence-v1",
    packetKind: "decision",
    packetTitle: "Three-way agent improvement intelligence program",
    state: "OPERATIONAL_CLOSEOUT_COMPLETE",
    packetVerdict: "THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "indexed",
    projectFile: "work-progress/projects/2026-08-03_three-way-agent-improvement-intelligence-v1.md",
    evidenceRefs: [
      "artifacts/agent-runs/three-way-agent-improvement-intelligence-v1/slice6-closeout-receipt-v1.json",
      "artifacts/agent-runs/three-way-agent-improvement-intelligence-v1/merge-completion-receipt-v1.json",
      "runtime/index-publication/latest.json",
      "artifacts/agent-runs/three-way-agent-improvement-intelligence-v1/post-publication-blind-retrieval-v1.json",
    ],
    commitRefs: [
      { repo: "CG-AppBuilder-MCP", sha: "49aa77fb", note: "PR #277 improvement registry" },
      { repo: "CapitalGlass-Cross-Agent", sha: "acd94ba", note: "local publisher closeout SHA" },
      { repo: "CapitalGlass-Cross-Agent", sha: "15d3d46", note: "runner watchdog on main" },
    ],
    nextAction:
      "Operator hub publish when ready; keep wesleydesk-wsl2-cross-agent online; do not re-dispatch run 30861202361",
    advancementGate: "not-required",
    doNotAdvance: [
      "Re-dispatch cancelled workflow run 30861202361",
      "Claim GHA publication path operational while runner offline or action pins fail",
      "AUTO_PUBLISHER_V1_1_ACTIVE (separate work package)",
    ],
  }),
  packet({
    packetId: "governance-wsl-path-normalization-v1",
    packetKind: "evidence",
    packetTitle: "Governance WSL path normalization",
    state: "MERGED_COMPLETE",
    packetVerdict: "PASS",
    ownerRepo: "CG-Platform-Governance-MCP",
    ownerIndexingStatus: "indexed",
    projectFile: "work-progress/projects/2026-08-03_governance-wsl-path-normalization-v1.md",
    evidenceRefs: ["CG-Platform-Governance-MCP PR #15 6c44cbc", "PR #16 270148c"],
    commitRefs: [{ repo: "CG-Platform-Governance-MCP", sha: "270148c", note: "improvement intelligence v2" }],
    nextAction: "None — prerequisite merged",
    advancementGate: "not-required",
    doNotAdvance: [],
  }),
  packet({
    packetId: "cross-agent-harvest-owner-boundary-v1",
    packetKind: "evidence",
    packetTitle: "Cross-Agent harvest owner boundary",
    state: "MERGED_COMPLETE",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Cross-Agent",
    ownerIndexingStatus: "indexed",
    projectFile: "work-progress/projects/2026-08-03_cross-agent-harvest-owner-boundary-v1.md",
    evidenceRefs: ["CapitalGlass-Cross-Agent PR #2 990abe9"],
    commitRefs: [{ repo: "CapitalGlass-Cross-Agent", sha: "990abe9", note: "harvest owner boundary" }],
    nextAction: "None — prerequisite merged",
    advancementGate: "not-required",
    doNotAdvance: [],
  }),
  packet({
    packetId: "platform-health-read-model-slice-7-v1",
    packetKind: "protocol_upgrade",
    packetTitle: "Platform Health read model slice 7",
    state: "DEFERRED",
    packetVerdict: "HOLD",
    ownerRepo: "CapitalGlass-Cross-Agent",
    ownerIndexingStatus: "indexed",
    projectFile: "work-progress/projects/2026-08-03_platform-health-read-model-slice-7-v1.md",
    evidenceRefs: ["Explicitly excluded from Slice 6 closeout in thread"],
    nextAction: "Separate cleanup work package if needed",
    advancementGate: "operator scope approval",
    doNotAdvance: ["Blocks Slice 6 operational award"],
  }),
];

const manifest = {
  schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
  harvestId: HARVEST_ID,
  missionClass: "chat-thread-closeout-autopsy-harvest-v1",
  sourceCommitSha: SOURCE_SHA,
  sourceBranch: "main",
  sourceRepo: "CapitalGlass-Cross-Agent",
  createdAt: AS_OF,
  updatedAt: AS_OF,
  retrievalResult: "INDEX_HIT",
  cacheResult: "CACHE_MISS",
  overallHarvestVerdict: "HARVEST_COMPLETE",
  doNotAdvance: [
    "Re-dispatch cancelled workflow run 30861202361",
    "Claim GHA publication operational while wesleydesk-wsl2-cross-agent offline",
    "PERSISTENT_AVAILABILITY_PASS",
    "AUTO_PUBLISHER_V1_1_ACTIVE",
  ],
  threadAutopsy: {
    tier: "T2",
    bundlePath: `artifacts/agent-runs/${HARVEST_ID}/thread-autopsy-bundle.json`,
    seedPacketIndexPath: `artifacts/agent-runs/${HARVEST_ID}/seed-packet-index.json`,
    counts: { waste: 4, seeds: 4, roiItems: 3, operatorFriction: 2, executionDeltas: 2 },
  },
  projection: {
    projectionSyncStatus: "not-run",
    hubPublishStatus: "not-run",
    hubPublishBlocker: "Cursor agent — operator runs index:publish on WESLEYDESK",
    note: "Thread autopsy recorded only; hub seed publish NOT_RUN_BY_CURSOR",
  },
  ledgerLineage: { ledgerPath: "work-progress/ACTIVE_WORK.md" },
  supersededClaims: [
    {
      packetId: "three-way-agent-improvement-intelligence-v1",
      claim: "SLICE_6_HOLD / PRECOMMIT_VERIFICATION_PASS_WITH_PREREQUISITE_GATE_REPAIRS",
      supersededBy: "THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL @ acd94ba local publisher closeout",
      recordedAt: AS_OF,
    },
    {
      packetId: "harvest-current-cross-thread-state-v2",
      claim: "THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL not claimed",
      supersededBy: `Thread harvest ${HARVEST_ID} records operational closeout with evidence`,
      recordedAt: AS_OF,
    },
  ],
  commitEvidence: [
    { repo: "CapitalGlass-Cross-Agent", sha: SOURCE_SHA, role: "harvest-record-commit" },
    { repo: "CapitalGlass-Cross-Agent", sha: "acd94ba6d5855bda1298d248188f6ae4faa32edf", role: "slice6-publication-sha" },
    { repo: "CG-AppBuilder-MCP", sha: "49aa77fb", role: "improvement-registry-merge" },
  ],
  packets,
};

writeJson("harvest-manifest-v1.json", manifest);

writeJson("thread-event-inventory.json", {
  schemaVersion: "thread-event-inventory-v1@1.0.0",
  harvestId: HARVEST_ID,
  threadScope: "three-way-agent-improvement-intelligence-v1 Slice 6 publication closeout",
  generatedAt: AS_OF,
  events: [
    { eventId: "TE-001", phase: "planning", summary: "Ranked ROI; merge order for six program PRs", evidenceRefs: ["IMP-0001..0004 UNPROVEN"] },
    { eventId: "TE-002", phase: "execution", summary: "Merged PR stack Governance→Cross-Agent→FI→AppBuilder", evidenceRefs: ["merge-completion-receipt-v1.json"] },
    { eventId: "TE-003", phase: "publication", summary: "Dispatched 30861642734; cancelled superseded 30861202361", evidenceRefs: ["GitHub runs"] },
    { eventId: "TE-004", phase: "blocker", summary: "Cross-Agent had zero self-hosted runners ~75min queue", evidenceRefs: ["gh api runners total_count=0"] },
    { eventId: "TE-005", phase: "infrastructure", summary: "Runner 2.323.0 failed node24; upgraded 2.336.0", evidenceRefs: ["30861642734 failure", "30866381810 success"] },
    { eventId: "TE-006", phase: "closeout", summary: "OPERATIONAL via local publisher @ acd94ba NOOP idempotency", evidenceRefs: ["slice6-closeout-receipt-v1.json"] },
    { eventId: "TE-007", phase: "regression", summary: "Later GHA runs failed action SHA resolution", evidenceRefs: ["30867016509", "30867255487"] },
    { eventId: "TE-008", phase: "operator", summary: "User corrected run cancellation and Direct Connect path", evidenceRefs: ["user messages"] },
  ],
});

writeJson("code-touch-summary.json", {
  schemaVersion: "code-touch-summary-v1@1.0.0",
  harvestId: HARVEST_ID,
  generatedAt: AS_OF,
  repos: [
    { repo: "CG-Platform-Governance-MCP", mergeCommits: ["6c44cbc", "270148c"], role: "contract v2" },
    { repo: "CG-Failure-Intelligence-MCP", mergeCommits: ["0136815"], role: "FI idempotency" },
    { repo: "CG-AppBuilder-MCP", mergeCommits: ["49aa77fb"], role: "IMP registry" },
    { repo: "CapitalGlass-Cross-Agent", mergeCommits: ["22c8704", "acd94ba", "15d3d46"], role: "pointers + closeout + runner" },
  ],
  githubActionsRuns: [
    { runId: "30861202361", verdict: "cancelled" },
    { runId: "30861642734", verdict: "failure", note: "runner/node24" },
    { runId: "30866381810", verdict: "success", sha: "21c186e" },
    { runId: "30867255487", verdict: "failure", note: "action pin resolution" },
  ],
});

writeJson("thread-autopsy-bundle.json", {
  schemaVersion: "thread-autopsy-bundle-v1@1.0.0",
  harvestId: HARVEST_ID,
  tier: "T2",
  generatedAt: AS_OF,
  retrievalResult: "INDEX_HIT",
  cacheResult: "CACHE_MISS",
  duplicationCheck: {
    registryConsulted: true,
    registryPath: "work-progress/harvest-packet-registry.json",
    hubSlicesConsulted: ["BY-KIND/active-work-blockers.json", "BY-KIND/thread-autopsy-index.json"],
    commandIndexConsulted: true,
    duplicateWorkFound: true,
    notes: "Supersedes harvest-current-cross-thread-state-v2 SLICE_6_HOLD on three-way packet",
  },
  wasteLedgerStatus: "POPULATED",
  waste: [
    { wasteId: "TW-001", type: "host", description: "Dispatched index-publication before verifying Cross-Agent runners", evidenceRefs: ["TE-004"], estimatedImpact: "high", savedBy: "gh api .../actions/runners before workflow_dispatch", roiRank: 1 },
    { wasteId: "TW-002", type: "host", description: "Confused Wesley Work vs WesleyDesk Direct Connect kits", evidenceRefs: ["Z:/Office/Wes/Direct Connect"], estimatedImpact: "high", savedBy: "Read WesleyDesk Direct Connect/AGENT_START_HERE.md first", roiRank: 2 },
    { wasteId: "TW-003", type: "rework", description: "Multiple GHA dispatches after one PUBLISH_PASS", evidenceRefs: ["TE-007"], estimatedImpact: "medium", savedBy: "Verify runner online + action pins before re-dispatch", roiRank: 3 },
    { wasteId: "TW-004", type: "operator_attention", description: "ESTABLISH_WESLEYDESK SSH timeout; user clarified Z: path", evidenceRefs: ["TE-008"], estimatedImpact: "high", savedBy: "Runner registration token from WESLEY_WORK gh before SSH install", roiRank: 4 },
  ],
  operatorFriction: [
    { frictionId: "OF-001", trigger: "User corrected authoritative publication run IDs", operatorCost: "medium", systemFix: "Pin authoritative run at dispatch in closeout receipt", evidenceRefs: ["TE-008"], linkedWasteIds: ["TW-001"] },
    { frictionId: "OF-002", trigger: "Repeated status checks while runner queued offline", operatorCost: "medium", systemFix: "Pre-dispatch runner gate in Slice 6 runbook", evidenceRefs: ["TE-004"], linkedWasteIds: ["TW-001"] },
  ],
  executionDeltas: [
    {
      executionDeltaId: "ED-001",
      situation: "Slice 6 index publication after program merge",
      actualExecution: { steps: ["workflow_dispatch 30861642734", "75min queue", "SSH bootstrap attempts", "local publisher @ acd94ba"], outcome: "PARTIAL", evidenceRefs: ["slice6-closeout-receipt-v1.json"] },
      optimalExecution: { steps: ["gh api runners — expect wesleydesk online", "RUN_ON_WESLEYDESK.sh on desk", "Single dispatch", "PUBLISH_PASS + NOOP + blind retrieval"], outcome: "Single authority path", requiredPreflight: ["WesleyDesk Direct Connect/AGENT_START_HERE.md"] },
      deltaCost: { time: "high", tokens: "high", operatorFrustration: "medium" },
    },
    {
      executionDeltaId: "ED-002",
      situation: "Award THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL",
      actualExecution: { steps: ["Local index publisher WESLEYDESK", "Four gates PASS in receipt"], outcome: "PASS", evidenceRefs: ["slice6-closeout-receipt-v1.json"] },
      optimalExecution: { steps: ["GHA index-publication.yml PUBLISH_PASS on authoritative SHA"], outcome: "No break-glass local publisher", requiredPreflight: ["Runner online >= 2.336.0"] },
      deltaCost: { time: "medium", tokens: "low", operatorFrustration: "low" },
    },
  ],
  duplicateWork: [{ duplicateId: "DW-001", topic: "three-way Slice 6 HOLD", firstKnownInstance: "harvest-current-cross-thread-state-v2", thisThreadAction: "Recorded OPERATIONAL with closeout receipt", whyMissed: "Closeout landed after v2 harvest commit" }],
  roiBacklog: [
    { rank: 1, title: "Pre-dispatch runner gate for Cross-Agent index-publication", savedWasteIds: ["TW-001"], ownerRepo: "CapitalGlass-Cross-Agent", promotionClass: "POLICY_GATED" },
    { rank: 2, title: "WesleyDesk Direct Connect in Slice 6 checklist", savedWasteIds: ["TW-002", "TW-004"], ownerRepo: "CapitalGlass-Cross-Agent", promotionClass: "POLICY_GATED" },
    { rank: 3, title: "GHA action pins compatible with desk network cache", savedWasteIds: ["TW-003"], ownerRepo: "CapitalGlass-Cross-Agent", promotionClass: "HUMAN_REVIEW" },
  ],
  doNotAdvanceMap: [
    {
      award: "THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL",
      guards: ["Do not claim GHA path while runner offline", "Do not re-dispatch 30861202361", "Hub FULLY_SEEDED requires operator index:publish"],
      lastKnownEvidence: "slice6-closeout-receipt-v1.json @ acd94ba",
    },
  ],
});

const seeds = [
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-SLICE6-RUNNER-GATE-001",
    kind: "failure-pattern",
    title: "Cross-Agent publication requires WESLEYDESK runner before dispatch",
    summary: "index-publication.yml on CapitalGlass-Cross-Agent needs self-hosted wesleydesk runner; zero runners causes multi-hour queue.",
    retrievalQuestions: [
      "Why is Cross-Agent index publication stuck queued?",
      "How many self-hosted runners does Cross-Agent have?",
    ],
    evidenceRefs: ["TE-004", "thread-autopsy-bundle.json#TW-001"],
    futureAgentInstructions: {
      whenThisAppears: "Slice 6 or index-publication workflow_dispatch",
      startAt: ["WesleyDesk Direct Connect/AGENT_START_HERE.md", "BY-KIND/host-authority.json"],
      runPreflight: ["gh api repos/Capglass5708/CapitalGlass-Cross-Agent/actions/runners"],
      doNot: ["Dispatch from WESLEY_WORK RYZEN runner for Cross-Agent repo", "Assume queue means success"],
      proveBeforeClaiming: ["total_count >= 1 with labels self-hosted,wesleydesk,wsl2"],
    },
    ownerRepo: "CapitalGlass-Cross-Agent",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
  },
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-SLICE6-DIRECT-CONNECT-KIT-002",
    kind: "host-authority",
    title: "Wesley Work vs WesleyDesk Direct Connect kits",
    summary: "WESLEY_WORK kit dispatches/monitors; WESLEYDESK kit installs Cross-Agent runner — not interchangeable.",
    retrievalQuestions: [
      "Which Direct Connect kit installs Cross-Agent runner?",
      "Where is ESTABLISH_WESLEYDESK.sh?",
    ],
    evidenceRefs: ["Z:/Office/Wes/Direct Connect/Wesley Work Direct Connect", "Z:/Office/Wes/Direct Connect/WesleyDesk Direct Connect"],
    futureAgentInstructions: {
      whenThisAppears: "Slice 6 runner install or ESTABLISH_WESLEYDESK",
      startAt: ["Z:/Office/Wes/Direct Connect/WesleyDesk Direct Connect/AGENT_START_HERE.md"],
      runPreflight: ["test -d /mnt/z/Office/Wes/Direct\\ Connect/WesleyDesk\\ Direct\\ Connect"],
      doNot: ["Use RYZEN9DESK executor for Cross-Agent publication workflow", "Run ESTABLISH without registration token"],
      proveBeforeClaiming: ["wesleydesk-wsl2-cross-agent visible in gh api runners"],
    },
    ownerRepo: "CapitalGlass-Cross-Agent",
    targetSlice: "BY-KIND/host-authority.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
  },
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-SLICE6-OPERATIONAL-RECEIPT-003",
    kind: "decision-receipt",
    title: "THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL closeout authority",
    summary: "Operational award at acd94ba via local publisher with four gates PASS; cancelled run 30861202361 must not retry.",
    retrievalQuestions: [
      "Is three-way improvement intelligence operational?",
      "Which publication run was cancelled for Slice 6?",
    ],
    evidenceRefs: ["artifacts/agent-runs/three-way-agent-improvement-intelligence-v1/slice6-closeout-receipt-v1.json"],
    futureAgentInstructions: {
      whenThisAppears: "Claiming THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL",
      startAt: ["artifacts/agent-runs/three-way-agent-improvement-intelligence-v1/slice6-closeout-receipt-v1.json"],
      runPreflight: ["Read gates section — all four must pass"],
      doNot: ["Re-dispatch workflow run 30861202361", "Claim hub FULLY_SEEDED without operator publish"],
      proveBeforeClaiming: ["slice6-closeout-receipt-v1.json verdict OPERATIONAL", "runtime/index-publication/latest.json NOOP_CURRENT"],
    },
    ownerRepo: "CapitalGlass-Cross-Agent",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "AUTOMATIC",
    status: "CANDIDATE",
  },
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-SLICE6-PROOF-COMMANDS-004",
    kind: "command-receipt",
    title: "Slice 6 publication proof command chain",
    summary: "Prove publication: local or GHA PUBLISH_PASS, freshness PASS, blind retrieval PASS, second run NOOP_CURRENT.",
    retrievalQuestions: ["What commands prove Slice 6 publication gates?"],
    evidenceRefs: ["work-progress/command-index.json", "slice6-closeout-receipt-v1.json"],
    futureAgentInstructions: {
      whenThisAppears: "Verifying Slice 6 publication closeout",
      startAt: ["work-progress/command-index.json"],
      runPreflight: ["npm run index:freshness-gate", "npm run harvest:slice6-blind-retrieval"],
      doNot: ["Run index:publish from Cursor agent"],
      proveBeforeClaiming: ["PUBLISH_PASS", "POST_PUBLICATION_BLIND_RETRIEVAL_PASS", "NOOP_CURRENT"],
    },
    ownerRepo: "CapitalGlass-Cross-Agent",
    targetSlice: "work-progress/command-index.json",
    promotionClass: "AUTOMATIC",
    status: "CANDIDATE",
  },
];

for (const seed of seeds) {
  writeJson(`seed-packets/${seed.seedId}.json`, seed);
}

writeJson("seed-packet-index.json", {
  schemaVersion: "harvest-seed-packet-index-v1@1.0.0",
  harvestId: HARVEST_ID,
  generatedAt: AS_OF,
  seeds: seeds.map((s) => ({ seedId: s.seedId, kind: s.kind, title: s.title, status: s.status })),
});

console.log(`Generated ${HARVEST_ID} at ${RUN_DIR}`);
