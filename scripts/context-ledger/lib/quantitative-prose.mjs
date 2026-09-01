/**
 * Quantitative prose binding.
 *
 * An empirical number reached an evidence receipt through a generated sentence
 * that mixed two kinds of quantity: counts computed from live state, which were
 * legitimately bound, and a hard-coded throughput literal that had never been
 * measured. A reader could not tell them apart, because both arrived with
 * identical authority inside one assertion.
 *
 * Field-level validation of measuredFacts cannot catch this, because the value
 * was never in such a field. The check must live at the emitter boundary.
 *
 * Rule: any empirical quantity entering authoritative prose must be
 *   DERIVED_FROM_BOUND_FIELD
 *   EXPLICITLY_TYPED_NON_EMPIRICAL
 *   REFUSED
 */

const UNIT_PATTERNS = [
  /[0-9]+(\.[0-9]+)?\s*[KMGT]?B\s*\/\s*s/i,
  /[0-9]+(\.[0-9]+)?\s*(ms|milliseconds?)/i,
  /[0-9]+(\.[0-9]+)?\s*(seconds?|secs?)/i,
  /[0-9]+(\.[0-9]+)?\s*%/,
  /[0-9]+(\.[0-9]+)?\s*(bytes?|objects?|files?|entries)/i,
  /per\s+second/i,
  /~\s*[0-9]/,
];

export const BINDING = {
  DERIVED: 'DERIVED_FROM_BOUND_FIELD',
  NON_EMPIRICAL: 'EXPLICITLY_TYPED_NON_EMPIRICAL',
  REFUSED: 'REFUSED',
};

export function containsUnboundQuantity(text) {
  if (typeof text !== 'string') return false;
  return UNIT_PATTERNS.some((re) => re.test(text));
}

/** A measurement that is not MEASURED renders UNMEASURED. It never vanishes. */
export function renderMeasurement(m) {
  if (!m || m.measurementStatus !== 'MEASURED') return 'UNMEASURED';
  if (!m.command || !m.rawOutputSha256 || m.exitStatus !== 0) return 'UNMEASURED';
  return String(m.value) + (m.unit ? ' ' + m.unit : '');
}

/**
 * Guard any string heading into an authoritative receipt.
 * `derived` lists values computed from live state; those are legal even though
 * they are numbers. The rule targets values that were TYPED, not COMPUTED.
 */
export function assertBoundProse(text, options) {
  const opts = options || {};
  const derived = opts.derived || [];
  if (typeof text !== 'string') return text;
  let residue = text;
  for (const d of derived) residue = residue.split(String(d)).join(' ');
  if (containsUnboundQuantity(residue)) {
    const e = new Error('UNBOUND_QUANTITATIVE_PROSE');
    e.context = opts.context || 'prose';
    e.binding = BINDING.REFUSED;
    throw e;
  }
  return text;
}
