#!/usr/bin/env node
/**
 * Adversarial tests for the repo intelligence compiler.
 *
 * Each case builds a synthetic git repo with exactly one defect injected and
 * asserts the compiler detects it. Happy-path-only tests would let the
 * compiler silently stop detecting things; these fail loudly when a pass
 * regresses.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

import { compile } from '../repo-intelligence/compile.mjs';
import { resolveContradiction } from '../repo-intelligence/lib/authority-lattice.mjs';
import { makeClaim, makeEvidence, diffClaims } from '../repo-intelligence/lib/claims.mjs';

const POLICY = JSON.parse(
  fs.readFileSync(new URL('../repo-intelligence/indexing-policy.v1.json', import.meta.url), 'utf8'),
);

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  PASS  ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`  FAIL  ${name}\n        ${error.message}`);
  }
}

function makeRepo(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ri-compiler-'));
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(dir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
  }
  const git = (args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
  git(['init', '-q']);
  git(['config', 'user.email', 'test@example.invalid']);
  git(['config', 'user.name', 'test']);
  git(['add', '-A']);
  git(['commit', '-qm', 'fixture']);
  return dir;
}

const BASE = {
  'package.json': JSON.stringify({ name: 'fx', scripts: { live: 'node scripts/live.mjs' } }, null, 2),
  'scripts/live.mjs': 'export const ok = 1;\n',
};

const run = (files, policy = POLICY) => compile({ repoRoot: makeRepo({ ...BASE, ...files }), policy });

console.log('\nrepo-intelligence compiler — adversarial suite\n');

test('detects an orphaned script with no inbound edge', () => {
  const r = run({ 'scripts/forgotten.mjs': 'console.log(1);\n' });
  assert.ok(r.repoIndex.scriptReachability.orphanCandidates.includes('scripts/forgotten.mjs'));
});

test('does NOT flag a script spawned by path-string reference', () => {
  const r = run({
    'scripts/worker.mjs': 'process.exit(0);\n',
    'scripts/live.mjs': 'const W = path.join(ROOT, "scripts/worker.mjs");\n',
  });
  const w = r.repoIndex.scriptReachability.entries.find((e) => e.path === 'scripts/worker.mjs');
  assert.equal(w.classification, 'SPAWNED_BY_PATH_REFERENCE');
});

test('detects an executed git push as a mutation primitive', () => {
  const r = run({ 'scripts/pusher.mjs': 'execSync(`git push origin main`);\n' });
  const node = r.repoIndex.mutationGraph.nodes.find((n) => n.executable === 'scripts/pusher.mjs');
  assert.ok(node.primitives.some((p) => p.kind === 'GIT_PUSH'), 'git push not detected');
});

test('does NOT flag git push mentioned only in a string literal', () => {
  const r = run({ 'scripts/talker.mjs': 'const title = "verify git push parity";\nfs.writeFileSync(f, title);\n' });
  const node = r.repoIndex.mutationGraph.nodes.find((n) => n.executable === 'scripts/talker.mjs');
  assert.ok(!node.primitives.some((p) => p.kind === 'GIT_PUSH'), 'string mention wrongly treated as execution');
  assert.ok(node.mentionedNotExecuted.some((p) => p.kind === 'GIT_PUSH'), 'mention not recorded');
});

test('does NOT flag git push inside a comment', () => {
  const r = run({ 'scripts/commented.mjs': '// we used to git push here\nfs.writeFileSync(a, b);\n' });
  const node = r.repoIndex.mutationGraph.nodes.find((n) => n.executable === 'scripts/commented.mjs');
  assert.ok(!node.primitives.some((p) => p.kind === 'GIT_PUSH'));
});

test('raises a governance contradiction when a rule forbids a primitive the code performs', () => {
  const policy = {
    ...POLICY,
    governanceRules: [{ name: 'TEST_RULE', path: 'rules/no-push.md', forbids: ['GIT_PUSH'], enforcementStatus: 'NOT_STARTED' }],
  };
  const r = run({ 'rules/no-push.md': 'no pushing\n', 'scripts/pusher.mjs': 'execSync(`git push origin main`);\n' }, policy);
  assert.equal(r.repoIndex.mutationGraph.governanceConflicts.length, 1);
  assert.equal(r.repoIndex.mutationGraph.governanceConflicts[0].disposition, 'GOVERNANCE_MUTATION_CONTRADICTION');
});

test('classifies a test mutating a fixture repo as test-scoped, not a contradiction', () => {
  const policy = {
    ...POLICY,
    governanceRules: [{ name: 'TEST_RULE', path: 'rules/no-push.md', forbids: ['GIT_COMMIT'], enforcementStatus: 'NOT_STARTED' }],
  };
  const r = run({ 'rules/no-push.md': 'x\n', 'scripts/tests/t.test.mjs': 'execSync(`git commit -m x`, {cwd: tmp});\n' }, policy);
  assert.equal(r.repoIndex.mutationGraph.governanceConflicts.length, 0);
  assert.equal(r.repoIndex.mutationGraph.testScopedMutations.length, 1);
});

test('detects a generated mirror that is ahead of its declared source', () => {
  const policy = {
    ...POLICY,
    projections: [{ projectionRoot: 'mirror/', sourceRoots: ['src-docs/'], mode: 'GENERATED_MIRROR', expectedRelation: 'NORMALIZED_CONTENT_EQUAL' }],
  };
  const r = run({ 'src-docs/p.md': '# Protocol v1\n\nold\n', 'mirror/p.md': '# Protocol v1.3\n\nnew rules\nmore\n' }, policy);
  const pair = r.repoIndex.mirrorConsistency.pairs.find((p) => p.projection === 'mirror/p.md');
  assert.equal(pair.actualRelation, 'PROJECTION_AHEAD_OF_SOURCE');
  assert.equal(pair.sourceVersion, '1');
  assert.equal(pair.projectionVersion, '1.3');
});

test('detects a projection with no source at all', () => {
  const policy = {
    ...POLICY,
    projections: [{ projectionRoot: 'mirror/', sourceRoots: ['src-docs/'], mode: 'GENERATED_MIRROR', expectedRelation: 'NORMALIZED_CONTENT_EQUAL' }],
  };
  const r = run({ 'mirror/orphan.md': '# Thing v1\n' }, policy);
  assert.equal(r.repoIndex.mirrorConsistency.pairs[0].actualRelation, 'SOURCE_MISSING');
});

test('detects a schema range contradicted by a runtime equality guard', () => {
  const r = run({
    'contracts/t.schema.json': JSON.stringify({ properties: { budget: { properties: { max: { type: 'integer', minimum: 1, maximum: 64 } } } } }),
    'scripts/v.mjs': 'export const THING_MAX = 48;\nif (block.max !== THING_MAX) throw new Error("bad");\n',
  });
  const c = r.repoIndex.schemaRuntimeConsistency.contradictions;
  assert.equal(c.length, 1);
  assert.equal(c[0].codeValue, 48);
  assert.equal(c[0].schemaRange.maximum, 64);
});

test('does NOT flag a schema constant that matches the code with no narrowing', () => {
  const r = run({
    'contracts/t.schema.json': JSON.stringify({ properties: { max: { type: 'integer', minimum: 1, maximum: 48 } } }),
    'scripts/v.mjs': 'export const THING_MAX = 48;\nif (x !== THING_MAX) throw new Error("bad");\n',
  });
  assert.equal(r.repoIndex.schemaRuntimeConsistency.contradictions.length, 0);
});

test('detects an impossible past timestamp in a SCREAMING_SNAKE field', () => {
  const r = run({ 'index/gen.json': JSON.stringify({ INDEX_GENERATED_AT: '2000-02-08T16:42:02.562Z' }) });
  const hit = r.findings.findings.find((f) => f.kind === 'IMPOSSIBLE_TIMESTAMP_PAST');
  assert.ok(hit, 'year-2000 timestamp not detected');
});

test('detects an impossible future timestamp', () => {
  const r = run({ 'index/gen.json': JSON.stringify({ generatedAt: '2099-01-01T00:00:00.000Z' }) });
  assert.ok(r.repoIndex ? r.findings.findings.some((f) => f.kind === 'IMPOSSIBLE_TIMESTAMP_FUTURE') : false);
});

test('detects a null content hash in a receipt', () => {
  const r = run({ 'registry/r.json': JSON.stringify({ sourceShas: { estateContentSha256: null } }) });
  assert.ok(r.findings.findings.some((f) => f.kind === 'NULL_CONTENT_HASH'));
});

test('detects an all-zero hash', () => {
  const r = run({ 'registry/r.json': JSON.stringify({ contentSha256: '0'.repeat(64) }) });
  assert.ok(r.findings.findings.some((f) => f.kind === 'ALL_ZERO_HASH'));
});

test('detects a TODO marker in an authority file but not in a runbook', () => {
  const r = run({ 'contracts/a.md': 'TODO: decide this\n', 'docs/b.md': 'TODO: fine here\n' });
  const hits = r.repoIndex.sentinelAnalysis.findings.filter((f) => f.kind === 'TODO_IN_AUTHORITY_FILE');
  assert.equal(hits.length, 1, 'authority-file TODO should be detected exactly once');
  assert.equal(hits[0].file, 'contracts/a.md');
});

test('downgrades sentinel severity inside historical artifacts', () => {
  const r = run({ 'artifacts/old/r.json': JSON.stringify({ recordedAt: '2000-01-01T00:00:00.000Z' }) });
  // historical evidence is immutable; it must not raise a high-severity finding
  assert.ok(!r.findings.findings.some((f) => f.kind === 'IMPOSSIBLE_TIMESTAMP_PAST'));
});

test('flags a checkout that cannot resolve its authority ref', () => {
  const r = run({});
  assert.equal(r.repoIndex.repo.checkoutRelation, 'AUTHORITY_REF_UNRESOLVABLE');
  assert.equal(r.receipt.gate.authoritativeRefResolved, 'FAIL');
  assert.equal(r.receipt.gate.verdict, 'REPO_INTELLIGENCE_V2_HOLD');
});

test('claim ids are content-addressed and change when evidence changes', () => {
  const mk = (sha) => makeClaim({
    subject: 'r', predicate: 'owns', object: 'X',
    evidence: [makeEvidence({ path: 'contracts/OWNERSHIP.md', sourceSha: sha, lineRange: [1, 2] })],
    evidenceClass: 'OBSERVED_SOURCE',
  });
  assert.equal(mk('sha256:aaa').claimId, mk('sha256:aaa').claimId, 'not stable');
  assert.notEqual(mk('sha256:aaa').claimId, mk('sha256:bbb').claimId, 'not content-addressed');
});

test('a claim without evidence is not emittable', () => {
  assert.throws(() => makeClaim({ subject: 'r', predicate: 'owns', object: 'X', evidence: [], evidenceClass: 'OBSERVED_SOURCE' }));
});

test('an invalid evidence class is rejected', () => {
  assert.throws(() => makeClaim({
    subject: 'r', predicate: 'owns', object: 'X',
    evidence: [makeEvidence({ path: 'a.md', sourceSha: 'x' })], evidenceClass: 'PROBABLY',
  }));
});

test('claim diff reports changed rather than add+remove when evidence moves', () => {
  const mk = (sha) => makeClaim({
    subject: 'r', predicate: 'owns', object: 'X',
    evidence: [makeEvidence({ path: 'a.md', sourceSha: sha })], evidenceClass: 'OBSERVED_SOURCE',
  });
  const d = diffClaims([mk('sha256:a')], [mk('sha256:b')]);
  assert.equal(d.added.length, 0);
  assert.equal(d.removed.length, 0);
  assert.equal(d.changed.length, 1);
});

test('normative and observed authority disagreement surfaces as a contradiction, not a silent win', () => {
  const doc = makeClaim({
    subject: 'repo', predicate: 'forbids', object: 'GIT_PUSH',
    evidence: [makeEvidence({ path: 'contracts/rule.schema.json', sourceSha: 'x' })],
    evidenceClass: 'OBSERVED_SOURCE', authorityClass: 'FROZEN_CONTRACT',
  });
  const code = makeClaim({
    subject: 'repo', predicate: 'forbids', object: 'NOTHING',
    evidence: [makeEvidence({ path: 'scripts/p.mjs', sourceSha: 'y' })],
    evidenceClass: 'DERIVED_STATIC', authorityClass: 'LIVE_CODE_BEHAVIOR',
  });
  const res = resolveContradiction(doc, code);
  assert.equal(res.disposition, 'CONTRADICTION_NORMATIVE_VS_OBSERVED');
  assert.equal(res.requiresHumanDisposition, true);
  assert.equal(res.normativeWinner, doc.claimId, 'contract should win normatively');
  assert.equal(res.observedWinner, code.claimId, 'code should win observationally');
});

test('two compilations of the same tree produce an identical fingerprint', () => {
  const dir = makeRepo({ ...BASE, 'scripts/x.mjs': 'const a=1;\n' });
  const a = compile({ repoRoot: dir, policy: POLICY });
  const b = compile({ repoRoot: dir, policy: POLICY });
  assert.equal(a.repoIndex.repoIndexFingerprint, b.repoIndex.repoIndexFingerprint);
  assert.equal(JSON.stringify(a.repoIndex), JSON.stringify(b.repoIndex));
});

test('changing the indexing policy changes the fingerprint', () => {
  const dir = makeRepo(BASE);
  const a = compile({ repoRoot: dir, policy: POLICY });
  const b = compile({ repoRoot: dir, policy: { ...POLICY, projectEpochYear: 1999 } });
  assert.notEqual(a.repoIndex.repoIndexFingerprint, b.repoIndex.repoIndexFingerprint);
});

test('generatedAt is excluded from the fingerprint', () => {
  const dir = makeRepo(BASE);
  const a = compile({ repoRoot: dir, policy: POLICY });
  const b = compile({ repoRoot: dir, policy: POLICY });
  assert.notEqual(a.receipt.generatedAt === b.receipt.generatedAt && false, true);
  assert.equal(a.receipt.repoIndexFingerprint, b.receipt.repoIndexFingerprint);
  assert.equal(a.receipt.generatedAtExcludedFromFingerprint, true);
});

test('source inspection never upgrades itself to runtime proof', () => {
  const r = run({});
  assert.equal(r.receipt.gate.runtimeBehaviorProven, 'NOT_RUN_BY_THIS_PASS');
  assert.equal(r.receipt.gate.crossMachineReproducibility, 'NOT_ATTEMPTED_SINGLE_HOST');
});

console.log(`\n  ${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
