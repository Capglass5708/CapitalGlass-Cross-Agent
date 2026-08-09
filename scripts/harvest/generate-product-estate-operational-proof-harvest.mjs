#!/usr/bin/env node
/**
 * harvest-2026-08-07-product-estate-operational-proof-v1 (T2)
 * Second v1.1 reference harvest — observational product-estate proof with native projections.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARVEST_ID = "harvest-2026-08-07-product-estate-operational-proof-v1";
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const DE_ROOT = path.resolve(REPO_ROOT, "../Data-Extraction");
const PROOF_DIR = path.join(DE_ROOT, "artifacts/agent-runs/gold-mine-product-estate-operational-proof-v1");
const AS_OF = new Date().toISOString();
const SOURCE_SHA = execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
const DE_SHA = execSync("git rev-parse HEAD", { cwd: DE_ROOT, encoding: "utf8" }).trim();

function writeJson(rel, value) {
  const p = path.join(RUN_DIR, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function readDeJson(name) {
  const p = path.join(PROOF_DIR, name);
  if (!fs.existsSync(p)) throw new Error(`Missing DE artifact: ${p}`);
  return JSON.parse(fs.readFileSync(p, "utf8"));
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

const probeResults = readDeJson("workflow-probe-results-v1.json");
const finalState = readDeJson("product-estate-operational-proof-final-state-v1.json");
const outcomeBaseline = readDeJson("product-estate-outcome-baseline-v1.json");
const deProjections = readDeJson("gold-mine-evidence-projections-v1.json");

const packets = [
  packet({
    packetId: "product-estate-operational-proof-measurement-v1",
    packetKind: "outcome",
    packetTitle: "Observational product-estate proof complete (fast tier)",
    state: "COMPLETE",
    packetVerdict: "PASS_WITH_WARN",
    ownerRepo: "Data-Extraction",
    effectiveness: "PARTIAL",
    beforeState: "Infrastructure Gold Mine 0 open; product workflows NOT_PROVEN",
    afterState: `23 probes: ${finalState.probeSummary.PASS} PASS, ${finalState.probeSummary.FAIL} FAIL, ${finalState.probeSummary.BLOCKED} BLOCKED`,
    measurement: "npm run gold-mine:product-estate-proof -- --skip-sdlc",
    expectedEffect: "Honest product-estate telemetry for Gold Mine discovery",
    observedEffect: "15 v1.1 projections; 8/12 workflow keys OBSERVED",
    residuals: "Human Estimator, Scraper, Proposals, OCR live path NOT_OBSERVED",
    regressions: [],
    goldMineSignalClass: "BUSINESS_WORKFLOW_SIGNAL",
    novelty: "NEW",
    implementationState: "OBSERVED_OPEN",
    businessImpact: "BUSINESS_RELIABILITY",
    evidenceEra: "IMPLEMENTATION_WAVE",
    evidenceRefs: [
      "TE-PE-001",
      `Data-Extraction@${DE_SHA}`,
      "artifacts/agent-runs/gold-mine-product-estate-operational-proof-v1/PRODUCT-ESTATE-OPERATIONAL-REPORT.md",
      "workflow-probe-results-v1.json",
    ],
    commitRefs: [`Data-Extraction@${DE_SHA}`],
    nextAction: "npm run gold-mine:remeasure after hub publish",
    advancementGate: "npm run harvest:publish-intelligence-full",
    doNotAdvance: ["Fix probes mid-run unless blocked from continuing", "Claim estate optimized"],
  }),
  packet({
    packetId: "product-estate-v11-evidence-native-v1",
    packetKind: "protocol_upgrade",
    packetTitle: "Product-estate proof emits harvest-native gold-mine-evidence-projections-v1.json",
    state: "COMPLETE",
    packetVerdict: "SHIPPED",
    ownerRepo: "Data-Extraction",
    goldMineSignalClass: "ADOPTION_SIGNAL",
    novelty: "NEW",
    implementationState: "ADOPTED",
    businessImpact: "PLATFORM_INTERNAL",
    evidenceRefs: [
      "scripts/gold-mine-product-estate-proof/lib/build-evidence-projections.mjs",
      "gold-mine-evidence-projections-v1.json",
      "npm run test:gold-mine-product-estate-proof",
    ],
    nextAction: "Harvest ingests projections without reconstruction",
    advancementGate: "harvest:validate WARN_ONLY on projections",
  }),
  packet({
    packetId: "computer-estimator-estate-probe-failures-v1",
    packetKind: "evidence",
    packetTitle: "Computer Estimator estate probes FAIL — estimating path not production-ready",
    state: "OPEN",
    packetVerdict: "FAIL",
    ownerRepo: "Computer Estimator",
    goldMineSignalClass: "PROBLEM_SIGNAL",
    novelty: "NEW",
    implementationState: "OBSERVED_OPEN",
    businessImpact: "ESTIMATING",
    evidenceRefs: [
      "estimator-regression-unit FAIL",
      "estimator-schedule-extraction FAIL",
      "estimator-evidence-spine FAIL",
      "GMP-PEOP-004",
    ],
    nextAction: "Operator-approved implementation wave after gold-mine:remeasure",
    advancementGate: "estimator probes PASS in next observational run",
    doNotAdvance: ["pip install -e mid-harvest without operator approval"],
  }),
  packet({
    packetId: "document-hub-handoff-probe-failures-v1",
    packetKind: "evidence",
    packetTitle: "Document BFF + Hub dashboard probes FAIL — consumer handoff gaps",
    state: "OPEN",
    packetVerdict: "FAIL",
    ownerRepo: "CapitalGlass-Documents",
    goldMineSignalClass: "PROBLEM_SIGNAL",
    novelty: "NEW",
    implementationState: "OBSERVED_OPEN",
    businessImpact: "DOCUMENT_PROCESSING",
    evidenceRefs: ["documents-bff-health FAIL", "hub-dashboard-smoke FAIL", "cross-agent-harvest-validate FAIL"],
    nextAction: "Surface as product candidates in remeasure",
    advancementGate: "smoke:bff-health PASS",
  }),
  packet({
    packetId: "mcp-doctor-gate-blocked-v1",
    packetKind: "evidence",
    packetTitle: "MCP doctor gate BLOCKED — operator friction on PM2 approvals",
    state: "OPEN",
    packetVerdict: "BLOCKED",
    ownerRepo: "CG-AppBuilder-MCP",
    goldMineSignalClass: "OPERATOR_FRICTION_SIGNAL",
    novelty: "KNOWN_EXISTING",
    implementationState: "BLOCKED",
    businessImpact: "OPERATOR_PRODUCTIVITY",
    evidenceRefs: ["platform-mcp-doctor-gate BLOCKED", "GMP-PEOP-002"],
    nextAction: "Operator PM2 approval or documented exception",
    advancementGate: "npm run mcp:doctor:gate PASS",
    doNotAdvance: ["Claim MCP suite healthy while doctor gate BLOCKED"],
  }),
  packet({
    packetId: "corpus-shift-product-heavy-v1",
    packetKind: "evidence",
    packetTitle: "Corpus bias shifts from SDLC-heavy to product-workflow distribution",
    state: "RECORDED",
    packetVerdict: "OBSERVED",
    ownerRepo: "Data-Extraction",
    goldMineSignalClass: "OBSERVABILITY_GAP",
    novelty: "NEW",
    businessImpact: "ESTIMATING",
    evidenceRefs: ["corpusBias in gold-mine-evidence-projections-v1.json", "productWorkflowCoverage"],
    nextAction: "Compare remeasure candidate population vs infrastructure wave",
    advancementGate: "gold-mine:remeasure shows product-class candidates",
  }),
];

const threadEvents = [
  { eventId: "TE-PE-001", phase: "measurement", summary: "Observational fast-tier product-estate proof — 23 probes", evidenceRefs: ["workflow-probe-results-v1.json"] },
  { eventId: "TE-PE-002", phase: "evidence", summary: "v1.1 projections emitted natively from proof runner (15 signals)", evidenceRefs: ["gold-mine-evidence-projections-v1.json"] },
  { eventId: "TE-PE-003", phase: "analysis", summary: "7 FAIL 1 BLOCKED — Computer Estimator, Document BFF, Hub, Revu binding", evidenceRefs: ["PRODUCT-ESTATE-OPERATIONAL-REPORT.md"] },
  { eventId: "TE-PE-004", phase: "strategy", summary: "Harvest T2 per CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md v1.1", evidenceRefs: ["L:\\02-catalog\\Harvest\\protocol\\CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md"] },
  { eventId: "TE-PE-005", phase: "outcome", summary: "Prior harvest reference complete — infrastructure compounding trusted", evidenceRefs: ["harvest-2026-08-07-gold-mine-compounding-reference-v1"] },
];

writeJson("thread-event-inventory.json", {
  schemaVersion: "cross-agent-thread-event-inventory-v1@1.0.0",
  harvestId: HARVEST_ID,
  generatedAt: AS_OF,
  events: threadEvents,
});

writeJson("thread-autopsy-bundle.json", {
  schemaVersion: "cross-agent-thread-autopsy-bundle-v1@1.0.0",
  harvestId: HARVEST_ID,
  tier: "T2",
  wasteLedgerStatus: "POPULATED",
  waste: [
    {
      wasteId: "TW-PE-001",
      type: "retrieval",
      description: "Infrastructure Gold Mine exhausted plumbing; product friction invisible until estate proof",
      evidenceRefs: ["TE-PE-005"],
      estimatedImpact: "high",
      savedBy: "gold-mine:product-estate-proof observational runner",
      roiRank: 1,
      goldMineSignalClass: "OBSERVABILITY_GAP",
    },
    {
      wasteId: "TW-PE-002",
      type: "rework",
      description: "Computer Estimator probes fail on missing package install in WSL checkout",
      evidenceRefs: ["TE-PE-003"],
      estimatedImpact: "medium",
      savedBy: "Document env prerequisite in probe registry; fix in implementation wave only",
      roiRank: 2,
      goldMineSignalClass: "PROBLEM_SIGNAL",
    },
  ],
  operatorFriction: [
    {
      frictionId: "OF-PE-001",
      trigger: "MCP doctor gate requires PM2 operator approvals",
      operatorCost: "medium",
      systemFix: "Pre-approved PM2 matrix or doctor gate exception path",
      evidenceRefs: ["platform-mcp-doctor-gate"],
      linkedWasteIds: [],
      goldMineSignalClass: "OPERATOR_FRICTION_SIGNAL",
      manualStep: "Approve PM2 processes for MCP doctor",
      frequency: "observed",
      avoidable: true,
      automationCandidate: false,
      businessWorkflow: "Suite MCP health",
      operatorRole: "operator",
      rootCause: "PM2 approval gate",
    },
  ],
  executionDeltas: [
    {
      executionDeltaId: "ED-PE-001",
      situation: "Post-infrastructure Gold Mine",
      actualExecution: { steps: ["Stop at 0 open candidates"], outcome: "false product confidence" },
      optimalExecution: { steps: ["Run product-estate proof", "Harvest v1.1 projections"], outcome: "product candidate frontier" },
      deltaCost: { time: "low", tokens: "low", operatorFrustration: "low" },
      preventiveControl: "gold-mine:product-estate-proof + this harvest",
    },
  ],
  wrongMoves: [],
  duplicateWork: [],
  roiBacklog: [
    {
      rank: 1,
      title: "gold-mine:remeasure after product-estate harvest publish",
      whyItPays: "Populates product-level Gold Mine candidates from honest probes",
      effort: "low",
      businessValue: "high",
      goldMineSignalClass: "BUSINESS_WORKFLOW_SIGNAL",
      novelty: "NEW",
      savedWasteIds: ["TW-PE-001"],
      seedAs: "runbook",
    },
    {
      rank: 2,
      title: "Computer Estimator estate probe environment fix",
      whyItPays: "Unblocks 3 estimating probes — separates env vs product defects",
      effort: "low",
      businessValue: "high",
      goldMineSignalClass: "PROBLEM_SIGNAL",
      novelty: "NEW",
      savedWasteIds: ["TW-PE-002"],
      seedAs: "command",
    },
    {
      rank: 3,
      title: "Full-tier Doppler live probes",
      whyItPays: "Exercises OCR/parser and shared-dev document paths",
      effort: "medium",
      businessValue: "high",
      goldMineSignalClass: "OBSERVABILITY_GAP",
      novelty: "NEW",
      savedWasteIds: [],
      seedAs: "runbook",
    },
  ],
  doNotAdvanceMap: [
    {
      awardOrVerdict: "ESTATE_FULLY_OPTIMIZED",
      currentStatus: "HOLD",
      doNotClaimUntil: ["Critical product probes PASS", "gold-mine:remeasure with product evidence"],
      lastKnownEvidence: ["7 FAIL", "1 BLOCKED"],
    },
  ],
  duplicationCheck: {
    registryConsulted: true,
    hubSlicesConsulted: ["active-work-blockers.json", "thread-autopsy-index.json"],
    commandIndexConsulted: true,
    checkedAt: AS_OF,
    preflightReceiptHash: "product-estate-operational-proof-v1",
  },
});

const projections = {
  ...deProjections,
  harvestId: HARVEST_ID,
  sourceCommitSha: DE_SHA,
};
delete projections.noSuppression;
writeJson("gold-mine-evidence-projections-v1.json", projections);
writeJson("product-estate-outcome-baseline-v1.json", outcomeBaseline);
writeJson("workflow-probe-results-pointer-v1.json", {
  schemaVersion: "harvest-external-artifact-pointer-v1",
  harvestId: HARVEST_ID,
  ownerRepo: "Data-Extraction",
  commitSha: DE_SHA,
  artifactPath: "artifacts/agent-runs/gold-mine-product-estate-operational-proof-v1/workflow-probe-results-v1.json",
  probeSummary: probeResults.summary,
});

const seedPackets = [
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-PRODUCT-ESTATE-OPERATIONAL-PROOF-001",
    kind: "runbook",
    title: "Product-estate operational proof observational loop",
    summary:
      "After infrastructure Gold Mine waves: run gold-mine:product-estate-proof (observational), harvest v1.1 projections, publish, remeasure — do not fix mid-run.",
    retrievalQuestions: [
      "How do I measure Capital Glass product workflows for Gold Mine?",
      "What runs after zero open infrastructure candidates?",
      "Where are v1.1 product-estate projections stored?",
    ],
    evidenceRefs: ["TE-PE-001", "gold-mine-evidence-projections-v1.json"],
    futureAgentInstructions: {
      whenThisAppears: "Stage 3 product estate exercise",
      startAt: ["PRODUCT-ESTATE-OPERATIONAL-REPORT.md", "workflow-probe-registry.mjs"],
      runPreflight: ["npm run gold-mine:product-estate-proof", "npm run harvest:validate"],
      doNot: ["Fix probes during observational run", "Skip harvest projections file"],
      proveBeforeClaiming: ["product-estate-operational-proof-final-state-v1.json harvestReady true"],
    },
    ownerRepo: "Data-Extraction",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
    roiRank: 1,
  },
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-PRODUCT-ESTATE-PROBE-FAILURES-001",
    kind: "lesson",
    title: "Product-estate probe failure population (fast tier 2026-08-07)",
    summary:
      "7 FAIL: Computer Estimator (3), documents-bff-health, hub-dashboard-smoke, cross-agent-harvest-validate, revu-bid-composer-binding. 1 BLOCKED: mcp-doctor-gate.",
    retrievalQuestions: [
      "Which product estate probes failed in August 2026?",
      "Why is Computer Estimator NOT_PROVEN?",
      "What blocks MCP doctor gate?",
    ],
    evidenceRefs: ["workflow-probe-results-v1.json", "GMP-PEOP-004"],
    futureAgentInstructions: {
      whenThisAppears: "Product Gold Mine candidate triage",
      startAt: ["workflow-probe-results-v1.json"],
      runPreflight: ["npm run gold-mine:remeasure"],
      doNot: ["Treat env install failures as resolved without re-probe"],
      proveBeforeClaiming: ["Probe PASS in subsequent observational run"],
    },
    ownerRepo: "Data-Extraction",
    targetSlice: "BY-KIND/active-work-blockers.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
    roiRank: 2,
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
  seedPacketPaths: seedPackets.map((s) => `artifacts/agent-runs/${HARVEST_ID}/seed-packets/${s.seedId}.json`),
});

writeJson("code-touch-summary.json", {
  schemaVersion: "cross-agent-code-touch-summary-v1@1.0.0",
  harvestId: HARVEST_ID,
  generatedAt: AS_OF,
  repos: [
    { repo: "Data-Extraction", commitSha: DE_SHA, role: "Product-estate proof + v1.1 projection emitter" },
    { repo: "CapitalGlass-Cross-Agent", commitSha: SOURCE_SHA, role: "T2 harvest recording" },
  ],
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
  retrievalResult: "INDEX_HIT_AI_CACHE",
  cacheResult: "CACHE_MISS",
  overallHarvestVerdict: "HARVEST_COMPLETE",
  goldMineHarvest: {
    protocolVersion: "1.1.0",
    chatGptProtocolVersion: "2.1.0",
    noSuppressionDeclared: true,
    distinctSignalsPreserved: true,
    projectionArtifact: `artifacts/agent-runs/${HARVEST_ID}/gold-mine-evidence-projections-v1.json`,
    validationMode: "WARN_ONLY",
    upstreamProofArtifact: `Data-Extraction@${DE_SHA}:artifacts/agent-runs/gold-mine-product-estate-operational-proof-v1/`,
  },
  doNotAdvance: [
    "Fix product probes during observational measurement",
    "Claim estate optimized with 7 FAIL / 1 BLOCKED",
    "Run index:publish from Cursor",
    "Hard-enforce harvest v1.1 before reviewing this harvest warnings",
  ],
  supersededClaims: [
    {
      claim: "productWorkflowCoverage computerEstimator NOT_OBSERVED (infrastructure reference harvest)",
      supersededBy: "OBSERVED with FAIL verdicts — honest measurement",
      evidenceRefs: ["TE-PE-001", "productWorkflowCoverage.computerEstimator"],
    },
  ],
  threadAutopsy: {
    tier: "T2",
    bundlePath: `artifacts/agent-runs/${HARVEST_ID}/thread-autopsy-bundle.json`,
    seedPacketIndexPath: `artifacts/agent-runs/${HARVEST_ID}/seed-packet-index.json`,
    counts: {
      waste: 2,
      seeds: 2,
      roiItems: 3,
      operatorFriction: 1,
      executionDeltas: 1,
      goldMineProjections: projections.projections?.length ?? 0,
    },
  },
  projection: {
    projectionSyncStatus: "not-run",
    hubPublishStatus: "not-run",
    hubPublishBlocker: "Agent runs publish-intelligence-full after validate",
  },
  relatedRepos: [{ repo: "Data-Extraction", branch: "main", commitSha: DE_SHA, role: "Product-estate proof owner" }],
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
        crossAgentRole: "Product-estate operational proof harvest",
        ownerRepoRole: p.packetTitle,
        currentGap: p.state === "OPEN" || p.state === "IN_PROGRESS" ? p.packetTitle : null,
      });
    }
  }
  registry.updatedAt = AS_OF;
  boundary.updatedAt = AS_OF;
  fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  fs.writeFileSync(boundaryPath, `${JSON.stringify(boundary, null, 2)}\n`, "utf8");
}

upsertRegistryAndBoundary();
