/**
 * P2 retrieval layer — Hub slice, ranked views, corpus coverage (derived, non-destructive).
 */
import fs from "node:fs";
import path from "node:path";

import { hashCanonicalJson } from "./hash.mjs";
import {
  INTELLIGENCE_INDEX_REL,
  loadIntelligenceIndex,
} from "./intelligence-index-lib.mjs";
import { loadUnmodeledQueue } from "./unmodeled-intelligence-queue-lib.mjs";
import { REPO_ROOT } from "./paths.mjs";

export const HUB_SLICE_REL = "work-progress/intelligence-hub-slices/harvest-intelligence.json";
export const VIEWS_DIR_REL = "work-progress/harvest-intelligence-views";
export const COVERAGE_REL = "work-progress/harvest-intelligence-coverage.json";

const PRODUCT_DOMAINS = [
  { key: "computerEstimator", labels: ["computer estimator", "opening detection", "estimating"] },
  { key: "humanEstimator", labels: ["human estimator", "estimator review"] },
  { key: "documentCenter", labels: ["document center", "document layer", "document-center"] },
  { key: "planSetProcessing", labels: ["plan set", "plan-set", "takeoff"] },
  { key: "ocrParser", labels: ["ocr", "parser", "extraction"] },
  { key: "revuBluebeam", labels: ["revu", "bluebeam"] },
  { key: "bidComposer", labels: ["bid composer", "bid-composer"] },
  { key: "proposals", labels: ["proposal", "proposal generator"] },
  { key: "vae", labels: ["visual asset", "vae"] },
  { key: "scraper", labels: ["scraper", "research"] },
  { key: "crossAppHandoffs", labels: ["cross-app", "handoff", "suite wiring"] },
  { key: "operatorReentry", labels: ["operator re-entry", "operator friction", "manual intervention"] },
];

function latestObservation(entity) {
  const obs = [...(entity.observations ?? [])].sort((a, b) =>
    String(b.observedAt ?? "").localeCompare(String(a.observedAt ?? "")),
  );
  return obs[0] ?? null;
}

function entityClassification(entity) {
  if (entity.classification) return entity.classification;
  const dim = entity.dimensions?.sectionType;
  if (dim === "UNKNOWN" || dim === "EXTENSION") return "EXTENSION_PRESERVED";
  return "KNOWN_CORE";
}

function matchesDomain(entity, labels) {
  const hay = JSON.stringify({
    core: entity.core,
    dimensions: entity.dimensions,
    observations: (entity.observations ?? []).map((o) => o.snapshot),
  }).toLowerCase();
  return labels.some((l) => hay.includes(l.toLowerCase()));
}

/**
 * @param {object} [options]
 */
export function buildHarvestIntelligenceHubSlice(options = {}) {
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  const index = options.index ?? loadIntelligenceIndex(repoRoot);
  const queue = options.queue ?? loadUnmodeledQueue(repoRoot);

  const rows = [];
  for (const entity of index.entities ?? []) {
    const latest = latestObservation(entity);
    rows.push({
      entityId: entity.entityId,
      conceptKey: entity.identity?.conceptKey ?? null,
      classification: entityClassification(entity),
      signalClass: entity.core?.signalClass ?? latest?.snapshot?.signalClass ?? null,
      lifecycleState: entity.lifecycleState ?? latest?.snapshot?.lifecycleState ?? null,
      implementationState: entity.dimensions?.implementationState ?? latest?.snapshot?.implementationState ?? null,
      effectiveness: entity.dimensions?.effectiveness ?? latest?.snapshot?.effectiveness ?? null,
      ownerRepo: entity.dimensions?.ownerRepo ?? null,
      application: entity.dimensions?.application ?? null,
      workflow: entity.dimensions?.workflow ?? null,
      rootCauseKey: entity.dimensions?.rootCauseKey ?? null,
      candidateDigestRef: entity.identity?.candidateDigestRef ?? null,
      observabilityGap: entity.dimensions?.observabilityGap ?? null,
      successPattern: entity.dimensions?.successPattern ?? null,
      underObservedDomain: entity.dimensions?.underObservedDomain ?? null,
      harvestId: latest?.harvestId ?? null,
      workPackageId: latest?.workPackageId ?? null,
      latestObservationId: latest?.observationId ?? null,
      latestObservedAt: latest?.observedAt ?? null,
      rawRef: latest?.source?.rawRef ?? null,
      sourceExcerptHash: latest?.sourceExcerptHash ?? latest?.provenance?.sourceExcerptHash ?? null,
      observationCount: (entity.observations ?? []).length,
      entityAuthorityRef: `${INTELLIGENCE_INDEX_REL}#${entity.entityId}`,
      retrievalClass: "INDEXED_ENTITY_POINTER",
    });
  }

  for (const entry of queue.entries ?? []) {
    rows.push({
      entityId: null,
      queueId: entry.queueId,
      conceptKey: entry.proposedType,
      classification: "UNMODELED_INTELLIGENCE",
      signalClass: "BUSINESS_WORKFLOW_SIGNAL",
      lifecycleState: entry.status,
      rawRef: entry.rawRef,
      sourceExcerptHash: entry.sourceExcerptHash,
      occurrenceCount: entry.occurrenceCount,
      entityAuthorityRef: `work-progress/unmodeled-intelligence-queue.json#${entry.queueId}`,
      retrievalClass: "UNMODELED_QUEUE_POINTER",
    });
  }

  return {
    schemaVersion: "intelligence-hub-harvest-intelligence-slice-v1@1.0.0",
    generatedAt: new Date().toISOString(),
    sourceAuthority: INTELLIGENCE_INDEX_REL,
    derivedView: true,
    machineAuthority: false,
    entityCount: (index.entities ?? []).length,
    unmodeledQueueCount: (queue.entries ?? []).length,
    rowCount: rows.length,
    rows,
    contentHash: hashCanonicalJson(rows),
  };
}

function rankEntities(entities, predicate, limit = 25) {
  return entities
    .filter(predicate)
    .map((entity) => ({
      sourceEntityId: entity.entityId,
      conceptKey: entity.identity?.conceptKey ?? null,
      signalClass: entity.core?.signalClass ?? null,
      summary: entity.core?.summary ?? null,
      observationCount: (entity.observations ?? []).length,
      latestObservedAt: latestObservation(entity)?.observedAt ?? null,
      rawRef: latestObservation(entity)?.source?.rawRef ?? null,
      classification: entityClassification(entity),
    }))
    .sort((a, b) => (b.observationCount - a.observationCount) || String(b.latestObservedAt).localeCompare(String(a.latestObservedAt)))
    .slice(0, limit);
}

/**
 * @param {object} [options]
 */
export function buildHarvestIntelligenceRankedViews(options = {}) {
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  const index = options.index ?? loadIntelligenceIndex(repoRoot);
  const entities = index.entities ?? [];

  const bySignal = (re) => (e) => re.test(String(e.core?.signalClass ?? e.dimensions?.signalClass ?? ""));

  const views = {
    "top-roi": rankEntities(entities, (e) => /ROI|ADOPTION|SUCCE/i.test(JSON.stringify(e))),
    "top-operator-friction": rankEntities(entities, bySignal(/OPERATOR_FRICTION|FRICTION/i)),
    "top-agent-friction": rankEntities(entities, bySignal(/AGENT_FRICTION/i)),
    "top-observability-gaps": rankEntities(entities, bySignal(/OBSERVABILITY/i)),
    "top-product-opportunities": rankEntities(entities, (e) => /product|workflow|estimat|document/i.test(JSON.stringify(e))),
    "highest-recurrence": rankEntities(entities, (e) => (e.observations?.length ?? 0) > 1),
    "recent-resolutions": rankEntities(entities, bySignal(/RESOLUTION|VERIFIED|RESOLVED/i)),
    "under-observed-products": rankEntities(entities, (e) => /under.?observ|NOT_OBSERVED/i.test(JSON.stringify(e))),
  };

  return {
    schemaVersion: "harvest-intelligence-ranked-views-v1@1.0.0",
    generatedAt: new Date().toISOString(),
    sourceAuthority: INTELLIGENCE_INDEX_REL,
    derivedView: true,
    machineAuthority: false,
    entityCountBefore: entities.length,
    views,
    viewCounts: Object.fromEntries(Object.entries(views).map(([k, v]) => [k, v.length])),
    entityCountAfter: entities.length,
    entitiesDeleted: 0,
  };
}

/**
 * @param {object} [options]
 */
export function buildHarvestIntelligenceCoverage(options = {}) {
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  const index = options.index ?? loadIntelligenceIndex(repoRoot);
  const entities = index.entities ?? [];

  /** @type {Record<string, object>} */
  const domains = {};
  for (const { key, labels } of PRODUCT_DOMAINS) {
    const matched = entities.filter((e) => matchesDomain(e, labels));
    const observations = matched.flatMap((e) => e.observations ?? []);
    const problemSignals = matched.filter((e) => /PROBLEM|FRICTION|BLOCK/i.test(String(e.core?.signalClass))).length;
    const resolutionSignals = matched.filter((e) => /RESOLUTION|VERIFIED/i.test(String(e.core?.signalClass))).length;
    const successPatterns = matched.filter((e) => /SUCCESS|PATTERN/i.test(String(e.core?.signalClass))).length;
    const observabilityGaps = matched.filter((e) => /OBSERVABILITY/i.test(String(e.core?.signalClass))).length;
    const operatorFriction = matched.filter((e) => /OPERATOR_FRICTION/i.test(String(e.core?.signalClass))).length;
    const businessWorkflow = matched.filter((e) => /BUSINESS_WORKFLOW/i.test(String(e.core?.signalClass))).length;

    let coverageState = "NOT_OBSERVED";
    if (matched.length > 0 && observations.length >= 3) coverageState = "OBSERVED";
    else if (matched.length > 0) coverageState = "UNDER_OBSERVED";

    domains[key] = {
      entityCount: matched.length,
      observationCount: observations.length,
      latestObservation: observations.sort((a, b) => String(b.observedAt).localeCompare(String(a.observedAt)))[0]?.observedAt ?? null,
      problemSignals,
      resolutionSignals,
      successPatterns,
      observabilityGaps,
      operatorFrictionSignals: operatorFriction,
      businessWorkflowSignals: businessWorkflow,
      coverageState,
    };
  }

  return {
    schemaVersion: "harvest-intelligence-coverage-v1@1.0.0",
    generatedAt: new Date().toISOString(),
    sourceAuthority: INTELLIGENCE_INDEX_REL,
    domains,
    totals: {
      entityCount: entities.length,
      observationCount: entities.reduce((n, e) => n + (e.observations?.length ?? 0), 0),
    },
  };
}

export function writeHarvestIntelligenceRetrievalArtifacts(repoRoot = REPO_ROOT) {
  const indexBefore = loadIntelligenceIndex(repoRoot);
  const entityCountBefore = indexBefore.entities?.length ?? 0;

  const slice = buildHarvestIntelligenceHubSlice({ repoRoot, index: indexBefore });
  const views = buildHarvestIntelligenceRankedViews({ repoRoot, index: indexBefore });
  const coverage = buildHarvestIntelligenceCoverage({ repoRoot, index: indexBefore });

  const slicePath = path.join(repoRoot, HUB_SLICE_REL);
  const viewsDir = path.join(repoRoot, VIEWS_DIR_REL);
  const coveragePath = path.join(repoRoot, COVERAGE_REL);

  fs.mkdirSync(path.dirname(slicePath), { recursive: true });
  fs.mkdirSync(viewsDir, { recursive: true });

  fs.writeFileSync(slicePath, `${JSON.stringify(slice, null, 2)}\n`, "utf8");
  fs.writeFileSync(coveragePath, `${JSON.stringify(coverage, null, 2)}\n`, "utf8");

  for (const [name, rows] of Object.entries(views.views)) {
    fs.writeFileSync(
      path.join(viewsDir, `${name}.json`),
      `${JSON.stringify({ schemaVersion: "harvest-intelligence-ranked-view-v1", viewName: name, derivedView: true, rows }, null, 2)}\n`,
      "utf8",
    );
  }

  const indexAfter = loadIntelligenceIndex(repoRoot);
  const entityCountAfter = indexAfter.entities?.length ?? 0;

  return {
    slicePath,
    coveragePath,
    viewsDir,
    entityCountBefore,
    entityCountAfter,
    entitiesDeleted: entityCountBefore - entityCountAfter,
    slice,
    views,
    coverage,
  };
}
