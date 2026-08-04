import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { REPO_ROOT } from "./paths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_MAP_PATH = path.join(__dirname, "graph-repository-id-map.v1.json");

const PRODUCER_REPO = "repo:capitalglass-cross-agent";
const PRODUCER_CAPABILITY = "harvest-graph-extraction";
const SOURCE_AUTHORITY = "authority:cross-agent-harvest";

function readRepoMap() {
  return JSON.parse(fs.readFileSync(REPO_MAP_PATH, "utf8"));
}

function slugForEdge(value) {
  return String(value).replace(/:/g, "-").replace(/[^a-z0-9-._]/gi, "-").toLowerCase();
}

function harvestProvenance(manifest, evidenceAnchor, classification = "observed") {
  return {
    producerRepositoryId: PRODUCER_REPO,
    producerCapability: PRODUCER_CAPABILITY,
    sourceAuthority: SOURCE_AUTHORITY,
    classification,
    verificationState: "verified",
    recordedAt: manifest.updatedAt || new Date().toISOString(),
    evidenceAnchor,
    sourceAnchorDetail: {
      anchorType: "file-path",
      locator: evidenceAnchor,
    },
  };
}

function resolveRepositoryId(ownerRepo, repoMap) {
  return repoMap.ownerRepoToRepositoryId[ownerRepo] ?? null;
}

/**
 * Build a graph-extraction packet from a Cross-Agent harvest manifest.
 */
export function buildGraphExtractionFromManifest(manifest, options = {}) {
  const repoMap = options.repoMap ?? readRepoMap();
  const warnings = [];
  const nodes = [];
  const edges = [];
  const harvestId = manifest.harvestId;
  const manifestRel = `artifacts/agent-runs/${harvestId}/harvest-manifest-v1.json`;
  const harvestNodeId = `harvest:${harvestId}`;

  nodes.push({
    id: harvestNodeId,
    nodeType: "Harvest",
    displayName: harvestId,
    lifecycleState: "lifecycle:canonical",
    operationalState: manifest.overallHarvestVerdict,
    metadata: {
      missionClass: manifest.missionClass,
      sourceCommitSha: manifest.sourceCommitSha,
      retrievalResult: manifest.retrievalResult ?? null,
    },
    provenance: harvestProvenance(manifest, manifestRel),
  });

  const packetNodeIds = new Map();
  for (const packet of manifest.packets ?? []) {
    packetNodeIds.set(packet.packetId, `workpackage:${packet.packetId}`);
  }

  for (const packet of manifest.packets ?? []) {
    const packetNodeId = packetNodeIds.get(packet.packetId);
    const packetAnchor = `artifacts/agent-runs/${harvestId}/compact-records/${packet.packetId}.json`;

    nodes.push({
      id: packetNodeId,
      nodeType: "WorkPackage",
      displayName: packet.packetTitle || packet.packetId,
      lifecycleState: "lifecycle:proposed",
      operationalState: packet.state,
      metadata: {
        packetVerdict: packet.packetVerdict,
        ownerRepo: packet.ownerRepo,
        ownerIndexingStatus: packet.ownerIndexingStatus,
        projectFile: packet.projectFile,
        advancementGate: packet.advancementGate,
      },
      provenance: harvestProvenance(manifest, packetAnchor),
    });

    edges.push({
      id: `edge:${slugForEdge(harvestNodeId)}-contains-${slugForEdge(packetNodeId)}`,
      edgeType: "CONTAINS",
      sourceId: harvestNodeId,
      targetId: packetNodeId,
      provenance: harvestProvenance(manifest, manifestRel),
    });

    const ownerRepoId = resolveRepositoryId(packet.ownerRepo, repoMap);
    if (ownerRepoId) {
      edges.push({
        id: `edge:${slugForEdge(ownerRepoId)}-owns-${slugForEdge(packetNodeId)}`,
        edgeType: "OWNS",
        sourceId: ownerRepoId,
        targetId: packetNodeId,
        provenance: harvestProvenance(manifest, packetAnchor),
      });
    } else {
      warnings.push(`unmapped ownerRepo ${packet.ownerRepo} for packet ${packet.packetId}`);
    }

    for (const blocker of packet.blockers ?? []) {
      const blockerId = blocker.id || `blocker-${packet.packetId}`;
      const blockerNodeId = `entity:blocker-${slugForEdge(blockerId)}`;
      if (!nodes.some((n) => n.id === blockerNodeId)) {
        nodes.push({
          id: blockerNodeId,
          nodeType: "Entity",
          displayName: blocker.summary || blockerId,
          metadata: {
            entityKind: "harvest-blocker",
            blockerOwner: blocker.owner ?? null,
          },
          provenance: harvestProvenance(manifest, packetAnchor, "derived"),
        });
      }
      edges.push({
        id: `edge:${slugForEdge(packetNodeId)}-blocked-by-${slugForEdge(blockerNodeId)}`,
        edgeType: "BLOCKED_BY",
        sourceId: packetNodeId,
        targetId: blockerNodeId,
        provenance: harvestProvenance(manifest, packetAnchor, "derived"),
      });
    }

    for (const relatedId of packet.relatedPackets ?? []) {
      if (!packetNodeIds.has(relatedId)) {
        warnings.push(`skipped RELATED_TO ${packet.packetId} -> ${relatedId} (target not in manifest)`);
        continue;
      }
      const relatedNodeId = packetNodeIds.get(relatedId);
      edges.push({
        id: `edge:${slugForEdge(packetNodeId)}-related-to-${slugForEdge(relatedNodeId)}`,
        edgeType: "RELATED_TO",
        sourceId: packetNodeId,
        targetId: relatedNodeId,
        provenance: harvestProvenance(manifest, packetAnchor, "derived"),
      });
    }
  }

  const extractionSlug = harvestId.replace(/^harvest-/, "harvest-");
  const extraction = {
    packetKind: "graph-extraction",
    schemaVersion: "cg-master-graph-extraction-v1",
    extractionId: `extraction:${extractionSlug}`,
    harvestId,
    workPackageId: harvestId,
    producer: {
      repositoryId: PRODUCER_REPO,
      capability: PRODUCER_CAPABILITY,
      version: "0.1.0",
    },
    nodes,
    edges,
    warnings,
    provenance: harvestProvenance(manifest, manifestRel),
  };

  return extraction;
}

export function writeGraphExtraction(runDir, manifest, options = {}) {
  const extraction = buildGraphExtractionFromManifest(manifest, options);
  const outPath = path.join(runDir, "graph-extraction.json");
  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(extraction, null, 2)}\n`, "utf8");
  return { extraction, outPath };
}
