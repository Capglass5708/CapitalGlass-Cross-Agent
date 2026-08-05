#!/usr/bin/env node
/** harvest-2026-08-04-prompt-cache-connectivity-thread-v1 (T2) — Cursor ingest from ChatGPT OBSERVED findings */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARVEST_ID = "harvest-2026-08-04-prompt-cache-connectivity-thread-v1";
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const AS_OF = new Date().toISOString();
const SOURCE_SHA = execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
const PROJECT_FILE = "work-progress/projects/harvest-2026-08-04-prompt-cache-connectivity-thread-v1.md";
const CHATGPT_COMMIT = "39de20042ceb2b1bdb6961b02ca5c84b5c33f6c2";

function writeJson(rel, value) {
  const p = path.join(RUN_DIR, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`, "utf8");
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

const packets = [
  packet({
    packetKind: "architecture",
    packetId: "promptops-authority-boundary-v1",
    packetTitle: "PromptOps remains authority — hot cache and Supabase are derivative",
    state: "RECORDED",
    packetVerdict: "PASS",
    ownerRepo: "CG-AppBuilder-MCP",
    evidenceRefs: ["HP-001", "EVT-002", "chatgpt-findings-source.md"],
    nextAction: "Preserve approval boundary in prompt-harvest pipeline",
    advancementGate: "not-required",
    doNotAdvance: ["AUTO_PROMOTE_EXTRACTED_PROMPTS"],
  }),
  packet({
    packetKind: "protocol_upgrade",
    packetId: "prompt-extraction-closeout-protocol-v1",
    packetTitle: "Prompt extraction belongs in closeout harvest",
    state: "RECORDED",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Cross-Agent",
    evidenceRefs: ["HP-002", "EVT-002"],
    nextAction: "Keep extraction in harvest:sync-derived lane",
    advancementGate: "operator-explicit-prompt-approval",
    doNotAdvance: ["AUTO_PROMOTE_EXTRACTED_PROMPTS"],
  }),
  packet({
    packetKind: "failure-pattern",
    packetId: "publication-failure-gate-misclassification-v1",
    packetTitle: "Publication failure must not be classified as extraction failure",
    state: "RECORDED",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Cross-Agent",
    evidenceRefs: ["HP-003", "EVT-005", "EVT-007"],
    nextAction: "Keep gate matrix separate in closeout receipts",
    advancementGate: "not-required",
    doNotAdvance: [],
  }),
  packet({
    packetKind: "failure-pattern",
    packetId: "harvest-republish-supersede-seeds-v1",
    packetTitle: "Republish requires explicit seed supersession — allow-republish is insufficient",
    state: "RECORDED",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Cross-Agent",
    evidenceRefs: ["HP-004", "EVT-007", "EVT-008", "OF-003"],
    nextAction: "Generate supersede args in duplication preflight",
    advancementGate: "not-required",
    doNotAdvance: [],
  }),
  packet({
    packetKind: "lesson",
    packetId: "shared-nas-publication-host-independent-v1",
    packetTitle: "Shared L publication is host-independent",
    state: "RECORDED",
    packetVerdict: "PASS",
    ownerRepo: "CG-AppBuilder-MCP",
    evidenceRefs: ["HP-005", "EVT-006", "TW-002"],
    nextAction: "Do not bind L publish to WESLEYDESK identity",
    advancementGate: "not-required",
    doNotAdvance: [],
  }),
  packet({
    packetKind: "protocol_upgrade",
    packetId: "host-connectivity-intelligence-cache-v1",
    packetTitle: "Cache compact connectivity intelligence for desk hosts",
    state: "DOCUMENTED",
    packetVerdict: "CROSS_CHECK_REQUIRED",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerMcp: "user-office-admin-mcp",
    evidenceRefs: ["HP-006", "EVT-006", "EVT-009", "EVT-010"],
    nextAction: "Cursor cross-check host profile packets vs office-admin MCP",
    advancementGate: "not-required",
    doNotAdvance: ["Do not cache credentials or grant mutation authority"],
  }),
  packet({
    packetKind: "failure-pattern",
    packetId: "prompt-catalog-over-budget-compact-drop-v1",
    packetTitle: "Over-budget prompt catalog drops entire compact slice",
    state: "RECORDED",
    packetVerdict: "PASS",
    ownerRepo: "CG-AppBuilder-MCP",
    evidenceRefs: ["HP-007", "EVT-012", "OF-005"],
    nextAction: "Implement deterministic trim milestone",
    advancementGate: "not-required",
    doNotAdvance: [],
  }),
  packet({
    packetKind: "architecture",
    packetId: "prompt-catalog-deterministic-compact-trim-v1",
    packetTitle: "Deterministic compact selection for prompt catalog",
    state: "DOCUMENTED",
    packetVerdict: "CROSS_CHECK_REQUIRED",
    ownerRepo: "CG-AppBuilder-MCP",
    evidenceRefs: ["HP-008", "EVT-013"],
    nextAction: "Verify trim implementation + over-budget tests in AppBuilder",
    advancementGate: "not-required",
    doNotAdvance: ["Claim compact slice fixed without CI proof"],
  }),
];

writeJson("harvest-manifest-v1.json", {
  schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
  harvestId: HARVEST_ID,
  missionClass: "chat-thread-closeout-autopsy-harvest-chatgpt-v1",
  sourceCommitSha: SOURCE_SHA,
  sourceBranch: "chat-gpt-harvest",
  sourceRepo: "CapitalGlass-Cross-Agent",
  createdAt: AS_OF,
  updatedAt: AS_OF,
  retrievalResult: "INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT",
  cacheResult: "NOT_APPLICABLE",
  intelligenceKind: "observed",
  laneScope: "prompt-cache-connectivity-thread-observed",
  overallHarvestVerdict: "DRAFT_READY_FOR_CURSOR_VALIDATION",
  subject:
    "ChatGPT OBSERVED autopsy — prompt harvest lifecycle, publication gate separation, host connectivity cache, prompt-catalog compact trim",
  doNotAdvance: [
    "Claim INDEX_HIT or live hub codes from ChatGPT draft",
    "Claim HARVEST_COMPLETE or OPERATIONAL before harvest:validate PASS",
    "Reopen supabase-hot-cache-execution-packets-v1 without regression evidence",
    "Auto-promote harvested prompts or bypass PromptOps",
    "Bind shared L publication to WESLEYDESK",
    "Merge chat-gpt-harvest to main without operator review",
  ],
  threadAutopsy: {
    tier: "T2",
    bundlePath: `artifacts/agent-runs/${HARVEST_ID}/thread-autopsy-bundle.json`,
    seedPacketIndexPath: `artifacts/agent-runs/${HARVEST_ID}/seed-packet-index.json`,
    counts: { waste: 4, seeds: 4, roiItems: 5, operatorFriction: 5, executionDeltas: 4 },
  },
  projection: {
    projectionSyncStatus: "not-run",
    hubPublishStatus: "not-run",
    hubPublishBlocker: "ChatGPT draft ingested — pending Cursor validation and operator publish",
  },
  ledgerLineage: {
    ledgerPath: "work-progress/ACTIVE_WORK.md",
    relatedProjectFile: PROJECT_FILE,
  },
  supersededClaims: [],
  chatgptSource: {
    commitSha: CHATGPT_COMMIT,
    findingsPath: `artifacts/agent-runs/${HARVEST_ID}/chatgpt-findings-source.md`,
    outputVerdict: "DRAFT_READY_FOR_CURSOR_VALIDATION",
  },
  packets,
});

writeJson("thread-event-inventory.json", {
  schemaVersion: "thread-event-inventory-v1@1.0.0",
  harvestId: HARVEST_ID,
  threadRef: "chatgpt-findings-source.md",
  recordedAt: AS_OF,
  hosts: ["WESLEY_WORK", "WESLEYDESK", "RYZEN9DESK"],
  events: [
    { eventId: "EVT-001", phase: "reported", summary: "Execution-packet/Supabase activation closed separately from WESLEYDESK auto-publication", evidenceRefs: ["CHAT_DIRECT"] },
    { eventId: "EVT-002", phase: "design", summary: "Harvest extension for prompt candidate extraction and promotion", evidenceRefs: ["CHAT_DIRECT"] },
    { eventId: "EVT-003", phase: "governance", summary: "Independent testing required vs Cursor completion summary", evidenceRefs: ["CHAT_DIRECT"] },
    { eventId: "EVT-004", phase: "incident", summary: "Z harvest mirror blocked — Z not mounted", evidenceRefs: ["USER_REPORTED"] },
    { eventId: "EVT-005", phase: "correction", summary: "Extraction vs environmental publication gates distinguished", evidenceRefs: ["CHAT_DIRECT"] },
    { eventId: "EVT-006", phase: "incident", summary: "WESLEYDESK full-stack connectivity diagnosis", evidenceRefs: ["USER_REPORTED"] },
    { eventId: "EVT-007", phase: "incident", summary: "Gate 4 interrupted publish + duplicate seed collisions", evidenceRefs: ["USER_REPORTED"] },
    { eventId: "EVT-008", phase: "reported", summary: "Gate 4 reported OPERATIONAL with prompt-harvest index", evidenceRefs: ["CROSS_CHECK_CANDIDATE"] },
    { eventId: "EVT-009", phase: "blocked", summary: "RYZEN9DESK local cache fanout separate", evidenceRefs: ["USER_REPORTED"] },
    { eventId: "EVT-010", phase: "request", summary: "Cache WESLEYDESK and RYZEN9DESK connectivity intelligence", evidenceRefs: ["CHAT_DIRECT"] },
    { eventId: "EVT-011", phase: "hardening", summary: "Prompt-catalog routing and lazyCatalog hash hardening reported", evidenceRefs: ["CROSS_CHECK_CANDIDATE"] },
    { eventId: "EVT-012", phase: "gap", summary: "40 prompt records exceed maxRecords 25 — compact slice omitted", evidenceRefs: ["USER_REPORTED"] },
    { eventId: "EVT-013", phase: "milestone", summary: "Bounded deterministic compact-trim milestone scoped", evidenceRefs: ["CHAT_DIRECT"] },
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
    hubSlicesConsulted: ["chatgpt-findings-source.md#DUP-001"],
    checkedAt: AS_OF,
    note: "ChatGPT flagged NEEDS_REGISTRY_LOOKUP_FIRST on DUP-001..003",
  },
  waste: [
    { wasteId: "TW-001", type: "agent", description: "Repeated restatement of completed prompt gates", evidenceRefs: ["CHAT_DIRECT"], estimatedImpact: "medium", savedBy: "Gate matrix with unresolved-only deltas", roiRank: 2 },
    { wasteId: "TW-002", type: "operator_attention", description: "WESLEYDESK treated as L publication requirement", evidenceRefs: ["CHAT_DIRECT"], estimatedImpact: "medium", savedBy: "Host-independent L authority rule", roiRank: 3 },
    { wasteId: "TW-003", type: "host", description: "Full connectivity diagnostic for known mount signatures", evidenceRefs: ["CHAT_DIRECT"], estimatedImpact: "high", savedBy: "Quick classifier before escalation", roiRank: 4 },
    { wasteId: "TW-004", type: "verification", description: "Long tests interrupted before publication", evidenceRefs: ["CHAT_DIRECT"], estimatedImpact: "high", savedBy: "Receipt-backed skip-tests for same SHA", roiRank: 5 },
  ],
  operatorFriction: [
    { frictionId: "OF-001", trigger: "Manual Z and L drvfs mounts", operatorCost: "medium", systemFix: "Mount persistence + verifier", evidenceRefs: ["CHAT_DIRECT"] },
    { frictionId: "OF-002", trigger: "Long publish without stage visibility", operatorCost: "medium", systemFix: "Stage receipts during publish", evidenceRefs: ["CHAT_DIRECT"] },
    { frictionId: "OF-003", trigger: "Five duplicate seed IDs — manual supersede args", operatorCost: "high", systemFix: "Preflight generates supersede command", evidenceRefs: ["EVT-007"] },
    { frictionId: "OF-004", trigger: "RYZEN9DESK cache root unreachable remotely", operatorCost: "medium", systemFix: "Separate fanout lane from L authority", evidenceRefs: ["EVT-009"] },
    { frictionId: "OF-005", trigger: "DATASET_HIT without compact slice", operatorCost: "high", systemFix: "Deterministic trim vs drop", evidenceRefs: ["EVT-012", "HP-007"] },
  ],
  executionDeltas: [
    { executionDeltaId: "ED-001", situation: "Publication prerequisites discovered late", actualExecution: { steps: ["long publish then collision"], outcome: "interrupted", evidenceRefs: ["EVT-007"] }, optimalExecution: { steps: ["duplication preflight + supersede args first"], outcome: "clean publish", requiredPreflight: ["seed enumeration"] }, deltaCost: { time: "high", tokens: "medium", operatorFrustration: "high" } },
    { executionDeltaId: "ED-002", situation: "L authority vs host cache conflated", actualExecution: { steps: ["bind publish to WESLEYDESK"], outcome: "blocked", evidenceRefs: ["TW-002"] }, optimalExecution: { steps: ["L shared + host fanout separate"], outcome: "parallel closeout", requiredPreflight: ["gate matrix"] }, deltaCost: { time: "medium", tokens: "low", operatorFrustration: "medium" } },
    { executionDeltaId: "ED-003", situation: "Routing passed before compact budget tests", actualExecution: { steps: ["route without over-limit fixtures"], outcome: "silent omission", evidenceRefs: ["EVT-012"] }, optimalExecution: { steps: ["below/at/over budget tests"], outcome: "slice always present", requiredPreflight: ["fixture counts"] }, deltaCost: { time: "medium", tokens: "low", operatorFrustration: "medium" } },
    { executionDeltaId: "ED-004", situation: "Host connectivity rediscovered each session", actualExecution: { steps: ["broad SSH/SMB/WSL diagnosis"], outcome: "expensive", evidenceRefs: ["EVT-006"] }, optimalExecution: { steps: ["host profile packet first"], outcome: "targeted recovery", requiredPreflight: ["connectivity cache"] }, deltaCost: { time: "high", tokens: "medium", operatorFrustration: "high" } },
  ],
  wrongMoves: [],
  duplicateWork: [
    { duplicateId: "DUP-001", subject: "prompt-harvest verification mission", firstKnownInstance: "registry lookup required", priorIndexSlice: "NEEDS_REGISTRY_LOOKUP_FIRST", whyRepeated: "Existing receipt may exist", avoidableBy: "duplication preflight", recommendedAction: "index" },
    { duplicateId: "DUP-002", subject: "RYZEN9DESK cache fanout", firstKnownInstance: "EVT-009", priorIndexSlice: "NEEDS_REGISTRY_LOOKUP_FIRST", whyRepeated: "Separate from prompt-harvest implementation", avoidableBy: "gate separation", recommendedAction: "index" },
    { duplicateId: "DUP-003", subject: "broad host connectivity diagnosis", firstKnownInstance: "EVT-006", priorIndexSlice: "NEEDS_REGISTRY_LOOKUP_FIRST", whyRepeated: "Missing cached host profile", avoidableBy: "host-connectivity packet", recommendedAction: "index" },
  ],
  roiBacklog: [
    { rank: 1, title: "Deterministic prompt-catalog compact trim", whyItPays: "Prevents full compact-slice omission", effort: "medium", savedWasteIds: ["OF-005"], ownerRepo: "CG-AppBuilder-MCP", seedAs: "command", suggestedWorkPackageId: "prompt-catalog-compact-trim-v1" },
    { rank: 2, title: "Host-connectivity dataset and execution packets", whyItPays: "Reduces repeated desk diagnosis", effort: "medium", savedWasteIds: ["ED-004"], ownerRepo: "CG-AppBuilder-MCP", seedAs: "index-slice", suggestedWorkPackageId: "host-connectivity-cache-v1" },
    { rank: 3, title: "Publication preflight with generated supersede command", whyItPays: "Avoids long-run collisions", effort: "low", savedWasteIds: ["TW-004"], ownerRepo: "CapitalGlass-Cross-Agent", seedAs: "runbook", suggestedWorkPackageId: "harvest-republish-preflight-v1" },
    { rank: 4, title: "Receipt-backed skip-tests policy", whyItPays: "Same-SHA republish efficiency", effort: "low", savedWasteIds: ["TW-004"], ownerRepo: "CapitalGlass-Cross-Agent", seedAs: "rule", suggestedWorkPackageId: "harvest-skip-tests-receipt-v1" },
    { rank: 5, title: "Prompt-catalog resolver", whyItPays: "Lower priority than compact presence", effort: "medium", savedWasteIds: [], ownerRepo: "CG-AppBuilder-MCP", seedAs: "rule", suggestedWorkPackageId: "prompt-catalog-resolver-v1" },
  ],
  doNotAdvanceMap: [
    { awardOrVerdict: "HARVEST_COMPLETE", currentStatus: "BLOCKED", doNotClaimUntil: ["harvest:validate PASS", "operator publish"], lastKnownEvidence: [HARVEST_ID], proofCommandId: "harvest:validate" },
    { awardOrVerdict: "FULLY_SEEDED_HUB", currentStatus: "BLOCKED", doNotClaimUntil: ["harvest:publish-intelligence-full", "index:freshness-gate"], lastKnownEvidence: ["chatgpt-findings-source.md"], proofCommandId: "harvest:publish-intelligence-full" },
    { awardOrVerdict: "PROMPT_HARVEST_OPERATIONAL", currentStatus: "HOLD", doNotClaimUntil: ["Cursor receipt cross-check"], lastKnownEvidence: ["EVT-008"], proofCommandId: "harvest-prompt-post-merge-acceptance-v1" },
  ],
});

const seeds = [
  {
    seedId: "IH-THREAD-PROMPT-CATALOG-COMPACT-TRIM-001",
    kind: "lesson",
    title: "Trim over-budget prompt catalog instead of dropping compact slice",
    summary: "Select top N by usageRank with stable tie-break; never omit entire dataset.",
    retrievalQuestions: [
      "Why does Scout report DATASET_HIT while prompt-catalog is absent from compact slice?",
      "How should records be selected when source exceeds maxRecords?",
    ],
    evidenceRefs: [HARVEST_ID, "EVT-012", "EVT-013", "HP-007", "HP-008"],
    futureAgentInstructions: {
      whenThisAppears: "prompt-catalog routes but compact payload absent or over budget",
      startAt: ["inspect compact builder and eligibility filters"],
      runPreflight: ["measure source/eligible counts", "run over-limit fixture"],
      doNot: ["drop full dataset", "promote ineligible prompts", "depend on source order"],
      proveBeforeClaiming: ["25 of 40 selected", "stable hash", "compact slice present"],
    },
    ownerRepo: "CG-AppBuilder-MCP",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
  },
  {
    seedId: "IH-THREAD-HOST-CONNECTIVITY-CACHE-002",
    kind: "architecture",
    title: "Cache compact connectivity intelligence for desk hosts",
    summary: "Non-secret host profiles: routes, mounts, runners, failure signatures, validation commands.",
    retrievalQuestions: [
      "How do I connect to WESLEYDESK or RYZEN9DESK through the approved route?",
      "Which failure signatures should be checked before a full diagnostic?",
    ],
    evidenceRefs: [HARVEST_ID, "EVT-006", "EVT-010", "HP-006"],
    futureAgentInstructions: {
      whenThisAppears: "agent must connect, diagnose, or sync cache to a desk host",
      startAt: ["resolve host-connectivity profile packet"],
      runPreflight: ["verify live host identity/route", "verify profile freshness"],
      doNot: ["cache credentials", "assume observed IP is current", "mutate without live verification"],
      proveBeforeClaiming: ["approved route works", "required services/storage pass"],
    },
    ownerRepo: "CG-AppBuilder-MCP",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
  },
  {
    seedId: "IH-THREAD-HARVEST-REPUBLISH-SUPERSEDE-003",
    kind: "failure-pattern",
    title: "Harvest republish requires explicit seed supersession",
    summary: "allow-republish does not bypass seed-ID collision checks.",
    retrievalQuestions: [
      "Why did publish return DUPLICATE_BLOCKED with allow-republish?",
      "How should allow-supersede-seed arguments be generated before tests?",
    ],
    evidenceRefs: [HARVEST_ID, "EVT-007", "HP-004", "TW-004"],
    futureAgentInstructions: {
      whenThisAppears: "previously published harvest is republished",
      startAt: ["duplication preflight", "enumerate seed IDs"],
      runPreflight: ["check previous receipt", "check same-SHA test receipt"],
      doNot: ["assume allow-republish bypasses seeds", "delete existing seeds"],
      proveBeforeClaiming: ["OPERATIONAL receipt", "expected BY-KIND record exists"],
    },
    ownerRepo: "CapitalGlass-Cross-Agent",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "AUTOMATIC",
    status: "CANDIDATE",
  },
  {
    seedId: "IH-THREAD-PROMPT-HARVEST-GATE-SEPARATION-004",
    kind: "lesson",
    title: "Separate extraction, approval, projection, publication, and host distribution gates",
    summary: "Each gate has independent evidence; do not reopen completed gates.",
    retrievalQuestions: [
      "Which prompt-harvest gate is actually failing?",
      "When should target-host cache fanout be separate?",
    ],
    evidenceRefs: [HARVEST_ID, "EVT-005", "EVT-008", "EVT-009", "HP-003", "HP-005"],
    futureAgentInstructions: {
      whenThisAppears: "prompt-harvest closeout is partially blocked",
      startAt: ["read gate matrix and receipts"],
      runPreflight: ["extraction", "approval/projection", "L receipt", "host cache"],
      doNot: ["reopen completed gates", "bind L to one host"],
      proveBeforeClaiming: ["each gate has evidence", "unresolved gates only in next actions"],
    },
    ownerRepo: "CapitalGlass-Cross-Agent",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "AUTOMATIC",
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

writeJson("duplication-preflight-receipt.json", {
  schemaVersion: "harvest-duplication-preflight-v1@1.0.0",
  harvestId: HARVEST_ID,
  checkedAt: AS_OF,
  registryConsulted: true,
  overlaps: [
    { priorHarvestId: "harvest-2026-08-05-workflow-estate-hot-cache-v1", overlapKind: "related-topic", subject: "prompt harvest post-merge" },
    { priorHarvestId: "harvest-2026-08-04-hot-cache-platform-thread-autopsy-v1", overlapKind: "related-topic", subject: "hot-cache platform thread" },
  ],
  retrievalResult: "INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT",
  note: "ChatGPT DUP entries flagged NEEDS_REGISTRY_LOOKUP_FIRST — Cursor ran registry consult",
});

writeJson("code-touch-summary.json", {
  schemaVersion: "code-touch-summary-v1@1.0.0",
  harvestId: HARVEST_ID,
  generatedAt: AS_OF,
  source: "chatgpt-findings-source.md",
  chatgptCommitSha: CHATGPT_COMMIT,
  repos: [
    { repo: "CG-AppBuilder-MCP", role: "prompt catalog, hot cache, scout routing", paths: ["scripts/intelligence-hub/", "registry/prompt-catalog/"] },
    { repo: "CapitalGlass-Cross-Agent", role: "harvest ingest + publication gates", paths: ["artifacts/agent-runs/" + HARVEST_ID, "scripts/harvest/"] },
  ],
});

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
      requiredOwnerArtifact: `artifacts/agent-runs/${HARVEST_ID}/chatgpt-findings-source.md`,
      crossAgentRole: "ChatGPT OBSERVED prompt-cache connectivity autopsy",
      ownerRepoRole: p.packetTitle,
      currentGap: p.packetVerdict === "CROSS_CHECK_REQUIRED" ? p.nextAction : null,
    });
  }
}
registry.updatedAt = AS_OF;
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
fs.writeFileSync(boundaryPath, `${JSON.stringify(boundary, null, 2)}\n`, "utf8");

console.log(`Generated ${HARVEST_ID} at ${RUN_DIR}`);
