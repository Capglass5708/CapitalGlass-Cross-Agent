#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { attachExecutionReceipt } from '../harvest/lib/execution-receipt-adapter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

async function testAttachExecutionReceipt() {
  const artifact = {
    schemaVersion: 'cross-agent-harvest-receipt-v1@1.2.0',
    workPackageId: 'harvest-sample-v1',
    verdict: 'PASS',
    overallHarvestVerdict: 'PASS',
    missionClass: 'closeout',
  };
  const result = await attachExecutionReceipt(artifact, { gatesRun: ['harvest:test'] });
  assert.equal(result.ok, true);
  assert.equal(result.artifact.executionReceipt.schemaVersion, 'cg-execution-receipt-v1@1.0.0');
  assert.equal(result.artifact.executionReceipt.gates.length, 1);
}

await testAttachExecutionReceipt();
console.log('cross-agent-execution-receipt-adapter: PASS');
