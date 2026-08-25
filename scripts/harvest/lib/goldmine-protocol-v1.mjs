/**
 * Proposal 9 — /goldmine as a canonical, agent-neutral command contract.
 * One governed implementation: capture (caller's job) -> classify/dedupe via
 * the existing intelligence-index merge authority -> publish through the
 * governed path -> one receipt shape every host returns identically.
 */
import fs from 'node:fs';
import path from 'node:path';

import { REPO_ROOT } from './paths.mjs';
import { mergeManifestIntoIntelligenceIndex } from './intelligence-index-lib.mjs';
import { writeHarvestIntelligenceRetrievalArtifacts } from './harvest-intelligence-retrieval-lib.mjs';
import { testLHubPlane, testSupabasePlane } from '../../intelligence/lib/preflight-v1.mjs';

export function loadEvidenceManifest(evidencePath) {
  const resolved = path.resolve(evidencePath);
  if (!fs.existsSync(resolved)) {
    throw Object.assign(new Error(`Evidence file not found: ${resolved}`), { code: 'EVIDENCE_NOT_FOUND' });
  }
  const manifest = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  if (!manifest.harvestId) {
    throw Object.assign(new Error('Evidence manifest missing harvestId'), { code: 'EVIDENCE_MANIFEST_INVALID' });
  }
  if (!Array.isArray(manifest.packets) || manifest.packets.length === 0) {
    throw Object.assign(new Error('Evidence manifest must include at least one packet'), { code: 'EVIDENCE_MANIFEST_EMPTY' });
  }
  return manifest;
}

function countContradictionsRequiringReview(manifest) {
  return (manifest.packets ?? []).filter((p) => p.contradictsExisting === true).length;
}

// Diagnostic only — reports whether a remote Hub plane is reachable, never a
// claim that anything was published there. No code path in this function
// writes to L: or Supabase; an actual Hub-publish implementation for Gold
// Mine evidence is future work (see the V2 proposal's cross-repo items).
async function checkHubPlaneReachability() {
  const lHub = testLHubPlane();
  if (lHub.available) return { reachable: true, plane: 'L_DRIVE' };
  const supabase = await testSupabasePlane();
  if (supabase.available) return { reachable: true, plane: 'SUPABASE' };
  return { reachable: false, plane: null, reason: 'ALL_HUB_PLANES_UNAVAILABLE' };
}

function receiptRunDir(harvestId, repoRoot = REPO_ROOT) {
  return path.join(repoRoot, 'artifacts/agent-runs', harvestId);
}

/** --preview: report what would happen without merging or publishing anything. */
export function previewGoldMine(manifest) {
  return {
    schema: 'goldmine-receipt-v1@1.0.0',
    verdict: 'GOLD_MINE_PREVIEW',
    harvestId: manifest.harvestId,
    workPackageId: manifest.workPackageId ?? manifest.harvestId,
    generatedAt: new Date().toISOString(),
    evidenceItemsHarvested: manifest.packets.length,
    packetIds: manifest.packets.map((p) => p.packetId),
    note: 'Preview only — nothing was merged or published.',
  };
}

/** --status: read the last real receipt for a harvestId, if one exists. */
export function lastGoldMineReceipt(harvestId, repoRoot = REPO_ROOT) {
  const receiptPath = path.join(receiptRunDir(harvestId, repoRoot), 'goldmine-receipt-v1.json');
  if (!fs.existsSync(receiptPath)) return null;
  return JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
}

/**
 * Run the full governed protocol: capture is the caller's job (the manifest
 * passed in), everything after that — classify/dedupe, publish, receipt — is
 * this one canonical implementation, so Claude/Cursor/WaveRunner/any future
 * host all produce the same result for the same evidence.
 */
export async function runGoldMineProtocol(manifest, { repoRoot = REPO_ROOT } = {}) {
  const { receipt: mergeReceipt } = mergeManifestIntoIntelligenceIndex(manifest, { repoRoot });

  // Close the retrieval loop: the local index write above is invisible to
  // intelligence.preflight() until the compact Git-mirror slice it actually
  // reads (work-progress/intelligence-hub-slices/harvest-intelligence.json)
  // is regenerated from it. Without this, a fresh agent's preflight call
  // would never see what this run just harvested.
  const retrievalArtifacts = writeHarvestIntelligenceRetrievalArtifacts(repoRoot);

  const hubReachability = await checkHubPlaneReachability();
  const contradictionsRequiringReview = countContradictionsRequiringReview(manifest);

  const graphDividend =
    mergeReceipt.newEntities > 0 || mergeReceipt.enrichedEntities > 0 || mergeReceipt.relationshipAdds > 0;

  // "Complete" means captured + merged into the governed local index — the
  // real, working part of this implementation. Unresolved contradictions are
  // the one condition that legitimately makes a run partial; Hub-plane
  // reachability is diagnostic only (see checkHubPlaneReachability) and never
  // by itself downgrades the verdict, because no code here actually writes to
  // a remote Hub plane yet — claiming PASS/BLOCKED on that basis would be
  // exactly the "false success" this protocol exists to prevent.
  const runDir = receiptRunDir(manifest.harvestId, repoRoot);
  const receiptPath = path.join(runDir, 'goldmine-receipt-v1.json');

  const result = {
    receiptPath,
    schema: 'goldmine-receipt-v1@1.0.0',
    verdict: contradictionsRequiringReview > 0 ? 'GOLD_MINE_PARTIAL' : 'GOLD_MINE_COMPLETE',
    harvestId: manifest.harvestId,
    workPackageId: manifest.workPackageId ?? manifest.harvestId,
    generatedAt: new Date().toISOString(),
    evidenceItemsHarvested: manifest.packets.length,
    newKnowledgeNodes: mergeReceipt.newEntities,
    existingNodesReinforced: mergeReceipt.enrichedEntities,
    newRelationships: mergeReceipt.relationshipAdds,
    relationshipsReinforced: mergeReceipt.observationsAdded - mergeReceipt.newEntities >= 0
      ? mergeReceipt.observationsAdded - mergeReceipt.newEntities
      : 0,
    supersessions: mergeReceipt.supersededEntities,
    contradictionsRequiringReview,
    graphDividend: graphDividend ? 'PASS' : 'HOLD',
    localIndexWrite: 'PASS',
    retrievalSliceRegenerated: 'PASS',
    retrievalSlicePath: path.relative(repoRoot, retrievalArtifacts.slicePath),
    retrievalSliceRowCount: retrievalArtifacts.slice.rowCount,
    hubPublication: 'NOT_IMPLEMENTED',
    hubPlaneReachable: hubReachability.reachable,
    hubPlaneReachabilityDetail: hubReachability,
    intelligenceMergeReceipt: mergeReceipt,
  };
  if (contradictionsRequiringReview > 0) {
    result.note = `${contradictionsRequiringReview} packet(s) contradict existing intelligence and need review before this can be treated as fully resolved. Evidence was still harvested, merged into the local intelligence index, and the local retrieval slice was regenerated.`;
  } else {
    result.note = "Evidence harvested, merged into the governed local intelligence index, and the local retrieval slice (work-progress/intelligence-hub-slices/harvest-intelligence.json) was regenerated so a fresh intelligence.preflight() call can retrieve it immediately. Remote Hub publication (L:/Supabase) is not implemented by this protocol yet — nothing was silently published beyond this repo's own Git-tracked mirror.";
  }

  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(receiptPath, `${JSON.stringify(result, null, 2)}\n`);

  return result;
}
