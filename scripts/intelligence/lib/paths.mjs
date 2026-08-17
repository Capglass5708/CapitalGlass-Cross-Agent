import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = path.resolve(__dirname, '../../..');
export const CONTRACT_DIR = path.join(REPO_ROOT, 'contracts/intelligence');
export const DRY_RUN_ROOT = path.join(
  REPO_ROOT,
  'artifacts/agent-runs/operational-intelligence-envelope-v1/intelligence-dry-run',
);

export function resolveProducerRepoRoot(producerRepo = 'CG-AppBuilder-MCP') {
  if (process.env.CG_APPBUILDER_MCP_ROOT && fs.existsSync(process.env.CG_APPBUILDER_MCP_ROOT)) {
    return process.env.CG_APPBUILDER_MCP_ROOT;
  }
  const sibling = path.join(REPO_ROOT, '..', producerRepo);
  if (fs.existsSync(sibling)) return sibling;
  return null;
}

export function resolveCloseoutPath(handoff, options = {}) {
  const candidates = [];
  if (path.isAbsolute(handoff.closeoutRef)) candidates.push(handoff.closeoutRef);
  if (options.repoRoot) candidates.push(path.join(options.repoRoot, handoff.closeoutRef));
  if (handoff.source?.closeoutPath) {
    if (path.isAbsolute(handoff.source.closeoutPath)) candidates.push(handoff.source.closeoutPath);
    if (options.repoRoot) candidates.push(path.join(options.repoRoot, handoff.source.closeoutPath));
  }
  const producerRoot = resolveProducerRepoRoot(handoff.source?.repo);
  if (producerRoot) {
    candidates.push(path.join(producerRoot, handoff.closeoutRef));
    if (handoff.source?.closeoutPath) candidates.push(path.join(producerRoot, handoff.source.closeoutPath));
  }
  candidates.push(path.join(REPO_ROOT, handoff.closeoutRef));
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export function dryRunLedgerDir(ledgerId, outputRoot = DRY_RUN_ROOT) {
  return path.join(outputRoot, 'by-ledger', ledgerId);
}
