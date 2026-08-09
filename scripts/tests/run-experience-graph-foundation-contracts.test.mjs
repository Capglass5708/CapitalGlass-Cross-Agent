#!/usr/bin/env node
/**
 * AJV validation for Experience Graph foundation contracts (EG-01 / B1).
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CONTRACT_DIR = path.join(REPO_ROOT, 'contracts/experience');

const SCHEMA_FILES = [
  'experience-observation-v1.schema.json',
  'experience-episode-v1.schema.json',
  'experience-pattern-v1.schema.json',
  'experience-relationship-v1.schema.json',
  'experience-economic-impact-v1.schema.json',
  'business-workflow-observation-v1.schema.json',
];

const FIXTURES = {
  'experience-observation-v1.schema.json': {
    schema: 'experience-observation-v1@1.0.0',
    observationId: 'xobs:test-001',
    sourceRefs: ['harvest:test/raw.json'],
    eventClass: 'BLOCKER_RESOLVED',
    measurementClass: 'DERIVED',
    provenance: { sourceLane: 'harvest', emitter: 'thread-autopsy' },
    context: { repo: 'CG-AppBuilder-MCP' },
    evidence: { summary: 'Test observation' },
    sourceRawRef: 'artifacts/agent-runs/test/raw.json',
    sourceExcerptHash: 'sha256:abc123',
    observedAt: '2026-08-09T12:00:00.000Z',
  },
  'experience-episode-v1.schema.json': {
    schema: 'experience-episode-v1@1.0.0',
    episodeId: 'episode:test-001',
    lifecycle: 'RESOLVED_OBSERVED',
    problem: 'MCP health receipt stale',
    actionsAttempted: [{ action: 'restart-mcp', result: 'FAILED' }],
    outcome: { status: 'RESOLVED', summary: 'Operator restarted Cursor MCP' },
    applicability: { repos: ['CG-AppBuilder-MCP'], workflows: ['mcp-health'] },
    rootCauseKey: 'mcp-runtime-stale',
    triggerFingerprint: 'mcp-health-receipt-age-gt-threshold',
    contextCompatibilityDigest: 'sha256:def456',
    sourceRawRef: 'artifacts/agent-runs/test/thread-autopsy-bundle.json',
    sourceExcerptHash: 'sha256:ghi789',
    observationRefs: ['xobs:test-001'],
  },
  'experience-pattern-v1.schema.json': {
    schema: 'experience-pattern-v1@1.0.0',
    patternId: 'pattern:test-001',
    patternKind: 'SUCCESS',
    lifecycleStatus: 'OBSERVED',
    summary: 'Restart MCP after stale receipt',
    sourceRawRef: 'artifacts/agent-runs/test/gold-mine.json',
    sourceExcerptHash: 'sha256:jkl012',
    episodeRefs: ['episode:test-001'],
  },
  'experience-relationship-v1.schema.json': {
    schema: 'experience-relationship-v1@1.0.0',
    relationshipId: 'rel:test-001',
    edgeKind: 'RESOLVED_BY',
    origin: 'DERIVED_DETERMINISTIC',
    fromRef: 'episode:test-001',
    toRef: 'xobs:test-001',
    causalityClass: 'CONTRIBUTING',
    evidenceRefs: ['artifacts/agent-runs/test/thread-autopsy-bundle.json'],
    sourceRawRef: 'artifacts/agent-runs/test/thread-autopsy-bundle.json',
    sourceExcerptHash: 'sha256:mno345',
  },
  'experience-economic-impact-v1.schema.json': {
    schema: 'experience-economic-impact-v1@1.0.0',
    impactId: 'impact:test-001',
    measurementClass: 'QUALITATIVE',
    valueRealizationState: 'POTENTIAL',
    valueConfidence: 'MEDIUM',
    valueEvidenceRefs: ['episode:test-001'],
    targetRef: 'episode:test-001',
    sourceRawRef: 'artifacts/agent-runs/test/gold-mine.json',
    sourceExcerptHash: 'sha256:pqr678',
  },
  'business-workflow-observation-v1.schema.json': {
    schema: 'business-workflow-observation-v1@1.0.0',
    observationId: 'obs:pg-field-001',
    eventType: 'field_manually_corrected',
    productKey: 'proposal-generator',
    workflowKey: 'report-parsing-population',
    referencePayload: { projectDocumentId: 'doc-123', fieldPath: 'scope.glassType' },
    correctionReasonCode: 'WRONG_VALUE',
    correctionProvenance: 'MACHINE_WRONG',
    observeOnly: true,
    idempotencyKey: 'obs:pg-field-001:2026-08-09',
    observedAt: '2026-08-09T12:00:00.000Z',
  },
};

function testSchemasCompile() {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  for (const file of SCHEMA_FILES) {
    const schema = JSON.parse(fs.readFileSync(path.join(CONTRACT_DIR, file), 'utf8'));
    const validate = ajv.compile(schema);
    assert.equal(typeof validate, 'function', `${file} should compile`);
  }
}

function testFixturesValidate() {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  for (const file of SCHEMA_FILES) {
    const schema = JSON.parse(fs.readFileSync(path.join(CONTRACT_DIR, file), 'utf8'));
    const validate = ajv.compile(schema);
    const fixture = FIXTURES[file];
    const ok = validate(fixture);
    assert.equal(ok, true, `${file} fixture: ${JSON.stringify(validate.errors)}`);
    assert.ok(fixture.sourceRawRef || fixture.referencePayload, `${file} preserves traceability`);
  }
}

function testAdapterDocExists() {
  const adapterPath = path.join(CONTRACT_DIR, 'experience-harvest-adapter-v1.md');
  assert.ok(fs.existsSync(adapterPath), 'experience-harvest-adapter-v1.md must exist');
  const text = fs.readFileSync(adapterPath, 'utf8');
  assert.match(text, /xobs:/);
  assert.match(text, /EXPERIENCE_SOURCE_ROUNDTRIP_PASS/);
  assert.match(text, /EXPERIENCE_NO_SUPPRESSION_PASS/);
}

function testIdentityNamespacesDistinct() {
  const obs = FIXTURES['business-workflow-observation-v1.schema.json'];
  const xobs = FIXTURES['experience-observation-v1.schema.json'];
  assert.match(obs.observationId, /^obs:/);
  assert.match(xobs.observationId, /^xobs:/);
  assert.notEqual(obs.observationId.split(':')[0], xobs.observationId.split(':')[0]);
}

const tests = [
  ['schemas compile', testSchemasCompile],
  ['fixtures validate', testFixturesValidate],
  ['adapter doc exists', testAdapterDocExists],
  ['identity namespaces distinct', testIdentityNamespacesDistinct],
];

let passed = 0;
for (const [name, fn] of tests) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}
console.log(`\n${passed}/${tests.length} experience graph foundation contract tests passed`);
