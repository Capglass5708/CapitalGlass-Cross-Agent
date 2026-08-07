/**
 * harvest-intelligence-index.json — append/merge authority (non-destructive).
 */
import fs from "node:fs";
import path from "node:path";

import { hashCanonicalJson, sha256Hex } from "./hash.mjs";
import { REPO_ROOT } from "./paths.mjs";

export const INTELLIGENCE_INDEX_SCHEMA = "harvest-intelligence-index-v1";
export const INTELLIGENCE_INDEX_REL = "work-progress/harvest-intelligence-index.json";

export function intelligenceIndexPath(repoRoot = REPO_ROOT) {
  return path.join(repoRoot, INTELLIGENCE_INDEX_REL);
}

export function emptyIntelligenceIndex() {
  return {
    schemaVersion: INTELLIGENCE_INDEX_SCHEMA,
    updatedAt: new Date().toISOString(),
    entities: [],
  };
}

export function loadIntelligenceIndex(repoRoot = REPO_ROOT) {
  const filePath = intelligenceIndexPath(repoRoot);
  if (!fs.existsSync(filePath)) {
    return emptyIntelligenceIndex();
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function saveIntelligenceIndex(index, repoRoot = REPO_ROOT) {
  const filePath = intelligenceIndexPath(repoRoot);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  index.updatedAt = new Date().toISOString();
  fs.writeFileSync(filePath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
}

/**
 * Stable entity id from concept key (packet id, digest ref, etc.)
 * @param {string} conceptKey
 */
export function entityIdFromConcept(conceptKey) {
  return `intel:${sha256Hex(`concept:${conceptKey}`).slice(0, 40)}`;
}

/**
 * @param {string} harvestId
 * @param {string} ordinalRef
 */
export function observationIdFrom(harvestId, ordinalRef) {
  return `obs:${sha256Hex(`${harvestId}:${ordinalRef}`).slice(0, 40)}`;
}

function entityMap(entities) {
  return new Map((entities || []).map((e) => [e.entityId, structuredClone(e)]));
}

function findEntityByConcept(entities, conceptKey) {
  return (entities || []).find((e) => e.identity?.conceptKey === conceptKey);
}

/**
 * Merge manifest packets into intelligence index as entities + observations.
 * @param {object} manifest
 * @param {{ repoRoot?: string, governedDeletionReason?: string|null }} [options]
 */
export function mergeManifestIntoIntelligenceIndex(manifest, options = {}) {
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  const harvestId = manifest.harvestId;
  const before = loadIntelligenceIndex(repoRoot);
  const entitiesBefore = before.entities?.length ?? 0;

  const receipt = {
    schemaVersion: "harvest-intelligence-merge-receipt-v1",
    harvestId,
    mergedAt: new Date().toISOString(),
    entitiesBefore,
    entitiesAfter: 0,
    newEntities: 0,
    enrichedEntities: 0,
    relationshipAdds: 0,
    supersededEntities: 0,
    preservedExtensions: 0,
    unmodeledAdded: 0,
    observationsAdded: 0,
    deletedEntities: 0,
    governedDeletionReason: options.governedDeletionReason ?? null,
  };

  const map = entityMap(before.entities);
  const entityList = [...map.values()];

  for (const packet of manifest.packets || []) {
    const conceptKey = packet.packetId;
    const entityId = entityIdFromConcept(conceptKey);
    const ordinalRef = packet.packetId;
    const observationId = observationIdFrom(harvestId, ordinalRef);
    const rawRef = `artifacts/agent-runs/${harvestId}/compact-records/${packet.packetId}.json`;
    const snapshot = {
      signalClass: packet.packetVerdict,
      lifecycleState: packet.state,
      implementationState: packet.state,
      effectiveness: packet.packetVerdict,
      evidenceStrength: packet.ownerIndexingStatus,
    };

    const observation = {
      observationId,
      harvestId,
      workPackageId: manifest.workPackageId ?? harvestId,
      observedAt: manifest.updatedAt ?? new Date().toISOString(),
      source: {
        lane: manifest.sourceLane ?? "CURSOR",
        rawRef,
        packetId: packet.packetId,
        ordinalRef,
      },
      provenance: {
        sourceCommitSha: manifest.sourceCommitSha ?? null,
        protocolVersion: manifest.protocolVersion ?? null,
        gitPublicationReceipt: null,
      },
      snapshot,
      sourceExcerptHash: hashCanonicalJson({ packetId: packet.packetId, harvestId }),
    };

    let entity = map.get(entityId) ?? findEntityByConcept(entityList, conceptKey);
    const isNew = !entity;

    if (!entity) {
      entity = {
        entityId,
        identity: {
          conceptKey,
          candidateDigestRef: packet.candidateDigestRef ?? null,
          packetId: packet.packetId,
        },
        firstSeenAt: observation.observedAt,
        lifecycleState: "active",
        supersededBy: null,
        core: {
          signalClass: packet.packetVerdict,
          summary: packet.nextAction ?? packet.packetId,
          evidenceRefs: packet.evidenceRefs ?? [],
        },
        dimensions: {
          ownerRepo: packet.ownerRepo,
          affectedRepos: packet.affectedRepos ?? [],
          lifecycleState: packet.state,
          implementationState: packet.state,
          effectiveness: packet.packetVerdict,
          ownerIndexingStatus: packet.ownerIndexingStatus,
          projectFile: packet.projectFile,
        },
        extensions: {},
        classification: "KNOWN_CORE",
        relationships: [],
        observations: [],
      };
      map.set(entityId, entity);
      receipt.newEntities += 1;
    } else {
      receipt.enrichedEntities += 1;
      if (packet.ownerRepo) entity.dimensions.ownerRepo = packet.ownerRepo;
      if (packet.state) entity.dimensions.lifecycleState = packet.state;
      if (packet.packetVerdict) {
        entity.core.signalClass = packet.packetVerdict;
        entity.dimensions.effectiveness = packet.packetVerdict;
      }
    }

    const obsExists = entity.observations.some((o) => o.observationId === observationId);
    if (!obsExists) {
      entity.observations.push(observation);
      receipt.observationsAdded += 1;
    }

    const relTarget = `harvest:${harvestId}`;
    if (!entity.relationships.some((r) => r.type === "observedIn" && r.target === relTarget)) {
      entity.relationships.push({ type: "observedIn", target: relTarget });
      receipt.relationshipAdds += 1;
    }
  }

  const afterEntities = [...map.values()];
  receipt.entitiesAfter = afterEntities.length;

  if (receipt.deletedEntities > 0 && !receipt.governedDeletionReason) {
    const err = new Error("BLOCKED_UNGOVERNED_ENTITY_DELETION");
    err.code = "BLOCKED_UNGOVERNED_ENTITY_DELETION";
    err.receipt = receipt;
    throw err;
  }

  const index = {
    schemaVersion: INTELLIGENCE_INDEX_SCHEMA,
    updatedAt: new Date().toISOString(),
    entities: afterEntities,
  };
  saveIntelligenceIndex(index, repoRoot);

  return { index, receipt };
}

export function writeMergeReceipt(receipt, harvestId, repoRoot = REPO_ROOT) {
  const runDir = path.join(repoRoot, "artifacts/agent-runs", harvestId);
  fs.mkdirSync(runDir, { recursive: true });
  const filePath = path.join(runDir, "intelligence-merge-receipt.json");
  fs.writeFileSync(filePath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  return filePath;
}
