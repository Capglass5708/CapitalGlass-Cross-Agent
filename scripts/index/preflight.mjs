#!/usr/bin/env node
/**
 * Thin wrapper — delegates to CG-AppBuilder-MCP canonical index preflight.
 */
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveAppBuilderRoot } from './lib/resolve-repo-roots.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP_BUILDER_ROOT = resolveAppBuilderRoot(REPO_ROOT);

const forwarded = process.argv.slice(2);
if (!forwarded.includes('--json')) forwarded.push('--json');

const cmd = `node scripts/intelligence-hub/index-freshness/agent-index-preflight.mjs ${forwarded
  .map((a) => (a.includes(' ') ? `"${a}"` : a))
  .join(' ')}`;

execSync(cmd, {
  cwd: APP_BUILDER_ROOT,
  stdio: 'inherit',
  env: {
    ...process.env,
    CAPITALGLASS_CROSS_AGENT_ROOT: REPO_ROOT,
  },
});
