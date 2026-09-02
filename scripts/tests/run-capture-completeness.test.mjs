/**
 * Phase 2 capture-completeness contract proofs.
 *
 * These prove the GATE fails closed. No capture is performed and no storage is
 * touched. Phase 2 execution has not begun.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reconcile, evaluate, setHash, findDuplicates, diffSets, derivedRecordId, sourceSetHash, VERDICT }
  from '../context-ledger/lib/completeness.mjs';

const ids = (n, p = 'r') => Array.from({ length: n }, (_, i) => `${p}${i}`);
const base = (over = {}) => ({
  sourceSetAgreed: true, censusIndependent: true,
  physical: reconcile({ expectedIds: ids(3), capturedIds: ids(3), ledgerIds: ids(3) }),
  semanticClasses: [], dag: null, tool: null,
  unknownRecordTypes: [], ledgerReadFromPersistedLayer: true, ...over,
});

test('THE OFFSETTING-ERROR CASE: equal counts, unequal sets, must FAIL', () => {
  // 1000 expected. Capture misses one record and duplicates another.
  // The ledger faithfully stores what capture produced. Counts all read 1000.
  const expected = ids(1000);
  const captured = [...ids(1000).filter((x) => x !== 'r500'), 'r501'];   // missing r500, duplicate r501
  assert.equal(captured.length, 1000, 'counts must be equal, which is what makes this dangerous');

  const r = reconcile({ expectedIds: expected, capturedIds: captured, ledgerIds: captured });
  assert.equal(r.countsEqual, true, 'a count-only gate would have passed this');
  assert.equal(r.setsEqual, false);
  assert.equal(r.equal, false);
  assert.equal(r.countsMaskedADiscrepancy, true);
  assert.deepEqual(r.missingCapturedRecords, ['r500']);
  assert.deepEqual(r.duplicateCapturedRecords, ['r501']);

  const v = evaluate(base({ physical: r }));
  assert.equal(v.verdict, VERDICT.INCOMPLETE);
  assert.ok(v.failures.includes('COUNTS_MASKED_A_DISCREPANCY'));
});

test('happy path: identical sets across all three sides yields CAPTURE_COMPLETE', () => {
  const v = evaluate(base());
  assert.equal(v.verdict, VERDICT.COMPLETE);
  assert.deepEqual(v.failures, []);
});

test('no percentage threshold exists: one missing record in a million FAILS', () => {
  const expected = ids(1000000);
  const captured = expected.slice(0, 999999);          // 99.9999% captured
  const r = reconcile({ expectedIds: expected, capturedIds: captured, ledgerIds: captured });
  assert.equal(r.equal, false);
  assert.equal(evaluate(base({ physical: r })).verdict, VERDICT.INCOMPLETE);
});

test('per-class equality: a surplus in one class cannot offset a deficit in another', () => {
  const good = reconcile({ className: 'toolCalls', expectedIds: ids(5, 't'), capturedIds: ids(5, 't'), ledgerIds: ids(5, 't') });
  const short = reconcile({ className: 'dagEdges', expectedIds: ids(5, 'e'), capturedIds: ids(4, 'e'), ledgerIds: ids(4, 'e') });
  const over = reconcile({ className: 'messageNodes', expectedIds: ids(5, 'm'), capturedIds: ids(6, 'm'), ledgerIds: ids(6, 'm') });
  // aggregate across classes would net out to 15 == 15
  const agg = (a) => a.reduce((s, c) => s + c.counts.captured, 0);
  assert.equal(agg([good, short, over]), 15);
  assert.equal(agg([good, good, good]), 15, 'the aggregate is identical -- which is why aggregates are insufficient');

  const v = evaluate(base({ semanticClasses: [good, short, over] }));
  assert.equal(v.verdict, VERDICT.INCOMPLETE);
  assert.ok(v.failures.includes('CLASS_INEQUALITY:dagEdges'));
  assert.ok(v.failures.includes('CLASS_INEQUALITY:messageNodes'));
  assert.ok(!v.failures.includes('CLASS_INEQUALITY:toolCalls'));
});

test('unknown source record types fail closed', () => {
  const v = evaluate(base({ unknownRecordTypes: [{ type: 'atis-latch', count: 3, preservedRaw: true }] }));
  assert.equal(v.verdict, VERDICT.INCOMPLETE);
  assert.ok(v.failures.includes('UNKNOWN_SOURCE_RECORD_TYPES'),
    'an unrecognised record type must fail the proof, never be discarded as irrelevant');
});

test('source changing between census and capture is its own verdict, not INCOMPLETE', () => {
  const v = evaluate(base({ sourceSetAgreed: false }));
  assert.equal(v.verdict, VERDICT.SOURCE_CHANGED);
});

test('a non-independent census is unresolved, not a pass', () => {
  const v = evaluate(base({ censusIndependent: false }));
  assert.equal(v.verdict, VERDICT.CENSUS_UNRESOLVED,
    'if the capture parser produced its own expectation the equation proves nothing');
});

test('ledger must be read back from the persisted layer', () => {
  const v = evaluate(base({ ledgerReadFromPersistedLayer: false }));
  assert.equal(v.verdict, VERDICT.INCOMPLETE);
  assert.ok(v.failures.includes('LEDGER_NOT_READ_FROM_PERSISTED_LAYER'));
});

test('ledger drift is caught even when capture was perfect', () => {
  const r = reconcile({ expectedIds: ids(10), capturedIds: ids(10), ledgerIds: ids(9) });
  assert.equal(r.equal, false);
  assert.deepEqual(r.missingLedgerObservations, ['r9']);
});

test('DAG gates: cycles, duplicate edges, unaccounted parents, cardinality', () => {
  for (const [dag, code] of [
    [{ uuidsUnique: false, allParentsAccounted: true, duplicateEdges: 0, cycles: 0 }, 'DAG_UUID_NOT_UNIQUE'],
    [{ uuidsUnique: true, allParentsAccounted: false, duplicateEdges: 0, cycles: 0 }, 'DAG_PARENT_UNACCOUNTED'],
    [{ uuidsUnique: true, allParentsAccounted: true, duplicateEdges: 2, cycles: 0 }, 'DAG_DUPLICATE_EDGES'],
    [{ uuidsUnique: true, allParentsAccounted: true, duplicateEdges: 0, cycles: 1 }, 'DAG_CYCLES'],
    [{ uuidsUnique: true, allParentsAccounted: true, duplicateEdges: 0, cycles: 0, graphMatchesCensus: false }, 'DAG_CARDINALITY_MISMATCH'],
  ]) {
    const v = evaluate(base({ dag }));
    assert.equal(v.verdict, VERDICT.INCOMPLETE);
    assert.ok(v.failures.includes(code), `expected ${code}`);
  }
});

test('tool linkage gates: missing, duplicate, unmatched, ambiguous', () => {
  for (const k of ['missingResults', 'duplicateResults', 'unmatchedResults', 'ambiguousPairings']) {
    const v = evaluate(base({ tool: { linked: 4, missingResults: 0, duplicateResults: 0, unmatchedResults: 0, ambiguousPairings: 0, [k]: 1 } }));
    assert.equal(v.verdict, VERDICT.INCOMPLETE, `${k} must fail`);
    assert.ok(v.failures.includes(`TOOL_${k.toUpperCase()}`));
  }
  assert.equal(evaluate(base({ tool: { linked: 4, missingResults: 0, duplicateResults: 0, unmatchedResults: 0, ambiguousPairings: 0 } })).verdict, VERDICT.COMPLETE);
});

test('set digests are order-independent and duplicate-visible', () => {
  assert.equal(setHash(['b', 'a', 'c']), setHash(['c', 'b', 'a']));
  assert.notEqual(setHash(['a', 'b']), setHash(['a', 'c']));
  assert.deepEqual(findDuplicates(['a', 'b', 'a', 'c', 'c']), ['a', 'c']);
  assert.deepEqual(diffSets(['a', 'b'], ['b', 'z']), { missing: ['a'], unexpected: ['z'] });
});

test('derived record identity is deterministic and position-sensitive', () => {
  const f = 'sha256:' + 'a'.repeat(64);
  const h = 'sha256:' + 'b'.repeat(64);
  assert.equal(derivedRecordId({ fileSha256: f, recordIndex: 3, recordHash: h }),
               derivedRecordId({ fileSha256: f, recordIndex: 3, recordHash: h }));
  assert.notEqual(derivedRecordId({ fileSha256: f, recordIndex: 3, recordHash: h }),
                  derivedRecordId({ fileSha256: f, recordIndex: 4, recordHash: h }),
    'two identical records at different positions must remain distinguishable');
  assert.throws(() => derivedRecordId({ fileSha256: f, recordIndex: 0 }), /requires/);
});

test('sourceSetHash is order-independent and change-sensitive', () => {
  const a = { path: '/a.jsonl', byteSize: 10, sha256: 'sha256:' + '1'.repeat(64) };
  const b = { path: '/b.jsonl', byteSize: 20, sha256: 'sha256:' + '2'.repeat(64) };
  assert.equal(sourceSetHash([a, b]), sourceSetHash([b, a]));
  assert.notEqual(sourceSetHash([a, b]), sourceSetHash([a, { ...b, byteSize: 21 }]),
    'a source file growing mid-capture must change the set hash');
});
