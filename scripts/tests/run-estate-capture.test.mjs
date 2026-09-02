/**
 * Estate capture funnel proofs.
 *
 * FIXTURE-KEY EVIDENCE. Every test here runs under a locally generated
 * test-only key and local fixture transports. It proves SOFTWARE BEHAVIOUR and
 * nothing else. It is not production acceptance, it does not touch the real
 * estate, and no result in this file may be presented as evidence that real
 * evidence was captured or durably stored.
 *
 * All credential-shaped strings are SYNTHETIC and were never real.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { randomBytes } from 'node:crypto';

import { sha256Prefixed, objectStorePath } from '../context-ledger/lib/canonical.mjs';
import { scanEntries, reconstructHead, entryFileName, computeEntryHash, ENTRY_DIR, HEAD_FILE } from '../context-ledger/lib/ledger.mjs';
import { LocalFixtureTransport, SshRsyncTransport } from '../context-ledger/lib/transport.mjs';
import { SourceRecord, MILESTONE, TERMINAL, REQUIREMENT } from '../context-ledger/lib/source-state.mjs';
import {
  captureSource, CAPTURE_MODE, KEY_AUTHORITY, LEG_STATUS, legStatusFrom,
  assertRealCaptureAdmissible, assertNoUnearnedProtection, validateFormat, evidenceIdFor,
} from '../context-ledger/lib/capture.mjs';
import { STATE } from '../context-ledger/lib/worker.mjs';
import {
  ensureVault, vaultLayout, lookupByEntryHash, lookupByContentHash, restoreAdmittedBytes,
  verifyEntry, verifyChain, casProbe, quarantineStatus, isolateVault, recoverHead,
  auditSpoolForPlaintext, migratePlaintextSpool,
} from '../context-ledger/lib/estate-api.mjs';
import { validate } from '../context-ledger/lib/schema-validate.mjs';

const TEST_ONLY_KEY = randomBytes(32);          // never touches a real capture path
const KEYREF = 'CONTEXT_LEDGER_EVIDENCE_KEY';
const SYNTHETIC_GITHUB_TOKEN = 'ghp_A7f3Kd91Zq0Wm5Rt8Bn2Yx6Cv4Lp0Hs3JgQw';   // not real

const REPO_ROOT = path.resolve(new URL('../..', import.meta.url).pathname);
const ENTRY_SCHEMA = JSON.parse(readFileSync(path.join(REPO_ROOT, 'contracts/context-ledger/evidence-ledger-entry-v1.schema.json'), 'utf8'));

function env() {
  const base = mkdtempSync(path.join(os.tmpdir(), 'estate-capture-'));
  const layout = ensureVault(base);
  const srcRoot = path.join(base, 'sources');
  mkdirSync(srcRoot, { recursive: true });
  return {
    base, srcRoot, ...layout,
    primary: new LocalFixtureTransport({ root: path.join(base, 'primary'), id: 'synology-fixture', host: 'cg-server' }),
    backup: new LocalFixtureTransport({ root: path.join(base, 'backup'), id: 'wesleydesk-fixture', host: 'wesleydesk' }),
    cleanup() { rmSync(base, { recursive: true, force: true }); },
  };
}

function writeSource(e, rel, content) {
  const abs = path.join(e.srcRoot, rel);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, content);
  return abs;
}

function record(e, rel, { sourceSystem = 'documents', sourceClass = 'test', absPath = null } = {}) {
  return new SourceRecord({
    sourceId: `${sourceClass}:test-root:${rel}`,
    sourceSystem, sourceClass,
    absPath: absPath ?? path.join(e.srcRoot, rel),
    relativePath: rel, sourceRootId: 'test-root',
    requirement: REQUIREMENT.REQUIRED_CAPTURE,
  });
}

const capture = (e, rec, over = {}) => captureSource({
  record: rec,
  key: TEST_ONLY_KEY, keyRef: KEYREF, keyAuthority: KEY_AUTHORITY.TEST_ONLY,
  spoolRoot: e.spoolRoot, vaultRoot: e.vaultRoot, metaRoot: e.metaRoot,
  primary: e.primary, backup: e.backup,
  registerRoot: e.registerRoot, registerMetaRoot: e.registerMetaRoot,
  mode: CAPTURE_MODE.FIXTURE, machineId: 'TEST-MACHINE',
  format: 'text',
  ...over,
});

// ---------------------------------------------------------------------------
// Happy path and the six independently-evidenced milestones
// ---------------------------------------------------------------------------

test('clean source: full ladder to ARCHIVED, each milestone backed by its own observation', async () => {
  const e = env();
  try {
    const body = '# Decision log\n\nThe Builder lane holds the only mutation authority.\n';
    writeSource(e, 'docs/decision.md', body);
    const r = record(e, 'docs/decision.md');
    const out = await capture(e, r);

    assert.equal(out.outcome, TERMINAL.ARCHIVED);
    assert.deepEqual(r.milestones, [
      MILESTONE.DISCOVERED, MILESTONE.CAPTURE_ATTEMPTED, MILESTONE.CAPTURED,
      MILESTONE.HASHED, MILESTONE.PROVENANCE_BOUND, MILESTONE.RETRIEVABLE,
    ]);

    // No rung may be a restatement of the one below it. Each carries a
    // DIFFERENT kind of observation, made by a different piece of code.
    const ev = r.milestoneEvidence;
    assert.equal(ev[MILESTONE.CAPTURE_ATTEMPTED].observedBy, 'pre-admission-secret-scan');
    assert.equal(ev[MILESTONE.CAPTURE_ATTEMPTED].scannedBytes, Buffer.byteLength(body));
    assert.equal(ev[MILESTONE.CAPTURED].observedBy, 'independent-stat-of-encrypted-spool-object');
    assert.equal(ev[MILESTONE.CAPTURED].spoolPayload, 'CIPHERTEXT');
    assert.equal(ev[MILESTONE.CAPTURED].byteSizesEqual, true);
    assert.equal(ev[MILESTONE.CAPTURED].sourcePlaintextNeverWrittenToDisk, true);
    assert.equal(ev[MILESTONE.HASHED].observedBy, 'three-independent-digests');
    assert.equal(ev[MILESTONE.HASHED].sourceStreamHash, ev[MILESTONE.HASHED].plaintextRecoveredFromPersistedSpoolObject);
    assert.equal(ev[MILESTONE.PROVENANCE_BOUND].observedBy, 're-read-of-persisted-ledger-entry');
    assert.equal(ev[MILESTONE.PROVENANCE_BOUND].entryHashRecomputedAndEqual, true);
    assert.equal(ev[MILESTONE.RETRIEVABLE].observedBy, 'decryption-of-persisted-encrypted-object');
    assert.equal(ev[MILESTONE.RETRIEVABLE].remoteRetrievalProven, false);

    // Identity is the hash of the RAW source bytes -- nothing normalised.
    assert.equal(r.contentHash, sha256Prefixed(Buffer.from(body, 'utf8')));
    assert.equal(scanEntries(e.vaultRoot).length, 1);

    // ENCRYPT-FIRST: the admitted plaintext must not exist anywhere at rest.
    const plaintextAddress = path.join(e.spoolRoot, objectStorePath(r.contentHash));
    assert.equal(existsSync(plaintextAddress), false, 'admitted plaintext must never be persisted');
    const audit = auditSpoolForPlaintext(e.base);
    assert.equal(audit.verdict, 'NONE_FOR_PRODUCTION_CAPTURE');
    assert.equal(audit.plaintextSuspects, 0);
  } finally { e.cleanup(); }
});

test('a persisted ledger entry validates against evidence-ledger-entry-v1', async () => {
  const e = env();
  try {
    writeSource(e, 'a.md', 'content for schema validation\n');
    await capture(e, record(e, 'a.md'));
    const [entry] = scanEntries(e.vaultRoot);
    const v = validate(entry, ENTRY_SCHEMA);
    assert.deepEqual(v.errors, [], 'the writer must satisfy its own contract');
    assert.equal(v.valid, true);
  } finally { e.cleanup(); }
});

// ---------------------------------------------------------------------------
// QUARANTINE -- the non-capture terminal state
// ---------------------------------------------------------------------------

test('SAFE SYNTHETIC secret: source is quarantined and NOTHING of it is captured', async () => {
  const e = env();
  try {
    const body = `# runbook\n\nexport GITHUB_TOKEN=${SYNTHETIC_GITHUB_TOKEN}\n`;
    writeSource(e, 'runbook.md', body);
    const r = record(e, 'runbook.md');
    const out = await capture(e, r);

    assert.equal(out.outcome, TERMINAL.QUARANTINED_SECRET);
    assert.equal(out.quarantined, true);

    // 1. no raw immutable ledger payload
    assert.equal(scanEntries(e.vaultRoot).length, 0, 'a quarantined source must produce no ledger entry');
    // 2. no content identity of any kind -- not even a hash
    assert.equal(r.contentHash, null);
    assert.equal(r.ledgerEntryHash, null);
    // 3. nothing on any storage leg, and nothing in the spool
    const wouldBe = path.join(e.spoolRoot, objectStorePath(sha256Prefixed(Buffer.from(body, 'utf8'))));
    assert.equal(existsSync(wouldBe), false, 'quarantined bytes must never reach the spool');
    // 4. the ladder stops at CAPTURE_ATTEMPTED
    assert.deepEqual(r.milestones, [MILESTONE.DISCOVERED, MILESTONE.CAPTURE_ATTEMPTED]);
    // 5. but its existence IS accounted for, with actionable safe metadata
    const q = quarantineStatus(e.base);
    assert.equal(q.count, 1);
    assert.equal(q.verified, true);
    assert.equal(q.records[0].payloadCaptured, false);
    assert.equal(q.records[0].contentHashWithheld, true);
    assert.ok(q.records[0].detectorIds.includes('github-token'));
    assert.equal(q.records[0].byteSize, Buffer.byteLength(body));
    assert.equal(q.records[0].sourcePath, path.join(e.srcRoot, 'runbook.md'));
  } finally { e.cleanup(); }
});

test('the quarantine register never contains the credential, in any field', async () => {
  const e = env();
  try {
    writeSource(e, 'creds.env', `API_TOKEN=${SYNTHETIC_GITHUB_TOKEN}\n`);
    await capture(e, record(e, 'creds.env'));
    const dir = path.join(e.registerRoot, ENTRY_DIR);
    const raw = readFileSync(path.join(dir, readdirSync(dir)[0]), 'utf8');
    assert.ok(!raw.includes(SYNTHETIC_GITHUB_TOKEN), 'the register describing a leak must not be the leak');
    for (let i = 0; i + 12 <= SYNTHETIC_GITHUB_TOKEN.length; i += 4) {
      assert.ok(!raw.includes(SYNTHETIC_GITHUB_TOKEN.slice(i, i + 12)), 'not even a fragment');
    }
  } finally { e.cleanup(); }
});

test('a quarantined source can never be promoted into the ledger after the fact', () => {
  const r = new SourceRecord({ sourceId: 'x', sourceSystem: 'documents', sourceClass: 't', absPath: '/tmp/x', relativePath: 'x', sourceRootId: 'r' });
  r.reach(MILESTONE.CAPTURE_ATTEMPTED, { observedBy: 'test' });
  r.terminate(TERMINAL.QUARANTINED_SECRET, 'test');
  assert.throws(() => r.terminate(TERMINAL.ARCHIVED), (e) => e.message === 'TERMINAL_STATE_ALREADY_ASSIGNED');
});

test('a ledger-bound source can never be relabelled as never-captured', () => {
  const r = new SourceRecord({ sourceId: 'y', sourceSystem: 'documents', sourceClass: 't', absPath: '/tmp/y', relativePath: 'y', sourceRootId: 'r' });
  for (const m of [MILESTONE.CAPTURE_ATTEMPTED, MILESTONE.CAPTURED, MILESTONE.HASHED, MILESTONE.PROVENANCE_BOUND]) r.reach(m, { observedBy: 'test' });
  assert.throws(() => r.terminate(TERMINAL.QUARANTINED_SECRET), (e) => e.message === 'NON_CAPTURE_TERMINAL_AFTER_LEDGER_BINDING');
  // but an honest post-binding failure must stay expressible
  r.terminate(TERMINAL.CAPTURE_FAILED, 'RETRIEVABILITY_NOT_PROVEN:test');
  assert.equal(r.terminal, TERMINAL.CAPTURE_FAILED);
});

// ---------------------------------------------------------------------------
// IDEMPOTENCY, REPLAY, CHANGE, MOVE
// ---------------------------------------------------------------------------

test('replay of unchanged bytes creates NO new evidence', async () => {
  const e = env();
  try {
    writeSource(e, 'stable.md', 'unchanged content\n');
    const a = await capture(e, record(e, 'stable.md'));
    const countAfterFirst = scanEntries(e.vaultRoot).length;
    const b = await capture(e, record(e, 'stable.md'));

    assert.equal(a.record.contentHash, b.record.contentHash, 'same bytes, same content identity');
    assert.equal(a.record.evidenceId, b.record.evidenceId);
    assert.equal(a.record.ledgerEntryHash, b.record.ledgerEntryHash, 'replay must bind to the SAME observation');
    assert.equal(b.duplicate, true);
    assert.equal(scanEntries(e.vaultRoot).length, countAfterFirst, 'a replay that appends is manufactured evidence');
    assert.equal(b.record.terminal, TERMINAL.ARCHIVED);
    assert.equal(b.record.terminalReason, 'REPLAY_MATCHED_EXISTING_OBSERVATION');
  } finally { e.cleanup(); }
});

test('one changed character yields a new identity, and the original stays retrievable', async () => {
  const e = env();
  try {
    writeSource(e, 'mutable.md', 'version one\n');
    const a = await capture(e, record(e, 'mutable.md'));
    const originalHash = a.record.contentHash;
    const originalEntry = a.record.ledgerEntryHash;

    writeSource(e, 'mutable.md', 'version onx\n');           // exactly one character
    const b = await capture(e, record(e, 'mutable.md'));

    assert.notEqual(b.record.contentHash, originalHash);
    assert.notEqual(b.record.ledgerEntryHash, originalEntry);
    assert.equal(b.duplicate, false);
    assert.equal(scanEntries(e.vaultRoot).length, 2, 'a changed source is a NEW observation, not an overwrite');

    // The prior observation is untouched and still reconstructs.
    const old = lookupByEntryHash(e.base, originalEntry);
    assert.equal(old.found, true);
    assert.equal(old.entryHashValid, true);
    const noKey = restoreAdmittedBytes({ vaultBase: e.base, contentHash: originalHash });
    assert.equal(noKey.restored, false, 'plaintext is not at rest, so no key means no plaintext');
    assert.equal(noKey.reason, 'KEY_AUTHORITY_REQUIRED_PLAINTEXT_IS_NOT_AT_REST');

    const restored = restoreAdmittedBytes({ vaultBase: e.base, contentHash: originalHash, key: TEST_ONLY_KEY });
    assert.equal(restored.hashMatches, true);
    assert.equal(restored.plaintextAtRest, false);
    assert.equal(restored.plaintext.toString('utf8'), 'version one\n');
  } finally { e.cleanup(); }
});

test('a moved source is a new OBSERVATION of one blob, not a second blob', async () => {
  const e = env();
  try {
    const body = 'identical bytes in two places\n';
    writeSource(e, 'here/doc.md', body);
    writeSource(e, 'there/doc.md', body);
    const a = await capture(e, record(e, 'here/doc.md'));
    const b = await capture(e, record(e, 'there/doc.md'));

    assert.equal(a.record.contentHash, b.record.contentHash, 'one blob');
    assert.notEqual(a.record.evidenceId, b.record.evidenceId, 'two observations');
    assert.equal(scanEntries(e.vaultRoot).length, 2);

    const byContent = lookupByContentHash(e.base, a.record.contentHash);
    assert.equal(byContent.observationCount, 2);
    assert.equal(byContent.objectPresent, true);
    assert.equal(byContent.storedPayload, 'CIPHERTEXT');
    assert.equal(byContent.plaintextAtRest, false);
  } finally { e.cleanup(); }
});

test('evidenceId binds all three of sourceSystem, sourceNativeId and contentHash', () => {
  const a = evidenceIdFor('documents', 'root:a.md', 'sha256:' + 'a'.repeat(64));
  const b = evidenceIdFor('documents', 'root:a.md', 'sha256:' + 'b'.repeat(64));
  assert.notEqual(a, b, 'same path with different bytes must not collide on one observation id');
});

// ---------------------------------------------------------------------------
// RESILIENCE MATRIX -- every refusal is explicit, none is silent
// ---------------------------------------------------------------------------

test('unavailable source terminates SOURCE_UNAVAILABLE, never zero and never success', async () => {
  const e = env();
  try {
    const r = record(e, 'missing.md');
    const out = await capture(e, r);
    assert.equal(out.outcome, TERMINAL.SOURCE_UNAVAILABLE);
    assert.deepEqual(r.milestones, [MILESTONE.DISCOVERED]);
    assert.equal(r.contentHash, null);
    assert.equal(scanEntries(e.vaultRoot).length, 0);
  } finally { e.cleanup(); }
});

test('a source a parser cannot read is still CAPTURED, with a truthful normalization state', async () => {
  const e = env();
  try {
    // R7: raw evidence is bytes. A parser failing to interpret them is a fact
    // about the parser, not grounds for discarding the source.
    const body = '{"a":1}\nNOT JSON AT ALL\n{"b":2}\n';
    writeSource(e, 'bad.jsonl', body);
    const bad = record(e, 'bad.jsonl');
    const badOut = await capture(e, bad, { format: 'jsonl' });
    assert.equal(badOut.outcome, TERMINAL.ARCHIVED, 'an unparseable record must not lose the source');
    assert.equal(bad.detail.normalizationState, 'NORMALIZATION_FAILED');
    assert.match(bad.detail.normalizationReason, /JSONL_RECORD_1_NOT_JSON/);
    assert.equal(bad.contentHash, sha256Prefixed(Buffer.from(body, 'utf8')), 'raw bytes, unmodified');
    const [badEntry] = scanEntries(e.vaultRoot);
    assert.equal(badEntry.normalizationState, 'NORMALIZATION_FAILED');
    assert.equal(badEntry.captureCompleteness, 'PARTIAL');

    // A live transcript being appended to right now looks exactly like this.
    writeSource(e, 'live.jsonl', '{"a":1}\n{"b":2}\n{"c":');
    const live = record(e, 'live.jsonl');
    const liveOut = await capture(e, live, { format: 'jsonl' });
    assert.equal(liveOut.outcome, TERMINAL.ARCHIVED, 'a torn tail must not refuse the whole session');
    assert.equal(live.detail.captureCompleteness, 'LOWER_BOUND');
    assert.equal(live.detail.normalizationState, 'PARTIAL_NORMALIZATION');
    assert.equal(scanEntries(e.vaultRoot).length, 2);
  } finally { e.cleanup(); }
});

test('a declared-hash mismatch still refuses, but a control byte never loses a source', async () => {
  const e = env();
  try {
    // An independently DECLARED integrity expectation that fails is a genuine
    // provenance failure and stays a refusal.
    writeSource(e, 'rotted.md', 'these bytes are not what the manifest said\n');
    const r1 = record(e, 'rotted.md');
    const o1 = await capture(e, r1, { expectedSha256: `sha256:${'0'.repeat(64)}` });
    assert.equal(o1.outcome, TERMINAL.CORRUPT_REFUSED);
    assert.match(r1.terminalReason, /DECLARED_MANIFEST_HASH/);
    assert.equal(scanEntries(e.vaultRoot).length, 0);

    // R7: a NUL byte is not a reason to lose a source. Raw bytes are admitted
    // unmodified and normalization reports its own state.
    const nulBytes = Buffer.from([0x68, 0x69, 0x00, 0x0a]);
    writeSource(e, 'nul.md', nulBytes);
    const r2 = record(e, 'nul.md');
    const o2 = await capture(e, r2);
    assert.equal(o2.outcome, TERMINAL.ARCHIVED);
    assert.equal(r2.detail.normalizationState, 'BINARY_TEXT_VARIANT');
    assert.equal(r2.contentHash, sha256Prefixed(nulBytes), 'bytes must not be rewritten for a parser');
    const restored = restoreAdmittedBytes({ vaultBase: e.base, contentHash: r2.contentHash, key: TEST_ONLY_KEY });
    assert.ok(restored.plaintext.equals(nulBytes), 'the control byte must survive the round trip');
  } finally { e.cleanup(); }
});

test('malformed JSON metadata is captured raw and reported as NORMALIZATION_FAILED', async () => {
  const e = env();
  try {
    writeSource(e, 'meta.json', '{ "unclosed": true ');
    const r = record(e, 'meta.json');
    const out = await capture(e, r, { format: 'json' });
    assert.equal(out.outcome, TERMINAL.ARCHIVED);
    assert.equal(r.detail.normalizationState, 'NORMALIZATION_FAILED');
    assert.equal(r.detail.normalizationReason, 'JSON_PARSE_FAILED');
  } finally { e.cleanup(); }
});

test('normalization reports four states and REFUSES NOTHING', () => {
  const n = (b, f) => validateFormat(Buffer.from(b), f);
  assert.equal(n('{"a":1}\n', 'jsonl').normalization, 'NORMALIZED');
  assert.equal(n('{"a":1}\n{"b', 'jsonl').normalization, 'PARTIAL_NORMALIZATION');
  assert.equal(n('nope\n{"b":2}\n', 'jsonl').normalization, 'NORMALIZATION_FAILED');
  assert.equal(n([0x68, 0x00], 'text').normalization, 'BINARY_TEXT_VARIANT');
  assert.equal(n('{ bad', 'json').normalization, 'NORMALIZATION_FAILED');
  // The property that matters: every one of them is still admissible.
  for (const [b, f] of [['{"a":1}\n', 'jsonl'], ['{"a":1}\n{"b', 'jsonl'], ['nope\n', 'jsonl'], [[0x00], 'text'], ['{ bad', 'json'], ['x', 'none']]) {
    assert.equal(n(b, f).ok, true, 'normalization must never refuse admissible bytes');
  }
});

test('interrupted capture resumes safely: the head pointer is disposable', async () => {
  const e = env();
  try {
    writeSource(e, 'one.md', 'first\n');
    writeSource(e, 'two.md', 'second\n');
    await capture(e, record(e, 'one.md'));
    const headBefore = JSON.parse(readFileSync(path.join(e.metaRoot, HEAD_FILE), 'utf8'));

    // Simulate a crash between the entry write and the head update.
    rmSync(path.join(e.metaRoot, HEAD_FILE), { force: true });
    const rebuilt = reconstructHead(e.vaultRoot);
    assert.equal(rebuilt.head.entryHash, headBefore.entryHash, 'the chain alone must reproduce the head');

    // Resume: opening the vault recovers the head from the chain, the
    // completed source is not re-appended, and the new one appends cleanly.
    const recovery = ensureVault(e.base).headRecovery;
    assert.equal(recovery.action, 'MISSING_HEAD_REBUILT_FROM_CHAIN');
    assert.equal(recovery.entryHash, headBefore.entryHash);

    const replay = await capture(e, record(e, 'one.md'));
    assert.equal(replay.duplicate, true);
    const fresh = await capture(e, record(e, 'two.md'));
    assert.equal(fresh.record.terminal, TERMINAL.ARCHIVED);
    assert.equal(scanEntries(e.vaultRoot).length, 2);
    assert.equal(verifyChain(e.base).verified, true);
  } finally { e.cleanup(); }
});

// ---------------------------------------------------------------------------
// DURABILITY TRUTH -- per-leg reporting, no unearned promotion
// ---------------------------------------------------------------------------

test('per-leg status is reported separately and is never inferred from a write', async () => {
  const e = env();
  try {
    e.backup.offline = true;                       // one destination unreachable
    writeSource(e, 'legs.md', 'leg reporting\n');
    const r = record(e, 'legs.md');
    await capture(e, r);

    assert.equal(r.replication.primary.status, LEG_STATUS.VERIFIED);
    assert.equal(r.replication.backup.status, LEG_STATUS.NOT_REACHABLE);
    assert.equal(r.replication.primary.realRemote, false, 'a fixture must never claim to be remote');
    assert.equal(r.durabilityState, STATE.PRIMARY_VERIFIED, 'one healthy leg is not durability');
    assert.notEqual(r.durabilityState, STATE.FULLY_PROTECTED);
  } finally { e.cleanup(); }
});

test('a leg that accepted the write but failed read-back is NOT_PROVEN, not VERIFIED', async () => {
  const e = env();
  try {
    e.backup.corruptOnWrite = true;                // write "succeeds", bytes differ
    writeSource(e, 'corrupt-leg.md', 'read-back matters\n');
    const r = record(e, 'corrupt-leg.md');
    await capture(e, r);
    assert.equal(r.replication.backup.status, LEG_STATUS.NOT_PROVEN);
    assert.equal(r.durabilityState, STATE.INTEGRITY_INCIDENT);
  } finally { e.cleanup(); }
});

test('an unconfigured destination is NOT_CONFIGURED, distinct from unreachable', () => {
  assert.equal(legStatusFrom(null, null).status, LEG_STATUS.NOT_CONFIGURED);
  assert.equal(legStatusFrom({ error: 'REMOTE_UNREACHABLE' }, { id: 'x', isRealRemote: true }).status, LEG_STATUS.NOT_REACHABLE);
  assert.equal(legStatusFrom({ verified: false }, { id: 'x', isRealRemote: true }).status, LEG_STATUS.NOT_PROVEN);
  assert.equal(legStatusFrom({ verified: true, hash: 'sha256:x' }, { id: 'x', isRealRemote: true }).status, LEG_STATUS.VERIFIED);
});

test('REAL mode refuses a fixture durability leg and refuses a test key', () => {
  const fixture = new LocalFixtureTransport({ root: '/tmp/x', id: 'fixture', host: 'local' });
  const real = new SshRsyncTransport({ id: 'synology', host: 'cg-server' });
  const real2 = new SshRsyncTransport({ id: 'wesleydesk', host: 'wesleydesk' });

  assert.throws(
    () => assertRealCaptureAdmissible({ mode: CAPTURE_MODE.REAL, keyAuthority: KEY_AUTHORITY.PRODUCTION, primary: fixture, backup: real2 }),
    (e) => e.message === 'REAL_CAPTURE_FORBIDS_NON_REMOTE_DURABILITY_LEG',
    'a fixture verifies happily and would satisfy the three-way match with nothing remote involved',
  );
  assert.throws(
    () => assertRealCaptureAdmissible({ mode: CAPTURE_MODE.REAL, keyAuthority: KEY_AUTHORITY.TEST_ONLY, primary: real, backup: real2 }),
    (e) => e.message === 'TEST_KEY_FORBIDDEN_ON_REAL_CAPTURE_PATH',
  );
  assert.throws(
    () => assertRealCaptureAdmissible({ mode: CAPTURE_MODE.REAL, keyAuthority: KEY_AUTHORITY.PRODUCTION, primary: real, backup: real }),
    (e) => e.message === 'DURABILITY_LEGS_NOT_INDEPENDENT',
  );
  assert.deepEqual(
    assertRealCaptureAdmissible({ mode: CAPTURE_MODE.REAL, keyAuthority: KEY_AUTHORITY.PRODUCTION, primary: real, backup: real2 }),
    { admissible: true, mode: CAPTURE_MODE.REAL },
  );
});

test('FULLY_PROTECTED cannot be claimed on non-remote legs', () => {
  const fixture = new LocalFixtureTransport({ root: '/tmp/x', id: 'a', host: 'local' });
  assert.throws(
    () => assertNoUnearnedProtection({ state: STATE.FULLY_PROTECTED, allThreeMatch: true }, { primary: fixture, backup: fixture }),
    (e) => e.message === 'FULLY_PROTECTED_CLAIMED_ON_NON_REMOTE_LEGS',
  );
  assert.throws(
    () => assertNoUnearnedProtection({ state: STATE.FULLY_PROTECTED, allThreeMatch: false }, { primary: fixture, backup: fixture }),
    (e) => e.message === 'FULLY_PROTECTED_WITHOUT_THREE_WAY_MATCH',
  );
  assert.equal(assertNoUnearnedProtection({ state: STATE.HASHED_ENCRYPTED }, { primary: fixture, backup: fixture }).promoted, false);
});

test('real remote legs that are not provisioned produce the truthful LOWER state', async () => {
  const e = env();
  try {
    // SshRsyncTransport refuses instead of pretending, which is the whole point.
    const primary = new SshRsyncTransport({ id: 'synology', host: 'cg-server' });
    const backup = new SshRsyncTransport({ id: 'wesleydesk', host: 'wesleydesk' });
    writeSource(e, 'nostorage.md', 'no remote storage exists yet\n');
    const r = record(e, 'nostorage.md');
    await capture(e, r, { primary, backup });

    assert.equal(r.durabilityState, STATE.HASHED_ENCRYPTED);
    assert.equal(r.replication.primary.status, LEG_STATUS.NOT_REACHABLE);
    assert.equal(r.replication.backup.status, LEG_STATUS.NOT_REACHABLE);
    assert.equal(r.terminal, TERMINAL.ARCHIVED, 'software capture still completes');
    const [entry] = scanEntries(e.vaultRoot);
    assert.equal(entry.durabilityState, 'HASHED_ENCRYPTED');
    assert.equal(entry.durabilityProof.allThreeMatch, false);
  } finally { e.cleanup(); }
});

// ---------------------------------------------------------------------------
// PUBLIC SURFACE -- lookup, restore, verify, CAS
// ---------------------------------------------------------------------------

test('lookup and restore work from vault paths alone, with no ingest-time state', async () => {
  const e = env();
  try {
    const body = 'canary payload for independent verification\n';
    writeSource(e, 'canary.txt', body);
    const r = record(e, 'canary.txt');
    await capture(e, r);

    const byEntry = lookupByEntryHash(e.base, r.ledgerEntryHash);
    assert.equal(byEntry.found, true);
    assert.equal(byEntry.entryHashValid, true);
    assert.equal(byEntry.entry.contentHash, r.contentHash);

    const byContent = lookupByContentHash(e.base, r.contentHash);
    assert.equal(byContent.found, true);
    assert.equal(byContent.observationCount, 1);
    assert.equal(byContent.entryHashes[0], r.ledgerEntryHash);

    const restored = restoreAdmittedBytes({ vaultBase: e.base, contentHash: r.contentHash, key: TEST_ONLY_KEY });
    assert.equal(restored.restored, true);
    assert.equal(restored.storedPayload, 'CIPHERTEXT');
    assert.equal(restored.plaintextAtRest, false);
    assert.equal(restored.hashMatches, true);
    assert.equal(restored.byteLength, Buffer.byteLength(body));
    assert.ok(restored.plaintext.equals(Buffer.from(body, 'utf8')), 'restore must return the EXACT admitted bytes');
    assert.equal(sha256Prefixed(restored.plaintext), sha256Prefixed(Buffer.from(body, 'utf8')));
    assert.equal(restored.envelopeRoundTrip.verified, true);
    assert.equal(restored.remoteRetrievalProven, false);
    // The restore surface must not hand back a ciphertext hash at all: two
    // hashes side by side get compared, and that comparison always "fails".
    assert.equal('ciphertextHash' in restored, false);
  } finally { e.cleanup(); }
});

test('tamper detection: modified metadata, modified chain link, modified payload', async () => {
  const e = env();
  try {
    writeSource(e, 'first.md', 'one\n');
    writeSource(e, 'second.md', 'two\n');
    const a = await capture(e, record(e, 'first.md'));
    const b = await capture(e, record(e, 'second.md'));
    assert.equal(verifyChain(e.base).verified, true);

    // All experiments happen on an isolated copy; authoritative evidence is
    // never mutated to prove that it cannot be mutated.
    const iso1 = isolateVault(e.base);
    const p1 = path.join(vaultLayout(iso1).vaultRoot, ENTRY_DIR, entryFileName(b.record.ledgerEntryHash));
    const t1 = JSON.parse(readFileSync(p1, 'utf8'));
    t1.machineId = 'SOMEONE-ELSE';
    writeFileSync(p1, JSON.stringify(t1, null, 2));
    assert.equal(verifyEntry(iso1, b.record.ledgerEntryHash).code, 'ENTRY_METADATA_TAMPERED');
    assert.equal(verifyChain(iso1).verified, false);

    const iso2 = isolateVault(e.base);
    const p2 = path.join(vaultLayout(iso2).vaultRoot, ENTRY_DIR, entryFileName(b.record.ledgerEntryHash));
    const t2 = JSON.parse(readFileSync(p2, 'utf8'));
    t2.prevHash = `sha256:${'c'.repeat(64)}`;
    writeFileSync(p2, JSON.stringify(t2, null, 2));
    const r2 = verifyEntry(iso2, b.record.ledgerEntryHash);
    assert.equal(r2.verified, false, 'a rewritten chain link must be refused');

    const iso3 = isolateVault(e.base);
    // The object at rest is the ENCRYPTED form, addressed by ciphertextHash.
    const encAddress = scanEntries(e.vaultRoot).find((x) => x.entryHash === a.record.ledgerEntryHash).encryption.ciphertextHash;
    const obj = path.join(vaultLayout(iso3).spoolRoot, objectStorePath(encAddress));
    writeFileSync(obj, 'tampered payload\n');
    const r3 = verifyEntry(iso3, a.record.ledgerEntryHash);
    assert.equal(r3.code, 'PAYLOAD_TAMPERED');
    assert.equal(r3.payload.intact, false);

    for (const d of [iso1, iso2, iso3]) rmSync(d, { recursive: true, force: true });
    assert.equal(verifyChain(e.base).verified, true, 'the authoritative vault must be untouched');
  } finally { e.cleanup(); }
});

test('CAS probe: a stale predecessor is refused, the correct one is accepted, production untouched', async () => {
  const e = env();
  try {
    writeSource(e, 'cas.md', 'compare and swap\n');
    await capture(e, record(e, 'cas.md'));
    const before = scanEntries(e.vaultRoot).length;

    const probe = casProbe(e.base);
    assert.equal(probe.staleExpectedPrevHashRefused, true);
    assert.equal(probe.staleRefusalCode, 'CAS_PRECONDITION_FAILED');
    assert.equal(probe.correctExpectedPrevHashAccepted, true);
    assert.equal(scanEntries(e.vaultRoot).length, before, 'the probe must not advance the authoritative head');
    rmSync(probe.isolatedVault, { recursive: true, force: true });
  } finally { e.cleanup(); }
});

// ---------------------------------------------------------------------------
// PROVENANCE -- unknown stays unknown
// ---------------------------------------------------------------------------

test('claude transcript provenance is read from the source; missing fields stay null and are named', async () => {
  const e = env();
  try {
    const line = JSON.stringify({
      sessionId: '9925672d-3c89-41c5-8700-a87e26f13f60',
      cwd: '/home/wesle/repos/CG-AppBuilder-MCP',
      gitBranch: 'main',
      timestamp: '2026-08-30T12:00:00.000Z',
      isSidechain: false,
      userType: 'external',
    });
    writeSource(e, '9925672d-3c89-41c5-8700-a87e26f13f60.jsonl', `${line}\n`);
    const r = record(e, '9925672d-3c89-41c5-8700-a87e26f13f60.jsonl', { sourceSystem: 'claude-code' });
    await capture(e, r, { format: 'jsonl' });

    assert.equal(r.provenance.sessionBinding.sessionId, '9925672d-3c89-41c5-8700-a87e26f13f60');
    assert.equal(r.provenance.sourceTimestamp, '2026-08-30T12:00:00.000Z');
    assert.equal(r.provenance.headerStatus, 'RESOLVED_FROM_SOURCE');
    // Never fabricated: the fields the source does not expose are null AND listed.
    assert.equal(r.provenance.sessionBinding.modelIdentity, null);
    assert.ok(r.provenance.unresolvedFields.includes('sessionBinding.modelIdentity'));
    assert.notEqual(r.provenance.completeness, 'COMPLETE');

    const [entry] = scanEntries(e.vaultRoot);
    assert.equal(entry.provenanceResolution.completeness, r.provenance.completeness);
    assert.deepEqual(entry.provenanceResolution.unresolvedFields, r.provenance.unresolvedFields);
    assert.equal(entry.sessionBinding.sessionId, '9925672d-3c89-41c5-8700-a87e26f13f60');
  } finally { e.cleanup(); }
});

test('a source with no session dimension reports PARTIAL/LOWER_BOUND rather than inventing one', async () => {
  const e = env();
  try {
    writeSource(e, 'plain.md', 'no session here\n');
    const r = record(e, 'plain.md');
    await capture(e, r);
    assert.equal(r.provenance.sessionBinding.sessionId, null);
    assert.ok(r.provenance.unresolvedFields.length > 0);
    assert.ok(['PARTIAL', 'LOWER_BOUND'].includes(r.provenance.completeness));
  } finally { e.cleanup(); }
});

test('a STALE head left by a crash mid-append is advanced, not treated as a fork', async () => {
  const e = env();
  try {
    writeSource(e, 'p.md', 'first\n');
    writeSource(e, 'q.md', 'second\n');
    writeSource(e, 'r.md', 'third\n');
    const a = await capture(e, record(e, 'p.md'));
    await capture(e, record(e, 'q.md'));

    // Rewind the mutable pointer to simulate dying after the entry write but
    // before the head update. Without recovery the next append forks.
    writeFileSync(path.join(e.metaRoot, HEAD_FILE), JSON.stringify({ entryHash: a.record.ledgerEntryHash, seq: 0 }, null, 2));

    const rec = recoverHead(e.base);
    assert.equal(rec.action, 'STALE_HEAD_ADVANCED_TO_CHAIN_TIP');
    assert.equal(rec.chainLength, 2);

    const third = await capture(e, record(e, 'r.md'));
    assert.equal(third.record.terminal, TERMINAL.ARCHIVED);
    assert.equal(scanEntries(e.vaultRoot).length, 3);
    assert.equal(verifyChain(e.base).verified, true);
  } finally { e.cleanup(); }
});

test('re-scanning a quarantined source records ONE refusal, not one per run', async () => {
  const e = env();
  try {
    writeSource(e, 'repeat-secret.env', `GITHUB_TOKEN=${SYNTHETIC_GITHUB_TOKEN}\n`);
    const first = await capture(e, record(e, 'repeat-secret.env'));
    const countAfterFirst = quarantineStatus(e.base).count;
    assert.equal(countAfterFirst, 1);
    assert.equal(first.record.quarantine.replayOfExistingRefusal, false);

    const second = await capture(e, record(e, 'repeat-secret.env'));
    const q = quarantineStatus(e.base);
    assert.equal(q.count, 1, 'a replay must not record the same credential finding twice');
    assert.equal(q.distinctRefusals, 1);
    assert.equal(q.duplicateRefusals, 0);
    assert.equal(q.verified, true);
    assert.equal(second.record.quarantine.replayOfExistingRefusal, true);
    assert.equal(second.record.quarantine.refusalId, first.record.quarantine.refusalId);

    // A CHANGED source is a new refusal: the finding is genuinely a new event.
    writeSource(e, 'repeat-secret.env', `GITHUB_TOKEN=${SYNTHETIC_GITHUB_TOKEN}\nEXTRA=1\n`);
    await capture(e, record(e, 'repeat-secret.env'));
    const q2 = quarantineStatus(e.base);
    assert.equal(q2.count, 2);
    assert.equal(q2.duplicateRefusals, 0);
    assert.equal(q2.verified, true);
  } finally { e.cleanup(); }
});

test('the refusal identity is derived from metadata only, never from content', async () => {
  const { computeRefusalId } = await import('../context-ledger/lib/quarantine.mjs');
  const meta = {
    sourcePath: '/src/x.env', byteSize: 42, sourceMtime: '2026-08-31T00:00:00.000Z',
    scannerVersion: 'v1', findings: [{ detectorId: 'github-token', offset: 13, length: 40 }],
  };
  const id = computeRefusalId(meta);
  assert.match(id, /^sha256:[a-f0-9]{64}$/);
  assert.equal(computeRefusalId({ ...meta }), id, 'deterministic');
  assert.notEqual(computeRefusalId({ ...meta, byteSize: 43 }), id, 'a changed file is a new refusal');
  assert.notEqual(computeRefusalId({ ...meta, scannerVersion: 'v2' }), id, 'new detector coverage is a new event');
  // Content is not an input at all: there is no parameter to pass it through.
  assert.equal(computeRefusalId(meta), computeRefusalId({ ...meta, secretValue: SYNTHETIC_GITHUB_TOKEN }));
});

// ---------------------------------------------------------------------------
// DETECTOR PRECISION, PROVEN IN BOTH DIRECTIONS
//
// A detector is only half-specified by what it catches. The other half is what
// it must NOT catch, and getting that half wrong is not a smaller failure --
// "better security" that quarantines every mention of a token format silently
// drops exactly the engineering discussions this ledger exists to preserve.
// Both directions are acceptance items; the second is not optional.
// ---------------------------------------------------------------------------

test('DIRECTION 1: a real-form credential assignment is QUARANTINED, including a low-entropy value', async () => {
  const e = env();
  try {
    // Every value here is SYNTHETIC. Deliberately low-entropy: a real password
    // scores like prose, which is exactly why entropy cannot be the test.
    const cases = [
      ['pw-env.env', 'DB_PASSWORD=summer2024\n'],
      ['pw-passwd.sh', 'export PASSWD=letmein99\n'],
      ['pw-pwd.cnf', 'MYSQL_PWD=rootroot\n'],
      ['pw-json.json', '{"clientPassword":"glass2024"}\n'],
    ];
    for (const [name, body] of cases) {
      writeSource(e, name, body);
      const r = record(e, name);
      const out = await capture(e, r);
      assert.equal(out.outcome, TERMINAL.QUARANTINED_SECRET, `${name} must be quarantined`);
      assert.ok(r.quarantine.detectorIds.some((d) => d.startsWith('password')), `${name}: ${r.quarantine.detectorIds}`);

      // no raw ledger payload, no spool payload, nothing to replicate
      assert.equal(r.contentHash, null);
      assert.equal(r.ledgerEntryHash, null);
      assert.equal(r.replication ?? null, null);
      assert.equal(existsSync(path.join(e.spoolRoot, objectStorePath(sha256Prefixed(Buffer.from(body, 'utf8'))))), false);
    }
    assert.equal(scanEntries(e.vaultRoot).length, 0, 'no credential-bearing source may reach the ledger');
    assert.equal(quarantineStatus(e.base).count, cases.length);
  } finally { e.cleanup(); }
});

test('DIRECTION 2: a source that merely DISCUSSES credential formats is ADMITTED', async () => {
  const e = env();
  try {
    // This is legitimate engineering context and losing it would be a defect,
    // not a safe default. Every credential-looking string here is a MENTION:
    // no structurally valid token, no concrete assignment.
    const body = [
      '# Secret handling notes',
      '',
      'GitHub tokens start with the `ghp_` prefix; fine-grained ones use `github_pat_`.',
      'AWS access key ids begin with `AKIA` and are 20 characters long.',
      'Look for `PASSWORD=` assignments in env files, and for `PASSWD=` in older scripts.',
      'Doppler service tokens use the `dp.st.` prefix.',
      'Set DB_PASSWORD=${DOPPLER_DB_PASSWORD} rather than a literal.',
      'password: changeme          # placeholder only',
      'const pw = process.env.DB_PASSWORD;',
      'A passwordPattern of /^[A-Za-z0-9]{8,}$/ is enforced at signup.',
      'Rotate anything matching the AKIA prefix immediately.',
      '',
    ].join('\n');
    writeSource(e, 'secret-handling-notes.md', body);
    const r = record(e, 'secret-handling-notes.md');
    const out = await capture(e, r);

    assert.equal(out.outcome, TERMINAL.ARCHIVED, 'discussing a credential format must not be treated as leaking one');
    assert.equal(r.quarantine, null);
    assert.equal(r.contentHash, sha256Prefixed(Buffer.from(body, 'utf8')));
    assert.equal(scanEntries(e.vaultRoot).length, 1);
    assert.equal(quarantineStatus(e.base).count, 0);

    // and it round-trips intact, mentions and all
    const restored = restoreAdmittedBytes({ vaultBase: e.base, contentHash: r.contentHash, key: TEST_ONLY_KEY });
    assert.ok(restored.plaintext.equals(Buffer.from(body, 'utf8')));
  } finally { e.cleanup(); }
});

test('both directions side by side: recall and precision are reported together', async () => {
  const { scanBuffer } = await import('../context-ledger/lib/secret-detector.mjs');
  const assignments = [
    'DB_PASSWORD=summer2024', 'PASSWD=letmein99', 'MYSQL_PWD=rootroot',
    'passphrase: correcthorsebattery', '{"password":"glass2024"}',
    'postgres://h/db?password=capitalglass1',
  ];
  const mentions = [
    'GitHub tokens use the ghp_ prefix.',
    'AWS ids start with AKIA and are 20 chars.',
    'Look for PASSWORD= assignments in env files.',
    'PASSWD= is the older form of the same thing.',
    'DB_PASSWORD=${DOPPLER_DB_PASSWORD}',
    'password: changeme',
    'pwd = process.env.DB_PASSWORD',
    'The PASSWORD field format is documented above.',
  ];
  const caught = assignments.filter((c) => scanBuffer(Buffer.from(c, 'utf8')).verdict !== 'CLEAN').length;
  const falsePositives = mentions.filter((c) => scanBuffer(Buffer.from(c, 'utf8')).verdict !== 'CLEAN').length;

  assert.equal(caught, assignments.length, 'every real assignment form must be caught');
  assert.equal(falsePositives, 0, 'no mention-only discussion may be quarantined');
});
