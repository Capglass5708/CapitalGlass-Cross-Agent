/**
 * Application Bible -> Intelligence Hub semantic projection.
 *
 * The repo's docs/application-bible/ tree stays canonical (Model B, per
 * docs/APPLICATION_BIBLE_V2_SEMANTIC_STANDARD.md in CG-AppBuilder-MCP). This module
 * projects it into discrete, individually retrievable knowledge_objects -- one per
 * passing semantic domain, never the whole Bible as a single blob -- so an agent
 * asking "what's this app's MCP surface" can retrieve exactly that domain instead of
 * loading the entire document. Every object carries authority_repository /
 * authority_path / authority_commit pointing back to the exact Bible source and Git
 * SHA it was extracted from.
 *
 * Reuses, does not reimplement: CG-AppBuilder-MCP's extractDomainContent() (the same
 * file-matching/validity logic the Bible V2 validator itself uses -- a domain can
 * only be projected here if the validator would also pass it) and Cross-Agent's own
 * createLiveIntelligenceHubStore() (the same generic Supabase store already proven
 * live for operational-intelligence publication).
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveAppBuilderRoot } from '../../index/lib/resolve-repo-roots.mjs';
import { sha256Hex } from '../../harvest/lib/hash.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');

export const BIBLE_KNOWLEDGE_DOMAIN = 'APPLICATION_BIBLE';

function repoAnchorId(repo) {
  return `oi:repository:${String(repo).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function domainSlug(domainName) {
  return String(domainName).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function domainObjectId(authorityRepository, domainId, domainName) {
  return `bible:${authorityRepository.toLowerCase().replace(/[^a-z0-9]+/g, '-')}:${domainId}:${domainSlug(domainName)}`;
}

async function loadAppBuilderResolver() {
  const appBuilderRoot = resolveAppBuilderRoot(REPO_ROOT);
  const modulePath = path.join(
    appBuilderRoot,
    'scripts/claude-40/lib/claude-40-application-bible-resolver-v1.mjs',
  );
  if (!fs.existsSync(modulePath)) {
    throw new Error(`CG_APPBUILDER_MCP_ROOT_NOT_FOUND:${modulePath}`);
  }
  return import(modulePath);
}

function resolveGitSha(repoPath) {
  return execSync('git rev-parse HEAD', { cwd: repoPath, encoding: 'utf8' }).trim();
}

/**
 * Extracts the current, live per-domain Bible content for a repo and shapes it into
 * the generic knowledgeObjects/relationships row shape createLiveIntelligenceHubStore
 * expects. Pure read -- no publish, no side effects.
 */
export async function buildBibleProjectionManifest({ appKey, authorityRepository, repoPath }) {
  const { extractDomainContent } = await loadAppBuilderResolver();
  const extraction = extractDomainContent(repoPath);
  if (!extraction.found) {
    return { ok: false, reason: extraction.reason ?? 'BIBLE_NOT_FOUND', appKey, authorityRepository };
  }

  const authorityCommit = resolveGitSha(repoPath);
  const generatedAt = new Date().toISOString();
  const repoAnchor = repoAnchorId(authorityRepository);

  const knowledgeObjects = extraction.domains.map((d) => {
    const bodyHash = `sha256:${sha256Hex(d.content)}`;
    return {
      knowledgeObjectId: domainObjectId(authorityRepository, d.domainId, d.domainName),
      knowledgeDomain: BIBLE_KNOWLEDGE_DOMAIN,
      knowledgeObjectType: d.domainName,
      bodyHash,
      schemaHash: null,
      canonicalizationVersion: 'bible-semantic-projection-v1@1.0.0',
      provenanceClass: 'VERIFIED',
      placementState: 'INDEXED',
      authoritySystem: 'github',
      authorityRepository,
      authorityPath: d.matchedFiles.join(','),
      authorityCommit,
      objectStorePath: null,
      cacheEligibility: 'eligible',
      freshnessState: 'CURRENT',
      metadata: {
        appKey,
        domainId: d.domainId,
        domainName: d.domainName,
        contentChars: d.content.length,
        extractedAt: generatedAt,
        sourceStandard: 'APPLICATION_BIBLE_V2_SEMANTIC_STANDARD',
      },
      // Not written to the DB directly (toDbKnowledge doesn't map this) -- carried
      // through the manifest for the caller to diff against prior published rows.
      _bodyHashForDiff: bodyHash,
    };
  });

  const relationships = extraction.domains.map((d) => {
    const fromId = domainObjectId(authorityRepository, d.domainId, d.domainName);
    const relationshipId = `rel:bible-about:${fromId}`;
    return {
      relationshipId,
      relationshipType: 'ABOUT',
      fromDomain: BIBLE_KNOWLEDGE_DOMAIN,
      fromObjectId: fromId,
      toDomain: 'OPERATIONAL_INTELLIGENCE',
      toObjectId: repoAnchor,
      authorityRepository,
      authorityCommit,
      verificationState: 'VERIFIED',
      relationshipHash: `sha256:${sha256Hex(JSON.stringify({ relationshipId, fromId, toObjectId: repoAnchor }))}`,
      metadata: { appKey, domainId: d.domainId, domainName: d.domainName },
    };
  });

  return {
    ok: true,
    appKey,
    authorityRepository,
    authorityCommit,
    canonicalDirRelative: extraction.canonicalDirRelative,
    generatedAt,
    knowledgeObjects,
    relationships,
  };
}

/**
 * Publishes a Bible projection manifest through the shared live Hub store, with a
 * lightweight version-history append (metadata.priorVersion) when a domain's content
 * actually changed since the last publish -- an audit trail without a schema change.
 * Reads existing rows via the same client the store already authenticated, so no
 * second connection is opened.
 */
export async function publishBibleProjection({ manifest, store }) {
  if (!manifest.ok) {
    return { ok: false, verdict: 'BIBLE_PROJECTION_SKIPPED', reason: manifest.reason };
  }
  if (store.kind !== 'live') {
    return { ok: false, verdict: 'HUB_STORE_UNAVAILABLE', storeKind: store.kind };
  }

  for (const row of manifest.knowledgeObjects) {
    const { data: existing } = await store.client
      .schema('intelligence_hub')
      .from('knowledge_objects')
      .select('body_hash, authority_commit, metadata')
      .eq('knowledge_object_id', row.knowledgeObjectId)
      .maybeSingle();
    if (existing && existing.body_hash !== row._bodyHashForDiff) {
      const priorVersions = Array.isArray(existing.metadata?.priorVersions) ? existing.metadata.priorVersions : [];
      row.metadata = {
        ...row.metadata,
        priorVersions: [
          ...priorVersions,
          { bodyHash: existing.body_hash, authorityCommit: existing.authority_commit, supersededAt: manifest.generatedAt },
        ].slice(-10),
      };
    }
    delete row._bodyHashForDiff;
  }

  const upsert = await store.upsertProjection(manifest);
  const readback = await store.readbackProjection(manifest);

  return {
    ok: upsert.knowledge.rejected === 0 && upsert.relationships.rejected === 0 && readback.ok,
    verdict:
      upsert.knowledge.rejected > 0 || upsert.relationships.rejected > 0
        ? 'BIBLE_HUB_PROJECTION_BLOCKED'
        : readback.ok
          ? 'BIBLE_HUB_PROJECTION_READBACK_PASS'
          : 'BIBLE_HUB_PROJECTION_READBACK_FAIL',
    appKey: manifest.appKey,
    authorityRepository: manifest.authorityRepository,
    authorityCommit: manifest.authorityCommit,
    domainCount: manifest.knowledgeObjects.length,
    upsert,
    readback,
  };
}

/**
 * Freshness check -- the "one improvement": re-extracts the LIVE Bible content for a
 * repo and compares each published knowledge_object's stored authority_commit/
 * body_hash against what the repo actually contains right now. Never trusts that a
 * past publish is still true; this is the same authority-vs-live-HEAD discipline as
 * scripts/index/freshness-gate.mjs, applied to Bible-derived objects.
 *
 * store may be a live store (real Supabase read) or any object exposing an
 * equivalent `client.schema('intelligence_hub').from('knowledge_objects').select()`
 * -- kept generic so this is unit-testable without live credentials.
 */
export async function checkBibleHubFreshness({ authorityRepository, repoPath, store }) {
  const live = await buildBibleProjectionManifest({ appKey: null, authorityRepository, repoPath });
  const liveById = new Map((live.ok ? live.knowledgeObjects : []).map((o) => [o.knowledgeObjectId, o]));

  const { data: published, error } = await store.client
    .schema('intelligence_hub')
    .from('knowledge_objects')
    .select('knowledge_object_id, body_hash, authority_commit, domain_id:metadata->domainId, domain_name:metadata->domainName')
    .eq('knowledge_domain', BIBLE_KNOWLEDGE_DOMAIN)
    .eq('authority_repository', authorityRepository);
  if (error) {
    return { ok: false, verdict: 'FRESHNESS_CHECK_FAILED', reason: error.message, results: [] };
  }

  const results = (published ?? []).map((row) => {
    const liveObject = liveById.get(row.knowledge_object_id);
    if (!liveObject) {
      return { knowledgeObjectId: row.knowledge_object_id, verdict: 'MISSING', reason: 'domain no longer extractable from live Bible (removed, emptied, or now boilerplate)' };
    }
    if (liveObject._bodyHashForDiff !== row.body_hash || live.authorityCommit !== row.authority_commit) {
      return {
        knowledgeObjectId: row.knowledge_object_id,
        verdict: 'STALE',
        storedAuthorityCommit: row.authority_commit,
        liveAuthorityCommit: live.authorityCommit,
      };
    }
    return { knowledgeObjectId: row.knowledge_object_id, verdict: 'CURRENT', authorityCommit: row.authority_commit };
  });

  return {
    ok: true,
    verdict: results.every((r) => r.verdict === 'CURRENT') ? 'ALL_CURRENT' : 'DRIFT_DETECTED',
    authorityRepository,
    checkedCount: results.length,
    staleCount: results.filter((r) => r.verdict === 'STALE').length,
    missingCount: results.filter((r) => r.verdict === 'MISSING').length,
    results,
  };
}
