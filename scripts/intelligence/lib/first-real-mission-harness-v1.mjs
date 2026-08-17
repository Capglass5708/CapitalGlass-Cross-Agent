/**
 * First-real-mission gate — fail-closed until genuine REAL material evidence + shared-dev Hub readback.
 */

export const FIRST_REAL_MISSION_CRITERIA = [
  'realEvidence',
  'closeoutHashVerified',
  'ledgerProjected',
  'envelopeValidated',
  'objectHashDeterministic',
  'sharedDevKnowledgeObjectWritten',
  'relationshipWritten',
  'hubBodyHashReadbackMatch',
  'retrievalSuccessful',
  'provenanceReconstructed',
];

export function evaluateFirstRealMissionHarness(receipt) {
  const acceptance = receipt?.acceptance ?? {};
  const checks = {
    realEvidence: receipt?.evidenceReality === 'REAL' && receipt?.firstRealMissionEligible === true,
    closeoutHashVerified: acceptance.CLOSEOUT_HASH_VERIFICATION_PASS === true,
    ledgerProjected: acceptance.LEDGER_PROJECTION_PASS === true,
    envelopeValidated: acceptance.DERIVED_OBJECT_BUILD_PASS === true,
    objectHashDeterministic: Array.isArray(receipt?.artifacts?.derivedObjects)
      && receipt.artifacts.derivedObjects.every((object) => /^sha256:[0-9a-f]{64}$/.test(object.identity?.contentHash ?? '')),
    sharedDevKnowledgeObjectWritten: acceptance.SHARED_DEV_KNOWLEDGE_OBJECT_WRITTEN === true,
    relationshipWritten: acceptance.RELATIONSHIP_WRITTEN === true,
    hubBodyHashReadbackMatch: acceptance.HUB_BODY_HASH_READBACK_MATCH === true,
    retrievalSuccessful: acceptance.RETRIEVAL_SUCCESSFUL === true,
    provenanceReconstructed: acceptance.PROVENANCE_RECONSTRUCTION_PASS === true,
  };

  const passCount = FIRST_REAL_MISSION_CRITERIA.filter((key) => checks[key] === true).length;
  const hubProof = acceptance.FIRST_REAL_MISSION_HUB_PROOF ?? 'WAITING_FOR_REAL_MISSION';

  let state = 'WAITING_FOR_REAL_MISSION';
  if (receipt?.evidenceReality !== 'REAL' || receipt?.firstRealMissionEligible !== true) {
    state = 'WAITING_FOR_REAL_MISSION';
  } else if (hubProof === 'FIRST_REAL_MISSION_HUB_PROOF_PASS') {
    state = 'FIRST_REAL_MISSION_HUB_PROOF_PASS';
  } else if (passCount > 0) {
    state = 'WAITING_FOR_SHARED_DEV_HUB_READBACK';
  }

  return {
    state,
    hubProof,
    passCount,
    requiredCount: FIRST_REAL_MISSION_CRITERIA.length,
    checks,
    pass: state === 'FIRST_REAL_MISSION_HUB_PROOF_PASS',
  };
}
