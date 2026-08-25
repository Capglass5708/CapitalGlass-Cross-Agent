#!/usr/bin/env node
/**
 * intelligence.preflight() (proposal 2) — the physical L: -> Supabase -> Git
 * retrieval ladder, mission-context bundle assembly (proposal 8), and receipt.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  OUTCOME,
  testLHubPlane,
  testSupabasePlane,
  testGitLedgerPlane,
  buildMissionContextBundle,
  runIntelligencePreflight,
  writePreflightReceipt,
} from '../intelligence/lib/preflight-v1.mjs';

function testLHubPlaneNeverThrows() {
  const result = testLHubPlane();
  assert.equal(result.plane, 'L_DRIVE');
  assert.equal(typeof result.available, 'boolean');
}

async function testSupabasePlaneDegradesGracefully() {
  // Must never throw even when the sibling AppBuilder repo isn't checked out.
  const result = await testSupabasePlane();
  assert.equal(result.plane, 'SUPABASE');
  assert.equal(typeof result.available, 'boolean');
}

function testGitLedgerPlaneAvailable() {
  // The Git-tracked local mirror ships with this repo, so it must always be reachable.
  const result = testGitLedgerPlane();
  assert.equal(result.plane, 'GIT_LEDGER');
  assert.equal(result.available, true);
}

function testMissionContextBundleShape() {
  const bundle = buildMissionContextBundle({ concepts: [], repos: [] });
  assert.equal(bundle.bundleSource, 'GIT_LEDGER_MIRROR', 'bundle must honestly declare where it was actually sourced from');
  for (const key of ['activeBlockers', 'repoOwnership', 'knownFailures', 'successPatterns', 'relatedMissions', 'unresolvedContradictions']) {
    assert.ok(Array.isArray(bundle[key]), `${key} should be an array`);
  }
  assert.ok(bundle.currentState, 'currentState slice should load');
  assert.ok(bundle.sourceSlicesGeneratedAt.blockers, 'should surface when the blockers slice was last updated');
}

function testEmptyQueryIsConsistentlyUnfiltered() {
  // Every bundle field must treat "no concepts/repos given" the same way:
  // return everything (bounded), never silently drop a slice to empty just
  // because it happens to come from the larger harvest-intelligence source.
  const unfiltered = buildMissionContextBundle({ concepts: [], repos: [] });
  assert.ok(
    unfiltered.knownFailures.length > 0 || unfiltered.successPatterns.length > 0 || unfiltered.relatedMissions.length > 0,
    'an unfiltered query should surface harvest-derived context too, not just blockers/ownership',
  );
}

function testMissionContextBundleFiltersByConcept() {
  const unfiltered = buildMissionContextBundle({ concepts: [], repos: [] });
  const filtered = buildMissionContextBundle({ concepts: ['nonexistent-concept-xyz-000'], repos: [] });
  assert.equal(filtered.knownFailures.length, 0);
  assert.equal(filtered.successPatterns.length, 0);
  // an empty query returns everything; a concept that matches nothing returns nothing from the row-keyed slices
  assert.ok(unfiltered.activeBlockers.length >= filtered.activeBlockers.length);
  assert.ok(unfiltered.knownFailures.length >= filtered.knownFailures.length);
}

function testBuildMissionContextBundleRespectsRepoRootOverride() {
  // repoRoot must be a real override, not a cosmetic parameter — an isolated
  // root with its own slice files must return that root's data, not silently
  // fall back to this repo's real work-progress/intelligence-hub-slices/.
  // This is what makes the goldmine <-> preflight retrieval loop testable
  // without ever touching the real repo state (see the goldmine protocol
  // test suite's two-agent proof, which depends on this).
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'preflight-reporoot-test-'));
  try {
    const slicesDir = path.join(tmpRoot, 'work-progress/intelligence-hub-slices');
    fs.mkdirSync(slicesDir, { recursive: true });
    fs.writeFileSync(
      path.join(slicesDir, 'blockers.json'),
      JSON.stringify({ updatedAt: '2020-01-01T00:00:00.000Z', blockers: [] }),
    );

    const isolated = buildMissionContextBundle({ concepts: [], repos: [], repoRoot: tmpRoot });
    const real = buildMissionContextBundle({ concepts: [], repos: [] });

    assert.equal(isolated.sourceSlicesGeneratedAt.blockers, '2020-01-01T00:00:00.000Z');
    assert.notEqual(isolated.sourceSlicesGeneratedAt.blockers, real.sourceSlicesGeneratedAt.blockers);
    assert.equal(isolated.knownFailures.length, 0, 'isolated root has no harvest-intelligence.json, so this must be empty, not fall through to the real repo');
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
}

async function testFullLadderReachesGitLedgerInThisEnvironment() {
  // This container has no hot AI cache mount, no /mnt/l mount, and no sibling
  // AppBuilder checkout, so the ladder must fall all the way to the Git
  // ledger and still succeed — this is the one lane genuinely end-to-end
  // testable outside the real dev host.
  const result = await runIntelligencePreflight({ mission: 'test-mission', repos: ['CapitalGlass-Cross-Agent'], concepts: [] });
  assert.equal(result.outcome, OUTCOME.L_HUB_UNAVAILABLE_USING_GIT_LEDGER);
  assert.equal(result.laneChecks.length, 4, 'should have physically tested hot cache, then L:, then Supabase, then Git ledger');
  assert.equal(result.laneChecks[0].plane, 'HOT_AI_CACHE');
  assert.equal(result.laneChecks[0].available, false, 'no physical cache is mounted in this container');
  assert.equal(result.laneChecks[1].plane, 'L_DRIVE');
  assert.equal(result.laneChecks[2].plane, 'SUPABASE');
  assert.equal(result.laneChecks[3].plane, 'GIT_LEDGER');
  assert.ok(result.bundle, 'a successful lane must return a mission-context bundle');
}

function testReceiptIsWritten() {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'preflight-receipt-test-'));
  try {
    const fakeResult = {
      schema: 'intelligence-preflight-receipt-v1@1.0.0',
      generatedAt: new Date().toISOString(),
      outcome: OUTCOME.L_HUB_UNAVAILABLE_USING_GIT_LEDGER,
      laneChecks: [],
      bundle: null,
    };
    const receiptPath = writePreflightReceipt(fakeResult, tmpRoot);
    assert.ok(fs.existsSync(receiptPath));
    const written = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
    assert.equal(written.outcome, OUTCOME.L_HUB_UNAVAILABLE_USING_GIT_LEDGER);
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
}

const tests = [
  ['L: plane test never throws', testLHubPlaneNeverThrows],
  ['Supabase plane degrades gracefully without a sibling checkout', testSupabasePlaneDegradesGracefully],
  ['Git ledger plane is always available', testGitLedgerPlaneAvailable],
  ['mission-context bundle has the expected shape', testMissionContextBundleShape],
  ['empty query is consistently unfiltered across all bundle fields', testEmptyQueryIsConsistentlyUnfiltered],
  ['mission-context bundle filters by concept', testMissionContextBundleFiltersByConcept],
  ['mission-context bundle respects a repoRoot override', testBuildMissionContextBundleRespectsRepoRootOverride],
  ['full ladder reaches the Git ledger in this environment', testFullLadderReachesGitLedgerInThisEnvironment],
  ['receipt is written to disk', testReceiptIsWritten],
];

let passed = 0;
for (const [name, fn] of tests) {
  await fn();
  passed += 1;
  console.log(`ok - ${name}`);
}
console.log(`\n${passed}/${tests.length} intelligence preflight tests passed`);
