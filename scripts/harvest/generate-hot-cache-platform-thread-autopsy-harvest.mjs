#!/usr/bin/env node
/** harvest-2026-08-04-hot-cache-platform-thread-autopsy-v1 (T2) — Cursor ingest from ChatGPT OBSERVED findings */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARVEST_ID = "harvest-2026-08-04-hot-cache-platform-thread-autopsy-v1";
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const AS_OF = new Date().toISOString();
const SOURCE_SHA = execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
const PROJECT_FILE = "work-progress/projects/harvest-2026-08-04-hot-cache-platform-thread-autopsy-v1.md";
const CHATGPT_COMMIT = "713bea841a25edfdffdc746cdb2898fe91486f78";

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
    packetId: "hot-cache-federated-datasets-v1",
    packetTitle: "Federated governed datasets for AI hot-cache platform",
    state: "RECORDED",
    packetVerdict: "CROSS_CHECK_REQUIRED",
    ownerRepo: "CG-AppBuilder-MCP",
    evidenceRefs: ["EVT-002", "EVT-003", "HP-001", "chatgpt-findings-source.md"],
    nextAction: "Cursor cross-check dataset registry + compiler receipts",
    advancementGate: "not-required",
    doNotAdvance: ["Claim OPERATIONAL from ChatGPT draft alone"],
  }),
  packet({
    packetKind: "governance",
    packetId: "hot-cache-derivative-only-v1",
    packetTitle: "Hot cache is derivative-only — never authoritative",
    state: "RECORDED",
    packetVerdict: "CROSS_CHECK_REQUIRED",
    ownerRepo: "CG-AppBuilder-MCP",
    evidenceRefs: ["HP-002", "EVT-003"],
    nextAction: "Verify authority pointers in compile/publish receipts",
    advancementGate: "not-required",
    doNotAdvance: [],
  }),
  packet({
    packetKind: "implementation",
    packetId: "hot-cache-immutable-generation-v1",
    packetTitle: "Immutable generation publication (pointer-last)",
    state: "USER_REPORTED",
    packetVerdict: "CROSS_CHECK_REQUIRED",
    ownerRepo: "CG-AppBuilder-MCP",
    evidenceRefs: ["EVT-005", "HP-003", "USER_REPORTED_OPERATIONAL"],
    nextAction: "Verify generation artifacts + current.json flip in repo",
    advancementGate: "not-required",
    doNotAdvance: ["HOT_CACHE_PLATFORM_OPERATIONAL without receipts"],
  }),
  packet({
    packetKind: "performance",
    packetId: "hot-cache-routed-compact-retrieval-v1",
    packetTitle: "Routed compact scout retrieval with ACL/budget",
    state: "USER_REPORTED",
    packetVerdict: "CROSS_CHECK_REQUIRED",
    ownerRepo: "CG-AppBuilder-MCP",
    evidenceRefs: ["EVT-006", "HP-004"],
    nextAction: "Verify scout routing index + DATASET_HIT receipts",
    advancementGate: "not-required",
    doNotAdvance: [],
  }),
  packet({
    packetKind: "lesson",
    packetId: "hot-cache-safety-refusal-success-v1",
    packetTitle: "Zero eligible mutations is correct when estate is dirty",
    state: "RECORDED",
    packetVerdict: "PASS",
    ownerRepo: "CG-AppBuilder-MCP",
    evidenceRefs: ["EVT-006", "HP-005", "ED-004"],
    nextAction: "Keep refusal semantics in bulk-pull contracts",
    advancementGate: "not-required",
    doNotAdvance: [],
  }),
  packet({
    packetKind: "protocol_upgrade",
    packetId: "chatgpt-draft-branch-lane-v1",
    packetTitle: "ChatGPT OBSERVED findings on chat-gpt-harvest only",
    state: "RECORDED",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Cross-Agent",
    evidenceRefs: ["EVT-012", "COR-001", CHATGPT_COMMIT, "chatgpt-findings-source.md"],
    nextAction: "Cursor ingest + validate before publication",
    advancementGate: "not-required",
    doNotAdvance: ["Merge chat-gpt-harvest to main without validation"],
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
  laneScope: "hot-cache-platform-thread-observed",
  overallHarvestVerdict: "DRAFT_READY_FOR_CURSOR_VALIDATION",
  subject: "ChatGPT OBSERVED autopsy — hot-cache platform thread (federated datasets, scout routing, Workflow Estate)",
  doNotAdvance: [
    "Claim INDEX_HIT or live hub codes from ChatGPT draft",
    "Claim HARVEST_COMPLETE or OPERATIONAL before harvest:validate PASS",
    "Treat USER_REPORTED_OPERATIONAL milestones as verified without Cursor cross-check",
    "Merge chat-gpt-harvest to main without operator review",
    "Enable estate-wide bulk pull while material dirty trees remain",
    "Auto-promote prompt candidates",
  ],
  threadAutopsy: {
    tier: "T2",
    bundlePath: `artifacts/agent-runs/${HARVEST_ID}/thread-autopsy-bundle.json`,
    seedPacketIndexPath: `artifacts/agent-runs/${HARVEST_ID}/seed-packet-index.json`,
    counts: { waste: 4, seeds: 3, roiItems: 6, operatorFriction: 7, executionDeltas: 7 },
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
  hosts: ["WESLEY_WORK", "WESLEYDESK"],
  events: [
    { eventId: "EVT-001", phase: "request", summary: "Broader AI caching and indexing requested", evidenceRefs: ["CHAT_DIRECT"] },
    { eventId: "EVT-002", phase: "plan", summary: "Git Estate plan attachment", evidenceRefs: ["ATTACHMENT_SOURCE"] },
    { eventId: "EVT-003", phase: "architecture", summary: "Federated platform with dataset registry", evidenceRefs: ["CHAT_DIRECT"] },
    { eventId: "EVT-004", phase: "hardening", summary: "Immutable generations, ACLs, budgets", evidenceRefs: ["CHAT_DIRECT"] },
    { eventId: "EVT-005", phase: "reported", summary: "Foundation implementation reported", evidenceRefs: ["USER_REPORTED_OPERATIONAL"] },
    { eventId: "EVT-006", phase: "reported", summary: "Scout routing + Authority Estate + L fallback", evidenceRefs: ["USER_REPORTED_OPERATIONAL"] },
    { eventId: "EVT-007", phase: "reported", summary: "Active Ledger + Closeout Index reported", evidenceRefs: ["USER_REPORTED_OPERATIONAL"] },
    { eventId: "EVT-008", phase: "incident", summary: "Cache-root inconsistency on stripped scout env", evidenceRefs: ["USER_REPORTED_OPERATIONAL"] },
    { eventId: "EVT-009", phase: "reported", summary: "Prompt extraction and projection reported", evidenceRefs: ["CROSS_CHECK_CANDIDATE"] },
    { eventId: "EVT-010", phase: "reported", summary: "Workflow Estate opened", evidenceRefs: ["CROSS_CHECK_CANDIDATE"] },
    { eventId: "EVT-011", phase: "correction", summary: "Branch-lane status clarified as cleanup not new task", evidenceRefs: ["CHAT_DIRECT"] },
    { eventId: "EVT-012", phase: "protocol", summary: "Protocol mandates Git push to chat-gpt-harvest", evidenceRefs: ["ATTACHMENT_SOURCE"] },
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
    { wasteId: "TW-001", type: "agent", description: "Repeated status restatement", evidenceRefs: ["CHAT_DIRECT"], estimatedImpact: "medium", savedBy: "Canonical status matrix + deltas only", roiRank: 1 },
    { wasteId: "TW-002", type: "rework", description: "Architecture recapitulation after implementation reports", evidenceRefs: ["CHAT_DIRECT"], estimatedImpact: "medium", savedBy: "confirmed/changed/blocked/next proof template", roiRank: 2 },
    { wasteId: "TW-003", type: "context", description: "Large duplicated conversation payloads", evidenceRefs: ["CHAT_DIRECT"], estimatedImpact: "medium", savedBy: "Parse latest status section only", roiRank: 3 },
    { wasteId: "TW-004", type: "verification", description: "Token savings estimated before instrumentation", evidenceRefs: ["CHAT_DIRECT"], estimatedImpact: "high", savedBy: "Persist routing/miss/raw-scan metrics", roiRank: 4 },
  ],
  operatorFriction: [
    { frictionId: "OF-001", trigger: "Self-hosted runner queue", operatorCost: "medium", systemFix: "Runner capacity planning", evidenceRefs: ["USER_REPORTED_OPERATIONAL"] },
    { frictionId: "OF-002", trigger: "D/S/L mount variation by host", operatorCost: "high", systemFix: "Machine profile mount matrix", evidenceRefs: ["USER_REPORTED_OPERATIONAL"] },
    { frictionId: "OF-003", trigger: "Stripped hook env loses cache root", operatorCost: "high", systemFix: "Cache-root resolution telemetry", evidenceRefs: ["EVT-008", "OF-003"] },
    { frictionId: "OF-004", trigger: "Dirty repo estate blocks mutation", operatorCost: "high", systemFix: "Fixture isolation before bulk pull", evidenceRefs: ["ED-004"] },
    { frictionId: "OF-005", trigger: "Cross-repo merge ordering", operatorCost: "medium", systemFix: "Workflow Estate command linkage", evidenceRefs: ["CHAT_DIRECT"] },
    { frictionId: "OF-006", trigger: "GitHub mutation approval/login", operatorCost: "medium", systemFix: "Document operator push lane", evidenceRefs: ["CHAT_DIRECT"] },
    { frictionId: "OF-007", trigger: "Protocol version drift", operatorCost: "medium", systemFix: "Z mirror sync on protocol commits", evidenceRefs: ["COR-001", "EVT-012"] },
  ],
  executionDeltas: [
    { executionDeltaId: "ED-001", situation: "Git Estate as only mechanism", actualExecution: { steps: ["Git Estate-specific design"], outcome: "narrow", evidenceRefs: ["CHAT_DIRECT"] }, optimalExecution: { steps: ["Shared platform + Git Estate plugin"], outcome: "extensible datasets", requiredPreflight: ["dataset registry"] }, deltaCost: { time: "medium", tokens: "low", operatorFrustration: "low" } },
    { executionDeltaId: "ED-002", situation: "TTL-only freshness", actualExecution: { steps: ["TTL fallback only"], outcome: "stale risk", evidenceRefs: ["CHAT_DIRECT"] }, optimalExecution: { steps: ["TTL + event invalidation"], outcome: "fresher reads", requiredPreflight: ["invalidation contract"] }, deltaCost: { time: "low", tokens: "low", operatorFrustration: "low" } },
    { executionDeltaId: "ED-003", situation: "Individual atomic writes", actualExecution: { steps: ["per-file writes"], outcome: "partial visibility", evidenceRefs: ["CHAT_DIRECT"] }, optimalExecution: { steps: ["generation atomicity + pointer last"], outcome: "safe activation", requiredPreflight: ["checksum verify"] }, deltaCost: { time: "medium", tokens: "low", operatorFrustration: "medium" } },
    { executionDeltaId: "ED-004", situation: "Estate-wide pull desire", actualExecution: { steps: ["bulk pull while dirty"], outcome: "blocked", evidenceRefs: ["USER_REPORTED_OPERATIONAL"] }, optimalExecution: { steps: ["clean fixture proof first"], outcome: "safe mutation", requiredPreflight: ["git status clean"] }, deltaCost: { time: "high", tokens: "medium", operatorFrustration: "high" } },
    { executionDeltaId: "ED-005", situation: "Temp cache vs mounted L comparison", actualExecution: { steps: ["compare unlike roots"], outcome: "confusing", evidenceRefs: ["USER_REPORTED_OPERATIONAL"] }, optimalExecution: { steps: ["isolated IH root"], outcome: "fair test", requiredPreflight: ["mount check"] }, deltaCost: { time: "medium", tokens: "low", operatorFrustration: "medium" } },
    { executionDeltaId: "ED-006", situation: "Chat-only findings output", actualExecution: { steps: ["draft in chat only"], outcome: "manual handoff", evidenceRefs: ["COR-001"] }, optimalExecution: { steps: ["push chat-gpt-harvest", "report SHA"], outcome: "automated ingest", requiredPreflight: ["protocol push section"] }, deltaCost: { time: "low", tokens: "low", operatorFrustration: "medium" } },
    { executionDeltaId: "ED-007", situation: "Status report misread as task", actualExecution: { steps: ["treat report as imperative"], outcome: "wrong work", evidenceRefs: ["EVT-011"] }, optimalExecution: { steps: ["classify report vs request"], outcome: "correct sequencing", requiredPreflight: [] }, deltaCost: { time: "low", tokens: "low", operatorFrustration: "medium" } },
  ],
  wrongMoves: [],
  duplicateWork: [
    { duplicateId: "DUP-001", subject: "HOT_CACHE_PLATFORM_OPERATIONAL", firstKnownInstance: "registry lookup required", priorIndexSlice: "NEEDS_REGISTRY_LOOKUP_FIRST", whyRepeated: "Possible existing harvest", avoidableBy: "duplication preflight", recommendedAction: "index" },
    { duplicateId: "DUP-002", subject: "ACTIVE_LEDGER_HOT_CACHE_OPERATIONAL", firstKnownInstance: "registry lookup required", priorIndexSlice: "NEEDS_REGISTRY_LOOKUP_FIRST", whyRepeated: "Possible existing harvest", avoidableBy: "duplication preflight", recommendedAction: "index" },
    { duplicateId: "DUP-003", subject: "PROMPT_APPROVAL_BOUNDARY_PASS", firstKnownInstance: "registry lookup required", priorIndexSlice: "NEEDS_REGISTRY_LOOKUP_FIRST", whyRepeated: "Possible existing implementation", avoidableBy: "registry lookup", recommendedAction: "index" },
    { duplicateId: "DUP-004", subject: "WESLEY_WORK vs WESLEYDESK cache root", firstKnownInstance: "EVT-008", priorIndexSlice: "host-authority", whyRepeated: "Host-specific incidents conflated", avoidableBy: "Host tag in seeds", recommendedAction: "index" },
  ],
  roiBacklog: [
    { rank: 1, title: "Measurement/observability for hot-cache routing", whyItPays: "Proves token savings", effort: "medium", savedWasteIds: ["TW-004"], ownerRepo: "CG-AppBuilder-MCP", seedAs: "command", suggestedWorkPackageId: "hot-cache-observability-v1" },
    { rank: 2, title: "Cache-root telemetry in scout hooks", whyItPays: "Fixes silent ext4 fallback", effort: "low", savedWasteIds: ["TW-001"], ownerRepo: "CG-AppBuilder-MCP", seedAs: "rule", suggestedWorkPackageId: "hot-cache-root-telemetry-v1" },
    { rank: 3, title: "ChatGPT branch-lane enforcement", whyItPays: "Clean ingest path", effort: "low", savedWasteIds: ["TW-002"], ownerRepo: "CapitalGlass-Cross-Agent", seedAs: "rule", suggestedWorkPackageId: "chatgpt-harvest-branch-lane-v1" },
    { rank: 4, title: "Workflow Estate verification", whyItPays: "Closes command-ID integrity", effort: "medium", savedWasteIds: [], ownerRepo: "CapitalGlass-Cross-Agent", seedAs: "runbook", suggestedWorkPackageId: "workflow-estate-verify-v1" },
    { rank: 5, title: "Failure Intelligence cache lane", whyItPays: "Reusable fix patterns", effort: "medium", savedWasteIds: [], ownerRepo: "CG-AppBuilder-MCP", seedAs: "index-slice", suggestedWorkPackageId: "failure-intelligence-cache-v1" },
    { rank: 6, title: "Infrastructure Estate dataset", whyItPays: "Mounts/runners/roots truth", effort: "medium", savedWasteIds: [], ownerRepo: "CG-AppBuilder-MCP", seedAs: "index-slice", suggestedWorkPackageId: "infrastructure-estate-v1" },
  ],
  doNotAdvanceMap: [
    { awardOrVerdict: "HOT_CACHE_PLATFORM_OPERATIONAL", currentStatus: "BLOCKED", doNotClaimUntil: ["Cursor cross-check receipts", "harvest:validate PASS"], lastKnownEvidence: ["EVT-005", "EVT-006"], proofCommandId: "hot-cache-immutable-generation-v1" },
    { awardOrVerdict: "INDEX_HIT", currentStatus: "BLOCKED", doNotClaimUntil: ["scout preflight in Cursor"], lastKnownEvidence: ["chatgpt-findings-source.md"], proofCommandId: "hot-cache-routed-compact-retrieval-v1" },
    { awardOrVerdict: "HARVEST_COMPLETE", currentStatus: "BLOCKED", doNotClaimUntil: ["harvest:validate PASS", "operator publish"], lastKnownEvidence: [HARVEST_ID] },
  ],
});

const seeds = [
  {
    seedId: "IH-THREAD-HOT-CACHE-FEDERATED-DATASETS-V1",
    kind: "architecture",
    title: "Federated governed datasets for hot-cache",
    summary: "One authority source, deterministic compiler, atomic publication per dataset.",
    retrievalQuestions: ["How should a new AI hot-cache domain be governed?", "Why avoid one monolithic everything index?"],
    evidenceRefs: [HARVEST_ID, "EVT-002", "EVT-003"],
    futureAgentInstructions: {
      whenThisAppears: "New domain proposed for caching",
      startAt: ["Dataset registry", "Authority Estate"],
      runPreflight: ["duplication preflight", "dataset registry lookup"],
      doNot: ["Create bespoke cache", "Make hot cache authoritative"],
      proveBeforeClaiming: ["schema pass", "atomic publish", "ACL-aware read"],
    },
    ownerRepo: "CG-AppBuilder-MCP",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
  },
  {
    seedId: "IH-THREAD-HOT-CACHE-ROOT-RESOLUTION-V1",
    kind: "failure-pattern",
    title: "Hot-cache root resolution order",
    summary: "Scout must report selected root when D/S missing and ext4 fallback used.",
    retrievalQuestions: ["Why did scout report HOT_CACHE_ROOT_MISSING?", "What is canonical cache-root resolution order?"],
    evidenceRefs: [HARVEST_ID, "EVT-008", "OF-003"],
    futureAgentInstructions: {
      whenThisAppears: "Hook cannot find D/S cache root",
      startAt: ["Resolve hotCacheRoot", "machine profile"],
      runPreflight: ["CG_AUTHORITY_CACHE_ROOT", "mount probe"],
      doNot: ["Assume shell env inheritance", "Hide fallback"],
      proveBeforeClaiming: ["resolvedHotCacheRoot", "hotCacheRootSource", "fallbackUsed"],
    },
    ownerRepo: "CG-AppBuilder-MCP",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "AUTOMATIC",
    status: "CANDIDATE",
  },
  {
    seedId: "IH-THREAD-CHATGPT-HARVEST-BRANCH-LANE-V1",
    kind: "lesson",
    title: "ChatGPT OBSERVED findings on chat-gpt-harvest",
    summary: "Push findings before Cursor ingest; never merge draft to main.",
    retrievalQuestions: ["Which branch receives ChatGPT OBSERVED findings?", "What must happen before Cursor ingest?"],
    evidenceRefs: [HARVEST_ID, "EVT-012", CHATGPT_COMMIT],
    futureAgentInstructions: {
      whenThisAppears: "DRAFT_FILE ChatGPT harvest closeout",
      startAt: ["chat-gpt-harvest branch", "chatgpt-findings-source.md path"],
      runPreflight: ["pre-push self-check"],
      doNot: ["Push to main", "Claim validation"],
      proveBeforeClaiming: ["commit SHA on branch", "publication not-run footer"],
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
    { priorHarvestId: "harvest-2026-08-04-hot-cache-wave-a-estate-ship-v1", overlapKind: "related-topic", subject: "hot-cache estate ship" },
    { priorHarvestId: "harvest-2026-08-05-workflow-estate-hot-cache-v1", overlapKind: "related-topic", subject: "workflow estate hot cache" },
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
    { repo: "CG-AppBuilder-MCP", role: "hot-cache platform, scout hooks, compile", paths: ["scripts/intelligence-hub/", "agent-packs/three-way-agent/hooks/"] },
    { repo: "CapitalGlass-Cross-Agent", role: "harvest ingest + protocol", paths: ["artifacts/agent-runs/" + HARVEST_ID] },
  ],
});

// registry + boundary
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
      crossAgentRole: "ChatGPT OBSERVED hot-cache thread autopsy",
      ownerRepoRole: p.packetTitle,
      currentGap: p.packetVerdict === "CROSS_CHECK_REQUIRED" ? p.nextAction : null,
    });
  }
}
registry.updatedAt = AS_OF;
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
fs.writeFileSync(boundaryPath, `${JSON.stringify(boundary, null, 2)}\n`, "utf8");

console.log(`Generated ${HARVEST_ID} at ${RUN_DIR}`);
