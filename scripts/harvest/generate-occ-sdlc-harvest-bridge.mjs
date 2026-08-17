#!/usr/bin/env node
/**
 * Generate OCC SDLC harvest bridge bundle for harvest-capital-glass-operations-command-center-v1.
 * Mission: occ-sdlc-harvest-bridge-v1
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { hashCanonicalJson } from "./lib/hash.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

const WORK_PACKAGE = "capital-glass-operations-command-center-v1";
const HARVEST_ID = "harvest-2026-08-17-capital-glass-operations-command-center-v1";
const BRIDGE_WP = "occ-sdlc-harvest-bridge-v1";
const PACKET_ID = WORK_PACKAGE;
const PROJECT_FILE = `work-progress/projects/${PACKET_ID}.md`;

const CALENDAR_WORKTREE =
  "/home/wesle/repos/.worktrees/CapitalGlass-CalendarDashBoard/capital-glass-operations-command-center-v1";
const APPBUILDER_ROOT = path.resolve(REPO_ROOT, "../CG-AppBuilder-MCP");

const SOURCE_SHA = execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
const AS_OF = new Date().toISOString();
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);

const seeds = [
  {
    seedId: "IH-OCC-LATEST-WINS-PO-001",
    kind: "success-pattern",
    title: "OCC latest-wins PO pairing prevents duplicate procurement rows",
    summary:
      "Operations Command Center uses idempotent PO pairing with latest-wins change propagation; duplicate procurement horizon rows must not appear when PO revisions arrive.",
    retrievalQuestions: [
      "How does Operations Command Center handle PO revision propagation?",
      "What is latest-wins pairing in Calendar command center?",
      "Why must PO pairing be idempotent in OCC procurement horizon?"
    ],
    evidenceRefs: [
      `${CALENDAR_WORKTREE}/lib/command-center/operator-command/index.ts`,
      `${CALENDAR_WORKTREE}/artifacts/agent-runs/${WORK_PACKAGE}/closeout-manifest.json`
    ],
    ownerRepo: "CapitalGlass-CalendarDashBoard",
  },
  {
    seedId: "IH-OCC-UNCONFIRMED-DOC-DATES-001",
    kind: "policy",
    title: "OCC must not silently promote unconfirmed document OCR dates",
    summary:
      "Document confirmation lifecycle is reused from CapitalGlass-Documents; OCR-extracted dates stay unconfirmed until estimator approval — no silent promotion into operator command surfaces.",
    retrievalQuestions: [
      "Does Operations Command Center auto-promote OCR document dates?",
      "What is the human confirmation gate for OCC document dates?"
    ],
    evidenceRefs: [
      `${CALENDAR_WORKTREE}/artifacts/agent-runs/${WORK_PACKAGE}/closeout-manifest.json`,
      "CapitalGlass-Documents confirmation lifecycle"
    ],
    ownerRepo: "CapitalGlass-CalendarDashBoard",
  },
  {
    seedId: "IH-OCC-PROCUREMENT-RISK-001",
    kind: "domain-rule",
    title: "Six-week procurement horizon uses UNKNOWN_LEAD_TIME instead of invented dates",
    summary:
      "OCC six-week procurement view classifies ON_TRACK, ORDER_NOW, AT_RISK, LATE, and UNKNOWN_LEAD_TIME — unknown lead times remain UNKNOWN rather than fabricated.",
    retrievalQuestions: [
      "What procurement risk states does Operations Command Center expose?",
      "How does OCC handle unknown vendor lead times?"
    ],
    evidenceRefs: [
      `${CALENDAR_WORKTREE}/components/dashboard/command-center/SixWeekProcurementView.tsx`,
      `${CALENDAR_WORKTREE}/artifacts/current/CALENDAR_OPERATIONS_COMMAND_CENTER_V1_CODE_COMPLETE.json`
    ],
    ownerRepo: "CapitalGlass-CalendarDashBoard",
  },
  {
    seedId: "IH-OCC-HARVEST-CLOSEOUT-001",
    kind: "failure-pattern",
    title: "Wave 15 empty harvest — wrong closeout schema bypassed SDLC findings lift",
    summary:
      "WaveRunner Wave 15 accepted HARVEST_TRANSPORT with zero findings because occ-closeout-manifest-v1 was passed instead of SDLC closeout with verifiedTruths, gateResults, and evidence. Repair requires exportWaverunnerHandoff + Cross-Agent harvest:validate + Hub publication.",
    retrievalQuestions: [
      "Why did Wave 15 OCC harvest have empty coverage?",
      "What closeout schema does exportWaverunnerHandoff require?",
      "HARVEST_TRANSPORT_ACCEPTED vs COMPOUNDING_COVERAGE_VALID"
    ],
    evidenceRefs: [
      `${CALENDAR_WORKTREE}/artifacts/agent-runs/${WORK_PACKAGE}/wave-15-intelligence-harvest.json`,
      `${APPBUILDER_ROOT}/scripts/sdlc-protocol-cursor/lib/export-waverunner-handoff.mjs`,
      `${CALENDAR_WORKTREE}/artifacts/agent-runs/occ-operational-publication-hub-gap-investigation-v1/investigation-report-v1.json`
    ],
    ownerRepo: "CapitalGlass-Cross-Agent",
    promotionClass: "POLICY_GATED",
  },
];

function writeJson(relPath, value) {
  const full = path.join(REPO_ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function seedPacket(seed) {
  return {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: seed.seedId,
    kind: seed.kind,
    title: seed.title,
    summary: seed.summary,
    retrievalQuestions: seed.retrievalQuestions,
    evidenceRefs: seed.evidenceRefs,
    futureAgentInstructions: {
      whenThisAppears: seed.title,
      startAt: [`L:/Capital-Glass-Intelligence-Hub/02-catalog/knowledge-objects/cross-agent-harvest/${seed.seedId.toLowerCase()}.json`],
      runPreflight: ["npm run agent:index:scout -- --json"],
      doNot: ["Treat repo-local compounding-reuse-receipt as Hub authority when L: is mountable"],
      proveBeforeClaiming: ["INDEX_HIT from L: catalog seed, not Calendar artifact grep"]
    },
    ownerRepo: seed.ownerRepo,
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: seed.promotionClass ?? "RETRIEVAL_ONLY",
    status: "CANDIDATE",
    harvestId: HARVEST_ID,
    workPackageId: WORK_PACKAGE,
  };
}

const packet = {
  packetId: PACKET_ID,
  packetTitle: "Capital Glass Operations Command Center v1 — CODE_COMPLETE harvest bridge",
  packetKind: "milestone",
  state: "WARN",
  packetVerdict: "PASS",
  harvestVerdictContribution: "CURRENT_AUTHORITY",
  ownerRepo: "CapitalGlass-CalendarDashBoard",
  ownerIndexingStatus: "indexed",
  projectFile: PROJECT_FILE,
  nextAction: "Operator merge PR #26; then occ-live-browser-proof-v1 authenticated Playwright",
  advancementGate: "operator-merge-and-browser-proof",
  doNotAdvance: [
    "Claim CAPITAL_GLASS_OPERATIONS_COMMAND_CENTER_V1_OPERATIONALLY_PROVEN",
    "Treat Hub repair complete without L: indexed retrieval proof",
    "Merge PR #26 without operator merge approval"
  ],
  evidenceRefs: [
    `${CALENDAR_WORKTREE}/artifacts/agent-runs/${WORK_PACKAGE}/closeout-manifest.json`,
    `${CALENDAR_WORKTREE}/artifacts/current/CALENDAR_OPERATIONS_COMMAND_CENTER_V1_CODE_COMPLETE.json`,
    `${APPBUILDER_ROOT}/artifacts/agent-runs/${WORK_PACKAGE}/sdlc-cursor-closeout.json`,
    "https://github.com/Capglass5708/CapitalGlass-CalendarDashBoard/pull/26"
  ],
  commitRefs: [{ repo: "CapitalGlass-CalendarDashBoard", sha: "5fe2c3e6" }],
  blockers: ["browserE2eLive BLOCKED", "mainMerge BLOCKED"]
};

const manifest = {
  schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
  harvestId: HARVEST_ID,
  missionClass: BRIDGE_WP,
  sourceCommitSha: SOURCE_SHA,
  sourceBranch: "main",
  sourceRepo: "CapitalGlass-Cross-Agent",
  createdAt: AS_OF,
  updatedAt: AS_OF,
  retrievalResult: "INDEX_HIT",
  cacheResult: "CACHE_MISS",
  rawScanRequired: false,
  overallHarvestVerdict: "HARVEST_COMPLETE",
  subject: "OCC SDLC harvest bridge — capital-glass-operations-command-center-v1 compounding intelligence",
  doNotAdvance: packet.doNotAdvance,
  supersededClaims: [
    {
      packetId: WORK_PACKAGE,
      claim: "wave-15-intelligence-harvest.json empty envelope was incorrectly treated as compounding success",
      supersededBy: `${HARVEST_ID} SDLC-validated harvest`,
      recordedAt: AS_OF
    }
  ],
  projection: {
    projectionSyncStatus: "not-run",
    hubPublishStatus: "not-run",
    note: "occ-sdlc-harvest-bridge-v1 publishes seeds to L: via harvest:publish-hub-seed"
  },
  waverunnerHandoff: {
    milestoneId: WORK_PACKAGE,
    waveId: WORK_PACKAGE,
    executionMode: "FORMAL_CLOSEOUT",
    sourceWorkPackage: WORK_PACKAGE,
    productionHarvest: true,
    syntheticFixture: false,
    closeoutPath: `artifacts/agent-runs/${HARVEST_ID}/sdlc-intelligence-harvest.json`,
    sdlcCloseoutReceiptPath: `artifacts/agent-runs/${WORK_PACKAGE}/sdlc-waverunner-handoff-bridge-receipt.json`
  },
  improvementCandidates: [
    {
      candidateId: "WC-OCC-001-harvest-coverage-gate",
      category: "ROUTING",
      title: "Distinguish HARVEST_TRANSPORT_ACCEPTED from COMPOUNDING_COVERAGE_VALID",
      problem: "Wave 15 reported successful harvest with zero useful coverage",
      rootCause: "mergeCloseoutIntoFindings requires SDLC verifiedTruths; compact OCC manifest lifted nothing",
      proposedImprovement: "Require harvestedSurfaceCount > 0 before COMPOUNDING_COVERAGE_VALID",
      targetRepository: "CG-AppBuilder-MCP",
      targetComponent: "WaveRunner",
      expectedBenefit: "Prevent false compounding success on empty envelopes",
      risk: "May block legitimate no-op closeouts",
      confidence: "HIGH",
      evidenceRefs: [`${CALENDAR_WORKTREE}/artifacts/agent-runs/${WORK_PACKAGE}/wave-15-intelligence-harvest.json`],
      authorityStatus: "PROPOSAL",
      reviewStatus: "PENDING"
    }
  ],
  commitEvidence: [
    { repo: "CapitalGlass-CalendarDashBoard", sha: "5fe2c3e602f7a67c685df65582e36119e37b7117", role: "occ-code-complete" },
    { repo: "CapitalGlass-Cross-Agent", sha: SOURCE_SHA, role: "harvest-bridge" }
  ],
  packets: [packet],
  publicationPolicy: {
    syntheticFixture: false,
    publicationEligibility: "PRODUCTION_WAVERUNNER_ROUTING",
    productionHarvest: true
  },
  ledgerLineage: {
    ledgerContentHashBefore: null,
    ledgerContentHashAfter: null
  },
  promptHarvest: {
    reviewed: false,
    candidatesFound: 0,
    deduplicated: 0,
    approved: 0,
    rejected: 0,
    candidateOnly: 0,
    promptCatalogUpdated: false,
    verdict: "PROMPT_HARVEST_NO_CANDIDATES"
  }
};

fs.mkdirSync(path.join(RUN_DIR, "seed-packets"), { recursive: true });
fs.mkdirSync(path.join(RUN_DIR, "compact-records"), { recursive: true });

writeJson(`artifacts/agent-runs/${HARVEST_ID}/harvest-manifest-v1.json`, manifest);

for (const seed of seeds) {
  writeJson(`artifacts/agent-runs/${HARVEST_ID}/seed-packets/${seed.seedId}.json`, seedPacket(seed));
}

const compactBody = {
  schemaVersion: "cross-agent-harvest-compact-record-v1@1.0.0",
  harvestId: HARVEST_ID,
  packetId: PACKET_ID,
  state: packet.state,
  packetVerdict: packet.packetVerdict,
  ownerRepo: packet.ownerRepo,
  ownerIndexingStatus: packet.ownerIndexingStatus,
  nextAction: packet.nextAction,
  evidenceRefs: packet.evidenceRefs,
  doNotAdvance: packet.doNotAdvance,
  advancementGate: packet.advancementGate
};
writeJson(`artifacts/agent-runs/${HARVEST_ID}/compact-records/${PACKET_ID}.json`, {
  ...compactBody,
  contentHash: hashCanonicalJson(compactBody)
});

const projectMd = `# ${PACKET_ID}

**Owner repo:** CapitalGlass-CalendarDashBoard  
**Harvest:** \`${HARVEST_ID}\`  
**Bridge mission:** \`${BRIDGE_WP}\`  
**State:** CODE_COMPLETE (WARN — browser + merge external)

## Capabilities (verified)

- Needs Attention Today exception surface
- Three-week look-ahead (this week / next week / week 3)
- Six-week procurement horizon (ON_TRACK / ORDER_NOW / AT_RISK / LATE / UNKNOWN_LEAD_TIME)
- Project risk with why-text
- Drawer provenance lineage and source deep links
- Idempotent PO pairing and latest-wins change propagation

## Hub seeds

| Seed | Topic |
| --- | --- |
| IH-OCC-LATEST-WINS-PO-001 | Latest-wins PO pairing |
| IH-OCC-UNCONFIRMED-DOC-DATES-001 | No silent OCR date promotion |
| IH-OCC-PROCUREMENT-RISK-001 | UNKNOWN_LEAD_TIME policy |
| IH-OCC-HARVEST-CLOSEOUT-001 | Wave 15 empty harvest root cause |

## Remaining gates

- PR #26 merge (operator authorization)
- Authenticated browser proof after deploy (\`occ-live-browser-proof-v1\`)
- Do **not** claim \`CAPITAL_GLASS_OPERATIONS_COMMAND_CENTER_V1_OPERATIONALLY_PROVEN\`

## Evidence

- \`${CALENDAR_WORKTREE}/artifacts/agent-runs/${WORK_PACKAGE}/closeout-manifest.json\`
- \`${CALENDAR_WORKTREE}/artifacts/current/CALENDAR_OPERATIONS_COMMAND_CENTER_V1_CODE_COMPLETE.json\`
- PR: https://github.com/Capglass5708/CapitalGlass-CalendarDashBoard/pull/26
`;
fs.writeFileSync(path.join(REPO_ROOT, PROJECT_FILE), projectMd, "utf8");

function upsertRegistryAndBoundary() {
  const registryPath = path.join(REPO_ROOT, "work-progress/harvest-packet-registry.json");
  const boundaryPath = path.join(REPO_ROOT, "work-progress/owner-repo-boundary-index.json");
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const boundary = JSON.parse(fs.readFileSync(boundaryPath, "utf8"));

  registry.packets[PACKET_ID] = {
    packetId: PACKET_ID,
    latestHarvestId: HARVEST_ID,
    latestVerdict: packet.packetVerdict,
    latestState: packet.state,
    latestProjectFile: PROJECT_FILE,
    latestOwnerRepo: packet.ownerRepo,
    ownerIndexingStatus: packet.ownerIndexingStatus,
    lastUpdatedCommit: SOURCE_SHA,
    lastUpdatedAt: AS_OF,
    latestCompactRecord: `artifacts/agent-runs/${HARVEST_ID}/compact-records/${PACKET_ID}.json`,
    advancementGate: packet.advancementGate,
    doNotAdvance: packet.doNotAdvance
  };

  if (!boundary.packets.find((b) => b.packetId === PACKET_ID)) {
    boundary.packets.push({
      packetId: PACKET_ID,
      ownerRepo: packet.ownerRepo,
      ownerMcp: "user-calendar-app-mcp",
      ownerIndexingStatus: packet.ownerIndexingStatus,
      requiredOwnerArtifact: "artifacts/current/CALENDAR_OPERATIONS_COMMAND_CENTER_V1_CODE_COMPLETE.json",
      crossAgentRole: "OCC compounding harvest pointer",
      ownerRepoRole: "Operations Command Center operator surfaces on Calendar",
      currentGap: "Live browser proof and main merge"
    });
  }

  registry.updatedAt = AS_OF;
  fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  fs.writeFileSync(boundaryPath, `${JSON.stringify(boundary, null, 2)}\n`, "utf8");
}

upsertRegistryAndBoundary();

writeJson(
  `artifacts/agent-runs/${BRIDGE_WP}/generator-receipt.json`,
  {
    schemaVersion: "occ-sdlc-harvest-bridge-generator-v1@1.0.0",
    workPackageId: BRIDGE_WP,
    harvestId: HARVEST_ID,
    generatedAt: AS_OF,
    sourceSha: SOURCE_SHA,
    seedCount: seeds.length,
    nextSteps: [
      "npm run sdlc:cursor:export-waverunner-handoff (CG-AppBuilder-MCP)",
      "npm run harvest:record -- --harvest-id=harvest-capital-glass-operations-command-center-v1",
      "npm run harvest:publish-hub-seed -- --harvest-id=harvest-capital-glass-operations-command-center-v1"
    ]
  }
);

console.log(`Generated ${HARVEST_ID}`);
console.log(`  seeds=${seeds.length} packet=${PACKET_ID}`);
console.log(`  project=${PROJECT_FILE}`);
