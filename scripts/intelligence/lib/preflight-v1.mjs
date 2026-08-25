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
export const RECEIPT_ROOT = path.join(REPO_ROOT, 'artifacts/agent-runs/intelligence-preflight-v1');

function slicesDir(repoRoot) {
  return path.join(repoRoot, 'work-progress/intelligence-hub-slices');
}

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
export function testGitLedgerPlane(repoRoot = REPO_ROOT) {
  const dir = slicesDir(repoRoot);
  const blockers = loadJsonSafe(path.join(dir, 'blockers.json'));
  const available = blockers !== null;
  return { plane: 'GIT_LEDGER', available, path: dir };
}

/**
 * Assembles the mission-context bundle (proposal 8). Always sources from the
 * Git-tracked local mirror (work-progress/intelligence-hub-slices/) — this is
 * the one plane fully testable and verifiable in every environment. It does
 * NOT yet vary by which retrieval-ladder plane reported success: an
 * L_HUB_READ_OK or L_HUB_UNAVAILABLE_USING_SUPABASE outcome still returns a
 * Git-mirror-sourced bundle, not a live L:/Supabase-sourced one. Callers
 * should treat `bundleSource` (below), not `outcome`, as the source of truth
 * for where the bundle's content actually came from. Reading live L:/Supabase
 * catalogs directly is real follow-up work this session couldn't build and
 * verify without access to either plane.
 */
export function buildMissionContextBundle({ concepts = [], repos = [], repoRoot = REPO_ROOT } = {}) {
  const needles = [...concepts, ...repos];
  const dir = slicesDir(repoRoot);

  const blockersSlice = loadJsonSafe(path.join(dir, 'blockers.json'));
  const activeBlockers = (blockersSlice?.blockers ?? [])
    .filter((b) => b.state === 'OPEN')
    .filter((b) => needles.length === 0 || matchesQuery(b.title, needles) || repos.includes(b.ownerRepo))
    .map((b) => ({ blockerId: b.blockerId, severity: b.severity, title: b.title, ownerRepo: b.ownerRepo, nextAction: b.nextAction }));

  const ownerSlice = loadJsonSafe(path.join(dir, 'owner-boundaries.json'));
  const repoOwnership = (ownerSlice?.packets ?? [])
    .filter((p) => repos.length === 0 || repos.includes(p.ownerRepo))
    .slice(0, 25)
    .map((p) => ({ packetId: p.packetId, ownerRepo: p.ownerRepo, ownerRepoRole: p.ownerRepoRole, currentGap: p.currentGap }));

  const doNotAdvance = loadJsonSafe(path.join(dir, 'do-not-advance.json'));
  const unresolvedContradictions = (doNotAdvance?.entries ?? [])
    .filter((e) => needles.length === 0 || matchesQuery(e.claimId, needles) || repos.includes(e.ownerRepo));

  const currentState = loadJsonSafe(path.join(dir, 'current-state.json'));

  // Consistent with the fields above: an empty query returns everything
  // (bounded), it does not silently drop this slice to empty.
  const harvestSlice = loadJsonSafe(path.join(dir, 'harvest-intelligence.json'));
  const rows = harvestSlice?.rows ?? [];
  const relevantRows = needles.length > 0
    ? rows.filter((r) => matchesQuery(`${r.conceptKey} ${r.application} ${r.workflow} ${r.ownerRepo}`, needles))
    : rows;
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
    bundleSource: 'GIT_LEDGER_MIRROR',
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
export async function runIntelligencePreflight({ mission = null, repos = [], concepts = [], repoRoot = REPO_ROOT } = {}) {
  const laneChecks = [];

  const lHub = testLHubPlane();
  laneChecks.push(lHub);
  if (lHub.available) {
    return finalizePreflight({
      outcome: OUTCOME.L_HUB_READ_OK,
      mission,
      repos,
      concepts,
      repoRoot,
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
      repoRoot,
      laneChecks,
    });
  }

  const gitLedger = testGitLedgerPlane(repoRoot);
  laneChecks.push(gitLedger);
  if (gitLedger.available) {
    return finalizePreflight({
      outcome: OUTCOME.L_HUB_UNAVAILABLE_USING_GIT_LEDGER,
      mission,
      repos,
      concepts,
      repoRoot,
      laneChecks,
    });
  }

  return finalizePreflight({
    outcome: OUTCOME.ALL_HUB_PLANES_UNAVAILABLE,
    mission,
    repos,
    concepts,
    repoRoot,
    laneChecks,
  });
}

function finalizePreflight({ outcome, mission, repos, concepts, repoRoot, laneChecks, indexVersion = null }) {
  const bundle = outcome === OUTCOME.ALL_HUB_PLANES_UNAVAILABLE
    ? null
    : buildMissionContextBundle({ concepts, repos, repoRoot });
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
