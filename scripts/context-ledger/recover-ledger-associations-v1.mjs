#!/usr/bin/env node
/**
 * RULING 7: recover the ledger associations for objects stranded by the vault
 * supersession, append-only and provenance-bearing.
 *
 * Discovers orphans by set difference (objects on disk minus ciphertextHashes
 * referenced by the CURRENT ledger), finds each one's PRESERVED superseded
 * entry, and writes one recovery association per object.
 *
 * Append-only: a record is written to a new immutable file named from its own
 * hash. Nothing in the current ledger is modified, nothing in the superseded
 * ledger is touched, and an existing record is never overwritten.
 *
 * --dry-run reports without writing.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256Prefixed } from './lib/canonical.mjs';
import { buildRecoveryAssociation, verifyRecoveryAssociation, recoveryFileName } from './lib/ledger-recovery.mjs';

const arg = (n, d = null) => {
  const p = process.argv.find((a) => a.startsWith(`--${n}=`));
  return p ? p.slice(n.length + 3) : d;
};
const flag = (n) => process.argv.includes(`--${n}`);

const CURRENT = arg('current', '/home/wesle/.capital-glass/context-ledger/estate-capture-v1');
const SUPERSEDED = arg('superseded', '/home/wesle/.capital-glass/context-ledger/estate-capture-v1.superseded-20260831T221019Z');
const DRY = flag('dry-run');

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function ledgerEntryFiles(root) {
  return walk(root).filter((p) => p.includes('ledger-entries') && p.endsWith('.json'));
}

function referencedCiphertextHashes(root) {
  const s = new Set();
  for (const f of ledgerEntryFiles(root)) {
    try {
      const d = JSON.parse(readFileSync(f, 'utf-8'));
      const ch = d?.encryption?.ciphertextHash;
      if (ch) s.add(ch);
    } catch { /* a malformed entry is not a reference */ }
  }
  return s;
}

function objectsOnDisk(root) {
  const objRoot = path.join(root, 'spool', 'objects', 'sha256');
  const m = new Map();
  for (const p of walk(objRoot)) m.set(`sha256:${path.basename(p)}`, p);
  return m;
}

function main() {
  const softwareSha = sha256Prefixed(readFileSync(fileURLToPath(import.meta.url)));

  const disk = objectsOnDisk(CURRENT);
  const referenced = referencedCiphertextHashes(CURRENT);
  const orphans = [...disk.keys()].filter((h) => !referenced.has(h)).sort();

  // Index the preserved ledger once: 17k+ entries, and we need them by ciphertextHash.
  const supIndex = new Map();
  for (const f of ledgerEntryFiles(SUPERSEDED)) {
    try {
      const d = JSON.parse(readFileSync(f, 'utf-8'));
      const ch = d?.encryption?.ciphertextHash;
      if (!ch) continue;
      if (!supIndex.has(ch)) supIndex.set(ch, []);
      supIndex.get(ch).push({ file: f, recordedAt: d.recordedAt ?? null, seq: d.seq ?? null });
    } catch { /* skip */ }
  }

  const supersessionEvent = {
    supersededVaultPath: SUPERSEDED,
    supersededAt: '2026-08-31T22:10:19Z',
    derivedFromDirectoryName: true,
    currentVaultPath: CURRENT,
  };

  const outDir = path.join(CURRENT, 'vault', 'immutable-metadata', 'recovery-associations');
  // Pre-scan: an association already recorded for an object is never written
  // again, even if the record format or the tool changes.
  const alreadyRecovered = new Set();
  if (existsSync(outDir)) {
    for (const f of readdirSync(outDir)) {
      if (!f.endsWith('.json')) continue;
      try { alreadyRecovered.add(JSON.parse(readFileSync(path.join(outDir, f), 'utf-8')).ciphertextHash); }
      catch { /* unreadable record is not a claim */ }
    }
  }

  const results = { orphansFound: orphans.length, written: [], skippedExisting: [], refused: [] };

  for (const ciphertextHash of orphans) {
    if (alreadyRecovered.has(ciphertextHash)) { results.skippedExisting.push(ciphertextHash); continue; }
    const candidates = supIndex.get(ciphertextHash) ?? [];
    if (candidates.length === 0) {
      results.refused.push({ ciphertextHash, defects: ['NO_PRESERVED_ENTRY_FOUND'] });
      continue;
    }
    // Multiple preserved entries can reference one object (the same bytes observed
    // more than once). The EARLIEST is the association being recovered; the others
    // are recorded so the choice is auditable rather than silent.
    candidates.sort((a, b) => String(a.recordedAt).localeCompare(String(b.recordedAt)));
    const chosen = candidates[0];

    const r = buildRecoveryAssociation({
      ciphertextHash,
      currentSpoolObjectPath: disk.get(ciphertextHash),
      supersededEntryPath: chosen.file,
      supersededLedgerAuthority: SUPERSEDED,
      supersessionEvent,
      recoverySoftwareSha: softwareSha,
    });
    if (!r.ok) { results.refused.push({ ciphertextHash, defects: r.defects }); continue; }

    r.record.additionalPreservedEntriesReferencingThisObject = candidates.slice(1).map((c) => ({
      file: path.basename(c.file), recordedAt: c.recordedAt, seq: c.seq,
    }));
    // recordHash was computed before this annotation, so recompute the binding.
    const rebuilt = buildRecoveryAssociation({
      ciphertextHash,
      currentSpoolObjectPath: disk.get(ciphertextHash),
      supersededEntryPath: chosen.file,
      supersededLedgerAuthority: SUPERSEDED,
      supersessionEvent,
      recoverySoftwareSha: softwareSha,
      recoveredAt: r.record.recoveredAt,
    });
    const record = { ...rebuilt.record, additionalPreservedEntriesReferencingThisObject: r.record.additionalPreservedEntriesReferencingThisObject };

    const v = verifyRecoveryAssociation(rebuilt.record);
    if (!v.verified) { results.refused.push({ ciphertextHash, defects: v.defects }); continue; }

    const fname = recoveryFileName(rebuilt.record);
    const dest = path.join(outDir, fname);
    if (existsSync(dest)) { results.skippedExisting.push(fname); continue; }
    if (!DRY) {
      mkdirSync(outDir, { recursive: true });
      writeFileSync(dest, `${JSON.stringify(record, null, 1)}\n`, { flag: 'wx' }); // wx: never overwrite
    }
    results.written.push({
      ciphertextHash,
      recoveryRecordId: rebuilt.record.recoveryRecordId,
      supersededLedgerEntryHash: rebuilt.record.supersededLedgerEntryHash,
      supersededEntryTimestamp: rebuilt.record.supersededEntryTimestamp,
      keyVersion: rebuilt.record.provenFromPreservedEntry.encryption.keyVersion,
      file: fname,
    });
  }

  results.RECOVERED_LEDGER_ASSOCIATIONS = results.written.length + results.skippedExisting.length;
  results.UNRESOLVED_PROVISIONAL_OBJECTS = results.refused.length;
  results.dryRun = DRY;
  results.outputDirectory = outDir;
  results.recoverySoftwareSha = softwareSha;
  console.log(JSON.stringify(results, null, 1));
  return results.refused.length === 0 ? 0 : 1;
}

process.exit(main());
