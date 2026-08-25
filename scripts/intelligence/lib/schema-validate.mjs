import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_DIR = path.join(__dirname, '../../../contracts/intelligence');

let ajvInstance;
const compiled = new Map();

function getAjv() {
  if (!ajvInstance) {
    ajvInstance = new Ajv({ allErrors: true, strict: false });
    addFormats(ajvInstance);
  }
  return ajvInstance;
}

function compileSchema(schemaFile) {
  if (compiled.has(schemaFile)) return compiled.get(schemaFile);
  const schema = JSON.parse(fs.readFileSync(path.join(CONTRACT_DIR, schemaFile), 'utf8'));
  const validate = getAjv().compile(schema);
  compiled.set(schemaFile, validate);
  return validate;
}

export function validateHandoffSchema(handoff) {
  const validate = compileSchema('intelligence-handoff-v1.schema.json');
  const ok = validate(handoff);
  return {
    ok,
    errors: ok ? [] : (validate.errors ?? []).map((err) => `${err.instancePath || '/'} ${err.message}`.trim()),
  };
}

export function validateEnvelopeSchema(envelope) {
  const validate = compileSchema('operational-intelligence-envelope-v1.schema.json');
  const ok = validate(envelope);
  return {
    ok,
    errors: ok ? [] : (validate.errors ?? []).map((err) => `${err.instancePath || '/'} ${err.message}`.trim()),
  };
}

export function validateCorrelationMarkersSchema(block) {
  const validate = compileSchema('correlation-markers-v1.schema.json');
  const ok = validate(block);
  return {
    ok,
    errors: ok ? [] : (validate.errors ?? []).map((err) => `${err.instancePath || '/'} ${err.message}`.trim()),
  };
}

export function assertNoProducerIntelligencePayload(handoff) {
  const forbidden = ['derivedObjects', 'ledger', 'relationships', 'hubPayload', 'envelopes'];
  const found = forbidden.filter((key) => handoff[key] !== undefined);
  return { ok: found.length === 0, forbiddenKeys: found };
}

let relationshipRegistryCache = null;
let correlationRelationshipRegistryCache = null;

function loadRelationshipRegistry() {
  if (!relationshipRegistryCache) {
    const registryPath = path.join(CONTRACT_DIR, 'registries/knowledge-relationship-types-v1.json');
    relationshipRegistryCache = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  }
  return relationshipRegistryCache;
}

// buildRelationshipEdges() also emits correlation-marker edges (USED_CAPABILITY,
// TOUCHED_REPO, etc. — see correlation-markers-v1.mjs's MARKER_EDGE_MAP), which
// belong to the separate, pre-existing correlation-relationship-types registry,
// not this one. Both are valid sources for an edge's `relationship` value.
function loadCorrelationRelationshipIds() {
  if (!correlationRelationshipRegistryCache) {
    const registryPath = path.join(CONTRACT_DIR, 'registries/correlation-relationship-types-v1.json');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    correlationRelationshipRegistryCache = new Set(registry.ids);
  }
  return correlationRelationshipRegistryCache;
}

export function validateRelationshipEdges(relationships) {
  const registry = loadRelationshipRegistry();
  const byId = new Map(registry.types.map((type) => [type.id, type]));
  const correlationIds = loadCorrelationRelationshipIds();
  const errors = [];
  for (const edge of relationships ?? []) {
    const label = edge.relationshipId ?? `${edge.from ?? '?'}->${edge.to ?? '?'}`;
    if (correlationIds.has(edge.relationship)) continue;
    const type = byId.get(edge.relationship);
    if (!type) {
      errors.push(`${label}: unregistered relationship type '${edge.relationship}'`);
      continue;
    }
    if (type.status !== 'ACTIVE') {
      errors.push(`${label}: relationship type '${edge.relationship}' is ${type.status}, not accepted for new edges`);
      continue;
    }
    if (type.confidenceField && (typeof edge.confidence !== 'number' || edge.confidence < 0 || edge.confidence > 1)) {
      errors.push(`${label}: relationship type '${edge.relationship}' requires a numeric confidence between 0 and 1`);
    }
  }
  return { ok: errors.length === 0, errors };
}
