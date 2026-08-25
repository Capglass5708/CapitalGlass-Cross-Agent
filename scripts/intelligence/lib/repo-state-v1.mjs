import { execFileSync } from 'node:child_process';
import { REPO_ROOT } from './paths.mjs';

let cachedIndexedSha;

/**
 * The commit SHA of this repo's own pipeline/index code at build time — the
 * "indexedSha" freshness field (proposal 3). Distinct from the handoff's
 * source.commitSha, which is the producer repo's commit the evidence came
 * from. Returns null (never throws) if git is unavailable, so envelope
 * building stays robust outside a git checkout.
 */
export function getCrossAgentIndexedSha() {
  if (cachedIndexedSha !== undefined) return cachedIndexedSha;
  try {
    cachedIndexedSha = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    cachedIndexedSha = null;
  }
  return cachedIndexedSha;
}
