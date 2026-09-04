/**
 * Content-addressed claims.
 *
 * A claim's id is derived from its assertion AND its evidence, so when the
 * source moves the id changes automatically. That turns "the docs might be
 * stale" into a deterministic set difference between two index generations:
 * added / removed / changed / contradicted / superseded.
 */
import { sha256Prefixed } from './canonical.mjs';
import { classifyPathAuthority } from './authority-lattice.mjs';

/** Every field the compiler emits carries how it was learned. */
export const EVIDENCE_CLASS = {
  OBSERVED_SOURCE: 'OBSERVED_SOURCE',
  OBSERVED_RUNTIME: 'OBSERVED_RUNTIME',
  DERIVED_STATIC: 'DERIVED_STATIC',
  DERIVED_GRAPH: 'DERIVED_GRAPH',
  DECLARED_ONLY: 'DECLARED_ONLY',
  INFERRED: 'INFERRED',
  UNPROVEN: 'UNPROVEN',
};

/** Capability proof ladder. Each rung must be established independently. */
export const PROOF_LADDER = ['declared', 'implemented', 'tested', 'ciEnforced', 'liveProven'];

export function makeEvidence({ path, sourceSha, lineRange = null, excerpt = null }) {
  return {
    path,
    sourceSha,
    lineRange,
    excerpt: excerpt ? excerpt.slice(0, 240) : null,
    authorityClass: classifyPathAuthority(path),
  };
}

export function makeClaim({
  subject,
  predicate,
  object,
  evidence,
  evidenceClass,
  authorityClass = null,
  notes = null,
}) {
  if (!Array.isArray(evidence) || evidence.length === 0) {
    throw new Error(`claim ${subject}/${predicate} has no evidence — claims without evidence are not emittable`);
  }
  if (!Object.values(EVIDENCE_CLASS).includes(evidenceClass)) {
    throw new Error(`claim ${subject}/${predicate} has invalid evidenceClass ${evidenceClass}`);
  }
  // Authority defaults to the strongest authority among the evidence paths.
  const resolvedAuthority = authorityClass ?? evidence[0].authorityClass;
  const body = {
    subject,
    predicate,
    object,
    authorityClass: resolvedAuthority,
    evidenceClass,
    evidence: evidence.map((e) => ({
      path: e.path,
      sourceSha: e.sourceSha,
      lineRange: e.lineRange,
    })),
  };
  return {
    claimId: sha256Prefixed(body),
    ...body,
    notes,
    evidenceDetail: evidence,
  };
}

/** Deterministic delta between two claim sets — the point of content addressing. */
export function diffClaims(previous, current) {
  const prevById = new Map(previous.map((c) => [c.claimId, c]));
  const currById = new Map(current.map((c) => [c.claimId, c]));
  const key = (c) => `${c.subject}|${c.predicate}`;
  const prevByKey = new Map(previous.map((c) => [key(c), c]));
  const currByKey = new Map(current.map((c) => [key(c), c]));

  const added = current.filter((c) => !prevById.has(c.claimId) && !prevByKey.has(key(c)));
  const removed = previous.filter((c) => !currById.has(c.claimId) && !currByKey.has(key(c)));
  const changed = current
    .filter((c) => !prevById.has(c.claimId) && prevByKey.has(key(c)))
    .map((c) => ({ from: prevByKey.get(key(c)).claimId, to: c.claimId, subject: c.subject, predicate: c.predicate }));

  return { added, removed, changed };
}
