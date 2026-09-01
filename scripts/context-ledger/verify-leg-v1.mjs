#!/usr/bin/env node
/**
 * SINGLE-LEG cold read-back. One process, one leg, no shared state.
 *
 * This is a separate executable rather than a function so that each leg is
 * verified by a process that CANNOT have been warmed by the other. A single
 * process reading L and then Z can satisfy the second read from page cache, a
 * reused buffer, or a file handle populated by the first -- and every
 * individual assertion in that run would still be true while only one leg was
 * ever actually read from remote storage. Two processes make one leg
 * structurally incapable of standing in for the other.
 *
 * It reads: the immutable ledger entry, and the bytes at the recorded path on
 * ONE mount. It never looks at the other leg, the spool, the source file, or
 * any receipt.
 *
 * Exit 0 only when this leg alone reaches REPLICATION=VERIFIED.
 */
import path from 'node:path';
import { verifyLegReadback, loadEntryCold } from './lib/replication-verify.mjs';
import { resolveProductionKey } from './lib/estate-api.mjs';
import { quarantineRoots } from './lib/quarantine.mjs';

const arg = (n, d = null) => {
  const hit = process.argv.slice(2).find((a) => a.startsWith(`--${n}=`));
  return hit ? hit.slice(n.length + 3) : d;
};

const startedAt = new Date().toISOString();
const leg = arg('leg');
const mountpoint = arg('mount');
const entryHash = arg('entry-hash');
const vaultBase = arg('vault-base');
const expectedCiphertextHash = arg('expected-ciphertext-hash');

if (!leg || !mountpoint || !entryHash || !vaultBase) {
  console.log(JSON.stringify({
    error: 'USAGE',
    usage: 'verify-leg-v1.mjs --leg=primary|backup --mount=/mnt/z --entry-hash=sha256:.. --vault-base=<dir> [--expected-ciphertext-hash=sha256:..]',
  }, null, 2));
  process.exit(2);
}

const vaultRoot = path.join(vaultBase, 'vault');
const loaded = loadEntryCold(vaultRoot, entryHash);
if (!loaded.found) {
  console.log(JSON.stringify({ leg, mountpoint, entryFound: false, reason: loaded.reason, REPLICATION: 'NOT_PROVEN' }, null, 2));
  process.exit(1);
}

// The key is optional: without it the plaintext-identity binding is honestly
// reported as NOT_PROVEN rather than skipped and counted as a pass.
const k = resolveProductionKey();
const result = verifyLegReadback({
  entry: loaded.entry, legName: leg, mountpoint, key: k.usable ? k.key : null,
});

/**
 * Independent expectation cross-check.
 *
 * When the caller states the expected replicated-object hash up front, this leg
 * is judged against THAT value as well as against the entry it just read. It
 * closes the case where a tampered entry and a tampered object agree with each
 * other.
 */
let expectationCheck = null;
if (expectedCiphertextHash) {
  expectationCheck = {
    supplied: expectedCiphertextHash,
    matchesEntry: loaded.entry?.encryption?.ciphertextHash === expectedCiphertextHash,
    matchesObserved: result.observed?.ciphertextHash === expectedCiphertextHash,
  };
  // A disagreement is only a FAIL when something was actually OBSERVED to
  // disagree. If this leg never read an object, nothing has been contradicted
  // and the verdict stays NOT_PROVEN -- "we never replicated here" and "we
  // replicated here and it is wrong" are different facts with different fixes.
  if (!expectationCheck.matchesEntry) {
    result.REPLICATION = 'FAIL';
    result.reasons.push('LEDGER_ENTRY_CIPHERTEXT_HASH_DISAGREES_WITH_SUPPLIED_EXPECTATION');
  } else if (result.observed && !expectationCheck.matchesObserved) {
    result.REPLICATION = 'FAIL';
    result.reasons.push('OBSERVED_OBJECT_DID_NOT_MATCH_SUPPLIED_EXPECTED_CIPHERTEXT_HASH');
  }
}

console.log(JSON.stringify({
  // Process identity, so the pair result is demonstrably from two processes.
  process: { pid: process.pid, ppid: process.ppid, startedAt, completedAt: new Date().toISOString(), argvLeg: leg },
  leg,
  driveLabel: result.mount?.windowsPath ?? null,
  entryHash,
  contentHash: loaded.entry.contentHash,
  evidenceId: loaded.entry.evidenceId,
  expectationCheck,
  MOUNT_AUTHORITY: result.MOUNT_AUTHORITY,
  OBJECT_PRESENT: result.OBJECT_PRESENT,
  HASH_READBACK: result.HASH_READBACK,
  LEDGER_BINDING: result.LEDGER_BINDING,
  REPLICATION: result.REPLICATION,
  mount: result.mount,
  locator: result.locator,
  expected: result.expected,
  observed: result.observed,
  binding: result.binding,
  reasons: result.reasons,
  keyAuthorityForBinding: k.usable ? 'PRODUCTION' : 'UNAVAILABLE',
  note: 'This process read ONE leg. It says nothing about the other, and read-back never establishes immutability.',
}, null, 2));

process.exit(result.REPLICATION === 'VERIFIED' ? 0 : 1);
