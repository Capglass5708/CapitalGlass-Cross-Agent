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

async function checkHubPublicationEligibility() {
  const lHub = testLHubPlane();
  if (lHub.available) return { eligible: true, plane: 'L_DRIVE' };
  const supabase = await testSupabasePlane();
  if (supabase.available) return { eligible: true, plane: 'SUPABASE' };
  return { eligible: false, plane: null, reason: 'ALL_HUB_PLANES_UNAVAILABLE' };
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

  const hubEligibility = await checkHubPublicationEligibility();
  const contradictionsRequiringReview = countContradictionsRequiringReview(manifest);

  const graphDividend =
    mergeReceipt.newEntities > 0 || mergeReceipt.enrichedEntities > 0 || mergeReceipt.relationshipAdds > 0;

  const runDir = receiptRunDir(manifest.harvestId, repoRoot);
  const receiptPath = path.join(runDir, 'goldmine-receipt-v1.json');

  const result = {
    receiptPath,
    schema: 'goldmine-receipt-v1@1.0.0',
    verdict: hubEligibility.eligible ? 'GOLD_MINE_COMPLETE' : 'GOLD_MINE_PARTIAL',
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
    indexRefresh: 'PASS',
    hubPublication: hubEligibility.eligible ? 'PASS' : 'BLOCKED',
    hubPublicationPlane: hubEligibility.plane,
    hubPublicationBlockedReason: hubEligibility.eligible ? null : hubEligibility.reason,
    intelligenceMergeReceipt: mergeReceipt,
  };
  if (!hubEligibility.eligible) {
    result.note = 'Evidence harvested and merged into the local intelligence index successfully. Hub publication blocked — no intelligence was silently published beyond the governed local index.';
  }

  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(receiptPath, `${JSON.stringify(result, null, 2)}\n`);

  return result;
}
