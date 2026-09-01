/**
 * Estate accounting proofs. No capture is performed and no storage is touched.
 *
 * The property under test is CONSERVATION: every discovered source ends in
 * exactly one explicit terminal state, and the sum of those states equals the
 * census. A source that is neither archived nor explicitly refused has
 * disappeared, and disappearance must be a FAILURE rather than a smaller number
 * nobody can distinguish from "there was less to capture".
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

import {
  accountClass, reconcileArchived, evaluateEstate, assertNoQuarantinedMaterialInLedger,
  measuredCount, ESTATE_VERDICT,
} from '../context-ledger/lib/estate-completeness.mjs';
import { SourceRecord, MILESTONE, TERMINAL, REQUIREMENT, CENSUS_STATUS, MISSING } from '../context-ledger/lib/source-state.mjs';
import { validate, assertValid } from '../context-ledger/lib/schema-validate.mjs';
import { sha256Prefixed } from '../context-ledger/lib/canonical.mjs';

const REPO_ROOT = path.resolve(new URL('../..', import.meta.url).pathname);

function rec(id, { requirement = REQUIREMENT.REQUIRED_CAPTURE } = {}) {
  return new SourceRecord({
    sourceId: id, sourceSystem: 'documents', sourceClass: 'docs',
    absPath: `/src/${id}`, relativePath: id, sourceRootId: 'root', requirement,
  });
}
function archived(id) {
  const r = rec(id);
  for (const m of [MILESTONE.CAPTURE_ATTEMPTED, MILESTONE.CAPTURED, MILESTONE.HASHED, MILESTONE.PROVENANCE_BOUND, MILESTONE.RETRIEVABLE]) {
    r.reach(m, { observedBy: 'test' });
  }
  r.contentHash = sha256Prefixed(Buffer.from(id));
  r.evidenceId = `documents:root:${id}:${r.contentHash}`;
  r.ledgerEntryHash = `sha256:${'a'.repeat(64)}`;
  r.terminate(TERMINAL.ARCHIVED, 'CAPTURED_THIS_RUN');
  return r;
}
function quarantined(id) {
  const r = rec(id);
  r.reach(MILESTONE.CAPTURE_ATTEMPTED, { observedBy: 'test' });
  r.quarantine = { detectorIds: ['github-token'], findingCount: 1, highestSeverity: 'CRITICAL' };
  r.terminate(TERMINAL.QUARANTINED_SECRET, 'CREDENTIAL_MATERIAL_DETECTED_PRE_ADMISSION');
  return r;
}
const account = (records, over = {}) => accountClass({
  sourceClass: 'docs', sourceSystem: 'documents', censusStatus: CENSUS_STATUS.COMPLETE, records, ...over,
});

test('conservation: required equals archived plus refused, by count AND by set', () => {
  const records = [archived('a'), archived('b'), quarantined('c')];
  const a = account(records);
  assert.equal(a.discovered, 3);
  assert.equal(a.required, 3);
  assert.equal(a.archived, 2);
  assert.equal(a.quarantined, 1);
  assert.equal(a.refused, 1);
  assert.equal(a.unaccounted, 0);
  assert.equal(a.requiredSetHash, a.terminatedSetHash, 'set equality, not just arithmetic');
  assert.equal(a.classComplete, true);
  assert.deepEqual(a.failures, []);
});

test('a source with NO terminal state is UNACCOUNTED and fails the class', () => {
  const dangling = rec('lost');
  const a = account([archived('a'), dangling]);
  assert.equal(a.unaccounted, 1);
  assert.equal(a.unterminated, 1);
  assert.equal(a.classComplete, false);
  assert.ok(a.failures.some((f) => f.startsWith('UNACCOUNTED_SOURCES')));
  assert.ok(a.failures.some((f) => f.startsWith('REQUIRED_SET_NOT_FULLY_TERMINATED')));
});

test('MISSING is never coerced to zero when the census did not complete', () => {
  const a = account([], { censusStatus: CENSUS_STATUS.FAILED });
  assert.equal(a.discovered, MISSING);
  assert.equal(a.required, MISSING);
  assert.equal(a.archived, MISSING);
  assert.notEqual(a.discovered, 0, 'a failed census must not read as an empty one');
  assert.equal(a.classComplete, false);
  assert.equal(measuredCount([1, 2, 3], CENSUS_STATUS.FAILED), MISSING);
  assert.equal(measuredCount([1, 2, 3], CENSUS_STATUS.COMPLETE), 3);
  assert.equal(measuredCount([], CENSUS_STATUS.COMPLETE), 0, 'a MEASURED zero is a real answer');
});

test('a measured zero class (no ChatGPT export present) is complete and honest', () => {
  const a = accountClass({
    sourceClass: 'chatgpt', sourceSystem: 'chatgpt', censusStatus: CENSUS_STATUS.COMPLETE,
    records: [], censusNote: 'ZERO_DISCOVERED_NO_CHATGPT_EXPORT_PRESENT_ON_THIS_MACHINE',
  });
  assert.equal(a.discovered, 0);
  assert.equal(a.unaccounted, 0);
  assert.equal(a.classComplete, true);
  assert.equal(a.censusStatus, CENSUS_STATUS.COMPLETE);
  assert.match(a.censusNote, /ZERO_DISCOVERED/);
});

test('a quarantined record carrying any content identity fails the class', () => {
  const bad = quarantined('leaky');
  bad.contentHash = `sha256:${'f'.repeat(64)}`;             // must never exist
  const a = account([bad]);
  assert.equal(a.classComplete, false);
  assert.ok(a.failures.some((f) => f.startsWith('QUARANTINED_CARRIES_CONTENT_HASH')));
});

test('a quarantined record with no detector id fails: refusal must be attributable', () => {
  const bad = quarantined('unattributed');
  bad.quarantine = { detectorIds: [], findingCount: 0 };
  const a = account([bad]);
  assert.ok(a.failures.some((f) => f.startsWith('QUARANTINED_WITHOUT_DETECTOR_ID')));
});

test('an ARCHIVED record without a ledger entry or retrievability fails', () => {
  const r = archived('half');
  r.ledgerEntryHash = null;
  const a = account([r]);
  assert.ok(a.failures.some((f) => f.startsWith('ARCHIVED_WITHOUT_LEDGER_ENTRY')));
});

test('expected excludes explicit refusals, so a correct quarantine is not a loss', () => {
  const records = [archived('a'), archived('b'), quarantined('c')];
  const r = reconcileArchived({ records, ledgerEvidenceIds: records.filter((x) => x.evidenceId).map((x) => x.evidenceId) });
  assert.equal(r.counts.expected, 2, 'the quarantined source is refused, not missing');
  assert.equal(r.counts.captured, 2);
  assert.equal(r.counts.ledger, 2);
  assert.equal(r.refusedCount, 1);
  assert.equal(r.equal, true);
});

test('an archived record absent from the persisted ledger is a missing observation', () => {
  const records = [archived('a'), archived('b')];
  const r = reconcileArchived({ records, ledgerEvidenceIds: [records[0].evidenceId] });
  assert.equal(r.equal, false);
  assert.deepEqual(r.missingLedgerObservations, ['b']);
});

test('the offsetting-error signature still fails here: equal counts, unequal sets', () => {
  const records = [archived('a'), archived('b')];
  // Ledger holds two observations, but one of them belongs to a different source.
  const r = reconcileArchived({ records, ledgerEvidenceIds: [records[0].evidenceId, 'documents:root:ghost:sha256:x'] });
  assert.equal(r.counts.expected, 2);
  assert.equal(r.counts.captured, 2);
  assert.equal(r.counts.ledger, 1);
  assert.equal(r.equal, false);
});

test('quarantined material appearing in the ledger is detected by reading the ledger back', () => {
  const q = quarantined('secretfile.md');
  const clean = assertNoQuarantinedMaterialInLedger({ quarantinedRecords: [q], ledgerEntries: [] });
  assert.equal(clean.clean, true);

  const contaminated = assertNoQuarantinedMaterialInLedger({
    quarantinedRecords: [q],
    ledgerEntries: [{ entryHash: 'sha256:x', sourceNativeId: 'root:secretfile.md', sourceObservation: { relativePath: 'secretfile.md' } }],
  });
  assert.equal(contaminated.clean, false);
  assert.ok(contaminated.violations.some((v) => v.code === 'QUARANTINED_PATH_PRESENT_IN_LEDGER'));
});

test('every estate gate is mandatory; none is weighted and none is a threshold', () => {
  const records = [archived('a'), quarantined('b')];
  const classes = [account(records)];
  const good = {
    classes,
    archivedReconciliation: reconcileArchived({ records, ledgerEvidenceIds: [records[0].evidenceId] }),
    quarantineLedgerCheck: { clean: true, violations: [] },
    ledgerReadFromPersistedLayer: true,
    ledgerChainVerified: true,
    censusIndependent: true,
    quarantineRegisterVerified: true,
  };
  assert.equal(evaluateEstate(good).verdict, ESTATE_VERDICT.COMPLETE);

  for (const [k, v, failure] of [
    ['ledgerReadFromPersistedLayer', false, 'LEDGER_NOT_READ_FROM_PERSISTED_LAYER'],
    ['ledgerChainVerified', false, 'LEDGER_CHAIN_NOT_VERIFIED'],
    ['quarantineRegisterVerified', false, 'QUARANTINE_REGISTER_NOT_VERIFIED'],
  ]) {
    const r = evaluateEstate({ ...good, [k]: v });
    assert.equal(r.verdict, ESTATE_VERDICT.INCOMPLETE, k);
    assert.ok(r.failures.includes(failure), k);
  }

  const contaminated = evaluateEstate({ ...good, quarantineLedgerCheck: { clean: false, violations: [{}] } });
  assert.ok(contaminated.failures.includes('QUARANTINED_MATERIAL_REACHED_LEDGER'));

  const unresolved = evaluateEstate({ ...good, censusIndependent: false });
  assert.equal(unresolved.verdict, ESTATE_VERDICT.CENSUS_UNRESOLVED);
});

test('an incomplete census short-circuits to CENSUS_UNRESOLVED, never to INCOMPLETE', () => {
  const r = evaluateEstate({
    classes: [account([], { censusStatus: CENSUS_STATUS.NOT_RUN })],
    archivedReconciliation: { equal: true }, quarantineLedgerCheck: { clean: true },
    ledgerReadFromPersistedLayer: true, ledgerChainVerified: true,
    censusIndependent: true, quarantineRegisterVerified: true,
  });
  assert.equal(r.verdict, ESTATE_VERDICT.CENSUS_UNRESOLVED);
});

test('storage authority is reported separately and never inferred from capture completeness', () => {
  const records = [archived('a')];
  const base = {
    classes: [account(records)],
    archivedReconciliation: reconcileArchived({ records, ledgerEvidenceIds: [records[0].evidenceId] }),
    quarantineLedgerCheck: { clean: true }, ledgerReadFromPersistedLayer: true,
    ledgerChainVerified: true, censusIndependent: true, quarantineRegisterVerified: true,
  };
  const r = evaluateEstate({ ...base, storageAuthorityProven: false });
  assert.equal(r.verdict, ESTATE_VERDICT.COMPLETE, 'capture can be complete while nothing is durably stored');
  assert.equal(r.storageAuthorityProven, false, 'and that fact must survive into the verdict object');
});

// ---------------------------------------------------------------------------
// CONTRACTS
// ---------------------------------------------------------------------------

test('capture-completeness-v1 is byte-identical to the committed version', () => {
  // Operator constraint: the single-session Claude proof is PRESERVED AS-IS.
  // Its scope consts are deliberate locks, and relaxing them in place would
  // silently redefine a proof that has already been passed.
  const rel = 'contracts/context-ledger/capture-completeness-v1.schema.json';
  const onDisk = readFileSync(path.join(REPO_ROOT, rel));
  const committed = execFileSync('git', ['-C', REPO_ROOT, 'show', `HEAD:${rel}`], { maxBuffer: 8 * 1024 * 1024 });
  assert.equal(sha256Prefixed(onDisk), sha256Prefixed(committed), 'the single-session contract must not be edited by this mission');

  const schema = JSON.parse(onDisk.toString('utf8'));
  assert.equal(schema.properties.scope.properties.sourceSystem.const, 'claude-code');
  assert.equal(schema.properties.scope.properties.singleSessionOnly.const, true);
});

test('the estate contract exists alongside it and can express what the other cannot', () => {
  const schema = JSON.parse(readFileSync(path.join(REPO_ROOT, 'contracts/context-ledger/estate-capture-completeness-v1.schema.json'), 'utf8'));
  const systems = schema.properties.classes.items.properties.sourceSystem.enum;
  assert.ok(systems.length > 1, 'multi-source is the whole point');
  assert.ok(systems.includes('chatgpt') && systems.includes('documents'));
  // Non-capture terminal accounting, which the session proof has no field for.
  assert.ok('quarantined' in schema.properties.classes.items.properties);
  assert.ok('unaccounted' in schema.properties.classes.items.properties);
  assert.ok(schema.properties.classes.items.required.includes('quarantined'));
  // Durability stays a separate object so it cannot be read off the verdict.
  assert.equal(schema.properties.storageAuthority.properties.status.enum.join(','), 'PROVEN,NOT_PROVEN');
  // Test-key runs must stay distinguishable from production ones.
  assert.deepEqual(schema.properties.keyAuthority.properties.authority.enum, ['PRODUCTION', 'TEST_ONLY']);
});

test('the quarantine contract forbids storing anything derived from the secret', () => {
  const schema = JSON.parse(readFileSync(path.join(REPO_ROOT, 'contracts/context-ledger/quarantine-register-entry-v1.schema.json'), 'utf8'));
  assert.equal(schema.properties.payloadCaptured.const, false);
  assert.equal(schema.properties.contentHashWithheld.const, true);
  const finding = schema.properties.detection.properties.findings.items;
  assert.equal(finding.additionalProperties, false, 'this is what stops a valueHash field being added later');
  assert.deepEqual(finding.required.sort(), ['detectorId', 'length', 'offset', 'redacted', 'severity']);
  assert.equal(finding.properties.redacted.const, '[REDACTED]');
  assert.equal('contentHash' in schema.properties, false);
  assert.equal('encryption' in schema.properties, false);
});

test('the schema validator enforces what these contracts rely on', () => {
  const schema = {
    type: 'object',
    required: ['a'],
    properties: {
      a: { type: 'string', pattern: '^sha256:[a-f0-9]{4}$' },
      b: { type: ['integer', 'null'], minimum: 0 },
      c: { const: false },
      d: { enum: ['X', 'Y'] },
      e: { type: 'array', minItems: 1, items: { type: 'string' } },
      f: { type: 'string', format: 'date-time' },
    },
    additionalProperties: false,
  };
  assert.equal(validate({ a: 'sha256:abcd' }, schema).valid, true);
  assert.equal(validate({}, schema).errors[0].code, 'REQUIRED_PROPERTY_MISSING');
  assert.equal(validate({ a: 'nope' }, schema).errors[0].code, 'PATTERN_MISMATCH');
  assert.equal(validate({ a: 'sha256:abcd', z: 1 }, schema).errors[0].code, 'ADDITIONAL_PROPERTY_NOT_ALLOWED');
  assert.equal(validate({ a: 'sha256:abcd', b: null }, schema).valid, true, 'null must be allowed by a union type');
  assert.equal(validate({ a: 'sha256:abcd', b: -1 }, schema).errors[0].code, 'MINIMUM_VIOLATED');
  assert.equal(validate({ a: 'sha256:abcd', c: true }, schema).errors[0].code, 'CONST_MISMATCH');
  assert.equal(validate({ a: 'sha256:abcd', d: 'Z' }, schema).errors[0].code, 'ENUM_MISMATCH');
  assert.equal(validate({ a: 'sha256:abcd', e: [] }, schema).errors[0].code, 'MIN_ITEMS_VIOLATED');
  assert.equal(validate({ a: 'sha256:abcd', e: [1] }, schema).errors[0].code, 'TYPE_MISMATCH');
  assert.equal(validate({ a: 'sha256:abcd', f: 'yesterday' }, schema).errors[0].code, 'FORMAT_DATE_TIME_INVALID');
  assert.throws(() => assertValid({}, schema, 'doc'), (e) => e.message === 'SCHEMA_VALIDATION_FAILED');

  // An unsupported keyword is REPORTED rather than silently ignored: a
  // validator that quietly skips half a schema claims more than it checked.
  const r = validate({ a: 'sha256:abcd' }, { ...schema, oneOf: [] });
  assert.ok(r.unsupported.some((u) => u.endsWith(':oneOf')));
});
