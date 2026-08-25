#!/usr/bin/env node
/**
 * Relationship-type registry (proposal 5c) — vocabulary, enforcement, and full
 * coverage of every edge type the current pipeline actually emits.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateRelationshipEdges } from '../intelligence/lib/schema-validate.mjs';
import { buildRelationshipEdges } from '../intelligence/lib/relationship-edge-builder-v1.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const REGISTRY_PATH = path.join(
  REPO_ROOT,
  'contracts/intelligence/registries/knowledge-relationship-types-v1.json',
);

function loadRegistry() {
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
}

function testRegistryStructure() {
  const registry = loadRegistry();
  assert.equal(registry.schema, 'knowledge-relationship-types-v1@1.0.0');
  assert.equal(registry.owner, 'CapitalGlass-Cross-Agent');
  assert.ok(Array.isArray(registry.types));
  assert.ok(registry.types.length >= 18);
  const ids = registry.types.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length, 'no duplicate type ids');
  for (const type of registry.types) {
    assert.equal(typeof type.semantics, 'string');
    assert.ok(type.semantics.length > 0);
    assert.ok(['ACTIVE', 'DEPRECATED'].includes(type.status));
    if (type.inverse) {
      assert.ok(ids.includes(type.inverse) || type.note, `${type.id}: inverse ${type.inverse} should exist or be noted reserved`);
    }
  }
}

function testKnownExistingTypesPresentAndActive() {
  const registry = loadRegistry();
  const byId = new Map(registry.types.map((t) => [t.id, t]));
  const existingInCode = [
    'PROJECTED_FROM', 'DERIVED_FROM', 'EVIDENCED_BY', 'OBSERVED_IN', 'PROVEN_BY',
    'ABOUT', 'FAILED_BECAUSE_OF', 'CORRECTED_BY', 'REINFORCES', 'ENABLES',
    'ENABLED_BY', 'SAME_AS', 'PROJECTS_TO',
  ];
  for (const id of existingInCode) {
    assert.ok(byId.has(id), `${id} must be registered`);
    assert.equal(byId.get(id).status, 'ACTIVE', `${id} must be ACTIVE`);
  }
}

function testEnablesIsRealInversePair() {
  const registry = loadRegistry();
  const byId = new Map(registry.types.map((t) => [t.id, t]));
  assert.equal(byId.get('ENABLES').inverse, 'ENABLED_BY');
  assert.equal(byId.get('ENABLED_BY').inverse, 'ENABLES');
}

function testPredictsRequiresConfidenceField() {
  const registry = loadRegistry();
  const predicts = registry.types.find((t) => t.id === 'PREDICTS');
  assert.ok(predicts, 'PREDICTS must be registered');
  assert.equal(predicts.confidenceField, true);
  assert.ok(!registry.types.some((t) => t.id === 'STRONGLY_PREDICTS'), 'STRONGLY_PREDICTS must not exist — confidence belongs on the edge');
}

function testRejectsUnregisteredType() {
  const result = validateRelationshipEdges([
    { relationshipId: 'oi:rel:test1', from: 'oi:a', to: 'oi:b', relationship: 'TOTALLY_MADE_UP' },
  ]);
  assert.equal(result.ok, false);
  assert.ok(result.errors[0].includes('unregistered relationship type'));
}

function testRejectsPredictsWithoutConfidence() {
  const result = validateRelationshipEdges([
    { relationshipId: 'oi:rel:test2', from: 'oi:a', to: 'oi:b', relationship: 'PREDICTS' },
  ]);
  assert.equal(result.ok, false);
  assert.ok(result.errors[0].includes('requires a numeric confidence'));
}

function testAcceptsPredictsWithConfidence() {
  const result = validateRelationshipEdges([
    { relationshipId: 'oi:rel:test3', from: 'oi:a', to: 'oi:b', relationship: 'PREDICTS', confidence: 0.9 },
  ]);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
}

function buildSyntheticObject(kind, conceptKey, suffix) {
  return {
    identity: { objectId: `oi:${kind.toLowerCase()}:${suffix}`, kind },
    extensions: { semantic: { conceptKey, verificationState: 'verified' } },
  };
}

function testFullPipelineCoverageAgainstRegistry() {
  // A minimal, self-contained ledger + derivedObjects set that exercises every
  // relationship edge the current builders emit — no closeout/handoff needed,
  // so this runs standalone without a sibling repo checkout.
  const ledger = {
    ledgerId: 'oi:ledger:test0000000000000000000000',
    derivationVersion: 'operational-intelligence-v1@1.0.0',
    closeoutHash: 'sha256:' + '0'.repeat(64),
    workPackageId: 'relationship-registry-coverage-test-v1',
    evidenceRefs: [{ contentHash: 'sha256:' + '1'.repeat(64) }],
  };

  const derivedObjects = [
    buildSyntheticObject('FAILURE', 'concept:failure', 'a1'),
    buildSyntheticObject('ROOT_CAUSE', 'concept:root-cause', 'a2'),
    buildSyntheticObject('REMEDIATION', 'concept:remediation', 'a3'),
    buildSyntheticObject('SUCCESS_PATTERN', 'concept:pattern', 'a4'),
    buildSyntheticObject('CAPABILITY_SIGNAL', 'concept:capability', 'a5'),
    buildSyntheticObject('FUTURE_OPPORTUNITY', 'concept:opportunity', 'a6'),
    // duplicate conceptKey of a1's failure, to exercise SAME_AS / PROJECTS_TO reconciliation
    buildSyntheticObject('FAILURE', 'concept:failure', 'a7'),
  ];

  const { edges: relationships } = buildRelationshipEdges({ ledger, derivedObjects, closeout: null, handoff: null });
  assert.ok(relationships.length > 10, 'expected a substantial edge set from the fixture');

  const emittedTypes = new Set(relationships.map((e) => e.relationship));
  const expectedAtLeast = [
    'PROJECTED_FROM', 'DERIVED_FROM', 'EVIDENCED_BY', 'OBSERVED_IN', 'PROVEN_BY',
    'FAILED_BECAUSE_OF', 'CORRECTED_BY', 'REINFORCES', 'ENABLES', 'ENABLED_BY',
    'SAME_AS', 'PROJECTS_TO',
  ];
  for (const type of expectedAtLeast) {
    assert.ok(emittedTypes.has(type), `fixture should exercise ${type}`);
  }

  const validation = validateRelationshipEdges(relationships);
  assert.equal(validation.ok, true, `every edge the current pipeline emits must validate: ${JSON.stringify(validation.errors)}`);
}

const tests = [
  ['registry structure well-formed', testRegistryStructure],
  ['known existing types present and ACTIVE', testKnownExistingTypesPresentAndActive],
  ['ENABLES/ENABLED_BY is a real inverse pair', testEnablesIsRealInversePair],
  ['PREDICTS requires confidence, no STRONGLY_PREDICTS', testPredictsRequiresConfidenceField],
  ['rejects unregistered type', testRejectsUnregisteredType],
  ['rejects PREDICTS without confidence', testRejectsPredictsWithoutConfidence],
  ['accepts PREDICTS with confidence', testAcceptsPredictsWithConfidence],
  ['full pipeline coverage validates against registry', testFullPipelineCoverageAgainstRegistry],
];

let passed = 0;
for (const [name, fn] of tests) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}
console.log(`\n${passed}/${tests.length} relationship registry tests passed`);
