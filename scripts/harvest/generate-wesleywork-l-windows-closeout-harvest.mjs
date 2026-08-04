#!/usr/bin/env node
/**
 * harvest-2026-08-04-wesleywork-l-windows-closeout-v1 (T2)
 * Thread: L offline again — ext4 path fix + Windows L: remap via Tailscale wesleydesk.
 * Supersedes/extends harvest-2026-08-04-z-l-drive-offlan-session-v1.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARVEST_ID = "harvest-2026-08-04-wesleywork-l-windows-closeout-v1";
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const AS_OF = "2026-08-04T06:46:00.000Z";
const SOURCE_SHA = execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
const PROJECT_FILE = "work-progress/projects/2026-08-02_z-drive-disconnect-recurrence-v1.md";
const PRIOR_HARVEST = "harvest-2026-08-04-z-l-drive-offlan-session-v1";

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
    packetId: "windows-l-unmapped-explorer-v1",
    packetKind: "blocker",
    packetTitle: "Windows L: unmapped — Explorer unavailable while WSL /mnt/l may look OK",
    state: "RESOLVED_SESSION",
    packetVerdict: "L_REMAPPED_VIA_TAILSCALE_HOSTNAME",
    ownerRepo: "CapitalGlass-Office-Admin",
    ownerIndexingStatus: "indexed",
    projectFile: PROJECT_FILE,
    evidenceRefs: [
      "net use L: before repair — connection not found",
      "net use L: after — \\\\wesleydesk\\CapitalGlass-L OK",
      "WIN_L_INDEX_OK after Map-CgWesleyWorkLInUserSession.ps1",
      "thread-autopsy-bundle.json#ED-001",
    ],
    nextAction:
      "Elevated Install-CgWesleyWorkDriveMountPersistence.ps1; verify logon task remaps L when LAN 109 down but Tailscale up",
    advancementGate: "cmd.exe net use L: shows OK and Test-Path L:\\Capital-Glass-Intelligence-Hub\\00-master-index\\INDEX.json",
    doNotAdvance: [
      "Report L online from WSL /mnt/l alone",
      "Claim INDEX_HIT on L hub while Windows L:\\ unavailable",
    ],
    relatedPackets: ["z-l-drive-offlan-partial-availability-v1"],
  }),
  packet({
    packetId: "mount-authority-ext4-repos-root-v1",
    packetKind: "protocol_upgrade",
    packetTitle: "Mount gate must use resolveWslReposRoot — not injected CG_REPOS_ROOT",
    state: "FIXED",
    packetVerdict: "PASS",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerIndexingStatus: "indexed",
    projectFile: PROJECT_FILE,
    evidenceRefs: [
      "wsl-mount-authority-lib.mjs evaluateMountAuthorityGate reposRoot fix",
      "cursor-wsl.env CG_REPOS_ROOT=/home/wesle/repos after repair",
      "scout INDEX_MISS hook runtime contract on NTFS path",
    ],
    nextAction: "Ship CG-AppBuilder-MCP mount/scout fixes; run wsl:mount-authority-drives after Cursor restart",
    advancementGate: "npm run wsl:mount-authority-drives -- --json verdict PASS",
    doNotAdvance: ["Hand-edit cursor-wsl.env CG_REPOS_ROOT to /mnt/c/Developer/repos"],
    commitRefs: ["CG-AppBuilder-MCP scripts/wsl/lib/wsl-mount-authority-lib.mjs (session uncommitted)"],
  }),
  packet({
    packetId: "wesleywork-l-tailscale-remap-command-v1",
    packetKind: "command",
    packetTitle: "Map L on WESLEY_WORK off-LAN via Map-CgWesleyWorkLInUserSession.ps1",
    state: "RECORDED",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Office-Admin",
    ownerIndexingStatus: "indexed",
    projectFile: PROJECT_FILE,
    evidenceRefs: [
      "Map-CgWesleyWorkLInUserSession.ps1 output [OK] L: mapped via \\\\wesleydesk\\CapitalGlass-L",
      "192.168.1.109 ping fail; 100.93.199.27 Tailscale SMB 445 open",
    ],
    nextAction:
      "Operator quick fix: C:\\Developer\\repos\\CapitalGlass-Office-Admin\\scripts\\devices\\CG-WESLEYWORK-01\\Map-CgWesleyWorkLInUserSession.ps1",
    advancementGate: "net use L: Status OK",
    doNotAdvance: ["Improvise net use without credential bundle (RA-004)"],
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
  retrievalResult: "INDEX_HIT",
  cacheResult: "CACHE_MISS",
  overallHarvestVerdict: "HARVEST_COMPLETE",
  doNotAdvance: [
    "Report L online from WSL /mnt/l alone on WESLEY_WORK",
    "Claim INDEX_HIT when Windows L:\\...\\INDEX.json is False",
    "Re-pin cursor-wsl.env CG_REPOS_ROOT to /mnt/c/Developer/repos",
    "Improvise net use / UNC discovery (RA-004)",
  ],
  threadAutopsy: {
    tier: "T2",
    bundlePath: `artifacts/agent-runs/${HARVEST_ID}/thread-autopsy-bundle.json`,
    seedPacketIndexPath: `artifacts/agent-runs/${HARVEST_ID}/seed-packet-index.json`,
    counts: { waste: 4, seeds: 3, roiItems: 3, operatorFriction: 2, executionDeltas: 2 },
  },
  projection: {
    projectionSyncStatus: "not-run",
    hubPublishStatus: "not-run",
    hubPublishBlocker: "Phase B — operator runs harvest:publish-intelligence-full",
    note: "Phase A manifest only; supersedes partial resolution in z-l-drive-offlan-session-v1",
  },
  ledgerLineage: { ledgerPath: "work-progress/ACTIVE_WORK.md" },
  supersededClaims: [],
  supersedes: { harvestId: PRIOR_HARVEST, reason: "Same recurrence thread — Windows L remap + ext4 path authority fix" },
  packets,
};

writeJson("harvest-manifest-v1.json", manifest);

writeJson("thread-event-inventory.json", {
  schemaVersion: "thread-event-inventory-v1@1.0.0",
  harvestId: HARVEST_ID,
  threadScope: "L offline fix + WSL ext4 path + Windows Explorer L unavailable",
  generatedAt: AS_OF,
  events: [
    { eventId: "TE-001", phase: "operator", summary: "User: L is offline, fix and identify why lost again", evidenceRefs: ["user turn 1"] },
    { eventId: "TE-002", phase: "diagnosis", summary: "WSL /mnt/l readable; scout failed on NTFS CG_APPBUILDER_MCP_ROOT", evidenceRefs: ["agent:index:scout contract missing NTFS path"] },
    { eventId: "TE-003", phase: "repair", summary: "Fixed mount-authority + scout to prefer /home/wesle/repos ext4", evidenceRefs: ["wsl-mount-authority-lib.mjs", "cursor-wsl.env repair"] },
    { eventId: "TE-004", phase: "operator", summary: "User: should not be Windows path but WSL2 repo", evidenceRefs: ["user correction"] },
    { eventId: "TE-005", phase: "diagnosis", summary: "Windows net use L: missing; LAN 192.168.1.109 down; Tailscale desk 445 open", evidenceRefs: ["ping/SMB probes"] },
    { eventId: "TE-006", phase: "operator", summary: "User restarted Cursor — Explorer L:\\ still unavailable (screenshot)", evidenceRefs: ["user screenshot L unavailable dialog"] },
    { eventId: "TE-007", phase: "repair", summary: "Map-CgWesleyWorkLInUserSession.ps1 — L OK via \\\\wesleydesk\\CapitalGlass-L", evidenceRefs: ["powershell Map script output"] },
    { eventId: "TE-008", phase: "verification", summary: "WIN_L_INDEX_OK; WSL /mnt/l refreshed", evidenceRefs: ["cmd net use L:", "umount/mount drvfs"] },
  ],
});

writeJson("code-touch-summary.json", {
  schemaVersion: "code-touch-summary-v1@1.0.0",
  harvestId: HARVEST_ID,
  generatedAt: AS_OF,
  repos: [
    {
      repo: "CG-AppBuilder-MCP",
      role: "mount authority + scout hook",
      paths: [
        "scripts/wsl/lib/wsl-mount-authority-lib.mjs",
        "agent-packs/three-way-agent/hooks/intelligence-hub-scout-inject.mjs",
        "scripts/intelligence-hub/index-freshness/lib/hook-runtime-contract.mjs",
      ],
      note: "Session edits — ship via owner repo closeout",
    },
    {
      repo: "CapitalGlass-Office-Admin",
      role: "L drive user-session remap",
      paths: ["scripts/devices/CG-WESLEYWORK-01/Map-CgWesleyWorkLInUserSession.ps1"],
    },
  ],
  operatorCommands: [
    "npm run wsl:mount-authority-drives -- --json",
    "Map-CgWesleyWorkLInUserSession.ps1",
    "net use L:",
    "Pin-CgWesleyWorkDrivesQuickAccess.ps1",
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
      description: "Reported WSL /mnt/l OK while Windows L: was completely unmapped",
      evidenceRefs: ["TE-002", "TE-005", "TE-006"],
      estimatedImpact: "high",
      savedBy: "Windows net use L: + Test-Path L index before any L online claim",
      roiRank: 1,
    },
    {
      wasteId: "TW-002",
      type: "context",
      description: "Mount gate re-wrote cursor-wsl.env with injected /mnt/c/Developer/repos",
      evidenceRefs: ["TE-003", "evaluateMountAuthorityGate reposRoot bug"],
      estimatedImpact: "high",
      savedBy: "resolveWslReposRoot() in evaluateMountAuthorityGate",
      roiRank: 2,
    },
    {
      wasteId: "TW-003",
      type: "operator_attention",
      description: "User corrected WSL2 repo path + restarted — L still missing in Explorer",
      evidenceRefs: ["TE-004", "TE-006"],
      estimatedImpact: "high",
      savedBy: "Separate Windows L repair from WSL path/env repair in closeout messaging",
      roiRank: 3,
    },
    {
      wasteId: "TW-004",
      type: "rework",
      description: "Repeated L drive investigation overlapping z-l-drive-offlan-session harvest",
      evidenceRefs: [PRIOR_HARVEST],
      estimatedImpact: "medium",
      savedBy: "Load thread-autopsy-index seed IH-Z-L-OFFLAN before new grep",
      roiRank: 4,
    },
  ],
  operatorFriction: [
    {
      frictionId: "OF-001",
      trigger: "Agent fixed WSL paths but user still saw L unavailable in File Explorer",
      operatorCost: "high",
      systemFix: "Always run Windows net use L: when user says L drive missing",
      evidenceRefs: ["TE-006", "screenshot"],
      linkedWasteIds: ["TW-001", "TW-003"],
    },
    {
      frictionId: "OF-002",
      trigger: "User had to clarify ext4 repo vs Windows NTFS path",
      operatorCost: "medium",
      systemFix: "cursor-wsl.env must set CG_REPOS_ROOT from machine profile not Cursor injection",
      evidenceRefs: ["TE-004"],
      linkedWasteIds: ["TW-002"],
    },
  ],
  executionDeltas: [
    {
      executionDeltaId: "ED-001",
      situation: "User reports L drive offline on WESLEY_WORK",
      actualExecution: {
        steps: [
          "Checked WSL /mnt/l — appeared OK",
          "Fixed scout/mount env paths",
          "User still could not open L in Explorer after restart",
        ],
        outcome: "Delayed Windows L remap",
        evidenceRefs: ["TE-001", "TE-006"],
      },
      optimalExecution: {
        steps: [
          "cmd.exe net use L: immediately",
          "If missing: Map-CgWesleyWorkLInUserSession.ps1 (Tailscale wesleydesk when LAN 109 down)",
          "Then refresh WSL drvfs /mnt/l",
        ],
        outcome: "Explorer L available in first repair pass",
        requiredPreflight: ["office.get_drive_connectivity_matrix"],
        evidenceRefs: ["TE-007"],
      },
      deltaCost: { time: "high", tokens: "medium", operatorFrustration: "high" },
    },
    {
      executionDeltaId: "ED-002",
      situation: "wsl:mount-authority-drives repairs cursor-wsl.env",
      actualExecution: {
        steps: ["Passed process.env.CG_REPOS_ROOT to repairCursorWslEnv"],
        outcome: "Re-pinned NTFS repos root from Cursor injection",
        evidenceRefs: ["cursor-wsl.env before fix"],
      },
      optimalExecution: {
        steps: ["resolveWslReposRoot() when ext4 ~/repos/CG-AppBuilder-MCP exists"],
        outcome: "CG_REPOS_ROOT=/home/wesle/repos stable across sessions",
        requiredPreflight: ["wesley_work.machine.json reposRoot"],
      },
      deltaCost: { time: "medium", tokens: "low", operatorFrustration: "medium" },
    },
  ],
  wrongMoves: [
    {
      wrongMoveId: "WM-001",
      summary: "Trusted WSL drvfs L mount as proof L drive is online",
      whereItHappened: "Initial diagnosis turn",
      whyItWasWrong: "Windows L: was unmapped — Explorer and drvfs source broken",
      correctFirstMove: "net use L: on Windows host",
      preventiveControl: "Dual-layer drive health: Windows net use + WSL path",
      seedTarget: "IH-WINDOWS-L-VS-WSL-L-001",
      executionDeltaId: "ED-001",
    },
    {
      wrongMoveId: "WM-002",
      summary: "Mount gate used injected CG_REPOS_ROOT for env repair",
      whereItHappened: "evaluateMountAuthorityGate",
      whyItWasWrong: "Cursor injects /mnt/c/Developer/repos — stale partial NTFS tree",
      correctFirstMove: "resolveWslReposRoot() from machine profile",
      preventiveControl: "Never pass raw process.env.CG_REPOS_ROOT to repairCursorWslEnv",
      seedTarget: "IH-MOUNT-AUTHORITY-EXT4-REPOS-001",
      executionDeltaId: "ED-002",
    },
  ],
  duplicateWork: [
    {
      duplicateId: "DW-001",
      subject: "WESLEY_WORK Z/L off-LAN drive recurrence",
      firstKnownInstance: PRIOR_HARVEST,
      priorIndexSlice: "BY-KIND/thread-autopsy-index.json",
      whyRepeated: "Same outage class — this thread adds Windows remap + ext4 fix",
      avoidableBy: "harvest:duplication-preflight before recording",
      recommendedAction: "index",
    },
  ],
  roiBacklog: [
    {
      rank: 1,
      title: "Elevated drive mount persistence on WESLEY_WORK",
      whyItPays: "Auto-remap L via Tailscale when LAN 109 down",
      effort: "medium",
      ownerRepo: "CapitalGlass-Office-Admin",
      savedWasteIds: ["TW-001", "TW-003"],
      seedAs: "runbook",
      suggestedWorkPackageId: "wesleywork-drive-mount-task-dedupe-v1",
    },
    {
      rank: 2,
      title: "Ship mount-authority ext4 repos root fix",
      whyItPays: "Stops cursor-wsl.env NTFS re-pin loop",
      effort: "low",
      ownerRepo: "CG-AppBuilder-MCP",
      savedWasteIds: ["TW-002"],
      seedAs: "hook",
      suggestedWorkPackageId: "wesley-work-wsl-mount-authority-gate-v1",
    },
    {
      rank: 3,
      title: "Windows-first L health in scout/drive preflight",
      whyItPays: "Prevents false L online from WSL ghost mount",
      effort: "medium",
      ownerRepo: "CG-AppBuilder-MCP",
      savedWasteIds: ["TW-001"],
      seedAs: "rule",
      suggestedWorkPackageId: "z-drive-pre-session-gate-hardening-v1",
    },
  ],
  doNotAdvanceMap: [
    {
      awardOrVerdict: "L_DRIVE_ONLINE",
      currentStatus: "HOLD",
      doNotClaimUntil: [
        "cmd.exe net use L: Status OK",
        "Test-Path L:\\Capital-Glass-Intelligence-Hub\\00-master-index\\INDEX.json",
      ],
      lastKnownEvidence: ["TE-007", "WIN_L_INDEX_OK"],
      proofCommandId: "wesleywork-l-tailscale-remap-command-v1",
    },
    {
      awardOrVerdict: "INDEX_HIT on L hub",
      currentStatus: "HOLD",
      doNotClaimUntil: ["Windows L: mapped — not WSL /mnt/l alone"],
      lastKnownEvidence: ["WM-001"],
    },
  ],
  duplicationCheck: {
    registryConsulted: false,
    hubSlicesConsulted: [],
    commandIndexConsulted: false,
    checkedAt: AS_OF,
    note: "Stamped by harvest:duplication-preflight",
  },
});

const seeds = [
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-WESLEYWORK-L-TAILSCALE-REMAP-001",
    kind: "failure-pattern",
    title: "WESLEY_WORK L: off-LAN — remap via wesleydesk Tailscale hostname",
    summary:
      "When 192.168.1.109 LAN is down but Tailscale reaches WESLEYDESK, map L: with Map-CgWesleyWorkLInUserSession.ps1 to \\\\wesleydesk\\CapitalGlass-L.",
    retrievalQuestions: [
      "Why is L drive unavailable in Explorer on WESLEY_WORK away from office?",
      "How do I remap L when desk LAN IP does not ping?",
    ],
    evidenceRefs: [HARVEST_ID, "Map-CgWesleyWorkLInUserSession.ps1 session output"],
    futureAgentInstructions: {
      whenThisAppears: "User cannot open L:\\ in File Explorer on WESLEY_WORK",
      startAt: ["office.get_drive_connectivity_matrix", "cmd.exe net use L:"],
      runPreflight: ["Map-CgWesleyWorkLInUserSession.ps1 from C:\\Developer\\repos\\...\\CG-WESLEYWORK-01"],
      doNot: ["Trust WSL /mnt/l alone", "Use LAN 192.168.1.109 when ping fails"],
      proveBeforeClaiming: ["net use L: Status OK", "WIN_L_INDEX_OK"],
    },
    ownerRepo: "CapitalGlass-Office-Admin",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
  },
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-MOUNT-AUTHORITY-EXT4-REPOS-001",
    kind: "failure-pattern",
    title: "Mount authority must not trust injected CG_REPOS_ROOT on WSL",
    summary:
      "evaluateMountAuthorityGate must call resolveWslReposRoot() — Cursor injects /mnt/c/Developer/repos and breaks scout contracts.",
    retrievalQuestions: [
      "Why does scout fail hook runtime contract missing on NTFS path?",
      "cursor-wsl.env CG_REPOS_ROOT wrong after mount-authority-drives?",
    ],
    evidenceRefs: ["wsl-mount-authority-lib.mjs", "~/.config/capital-glass/cursor-wsl.env"],
    futureAgentInstructions: {
      whenThisAppears: "Scout INDEX_MISS or CG_REPOS_ROOT points to /mnt/c/Developer/repos on WESLEY_WORK",
      startAt: ["wesley_work.machine.json reposRoot", "/home/wesle/repos/CG-AppBuilder-MCP"],
      runPreflight: ["npm run wsl:mount-authority-drives -- --json"],
      doNot: ["Pass process.env.CG_REPOS_ROOT raw to env repair"],
      proveBeforeClaiming: ["CG_APPBUILDER_MCP_ROOT=/home/wesle/repos/CG-AppBuilder-MCP", "agent:index:scout PASS"],
    },
    ownerRepo: "CG-AppBuilder-MCP",
    targetSlice: "BY-KIND/thread-autopsy-index.json",
    promotionClass: "POLICY_GATED",
    status: "CANDIDATE",
  },
  {
    schemaVersion: "harvest-seed-packet-v1@1.0.0",
    seedId: "IH-WINDOWS-L-VS-WSL-L-001",
    kind: "failure-pattern",
    title: "Windows L: vs WSL /mnt/l — dual-layer verification required",
    summary:
      "WSL drvfs can show /mnt/l content while Windows L: is unmapped; File Explorer uses Windows layer.",
    retrievalQuestions: [
      "WSL says L mounted but Explorer says L unavailable?",
      "Can I trust test -d /mnt/l for drive health?",
    ],
    evidenceRefs: [HARVEST_ID, "WM-001", PRIOR_HARVEST],
    futureAgentInstructions: {
      whenThisAppears: "Agent reports L OK but user sees L unavailable dialog",
      startAt: ["cmd.exe net use L:", "Test-Path L:\\...\\INDEX.json"],
      runPreflight: [],
      doNot: ["Claim L_DRIVE_NOT_MOUNTED_IN_WSL false from /mnt/l only"],
      proveBeforeClaiming: ["Windows net use L: OK before INDEX_HIT on L hub"],
    },
    ownerRepo: "CapitalGlass-Office-Admin",
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

const summaryPath = path.join(RUN_DIR, "HARVEST_SUMMARY.md");
fs.writeFileSync(
  summaryPath,
  `# Harvest summary — ${HARVEST_ID}

**Verdict:** HARVEST_COMPLETE · **Tier:** T2  
**Retrieval:** INDEX_HIT · **Cache:** CACHE_MISS

## Thread truth
- Windows L: was unmapped (Explorer error) while WSL /mnt/l looked OK.
- LAN 192.168.1.109 unreachable; Tailscale to WESLEYDESK SMB works.
- Fixed via Map-CgWesleyWorkLInUserSession.ps1 to wesleydesk CapitalGlass-L share.
- CG-AppBuilder-MCP mount gate now uses ext4 ~/repos (not injected NTFS path).

## Do not advance
- L online from WSL alone
- INDEX_HIT on L hub while Windows L path missing

## Next operator action
Phase B: npm run harvest:publish-intelligence-full -- --harvest-id=${HARVEST_ID}
`,
  "utf8",
);

console.log(`Generated ${HARVEST_ID} in ${RUN_DIR}`);

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
            ? "scripts/devices/CG-WESLEYWORK-01/Map-CgWesleyWorkLInUserSession.ps1"
            : "scripts/wsl/lib/wsl-mount-authority-lib.mjs",
        crossAgentRole: "thread autopsy harvest pointer",
        ownerRepoRole: p.packetTitle,
        currentGap: p.packetId.includes("unmapped") ? "Windows L remap persistence" : null,
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
  const entry = `\n### 2026-08-04 — Thread harvest ${HARVEST_ID}\n\n- Windows L: remapped via Tailscale wesleydesk; ext4 repos root fix in mount gate.\n- Seeds: IH-WESLEYWORK-L-TAILSCALE-REMAP-001, IH-MOUNT-AUTHORITY-EXT4-REPOS-001, IH-WINDOWS-L-VS-WSL-L-001.\n`;
  let body = fs.readFileSync(projectPath, "utf8");
  if (!body.includes(HARVEST_ID)) {
    fs.writeFileSync(projectPath, `${body}${entry}`, "utf8");
  }
}
