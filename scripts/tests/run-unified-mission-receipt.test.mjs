#!/usr/bin/env node
/**
 * The single end-to-end mission receipt Wesley specified. Built from real
 * runIntelligencePreflight() + runGoldMineProtocol() output in an isolated
 * repoRoot -- proves the two systems this repo owns compose into one
 * receipt, and that waverunner/cacheRefresh are never faked as success.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { runIntelligencePreflight } from '../intelligence/lib/preflight-v1.mjs';
import { runGoldMineProtocol } from '../harvest/lib/goldmine-protocol-v1.mjs';
import { buildUnifiedMissionReceipt, writeUnifiedMissionReceipt } from '../intelligence/lib/unified-mission-receipt-v1.mjs';

const SCHEMA_PATH = path.join(process.cwd(), 'contracts/intelligence/unified-mission-receipt-v1.schema.json');

function compileValidator() {
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv.compile(schema);
}

async function withTempRepoRoot(fn) {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'unified-receipt-test-'));
  try {
    return await fn(repoRoot);
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
}

async function testUnifiedReceiptComposesRealPreflightAndGoldmineOutput() {
  return withTempRepoRoot(async (repoRoot) => {
    // testGitLedgerPlane() checks specifically for blockers.json, which in a
    // real checkout is a checked-in compiled slice (compile-control-slices.mjs)
    // -- runGoldMineProtocol() only regenerates harvest-intelligence.json, so
    // this isolated repoRoot needs its own minimal, valid fixture for the
    // ladder's Git-ledger rung to report available, same as a real checkout.
    const slicesDir = path.join(repoRoot, 'work-progress/intelligence-hub-slices');
    fs.mkdirSync(slicesDir, { recursive: true });
    fs.writeFileSync(path.join(slicesDir, 'blockers.json'), JSON.stringify({ updatedAt: new Date().toISOString(), blockers: [] }));

    const manifest = {
      harvestId: 'unified-receipt-test-v1',
      workPackageId: 'unified-receipt-test-v1',
      sourceLane: 'CLAUDE',
      sourceCommitSha: 'a'.repeat(40),
      protocolVersion: 'goldmine-protocol-v1@1.0.0',
      packets: [
        { packetId: 'unified-receipt-fixture-packet', packetVerdict: 'PASS', state: 'COMPLETE', ownerRepo: 'CapitalGlass-Cross-Agent', nextAction: 'none', evidenceRefs: [] },
      ],
    };
    const goldmineReceipt = await runGoldMineProtocol(manifest, { repoRoot });
    const preflightResult = await runIntelligencePreflight({
      mission: 'unified-receipt-test-v1',
      repos: ['CapitalGlass-Cross-Agent'],
      concepts: ['unified-receipt-fixture-packet'],
      repoRoot,
    });

    const receipt = buildUnifiedMissionReceipt({ mission: 'unified-receipt-test-v1', preflightResult, goldmineReceipt });

    const validate = compileValidator();
    const valid = validate(receipt);
    assert.ok(valid, JSON.stringify(validate.errors));

    assert.equal(receipt.preflight, 'PASS', 'the Git ledger lane must satisfy preflight in this environment');
    assert.equal(receipt.goldmine, 'GOLD_MINE_COMPLETE');
    assert.equal(receipt.graphDividend, 'PASS');
    assert.equal(receipt.newNodes, 1);
    assert.equal(receipt.aiCache, 'CACHE_ROOT_UNAVAILABLE', 'no physical cache is mounted in this container');
    assert.equal(receipt.lHub, 'UNAVAILABLE');

    // The two fields this repo does not own must never default to success.
    assert.equal(receipt.waverunner, 'NOT_YET_INTEGRATED');
    assert.equal(receipt.cacheRefresh, 'NOT_YET_INTEGRATED');
  });
}

function testUnifiedReceiptRequiresARealPreflightResult() {
  assert.throws(() => buildUnifiedMissionReceipt({ mission: 'x' }), /requires a real preflightResult/);
}

function testWaverunnerAndCacheRefreshOnlySetByExplicitEvidence() {
  const fakePreflightResult = { outcome: 'L_HUB_UNAVAILABLE_USING_GIT_LEDGER', mission: 'x', laneChecks: [] };
  const withoutEvidence = buildUnifiedMissionReceipt({ preflightResult: fakePreflightResult });
  assert.equal(withoutEvidence.waverunner, 'NOT_YET_INTEGRATED');
  assert.equal(withoutEvidence.cacheRefresh, 'NOT_YET_INTEGRATED');

  const withEvidence = buildUnifiedMissionReceipt({
    preflightResult: fakePreflightResult,
    waverunner: 'COMPLETE',
    cacheRefresh: 'PASS',
  });
  assert.equal(withEvidence.waverunner, 'COMPLETE');
  assert.equal(withEvidence.cacheRefresh, 'PASS');
}

function testShortCircuitedLanesReportNotCheckedNotUnavailable() {
  // Bugbot finding: a cache-hit short-circuit leaves laneChecks with only a
  // HOT_AI_CACHE entry -- L: and Supabase were never probed, so mapping their
  // absence to UNAVAILABLE would falsely claim they were tried and failed.
  const shortCircuitedResult = {
    outcome: 'CACHE_HIT_FRESH',
    mission: 'x',
    laneChecks: [{ plane: 'HOT_AI_CACHE', available: true, cacheStatus: 'CACHE_HIT_FRESH' }],
  };
  const receipt = buildUnifiedMissionReceipt({ preflightResult: shortCircuitedResult });
  assert.equal(receipt.lHub, 'NOT_CHECKED');
  assert.equal(receipt.supabaseProjection, 'NOT_CHECKED');

  // Contrast: when a lane genuinely was probed and failed, it must still say
  // UNAVAILABLE, not NOT_CHECKED -- this isn't just "always say not-checked".
  const probedAndFailedResult = {
    outcome: 'L_HUB_UNAVAILABLE_USING_GIT_LEDGER',
    mission: 'x',
    laneChecks: [
      { plane: 'HOT_AI_CACHE', available: false, cacheStatus: 'CACHE_ROOT_UNAVAILABLE' },
      { plane: 'L_DRIVE', available: false },
      { plane: 'SUPABASE', available: false },
      { plane: 'GIT_LEDGER', available: true },
    ],
  };
  const probedReceipt = buildUnifiedMissionReceipt({ preflightResult: probedAndFailedResult });
  assert.equal(probedReceipt.lHub, 'UNAVAILABLE');
  assert.equal(probedReceipt.supabaseProjection, 'UNAVAILABLE');
}

function testAllHubPlanesUnavailableMeansPreflightFail() {
  const failedPreflightResult = { outcome: 'ALL_HUB_PLANES_UNAVAILABLE', mission: 'x', laneChecks: [] };
  const receipt = buildUnifiedMissionReceipt({ preflightResult: failedPreflightResult });
  assert.equal(receipt.preflight, 'FAIL');
  assert.equal(receipt.goldmine, 'NOT_RUN', 'no goldmine receipt was supplied');
  assert.equal(receipt.graphDividend, 'NOT_RUN');
}

function testWriteUnifiedMissionReceiptWritesToDisk() {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'unified-receipt-write-test-'));
  try {
    const receipt = buildUnifiedMissionReceipt({
      preflightResult: { outcome: 'L_HUB_UNAVAILABLE_USING_GIT_LEDGER', mission: 'x', laneChecks: [] },
    });
    const receiptPath = writeUnifiedMissionReceipt(receipt, tmpRoot);
    assert.ok(fs.existsSync(receiptPath));
    const written = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
    assert.equal(written.schema, 'unified-mission-receipt-v1@1.0.0');
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
}

const tests = [
  ['unified receipt composes real preflight + goldmine output and validates against schema', testUnifiedReceiptComposesRealPreflightAndGoldmineOutput],
  ['unified receipt requires a real preflightResult', testUnifiedReceiptRequiresARealPreflightResult],
  ['waverunner and cacheRefresh are only set by explicit caller evidence', testWaverunnerAndCacheRefreshOnlySetByExplicitEvidence],
  ['short-circuited lanes report NOT_CHECKED, not UNAVAILABLE', testShortCircuitedLanesReportNotCheckedNotUnavailable],
  ['ALL_HUB_PLANES_UNAVAILABLE means preflight FAIL and goldmine NOT_RUN', testAllHubPlanesUnavailableMeansPreflightFail],
  ['writeUnifiedMissionReceipt writes to disk', testWriteUnifiedMissionReceiptWritesToDisk],
];

let passed = 0;
for (const [name, fn] of tests) {
  await fn();
  passed += 1;
  console.log(`ok - ${name}`);
}
console.log(`\n${passed}/${tests.length} unified mission receipt tests passed`);
