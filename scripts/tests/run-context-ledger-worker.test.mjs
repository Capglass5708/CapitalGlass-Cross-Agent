/**
 * Phase 0 replication worker -- local proofs.
 *
 * These use LOCAL SYNTHETIC FIXTURES only. Passing here proves the worker's
 * logic, NOT that remote storage works. Criteria 1 and 4 can only be closed by
 * running against the real Synology and wesleydesk targets.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, readdirSync, chmodSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { randomBytes } from 'node:crypto';

import { sha256Prefixed, canonicalJson, objectStorePath } from '../context-ledger/lib/canonical.mjs';
import { encryptObject, decryptObject, deriveSubkeys, assertNoNonceCollision } from '../context-ledger/lib/crypto.mjs';
import { appendEntry, readHead, reconstructHead, restoreHead, scanEntries, computeEntryHash, entryFileName, HEAD_FILE } from '../context-ledger/lib/ledger.mjs';
import { LocalFixtureTransport, SshRsyncTransport } from '../context-ledger/lib/transport.mjs';
import { scanEntries as scanAll } from '../context-ledger/lib/ledger.mjs';
import { protectObject, cleanupSpool, restoreFrom, STATE } from '../context-ledger/lib/worker.mjs';

const KEY = randomBytes(32);
const KEYREF = 'CONTEXT_LEDGER_EVIDENCE_KEY';
function env() {
  const base = mkdtempSync(path.join(os.tmpdir(), 'cl-worker-'));
  return {
    base,
    spool: path.join(base, 'spool'),
    vault: path.join(base, 'vault'),
    meta: path.join(base, 'meta'),
    primary: new LocalFixtureTransport({ root: path.join(base, 'primary'), id: 'synology-fixture', host: 'cg-server' }),
    backup: new LocalFixtureTransport({ root: path.join(base, 'backup'), id: 'wesleydesk-fixture', host: 'wesleydesk' }),
    cleanup() { rmSync(base, { recursive: true, force: true }); },
  };
}
const run = (e, plaintext, over = {}) => protectObject({
  plaintext, key: KEY, keyRef: KEYREF,
  spoolRoot: e.spool, vaultRoot: e.vault, metaRoot: e.meta,
  primary: e.primary, backup: e.backup, ...over,
});

test('deterministic hashing: canonical JSON is key-order independent', () => {
  const a = { b: 1, a: { d: 4, c: 3 } };
  const b = { a: { c: 3, d: 4 }, b: 1 };
  assert.equal(canonicalJson(a), canonicalJson(b));
  assert.equal(sha256Prefixed(Buffer.from(canonicalJson(a))), sha256Prefixed(Buffer.from(canonicalJson(b))));
  assert.match(objectStorePath(sha256Prefixed(Buffer.from('x'))), /^objects\/sha256\/[a-f0-9]{2}\/[a-f0-9]{64}$/);
});

test('encrypt/decrypt round-trips; ciphertext is deterministic; tampering is detected', () => {
  const pt = Buffer.from('synthetic evidence payload');
  const h = sha256Prefixed(pt);
  const a = encryptObject({ plaintext: pt, key: KEY, plaintextHash: h });
  const b = encryptObject({ plaintext: pt, key: KEY, plaintextHash: h });
  assert.equal(a.ciphertextHash, b.ciphertextHash, 'same plaintext must yield identical bytes for both destinations');
  assert.deepEqual(decryptObject({ blob: a.blob, key: KEY }), pt);
  const tampered = Buffer.from(a.blob); tampered[tampered.length - 1] ^= 0xff;
  assert.throws(() => decryptObject({ blob: tampered, key: KEY }), /unable to authenticate|bad decrypt|auth/i);
  const other = encryptObject({ plaintext: Buffer.from('different'), key: KEY, plaintextHash: sha256Prefixed(Buffer.from('different')) });
  assert.notEqual(a.nonce, other.nonce, 'distinct plaintexts must not share a GCM nonce');
});

test('happy path reaches FULLY_PROTECTED with three-way hash equality', () => {
  const e = env();
  try {
    const r = run(e, Buffer.from('one synthetic object'));
    assert.equal(r.state, STATE.FULLY_PROTECTED);
    assert.equal(r.allThreeMatch, true);
    assert.equal(r.ciphertextHashesIdentical, true, 'ciphertextHash(primary) must equal ciphertextHash(backup)');
    assert.equal(r.legs.primary.hash, r.ciphertextHash);
    assert.equal(r.legs.backup.hash, r.ciphertextHash);
    assert.equal(r.ledgerEntry.durabilityState, STATE.FULLY_PROTECTED);
    assert.equal(r.ledgerEntry.propagationPolicy.deletesPropagate, false);
    assert.equal(r.ledgerEntry.chainIntegrity.headTransition, 'COMPARE_AND_SWAP');
    assert.equal(r.ledgerEntry.transportRealRemote.primary, false, 'fixtures must never claim real remote');
  } finally { e.cleanup(); }
});

test('duplicate ingestion is idempotent: one canonical blob, dedup hit', () => {
  const e = env();
  try {
    const pt = Buffer.from('repeated payload');
    const a = run(e, pt);
    const b = run(e, pt);
    assert.equal(a.plaintextHash, b.plaintextHash, 'plaintextHash is the dedup key');
    assert.equal(a.ciphertextHash, b.ciphertextHash);
    assert.equal(b.legs.primary.put.reused, true, 'second write must be a dedup hit, not a rewrite');
    assert.equal(b.legs.backup.put.reused, true);
  } finally { e.cleanup(); }
});

test('ledger entries are immutable files named from entryHash, never seq', () => {
  const e = env();
  try {
    const r = run(e, Buffer.from('named by hash'));
    const base = path.basename(r.ledgerPath);
    assert.equal(base, entryFileName(r.ledgerEntry.entryHash));
    assert.ok(!/entry-\d+\.json/.test(base), 'filename must not be sequential');
    assert.throws(() => writeFileSync(r.ledgerPath, 'x', { flag: 'wx' }), /EEXIST/);
  } finally { e.cleanup(); }
});

test('CAS: a stale expectedPrevHash is refused', () => {
  const e = env();
  try {
    run(e, Buffer.from('first'));
    assert.throws(
      () => appendEntry({ vaultRoot: e.vault, metaRoot: e.meta, body: { note: 'stale' }, expectedPrevHash: null }),
      (err) => err.message === 'CAS_PRECONDITION_FAILED',
      'appending against a superseded head must fail, not silently succeed',
    );
  } finally { e.cleanup(); }
});

test('fork detection: two entries claiming one predecessor is an incident, not a merge', () => {
  const e = env();
  try {
    const r = run(e, Buffer.from('genesis'));
    // Forge a second entry claiming the same predecessor as the real second entry would.
    const forged = { schemaVersion: 'evidence-ledger-entry-v1@1.0.0', seq: 1, prevHash: r.ledgerEntry.entryHash, recordedAt: new Date().toISOString(), note: 'forged branch' };
    const fh = computeEntryHash(forged, forged.prevHash);
    writeFileSync(path.join(e.vault, 'immutable-metadata/ledger-entries', entryFileName(fh)), JSON.stringify({ ...forged, entryHash: fh }, null, 2));
    assert.throws(() => run(e, Buffer.from('second')), (err) => err.message === 'FORK_DETECTED');
  } finally { e.cleanup(); }
});

test('head is disposable: deleting current-head still permits full reconstruction', () => {
  const e = env();
  try {
    run(e, Buffer.from('a')); run(e, Buffer.from('b')); const third = run(e, Buffer.from('c'));
    const headBefore = readHead(e.meta);
    assert.equal(headBefore.entryHash, third.ledgerEntry.entryHash);

    rmSync(path.join(e.meta, HEAD_FILE), { force: true });      // destroy mutable state
    assert.equal(readHead(e.meta), null);

    const rebuilt = reconstructHead(e.vault);                   // rebuild from immutable entries alone
    assert.equal(rebuilt.length, 3);
    assert.equal(rebuilt.head.entryHash, headBefore.entryHash, 'chain must reproduce the exact head');
    restoreHead(e.meta, rebuilt.head);
    assert.equal(readHead(e.meta).entryHash, headBefore.entryHash);
  } finally { e.cleanup(); }
});

test('failed transfer: primary down leaves CAPTURED state, never FULLY_PROTECTED', () => {
  const e = env();
  try {
    e.primary.offline = true;
    const r = run(e, Buffer.from('primary down'));
    assert.notEqual(r.state, STATE.FULLY_PROTECTED);
    assert.equal(r.legs.primary.verified, false);
    assert.ok(r.incidents.some((i) => i.code === 'REMOTE_UNREACHABLE'));
    assert.equal(r.spoolEligibleForCleanup, false);
  } finally { e.cleanup(); }
});

test('backup down stops at PRIMARY_VERIFIED and still forbids spool cleanup', () => {
  const e = env();
  try {
    e.backup.offline = true;
    const r = run(e, Buffer.from('backup down'));
    assert.equal(r.state, STATE.PRIMARY_VERIFIED);
    assert.equal(r.spoolEligibleForCleanup, false, 'PRIMARY_VERIFIED must never authorise cleanup');
    assert.throws(() => cleanupSpool(r), (err) => err.message === 'SPOOL_CLEANUP_FORBIDDEN');
    assert.ok(existsSync(r.spoolPath), 'local capture must survive a half-replicated object');
  } finally { e.cleanup(); }
});

test('hash mismatch at a destination raises INTEGRITY_INCIDENT, never a silent repair', () => {
  const e = env();
  try {
    e.backup.corruptOnWrite = true;
    const r = run(e, Buffer.from('corrupt me'));
    assert.equal(r.state, STATE.INTEGRITY_INCIDENT);
    assert.ok(r.incidents.some((i) => i.code === 'REMOTE_HASH_MISMATCH'));
    assert.equal(r.allThreeMatch, false);
    assert.equal(r.spoolEligibleForCleanup, false);
  } finally { e.cleanup(); }
});

test('published blobs are read-only on disk (0444)', () => {
  const e = env();
  try {
    const r = run(e, Buffer.from('read only please'));
    const abs = path.join(e.primary.root, objectStorePath(r.ciphertextHash));
    assert.throws(() => writeFileSync(abs, Buffer.from('nope')), /EACCES/,
      'a published blob must not be writable in place');
  } finally { e.cleanup(); }
});

test('write-once: differing content at an existing path is refused', () => {
  const e = env();
  try {
    const r = run(e, Buffer.from('original'));
    const abs = path.join(e.primary.root, objectStorePath(r.ciphertextHash));
    // put() sets 0444, which already refused the first tamper attempt (EACCES).
    // Re-open it deliberately so the test exercises the idempotency guard
    // rather than the file mode.
    chmodSync(abs, 0o644);
    writeFileSync(abs, Buffer.from('tampered on disk'));
    assert.throws(() => e.primary.put(r.ciphertextHash, Buffer.from('different bytes')),
      (err) => err.message === 'OBJECT_STORE_IDEMPOTENCY_VIOLATION');
  } finally { e.cleanup(); }
});

test('restore EXCLUSIVELY from backup reconstructs the original plaintext', () => {
  const e = env();
  try {
    const pt = Buffer.from('the original work session content');
    const r = run(e, pt);
    assert.equal(r.state, STATE.FULLY_PROTECTED);
    cleanupSpool(r);
    assert.ok(!existsSync(r.spoolPath));
    rmSync(e.primary.root, { recursive: true, force: true });   // primary gone entirely

    const restored = restoreFrom(e.backup, { ciphertextHash: r.ciphertextHash, plaintextHash: r.plaintextHash }, KEY);
    assert.equal(restored.matches, true);
    assert.deepEqual(restored.plaintext, pt, 'backup alone must reproduce the original bytes');
    assert.equal(restored.recoveredHash, r.plaintextHash);
  } finally { e.cleanup(); }
});

test('deletes do not propagate: removing from primary leaves the backup intact', () => {
  const e = env();
  try {
    const r = run(e, Buffer.from('do not mirror my deletion'));
    rmSync(path.join(e.primary.root, objectStorePath(r.ciphertextHash)), { force: true });
    const v = e.backup.verify(r.ciphertextHash);
    assert.equal(v.present, true, 'a mistake on the primary must never be reproduced on the backup');
    assert.equal(v.hash, r.ciphertextHash);
  } finally { e.cleanup(); }
});

test('the real SSH/rsync transport refuses to pretend it works', () => {
  const t = new SshRsyncTransport({ id: 'synology', host: 'cg-server' });
  assert.equal(t.isRealRemote, true);
  for (const m of ['put', 'verify', 'fetch']) {
    assert.throws(() => t[m](), /NOT_IMPLEMENTED_AWAITING_REAL_STORAGE/);
  }
});


test('key separation: encryption and nonce subkeys are independent and neither is the master', () => {
  const master = randomBytes(32);
  const { encKey, nonceKey } = deriveSubkeys(master);
  assert.equal(encKey.length, 32);
  assert.equal(nonceKey.length, 32);
  assert.notDeepEqual(encKey, nonceKey, 'subkeys must differ');
  assert.notDeepEqual(encKey, master, 'the master key must never be used to encrypt directly');
  assert.notDeepEqual(nonceKey, master);
  const again = deriveSubkeys(master);
  assert.deepEqual(again.encKey, encKey, 'derivation must be deterministic');
  assert.deepEqual(again.nonceKey, nonceKey);
  const other = deriveSubkeys(randomBytes(32));
  assert.notDeepEqual(other.encKey, encKey);
});

test('nonce collision guard: one nonce serving two plaintexts is a loud incident', () => {
  const ok = [
    { encryption: { nonce: 'aa', plaintextHash: 'sha256:1' } },
    { encryption: { nonce: 'bb', plaintextHash: 'sha256:2' } },
    { encryption: { nonce: 'aa', plaintextHash: 'sha256:1' } },   // same object twice is fine
  ];
  assert.equal(assertNoNonceCollision(ok).checked, 2);
  const bad = [
    { encryption: { nonce: 'aa', plaintextHash: 'sha256:1' } },
    { encryption: { nonce: 'aa', plaintextHash: 'sha256:DIFFERENT' } },
  ];
  assert.throws(() => assertNoNonceCollision(bad), (e) => e.message === 'NONCE_COLLISION');
});

test('real ledger entries carry no nonce collision', () => {
  const e = env();
  try {
    for (const s of ['alpha', 'beta', 'gamma', 'delta']) run(e, Buffer.from(s));
    const r = assertNoNonceCollision(scanAll(e.vault));
    assert.equal(r.checked, 4, 'four distinct plaintexts must yield four distinct nonces');
  } finally { e.cleanup(); }
});
