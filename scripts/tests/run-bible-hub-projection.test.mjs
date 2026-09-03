#!/usr/bin/env node
/**
 * Bible -> Intelligence Hub semantic projection: manifest shape + freshness-check
 * drift detection. Uses a real temporary docs/application-bible/ fixture (so
 * extraction runs against genuine files, not mocked content) and a mock Supabase
 * client for the "what's already published" side, so this suite needs no live
 * credentials and no network access.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

import {
  buildBibleProjectionManifest,
  checkBibleHubFreshness,
  BIBLE_KNOWLEDGE_DOMAIN,
} from '../intelligence/lib/bible-hub-projection-v1.mjs';

function withTempRepo(run) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cg-bible-hub-projection-'));
  return (async () => {
    try {
      return await run(tempRoot);
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
    }
  })();
}

function writeMinimalBible(repoRoot, { architectureText = 'Architecture: this app has two services, A and B, and depends on Postgres.' } = {}) {
  const bibleDir = path.join(repoRoot, 'docs/application-bible');
  fs.mkdirSync(bibleDir, { recursive: true });
  fs.writeFileSync(
    path.join(bibleDir, '00-TEST-APP-FULL-SUMMARY.md'),
    `# Summary\n\nThis app does real work for a real purpose across real workflows, and explicitly does not own billing.\n\n${architectureText}\n`,
  );
  execSync('git init -q', { cwd: repoRoot });
  execSync('git config user.email test@example.com', { cwd: repoRoot });
  execSync('git config user.name Test', { cwd: repoRoot });
  execSync('git add -A', { cwd: repoRoot });
  execSync('git commit -q -m "seed bible"', { cwd: repoRoot });
  return execSync('git rev-parse HEAD', { cwd: repoRoot, encoding: 'utf8' }).trim();
}

function mockStore(publishedRows) {
  return {
    client: {
      schema() {
        return {
          from() {
            const query = {
              _filters: {},
              select() {
                return query;
              },
              eq(key, value) {
                query._filters[key] = value;
                return key === 'authority_repository' || key === 'knowledge_domain'
                  ? query
                  : Promise.resolve({ data: publishedRows, error: null });
              },
              then(resolve) {
                resolve({ data: publishedRows, error: null });
              },
            };
            return query;
          },
        };
      },
    },
  };
}

async function testManifestShapeAndDeterminism() {
  await withTempRepo(async (repoRoot) => {
    const sha = writeMinimalBible(repoRoot);
    const manifest = await buildBibleProjectionManifest({ appKey: 'test-app', authorityRepository: 'test-app-repo', repoPath: repoRoot });
    assert.equal(manifest.ok, true);
    assert.equal(manifest.authorityCommit, sha);
    assert.ok(manifest.knowledgeObjects.length > 0);
    for (const row of manifest.knowledgeObjects) {
      assert.equal(row.knowledgeDomain, BIBLE_KNOWLEDGE_DOMAIN);
      assert.match(row._bodyHashForDiff, /^sha256:[0-9a-f]{64}$/);
      assert.equal(row.authorityRepository, 'test-app-repo');
      assert.equal(row.authorityCommit, sha);
      assert.equal(row.provenanceClass, 'VERIFIED');
    }
    // Determinism: rebuilding from unchanged content must produce the identical hash.
    const manifest2 = await buildBibleProjectionManifest({ appKey: 'test-app', authorityRepository: 'test-app-repo', repoPath: repoRoot });
    assert.deepEqual(
      manifest.knowledgeObjects.map((r) => r._bodyHashForDiff).sort(),
      manifest2.knowledgeObjects.map((r) => r._bodyHashForDiff).sort(),
    );
  });
}

async function testFreshnessDetectsStaleAfterRealContentChange() {
  await withTempRepo(async (repoRoot) => {
    const shaBefore = writeMinimalBible(repoRoot);
    const manifestBefore = await buildBibleProjectionManifest({ appKey: 'test-app', authorityRepository: 'test-app-repo', repoPath: repoRoot });
    // Simulate "already published" rows exactly matching the first commit.
    const publishedRows = manifestBefore.knowledgeObjects.map((r) => ({
      knowledge_object_id: r.knowledgeObjectId,
      body_hash: r._bodyHashForDiff,
      authority_commit: shaBefore,
    }));

    // Confirm CURRENT while nothing has changed.
    const storeUnchanged = mockStore(publishedRows);
    const freshUnchanged = await checkBibleHubFreshness({ authorityRepository: 'test-app-repo', repoPath: repoRoot, store: storeUnchanged });
    assert.equal(freshUnchanged.verdict, 'ALL_CURRENT');
    assert.equal(freshUnchanged.staleCount, 0);

    // Now make a REAL change to the Bible content and commit it -- not a fabricated
    // diff, an actual file edit + git commit, same as production usage.
    fs.writeFileSync(
      path.join(repoRoot, 'docs/application-bible/00-TEST-APP-FULL-SUMMARY.md'),
      '# Summary\n\nThis app does real work for a real purpose across real workflows, and explicitly does not own billing.\n\nArchitecture: this app now has three services, A, B, and C, and depends on Postgres and Redis.\n',
    );
    execSync('git add -A', { cwd: repoRoot });
    execSync('git commit -q -m "architecture change"', { cwd: repoRoot });

    const storeStale = mockStore(publishedRows); // still reports the OLD published state
    const freshStale = await checkBibleHubFreshness({ authorityRepository: 'test-app-repo', repoPath: repoRoot, store: storeStale });
    assert.equal(freshStale.verdict, 'DRIFT_DETECTED');
    assert.ok(freshStale.staleCount >= 1);
    const architectureResult = freshStale.results.find((r) => r.knowledgeObjectId.includes(':5:'));
    assert.equal(architectureResult.verdict, 'STALE');
    assert.equal(architectureResult.storedAuthorityCommit, shaBefore);
    assert.notEqual(architectureResult.liveAuthorityCommit, shaBefore);
  });
}

async function testFreshnessDetectsMissingWhenPublishedDomainNoLongerExtractable() {
  await withTempRepo(async (repoRoot) => {
    writeMinimalBible(repoRoot);
    const publishedRows = [
      { knowledge_object_id: 'bible:test-app-repo:5:architecture', body_hash: 'sha256:' + '0'.repeat(64), authority_commit: '0'.repeat(40) },
      { knowledge_object_id: 'bible:test-app-repo:999:not-a-real-domain', body_hash: 'sha256:' + '1'.repeat(64), authority_commit: '0'.repeat(40) },
    ];
    const store = mockStore(publishedRows);
    const result = await checkBibleHubFreshness({ authorityRepository: 'test-app-repo', repoPath: repoRoot, store });
    assert.equal(result.verdict, 'DRIFT_DETECTED');
    const missing = result.results.find((r) => r.knowledgeObjectId.includes(':999:'));
    assert.equal(missing.verdict, 'MISSING');
  });
}

const tests = [
  ['manifest shape is correct and deterministic for unchanged content', testManifestShapeAndDeterminism],
  ['freshness check detects STALE after a real content change and commit', testFreshnessDetectsStaleAfterRealContentChange],
  ['freshness check detects MISSING for a domain no longer extractable', testFreshnessDetectsMissingWhenPublishedDomainNoLongerExtractable],
];

let passed = 0;
for (const [name, fn] of tests) {
  await fn();
  passed += 1;
  console.log(`ok - ${name}`);
}
console.log(`\n${passed}/${tests.length} bible-hub-projection tests passed`);
