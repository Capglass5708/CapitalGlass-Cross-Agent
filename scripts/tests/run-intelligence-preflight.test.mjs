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

async function testFullLadderReachesGitLedgerInThisEnvironment() {
  // This container has no /mnt/l mount and no sibling AppBuilder checkout, so
  // the ladder must fall all the way to the Git ledger and still succeed —
  // this is the one lane genuinely end-to-end testable outside the real dev host.
  const result = await runIntelligencePreflight({ mission: 'test-mission', repos: ['CapitalGlass-Cross-Agent'], concepts: [] });
  assert.equal(result.outcome, OUTCOME.L_HUB_UNAVAILABLE_USING_GIT_LEDGER);
  assert.equal(result.laneChecks.length, 3, 'should have physically tested L:, then Supabase, then Git ledger');
  assert.equal(result.laneChecks[0].plane, 'L_DRIVE');
  assert.equal(result.laneChecks[1].plane, 'SUPABASE');
  assert.equal(result.laneChecks[2].plane, 'GIT_LEDGER');
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
