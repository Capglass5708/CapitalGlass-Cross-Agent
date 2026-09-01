/**
 * SOURCE CENSUS.
 *
 * Discovery is deliberately separate from capture and shares no classification
 * logic with it. A census produced by the capture parser is self-confirming: if
 * the parser cannot see a file, neither can the expectation it is judged
 * against, and the two agree perfectly about a source that was never counted.
 * These walkers know only about paths, extensions and declared roots -- they
 * never parse a source, never hash one, and never decide whether one is
 * admissible.
 *
 * Every class declares its roots and its exclusions IN CODE, so the scope of a
 * run is auditable rather than implied by whatever the walker happened to find.
 * A root that does not exist is recorded as present:false -- an absent root and
 * an empty root are different facts and must never collapse into "0 files".
 */
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';

import { CENSUS_STATUS } from './source-state.mjs';

const HOME = os.homedir();

/** Directory names never walked. Caches, build output and VCS internals are not estate text. */
export const EXCLUDED_DIR_NAMES = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', '.next', 'coverage', '.turbo',
  '.venv', 'venv', '__pycache__', '.pytest_cache', '.mypy_cache', 'vendor',
  'Cache', 'CachedData', 'CachedExtensionVSIXs', 'CachedProfilesData', 'CachedConfigurations',
  'Code Cache', 'GPUCache', 'DawnGraphiteCache', 'DawnWebGPUCache', 'blob_storage',
  'Crashpad', 'Service Worker', 'Session Storage', 'Local Storage', 'IndexedDB',
  'Partitions', 'WebStorage', 'databases', 'bin', 'obj',
]);

export const TEXT_EXTENSIONS = new Set(['.jsonl', '.json', '.md', '.txt', '.yaml', '.yml', '.mdc']);

export function formatFor(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  if (ext === '.jsonl') return 'jsonl';
  if (ext === '.json') return 'json';
  return 'text';
}

/** Bounded, pruning walk. Symlinks are not followed: a symlink loop would make a census non-terminating. */
export function walkFiles(root, { extensions = null, maxDepth = 24, excludeDirs = EXCLUDED_DIR_NAMES, excludePathParts = [] } = {}) {
  const out = [];
  if (!existsSync(root)) return out;
  const stack = [{ dir: root, depth: 0 }];
  while (stack.length > 0) {
    const { dir, depth } = stack.pop();
    if (depth > maxDepth) continue;
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      const abs = path.join(dir, e.name);
      if (e.isSymbolicLink()) continue;
      if (e.isDirectory()) {
        if (excludeDirs.has(e.name)) continue;
        if (excludePathParts.some((p) => abs.includes(p))) continue;
        stack.push({ dir: abs, depth: depth + 1 });
        continue;
      }
      if (!e.isFile()) continue;
      if (extensions && !extensions.has(path.extname(e.name).toLowerCase())) continue;
      if (excludePathParts.some((p) => abs.includes(p))) continue;
      out.push(abs);
    }
  }
  return out.sort();
}

function rootRecord(id, root) {
  return { id, root, present: existsSync(root) };
}

function filesFrom(roots, opts) {
  const files = [];
  for (const r of roots) {
    if (!r.present) continue;
    for (const abs of walkFiles(r.root, opts)) {
      files.push({
        absPath: abs,
        sourceRootId: r.id,
        relativePath: path.relative(r.root, abs),
        format: formatFor(abs),
      });
    }
  }
  return files;
}

export function estateRepoRoots(reposRoot = process.env.CG_REPOS_ROOT || path.join(HOME, 'repos')) {
  if (!existsSync(reposRoot)) return [];
  return readdirSync(reposRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(path.join(reposRoot, e.name, '.git')))
    .map((e) => ({ id: `repo:${e.name}`, root: path.join(reposRoot, e.name), present: true }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * The eight declared source classes.
 *
 * sourceSystem values map onto the EXISTING evidence-ledger-entry-v1 enum
 * (claude-code, cursor, chatgpt, git, waverunner, documents, human). The enum
 * was not extended: every real source on this machine has an honest home in it,
 * and inventing an eighth system to avoid a classification decision would make
 * the enum decorative.
 *
 * Two classes share sourceSystem "claude-code" because they genuinely are the
 * same system observed twice -- the live tree and the preservation checkpoint
 * taken from it. They are separated at the CLASS level, not the system level,
 * so accounting can distinguish them without lying about their origin.
 */
export const SOURCE_CLASSES = [
  {
    sourceClass: 'claude-code-live',
    sourceSystem: 'claude-code',
    description: 'Live Claude Code transcripts, WSL and the Windows mirror.',
    discover() {
      const roots = [
        rootRecord('claude-wsl', path.join(HOME, '.claude', 'projects')),
        rootRecord('claude-windows', '/mnt/c/Users/wesle/.claude/projects'),
      ];
      return { roots, files: filesFrom(roots, { extensions: new Set(['.jsonl']) }), censusStatus: CENSUS_STATUS.COMPLETE };
    },
  },
  {
    sourceClass: 'claude-code-preserved',
    sourceSystem: 'claude-code',
    description: 'The emergency preservation checkpoint corpus, with per-file declared sha256 from its manifest.',
    discover({ preservedCorpusRoot }) {
      if (!preservedCorpusRoot) {
        return { roots: [], files: [], censusStatus: CENSUS_STATUS.NOT_RUN, note: 'NO_PRESERVED_CORPUS_ROOT_SUPPLIED' };
      }
      const payload = path.join(preservedCorpusRoot, 'payload');
      const roots = [rootRecord('preserved-corpus', payload)];
      if (!roots[0].present) {
        return { roots, files: [], censusStatus: CENSUS_STATUS.FAILED, note: 'PRESERVED_CORPUS_PAYLOAD_ABSENT' };
      }
      // The preservation manifest is an INDEPENDENT integrity expectation: it
      // recorded each file's sha256 at preservation time, so a byte that has
      // rotted since is detectable rather than silently re-captured as truth.
      const manifestPath = path.join(preservedCorpusRoot, 'manifest.json');
      const expected = new Map();
      let manifestRead = false;
      if (existsSync(manifestPath)) {
        try {
          const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
          for (const e of m.entries ?? []) {
            if (e.destRelativePath && e.sha256) {
              expected.set(path.join(preservedCorpusRoot, e.destRelativePath), `sha256:${e.sha256}`);
            }
          }
          manifestRead = true;
        } catch { manifestRead = false; }
      }
      const files = filesFrom(roots, {}).map((f) => ({ ...f, expectedSha256: expected.get(f.absPath) ?? null }));
      return {
        roots, files, censusStatus: CENSUS_STATUS.COMPLETE,
        note: manifestRead ? `MANIFEST_HASHES_LOADED:${expected.size}` : 'MANIFEST_UNREADABLE_NO_DECLARED_HASHES',
      };
    },
  },
  {
    sourceClass: 'cursor',
    sourceSystem: 'cursor',
    description: 'Cursor text and session artifacts, WSL and Windows. Binary state stores are excluded by policy.',
    discover() {
      const roots = [
        rootRecord('cursor-wsl', path.join(HOME, '.cursor')),
        rootRecord('cursor-server-wsl', path.join(HOME, '.cursor-server', 'data', 'User')),
        rootRecord('cursor-windows', '/mnt/c/Users/wesle/AppData/Roaming/Cursor/User'),
      ];
      return {
        roots,
        files: filesFrom(roots, { extensions: TEXT_EXTENSIONS }),
        censusStatus: CENSUS_STATUS.COMPLETE,
        note: 'Cursor keeps conversation state in binary state.vscdb; that store is not text and is excluded by policy, not missed.',
      };
    },
  },
  {
    sourceClass: 'waverunner',
    sourceSystem: 'waverunner',
    description: 'Agent-run, mission and execution artifacts across estate repositories.',
    discover({ repoRoots }) {
      const roots = repoRoots
        .map((r) => rootRecord(`${r.id}:agent-runs`, path.join(r.root, 'artifacts', 'agent-runs')))
        .filter((r) => r.present);
      return { roots, files: filesFrom(roots, { extensions: TEXT_EXTENSIONS }), censusStatus: CENSUS_STATUS.COMPLETE };
    },
  },
  {
    sourceClass: 'documents',
    sourceSystem: 'documents',
    description: 'Markdown, handoffs, decision logs, runbooks and project documentation across estate repositories.',
    discover({ repoRoots }) {
      const roots = repoRoots.map((r) => rootRecord(`${r.id}:docs`, r.root));
      return {
        roots,
        files: filesFrom(roots, {
          extensions: new Set(['.md', '.mdc']),
          // agent-run artifacts belong to the waverunner class; excluding them
          // here keeps the two classes disjoint rather than double-counted.
          excludePathParts: [path.join('artifacts', 'agent-runs')],
        }),
        censusStatus: CENSUS_STATUS.COMPLETE,
      };
    },
  },
  {
    sourceClass: 'git',
    sourceSystem: 'git',
    description: 'Version-controlled repository text within the declared mission worktree scope.',
    discover({ gitScopeRoot, gitScopePaths }) {
      const roots = [rootRecord('git-mission-worktree', gitScopeRoot)];
      if (!roots[0].present) return { roots, files: [], censusStatus: CENSUS_STATUS.FAILED, note: 'GIT_SCOPE_ROOT_ABSENT' };
      let tracked;
      try {
        tracked = execFileSync('git', ['-C', gitScopeRoot, 'ls-files', '-z', '--', ...gitScopePaths], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
          .split('\0').filter(Boolean);
      } catch {
        // A census that cannot enumerate is UNRESOLVED, never empty.
        return { roots, files: [], censusStatus: CENSUS_STATUS.FAILED, note: 'GIT_LS_FILES_FAILED' };
      }
      const files = tracked
        .filter((rel) => TEXT_EXTENSIONS.has(path.extname(rel).toLowerCase()) || path.extname(rel) === '.mjs')
        .map((rel) => ({
          absPath: path.join(gitScopeRoot, rel), sourceRootId: 'git-mission-worktree',
          relativePath: rel, format: formatFor(rel),
        }))
        .filter((f) => existsSync(f.absPath))
        .sort((a, b) => a.absPath.localeCompare(b.absPath));
      return { roots, files, censusStatus: CENSUS_STATUS.COMPLETE, note: `GIT_TRACKED_SCOPE:${gitScopePaths.join(',')}` };
    },
  },
  {
    sourceClass: 'human',
    sourceSystem: 'human',
    description: 'Operator-authored inputs: user-level Claude instructions and curated agent memory.',
    discover() {
      const roots = [
        rootRecord('claude-user-config', path.join(HOME, '.claude')),
      ];
      const files = [];
      const userMd = path.join(HOME, '.claude', 'CLAUDE.md');
      if (existsSync(userMd)) {
        files.push({ absPath: userMd, sourceRootId: 'claude-user-config', relativePath: 'CLAUDE.md', format: 'text' });
      }
      const projects = path.join(HOME, '.claude', 'projects');
      if (existsSync(projects)) {
        for (const d of readdirSync(projects, { withFileTypes: true })) {
          if (!d.isDirectory()) continue;
          const mem = path.join(projects, d.name, 'memory');
          if (!existsSync(mem)) continue;
          for (const abs of walkFiles(mem, { extensions: new Set(['.md']) })) {
            files.push({
              absPath: abs, sourceRootId: 'claude-user-config',
              relativePath: path.relative(path.join(HOME, '.claude'), abs), format: 'text',
            });
          }
        }
      }
      files.sort((a, b) => a.absPath.localeCompare(b.absPath));
      return { roots, files, censusStatus: CENSUS_STATUS.COMPLETE };
    },
  },
  {
    sourceClass: 'chatgpt',
    sourceSystem: 'chatgpt',
    description: 'ChatGPT conversation exports.',
    discover({ chatgptRoots = [] }) {
      const roots = chatgptRoots.map((r, i) => rootRecord(`chatgpt-${i}`, r));
      const files = filesFrom(roots, { extensions: new Set(['.json', '.jsonl']) });
      return {
        roots, files, censusStatus: CENSUS_STATUS.COMPLETE,
        // A MEASURED zero. The roots were looked at and were absent or empty.
        // This is not the same claim as "we did not check", and the roots array
        // above is the evidence for which of the two it is.
        note: files.length === 0 ? 'ZERO_DISCOVERED_NO_CHATGPT_EXPORT_PRESENT_ON_THIS_MACHINE' : null,
      };
    },
  },
];

/**
 * Run every class census. Later classes never re-claim a path an earlier class
 * already owns: one file, one class, one accounting row. Without this a
 * markdown file under a repo would be counted by both `documents` and `git` and
 * the estate total would exceed the estate.
 */
export function runCensus(ctx) {
  const seen = new Set();
  const results = [];
  for (const cls of SOURCE_CLASSES) {
    let r;
    try { r = cls.discover(ctx); } catch (e) {
      r = { roots: [], files: [], censusStatus: CENSUS_STATUS.FAILED, note: `CENSUS_THREW:${e.message}` };
    }
    const claimed = [];
    let collisions = 0;
    for (const f of r.files) {
      if (seen.has(f.absPath)) { collisions += 1; continue; }
      seen.add(f.absPath);
      claimed.push(f);
    }
    results.push({
      sourceClass: cls.sourceClass,
      sourceSystem: cls.sourceSystem,
      description: cls.description,
      censusStatus: r.censusStatus,
      note: r.note ?? null,
      roots: r.roots,
      discoveredCount: r.censusStatus === CENSUS_STATUS.COMPLETE ? claimed.length : null,
      rawMatchCount: r.censusStatus === CENSUS_STATUS.COMPLETE ? r.files.length : null,
      crossClassCollisionsDropped: collisions,
      files: claimed,
    });
  }
  return results;
}
