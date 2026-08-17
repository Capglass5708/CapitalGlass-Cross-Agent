const FIXTURE_WORK_PACKAGE_RE =
  /(?:^|[-_])(fixture|fixtures|smoke|proof-wave|ephemeral|contract-fixture)(?:$|[-_])/i;

export function classifyEvidenceReality({ handoff, closeout }) {
  const reasons = [];
  const workPackageId = handoff.workPackageId ?? '';
  const task = String(closeout?.task ?? '').toLowerCase();
  const cheapestRedo = String(closeout?.cheapestRedo ?? '');

  if (!handoff.mission?.material) {
    reasons.push('NON_MATERIAL_MISSION');
  }
  if (FIXTURE_WORK_PACKAGE_RE.test(workPackageId)) {
    reasons.push('FIXTURE_WORK_PACKAGE_ID');
  }
  if (workPackageId.includes('proof-wave') || cheapestRedo.includes('proof-wave')) {
    reasons.push('PROOF_WAVE_MARKER');
  }
  if (task.includes('proof wave') || task.includes('proof-wave')) {
    reasons.push('PROOF_WAVE_CLOSEOUT_TASK');
  }
  if (closeout?.synthetic === true || closeout?.evidenceClass === 'SYNTHETIC') {
    reasons.push('EXPLICIT_SYNTHETIC_CLOSEOUT');
  }

  let evidenceReality = 'REAL';
  if (reasons.some((r) => r.startsWith('EXPLICIT_SYNTHETIC'))) {
    evidenceReality = 'SYNTHETIC';
  } else if (reasons.length > 0) {
    evidenceReality = 'FIXTURE';
  }

  const firstRealMissionEligible = evidenceReality === 'REAL' && handoff.mission?.material === true;

  return {
    evidenceReality,
    firstRealMissionEligible,
    ineligibleReasons: reasons,
  };
}

export function inferMeasurementQuality({ closeout, evidenceReality }) {
  if (evidenceReality !== 'REAL') return 'INFERRED';
  if (closeout?.aiCacheHit === true) return 'CACHE_VERIFIED';
  if (closeout?.providerTokenPairing?.receiptSha256) return 'PROVIDER_VERIFIED';
  if (closeout?.quality === 'ESTIMATE_ONLY') return 'ESTIMATED';
  return 'DIRECT_MEASURED';
}
