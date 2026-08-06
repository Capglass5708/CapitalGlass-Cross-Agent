#!/usr/bin/env node
/**
 * harvest-2026-08-06-wesley-work-l-research-bootstrap-closeout-v1 (T2)
 * Thread: DE handoff DEGRADED (/mnt/l missing) → preflight fixes → durable L: bootstrap (d6ad9624).
 * Supersedes/extends harvest-2026-08-04-wesleywork-l-windows-closeout-v1 (same L: class, DE intake path).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARVEST_ID = "harvest-2026-08-06-wesley-work-l-research-bootstrap-closeout-v1";
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const AS_OF = "2026-08-06T08:00:00.000Z";
const SOURCE_SHA = execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
const PRIOR_HARVEST = "harvest-2026-08-04-wesleywork-l-windows-closeout-v1";
const APP_BUILDER_COMMIT = "d6ad9624";
const APP_BUILDER_PREFLIGHT_COMMIT = "0113aab9";
const DOCUMENTS_CONTRACT_COMMIT = "66a8bdb";

function writeJson(rel, value) {
  const p = path.join(RUN_DIR, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const PROJECT_FILE = "work-progress/projects/2026-08-02_z-drive-disconnect-recurrence-v1.md";

function packet(base) {
  return {
    harvestVerdictContribution: "RECORDED",
    ownerMcp: base.ownerMcp ?? "user-cg-app-mcp",
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
    packetId: "de-handoff-degraded-wsl-l-unmounted-v1",
    packetKind: "blocker",
    packetTitle: "DE handoff DEGRADED when /mnt/l missing despite Windows L: corpus",
    state: "RESOLVED",
    packetVerdict: "BOOTSTRAP_SHIPPED",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "indexed",
    evidenceRefs: [
      "run-de-handoff-health.mjs dualCorpusBridgeValid:false researchIntakeIndexReadable:false",
      "manual sudo mount -t drvfs L: /mnt/l → HEALTHY",
      `CG-AppBuilder-MCP ${APP_BUILDER_COMMIT}`,
      "thread-autopsy-bundle.json#ED-001",
    ],
    nextAction: "Operator: npm run wsl:install-l-fstab after first successful mount for reboot durability",
    advancementGate: "npm run wsl:bootstrap-l-research → state HEALTHY; npm run de:handoff-health exit 0",
    doNotAdvance: [
      "Claim de:handoff-health PASS while researchIntakeIndexReadable is false",
      "Mask DEGRADED by removing de-handoff-health from preflight",
    ],
    relatedPackets: ["wesley-work-l-research-bootstrap-protocol-v1"],
    commitRefs: [`CG-AppBuilder-MCP@${APP_BUILDER_COMMIT}`],
  }),
  packet({
    packetId: "preflight-duplicate-de-handoff-step-v1",
    packetKind: "mistake",
    packetTitle: "Duplicate de-handoff-health STEPS entry doubled preflight failure noise",
    state: "FIXED",
    packetVerdict: "PASS",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "indexed",
    evidenceRefs: [
      `agent-preflight-app-builder-mcp.mjs dedupe ${APP_BUILDER_PREFLIGHT_COMMIT}`,
      "formatStepEvidence() prefers stdout over npm stderr",
    ],
    nextAction: "None — shipped",
    advancementGate: "agent:preflight:app-builder-mcp single de-handoff-health step",
    doNotAdvance: ["Add parallel health probes without dedupe review"],
    commitRefs: [`CG-AppBuilder-MCP@${APP_BUILDER_PREFLIGHT_COMMIT}`],
  }),
  packet({
    packetId: "de-handoff-pipe-exit-code-trap-v1",
    packetKind: "faster_path",
    packetTitle: "Piped npm run de:handoff-health hides real exit code via tail",
    state: "RECORDED",
    packetVerdict: "PASS",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "indexed",
    evidenceRefs: [
      "docs/CURSOR_WSL_REMOTE_SETUP.md pipe warning",
      "thread-autopsy-bundle.json#ED-002",
    ],
    nextAction: "Always check $? after de:handoff-health; read probe JSON stdout",
    advancementGate: "Standalone npm run de:handoff-health exit matches probe state",
    doNotAdvance: ["Infer HEALTHY from tail of piped output"],
  }),
  packet({
    packetId: "document-layer-synology-register-false-positive-v1",
    packetKind: "mistake",
    packetTitle: "mcp:contract-audit false positive on document-synology-primary-register.ts",
    state: "FIXED",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Documents",
    ownerIndexingStatus: "indexed",
    ownerMcp: "user-document-center-app-mcp",
    evidenceRefs: [
      `mcp-document-contract-enforcement.mjs allowlist ${DOCUMENTS_CONTRACT_COMMIT}`,
      "claimCanonicalProjectDocument used; POST targets document_storage_locations",
    ],
    nextAction: "None — shipped",
    advancementGate: "npm run mcp:document-contract-check PASS in CapitalGlass-Documents",
    doNotAdvance: ["Regex-only project_documents POST detection without allowlist path"],
    commitRefs: [`CapitalGlass-Documents@${DOCUMENTS_CONTRACT_COMMIT}`],
  }),
  packet({
    packetId: "wesley-work-l-research-bootstrap-protocol-v1",
    packetKind: "protocol_upgrade",
    packetTitle: "Idempotent WESLEY_WORK L: → /mnt/l bootstrap before DE handoff preflight",
    state: "SHIPPED",
    packetVerdict: "PASS",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "indexed",
    evidenceRefs: [
      `wesley-work-l-research-bootstrap-lib.mjs ${APP_BUILDER_COMMIT}`,
      "preflight step wesley-work-l-research-bootstrap before de-handoff-health",
      "cursor:wsl-default:verify integration",
      "runtime/wesley-work-l-research-bootstrap/latest.json state HEALTHY",
    ],
    nextAction: "Elevated: Install-CgWesleyWorkDriveMountPersistence.ps1 + npm run wsl:install-l-fstab",
    advancementGate: "npm run agent:preflight:app-builder-mcp PASS on WESLEY_WORK",
    doNotAdvance: [
      "Treat bootstrap as sole DE health source — de:handoff-health remains independent",
      "Reject WSL2 drvfs mounts that report fstype 9p with source L:",
      "Destructively umount wrong /mnt/l without operator review",
    ],
    commitRefs: [`CG-AppBuilder-MCP@${APP_BUILDER_COMMIT}`],
  }),
  packet({
    packetId: "mcp-build-stamp-windows-pm2-topology-v1",
    packetKind: "protocol_upgrade",
    packetTitle: "WSL preflight validates Windows PM2 mcp-api — do not WSL-only mcp:build for stamp",
    state: "DOCUMENTED",
    packetVerdict: "PASS",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "indexed",
    evidenceRefs: [
      "MCP_API_URL=http://172.17.80.1:3001",
      "docs/CURSOR_WSL_REMOTE_SETUP.md build-stamp topology",
    ],
    nextAction: "After Windows mcp:build+mcp:restart copy runtime/mcp-build-stamp.json to WSL if needed",
    advancementGate: "npm run guard:mcp-runtime-freshness PASS",
    doNotAdvance: [
      "Run WSL-only mcp:build and expect Windows live-runtime stamp match",
      "Copy stamp without Windows mcp:restart",
    ],
  }),
  packet({
    packetId: "wesley-work-bootstrap-commands-v1",
    packetKind: "command",
    packetTitle: "Proof commands for L research mount and DE handoff",
    state: "RECORDED",
    packetVerdict: "PASS",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "indexed",
    evidenceRefs: [
      "preflight latest.json wesley-work-l-research-bootstrap PASS",
      "de-handoff-health probe state HEALTHY",
    ],
    nextAction: "Run before material sessions on WESLEY_WORK",
    advancementGate: "npm run wsl:bootstrap-l-research && npm run de:handoff-health",
    doNotAdvance: ["Skip bootstrap on wesley_work when de handoff required"],
    command: "npm run wsl:bootstrap-l-research",
    host: "WESLEY_WORK WSL",
    provesGate: "researchIntakeIndexReadable",
    expectedPassSignal: "state HEALTHY exit 0",
  }),
  packet({
    packetId: "wesley-work-bootstrap-evidence-v1",
    packetKind: "evidence",
    packetTitle: "Shipped bootstrap commit and preflight receipt",
    state: "RECORDED",
    packetVerdict: "PASS",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "indexed",
    evidenceRefs: [
      `git ${APP_BUILDER_COMMIT} fix(wsl): add durable L drive mount bootstrap`,
      "runtime/agent-preflight/app-builder-mcp/latest.json verdict PASS",
      "findmnt /mnt/l L: 9p drvfs",
    ],
    pathOrSha: APP_BUILDER_COMMIT,
    provesWhat: "Durable bootstrap shipped and preflight PASS",
    type: "git-commit",
  }),
];

const manifest = {
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
  rawScanRequired: false,
  sourceCommitShaIndex: "d993c038c88e4a31affa4d228b4f23a9243634be",
  overallHarvestVerdict: "HARVEST_COMPLETE",
  doNotAdvance: [
    "Claim de:handoff-health PASS while /mnt/l unmounted or index unreadable",
    "Trust piped de:handoff-health exit code",
    "WSL-only mcp:build as Windows PM2 stamp authority",
    "Reject valid WSL2 L: mount because findmnt reports fstype 9p",
    "Run index:publish or harvest:publish-hub-seed from Cursor",
  ],
  threadAutopsy: {
    tier: "T2",
    bundlePath: `artifacts/agent-runs/${HARVEST_ID}/thread-autopsy-bundle.json`,
    seedPacketIndexPath: `artifacts/agent-runs/${HARVEST_ID}/seed-packet-index.json`,
    counts: { waste: 5, seeds: 4, roiItems: 4, operatorFriction: 1, executionDeltas: 3 },
  },
  projection: {
    projectionSyncStatus: "not-run",
    hubPublishStatus: "not-run",
    hubPublishBlocker: "Operator Phase B — harvest:publish-intelligence-full",
    note: "Recording only; bootstrap code in CG-AppBuilder-MCP owner repo",
  },
  ledgerLineage: { ledgerPath: "work-progress/ACTIVE_WORK.md" },
  supersededClaims: [],
  supersedes: {
    harvestId: PRIOR_HARVEST,
    reason: "Same L: recurrence class — adds DE research intake path + automated bootstrap",
  },
  packets,
};

writeJson("harvest-manifest-v1.json", manifest);

writeJson("thread-event-inventory.json", {
  schemaVersion: "thread-event-inventory-v1@1.0.0",
  harvestId: HARVEST_ID,
  threadScope: "DE handoff preflight blockers + durable /mnt/l bootstrap on WESLEY_WORK",
  generatedAt: AS_OF,
  events: [
    {
      eventId: "TE-001",
      phase: "blocker",
      summary: "agent:preflight:app-builder-mcp FAIL — de-handoff-health exit 1 (appeared twice)",
      evidenceRefs: ["preflight STEPS duplicate", APP_BUILDER_PREFLIGHT_COMMIT],
    },
    {
      eventId: "TE-002",
      phase: "diagnosis",
      summary: "DE probe DEGRADED: dualCorpusBridgeValid false, researchIntakeIndexReadable false",
      evidenceRefs: ["run-de-handoff-health.mjs probe JSON"],
    },
    {
      eventId: "TE-003",
      phase: "diagnosis",
      summary: "Windows L: had corpus; WSL /mnt/l not mounted",
      evidenceRefs: ["powershell Test-Path L index", "missing /mnt/l"],
    },
    {
      eventId: "TE-004",
      phase: "repair",
      summary: "Manual sudo mount -t drvfs L: /mnt/l → de:handoff-health HEALTHY",
      evidenceRefs: ["session mount evidence"],
    },
    {
      eventId: "TE-005",
      phase: "repair",
      summary: "Removed duplicate preflight step; formatStepEvidence stdout preference",
      evidenceRefs: [APP_BUILDER_PREFLIGHT_COMMIT],
    },
    {
      eventId: "TE-006",
      phase: "repair",
      summary: "Document Layer contract allowlist for synology-primary-register",
      evidenceRefs: [DOCUMENTS_CONTRACT_COMMIT],
    },
    {
      eventId: "TE-007",
      phase: "mission",
      summary: "User approved durable WESLEY_WORK /mnt/l bootstrap SDLC mission",
      evidenceRefs: ["user mission prompt"],
    },
    {
      eventId: "TE-008",
      phase: "implementation",
      summary: "Shipped wesley-work-l-research-bootstrap + preflight/verify integration",
      evidenceRefs: [APP_BUILDER_COMMIT, "14 unit tests pass"],
    },
    {
      eventId: "TE-009",
      phase: "fix",
      summary: "WSL2 drvfs surfaces as fstype 9p — validation updated",
      evidenceRefs: ["findmnt /mnt/l", APP_BUILDER_COMMIT],
    },
    {
      eventId: "TE-010",
      phase: "verification",
      summary: "preflight PASS; de:handoff-health HEALTHY; pushed d6ad9624 to origin/main",
      evidenceRefs: ["runtime/agent-preflight/app-builder-mcp/latest.json"],
    },
    {
      eventId: "TE-011",
      phase: "harvest",
      summary: "Operator invoked CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1 protocol",
      evidenceRefs: ["Z:/Capital-Glass-Dev/Harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md"],
    },
  ],
});

writeJson("code-touch-summary.json", {
  schemaVersion: "code-touch-summary-v1@1.0.0",
  harvestId: HARVEST_ID,
  generatedAt: AS_OF,
  repos: [
    {
      repo: "CG-AppBuilder-MCP",
      role: "bootstrap owner + preflight integration",
      paths: [
        "scripts/wsl/lib/wesley-work-l-research-bootstrap-lib.mjs",
        "scripts/wsl/wesley-work-l-research-bootstrap.mjs",
        "scripts/suite-governance/agent-preflight-app-builder-mcp.mjs",
        "scripts/cursor-wsl-default-verify.mjs",
        "scripts/wsl/mount-authority-drives.sh",
        "docs/CURSOR_WSL_REMOTE_SETUP.md",
      ],
      commits: [APP_BUILDER_PREFLIGHT_COMMIT, APP_BUILDER_COMMIT],
    },
    {
      repo: "CapitalGlass-Documents",
      role: "contract audit allowlist",
      paths: ["scripts/lib/mcp-document-contract-enforcement.mjs"],
      commits: [DOCUMENTS_CONTRACT_COMMIT],
    },
  ],
  operatorCommands: [
    "npm run wsl:bootstrap-l-research",
    "npm run wsl:bootstrap-l-research:verify",
    "npm run wsl:install-l-fstab",
    "npm run de:handoff-health",
    "npm run agent:preflight:app-builder-mcp",
    "npm run cursor:wsl-default:verify",
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
      type: "verification",
      description: "Piped de:handoff-health through tail masked exit 1 as success",
      evidenceRefs: ["TE-002", "ED-002"],
      estimatedImpact: "medium",
      savedBy: "Run standalone npm run de:handoff-health; check $? and probe JSON",
      roiRank: 2,
    },
    {
      wasteId: "TW-002",
      type: "rework",
      description: "Duplicate de-handoff-health preflight step doubled failure surface",
      evidenceRefs: ["TE-001", APP_BUILDER_PREFLIGHT_COMMIT],
      estimatedImpact: "medium",
      savedBy: "STEPS dedupe review in agent-preflight-app-builder-mcp.mjs",
      roiRank: 3,
    },
    {
      wasteId: "TW-003",
      type: "host",
      description: "No automated /mnt/l bootstrap — manual sudo mount each WSL session",
      evidenceRefs: ["TE-003", "TE-004"],
      estimatedImpact: "high",
      savedBy: "npm run wsl:bootstrap-l-research in preflight chain",
      roiRank: 1,
    },
    {
      wasteId: "TW-004",
      type: "agent",
      description: "Initial bootstrap rejected valid WSL2 mount (fstype 9p not drvfs)",
      evidenceRefs: ["TE-009"],
      estimatedImpact: "medium",
      savedBy: "validateLMountSource accepts 9p+L: per WSL2 drvfs behavior",
      roiRank: 4,
    },
    {
      wasteId: "TW-005",
      type: "rework",
      description: "Overlapping L: drive investigation with prior wesleywork-l-windows harvest",
      evidenceRefs: [PRIOR_HARVEST, "BY-KIND/thread-autopsy-index.json"],
      estimatedImpact: "low",
      savedBy: "Load IH-WINDOWS-L-VS-WSL-L-001 before new L: diagnosis",
      roiRank: 5,
    },
  ],
  operatorFriction: [
    {
      frictionId: "OF-001",
      trigger: "Preflight blocked on DE handoff while Windows L: was mapped but WSL /mnt/l was not",
      operatorCost: "high",
      systemFix: "Bootstrap L: mount automatically before de:handoff-health on wesley_work",
      evidenceRefs: ["TE-003", "user mission approval TE-007"],
      linkedWasteIds: ["TW-003"],
    },
  ],
  executionDeltas: [
    {
      executionDeltaId: "ED-001",
      situation: "DE handoff health blocking App Builder MCP preflight",
      actualExecution: {
        steps: [
          "Investigated duplicate preflight failures",
          "Eventually found /mnt/l missing",
          "Manual sudo mount",
        ],
        outcome: "HEALTHY after manual intervention",
        evidenceRefs: ["TE-002", "TE-003", "TE-004"],
      },
      optimalExecution: {
        steps: [
          "npm run wsl:bootstrap-l-research first",
          "Read probe JSON for dualCorpusBridgeValid and researchIntakeIndexReadable",
          "If BLOCKED check Windows L: via Ensure-CgWesleyWorkDriveMounts.ps1",
        ],
        outcome: "Automated mount or actionable BLOCKED without manual sudo guesswork",
        requiredPreflight: ["npm run wsl:bootstrap-l-research"],
      },
      deltaCost: { time: "high", tokens: "high", operatorFrustration: "medium" },
    },
    {
      executionDeltaId: "ED-002",
      situation: "Operator believed de:handoff-health passed when piped",
      actualExecution: {
        steps: ["npm run de:handoff-health | tail"],
        outcome: "Misread exit code",
        evidenceRefs: ["pipe exit code trap"],
      },
      optimalExecution: {
        steps: ["npm run de:handoff-health; echo exit=$?"],
        outcome: "Correct exit 1 on DEGRADED",
        requiredPreflight: [],
      },
      deltaCost: { time: "low", tokens: "low", operatorFrustration: "medium" },
    },
    {
      executionDeltaId: "ED-003",
      situation: "mcp:contract-audit blocked on Document Layer regex",
      actualExecution: {
        steps: ["Broad regex flagged document-synology-primary-register.ts"],
        outcome: "False positive BLOCKED",
        evidenceRefs: [DOCUMENTS_CONTRACT_COMMIT],
      },
      optimalExecution: {
        steps: ["Read file — claimCanonicalProjectDocument path", "Allowlist known-safe register module"],
        outcome: "Faster unblock",
        requiredPreflight: ["npm run mcp:document-contract-check in owner repo"],
      },
      deltaCost: { time: "medium", tokens: "medium", operatorFrustration: "low" },
    },
  ],
  wrongMoves: [
    {
      wrongMoveId: "WM-001",
      summary: "Treated duplicate preflight step as two independent DE failures",
      whereItHappened: "agent-preflight interpretation",
      whyItWasWrong: "Same npm run de-handoff-health listed twice in STEPS",
      correctFirstMove: "Inspect STEPS array for duplicate command entries",
      preventiveControl: "Dedupe STEPS; formatStepEvidence shows probe stdout",
      seedTarget: "IH-PREFLIGHT-STEPS-DEDUPE-001",
      executionDeltaId: "ED-001",
    },
    {
      wrongMoveId: "WM-002",
      summary: "Bootstrap validation required fstype drvfs only",
      whereItHappened: "validateLMountSource initial implementation",
      whyItWasWrong: "WSL2 reports drvfs mounts as 9p with source L:",
      correctFirstMove: "Accept 9p+L: per findmnt on WESLEY_WORK",
      preventiveControl: "Unit test validateLMountSource accepts WSL2 9p drvfs L:",
      seedTarget: "IH-WSL2-DRVF-9P-FSTYPE-001",
      executionDeltaId: "ED-001",
    },
  ],
  duplicateWork: [
    {
      duplicateId: "DW-001",
      subject: "WESLEY_WORK L: /mnt/l availability",
      firstKnownInstance: PRIOR_HARVEST,
      priorIndexSlice: "BY-KIND/thread-autopsy-index.json",
      whyRepeated: "Prior harvest covered Windows remap; this thread adds DE research intake + bootstrap",
      avoidableBy: "harvest:duplication-preflight + load IH-WINDOWS-L-VS-WSL-L-001",
      recommendedAction: "add_guard",
    },
  ],
  roiBacklog: [
    {
      rank: 1,
      title: "npm run wsl:install-l-fstab on WESLEY_WORK after bootstrap PASS",
      whyItPays: "Survives reboot without manual sudo mount",
      effort: "low",
      ownerRepo: "CG-AppBuilder-MCP",
      savedWasteIds: ["TW-003"],
      seedAs: "runbook",
      suggestedWorkPackageId: "wesley-work-l-research-bootstrap-v1",
    },
    {
      rank: 2,
      title: "Office Admin Install-CgWesleyWorkDriveMountPersistence.ps1 elevated",
      whyItPays: "Windows L: survives logon when LAN down",
      effort: "medium",
      ownerRepo: "CapitalGlass-Office-Admin",
      savedWasteIds: ["TW-003", "TW-005"],
      seedAs: "runbook",
      suggestedWorkPackageId: "wesleywork-drive-mount-task-dedupe-v1",
    },
    {
      rank: 3,
      title: "Preflight STEPS lint — forbid duplicate command names",
      whyItPays: "Prevents doubled failure noise",
      effort: "low",
      ownerRepo: "CG-AppBuilder-MCP",
      savedWasteIds: ["TW-002"],
      seedAs: "hook",
      suggestedWorkPackageId: "preflight-steps-dedupe-gate-v1",
    },
    {
      rank: 4,
      title: "Document contract allowlist registry in MCP audit docs",
      whyItPays: "Reduces false-positive contract blocks",
      effort: "low",
      ownerRepo: "CapitalGlass-Documents",
      savedWasteIds: [],
      seedAs: "rule",
      suggestedWorkPackageId: "document-contract-allowlist-docs-v1",
    },
  ],
  doNotAdvanceMap: [
    {
      awardOrVerdict: "DE_HANDOFF_HEALTHY",
      currentStatus: "CLOSED",
      doNotClaimUntil: [
        "researchIntakeIndexReadable true in probe JSON",
        "npm run de:handoff-health exit 0 without pipe",
      ],
      lastKnownEvidence: ["TE-010", APP_BUILDER_COMMIT],
      proofCommandId: "wesley-work-bootstrap-commands-v1",
    },
    {
      awardOrVerdict: "L_RESEARCH_MOUNT_DURABLE",
      currentStatus: "HOLD",
      doNotClaimUntil: ["npm run wsl:install-l-fstab applied", "wsl --shutdown recovery verified"],
      lastKnownEvidence: ["bootstrap actionTaken none on healthy mount only"],
      proofCommandId: "wesley-work-bootstrap-commands-v1",
    },
  ],
  duplicationCheck: {
    registryConsulted: true,
    hubSlicesConsulted: ["BY-KIND/thread-autopsy-index.json", "BY-KIND/active-work-blockers.json"],
    commandIndexConsulted: true,
    checkedAt: AS_OF,
    note: "Consulted prior wesleywork-l-windows harvest; extended not duplicated",
  },
});

const seeds = [
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-WESLEY-WORK-L-RESEARCH-BOOTSTRAP-001",
    kind: "failure-pattern",
    title: "DE handoff DEGRADED when WSL /mnt/l missing on WESLEY_WORK",
    summary:
      "Windows L: may host Capital-Glass-Research while WSL lacks /mnt/l; run npm run wsl:bootstrap-l-research before de:handoff-health.",
    retrievalQuestions: [
      "Why is de:handoff-health DEGRADED with dualCorpusBridgeValid false?",
      "What mounts L: research intake for DE handoff on WESLEY_WORK?",
    ],
    evidenceRefs: [APP_BUILDER_COMMIT, "runtime/wesley-work-l-research-bootstrap/latest.json"],
    futureAgentInstructions: {
      whenThisAppears: "agent:preflight fails de-handoff-health on WESLEY_WORK",
      startAt: ["runtime/wesley-work-l-research-bootstrap/latest.json", "data-extraction-workspace-standard.mjs"],
      runPreflight: ["npm run wsl:bootstrap-l-research", "npm run de:handoff-health"],
      doNot: ["Remove de-handoff-health from preflight", "Force HEALTHY when index unreadable"],
      proveBeforeClaiming: ["researchIntakeIndexReadable true", "findmnt /mnt/l source L:"],
    },
    ownerRepo: "CG-AppBuilder-MCP",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
  },
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-DE-HANDOFF-PIPE-EXIT-001",
    kind: "failure-pattern",
    title: "Do not trust piped de:handoff-health exit codes",
    summary: "Piping through tail returns tail exit 0 while probe exited 1 on DEGRADED.",
    retrievalQuestions: [
      "de:handoff-health looked healthy in pipe but preflight failed?",
      "How to check real exit code for npm health scripts?",
    ],
    evidenceRefs: ["docs/CURSOR_WSL_REMOTE_SETUP.md", "ED-002"],
    futureAgentInstructions: {
      whenThisAppears: "Operator pipes health check to tail/head/grep",
      startAt: ["run-de-handoff-health.mjs exit code logic"],
      runPreflight: [],
      doNot: ["Use | tail without checking $?", "Infer state from npm notice stderr only"],
      proveBeforeClaiming: ["Standalone command exit code", "probe JSON state field"],
    },
    ownerRepo: "CG-AppBuilder-MCP",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "AUTOMATIC",
    status: "CANDIDATE",
  },
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-MCP-BUILD-STAMP-WINDOWS-PM2-001",
    kind: "failure-pattern",
    title: "WSL agent validates Windows PM2 MCP — not WSL-local build stamp",
    summary:
      "MCP_API_URL points at Windows host; guard:mcp-runtime-freshness compares Windows stamp — WSL-only mcp:build causes false drift.",
    retrievalQuestions: [
      "Why does guard:mcp-runtime-freshness fail after WSL mcp:build?",
      "Which host owns live mcp-api for WESLEY_WORK Cursor?",
    ],
    evidenceRefs: ["docs/CURSOR_WSL_REMOTE_SETUP.md", "MCP_API_URL=http://172.17.80.1:3001"],
    futureAgentInstructions: {
      whenThisAppears: "MCP build stamp drift on WSL Remote WESLEY_WORK",
      startAt: ["docs/CURSOR_WSL_REMOTE_SETUP.md build-stamp section", "~/.cursor/integrations.config.json"],
      runPreflight: ["npm run guard:mcp-runtime-freshness"],
      doNot: ["WSL-only mcp:build without Windows mcp:restart", "Copy stamp without matching Windows rebuild"],
      proveBeforeClaiming: ["Windows PM2 mcp-api restarted", "stamp hash matches live API host"],
    },
    ownerRepo: "CG-AppBuilder-MCP",
    targetSlice: "BY-KIND/mcp-servers.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
  },
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-WSL2-DRVF-9P-FSTYPE-001",
    kind: "failure-pattern",
    title: "WSL2 drvfs L: mount reports fstype 9p not drvfs",
    summary: "findmnt shows 9p with source L: for valid drvfs mounts — do not BLOCKED solely on fstype.",
    retrievalQuestions: [
      "wesley-work-l-research-bootstrap BLOCKED unexpected-fstype 9p?",
      "Is /mnt/l healthy when findmnt says 9p?",
    ],
    evidenceRefs: [APP_BUILDER_COMMIT, "mount | grep /mnt/l"],
    futureAgentInstructions: {
      whenThisAppears: "Bootstrap reports mountSourceValid false with fstype 9p",
      startAt: ["findmnt /mnt/l", "validateLMountSource in bootstrap lib"],
      runPreflight: ["npm run wsl:bootstrap-l-research:verify"],
      doNot: ["Require fstype drvfs only on WSL2", "Unmount 9p+L: without operator review"],
      proveBeforeClaiming: ["source L:", "research intake index readable"],
    },
    ownerRepo: "CG-AppBuilder-MCP",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "AUTOMATIC",
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
  seeds: seeds.map((s) => ({ seedId: s.seedId, path: `seed-packets/${s.seedId}.json` })),
});

fs.writeFileSync(
  path.join(RUN_DIR, "HARVEST_SUMMARY.md"),
  `# Harvest summary — ${HARVEST_ID}

**Verdict:** HARVEST_COMPLETE · **Tier:** T2  
**Retrieval:** INDEX_HIT_AI_CACHE · **Cache:** CACHE_MISS

## Thread truth
- DE handoff DEGRADED because WSL /mnt/l was not mounted (Windows L: had research corpus).
- Shipped idempotent bootstrap (CG-AppBuilder-MCP ${APP_BUILDER_COMMIT}) integrated into preflight.
- Fixed duplicate de-handoff-health step (${APP_BUILDER_PREFLIGHT_COMMIT}) and Documents contract false positive (${DOCUMENTS_CONTRACT_COMMIT}).
- WSL2 drvfs mounts validate as 9p+L:.

## Do not advance
- DE handoff PASS without readable research index
- Piped health check exit codes
- WSL-only MCP build stamp as Windows PM2 authority

## Next operator action
Phase B: \`npm run harvest:publish-intelligence-full -- --harvest-id=${HARVEST_ID}\` (operator only)
`,
  "utf8",
);

console.log(`Generated ${HARVEST_ID} in ${RUN_DIR}`);

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
      doNotAdvance: p.doNotAdvance,
    };
    if (!boundary.packets.find((b) => b.packetId === p.packetId)) {
      boundary.packets.push({
        packetId: p.packetId,
        ownerRepo: p.ownerRepo,
        ownerMcp: p.ownerMcp ?? "user-cg-app-mcp",
        ownerIndexingStatus: p.ownerIndexingStatus,
        requiredOwnerArtifact:
          p.ownerRepo === "CapitalGlass-Documents"
            ? "scripts/lib/mcp-document-contract-enforcement.mjs"
            : p.ownerRepo === "CapitalGlass-Office-Admin"
              ? "scripts/devices/CG-WESLEYWORK-01/Ensure-CgWesleyWorkDriveMounts.ps1"
              : "scripts/wsl/lib/wesley-work-l-research-bootstrap-lib.mjs",
        crossAgentRole: "thread autopsy harvest pointer",
        ownerRepoRole: p.packetTitle,
        currentGap: p.packetId.includes("durability") ? "fstab + Windows persistence" : null,
      });
    }
  }
  registry.updatedAt = AS_OF;
  boundary.updatedAt = AS_OF;
  fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  fs.writeFileSync(boundaryPath, `${JSON.stringify(boundary, null, 2)}\n`, "utf8");
}

upsertRegistryAndBoundary();

const projectPath = path.join(REPO_ROOT, PROJECT_FILE);
if (fs.existsSync(projectPath)) {
  const entry = `\n### 2026-08-06 — Thread harvest ${HARVEST_ID}\n\n- DE handoff bootstrap shipped CG-AppBuilder-MCP ${APP_BUILDER_COMMIT}; preflight PASS.\n- Seeds: IH-WESLEY-WORK-L-RESEARCH-BOOTSTRAP-001, IH-DE-HANDOFF-PIPE-EXIT-001, IH-MCP-BUILD-STAMP-WINDOWS-PM2-001, IH-WSL2-DRVF-9P-FSTYPE-001.\n`;
  let body = fs.readFileSync(projectPath, "utf8");
  if (!body.includes(HARVEST_ID)) {
    fs.writeFileSync(projectPath, `${body}${entry}`, "utf8");
  }
}
