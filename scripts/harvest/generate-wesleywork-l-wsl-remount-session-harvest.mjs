#!/usr/bin/env node
/**
 * harvest-2026-08-06-wesleywork-l-wsl-remount-session-v1 (T1)
 * Thread: User reports L needs remount → Windows L: OK, WSL /mnt/l inactive → bootstrap HEALTHY.
 * Operational session applying wesley-work-l-research-bootstrap-v1 (prior harvest closeout).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARVEST_ID = "harvest-2026-08-06-wesleywork-l-wsl-remount-session-v1";
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const AS_OF = "2026-08-07T02:22:00.000Z";
const SOURCE_SHA = execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
const SOURCE_BRANCH = execSync("git branch --show-current", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
const PRIOR_HARVEST = "harvest-2026-08-06-wesley-work-l-research-bootstrap-closeout-v1";
const PROJECT_FILE = "work-progress/projects/2026-08-02_z-drive-disconnect-recurrence-v1.md";
const BOOTSTRAP_ARTIFACT =
  "CG-AppBuilder-MCP/runtime/wesley-work-l-research-bootstrap/latest.json";

function writeJson(rel, value) {
  const p = path.join(RUN_DIR, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

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
    packetId: "wsl-l-unmounted-windows-ok-v1",
    packetKind: "blocker",
    packetTitle: "WSL /mnt/l inactive while Windows L: mapped on WESLEY_WORK",
    state: "RESOLVED",
    packetVerdict: "BOOTSTRAP_HEALTHY",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "indexed",
    evidenceRefs: [
      "wsl:bootstrap-l-research:verify state BLOCKED mountActive:false",
      "windowsProbe INDEX_OK DisplayRoot \\\\wesleydesk\\CapitalGlass-L",
      BOOTSTRAP_ARTIFACT,
      "thread-autopsy-bundle.json#ED-001",
    ],
    nextAction: "Operator: npm run wsl:install-l-fstab for reboot durability (no /etc/fstab L entry yet)",
    advancementGate: "npm run wsl:bootstrap-l-research → state HEALTHY; test -r /mnt/l/Capital-Glass-Intelligence-Hub/00-master-index/AGENT_START_HERE.md",
    doNotAdvance: [
      "Remap Windows L: when bootstrap reports windowsDriveAvailable true",
      "Claim L_DRIVE_NOT_MOUNTED_IN_WSL when only WSL drvfs bridge is missing",
    ],
    relatedPackets: ["wesley-work-l-research-bootstrap-protocol-v1"],
  }),
  packet({
    packetId: "wsl-bootstrap-l-research-command-v1",
    packetKind: "command",
    packetTitle: "Remount WSL /mnt/l from healthy Windows L: via bootstrap",
    state: "RECORDED",
    packetVerdict: "PASS",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "indexed",
    evidenceRefs: [BOOTSTRAP_ARTIFACT, "actionTaken: mounted"],
    nextAction: "First-line WSL L recovery: npm run wsl:bootstrap-l-research",
    advancementGate: "state HEALTHY in runtime/wesley-work-l-research-bootstrap/latest.json",
    doNotAdvance: ["Manual sudo mount without verify-only preflight when bootstrap exists"],
    command: "npm run wsl:bootstrap-l-research",
    host: "WESLEY_WORK",
    provesGate: "wesley-work-l-research-bootstrap",
    expectedPassSignal: "state HEALTHY",
  }),
  packet({
    packetId: "wsl-l-fstab-persistence-gap-v1",
    packetKind: "protocol_upgrade",
    packetTitle: "WSL L: drvfs not in /etc/fstab — remount lost after WSL restart",
    state: "OPEN",
    packetVerdict: "OPERATOR_ACTION",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "indexed",
    evidenceRefs: ["grep /etc/fstab NO_L_FSTAB_ENTRY", "CURSOR_WSL_REMOTE_SETUP.md wsl:install-l-fstab"],
    nextAction: "npm run wsl:install-l-fstab (sudo once)",
    advancementGate: "grep 'L:' /etc/fstab returns drvfs entry",
    doNotAdvance: ["Assume bootstrap mount survives wsl --shutdown without fstab"],
    seedAs: "runbook",
    ownerRepo: "CG-AppBuilder-MCP",
    promotionClass: "POLICY_GATED",
    futureAgentInstructions: {
      whenThisAppears: "L remounted but drops after WSL restart",
      startAt: ["grep L: /etc/fstab", "runtime/wesley-work-l-research-bootstrap/latest.json"],
      runPreflight: ["npm run wsl:bootstrap-l-research:verify"],
      doNot: ["Repeat bootstrap without recommending fstab install"],
      proveBeforeClaiming: ["wsl:install-l-fstab applied or fstab entry present"],
    },
  }),
  packet({
    packetId: "scout-l-unavailable-layer-alignment-v1",
    packetKind: "evidence",
    packetTitle: "Scout layerAlignment L_UNAVAILABLE until WSL /mnt/l mounted",
    state: "RECORDED",
    packetVerdict: "CONFIRMED",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "indexed",
    evidenceRefs: [
      "hooks_context layerAlignment L_UNAVAILABLE",
      "agent:index:scout INDEX_HIT_AI_CACHE with L hub path unreachable",
    ],
    nextAction: "After bootstrap HEALTHY, scout should show L hub readable on next turn",
    advancementGate: "test -d /mnt/l/Capital-Glass-Intelligence-Hub/00-master-index",
    doNotAdvance: ["Claim INDEX_HIT on L hub slices while /mnt/l inactive"],
    type: "runtime-receipt",
    pathOrSha: BOOTSTRAP_ARTIFACT,
    provesWhat: "WSL L bridge restored; Intelligence Hub L path reachable",
  }),
  packet({
    packetId: "wesleywork-l-remount-faster-path-v1",
    packetKind: "faster_path",
    packetTitle: "Run bootstrap verify before Windows remap on WESLEY_WORK",
    state: "RECORDED",
    packetVerdict: "LESSON_RECORDED",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "indexed",
    evidenceRefs: ["thread-autopsy-bundle.json#ED-001"],
    nextAction: "Document in seed: verify-only distinguishes Windows vs WSL layer",
    advancementGate: "npm run wsl:bootstrap-l-research:verify within first diagnosis step",
    doNotAdvance: [],
    situation: "User reports L drive needs remount",
    whatHappened: "Office Admin matrix + Windows probe before bootstrap verify",
    rightFirstMove: "npm run wsl:bootstrap-l-research:verify — if windowsDriveAvailable && !mountActive → bootstrap only",
    requiredGuard: "wesley-work-l-research-bootstrap-v1",
  }),
  packet({
    packetId: "l-remount-recurrence-indexed-v1",
    packetKind: "repeated_work",
    packetTitle: "L: remount recurrence — same class as prior August harvests",
    state: "RECORDED",
    packetVerdict: "INDEXED_NOT_NEW",
    ownerRepo: "CapitalGlass-Cross-Agent",
    ownerIndexingStatus: "indexed",
    evidenceRefs: [PRIOR_HARVEST, "harvest-2026-08-04-wesleywork-l-windows-closeout-v1"],
    nextAction: "Operator fstab install closes durability gap; not a new Windows remap incident",
    advancementGate: "fstab installed OR logon task remaps L on Windows boot",
    doNotAdvance: ["Re-harvest full Windows Tailscale remap playbook when verify shows Windows OK"],
    duplicateId: "DW-L-REMOUNT-RECURRENCE-2026-08",
    firstKnownInstance: PRIOR_HARVEST,
    priorIndexSlice: "BY-KIND/thread-autopsy-index.json",
    whyMissed: "WSL drvfs not persisted in fstab after prior session mount",
  }),
  packet({
    packetId: "l-remount-session-decision-v1",
    packetKind: "decision",
    packetTitle: "WSL-only remount sufficient — Windows L: already mapped",
    state: "RECORDED",
    packetVerdict: "ACCEPTED",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "indexed",
    evidenceRefs: [BOOTSTRAP_ARTIFACT, "windowsDriveAvailable:true mountActive:false after verify"],
    nextAction: "None for Windows layer",
    advancementGate: "bootstrap state HEALTHY",
    doNotAdvance: ["Run Ensure-CgWesleyWorkDriveMounts.ps1 when windows probe INDEX_OK"],
    decision: "Apply wsl:bootstrap-l-research only; skip Windows ForceRemap",
    alternativesRejected: [
      "Windows Ensure-CgWesleyWorkDriveMounts.ps1 ForceRemap",
      "Manual net use L: when DisplayRoot already \\\\wesleydesk\\CapitalGlass-L",
    ],
  }),
  packet({
    packetId: "powershell-path-wsl-diagnosis-v1",
    packetKind: "mistake",
    packetTitle: "powershell.exe not on PATH — use full System32 path from WSL",
    state: "RECORDED",
    packetVerdict: "WORKAROUND_APPLIED",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "not-required",
    evidenceRefs: ["powershell.exe: command not found", "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe OK"],
    nextAction: "Bootstrap script uses PowerShell via resolved path — prefer npm bootstrap over ad-hoc ps",
    advancementGate: "Windows probes via bootstrap windowsProbe.method powershell",
    doNotAdvance: [],
    wrongMoveId: "WM-PS-PATH-001",
    actualExecution: {
      steps: ["powershell.exe -NoProfile -Command ...", "exit 127"],
      outcome: "FAIL",
      evidenceRefs: ["shell which powershell.exe empty"],
    },
    optimalExecution: {
      steps: ["npm run wsl:bootstrap-l-research:verify (embedded Windows probe)", "Or /mnt/c/Windows/System32/.../powershell.exe"],
      outcome: "Windows L state known without PATH dependency",
      requiredPreflight: ["wsl:bootstrap-l-research:verify"],
    },
    preventiveControl: "Use bootstrap verify as first Windows L probe from WSL agents",
  }),
];

const manifest = {
  schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
  harvestId: HARVEST_ID,
  missionClass: "chat-thread-closeout-autopsy-harvest-v1",
  sourceCommitSha: SOURCE_SHA,
  sourceBranch: SOURCE_BRANCH,
  sourceRepo: "CapitalGlass-Cross-Agent",
  createdAt: AS_OF,
  updatedAt: AS_OF,
  retrievalResult: "INDEX_HIT_AI_CACHE",
  cacheResult: "CACHE_MISS",
  rawScanRequired: false,
  sourceCommitShaIndex: "57652017edb5b4c6166cd1888488213e7414b06c",
  overallHarvestVerdict: "HARVEST_COMPLETE",
  doNotAdvance: [
    "Remap Windows L: when wsl:bootstrap-l-research:verify shows windowsDriveAvailable true",
    "Claim L_DRIVE_NOT_MOUNTED_IN_WSL for WSL-only drvfs gap when Windows L: is healthy",
    "Run index:publish or harvest:publish-hub-seed from Cursor",
    "Skip wsl:install-l-fstab recommendation after successful bootstrap when fstab empty",
  ],
  threadAutopsy: {
    tier: "T1",
    bundlePath: `artifacts/agent-runs/${HARVEST_ID}/thread-autopsy-bundle.json`,
    seedPacketIndexPath: `artifacts/agent-runs/${HARVEST_ID}/seed-packet-index.json`,
    counts: { waste: 3, seeds: 2, roiItems: 3, operatorFriction: 0, executionDeltas: 1 },
  },
  projection: {
    projectionSyncStatus: "not-run",
    hubPublishStatus: "not-run",
    hubPublishBlocker: "Operator Phase B — harvest:publish-intelligence-full",
    note: "Recording only; bootstrap authority in CG-AppBuilder-MCP",
  },
  ledgerLineage: { ledgerPath: "work-progress/ACTIVE_WORK.md" },
  supersededClaims: [],
  extends: {
    harvestId: PRIOR_HARVEST,
    reason: "Operational application of shipped bootstrap — WSL layer only, Windows already OK",
  },
  packets,
};

writeJson("harvest-manifest-v1.json", manifest);

writeJson("thread-event-inventory.json", {
  schemaVersion: "thread-event-inventory-v1@1.0.0",
  harvestId: HARVEST_ID,
  threadScope: "WESLEY_WORK L: remount — WSL /mnt/l inactive, Windows L: OK",
  generatedAt: AS_OF,
  events: [
    {
      eventId: "TE-001",
      phase: "operator",
      summary: "User: L DRIVE NEEDS TO BE REMOUNTED ON THIS COMPUTER",
      evidenceRefs: ["user turn 1"],
    },
    {
      eventId: "TE-002",
      phase: "scout",
      summary: "Scout INDEX_HIT_AI_CACHE with layerAlignment L_UNAVAILABLE",
      evidenceRefs: ["hooks_context", "test /mnt/l NOT_MOUNTED"],
    },
    {
      eventId: "TE-003",
      phase: "diagnosis",
      summary: "bootstrap verify: Windows L OK, WSL mount inactive (BLOCKED)",
      evidenceRefs: ["wsl:bootstrap-l-research:verify", "runtime/wesley-work-l-research-bootstrap/latest.json verifyOnly"],
    },
    {
      eventId: "TE-004",
      phase: "repair",
      summary: "npm run wsl:bootstrap-l-research → state HEALTHY, actionTaken mounted",
      evidenceRefs: [BOOTSTRAP_ARTIFACT],
    },
    {
      eventId: "TE-005",
      phase: "verification",
      summary: "AGENT_START_HERE.md readable; findmnt /mnt/l drvfs from L:",
      evidenceRefs: ["test -r /mnt/l/.../AGENT_START_HERE.md"],
    },
    {
      eventId: "TE-006",
      phase: "follow-up",
      summary: "No /etc/fstab L entry — recommended wsl:install-l-fstab",
      evidenceRefs: ["grep /etc/fstab NO_L_FSTAB_ENTRY"],
    },
    {
      eventId: "TE-007",
      phase: "harvest",
      summary: "User invoked CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1 RUN FILE",
      evidenceRefs: ["user turn harvest request"],
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
      role: "L research bootstrap runtime authority",
      paths: ["scripts/wsl/wesley-work-l-research-bootstrap.mjs", "runtime/wesley-work-l-research-bootstrap/latest.json"],
      commitSha: "43025839e6df424b982a622dd70a9b2cfc1d3dd2",
      note: "No code changes this session — operational bootstrap run only",
    },
    {
      repo: "CapitalGlass-Cross-Agent",
      role: "harvest coordination",
      paths: [`artifacts/agent-runs/${HARVEST_ID}/`],
      commitSha: SOURCE_SHA,
    },
  ],
  operatorCommands: [
    "npm run wsl:bootstrap-l-research:verify",
    "npm run wsl:bootstrap-l-research",
    "npm run wsl:install-l-fstab",
    "npm run agent:index:scout -- --json",
  ],
});

writeJson("thread-autopsy-bundle.json", {
  schemaVersion: "cross-agent-thread-autopsy-bundle-v1@1.0.0",
  harvestId: HARVEST_ID,
  tier: "T1",
  wasteLedgerStatus: "POPULATED",
  waste: [
    {
      wasteId: "TW-001",
      type: "retrieval",
      description: "Office Admin drive matrix consulted before bootstrap verify narrowed failure to WSL-only",
      evidenceRefs: ["TE-002", "TE-003"],
      estimatedImpact: "low",
      savedBy: "npm run wsl:bootstrap-l-research:verify as first diagnostic command",
      roiRank: 1,
    },
    {
      wasteId: "TW-002",
      type: "tool",
      description: "powershell.exe not on PATH — failed first Windows probe attempt",
      evidenceRefs: ["WM-PS-PATH-001"],
      estimatedImpact: "low",
      savedBy: "Use bootstrap verify instead of raw powershell.exe from WSL",
      roiRank: 2,
    },
    {
      wasteId: "TW-003",
      type: "rework",
      description: "Recurrent L remount — fstab never installed after prior bootstrap sessions",
      evidenceRefs: [PRIOR_HARVEST, "TE-006"],
      estimatedImpact: "medium",
      savedBy: "npm run wsl:install-l-fstab after first HEALTHY bootstrap",
      roiRank: 3,
    },
  ],
  operatorFriction: [],
  executionDeltas: [
    {
      executionDeltaId: "ED-001",
      situation: "User reports L drive needs remount on WESLEY_WORK",
      actualExecution: {
        steps: [
          "Scout preflight + mount check",
          "Office Admin drive connectivity matrix",
          "powershell.exe probe failed (PATH)",
          "bootstrap verify → Windows OK, WSL inactive",
          "bootstrap mount → HEALTHY",
        ],
        outcome: "PASS — correct layer identified",
        evidenceRefs: ["TE-001", "TE-004"],
      },
      optimalExecution: {
        steps: [
          "npm run wsl:bootstrap-l-research:verify immediately",
          "If windowsDriveAvailable && !mountActive → npm run wsl:bootstrap-l-research",
          "Check fstab; recommend install-l-fstab if missing",
        ],
        outcome: "Same HEALTHY in fewer tool round-trips",
        requiredPreflight: ["wsl:bootstrap-l-research:verify"],
        evidenceRefs: ["wesley-work-l-research-bootstrap-v1"],
      },
      deltaCost: { time: "low", tokens: "low", operatorFrustration: "low" },
    },
  ],
  wrongMoves: [
    {
      wrongMoveId: "WM-PS-PATH-001",
      summary: "Invoked powershell.exe without full path when not on WSL PATH",
      whereItHappened: "Initial Windows L probe",
      whyItWasWrong: "WSL PATH may omit Windows PowerShell; bootstrap has embedded probe",
      correctFirstMove: "npm run wsl:bootstrap-l-research:verify",
      preventiveControl: "Prefer bootstrap verify over ad-hoc PowerShell from WSL",
      seedTarget: "IH-WSL-L-BOOTSTRAP-FIRST-001",
      executionDeltaId: "ED-001",
    },
  ],
  duplicateWork: [
    {
      duplicateId: "DW-001",
      subject: "WESLEY_WORK L: WSL drvfs remount recurrence",
      firstKnownInstance: PRIOR_HARVEST,
      priorIndexSlice: "BY-KIND/thread-autopsy-index.json",
      whyRepeated: "fstab persistence not applied after prior HEALTHY bootstrap",
      avoidableBy: "wsl:install-l-fstab operator action",
      recommendedAction: "index",
    },
  ],
  roiBacklog: [
    {
      rank: 1,
      title: "Install WSL L: fstab persistence",
      whyItPays: "Stops repeat operator remount after WSL restart",
      effort: "low",
      ownerRepo: "CG-AppBuilder-MCP",
      savedWasteIds: ["TW-003"],
      seedAs: "runbook",
      suggestedWorkPackageId: "wesley-work-l-fstab-persistence-v1",
    },
    {
      rank: 2,
      title: "Agent first-move: bootstrap verify on L remount reports",
      whyItPays: "Separates Windows vs WSL layer in one command",
      effort: "low",
      ownerRepo: "CG-AppBuilder-MCP",
      savedWasteIds: ["TW-001"],
      seedAs: "rule",
      suggestedWorkPackageId: "wesley-work-l-research-bootstrap-v1",
    },
    {
      rank: 3,
      title: "Auto-run bootstrap from scout hook when L_UNAVAILABLE on WESLEY_WORK",
      whyItPays: "Self-heal WSL layer before agent turn",
      effort: "medium",
      ownerRepo: "CG-AppBuilder-MCP",
      savedWasteIds: ["TW-003"],
      seedAs: "hook",
      suggestedWorkPackageId: "wesley-work-l-scout-auto-bootstrap-v1",
    },
  ],
  doNotAdvanceMap: [
    {
      awardOrVerdict: "L_HUB_INDEX_HIT",
      currentStatus: "CLOSED",
      doNotClaimUntil: ["/mnt/l/Capital-Glass-Intelligence-Hub/00-master-index readable"],
      lastKnownEvidence: ["TE-005", BOOTSTRAP_ARTIFACT],
      proofCommandId: "wsl-bootstrap-l-research-command-v1",
    },
    {
      awardOrVerdict: "L_REBOOT_DURABLE",
      currentStatus: "OPEN",
      doNotClaimUntil: ["grep L: /etc/fstab or wsl:install-l-fstab receipt"],
      lastKnownEvidence: ["TE-006", "NO_L_FSTAB_ENTRY"],
    },
  ],
  duplicationCheck: {
    registryConsulted: true,
    hubSlicesConsulted: ["BY-KIND/thread-autopsy-index.json", "BY-KIND/active-work-blockers.json"],
    commandIndexConsulted: true,
    checkedAt: AS_OF,
    note: "Extends harvest-2026-08-06-wesley-work-l-research-bootstrap-closeout-v1 — operational session not new Windows incident",
  },
});

const seeds = [
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-WSL-L-BOOTSTRAP-FIRST-001",
    kind: "failure-pattern",
    title: "WESLEY_WORK L remount — bootstrap verify before Windows remap",
    summary:
      "When user reports L offline, run wsl:bootstrap-l-research:verify. If Windows L OK but mountActive false, run wsl:bootstrap-l-research only.",
    retrievalQuestions: [
      "L drive needs remount on WESLEY_WORK — Windows or WSL layer?",
      "Scout shows L_UNAVAILABLE but hot cache works — what to run?",
    ],
    evidenceRefs: [HARVEST_ID, BOOTSTRAP_ARTIFACT, PRIOR_HARVEST],
    futureAgentInstructions: {
      whenThisAppears: "User says L drive needs remount on WESLEY_WORK",
      startAt: ["runtime/wesley-work-l-research-bootstrap/latest.json", "CURSOR_WSL_REMOTE_SETUP.md § L drive"],
      runPreflight: ["npm run wsl:bootstrap-l-research:verify", "npm run wsl:bootstrap-l-research"],
      doNot: [
        "ForceRemap Windows L when verify shows windowsDriveAvailable true",
        "Use powershell.exe without full path from WSL",
      ],
      proveBeforeClaiming: ["state HEALTHY in bootstrap artifact", "AGENT_START_HERE.md readable under /mnt/l"],
    },
    ownerRepo: "CG-AppBuilder-MCP",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
  },
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-WSL-L-FSTAB-PERSIST-001",
    kind: "failure-pattern",
    title: "WSL L: remount recurrence — install fstab after first HEALTHY bootstrap",
    summary: "Bootstrap mounts /mnt/l via drvfs but remount is lost on WSL restart without wsl:install-l-fstab.",
    retrievalQuestions: [
      "Why does L keep dropping in WSL after I fixed it yesterday?",
      "wsl:bootstrap-l-research HEALTHY but gone after reboot?",
    ],
    evidenceRefs: [HARVEST_ID, "grep /etc/fstab NO_L_FSTAB_ENTRY"],
    futureAgentInstructions: {
      whenThisAppears: "Repeat L remount on same machine within days",
      startAt: ["/etc/fstab", "runtime/wesley-work-l-research-bootstrap/latest.json"],
      runPreflight: ["npm run wsl:install-l-fstab"],
      doNot: ["Close thread without fstab check when recommending durability"],
      proveBeforeClaiming: ["L: entry in /etc/fstab"],
    },
    ownerRepo: "CG-AppBuilder-MCP",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "POLICY_GATED",
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

for (const p of packets) {
  writeJson(`compact-records/${p.packetId}.json`, p);
}

fs.writeFileSync(
  path.join(RUN_DIR, "HARVEST_SUMMARY.md"),
  `# Harvest summary — ${HARVEST_ID}

**Verdict:** HARVEST_COMPLETE · **Tier:** T1  
**Retrieval:** INDEX_HIT_AI_CACHE · **Cache:** CACHE_MISS

## Thread truth
- Windows L: was already mapped (\\\\wesleydesk\\CapitalGlass-L).
- WSL /mnt/l was inactive — scout L_UNAVAILABLE.
- Fixed via npm run wsl:bootstrap-l-research → HEALTHY.
- /etc/fstab has no L: entry — operator should run wsl:install-l-fstab.

## Do not advance
- Windows ForceRemap when bootstrap verify shows Windows OK
- Claim L durable without fstab

## Next operator action
npm run wsl:install-l-fstab (sudo once) then Phase B publish if desired
`,
  "utf8",
);

function upsertRegistryAndBoundary() {
  const now = AS_OF;
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
      lastUpdatedAt: now,
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
          p.ownerRepo === "CG-AppBuilder-MCP"
            ? "scripts/wsl/wesley-work-l-research-bootstrap.mjs"
            : null,
        crossAgentRole: "thread autopsy harvest pointer",
        ownerRepoRole: p.packetTitle,
        currentGap: p.state === "OPEN" ? p.nextAction : null,
      });
    }
  }
  registry.updatedAt = now;
  fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  fs.writeFileSync(boundaryPath, `${JSON.stringify(boundary, null, 2)}\n`, "utf8");
}

upsertRegistryAndBoundary();

const projectPath = path.join(REPO_ROOT, PROJECT_FILE);
if (fs.existsSync(projectPath)) {
  const entry = `\n### 2026-08-06 — Thread harvest ${HARVEST_ID}\n\n- WSL /mnt/l remounted via bootstrap; Windows L: already OK.\n- Operator gap: wsl:install-l-fstab not yet applied.\n- Seeds: IH-WSL-L-BOOTSTRAP-FIRST-001, IH-WSL-L-FSTAB-PERSIST-001.\n`;
  let body = fs.readFileSync(projectPath, "utf8");
  if (!body.includes(HARVEST_ID)) {
    fs.writeFileSync(projectPath, `${body}${entry}`, "utf8");
  }
}

console.log(`Generated ${HARVEST_ID} in ${RUN_DIR}`);
