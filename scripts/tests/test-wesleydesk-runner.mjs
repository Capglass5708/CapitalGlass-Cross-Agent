#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

let failures = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    failures += 1;
  }
}

const installScript = path.join(
  REPO_ROOT,
  'scripts/runner/install-wesleydesk-github-runner-wsl-service.sh',
);
assert(fs.existsSync(installScript), 'install script exists');
const installBody = fs.readFileSync(installScript, 'utf8');
assert(installBody.includes('WESLEYDESK'), 'install script gates WESLEYDESK host');
assert(installBody.includes('2.336.0'), 'install script default runner version is 2.336.0');
assert(fs.existsSync(path.join(REPO_ROOT, 'scripts/runner/configure-wesleydesk-wsl-network.sh')), 'WSL network configure script exists');

const profilePath = path.join(REPO_ROOT, 'scripts/runner/wesleydesk.machine.json');
assert(fs.existsSync(profilePath), 'wesleydesk machine profile exists');
const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
assert(
  (profile.requiredRunnerLabels ?? []).join(',') === 'self-hosted,wesleydesk,wsl2',
  'machine profile labels match workflow',
);

const preflightPath = path.join(REPO_ROOT, 'scripts/runner/wesleydesk-index-publication-preflight.mjs');
assert(fs.existsSync(preflightPath), 'preflight script exists');

const publicationWorkflow = fs.readFileSync(
  path.join(REPO_ROOT, '.github/workflows/index-publication.yml'),
  'utf8',
);
assert(
  publicationWorkflow.includes('runs-on: [self-hosted, wesleydesk, wsl2]'),
  'index-publication workflow requires wesleydesk runner',
);

const smokeWorkflowPath = path.join(REPO_ROOT, '.github/workflows/runner-smoke.yml');
assert(fs.existsSync(smokeWorkflowPath), 'runner-smoke workflow exists');
const smokeWorkflow = fs.readFileSync(smokeWorkflowPath, 'utf8');
assert(smokeWorkflow.includes('wesleydesk-index-publication-preflight.mjs'), 'smoke runs preflight');

const runbook = path.join(REPO_ROOT, 'docs/runbooks/wesleydesk-index-publication-runner.md');
assert(fs.existsSync(runbook), 'operator runbook exists');

if (failures > 0) process.exit(1);
console.log('test:wesleydesk-runner.mjs: PASS');
