#!/usr/bin/env node
/**
 * Thin wrapper — delegates to CG-AppBuilder-MCP's canonical agent-index-preflight
 * (Z AI-cache -> L Hub -> Supabase -> Git ledger failover). The prior delegation
 * path (scripts/cross-agent-index/run-index-preflight.mjs) no longer exists in
 * CG-AppBuilder-MCP; this now uses the same npm alias documented in AGENTS.md.
 */
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveAppBuilderRoot } from './lib/resolve-repo-roots.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP_BUILDER_ROOT = resolveAppBuilderRoot(REPO_ROOT);

const forwarded = process.argv.slice(2);
if (!forwarded.includes('--json')) forwarded.push('--json');

const cmd = `npm run agent:index:preflight -- ${forwarded
  .map((a) => (a.includes(' ') ? `"${a}"` : a))
  .join(' ')}`;

try {
  execSync(cmd, {
    cwd: APP_BUILDER_ROOT,
    stdio: 'inherit',
    env: {
      ...process.env,
      CAPITALGLASS_CROSS_AGENT_ROOT: REPO_ROOT,
    },
  });
} catch (err) {
  process.exit(err.status ?? 1);
}
