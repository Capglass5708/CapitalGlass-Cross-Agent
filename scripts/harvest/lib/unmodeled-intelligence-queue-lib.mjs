import fs from "node:fs";
import path from "node:path";

import { hashCanonicalJson, sha256Hex } from "./hash.mjs";
import { REPO_ROOT } from "./paths.mjs";

export const UNMODELED_QUEUE_REL = "work-progress/unmodeled-intelligence-queue.json";
export const SCHEMA_EXPANSION_THRESHOLD = 3;

export function unmodeledQueuePath(repoRoot = REPO_ROOT) {
  return path.join(repoRoot, UNMODELED_QUEUE_REL);
}

export function emptyUnmodeledQueue() {
  return {
    schemaVersion: "unmodeled-intelligence-queue-v1",
    updatedAt: new Date().toISOString(),
    entries: [],
    schemaExpansionCandidates: [],
  };
}

export function loadUnmodeledQueue(repoRoot = REPO_ROOT) {
  const filePath = unmodeledQueuePath(repoRoot);
  if (!fs.existsSync(filePath)) return emptyUnmodeledQueue();
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function saveUnmodeledQueue(queue, repoRoot = REPO_ROOT) {
  const filePath = unmodeledQueuePath(repoRoot);
  queue.updatedAt = new Date().toISOString();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
}

/**
 * @param {object} queue
 * @param {object} item
 * @param {string} harvestId
 */
export function upsertUnmodeledEntry(queue, item, harvestId) {
  const queueId = `unmod:${sha256Hex(`${item.proposedType}:${item.rawRef}`).slice(0, 40)}`;
  let entry = queue.entries.find((e) => e.queueId === queueId);
  if (!entry) {
    entry = {
      queueId,
      proposedType: item.proposedType,
      sourceFinding: item.sourceFinding,
      rawRef: item.rawRef,
      sourceExcerptHash: item.sourceExcerptHash,
      inferredRelationships: item.inferredRelationships ?? [],
      confidence: item.confidence ?? "low",
      occurrenceCount: 0,
      firstSeenHarvestId: harvestId,
      lastSeenHarvestId: harvestId,
      status: "UNMODELED_INTELLIGENCE",
    };
    queue.entries.push(entry);
  }
  entry.occurrenceCount += 1;
  entry.lastSeenHarvestId = harvestId;
  entry.sourceFinding = item.sourceFinding;

  if (entry.occurrenceCount >= SCHEMA_EXPANSION_THRESHOLD) {
    const candidateId = `schema-candidate:${entry.proposedType}`;
    if (!queue.schemaExpansionCandidates.some((c) => c.candidateId === candidateId)) {
      queue.schemaExpansionCandidates.push({
        candidateId,
        proposedType: entry.proposedType,
        occurrenceCount: entry.occurrenceCount,
        firstSeenHarvestId: entry.firstSeenHarvestId,
        lastSeenHarvestId: entry.lastSeenHarvestId,
        status: "SCHEMA_EXPANSION_CANDIDATE",
        laneCExportRequired: true,
      });
    }
  }
  return entry;
}
