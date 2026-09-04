/**
 * Formal authority lattice.
 *
 * Two distinct orderings, deliberately separated:
 *
 *   NORMATIVE  — "what SHOULD be true". A frozen contract outranks a README.
 *                Used to decide which instruction an agent must follow.
 *   OBSERVED   — "what IS true". Live code behavior outranks a doc that
 *                describes it. Used to decide what the repo actually does.
 *
 * Collapsing these into one ranking is the mistake that hides real drift:
 * if a contract always wins, an agent never learns the code bypasses it;
 * if code always wins, the bypass silently becomes the new rule.
 * When the two orderings disagree the compiler emits a CONTRADICTION and
 * preserves BOTH sides rather than picking a winner.
 */

export const NORMATIVE_RANK = [
  'FROZEN_CONTRACT',
  'ARCHITECTURE_LOCK',
  'ACTIVE_MACHINE_REGISTRY',
  'CURRENT_PROJECT_PLAN',
  'DECISION_LOG',
  'GENERATED_PROJECTION',
  'RUNBOOK',
  'README',
  'HISTORICAL_EVIDENCE',
];

export const OBSERVED_RANK = [
  'LIVE_CODE_BEHAVIOR',
  'CI_ENFORCEMENT',
  'TEST_ASSERTION',
  'GENERATED_PROJECTION',
  'ACTIVE_MACHINE_REGISTRY',
  'FROZEN_CONTRACT',
  'ARCHITECTURE_LOCK',
  'CURRENT_PROJECT_PLAN',
  'DECISION_LOG',
  'RUNBOOK',
  'README',
  'HISTORICAL_EVIDENCE',
];

/** Lower index == higher authority. Unknown classes sort last. */
function rankIn(list, authorityClass) {
  const i = list.indexOf(authorityClass);
  return i === -1 ? Number.MAX_SAFE_INTEGER : i;
}

export function normativeRank(authorityClass) {
  return rankIn(NORMATIVE_RANK, authorityClass);
}

export function observedRank(authorityClass) {
  return rankIn(OBSERVED_RANK, authorityClass);
}

/**
 * Resolve two claims that assert incompatible things about the same subject.
 * Returns the disposition rather than silently discarding the loser.
 */
export function resolveContradiction(claimA, claimB) {
  const normA = normativeRank(claimA.authorityClass);
  const normB = normativeRank(claimB.authorityClass);
  const obsA = observedRank(claimA.authorityClass);
  const obsB = observedRank(claimB.authorityClass);

  const normativeWinner = normA === normB ? null : normA < normB ? claimA : claimB;
  const observedWinner = obsA === obsB ? null : obsA < obsB ? claimA : claimB;

  // The dangerous case: the doc you must obey is not the thing the repo does.
  const divergent =
    normativeWinner && observedWinner && normativeWinner.claimId !== observedWinner.claimId;

  return {
    disposition: divergent ? 'CONTRADICTION_NORMATIVE_VS_OBSERVED' : 'SUPERSEDED',
    normativeWinner: normativeWinner?.claimId ?? null,
    observedWinner: observedWinner?.claimId ?? null,
    superseded: divergent ? [] : [normativeWinner === claimA ? claimB.claimId : claimA.claimId],
    requiresHumanDisposition: divergent,
  };
}

/** Map a repo path to its authority class. Ordered — first match wins. */
export const PATH_AUTHORITY_RULES = [
  { pattern: /^contracts\/.*\.schema\.json$/, authorityClass: 'FROZEN_CONTRACT' },
  { pattern: /^contracts\/.*OWNERSHIP\.md$/, authorityClass: 'ARCHITECTURE_LOCK' },
  { pattern: /^contracts\//, authorityClass: 'FROZEN_CONTRACT' },
  { pattern: /^registry\/.*machine.*\.json$/, authorityClass: 'ACTIVE_MACHINE_REGISTRY' },
  { pattern: /^registry\//, authorityClass: 'FROZEN_CONTRACT' },
  { pattern: /^\.github\/workflows\//, authorityClass: 'CI_ENFORCEMENT' },
  { pattern: /^scripts\/tests\//, authorityClass: 'TEST_ASSERTION' },
  { pattern: /^scripts\//, authorityClass: 'LIVE_CODE_BEHAVIOR' },
  { pattern: /^harvest\/protocol\//, authorityClass: 'GENERATED_PROJECTION' },
  { pattern: /^work-progress\/projects\//, authorityClass: 'CURRENT_PROJECT_PLAN' },
  { pattern: /^decisions\//, authorityClass: 'DECISION_LOG' },
  { pattern: /^(docs|runbooks)\//, authorityClass: 'RUNBOOK' },
  { pattern: /^(README|AGENT_START_HERE)\.md$/, authorityClass: 'README' },
  { pattern: /^artifacts\//, authorityClass: 'HISTORICAL_EVIDENCE' },
  { pattern: /^archive\//, authorityClass: 'HISTORICAL_EVIDENCE' },
];

export function classifyPathAuthority(relPath) {
  for (const rule of PATH_AUTHORITY_RULES) {
    if (rule.pattern.test(relPath)) return rule.authorityClass;
  }
  return 'UNCLASSIFIED';
}
