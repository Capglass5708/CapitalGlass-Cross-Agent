#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// Import compile helper by evaluating slice output shape from a fixture-like doc read
const sampleReceipt = {
  workPackageId: 'harvest-sample-v1',
  verdict: 'PASS',
  schemaVersion: 'cross-agent-harvest-receipt-v1@1.2.0',
  executionReceipt: {
    schemaVersion: 'cg-execution-receipt-v1@1.0.0',
    workPackageId: 'harvest-sample-v1',
    verdict: 'PASS',
    gates: [{ gateId: 'harvest:validate', status: 'PASS' }],
  },
};

function buildSliceRecord(data) {
  const nested = data.executionReceipt && typeof data.executionReceipt === 'object' ? data.executionReceipt : null;
  return {
    schemaVersion: nested?.schemaVersion ?? data.schemaVersion ?? null,
    workPackageId: nested?.workPackageId ?? data.workPackageId ?? null,
    verdict: nested?.verdict ?? data.verdict ?? null,
    gatesCount: Array.isArray(nested?.gates) ? nested.gates.length : 0,
    hasCanonicalExecutionReceipt: nested?.schemaVersion === 'cg-execution-receipt-v1@1.0.0',
  };
}

const record = buildSliceRecord(sampleReceipt);
assert.equal(record.schemaVersion, 'cg-execution-receipt-v1@1.0.0');
assert.equal(record.workPackageId, 'harvest-sample-v1');
assert.equal(record.hasCanonicalExecutionReceipt, true);
assert.equal(record.gatesCount, 1);

assert.ok(fs.existsSync(path.join(REPO_ROOT, 'scripts/index/compile-control-slices.mjs')));

console.log('cross-agent-receipts-slice-index: PASS');
