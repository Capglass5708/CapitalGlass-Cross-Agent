#!/usr/bin/env node
/**
 * CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1 — issued proposal corpus chat thread.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { REPO_ROOT } from "./lib/paths.mjs";

const HARVEST_ID = "harvest-2026-08-12-issued-proposal-corpus-chat-v1";
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const AS_OF = new Date().toISOString();
const SOURCE_SHA = execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
const SOURCE_BRANCH = execSync("git rev-parse --abbrev-ref HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();

function writeJson(rel, value) {
  const filePath = path.join(RUN_DIR, rel);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const packets = [
  {
    harvestVerdictContribution: "RECORDED",
    ownerMcp: null,
    requiredOwnerArtifact: null,
    commitRefs: [{ repo: "CapitalGlass-Cross-Agent", sha: "dde727aa6a58e0aaaa1914b34ff63a1734c434d2", note: "corpus foundation" }],
    blockers: [],
    relatedPackets: ["issued-proposal-structured-learning-active-v1"],
    packetKind: "outcome",
    packetId: "ce-issued-proposal-corpus-foundation-v1",
    packetTitle: "23 issued proposal PDFs admitted as ce-issued-proposal-corpus-v1",
    state: "FOUNDATION_COMPLETE",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Cross-Agent",
    ownerIndexingStatus: "indexed",
    projectFile: "work-progress/projects/2026-08-11_ce-issued-proposal-corpus-v1.md",
    evidenceRefs: [
      "artifacts/issued-proposal-corpus-v1/manifest.json",
      "TE-003",
      "Z:/Capital-Glass-Dev/Computer Estimator Sample Documents/Proposals",
    ],
    nextAction: "Execute issued-proposal-structured-estimator-learning-v1 slices 2–8",
    advancementGate: "harvest:issued-proposal-corpus PASS with 23 records",
    doNotAdvance: ["DURABLE_COMPLETE", "close_program_on_harvest_pass_alone"],
  },
  {
    harvestVerdictContribution: "RECORDED",
    ownerMcp: null,
    requiredOwnerArtifact: null,
    commitRefs: [],
    blockers: [],
    relatedPackets: ["ce-issued-proposal-corpus-foundation-v1"],
    packetKind: "decision",
    packetId: "issued-proposal-harvest-not-learning-v1",
    packetTitle: "Harvest PASS is not structured estimator learning",
    state: "ACTIVE",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Cross-Agent",
    ownerIndexingStatus: "indexed",
    projectFile: "work-progress/projects/2026-08-12_issued-proposal-structured-estimator-learning-v1.md",
    evidenceRefs: ["TE-006", "chat-intelligence-extract-v1.json#controllingRule"],
    nextAction: "Complete hard exit criteria before DURABLE_COMPLETE",
    advancementGate: "all eight hard exit criteria in successor WP",
    doNotAdvance: ["WaveRunner close on harvest alone", "PROPOSAL_LEARNING_DURABLE_COMPLETE"],
  },
  {
    harvestVerdictContribution: "RECORDED",
    ownerMcp: null,
    requiredOwnerArtifact: null,
    commitRefs: [],
    blockers: ["L hub publication pending operator"],
    relatedPackets: [],
    packetKind: "blocker",
    packetId: "issued-proposal-l-hub-publication-hold-v1",
    packetTitle: "L: Intelligence Hub publication pending WESLEYDESK",
    state: "HOLD",
    packetVerdict: "HOLD",
    ownerRepo: "CapitalGlass-Cross-Agent",
    ownerIndexingStatus: "indexed",
    projectFile: "work-progress/projects/capital-glass-proposal-learning-compounding-spine-v1.md",
    evidenceRefs: [
      "artifacts/issued-proposal-corpus-v1/agent-build-catalog-patch-v1.json",
      "artifacts/agent-runs/harvest-2026-08-12-issued-proposal-corpus-chat-v1/agent-build-catalog-patch-learning-program-v1.json",
    ],
    nextAction: "Operator runs index-publication.yml on WESLEYDESK; merge both catalog patches",
    advancementGate: "index:freshness-gate PASS after publish",
    doNotAdvance: ["index:publish from Cursor", "harvest:publish-hub-seed from Cursor", "FULLY_SEEDED without operator receipt"],
  },
  {
    harvestVerdictContribution: "RECORDED",
    ownerMcp: null,
    requiredOwnerArtifact: null,
    commitRefs: [],
    blockers: [],
    relatedPackets: [],
    packetKind: "mistake",
    packetId: "issued-proposal-strings-pdf-mistake-v1",
    packetTitle: "strings on PDF binaries returns empty text",
    state: "RESOLVED",
    packetVerdict: "PASS",
    ownerRepo: "capital-glass-estimating-parser",
    ownerIndexingStatus: "indexed",
    projectFile: "work-progress/projects/2026-08-11_ce-issued-proposal-corpus-v1.md",
    evidenceRefs: ["TE-002", "WM-001"],
    nextAction: "Require poppler-utils pdftotext in corpus harvest preflight",
    advancementGate: "not-required",
    doNotAdvance: ["Use strings for issued proposal PDF text extraction"],
  },
  {
    harvestVerdictContribution: "RECORDED",
    ownerMcp: null,
    requiredOwnerArtifact: null,
    commitRefs: [],
    blockers: [],
    relatedPackets: [],
    packetKind: "repeated_work",
    packetId: "issued-proposal-corpus-rediscovery-v1",
    packetTitle: "Re-scanning Z: Proposals without index slice",
    state: "MITIGATED",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Cross-Agent",
    ownerIndexingStatus: "indexed",
    projectFile: "work-progress/projects/2026-08-11_ce-issued-proposal-corpus-v1.md",
    evidenceRefs: ["DW-001", "work-progress/intelligence-hub-slices/issued-proposal-corpus-v1.json"],
    nextAction: "Read git failover slice before re-harvesting corpus",
    advancementGate: "not-required",
    doNotAdvance: [],
  },
  {
    harvestVerdictContribution: "RECORDED",
    ownerMcp: null,
    requiredOwnerArtifact: null,
    commitRefs: [],
    blockers: [],
    relatedPackets: ["issued-proposal-strings-pdf-mistake-v1"],
    packetKind: "faster_path",
    packetId: "issued-proposal-poppler-scout-path-v1",
    packetTitle: "Scout index then poppler-utils before corpus harvest",
    state: "INSTALLED",
    packetVerdict: "PASS",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "indexed",
    projectFile: "work-progress/projects/2026-08-12_issued-proposal-structured-estimator-learning-v1.md",
    evidenceRefs: ["ED-001", "TE-001"],
    nextAction: "Document poppler in Z: AGENT_SETUP.md corpus section",
    advancementGate: "not-required",
    doNotAdvance: [],
  },
  {
    harvestVerdictContribution: "RECORDED",
    ownerMcp: null,
    requiredOwnerArtifact: null,
    commitRefs: [],
    blockers: [],
    relatedPackets: ["ce-issued-proposal-corpus-foundation-v1"],
    packetKind: "command",
    packetId: "issued-proposal-corpus-harvest-commands-v1",
    packetTitle: "Issued proposal corpus regeneration command chain",
    state: "DOCUMENTED",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Cross-Agent",
    ownerIndexingStatus: "indexed",
    projectFile: "work-progress/projects/2026-08-11_ce-issued-proposal-corpus-v1.md",
    evidenceRefs: ["npm run harvest:issued-proposal-corpus", "artifacts/issued-proposal-corpus-v1/regression-pack-v1.json"],
    nextAction: "Add test:issued-proposal-corpus-parity in successor WP",
    advancementGate: "deterministic parity test per corpus bid",
    doNotAdvance: [],
  },
  {
    harvestVerdictContribution: "RECORDED",
    ownerMcp: null,
    requiredOwnerArtifact: null,
    commitRefs: [
      { repo: "CapitalGlass-BidComposer", sha: "92b0ea1", note: "consumer pointers" },
      { repo: "capital-glass-estimating-parser", sha: "6601bec", note: "executive summary extractor" },
    ],
    blockers: [],
    relatedPackets: [],
    packetKind: "evidence",
    packetId: "issued-proposal-corpus-evidence-v1",
    packetTitle: "Cross-repo evidence for 23-PDF corpus admission",
    state: "RECORDED",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Cross-Agent",
    ownerIndexingStatus: "indexed",
    projectFile: "work-progress/projects/2026-08-11_ce-issued-proposal-corpus-v1.md",
    evidenceRefs: [
      "f96297f",
      "dde727a",
      "CapitalGlass-BidComposer/fixtures/issued-proposal-corpus/",
      "capital-glass-estimating-parser/scripts/extract-issued-proposal-executive-summary-v1.py",
    ],
    nextAction: "None — foundation evidence frozen",
    advancementGate: "not-required",
    doNotAdvance: [],
  },
  {
    harvestVerdictContribution: "RECORDED",
    ownerMcp: null,
    requiredOwnerArtifact: null,
    commitRefs: [],
    blockers: [],
    relatedPackets: [],
    packetKind: "protocol_upgrade",
    packetId: "issued-proposal-z-boundary-protocol-v1",
    packetTitle: "Proposals/ folder is downstream benchmark not CE intake",
    state: "DOCUMENTED",
    packetVerdict: "PASS",
    ownerRepo: "Computer Estimator",
    ownerIndexingStatus: "indexed",
    projectFile: "work-progress/projects/capital-glass-proposal-learning-compounding-spine-v1.md",
    evidenceRefs: [
      "Z:/Capital-Glass-Dev/Computer Estimator Sample Documents/AGENT_SETUP.md",
      "TE-004",
    ],
    nextAction: "Enforce in CE office-drop and batch intake docs",
    advancementGate: "not-required",
    doNotAdvance: ["CE batch process Proposals/", "Treat issued PDFs as plan intake"],
  },
  {
    harvestVerdictContribution: "RECORDED",
    ownerMcp: null,
    requiredOwnerArtifact: null,
    commitRefs: [],
    blockers: [],
    relatedPackets: ["issued-proposal-harvest-not-learning-v1"],
    packetKind: "outcome",
    packetId: "issued-proposal-structured-learning-active-v1",
    packetTitle: "Successor WP issued-proposal-structured-estimator-learning-v1 ACTIVE",
    state: "IN_PROGRESS",
    packetVerdict: "HOLD",
    ownerRepo: "capital-glass-estimating-parser",
    ownerIndexingStatus: "indexed",
    projectFile: "work-progress/projects/2026-08-12_issued-proposal-structured-estimator-learning-v1.md",
    evidenceRefs: ["work-progress/projects/2026-08-12_issued-proposal-structured-estimator-learning-v1.md"],
    nextAction: "Slice 2: frame/glass schedule extractor; slice 3: parity test",
    advancementGate: "eight hard exit criteria complete",
    doNotAdvance: ["DURABLE_COMPLETE before PLR + decision events populated"],
  },
];

writeJson("harvest-manifest-v1.json", {
  schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
  harvestId: HARVEST_ID,
  missionClass: "chat-thread-closeout-autopsy-harvest-v1",
  sourceCommitSha: SOURCE_SHA,
  sourceBranch: SOURCE_BRANCH,
  sourceRepo: "CapitalGlass-Cross-Agent",
  createdAt: "2026-08-12T05:15:00.000Z",
  updatedAt: AS_OF,
  retrievalResult: "INDEX_HIT_AI_CACHE",
  cacheResult: "CACHE_MISS",
  overallHarvestVerdict: "HARVEST_VALIDATED",
  chatTranscriptId: "628ebd5b-d678-45ea-b8e0-6941c62eab40",
  doNotAdvance: [
    "Close capital-glass-proposal-learning-compounding-spine on harvest PASS alone",
    "CE batch-process Proposals/ as plan intake",
    "index:publish or harvest:publish-hub-seed from Cursor",
    "Claim DURABLE_COMPLETE for issued-proposal learning before hard exit criteria",
    "Use strings for PDF text extraction on issued proposals",
  ],
  threadAutopsy: {
    tier: "T2",
    bundlePath: `artifacts/agent-runs/${HARVEST_ID}/thread-autopsy-bundle.json`,
    seedPacketIndexPath: `artifacts/agent-runs/${HARVEST_ID}/seed-packet-index.json`,
    counts: {
      waste: 3,
      seeds: 4,
      roiItems: 4,
      operatorFriction: 1,
      executionDeltas: 2,
      wrongMoves: 1,
    },
  },
  projection: {
    projectionSyncStatus: "not-run",
    hubPublishStatus: "not-run",
    hubPublishBlocker: "Operator WESLEYDESK index-publication.yml — NOT_RUN_BY_CURSOR",
  },
  protocolSelfLearning: {
    sourceProtocolId: "chat-thread-closeout-autopsy-harvest-v1",
    sourceProtocolVersion: "1.2.0",
    eligibleCandidates: 0,
    exportStatus: "not-run",
  },
  relatedRepos: [
    { repo: "CapitalGlass-Cross-Agent", branch: SOURCE_BRANCH, commitSha: "dde727aa6a58e0aaaa1914b34ff63a1734c434d2", role: "corpus foundation" },
    { repo: "CapitalGlass-Cross-Agent", branch: SOURCE_BRANCH, commitSha: "f96297fe18070ab1578831e925ff97a269a45fec", role: "chat intelligence git failover" },
    { repo: "CapitalGlass-BidComposer", branch: "main", commitSha: "92b0ea1", role: "consumer fixtures" },
    { repo: "capital-glass-estimating-parser", branch: "main", commitSha: "6601bec", role: "executive summary extractor" },
  ],
  ledgerLineage: {
    ledgerPath: "work-progress/ACTIVE_WORK.md",
  },
  supersededClaims: [
    {
      packetId: "chat-intelligence-extract-v1",
      claim: "verdict HARVEST_COMPLETE without protocol autopsy artifacts",
      supersededBy: `${HARVEST_ID} full CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1`,
      recordedAt: AS_OF,
    },
  ],
  packets,
});

writeJson("thread-event-inventory.json", {
  schemaVersion: "thread-event-inventory-v1@1.0.0",
  harvestId: HARVEST_ID,
  threadScope: "23 issued proposal PDFs — corpus admission, maturity scorecard, structured learning program routing",
  generatedAt: AS_OF,
  events: [
    { eventId: "TE-001", phase: "scout", summary: "Investigated Z: Proposals folder — 23 CG-####-26 PDFs Jan–Jun 2026", evidenceRefs: ["INDEX_HIT_AI_CACHE", "/mnt/z/Capital-Glass-Dev/Computer Estimator Sample Documents/Proposals"] },
    { eventId: "TE-002", phase: "blocker", summary: "strings on PDFs empty; installed poppler-utils pdftotext/pdfinfo", evidenceRefs: ["apt install poppler-utils"] },
    { eventId: "TE-003", phase: "implementation", summary: "ce-issued-proposal-corpus-v1 manifest + harvest script + hub slices @ dde727a", evidenceRefs: ["artifacts/issued-proposal-corpus-v1/manifest.json", "CapitalGlass-Cross-Agent@dde727a"] },
    { eventId: "TE-004", phase: "documentation", summary: "Z: AGENT_SETUP.md — Proposals/ downstream benchmark; bid-sheets and full-plan-sets upstream", evidenceRefs: ["Z:/Capital-Glass-Dev/Computer Estimator Sample Documents/AGENT_SETUP.md"] },
    { eventId: "TE-005", phase: "cross-repo", summary: "Bid Composer fixtures + parser executive-summary extractor pushed", evidenceRefs: ["CapitalGlass-BidComposer@92b0ea1", "capital-glass-estimating-parser@6601bec"] },
    { eventId: "TE-006", phase: "operator", summary: "User maturity correction — harvest PASS ≠ learned; successor WP + hard exit criteria", evidenceRefs: ["chat transcript", "issued-proposal-structured-estimator-learning-v1"] },
    { eventId: "TE-007", phase: "hub", summary: "Git failover slices + chat intelligence extract @ f96297f pending L: publish", evidenceRefs: ["work-progress/intelligence-hub-slices/issued-proposal-learning-program-v1.json"] },
    { eventId: "TE-008", phase: "closeout", summary: "CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1 protocol invoked", evidenceRefs: ["L:/02-catalog/Harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md"] },
  ],
});

writeJson("code-touch-summary.json", {
  schemaVersion: "code-touch-summary-v1@1.0.0",
  harvestId: HARVEST_ID,
  generatedAt: AS_OF,
  repos: [
    {
      repo: "CapitalGlass-Cross-Agent",
      branch: SOURCE_BRANCH,
      commits: ["dde727a", "f96297f"],
      files: [
        "artifacts/issued-proposal-corpus-v1/",
        "scripts/issued-proposal-corpus/",
        "work-progress/intelligence-hub-slices/issued-proposal-corpus-v1.json",
        "work-progress/intelligence-hub-slices/issued-proposal-learning-program-v1.json",
        "work-progress/projects/2026-08-11_ce-issued-proposal-corpus-v1.md",
        "work-progress/projects/2026-08-12_issued-proposal-structured-estimator-learning-v1.md",
      ],
    },
    {
      repo: "CapitalGlass-BidComposer",
      branch: "main",
      commitSha: "92b0ea1",
      files: ["fixtures/issued-proposal-corpus/", "docs/estimating-concepts/concepts/issued-proposal-corpus-v1.md"],
    },
    {
      repo: "capital-glass-estimating-parser",
      branch: "main",
      commitSha: "6601bec",
      files: ["scripts/extract-issued-proposal-executive-summary-v1.py"],
    },
  ],
});

writeJson("thread-autopsy-bundle.json", {
  schemaVersion: "cross-agent-thread-autopsy-bundle-v1@1.0.0",
  harvestId: HARVEST_ID,
  tier: "T2",
  duplicationCheck: {
    registryConsulted: true,
    hubSlicesConsulted: [
      "BY-KIND/active-work-blockers.json",
      "work-progress/intelligence-hub-slices/issued-proposal-corpus-v1.json",
      "work-progress/intelligence-hub-slices/issued-proposal-learning-program-v1.json",
    ],
    commandIndexConsulted: true,
    checkedAt: AS_OF,
  },
  wasteLedgerStatus: "POPULATED",
  waste: [
    {
      wasteId: "TW-001",
      type: "agent",
      description: "Attempted strings on PDF binaries before poppler-utils",
      evidenceRefs: ["TE-002", "WM-001"],
      estimatedImpact: "medium",
      savedBy: "apt install poppler-utils; pdftotext in harvest script",
      roiRank: 1,
      goldMineSignalClass: "AGENT_FRICTION_SIGNAL",
    },
    {
      wasteId: "TW-002",
      type: "context",
      description: "Lightweight chat harvest claimed HARVEST_COMPLETE before full protocol autopsy",
      evidenceRefs: ["f96297f receipt", "TE-008"],
      estimatedImpact: "low",
      savedBy: "Run CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1 before terminal verdict",
      roiRank: 2,
      goldMineSignalClass: "OPERATOR_FRICTION_SIGNAL",
    },
    {
      wasteId: "TW-003",
      type: "operator_attention",
      description: "User corrected maturity — harvest admission ≠ structured learning complete",
      evidenceRefs: ["TE-006"],
      estimatedImpact: "high",
      savedBy: "Hard exit criteria on issued-proposal-structured-estimator-learning-v1",
      roiRank: 3,
      goldMineSignalClass: "BUSINESS_WORKFLOW_SIGNAL",
    },
  ],
  operatorFriction: [
    {
      frictionId: "OF-001",
      trigger: "Operator rejected DURABLE_COMPLETE on harvest alone",
      operatorCost: "medium",
      systemFix: "WaveRunner gate: require PLR + parity test before program close",
      evidenceRefs: ["TE-006"],
      linkedWasteIds: ["TW-003"],
    },
  ],
  executionDeltas: [
    {
      executionDeltaId: "ED-001",
      situation: "PDF text extraction for 23 issued proposals",
      actualExecution: {
        steps: ["strings on PDF", "empty output", "pip install pypdf blocked PEP668", "apt install poppler-utils"],
        outcome: "PASS after poppler",
        evidenceRefs: ["TE-002"],
      },
      optimalExecution: {
        steps: ["Check Z: mount", "Verify poppler-utils", "pdftotext in harvest script"],
        outcome: "First-pass extraction",
        requiredPreflight: ["which pdftotext"],
      },
      deltaCost: { time: "medium", tokens: "low", operatorFrustration: "low" },
    },
    {
      executionDeltaId: "ED-002",
      situation: "Program maturity classification",
      actualExecution: {
        steps: ["Foundation harvest PASS", "Initial closeout framing"],
        outcome: "Risk of premature DURABLE_COMPLETE",
        evidenceRefs: ["TE-006"],
      },
      optimalExecution: {
        steps: ["Scorecard A–C per lane", "Successor WP with eight exit criteria", "Defer plan crosswalk"],
        outcome: "FOUNDATION_COMPLETE only",
        requiredPreflight: ["user maturity scorecard"],
      },
      deltaCost: { time: "low", tokens: "medium", operatorFrustration: "medium" },
    },
  ],
  wrongMoves: [
    {
      wrongMoveId: "WM-001",
      summary: "Used strings instead of pdftotext on issued proposal PDFs",
      whyItWasWrong: "Binary PDF strings extraction returns empty on these files",
      correctFirstMove: "poppler-utils pdftotext/pdfinfo in harvest preflight",
      preventiveControl: "harvest-issued-proposal-corpus-v1.py requires pdftotext",
      executionDeltaId: "ED-001",
    },
  ],
  duplicateWork: [
    {
      duplicateId: "DW-001",
      subject: "Re-discovering 23 PDF corpus without index",
      whyRepeated: "Before git failover slices landed",
      firstKnownInstance: "initial Z: folder scan",
      priorIndexSlice: "work-progress/intelligence-hub-slices/issued-proposal-corpus-v1.json",
      whyMissed: "Hub slice not published to L: yet",
      avoidableBy: "Read issued-proposal-corpus-v1.json failover slice first",
      recommendedAction: "index",
    },
  ],
  roiBacklog: [
    {
      rank: 1,
      title: "issued-proposal-structured-estimator-learning-v1 slice 2 frame/glass extractor",
      whyItPays: "Unlocks parity test and PLR population — highest learning ROI",
      effort: "medium",
      operatorValue: "high",
      businessValue: "high",
      confidence: "high",
      goldMineSignalClass: "BUSINESS_WORKFLOW_SIGNAL",
      savedWasteIds: ["TW-003"],
      seedAs: "owner-artifact",
    },
    {
      rank: 2,
      title: "test:issued-proposal-corpus-parity deterministic expectations",
      whyItPays: "Regression gate for 23-bid corpus — A- reproducibility to A",
      effort: "medium",
      savedWasteIds: [],
      seedAs: "command",
    },
    {
      rank: 3,
      title: "Operator L: hub publication for corpus + learning program slices",
      whyItPays: "Eliminates git failover-only retrieval for estate agents",
      effort: "low",
      savedWasteIds: ["TW-002"],
      seedAs: "index-slice",
    },
    {
      rank: 4,
      title: "plan-issued-proposal-crosswalk-v1 after structured learning DURABLE_COMPLETE",
      whyItPays: "Supervised plan↔proposal learning — deferred correctly",
      effort: "high",
      savedWasteIds: [],
      seedAs: "runbook",
    },
  ],
  doNotAdvanceMap: [
    {
      awardOrVerdict: "ce-issued-proposal-corpus-v1",
      currentStatus: "HOLD",
      doNotClaimUntil: ["DURABLE_COMPLETE", "structured learning hard exit criteria met"],
      lastKnownEvidence: ["artifacts/issued-proposal-corpus-v1/manifest.json", "dde727a"],
    },
    {
      awardOrVerdict: "capital-glass-proposal-learning-compounding-spine-v1",
      currentStatus: "OPEN",
      doNotClaimUntil: ["Close program on harvest PASS alone"],
      lastKnownEvidence: ["TE-006", "issued-proposal-structured-estimator-learning-v1.md"],
    },
  ],
});

writeJson("gold-mine-evidence-projections-v1.json", {
  schema: "gold-mine-evidence-projections-v1@1.0.0",
  harvestId: HARVEST_ID,
  projections: [
    {
      signalClass: "BUSINESS_WORKFLOW_SIGNAL",
      lifecycleHint: "OPEN",
      rootCauseKey: "issued-proposal-harvest-not-structured-learning",
      workPackageId: "issued-proposal-structured-estimator-learning-v1",
      evidenceStrength: "high",
      operatorImpact: "Prevents false program closure on corpus admission alone",
      businessImpact: "ESTIMATING",
      evidenceEra: "PRE_IMPLEMENTATION",
      observedAt: AS_OF,
      sourceWorkPackageId: "ce-issued-proposal-corpus-v1",
      novelty: "NEW",
      implementationState: "OBSERVED_OPEN",
    },
    {
      signalClass: "SUCCESS_PATTERN",
      lifecycleHint: "RESOLVED_OBSERVED",
      rootCauseKey: "issued-proposal-corpus-admission",
      workPackageId: "ce-issued-proposal-corpus-v1",
      evidenceStrength: "high",
      businessImpact: "ESTIMATING",
      evidenceEra: "POST_IMPLEMENTATION",
      implementationState: "PROVEN_EFFECTIVE",
    },
    {
      signalClass: "AGENT_FRICTION_SIGNAL",
      lifecycleHint: "RESOLVED_OBSERVED",
      rootCauseKey: "pdf-text-extraction-without-poppler",
      workPackageId: "ce-issued-proposal-corpus-v1",
      evidenceStrength: "medium",
      implementationState: "ADOPTED",
    },
  ],
});

const seeds = [
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-ISSUED-PROPOSAL-CORPUS-BOUNDARY-001",
    kind: "runbook",
    title: "Proposals/ is downstream issued output not CE plan intake",
    summary: "Z: Computer Estimator Sample Documents/Proposals holds 23 issued benchmarks; upstream is bid-sheets and full-plan-sets.",
    retrievalQuestions: [
      "Is the Proposals folder CE batch intake?",
      "Where do issued proposal PDF benchmarks live?",
    ],
    evidenceRefs: ["Z:/Capital-Glass-Dev/Computer Estimator Sample Documents/AGENT_SETUP.md", "TE-004"],
    futureAgentInstructions: {
      whenThisAppears: "Computer Estimator office drop or batch intake routing",
      startAt: ["work-progress/intelligence-hub-slices/issued-proposal-corpus-v1.json"],
      runPreflight: ["Read AGENT_SETUP.md Proposals section"],
      doNot: ["CE batch-process Proposals/", "Treat issued PDFs as plan evidence intake"],
      proveBeforeClaiming: ["corpusId ce-sample-issued-proposals-v1", "notCePlanIntake true"],
    },
    ownerRepo: "Computer Estimator",
    targetSlice: "work-progress/intelligence-hub-slices/issued-proposal-corpus-v1.json",
    promotionClass: "AUTOMATIC",
    status: "CANDIDATE",
  },
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-ISSUED-PROPOSAL-HARVEST-NOT-LEARNING-002",
    kind: "decision",
    title: "23 PDFs harvested PASS is not learned from 23 proposals",
    summary: "WaveRunner must not close proposal learning on harvest alone; successor WP has eight hard exit criteria.",
    retrievalQuestions: [
      "Can we close issued proposal learning after harvest PASS?",
      "What are hard exit criteria for structured estimator learning?",
    ],
    evidenceRefs: ["chat-intelligence-extract-v1.json", "issued-proposal-structured-estimator-learning-v1.md"],
    futureAgentInstructions: {
      whenThisAppears: "Closing ce-issued-proposal or proposal-learning compounding spine",
      startAt: ["work-progress/projects/2026-08-12_issued-proposal-structured-estimator-learning-v1.md"],
      runPreflight: ["Check hardExitCriteria array in chat extract"],
      doNot: ["DURABLE_COMPLETE on harvest alone", "Skip PLR and decision events"],
      proveBeforeClaiming: ["test:issued-proposal-corpus-parity PASS", "PROPOSAL_LEARNING_RECORD_V1 populated"],
    },
    ownerRepo: "CapitalGlass-Cross-Agent",
    targetSlice: "work-progress/intelligence-hub-slices/issued-proposal-learning-program-v1.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
  },
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-ISSUED-PROPOSAL-CORPUS-COMMANDS-003",
    kind: "command",
    title: "Regenerate issued proposal corpus manifest",
    summary: "npm run harvest:issued-proposal-corpus from Cross-Agent with Z: mounted and poppler-utils.",
    retrievalQuestions: [
      "How do I regenerate the 23 issued proposal corpus manifest?",
      "What tools are required for issued proposal PDF harvest?",
    ],
    evidenceRefs: ["scripts/issued-proposal-corpus/harvest-issued-proposal-corpus-v1.py", "TE-003"],
    futureAgentInstructions: {
      whenThisAppears: "Refreshing ce-sample-issued-proposals-v1 manifest or regression pack",
      startAt: ["artifacts/issued-proposal-corpus-v1/manifest.json"],
      runPreflight: ["test -d /mnt/z/Capital-Glass-Dev", "which pdftotext"],
      doNot: ["Use strings on PDFs", "Hand-edit manifest without re-running harvest"],
      proveBeforeClaiming: ["manifest.json record count 23", "harvest exit 0"],
    },
    ownerRepo: "CapitalGlass-Cross-Agent",
    targetSlice: "artifacts/issued-proposal-corpus-v1/regression-pack-v1.json",
    promotionClass: "AUTOMATIC",
    status: "CANDIDATE",
  },
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-ISSUED-PROPOSAL-STRUCTURED-LEARNING-EXIT-004",
    kind: "runbook",
    title: "Structured estimator learning mandatory slice order",
    summary: "Slices 2–8: frame/glass extract, parity test, PLR, decision events, contradictions, boilerplate fingerprint, graph precedents, L publish.",
    retrievalQuestions: [
      "What is next after ce-issued-proposal-corpus foundation?",
      "When is plan-issued-proposal-crosswalk allowed?",
    ],
    evidenceRefs: ["work-progress/projects/2026-08-12_issued-proposal-structured-estimator-learning-v1.md"],
    futureAgentInstructions: {
      whenThisAppears: "Continuing issued proposal learning program",
      startAt: ["work-progress/projects/2026-08-12_issued-proposal-structured-estimator-learning-v1.md"],
      runPreflight: ["Confirm foundation FOUNDATION_COMPLETE not DURABLE_COMPLETE"],
      doNot: ["Start plan-issued-proposal-crosswalk-v1 before structured learning DURABLE_COMPLETE"],
      proveBeforeClaiming: ["All eight hardExitCriteria satisfied", "L hub publication parity"],
    },
    ownerRepo: "capital-glass-estimating-parser",
    targetSlice: "work-progress/projects/2026-08-12_issued-proposal-structured-estimator-learning-v1.md",
    promotionClass: "HUMAN_REVIEW",
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
  seedIds: seeds.map((s) => s.seedId),
  seeds: seeds.map((s) => ({ seedId: s.seedId, kind: s.kind, title: s.title, status: s.status })),
});

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
        ownerMcp: "user-cg-app-mcp",
        ownerIndexingStatus: p.ownerIndexingStatus,
        requiredOwnerArtifact: null,
        crossAgentRole: "Issued proposal corpus chat harvest",
        ownerRepoRole: p.packetTitle,
        currentGap: p.state === "HOLD" || p.state === "IN_PROGRESS" ? p.packetTitle : null,
      });
    }
  }
  registry.updatedAt = AS_OF;
  boundary.updatedAt = AS_OF;
  fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  fs.writeFileSync(boundaryPath, `${JSON.stringify(boundary, null, 2)}\n`, "utf8");
}

upsertRegistryAndBoundary();
console.log(`Generated ${HARVEST_ID} at ${RUN_DIR} (source ${SOURCE_SHA.slice(0, 7)})`);
