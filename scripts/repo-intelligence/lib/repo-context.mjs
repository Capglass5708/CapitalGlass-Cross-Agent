/**
 * Repo access layer. Everything the passes read goes through here so that
 * the compiler's inputs are explicit, cacheable, and identical across hosts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { sha256 } from './canonical.mjs';

function git(repoRoot, args, { quiet = false } = {}) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    // An unresolvable ref is an expected, handled outcome (a fresh clone with
    // no remote); its stderr is noise, not a failure signal.
    stdio: quiet ? ['ignore', 'pipe', 'ignore'] : ['ignore', 'pipe', 'pipe'],
  }).trim();
}

export function createRepoContext(repoRoot) {
  const files = git(repoRoot, ['ls-files']).split('\n').filter(Boolean);
  const cache = new Map();

  const read = (relPath) => {
    if (cache.has(relPath)) return cache.get(relPath);
    let text = null;
    try {
      const abs = path.join(repoRoot, relPath);
      const stat = fs.statSync(abs);
      // Skip absurdly large generated payloads; they are evidence, not logic.
      text = stat.size > 4 * 1024 * 1024 ? null : fs.readFileSync(abs, 'utf8');
    } catch {
      text = null;
    }
    cache.set(relPath, text);
    return text;
  };

  const lineOf = (text, index) => text.slice(0, index).split('\n').length;

  return {
    repoRoot,
    files,
    read,
    lineOf,
    git: (args, opts) => git(repoRoot, args, opts),
    sourceSha: git(repoRoot, ['rev-parse', 'HEAD']),
    treeSha: git(repoRoot, ['rev-parse', 'HEAD^{tree}']),
    fileSha: (relPath) => {
      const text = read(relPath);
      return text === null ? null : `sha256:${sha256(text)}`;
    },
    packageJson: (() => {
      try {
        return JSON.parse(read('package.json') ?? '{}');
      } catch {
        return {};
      }
    })(),
  };
}
