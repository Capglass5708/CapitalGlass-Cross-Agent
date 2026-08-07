import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

export function resolveGovernanceRoot(env = process.env) {
  const candidates = [
    env.CG_PLATFORM_GOVERNANCE_ROOT,
    path.resolve(REPO_ROOT, '..', 'CG-Platform-Governance-MCP'),
  ].filter(Boolean);
  for (const root of candidates) {
    if (existsSync(path.join(root, 'scripts/suite-governance/execution-receipt/lib/normalize.mjs'))) {
      return root;
    }
  }
  throw new Error('CG-Platform-Governance-MCP not found for execution-receipt adapter');
}

export async function loadExecutionReceiptLib(env = process.env) {
  const root = resolveGovernanceRoot(env);
  const base = path.join(root, 'scripts/suite-governance/execution-receipt/lib');
  const normalize = await import(path.join(base, 'normalize.mjs'));
  const validate = await import(path.join(base, 'validate.mjs'));
  const constants = await import(path.join(base, 'constants.mjs'));
  return { root, ...normalize, ...validate, ...constants };
}

/**
 * Attach canonical executionReceipt envelope to harvest/coordination artifacts.
 * @param {Record<string, unknown>} artifact
 * @param {object} [options]
 */
export async function attachExecutionReceipt(artifact, options = {}) {
  const lib = await loadExecutionReceiptLib();
  const adapted = lib.normalizeExecutionReceipt({
    ...artifact,
    workPackageId: artifact.workPackageId ?? artifact.harvestId ?? options.workPackageId,
    verdict: artifact.verdict ?? artifact.overallHarvestVerdict ?? options.verdict,
    gatesRun: options.gatesRun,
  });
  if (!adapted.ok) {
    return { ok: false, code: adapted.code, artifact };
  }
  const validated = lib.validateExecutionReceipt(adapted.normalized);
  if (!validated.valid) {
    return { ok: false, code: validated.errors.join(','), artifact };
  }
  return {
    ok: true,
    artifact: {
      ...artifact,
      executionReceipt: lib.serializeExecutionReceipt(validated.normalized),
    },
  };
}
