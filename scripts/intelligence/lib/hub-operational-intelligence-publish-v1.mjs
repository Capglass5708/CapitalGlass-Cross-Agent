import { buildSupabaseProjectionManifest } from './hub-supabase-projection-map-v1.mjs';
import {
  createLiveIntelligenceHubStore,
  createMemoryIntelligenceHubStore,
  resolveSharedDevHubWriteEligibility,
} from './supabase-intelligence-store-v1.mjs';

export function buildSharedDevHubPublicationPlan({
  hubCompact,
  evidenceReality,
  firstRealMissionEligible,
  eligibility = resolveSharedDevHubWriteEligibility(),
}) {
  return {
    mode: 'SHARED_DEV_STRUCTURAL',
    executed: false,
    plannedTargets: ['intelligence_hub.knowledge_objects', 'intelligence_hub.relationships'],
    bodyHashReadbackRequired: true,
    objectCount: hubCompact.objects.length,
    relationshipCount: hubCompact.relationships.length,
    evidenceReality,
    firstRealMissionEligible,
    writeEligibility: eligibility,
    firstRealMissionHubProof: firstRealMissionEligible
      ? eligibility.executable
        ? 'WAITING_FOR_SHARED_DEV_HUB_READBACK'
        : 'WAITING_FOR_SHARED_DEV_HUB_WRITE_APPROVAL'
      : 'WAITING_FOR_REAL_MISSION',
    note: eligibility.executable
      ? 'Live shared-dev Hub write/readback enabled by operator gates.'
      : 'Structural seam only until CROSS_AGENT_INTELLIGENCE_HUB_PROJECTION_APPROVED=1 and INTELLIGENCE_HUB_LIVE_WRITES=true.',
  };
}

function summarizeUpsertStats(stats) {
  const knowledge = stats.knowledge ?? { inserted: 0, updated: 0, unchanged: 0, rejected: 0 };
  const relationships = stats.relationships ?? { inserted: 0, updated: 0, unchanged: 0, rejected: 0 };
  return {
    knowledgeObjectsWritten: knowledge.inserted + knowledge.updated,
    relationshipsWritten: relationships.inserted + relationships.updated,
    rejected: knowledge.rejected + relationships.rejected,
    unchanged: knowledge.unchanged + relationships.unchanged,
    knowledge,
    relationships,
  };
}

export async function publishOperationalIntelligenceToSharedDevHub({
  ledger,
  derivedObjects,
  relationships,
  hubCompact,
  evidenceReality,
  firstRealMissionEligible,
  store = null,
  eligibility = resolveSharedDevHubWriteEligibility(),
}) {
  const manifest = buildSupabaseProjectionManifest({ ledger, derivedObjects, relationships });
  const plan = buildSharedDevHubPublicationPlan({
    hubCompact,
    evidenceReality,
    firstRealMissionEligible,
    eligibility,
  });

  if (!eligibility.executable) {
    return {
      ...plan,
      manifest,
      readback: null,
      verdict: 'INGEST_SHARED_DEV_STRUCTURAL_PASS',
    };
  }

  const hubStore = store ?? (await createLiveIntelligenceHubStore());
  if (hubStore.kind === 'live-unavailable') {
    return {
      ...plan,
      executed: false,
      manifest,
      readback: null,
      blockedReason: 'SUPABASE_CREDENTIALS_MISSING',
      verdict: 'INGEST_SHARED_DEV_HUB_BLOCKED',
    };
  }

  const upsertStats = await hubStore.upsertProjection(manifest);
  const summary = summarizeUpsertStats(upsertStats);
  if (summary.rejected > 0) {
    return {
      ...plan,
      executed: true,
      manifest,
      upsert: summary,
      readback: null,
      blockedReason: 'SUPABASE_UPSERT_REJECTED',
      verdict: 'INGEST_SHARED_DEV_HUB_BLOCKED',
    };
  }

  const readback = await hubStore.readbackProjection(manifest);
  const bodyHashReadbackMatch = readback.ok === true;
  const retrievalSuccessful = bodyHashReadbackMatch;

  let firstRealMissionHubProof = 'WAITING_FOR_REAL_MISSION';
  if (firstRealMissionEligible) {
    firstRealMissionHubProof = bodyHashReadbackMatch
      ? 'FIRST_REAL_MISSION_HUB_PROOF_PASS'
      : 'WAITING_FOR_SHARED_DEV_HUB_READBACK';
  }

  return {
    ...plan,
    mode: 'SHARED_DEV_LIVE',
    executed: true,
    manifest,
    upsert: summary,
    readback: {
      ok: readback.ok,
      errors: readback.errors,
      bodyHashReadbackMatch,
      retrievalSuccessful,
      provenanceReconstructed: null,
      knowledgeObjectCount: readback.knowledgeObjectCount,
      relationshipCount: readback.relationshipCount,
    },
    acceptance: {
      sharedDevKnowledgeObjectWritten: summary.knowledgeObjectsWritten > 0 || summary.unchanged > 0,
      relationshipWritten: summary.relationshipsWritten > 0 || summary.unchanged > 0,
      hubBodyHashReadbackMatch: bodyHashReadbackMatch,
      retrievalSuccessful,
    },
    firstRealMissionHubProof,
    verdict: bodyHashReadbackMatch ? 'INGEST_SHARED_DEV_HUB_READBACK_PASS' : 'INGEST_SHARED_DEV_HUB_BLOCKED',
    storeKind: hubStore.kind,
  };
}

export { createMemoryIntelligenceHubStore };
