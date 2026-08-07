#!/usr/bin/env node
/**
 * Compile machine-readable Intelligence Hub control slices from Git-authoritative sources.
 * Output: work-progress/intelligence-hub-slices/*.json
 * Does not publish to L: — use index:publish on WESLEYDESK after freshness gate PASS.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveGitHead } from "./lib/git-head.mjs";
import { hashCanonicalJson } from "../harvest/lib/hash.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SLICES_DIR = path.join(REPO_ROOT, "work-progress/intelligence-hub-slices");
const DOMAINS_DIR = path.join(SLICES_DIR, "domains");
const EXPANSION_RUN = path.join(
  REPO_ROOT,
  "artifacts/agent-runs/intelligence-hub-capability-expansion-v1"
);

function readJson(rel) {
  const abs = path.join(REPO_ROOT, rel);
  if (!fs.existsSync(abs)) return null;
  return JSON.parse(fs.readFileSync(abs, "utf8"));
}

function writeJson(rel, value) {
  const abs = path.join(REPO_ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function compactCommands(commandIndex) {
  const commands = (commandIndex?.commands ?? []).map((c) => ({
    id: c.id,
    command: c.command,
    repo: c.repo,
    phase: c.phase,
    provesGate: c.provesGate ?? null,
    gateId: c.gateId ?? null,
    host: c.host ?? null,
    executable: c.executable !== false,
  }));
  return {
    schemaVersion: "intelligence-hub-commands-slice-v1@1.0.0",
    sourceCommitSha: commandIndex?.sourceCommitSha ?? null,
    updatedAt: new Date().toISOString(),
    commandCount: commands.length,
    commands,
  };
}

function compactBlockers(blockerMap) {
  const blockers = (blockerMap?.blockers ?? []).map((b) => ({
    blockerId: b.blockerId,
    severity: b.severity,
    title: b.title,
    state: b.state,
    ownerRepo: b.ownerRepo,
    hostAuthority: b.hostAuthority,
    nextAction: b.nextAction,
    commandIds: b.commandIds ?? [],
    doNotAdvance: b.doNotAdvance ?? [],
  }));
  return {
    schemaVersion: "intelligence-hub-blockers-slice-v1@1.0.0",
    updatedAt: blockerMap?.updatedAt ?? new Date().toISOString(),
    openCount: blockers.filter((b) => b.state === "OPEN").length,
    blockers,
  };
}

function compactDoNotAdvance(registry) {
  return {
    schemaVersion: "intelligence-hub-do-not-advance-slice-v1@1.0.0",
    updatedAt: registry?.updatedAt ?? new Date().toISOString(),
    entryCount: (registry?.entries ?? []).length,
    entries: (registry?.entries ?? []).map((e) => ({
      claimId: e.claimId,
      forbiddenUntil: e.forbiddenUntil,
      ownerRepo: e.ownerRepo,
      proofCommandIds: e.proofCommandIds ?? [],
    })),
  };
}

function compactOwnerBoundaries(boundaryIndex) {
  const packets = boundaryIndex?.packets ?? [];
  return {
    schemaVersion: "intelligence-hub-owner-boundaries-slice-v1@1.0.0",
    updatedAt: boundaryIndex?.updatedAt ?? new Date().toISOString(),
    latestHarvestId: boundaryIndex?.latestHarvestId ?? null,
    packetCount: packets.length,
    packets: packets.map((p) => ({
      packetId: p.packetId,
      ownerRepo: p.ownerRepo,
      crossAgentRole: p.crossAgentRole,
      ownerRepoRole: p.ownerRepoRole,
      currentGap: p.currentGap ?? null,
    })),
  };
}

function compactWorkPackageRegistry(harvestRegistry) {
  const packets = harvestRegistry?.packets ?? {};
  const entries = Object.entries(packets).map(([packetId, p]) => ({
    packetId,
    state: p.state ?? null,
    verdict: p.verdict ?? null,
    ownerRepo: p.ownerRepo ?? null,
    harvestId: p.harvestId ?? null,
  }));
  return {
    schemaVersion: "intelligence-hub-work-package-registry-slice-v1@1.0.0",
    updatedAt: harvestRegistry?.updatedAt ?? new Date().toISOString(),
    packetCount: entries.length,
    packets: entries,
  };
}

function buildCurrentState(pointer, gitHead) {
  const slice6 = pointer
    ? {
        workPackageId: pointer.workPackageId,
        publicationStatus: pointer.publicationStatus,
        publicationWorkflowRunId: pointer.publicationWorkflowRunId ?? null,
        publicationSha: pointer.publicationSha ?? null,
        mergeCommitSha: pointer.mergeCommitSha ?? null,
      }
    : null;
  return {
    schemaVersion: "intelligence-hub-current-state-slice-v1@1.0.0",
    sourceCommitSha: gitHead,
    updatedAt: new Date().toISOString(),
    coordinationRepo: "CapitalGlass-Cross-Agent",
    focus: [
      "harvest-current-cross-thread-state-v2 HARVEST_COMPLETE",
      "intelligence-hub-capability-expansion-v1 IN_PROGRESS",
      "slice6 MERGED_AWAITING_HUB_PUBLICATION",
    ],
    slice6,
    retrievalChain: ["scout-hook", "hot-ai-cache", "compact-index-slice", "repo-source-only-if-miss"],
  };
}

function buildHostAuthority() {
  return {
    schemaVersion: "intelligence-hub-host-authority-slice-v1@1.0.0",
    updatedAt: new Date().toISOString(),
    hosts: [
      {
        hostId: "WESLEYDESK",
        role: "index publication, GitHub Actions runner, primary dev",
        paths: { intelligenceHub: "L:/Capital-Glass-Intelligence-Hub", aiCache: "S:/AI Cursur Cache" },
      },
      {
        hostId: "WESLEY_WORK",
        role: "WSL dev, cross-agent ledger ingest",
        paths: { intelligenceHub: "/mnt/l/Capital-Glass-Intelligence-Hub", aiCache: "/mnt/d/AI Cursur Cache" },
      },
      {
        hostId: "RYZEN9DESK",
        role: "managed executor, Direct Connect endpoint",
        paths: { aiCache: "C:/AI Cursur Cache" },
      },
    ],
  };
}

function buildReceiptsSlice() {
  const receiptPaths = [
    "artifacts/agent-runs/harvest-current-cross-thread-state-v2/receipt.json",
    "artifacts/agent-runs/three-way-agent-improvement-intelligence-v1/merge-completion-receipt-v1.json",
    "artifacts/agent-runs/three-way-agent-improvement-intelligence-v1/slice6-closeout-receipt-v1.json",
    "artifacts/agent-runs/intelligence-hub-capability-expansion-v1/recommended-roi.json",
  ];
  const receipts = [];
  for (const rel of receiptPaths) {
    const data = readJson(rel);
    if (!data) continue;
    const nested =
      data.executionReceipt && typeof data.executionReceipt === "object"
        ? data.executionReceipt
        : null;
    receipts.push({
      path: rel,
      schemaVersion:
        nested?.schemaVersion ?? data.schemaVersion ?? null,
      workPackageId:
        nested?.workPackageId ?? data.workPackageId ?? data.harvestId ?? null,
      verdict:
        nested?.verdict ??
        data.verdict ??
        data.operationalVerdict ??
        data.finalVerdict ??
        null,
      gatesCount: Array.isArray(nested?.gates)
        ? nested.gates.length
        : Array.isArray(data.gates)
          ? data.gates.length
          : Array.isArray(data.gatesRun)
            ? data.gatesRun.length
            : 0,
      hasCanonicalExecutionReceipt:
        nested?.schemaVersion === "cg-execution-receipt-v1@1.0.0",
      updatedAt: data.generatedAt ?? data.updatedAt ?? data.closedAt ?? null,
    });
  }

  const byWorkPackageId = {};
  for (const receipt of receipts) {
    if (!receipt.workPackageId) continue;
    if (!byWorkPackageId[receipt.workPackageId]) {
      byWorkPackageId[receipt.workPackageId] = [];
    }
    byWorkPackageId[receipt.workPackageId].push(receipt);
  }

  return {
    schemaVersion: "intelligence-hub-receipts-slice-v1@1.1.0",
    updatedAt: new Date().toISOString(),
    receiptCount: receipts.length,
    receipts,
    fieldIndex: {
      schemaVersion: "receipt-field-index-v1@1.0.0",
      byWorkPackageId,
    },
  };
}

function buildFreshnessDashboard(gitHead) {
  const pubLatest = readJson("runtime/index-publication/latest.json");
  const freshnessLatest = readJson(
    "artifacts/agent-runs/cross-agent-index-freshness-gate-v1/latest.json"
  );
  return {
    schemaVersion: "intelligence-hub-freshness-dashboard-slice-v1@1.0.0",
    updatedAt: new Date().toISOString(),
    gitHead,
    publication: pubLatest
      ? {
          sourceCommitSha: pubLatest.sourceCommitSha ?? null,
          publishedAt: pubLatest.publishedAt ?? null,
        }
      : { available: false },
    freshnessGate: freshnessLatest
      ? { verdict: freshnessLatest.verdict ?? null, checkedAt: freshnessLatest.checkedAt ?? null }
      : { available: false },
  };
}

function buildDomainPacks(blockerMap, harvestRegistry) {
  const byDomain = {
    "direct-connect": ["direct-connect-persistent-controller-v1"],
    "three-way-improvement": ["three-way-agent-improvement-intelligence-v1"],
    "synology-primary": [
      "complete-project-folder-synology-intelligence-publication-v1",
      "project-folder-synology-primary-v1-dev-environment",
    ],
    revu: [],
    "document-center": [],
    "proposal-generator": [],
  };
  const packets = harvestRegistry?.packets ?? {};
  const domains = {};
  for (const [domainId, packetIds] of Object.entries(byDomain)) {
    const relatedBlockers = (blockerMap?.blockers ?? []).filter((b) =>
      packetIds.some((pid) => (b.receiptRefs ?? []).some((r) => r.includes(pid)))
    );
    domains[domainId] = {
      domainId,
      packetIds,
      packets: packetIds
        .filter((id) => packets[id])
        .map((id) => ({
          packetId: id,
          state: packets[id].state ?? null,
          verdict: packets[id].verdict ?? null,
        })),
      blockerIds: relatedBlockers.map((b) => b.blockerId),
    };
  }
  return domains;
}

function main() {
  const gitHead = resolveGitHead(REPO_ROOT);
  const commandIndex = readJson("work-progress/command-index.json");
  const blockerMap = readJson("work-progress/blocker-to-action-map.json");
  const doNotAdvance = readJson("work-progress/do-not-advance-registry.json");
  const boundaryIndex = readJson("work-progress/owner-repo-boundary-index.json");
  const harvestRegistry = readJson("work-progress/harvest-packet-registry.json");
  const pointer = readJson("work-progress/pointers/three-way-agent-improvement-intelligence-v1.json");

  if (!blockerMap || !doNotAdvance || !commandIndex) {
    console.error("Missing required authority files (command-index, blocker-to-action-map, do-not-advance-registry)");
    process.exit(1);
  }

  const slices = {
    "current-state.json": buildCurrentState(pointer, gitHead),
    "blockers.json": compactBlockers(blockerMap),
    "commands.json": compactCommands(commandIndex),
    "receipts.json": buildReceiptsSlice(),
    "owner-boundaries.json": compactOwnerBoundaries(boundaryIndex),
    "do-not-advance.json": compactDoNotAdvance(doNotAdvance),
    "host-authority.json": buildHostAuthority(),
    "work-package-registry.json": compactWorkPackageRegistry(harvestRegistry),
    "freshness-dashboard.json": buildFreshnessDashboard(gitHead),
  };

  fs.mkdirSync(SLICES_DIR, { recursive: true });
  fs.mkdirSync(DOMAINS_DIR, { recursive: true });

  const sliceHashes = {};
  for (const [filename, body] of Object.entries(slices)) {
    const rel = `work-progress/intelligence-hub-slices/${filename}`;
    writeJson(rel, body);
    sliceHashes[filename] = hashCanonicalJson(body);
  }

  const domainPacks = buildDomainPacks(blockerMap, harvestRegistry);
  for (const [domainId, body] of Object.entries(domainPacks)) {
    const enriched = {
      schemaVersion: "intelligence-hub-domain-pack-v1@1.0.0",
      sourceCommitSha: gitHead,
      updatedAt: new Date().toISOString(),
      ...body,
    };
    const rel = `work-progress/intelligence-hub-slices/domains/${domainId}.json`;
    writeJson(rel, enriched);
    sliceHashes[`domains/${domainId}.json`] = hashCanonicalJson(enriched);
  }

  const manifest = {
    schemaVersion: "intelligence-hub-control-slices-manifest-v1@1.0.0",
    workPackageId: "intelligence-hub-capability-expansion-v1",
    compiledAt: new Date().toISOString(),
    sourceCommitSha: gitHead,
    sliceCount: Object.keys(sliceHashes).length,
    sliceHashes,
    outputDir: "work-progress/intelligence-hub-slices",
    byKindTargets: [
      "00-master-index/BY-KIND/blockers.json",
      "00-master-index/BY-KIND/commands.json",
      "00-master-index/BY-KIND/do-not-advance.json",
      "00-master-index/BY-KIND/owner-boundaries.json",
      "00-master-index/BY-KIND/receipts.json",
      "00-master-index/BY-KIND/host-authority.json",
      "00-master-index/BY-KIND/work-package-registry.json",
      "00-master-index/BY-KIND/current-state.json",
      "00-master-index/BY-KIND/freshness-dashboard.json",
    ],
  };

  fs.mkdirSync(EXPANSION_RUN, { recursive: true });
  writeJson(
    "artifacts/agent-runs/intelligence-hub-capability-expansion-v1/compile-receipt-v1.json",
    manifest
  );

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(manifest, null, 2));
  } else {
    console.log(`Compiled ${manifest.sliceCount} slices @ ${gitHead.slice(0, 7)}`);
    console.log(`Output: work-progress/intelligence-hub-slices/`);
    console.log(`Receipt: artifacts/agent-runs/intelligence-hub-capability-expansion-v1/compile-receipt-v1.json`);
  }
}

main();
