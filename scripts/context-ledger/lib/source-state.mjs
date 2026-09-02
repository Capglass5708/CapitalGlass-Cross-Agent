/**
 * Source lifecycle states.
 *
 * The failure this file prevents is the one that does not look like a failure:
 * a source is discovered, something goes wrong, and it quietly stops being
 * mentioned. Final accounting then shows a smaller number that nobody can
 * distinguish from "there were fewer sources". Absence must be a VALUE, not a
 * gap.
 *
 * Two orthogonal axes, deliberately not merged into one enum:
 *
 *   MILESTONES  -- what was actually achieved, in order. Ordered and monotone.
 *   TERMINAL    -- how the source's journey ended. Exactly one per source.
 *
 * Collapsing them would make "captured" and "quarantined" members of the same
 * ladder, and the moment those share a scale someone will compare them.
 */

/**
 * The success ladder. A source that is genuinely in the archive reaches
 * RETRIEVABLE -- not CAPTURED. "The bytes were written somewhere" is a claim
 * about our intent; "the bytes came back and hashed identically" is a claim
 * about reality, and only the second one is worth recording.
 */
export const MILESTONE = {
  DISCOVERED: 'DISCOVERED',
  CAPTURE_ATTEMPTED: 'CAPTURE_ATTEMPTED',
  CAPTURED: 'CAPTURED',
  HASHED: 'HASHED',
  PROVENANCE_BOUND: 'PROVENANCE_BOUND',
  RETRIEVABLE: 'RETRIEVABLE',
};

export const MILESTONE_ORDER = [
  MILESTONE.DISCOVERED,
  MILESTONE.CAPTURE_ATTEMPTED,
  MILESTONE.CAPTURED,
  MILESTONE.HASHED,
  MILESTONE.PROVENANCE_BOUND,
  MILESTONE.RETRIEVABLE,
];

/**
 * Terminal states. Every REQUIRED_CAPTURE source must end on exactly one.
 *
 * QUARANTINED_SECRET is NOT a degraded capture and NOT a failure -- it is a
 * successful refusal. It is listed here rather than under failures so that no
 * report can present it as "capture worked but a bit less well".
 */
export const TERMINAL = {
  ARCHIVED: 'ARCHIVED',                                   // reached RETRIEVABLE
  QUARANTINED_SECRET: 'QUARANTINED_SECRET',               // credential material detected pre-admission
  SOURCE_UNAVAILABLE: 'SOURCE_UNAVAILABLE',               // vanished, unreadable, permission denied
  SOURCE_CHANGED_DURING_CAPTURE: 'SOURCE_CHANGED_DURING_CAPTURE',
  MALFORMED_REFUSED: 'MALFORMED_REFUSED',                 // metadata/structure could not be trusted
  CORRUPT_REFUSED: 'CORRUPT_REFUSED',                     // bytes failed their own integrity check
  CAPTURE_FAILED: 'CAPTURE_FAILED',                       // pipeline error, explicitly recorded
  EXCLUDED_BY_POLICY: 'EXCLUDED_BY_POLICY',
  DEFERRED_OUT_OF_RUN_SCOPE: 'DEFERRED_OUT_OF_RUN_SCOPE',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
};

/** States in which the source contributed NO bytes to the archive. */
export const NON_CAPTURE_TERMINALS = new Set([
  TERMINAL.QUARANTINED_SECRET,
  TERMINAL.SOURCE_UNAVAILABLE,
  TERMINAL.SOURCE_CHANGED_DURING_CAPTURE,
  TERMINAL.MALFORMED_REFUSED,
  TERMINAL.CORRUPT_REFUSED,
  TERMINAL.CAPTURE_FAILED,
  TERMINAL.EXCLUDED_BY_POLICY,
  TERMINAL.DEFERRED_OUT_OF_RUN_SCOPE,
  TERMINAL.NOT_APPLICABLE,
]);

/**
 * The FIVE terminal classes final accounting is stated in.
 *
 * The finer terminal states above exist for diagnosis -- "the file vanished"
 * and "the pipeline threw" need different fixes -- but a completeness matrix
 * has to be readable without a glossary, and every discovered source has to
 * land in exactly one column. This projection is total: a terminal with no
 * mapping is a programming error rather than a silent "other".
 *
 * DEFERRED_OUT_OF_RUN_SCOPE maps to EXCLUDED_WITH_REASON and is separately
 * counted, because "excluded because a test cap said so" is not a reason -- it
 * is the absence of one, and it must be zero in a production matrix.
 */
export const TERMINAL_CLASS = {
  CAPTURED: 'CAPTURED',
  QUARANTINED_SECRET: 'QUARANTINED_SECRET',
  EXCLUDED_WITH_REASON: 'EXCLUDED_WITH_REASON',
  FAILED_WITH_REASON: 'FAILED_WITH_REASON',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
};

const TERMINAL_TO_CLASS = {
  ARCHIVED: TERMINAL_CLASS.CAPTURED,
  QUARANTINED_SECRET: TERMINAL_CLASS.QUARANTINED_SECRET,
  EXCLUDED_BY_POLICY: TERMINAL_CLASS.EXCLUDED_WITH_REASON,
  DEFERRED_OUT_OF_RUN_SCOPE: TERMINAL_CLASS.EXCLUDED_WITH_REASON,
  NOT_APPLICABLE: TERMINAL_CLASS.NOT_APPLICABLE,
  SOURCE_UNAVAILABLE: TERMINAL_CLASS.FAILED_WITH_REASON,
  SOURCE_CHANGED_DURING_CAPTURE: TERMINAL_CLASS.FAILED_WITH_REASON,
  MALFORMED_REFUSED: TERMINAL_CLASS.FAILED_WITH_REASON,
  CORRUPT_REFUSED: TERMINAL_CLASS.FAILED_WITH_REASON,
  CAPTURE_FAILED: TERMINAL_CLASS.FAILED_WITH_REASON,
};

export function terminalClassOf(terminal) {
  const c = TERMINAL_TO_CLASS[terminal];
  if (!c) {
    const e = new Error('TERMINAL_HAS_NO_CLASS_MAPPING');
    e.terminal = terminal;
    throw e;
  }
  return c;
}

/** Terminals that mean "excluded because a cap said so", which is not a reason. */
export const CAP_ONLY_TERMINALS = new Set([TERMINAL.DEFERRED_OUT_OF_RUN_SCOPE]);

/**
 * Terminals that assert "no bytes of this source ever entered the archive".
 * Claiming one of these after a ledger observation exists is a contradiction,
 * and it is the specific contradiction an attacker or a sloppy retry loop would
 * use to make a captured secret look refused.
 */
export const POST_LEDGER_FORBIDDEN_TERMINALS = new Set([
  TERMINAL.QUARANTINED_SECRET,
  TERMINAL.EXCLUDED_BY_POLICY,
  TERMINAL.DEFERRED_OUT_OF_RUN_SCOPE,
  TERMINAL.NOT_APPLICABLE,
  TERMINAL.SOURCE_UNAVAILABLE,
]);

/** How a discovered source is treated by THIS run. Declared before capture, never after. */
export const REQUIREMENT = {
  REQUIRED_CAPTURE: 'REQUIRED_CAPTURE',
  DEFERRED_OUT_OF_RUN_SCOPE: 'DEFERRED_OUT_OF_RUN_SCOPE',
  EXCLUDED_BY_POLICY: 'EXCLUDED_BY_POLICY',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
};

/**
 * Census status. A class with no sources and a class whose census never ran
 * both produce "no sources" -- and they mean opposite things.
 */
export const CENSUS_STATUS = {
  COMPLETE: 'CENSUS_COMPLETE',
  FAILED: 'CENSUS_FAILED',
  NOT_RUN: 'CENSUS_NOT_RUN',
};

/** MISSING is null, and null is never coerced to 0 anywhere in this pipeline. */
export const MISSING = null;

export class SourceRecord {
  constructor({ sourceId, sourceSystem, sourceClass, absPath, relativePath, sourceRootId, byteSize = MISSING, mtime = MISSING, requirement = REQUIREMENT.REQUIRED_CAPTURE, classificationRule = null }) {
    if (!sourceId) throw new TypeError('SourceRecord requires a sourceId');
    Object.assign(this, {
      sourceId, sourceSystem, sourceClass, absPath, relativePath, sourceRootId,
      byteSize, mtime, requirement, classificationRule,
    });
    this.milestones = [MILESTONE.DISCOVERED];
    // Each rung carries its OWN observed evidence. Six states derived from one
    // observation are one fact wearing six labels: if CAPTURED is inferred from
    // HASHED and RETRIEVABLE is inferred from CAPTURED, then a single spool
    // write silently satisfies the whole ladder. An independent verifier must
    // be able to check any rung without trusting the one below it.
    this.milestoneEvidence = {
      [MILESTONE.DISCOVERED]: { observedBy: 'census', sourceRootId, relativePath },
    };
    this.terminal = null;
    this.terminalReason = null;
    this.contentHash = MISSING;
    this.evidenceId = MISSING;
    this.ledgerEntryHash = MISSING;
    this.durabilityState = MISSING;
    this.provenance = MISSING;
    this.quarantine = MISSING;
    this.detail = {};
  }

  /**
   * Milestones advance in order only, and each one must be handed its own
   * evidence. A skipped rung would forge a claim we never proved; an
   * evidence-free rung would prove it only by assertion.
   */
  reach(milestone, evidence = null) {
    const want = MILESTONE_ORDER.indexOf(milestone);
    if (want < 0) throw new TypeError(`unknown milestone: ${milestone}`);
    const have = MILESTONE_ORDER.indexOf(this.milestones[this.milestones.length - 1]);
    if (want !== have + 1) {
      const e = new Error('MILESTONE_OUT_OF_ORDER');
      e.sourceId = this.sourceId; e.from = this.milestones[this.milestones.length - 1]; e.to = milestone;
      throw e;
    }
    if (evidence === null || typeof evidence !== 'object') {
      const e = new Error('MILESTONE_REACHED_WITHOUT_EVIDENCE');
      e.sourceId = this.sourceId; e.milestone = milestone;
      throw e;
    }
    this.milestones.push(milestone);
    this.milestoneEvidence[milestone] = evidence;
    return this;
  }

  reached(milestone) { return this.milestones.includes(milestone); }

  /** Terminal state is assigned exactly once. Reassignment would rewrite history. */
  terminate(terminal, reason = null) {
    if (!Object.values(TERMINAL).includes(terminal)) throw new TypeError(`unknown terminal: ${terminal}`);
    if (this.terminal !== null) {
      const e = new Error('TERMINAL_STATE_ALREADY_ASSIGNED');
      e.sourceId = this.sourceId; e.existing = this.terminal; e.attempted = terminal;
      throw e;
    }
    if (terminal === TERMINAL.ARCHIVED && !this.reached(MILESTONE.RETRIEVABLE)) {
      const e = new Error('ARCHIVED_WITHOUT_RETRIEVABILITY_PROOF');
      e.sourceId = this.sourceId; e.milestones = [...this.milestones];
      throw e;
    }
    if (POST_LEDGER_FORBIDDEN_TERMINALS.has(terminal) && this.reached(MILESTONE.PROVENANCE_BOUND)) {
      // A source that already has a ledger observation cannot afterwards be
      // declared quarantined, excluded, deferred, inapplicable or missing. Those
      // five all assert "its bytes never entered the archive", which a ledger
      // observation contradicts. CAPTURE_FAILED and the two integrity refusals
      // are NOT in this set: a source can be bound and then fail its
      // retrievability proof, and that outcome has to remain expressible.
      const e = new Error('NON_CAPTURE_TERMINAL_AFTER_LEDGER_BINDING');
      e.sourceId = this.sourceId; e.attempted = terminal;
      throw e;
    }
    this.terminal = terminal;
    this.terminalReason = reason;
    return this;
  }

  isTerminated() { return this.terminal !== null; }

  /** Safe projection. Contains no source content and no credential material by construction. */
  toAccountingRow() {
    return {
      sourceId: this.sourceId,
      sourceSystem: this.sourceSystem,
      sourceClass: this.sourceClass,
      relativePath: this.relativePath,
      sourceRootId: this.sourceRootId,
      byteSize: this.byteSize,
      requirement: this.requirement,
      milestones: [...this.milestones],
      milestoneEvidence: this.milestoneEvidence,
      highestMilestone: this.milestones[this.milestones.length - 1],
      replication: this.replication ?? MISSING,
      terminal: this.terminal,
      terminalClass: this.terminal === null ? MISSING : terminalClassOf(this.terminal),
      terminalReason: this.terminalReason,
      contentHash: this.contentHash,
      evidenceId: this.evidenceId,
      ledgerEntryHash: this.ledgerEntryHash,
      durabilityState: this.durabilityState,
      provenanceCompleteness: this.provenance?.completeness ?? MISSING,
      quarantineDetectorIds: this.quarantine?.detectorIds ?? MISSING,
    };
  }
}
