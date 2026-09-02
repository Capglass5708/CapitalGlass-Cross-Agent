#!/usr/bin/env node
/**
 * EMERGENCY PRESERVATION CHECKPOINT — Claude Code transcript corpus.
 *
 * This is PRESERVATION, NOT INGESTION. It is deliberately dumb:
 * inventory -> copy -> hash -> manifest. It does not parse transcripts, does
 * not derive intelligence, does not touch any database, and does not claim to
 * be the Context Ledger. Production ingestion stays gated on Phase 0.
 *
 * Invariants:
 *   - Sources under ~/.claude/projects are treated as STRICTLY READ-ONLY.
 *     Every source file is hashed before and after the copy and the run FAILS
 *     if any source hash changed.
 *   - No transcript payload is ever written into a Git repository.
 *   - No transcript content is ever printed to stdout (secret safety).
 *   - Destination is created 0700; copied payloads are set read-only (0400).
 */
import { createHash } from 'node:crypto';
import {
  mkdirSync, readdirSync, statSync, copyFileSync, writeFileSync, chmodSync, existsSync, createReadStream,
} from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const SOURCE_ROOTS = [
  { id: 'wsl', root: path.join(os.homedir(), '.claude', 'projects') },
  { id: 'windows', root: '/mnt/c/Users/wesle/.claude/projects' },
];
const DEST_BASE = path.join(os.homedir(), '.capital-glass', 'evidence-preservation', 'claude-code');
const SCHEMA = 'claude-transcript-preservation-manifest-v1@1.0.0';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

function sha256File(file) {
  return new Promise((resolve, reject) => {
    const h = createHash('sha256');
    const s = createReadStream(file);
    s.on('error', reject);
    s.on('data', (c) => h.update(c));
    s.on('end', () => resolve(h.digest('hex')));
  });
}

function walk(dir, base, out = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) walk(abs, base, out);
    else if (e.isFile()) out.push(path.relative(base, abs));
  }
  return out;
}

function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`;
}

async function main() {
  const startedAt = new Date().toISOString();
  const stamp = startedAt.replace(/[:.]/g, '-');
  const destRun = path.join(DEST_BASE, stamp);

  const sources = [];
  for (const { id, root } of SOURCE_ROOTS) {
    if (!existsSync(root)) { sources.push({ id, root, present: false, files: [] }); continue; }
    sources.push({ id, root, present: true, files: walk(root, root) });
  }

  const entries = [];
  let totalBytes = 0;
  let changedDuringRun = 0;
  let copyFailures = 0;

  if (!DRY_RUN) {
    mkdirSync(destRun, { recursive: true, mode: 0o700 });
    chmodSync(destRun, 0o700);
  }

  for (const src of sources) {
    for (const rel of src.files) {
      const abs = path.join(src.root, rel);
      let before;
      try { before = statSync(abs); } catch { continue; }
      const hashBefore = await sha256File(abs);

      const entry = {
        sourceId: src.id,
        sourceRoot: src.root,
        sourcePath: abs,
        relativePath: rel,
        byteSize: before.size,
        mtime: before.mtime.toISOString(),
        sha256: hashBefore,
        preservedAt: null,
        destRelativePath: null,
        sourceUnchanged: null,
        copyVerified: null,
      };

      if (!DRY_RUN) {
        const destFile = path.join(destRun, 'payload', src.id, rel);
        mkdirSync(path.dirname(destFile), { recursive: true, mode: 0o700 });
        try {
          copyFileSync(abs, destFile);
          entry.preservedAt = new Date().toISOString();
          entry.destRelativePath = path.join('payload', src.id, rel);
          const destHash = await sha256File(destFile);
          const hashAfter = await sha256File(abs);
          entry.sourceUnchanged = hashAfter === hashBefore;
          entry.copyVerified = destHash === hashAfter;
          if (!entry.sourceUnchanged) changedDuringRun += 1;
          chmodSync(destFile, 0o400);
        } catch (err) {
          copyFailures += 1;
          entry.copyVerified = false;
          entry.error = String(err && err.code ? err.code : err);
        }
      }
      totalBytes += before.size;
      entries.push(entry);
    }
  }

  const manifestBody = {
    schema: SCHEMA,
    kind: 'EMERGENCY_PRESERVATION_CHECKPOINT',
    notIngestion: true,
    notContextLedger: true,
    startedAt,
    completedAt: new Date().toISOString(),
    machineId: os.hostname(),
    destinationRoot: DRY_RUN ? null : destRun,
    sourceRoots: sources.map((s) => ({ sourceId: s.id, root: s.root, present: s.present, fileCount: s.files.length })),
    fileCount: entries.length,
    totalBytes,
    sourcesChangedDuringRun: changedDuringRun,
    copyFailures,
    entries,
  };

  const manifestJson = `${JSON.stringify(manifestBody, null, 2)}\n`;
  const manifestHash = createHash('sha256').update(canonicalJson(manifestBody), 'utf8').digest('hex');

  if (!DRY_RUN) {
    writeFileSync(path.join(destRun, 'manifest.json'), manifestJson);
    writeFileSync(path.join(destRun, 'manifest.sha256'), `sha256:${manifestHash}\n`);
    chmodSync(path.join(destRun, 'manifest.json'), 0o400);
  }

  const verdict = (copyFailures === 0 && changedDuringRun === 0 && entries.length > 0)
    ? 'PRESERVATION_CHECKPOINT_PASS'
    : 'PRESERVATION_CHECKPOINT_ATTENTION';

  // Metadata only — never content.
  console.log(JSON.stringify({
    verdict,
    destinationRoot: manifestBody.destinationRoot,
    fileCount: manifestBody.fileCount,
    totalBytes: manifestBody.totalBytes,
    sourceRoots: manifestBody.sourceRoots,
    sourcesChangedDuringRun: changedDuringRun,
    copyFailures,
    manifestSha256: `sha256:${manifestHash}`,
    dryRun: DRY_RUN,
  }, null, 2));

  process.exit(verdict === 'PRESERVATION_CHECKPOINT_PASS' || DRY_RUN ? 0 : 1);
}

main().catch((e) => { console.error(`preservation failed: ${e?.message ?? e}`); process.exit(1); });
