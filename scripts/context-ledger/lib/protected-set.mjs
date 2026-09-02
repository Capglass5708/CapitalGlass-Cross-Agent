/**
 * The protected evidence set.
 *
 * Durability is evaluated over an EVIDENCE CLOSURE, not a directory of blobs.
 * A ciphertext object is not self-describing: its stored layout is
 * [12-byte nonce][16-byte tag][ciphertext] and carries no key-version field.
 * Key version lives in the ledger entry. So replicating objects WITHOUT the
 * ledger yields bytes that survive and cannot be opened:
 *
 *   OBJECT_DURABILITY_WITHOUT_LEDGER_DURABILITY
 *       = DURABLE_BUT_UNDECRYPTABLE = FAIL
 *
 * The ledger is therefore a member of the protected set, not adjacent metadata.
 *
 * POPULATION SPLIT -- permanently explicit, never collapsed:
 *   PRODUCTION    13,998  ledger-bound unique ciphertext; certified
 *   PROVISIONAL        7  orphans; preserved, NOT certified
 *   PRESERVATION  14,005  every physical object that must survive
 *
 * The orphans are preserved because deleting or omitting them would destroy
 * evidence before it is classified. They are not promoted into production, and
 * their missing ledger association is itself evidence -- never repaired by
 * manufacturing an entry.
 */
import { sha256Prefixed, canonicalJson } from './canonical.mjs';

export const OBJECT_CLASS = {
  ORIGINAL_CURRENT_LEDGER_BOUND: 'ORIGINAL_CURRENT_LEDGER_BOUND',
  RECOVERED_LEDGER_ASSOCIATION: 'RECOVERED_LEDGER_ASSOCIATION',
};

/**
 * FROZEN accounting. Bound from the adjudicated reconciliation and the completed
 * recovery pass; never recomputed here.
 *
 * The seven are no longer called orphans. Their bytes were never orphaned -- the
 * CURRENT-ledger association was missing, and it has been recovered by pointing
 * at the preserved superseded entry. Their original historical relationship
 * continues to be represented by that preserved entry, not by anything inserted
 * into either ledger.
 *
 * 13,998 is a HISTORICAL figure: the population originally bound to the current
 * ledger before recovery. It is never rewritten to 14,005.
 */
export const EXPECTED_COUNTS = Object.freeze({
  ORIGINAL_CURRENT_LEDGER_BOUND: 13998,
  RECOVERED_ASSOCIATIONS: 7,
  TOTAL_PROTECTED_OBJECTS: 14005,
});

/** Accounting is frozen; reopening requires new contradictory evidence. */
export const ACCOUNTING_FROZEN = Object.freeze({
  frozen: true,
  RECOVERED_LEDGER_ASSOCIATIONS: 7,
  UNRESOLVED_PROVISIONAL_OBJECTS: 0,
  RECOVERY_IDEMPOTENCE: 'PASS',
  HISTORICAL_LEDGERS_REWRITTEN: 'NO',
  OBJECT_BYTES_MISSING: 0,
  ORPHAN_RECONCILIATION: 'PASS',
  reopenCondition: 'New contradictory evidence only. Not a tidier formulation.',
});

export const PROTECTED_SET_MEMBER = Object.freeze([
  'productionObjects',
  'provisionalObjects',
  'ledgerEntries',
  'ledgerChainMetadata',
  'reconciliationManifest',
  'cryptoMetadata',
]);

export const CLOSURE_DEFECT = {
  LEDGER_ENTRY_ABSENT: 'LEDGER_ENTRY_ABSENT',
  CIPHERTEXT_HASH_ABSENT: 'CIPHERTEXT_HASH_ABSENT',
  CIPHERTEXT_OBJECT_ABSENT: 'CIPHERTEXT_OBJECT_ABSENT',
  CIPHERTEXT_HASH_MISMATCH: 'CIPHERTEXT_HASH_MISMATCH',
  CONTENT_IDENTITY_UNBOUND: 'CONTENT_IDENTITY_UNBOUND',
  ENCRYPTION_METADATA_ABSENT: 'ENCRYPTION_METADATA_ABSENT',
  KEY_VERSION_UNKNOWN: 'KEY_VERSION_UNKNOWN',
  KEY_CUSTODY_POINTER_UNRESOLVABLE: 'KEY_CUSTODY_POINTER_UNRESOLVABLE',
};

export const RECOVERED_KEY_VERSION_STATE = {
  KNOWN_FROM_PRESERVED_ENTRY: 'KNOWN_FROM_PRESERVED_ENTRY',
  KNOWN_FROM_OTHER_EVIDENCE: 'KNOWN_FROM_OTHER_EVIDENCE',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Prove the recoverability chain for ONE ledger-bound object.
 *
 * Every link is asserted separately so a partial failure names the broken link
 * rather than collapsing to "invalid". No link is inferred from another.
 */
export function verifyObjectClosure({ ciphertextHash, objectPresent, objectBytes = null, ledgerEntry, keyCustodyResolver = null }) {
  const defects = [];
  const checks = {
    ledgerEntryExists: false,
    ciphertextHashPresent: false,
    ciphertextObjectExists: false,
    ciphertextHashMatchesLedger: false,
    contentIdentityBound: false,
    encryptionMetadataPresent: false,
    keyVersionKnownFromLedger: false,
    keyCustodyPointerResolvable: false,
  };

  if (!ledgerEntry) {
    defects.push(CLOSURE_DEFECT.LEDGER_ENTRY_ABSENT);
    return closure(checks, defects, null, null);
  }
  checks.ledgerEntryExists = true;

  const enc = ledgerEntry.encryption ?? null;
  if (!enc) {
    defects.push(CLOSURE_DEFECT.ENCRYPTION_METADATA_ABSENT);
    return closure(checks, defects, null, null);
  }
  checks.encryptionMetadataPresent = true;

  if (!enc.ciphertextHash) defects.push(CLOSURE_DEFECT.CIPHERTEXT_HASH_ABSENT);
  else checks.ciphertextHashPresent = true;

  if (!objectPresent) defects.push(CLOSURE_DEFECT.CIPHERTEXT_OBJECT_ABSENT);
  else checks.ciphertextObjectExists = true;

  if (checks.ciphertextHashPresent && checks.ciphertextObjectExists) {
    // Prefer the bytes when supplied: comparing two claims proves less than
    // recomputing from the object itself.
    const observed = objectBytes ? sha256Prefixed(objectBytes) : ciphertextHash;
    checks.ciphertextHashMatchesLedger = observed === enc.ciphertextHash;
    if (!checks.ciphertextHashMatchesLedger) defects.push(CLOSURE_DEFECT.CIPHERTEXT_HASH_MISMATCH);
  }

  // plaintextHash is the identity; ciphertextHash is the storage address.
  if (enc.plaintextHash) checks.contentIdentityBound = true;
  else defects.push(CLOSURE_DEFECT.CONTENT_IDENTITY_UNBOUND);

  const keyVersion = enc.keyVersion ?? null;
  if (keyVersion) checks.keyVersionKnownFromLedger = true;
  else defects.push(CLOSURE_DEFECT.KEY_VERSION_UNKNOWN);

  let custodyPointer = null;
  if (keyVersion && keyCustodyResolver) {
    custodyPointer = keyCustodyResolver(keyVersion, enc.keyRef ?? null);
    if (custodyPointer) checks.keyCustodyPointerResolvable = true;
    else defects.push(CLOSURE_DEFECT.KEY_CUSTODY_POINTER_UNRESOLVABLE);
  } else if (keyVersion) {
    defects.push(CLOSURE_DEFECT.KEY_CUSTODY_POINTER_UNRESOLVABLE);
  }

  return closure(checks, defects, keyVersion, custodyPointer);
}

function closure(checks, defects, keyVersion, custodyPointer) {
  return {
    recoverable: defects.length === 0,
    checks,
    defects,
    keyVersion,
    // A POINTER, never key material. No secret value is read, stored or emitted.
    keyCustodyPointer: custodyPointer,
  };
}

/**
 * Provisional orphans. Their record states what is true and refuses to invent
 * what is not: the object is preserved, the association is absent, and the key
 * version is never inferred.
 */
export function describeRecoveredAssociation({ ciphertextHash, objectPresent, recoveryRecord = null }) {
  const enc = recoveryRecord?.provenFromPreservedEntry?.encryption ?? null;
  return {
    ciphertextHash,
    classification: OBJECT_CLASS.RECOVERED_LEDGER_ASSOCIATION,
    objectPreserved: Boolean(objectPresent),
    currentLedgerAssociation: recoveryRecord ? 'RECOVERED' : 'ABSENT',
    historicalAssociationRepresentedBy: recoveryRecord ? 'PRESERVED_SUPERSEDED_LEDGER_ENTRY' : null,
    supersededLedgerEntryHash: recoveryRecord?.supersededLedgerEntryHash ?? null,
    recoveryRecordId: recoveryRecord?.recoveryRecordId ?? null,
    // Nothing was inserted into either historical ledger.
    manufacturedLedgerEntry: false,
    historicalLedgersRewritten: false,
    keyVersionState: enc?.keyVersion
      ? RECOVERED_KEY_VERSION_STATE.KNOWN_FROM_PRESERVED_ENTRY
      : RECOVERED_KEY_VERSION_STATE.UNKNOWN,
    keyVersion: enc?.keyVersion ?? null,
    // Recovered, not promoted: it is not counted in the historical 13,998.
    countedInOriginalCurrentLedgerBound: false,
  };
}

/**
 * Key-version population over the LEDGER-BOUND production set only.
 * Counts by version id. No secret values, no key material, no tokens.
 */
export function keyVersionPopulation(ledgerEntries) {
  const population = {};
  let unknown = 0;
  for (const e of ledgerEntries) {
    const v = e?.encryption?.keyVersion ?? null;
    if (!v) { unknown += 1; continue; }
    population[v] = (population[v] ?? 0) + 1;
  }
  return { KEY_VERSION_POPULATION: population, UNKNOWN_KEY_VERSION_COUNT: unknown };
}

/**
 * Build the manifest. Interfaces and accounting only -- this replicates
 * nothing and touches no production storage.
 */
export function buildProtectedSetManifest({
  productionObjects = [],
  provisionalObjects = [],
  ledgerEntries = [],
  ledgerChainMetadata = null,
  reconciliationManifest = null,
  cryptoMetadata = null,
} = {}) {
  const counts = {
    ORIGINAL_CURRENT_LEDGER_BOUND_ACTUAL: productionObjects.length,
    RECOVERED_ASSOCIATIONS_ACTUAL: provisionalObjects.length,
    TOTAL_PROTECTED_OBJECTS_ACTUAL: productionObjects.length + provisionalObjects.length,
    LEDGER_ENTRY_COUNT: ledgerEntries.length,
  };
  const members = {
    productionObjects: [...productionObjects].sort(),
    provisionalObjects: [...provisionalObjects].sort(),
    ledgerEntries: [...ledgerEntries].sort(),
    ledgerChainMetadata,
    reconciliationManifest,
    cryptoMetadata,
  };
  const manifest = {
    schema: 'protected-evidence-set-v1@1.0.0',
    expected: EXPECTED_COUNTS,
    counts,
    // Separate manifests and separate receipt counts, permanently.
    populationSplitIsExplicit: true,
    provisionalPromotedToProduction: false,
    members,
    ledgerIsProtectedSetMember: true,
    rationale: 'A ciphertext object carries no key-version field. Objects replicated without the ledger are DURABLE_BUT_UNDECRYPTABLE.',
  };
  manifest.manifestHash = sha256Prefixed(Buffer.from(canonicalJson({ ...manifest, manifestHash: undefined })));
  return manifest;
}

/**
 * Refuse a manifest whose counts disagree with the adjudicated expectation, or
 * which folds the provisional objects into production.
 */
export function assertManifestAccounting(manifest) {
  const c = manifest.counts;
  const e = EXPECTED_COUNTS;
  const problems = [];
  if (c.ORIGINAL_CURRENT_LEDGER_BOUND_ACTUAL !== e.ORIGINAL_CURRENT_LEDGER_BOUND) {
    problems.push(`ORIGINAL_CURRENT_LEDGER_BOUND ${c.ORIGINAL_CURRENT_LEDGER_BOUND_ACTUAL} != frozen ${e.ORIGINAL_CURRENT_LEDGER_BOUND}`);
  }
  if (c.RECOVERED_ASSOCIATIONS_ACTUAL !== e.RECOVERED_ASSOCIATIONS) {
    problems.push(`RECOVERED_ASSOCIATIONS ${c.RECOVERED_ASSOCIATIONS_ACTUAL} != frozen ${e.RECOVERED_ASSOCIATIONS}`);
  }
  if (c.TOTAL_PROTECTED_OBJECTS_ACTUAL !== e.TOTAL_PROTECTED_OBJECTS) {
    problems.push(`TOTAL_PROTECTED_OBJECTS ${c.TOTAL_PROTECTED_OBJECTS_ACTUAL} != frozen ${e.TOTAL_PROTECTED_OBJECTS}`);
  }
  // The historical 13,998 must never be restated as 14,005.
  if (manifest.provisionalPromotedToProduction) problems.push('recovered associations folded into the historical 13,998');
  if (problems.length) {
    const err = new Error('PROTECTED_SET_ACCOUNTING_REFUSED');
    err.problems = problems;
    throw err;
  }
  return true;
}
