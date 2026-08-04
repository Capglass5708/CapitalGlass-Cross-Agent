#!/usr/bin/env node
/**
 * One-shot generator: harvest-2026-08-04-z-l-drive-offlan-session-v1 (T2 autopsy)
 * Thread: user "Z AND L IS UNAVAILABLE AGAIN" on WESLEY_WORK off-LAN session.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARVEST_ID = "harvest-2026-08-04-z-l-drive-offlan-session-v1";
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const AS_OF = "2026-08-04T06:01:00.000Z";
const SOURCE_SHA = execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
const PROJECT_FILE = "work-progress/projects/2026-08-02_z-drive-disconnect-recurrence-v1.md";

function writeJson(rel, value) {
  const p = path.join(RUN_DIR, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function packet(base) {
  return {
    harvestVerdictContribution: "RECORDED",
    ownerMcp: base.ownerMcp ?? "user-office-admin-mcp",
    requiredOwnerArtifact: base.requiredOwnerArtifact ?? null,
    commitRefs: base.commitRefs ?? [],
    blockers: base.blockers ?? [],
    relatedPackets: base.relatedPackets ?? [],
    packetKind: base.packetKind,
    ...base,
  };
}

const packets = [
  packet({
    packetId: "z-l-drive-offlan-partial-availability-v1",
    packetKind: "blocker",
    packetTitle: "WESLEY_WORK off-LAN Z partial / L down (desk SMB unreachable)",
    state: "PARTIAL_DRIVE_AVAILABILITY",
    packetVerdict: "Z_OK_L_BLOCKED_OFF_LAN",
    ownerRepo: "CapitalGlass-Office-Admin",
    ownerIndexingStatus: "indexed",
    projectFile: PROJECT_FILE,
    evidenceRefs: [
      "C:/ProgramData/CapitalGlass/OfficeAdmin/logs/NETWORK-OUTAGE-2026-08-03-220459.json",
      "ForceRemap classification=PARTIAL_DRIVE_AVAILABILITY zOk=True lOk=False",
      "thread-autopsy-bundle.json#ED-001",
    ],
    nextAction:
      "Wake WESLEYDESK + Tailscale SMB or join office LAN; rerun Ensure-CgWesleyWorkDriveMounts.ps1 -Mode ForceRemap from cd C:\\",
    advancementGate: "Test-Path L:\\Capital-Glass-Intelligence-Hub\\00-master-index\\INDEX.json",
    doNotAdvance: [
      "INDEX_HIT on L: while Windows L: path is False",
      "Claim OPERATIONAL index freshness while holdReason=CACHE_AND_L_STALE_OR_MISSING",
    ],
  }),
  packet({
    packetId: "wsl-drvfs-ghost-mount-v1",
    packetKind: "mistake",
    packetTitle: "WSL drvfs ghost mount masks Windows Z/L disconnect",
    state: "DOCUMENTED",
    packetVerdict: "PASS",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "indexed",
    projectFile: PROJECT_FILE,
    evidenceRefs: [
      "WSL test -d /mnt/l OK while Windows Test-Path L:\\... INDEX.json False",
      "thread-autopsy-bundle.json#WM-001",
      "docs/work-packages/z-drive-pre-session-gate-hardening-v1.md",
    ],
    nextAction:
      "Verify drives on Windows layer first; wsl --shutdown after Windows remap",
    advancementGate: "not-required",
    doNotAdvance: [],
  }),
  packet({
    packetId: "z-drive-force-remap-wsl-cwd-v1",
    packetKind: "command",
    packetTitle: "ForceRemap must run from Windows cwd (not WSL UNC cwd)",
    state: "RECORDED",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Office-Admin",
    ownerIndexingStatus: "indexed",
    projectFile: PROJECT_FILE,
    evidenceRefs: [
      "ForceRemap log: CMD.EXE UNC paths are not supported when launched from WSL cwd",
      "FI-20260802-z-drive-unmapped-in-wesle-session-net-use-z-retu",
      "thread-autopsy-bundle.json#ED-002",
    ],
    nextAction: "Operator: cd C:\\ before ForceRemap; document in Office Admin kit",
    advancementGate: "not-required",
    doNotAdvance: ["Improvise net use loops (RA-004)"],
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
  retrievalResult: "FAILOVER_GIT_LEDGER",
  cacheResult: "CACHE_MISS",
  overallHarvestVerdict: "HARVEST_COMPLETE",
  doNotAdvance: [
    "Claim L: INDEX_HIT when Windows Test-Path L:\\...\\INDEX.json is False",
    "Trust WSL /mnt/l alone for drive health on WESLEY_WORK",
    "Run ForceRemap from WSL working directory without cd C:\\",
    "Improvise net use / UNC discovery (RA-004)",
  ],
  threadAutopsy: {
    tier: "T2",
    bundlePath: `artifacts/agent-runs/${HARVEST_ID}/thread-autopsy-bundle.json`,
    seedPacketIndexPath: `artifacts/agent-runs/${HARVEST_ID}/seed-packet-index.json`,
    counts: { waste: 3, seeds: 3, roiItems: 3, operatorFriction: 1, executionDeltas: 2 },
  },
  projection: {
    projectionSyncStatus: "not-run",
    hubPublishStatus: "not-run",
    hubPublishBlocker: "Phase B — operator runs harvest:publish-intelligence-full when L: Windows-mapped",
    note: "Phase A manifest only; publication pointer deferred to Phase C",
  },
  ledgerLineage: { ledgerPath: "work-progress/ACTIVE_WORK.md" },
  supersededClaims: [],
  packets,
};

writeJson("harvest-manifest-v1.json", manifest);

writeJson("thread-event-inventory.json", {
  schemaVersion: "thread-event-inventory-v1@1.0.0",
  harvestId: HARVEST_ID,
  threadScope: "Z AND L IS UNAVAILABLE AGAIN — WESLEY_WORK off-LAN drive session",
  generatedAt: AS_OF,
  events: [
    {
      eventId: "TE-001",
      phase: "operator",
      summary: "User reported Z and L unavailable again",
      evidenceRefs: ["user message turn 1"],
    },
    {
      eventId: "TE-002",
      phase: "diagnosis",
      summary: "WSL showed /mnt/l and /mnt/z readable; index preflight STALE (FAILOVER_GIT_LEDGER)",
      evidenceRefs: ["agent:index:preflight holdReason=CACHE_AND_L_STALE_OR_MISSING"],
    },
    {
      eventId: "TE-003",
      phase: "diagnosis",
      summary: "Windows Test-Path Z:\\Capital-Glass-Dev False, L:\\...\\INDEX.json False",
      evidenceRefs: ["powershell Test-Path after WSL mount check"],
    },
    {
      eventId: "TE-004",
      phase: "repair",
      summary: "ForceRemap: nasLan445=False deskLan445=False tailscale=True; Z remapped via cg-server",
      evidenceRefs: ["Ensure-CgWesleyWorkDriveMounts.ps1 log"],
    },
    {
      eventId: "TE-005",
      phase: "repair",
      summary: "PARTIAL_DRIVE_AVAILABILITY zOk=True lOk=False; desk SMB and Tailscale L path unavailable",
      evidenceRefs: ["NETWORK-OUTAGE-2026-08-03-220459.json"],
    },
    {
      eventId: "TE-006",
      phase: "verification",
      summary: "Post-remap Windows Z True, L False; cg-server:445 True; cg-wesleydesk-01:445 False",
      evidenceRefs: ["Test-NetConnection probes"],
    },
  ],
});

writeJson("code-touch-summary.json", {
  schemaVersion: "code-touch-summary-v1@1.0.0",
  harvestId: HARVEST_ID,
  generatedAt: AS_OF,
  repos: [
    {
      repo: "CapitalGlass-Office-Admin",
      role: "drive mount authority",
      paths: ["C:/ProgramData/CapitalGlass/OfficeAdmin/PRIVATE/Ensure-CgWesleyWorkDriveMounts.ps1"],
    },
    {
      repo: "CG-AppBuilder-MCP",
      role: "index preflight / z-drive pre-session gate",
      paths: ["docs/work-packages/z-drive-pre-session-gate-hardening-v1.md"],
    },
  ],
  operatorCommands: [
    "Ensure-CgWesleyWorkDriveMounts.ps1 -Mode ForceRemap",
    "Test-Path Z:\\Capital-Glass-Dev",
    "Test-Path L:\\Capital-Glass-Intelligence-Hub\\00-master-index\\INDEX.json",
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
      type: "host",
      description: "Initial diagnosis trusted WSL drvfs mount before Windows Test-Path",
      evidenceRefs: ["TE-002", "TE-003"],
      estimatedImpact: "medium",
      savedBy: "Windows Test-Path Z and L before reporting mount status",
      roiRank: 1,
    },
    {
      wasteId: "TW-002",
      type: "operator_attention",
      description: "Recurring Z/L disconnect off-LAN — user had to report again",
      evidenceRefs: ["TE-001", "z-drive-disconnect-recurrence-v1"],
      estimatedImpact: "high",
      savedBy: "FI shortcut PSC-Z-DRIVE-WESLEYWORK-FORCE-REMAP + Windows-side health task",
      roiRank: 2,
    },
    {
      wasteId: "TW-003",
      type: "tool",
      description: "ForceRemap launched from WSL repo cwd caused CMD UNC path noise",
      evidenceRefs: ["TE-004"],
      estimatedImpact: "low",
      savedBy: "cd C:\\ before invoking powershell.exe -File ...ForceRemap",
      roiRank: 3,
    },
  ],
  operatorFriction: [
    {
      frictionId: "OF-001",
      trigger: "User reported drives unavailable while agent initially saw WSL paths OK",
      operatorCost: "high",
      systemFix: "Dual-layer probe: Windows Test-Path + WSL path in drive health runbook",
      evidenceRefs: ["TE-001", "TE-003"],
      linkedWasteIds: ["TW-001", "TW-002"],
    },
  ],
  executionDeltas: [
    {
      executionDeltaId: "ED-001",
      situation: "User reports Z and L unavailable on WESLEY_WORK",
      actualExecution: {
        steps: [
          "Checked /mnt/l and /mnt/z in WSL — appeared OK",
          "Ran index preflight — FAILOVER_GIT_LEDGER STALE",
          "Later discovered Windows Z/L both False",
        ],
        outcome: "Delayed accurate diagnosis",
        evidenceRefs: ["TE-002", "TE-003"],
      },
      optimalExecution: {
        steps: [
          "Windows Test-Path Z:\\Capital-Glass-Dev and L index path first",
          "If False, run canonical ForceRemap from cd C:\\",
          "Report PARTIAL vs full availability with SMB probe evidence",
        ],
        outcome: "Immediate operator-accurate status",
        requiredPreflight: ["office.get_drive_connectivity_matrix"],
      },
      deltaCost: { time: "medium", tokens: "medium", operatorFrustration: "high" },
    },
    {
      executionDeltaId: "ED-002",
      situation: "ForceRemap off-LAN session",
      actualExecution: {
        steps: [
          "Invoked Ensure-CgWesleyWorkDriveMounts.ps1 from WSL shell cwd",
          "Z mapped via Tailscale cg-server; L skipped — desk SMB unavailable",
        ],
        outcome: "PARTIAL_DRIVE_AVAILABILITY",
        evidenceRefs: ["TE-004", "TE-005"],
      },
      optimalExecution: {
        steps: [
          "cd C:\\ before ForceRemap",
          "Confirm WESLEYDESK online for L: or state LAN requirement clearly",
        ],
        outcome: "Clean remap log + clear L blocker message",
        requiredPreflight: ["Test-NetConnection cg-wesleydesk-01 -Port 445"],
      },
      deltaCost: { time: "low", tokens: "low", operatorFrustration: "medium" },
    },
  ],
  wrongMoves: [
    {
      wrongMoveId: "WM-001",
      summary: "Reported L/Z mounts OK based on WSL drvfs alone",
      whereItHappened: "Initial thread diagnosis",
      whyItWasWrong: "Windows drive letters were disconnected; WSL retained stale 9p mounts",
      correctFirstMove: "powershell Test-Path on Z:\\Capital-Glass-Dev and L:\\...\\INDEX.json",
      preventiveControl: "Dual-layer drive health check in agent runbook",
      executionDeltaId: "ED-001",
      seedTarget: "IH-WSL-DRVF-GHOST-002",
    },
  ],
  duplicateWork: [
    {
      duplicateId: "DW-001",
      subject: "Z drive disconnect off-LAN WESLEY_WORK",
      whyRepeated: "Same recurrence class as z-drive-disconnect-recurrence-v1",
      firstKnownInstance: "FI-20260802-z-drive-unmapped-in-wesle-session-net-use-z-retu",
      priorIndexSlice: "work-progress/projects/2026-08-02_z-drive-disconnect-recurrence-v1.md",
      whyMissed: "L: failure mode (desk SMB) not captured in prior Z-only receipt",
      avoidableBy: "harvest:duplication-preflight before recording",
      recommendedAction: "canonicalize",
    },
  ],
  roiBacklog: [
    {
      rank: 1,
      title: "Windows-first drive probe before WSL path claims",
      whyItPays: "Stops false 'mounts OK' when drvfs is ghost-cached",
      effort: "low",
      seedAs: "runbook",
      ownerRepo: "CG-AppBuilder-MCP",
      savedWasteIds: ["TW-001"],
    },
    {
      rank: 2,
      title: "L: desk SMB prerequisite in off-LAN ForceRemap messaging",
      whyItPays: "Sets operator expectation when only Z restores via Tailscale",
      effort: "medium",
      seedAs: "index-slice",
      ownerRepo: "CapitalGlass-Office-Admin",
      savedWasteIds: ["TW-002"],
    },
    {
      rank: 3,
      title: "ForceRemap launcher cwd guard (C:\\ not WSL UNC)",
      whyItPays: "Eliminates CMD UNC errors during remap",
      effort: "low",
      seedAs: "command",
      ownerRepo: "CapitalGlass-Office-Admin",
      savedWasteIds: ["TW-003"],
    },
  ],
  doNotAdvanceMap: [
    {
      awardOrVerdict: "INDEX_HIT",
      currentStatus: "HOLD",
      doNotClaimUntil: [
        "Windows Test-Path L:\\Capital-Glass-Intelligence-Hub\\00-master-index\\INDEX.json",
        "index:freshness-gate PASS without holdReason",
      ],
      lastKnownEvidence: ["FAILOVER_GIT_LEDGER", "CACHE_AND_L_STALE_OR_MISSING"],
    },
    {
      awardOrVerdict: "FULL_Z_AND_L_OPERATIONAL",
      currentStatus: "BLOCKED",
      doNotClaimUntil: [
        "lOk=True in Ensure-CgWesleyWorkDriveMounts classification",
        "cg-wesleydesk-01:445 or 192.168.1.109:445 reachable",
      ],
      lastKnownEvidence: ["PARTIAL_DRIVE_AVAILABILITY zOk=True lOk=False"],
    },
  ],
  duplicationCheck: {
    registryConsulted: true,
    hubSlicesConsulted: ["active-work-blockers.json", "thread-autopsy-index.json"],
    commandIndexConsulted: true,
  },
});

const seeds = [
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-Z-L-OFFLAN-PARTIAL-001",
    kind: "failure-pattern",
    title: "WESLEY_WORK off-LAN may restore Z via Tailscale but not L",
    summary:
      "When nasLan445 and deskLan445 are false, ForceRemap can map Z to cg-server but L requires WESLEYDESK SMB.",
    retrievalQuestions: [
      "Why is Z available but L missing on WESLEY_WORK remote?",
      "What does PARTIAL_DRIVE_AVAILABILITY mean for ForceRemap?",
    ],
    evidenceRefs: ["TE-005", "NETWORK-OUTAGE-2026-08-03-220459.json"],
    futureAgentInstructions: {
      whenThisAppears: "User reports Z and L unavailable on WESLEY_WORK off-LAN",
      startAt: ["work-progress/projects/2026-08-02_z-drive-disconnect-recurrence-v1.md"],
      runPreflight: ["Test-NetConnection cg-wesleydesk-01 -Port 445", "Test-Path Z:\\Capital-Glass-Dev"],
      doNot: ["Claim full drive recovery when lOk=False", "Patch consumer apps for mapping"],
      proveBeforeClaiming: ["Windows Test-Path for both Z probe and L index path"],
    },
    ownerRepo: "CapitalGlass-Office-Admin",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
  },
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-WSL-DRVF-GHOST-002",
    kind: "lesson",
    title: "WSL /mnt/l and /mnt/z can lie when Windows drives are disconnected",
    summary:
      "drvfs may serve stale cached directory listings after Windows unmaps Z: or L:; always verify Windows layer.",
    retrievalQuestions: [
      "Why does WSL show L mounted but Windows cannot read L index?",
      "How to detect ghost drvfs mounts for Intelligence Hub?",
    ],
    evidenceRefs: ["TE-002", "TE-003", "thread-autopsy-bundle.json#WM-001"],
    futureAgentInstructions: {
      whenThisAppears: "Agent checks /mnt/l before Windows drive health",
      startAt: ["docs/work-packages/z-drive-pre-session-gate-hardening-v1.md"],
      runPreflight: [
        "powershell Test-Path 'Z:\\Capital-Glass-Dev'",
        "powershell Test-Path 'L:\\Capital-Glass-Intelligence-Hub\\00-master-index\\INDEX.json'",
      ],
      doNot: ["Log INDEX_HIT based on WSL path alone", "Skip ForceRemap because WSL lists /mnt/z"],
      proveBeforeClaiming: ["Windows and WSL probe agreement or explicit PARTIAL verdict"],
    },
    ownerRepo: "CG-AppBuilder-MCP",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
  },
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-Z-FORCE-REMAP-CWD-003",
    kind: "runbook",
    title: "Run WESLEY_WORK ForceRemap from Windows C:\\ not WSL UNC cwd",
    summary:
      "Invoking Ensure-CgWesleyWorkDriveMounts.ps1 via powershell.exe from a WSL working directory spams CMD UNC errors.",
    retrievalQuestions: [
      "What is the canonical Z L repair command on WESLEY_WORK?",
      "Why does ForceRemap show UNC paths are not supported?",
    ],
    evidenceRefs: ["FI-20260802-z-drive-unmapped-in-wesle-session-net-use-z-retu", "TE-004"],
    futureAgentInstructions: {
      whenThisAppears: "Z drive disconnect on WESLEY_WORK daily session",
      startAt: ["work-progress/projects/2026-08-02_z-drive-disconnect-recurrence-v1.md"],
      runPreflight: ["failure_preflight Z_DRIVE_NOT_MOUNTED_IN_DAILY_SESSION"],
      doNot: ["Improvise net use loops (RA-004)", "Grep repos for UNC paths"],
      proveBeforeClaiming: ["Test-Path Z:\\Capital-Glass-Dev after ForceRemap from cd C:\\"],
    },
    ownerRepo: "CapitalGlass-Office-Admin",
    targetSlice: "work-progress/command-index.json",
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
  seedIds: seeds.map((s) => s.seedId),
  seeds: seeds.map((s) => ({ seedId: s.seedId, kind: s.kind, title: s.title, status: s.status })),
});

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
        ownerMcp: p.ownerMcp ?? "user-office-admin-mcp",
        ownerIndexingStatus: p.ownerIndexingStatus,
        requiredOwnerArtifact:
          p.ownerRepo === "CapitalGlass-Office-Admin"
            ? "C:/ProgramData/CapitalGlass/OfficeAdmin/PRIVATE/Ensure-CgWesleyWorkDriveMounts.ps1"
            : "CG-AppBuilder-MCP/docs/work-packages/z-drive-pre-session-gate-hardening-v1.md",
        crossAgentRole: "thread autopsy harvest pointer",
        ownerRepoRole: p.packetTitle,
        currentGap: p.packetId.includes("partial") ? "L: requires WESLEYDESK SMB when off-LAN" : null,
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
  const entry = `\n### 2026-08-04 — Thread harvest ${HARVEST_ID}\n\n- Off-LAN ForceRemap: **Z OK** (Tailscale cg-server), **L blocked** (desk SMB unreachable).\n- WSL drvfs ghost mount documented (WM-001).\n- Seeds: IH-Z-L-OFFLAN-PARTIAL-001, IH-WSL-DRVF-GHOST-002, IH-Z-FORCE-REMAP-CWD-003.\n`;
  let body = fs.readFileSync(projectPath, "utf8");
  if (!body.includes(HARVEST_ID)) {
    fs.writeFileSync(projectPath, `${body}${entry}`, "utf8");
  }
}

console.log(`Generated ${HARVEST_ID} at ${RUN_DIR}`);
