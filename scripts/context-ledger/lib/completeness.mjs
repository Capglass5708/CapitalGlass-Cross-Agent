/**
 * Phase 2 capture-completeness reconciliation.
 *
 * This is the JUDGE, not the capture pipeline, and it must stay that way: if
 * the parser that captures also produces the expectation it is judged against,
 * the equation is self-confirming and proves nothing.
 *
 * The gate is deliberately harsher than it looks:
 *
 *   COUNT(expected) == COUNT(captured) == COUNT(ledger)
 *   AND SET(expected) == SET(captured) == SET(ledger)
 *   AND per-semantic-class equality
 *   AND unaccounted == 0
 *
 * Counts alone are insufficient. One missing record plus one duplicate record
 * produces equal counts and a passing aggregate while the archive is silently
 * wrong -- which is the exact failure this whole project exists to prevent.
 *
 * No percentage threshold exists anywhere in this file. 99.999% is FAIL.
 */
import { sha256Prefixed } from './canonical.mjs';

export const VERDICT = {
  COMPLETE: 'CAPTURE_COMPLETE',
  INCOMPLETE: 'CAPTURE_INCOMPLETE',
  SOURCE_CHANGED: 'SOURCE_CHANGED_DURING_CAPTURE',
  CENSUS_UNRESOLVED: 'SOURCE_CENSUS_UNRESOLVED',
};

/** Deterministic digest of an ID set: dedup, sort, hash. Order can never matter. */
export function setHash(ids) {
  const sorted = [...new Set(ids.map(String))].sort();
  return sha256Prefixed(Buffer.from(sorted.join('\n'), 'utf8'));
}

/** Duplicates must be visible: a Set alone would hide them. */
export function findDuplicates(ids) {
  const seen = new Set(), dup = new Set();
  for (const id of ids.map(String)) { if (seen.has(id)) dup.add(id); else seen.add(id); }
  return [...dup].sort();
}

export function diffSets(expected, actual) {
  const E = new Set(expected.map(String)), A = new Set(actual.map(String));
  return {
    missing: [...E].filter((x) => !A.has(x)).sort(),
    unexpected: [...A].filter((x) => !E.has(x)).sort(),
  };
}

/** Three-way reconciliation of one class (or the physical record set). */
export function reconcile({ className = 'physical', expectedIds, capturedIds, ledgerIds }) {
  const counts = { expected: expectedIds.length, captured: capturedIds.length, ledger: ledgerIds.length };
  const hashes = {
    expectedSetHash: setHash(expectedIds),
    capturedSetHash: setHash(capturedIds),
    ledgerSetHash: setHash(ledgerIds),
  };
  const vsCaptured = diffSets(expectedIds, capturedIds);
  const vsLedger = diffSets(expectedIds, ledgerIds);
  const duplicateCaptured = findDuplicates(capturedIds);
  const duplicateLedger = findDuplicates(ledgerIds);

  const countsEqual = counts.expected === counts.captured && counts.captured === counts.ledger;
  const setsEqual = hashes.expectedSetHash === hashes.capturedSetHash
                 && hashes.capturedSetHash === hashes.ledgerSetHash;

  return {
    className, counts, ...hashes, countsEqual, setsEqual,
    equal: countsEqual && setsEqual
        && duplicateCaptured.length === 0 && duplicateLedger.length === 0,
    missingCapturedRecords: vsCaptured.missing,
    unexpectedCapturedRecords: vsCaptured.unexpected,
    missingLedgerObservations: vsLedger.missing,
    unexpectedLedgerObservations: vsLedger.unexpected,
    duplicateCapturedRecords: duplicateCaptured,
    duplicateLedgerObservations: duplicateLedger,
    // The offsetting-error signature: counts reconcile while the sets do not.
    countsMaskedADiscrepancy: countsEqual && !setsEqual,
  };
}

/** Deterministic identity for a source record lacking a native id. */
export function derivedRecordId({ fileSha256, recordIndex, recordHash }) {
  if (!fileSha256 || recordIndex === undefined || !recordHash) {
    throw new TypeError('derivedRecordId requires fileSha256, recordIndex and recordHash');
  }
  return sha256Prefixed(Buffer.from(`${fileSha256}|${recordIndex}|${recordHash}`, 'utf8'));
}

export function sourceSetHash(files) {
  const rows = files
    .map((f) => `${f.path}|${f.byteSize}|${f.sha256}`)
    .sort();
  return sha256Prefixed(Buffer.from(rows.join('\n'), 'utf8'));
}

/**
 * Final verdict. Every gate is mandatory; there is no weighting and no
 * threshold. Any single failure yields CAPTURE_INCOMPLETE.
 */
export function evaluate({
  sourceSetAgreed, censusIndependent, physical, semanticClasses,
  dag, tool, unknownRecordTypes = [], ledgerReadFromPersistedLayer,
}) {
  const failures = [];

  if (!censusIndependent) return { verdict: VERDICT.CENSUS_UNRESOLVED, failures: ['CENSUS_NOT_INDEPENDENT'] };
  if (!sourceSetAgreed) return { verdict: VERDICT.SOURCE_CHANGED, failures: ['SOURCE_SET_HASH_MISMATCH'] };

  if (!ledgerReadFromPersistedLayer) failures.push('LEDGER_NOT_READ_FROM_PERSISTED_LAYER');
  if (!physical?.equal) failures.push('PHYSICAL_SET_INEQUALITY');
  if (physical?.countsMaskedADiscrepancy) failures.push('COUNTS_MASKED_A_DISCREPANCY');
  if (unknownRecordTypes.length > 0) failures.push('UNKNOWN_SOURCE_RECORD_TYPES');

  for (const c of semanticClasses ?? []) if (!c.equal) failures.push(`CLASS_INEQUALITY:${c.className}`);

  if (dag) {
    if (!dag.uuidsUnique) failures.push('DAG_UUID_NOT_UNIQUE');
    if (!dag.allParentsAccounted) failures.push('DAG_PARENT_UNACCOUNTED');
    if ((dag.duplicateEdges ?? 0) !== 0) failures.push('DAG_DUPLICATE_EDGES');
    if ((dag.cycles ?? 0) !== 0) failures.push('DAG_CYCLES');
    if (dag.graphMatchesCensus === false) failures.push('DAG_CARDINALITY_MISMATCH');
  }
  if (tool) {
    for (const k of ['missingResults', 'duplicateResults', 'unmatchedResults', 'ambiguousPairings']) {
      if ((tool[k] ?? 0) !== 0) failures.push(`TOOL_${k.toUpperCase()}`);
    }
  }
  return { verdict: failures.length === 0 ? VERDICT.COMPLETE : VERDICT.INCOMPLETE, failures };
}
