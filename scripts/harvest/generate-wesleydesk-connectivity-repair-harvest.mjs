#!/usr/bin/env node
/** harvest-2026-08-05-wesleydesk-connectivity-repair-v1 (T2) */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARVEST_ID = "harvest-2026-08-05-wesleydesk-connectivity-repair-v1";
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const AS_OF = new Date().toISOString();
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
    requiredOwnerArtifact: null,
    commitRefs: [],
    blockers: [],
    relatedPackets: [],
    ownerIndexingStatus: "indexed",
    projectFile: PROJECT_FILE,
    ...base,
  };
}

const packets = [
  packet({
    packetKind: "blocker",
    packetId: "wesleydesk-z-session-identity-blocker-v1",
    packetTitle: "WESLEYDESK Z: mapping is Windows session/identity-bound",
    state: "OPEN",
    packetVerdict: "ACTIVE_USER_Z_MAPPING_NOT_PROVEN",
    ownerRepo: "CapitalGlass-Office-Admin",
    evidenceRefs: [
      "CG-AppBuilder-MCP/artifacts/agent-runs/wesleydesk-connectivity-full-diagnostic-v1/repair-1-receipt.json",
      "thread-autopsy-bundle.json#WM-001",
    ],
    nextAction: "Wesley console login → Run-Repair1-InteractiveGate-Wesley.ps1",
    advancementGate: "REPAIR_1_INTERACTIVE_GATE_PASS",
    doNotAdvance: ["REPAIR_1_PASS from SSH cgremoteadmin session"],
  }),
  packet({
    packetKind: "mistake",
    packetId: "phantom-z-net-use-insufficient-v1",
    packetTitle: "net use /delete alone cannot clear phantom Z: (error 85)",
    state: "DOCUMENTED",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Office-Admin",
    evidenceRefs: ["C:\\Temp\\clear-z.ps1 DefineDosDevice removed=True", "thread-autopsy-bundle.json#WM-002"],
    nextAction: "Integrate DefineDosDevice clear into ForceRemap preflight",
    advancementGate: "not-required",
    doNotAdvance: [],
  }),
  packet({
    packetKind: "mistake",
    packetId: "ssh-forceremap-as-wesley-gate-v1",
    packetTitle: "Treating cgremoteadmin SSH ForceRemap as Wesley operator repair",
    state: "DOCUMENTED",
    packetVerdict: "PASS",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerMcp: "user-cg-app-mcp",
    evidenceRefs: ["repair-1-receipt.json#operatorContextNotValidated", "thread-autopsy-bundle.json#ED-002"],
    nextAction: "Hard-block WSL /mnt/z validation until quser shows Wesley interactive",
    advancementGate: "not-required",
    doNotAdvance: [],
  }),
  packet({
    packetKind: "faster_path",
    packetId: "define-dosdevice-before-z-remap-v1",
    packetTitle: "Clear phantom Z: with DefineDosDevice before any net use map",
    state: "RECORDED",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Office-Admin",
    evidenceRefs: ["clear-z.ps1 kernel32 DefineDosDevice flags=3", "thread-autopsy-bundle.json#ED-001"],
    nextAction: "Add to Ensure-CgWesleyDeskDriveMounts ForceRemap path",
    advancementGate: "not-required",
    doNotAdvance: [],
  }),
  packet({
    packetKind: "command",
    packetId: "map-z-from-vault-wesleywork-v1",
    packetTitle: "WESLEY_WORK Z: remap via D:\\Admin Keys Map-Z-From-Vault.ps1",
    state: "PROVEN",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Office-Admin",
    evidenceRefs: [
      "D:\\Admin Keys\\Capital-Glass-IT-Vault\\tools\\Map-Z-From-Vault.ps1",
      "net use Z: \\\\cg-server\\Capital Glass OK off-LAN",
    ],
    nextAction: "Use cg-server Tailscale when 192.168.1.208 unreachable",
    advancementGate: "not-required",
    doNotAdvance: ["Improvise net use without vault script"],
  }),
  packet({
    packetKind: "command",
    packetId: "wesley-interactive-gate-script-v1",
    packetTitle: "Run-Repair1-InteractiveGate-Wesley.ps1 closes Repair 1",
    state: "STAGED",
    packetVerdict: "PENDING_OPERATOR",
    ownerRepo: "CapitalGlass-Office-Admin",
    evidenceRefs: [
      "C:\\ProgramData\\CapitalGlass\\OfficeAdmin\\PRIVATE\\gates\\Run-Repair1-InteractiveGate-Wesley.ps1",
      "CG-AppBuilder-MCP/artifacts/agent-runs/wesleydesk-connectivity-full-diagnostic-v1/OPERATOR-GATE-RUNBOOK.md",
    ],
    nextAction: "Wesley Admin PowerShell on WESLEYDESK console",
    advancementGate: "REPAIR_1_INTERACTIVE_GATE_PASS",
    doNotAdvance: [],
  }),
  packet({
    packetKind: "evidence",
    packetId: "repair-1-partial-pass-receipt-v1",
    packetTitle: "Repair 1 PARTIAL_PASS frozen verdict with open gates",
    state: "FROZEN",
    packetVerdict: "REPAIR_1_PARTIAL_PASS",
    ownerRepo: "CG-AppBuilder-MCP",
    ownerMcp: "user-cg-app-mcp",
    evidenceRefs: [
      "CG-AppBuilder-MCP/artifacts/agent-runs/wesleydesk-connectivity-full-diagnostic-v1/repair-1-receipt.json",
      "repair-2-acceptance.md",
    ],
    nextAction: "Upgrade verdict only after Phase A/B/C gates",
    advancementGate: "WESLEYDESK_DRIVE_PERSISTENCE_REBOOT_GATE_PASS",
    doNotAdvance: ["WESLEYDESK_CONNECTIVITY_ROOT_CAUSES_REPAIRED_AND_VERIFIED"],
  }),
  packet({
    packetKind: "protocol_upgrade",
    packetId: "windows-session-drive-mapping-guard-v1",
    packetTitle: "Require quser + whoami match before drive repair closeout",
    state: "CANDIDATE",
    packetVerdict: "POLICY_GATED",
    ownerRepo: "CapitalGlass-Office-Admin",
    evidenceRefs: ["thread-autopsy-bundle.json#roiBacklog rank 1", "OPERATOR-GATE-RUNBOOK.md"],
    nextAction: "Promote to Office Admin preflight + cursor rule candidate",
    advancementGate: "human-review",
    doNotAdvance: [],
  }),
  packet({
    packetKind: "decision",
    packetId: "repair1-partial-accept-operator-gate-v1",
    packetTitle: "Accept PARTIAL_PASS; operator owns Wesley session gates",
    state: "ACCEPTED",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Cross-Agent",
    ownerMcp: "user-cg-app-mcp",
    evidenceRefs: ["thread user Phase A/B/C acceptance", "TE-005"],
    nextAction: "Repair 2 deploy then cold reboot gate",
    advancementGate: "not-required",
    doNotAdvance: [],
  }),
  packet({
    packetKind: "repeated_work",
    packetId: "z-drive-session-recurrence-v1",
    packetTitle: "Z/L drive recurrence extends with session-identity dimension",
    state: "EXTENDS_PRIOR",
    packetVerdict: "PASS",
    ownerRepo: "CapitalGlass-Cross-Agent",
    ownerMcp: "user-cg-app-mcp",
    evidenceRefs: [PRIOR_HARVEST, "work-progress/harvest-packet-registry.json", "thread-autopsy-bundle.json#DW-001"],
    nextAction: "Extend 2026-08-02_z-drive-disconnect-recurrence-v1 project",
    advancementGate: "not-required",
    doNotAdvance: [],
  }),
];

writeJson("harvest-manifest-v1.json", {
  schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
  harvestId: HARVEST_ID,
  missionClass: "chat-thread-closeout-autopsy-harvest-v1",
  sourceCommitSha: SOURCE_SHA,
  sourceBranch: execSync("git branch --show-current", { cwd: REPO_ROOT, encoding: "utf8" }).trim(),
  sourceRepo: "CapitalGlass-Cross-Agent",
  createdAt: AS_OF,
  updatedAt: AS_OF,
  retrievalResult: "INDEX_HIT_AI_CACHE",
  cacheResult: "CACHE_MISS",
  overallHarvestVerdict: "HARVEST_COMPLETE",
  doNotAdvance: [
    "Claim REPAIR_1_PASS from cgremoteadmin SSH ForceRemap alone",
    "Validate WSL /mnt/z from SSH session without Wesley console login",
    "Claim WESLEYDESK_CONNECTIVITY_ROOT_CAUSES_REPAIRED_AND_VERIFIED before cold-reboot gate",
    "Run CapitalGlass-EnsureDeskDriveMounts-Once (Fred identity)",
  ],
  threadAutopsy: {
    tier: "T2",
    bundlePath: `artifacts/agent-runs/${HARVEST_ID}/thread-autopsy-bundle.json`,
    seedPacketIndexPath: `artifacts/agent-runs/${HARVEST_ID}/seed-packet-index.json`,
    counts: { waste: 5, seeds: 4, roiItems: 3, operatorFriction: 2, executionDeltas: 3 },
  },
  projection: {
    projectionSyncStatus: "not-run",
    hubPublishStatus: "not-run",
    hubPublishBlocker: "pending publish-intelligence-full",
  },
  ledgerLineage: { ledgerPath: "work-progress/ACTIVE_WORK.md", relatedProjectFile: PROJECT_FILE },
  supersededClaims: [],
  packets,
});

writeJson("thread-event-inventory.json", {
  schemaVersion: "thread-event-inventory-v1@1.0.0",
  harvestId: HARVEST_ID,
  threadRef: "agent-transcripts/29f9db42-b38c-4987-a40c-3681731389b9.jsonl",
  recordedAt: AS_OF,
  hosts: ["WESLEY_WORK", "WESLEYDESK"],
  events: [
    { eventId: "TE-001", phase: "diagnostic", summary: "Full WESLEYDESK connectivity diagnostic via Tailscale SSH", actor: "agent", evidenceRefs: ["wesleydesk-connectivity-full-diagnostic-v1/receipt.json"] },
    { eventId: "TE-002", phase: "root-cause", summary: "Phantom Z + session-bound SMB + failed Wesley logon tasks", actor: "agent", evidenceRefs: ["smb-drive-report.json"] },
    { eventId: "TE-003", phase: "repair-1", summary: "IT Vault ForceRemap + smb-z-cg-server.env synced to desk PRIVATE", actor: "agent", evidenceRefs: ["repair-1-receipt.json"] },
    { eventId: "TE-004", phase: "partial-pass", summary: "ForceRemap PASS in SSH; WSL /mnt/z FAIL — Fred console, Wesley absent", actor: "agent", evidenceRefs: ["quser", "repair-1-receipt.json"] },
    { eventId: "TE-005", phase: "operator-gate", summary: "User defined Phase A/B/C acceptance gates", actor: "user", evidenceRefs: ["OPERATOR-GATE-RUNBOOK.md"] },
    { eventId: "TE-006", phase: "work-local", summary: "WESLEY_WORK Z: via Map-Z-From-Vault over cg-server Tailscale", actor: "user", evidenceRefs: ["Map-Z-From-Vault.ps1"] },
    { eventId: "TE-007", phase: "harvest", summary: "chat-thread-closeout-autopsy-harvest-v1", actor: "user", evidenceRefs: ["CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md"] },
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
    hubSlicesConsulted: ["BY-KIND/active-work-blockers.json", PRIOR_HARVEST],
    checkedAt: AS_OF,
  },
  waste: [
    { wasteId: "TW-001", type: "verification", description: "Treated cgremoteadmin SSH ForceRemap as operator Z repair", evidenceRefs: ["repair-1-receipt.json"], estimatedImpact: "high", savedBy: "Require Wesley interactive session before WSL /mnt/z validation", roiRank: 1 },
    { wasteId: "TW-002", type: "rework", description: "Retried ForceRemap without DefineDosDevice on phantom Z (error 85)", evidenceRefs: ["clear-z.ps1"], estimatedImpact: "medium", savedBy: "DefineDosDevice before map", roiRank: 2 },
    { wasteId: "TW-003", type: "host", description: "Vault decrypt failed until MACHINE-LOCK.json copied with bundle", evidenceRefs: ["Map-Z log"], estimatedImpact: "low", savedBy: "Stage full vault root or smb-z-cg-server.env sync", roiRank: 3 },
    { wasteId: "TW-004", type: "operator_attention", description: "User specified elevated auth and Phase A/B/C gates after SSH partial pass", evidenceRefs: ["TE-005"], estimatedImpact: "high", savedBy: "Detect Wesley absent before Repair 1 claims", roiRank: 4 },
    { wasteId: "TW-005", type: "retrieval", description: "Cross-Agent agent:index:scout missing — App Builder scout fallback", evidenceRefs: ["npm error"], estimatedImpact: "low", savedBy: "Document scout failover from App Builder", roiRank: 5 },
  ],
  operatorFriction: [
    { frictionId: "OF-001", trigger: "User pointed to D:\\Admin Keys after SSH remap attempts", operatorCost: "medium", systemFix: "IT Vault path first on WESLEY_WORK", evidenceRefs: ["TE-003"], linkedWasteIds: ["TW-003"] },
    { frictionId: "OF-002", trigger: "User authored Phase A/B/C acceptance — agent could not run Wesley gate", operatorCost: "high", systemFix: "Hard-block REPAIR_1_PASS without interactive Wesley", evidenceRefs: ["TE-005"], linkedWasteIds: ["TW-001", "TW-004"] },
  ],
  executionDeltas: [
    {
      executionDeltaId: "ED-001",
      situation: "Phantom Z blocks remap",
      actualExecution: { steps: ["net use /delete", "ForceRemap error 85"], outcome: "FAIL until DefineDosDevice", evidenceRefs: ["clear-z.ps1"] },
      optimalExecution: { steps: ["DefineDosDevice remove Z:", "Map-CgWesleyDeskZDrive"], outcome: "Single remap pass", requiredPreflight: ["Clear-OfficeZDriveMapping"] },
      deltaCost: { time: "medium", tokens: "medium", operatorFrustration: "medium" },
    },
    {
      executionDeltaId: "ED-002",
      situation: "Repair 1 closeout",
      actualExecution: { steps: ["ForceRemap cgremoteadmin", "zOk in SSH session"], outcome: "REPAIR_1_PARTIAL_PASS", evidenceRefs: ["repair-1-receipt.json"] },
      optimalExecution: { steps: ["quser Wesley", "stage operator gates only"], outcome: "BLOCKED_OPERATOR_SESSION immediately", requiredPreflight: ["quser"] },
      deltaCost: { time: "high", tokens: "medium", operatorFrustration: "high" },
    },
    {
      executionDeltaId: "ED-003",
      situation: "WESLEY_WORK Z reconnect",
      actualExecution: { steps: ["Map-Z-From-Vault", "LAN fail", "cg-server OK"], outcome: "PASS", evidenceRefs: ["TE-006"] },
      optimalExecution: { steps: ["Map-Z-From-Vault.ps1 from D:\\Admin Keys"], outcome: "Immediate Z:", requiredPreflight: ["IT Vault mounted"] },
      deltaCost: { time: "low", tokens: "low", operatorFrustration: "low" },
    },
  ],
  wrongMoves: [
    { wrongMoveId: "WM-001", summary: "Validated WSL /mnt/z from cgremoteadmin SSH session", whereItHappened: "Repair 1 validation", whyItWasWrong: "drvfs binds to console user session not SSH mapping", correctFirstMove: "quser Wesley → interactive gate script", preventiveControl: "Run-Repair1-InteractiveGate-Wesley.ps1", seedTarget: "IH-THREAD-WESLEYDESK-Z-SESSION-001", executionDeltaId: "ED-002" },
    { wrongMoveId: "WM-002", summary: "ForceRemap without DefineDosDevice on phantom Z", whereItHappened: "WESLEYDESK SSH Repair 1", whyItWasWrong: "net use empty but DriveInfo Z IsReady=False", correctFirstMove: "DefineDosDevice before net use map", preventiveControl: "Integrate into ForceRemap preflight", seedTarget: "IH-THREAD-PHANTOM-Z-DRIVE-001", executionDeltaId: "ED-001" },
  ],
  duplicateWork: [
    { duplicateId: "DW-001", subject: "Z/L drive session recurrence", firstKnownInstance: PRIOR_HARVEST, priorIndexSlice: "work-progress/harvest-packet-registry.json", whyRepeated: "Same class with session-identity dimension on WESLEYDESK", avoidableBy: "Index session-identity guard", recommendedAction: "index" },
    { duplicateId: "DW-002", subject: "WESLEYDESK drive-mount scheduled task failures", firstKnownInstance: "schtasks Last Result 2", priorIndexSlice: "BY-KIND/active-work-blockers.json", whyRepeated: "Repair 2 not deployed", avoidableBy: "Repair 2 + cold reboot gate", recommendedAction: "index" },
  ],
  roiBacklog: [
    { rank: 1, title: "Wesley interactive gate + SSH-only Z block", whyItPays: "Stops false Repair 1 closeout", effort: "low", savedWasteIds: ["TW-001", "TW-004"], ownerRepo: "CapitalGlass-Office-Admin", seedAs: "runbook", suggestedWorkPackageId: "wesleydesk-drive-interactive-gate-v1" },
    { rank: 2, title: "Phantom Z DefineDosDevice in ForceRemap", whyItPays: "Prevents error 85 loops", effort: "low", savedWasteIds: ["TW-002"], ownerRepo: "CapitalGlass-Office-Admin", seedAs: "rule", suggestedWorkPackageId: "phantom-z-drive-clear-v1" },
    { rank: 3, title: "Repair 2 deploy + cold-reboot acceptance", whyItPays: "Closes durable persistence", effort: "medium", savedWasteIds: ["DW-002"], ownerRepo: "CapitalGlass-Office-Admin", seedAs: "runbook", suggestedWorkPackageId: "wesleydesk-drive-mount-persistence-v1" },
  ],
  doNotAdvanceMap: [
    { awardOrVerdict: "REPAIR_1_PASS", currentStatus: "BLOCKED", doNotClaimUntil: ["Wesley interactive session", "REPAIR_1_INTERACTIVE_GATE_PASS"], lastKnownEvidence: ["repair-1-receipt.json", "TE-004"], proofCommandId: "wesley-interactive-gate-script-v1" },
    { awardOrVerdict: "WSL_MNT_Z_PASS", currentStatus: "BLOCKED", doNotClaimUntil: ["ACTIVE_USER_Z_MAPPING proven", "ls /mnt/z/Capital-Glass-Dev after wsl --shutdown"], lastKnownEvidence: ["WM-001"] },
    { awardOrVerdict: "WESLEYDESK_CONNECTIVITY_ROOT_CAUSES_REPAIRED_AND_VERIFIED", currentStatus: "OPEN", doNotClaimUntil: ["Repair 2 deployed", "Cold reboot without manual ForceRemap", "WESLEYDESK_DRIVE_PERSISTENCE_REBOOT_GATE_PASS"], lastKnownEvidence: ["repair-2-acceptance.md"] },
  ],
});

const seeds = [
  { seedId: "IH-THREAD-WESLEYDESK-Z-SESSION-001", kind: "failure-pattern", title: "WESLEYDESK Z: in SSH does not reach Wesley WSL /mnt/z", summary: "Network drives are per Windows user session.", retrievalQuestions: ["Why is /mnt/z empty after Z remap?", "Can cgremoteadmin SSH prove Wesley repair?"], evidenceRefs: [HARVEST_ID, "WM-001"], futureAgentInstructions: { whenThisAppears: "WESLEYDESK Z repair via SSH", startAt: ["quser", PROJECT_FILE], runPreflight: ["office.get_agent_preflight"], doNot: ["Claim REPAIR_1_PASS from SSH"], proveBeforeClaiming: ["REPAIR_1_INTERACTIVE_GATE_PASS"] }, ownerRepo: "CapitalGlass-Office-Admin", targetSlice: "BY-KIND/thread-autopsy-index.json", promotionClass: "POLICY_GATED", status: "CANDIDATE" },
  { seedId: "IH-THREAD-PHANTOM-Z-DRIVE-001", kind: "failure-pattern", title: "Phantom Z requires DefineDosDevice before remap", summary: "Error 85 when net use shows empty but letter reserved.", retrievalQuestions: ["Z remap device already in use?", "net use empty but ForceRemap fails?"], evidenceRefs: ["clear-z.ps1", PRIOR_HARVEST], futureAgentInstructions: { whenThisAppears: "error 85 on WESLEYDESK Z remap", startAt: ["Get-PSDrive Z"], runPreflight: [], doNot: ["Retry ForceRemap without phantom clear"], proveBeforeClaiming: ["DefineDosDevice removed=True"] }, ownerRepo: "CapitalGlass-Office-Admin", targetSlice: "BY-KIND/thread-autopsy-index.json", promotionClass: "POLICY_GATED", status: "CANDIDATE" },
  { seedId: "IH-THREAD-WESLEY-INTERACTIVE-GATE-001", kind: "runbook", title: "WESLEYDESK Repair 1–3 operator gate sequence", summary: "Phase A gate → Repair 2 → cold reboot.", retrievalQuestions: ["What closes Repair 1 after SSH partial pass?", "What proves durable Z persistence?"], evidenceRefs: ["OPERATOR-GATE-RUNBOOK.md"], futureAgentInstructions: { whenThisAppears: "PARTIAL_PASS stuck", startAt: ["OPERATOR-GATE-RUNBOOK.md"], runPreflight: ["quser Wesley interactive"], doNot: ["EnsureDeskDriveMounts-Once Fred"], proveBeforeClaiming: ["REPAIR_1_INTERACTIVE_GATE_PASS", "WESLEYDESK_DRIVE_PERSISTENCE_REBOOT_GATE_PASS"] }, ownerRepo: "CapitalGlass-Office-Admin", targetSlice: "BY-KIND/thread-autopsy-index.json", promotionClass: "HUMAN_REVIEW", status: "CANDIDATE" },
  { seedId: "IH-THREAD-MAP-Z-VAULT-WORK-001", kind: "command", title: "WESLEY_WORK Z via Map-Z-From-Vault.ps1", summary: "Use cg-server Tailscale when off LAN.", retrievalQuestions: ["Reconnect Z on WESLEY_WORK?", "192.168.1.208 fails off LAN?"], evidenceRefs: ["Map-Z-From-Vault.ps1", PRIOR_HARVEST], futureAgentInstructions: { whenThisAppears: "WESLEY_WORK needs Z", startAt: ["D:\\Admin Keys"], runPreflight: ["IT Vault on D:"], doNot: ["Hardcode SMB creds"], proveBeforeClaiming: ["net use Z: OK"] }, ownerRepo: "CapitalGlass-Office-Admin", targetSlice: "BY-KIND/thread-autopsy-index.json", promotionClass: "AUTOMATIC", status: "CANDIDATE" },
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

writeJson("code-touch-summary.json", {
  schemaVersion: "code-touch-summary-v1@1.0.0",
  harvestId: HARVEST_ID,
  generatedAt: AS_OF,
  repos: [
    { repo: "CG-AppBuilder-MCP", role: "diagnostic artifacts", paths: ["artifacts/agent-runs/wesleydesk-connectivity-full-diagnostic-v1/"] },
    { repo: "CapitalGlass-Office-Admin", role: "drive mount PRIVATE on desk", paths: ["Ensure-CgWesleyDeskDriveMounts.ps1", "Map-CgWesleyDeskZDrive.ps1"] },
  ],
  operatorCommands: ["Ensure-CgWesleyDeskDriveMounts.ps1 -Mode ForceRemap", "Map-Z-From-Vault.ps1", "Run-Repair1-InteractiveGate-Wesley.ps1"],
});

writeJson("duplication-preflight-receipt.json", {
  schemaVersion: "harvest-duplication-preflight-v1@1.0.0",
  harvestId: HARVEST_ID,
  checkedAt: AS_OF,
  registryConsulted: true,
  commandIndexConsulted: true,
  hubSlicesConsulted: [PRIOR_HARVEST],
  retrievalResult: "INDEX_HIT_AI_CACHE",
  overlaps: [{ priorHarvestId: PRIOR_HARVEST, overlapKind: "extends", subject: "Z/L session recurrence" }],
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
      ownerMcp: p.ownerMcp ?? "user-office-admin-mcp",
      ownerIndexingStatus: p.ownerIndexingStatus,
      requiredOwnerArtifact: p.ownerRepo === "CapitalGlass-Office-Admin" ? "Ensure-CgWesleyDeskDriveMounts.ps1" : "wesleydesk-connectivity-full-diagnostic-v1/receipt.json",
      crossAgentRole: "thread autopsy harvest pointer",
      ownerRepoRole: p.packetTitle,
      currentGap: p.state === "OPEN" ? "Wesley interactive Z mapping" : null,
    });
  }
}
registry.updatedAt = AS_OF;
fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
fs.writeFileSync(boundaryPath, `${JSON.stringify(boundary, null, 2)}\n`, "utf8");

console.log(`Generated ${HARVEST_ID} at ${RUN_DIR}`);
