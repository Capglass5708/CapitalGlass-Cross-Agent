/**
 * Hot AI cache plane — the first-checked rung in intelligence.preflight()'s
 * retrieval ladder, ahead of L:. Reuses the existing, already-proven host/root
 * resolution from the harvest AI-cache pipeline (Z: canonical authority, then
 * per-host read-through replicas — see host-ai-cache-fanout-lib.mjs's own
 * comment: "Z remains sole writer; host roots are read-through replicas")
 * rather than inventing a new one.
 *
 * A cache hit is only ever treated as usable if its recorded source SHA still
 * matches Cross-Agent's own current authority SHA — TTL alone is not enough.
 * This is stricter than the hot-cache dataset registry's platform-wide
 * freshnessClass/defaultTtlSeconds model (registry/datasets/hot-cache-dataset-registry.v1.json),
 * which this file deliberately does not modify: that taxonomy is shared by
 * ~20 unrelated datasets this repo doesn't own the freshness semantics of.
 * SHA verification is scoped here, to the one dataset (mission-intelligence)
 * this repo does own.
 *
 * The exact per-dataset bundle file location under a resolved cache root is a
 * best-effort convention (mirroring the L: drive's 00-master-index/BY-KIND/
 * layout already used elsewhere in this repo) — this repo owns the dataset's
 * registration and freshness contract, but the physical compiler that writes
 * this file lives in CG-AppBuilder-MCP and this exact path hasn't been
 * verified against it from this container. See registry/mission-intelligence/README.md.
 */
import fs from 'node:fs';
import path from 'node:path';

import { resolveZCacheRoot } from '../../harvest/lib/z-cache-publication-adapter-lib.mjs';
import {
  resolveHostHotCacheRoot,
  DEFAULT_SYNC_HOSTS,
  normalizeSyncHostId,
} from '../../harvest/lib/host-ai-cache-fanout-lib.mjs';
import { getCrossAgentIndexedSha } from './repo-state-v1.mjs';

export const CACHE_BUNDLE_REL = '00-master-index/BY-KIND/mission-intelligence.json';

export const CACHE_STATUS = {
  CACHE_HIT_FRESH: 'CACHE_HIT_FRESH',
  CACHE_HIT_STALE: 'CACHE_HIT_STALE',
  CACHE_MISS: 'CACHE_MISS',
  CACHE_ROOT_UNAVAILABLE: 'CACHE_ROOT_UNAVAILABLE',
};

function loadJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

/** Z: is the sole-writer canonical authority; host roots are read-through replicas. */
export function resolveMissionIntelligenceCacheRoot(env = process.env) {
  const zRoot = resolveZCacheRoot(env);
  if (zRoot && fs.existsSync(zRoot)) {
    return { root: zRoot, source: 'Z_CACHE_AUTHORITY' };
  }

  for (const rawHostId of DEFAULT_SYNC_HOSTS) {
    const hostId = normalizeSyncHostId(rawHostId);
    const hostRoot = hostId ? resolveHostHotCacheRoot(hostId) : null;
    if (hostRoot) {
      return { root: hostRoot, source: `HOST_REPLICA_${hostId}` };
    }
  }
  return null;
}

/**
 * Physically test the hot AI cache: resolve a root, look for the compiled
 * mission-intelligence bundle, and apply the freshness rule above. Never
 * throws — degrades to CACHE_ROOT_UNAVAILABLE outside an environment with the
 * physical cache mounted (true of this container; real hosts have it at
 * S:/D:/C: \"AI Cursur Cache\" or the canonical Z: authority).
 */
export function testHotAiCachePlane({ env = process.env } = {}) {
  const resolved = resolveMissionIntelligenceCacheRoot(env);
  if (!resolved) {
    return { plane: 'HOT_AI_CACHE', available: false, cacheStatus: CACHE_STATUS.CACHE_ROOT_UNAVAILABLE };
  }

  const bundlePath = path.join(resolved.root, CACHE_BUNDLE_REL);
  const cached = loadJsonSafe(bundlePath);
  if (!cached) {
    return {
      plane: 'HOT_AI_CACHE',
      available: false,
      cacheStatus: CACHE_STATUS.CACHE_MISS,
      root: resolved.root,
      rootSource: resolved.source,
    };
  }

  const cachedSha = cached.provenance?.indexedSha ?? cached.authoritySourceCommit ?? cached.indexedSha ?? null;
  const authoritySha = getCrossAgentIndexedSha();
  const fresh = Boolean(cachedSha) && Boolean(authoritySha) && cachedSha === authoritySha;

  return {
    plane: 'HOT_AI_CACHE',
    available: fresh,
    cacheStatus: fresh ? CACHE_STATUS.CACHE_HIT_FRESH : CACHE_STATUS.CACHE_HIT_STALE,
    root: resolved.root,
    rootSource: resolved.source,
    cachedSha,
    authoritySha,
    bundle: fresh ? cached.bundle ?? cached : undefined,
  };
}
