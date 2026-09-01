/**
 * ESTATE-WIDE capture accounting.
 *
 * SIBLING of completeness.mjs, not a replacement. completeness.mjs judges ONE
 * Claude Code session against its own record census and stays exactly that --
 * its contract pins scope.sourceSystem to "claude-code" and
 * scope.singleSessionOnly to true, on purpose. Relaxing those consts would
 * silently redefine a proof that has already been passed, so this file adds a
 * second judge instead of loosening the first one.
 *
 * What this judge adds, and why the session judge cannot express it:
 *
 *   1. MANY source systems, each with its own census, in one accounting.
 *   2. NON-CAPTURE TERMINAL STATES. The session proof assumes every expected
 *      record should end up captured. Estate-wide that is false: a source
 *      carrying credential material must NOT be captured, and "not captured"
 *      must be a first-class, countable, non-failing outcome.
 *   3. CONSERVATION. Every discovered source terminates exactly once. A source
 *      that is neither archived nor explicitly refused is UNACCOUNTED, and
 *      unaccounted is always a failure -- that is the disappearance this whole
 *      exercise exists to make impossible.
 *
 * What it inherits unchanged: count equality AND set equality, per class, zero
 * unaccounted, no percentage thresholds anywhere. 99.999% is FAIL here too.
 */
import { setHash, diffSets, findDuplicates, reconcile } from './completeness.mjs';
import { MILESTONE, TERMINAL, TERMINAL_CLASS, terminalClassOf, CAP_ONLY_TERMINALS, REQUIREMENT, CENSUS_STATUS, NON_CAPTURE_TERMINALS, MISSING } from './source-state.mjs';

export const ESTATE_VERDICT = {
  COMPLETE: 'ESTATE_CAPTURE_COMPLETE',
  INCOMPLETE: 'ESTATE_CAPTURE_INCOMPLETE',
  CENSUS_UNRESOLVED: 'ESTATE_SOURCE_CENSUS_UNRESOLVED',
};

/**
 * Count that refuses to invent a zero.
 *
 * If the census for a class never ran, its population is UNKNOWN. Returning 0
 * there is the single most dangerous line of code in an accounting system: it
 * turns "we did not look" into "there was nothing", and every downstream sum
 * then reconciles perfectly against a fiction.
 */
export function measuredCount(list, censusStatus) {
  if (censusStatus !== CENSUS_STATUS.COMPLETE) return MISSING;
  return list.length;
}

/**
 * Per-class accounting.
 *
 * `records` are SourceRecord instances (or their accounting rows) for ONE
 * source class. Nothing is filtered out: a record with requirement
 * EXCLUDED_BY_POLICY still appears, still carries a terminal state, and is
 * still counted -- just in a different column.
 */
export function accountClass({ sourceClass, sourceSystem, censusStatus, records, censusNote = null, productionRun = false }) {
  if (censusStatus !== CENSUS_STATUS.COMPLETE) {
    return {
      sourceClass, sourceSystem, censusStatus, censusNote,
      // EVERY count is MISSING, not just the obvious ones. An undefined field
      // vanishes through JSON.stringify, which would turn "we could not count"
      // into "this key was never mentioned" -- the same disappearance the
      // accounting exists to prevent, one level up.
      byTerminalClass: MISSING, capOnlyDeferrals: MISSING,
      discovered: MISSING, required: MISSING, notRequired: MISSING,
      terminated: MISSING, unterminated: MISSING, unaccounted: MISSING,
      archived: MISSING, quarantined: MISSING, refused: MISSING,
      byTerminal: MISSING, byMilestone: MISSING, reconciliation: MISSING,
      requiredSetHash: MISSING, terminatedSetHash: MISSING,
      archivedSetHash: MISSING, quarantinedSetHash: MISSING, duplicateSourceIds: [],
      classComplete: false, failures: [`CENSUS_NOT_COMPLETE:${sourceClass}`],
    };
  }

  const rows = records.map((r) => (typeof r.toAccountingRow === 'function' ? r.toAccountingRow() : r));
  const failures = [];

  const required = rows.filter((r) => r.requirement === REQUIREMENT.REQUIRED_CAPTURE);
  const notRequired = rows.filter((r) => r.requirement !== REQUIREMENT.REQUIRED_CAPTURE);

  const byTerminal = {};
  for (const t of Object.values(TERMINAL)) byTerminal[t] = 0;
  let untermimated = 0;
  for (const r of rows) {
    if (r.terminal === null || r.terminal === undefined) untermimated += 1;
    else byTerminal[r.terminal] += 1;
  }

  const byMilestone = {};
  for (const m of Object.values(MILESTONE)) byMilestone[m] = rows.filter((r) => r.milestones.includes(m)).length;

  // The five-column view every discovered source lands in exactly once.
  const byTerminalClass = {};
  for (const c of Object.values(TERMINAL_CLASS)) byTerminalClass[c] = 0;
  for (const r of rows) if (r.terminal) byTerminalClass[terminalClassOf(r.terminal)] += 1;
  const capOnlyDeferrals = rows.filter((r) => r.terminal && CAP_ONLY_TERMINALS.has(r.terminal)).length;

  const archived = required.filter((r) => r.terminal === TERMINAL.ARCHIVED);
  const quarantined = rows.filter((r) => r.terminal === TERMINAL.QUARANTINED_SECRET);
  const refused = required.filter((r) => r.terminal !== null && NON_CAPTURE_TERMINALS.has(r.terminal));
  const unaccounted = required.filter((r) => r.terminal === null);

  if (unaccounted.length > 0) failures.push(`UNACCOUNTED_SOURCES:${sourceClass}:${unaccounted.length}`);

  // Conservation: required == archived + refused, by count AND by set.
  const conservationOk = required.length === archived.length + refused.length;
  if (!conservationOk) failures.push(`CONSERVATION_VIOLATION:${sourceClass}`);
  const requiredSetHash = setHash(required.map((r) => r.sourceId));
  const terminatedSetHash = setHash([...archived, ...refused].map((r) => r.sourceId));
  if (requiredSetHash !== terminatedSetHash) failures.push(`REQUIRED_SET_NOT_FULLY_TERMINATED:${sourceClass}`);

  // Every ARCHIVED row must carry real evidence of every rung it claims.
  for (const r of archived) {
    if (!r.contentHash) failures.push(`ARCHIVED_WITHOUT_CONTENT_HASH:${sourceClass}:${r.sourceId}`);
    if (!r.ledgerEntryHash) failures.push(`ARCHIVED_WITHOUT_LEDGER_ENTRY:${sourceClass}:${r.sourceId}`);
    if (!r.milestones.includes(MILESTONE.RETRIEVABLE)) failures.push(`ARCHIVED_WITHOUT_RETRIEVABILITY:${sourceClass}:${r.sourceId}`);
  }

  // A quarantined source must carry NO content identity at all. A contentHash
  // over credential-bearing bytes is still an artefact of those bytes and is
  // exactly what "creates no raw payload" forbids.
  for (const r of quarantined) {
    if (r.contentHash) failures.push(`QUARANTINED_CARRIES_CONTENT_HASH:${sourceClass}:${r.sourceId}`);
    if (r.ledgerEntryHash) failures.push(`QUARANTINED_CARRIES_LEDGER_ENTRY:${sourceClass}:${r.sourceId}`);
    if (r.milestones.includes(MILESTONE.CAPTURED)) failures.push(`QUARANTINED_REACHED_CAPTURED:${sourceClass}:${r.sourceId}`);
    if (!r.quarantineDetectorIds || r.quarantineDetectorIds.length === 0) {
      failures.push(`QUARANTINED_WITHOUT_DETECTOR_ID:${sourceClass}:${r.sourceId}`);
    }
  }

  // A cap is a fine way to bound a test. It is not a reason a source was left
  // out of the archive, and a production matrix that contains one is claiming
  // estate-wide completeness it did not achieve.
  if (productionRun && capOnlyDeferrals > 0) {
    failures.push(`CAP_ONLY_DEFERRALS_IN_PRODUCTION_MATRIX:${sourceClass}:${capOnlyDeferrals}`);
  }

  const dupIds = findDuplicates(rows.map((r) => r.sourceId));
  if (dupIds.length > 0) failures.push(`DUPLICATE_SOURCE_IDS:${sourceClass}:${dupIds.length}`);

  return {
    sourceClass, sourceSystem, censusStatus, censusNote,
    discovered: rows.length,
    required: required.length,
    notRequired: notRequired.length,
    terminated: rows.length - untermimated,
    unterminated: untermimated,
    unaccounted: unaccounted.length,
    archived: archived.length,
    quarantined: quarantined.length,
    refused: refused.length,
    byTerminal, byMilestone, byTerminalClass, capOnlyDeferrals,
    requiredSetHash, terminatedSetHash,
    archivedSetHash: setHash(archived.map((r) => r.sourceId)),
    quarantinedSetHash: setHash(quarantined.map((r) => r.sourceId)),
    duplicateSourceIds: dupIds,
    classComplete: failures.length === 0,
    failures,
  };
}

/**
 * The cross-cutting safety invariant, checked against the PERSISTED ledger
 * rather than against our own in-memory bookkeeping.
 *
 * Asking the pipeline whether it captured a quarantined source is asking the
 * accused. This reads the ledger back and looks for any observation whose
 * source identity matches something we refused.
 */
export function assertNoQuarantinedMaterialInLedger({ quarantinedRecords, ledgerEntries }) {
  const rows = quarantinedRecords.map((r) => (typeof r.toAccountingRow === 'function' ? r.toAccountingRow() : r));
  const quarantinedNativeIds = new Set(rows.map((r) => r.sourceId));
  const quarantinedPaths = new Set(rows.map((r) => r.relativePath).filter(Boolean));

  const violations = [];
  for (const e of ledgerEntries) {
    if (e.sourceNativeId && quarantinedNativeIds.has(e.sourceNativeId)) {
      violations.push({ code: 'QUARANTINED_SOURCE_PRESENT_IN_LEDGER', entryHash: e.entryHash, sourceNativeId: e.sourceNativeId });
    }
    const rel = e.sourceObservation?.relativePath;
    if (rel && quarantinedPaths.has(rel)) {
      violations.push({ code: 'QUARANTINED_PATH_PRESENT_IN_LEDGER', entryHash: e.entryHash, relativePath: rel });
    }
  }
  return { checked: ledgerEntries.length, quarantinedChecked: rows.length, violations, clean: violations.length === 0 };
}

/**
 * Three-way reconciliation restricted to what SHOULD be in the archive.
 *
 * Expected is not "everything discovered" -- that would count refusals as
 * losses and make a correctly-quarantined credential look like a bug. Expected
 * is discovered MINUS explicitly-refused, and the refusal list is itself part
 * of the proof, so nothing can be quietly moved into it after the fact.
 */
export function reconcileArchived({ records, ledgerEvidenceIds }) {
  const rows = records.map((r) => (typeof r.toAccountingRow === 'function' ? r.toAccountingRow() : r));
  const required = rows.filter((r) => r.requirement === REQUIREMENT.REQUIRED_CAPTURE);
  const refusedIds = required.filter((r) => r.terminal !== null && NON_CAPTURE_TERMINALS.has(r.terminal)).map((r) => r.sourceId);
  const expectedIds = required.filter((r) => !refusedIds.includes(r.sourceId)).map((r) => r.sourceId);
  const archivedRows = required.filter((r) => r.terminal === TERMINAL.ARCHIVED);
  const capturedIds = archivedRows.map((r) => r.sourceId);

  // The ledger side is keyed by evidenceId, so the mapping back to sourceId is
  // explicit rather than assumed. An archived row whose evidenceId is absent
  // from the persisted ledger shows up as a missing ledger observation.
  const ledgerSet = new Set(ledgerEvidenceIds.map(String));
  const ledgerIds = archivedRows.filter((r) => r.evidenceId && ledgerSet.has(String(r.evidenceId))).map((r) => r.sourceId);

  const r = reconcile({ className: 'estate-archived', expectedIds, capturedIds, ledgerIds });
  return { ...r, refusedIds, refusedCount: refusedIds.length };
}

/**
 * Final estate verdict. Every gate mandatory, no weighting, no threshold.
 */
export function evaluateEstate({
  classes,
  archivedReconciliation,
  quarantineLedgerCheck,
  ledgerReadFromPersistedLayer,
  ledgerChainVerified,
  censusIndependent,
  quarantineRegisterVerified,
  storageAuthorityProven = false,
}) {
  const failures = [];

  if (!censusIndependent) {
    return { verdict: ESTATE_VERDICT.CENSUS_UNRESOLVED, failures: ['CENSUS_NOT_INDEPENDENT'], storageAuthorityProven };
  }
  if (classes.some((c) => c.censusStatus !== CENSUS_STATUS.COMPLETE)) {
    return {
      verdict: ESTATE_VERDICT.CENSUS_UNRESOLVED,
      failures: classes.filter((c) => c.censusStatus !== CENSUS_STATUS.COMPLETE).map((c) => `CENSUS_NOT_COMPLETE:${c.sourceClass}`),
      storageAuthorityProven,
    };
  }

  for (const c of classes) failures.push(...c.failures);

  if (!ledgerReadFromPersistedLayer) failures.push('LEDGER_NOT_READ_FROM_PERSISTED_LAYER');
  if (!ledgerChainVerified) failures.push('LEDGER_CHAIN_NOT_VERIFIED');
  if (!quarantineRegisterVerified) failures.push('QUARANTINE_REGISTER_NOT_VERIFIED');
  if (!quarantineLedgerCheck?.clean) failures.push('QUARANTINED_MATERIAL_REACHED_LEDGER');
  if (!archivedReconciliation?.equal) failures.push('ARCHIVED_SET_INEQUALITY');
  if (archivedReconciliation?.countsMaskedADiscrepancy) failures.push('COUNTS_MASKED_A_DISCREPANCY');

  return {
    verdict: failures.length === 0 ? ESTATE_VERDICT.COMPLETE : ESTATE_VERDICT.INCOMPLETE,
    failures: [...new Set(failures)],
    // Software capture completeness says NOTHING about durability. Kept as a
    // separate field so no reader can infer one from the other.
    storageAuthorityProven,
  };
}
