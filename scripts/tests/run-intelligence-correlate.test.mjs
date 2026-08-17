#!/usr/bin/env node
/**
 * intelligence:correlate — exact marker intersection (skeleton default).
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { correlateByMarkers } from '../intelligence/correlate.mjs';
import { runIntelligenceIngest } from '../intelligence/lib/ingest-pipeline-v1.mjs';
import { writeAuthoritativeHandoffFixture } from '../intelligence/lib/test-fixture-handoff-v1.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function withTempFixture(run) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cg-intelligence-correlate-'));
  return (async () => {
    try {
      return await run(tempRoot);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  })();
}

async function testExactIntersectionMatchesCacheAndRepo() {
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
    const hubCompact = receipt.artifacts.hubCompact;
    const result = correlateByMarkers({
      hubCompact,
      requiredMarkers: ['capability:CACHE', 'repo:CG-AppBuilder-MCP'],
    });
    assert.ok(result.counts.matchingObjects >= 1);
    assert.equal(result.query.mode, 'exact-intersection');
  });
}

async function testNoMatchWhenMarkerMissing() {
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
    const result = correlateByMarkers({
      hubCompact: receipt.artifacts.hubCompact,
      requiredMarkers: ['subject:correlation-fabric', 'capability:NOT_A_REAL_CAPABILITY'],
    });
    assert.equal(result.counts.matchingObjects, 0);
  });
}

const tests = [
  ['exact intersection matches CACHE + repo', testExactIntersectionMatchesCacheAndRepo],
  ['no match when required marker absent', testNoMatchWhenMarkerMissing],
];

let passed = 0;
for (const [name, fn] of tests) {
  await fn();
  passed += 1;
  console.log(`ok - ${name}`);
}
console.log(`\n${passed}/${tests.length} intelligence correlate tests passed`);
