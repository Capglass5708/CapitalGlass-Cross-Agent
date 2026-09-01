/**
 * Immutable hash-chained ledger.
 *
 * Persistence shape is part of the contract: one immutable file per entry,
 * named from entryHash. Never appended into a shared file -- that would be
 * incompatible with WORM auto-lock AND would leave historical proof mutable.
 *
 * entryHash is identity. prevHash/entryHash is the authority. `seq` is ordering
 * assistance only. `current-head` is a disposable cache: if it disappears, the
 * head is rebuilt by scanning entries and following the chain.
 */
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, renameSync, openSync, closeSync, unlinkSync, statSync } from 'node:fs';
import path from 'node:path';
import { canonicalJson, sha256Prefixed } from './canonical.mjs';

export const ENTRY_DIR = 'immutable-metadata/ledger-entries';
export const HEAD_FILE = 'current-head/head.json';

/** entryHash = sha256(canonical(entry-without-entryHash) + prevHash) */
export function computeEntryHash(entry, prevHash) {
  const { entryHash, ...rest } = entry;
  return sha256Prefixed(Buffer.from(canonicalJson(rest) + String(prevHash ?? ''), 'utf8'));
}

export function entryFileName(entryHash) {
  // Derived from entryHash, never from seq. Two writers computing seq+1 would
  // collide and would then be relying on the storage layer refusing an
  // overwrite -- an accident of WORM rather than a designed guarantee.
  return `entry-${String(entryHash).replace(/^sha256:/, '')}.json`;
}

/**
 * FORK INDEX.
 *
 * The fork check asks one question -- "does any existing entry already claim
 * this predecessor?" -- and it used to answer it by reading EVERY entry file on
 * EVERY append. That is O(n) reads per append and O(n^2) per run: fine at a few
 * hundred entries, hours at estate scale, which made the cost of the check the
 * reason the estate could not be captured.
 *
 * The index answers the same question from a map. It is NOT a cache of
 * convenience: correctness is preserved by making staleness detectable.
 *
 *   - prevHash -> SET of entryHashes, not a single value. A single value would
 *     lose one branch of an ALREADY-forked store, and the fork check would then
 *     miss exactly the case it exists to catch. The set is equivalent to the
 *     old .find() in every state, including a store that is already forked.
 *   - Freshness is checked by DIRECTORY ENTRY COUNT before every use. Another
 *     process appending changes the count, which forces a rebuild. Entries are
 *     immutable and never deleted, so the count is monotonic and a matching
 *     count means a matching set.
 *
 * The index never decides that something is NOT a fork on its own authority:
 * a stale index rebuilds, and a rebuild reads the same files the old code read.
 */
const forkIndexCache = new Map();

function entryDirOf(vaultRoot) { return path.join(vaultRoot, ENTRY_DIR); }

function listEntryFiles(dir) {
  try { return readdirSync(dir).filter((f) => f.endsWith('.json')); } catch { return []; }
}

/**
 * O(1) freshness signal. A directory's mtime changes whenever an entry is
 * added, so an unchanged signature means nothing appeared behind our back.
 * Re-listing the directory on every append was still O(n) per append -- cheaper
 * than reading every file, but the same quadratic shape.
 */
function dirSignature(dir) {
  try { const st = statSync(dir); return `${st.mtimeMs}:${st.ctimeMs}`; } catch { return 'ABSENT'; }
}

function getForkIndex(vaultRoot) {
  const dir = entryDirOf(vaultRoot);
  const sig = dirSignature(dir);
  const cached = forkIndexCache.get(vaultRoot);
  if (cached && cached.sig === sig) return cached;

  // Signature moved. Confirm with a listing before paying for a rebuild: our
  // own append moves it too, and an unchanged COUNT means an unchanged set
  // because entries are immutable and never deleted.
  const files = listEntryFiles(dir);
  if (cached && cached.fileCount === files.length) { cached.sig = sig; return cached; }

  const byPrev = new Map();
  for (const f of files) {
    let e;
    try { e = JSON.parse(readFileSync(path.join(dir, f), 'utf8')); } catch { continue; }
    const k = String(e.prevHash);
    if (!byPrev.has(k)) byPrev.set(k, new Set());
    byPrev.get(k).add(e.entryHash);
  }
  const fresh = { byPrev, fileCount: files.length, sig: dirSignature(dir) };
  forkIndexCache.set(vaultRoot, fresh);
  return fresh;
}

/** Exactly the predicate the old scan computed: an entry claiming this predecessor with a different hash. */
function findForkAgainst(vaultRoot, actualPrev, attemptedEntryHash) {
  const idx = getForkIndex(vaultRoot);
  const claimants = idx.byPrev.get(String(actualPrev));
  if (!claimants) return null;
  for (const h of claimants) if (h !== attemptedEntryHash) return h;
  return null;
}

function noteAppended(vaultRoot, entry) {
  const idx = forkIndexCache.get(vaultRoot);
  if (!idx) return;
  const k = String(entry.prevHash);
  if (!idx.byPrev.has(k)) idx.byPrev.set(k, new Set());
  idx.byPrev.get(k).add(entry.entryHash);
  idx.fileCount += 1;
  idx.sig = dirSignature(entryDirOf(vaultRoot));
}

/** Test/maintenance seam. Never called on the append path. */
export function resetForkIndex(vaultRoot = null) {
  if (vaultRoot === null) forkIndexCache.clear();
  else forkIndexCache.delete(vaultRoot);
}

export function readHead(metaRoot) {
  const f = path.join(metaRoot, HEAD_FILE);
  if (!existsSync(f)) return null;
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; }
}

function writeHeadAtomic(metaRoot, head) {
  const f = path.join(metaRoot, HEAD_FILE);
  mkdirSync(path.dirname(f), { recursive: true });
  const tmp = `${f}.tmp-${process.pid}-${Date.now()}`;
  writeFileSync(tmp, `${JSON.stringify(head, null, 2)}\n`);
  renameSync(tmp, f);
}

/**
 * Exclusive head lock via O_EXCL. Makes the head transition a genuine
 * compare-and-swap rather than a read-then-write race: a second writer cannot
 * observe the same predecessor and also win.
 */
function withHeadLock(metaRoot, fn, { retries = 50, waitMs = 20 } = {}) {
  const lock = path.join(metaRoot, 'current-head', '.head.lock');
  mkdirSync(path.dirname(lock), { recursive: true });
  for (let i = 0; i <= retries; i += 1) {
    let fd;
    try { fd = openSync(lock, 'wx'); } catch { 
      const until = Date.now() + waitMs;
      while (Date.now() < until) { /* spin: this library is sync because its callers are */ }
      continue;
    }
    try { return fn(); } finally { closeSync(fd); try { unlinkSync(lock); } catch {} }
  }
  throw new Error('LEDGER_HEAD_LOCK_TIMEOUT');
}

/**
 * Append one entry under CAS. Returns { entry, entryPath, casRetries }.
 * Throws FORK_DETECTED if an entry already claims this predecessor.
 */
export function appendEntry({ vaultRoot, metaRoot, body, expectedPrevHash = undefined }) {
  return withHeadLock(metaRoot, () => {
    const head = readHead(metaRoot);
    const actualPrev = head?.entryHash ?? null;
    if (expectedPrevHash !== undefined && expectedPrevHash !== actualPrev) {
      const e = new Error('CAS_PRECONDITION_FAILED');
      e.expected = expectedPrevHash; e.actual = actualPrev;
      throw e;
    }
    const seq = (head?.seq ?? -1) + 1;
    const draft = {
      schemaVersion: 'evidence-ledger-entry-v1@1.0.0',
      seq,
      prevHash: actualPrev,
      recordedAt: new Date().toISOString(),
      ...body,
    };
    const entryHash = computeEntryHash(draft, actualPrev);
    const entry = { ...draft, entryHash };

    const dir = path.join(vaultRoot, ENTRY_DIR);
    mkdirSync(dir, { recursive: true });
    const entryPath = path.join(dir, entryFileName(entryHash));

    // Fork check: has anything already claimed this predecessor?
    const forkHash = findForkAgainst(vaultRoot, actualPrev, entryHash);
    if (forkHash) {
      const e = new Error('FORK_DETECTED');
      e.existing = forkHash; e.attempted = entryHash; e.prevHash = actualPrev;
      throw e;
    }
    if (existsSync(entryPath)) return { entry: JSON.parse(readFileSync(entryPath, 'utf8')), entryPath, duplicate: true };

    writeFileSync(entryPath, `${JSON.stringify(entry, null, 2)}\n`, { flag: 'wx' });
    writeHeadAtomic(metaRoot, { entryHash, seq, updatedAt: new Date().toISOString() });
    noteAppended(vaultRoot, entry);
    return { entry, entryPath, duplicate: false };
  });
}

export function scanEntries(vaultRoot) {
  const dir = path.join(vaultRoot, ENTRY_DIR);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(path.join(dir, f), 'utf8')));
}

/**
 * Rebuild the head from immutable entries alone. This is what makes
 * `current-head` disposable: losing it costs a scan, never integrity.
 */
export function reconstructHead(vaultRoot) {
  const entries = scanEntries(vaultRoot);
  if (entries.length === 0) return { head: null, length: 0, entries: [] };
  const byPrev = new Map();
  for (const e of entries) {
    const k = String(e.prevHash);
    if (byPrev.has(k)) {
      const err = new Error('FORK_DETECTED');
      err.prevHash = e.prevHash; err.branches = [byPrev.get(k).entryHash, e.entryHash];
      throw err;
    }
    byPrev.set(k, e);
  }
  const chain = [];
  let cur = byPrev.get('null');
  if (!cur) throw new Error('CHAIN_GENESIS_MISSING');
  while (cur) {
    if (computeEntryHash(cur, cur.prevHash) !== cur.entryHash) {
      const err = new Error('CHAIN_HASH_MISMATCH'); err.at = cur.entryHash; throw err;
    }
    chain.push(cur);
    cur = byPrev.get(cur.entryHash);
  }
  if (chain.length !== entries.length) {
    const err = new Error('CHAIN_ORPHAN_ENTRIES');
    err.reachable = chain.length; err.total = entries.length; throw err;
  }
  const last = chain[chain.length - 1];
  return { head: { entryHash: last.entryHash, seq: last.seq }, length: chain.length, entries: chain };
}

export function restoreHead(metaRoot, head) { writeHeadAtomic(metaRoot, { ...head, restoredAt: new Date().toISOString() }); }
