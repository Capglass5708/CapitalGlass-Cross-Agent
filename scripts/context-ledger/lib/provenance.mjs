/**
 * Deterministic provenance resolution.
 *
 * THE RULE: unknown stays unknown. Every field is nullable, and a null here
 * means "this source does not expose it", never "we could not be bothered" and
 * never "we guessed something plausible". Fabricated provenance is worse than
 * absent provenance, because absent provenance is visibly absent while a
 * fabricated branch name looks exactly like a real one forever.
 *
 * Every resolution is therefore paired with an explicit completeness verdict
 * and an enumerated list of fields that could not be resolved. A reader can
 * distinguish "null because the source has no session" from "null because the
 * resolver failed" without trusting our word for it.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';

export const PROVENANCE_COMPLETENESS = {
  COMPLETE: 'COMPLETE',
  PARTIAL: 'PARTIAL',
  LOWER_BOUND: 'LOWER_BOUND',
};

export const MACHINE_ID = process.env.CG_MACHINE_ID || os.hostname();

const repoCache = new Map();

/** Nearest ancestor containing .git. Returns null rather than a plausible guess. */
export function findRepoRoot(absPath) {
  let dir = statSafe(absPath)?.isDirectory() ? absPath : path.dirname(absPath);
  const seen = [];
  while (dir && dir !== path.dirname(dir)) {
    seen.push(dir);
    if (existsSync(path.join(dir, '.git'))) return dir;
    dir = path.dirname(dir);
  }
  return null;
}

function statSafe(p) { try { return statSync(p); } catch { return null; } }

/**
 * Git identity for a repo root, read once per root.
 *
 * Uses git itself rather than parsing .git by hand: linked worktrees put HEAD
 * in the worktree dir but refs in the common dir, and a hand-rolled reader that
 * is subtly wrong about that would silently attribute every worktree capture to
 * the wrong branch.
 */
export function resolveGitBinding(repoRoot) {
  if (!repoRoot) return { repoKey: null, worktreePath: null, branch: null, headSha: null, resolved: false };
  if (repoCache.has(repoRoot)) return repoCache.get(repoRoot);
  const out = { repoKey: path.basename(repoRoot), worktreePath: repoRoot, branch: null, headSha: null, resolved: false };
  try {
    const git = (args) => execFileSync('git', ['-C', repoRoot, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    out.headSha = git(['rev-parse', 'HEAD']) || null;
    const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
    out.branch = branch && branch !== 'HEAD' ? branch : null;   // detached HEAD is a real state, not a branch
    out.resolved = true;
  } catch {
    // A repo we cannot interrogate yields nulls and resolved:false. It does not
    // yield an invented sha.
    out.resolved = false;
  }
  repoCache.set(repoRoot, out);
  return out;
}

/**
 * Claude Code transcript header.
 *
 * The transcript's FIRST JSONL record carries sessionId, cwd, gitBranch and
 * version as the source itself recorded them. That is authoritative. The
 * directory name (`-home-wesle-repos-CG-AppBuilder-MCP`) encodes the cwd only
 * by a lossy dash substitution -- any path containing a dash decodes
 * ambiguously -- so it is used as a LAST resort and marked derived.
 */
export function resolveClaudeTranscriptHeader(buffer) {
  const text = buffer.toString('utf8');
  const nl = text.indexOf('\n');
  const firstLine = (nl === -1 ? text : text.slice(0, nl)).trim();
  if (!firstLine) return { ok: false, reason: 'EMPTY_TRANSCRIPT' };
  let rec;
  try { rec = JSON.parse(firstLine); } catch { return { ok: false, reason: 'FIRST_RECORD_NOT_JSON' }; }
  if (rec === null || typeof rec !== 'object') return { ok: false, reason: 'FIRST_RECORD_NOT_OBJECT' };
  return {
    ok: true,
    sessionId: typeof rec.sessionId === 'string' ? rec.sessionId : null,
    parentSessionId: typeof rec.parentUuid === 'string' ? null : null,
    isSidechain: typeof rec.isSidechain === 'boolean' ? rec.isSidechain : null,
    cwd: typeof rec.cwd === 'string' ? rec.cwd : null,
    gitBranch: typeof rec.gitBranch === 'string' && rec.gitBranch !== '' ? rec.gitBranch : null,
    sourceTimestamp: typeof rec.timestamp === 'string' ? rec.timestamp : null,
    modelIdentity: typeof rec?.message?.model === 'string' ? rec.message.model : null,
    agentIdentity: typeof rec.userType === 'string' ? rec.userType : null,
  };
}

/**
 * Resolve provenance for one admitted source.
 *
 * `buffer` is the ADMITTED bytes -- provenance is derived only from material
 * that already passed pre-admission scanning, so this can never be the path by
 * which unscanned content is inspected.
 */
export function resolveProvenance({ absPath, sourceSystem, buffer = null, sourceRootId = null, relativePath = null, workPackageId = null }) {
  const unresolved = [];
  const repoRoot = findRepoRoot(absPath);
  const git = resolveGitBinding(repoRoot);

  const repoBinding = {
    repoKey: git.repoKey,
    worktreePath: git.worktreePath,
    branch: git.branch,
    headSha: git.headSha,
    workPackageId: workPackageId ?? null,
  };
  for (const [k, v] of Object.entries(repoBinding)) if (v === null) unresolved.push(`repoBinding.${k}`);

  let sessionBinding = { sessionId: null, parentSessionId: null, isSidechain: null, agentIdentity: null, modelIdentity: null };
  let sourceTimestamp = null;
  let headerStatus = 'NOT_APPLICABLE';

  if (sourceSystem === 'claude-code' && buffer) {
    const h = resolveClaudeTranscriptHeader(buffer);
    if (h.ok) {
      headerStatus = 'RESOLVED_FROM_SOURCE';
      sessionBinding = {
        sessionId: h.sessionId,
        parentSessionId: h.parentSessionId,
        isSidechain: h.isSidechain,
        agentIdentity: h.agentIdentity,
        modelIdentity: h.modelIdentity,
      };
      sourceTimestamp = h.sourceTimestamp;
      // The transcript's own gitBranch beats the filesystem's current branch:
      // it is what was true WHEN the event happened, not what is true now.
      if (h.gitBranch) repoBinding.branch = h.gitBranch;
      if (h.cwd) repoBinding.worktreePath = h.cwd;
    } else {
      headerStatus = `UNRESOLVED:${h.reason}`;
    }
  }

  if (sourceSystem === 'claude-code' && sessionBinding.sessionId === null) {
    // The filename of a Claude transcript IS a session uuid. Accepting it is a
    // read of the source's own naming, not an invention -- but only when it is
    // a real uuid, and it is recorded as derived.
    const base = path.basename(absPath, path.extname(absPath));
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(base)) {
      sessionBinding.sessionId = base;
      if (headerStatus === 'NOT_APPLICABLE') headerStatus = 'DERIVED_FROM_FILENAME_UUID';
      else headerStatus += '+DERIVED_FROM_FILENAME_UUID';
    }
  }

  for (const [k, v] of Object.entries(sessionBinding)) if (v === null) unresolved.push(`sessionBinding.${k}`);
  if (sourceTimestamp === null) unresolved.push('sourceTimestamp');

  const applicable = sourceSystem === 'claude-code'
    ? 10
    : 5; // non-transcript sources have no session dimension to resolve
  const completeness = unresolved.length === 0
    ? PROVENANCE_COMPLETENESS.COMPLETE
    : (unresolved.length >= applicable ? PROVENANCE_COMPLETENESS.LOWER_BOUND : PROVENANCE_COMPLETENESS.PARTIAL);

  return {
    machineId: MACHINE_ID,
    repoBinding,
    sessionBinding,
    sourceTimestamp,
    sourceObservation: {
      sourceRootId: sourceRootId ?? null,
      sourcePath: absPath,
      relativePath: relativePath ?? null,
    },
    completeness,
    unresolvedFields: unresolved.sort(),
    resolver: 'context-ledger/lib/provenance.mjs@v1',
    headerStatus,
  };
}
