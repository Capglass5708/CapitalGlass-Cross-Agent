#!/usr/bin/env node
/**
 * harvest-2026-08-06-harvest-protocol-self-learning-lane-closeout-v1 (T2)
 * Thread: Lane C implementation, protocol alignment, production acceptance, all-spokes verification.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARVEST_ID = "harvest-2026-08-06-harvest-protocol-self-learning-lane-closeout-v1";
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const AS_OF = "2026-08-06T23:35:00.000Z";
const SOURCE_SHA = execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
const DE_SHA = "a161534f113b0cbb885a287986ebca1217401dde";
const PRODUCTION_HARVEST = "harvest-2026-08-06-office-admin-pr29-github-health-v1";

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
    projectFile: base.projectFile ?? "work-progress/projects/INDEX.md",
    nextAction: base.nextAction ?? "See harvest manifest packet",
    advancementGate: base.advancementGate ?? "See packet advancementGate",
    doNotAdvance: base.doNotAdvance ?? [],
    packetKind: base.packetKind,
    ...base,
  };
}

const packets = [
  packet({
    packetId: "lane-c-cross-agent-export-shipped-v1",
    packetKind: "decision",
    packetTitle: "Lane C export handoff shipped on Cross-Agent main via PR #20",
    state: "COMPLETE",
    packetVerdict: "SHIPPED",
    ownerRepo: "CapitalGlass-Cross-Agent",
    evidenceRefs: ["TE-003", "TE-004", `Cross-Agent@${SOURCE_SHA}`, "PR #20 merged"],
    commitRefs: [`CapitalGlass-Cross-Agent@${SOURCE_SHA}`],
    nextAction: "Use harvest:export:protocol-self-learning after harvest:validate PASS",
    advancementGate: "npm run test:protocol-self-learning-export exit 0",
  }),
  packet({
    packetId: "lane-c-data-extraction-pipeline-shipped-v1",
    packetKind: "decision",
    packetTitle: "Data-Extraction ingest→publish-l→verify pipeline shipped via PR #31",
    state: "COMPLETE",
    packetVerdict: "SHIPPED",
    ownerRepo: "Data-Extraction",
    evidenceRefs: ["TE-005", `Data-Extraction@${DE_SHA}`, "PR #31 merged"],
    commitRefs: [`Data-Extraction@${DE_SHA}`],
    nextAction: "HARVEST_PROTOCOL_CATALOG_ROOT=/mnt/l for L publication",
    advancementGate: "npm run test:harvest-protocol-self-learning exit 0",
  }),
  packet({
    packetId: "lane-c-protocol-docs-aligned-v1",
    packetKind: "protocol-upgrade",
    packetTitle: "Lane C documented in harvest/protocol CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md",
    state: "COMPLETE",
    packetVerdict: "DOCUMENTED",
    ownerRepo: "CapitalGlass-Cross-Agent",
    evidenceRefs: ["TE-006", "harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md Lane C sections"],
    nextAction: "Sync docs/runbooks source to match harvest/protocol before z-mirror",
    advancementGate: "grep -c 'Lane C' docs/runbooks/chat-thread-closeout-autopsy-harvest-v1.md > 0",
    doNotAdvance: ["Run harvest:sync-z-mirror without syncing docs/runbooks first — overwrites Lane C"],
  }),
  packet({
    packetId: "lane-c-production-acceptance-v1",
    packetKind: "command",
    packetTitle: "Production Lane C publish proven on office-admin harvest",
    state: "COMPLETE",
    packetVerdict: "RETRIEVAL_PASS",
    ownerRepo: "Data-Extraction",
    evidenceRefs: [
      "TE-007",
      PRODUCTION_HARVEST,
      "sha256:0111d8227cddb9946ca12fc5097d346fbeb6e90e92cf70a187a59e63d43463d5",
      "BY-KIND/harvest-protocol-self-learning-index.json",
    ],
    nextAction: "Governance review for protocol promotion — not auto-merge",
    advancementGate: "harvest-protocol:self-learning:verify RETRIEVAL_PASS",
  }),
  packet({
    packetId: "lane-c-all-spokes-go-with-warn-v1",
    packetKind: "decision",
    packetTitle: "All-spokes verification GO_WITH_WARN — Lane C operational",
    state: "COMPLETE",
    packetVerdict: "GO_WITH_WARN",
    ownerRepo: "CapitalGlass-Cross-Agent",
    evidenceRefs: [
      "TE-008",
      "artifacts/agent-runs/harvest-protocol-self-learning-all-spokes-verification-v1/verification-closeout.json",
    ],
    nextAction: "Defer harvest-z-mirror-source-repair-v1 as separate maintenance",
    advancementGate: "test:harvest z-mirror source restored",
  }),
  packet({
    packetId: "mistake-verify-republished-empty-v1",
    packetKind: "mistake",
    packetTitle: "verify.mjs initially re-published empty Lane C package",
    state: "FIXED",
    packetVerdict: "PASS",
    ownerRepo: "Data-Extraction",
    evidenceRefs: ["TE-009", "stale folder 6ac721898b deleted"],
    wrongMoveId: "WM-001",
    actualExecution: "verify called publish path",
    optimalExecution: "verify read-only like WaveRunner verify",
    preventiveControl: "harvest-protocol:self-learning:verify read receipt only",
  }),
  packet({
    packetId: "mistake-z-mirror-overwrote-protocol-v1",
    packetKind: "mistake",
    packetTitle: "test:harvest z-mirror overwrote Lane C protocol docs from stale docs/runbooks",
    state: "OPEN",
    packetVerdict: "WARN",
    ownerRepo: "CapitalGlass-Cross-Agent",
    evidenceRefs: ["TE-010", "docs/runbooks lacks Lane C", "harvest-z-mirror-source-repair-v1"],
    wrongMoveId: "WM-002",
    actualExecution: "z-mirror copies docs/runbooks without Lane C",
    optimalExecution: "Single canonical source or copy harvest/protocol to runbooks before mirror",
    preventiveControl: "harvest-z-mirror-source-repair-v1",
  }),
  packet({
    packetId: "faster-path-l-protocol-stale-v1",
    packetKind: "faster_path",
    packetTitle: "L 02-catalog protocol was stale until operator @ run file",
    state: "RESOLVED",
    packetVerdict: "SYNCED",
    ownerRepo: "CapitalGlass-Cross-Agent",
    evidenceRefs: ["TE-011", "L file 576→749 lines", "17 Lane C mentions"],
    situation: "Operator @ L protocol for closeout",
    whatHappened: "L copy missing Lane C (576 lines)",
    rightFirstMove: "Copy from harvest/protocol Git canonical or run publish step",
    requiredGuard: "Document L 02-catalog/Harvest/protocol sync authority in protocol",
  }),
  packet({
    packetId: "blocker-test-harvest-z-mirror-v1",
    packetKind: "blocker",
    packetTitle: "test:harvest fails z-mirror missing Data-Extraction wave SDLC source",
    state: "OPEN",
    packetVerdict: "DEFERRED",
    ownerRepo: "Data-Extraction",
    evidenceRefs: ["TE-012", "verification-closeout.json tests WARN"],
    blockers: ["missing docs/platform/CURSOR_HARVEST_INGEST_CLOSEOUT_WAVE_SDLC_V1.md"],
    nextAction: "harvest-z-mirror-source-repair-v1",
    advancementGate: "npm run test:harvest exit 0",
  }),
];

writeJson("thread-event-inventory.json", {
  schemaVersion: "thread-event-inventory-v1@1.0.0",
  harvestId: HARVEST_ID,
  threadScope:
    "Harvest Protocol Self-Learning Lane C — Cross-Agent export, Data-Extraction pipeline, protocol alignment, production acceptance, all-spokes verification",
  generatedAt: AS_OF,
  events: [
    { eventId: "TE-001", phase: "operator", summary: "Milestone harvest-protocol-self-learning-only-v1 implement Lane C", evidenceRefs: ["user mission prompt"] },
    { eventId: "TE-002", phase: "baseline", summary: "WaveRunner lane exists; Lane C separate at L Harvest Protocol Self Learning", evidenceRefs: ["waverunner-self-improvement-harvest-routing-v1"] },
    { eventId: "TE-003", phase: "implementation", summary: "Cross-Agent export contract + harvest:export:protocol-self-learning", evidenceRefs: ["PR #20", SOURCE_SHA] },
    { eventId: "TE-004", phase: "implementation", summary: "sync-derived hash fix after prompt-harvest mutation", evidenceRefs: ["sync-derived.mjs recompute"] },
    { eventId: "TE-005", phase: "implementation", summary: "Data-Extraction full pipeline ingest→publish-l→verify", evidenceRefs: ["PR #31", DE_SHA] },
    { eventId: "TE-006", phase: "implementation", summary: "Protocol alignment — Lane C in harvest/protocol only (existing files)", evidenceRefs: ["harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md"] },
    { eventId: "TE-007", phase: "verification", summary: "Production publish harvest-2026-08-06-office-admin-pr29-github-health-v1 RETRIEVAL_PASS", evidenceRefs: ["0111d822 hash", "2 protocol candidates"] },
    { eventId: "TE-008", phase: "verification", summary: "all-spokes-verification GO_WITH_WARN", evidenceRefs: ["verification-closeout.json"] },
    { eventId: "TE-009", phase: "mistake", summary: "verify.mjs re-published empty package — fixed read-only", evidenceRefs: ["stale 6ac721898b folder deleted"] },
    { eventId: "TE-010", phase: "mistake", summary: "z-mirror docs/runbooks stale vs harvest/protocol Lane C", evidenceRefs: ["docs/runbooks 0 Lane C matches"] },
    { eventId: "TE-011", phase: "operator", summary: "@ L protocol run file — synced 749 lines from Git canonical", evidenceRefs: ["L:/02-catalog/Harvest/protocol"] },
    { eventId: "TE-012", phase: "verification", summary: "test:harvest WARN pre-existing z-mirror source gap", evidenceRefs: ["verification-closeout.json tests"] },
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
      type: "rework",
      description: "verify.mjs republished empty Lane C package requiring stale folder cleanup",
      evidenceRefs: ["TE-009"],
      estimatedImpact: "medium",
      savedBy: "read-only verify pattern",
      roiRank: 2,
    },
    {
      wasteId: "TW-002",
      type: "verification",
      description: "docs/runbooks and L 02-catalog protocol lagged harvest/protocol Lane C",
      evidenceRefs: ["TE-010", "TE-011"],
      estimatedImpact: "medium",
      savedBy: "Single canonical source + mirror guard",
      roiRank: 1,
    },
    {
      wasteId: "TW-003",
      type: "verification",
      description: "test:harvest z-mirror blocked on missing Data-Extraction wave SDLC doc",
      evidenceRefs: ["TE-012"],
      estimatedImpact: "low",
      savedBy: "harvest-z-mirror-source-repair-v1",
      roiRank: 3,
    },
  ],
  operatorFriction: [
    {
      frictionId: "OF-001",
      trigger: "L protocol @ run file showed stale Lane C content",
      operatorCost: "low",
      systemFix: "Publish harvest/protocol to L 02-catalog on merge or document sync command",
      evidenceRefs: ["TE-011"],
      linkedWasteIds: ["TW-002"],
    },
  ],
  executionDeltas: [
    {
      executionDeltaId: "ED-001",
      situation: "Lane C verify gate",
      actualExecution: { steps: ["verify republished"], outcome: "empty duplicate package" },
      optimalExecution: { steps: ["verify reads receipt + index only"], outcome: "no duplicate publish" },
      deltaCost: { time: "low", tokens: "low", operatorFrustration: "low" },
      preventiveControl: "verify.mjs read-only",
    },
    {
      executionDeltaId: "ED-002",
      situation: "Protocol doc authority",
      actualExecution: { steps: ["edit harvest/protocol", "z-mirror from docs/runbooks"], outcome: "Lane C stripped on mirror" },
      optimalExecution: { steps: ["one canonical source synced to runbooks + L + Z"], outcome: "no drift" },
      deltaCost: { time: "medium", tokens: "low", operatorFrustration: "medium" },
      preventiveControl: "harvest-z-mirror-source-repair-v1",
    },
  ],
  wrongMoves: [
    {
      wrongMoveId: "WM-001",
      summary: "verify.mjs called publish",
      whyItWasWrong: "Created empty hash-addressed duplicate on L",
      correctFirstMove: "Mirror WaveRunner verify — receipt + retrieval only",
      preventiveControl: "verify.mjs",
      executionDeltaId: "ED-001",
      actualExecution: "publish on verify",
      optimalExecution: "read-only verify",
    },
    {
      wrongMoveId: "WM-002",
      summary: "z-mirror sourced stale docs/runbooks",
      whyItWasWrong: "Overwrote Lane C protocol sections in harvest/protocol during test:harvest",
      correctFirstMove: "Align docs/runbooks with harvest/protocol before mirror sync",
      preventiveControl: "z-harvest-mirror-lib source list",
      executionDeltaId: "ED-002",
      actualExecution: "mirror from docs/runbooks without Lane C",
      optimalExecution: "mirror from harvest/protocol or synced runbook",
    },
  ],
  duplicateWork: [
    {
      duplicateId: "DW-001",
      subject: "WaveRunner vs Lane C",
      whyRepeated: "Similar ingest/publish/verify shape",
      firstKnownInstance: "waverunner-self-improvement-harvest-routing-v1",
      priorIndexSlice: "BY-KIND/active-work-blockers.json",
      whyMissed: "Separate catalogs by design",
      avoidableBy: "Keep strict filter — protocol-only for Lane C",
      recommendedAction: "add_guard",
    },
  ],
  roiBacklog: [
    { rank: 1, title: "Unify protocol doc mirror sources", whyItPays: "Stops L/Z/runbook Lane C drift", effort: "low", savedWasteIds: ["TW-002"], seedAs: "runbook" },
    { rank: 2, title: "Read-only verify for all harvest lanes", whyItPays: "Prevents empty republish", effort: "low", savedWasteIds: ["TW-001"], seedAs: "command" },
    { rank: 3, title: "Restore z-mirror wave SDLC source", whyItPays: "Clears test:harvest WARN", effort: "medium", savedWasteIds: ["TW-003"], seedAs: "command" },
  ],
  doNotAdvanceMap: [
    {
      awardOrVerdict: "LANE_C_PROTOCOL_PROMOTED",
      currentStatus: "HOLD",
      doNotClaimUntil: ["Governance approval", "Git protocol merge after review"],
      lastKnownEvidence: ["authorityStatus PROPOSAL", "automaticProtocolMutation false"],
    },
    {
      awardOrVerdict: "FULLY_SEEDED",
      currentStatus: "HOLD",
      doNotClaimUntil: ["harvest:publish-hub-seed", "index:freshness-gate"],
      lastKnownEvidence: ["projection.hubPublishStatus not-run"],
    },
  ],
  duplicationCheck: {
    registryConsulted: true,
    hubSlicesConsulted: [
      "active-work-blockers.json",
      "thread-autopsy-index.json",
      "harvest-protocol-self-learning-index.json",
    ],
    commandIndexConsulted: true,
    checkedAt: AS_OF,
    preflightReceiptHash: "harvest-protocol-self-learning-lane-closeout-v1",
  },
});

const seedPackets = [
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-HARVEST-LANE-C-OPERATOR-CHAIN-001",
    kind: "runbook",
    title: "Lane C protocol self-learning operator chain",
    summary:
      "After harvest:validate PASS and protocolImprovementCandidates exist: export from Cross-Agent, ingest+publish-l+verify in Data-Extraction with HARVEST_PROTOCOL_CATALOG_ROOT=/mnt/l.",
    retrievalQuestions: [
      "How do I publish harvest protocol improvements to L catalog?",
      "What commands run Lane C after a validated harvest?",
      "Which repo owns Lane C L publication?"
    ],
    evidenceRefs: ["TE-003", "TE-005", "TE-007"],
    futureAgentInstructions: {
      whenThisAppears: "Validated harvest with protocolImprovementCandidates or protocol-upgrade packets",
      startAt: [
        "harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md",
        "BY-KIND/harvest-protocol-self-learning-index.json"
      ],
      runPreflight: [
        "npm run harvest:validate -- <harvest-id>",
        "npm run harvest:export:protocol-self-learning -- --harvest-id=<id> --json"
      ],
      doNot: [
        "Auto-merge protocol changes to main",
        "Publish app or CI findings to Lane C",
        "Run index:publish from Cursor"
      ],
      proveBeforeClaiming: [
        "harvest-protocol:self-learning:verify reports RETRIEVAL_PASS",
        "INGESTION_COMPLETE.json present in hash-addressed L package"
      ]
    },
    ownerRepo: "Data-Extraction",
    targetSlice: "BY-KIND/harvest-protocol-self-learning-index.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
    wasteIds: ["TW-001"],
    roiRank: 2
  },
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-HARVEST-L-PROTOCOL-SYNC-001",
    kind: "lesson",
    title: "L 02-catalog Harvest protocol sync authority",
    summary:
      "Git canonical is CapitalGlass-Cross-Agent/harvest/protocol/. L 02-catalog/Harvest/protocol/ is retrieval mirror — sync from Git; z-mirror uses docs/runbooks and can strip Lane C if runbooks lag.",
    retrievalQuestions: [
      "Why is L CHAT-THREAD-CLOSEOUT protocol missing Lane C?",
      "What is the authority path for harvest protocol docs?",
      "When does z-mirror overwrite Lane C sections?"
    ],
    evidenceRefs: ["TE-010", "TE-011", "WM-002"],
    futureAgentInstructions: {
      whenThisAppears: "Operator @ L protocol for closeout or Lane C missing from L copy",
      startAt: [
        "CapitalGlass-Cross-Agent/harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md",
        "L:/02-catalog/Harvest/protocol/"
      ],
      runPreflight: [
        "wc -l Git vs L protocol file",
        "grep -c 'Lane C' both paths"
      ],
      doNot: [
        "Run harvest:sync-z-mirror before docs/runbooks includes Lane C",
        "Treat L hand-edits as Git authority"
      ],
      proveBeforeClaiming: [
        "L protocol line count matches Git harvest/protocol",
        "Lane C section present in both"
      ]
    },
    ownerRepo: "CapitalGlass-Cross-Agent",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "HUMAN_REVIEW",
    status: "CANDIDATE",
    wasteIds: ["TW-002"],
    roiRank: 1
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
    "Claim Lane C protocol changes merged to Git without Governance approval",
    "Run harvest:sync-z-mirror until docs/runbooks includes Lane C",
    "Treat L catalog protocol hand-edits as authority over harvest/protocol Git",
    "Export app/CI packets to Lane C — protocolImprovementCandidates only",
    "Run index:publish or harvest:publish-hub-seed from Cursor",
  ],
  threadAutopsy: {
    tier: "T2",
    bundlePath: `artifacts/agent-runs/${HARVEST_ID}/thread-autopsy-bundle.json`,
    seedPacketIndexPath: `artifacts/agent-runs/${HARVEST_ID}/seed-packet-index.json`,
    counts: { waste: 3, seeds: 2, roiItems: 3, operatorFriction: 1, executionDeltas: 2 },
  },
  projection: {
    projectionSyncStatus: "not-run",
    hubPublishStatus: "not-run",
    hubPublishBlocker: "Operator runs harvest:publish-hub-seed + index:publish — NOT_RUN_BY_CURSOR",
    note: "Git harvest record only",
  },
  protocolSelfLearning: {
    sourceProtocolId: "chat-thread-closeout-autopsy-harvest-v1",
    sourceProtocolVersion: "1.0.0",
    eligibleCandidates: 0,
    rejectedUnrelatedCandidates: 0,
    exportStatus: "not-run",
    dataExtractionStatus: "not-run",
    catalogPublishStatus: "not-run",
    retrievalStatus: "not-run",
    targetCatalog: "L:\\02-catalog\\Harvest\\Harvest Protocol Self Learning",
    authorityStatus: "PROPOSAL",
    automaticProtocolMutation: false,
    note: "This harvest documents Lane C implementation; meta protocol candidates deferred to separate review",
  },
  ledgerLineage: {
    ledgerPath: "work-progress/ACTIVE_WORK.md",
    note: "Lane C milestone closeout — verification artifact at harvest-protocol-self-learning-all-spokes-verification-v1",
  },
  relatedRepos: [
    { repo: "Data-Extraction", branch: "main", commitSha: DE_SHA, role: "Lane C processing" },
    { repo: "CG-AppBuilder-MCP", branch: "main", commitSha: "248d7d4ad6ddfc995a4f30e4336727628f2dd0c7", role: "WaveRunner bridge only" },
  ],
  packets,
});

console.log(`Generated ${HARVEST_ID} at ${RUN_DIR}`);

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
        crossAgentRole: "thread autopsy harvest pointer",
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
