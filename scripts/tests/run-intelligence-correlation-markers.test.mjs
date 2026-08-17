#!/usr/bin/env node
/**
 * Correlation markers contract — schema, registries, build/validate, relationship edges.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildCorrelationBlock,
  buildCorrelationRelationshipEdges,
  computeMarkerSetHash,
  loadCorrelationRegistries,
  MARKER_BUDGET_MAX,
  REGISTRY_VERSION,
  validateCorrelationBlock,
} from '../intelligence/lib/correlation-markers-v1.mjs';
import { validateCorrelationMarkersSchema } from '../intelligence/lib/schema-validate.mjs';
import { buildMaterialCloseout } from '../intelligence/lib/test-fixture-handoff-v1.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPBUILDER_ROOT = path.resolve(REPO_ROOT, '../CG-AppBuilder-MCP');

function testRegistryVersionAndBudget() {
  const registries = loadCorrelationRegistries({ appBuilderRoot: APPBUILDER_ROOT });
  assert.equal(registries.registryVersion, REGISTRY_VERSION);
  assert.equal(registries.markerBudgetMax, MARKER_BUDGET_MAX);
  assert.ok(registries.capabilities.has('CACHE'));
  assert.ok(registries.subjects.has('correlation-fabric'));
}

function testBuildAndValidateMaterialBlock() {
  const closeout = buildMaterialCloseout({
    workPackageId: 'capital-glass-intelligence-correlation-fabric-v1',
  });
  closeout.primaryRepo = 'CG-AppBuilder-MCP';
  const block = buildCorrelationBlock({
    closeout,
    producerRepo: 'CG-AppBuilder-MCP',
    capabilityIds: ['CACHE'],
    appBuilderRoot: APPBUILDER_ROOT,
  });
  block.markerSetHash = computeMarkerSetHash(block.markers);
  const registries = loadCorrelationRegistries({ appBuilderRoot: APPBUILDER_ROOT });
  const schemaResult = validateCorrelationMarkersSchema(block);
  assert.equal(schemaResult.ok, true, schemaResult.errors.join('; '));
  const semanticResult = validateCorrelationBlock(block, registries);
  assert.equal(semanticResult.ok, true, semanticResult.errors.join('; '));
  assert.match(block.correlationId, /^corr:[0-9a-f]{32}$/);
  assert.ok(block.markers.some((marker) => marker.type === 'capability' && marker.id === 'CACHE'));
}

function testRejectUnknownCapability() {
  const closeout = buildMaterialCloseout({ workPackageId: 'ephemeral-correlation-negative-v1' });
  assert.throws(
    () =>
      buildCorrelationBlock({
        closeout,
        producerRepo: 'CG-AppBuilder-MCP',
        declaredMarkers: [{ type: 'capability', id: 'NOT_A_REAL_CAPABILITY', source: 'DECLARED' }],
        appBuilderRoot: APPBUILDER_ROOT,
      }),
    /Correlation marker validation failed|unregistered capability/,
  );
}

function testRelationshipEdgesIncludeChainedBy() {
  const closeout = buildMaterialCloseout({ workPackageId: 'capital-glass-intelligence-correlation-fabric-v1' });
  const block = buildCorrelationBlock({
    closeout,
    producerRepo: 'CG-AppBuilder-MCP',
    appBuilderRoot: APPBUILDER_ROOT,
  });
  block.markerSetHash = computeMarkerSetHash(block.markers);
  const ledger = { ledgerId: 'ledger:test', derivationVersion: 'derivation-v1', evidenceRefs: [] };
  const derivedObjects = [
    {
      identity: { objectId: 'oi:test:mission-measurement' },
      extensions: {},
    },
  ];
  const edges = buildCorrelationRelationshipEdges({ ledger, correlationBlock: block, derivedObjects });
  assert.ok(edges.some((edge) => edge.relationship === 'CHAINED_BY'));
  assert.ok(edges.some((edge) => edge.relationship === 'USED_CAPABILITY'));
}

function testFixtureFilePresent() {
  const fixturePath = path.join(REPO_ROOT, 'contracts/intelligence/fixtures/correlation-valid-v1.json');
  assert.ok(fs.existsSync(fixturePath));
}

const tests = [
  ['registry version and budget', testRegistryVersionAndBudget],
  ['build and validate material block', testBuildAndValidateMaterialBlock],
  ['reject unknown capability id', testRejectUnknownCapability],
  ['relationship edges include CHAINED_BY', testRelationshipEdgesIncludeChainedBy],
  ['fixture file present', testFixtureFilePresent],
];

let passed = 0;
for (const [name, fn] of tests) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}
console.log(`\n${passed}/${tests.length} correlation marker tests passed`);
