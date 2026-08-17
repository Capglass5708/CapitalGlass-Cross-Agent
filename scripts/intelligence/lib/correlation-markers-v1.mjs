import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { hashCanonicalJson } from '../../harvest/lib/hash.mjs';
import { buildRelationshipId } from './ids.mjs';
import { DERIVATION_VERSION } from './constants.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const CONTRACT_DIR = path.join(__dirname, '../../../contracts/intelligence');
export const REGISTRY_DIR = path.join(CONTRACT_DIR, 'registries');

export const CORRELATION_MARKERS_SCHEMA = 'correlation-markers-v1@1.0.0';
export const REGISTRY_VERSION = 'correlation-registries-v1@1.0.0';
export const MARKER_BUDGET_MAX = 48;

const REGISTRY_FILES = {
  markerTypes: 'correlation-marker-types-v1.json',
  subjects: 'correlation-subjects-v1.json',
  mechanisms: 'correlation-mechanisms-v1.json',
  problems: 'correlation-problems-v1.json',
  effects: 'correlation-effects-v1.json',
  systems: 'correlation-systems-v1.json',
  relationshipTypes: 'correlation-relationship-types-v1.json',
  capabilitiesPointer: 'correlation-capabilities-pointer-v1.json',
};

function readRegistry(fileName) {
  return JSON.parse(fs.readFileSync(path.join(REGISTRY_DIR, fileName), 'utf8'));
}

export function resolveRegistryRoot(repoRoot = null) {
  if (repoRoot) {
    return path.join(repoRoot, 'contracts/intelligence/registries');
  }
  return REGISTRY_DIR;
}

export function loadCorrelationRegistries({ repoRoot = null, appBuilderRoot = null } = {}) {
  const registries = {};
  for (const [key, fileName] of Object.entries(REGISTRY_FILES)) {
    registries[key] = readRegistry(fileName);
  }

  let capabilityIds = [];
  if (appBuilderRoot) {
    const capabilityRegistryPath = path.join(
      appBuilderRoot,
      'scripts/sdlc-protocol-cursor/waverunner-capability-registry-v1.json',
    );
    if (fs.existsSync(capabilityRegistryPath)) {
      const capabilityRegistry = JSON.parse(fs.readFileSync(capabilityRegistryPath, 'utf8'));
      capabilityIds = (capabilityRegistry.capabilities ?? []).map((entry) => entry.id).filter(Boolean);
    }
  }

  return {
    registryVersion: REGISTRY_VERSION,
    markerBudgetMax: MARKER_BUDGET_MAX,
    markerTypes: new Set(registries.markerTypes.ids),
    subjects: new Set(registries.subjects.ids),
    mechanisms: new Set(registries.mechanisms.ids),
    problems: new Set(registries.problems.ids),
    effects: new Set(registries.effects.ids),
    systems: new Set(registries.systems.ids),
    relationshipTypes: new Set(registries.relationshipTypes.ids),
    capabilities: new Set(capabilityIds),
  };
}

export function markerKey(type, id) {
  return `${type}:${id}`;
}

export function computeMarkerSetHash(markers) {
  const normalized = [...markers]
    .map(({ type, id, source }) => ({ type, id, source }))
    .sort((a, b) => markerKey(a.type, a.id).localeCompare(markerKey(b.type, b.id)));
  return `sha256:${hashCanonicalJson(normalized)}`;
}

export function buildCorrelationId({ workPackageId, executionAnchor, producerRepo }) {
  const anchor = executionAnchor ?? workPackageId;
  const digest = hashCanonicalJson(`${workPackageId}|${anchor}|${producerRepo}`);
  return `corr:${digest.slice(0, 32)}`;
}

function registrySetForType(type, registries) {
  switch (type) {
    case 'repo':
      return null;
    case 'capability':
      return registries.capabilities;
    case 'subject':
      return registries.subjects;
    case 'mechanism':
      return registries.mechanisms;
    case 'problem':
      return registries.problems;
    case 'effect':
      return registries.effects;
    case 'system':
      return registries.systems;
    case 'mission':
    case 'program':
    case 'work-package':
    case 'failure':
    case 'artifact':
      return null;
    default:
      return undefined;
  }
}

export function validateMarkerEntry(marker, registries, { allowRepoIds = true } = {}) {
  const errors = [];
  if (!marker || typeof marker !== 'object') {
    return { ok: false, errors: ['marker must be an object'] };
  }
  const { type, id, source } = marker;
  if (!registries.markerTypes.has(type)) {
    errors.push(`unknown marker type: ${type}`);
  }
  if (!['AUTO', 'DECLARED'].includes(source)) {
    errors.push(`invalid marker source: ${source}`);
  }
  if (typeof id !== 'string' || id.length === 0) {
    errors.push('marker id required');
  }
  if (id.includes('#') || id.includes(' ')) {
    errors.push(`freeform marker rejected: ${type}:${id}`);
  }
  const allowed = registrySetForType(type, registries);
  if (allowed === undefined) {
    errors.push(`unknown marker type registry mapping: ${type}`);
  } else if (allowed !== null && !allowed.has(id)) {
    errors.push(`unregistered ${type} id: ${id}`);
  }
  if (type === 'repo' && allowRepoIds && (typeof id !== 'string' || id.length === 0)) {
    errors.push('repo id required');
  }
  return { ok: errors.length === 0, errors };
}

export function dedupeMarkers(markers) {
  const seen = new Set();
  const out = [];
  for (const marker of markers) {
    const key = markerKey(marker.type, marker.id);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(marker);
  }
  return out;
}

export function validateCorrelationBlock(block, registries) {
  const errors = [];
  if (!block || typeof block !== 'object') {
    return { ok: false, errors: ['correlation block missing'] };
  }
  if (block.schema !== CORRELATION_MARKERS_SCHEMA) {
    errors.push(`schema must be ${CORRELATION_MARKERS_SCHEMA}`);
  }
  if (block.registryVersion !== REGISTRY_VERSION) {
    errors.push(`registryVersion must be ${REGISTRY_VERSION}`);
  }
  if (!Array.isArray(block.markers) || block.markers.length === 0) {
    errors.push('markers array required');
  }
  if (block.markerCount !== block.markers?.length) {
    errors.push('markerCount must match markers.length');
  }
  if (block.markerBudget?.max !== MARKER_BUDGET_MAX) {
    errors.push(`markerBudget.max must be ${MARKER_BUDGET_MAX}`);
  }
  if (block.markers?.length > MARKER_BUDGET_MAX) {
    errors.push(`marker budget exceeded: ${block.markers.length} > ${MARKER_BUDGET_MAX}`);
  }
  const expectedHash = computeMarkerSetHash(block.markers ?? []);
  if (block.markerSetHash !== expectedHash) {
    errors.push(`markerSetHash mismatch: expected ${expectedHash}`);
  }
  for (const marker of block.markers ?? []) {
    const result = validateMarkerEntry(marker, registries);
    if (!result.ok) errors.push(...result.errors);
  }
  return { ok: errors.length === 0, errors };
}

export function buildAutoMarkers({ closeout, producerRepo, capabilityIds = [] }) {
  const markers = [];
  markers.push({ type: 'repo', id: producerRepo, source: 'AUTO' });
  markers.push({ type: 'work-package', id: closeout.workPackageId ?? closeout.workPackage ?? null, source: 'AUTO' });
  markers.push({ type: 'mission', id: closeout.workPackageId ?? closeout.workPackage ?? null, source: 'AUTO' });
  if (closeout.waveRunner?.programId) {
    markers.push({ type: 'program', id: closeout.waveRunner.programId, source: 'AUTO' });
  }
  for (const capabilityId of capabilityIds) {
    markers.push({ type: 'capability', id: capabilityId, source: 'AUTO' });
  }
  if (closeout.aiCacheHit === true) {
    markers.push({ type: 'capability', id: 'CACHE', source: 'AUTO' });
  }
  return dedupeMarkers(markers.filter((marker) => marker.id));
}

export function resolveAppBuilderRoot(explicitRoot = null) {
  if (explicitRoot) return explicitRoot;
  if (process.env.CG_APPBUILDER_MCP_ROOT) return process.env.CG_APPBUILDER_MCP_ROOT;
  const sibling = path.resolve(__dirname, '../../../../CG-AppBuilder-MCP');
  if (fs.existsSync(path.join(sibling, 'package.json'))) return sibling;
  return null;
}

export function buildCorrelationBlock({
  closeout,
  producerRepo,
  declaredMarkers = [],
  capabilityIds = [],
  appBuilderRoot = null,
  registries = null,
}) {
  const loadedRegistries =
    registries ?? loadCorrelationRegistries({ appBuilderRoot: resolveAppBuilderRoot(appBuilderRoot) });
  const autoMarkers = buildAutoMarkers({ closeout, producerRepo, capabilityIds });
  const merged = dedupeMarkers([...autoMarkers, ...declaredMarkers]);

  for (const marker of merged) {
    const result = validateMarkerEntry(marker, loadedRegistries);
    if (!result.ok) {
      const error = new Error(`Correlation marker validation failed: ${result.errors.join('; ')}`);
      error.code = 'CORRELATION_MARKER_INVALID';
      error.details = result.errors;
      throw error;
    }
  }

  if (merged.length > MARKER_BUDGET_MAX) {
    const error = new Error(`Correlation marker budget exceeded: ${merged.length} > ${MARKER_BUDGET_MAX}`);
    error.code = 'CORRELATION_MARKER_BUDGET_EXCEEDED';
    throw error;
  }

  const workPackageId = closeout.workPackageId ?? closeout.workPackage;
  const executionAnchor =
    closeout.waveRunner?.executionId ??
    closeout.startedAt ??
    closeout.windowStart ??
    workPackageId;

  const markers = merged;
  const block = {
    schema: CORRELATION_MARKERS_SCHEMA,
    registryVersion: REGISTRY_VERSION,
    correlationId: buildCorrelationId({ workPackageId, executionAnchor, producerRepo }),
    missionId: `mission:${workPackageId}`,
    programId: closeout.waveRunner?.programId ? `program:${closeout.waveRunner.programId}` : null,
    workPackageId: `wp:${workPackageId}`,
    markerSetHash: computeMarkerSetHash(markers),
    markerCount: markers.length,
    markerBudget: { max: MARKER_BUDGET_MAX },
    markers,
    artifacts: [],
    relatedObjects: [],
  };

  if (closeout.closeoutHash) {
    block.artifacts.push(`artifact:${closeout.closeoutHash}`);
  }

  return block;
}

export function projectCorrelationMarkersForEnvelope(correlationBlock) {
  if (!correlationBlock) return null;
  return {
    schema: CORRELATION_MARKERS_SCHEMA,
    registryVersion: correlationBlock.registryVersion,
    correlationId: correlationBlock.correlationId,
    markerSetHash: correlationBlock.markerSetHash,
    markerCount: correlationBlock.markerCount,
    markers: correlationBlock.markers.map(({ type, id }) => markerKey(type, id)),
  };
}

const MARKER_EDGE_MAP = {
  capability: 'USED_CAPABILITY',
  repo: 'TOUCHED_REPO',
  subject: 'ABOUT_SUBJECT',
  mechanism: 'USED_MECHANISM',
  problem: 'ADDRESSED_PROBLEM',
  effect: 'PRODUCED_EFFECT',
};

export function buildCorrelationRelationshipEdges({ ledger, correlationBlock, derivedObjects }) {
  if (!correlationBlock) return [];
  const edges = [];
  const correlationId = correlationBlock.correlationId;

  for (const object of derivedObjects) {
    for (const marker of correlationBlock.markers) {
      const relationship = MARKER_EDGE_MAP[marker.type];
      if (!relationship) continue;
      const markerNodeId = markerKey(marker.type, marker.id);
      edges.push({
        relationshipId: buildRelationshipId(object.identity.objectId, markerNodeId, relationship),
        from: object.identity.objectId,
        to: markerNodeId,
        relationship,
        derivationVersion: DERIVATION_VERSION,
      });
    }
    edges.push({
      relationshipId: buildRelationshipId(correlationId, object.identity.objectId, 'CHAINED_BY'),
      from: correlationId,
      to: object.identity.objectId,
      relationship: 'CHAINED_BY',
      derivationVersion: DERIVATION_VERSION,
    });
  }

  edges.push({
    relationshipId: buildRelationshipId(correlationId, ledger.ledgerId, 'CHAINED_BY'),
    from: correlationId,
    to: ledger.ledgerId,
    relationship: 'CHAINED_BY',
    derivationVersion: DERIVATION_VERSION,
  });

  return edges;
}
