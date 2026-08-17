import { MISSION_LEDGER_SCHEMA, DERIVATION_VERSION } from './constants.mjs';
import { buildLedgerId } from './ids.mjs';

export function projectMissionLedgerRecord({
  handoff,
  closeout,
  closeoutPath,
  closeoutHash,
  authorityFingerprint,
  evidenceReality,
  measurementQuality,
  generatedAt = new Date().toISOString(),
}) {
  const ledgerId = buildLedgerId(closeoutHash);
  return {
    schemaVersion: MISSION_LEDGER_SCHEMA,
    ledgerId,
    workPackageId: handoff.workPackageId,
    closeoutRef: handoff.closeoutRef,
    closeoutHash,
    authorityFingerprint,
    source: {
      repo: handoff.source.repo,
      commitSha: handoff.source.commitSha,
      closeoutPath: closeoutPath ?? handoff.source.closeoutPath ?? handoff.closeoutRef,
    },
    mission: {
      missionClass: handoff.mission.missionClass,
      material: handoff.mission.material === true,
      closedAt: handoff.mission.closedAt,
    },
    evidenceReality,
    measurementQuality,
    confidence: closeout?.confidence ?? 'MEDIUM',
    missionSummary: {
      task: closeout?.task ?? null,
      outcome: closeout?.outcome ?? null,
      hostMode: closeout?.hostMode ?? null,
    },
    evidenceRefs: [
      {
        ref: handoff.closeoutRef,
        refKind: 'CLOSEOUT',
        contentHash: closeoutHash,
      },
    ],
    projectedAt: generatedAt,
    derivationVersion: DERIVATION_VERSION,
  };
}
