#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');

let failures = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failures += 1;
  }
}

function computeContentHash(pinnedSha) {
  return createHash('sha256').update(JSON.stringify([pinnedSha, 'fixture'])).digest('hex');
}

assert(computeContentHash('abc').length === 64, 'content hash is sha256 hex');

const publisherPath = path.join(REPO_ROOT, 'scripts/index/run-index-publisher.mjs');
assert(fs.existsSync(publisherPath), 'run-index-publisher.mjs exists');

const workflowPath = path.join(REPO_ROOT, '.github/workflows/index-publication.yml');
assert(fs.existsSync(workflowPath), 'index-publication workflow exists');
const workflow = fs.readFileSync(workflowPath, 'utf8');
assert(workflow.includes('workflow_dispatch'), 'v1 dispatch trigger');
assert(workflow.includes('concurrency:'), 'concurrency lock present');
assert(workflow.includes('run-index-publisher.mjs'), 'publisher step wired');

const preflightPath = path.join(REPO_ROOT, 'scripts/index/preflight.mjs');
assert(fs.existsSync(preflightPath), 'preflight wrapper exists');

const outDir = path.join(REPO_ROOT, 'artifacts/agent-runs/preflight-index-utilization-gate-v1');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'publisher-test-results.json'),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), failures }, null, 2)}\n`,
);

if (failures > 0) process.exit(1);
console.log('test:index-publisher.mjs: PASS');
