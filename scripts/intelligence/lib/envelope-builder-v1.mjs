import { ENVELOPE_SCHEMA, DERIVATION_VERSION } from './constants.mjs';
import { buildEnvelopeContentHash, buildObjectId, buildSemanticObjectId } from './ids.mjs';

export function buildOperationalEnvelope({
  kind,
  ledger,
  handoff,
  evidenceReality,
  measurementQuality,
  extensions = {},
  confidenceScore = 0.75,
  confidenceBasis = ['closeout-hash-verified', 'authority-fingerprint-verified'],
  measurementMetrics = {},
  futureUseOverrides = {},
  generatedAt = new Date().toISOString(),
  conceptKey = null,
}) {
  const objectId = conceptKey
    ? buildSemanticObjectId(kind, ledger.ledgerId, ledger.closeoutHash, conceptKey)
    : buildObjectId(kind, ledger.ledgerId, ledger.closeoutHash);
  const envelope = {
    schema: ENVELOPE_SCHEMA,
    identity: {
      objectId,
      kind,
      schema: ENVELOPE_SCHEMA,
      contentHash: 'sha256:pending',
      derivationVersion: DERIVATION_VERSION,
    },
    authority: {
      authorityClass: 'DERIVED_INTELLIGENCE',
      progressionAuthority: false,
      rawTelemetryDuplicated: false,
    },
    temporal: {
      observedAt: generatedAt,
      validFrom: handoff.mission.closedAt ?? generatedAt,
      validThrough: null,
      measurementWindowStart: handoff.mission.startedAt ?? handoff.mission.closedAt ?? generatedAt,
      measurementWindowEnd: handoff.mission.closedAt ?? generatedAt,
      lastRevalidatedAt: generatedAt,
    },
    lifecycle: {
      lifecycleStage: 'ACTIVE',
      supersedes: [],
      supersededBy: null,
      invalidated: false,
      invalidationReason: null,
    },
    evidenceState: {
      supportingEvidenceRefs: [
        {
          ref: handoff.closeoutRef,
          refKind: 'CLOSEOUT',
          contentHash: ledger.closeoutHash,
        },
      ],
      contradictingEvidenceRefs: [],
      rejectedEvidenceRefs: [],
    },
    confidence: {
      score: confidenceScore,
      basis: confidenceBasis,
      calculationVersion: 'confidence-v1@1.0.0',
    },
    derivation: {
      derivedFrom: [
        {
          objectId: ledger.ledgerId,
          relationship: 'PROJECTED_FROM',
          contribution: 'mission-ledger-projection',
          evidenceWeight: 1,
        },
      ],
    },
    futureUse: {
      retrievalEligible: evidenceReality === 'REAL',
      startupContextEligible: evidenceReality === 'REAL',
      synthesisEligible: true,
      agentExplorationEligible: false,
      opportunityMiningEligible: evidenceReality === 'REAL',
      ...futureUseOverrides,
    },
    measurement: {
      measurementQuality,
      metrics: measurementMetrics,
    },
    evidenceReality,
    extensions,
  };
  envelope.identity.contentHash = buildEnvelopeContentHash(envelope);
  return envelope;
}
