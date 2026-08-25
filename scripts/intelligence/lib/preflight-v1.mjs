/**
 * Proposal 2 — intelligence.preflight(): one shared, agent-independent
 * retrieval mechanism. Physically tests the L: Hub, falls back to Supabase,
 * falls back to the Git ledger, and returns a real outcome code plus a
 * mission-context bundle (proposal 8) instead of an agent self-reporting
 * that it "checked the index."
 */
import fs from 'node:fs';
import path from 'node:path';

import { REPO_ROOT } from './paths.mjs';
import { createLiveIntelligenceHubStore } from './supabase-intelligence-store-v1.mjs';

export const OUTCOME = {
  L_HUB_READ_OK: 'L_HUB_READ_OK',
  L_HUB_UNAVAILABLE_USING_SUPABASE: 'L_HUB_UNAVAILABLE_USING_SUPABASE',
  L_HUB_UNAVAILABLE_USING_GIT_LEDGER: 'L_HUB_UNAVAILABLE_USING_GIT_LEDGER',
  ALL_HUB_PLANES_UNAVAILABLE: 'ALL_HUB_PLANES_UNAVAILABLE',
};

const DEFAULT_L_HUB_PATH = '/mnt/l/Capital-Glass-Intelligence-Hub/00-master-index';
const SLICES_DIR = path.join(REPO_ROOT, 'work-progress/intelligence-hub-slices');
export const RECEIPT_ROOT = path.join(REPO_ROOT, 'artifacts/agent-runs/intelligence-preflight-v1');

function loadJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function matchesQuery(text, needles) {
  if (!needles || needles.length === 0) return true;
  const haystack = String(text ?? '').toLowerCase();
  return needles.some((needle) => haystack.includes(String(needle).toLowerCase()));
}

export function resolveLHubIndexPath() {
  return process.env.CG_INTELLIGENCE_HUB_L_PATH || DEFAULT_L_HUB_PATH;
}

/** Step 1 of the ladder — physically test the L: Hub, never assume it. */
export function testLHubPlane() {
  const lHubPath = resolveLHubIndexPath();
  let available = false;
  try {
    available = fs.statSync(lHubPath).isDirectory();
  } catch {
    available = false;
  }
  if (!available) {
    return { plane: 'L_DRIVE', available: false, path: lHubPath };
  }
  const index = loadJsonSafe(path.join(lHubPath, 'INDEX.json'));
  return {
    plane: 'L_DRIVE',
    available: true,
    path: lHubPath,
    indexVersion: index?.contentHash ?? index?.generatedAt ?? null,
  };
}

/** Step 2 — Supabase intelligence_hub projection, reusing the existing live-store resolver. */
export async function testSupabasePlane() {
  const store = await createLiveIntelligenceHubStore();
  if (store.kind === 'live') {
    return { plane: 'SUPABASE', available: true };
  }
  return {
    plane: 'SUPABASE',
    available: false,
    reason: store.env?.hasCredentials === false ? 'NO_CREDENTIALS' : 'PRODUCER_ROOT_OR_CLIENT_UNAVAILABLE',
  };
}

/** Step 3 — the Git-tracked local mirror; the only plane guaranteed reachable from any checkout. */
export function testGitLedgerPlane() {
  const blockers = loadJsonSafe(path.join(SLICES_DIR, 'blockers.json'));
  const available = blockers !== null;
  return { plane: 'GIT_LEDGER', available, path: SLICES_DIR };
}

/**
 * Assembles the mission-context bundle (proposal 8) from whichever plane's
 * local mirror is reachable. In this environment only the Git-ledger mirror
 * (work-progress/intelligence-hub-slices/) is actually testable end to end;
 * an L:/Supabase-backed bundle would draw from the live catalog instead, but
 * the shape returned to the caller is identical either way.
 */
export function buildMissionContextBundle({ concepts = [], repos = [] } = {}) {
  const needles = [...concepts, ...repos];

  const blockersSlice = loadJsonSafe(path.join(SLICES_DIR, 'blockers.json'));
  const activeBlockers = (blockersSlice?.blockers ?? [])
    .filter((b) => b.state === 'OPEN')
    .filter((b) => needles.length === 0 || matchesQuery(b.title, needles) || repos.includes(b.ownerRepo))
    .map((b) => ({ blockerId: b.blockerId, severity: b.severity, title: b.title, ownerRepo: b.ownerRepo, nextAction: b.nextAction }));

  const ownerSlice = loadJsonSafe(path.join(SLICES_DIR, 'owner-boundaries.json'));
  const repoOwnership = (ownerSlice?.packets ?? [])
    .filter((p) => repos.length === 0 || repos.includes(p.ownerRepo))
    .slice(0, 25)
    .map((p) => ({ packetId: p.packetId, ownerRepo: p.ownerRepo, ownerRepoRole: p.ownerRepoRole, currentGap: p.currentGap }));

  const doNotAdvance = loadJsonSafe(path.join(SLICES_DIR, 'do-not-advance.json'));
  const unresolvedContradictions = (doNotAdvance?.entries ?? [])
    .filter((e) => needles.length === 0 || matchesQuery(e.claimId, needles) || repos.includes(e.ownerRepo));

  const currentState = loadJsonSafe(path.join(SLICES_DIR, 'current-state.json'));

  const harvestSlice = loadJsonSafe(path.join(SLICES_DIR, 'harvest-intelligence.json'));
  const rows = harvestSlice?.rows ?? [];
  const relevantRows = needles.length > 0
    ? rows.filter((r) => matchesQuery(`${r.conceptKey} ${r.application} ${r.workflow} ${r.ownerRepo}`, needles))
    : [];
  const knownFailures = relevantRows
    .filter((r) => Boolean(r.rootCauseKey))
    .slice(0, 15)
    .map((r) => ({ entityId: r.entityId, conceptKey: r.conceptKey, ownerRepo: r.ownerRepo, rootCauseKey: r.rootCauseKey }));
  const successPatterns = relevantRows
    .filter((r) => Boolean(r.successPattern))
    .slice(0, 15)
    .map((r) => ({ entityId: r.entityId, conceptKey: r.conceptKey, ownerRepo: r.ownerRepo }));
  const relatedMissions = [...new Set(relevantRows.map((r) => r.workPackageId).filter(Boolean))].slice(0, 15);

  return {
    activeBlockers,
    repoOwnership,
    knownFailures,
    successPatterns,
    relatedMissions,
    unresolvedContradictions,
    currentState,
    sourceSlicesGeneratedAt: {
      blockers: blockersSlice?.updatedAt ?? null,
      ownerBoundaries: ownerSlice?.updatedAt ?? null,
      harvestIntelligence: harvestSlice?.generatedAt ?? null,
    },
  };
}

/**
 * The retrieval ladder (proposal 2a). Never silently assumes a plane is in
 * use — physically tests each one, in order, and returns exactly one
 * outcome code plus the mission-context bundle.
 */
export async function runIntelligencePreflight({ mission = null, repos = [], concepts = [] } = {}) {
  const laneChecks = [];

  const lHub = testLHubPlane();
  laneChecks.push(lHub);
  if (lHub.available) {
    return finalizePreflight({
      outcome: OUTCOME.L_HUB_READ_OK,
      mission,
      repos,
      concepts,
      laneChecks,
      indexVersion: lHub.indexVersion,
    });
  }

  const supabase = await testSupabasePlane();
  laneChecks.push(supabase);
  if (supabase.available) {
    return finalizePreflight({
      outcome: OUTCOME.L_HUB_UNAVAILABLE_USING_SUPABASE,
      mission,
      repos,
      concepts,
      laneChecks,
    });
  }

  const gitLedger = testGitLedgerPlane();
  laneChecks.push(gitLedger);
  if (gitLedger.available) {
    return finalizePreflight({
      outcome: OUTCOME.L_HUB_UNAVAILABLE_USING_GIT_LEDGER,
      mission,
      repos,
      concepts,
      laneChecks,
    });
  }

  return finalizePreflight({
    outcome: OUTCOME.ALL_HUB_PLANES_UNAVAILABLE,
    mission,
    repos,
    concepts,
    laneChecks,
  });
}

function finalizePreflight({ outcome, mission, repos, concepts, laneChecks, indexVersion = null }) {
  const bundle = outcome === OUTCOME.ALL_HUB_PLANES_UNAVAILABLE
    ? null
    : buildMissionContextBundle({ concepts, repos });
  return {
    schema: 'intelligence-preflight-receipt-v1@1.0.0',
    generatedAt: new Date().toISOString(),
    mission,
    repos,
    concepts,
    outcome,
    indexVersion,
    laneChecks,
    bundle,
  };
}

export function writePreflightReceipt(result, outputRoot = RECEIPT_ROOT) {
  fs.mkdirSync(outputRoot, { recursive: true });
  const stamp = result.generatedAt.replace(/[:.]/g, '-');
  const receiptPath = path.join(outputRoot, `preflight-${stamp}.json`);
  fs.writeFileSync(receiptPath, `${JSON.stringify(result, null, 2)}\n`);
  return receiptPath;
}
