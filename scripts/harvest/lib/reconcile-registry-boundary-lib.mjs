/**
 * Registry → boundary reconciliation (registry is authority).
 */
import fs from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "./paths.mjs";

const REGISTRY_REL = "work-progress/harvest-packet-registry.json";
const BOUNDARY_REL = "work-progress/owner-repo-boundary-index.json";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

/**
 * @param {{ repoRoot?: string, latestHarvestId?: string|null }} [options]
 */
export function reconcileRegistryBoundary(options = {}) {
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  const registryPath = path.join(repoRoot, REGISTRY_REL);
  const boundaryPath = path.join(repoRoot, BOUNDARY_REL);

  if (!fs.existsSync(registryPath)) {
    const err = new Error("BLOCKED_MISSING_REGISTRY");
    err.code = "BLOCKED_MISSING_REGISTRY";
    throw err;
  }

  const registry = readJson(registryPath);
  const boundaryBefore = fs.existsSync(boundaryPath)
    ? readJson(boundaryPath)
    : { schemaVersion: "cross-agent-owner-repo-boundary-index-v1@1.0.0", packets: [] };

  const boundaryBeforeIds = (boundaryBefore.packets || []).map((p) => p.packetId).sort();
  const registryEntries = Object.values(registry.packets || {}).sort((a, b) =>
    a.packetId.localeCompare(b.packetId),
  );
  const registryIds = registryEntries.map((p) => p.packetId);

  const boundaryById = Object.fromEntries((boundaryBefore.packets || []).map((p) => [p.packetId, p]));
  const nextPackets = [];
  let rowsAdded = 0;
  let rowsUpdated = 0;

  for (const reg of registryEntries) {
    const existing = boundaryById[reg.packetId];
    if (!existing) {
      rowsAdded += 1;
      nextPackets.push({
        packetId: reg.packetId,
        ownerRepo: reg.latestOwnerRepo ?? reg.ownerRepo ?? "unknown",
        ownerMcp: reg.ownerMcp ?? null,
        ownerIndexingStatus: reg.ownerIndexingStatus ?? "missing",
        requiredOwnerArtifact: reg.requiredOwnerArtifact ?? null,
        crossAgentRole: reg.crossAgentRole ?? null,
        ownerRepoRole: reg.ownerRepoRole ?? null,
        currentGap: reg.currentGap ?? null,
      });
    } else {
      const updated = { ...existing };
      let changed = false;
      const ownerRepo = reg.latestOwnerRepo ?? reg.ownerRepo;
      if (ownerRepo && updated.ownerRepo !== ownerRepo) {
        updated.ownerRepo = ownerRepo;
        changed = true;
      }
      if (reg.ownerIndexingStatus && updated.ownerIndexingStatus !== reg.ownerIndexingStatus) {
        updated.ownerIndexingStatus = reg.ownerIndexingStatus;
        changed = true;
      }
      if (changed) rowsUpdated += 1;
      nextPackets.push(updated);
    }
  }

  const boundaryAfterIds = nextPackets.map((p) => p.packetId).sort();
  const orphansRemoved = boundaryBeforeIds.filter((id) => !registryIds.includes(id)).length;

  const boundaryAfter = {
    ...boundaryBefore,
    updatedAt: new Date().toISOString(),
    latestHarvestId: options.latestHarvestId ?? boundaryBefore.latestHarvestId ?? null,
    packets: nextPackets,
  };

  writeJson(boundaryPath, boundaryAfter);

  const receipt = {
    schemaVersion: "harvest-registry-boundary-reconcile-receipt-v1",
    reconciledAt: new Date().toISOString(),
    registryCount: registryIds.length,
    boundaryBefore: boundaryBeforeIds.length,
    boundaryAfter: boundaryAfterIds.length,
    orphansRemoved,
    rowsAdded,
    rowsUpdated,
    packetIdsMatch: JSON.stringify(registryIds) === JSON.stringify(boundaryAfterIds),
  };

  return receipt;
}
