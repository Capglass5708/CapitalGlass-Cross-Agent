import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertBoundProse, containsUnboundQuantity, renderMeasurement, BINDING }
  from '../context-ledger/lib/quantitative-prose.mjs';

const EMITTERS = [
  'scripts/context-ledger/lib/mount-transport.mjs',
  'scripts/context-ledger/context-ledger-v1.mjs',
  'scripts/context-ledger/estate-capture-v1.mjs',
];

test('MUTATION CONTROL: injecting a fake rate into prose is REFUSED', () => {
  assert.throws(
    () => assertBoundProse('replication ok. drvfs measures ~9.3 MB/s and is fine.', { derived: [] }),
    (e) => e.message === 'UNBOUND_QUANTITATIVE_PROSE' && e.binding === BINDING.REFUSED,
    'a fabricated throughput literal must be refused, not emitted',
  );
});

test('the exact historical defect would now be caught', () => {
  const fullyProtectedCount = 2, archivedCount = 17670;
  assert.throws(() => assertBoundProse(
    `REPLICATION PATH PROVEN BY CANARY ONLY: ${fullyProtectedCount} of ${archivedCount} archived objects reached FULLY_PROTECTED. drvfs measures ~4.7 MB/s and is not a bulk replication route.`,
    { derived: [fullyProtectedCount, archivedCount] },
  ), (e) => e.message === 'UNBOUND_QUANTITATIVE_PROSE');
});

test('derived counts remain legal in the same sentence', () => {
  const fullyProtectedCount = 2, archivedCount = 17670;
  const s = assertBoundProse(
    `${fullyProtectedCount} of ${archivedCount} archived objects reached FULLY_PROTECTED on both real remote legs.`,
    { derived: [fullyProtectedCount, archivedCount] },
  );
  assert.match(s, /2 of 17670/, 'computed values must survive; the rule targets typed values');
});

test('an unbound measurement renders UNMEASURED, never vanishes', () => {
  assert.equal(renderMeasurement(null), 'UNMEASURED');
  assert.equal(renderMeasurement({ measurementStatus: 'UNMEASURED' }), 'UNMEASURED');
  assert.equal(renderMeasurement({ measurementStatus: 'MEASURED', value: 12, unit: 'MB/s' }), 'UNMEASURED',
    'MEASURED without command/exitStatus/rawOutputSha256 is still UNMEASURED');
  assert.equal(renderMeasurement({
    measurementStatus: 'MEASURED', value: 12, unit: 'MB/s',
    command: 'dd ...', exitStatus: 0, rawOutputSha256: 'sha256:' + 'a'.repeat(64),
  }), '12 MB/s');
});

test('unit detection covers the shapes that reached evidence', () => {
  for (const s of ['4.7 MB/s', '~4.7', '180 seconds', '95%', '17670 objects', 'per second', '250 ms']) {
    assert.equal(containsUnboundQuantity(s), true, `should flag: ${s}`);
  }
  for (const s of ['ESTATE_CAPTURE_STORAGE_INCOMPLETE', 'sha256:abc', 'v1', 'DRVFS_MOUNT']) {
    assert.equal(containsUnboundQuantity(s), false, `should not flag: ${s}`);
  }
});

test('REGRESSION: no emitter still carries the retracted figures', () => {
  for (const f of EMITTERS) {
    const src = readFileSync(f, 'utf8');
    assert.ok(!/4\.7\s*MB\/s/.test(src), `${f} still contains the retracted throughput value`);
    assert.ok(!/one (small )?file per ~?180/.test(src), `${f} still contains the retracted small-file figure`);
  }
});
