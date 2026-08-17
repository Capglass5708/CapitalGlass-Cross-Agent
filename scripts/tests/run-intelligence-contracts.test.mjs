#!/usr/bin/env node
/**
 * OP-00A intelligence contracts — handoff + envelope schemas, fixtures, ownership invariants.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CONTRACT_DIR = path.join(REPO_ROOT, 'contracts/intelligence');
const FIXTURE_DIR = path.join(CONTRACT_DIR, 'fixtures');

const HANDOFF_SCHEMA = 'intelligence-handoff-v1.schema.json';
const ENVELOPE_SCHEMA = 'operational-intelligence-envelope-v1.schema.json';

const ENVELOPE_FIXTURES = [
  'envelope-missed-reuse-real-v1.json',
  'envelope-expired-v1.json',
  'envelope-superseded-v1.json',
  'envelope-contradict-reject-v1.json',
  'envelope-unknown-future-kind-v1.json',
  'envelope-reconstructable-graph-v1.json',
];

const MEASUREMENT_QUALITIES = [
  'DIRECT_MEASURED',
  'PAIRED_MEASURED',
  'PROVIDER_VERIFIED',
  'CACHE_VERIFIED',
  'ESTIMATED',
  'INFERRED',
  'SYNTHETIC',
];

const EVIDENCE_REALITIES = ['REAL', 'FIXTURE', 'SYNTHETIC'];

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function compileValidators() {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const handoffSchema = loadJson(path.join(CONTRACT_DIR, HANDOFF_SCHEMA));
  const envelopeSchema = loadJson(path.join(CONTRACT_DIR, ENVELOPE_SCHEMA));
  return {
    validateHandoff: ajv.compile(handoffSchema),
    validateEnvelope: ajv.compile(envelopeSchema),
  };
}

function assertValid(validate, doc, label) {
  const ok = validate(doc);
  assert.equal(ok, true, `${label}: ${JSON.stringify(validate.errors)}`);
}

function assertInvalid(validate, doc, label) {
  const ok = validate(doc);
  assert.equal(ok, false, `${label} should fail validation`);
}

function testSchemasCompile() {
  const { validateHandoff, validateEnvelope } = compileValidators();
  assert.equal(typeof validateHandoff, 'function');
  assert.equal(typeof validateEnvelope, 'function');
}

function testHandoffFixtureValid() {
  const { validateHandoff } = compileValidators();
  const handoff = loadJson(path.join(FIXTURE_DIR, 'handoff-valid-v1.json'));
  assertValid(validateHandoff, handoff, 'handoff-valid-v1');
  assert.equal(handoff.closeoutHash, handoff.source.closeoutHash);
  assert.equal(handoff.producer.role, 'EVIDENCE_PRODUCER');
  assert.equal(handoff.consumer.role, 'INTELLIGENCE_PROCESSOR');
}

function testHandoffRejectsDerivedPayloadFromProducer() {
  const { validateHandoff } = compileValidators();
  const handoff = loadJson(path.join(FIXTURE_DIR, 'handoff-valid-v1.json'));
  assertInvalid(
    validateHandoff,
    {
      ...handoff,
      derivedObjects: [{ objectId: 'oi:illegal-from-producer' }],
    },
    'handoff with derivedObjects',
  );
}

function testEnvelopeFixturesValid() {
  const { validateEnvelope } = compileValidators();
  for (const file of ENVELOPE_FIXTURES) {
    const envelope = loadJson(path.join(FIXTURE_DIR, file));
    assertValid(validateEnvelope, envelope, file);
    assert.equal(envelope.authority.authorityClass, 'DERIVED_INTELLIGENCE');
    assert.equal(envelope.authority.progressionAuthority, false);
    assert.match(envelope.identity.objectId, /^oi:/);
  }
}

function testEnvelopeLifecycleFixtures() {
  const expired = loadJson(path.join(FIXTURE_DIR, 'envelope-expired-v1.json'));
  const superseded = loadJson(path.join(FIXTURE_DIR, 'envelope-superseded-v1.json'));
  assert.equal(expired.lifecycle.lifecycleStage, 'EXPIRED');
  assert.ok(expired.temporal.validThrough);
  assert.equal(superseded.lifecycle.lifecycleStage, 'SUPERSEDED');
  assert.ok(superseded.lifecycle.supersedes.length > 0);
}

function testEnvelopeNegativeEvidencePreserved() {
  const envelope = loadJson(path.join(FIXTURE_DIR, 'envelope-contradict-reject-v1.json'));
  assert.ok(envelope.evidenceState.contradictingEvidenceRefs.length > 0);
  assert.ok(envelope.evidenceState.rejectedEvidenceRefs.length > 0);
}

function testUnknownFutureKindAllowed() {
  const envelope = loadJson(path.join(FIXTURE_DIR, 'envelope-unknown-future-kind-v1.json'));
  assert.equal(envelope.identity.kind, 'PRODUCT_OPPORTUNITY');
  assert.ok(envelope.extensions.schemaSupportsFutureConceptClassesWithoutMigration);
}

function testReconstructableDerivationGraph() {
  const envelope = loadJson(path.join(FIXTURE_DIR, 'envelope-reconstructable-graph-v1.json'));
  assert.equal(envelope.identity.kind, 'EMERGENT_CONCEPT_CANDIDATE');
  assert.ok(envelope.derivation.derivedFrom.length >= 3);
  assert.ok(envelope.extensions.derivationCanBeReconstructed);
}

function testMeasurementQualityEvidenceRealityMatrix() {
  const { validateEnvelope } = compileValidators();
  const base = loadJson(path.join(FIXTURE_DIR, 'envelope-missed-reuse-real-v1.json'));
  let caseIndex = 0;
  for (const measurementQuality of MEASUREMENT_QUALITIES) {
    for (const evidenceReality of EVIDENCE_REALITIES) {
      caseIndex += 1;
      const doc = structuredClone(base);
      doc.identity.objectId = `oi:matrix:${caseIndex}`;
      doc.identity.contentHash = `sha256:${String(caseIndex).padStart(64, '0')}`;
      doc.measurement.measurementQuality = measurementQuality;
      doc.evidenceReality = evidenceReality;
      assertValid(
        validateEnvelope,
        doc,
        `matrix ${measurementQuality} x ${evidenceReality}`,
      );
    }
  }
  assert.equal(caseIndex, MEASUREMENT_QUALITIES.length * EVIDENCE_REALITIES.length);
}

function testEnvelopeRejectsHubProgressionAuthority() {
  const { validateEnvelope } = compileValidators();
  const base = loadJson(path.join(FIXTURE_DIR, 'envelope-missed-reuse-real-v1.json'));
  assertInvalid(
    validateEnvelope,
    {
      ...base,
      authority: {
        ...base.authority,
        progressionAuthority: true,
      },
    },
    'progressionAuthority true',
  );
}

function testEnvelopeRejectsHarvestAuthorityClass() {
  const { validateEnvelope } = compileValidators();
  const base = loadJson(path.join(FIXTURE_DIR, 'envelope-missed-reuse-real-v1.json'));
  assertInvalid(
    validateEnvelope,
    {
      ...base,
      authority: {
        ...base.authority,
        authorityClass: 'HARVEST_AUTHORITY',
      },
    },
    'HARVEST_AUTHORITY class',
  );
}

function testOwnershipDocLocked() {
  const ownershipPath = path.join(CONTRACT_DIR, 'OWNERSHIP.md');
  assert.ok(fs.existsSync(ownershipPath));
  const text = fs.readFileSync(ownershipPath, 'utf8');
  assert.match(text, /ARCHITECTURE_LOCKED/);
  assert.match(text, /CapitalGlass-Cross-Agent/);
  assert.match(text, /CG-AppBuilder-MCP/);
  assert.match(text, /operational-intelligence-envelope-v1\.md/);
  assert.match(text, /COMPOUNDING_INTELLIGENCE_PIPELINE/);
  assert.match(text, /superseding plan/i);
}

function testLockedPlanReferencesContracts() {
  const planPath = path.join(REPO_ROOT, 'work-progress/projects/operational-intelligence-envelope-v1.md');
  assert.ok(fs.existsSync(planPath));
  const text = fs.readFileSync(planPath, 'utf8');
  assert.match(text, /contracts\/intelligence\/intelligence-handoff-v1\.schema\.json/);
  assert.match(text, /contracts\/intelligence\/operational-intelligence-envelope-v1\.schema\.json/);
}

const tests = [
  ['schemas compile', testSchemasCompile],
  ['handoff fixture valid', testHandoffFixtureValid],
  ['handoff rejects derived payload from producer', testHandoffRejectsDerivedPayloadFromProducer],
  ['envelope fixtures valid', testEnvelopeFixturesValid],
  ['envelope lifecycle fixtures', testEnvelopeLifecycleFixtures],
  ['negative evidence preserved', testEnvelopeNegativeEvidencePreserved],
  ['unknown future kind allowed', testUnknownFutureKindAllowed],
  ['reconstructable derivation graph', testReconstructableDerivationGraph],
  ['measurementQuality x evidenceReality matrix', testMeasurementQualityEvidenceRealityMatrix],
  ['envelope rejects hub progression authority', testEnvelopeRejectsHubProgressionAuthority],
  ['envelope rejects harvest authority class', testEnvelopeRejectsHarvestAuthorityClass],
  ['ownership doc locked', testOwnershipDocLocked],
  ['locked plan references contracts', testLockedPlanReferencesContracts],
];

let passed = 0;
for (const [name, fn] of tests) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}
console.log(`\n${passed}/${tests.length} intelligence contract tests passed`);
