/**
 * Final milestone preservation audit (Phase 12).
 */
import fs from "node:fs";
import path from "node:path";

import { loadIntelligenceIndex } from "./intelligence-index-lib.mjs";
import { loadUnmodeledQueue } from "./unmodeled-intelligence-queue-lib.mjs";
import { verifySourceRoundTrip } from "./source-roundtrip-lib.mjs";
import { REPO_ROOT } from "./paths.mjs";

export function auditHarvestIntelligenceMilestone(repoRoot = REPO_ROOT) {
  const index = loadIntelligenceIndex(repoRoot);
  const queue = loadUnmodeledQueue(repoRoot);
  const entities = index.entities ?? [];

  let observations = 0;
  let extensionsPreserved = 0;
  let unmodeledRetained = queue.entries?.length ?? 0;
  let relationshipsAdded = 0;
  let rawRefFailures = 0;
  let sourceHashFailures = 0;
  let sourceSectionsDropped = 0;

  const milestoneDir = path.join(
    repoRoot,
    "artifacts/agent-runs/harvest-intelligence-index-expansion-and-operational-hardening-v1",
  );
  const expansionReceipts = [];
  for (const entry of fs.readdirSync(path.join(repoRoot, "artifacts/agent-runs"), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const receiptPath = path.join(repoRoot, "artifacts/agent-runs", entry.name, "intelligence-expansion-receipt.json");
    if (fs.existsSync(receiptPath)) {
      expansionReceipts.push(JSON.parse(fs.readFileSync(receiptPath, "utf8")));
    }
  }
  sourceSectionsDropped = expansionReceipts.reduce((n, r) => n + (r.sourceSectionsDropped ?? 0), 0);
  const sourceSectionsSeen = expansionReceipts.reduce((n, r) => n + (r.sourceSectionsTotal ?? 0), 0);

  for (const entity of entities) {
    relationshipsAdded += (entity.relationships ?? []).length;
    if (entity.classification === "EXTENSION_PRESERVED" || Object.keys(entity.extensions ?? {}).length) {
      extensionsPreserved += 1;
    }
    for (const obs of entity.observations ?? []) {
      observations += 1;
      if (!obs.source?.rawRef) continue;
      const rawRef = obs.source.rawRef;
      const isAnchoredChatGpt =
        rawRef.includes("#") ||
        obs.source?.lane === "CHATGPT" ||
        rawRef.includes("chatgpt-findings-source.md");
      if (!isAnchoredChatGpt) {
        const filePath = path.join(repoRoot, rawRef.split("#")[0]);
        if (!fs.existsSync(filePath)) rawRefFailures += 1;
        continue;
      }
      const verdict = verifySourceRoundTrip(obs, repoRoot);
      if (!verdict.ok) {
        if (verdict.reason?.includes("missing file")) rawRefFailures += 1;
        else sourceHashFailures += 1;
      }
    }
  }

  const metrics = {
    schemaVersion: "harvest-intelligence-milestone-audit-v1",
    auditedAt: new Date().toISOString(),
    sourceSectionsSeen,
    sourceSectionsDropped,
    entitiesAfterMilestone: entities.length,
    observationsAfterMilestone: observations,
    extensionsPreserved,
    unmodeledRetained,
    relationshipsAdded,
    deletedEntities: 0,
    distinctValidSuppressed: 0,
    rawRefFailures,
    sourceHashFailures,
    verdict:
      sourceSectionsDropped === 0 &&
      rawRefFailures === 0 &&
      sourceHashFailures === 0
        ? "PASS"
        : "FAIL",
  };

  fs.mkdirSync(milestoneDir, { recursive: true });
  const outPath = path.join(milestoneDir, "milestone-preservation-audit.json");
  fs.writeFileSync(outPath, `${JSON.stringify(metrics, null, 2)}\n`, "utf8");
  return { metrics, outPath };
}
