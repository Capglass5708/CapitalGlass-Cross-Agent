#!/usr/bin/env node
/**
 * Graph-aware mission-context queries (Wesley's unified-loop proposal, item 6)
 * — real traversal over the raw intelligence index and the decision log, not
 * fabricated graph data. Exercises both the standalone query functions
 * (against synthetic isolated fixtures, so nothing depends on or can be
 * polluted by the real repo's data) and the full buildMissionContextBundle()
 * integration.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  loadRawIntelligenceEntities,
  queryRecentlyCorrectedOrSuperseded,
  queryRelationshipGraph,
  queryUnmodeledEvidence,
  parseDecisionLog,
  queryGoverningDecisions,
} from '../intelligence/lib/mission-graph-queries-v1.mjs';
import { buildMissionContextBundle } from '../intelligence/lib/preflight-v1.mjs';
import { REPO_ROOT } from '../intelligence/lib/paths.mjs';

function withTempRepoRoot(fn) {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mission-graph-test-'));
  try {
    return fn(repoRoot);
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
}

function writeJson(repoRoot, relPath, value) {
  const filePath = path.join(repoRoot, relPath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value));
}

const FIXTURE_ENTITIES = [
  {
    entityId: 'intel:active-one',
    identity: { conceptKey: 'storefront-glazing-pattern-v1' },
    lifecycleState: 'active',
    supersededBy: null,
    dimensions: { ownerRepo: 'CapitalGlass-Cross-Agent' },
    relationships: [
      { type: 'ENABLES', target: 'intel:downstream-capability' },
      { type: 'OBSERVED_IN', target: 'harvest:harvest-fixture-v1' },
    ],
  },
  {
    entityId: 'intel:superseded-one',
    identity: { conceptKey: 'storefront-glazing-pattern-v1' },
    lifecycleState: 'superseded',
    supersededBy: 'intel:active-one',
    dimensions: { ownerRepo: 'CapitalGlass-Cross-Agent' },
    relationships: [],
  },
  {
    entityId: 'intel:unrelated',
    identity: { conceptKey: 'totally-unrelated-concept' },
    lifecycleState: 'active',
    supersededBy: null,
    dimensions: { ownerRepo: 'Data-Extraction' },
    relationships: [{ type: 'ENABLES', target: 'intel:should-not-appear' }],
  },
];

function testRecentlyCorrectedOrSupersededFindsOnlySupersededEntity() {
  const result = queryRecentlyCorrectedOrSuperseded(FIXTURE_ENTITIES, ['storefront-glazing-pattern-v1']);
  assert.equal(result.length, 1);
  assert.equal(result[0].entityId, 'intel:superseded-one');
  assert.equal(result[0].supersededBy, 'intel:active-one');
}

function testRecentlyCorrectedOrSupersededExcludesUnrelatedConcepts() {
  const result = queryRecentlyCorrectedOrSuperseded(FIXTURE_ENTITIES, ['totally-unrelated-concept']);
  assert.equal(result.length, 0, 'the unrelated concept has no superseded entities');
}

function testRelationshipGraphSurfacesRealEdgesScopedByConcept() {
  const result = queryRelationshipGraph(FIXTURE_ENTITIES, { concepts: ['storefront-glazing-pattern-v1'], repos: [] });
  const active = result.find((r) => r.entityId === 'intel:active-one');
  assert.ok(active, 'the matched entity must be present');
  assert.ok(active.edges.some((e) => e.type === 'ENABLES' && e.target === 'intel:downstream-capability'));
  assert.ok(!result.some((r) => r.entityId === 'intel:unrelated'), 'unrelated concept must not leak in');
}

function testUnmodeledEvidenceFiltersByRetrievalClass() {
  const rows = [
    { retrievalClass: 'UNMODELED_QUEUE_POINTER', queueId: 'unmod:1', conceptKey: 'x', lifecycleState: 'UNMODELED_INTELLIGENCE' },
    { retrievalClass: 'INDEXED_ENTITY_POINTER', entityId: 'intel:y', conceptKey: 'y' },
  ];
  const result = queryUnmodeledEvidence(rows, []);
  assert.equal(result.length, 1);
  assert.equal(result[0].queueId, 'unmod:1');
}

function testDecisionLogParsesRealFileAndFindsAiCacheDecision() {
  // Deliberately reads the real repo's decision log, not a fixture -- it's a
  // small, stable, human-authored file, and this is what independently
  // validated the hot-ai-cache plane's Z:-authority design against real
  // governance (CAD-20260802-z-ai-cache-single-canonical-authority).
  const decisions = parseDecisionLog(REPO_ROOT);
  assert.ok(decisions.length >= 5, 'the real decision log has several rows');
  const aiCacheDecision = decisions.find((d) => d.decisionId === 'CAD-20260802-z-ai-cache-single-canonical-authority');
  assert.ok(aiCacheDecision, 'must find the Z: cache authority decision');
  assert.ok(aiCacheDecision.decision.includes('Z:'));

  const filtered = queryGoverningDecisions(decisions, ['ai-cache', 'canonical']);
  assert.ok(filtered.some((d) => d.decisionId === 'CAD-20260802-z-ai-cache-single-canonical-authority'));
}

function testDecisionLogGracefullyReturnsEmptyWhenFileMissing() {
  withTempRepoRoot((repoRoot) => {
    const decisions = parseDecisionLog(repoRoot);
    assert.deepEqual(decisions, []);
  });
}

function testBuildMissionContextBundleIntegratesAllGraphAwareFields() {
  withTempRepoRoot((repoRoot) => {
    writeJson(repoRoot, 'work-progress/harvest-intelligence-index.json', {
      schemaVersion: 'harvest-intelligence-index-v1',
      entities: FIXTURE_ENTITIES,
    });
    writeJson(repoRoot, 'work-progress/intelligence-hub-slices/harvest-intelligence.json', {
      generatedAt: '2026-08-25T00:00:00.000Z',
      rows: [
        { entityId: 'intel:active-one', conceptKey: 'storefront-glazing-pattern-v1', ownerRepo: 'CapitalGlass-Cross-Agent', workPackageId: 'fixture-mission-v1', retrievalClass: 'INDEXED_ENTITY_POINTER' },
        { queueId: 'unmod:fixture-1', conceptKey: 'storefront-glazing-pattern-v1', retrievalClass: 'UNMODELED_QUEUE_POINTER' },
      ],
    });
    const decisionLog = [
      '# Decision Log',
      '',
      '| Date | Decision ID | Decision | Why | Owner / source | Related file |',
      '| --- | --- | --- | --- | --- | --- |',
      '| 2026-08-25 | `CAD-fixture-storefront` | storefront-glazing-pattern-v1 governs edge detection | fixture reason | fixture owner | `fixture.md` |',
      '',
    ].join('\n');
    fs.mkdirSync(path.join(repoRoot, 'decisions'), { recursive: true });
    fs.writeFileSync(path.join(repoRoot, 'decisions/DECISION_LOG.md'), decisionLog);

    const bundle = buildMissionContextBundle({ concepts: ['storefront-glazing-pattern-v1'], repos: [], repoRoot });

    assert.equal(bundle.recentlyCorrectedOrSuperseded.length, 1);
    assert.equal(bundle.recentlyCorrectedOrSuperseded[0].entityId, 'intel:superseded-one');

    assert.ok(bundle.relationshipGraph.some((r) => r.edges.some((e) => e.type === 'ENABLES')));

    assert.equal(bundle.unmodeledEvidence.length, 1);
    assert.equal(bundle.unmodeledEvidence[0].queueId, 'unmod:fixture-1');

    assert.equal(bundle.governingDecisions.length, 1);
    assert.equal(bundle.governingDecisions[0].decisionId, 'CAD-fixture-storefront');
  });
}

const tests = [
  ['recently corrected/superseded finds only the superseded entity', testRecentlyCorrectedOrSupersededFindsOnlySupersededEntity],
  ['recently corrected/superseded excludes unrelated concepts', testRecentlyCorrectedOrSupersededExcludesUnrelatedConcepts],
  ['relationship graph surfaces real edges scoped by concept', testRelationshipGraphSurfacesRealEdgesScopedByConcept],
  ['unmodeled evidence filters by retrievalClass', testUnmodeledEvidenceFiltersByRetrievalClass],
  ['decision log parses the real file and finds the AI-cache decision', testDecisionLogParsesRealFileAndFindsAiCacheDecision],
  ['decision log gracefully returns empty when the file is missing', testDecisionLogGracefullyReturnsEmptyWhenFileMissing],
  ['buildMissionContextBundle integrates all graph-aware fields end to end', testBuildMissionContextBundleIntegratesAllGraphAwareFields],
];

let passed = 0;
for (const [name, fn] of tests) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}
console.log(`\n${passed}/${tests.length} mission graph query tests passed`);
