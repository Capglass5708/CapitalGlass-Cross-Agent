#!/usr/bin/env node
/**
 * harvest-2026-08-07-gold-mine-compounding-reference-v1 (T2)
 * First v1.1 reference harvest — Gold Mine infrastructure compounding + product-estate operational proof frontier.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARVEST_ID = "harvest-2026-08-07-gold-mine-compounding-reference-v1";
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const AS_OF = new Date().toISOString();
const SOURCE_SHA = execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
const DE_SHA = "20e235e9f59ffbe0b3b436d902736283b93b2d67";
const GOV_SHA = "9edcbe9ec1f1d7d102d2d75533c7500e9fe07992";

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
    packetId: "gold-mine-full-open-population-complete-v1",
    packetKind: "outcome",
    packetTitle: "Gold Mine full open population wave complete with git durability",
    state: "COMPLETE",
    packetVerdict: "PASS",
    ownerRepo: "Data-Extraction",
    effectiveness: "PROVEN_EFFECTIVE",
    beforeState: "15 open Gold Mine candidates; receipt-field false positives; git parity unproven",
    afterState: "0 open candidates; 20/20 gold-mine:verify PASS; gitParityProven true",
    measurement: "gold-mine:full-wave + gold-mine:remeasure; COMPOUNDING_SIGNAL_PRESENT",
    expectedEffect: "Infrastructure corpus exhausted for plumbing signals",
    observedEffect: "Manifest 34→6 candidates; open 15→0 after constitutional resolution",
    residuals: "Product workflows still NOT_PROVEN",
    regressions: [],
    goldMineSignalClass: "RESOLUTION_SIGNAL",
    novelty: "RESOLUTION_EVIDENCE",
    implementationState: "VERIFIED_FIXED",
    businessImpact: "PLATFORM_INTERNAL",
    evidenceEra: "POST_IMPLEMENTATION",
    evidenceRefs: [
      "TE-008",
      `Data-Extraction@${DE_SHA}`,
      "artifacts/agent-runs/gold-mine-full-open-population-implementation-v1/GOLD-MINE-FULL-SYSTEM-IMPROVEMENT-REPORT.md",
      "gold-mine:verify 20/20 PASS",
    ],
    commitRefs: [`Data-Extraction@${DE_SHA}`, `CG-Platform-Governance-MCP@${GOV_SHA}`],
    nextAction: "Run product-estate operational proof as next discovery frontier",
    advancementGate: "npm run gold-mine:product-estate-proof",
  }),
  packet({
    packetId: "gold-mine-receipt-field-authority-v1",
    packetKind: "protocol_upgrade",
    packetTitle: "Execution receipt field constitutional suppression shipped",
    state: "COMPLETE",
    packetVerdict: "SHIPPED",
    ownerRepo: "Data-Extraction",
    goldMineSignalClass: "SUCCESS_PATTERN",
    novelty: "RESOLUTION_EVIDENCE",
    implementationState: "ADOPTED",
    businessImpact: "PLATFORM_INTERNAL",
    evidenceRefs: ["TE-006", "scripts/gold-mine/lib/execution-receipt-field-authority.mjs", `Governance@${GOV_SHA}`],
    nextAction: "Monitor remeasure for receipt-field recurrence only with new evidence",
    advancementGate: "npm run gold-mine:verify",
  }),
  packet({
    packetId: "gold-mine-product-estate-proof-launched-v1",
    packetKind: "decision",
    packetTitle: "Product-estate operational proof milestone launched (observational)",
    state: "IN_PROGRESS",
    packetVerdict: "PASS_WITH_WARN",
    ownerRepo: "Data-Extraction",
    goldMineSignalClass: "BUSINESS_WORKFLOW_SIGNAL",
    novelty: "NEW",
    implementationState: "PARTIAL",
    businessImpact: "OPERATOR_PRODUCTIVITY",
    evidenceRefs: [
      "TE-010",
      "artifacts/agent-runs/gold-mine-product-estate-operational-proof-v1/PRODUCT-ESTATE-OPERATIONAL-REPORT.md",
      "23 probes: 13 PASS, 7 FAIL, 1 BLOCKED",
    ],
    nextAction: "Harvest operational report → Hub → gold-mine:remeasure for product candidates",
    advancementGate: "npm run gold-mine:remeasure after hub refresh",
    doNotAdvance: ["Interpret 0 open Gold Mine candidates as estate-wide optimization"],
  }),
  packet({
    packetId: "harvest-protocol-v1-1-gold-mine-compounding-v1",
    packetKind: "protocol_upgrade",
    packetTitle: "Harvest protocols upgraded to v1.1/v2.1 for Gold Mine compounding evidence",
    state: "COMPLETE",
    packetVerdict: "DOCUMENTED",
    ownerRepo: "CapitalGlass-Cross-Agent",
    goldMineSignalClass: "ADOPTION_SIGNAL",
    novelty: "NEW",
    implementationState: "IMPLEMENTED_IN_THREAD",
    businessImpact: "PLATFORM_INTERNAL",
    evidenceRefs: [
      "TE-011",
      "harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md v1.1",
      "harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md v2.1",
      "scripts/harvest/schema/gold-mine-evidence-projection-v1.schema.json",
    ],
    commitRefs: [`CapitalGlass-Cross-Agent@${SOURCE_SHA}`],
    nextAction: "Run 1–2 reference harvests warn-only before fail-closed enforcement",
    advancementGate: "npm run test:harvest",
  }),
  packet({
    packetId: "gold-mine-corpus-sdlc-bias-v1",
    packetKind: "evidence",
    packetTitle: "Prior Gold Mine corpus SDLC/governance-heavy — product under-observed",
    state: "RECORDED",
    packetVerdict: "OBSERVED",
    ownerRepo: "Data-Extraction",
    goldMineSignalClass: "OBSERVABILITY_GAP",
    novelty: "KNOWN_EXISTING",
    businessImpact: "ESTIMATING",
    evidenceRefs: ["TE-012", "corpusBias in gold-mine-evidence-projections-v1.json"],
    nextAction: "Weight product-estate operational proof in next remeasure",
    advancementGate: "corpusBias.underObservedDomains non-empty in harvest projections",
  }),
  packet({
    packetId: "mistake-premature-pass-git-durability-v1",
    packetKind: "mistake",
    packetTitle: "Premature PASS claimed before git push parity proven",
    state: "FIXED",
    packetVerdict: "PASS",
    ownerRepo: "Data-Extraction",
    wrongMoveId: "WM-001",
    goldMineSignalClass: "PROBLEM_SIGNAL",
    novelty: "RECURRENCE",
    actualExecution: "Claimed GOLD_MINE_FULL_OPEN_POPULATION_IMPLEMENTATION_COMPLETE with gitParityProven false",
    optimalExecution: "PASS_WITH_WARN until push + parity receipt",
    evidenceRefs: ["TE-004", "operator correction"],
    preventiveControl: "Wave acceptance requires git durability receipt",
    executionDeltaId: "ED-001",
  }),
];

const threadEvents = [
  { eventId: "TE-001", phase: "triage", summary: "Gold Mine full open population wave scoped — 15 candidates frozen", evidenceRefs: ["gold-mine-full-wave-scope-lock-v1.json"] },
  { eventId: "TE-002", phase: "implementation", summary: "execution-receipt-field-authority + implementation-resolution root cause", evidenceRefs: [`Data-Extraction@${DE_SHA}`] },
  { eventId: "TE-003", phase: "implementation", summary: "gold-mine:full-wave orchestrator + 20/20 verify", evidenceRefs: ["npm run gold-mine:full-wave"] },
  { eventId: "TE-004", phase: "closeout", summary: "Operator rejected premature PASS — git durability pending", evidenceRefs: ["operator correction"] },
  { eventId: "TE-005", phase: "closeout", summary: "Git push parity proven — final PASS", evidenceRefs: ["git-durability-closeout-v1.json"] },
  { eventId: "TE-006", phase: "implementation", summary: "Governance milestone field semantics + constitutional contract", evidenceRefs: [`Governance@${GOV_SHA}`] },
  { eventId: "TE-007", phase: "remeasure", summary: "§10 remeasure — COMPOUNDING_SIGNAL_PRESENT; 0 open", evidenceRefs: ["gold-mine-manifest post-wave"] },
  { eventId: "TE-008", phase: "outcome", summary: "Infrastructure Gold Mine loop trusted; corpus exhausted for plumbing", evidenceRefs: ["GOLD-MINE-FULL-SYSTEM-IMPROVEMENT-REPORT.md"] },
  { eventId: "TE-009", phase: "strategy", summary: "Next milestone: gold-mine-product-estate-operational-proof-v1", evidenceRefs: ["operator directive"] },
  { eventId: "TE-010", phase: "measurement", summary: "First observational product-estate proof — 7 FAIL 1 BLOCKED", evidenceRefs: ["PRODUCT-ESTATE-OPERATIONAL-REPORT.md"] },
  { eventId: "TE-011", phase: "protocol", summary: "Harvest v1.1/v2.1 Gold Mine compounding upgrade + warn-only validator", evidenceRefs: ["harvest/protocol v1.1"] },
  { eventId: "TE-012", phase: "analysis", summary: "Corpus bias: SDLC-heavy; Estimator/Revu/Hub BFF NOT_PROVEN", evidenceRefs: ["workflow-probe-results-v1.json"] },
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
      wasteId: "TW-001",
      type: "verification",
      description: "Premature PASS before git durability — operator correction required",
      evidenceRefs: ["TE-004"],
      estimatedImpact: "medium",
      savedBy: "Interim PASS_WITH_WARN + git-durability-closeout artifact",
      roiRank: 2,
      goldMineSignalClass: "OPERATOR_FRICTION_SIGNAL",
    },
    {
      wasteId: "TW-002",
      type: "rework",
      description: "Receipt-field signals mined as separate candidates until constitutional suppression",
      evidenceRefs: ["TE-002"],
      estimatedImpact: "high",
      savedBy: "execution-receipt-field-authority.mjs + CONSTITUTIONAL_RECEIPT_FIELD_COVERED",
      roiRank: 1,
      goldMineSignalClass: "PROBLEM_SIGNAL",
    },
    {
      wasteId: "TW-003",
      type: "agent",
      description: "Interpreting 0 open candidates as full estate optimization without product proof",
      evidenceRefs: ["TE-012"],
      estimatedImpact: "high",
      savedBy: "product-estate operational proof + corpusBias reporting in harvest v1.1",
      roiRank: 3,
      goldMineSignalClass: "OBSERVABILITY_GAP",
    },
  ],
  operatorFriction: [
    {
      frictionId: "OF-001",
      trigger: "Operator had to correct premature PASS verdict",
      operatorCost: "medium",
      systemFix: "Wave closeout requires git parity receipt before PASS",
      evidenceRefs: ["TE-004"],
      linkedWasteIds: ["TW-001"],
      goldMineSignalClass: "OPERATOR_FRICTION_SIGNAL",
      manualStep: "Verify git push parity",
      frequency: "observed",
      avoidable: true,
      automationCandidate: true,
      businessWorkflow: "Gold Mine wave closeout",
      operatorRole: "operator",
      rootCause: "Closeout claimed before push evidence",
    },
  ],
  executionDeltas: [
    {
      executionDeltaId: "ED-001",
      situation: "Gold Mine full wave closeout",
      actualExecution: { steps: ["Claim PASS with gitParityProven false"], outcome: "operator rejection" },
      optimalExecution: { steps: ["PASS_WITH_WARN until push", "Emit git-durability-closeout"], outcome: "truthful interim" },
      deltaCost: { time: "low", tokens: "low", operatorFrustration: "medium" },
      preventiveControl: "git-durability-closeout-v1.json required",
    },
    {
      executionDeltaId: "ED-002",
      situation: "Next ROI frontier after infrastructure",
      actualExecution: { steps: ["Stop at 0 open candidates"], outcome: "false confidence on product estate" },
      optimalExecution: { steps: ["Run product-estate operational proof", "Record corpusBias"], outcome: "honest frontier" },
      deltaCost: { time: "medium", tokens: "medium", operatorFrustration: "low" },
      preventiveControl: "gold-mine:product-estate-proof + harvest v1.1 corpus coverage",
    },
  ],
  wrongMoves: [
    {
      wrongMoveId: "WM-001",
      summary: "Premature PASS without git parity",
      whyItWasWrong: "Wave acceptance rules require durable Git authority",
      correctFirstMove: "PASS_WITH_WARN + git durability closeout",
      preventiveControl: "git-durability-closeout-v1.json",
      executionDeltaId: "ED-001",
    },
  ],
  duplicateWork: [
    {
      duplicateId: "DW-001",
      subject: "Receipt-field Gold Mine candidates",
      whyRepeated: "Same constitutional fields mined across waves",
      firstKnownInstance: "gold-mine-highest-roi-contract-normalization-v1",
      priorIndexSlice: "BY-KIND/active-work-blockers.json",
      whyMissed: "Discovery lacked implementation-resolution until this wave",
      avoidableBy: "execution-receipt-field-authority gate",
      recommendedAction: "add_guard",
    },
  ],
  roiBacklog: [
    {
      rank: 1,
      title: "Product-estate operational proof → remeasure loop",
      whyItPays: "Surfaces estimating/document/Revu friction — next tangible ROI",
      effort: "medium",
      operatorValue: "high",
      businessValue: "high",
      platformValue: "medium",
      agentValue: "medium",
      reliabilityValue: "high",
      automationLeverage: "high",
      estimatedComplexity: "medium",
      blastRadius: "estate-wide",
      confidence: "high",
      evidenceDiversity: "probe-results + operational report",
      rootCauseLeverage: "shifts Gold Mine from SDLC to product",
      goldMineSignalClass: "BUSINESS_WORKFLOW_SIGNAL",
      novelty: "NEW",
      savedWasteIds: ["TW-003"],
      seedAs: "runbook",
    },
    {
      rank: 2,
      title: "Harvest v1.1 fail-closed after reference harvests",
      whyItPays: "Cleaner Gold Mine ingest; fewer prose reconstructions",
      effort: "low",
      platformValue: "high",
      goldMineSignalClass: "ADOPTION_SIGNAL",
      novelty: "NEW",
      savedWasteIds: [],
      seedAs: "runbook",
    },
    {
      rank: 3,
      title: "Computer Estimator probe env (pip install -e) for estate proof",
      whyItPays: "Unblocks 3 estimating probes currently FAIL",
      effort: "low",
      businessValue: "high",
      goldMineSignalClass: "PROBLEM_SIGNAL",
      novelty: "NEW",
      savedWasteIds: [],
      seedAs: "command",
    },
  ],
  doNotAdvanceMap: [
    {
      awardOrVerdict: "ESTATE_FULLY_OPTIMIZED",
      currentStatus: "HOLD",
      doNotClaimUntil: ["product-estate operational proof PASS on critical workflows", "gold-mine:remeasure with product evidence"],
      lastKnownEvidence: ["0 open candidates", "7 product probe FAILs"],
    },
    {
      awardOrVerdict: "HARVEST_PROTOCOL_V1_1_FAIL_CLOSED",
      currentStatus: "HOLD",
      doNotClaimUntil: ["2+ reference harvests inspected", "warn-only warning taxonomy stable"],
      lastKnownEvidence: ["warn-only validator shipped", "this reference harvest"],
    },
  ],
  duplicationCheck: {
    registryConsulted: true,
    hubSlicesConsulted: ["active-work-blockers.json", "thread-autopsy-index.json", "mcp-servers.json"],
    commandIndexConsulted: true,
    checkedAt: AS_OF,
    preflightReceiptHash: "gold-mine-compounding-reference-v1",
  },
});

writeJson("gold-mine-evidence-projections-v1.json", {
  schemaVersion: "gold-mine-evidence-projection-v1@1.0.0",
  harvestId: HARVEST_ID,
  sourceCommitSha: SOURCE_SHA,
  corpusBias: {
    evidenceDomainDistribution: {
      sdlc: 45,
      governance: 25,
      receiptPlumbing: 20,
      infrastructure: 15,
      productOperation: 8,
      operatorWorkflow: 5,
      businessWorkflow: 5,
    },
    corpusBiasWarning:
      "SDLC/governance-heavy corpus exhausted at 0 open — product surfaces under-observed",
    underObservedDomains: [
      "Computer Estimator",
      "Human Estimator",
      "Scraper",
      "Revu production",
      "Live Document Center BFF",
    ],
  },
  productWorkflowCoverage: {
    computerEstimator: "NOT_OBSERVED",
    humanEstimator: "NOT_OBSERVED",
    documentCenter: "OBSERVED",
    planSetProcessing: "NOT_OBSERVED",
    ocrParser: "NOT_OBSERVED",
    revuBluebeam: "OBSERVED",
    bidComposer: "OBSERVED",
    proposals: "NOT_OBSERVED",
    vae: "OBSERVED",
    scraper: "NOT_OBSERVED",
    crossAppHandoffs: "OBSERVED",
    operatorReentry: "OBSERVED",
  },
  projections: [
    {
      projectionId: "GMP-INFRA-RESOLUTION-001",
      signalClass: "RESOLUTION_SIGNAL",
      lifecycleHint: "RESOLVED_OBSERVED",
      workPackageId: "gold-mine-full-open-population-implementation-v1",
      implementationDigestRef: "sha256:execution-receipt-field-authority-v1",
      evidenceStrength: "high",
      businessImpact: "PLATFORM_INTERNAL",
      evidenceEra: "POST_IMPLEMENTATION",
      novelty: "RESOLUTION_EVIDENCE",
      implementationState: "VERIFIED_FIXED",
      summary: "15 receipt-field false positives resolved via constitutional suppression; 0 open after remeasure",
      evidenceRefs: [`Data-Extraction@${DE_SHA}`, "gold-mine:verify 20/20 PASS"],
      validatesExisting: ["gold-mine-highest-roi-contract-normalization-v1"],
    },
    {
      projectionId: "GMP-SUCCESS-COMPOUNDING-001",
      signalClass: "SUCCESS_PATTERN",
      lifecycleHint: "RESOLVED_OBSERVED",
      workPackageId: "gold-mine-full-open-population-implementation-v1",
      evidenceStrength: "high",
      businessImpact: "PLATFORM_INTERNAL",
      evidenceEra: "POST_IMPLEMENTATION",
      novelty: "NEW",
      implementationState: "ADOPTED",
      summary: "Gold Mine compounding loop operational: implement → remeasure → COMPOUNDING_SIGNAL_PRESENT",
      evidenceRefs: ["TE-007", "§10 remeasurement receipt"],
    },
    {
      projectionId: "GMP-PRODUCT-FRONTIER-001",
      signalClass: "BUSINESS_WORKFLOW_SIGNAL",
      lifecycleHint: "OPEN",
      workPackageId: "gold-mine-product-estate-operational-proof-v1",
      evidenceStrength: "medium",
      businessImpact: "ESTIMATING",
      evidenceEra: "IMPLEMENTATION_WAVE",
      novelty: "NEW",
      implementationState: "PARTIAL",
      summary: "Product-estate operational proof launched; 7 FAIL 1 BLOCKED — next Gold Mine input frontier",
      evidenceRefs: [
        "artifacts/agent-runs/gold-mine-product-estate-operational-proof-v1/workflow-probe-results-v1.json",
      ],
    },
    {
      projectionId: "GMP-OBS-ESTIMATOR-001",
      signalClass: "OBSERVABILITY_GAP",
      lifecycleHint: "OPEN",
      evidenceStrength: "medium",
      businessImpact: "ESTIMATING",
      evidenceEra: "POST_IMPLEMENTATION",
      novelty: "NEW",
      implementationState: "OBSERVED_OPEN",
      summary: "Computer Estimator probes FAIL — ModuleNotFoundError; production estimating NOT_PROVEN",
      evidenceRefs: ["estimator-regression-unit FAIL", "workflow-probe-results-v1.json"],
    },
    {
      projectionId: "GMP-HARVEST-V11-001",
      signalClass: "ADOPTION_SIGNAL",
      lifecycleHint: "OPEN",
      workPackageId: "harvest-protocol-v1-1-gold-mine-compounding-v1",
      evidenceStrength: "high",
      businessImpact: "PLATFORM_INTERNAL",
      evidenceEra: "IMPLEMENTATION_WAVE",
      novelty: "NEW",
      implementationState: "IMPLEMENTED_IN_THREAD",
      summary: "Harvest v1.1/v2.1 + warn-only gold-mine projection validator — this reference harvest",
      evidenceRefs: [`CapitalGlass-Cross-Agent@${SOURCE_SHA}`, "gold-mine-evidence-projection-v1.schema.json"],
      adopts: ["GOLD-MINE-NORTH-STAR-CHARTER.md"],
    },
  ],
});

const seedPackets = [
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-GOLD-MINE-COMPOUNDING-LOOP-001",
    kind: "lesson",
    title: "Gold Mine compounding loop after infrastructure waves",
    summary:
      "When plumbing corpus hits 0 open: run product-estate operational proof, harvest with v1.1 corpusBias, remeasure for product candidates — do not claim estate optimized.",
    retrievalQuestions: [
      "What do I do when Gold Mine has zero open candidates?",
      "How do I avoid false confidence after SDLC-heavy Gold Mine waves?",
      "What is the next frontier after gold-mine-full-open-population?",
    ],
    evidenceRefs: ["TE-008", "TE-010", "GMP-PRODUCT-FRONTIER-001"],
    futureAgentInstructions: {
      whenThisAppears: "Gold Mine 0 open after infrastructure wave",
      startAt: ["GOLD-MINE-NORTH-STAR-CHARTER.md", "PRODUCT-ESTATE-OPERATIONAL-REPORT.md"],
      runPreflight: ["npm run gold-mine:product-estate-proof", "npm run gold-mine:remeasure"],
      doNot: ["Claim estate fully optimized", "Skip corpusBias in harvest"],
      proveBeforeClaiming: ["productWorkflowCoverage shows OBSERVED for target workflows"],
    },
    ownerRepo: "Data-Extraction",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
    roiRank: 1,
  },
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-HARVEST-GOLD-MINE-PROJECTION-001",
    kind: "lesson",
    title: "Harvest v1.1 gold-mine-evidence-projections-v1.json",
    summary:
      "T2+ harvests project goldMineSignalClass, corpusBias, productWorkflowCoverage into gold-mine-evidence-projections-v1.json; validate warn-only via harvest:validate.",
    retrievalQuestions: [
      "How does harvest feed Gold Mine discovery?",
      "What file carries Gold Mine signal classification from harvest?",
      "When does harvest:validate warn on ordinal-only candidate ids?",
    ],
    evidenceRefs: ["harvest/protocol v1.1", "validate-gold-mine-evidence-projection.mjs"],
    futureAgentInstructions: {
      whenThisAppears: "Thread closeout with product or Gold Mine implications",
      startAt: ["harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md"],
      runPreflight: ["npm run harvest:validate -- <harvest-id>"],
      doNot: ["Use GOLD-#### as durable identity", "Suppress low-value distinct signals"],
      proveBeforeClaiming: ["gold-mine-evidence-projections-v1.json validates warn-only"],
    },
    ownerRepo: "CapitalGlass-Cross-Agent",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
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
  seedPacketPaths: seedPackets.map(
    (s) => `artifacts/agent-runs/${HARVEST_ID}/seed-packets/${s.seedId}.json`,
  ),
});

writeJson("code-touch-summary.json", {
  schemaVersion: "cross-agent-code-touch-summary-v1@1.0.0",
  harvestId: HARVEST_ID,
  generatedAt: AS_OF,
  repos: [
    { repo: "Data-Extraction", commitSha: DE_SHA, role: "Gold Mine waves + product-estate proof" },
    { repo: "CG-Platform-Governance-MCP", commitSha: GOV_SHA, role: "execution receipt milestone semantics" },
    { repo: "CapitalGlass-Cross-Agent", commitSha: SOURCE_SHA, role: "harvest v1.1 + validator" },
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
  },
  doNotAdvance: [
    "Claim estate fully optimized while product probes FAIL",
    "Hard-enforce harvest v1.1 before 2+ reference harvests reviewed",
    "Treat ordinal GOLD-#### as durable candidate identity",
    "Run index:publish from Cursor",
  ],
  supersededClaims: [
    {
      claim: "Zero open Gold Mine candidates means Capital Glass product estate is optimized",
      supersededBy: "corpusBias + product-estate operational proof",
      evidenceRefs: ["TE-012", "GMP-PRODUCT-FRONTIER-001"],
    },
  ],
  threadAutopsy: {
    tier: "T2",
    bundlePath: `artifacts/agent-runs/${HARVEST_ID}/thread-autopsy-bundle.json`,
    seedPacketIndexPath: `artifacts/agent-runs/${HARVEST_ID}/seed-packet-index.json`,
    counts: {
      waste: 3,
      seeds: 2,
      roiItems: 3,
      operatorFriction: 1,
      executionDeltas: 2,
      observabilityGaps: 2,
      successPatterns: 2,
      goldMineProjections: 5,
    },
  },
  projection: {
    projectionSyncStatus: "not-run",
    hubPublishStatus: "not-run",
    hubPublishBlocker: "Operator runs harvest:publish-intelligence-full — NOT_RUN_BY_CURSOR",
    note: "Reference v1.1 harvest — Git record first",
  },
  relatedRepos: [
    { repo: "Data-Extraction", branch: "feat/harvest-branch-investigation-m23-m24", commitSha: DE_SHA, role: "Gold Mine owner" },
    { repo: "CG-Platform-Governance-MCP", branch: "feat/cg-estimating-evidence-envelope-authority-v1", commitSha: GOV_SHA, role: "receipt contract" },
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
        crossAgentRole: "Gold Mine compounding reference",
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
