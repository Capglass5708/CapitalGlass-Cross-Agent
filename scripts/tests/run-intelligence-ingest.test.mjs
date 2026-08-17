#!/usr/bin/env node
/**
 * intelligence:ingest — Cross-Agent operational intelligence ingest pipeline.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildProofWaveCloseout } from '../../../CG-AppBuilder-MCP/scripts/sdlc-protocol-cursor/lib/build-proof-wave-closeout.mjs';
import { runIntelligenceIngest } from '../intelligence/lib/ingest-pipeline-v1.mjs';
import { createMemoryIntelligenceHubStore } from '../intelligence/lib/hub-operational-intelligence-publish-v1.mjs';
import { dryRunLedgerDir } from '../intelligence/lib/paths.mjs';
import {
  buildMaterialCloseout,
  writeAuthoritativeHandoffFixture,
} from '../intelligence/lib/test-fixture-handoff-v1.mjs';
import { validateHandoffSchema } from '../intelligence/lib/schema-validate.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function captureIdentity(receipt) {
  return {
    ledgerId: receipt.ledgerId,
    closeoutHash: receipt.closeoutHash,
    authorityFingerprint: receipt.authorityFingerprint,
    objectIds: receipt.artifacts.derivedObjects.map((object) => object.identity.objectId),
    contentHashes: receipt.artifacts.derivedObjects.map((object) => object.identity.contentHash),
    relationshipIds: receipt.artifacts.relationships.map((edge) => edge.relationshipId),
    hubObjectIds: receipt.artifacts.hubCompact.objects.map((object) => object.objectId),
  };
}

function withTempFixture(run) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cg-intelligence-ingest-'));
  return (async () => {
    try {
      return await run(tempRoot);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  })();
}

async function testDryRunHappyPathRealMission() {
  await withTempFixture(async (tempRoot) => {
    const fixture = writeAuthoritativeHandoffFixture(tempRoot);
    const receipt = await runIntelligenceIngest({
      handoff: fixture.handoff,
      handoffPath: fixture.handoffPath,
      mode: 'dry-run',
      repoRoot: tempRoot,
      outputRoot: path.join(tempRoot, 'dry-run-out'),
      generatedAt: '2026-08-17T03:00:02.000Z',
    });

    assert.equal(receipt.verdict, 'INGEST_DRY_RUN_PASS');
    assert.equal(receipt.evidenceReality, 'REAL');
    assert.equal(receipt.firstRealMissionEligible, true);
    assert.equal(receipt.acceptance.HANDOFF_VALIDATION_PASS, true);
    assert.equal(receipt.acceptance.CLOSEOUT_HASH_VERIFICATION_PASS, true);
    assert.equal(receipt.acceptance.FIRST_REAL_MISSION_HUB_PROOF, 'WAITING_FOR_SHARED_DEV_HUB_READBACK');
    assert.equal(receipt.writes.lDrive, false);
    assert.equal(receipt.writes.zDrive, false);
    assert.equal(receipt.writes.supabase, false);
    assert.ok(receipt.artifacts.derivedObjects.length >= 1);
    for (const object of receipt.artifacts.derivedObjects) {
      assert.equal(object.authority.authorityClass, 'DERIVED_INTELLIGENCE');
      assert.equal(object.authority.progressionAuthority, false);
    }
    assert.ok(fs.existsSync(path.join(receipt.outputDir, 'ingest-receipt-v1.json')));
  });
}

async function testDeterministicIdentityParity() {
  await withTempFixture(async (tempRoot) => {
    const fixture = writeAuthoritativeHandoffFixture(tempRoot);
    const outputRoot = path.join(tempRoot, 'dry-run-out');
    const first = await runIntelligenceIngest({
      handoff: fixture.handoff,
      mode: 'dry-run',
      repoRoot: tempRoot,
      outputRoot,
      generatedAt: '2026-08-17T03:00:02.000Z',
    });
    const second = await runIntelligenceIngest({
      handoff: fixture.handoff,
      mode: 'dry-run',
      repoRoot: tempRoot,
      outputRoot,
      generatedAt: '2026-08-17T03:00:02.000Z',
    });
    assert.deepEqual(captureIdentity(first), captureIdentity(second));
  });
}

async function testDestroyAndRebuildIdentityParity() {
  await withTempFixture(async (tempRoot) => {
    const fixture = writeAuthoritativeHandoffFixture(tempRoot);
    const outputRoot = path.join(tempRoot, 'dry-run-out');
    const first = await runIntelligenceIngest({
      handoff: fixture.handoff,
      mode: 'dry-run',
      repoRoot: tempRoot,
      outputRoot,
      generatedAt: '2026-08-17T03:00:02.000Z',
    });
    const identityBefore = captureIdentity(first);
    fs.rmSync(outputRoot, { recursive: true, force: true });
    const rebuilt = await runIntelligenceIngest({
      handoff: fixture.handoff,
      mode: 'dry-run',
      repoRoot: tempRoot,
      outputRoot,
      generatedAt: '2026-08-17T03:00:02.000Z',
    });
    assert.deepEqual(captureIdentity(rebuilt), identityBefore);
  });
}

async function testTamperedCloseoutFailsBeforeProjection() {
  await withTempFixture(async (tempRoot) => {
    const fixture = writeAuthoritativeHandoffFixture(tempRoot);
    fs.appendFileSync(fixture.closeoutPath, '\n');
    await assert.rejects(
      () =>
        runIntelligenceIngest({
          handoff: fixture.handoff,
          mode: 'dry-run',
          repoRoot: tempRoot,
          outputRoot: path.join(tempRoot, 'out'),
        }),
      (error) => error.code === 'CLOSEOUT_HASH_MISMATCH',
    );
  });
}

async function testAuthorityFingerprintMismatchFailsBeforeProjection() {
  await withTempFixture(async (tempRoot) => {
    const fixture = writeAuthoritativeHandoffFixture(tempRoot);
    fixture.handoff.authorityFingerprint = 'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc';
    await assert.rejects(
      () =>
        runIntelligenceIngest({
          handoff: fixture.handoff,
          mode: 'dry-run',
          repoRoot: tempRoot,
          outputRoot: path.join(tempRoot, 'out'),
        }),
      (error) => error.code === 'AUTHORITY_FINGERPRINT_MISMATCH',
    );
  });
}

async function testProducerDerivedObjectsFailBeforeProjection() {
  await withTempFixture(async (tempRoot) => {
    const fixture = writeAuthoritativeHandoffFixture(tempRoot);
    const polluted = {
      ...fixture.handoff,
      derivedObjects: [{ objectId: 'oi:illegal-from-producer' }],
    };
    const schema = validateHandoffSchema(polluted);
    assert.equal(schema.ok, false);
    await assert.rejects(
      () =>
        runIntelligenceIngest({
          handoff: polluted,
          mode: 'dry-run',
          repoRoot: tempRoot,
          outputRoot: path.join(tempRoot, 'out'),
        }),
      (error) => error.code === 'HANDOFF_SCHEMA_INVALID',
    );
  });
}

async function testRawCloseoutBodyNotCopiedIntoLedgerOrHub() {
  await withTempFixture(async (tempRoot) => {
    const fixture = writeAuthoritativeHandoffFixture(tempRoot);
    const closeoutBytes = fs.readFileSync(fixture.closeoutPath, 'utf8');
    const receipt = await runIntelligenceIngest({
      handoff: fixture.handoff,
      mode: 'dry-run',
      repoRoot: tempRoot,
      outputRoot: path.join(tempRoot, 'out'),
      generatedAt: '2026-08-17T03:00:02.000Z',
    });
    const ledgerText = JSON.stringify(receipt.artifacts.missionLedger);
    const hubText = JSON.stringify(receipt.artifacts.hubCompact);
    assert.equal(ledgerText.includes(closeoutBytes.trim()), false);
    assert.equal(hubText.includes(closeoutBytes.trim()), false);
  });
}

async function testFixtureEvidenceRealityDoesNotAdvanceFirstRealMission() {
  await withTempFixture(async (tempRoot) => {
    const fixture = writeAuthoritativeHandoffFixture(tempRoot, {
      workPackageId: 'ephemeral-intelligence-contract-fixture-v1',
      closeout: buildMaterialCloseout({ workPackageId: 'ephemeral-intelligence-contract-fixture-v1' }),
    });
    const receipt = await runIntelligenceIngest({
      handoff: fixture.handoff,
      mode: 'dry-run',
      repoRoot: tempRoot,
      outputRoot: path.join(tempRoot, 'out'),
      generatedAt: '2026-08-17T03:00:02.000Z',
    });
    assert.equal(receipt.evidenceReality, 'FIXTURE');
    assert.equal(receipt.firstRealMissionEligible, false);
    assert.equal(receipt.acceptance.FIRST_REAL_MISSION_HUB_PROOF, 'WAITING_FOR_REAL_MISSION');
  });
}

async function testProofWaveEvidenceRejectedFromRealMissionEligibility() {
  await withTempFixture(async (tempRoot) => {
    const workPackageId = 'sdlc-proof-wave-closeout-v1';
    const closeout = buildProofWaveCloseout({ workPackageId, prepare: { classification: { executionMode: 'MILESTONE_WAVE' } } });
    const fixture = writeAuthoritativeHandoffFixture(tempRoot, {
      workPackageId,
      closeout,
      material: true,
    });
    const receipt = await runIntelligenceIngest({
      handoff: fixture.handoff,
      mode: 'dry-run',
      repoRoot: tempRoot,
      outputRoot: path.join(tempRoot, 'out'),
      generatedAt: '2026-08-17T03:00:02.000Z',
    });
    assert.equal(receipt.evidenceReality, 'FIXTURE');
    assert.equal(receipt.firstRealMissionEligible, false);
    assert.equal(receipt.acceptance.FIRST_REAL_MISSION_HUB_PROOF, 'WAITING_FOR_REAL_MISSION');
  });
}

async function testSharedDevHubStructuralMode() {
  await withTempFixture(async (tempRoot) => {
    const fixture = writeAuthoritativeHandoffFixture(tempRoot);
    const receipt = await runIntelligenceIngest({
      handoff: fixture.handoff,
      mode: 'shared-dev-hub',
      repoRoot: tempRoot,
      outputRoot: path.join(tempRoot, 'out'),
      generatedAt: '2026-08-17T03:00:02.000Z',
      writeEligibility: {
        approved: false,
        liveWrites: false,
        executable: false,
        reason: 'TEST_STRUCTURAL_ONLY',
      },
    });
    assert.equal(receipt.verdict, 'INGEST_SHARED_DEV_STRUCTURAL_PASS');
    assert.equal(receipt.writes.supabase, 'PLANNED_NOT_EXECUTED');
    assert.equal(receipt.hubPublication.executed, false);
    assert.deepEqual(receipt.hubPublication.plannedTargets, [
      'intelligence_hub.knowledge_objects',
      'intelligence_hub.relationships',
    ]);
    assert.equal(receipt.hubPublication.bodyHashReadbackRequired, true);
  });
}

async function testSharedDevHubMemoryStoreReadbackPass() {
  await withTempFixture(async (tempRoot) => {
    const fixture = writeAuthoritativeHandoffFixture(tempRoot);
    const store = createMemoryIntelligenceHubStore();
    const receipt = await runIntelligenceIngest({
      handoff: fixture.handoff,
      mode: 'shared-dev-hub',
      repoRoot: tempRoot,
      outputRoot: path.join(tempRoot, 'out'),
      generatedAt: '2026-08-17T03:00:02.000Z',
      hubStore: store,
      writeEligibility: {
        approved: true,
        liveWrites: true,
        executable: true,
        reason: null,
      },
    });
    assert.equal(receipt.verdict, 'INGEST_SHARED_DEV_HUB_READBACK_PASS');
    assert.equal(receipt.writes.supabase, 'SHARED_DEV_HUB_WRITTEN');
    assert.equal(receipt.hubPublication.executed, true);
    assert.equal(receipt.acceptance.SHARED_DEV_KNOWLEDGE_OBJECT_WRITTEN, true);
    assert.equal(receipt.acceptance.RELATIONSHIP_WRITTEN, true);
    assert.equal(receipt.acceptance.HUB_BODY_HASH_READBACK_MATCH, true);
    assert.equal(receipt.acceptance.RETRIEVAL_SUCCESSFUL, true);
    assert.equal(receipt.acceptance.FIRST_REAL_MISSION_HUB_PROOF, 'FIRST_REAL_MISSION_HUB_PROOF_PASS');
  });
}

async function testProvenanceReconstructionPass() {
  await withTempFixture(async (tempRoot) => {
    const fixture = writeAuthoritativeHandoffFixture(tempRoot);
    const receipt = await runIntelligenceIngest({
      handoff: fixture.handoff,
      mode: 'dry-run',
      repoRoot: tempRoot,
      outputRoot: path.join(tempRoot, 'out'),
      generatedAt: '2026-08-17T03:00:02.000Z',
    });
    assert.equal(receipt.acceptance.PROVENANCE_RECONSTRUCTION_PASS, true);
    assert.equal(receipt.artifacts.provenance.ok, true);
  });
}

async function testIdempotentReingestPassFlag() {
  await withTempFixture(async (tempRoot) => {
    const fixture = writeAuthoritativeHandoffFixture(tempRoot);
    const outputRoot = path.join(tempRoot, 'out');
    const first = await runIntelligenceIngest({
      handoff: fixture.handoff,
      mode: 'dry-run',
      repoRoot: tempRoot,
      outputRoot,
      generatedAt: '2026-08-17T03:00:02.000Z',
    });
    const second = await runIntelligenceIngest({
      handoff: fixture.handoff,
      mode: 'dry-run',
      repoRoot: tempRoot,
      outputRoot,
      generatedAt: '2026-08-17T03:00:02.000Z',
    });
    assert.deepEqual(captureIdentity(first), captureIdentity(second));
    assert.ok(fs.existsSync(dryRunLedgerDir(first.ledgerId, outputRoot)));
  });
}

async function testCorrelationProjectionOnHubCompact() {
  await withTempFixture(async (tempRoot) => {
    const fixture = writeAuthoritativeHandoffFixture(tempRoot);
    const receipt = await runIntelligenceIngest({
      handoff: fixture.handoff,
      handoffPath: fixture.handoffPath,
      mode: 'dry-run',
      repoRoot: tempRoot,
      outputRoot: path.join(tempRoot, 'dry-run-out'),
      generatedAt: '2026-08-17T03:00:02.000Z',
    });
    const hubObject = receipt.artifacts.hubCompact.objects[0];
    assert.ok(hubObject.correlation);
    assert.match(hubObject.correlation.markerSetHash, /^sha256:[0-9a-f]{64}$/);
    assert.ok(hubObject.correlation.markers.includes('capability:CACHE'));
    assert.ok(hubObject.correlation.markers.includes('repo:CG-AppBuilder-MCP'));
    assert.ok(
      receipt.artifacts.relationships.some((edge) => edge.relationship === 'USED_CAPABILITY'),
    );
    assert.ok(receipt.artifacts.relationships.some((edge) => edge.relationship === 'CHAINED_BY'));
  });
}

const tests = [
  ['dry-run happy path real mission', testDryRunHappyPathRealMission],
  ['deterministic identity parity', testDeterministicIdentityParity],
  ['destroy and rebuild identity parity', testDestroyAndRebuildIdentityParity],
  ['tampered closeout fails before projection', testTamperedCloseoutFailsBeforeProjection],
  ['authority fingerprint mismatch fails before projection', testAuthorityFingerprintMismatchFailsBeforeProjection],
  ['producer derived objects fail before projection', testProducerDerivedObjectsFailBeforeProjection],
  ['raw closeout body not copied into ledger or hub', testRawCloseoutBodyNotCopiedIntoLedgerOrHub],
  ['fixture evidenceReality does not advance first real mission', testFixtureEvidenceRealityDoesNotAdvanceFirstRealMission],
  ['proof-wave evidence rejected from real mission eligibility', testProofWaveEvidenceRejectedFromRealMissionEligibility],
  ['shared-dev hub structural mode', testSharedDevHubStructuralMode],
  ['shared-dev hub memory store readback pass', testSharedDevHubMemoryStoreReadbackPass],
  ['provenance reconstruction pass', testProvenanceReconstructionPass],
  ['idempotent re-ingest identity parity', testIdempotentReingestPassFlag],
  ['correlation projection on hub compact', testCorrelationProjectionOnHubCompact],
];

let passed = 0;
for (const [name, fn] of tests) {
  await fn();
  passed += 1;
  console.log(`ok - ${name}`);
}
console.log(`\n${passed}/${tests.length} intelligence ingest tests passed`);
