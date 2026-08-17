export function reconstructProvenance({ derivedObject, ledger, handoff }) {
  const closeoutEvidence = (derivedObject.evidenceState?.supportingEvidenceRefs ?? []).find(
    (ref) => ref.refKind === 'CLOSEOUT',
  );
  const ledgerEdge = (derivedObject.derivation?.derivedFrom ?? []).find(
    (edge) => edge.objectId === ledger.ledgerId,
  );

  const chain = [
    {
      step: 'DERIVED_OBJECT',
      objectId: derivedObject.identity.objectId,
      contentHash: derivedObject.identity.contentHash,
    },
    {
      step: 'MISSION_LEDGER',
      ledgerId: ledger.ledgerId,
      closeoutHash: ledger.closeoutHash,
    },
    {
      step: 'CLOSEOUT_EVIDENCE',
      closeoutRef: handoff.closeoutRef,
      closeoutHash: handoff.closeoutHash,
      closeoutPath: handoff.source?.closeoutPath ?? handoff.closeoutRef,
    },
    {
      step: 'SOURCE_COMMIT',
      repo: handoff.source.repo,
      commitSha: handoff.source.commitSha,
    },
  ];

  const provenanceOk =
    closeoutEvidence?.contentHash === handoff.closeoutHash &&
    closeoutEvidence?.contentHash === ledger.closeoutHash &&
    ledgerEdge?.relationship === 'PROJECTED_FROM' &&
    derivedObject.authority?.progressionAuthority === false &&
    derivedObject.authority?.authorityClass === 'DERIVED_INTELLIGENCE';

  return {
    ok: provenanceOk,
    chain,
    verifiedCloseoutHash: handoff.closeoutHash,
    verifiedAuthorityFingerprint: ledger.authorityFingerprint,
  };
}

export function reconstructAllProvenance({ derivedObjects, ledger, handoff }) {
  const reconstructions = derivedObjects.map((object) =>
    reconstructProvenance({ derivedObject: object, ledger, handoff }),
  );
  return {
    ok: reconstructions.every((item) => item.ok),
    reconstructions,
  };
}
