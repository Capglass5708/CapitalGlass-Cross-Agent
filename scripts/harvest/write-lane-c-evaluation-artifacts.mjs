#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const EVAL = path.join(
  REPO_ROOT,
  "artifacts/agent-runs/harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1-evaluation",
);

fs.mkdirSync(EVAL, { recursive: true });

const CHATGPT_SHA = "eba039d2f18e494d5564e0e2903295de1b8370c2";
const SOURCE_FILE_SHA = "6b1534fba4a81b92a1451b68906338c29cd3fffb7f0063e8ab4e646871b7c2ae";
const MAIN_SHA = "57652017edb5b4c6166cd1888488213e7414b06c";
const DE_SHA = "a161534f113b0cbb885a287986ebca1217401dde";
const PKG_HASH = "50025ab649ed40dda0cd9086dfe6aaba3ac313dae453d409226e0f3d50d7bf0e";
const OA_PKG = "0111d8227cddb9946ca12fc5097d346fbeb6e90e92cf70a187a59e63d43463d5";
const CLOSEOUT = "harvest-2026-08-06-harvest-protocol-self-learning-lane-closeout-v1";

const write = (name, obj) =>
  fs.writeFileSync(path.join(EVAL, name), `${JSON.stringify(obj, null, 2)}\n`, "utf8");

write("source-integrity-report.json", {
  schemaVersion: "lane-c-evaluation-source-integrity-v1@1.0.0",
  evaluatedAt: "2026-08-06T23:40:00.000Z",
  repository: "Capglass5708/CapitalGlass-Cross-Agent",
  sourceBranch: "chat-gpt-harvest",
  sourceCommitSha: CHATGPT_SHA,
  evaluationBranch: "main",
  evaluationHeadSha: MAIN_SHA,
  originParity: { main: "MATCH", chatGptHarvest: "MATCH at eba039d" },
  workingTreeState: "EVALUATION_ARTIFACTS_AND_HARVEST_RUN_DIR",
  sourceFilePath:
    "artifacts/agent-runs/harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1/chatgpt-findings-source.md",
  sourceFileSha256: SOURCE_FILE_SHA,
  retrieval: {
    retrieval: "INDEX_HIT",
    cache: "CACHE_MISS",
    rawScanRequired: false,
    sourceCommitSha: CHATGPT_SHA,
    indexPreflightNote:
      "index:preflight failed — CG-AppBuilder run-index-preflight.mjs missing; used work-progress indexes + BY-KIND slices",
  },
  verdict: "SOURCE_VALID_WITH_REPAIRS",
  checks: {
    commitMatchesReportedSha: true,
    sourcePathExistsOnBranch: true,
    contentMatchesCommittedDiff: true,
    isDraftNotCanonicalHarvest: true,
    secretsScan: "PASS",
    falsePublicationClaims: "NONE — publication truth correctly not-run in draft",
    unsafePaths: "NONE",
  },
  repairsRequired: [
    "evidenceRefs descriptive → exact paths/SHAs",
    "seed kind protocol-upgrade → runbook",
    "roiBacklog seedAs enums",
    "duplication registry lookup completed",
  ],
});

write("structural-evaluation.json", {
  schemaVersion: "lane-c-structural-evaluation-v1@1.0.0",
  sections: [
    { section: "final_summary", present: true, valid: true, issues: [], repairRequired: false },
    { section: "tier_rationale", present: true, valid: true, issues: [], repairRequired: false },
    {
      section: "retrieval_preflight",
      present: true,
      valid: true,
      issues: ["ChatGPT correctly used INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT"],
      repairRequired: false,
    },
    {
      section: "event_inventory",
      present: true,
      valid: true,
      issues: ["EVT IDs lack per-event evidenceRefs in draft"],
      repairRequired: true,
    },
    {
      section: "harvest_packets",
      present: true,
      valid: true,
      issues: ["evidenceRefs descriptive not exact", "HP-003/004/005 lack targetProtocolFiles in draft"],
      repairRequired: true,
    },
    {
      section: "execution_deltas",
      present: true,
      valid: true,
      issues: ["Prose only in draft — canonicalized in bundle"],
      repairRequired: true,
    },
    { section: "waste_ledger", present: true, valid: true, issues: [], repairRequired: false },
    {
      section: "duplication_detector",
      present: true,
      valid: true,
      issues: ["DUP-001 NEEDS_REGISTRY_LOOKUP_FIRST — resolved at evaluation"],
      repairRequired: true,
    },
    { section: "operator_friction", present: true, valid: true, issues: [], repairRequired: false },
    { section: "roi_backlog", present: true, valid: true, issues: [], repairRequired: false },
    { section: "do_not_advance_guards", present: true, valid: true, issues: [], repairRequired: false },
    {
      section: "seed_packets",
      present: true,
      valid: true,
      issues: ["kind protocol-upgrade invalid schema", "evidenceRefs vague"],
      repairRequired: true,
    },
    { section: "future_agent_instructions", present: true, valid: true, issues: [], repairRequired: false },
    { section: "publication_truth", present: true, valid: true, issues: [], repairRequired: false },
    { section: "acceptance_checklist", present: true, valid: true, issues: [], repairRequired: false },
    {
      section: "next_operator_action",
      present: true,
      valid: true,
      issues: ["Commands verified against package.json"],
      repairRequired: false,
    },
  ],
  overallStructuralVerdict: "VALID_WITH_REPAIRS",
});

write("claim-verification-report.json", {
  schemaVersion: "lane-c-claim-verification-v1@1.0.0",
  gitClaims: {
    crossAgentPr20: { state: "MERGED", mergeCommit: MAIN_SHA, verified: true },
    dataExtractionPr31: { state: "MERGED", mergeCommit: DE_SHA, verified: true },
    crossAgentMainSha: { claimed: MAIN_SHA, actual: MAIN_SHA, verified: true },
  },
  laneCImplementation: {
    crossAgentExport: { path: "scripts/harvest/export-protocol-self-learning.mjs", verified: true },
    dataExtractionCommands: { ingest: true, publishL: true, verify: true, verified: true },
    strictClassifier: {
      path: "Data-Extraction/scripts/harvest-protocol-self-learning/lib/classify-harvest-protocol-relevance.mjs",
      verified: true,
    },
    buildExclusion: { verified: true, note: "OUT_OF_SCOPE_PATTERNS in classifier" },
    deterministicPackage: { verified: true, test: "test:harvest-protocol-self-learning pass" },
    indexWriter: { verified: true, path: "BY-KIND/harvest-protocol-self-learning-index.json" },
    retrievalVerifier: { verified: true, verdict: "RETRIEVAL_PASS" },
    automaticMutation: { value: false, verified: true },
  },
  productionPackageOfficeAdmin: {
    harvestId: "harvest-2026-08-06-office-admin-pr29-github-health-v1",
    folderExists: true,
    packageHash: `sha256:${OA_PKG}`,
    manifestExists: true,
    ingestionCompleteExists: true,
    candidateCount: 2,
    excludesRawCloseout: true,
    excludesTranscript: true,
    protocolOnlyCandidates: true,
    indexPointerResolves: true,
    retrievalPass: true,
    rawScanRequired: false,
    authority: "PROPOSAL / RETRIEVAL_ONLY",
    automaticMutation: false,
  },
  zMirrorWarning: {
    missingSourcePath: "Data-Extraction/docs/platform/CURSOR_HARVEST_INGEST_CLOSEOUT_WAVE_SDLC_V1.md",
    stillExists: true,
    testBehavior:
      "syncZHarvestMirror Z_HARVEST_MIRROR_SYNC_PARTIAL; test:protocol-self-learning-export fails after sync-derived overwrites harvest/protocol from stale docs/runbooks",
    gitProtocolLaneCCount: 17,
    runbooksLaneCCount: 0,
    overwriteRisk:
      "VERIFIED — sync-derived z-mirror copied runbook without Lane C into harvest/protocol",
    separateFromLaneC: true,
    fixed: false,
  },
  rejectedClaims: [
    "ChatGPT sourceCommitSha UNKNOWN — actual eba039d on chat-gpt-harvest",
    "Lane C strict classifier as new protocol patch — ALREADY_IMPLEMENTED in Data-Extraction",
  ],
});

write("packet-evaluation.json", {
  schemaVersion: "lane-c-packet-evaluation-v1@1.0.0",
  packets: [
    {
      packetId: "HP-001",
      kind: "decision",
      schemaValid: true,
      evidenceStatus: "VERIFIED",
      laneCEligible: false,
      duplicateStatus: "NEW",
      recommendedAction: "ACCEPT",
      notes: ["Policy packet — not Lane C export candidate"],
    },
    {
      packetId: "HP-002",
      kind: "decision",
      schemaValid: true,
      evidenceStatus: "VERIFIED",
      laneCEligible: false,
      duplicateStatus: "DUPLICATE_SEMANTIC",
      recommendedAction: "MERGE_WITH_EXISTING",
      notes: ["Recorded in lane-closeout harvest"],
    },
    {
      packetId: "HP-003",
      kind: "protocol_upgrade",
      schemaValid: false,
      evidenceStatus: "VERIFIED",
      laneCEligible: false,
      duplicateStatus: "ALREADY_IMPLEMENTED",
      recommendedAction: "REJECT",
      notes: ["classify-harvest-protocol-relevance.mjs shipped PR31"],
    },
    {
      packetId: "HP-004",
      kind: "protocol_upgrade",
      schemaValid: false,
      evidenceStatus: "PARTIAL",
      laneCEligible: false,
      duplicateStatus: "ALREADY_IMPLEMENTED",
      recommendedAction: "REJECT",
      notes: ["protocolSelfLearning block already in CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md"],
    },
    {
      packetId: "HP-005",
      kind: "protocol_upgrade",
      schemaValid: false,
      evidenceStatus: "VERIFIED",
      laneCEligible: true,
      duplicateStatus: "NEW",
      recommendedAction: "ACCEPT",
      notes: ["Exported as HPC-Z-MIRROR-RUNBOOK-SYNC-001"],
    },
    {
      packetId: "HP-006",
      kind: "repeated_work",
      schemaValid: true,
      evidenceStatus: "VERIFIED",
      laneCEligible: false,
      duplicateStatus: "DUPLICATE_SEMANTIC",
      recommendedAction: "ACCEPT",
      notes: ["Generic harvest packet"],
    },
    {
      packetId: "HP-007",
      kind: "faster_path",
      schemaValid: true,
      evidenceStatus: "VERIFIED",
      laneCEligible: false,
      duplicateStatus: "NEW",
      recommendedAction: "ROUTE_TO_GENERIC_HARVEST",
      notes: ["Spoke matrix is process lesson"],
    },
    {
      packetId: "HP-008",
      kind: "blocker",
      schemaValid: true,
      evidenceStatus: "VERIFIED",
      laneCEligible: false,
      duplicateStatus: "NEW",
      recommendedAction: "ACCEPT",
      notes: ["Separate maintenance"],
    },
    {
      packetId: "HP-009",
      kind: "command",
      schemaValid: true,
      evidenceStatus: "VERIFIED",
      laneCEligible: false,
      duplicateStatus: "ALREADY_IMPLEMENTED",
      recommendedAction: "ACCEPT",
      notes: ["Command on main"],
    },
    {
      packetId: "HP-010",
      kind: "command",
      schemaValid: true,
      evidenceStatus: "VERIFIED",
      laneCEligible: false,
      duplicateStatus: "ALREADY_IMPLEMENTED",
      recommendedAction: "ACCEPT",
      notes: ["Command on Data-Extraction main"],
    },
  ],
});

write("seed-evaluation.json", {
  schemaVersion: "lane-c-seed-evaluation-v1@1.0.0",
  seeds: [
    {
      seedId: "IH-THREAD-HARVEST-PROTOCOL-STRICT-CLASSIFIER-001",
      classification: "ALREADY_IMPLEMENTED",
      laneCEligible: false,
      duplicateStatus: "ALREADY_IMPLEMENTED",
      notes: ["Classifier shipped"],
    },
    {
      seedId: "IH-THREAD-HARVEST-Z-MIRROR-GIT-GUARD-001",
      classification: "ACCEPT_AS_CANDIDATE",
      laneCEligible: false,
      duplicateStatus: "NEW",
      notes: ["Thread-autopsy seed overlaps HPC-Z-MIRROR-RUNBOOK-SYNC-001"],
    },
    {
      seedId: "IH-THREAD-CLASSIFIED-LANE-SPOKE-MATRIX-001",
      classification: "ROUTE_TO_GENERIC_HARVEST",
      laneCEligible: false,
      duplicateStatus: "NEW",
      notes: ["General lane lesson"],
    },
  ],
});

write("draft-repair-report.json", {
  schemaVersion: "lane-c-draft-repair-report-v1@1.0.0",
  repairs: [
    {
      repairId: "R-001",
      location: "HP packets evidenceRefs",
      before: "Operator scope correction",
      after: "EVT-004 + protocol paths + classifier path",
      reason: "Exact evidence required",
      evidence: ["claim-verification-report.json"],
    },
    {
      repairId: "R-002",
      location: "seed strict classifier kind",
      before: "protocol-upgrade",
      after: "runbook",
      reason: "Schema enum",
      evidence: ["harvest-seed-packet-v1.schema.json"],
    },
    {
      repairId: "R-003",
      location: "roiBacklog seedAs",
      before: "protocol/lesson",
      after: "rule/runbook",
      reason: "Schema enum",
      evidence: ["thread-autopsy-bundle-v1.schema.json"],
    },
    {
      repairId: "R-004",
      location: "protocolImprovementCandidates",
      before: "missing targets in draft",
      after: "HPC-Z-MIRROR-RUNBOOK-SYNC-001",
      reason: "Export gate",
      evidence: ["protocol-self-learning-export-lib.mjs"],
    },
    {
      repairId: "R-005",
      location: "DUP-001",
      before: "NEEDS_REGISTRY_LOOKUP_FIRST",
      after: "registry consulted PASS",
      reason: "Duplication preflight",
      evidence: ["duplication-preflight-receipt.json"],
    },
  ],
});

write("duplication-report.json", {
  schemaVersion: "lane-c-duplication-report-v1@1.0.0",
  harvestDuplicationPreflight: "PASS",
  laneCCatalogDuplicates: {
    HPC_Z_MIRROR_RUNBOOK_SYNC_001: "NEW",
    HPC_002: "ALREADY_IMPLEMENTED",
    HPC_003: "ALREADY_IMPLEMENTED",
    HPC_OA_PUBLICATION_TRUTH_001: "SEPARATE_PACKAGE office-admin",
  },
  contentHash: "9a29f5771e13f13f559be7b0a4cafd4bc78077c5983c24cdc794d95575ffafed",
});

write("lane-c-export-evaluation.json", {
  schemaVersion: "lane-c-export-evaluation-v1@1.0.0",
  eligibleProtocolCandidates: ["HPC-Z-MIRROR-RUNBOOK-SYNC-001"],
  rejectedUnrelatedPackets: [],
  duplicates: [],
  alreadyImplemented: ["HPC-002", "HPC-003"],
  requiresRepair: [],
  exportVerdict: "EXPORT_PASS_WITH_REDUNDANT_CANDIDATES",
  exportContentHash: "sha256:60edaca8524d067f6a3ec369c241dee50664b5fc103027ce43ff5b187b8a9944",
  candidateCount: 3,
});

write("data-extraction-evaluation.json", {
  schemaVersion: "lane-c-data-extraction-evaluation-v1@1.0.0",
  ingestVerdict: "PREPARED",
  publicationVerdict: "ACTIVATED",
  verifyVerdict: "RETRIEVAL_PASS",
  lPath: `L:/02-catalog/Harvest/Harvest Protocol Self Learning/harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1/${PKG_HASH}`,
  contentHash: `sha256:${PKG_HASH}`,
  ingestionComplete: true,
  indexPath:
    "L:/Capital-Glass-Intelligence-Hub/00-master-index/BY-KIND/harvest-protocol-self-learning-index.json",
  rawScanRequired: false,
  authorityStatus: "PROPOSAL",
  automaticProtocolMutation: false,
  candidateCount: 3,
  newCandidateCount: 1,
});

write("evaluation-closeout.json", {
  schemaVersion: "lane-c-evaluation-closeout-v1@1.0.0",
  milestone: "harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1-evaluation",
  executionMode: "FORMAL_CLOSEOUT",
  finalVerdict: "DRAFT_ACCEPTED_WITH_REPAIRS",
  draftScoreOverall: 6.5,
  canonicalHarvest: {
    harvestId: "harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1",
    validationVerdict: "PASS",
    autopsyVerdict: "PASS",
    packetCount: 10,
    seedCount: 3,
  },
  laneC: {
    published: true,
    primaryNewCandidate: "HPC-Z-MIRROR-RUNBOOK-SYNC-001",
    redundantCandidatesPublished: 2,
    packageHash: `sha256:${PKG_HASH}`,
  },
  authority: {
    catalogRole: "RETRIEVAL_ONLY",
    automaticMutation: false,
    governanceApprovalRequired: true,
  },
  gates: {
    crossAgentValidate: "PASS",
    dataExtractionTests: "PASS",
    testProtocolSelfLearningExport: "FAIL — z-mirror stripped Lane C (pre-existing)",
    productionOfficeAdminPackage: "VERIFIED",
  },
});

const feedback = `# ChatGPT Harvest Quality Feedback — Lane C Evaluation

## What ChatGPT did correctly

- Preserved protocol-only Lane C scope and explicit publication-not-run truth.
- Produced all required autopsy sections (packets, waste, ROI, guards, seeds).
- Correctly forbade HARVEST_COMPLETE / OPERATIONAL claims from ChatGPT lane.
- Command packets HP-009/HP-010 match shipped npm scripts on main.
- Separated z-mirror maintenance from Lane C operational closure.

## What Cursor repaired

- Descriptive evidenceRefs → EVT IDs, commit SHAs, file paths, receipt paths.
- Seed kind \`protocol-upgrade\` → \`runbook\` (schema compliance).
- ROI \`seedAs\` values → allowed enums (\`rule\`, \`runbook\`, \`command\`).
- Duplication DUP-001 resolved via registry + hub slice consultation.
- Added \`protocolImprovementCandidates\` with explicit \`targetProtocolFiles\` for export.

## Evidence references too vague

- "Operator scope correction", "Lane C protocol alignment", "Reported production packet exclusions"
- "All-spokes closeout", "Deferred harvest-z-mirror-source-repair-v1" without paths
- ChatGPT \`sourceCommitSha: UNKNOWN\` — actual \`${CHATGPT_SHA}\` on \`chat-gpt-harvest\`

## Invalid or incomplete packets

- HP-003 strict classifier: valid lesson but **already implemented** — not a new protocol patch.
- HP-004 publication truth: **documented** in \`harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md\`.
- HP-005: valid but needed exact z-mirror receipt + runbook lag evidence.
- Seeds: \`protocol-upgrade\` kind invalid; spoke-matrix seed is generic harvest lesson.

## Duplicate or already implemented candidates

- Strict classifier → \`classify-harvest-protocol-relevance.mjs\` (PR #31).
- Publication truth chain → protocol doc + \`protocolSelfLearning\` manifest fields.
- Office-admin package already published \`HPC-OA-PUBLICATION-TRUTH-001\` (different fingerprint).

## Future ChatGPT harvests should

1. Attach \`evidenceRefs\` as paths, SHAs, or artifact IDs — never prose labels.
2. Include \`targetProtocolFiles\` / \`targetValidators\` on protocol_upgrade packets.
3. Run duplication registry lookup before marking NEEDS_REGISTRY_LOOKUP_FIRST.
4. Use seed \`kind\` enum from \`harvest-seed-packet-v1.schema.json\`.
5. Mark implementation-shipped items as ALREADY_IMPLEMENTED rather than protocol_upgrade candidates.

## ChatGPT protocol amendment?

**Yes — systematic:** Add a Cursor-validation checklist requiring exact evidenceRefs and schema field enums; add explicit "do not export already-shipped classifier behavior as new protocol_upgrade" guard in \`chat-thread-closeout-autopsy-harvest-chatgpt-v1.md\`.

## Evaluation verdict

\`DRAFT_ACCEPTED_WITH_REPAIRS\` — one genuinely new Lane C candidate (\`HPC-Z-MIRROR-RUNBOOK-SYNC-001\`) published; two redundant documentation candidates also in package (Governance should prioritize the z-mirror guard).
`;

fs.writeFileSync(path.join(EVAL, "chatgpt-harvest-quality-feedback.md"), feedback, "utf8");
console.log(`Written evaluation artifacts to ${EVAL}`);
