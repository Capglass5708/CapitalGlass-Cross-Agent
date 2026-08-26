import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveAppBuilderRoot } from '../../index/lib/resolve-repo-roots.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');

function classifyExisting(existing, next, keys) {
  if (!existing) return 'inserted';
  for (const key of keys) {
    if (existing[key] !== next[key]) return 'updated';
  }
  return 'unchanged';
}

function toDbKnowledge(row) {
  return {
    knowledge_object_id: row.knowledgeObjectId,
    knowledge_domain: row.knowledgeDomain,
    knowledge_object_type: row.knowledgeObjectType,
    body_hash: row.bodyHash,
    schema_hash: row.schemaHash,
    canonicalization_version: row.canonicalizationVersion,
    provenance_class: row.provenanceClass,
    placement_state: row.placementState,
    authority_system: row.authoritySystem,
    authority_repository: row.authorityRepository,
    authority_path: row.authorityPath,
    authority_commit: row.authorityCommit,
    object_store_path: row.objectStorePath,
    cache_eligibility: row.cacheEligibility,
    freshness_state: row.freshnessState,
    metadata: row.metadata,
  };
}

function toDbRelationship(row) {
  return {
    relationship_id: row.relationshipId,
    relationship_type: row.relationshipType,
    from_domain: row.fromDomain,
    from_object_id: row.fromObjectId,
    to_domain: row.toDomain,
    to_object_id: row.toObjectId,
    authority_repository: row.authorityRepository,
    authority_commit: row.authorityCommit,
    verification_state: row.verificationState,
    relationship_hash: row.relationshipHash,
    metadata: row.metadata,
  };
}

export function createMemoryIntelligenceHubStore() {
  const knowledgeObjects = new Map();
  const relationships = new Map();

  return {
    kind: 'memory',
    async upsertProjection(manifest) {
      const stats = {
        knowledge: { inserted: 0, updated: 0, unchanged: 0, rejected: 0 },
        relationships: { inserted: 0, updated: 0, unchanged: 0, rejected: 0 },
      };

      for (const row of manifest.knowledgeObjects) {
        const dbRow = toDbKnowledge(row);
        const existing = knowledgeObjects.get(dbRow.knowledge_object_id) ?? null;
        const kind = classifyExisting(existing, dbRow, ['body_hash', 'freshness_state', 'placement_state']);
        if (kind === 'unchanged') stats.knowledge.unchanged += 1;
        else {
          knowledgeObjects.set(dbRow.knowledge_object_id, dbRow);
          stats.knowledge[kind] += 1;
        }
      }

      for (const row of manifest.relationships) {
        const dbRow = toDbRelationship(row);
        const existing = relationships.get(dbRow.relationship_id) ?? null;
        const kind = classifyExisting(existing, dbRow, ['relationship_hash', 'verification_state']);
        if (kind === 'unchanged') stats.relationships.unchanged += 1;
        else {
          relationships.set(dbRow.relationship_id, dbRow);
          stats.relationships[kind] += 1;
        }
      }

      return stats;
    },
    async readbackProjection(manifest) {
      const errors = [];
      for (const row of manifest.knowledgeObjects) {
        const dbRow = knowledgeObjects.get(row.knowledgeObjectId);
        if (!dbRow) {
          errors.push(`missing-ko:${row.knowledgeObjectId}`);
          continue;
        }
        if (dbRow.body_hash !== row.bodyHash) errors.push(`ko-hash:${row.knowledgeObjectId}`);
      }
      for (const row of manifest.relationships) {
        const dbRow = relationships.get(row.relationshipId);
        if (!dbRow) errors.push(`missing-rel:${row.relationshipId}`);
        else if (dbRow.relationship_hash !== row.relationshipHash) errors.push(`rel-hash:${row.relationshipId}`);
      }
      return {
        ok: errors.length === 0,
        errors,
        knowledgeObjectCount: knowledgeObjects.size,
        relationshipCount: relationships.size,
      };
    },
  };
}

async function loadLiveSupabaseClient() {
  const appBuilderRoot = resolveAppBuilderRoot(REPO_ROOT);
  const envModulePath = path.join(appBuilderRoot, 'scripts/intelligence-hub/lib/supabase-env.mjs');
  // resolveAppBuilderRoot() always returns a path, even when no sibling
  // checkout was found (it's a resolver, not an existence check) — verify
  // before importing so a missing sibling repo degrades gracefully instead
  // of crashing the whole process.
  if (!fs.existsSync(envModulePath)) {
    return { env: { hasCredentials: false, reason: 'CG_APPBUILDER_MCP_ROOT_NOT_FOUND' }, client: null };
  }
  const mod = await import(envModulePath);
  // resolveSupabaseEnv() without options defaults to SUPABASE_URL before
  // MCP_SUPABASE_URL -- under the cg-mcp/dev Doppler config those resolve to
  // two different projects, and SUPABASE_URL points at the operational
  // project the harvest control-plane guard explicitly forbids
  // (assertControlPlaneTarget() in derived-intel/lib/live-db.mjs). The
  // intelligence_hub schema lives on the MCP control-plane project
  // (xjivcwcyyimjujbchwdf), so this store must prefer MCP_SUPABASE_URL.
  const env = mod.resolveSupabaseEnv({ preferMcpControlPlane: true });
  if (!env.hasCredentials) {
    return { env, client: null };
  }
  // createSupabaseClient() previously re-resolved the env internally with its
  // own defaults, silently discarding the preferMcpControlPlane choice above
  // and reconnecting to the wrong project even though `env` looked correct.
  const client = await mod.createSupabaseClient({ preferMcpControlPlane: true });
  return { env, client };
}

export function resolveSharedDevHubWriteEligibility(env = process.env) {
  const approved =
    env.CROSS_AGENT_INTELLIGENCE_HUB_PROJECTION_APPROVED === '1' ||
    env.CROSS_AGENT_INTELLIGENCE_HUB_PROJECTION_APPROVED === 'true';
  const liveWrites =
    env.INTELLIGENCE_HUB_LIVE_WRITES === 'true' || env.INTELLIGENCE_HUB_LIVE_WRITES === '1';
  return {
    approved,
    liveWrites,
    executable: approved && liveWrites,
    reason: !approved
      ? 'CROSS_AGENT_INTELLIGENCE_HUB_PROJECTION_APPROVED_missing'
      : !liveWrites
        ? 'INTELLIGENCE_HUB_LIVE_WRITES_missing'
        : null,
  };
}

export async function createLiveIntelligenceHubStore() {
  const { env, client } = await loadLiveSupabaseClient();
  if (!client) {
    return { kind: 'live-unavailable', env, client: null };
  }

  async function upsertTable(table, rows, conflictKey, compareKeys, mapRow) {
    const stats = { inserted: 0, updated: 0, unchanged: 0, rejected: 0, lastError: null };
    for (const row of rows) {
      try {
        const dbRow = mapRow(row);
        const { data: existing, error: readError } = await client
          .schema('intelligence_hub')
          .from(table)
          .select('*')
          .eq(conflictKey, dbRow[conflictKey])
          .maybeSingle();
        if (readError) throw new Error(readError.message);
        const kind = classifyExisting(existing, dbRow, compareKeys);
        if (kind === 'unchanged') {
          stats.unchanged += 1;
          continue;
        }
        const { error } = await client
          .schema('intelligence_hub')
          .from(table)
          .upsert(dbRow, { onConflict: conflictKey });
        if (error) throw new Error(error.message);
        stats[kind] += 1;
      } catch (error) {
        stats.rejected += 1;
        stats.lastError = error instanceof Error ? error.message : String(error);
      }
    }
    return stats;
  }

  return {
    kind: 'live',
    env,
    client,
    async upsertProjection(manifest) {
      const knowledge = await upsertTable(
        'knowledge_objects',
        manifest.knowledgeObjects,
        'knowledge_object_id',
        ['body_hash', 'freshness_state', 'placement_state'],
        toDbKnowledge,
      );
      const relationships = await upsertTable(
        'relationships',
        manifest.relationships,
        'relationship_id',
        ['relationship_hash', 'verification_state'],
        toDbRelationship,
      );
      return { knowledge, relationships };
    },
    async readbackProjection(manifest) {
      const errors = [];
      for (const row of manifest.knowledgeObjects) {
        const { data, error } = await client
          .schema('intelligence_hub')
          .from('knowledge_objects')
          .select('body_hash')
          .eq('knowledge_object_id', row.knowledgeObjectId)
          .maybeSingle();
        if (error || !data) errors.push(`missing-ko:${row.knowledgeObjectId}`);
        else if (data.body_hash !== row.bodyHash) errors.push(`ko-hash:${row.knowledgeObjectId}`);
      }
      for (const row of manifest.relationships) {
        const { data, error } = await client
          .schema('intelligence_hub')
          .from('relationships')
          .select('relationship_hash')
          .eq('relationship_id', row.relationshipId)
          .maybeSingle();
        if (error || !data) errors.push(`missing-rel:${row.relationshipId}`);
        else if (data.relationship_hash !== row.relationshipHash) errors.push(`rel-hash:${row.relationshipId}`);
      }
      return {
        ok: errors.length === 0,
        errors,
        knowledgeObjectCount: manifest.knowledgeObjects.length,
        relationshipCount: manifest.relationships.length,
      };
    },
  };
}
