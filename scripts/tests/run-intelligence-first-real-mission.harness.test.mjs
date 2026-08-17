#!/usr/bin/env node
/**
 * First-real-mission harness — fail-closed gate semantics (Step 5).
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildProofWaveCloseout } from '../../../CG-AppBuilder-MCP/scripts/sdlc-protocol-cursor/lib/build-proof-wave-closeout.mjs';
import {
  evaluateFirstRealMissionHarness,
  FIRST_REAL_MISSION_CRITERIA,
} from '../intelligence/lib/first-real-mission-harness-v1.mjs';
import { runIntelligenceIngest } from '../intelligence/lib/ingest-pipeline-v1.mjs';
import { createMemoryIntelligenceHubStore } from '../intelligence/lib/hub-operational-intelligence-publish-v1.mjs';
import {
  buildMaterialCloseout,
  writeAuthoritativeHandoffFixture,
} from '../intelligence/lib/test-fixture-handoff-v1.mjs';

function withTempFixture(run) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cg-first-real-mission-'));
  return (async () => {
    try {
      return await run(tempRoot);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  })();
}

async function testFixtureStaysWaitingForRealMission() {
  await withTempFixture(async (tempRoot) => {
    const fixture = writeAuthoritativeHandoffFixture(tempRoot, {
      workPackageId: 'ephemeral-intelligence-contract-fixture-v1',
      closeout: buildMaterialCloseout({ workPackageId: 'ephemeral-intelligence-contract-fixture-v1' }),
    });
    const receipt = await runIntelligenceIngest({
      handoff: fixture.handoff,
      mode: 'shared-dev-hub',
      repoRoot: tempRoot,
      outputRoot: path.join(tempRoot, 'out'),
      generatedAt: '2026-08-17T03:00:02.000Z',
      hubStore: createMemoryIntelligenceHubStore(),
      writeEligibility: { approved: true, liveWrites: true, executable: true, reason: null },
    });
    const harness = evaluateFirstRealMissionHarness(receipt);
    assert.equal(harness.state, 'WAITING_FOR_REAL_MISSION');
    assert.equal(harness.pass, false);
    assert.equal(receipt.acceptance.FIRST_REAL_MISSION_HUB_PROOF, 'WAITING_FOR_REAL_MISSION');
  });
}

async function testProofWaveStaysWaitingForRealMission() {
  await withTempFixture(async (tempRoot) => {
    const workPackageId = 'sdlc-proof-wave-closeout-v1';
    const fixture = writeAuthoritativeHandoffFixture(tempRoot, {
      workPackageId,
      closeout: buildProofWaveCloseout({ workPackageId, prepare: { classification: { executionMode: 'MILESTONE_WAVE' } } }),
      material: true,
    });
    const receipt = await runIntelligenceIngest({
      handoff: fixture.handoff,
      mode: 'shared-dev-hub',
      repoRoot: tempRoot,
      outputRoot: path.join(tempRoot, 'out'),
      generatedAt: '2026-08-17T03:00:02.000Z',
      hubStore: createMemoryIntelligenceHubStore(),
      writeEligibility: { approved: true, liveWrites: true, executable: true, reason: null },
    });
    const harness = evaluateFirstRealMissionHarness(receipt);
    assert.equal(harness.state, 'WAITING_FOR_REAL_MISSION');
    assert.equal(harness.pass, false);
  });
}

async function testRealMissionMemoryHubProofPass() {
  await withTempFixture(async (tempRoot) => {
    const fixture = writeAuthoritativeHandoffFixture(tempRoot);
    const receipt = await runIntelligenceIngest({
      handoff: fixture.handoff,
      mode: 'shared-dev-hub',
      repoRoot: tempRoot,
      outputRoot: path.join(tempRoot, 'out'),
      generatedAt: '2026-08-17T03:00:02.000Z',
      hubStore: createMemoryIntelligenceHubStore(),
      writeEligibility: { approved: true, liveWrites: true, executable: true, reason: null },
    });
    const harness = evaluateFirstRealMissionHarness(receipt);
    assert.equal(harness.pass, true);
    assert.equal(harness.state, 'FIRST_REAL_MISSION_HUB_PROOF_PASS');
    assert.equal(harness.passCount, FIRST_REAL_MISSION_CRITERIA.length);
    for (const key of FIRST_REAL_MISSION_CRITERIA) {
      assert.equal(harness.checks[key], true, `expected ${key}=true`);
    }
  });
}

async function testDryRunDoesNotAdvanceHubProof() {
  await withTempFixture(async (tempRoot) => {
    const fixture = writeAuthoritativeHandoffFixture(tempRoot);
    const receipt = await runIntelligenceIngest({
      handoff: fixture.handoff,
      mode: 'dry-run',
      repoRoot: tempRoot,
      outputRoot: path.join(tempRoot, 'out'),
      generatedAt: '2026-08-17T03:00:02.000Z',
    });
    const harness = evaluateFirstRealMissionHarness(receipt);
    assert.equal(harness.pass, false);
    assert.equal(receipt.acceptance.FIRST_REAL_MISSION_HUB_PROOF, 'WAITING_FOR_SHARED_DEV_HUB_READBACK');
  });
}

const tests = [
  ['fixture stays WAITING_FOR_REAL_MISSION', testFixtureStaysWaitingForRealMission],
  ['proof-wave stays WAITING_FOR_REAL_MISSION', testProofWaveStaysWaitingForRealMission],
  ['real mission memory hub proof pass', testRealMissionMemoryHubProofPass],
  ['dry-run does not advance hub proof', testDryRunDoesNotAdvanceHubProof],
];

let passed = 0;
for (const [name, fn] of tests) {
  await fn();
  passed += 1;
  console.log(`ok - ${name}`);
}
console.log(`\n${passed}/${tests.length} first-real-mission harness tests passed`);
