#!/usr/bin/env node
/**
 * /goldmine canonical protocol (proposal 9) — one governed implementation,
 * one receipt shape, preview/status variants. Runs against an isolated
 * repoRoot so it never touches the real work-progress/harvest-intelligence-index.json.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  loadEvidenceManifest,
  previewGoldMine,
  runGoldMineProtocol,
  lastGoldMineReceipt,
} from '../harvest/lib/goldmine-protocol-v1.mjs';

async function withTempRepoRoot(fn) {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'goldmine-test-repo-'));
  try {
    return await fn(repoRoot);
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
}

function buildManifest(overrides = {}) {
  return {
    harvestId: 'goldmine-test-v1',
    workPackageId: 'goldmine-test-work-package',
    sourceLane: 'CLAUDE',
    sourceCommitSha: 'a'.repeat(40),
    protocolVersion: 'goldmine-protocol-v1@1.0.0',
    packets: [
      { packetId: 'test-packet-1', packetVerdict: 'PASS', state: 'COMPLETE', ownerRepo: 'CapitalGlass-Cross-Agent', nextAction: 'none', evidenceRefs: [] },
    ],
    ...overrides,
  };
}

function assertThrowsWithCode(fn, expectedCode) {
  try {
    fn();
    assert.fail('expected function to throw');
  } catch (error) {
    assert.equal(error.code, expectedCode);
  }
}

function testEvidenceManifestValidation() {
  assertThrowsWithCode(() => loadEvidenceManifest('/no/such/file.json'), 'EVIDENCE_NOT_FOUND');

  const tmpFile = path.join(os.tmpdir(), `goldmine-invalid-${Date.now()}.json`);
  fs.writeFileSync(tmpFile, JSON.stringify({ packets: [] }));
  try {
    assertThrowsWithCode(() => loadEvidenceManifest(tmpFile), 'EVIDENCE_MANIFEST_INVALID');
  } finally {
    fs.rmSync(tmpFile, { force: true });
  }
}

function testPreviewDoesNotMutateAnything() {
  return withTempRepoRoot((repoRoot) => {
    const manifest = buildManifest();
    const indexPath = path.join(repoRoot, 'work-progress/harvest-intelligence-index.json');
    const preview = previewGoldMine(manifest);
    assert.equal(preview.verdict, 'GOLD_MINE_PREVIEW');
    assert.equal(preview.evidenceItemsHarvested, 1);
    assert.equal(fs.existsSync(indexPath), false, 'preview must not write the intelligence index');
  });
}

async function testFullRunProducesCompleteReceipt() {
  return withTempRepoRoot(async (repoRoot) => {
    const manifest = buildManifest();
    const receipt = await runGoldMineProtocol(manifest, { repoRoot });
    // No contradiction packets in this manifest, so this must be COMPLETE —
    // the verdict is tied to the real local-merge outcome, never to Hub
    // reachability (see the "false Hub publication success" fix below).
    assert.equal(receipt.verdict, 'GOLD_MINE_COMPLETE');
    assert.equal(receipt.evidenceItemsHarvested, 1);
    assert.equal(receipt.newKnowledgeNodes, 1, 'first run of a new concept should create one node');
    assert.equal(receipt.graphDividend, 'PASS');
    assert.equal(receipt.localIndexWrite, 'PASS');
    // Hub publication must never claim PASS — no code path actually writes to
    // a remote Hub plane yet, regardless of whether one is reachable.
    assert.equal(receipt.hubPublication, 'NOT_IMPLEMENTED');
    assert.equal(typeof receipt.hubPlaneReachable, 'boolean');
    assert.ok(receipt.note.includes('Remote Hub publication is not implemented'));
    assert.ok(fs.existsSync(receipt.receiptPath), 'receipt must be written to disk');
    assert.ok(fs.existsSync(path.join(repoRoot, 'work-progress/harvest-intelligence-index.json')), 'real run must write the intelligence index');
  });
}

async function testRepeatRunReinforcesInsteadOfDuplicating() {
  return withTempRepoRoot(async (repoRoot) => {
    const manifest = buildManifest();
    const first = await runGoldMineProtocol(manifest, { repoRoot });
    assert.equal(first.newKnowledgeNodes, 1);

    // second harvest, same concept — must reinforce, not create a duplicate node
    const second = await runGoldMineProtocol(buildManifest({ harvestId: 'goldmine-test-v2' }), { repoRoot });
    assert.equal(second.newKnowledgeNodes, 0, 'repeat evidence for the same concept should not create a new node');
    assert.equal(second.existingNodesReinforced, 1, 'repeat evidence should reinforce the existing node');
    assert.equal(second.graphDividend, 'PASS', 'reinforcement alone should still count as dividend (proposal 5b)');
  });
}

function testContradictionsRequiringReviewIsHonestlyTracked() {
  return withTempRepoRoot(async (repoRoot) => {
    const manifest = buildManifest({
      packets: [
        { packetId: 'contradiction-packet', packetVerdict: 'FAIL', state: 'OPEN', ownerRepo: 'CapitalGlass-Cross-Agent', contradictsExisting: true, evidenceRefs: [] },
      ],
    });
    const receipt = await runGoldMineProtocol(manifest, { repoRoot });
    assert.equal(receipt.contradictionsRequiringReview, 1);
    assert.equal(receipt.verdict, 'GOLD_MINE_PARTIAL', 'an unresolved contradiction is what should make a run partial, not Hub reachability');
  });
}

async function testStatusReadsBackLastReceipt() {
  return withTempRepoRoot(async (repoRoot) => {
    const manifest = buildManifest();
    const written = await runGoldMineProtocol(manifest, { repoRoot });
    const readBack = lastGoldMineReceipt(manifest.harvestId, repoRoot);
    assert.ok(readBack);
    assert.equal(readBack.harvestId, written.harvestId);
    assert.equal(readBack.receiptPath, written.receiptPath, 'a persisted receipt must know its own path');
  });
}

function testStatusReturnsNullWhenNoReceiptExists() {
  return withTempRepoRoot((repoRoot) => {
    assert.equal(lastGoldMineReceipt('never-ran-v1', repoRoot), null);
  });
}

const tests = [
  ['evidence manifest validation', testEvidenceManifestValidation],
  ['preview does not mutate anything', testPreviewDoesNotMutateAnything],
  ['full run produces a complete receipt with no false Hub-publication claim', testFullRunProducesCompleteReceipt],
  ['repeat run reinforces instead of duplicating', testRepeatRunReinforcesInsteadOfDuplicating],
  ['contradictions requiring review is honestly tracked', testContradictionsRequiringReviewIsHonestlyTracked],
  ['status reads back the last receipt', testStatusReadsBackLastReceipt],
  ['status returns null when nothing has run yet', testStatusReturnsNullWhenNoReceiptExists],
];

let passed = 0;
for (const [name, fn] of tests) {
  await fn();
  passed += 1;
  console.log(`ok - ${name}`);
}
console.log(`\n${passed}/${tests.length} goldmine protocol tests passed`);
