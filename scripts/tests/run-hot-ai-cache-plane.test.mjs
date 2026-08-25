#!/usr/bin/env node
/**
 * Hot AI cache plane — the first rung of the unified retrieval ladder.
 * Exercises the real SHA-freshness logic via the Z:-authority env override
 * (resolveZCacheRoot honors CG_AI_CACHE_AUTHORITY_ROOT), since the physical
 * per-host replica paths (S:/D:/C: "AI Cursur Cache") have no override and
 * genuinely don't exist in this container -- that absence is itself asserted
 * below, not worked around.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  ALL_KNOWN_CACHE_HOST_IDS,
  CACHE_BUNDLE_REL,
  CACHE_STATUS,
  resolveMissionIntelligenceCacheRoot,
  testHotAiCachePlane,
} from '../intelligence/lib/hot-ai-cache-plane-v1.mjs';
import { resolveHostHotCacheRoot } from '../harvest/lib/host-ai-cache-fanout-lib.mjs';
import { getCrossAgentIndexedSha } from '../intelligence/lib/repo-state-v1.mjs';

function withTempCacheRoot(fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hot-ai-cache-test-'));
  try {
    return fn(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function writeBundle(root, payload) {
  const bundlePath = path.join(root, CACHE_BUNDLE_REL);
  fs.mkdirSync(path.dirname(bundlePath), { recursive: true });
  fs.writeFileSync(bundlePath, JSON.stringify(payload));
}

function testCacheRootUnavailableInThisContainer() {
  // No CG_AI_CACHE_AUTHORITY_ROOT override, no physical S:/D:/C: mount --
  // this container genuinely has none of the real cache roots.
  const resolved = resolveMissionIntelligenceCacheRoot({});
  assert.equal(resolved, null);

  const result = testHotAiCachePlane({ env: {} });
  assert.equal(result.plane, 'HOT_AI_CACHE');
  assert.equal(result.available, false);
  assert.equal(result.cacheStatus, CACHE_STATUS.CACHE_ROOT_UNAVAILABLE);
}

function testCacheMissWhenRootExistsButBundleDoesNot() {
  withTempCacheRoot((root) => {
    const result = testHotAiCachePlane({ env: { CG_AI_CACHE_AUTHORITY_ROOT: root } });
    assert.equal(result.available, false);
    assert.equal(result.cacheStatus, CACHE_STATUS.CACHE_MISS);
    assert.equal(result.root, root);
  });
}

function testCacheHitStaleWhenShaDoesNotMatchAuthority() {
  withTempCacheRoot((root) => {
    writeBundle(root, {
      provenance: { indexedSha: 'a'.repeat(40) },
      bundle: { bundleSource: 'HOT_AI_CACHE_TEST' },
    });
    const result = testHotAiCachePlane({ env: { CG_AI_CACHE_AUTHORITY_ROOT: root } });
    assert.equal(result.available, false, 'a stale hit must not satisfy the ladder rung');
    assert.equal(result.cacheStatus, CACHE_STATUS.CACHE_HIT_STALE);
    assert.equal(result.cachedSha, 'a'.repeat(40));
    assert.ok(result.authoritySha, 'must have compared against a real authority SHA');
    assert.notEqual(result.cachedSha, result.authoritySha);
  });
}

function testCacheHitFreshWhenShaMatchesAuthority() {
  const authoritySha = getCrossAgentIndexedSha();
  assert.ok(authoritySha, 'this test must run inside a real git checkout to be meaningful');

  withTempCacheRoot((root) => {
    const bundle = { bundleSource: 'HOT_AI_CACHE_TEST', knownFailures: [{ entityId: 'fixture-1' }] };
    writeBundle(root, { provenance: { indexedSha: authoritySha }, bundle });
    const result = testHotAiCachePlane({ env: { CG_AI_CACHE_AUTHORITY_ROOT: root } });
    assert.equal(result.available, true, 'a fresh hit must satisfy the ladder rung');
    assert.equal(result.cacheStatus, CACHE_STATUS.CACHE_HIT_FRESH);
    assert.equal(result.cachedSha, authoritySha);
    assert.deepEqual(result.bundle, bundle, 'a fresh hit must return the cached bundle, not recompute one');
  });
}

function testScopedQueryDoesNotConsumeAFreshHit() {
  // Bugbot finding: a fresh hit was returned unconditionally, silently
  // ignoring the caller's concepts/repos filters. The cached bundle's own
  // compilation scope isn't verifiable from this repo, so a scoped query
  // must not be satisfied by it -- cacheStatus still reports real freshness.
  const authoritySha = getCrossAgentIndexedSha();
  withTempCacheRoot((root) => {
    const bundle = { bundleSource: 'HOT_AI_CACHE_TEST' };
    writeBundle(root, { provenance: { indexedSha: authoritySha }, bundle });

    const unscoped = testHotAiCachePlane({ env: { CG_AI_CACHE_AUTHORITY_ROOT: root } });
    assert.equal(unscoped.available, true, 'an unscoped query may still use a fresh hit');
    assert.equal(unscoped.cacheStatus, CACHE_STATUS.CACHE_HIT_FRESH);
    assert.equal(unscoped.scopeApplicable, true);
    assert.deepEqual(unscoped.bundle, bundle);

    const scoped = testHotAiCachePlane({ env: { CG_AI_CACHE_AUTHORITY_ROOT: root }, concepts: ['some-specific-concept'] });
    assert.equal(scoped.available, false, 'a scoped query must not be satisfied by an unfiltered cache hit');
    assert.equal(scoped.cacheStatus, CACHE_STATUS.CACHE_HIT_FRESH, 'the cache itself is still honestly reported as fresh');
    assert.equal(scoped.scopeApplicable, false);
    // Bugbot follow-up finding: available:false alone isn't enough -- this
    // whole object is serialized into laneChecks/preflight receipts, so the
    // unscoped bundle must not be reachable through that side channel either.
    assert.equal(scoped.bundle, undefined, 'a scoped miss must not leak the unfiltered bundle into the lane-check record');
  });
}

function testAllKnownHostsIncludeRyzen9Desk() {
  // Bugbot finding: resolution only walked DEFAULT_SYNC_HOSTS
  // (wesley_work, wesleydesk), a publish-fanout default that omits
  // RYZEN9DESK even though it has a real defined hot-cache path.
  assert.ok(ALL_KNOWN_CACHE_HOST_IDS.includes('RYZEN9DESK'));
  assert.ok(ALL_KNOWN_CACHE_HOST_IDS.includes('WESLEY_WORK'));
  assert.ok(ALL_KNOWN_CACHE_HOST_IDS.includes('WESLEYDESK'));
  // The real resolver must not throw for the host that was previously
  // never even attempted -- it genuinely has no mount in this container,
  // so the honest result is null, not a crash.
  assert.equal(resolveHostHotCacheRoot('RYZEN9DESK'), null);
}

function testAuthoritySourceCommitFieldIsAlsoAccepted() {
  // The real, pre-existing Z-cache publication receipt schema
  // (harvest-z-cache-publication-receipt-v1) names this field
  // authoritySourceCommit, not indexedSha -- both must be honored so this
  // plane can read either shape.
  const authoritySha = getCrossAgentIndexedSha();
  withTempCacheRoot((root) => {
    writeBundle(root, { authoritySourceCommit: authoritySha, bundle: { bundleSource: 'HOT_AI_CACHE_TEST' } });
    const result = testHotAiCachePlane({ env: { CG_AI_CACHE_AUTHORITY_ROOT: root } });
    assert.equal(result.cacheStatus, CACHE_STATUS.CACHE_HIT_FRESH);
  });
}

const tests = [
  ['cache root unavailable in this container (no override, no physical mount)', testCacheRootUnavailableInThisContainer],
  ['cache miss when root exists but bundle file does not', testCacheMissWhenRootExistsButBundleDoesNot],
  ['cache hit stale when recorded SHA does not match authority', testCacheHitStaleWhenShaDoesNotMatchAuthority],
  ['cache hit fresh when recorded SHA matches authority', testCacheHitFreshWhenShaMatchesAuthority],
  ['a scoped query does not consume a fresh hit meant for an unscoped one', testScopedQueryDoesNotConsumeAFreshHit],
  ['all known cache hosts include RYZEN9DESK', testAllKnownHostsIncludeRyzen9Desk],
  ['authoritySourceCommit field (Z-cache receipt shape) is also accepted', testAuthoritySourceCommitFieldIsAlsoAccepted],
];

let passed = 0;
for (const [name, fn] of tests) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}
console.log(`\n${passed}/${tests.length} hot AI cache plane tests passed`);
