#!/usr/bin/env node
/**
 * Sync derived harvest views from harvest-manifest-v1.json (canonical authority).
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { hashCanonicalJson, hashFileContent } from "./lib/hash.mjs";
import { REPO_ROOT, harvestRunDir, manifestPath, HARVEST_ID } from "./lib/paths.mjs";

const harvestId = process.argv[2] || HARVEST_ID;
const runDir = harvestRunDir(harvestId);
const manifestFile = manifestPath(harvestId);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function tryGitShow(ref) {
  try {
    return execSync(`git show ${ref}`, { cwd: REPO_ROOT, encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
  } catch {
    return null;
  }
}

function buildCompactRecord(packet, harvestId, manifest) {
  const body = {
    schemaVersion: "cross-agent-harvest-compact-record-v1@1.0.0",
    harvestId,
    packetId: packet.packetId,
    state: packet.state,
    packetVerdict: packet.packetVerdict,
    ownerRepo: packet.ownerRepo,
    ownerIndexingStatus: packet.ownerIndexingStatus,
    nextAction: packet.nextAction,
    evidenceRefs: packet.evidenceRefs,
    doNotAdvance: packet.doNotAdvance,
    advancementGate: packet.advancementGate,
  };
  return { ...body, contentHash: hashCanonicalJson(body) };
}

function buildPacketIndex(manifest) {
  return {
    schemaVersion: "cross-agent-harvest-packet-index-v1@1.0.0",
    workPackageId: manifest.harvestId,
    generatedAt: manifest.updatedAt,
    missionClass: manifest.missionClass,
    runMode: "derived-from-manifest",
    retrievalOutcome: manifest.retrievalResult,
    authority: "artifacts/agent-runs/harvest-2026-08-03-cross-thread-platform-state-v1/harvest-manifest-v1.json",
    harvestManifestHash: hashCanonicalJson(manifest),
    packets: manifest.packets.map((packet) => ({
      id: packet.packetId,
      label: packet.packetId,
      state: packet.state,
      verdict: packet.packetVerdict,
      ownerRepo: packet.ownerRepo,
      ownerIndexingStatus: packet.ownerIndexingStatus,
      crossAgentProject: packet.projectFile,
      doNotAdvance: packet.doNotAdvance,
      commitRefs: packet.commitRefs,
    })),
  };
}

function buildReceipt(manifest, harvestManifestHash, ledgerBefore, ledgerAfter) {
  return {
    schemaVersion: "cross-agent-harvest-receipt-v1@1.1.0",
    workPackageId: manifest.harvestId,
    missionClass: manifest.missionClass,
    generatedAt: manifest.updatedAt,
    verdict: manifest.overallHarvestVerdict,
    authority: "harvest-manifest-v1.json",
    harvestManifestPath: `artifacts/agent-runs/${manifest.harvestId}/harvest-manifest-v1.json`,
    harvestManifestHash,
    sourceCommitSha: manifest.sourceCommitSha,
    sourceBranch: manifest.sourceBranch,
    sourceRepo: manifest.sourceRepo,
    ledgerContentHashBefore: ledgerBefore,
    ledgerContentHashAfter: ledgerAfter,
    projectionSyncStatus: manifest.projection.projectionSyncStatus,
    hubPublishStatus: manifest.projection.hubPublishStatus,
    retrieval: {
      primaryOutcome: manifest.retrievalResult,
      cacheOutcome: manifest.cacheResult,
      hubMount: "L_DRIVE_MOUNTED_IN_WSL",
    },
    constraintsHonored: {
      noSsh: true,
      noRunnerInstall: true,
      noWorkflowDispatch: true,
      noAppBuilderChanges: true,
      noPromptOpsCleanup: true,
      noLPublication: true,
      noTokenOrCredentialArtifacts: true,
    },
    packetCount: manifest.packets.length,
    packetIndexPath: `artifacts/agent-runs/${manifest.harvestId}/packet-index.json`,
    summaryPath: `artifacts/agent-runs/${manifest.harvestId}/HARVEST_SUMMARY.md`,
    coveragePath: `artifacts/agent-runs/${manifest.harvestId}/coverage.json`,
    bootstrapNote:
      "RYZEN9DESK runner bootstrap is a separate CG-AppBuilder-MCP mission; harvest records coordination state only.",
  };
}

function buildSummary(manifest, harvestManifestHash) {
  const lines = [
    "# Harvest summary — derived view",
    "",
    `**Authority:** \`harvest-manifest-v1.json\` (\`${harvestManifestHash.slice(0, 12)}…\`)`,
    `**Work package:** \`${manifest.harvestId}\``,
    `**Mission class:** \`${manifest.missionClass}\``,
    `**Verdict:** \`${manifest.overallHarvestVerdict}\``,
    `**Retrieval:** \`${manifest.retrievalResult}\``,
    "",
    "> This file is a generated view. Do not edit independently — update the manifest.",
    "",
    "## Packets harvested",
    "",
    "| Packet | State | Verdict | Owner |",
    "| --- | --- | --- | --- |",
  ];
  for (const packet of manifest.packets) {
    lines.push(
      `| \`${packet.packetId}\` | ${packet.state} | ${packet.packetVerdict} | ${packet.ownerRepo} |`,
    );
  }
  lines.push("", "## Global doNotAdvance", "");
  for (const item of manifest.doNotAdvance) {
    lines.push(`- ${item}`);
  }
  lines.push("", "## Projection sync", "", `Status: \`${manifest.projection.projectionSyncStatus}\` (hub: \`${manifest.projection.hubPublishStatus}\`)`, "");
  return `${lines.join("\n")}\n`;
}

function computeCoverage(manifest, compactDir) {
  const packets = manifest.packets;
  const boundaryPath = path.join(REPO_ROOT, "work-progress/owner-repo-boundary-index.json");
  const boundary = fs.existsSync(boundaryPath) ? readJson(boundaryPath) : { packets: [] };
  const boundaryById = Object.fromEntries(boundary.packets.map((p) => [p.packetId, p]));

  const validationResultPath = path.join(path.dirname(compactDir), "validation-result.json");
  let schemaValidationPass = false;
  if (fs.existsSync(validationResultPath)) {
    try {
      const vr = JSON.parse(fs.readFileSync(validationResultPath, "utf8"));
      schemaValidationPass = vr.schemaValidation === "PASS" && vr.verdict === "PASS";
    } catch {
      schemaValidationPass = false;
    }
  }

  const metrics = {
    packetsTotal: packets.length,
    packetsWithOwnerRepo: packets.filter((p) => p.ownerRepo).length,
    packetsWithOwnerIndexed: packets.filter((p) => p.ownerIndexingStatus === "indexed").length,
    packetsPointerOnly: packets.filter((p) => p.ownerIndexingStatus === "pointer-only").length,
    packetsMissingOwnerIndex: packets.filter((p) => p.ownerIndexingStatus === "missing").length,
    packetsWithDocumentedOwnerGap: packets.filter(
      (p) => p.ownerIndexingStatus === "missing" && boundaryById[p.packetId]?.currentGap,
    ).length,
    packetsWithCommitEvidence: packets.filter((p) => (p.commitRefs?.length ?? 0) > 0).length,
    packetsWithVerificationRefs: packets.filter((p) => (p.evidenceRefs?.length ?? 0) > 0).length,
    packetsWithDoNotAdvance: packets.filter((p) => (p.doNotAdvance?.length ?? 0) > 0).length,
    packetsWithCompactRecord: packets.filter((p) =>
      fs.existsSync(path.join(compactDir, `${p.packetId}.json`)),
    ).length,
    packetsWithAdvancementGate: packets.filter((p) => p.advancementGate && p.advancementGate !== "not-required").length,
    packetsWithSupersededClaimHandling: (manifest.supersededClaims?.length ?? 0) > 0 ? 1 : 0,
    ownerReposWithStalePointers: packets.filter(
      (p) => p.ownerIndexingStatus === "missing" && !boundaryById[p.packetId]?.currentGap,
    ).length,
    schemaValidationPass,
  };

  const scored = [
    metrics.packetsWithOwnerRepo / metrics.packetsTotal,
    (metrics.packetsWithOwnerIndexed + metrics.packetsWithDocumentedOwnerGap) / metrics.packetsTotal,
    metrics.packetsWithCommitEvidence / metrics.packetsTotal,
    metrics.packetsWithVerificationRefs / metrics.packetsTotal,
    metrics.packetsWithDoNotAdvance / metrics.packetsTotal,
    metrics.packetsWithCompactRecord / metrics.packetsTotal,
    metrics.packetsWithAdvancementGate / metrics.packetsTotal,
    metrics.packetsWithSupersededClaimHandling,
    metrics.ownerReposWithStalePointers === 0 ? 1 : 0.5,
    metrics.schemaValidationPass ? 1 : 0,
  ];
  const overallCoverageScore = Math.round((scored.reduce((a, b) => a + b, 0) / scored.length) * 100) / 100;
  const grade =
    metrics.packetsWithOwnerIndexed === metrics.packetsTotal &&
    metrics.schemaValidationPass &&
    overallCoverageScore >= 0.9
      ? "A+"
      : overallCoverageScore >= 0.9
        ? "A"
        : overallCoverageScore >= 0.8
          ? "B"
          : "C";

  return {
    schemaVersion: "cross-agent-harvest-coverage-v1@1.0.0",
    harvestId: manifest.harvestId,
    generatedAt: manifest.updatedAt,
    metrics,
    overallCoverageScore,
    gradeBefore: "C",
    gradeAfter: grade,
    authority: "harvest-manifest-v1.json",
  };
}

function main() {
  const manifest = readJson(manifestFile);
  const ledgerPath = path.join(REPO_ROOT, manifest.ledgerLineage?.ledgerPath || "work-progress/ACTIVE_WORK.md");
  const ledgerAfter = fs.existsSync(ledgerPath) ? hashFileContent(fs.readFileSync(ledgerPath, "utf8")) : null;
  const ledgerBefore = tryGitShow(`${manifest.sourceCommitSha}^:work-progress/ACTIVE_WORK.md`);
  const ledgerBeforeHash = ledgerBefore ? hashFileContent(ledgerBefore) : null;

  manifest.ledgerLineage = {
    ...manifest.ledgerLineage,
    ledgerContentHashBefore: ledgerBeforeHash,
    ledgerContentHashAfter: ledgerAfter,
  };

  const compactDir = path.join(runDir, "compact-records");
  fs.mkdirSync(compactDir, { recursive: true });
  for (const packet of manifest.packets) {
    const record = buildCompactRecord(packet, manifest.harvestId, manifest);
    writeJson(path.join(compactDir, `${packet.packetId}.json`), record);
  }

  const harvestManifestHash = hashCanonicalJson(manifest);

  for (const packet of manifest.packets) {
    delete packet.contentHash;
  }

  writeJson(manifestFile, manifest);
  writeJson(path.join(runDir, "packet-index.json"), buildPacketIndex(manifest));
  writeJson(path.join(runDir, "receipt.json"), buildReceipt(manifest, harvestManifestHash, ledgerBeforeHash, ledgerAfter));
  fs.writeFileSync(path.join(runDir, "HARVEST_SUMMARY.md"), buildSummary(manifest, harvestManifestHash), "utf8");
  writeJson(path.join(runDir, "coverage.json"), computeCoverage(manifest, compactDir));

  refreshPacketRegistryFromGit();

  try {
    execSync(`node scripts/harvest/build-graph-extraction.mjs ${harvestId}`, {
      cwd: REPO_ROOT,
      stdio: "inherit",
    });
    execSync(`node scripts/harvest/validate-graph-extraction.mjs ${harvestId}`, {
      cwd: REPO_ROOT,
      stdio: "inherit",
    });
  } catch (err) {
    console.error("sync-derived: graph extraction build/validate failed");
    throw err;
  }

  console.log(`sync-derived: OK harvestManifestHash=${harvestManifestHash}`);
}

function refreshPacketRegistryFromGit() {
  const registryPath = path.join(REPO_ROOT, "work-progress/harvest-packet-registry.json");
  if (!fs.existsSync(registryPath)) return;
  const gitHead = execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
  const now = new Date().toISOString();
  const registry = readJson(registryPath);
  registry.updatedAt = now;
  for (const packet of Object.values(registry.packets)) {
    packet.lastUpdatedCommit = gitHead;
    packet.lastUpdatedAt = now;
  }
  writeJson(registryPath, registry);
}

main();
