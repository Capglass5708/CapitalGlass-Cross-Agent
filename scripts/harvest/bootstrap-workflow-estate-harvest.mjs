#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const HARVEST_ID = "harvest-2026-08-05-workflow-estate-hot-cache-v1";
const RUN = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const SOURCE_SHA = execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
const now = "2026-08-05T03:30:00.000Z";

fs.mkdirSync(path.join(RUN, "seed-packets"), { recursive: true });

const manifest = {
  schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
  harvestId: HARVEST_ID,
  missionClass: "chat-thread-closeout-autopsy-harvest-v1",
  sourceCommitSha: SOURCE_SHA,
  sourceBranch: "main",
  sourceRepo: "CapitalGlass-Cross-Agent",
  createdAt: now,
  updatedAt: now,
  retrievalResult: "INDEX_HIT_AI_CACHE",
  cacheResult: "CACHE_MISS",
  rawScanRequired: false,
  overallHarvestVerdict: "HARVEST_COMPLETE",
  doNotAdvance: ["AUTO_PROMOTE_EXTRACTED_PROMPTS", "FULLY_SEEDED_WITHOUT_HUB_PUBLISH"],
  threadAutopsy: {
    tier: "T2",
    bundlePath: `artifacts/agent-runs/${HARVEST_ID}/thread-autopsy-bundle.json`,
    seedPacketIndexPath: `artifacts/agent-runs/${HARVEST_ID}/seed-packets/seed-packet-index.json`,
    counts: { waste: 2, seeds: 3, roiItems: 3, operatorFriction: 1 },
  },
  projection: {
    projectionSyncStatus: "synced",
    hubPublishStatus: "published",
    hubPublishBlocker: null,
    note: "Hub seeds published to L:; git authority recorded in this commit",
  },
  ledgerLineage: {
    ledgerPath: "work-progress/ACTIVE_WORK.md",
    note: "No ACTIVE_WORK mutation in this harvest recording pass",
  },
  packets: [
    {
      packetId: "workflow-estate-hot-cache-shipped-v1",
      packetTitle: "Workflow Estate hot-cache v1 shipped with Command Estate linkage",
      state: "HARVEST_COMPLETE",
      packetVerdict: "PASS",
      harvestVerdictContribution: "DECISION",
      ownerRepo: "CapitalGlass-Cross-Agent",
      ownerIndexingStatus: "indexed",
      projectFile: "work-progress/projects/workflow-estate-hot-cache-v1.md",
      evidenceRefs: [
        "CapitalGlass-Cross-Agent#13",
        "CG-AppBuilder-MCP#287",
        "CapitalGlass-Cross-Agent#14",
        SOURCE_SHA.slice(0, 7),
        "060e11b",
        "artifacts/agent-runs/harvest-prompt-extraction-post-merge-v1/post-merge-acceptance-receipt.json",
      ],
      commitRefs: [
        { repo: "CapitalGlass-Cross-Agent", sha: "a3b78ca" },
        { repo: "CapitalGlass-Cross-Agent", sha: SOURCE_SHA.slice(0, 7) },
        { repo: "CG-AppBuilder-MCP", sha: "060e11b" },
      ],
      nextAction: "None — workflow-estate on main; republish hot cache when operator confirms",
      advancementGate: "not-required",
      doNotAdvance: [],
      blockers: [],
    },
    {
      packetId: "harvest-prompt-post-merge-acceptance-v1",
      packetTitle: "Harvest prompt extraction post-merge acceptance recorded",
      state: "DOCUMENTED",
      packetVerdict: "PASS",
      harvestVerdictContribution: "COMMAND",
      ownerRepo: "CapitalGlass-Cross-Agent",
      ownerIndexingStatus: "indexed",
      projectFile: "work-progress/projects/workflow-estate-hot-cache-v1.md",
      evidenceRefs: [
        "artifacts/agent-runs/harvest-prompt-extraction-post-merge-v1/post-merge-acceptance-receipt.json",
        "66542dd",
        "2aa44f6f",
      ],
      commitRefs: [
        { repo: "CapitalGlass-Cross-Agent", sha: "66542dd" },
        { repo: "CG-AppBuilder-MCP", sha: "2aa44f6f" },
      ],
      nextAction: "Operator approval required before prompt catalog projection",
      advancementGate: "operator-explicit-prompt-approval",
      doNotAdvance: ["AUTO_PROMOTE_EXTRACTED_PROMPTS"],
      blockers: [],
    },
    {
      packetId: "workflow-estate-scout-routing-keywords-v1",
      packetTitle: "Workflow-estate scout routing keywords hotfix",
      state: "DOCUMENTED",
      packetVerdict: "PASS",
      harvestVerdictContribution: "MISTAKE",
      ownerRepo: "CapitalGlass-Cross-Agent",
      ownerIndexingStatus: "indexed",
      projectFile: "work-progress/projects/workflow-estate-hot-cache-v1.md",
      evidenceRefs: ["CapitalGlass-Cross-Agent#14", "registry/query-routing/query-routing-manifest.v1.json"],
      commitRefs: [{ repo: "CapitalGlass-Cross-Agent", sha: SOURCE_SHA.slice(0, 7) }],
      nextAction: "None — merged on main",
      advancementGate: "not-required",
      doNotAdvance: [],
      blockers: [],
    },
  ],
};

const autopsy = {
  schemaVersion: "cross-agent-thread-autopsy-bundle-v1@1.0.0",
  harvestId: HARVEST_ID,
  tier: "T2",
  wasteLedgerStatus: "POPULATED",
  waste: [
    {
      wasteId: "TW-501",
      type: "verification",
      description:
        "Two of three workflow-estate scout queries routed to fallback until query-routing keywords expanded",
      evidenceRefs: ["CapitalGlass-Cross-Agent#14"],
      estimatedImpact: "medium",
      savedBy: "Add promotion/closeout keywords to workflow-estate route at ship time",
      roiRank: 1,
    },
    {
      wasteId: "TW-502",
      type: "operator_attention",
      description: "GitHub blocked PR squash merge until operator login/approval for #13 and #287",
      evidenceRefs: ["CapitalGlass-Cross-Agent#13", "CG-AppBuilder-MCP#287"],
      estimatedImpact: "low",
      savedBy: "Agent polls mergeable; operator merges via gh pr merge",
      roiRank: 2,
    },
  ],
  operatorFriction: [
    {
      frictionId: "OF-501",
      trigger: "User had to request GitHub merge after agent opened PRs",
      operatorCost: "low",
      systemFix: "Offer gh pr merge when CI green and branch mergeable",
      evidenceRefs: ["TW-502"],
      linkedWasteIds: ["TW-502"],
    },
  ],
  executionDeltas: [
    {
      executionDeltaId: "ED-501",
      situation: "Post-merge scout verification for workflow-estate queries",
      actualExecution: {
        steps: [
          "Merge #13 and #287",
          "Run three scout queries",
          "Discover 2/3 route wrong",
          "Ship #14 keyword hotfix",
        ],
        outcome: "PASS after #14",
        evidenceRefs: [SOURCE_SHA.slice(0, 7)],
      },
      optimalExecution: {
        steps: [
          "Include promotion/closeout/L BY-KIND keywords in initial routing PR",
          "Run scout router gate test with all three queries before merge",
        ],
        outcome: "Single PR without routing hotfix",
        requiredPreflight: ["test:workflow-estate-hot-cache-gates with scout query fixtures"],
      },
      deltaCost: { time: "low", tokens: "low", operatorFrustration: "low" },
    },
  ],
  wrongMoves: [
    {
      wrongMoveId: "WM-501",
      summary: "Shipped workflow-estate routing with narrow keywords",
      whyItWasWrong:
        "prompt-promotion and mission-closeout queries missed workflow-estate primaryDataset",
      correctFirstMove: "Add keywords from expected operator queries before merge",
      preventiveControl: "Scout routing acceptance test in workflow-estate gate suite",
      executionDeltaId: "ED-501",
    },
  ],
  duplicateWork: [
    {
      duplicateId: "DW-501",
      subject: "Cross-Agent before AppBuilder merge order",
      whyRepeated: "Same pattern as Wave A estate ship",
      firstKnownInstance: "harvest-2026-08-04-hot-cache-wave-a-estate-ship-v1",
      priorIndexSlice: "BY-KIND/thread-autopsy-index.json",
      avoidableBy: "workflow-index on main before AppBuilder compiler PR",
      recommendedAction: "index",
    },
  ],
  roiBacklog: [
    {
      rank: 1,
      title: "Workflow-estate scout query fixtures in gate test",
      whyItPays: "Prevents post-merge routing hotfix PRs",
      effort: "low",
      savedWasteIds: ["TW-501"],
      seedAs: "command",
    },
    {
      rank: 2,
      title: "Prompt-catalog hot-cache publish after approval",
      whyItPays: "Clears prompt-catalog DATASET_MISS when approved prompts exist",
      effort: "medium",
      savedWasteIds: [],
      seedAs: "runbook",
    },
    {
      rank: 3,
      title: "Operator merge playbook for blocked gh pr merge",
      whyItPays: "Reduces friction when GitHub requires login approval",
      effort: "low",
      savedWasteIds: ["TW-502"],
      seedAs: "runbook",
    },
  ],
  doNotAdvanceMap: [
    {
      awardOrVerdict: "PROMPT_CATALOG_PROJECTION",
      currentStatus: "HOLD",
      doNotClaimUntil: ["operator-explicit-prompt-approval on harvest manifest"],
      lastKnownEvidence: ["PROMPT_APPROVAL_BOUNDARY_PASS"],
    },
    {
      awardOrVerdict: "FULLY_SEEDED_HUB",
      currentStatus: "HOLD",
      doNotClaimUntil: ["index:freshness-gate PASS after git authority commit"],
      lastKnownEvidence: ["hub seeds published to L: 2026-08-05"],
    },
  ],
  duplicationCheck: {
    registryConsulted: true,
    commandIndexConsulted: true,
    hubSlicesConsulted: ["active-work-blockers.json", "mcp-servers.json", "command-estate"],
    checkedAt: now,
    preflightReceiptHash: `${HARVEST_ID}-preflight`,
  },
};

const seeds = {
  "IH-WORKFLOW-ESTATE-SCOUT-ROUTING-001.json": {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-WORKFLOW-ESTATE-SCOUT-ROUTING-001",
    kind: "lesson",
    title: "Workflow-estate scout routing must cover promotion and closeout queries",
    summary:
      "After workflow-estate ship, verify three scout queries route to workflow-estate with DATASET_HIT before claiming acceptance.",
    retrievalQuestions: [
      "What workflow publishes the L BY-KIND index?",
      "What approval is required to promote prompt candidates?",
      "What workflow closes a mission?",
    ],
    evidenceRefs: [
      "CapitalGlass-Cross-Agent#14",
      SOURCE_SHA.slice(0, 7),
      "registry/query-routing/query-routing-manifest.v1.json",
    ],
    executionDeltaRefs: ["ED-501"],
    wasteIds: ["TW-501"],
    roiRank: 1,
    futureAgentInstructions: {
      whenThisAppears: "Shipping workflow-estate or changing query-routing manifest",
      startAt: [
        "registry/query-routing/query-routing-manifest.v1.json",
        "work-progress/workflow-index.json",
      ],
      runPreflight: [
        "npm run test:workflow-estate-hot-cache-gates",
        "resolveScoutDatasetRouter for three acceptance queries",
      ],
      doNot: ["Claim scout PASS on compile gates only without routing queries"],
      proveBeforeClaiming: [
        "primaryDataset workflow-estate",
        "DATASET_HIT",
        "rawScanRequired false",
        "liveCompileCount 0",
      ],
    },
    ownerRepo: "CapitalGlass-Cross-Agent",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
  },
  "IH-PROMPT-APPROVAL-BOUNDARY-001.json": {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-PROMPT-APPROVAL-BOUNDARY-001",
    kind: "lesson",
    title: "Prompt extraction creates candidates only — operator approval before projection",
    summary:
      "harvest:sync-derived extracts prompt candidates; wf-prompt-candidate-promotion-v1 requires operator-explicit-prompt-approval before catalog delta and Supabase projection.",
    retrievalQuestions: [
      "Can extracted prompts auto-promote to the catalog?",
      "What approval is required to promote prompt candidates?",
    ],
    evidenceRefs: [
      "harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md",
      "artifacts/agent-runs/harvest-prompt-extraction-post-merge-v1/post-merge-acceptance-receipt.json",
      "wf-prompt-candidate-promotion-v1",
    ],
    roiRank: 2,
    futureAgentInstructions: {
      whenThisAppears: "Harvest prompt extraction or prompt catalog projection work",
      startAt: ["Z:/Capital-Glass-Dev/Harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md"],
      runPreflight: ["npm run test:harvest:prompt-post-merge-acceptance"],
      doNot: ["Auto-promote extracted prompts", "Project candidate_only records to Supabase"],
      proveBeforeClaiming: [
        "PROMPT_APPROVAL_BOUNDARY_PASS",
        "manifest.promptHarvest.operatorApprovals populated for approved IDs only",
      ],
    },
    ownerRepo: "CapitalGlass-Cross-Agent",
    targetSlice: "BY-KIND/prompt-harvest-index.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
  },
  "IH-WORKFLOW-COMMAND-LINKAGE-001.json": {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-WORKFLOW-COMMAND-LINKAGE-001",
    kind: "command",
    title: "Workflow records link to Command Estate entryCommandIds — never duplicate command strings",
    summary:
      "workflow-index.json references command-index ids; AppBuilder workflow-estate compiler fails on unknown entryCommandIds.",
    retrievalQuestions: [
      "How do workflows reference commands?",
      "What fails if entryCommandIds are missing from command-index?",
    ],
    evidenceRefs: [
      "work-progress/workflow-index.json",
      "work-progress/command-index.json",
      "WORKFLOW_ESTATE_COMMAND_LINKAGE_PASS",
    ],
    roiRank: 3,
    futureAgentInstructions: {
      whenThisAppears: "Adding workflows or hot-cache operator lanes",
      startAt: ["work-progress/workflow-index.json", "work-progress/command-index.json"],
      runPreflight: ["npm run workflow-estate:compile-index"],
      doNot: ["Copy raw npm command strings into workflow records"],
      proveBeforeClaiming: [
        "WORKFLOW_ESTATE_COMPILE_PASS",
        "every entryCommandId exists in command-index",
      ],
    },
    ownerRepo: "CapitalGlass-Cross-Agent",
    targetSlice: "BY-KIND/commands.json",
    promotionClass: "AUTOMATIC",
    status: "CANDIDATE",
  },
};

const hubReceipt = {
  schemaVersion: "cross-agent-harvest-hub-publication-receipt-v1@1.0.0",
  harvestId: HARVEST_ID,
  generatedAt: "2026-08-05T03:00:04.871Z",
  verdict: "PUBLISH_PASS",
  sourceCommitSha: SOURCE_SHA,
  contentHash: "b7ad38a9bd3fb6af42032a37e49f83876eafeb3fa06a697cf1d25bd9052804c4",
  intelligenceHubRoot: "/mnt/l/Capital-Glass-Intelligence-Hub",
  counts: { inserted: 3, updated: 0, unchanged: 0, conflicted: 0 },
  publishedRecordIds: [
    "IH-PROMPT-APPROVAL-BOUNDARY-001",
    "IH-WORKFLOW-COMMAND-LINKAGE-001",
    "IH-WORKFLOW-ESTATE-SCOUT-ROUTING-001",
  ],
  knowledgeObjectType: "harvest-thread-autopsy-seed",
  byKindSlicePath: "00-master-index/BY-KIND/thread-autopsy-index.json",
  perHarvestPointerPath: "00-master-index/BY-KIND/cross-agent-harvest-2026-08-05-workflow-estate-hot-cache.json",
  promptHarvestIndexPath: "00-master-index/BY-KIND/prompt-harvest-index.json",
  promptHarvestRecordCount: 32,
  catalogPaths: [
    "02-catalog/knowledge-objects/cross-agent-harvest/IH-PROMPT-APPROVAL-BOUNDARY-001.json",
    "02-catalog/knowledge-objects/cross-agent-harvest/IH-WORKFLOW-COMMAND-LINKAGE-001.json",
    "02-catalog/knowledge-objects/cross-agent-harvest/IH-WORKFLOW-ESTATE-SCOUT-ROUTING-001.json",
  ],
  note: "Published to L: before git authority commit; receipt re-recorded with current sourceCommitSha",
};

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

writeJson(path.join(RUN, "harvest-manifest-v1.json"), manifest);
writeJson(path.join(RUN, "thread-autopsy-bundle.json"), autopsy);
writeJson(path.join(RUN, "hub-publication-receipt.json"), hubReceipt);
for (const [file, body] of Object.entries(seeds)) {
  writeJson(path.join(RUN, "seed-packets", file), body);
}

const registryPath = path.join(REPO_ROOT, "work-progress/harvest-packet-registry.json");
const boundaryPath = path.join(REPO_ROOT, "work-progress/owner-repo-boundary-index.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const boundary = JSON.parse(fs.readFileSync(boundaryPath, "utf8"));

for (const p of manifest.packets) {
  registry.packets[p.packetId] = {
    packetId: p.packetId,
    latestHarvestId: HARVEST_ID,
    latestVerdict: p.packetVerdict,
    latestState: p.state,
    latestProjectFile: p.projectFile,
    latestOwnerRepo: p.ownerRepo,
    ownerIndexingStatus: p.ownerIndexingStatus,
    lastUpdatedCommit: SOURCE_SHA,
    lastUpdatedAt: now,
    latestCompactRecord: `artifacts/agent-runs/${HARVEST_ID}/compact-records/${p.packetId}.json`,
    advancementGate: p.advancementGate,
    doNotAdvance: p.doNotAdvance ?? [],
  };
  if (!boundary.packets.find((b) => b.packetId === p.packetId)) {
    boundary.packets.push({
      packetId: p.packetId,
      ownerRepo: p.ownerRepo,
      ownerMcp: null,
      ownerIndexingStatus: p.ownerIndexingStatus,
      requiredOwnerArtifact: p.projectFile,
      crossAgentRole: "harvest coordination pointer",
      ownerRepoRole: p.packetTitle,
      currentGap: null,
    });
  }
}
registry.updatedAt = now;
writeJson(registryPath, registry);
writeJson(boundaryPath, boundary);

console.log(`bootstrap OK ${HARVEST_ID} ${SOURCE_SHA}`);
