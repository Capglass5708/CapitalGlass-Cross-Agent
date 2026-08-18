#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildDerivedObjects, measureSemanticPreservation } from '../intelligence/lib/derived-object-builder-v1.mjs';
import { buildRelationshipEdges } from '../intelligence/lib/relationship-edge-builder-v1.mjs';
import {
  classifySemanticCandidates,
  SEMANTIC_KINDS,
} from '../intelligence/lib/semantic-classifier-v1.mjs';
import { countSemanticGraphAttachment } from '../intelligence/lib/semantic-relationship-builder-v1.mjs';
import { DERIVATION_VERSION } from '../intelligence/lib/constants.mjs';
import { buildLedgerId } from '../intelligence/lib/ids.mjs';
import { runIntelligenceIngest } from '../intelligence/lib/ingest-pipeline-v1.mjs';
import { writeAuthoritativeHandoffFixture } from '../intelligence/lib/test-fixture-handoff-v1.mjs';
import { replayW1Corpus } from '../intelligence/run-w1-corpus-replay-v1.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function buildFixtureContext(tempRoot, closeoutOverrides = {}) {
  const fixture = writeAuthoritativeHandoffFixture(tempRoot, { closeoutOverrides });
  const closeout = JSON.parse(fs.readFileSync(fixture.closeoutPath, 'utf8'));
  return { fixture, closeout };
}

async function testOperationalObjectsPreserved() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'w1-ops-'));
  try {
    const { fixture } = buildFixtureContext(tempRoot, {
      aiCacheHit: true,
      task: 'W1 semantic expansion regression mission',
      outcome: 'PASS',
    });
    const receipt = await runIntelligenceIngest({
      handoff: fixture.handoff,
      mode: 'dry-run',
      repoRoot: tempRoot,
      outputRoot: path.join(tempRoot, 'out'),
      generatedAt: '2026-08-18T01:00:00.000Z',
    });
    const kinds = receipt.artifacts.derivedObjects.map((o) => o.identity.kind);
    assert.ok(kinds.includes('MISSION_MEASUREMENT'));
    assert.ok(kinds.includes('RECEIPT_LEVERAGE_SIGNAL'));
    assert.ok(kinds.some((k) => SEMANTIC_KINDS.includes(k)));
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function testEverySemanticClassCanBeDerived() {
  const closeout = {
    workPackageId: 'w1-semantic-class-fixture-v1',
    task: 'Semantic class fixture mission with compounding outcome',
    outcome: 'PASS',
    proven: true,
    allGatesPass: true,
    promotion: { decision: 'PROMOTE_DEFAULT', allGatesPass: true },
    decisiveAnswer: 'YES',
    chatSummary: 'FI-20260814 incident root cause identified; next durable fix scout-default-wp-resolves-wr2-lock-v1',
    cheapestRedo: 'Re-run ingest dry-run',
    cheapSingleAgentOk: true,
    priorIntelligenceReused: true,
    crossRepoReuseProven: true,
    measuredWorkAvoided: true,
    duplicateExternalEffects: 2,
    falseReuseCount: 1,
    failedGates: ['EXAMPLE_GATE'],
    blockers: ['MAINTENANCE_BLOCKED'],
    correction: 'Operator corrected stale PI publication binding',
    protocolVersion: 'auto-v3.2',
    nextAction: 'Unified proposal output opportunity',
    primaryRepo: 'CG-AppBuilder-MCP',
    correlation: { markers: [{ capabilityId: 'CACHE_REUSE' }] },
  };
  const closeoutHash = `sha256:${'b'.repeat(64)}`;
  const ledger = {
    ledgerId: buildLedgerId(closeoutHash),
    workPackageId: closeout.workPackageId,
    closeoutHash,
    derivationVersion: DERIVATION_VERSION,
    evidenceRefs: [{ contentHash: closeoutHash, refKind: 'CLOSEOUT' }],
  };
  const handoff = {
    schema: 'intelligence-handoff-v1@1.0.0',
    workPackageId: closeout.workPackageId,
    closeoutRef: 'artifacts/agent-runs/w1/session-closeout-v3.2.json',
    closeoutHash,
    authorityFingerprint: `sha256:${'c'.repeat(64)}`,
    mission: { material: true, missionClass: 'fix', repo: 'CG-AppBuilder-MCP' },
  };
  const candidates = classifySemanticCandidates(closeout);
  const derivedObjects = buildDerivedObjects({
    ledger,
    handoff,
    closeout,
    evidenceReality: 'REAL',
    measurementQuality: 'MEASURED',
    generatedAt: '2026-08-18T01:00:00.000Z',
  });
  const preservation = measureSemanticPreservation(candidates, derivedObjects);
  assert.ok(preservation.semanticPreservationRatio >= 0.95);
  const relationships = buildRelationshipEdges({ ledger, derivedObjects, closeout, handoff });
  const attachment = countSemanticGraphAttachment(derivedObjects, relationships);
  assert.equal(attachment.orphans, 0);
  for (const kind of [
    'VERIFIED_TRUTH',
    'DECISION',
    'RESULT',
    'FAILURE',
    'ROOT_CAUSE',
    'REMEDIATION',
    'BLOCKER',
    'SUCCESS_PATTERN',
    'FASTER_PATH',
    'REPEATED_WORK',
    'RISK',
    'PROTOCOL_IMPROVEMENT',
    'CAPABILITY_SIGNAL',
    'FUTURE_OPPORTUNITY',
  ]) {
    assert.ok(derivedObjects.some((o) => o.identity.kind === kind), `missing kind ${kind}`);
  }
}

function testW1CorpusReplayGate() {
  const result = replayW1Corpus();
  assert.equal(result.gate.pass, true, JSON.stringify(result.gate, null, 2));
  assert.ok(result.corpusReplay.semanticPreservationRatio >= 0.95);
  assert.equal(result.corpusReplay.replayedCount, 10);
}

async function main() {
  await testOperationalObjectsPreserved();
  testEverySemanticClassCanBeDerived();
  testW1CorpusReplayGate();
  console.log('run-intelligence-semantic-expansion-w1.test.mjs: PASS');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
