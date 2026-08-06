#!/usr/bin/env node
/**
 * harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1 (T2)
 * Cursor evaluation ingest of ChatGPT draft (source commit eba039d on chat-gpt-harvest).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARVEST_ID = "harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1";
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const AS_OF = "2026-08-06T23:45:00.000Z";
const SOURCE_SHA = execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
const CHATGPT_SOURCE_SHA = "eba039d2f18e494d5564e0e2903295de1b8370c2";
const DE_SHA = "a161534f113b0cbb885a287986ebca1217401dde";
const PROJECT_FILE = "work-progress/projects/harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1.md";
const CLOSEOUT_HARVEST = "harvest-2026-08-06-harvest-protocol-self-learning-lane-closeout-v1";

function writeJson(rel, value) {
  const p = path.join(RUN_DIR, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function packet(base) {
  return {
    harvestVerdictContribution: "RECORDED",
    ownerMcp: base.ownerMcp ?? "user-cg-app-mcp",
    ownerIndexingStatus: base.ownerIndexingStatus ?? "indexed",
    requiredOwnerArtifact: base.requiredOwnerArtifact ?? null,
    commitRefs: base.commitRefs ?? [],
    blockers: base.blockers ?? [],
    relatedPackets: base.relatedPackets ?? [],
    projectFile: base.projectFile ?? PROJECT_FILE,
    nextAction: base.nextAction ?? "See harvest manifest packet",
    advancementGate: base.advancementGate ?? "See packet advancementGate",
    doNotAdvance: base.doNotAdvance ?? [],
    packetKind: base.packetKind,
    ...base,
  };
}

const packets = [
  packet({
    packetId: "lane-c-protocol-only-scope-v1",
    packetKind: "decision",
    packetTitle: "Lane C contains only evidence-backed harvest-protocol improvements",
    state: "RECORDED",
    packetVerdict: "POLICY_RECORDED",
    ownerRepo: "CapitalGlass-Cross-Agent",
    evidenceRefs: [
      "EVT-004",
      "harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md Lane C exclusions",
      "Data-Extraction/scripts/harvest-protocol-self-learning/lib/classify-harvest-protocol-relevance.mjs",
    ],
    decision: "Lane C excludes build findings, raw closeouts, WaveRunner lane, and automatic mutation",
    alternativesRejected: [
      "All build findings",
      "Raw closeouts or transcripts",
      "WaveRunner improvements",
      "Automatic protocol mutation",
    ],
    nextAction: "Use strict classifier on every export handoff",
    advancementGate: "classifyHarvestProtocolRelevance returns ELIGIBLE only for protocol targets",
  }),
  packet({
    packetId: "lane-c-ownership-routing-v1",
    packetKind: "decision",
    packetTitle: "Cross-Agent records/export; Data-Extraction filters/publishes; Governance approves",
    state: "RECORDED",
    packetVerdict: "OWNERSHIP_RECORDED",
    ownerRepo: "CapitalGlass-Cross-Agent",
    evidenceRefs: [
      "EVT-002",
      "EVT-005",
      "artifacts/agent-runs/harvest-protocol-self-learning-all-spokes-verification-v1/verification-closeout.json",
      CLOSEOUT_HARVEST,
    ],
    nextAction: "Do not treat L catalog as approval authority",
    advancementGate: "authority.catalogRole RETRIEVAL_ONLY in export handoff",
  }),
  packet({
    packetId: "lane-c-strict-classifier-shipped-v1",
    packetKind: "protocol_upgrade",
    packetTitle: "Strict Lane C relevance classifier shipped in Data-Extraction",
    state: "COMPLETE",
    packetVerdict: "ALREADY_IMPLEMENTED",
    ownerRepo: "Data-Extraction",
    evidenceRefs: [
      "EVT-005",
      `Data-Extraction@${DE_SHA}`,
      "scripts/harvest-protocol-self-learning/lib/classify-harvest-protocol-relevance.mjs",
    ],
    commitRefs: [`Data-Extraction@${DE_SHA}`],
    nextAction: "None — document in protocol only if gap found",
    advancementGate: "npm run test:harvest-protocol-self-learning exit 0",
    doNotAdvance: ["Re-export classifier as new Lane C candidate without protocol doc gap"],
  }),
  packet({
    packetId: "lane-c-publication-truth-chain-v1",
    packetKind: "protocol_upgrade",
    packetTitle: "Lane C publication truth tracked separately from hub publish",
    state: "COMPLETE",
    packetVerdict: "DOCUMENTED",
    ownerRepo: "CapitalGlass-Cross-Agent",
    evidenceRefs: [
      "EVT-006",
      "harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md protocolSelfLearning block",
      CLOSEOUT_HARVEST,
    ],
    nextAction: "Report exportStatus, catalogPublishStatus, retrievalStatus independently at closeout",
    advancementGate: "protocolSelfLearning fields present in manifest when Lane C used",
  }),
  packet({
    packetId: "lane-c-z-mirror-authority-drift-v1",
    packetKind: "protocol_upgrade",
    packetTitle: "Z-mirror can overwrite harvest/protocol when docs/runbooks lag Git canonical",
    state: "OPEN",
    packetVerdict: "WARN",
    ownerRepo: "CapitalGlass-Cross-Agent",
    evidenceRefs: [
      "EVT-009",
      "TE-010",
      "harvest/z-mirror-sync-receipt.json",
      "missing source: Data-Extraction/docs/platform/CURSOR_HARVEST_INGEST_CLOSEOUT_WAVE_SDLC_V1.md",
      CLOSEOUT_HARVEST,
    ],
    nextAction: "harvest-z-mirror-source-repair-v1 — sync docs/runbooks from harvest/protocol before mirror",
    advancementGate: "npm run test:harvest exit 0 without Z_HARVEST_MIRROR_SYNC_PARTIAL",
    doNotAdvance: ["Treat as Lane C regression", "Overwrite harvest/protocol from stale runbooks"],
  }),
  packet({
    packetId: "lane-c-repeated-ownership-friction-v1",
    packetKind: "repeated_work",
    packetTitle: "Ownership boundaries restated across spokes",
    state: "DOCUMENTED",
    packetVerdict: "DUPLICATE_AWARE",
    ownerRepo: "CapitalGlass-Cross-Agent",
    duplicateId: "DUP-LANE-OWNERSHIP-001",
    firstKnownInstance: CLOSEOUT_HARVEST,
    priorIndexSlice: "work-progress/harvest-packet-registry.json",
    whyMissed: "Spoke matrix not built before implementation waves",
    evidenceRefs: ["EVT-002", "HP-006", CLOSEOUT_HARVEST],
    nextAction: "Consult ownership registry at lane design start",
    advancementGate: "not-required",
  }),
  packet({
    packetId: "lane-c-spoke-matrix-lesson-v1",
    packetKind: "faster_path",
    packetTitle: "Classified lanes need required/optional/N/A spoke matrix early",
    state: "RECORDED",
    packetVerdict: "LESSON_RECORDED",
    ownerRepo: "CapitalGlass-Cross-Agent",
    situation: "Designing classified cross-repo Lane C",
    whatHappened: "AppBuilder/Governance optional spokes resolved late in verification wave",
    rightFirstMove: "Build spoke matrix with strict eligibility before implementation",
    requiredGuard: "No application fanout without confirmed gap",
    evidenceRefs: [
      "EVT-007",
      "artifacts/agent-runs/harvest-protocol-self-learning-all-spokes-verification-v1/verification-closeout.json",
    ],
    nextAction: "Route to generic harvest process docs — not Lane C protocol patch unless schema gap",
    advancementGate: "not-required",
  }),
  packet({
    packetId: "blocker-z-mirror-wave-sdlc-source-v1",
    packetKind: "blocker",
    packetTitle: "Z-mirror missing Data-Extraction wave SDLC source — separate maintenance",
    state: "OPEN",
    packetVerdict: "DEFERRED",
    ownerRepo: "Data-Extraction",
    blockerId: "BLOCK-Z-MIRROR-SOURCE-MISSING",
    status: "OPEN_SEPARATE_MAINTENANCE",
    proofCommandId: "test:harvest",
    evidenceRefs: [
      "EVT-009",
      "harvest-z-mirror-source-repair-v1",
      "scripts/harvest/lib/z-harvest-mirror-lib.mjs Z_HARVEST_EXTERNAL_PROTOCOL_SOURCES",
    ],
    blockers: ["Data-Extraction/docs/platform/CURSOR_HARVEST_INGEST_CLOSEOUT_WAVE_SDLC_V1.md missing"],
    nextAction: "Restore wave SDLC doc or remove from mirror source list until present",
    advancementGate: "syncZHarvestMirror errors.length === 0 with requireZPublication false",
  }),
  packet({
    packetId: "lane-c-export-command-v1",
    packetKind: "command",
    packetTitle: "Cross-Agent protocol-only export command",
    state: "COMPLETE",
    packetVerdict: "SHIPPED",
    ownerRepo: "CapitalGlass-Cross-Agent",
    command: "npm run harvest:export:protocol-self-learning -- --harvest-id=<id> --json",
    host: "Cross-Agent",
    provesGate: "Protocol-only handoff export",
    expectedPassSignal: "protocolImprovementCandidates only in handoff JSON",
    evidenceRefs: [
      "scripts/harvest/export-protocol-self-learning.mjs",
      `CapitalGlass-Cross-Agent@${SOURCE_SHA}`,
      "PR #20 merged",
    ],
    commitRefs: [`CapitalGlass-Cross-Agent@${SOURCE_SHA}`],
    nextAction: "Run only after harvest:validate PASS",
    advancementGate: "npm run test:protocol-self-learning-export exit 0",
  }),
  packet({
    packetId: "lane-c-verify-command-v1",
    packetKind: "command",
    packetTitle: "Data-Extraction Lane C verify command",
    state: "COMPLETE",
    packetVerdict: "SHIPPED",
    ownerRepo: "Data-Extraction",
    command: "npm run harvest-protocol:self-learning:verify -- --harvest-id=<id> --json",
    host: "Data-Extraction",
    provesGate: "Package/index/retrieval validation",
    expectedPassSignal: "RETRIEVAL_PASS; rawScanRequired=false",
    evidenceRefs: [
      `Data-Extraction@${DE_SHA}`,
      "scripts/harvest-protocol-self-learning/verify.mjs",
      "PR #31 merged",
    ],
    commitRefs: [`Data-Extraction@${DE_SHA}`],
    nextAction: "HARVEST_PROTOCOL_CATALOG_ROOT=/mnt/l for live verify",
    advancementGate: "harvest-protocol:self-learning:verify read-only — no republish",
  }),
];

writeJson("thread-event-inventory.json", {
  schemaVersion: "thread-event-inventory-v1@1.0.0",
  harvestId: HARVEST_ID,
  threadScope:
    "ChatGPT draft evaluation — Harvest Protocol Self-Learning Lane C scope, ownership, classifier, publication truth, z-mirror maintenance",
  generatedAt: AS_OF,
  chatgptSourceCommitSha: CHATGPT_SOURCE_SHA,
  events: [
    { eventId: "EVT-001", phase: "baseline", summary: "WaveRunner catalog separated from Lane C authority", evidenceRefs: ["waverunner-self-improvement-harvest-routing-v1", CLOSEOUT_HARVEST] },
    { eventId: "EVT-002", phase: "baseline", summary: "WaveRunner flow reported implemented and closed", evidenceRefs: [CLOSEOUT_HARVEST, "TE-002"] },
    { eventId: "EVT-003", phase: "baseline", summary: "Lane C target L:\\02-catalog\\Harvest\\Harvest Protocol Self Learning", evidenceRefs: ["harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md", "BY-KIND/harvest-protocol-self-learning-index.json"] },
    { eventId: "EVT-004", phase: "operator", summary: "Operator narrowed Lane C to harvest-protocol improvements only", evidenceRefs: [CLOSEOUT_HARVEST, "chatgpt-findings-source.md HP-001"] },
    { eventId: "EVT-005", phase: "implementation", summary: "Cross-Agent export and Data-Extraction strict pipeline shipped", evidenceRefs: ["PR #20", "PR #31", SOURCE_SHA, DE_SHA] },
    { eventId: "EVT-006", phase: "implementation", summary: "Protocol docs aligned with Lane C publication truth fields", evidenceRefs: ["harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md", CLOSEOUT_HARVEST] },
    { eventId: "EVT-007", phase: "verification", summary: "All spokes verified GO_WITH_WARN; app repos N/A", evidenceRefs: ["artifacts/agent-runs/harvest-protocol-self-learning-all-spokes-verification-v1/verification-closeout.json"] },
    { eventId: "EVT-008", phase: "verification", summary: "Lane C operationally complete at GO_WITH_WARN", evidenceRefs: [CLOSEOUT_HARVEST, "lane-c-all-spokes-go-with-warn-v1"] },
    { eventId: "EVT-009", phase: "maintenance", summary: "Z-mirror source repair deferred harvest-z-mirror-source-repair-v1", evidenceRefs: ["harvest/z-mirror-sync-receipt.json", "TE-012"] },
  ],
});

writeJson("thread-autopsy-bundle.json", {
  schemaVersion: "cross-agent-thread-autopsy-bundle-v1@1.0.0",
  harvestId: HARVEST_ID,
  tier: "T2",
  wasteLedgerStatus: "POPULATED",
  waste: [
    {
      wasteId: "TW-001",
      type: "operator_attention",
      description: "Operator corrected Lane C to protocol-only scope",
      evidenceRefs: ["EVT-004", "chatgpt-findings-source.md"],
      estimatedImpact: "high",
      savedBy: "Mandatory selfLearningObject and exclusion list in lane templates",
      roiRank: 1,
    },
    {
      wasteId: "TW-002",
      type: "context",
      description: "Ownership boundaries repeated across spokes",
      evidenceRefs: ["EVT-002", "lane-c-repeated-ownership-friction-v1"],
      estimatedImpact: "medium",
      savedBy: "Owner-role table and spoke matrix at lane start",
      roiRank: 2,
    },
    {
      wasteId: "TW-003",
      type: "verification",
      description: "Z-mirror partial sync with missing external source and runbook lag risk",
      evidenceRefs: ["EVT-009", "lane-c-z-mirror-authority-drift-v1"],
      estimatedImpact: "high",
      savedBy: "Source completeness check + runbook sync before mirror",
      roiRank: 3,
    },
  ],
  operatorFriction: [
    {
      frictionId: "OF-001",
      trigger: "Ambiguous meaning of self-learning in early thread",
      operatorCost: "medium",
      systemFix: "Require selfLearningObject field in lane templates",
      evidenceRefs: ["EVT-004", "chatgpt-findings-source.md OF-001"],
      linkedWasteIds: ["TW-001"],
    },
    {
      frictionId: "OF-002",
      trigger: "Repeated closure confirmation despite separate z-mirror warning",
      operatorCost: "low",
      systemFix: "Closeout states whether GO_WITH_WARN reopens architecture",
      evidenceRefs: ["EVT-008", "EVT-009"],
      linkedWasteIds: ["TW-003"],
    },
  ],
  executionDeltas: [
    {
      executionDeltaId: "ED-001",
      situation: "Lane ownership design",
      actualExecution: {
        steps: ["Processing owner ambiguous across waves"],
        outcome: "Eventually separated record/processor/catalog/approval roles",
        evidenceRefs: ["EVT-002", CLOSEOUT_HARVEST],
      },
      optimalExecution: {
        steps: ["Declare owner-role table before implementation"],
        outcome: "Fewer repeated ownership discussions",
        evidenceRefs: ["lane-c-ownership-routing-v1"],
      },
      deltaCost: { time: "medium", tokens: "medium", operatorFrustration: "low" },
    },
    {
      executionDeltaId: "ED-002",
      situation: "Self-learning object definition",
      actualExecution: {
        steps: ["Broad self-learning scope initially"],
        outcome: "Operator narrowed to harvest-protocol only",
        evidenceRefs: ["EVT-004"],
      },
      optimalExecution: {
        steps: ["Declare exact self-learning object and exclusions in mission prompt"],
        outcome: "No scope correction mid-thread",
        evidenceRefs: ["lane-c-protocol-only-scope-v1"],
      },
      deltaCost: { time: "low", tokens: "medium", operatorFrustration: "medium" },
    },
    {
      executionDeltaId: "ED-003",
      situation: "Spoke verification",
      actualExecution: {
        steps: ["Optional spokes resolved in late verification wave"],
        outcome: "GO_WITH_WARN with deferred z-mirror maintenance",
        evidenceRefs: ["EVT-007", "EVT-008"],
      },
      optimalExecution: {
        steps: ["Spoke matrix with required/optional/N/A before code"],
        outcome: "Faster closure with same warnings isolated",
        evidenceRefs: ["lane-c-spoke-matrix-lesson-v1"],
      },
      deltaCost: { time: "medium", tokens: "low", operatorFrustration: "low" },
    },
  ],
  wrongMoves: [],
  duplicateWork: [
    {
      duplicateId: "DUP-001",
      subject: "Ownership-boundary discussions",
      firstKnownInstance: CLOSEOUT_HARVEST,
      priorIndexSlice: "work-progress/harvest-packet-registry.json",
      whyRepeated: "No spoke matrix at lane start",
      avoidableBy: "Registry lookup + owner-role table first",
      recommendedAction: "index",
    },
    {
      duplicateId: "DUP-002",
      subject: "Publication versus authority distinction",
      firstKnownInstance: "harvest-2026-08-06-office-admin-pr29-github-health-v1",
      priorIndexSlice: "BY-KIND/harvest-protocol-self-learning-index.json",
      whyRepeated: "Lane C and hub publish tracked separately but restated often",
      avoidableBy: "L proposal ≠ approved Git change ≠ Z CURRENT",
      recommendedAction: "preserve_distinction",
    },
  ],
  roiBacklog: [
    { rank: 1, title: "Repair Z-mirror sources and runbook sync", whyItPays: "Prevents protocol authority drift", effort: "medium", ownerRepo: "CapitalGlass-Cross-Agent", savedWasteIds: ["TW-003"], seedAs: "command" },
    { rank: 2, title: "selfLearningObject in lane templates", whyItPays: "Prevents scope correction", effort: "low", ownerRepo: "CapitalGlass-Cross-Agent", savedWasteIds: ["TW-001"], seedAs: "protocol" },
    { rank: 3, title: "Spoke matrix before cross-repo lanes", whyItPays: "Reduces verification churn", effort: "low", ownerRepo: "CapitalGlass-Cross-Agent", savedWasteIds: ["TW-002"], seedAs: "lesson" },
    { rank: 4, title: "Independent Lane C publication truth block", whyItPays: "Clearer closeouts", effort: "low", ownerRepo: "CapitalGlass-Cross-Agent", savedWasteIds: [], seedAs: "protocol" },
    { rank: 5, title: "Registry lookup before duplication claims", whyItPays: "Accurate DUP status", effort: "low", ownerRepo: "CapitalGlass-Cross-Agent", savedWasteIds: [], seedAs: "command" },
  ],
  doNotAdvanceMap: [
    {
      awardOrVerdict: "LANE_C_PUBLISHED",
      currentStatus: "HOLD",
      doNotClaimUntil: ["harvest-protocol:self-learning:verify RETRIEVAL_PASS", "INGESTION_COMPLETE.json"],
      lastKnownEvidence: ["protocolSelfLearning.catalogPublishStatus not-run for this harvest"],
    },
    {
      awardOrVerdict: "PROTOCOL_MERGED_TO_GIT",
      currentStatus: "HOLD",
      doNotClaimUntil: ["Governance approval", "feature branch merge"],
      lastKnownEvidence: ["authorityStatus PROPOSAL", "automaticProtocolMutation false"],
    },
  ],
  duplicationCheck: {
    registryConsulted: true,
    hubSlicesConsulted: [
      "BY-KIND/harvest-protocol-self-learning-index.json",
      "BY-KIND/thread-autopsy-index.json",
      "work-progress/harvest-packet-registry.json",
    ],
    commandIndexConsulted: true,
    checkedAt: AS_OF,
    preflightReceiptHash: "pending-duplication-preflight",
  },
});

const seedPackets = [
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-THREAD-HARVEST-PROTOCOL-STRICT-CLASSIFIER-001",
    kind: "protocol-upgrade",
    title: "Protocol self-learning rejects general build intelligence",
    summary: "Lane C accepts only evidence-backed harvest-protocol changes via classifyHarvestProtocolRelevance.",
    retrievalQuestions: ["What belongs in Lane C?", "Why was a build finding rejected?"],
    evidenceRefs: [
      "Data-Extraction/scripts/harvest-protocol-self-learning/lib/classify-harvest-protocol-relevance.mjs",
      "EVT-005",
      "lane-c-strict-classifier-shipped-v1",
    ],
    futureAgentInstructions: {
      whenThisAppears: "Mixed harvest findings",
      startAt: ["protocolImprovementCandidates[]", "classify-harvest-protocol-relevance.mjs"],
      runPreflight: ["test:protocol-self-learning-export", "test:harvest-protocol-self-learning"],
      doNot: ["Copy raw closeouts", "Bypass relevance with generic OTHER"],
      proveBeforeClaiming: ["accepted protocol count", "rejected unrelated count"],
    },
    ownerRepo: "Data-Extraction",
    targetSlice: "BY-KIND/harvest-protocol-self-learning-index.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
  },
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-THREAD-HARVEST-Z-MIRROR-GIT-GUARD-001",
    kind: "failure-pattern",
    title: "Stale Z-mirror and lagging runbooks can overwrite Git harvest protocols",
    summary:
      "Mirror sync must verify all external sources exist; align docs/runbooks with harvest/protocol before repo mirror when Lane C sections present.",
    retrievalQuestions: ["Why did test:harvest warn on z-mirror?", "How should Git authority be protected?"],
    evidenceRefs: [
      "harvest/z-mirror-sync-receipt.json",
      "lane-c-z-mirror-authority-drift-v1",
      "EVT-009",
      CLOSEOUT_HARVEST,
    ],
    futureAgentInstructions: {
      whenThisAppears: "Mirror sync touches tracked protocol docs",
      startAt: ["scripts/tests/run-harvest-z-mirror-sync.test.mjs", "harvest/z-mirror-sync-receipt.json"],
      runPreflight: ["git status --short harvest/protocol", "grep -c 'Lane C' docs/runbooks vs harvest/protocol"],
      doNot: ["Overwrite from incomplete Z source list", "Commit mirror-induced Lane C regression"],
      proveBeforeClaiming: ["syncZHarvestMirror errors empty or explicitly deferred", "tracked protocol files match canonical"],
    },
    ownerRepo: "CapitalGlass-Cross-Agent",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
  },
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-THREAD-CLASSIFIED-LANE-SPOKE-MATRIX-001",
    kind: "lesson",
    title: "Classified lanes require a spoke matrix before implementation",
    summary: "Mark every spoke required, optional, N/A, or blocked before cross-repo lane work.",
    retrievalQuestions: ["Does AppBuilder need a bridge?", "Which repos must change?"],
    evidenceRefs: [
      "EVT-007",
      "artifacts/agent-runs/harvest-protocol-self-learning-all-spokes-verification-v1/verification-closeout.json",
      "lane-c-spoke-matrix-lesson-v1",
    ],
    futureAgentInstructions: {
      whenThisAppears: "A lane spans multiple control/data layers",
      startAt: ["ownership registry", "all-spokes verification template"],
      runPreflight: ["build spoke matrix", "verify commands per spoke"],
      doNot: ["Fan out by default", "Create parallel schemas"],
      proveBeforeClaiming: ["evidence for every required spoke"],
    },
    ownerRepo: "CapitalGlass-Cross-Agent",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "HUMAN_REVIEW",
    status: "CANDIDATE",
  },
];

for (const sp of seedPackets) {
  writeJson(`seed-packets/${sp.seedId}.json`, sp);
}

writeJson("seed-packet-index.json", {
  schemaVersion: "harvest-seed-packet-index-v1@1.0.0",
  harvestId: HARVEST_ID,
  generatedAt: AS_OF,
  seedPacketIds: seedPackets.map((s) => s.seedId),
  seedPacketPaths: seedPackets.map(
    (s) => `artifacts/agent-runs/${HARVEST_ID}/seed-packets/${s.seedId}.json`,
  ),
});

writeJson("harvest-manifest-v1.json", {
  schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
  harvestId: HARVEST_ID,
  missionClass: "chat-thread-closeout-autopsy-harvest-chatgpt-v1",
  sourceCommitSha: SOURCE_SHA,
  sourceBranch: "main",
  sourceRepo: "CapitalGlass-Cross-Agent",
  chatgptSourceCommitSha: CHATGPT_SOURCE_SHA,
  chatgptSourceBranch: "chat-gpt-harvest",
  createdAt: AS_OF,
  updatedAt: AS_OF,
  retrievalResult: "INDEX_HIT",
  cacheResult: "CACHE_MISS",
  rawScanRequired: false,
  overallHarvestVerdict: "HARVEST_COMPLETE",
  doNotAdvance: [
    "Treat Lane C L output as approved protocol authority",
    "Auto-merge or auto-publish harvested protocol candidates",
    "Route raw closeouts, transcripts, app defects, or build lessons into Lane C",
    "Fan Lane C into application repos",
    "Reopen Lane C architecture because of separate z-mirror warning",
    "Claim HARVEST_COMPLETE from ChatGPT draft without Cursor validation",
  ],
  threadAutopsy: {
    tier: "T2",
    bundlePath: `artifacts/agent-runs/${HARVEST_ID}/thread-autopsy-bundle.json`,
    seedPacketIndexPath: `artifacts/agent-runs/${HARVEST_ID}/seed-packet-index.json`,
    counts: { waste: 3, seeds: 3, roiItems: 5, operatorFriction: 2, executionDeltas: 3 },
  },
  projection: {
    projectionSyncStatus: "not-run",
    hubPublishStatus: "not-run",
    hubPublishBlocker: "Operator runs harvest:publish-hub-seed + index:publish — NOT_RUN_BY_CURSOR",
    note: "ChatGPT draft evaluated and canonicalized by Cursor — hub publish deferred",
  },
  protocolSelfLearning: {
    sourceProtocolId: "chat-thread-closeout-autopsy-harvest-v1",
    sourceProtocolVersion: "1.0.0",
    eligibleCandidates: 1,
    rejectedUnrelatedCandidates: 0,
    exportStatus: "pending-evaluation-export",
    dataExtractionStatus: "not-run",
    catalogPublishStatus: "not-run",
    retrievalStatus: "not-run",
    targetCatalog: "L:\\02-catalog\\Harvest\\Harvest Protocol Self Learning",
    authorityStatus: "PROPOSAL",
    automaticProtocolMutation: false,
    note: "Cursor evaluation harvest — export after validate PASS",
  },
  ledgerLineage: {
    ledgerPath: "work-progress/ACTIVE_WORK.md",
    note: "ChatGPT lane-c-v1 draft evaluation — see evaluation artifacts folder",
  },
  relatedRepos: [
    { repo: "Data-Extraction", branch: "main", commitSha: DE_SHA, role: "Lane C processing" },
    { repo: "CapitalGlass-Cross-Agent", branch: "chat-gpt-harvest", commitSha: CHATGPT_SOURCE_SHA, role: "ChatGPT draft source" },
  ],
  supersededClaims: [
    {
      claimId: "chatgpt-draft-lane-c-operational",
      supersededBy: "lane-c-all-spokes-go-with-warn-v1",
      reason: "ChatGPT draft recorded thread events; operational state verified in lane-closeout harvest",
    },
  ],
  protocolImprovementCandidates: [
    {
      candidateId: "HPC-Z-MIRROR-RUNBOOK-SYNC-001",
      category: "HARVEST_AUTHORITY_BOUNDARY",
      title: "Sync docs/runbooks from harvest/protocol before z-mirror when Lane C present",
      protocolProblem:
        "z-harvest-mirror copies docs/runbooks to harvest/protocol; when runbooks lag Git canonical Lane C sections are stripped during test:harvest",
      currentProtocolBehavior:
        "Z_HARVEST_PROTOCOL_SOURCES uses docs/runbooks as upstream; harvest/protocol edits can be overwritten",
      desiredProtocolBehavior:
        "Single canonical direction: harvest/protocol → docs/runbooks → mirror, or fail closed when runbooks lack sections present in harvest/protocol",
      proposedProtocolChange:
        "Add pre-mirror hash guard comparing Lane C markers in runbooks vs harvest/protocol; block overwrite on mismatch",
      targetProtocolFiles: [
        "scripts/harvest/lib/z-harvest-mirror-lib.mjs",
        "harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md",
        "docs/runbooks/chat-thread-closeout-autopsy-harvest-v1.md",
      ],
      targetValidators: ["scripts/tests/run-harvest-z-mirror-sync.test.mjs"],
      targetCommands: ["npm run harvest:sync-z-mirror", "npm run test:harvest"],
      evidenceRefs: [
        "EVT-009",
        "lane-c-z-mirror-authority-drift-v1",
        CLOSEOUT_HARVEST,
        "harvest/z-mirror-sync-receipt.json",
      ],
      authorityStatus: "PROPOSAL",
      reviewStatus: "PENDING",
      automaticImplementationEligible: false,
      requiredGates: ["test:harvest", "harvest:validate"],
      rollbackPlan: "Revert mirror guard; restore harvest/protocol from Git",
    },
  ],
  packets,
});

fs.mkdirSync(path.dirname(PROJECT_FILE), { recursive: true });
if (!fs.existsSync(path.join(REPO_ROOT, PROJECT_FILE))) {
  fs.writeFileSync(
    path.join(REPO_ROOT, PROJECT_FILE),
    `# harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1\n\nChatGPT draft evaluation — Lane C protocol self-learning thread.\n\n**Source:** chat-gpt-harvest@${CHATGPT_SOURCE_SHA}\n`,
    "utf8",
  );
}

function upsertRegistryAndBoundary() {
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
        requiredOwnerArtifact: null,
        crossAgentRole: "ChatGPT lane-c draft evaluation",
        ownerRepoRole: p.packetTitle,
        currentGap: p.state === "OPEN" ? p.packetTitle : null,
      });
    }
  }
  registry.updatedAt = AS_OF;
  boundary.updatedAt = AS_OF;
  fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  fs.writeFileSync(boundaryPath, `${JSON.stringify(boundary, null, 2)}\n`, "utf8");
}

upsertRegistryAndBoundary();
console.log(`Generated ${HARVEST_ID} at ${RUN_DIR}`);
