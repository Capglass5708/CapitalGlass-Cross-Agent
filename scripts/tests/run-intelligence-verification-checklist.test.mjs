#!/usr/bin/env node
/**
 * Step 6 — independent verification checklist for operational intelligence envelope.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APPBUILDER_ROOT = path.resolve(REPO_ROOT, '..', 'CG-AppBuilder-MCP');

function mustExist(relativePath, root = REPO_ROOT) {
  const full = path.join(root, relativePath);
  assert.ok(fs.existsSync(full), `missing required path: ${relativePath}`);
  return full;
}

function testCrossAgentContractSurface() {
  mustExist('contracts/intelligence/OWNERSHIP.md');
  mustExist('contracts/intelligence/intelligence-handoff-v1.schema.json');
  mustExist('contracts/intelligence/operational-intelligence-envelope-v1.schema.json');
  mustExist('scripts/intelligence/ingest.mjs');
  mustExist('scripts/intelligence/lib/ingest-pipeline-v1.mjs');
  mustExist('scripts/intelligence/lib/first-real-mission-harness-v1.mjs');
  mustExist('scripts/intelligence/lib/hub-operational-intelligence-publish-v1.mjs');
  mustExist('scripts/intelligence/lib/supabase-intelligence-store-v1.mjs');
}

function testAppBuilderEmitOnlySurface() {
  mustExist('scripts/auto-protocol-v3/emit-intelligence-handoff.mjs', APPBUILDER_ROOT);
  const emitText = fs.readFileSync(
    path.join(APPBUILDER_ROOT, 'scripts/auto-protocol-v3/emit-intelligence-handoff.mjs'),
    'utf8',
  );
  assert.equal(/derivedObjects\s*:/.test(emitText), false);
  assert.match(emitText, /closeout-verify\.mjs/);
}

function testWaverunnerRegistryPromoted() {
  const registryPath = path.join(
    APPBUILDER_ROOT,
    'scripts/sdlc-protocol-cursor/waverunner-capability-registry-v1.json',
  );
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const cap = registry.capabilities.find((entry) => entry.id === 'INTELLIGENCE_HANDOFF');
  assert.ok(cap, 'INTELLIGENCE_HANDOFF missing from waverunner registry');
  assert.equal(cap.classification, 'IMPLEMENTED_AND_PROVEN');
  assert.equal(cap.delegatedPipelineOwner, 'CapitalGlass-Cross-Agent');
  assert.ok(Array.isArray(cap.tests) && cap.tests.length >= 2);
}

function testNpmScriptsWired() {
  const crossAgentPkg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
  assert.ok(crossAgentPkg.scripts['intelligence:ingest']);
  assert.ok(crossAgentPkg.scripts['test:intelligence-contracts']);
  assert.ok(crossAgentPkg.scripts['test:intelligence-ingest']);
  assert.ok(crossAgentPkg.scripts['test:intelligence-first-real-mission']);

  const appBuilderPkg = JSON.parse(fs.readFileSync(path.join(APPBUILDER_ROOT, 'package.json'), 'utf8'));
  assert.ok(appBuilderPkg.scripts['test:intelligence-handoff-emit']);
  assert.ok(appBuilderPkg.scripts['test:intelligence-handoff-ownership']);
}

function testPlanDocumentsSharedDevOnly() {
  const plan = fs.readFileSync(
    path.join(REPO_ROOT, 'work-progress/projects/operational-intelligence-envelope-v1.md'),
    'utf8',
  );
  assert.match(plan, /productionHubPublication\s*=\s*NOT_IN_SCOPE/);
  assert.match(plan, /COMPOUNDING_INTELLIGENCE_PIPELINE.*not.*registered/i);
}

const tests = [
  ['Cross-Agent contract + pipeline surface', testCrossAgentContractSurface],
  ['AppBuilder emit-only surface', testAppBuilderEmitOnlySurface],
  ['WaveRunner INTELLIGENCE_HANDOFF promoted', testWaverunnerRegistryPromoted],
  ['npm scripts wired', testNpmScriptsWired],
  ['plan documents shared-dev-only gate', testPlanDocumentsSharedDevOnly],
];

let passed = 0;
for (const [name, fn] of tests) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}
console.log(`\n${passed}/${tests.length} intelligence verification checklist tests passed`);
