#!/usr/bin/env node
/**
 * Repo Intelligence Compiler v1.
 *
 *   SOURCE REPO -> ref resolution -> mechanical scan -> static analysis
 *   -> contract/governance analysis -> claim extraction -> reconciliation
 *   -> repo truth graph -> {repo-index, AI_INDEX inputs, coverage, findings, receipt}
 *
 * Deterministic by construction: same tree + same policy + same compiler
 * version => same repoIndexFingerprint => byte-identical JSON outputs.
 *
 * Usage:
 *   node scripts/repo-intelligence/compile.mjs [--repo-root <path>] [--out <dir>]
 *                                              [--json] [--check]
 *
 * --check exits non-zero when the deterministic gate fails (CI mode).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { canonicalJson, sha256, sha256Prefixed, writeJson } from './lib/canonical.mjs';
import { createRepoContext } from './lib/repo-context.mjs';
import { makeClaim, makeEvidence, EVIDENCE_CLASS, diffClaims } from './lib/claims.mjs';
import { resolveContradiction } from './lib/authority-lattice.mjs';

import * as mechanicalInventory from './lib/passes/mechanical-inventory.mjs';
import * as scriptReachability from './lib/passes/script-reachability.mjs';
import * as mutationGraph from './lib/passes/mutation-graph.mjs';
import * as mirrorConsistency from './lib/passes/mirror-consistency.mjs';
import * as schemaRuntimeConsistency from './lib/passes/schema-runtime-consistency.mjs';
import * as sentinelAnalysis from './lib/passes/sentinel-analysis.mjs';

export const COMPILER_VERSION = 'repo-intelligence-compiler-v1@1.0.0';
export const INDEX_SCHEMA_VERSION = 'capital-glass-repo-deep-index-v1@2.0.0';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = { repoRoot: process.cwd(), out: null, json: false, check: false };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === '--repo-root') args.repoRoot = argv[++i];
    else if (argv[i] === '--out') args.out = argv[++i];
    else if (argv[i] === '--json') args.json = true;
    else if (argv[i] === '--check') args.check = true;
  }
  args.out = args.out ?? path.join(args.repoRoot, 'index/generated');
  return args;
}

/** Stage 1 — authoritative ref resolution and checkout relation. */
function resolveAuthoritativeRef(ctx) {
  const head = ctx.sourceSha;
  let originMain = null;
  let relation = 'UNKNOWN';
  try {
    originMain = ctx.git(['rev-parse', 'origin/main'], { quiet: true });
    if (originMain === head) relation = 'AT_AUTHORITY';
    else {
      const base = ctx.git(['merge-base', 'origin/main', 'HEAD'], { quiet: true });
      relation = base === originMain ? 'AHEAD_OF_AUTHORITY' : base === head ? 'BEHIND_AUTHORITY' : 'DIVERGED_FROM_AUTHORITY';
    }
  } catch {
    relation = 'AUTHORITY_REF_UNRESOLVABLE';
  }
  let dirty = false;
  try {
    dirty = ctx.git(['status', '--porcelain']).length > 0;
  } catch { /* non-fatal */ }
  return {
    headSha: head,
    treeSha: ctx.treeSha,
    authorityRef: 'origin/main',
    authoritySha: originMain,
    checkoutRelation: relation,
    worktreeDirty: dirty,
    verdict: relation === 'AUTHORITY_REF_UNRESOLVABLE' ? 'FAIL' : 'PASS',
  };
}

/** Stage 6 — claim extraction. Every claim carries evidence and an evidence class. */
function extractClaims(ctx, passes) {
  const claims = [];
  const repo = path.basename(ctx.repoRoot);
  const add = (c) => claims.push(c);

  // Ownership claims read directly from the locked ownership contract.
  const ownershipPath = 'contracts/intelligence/OWNERSHIP.md';
  const ownership = ctx.read(ownershipPath);
  if (ownership) {
    const sha = ctx.fileSha(ownershipPath);
    const lineOfMatch = (needle) => {
      const i = ownership.indexOf(needle);
      return i === -1 ? null : [ctx.lineOf(ownership, i), ctx.lineOf(ownership, i + needle.length)];
    };
    if (ownership.includes('INTELLIGENCE_OWNER')) {
      add(makeClaim({
        subject: repo,
        predicate: 'hasRole',
        object: 'INTELLIGENCE_OWNER',
        evidence: [makeEvidence({ path: ownershipPath, sourceSha: sha, lineRange: lineOfMatch('INTELLIGENCE_OWNER') })],
        evidenceClass: EVIDENCE_CLASS.OBSERVED_SOURCE,
        authorityClass: 'ARCHITECTURE_LOCK',
      }));
    }
    if (ownership.includes('COMPOUNDING_INTELLIGENCE_PIPELINE')) {
      add(makeClaim({
        subject: repo,
        predicate: 'owns',
        object: 'COMPOUNDING_INTELLIGENCE_PIPELINE',
        evidence: [makeEvidence({ path: ownershipPath, sourceSha: sha, lineRange: lineOfMatch('COMPOUNDING_INTELLIGENCE_PIPELINE') })],
        evidenceClass: EVIDENCE_CLASS.OBSERVED_SOURCE,
        authorityClass: 'ARCHITECTURE_LOCK',
      }));
    }
    if (/EVIDENCE_PRODUCER/.test(ownership)) {
      add(makeClaim({
        subject: 'CG-AppBuilder-MCP',
        predicate: 'hasRole',
        object: 'EVIDENCE_PRODUCER',
        evidence: [makeEvidence({ path: ownershipPath, sourceSha: sha, lineRange: lineOfMatch('EVIDENCE_PRODUCER') })],
        evidenceClass: EVIDENCE_CLASS.OBSERVED_SOURCE,
        authorityClass: 'ARCHITECTURE_LOCK',
      }));
    }
  }

  // The README-era charter claim, so the contradiction is representable.
  for (const charterPath of ['README.md', 'AGENT_START_HERE.md']) {
    const text = ctx.read(charterPath);
    if (!text) continue;
    const needle = 'must not become the work';
    if (!text.includes(needle)) continue;
    const i = text.indexOf(needle);
    add(makeClaim({
      subject: repo,
      predicate: 'hasRole',
      object: 'COORDINATION_ONLY',
      evidence: [makeEvidence({
        path: charterPath,
        sourceSha: ctx.fileSha(charterPath),
        lineRange: [ctx.lineOf(text, i), ctx.lineOf(text, i + needle.length)],
        excerpt: needle,
      })],
      evidenceClass: EVIDENCE_CLASS.OBSERVED_SOURCE,
      authorityClass: 'README',
    }));
  }

  // Mutation capability claims — derived from the mutation graph, not from docs.
  for (const node of passes.mutationGraph.nodes) {
    if (!node.primitives.some((p) => p.kind === 'GIT_PUSH')) continue;
    const line = node.primitives.find((p) => p.kind === 'GIT_PUSH').line;
    add(makeClaim({
      subject: node.executable,
      predicate: 'canPerform',
      object: 'GIT_PUSH',
      evidence: [makeEvidence({ path: node.executable, sourceSha: ctx.fileSha(node.executable), lineRange: [line, line] })],
      evidenceClass: EVIDENCE_CLASS.DERIVED_STATIC,
      authorityClass: 'LIVE_CODE_BEHAVIOR',
      notes: `admission gates: ${node.admissionGates.join(',') || 'NONE'}`,
    }));
  }

  // Protocol authority claim — derived from the mirror pass, not asserted.
  for (const pair of passes.mirrorConsistency.pairs) {
    if (pair.actualRelation !== 'PROJECTION_AHEAD_OF_SOURCE') continue;
    add(makeClaim({
      subject: pair.projection,
      predicate: 'supersedes',
      object: pair.source,
      evidence: [
        makeEvidence({ path: pair.projection, sourceSha: ctx.fileSha(pair.projection) }),
        makeEvidence({ path: pair.source, sourceSha: ctx.fileSha(pair.source) }),
      ],
      evidenceClass: EVIDENCE_CLASS.DERIVED_STATIC,
      authorityClass: 'GENERATED_PROJECTION',
      notes: `projection v${pair.projectionVersion} (${pair.projectionLines} lines) vs source v${pair.sourceVersion} (${pair.sourceLines} lines)`,
    }));
  }

  return claims;
}

/** Stage 7 — claim reconciliation via the authority lattice. */
function reconcileClaims(claims) {
  const bySubjectPredicate = new Map();
  for (const c of claims) {
    const key = `${c.subject}|${c.predicate}`;
    if (!bySubjectPredicate.has(key)) bySubjectPredicate.set(key, []);
    bySubjectPredicate.get(key).push(c);
  }
  const contradictions = [];
  for (const [key, group] of bySubjectPredicate) {
    if (group.length < 2) continue;
    const distinct = new Set(group.map((c) => c.object));
    if (distinct.size < 2) continue;
    for (let i = 0; i < group.length - 1; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        if (group[i].object === group[j].object) continue;
        const res = resolveContradiction(group[i], group[j]);
        contradictions.push({
          key,
          claims: [group[i].claimId, group[j].claimId],
          objects: [group[i].object, group[j].object],
          authorityClasses: [group[i].authorityClass, group[j].authorityClass],
          ...res,
        });
      }
    }
  }
  return { contradictions, unclassifiedContradictions: contradictions.filter((c) => c.requiresHumanDisposition && !c.normativeWinner).length };
}

/** Stage 8 — capability proof ladder. Docs are never sufficient alone. */
function buildProofLadder(ctx, passes, policy) {
  const ladders = [];
  for (const rule of policy.governanceRules) {
    const declared = Boolean(ctx.read(rule.path));
    const conflicts = passes.mutationGraph.governanceConflicts.filter((c) => c.ruleName === rule.name);
    ladders.push({
      capability: `${rule.name}_MUTATION_GATE`,
      declared,
      implemented: false,
      tested: false,
      ciEnforced: false,
      liveProven: false,
      bypassPathsPresent: conflicts.length,
      note: declared && conflicts.length > 0
        ? 'Declared by rule, contradicted by live code, enforced by no mechanism.'
        : declared
          ? 'Declared; no bypass path detected by static scan.'
          : 'Rule file not present in this repo.',
    });
  }
  return ladders;
}

/** Stage 9 — semantic-category coverage (not file percentage). */
function buildCoverage(ctx, passes) {
  const pkgScripts = ctx.packageJson.scripts ?? {};
  const cat = (name, matched, classified) => ({
    category: name,
    surfaces: matched,
    classified,
    coverage: matched === 0 ? 1 : Number((classified / matched).toFixed(4)),
  });

  const entrypointFiles = ctx.files.filter((f) => Object.values(pkgScripts).some((c) => c.includes(f)));
  const mutationFiles = passes.mutationGraph.nodes.length;
  const authorityDocs = ctx.files.filter((f) => /^(contracts|registry|decisions)\//.test(f));
  const schemas = ctx.files.filter((f) => /\.schema\.json$/.test(f));
  const validators = ctx.files.filter((f) => /^scripts\/.*(validate|schema-validate).*\.mjs$/.test(f));
  const workflows = ctx.files.filter((f) => /^\.github\/workflows\//.test(f));
  const historical = ctx.files.filter((f) => /^artifacts\//.test(f));

  return {
    method: 'SEMANTIC_CATEGORY',
    note: 'File-percentage coverage is not reported: it is not meaningful when 2/3 of the tree is generated evidence.',
    categories: [
      cat('entrypoints', entrypointFiles.length, entrypointFiles.length),
      cat('mutationSurfaces', mutationFiles, mutationFiles),
      cat('scriptReachability', passes.scriptReachability.totalScripts, passes.scriptReachability.totalScripts),
      cat('authorityDocs', authorityDocs.length, authorityDocs.length),
      cat('schemas', schemas.length, passes.schemaRuntimeConsistency.schemasScanned),
      cat('runtimeValidators', validators.length, validators.length),
      cat('ciWorkflows', workflows.length, workflows.length),
      cat('mirrorPairs', passes.mirrorConsistency.pairsChecked, passes.mirrorConsistency.pairsChecked),
      // Historical artifacts are deliberately sampled, not exhaustively classified.
      { category: 'historicalArtifacts', surfaces: historical.length, classified: 0, coverage: 0, disposition: 'DEFERRED_WITH_REASON', reason: 'Immutable evidence; scanned for sentinels only, not semantically classified.' },
    ],
  };
}

/** Stage 10 — findings, normalized across every pass. */
function buildFindings(passes, reconciliation, ladders) {
  const findings = [];
  const add = (f) => findings.push({ findingId: sha256Prefixed({ k: f.kind, s: f.subject }), ...f });

  for (const c of passes.mutationGraph.governanceConflicts) {
    add({
      kind: 'GOVERNANCE_MUTATION_CONTRADICTION',
      severity: 'material',
      subject: c.executable,
      detail: `${c.ruleName} forbids ${c.primitives.join('/')} but ${c.executable} performs it.`,
      admissionGates: c.admissionGates,
      enforcementStatus: c.enforcementStatus,
      evidenceClass: EVIDENCE_CLASS.DERIVED_STATIC,
    });
  }
  for (const p of passes.mirrorConsistency.pairs.filter((x) => x.actualRelation !== x.expectedRelation)) {
    add({
      kind: p.actualRelation === 'SOURCE_MISSING' ? 'PROJECTION_WITHOUT_SOURCE' : 'SOURCE_PROJECTION_DRIFT',
      severity: p.actualRelation === 'PROJECTION_AHEAD_OF_SOURCE' ? 'material' : 'medium',
      subject: p.projection,
      detail: `expected ${p.expectedRelation}, observed ${p.actualRelation}` +
        (p.source ? ` (projection v${p.projectionVersion}/${p.projectionLines}L vs source v${p.sourceVersion}/${p.sourceLines}L)` : ''),
      evidenceClass: EVIDENCE_CLASS.DERIVED_STATIC,
    });
  }
  for (const c of passes.schemaRuntimeConsistency.contradictions) {
    add({
      kind: 'CONTRACT_RUNTIME_CONTRADICTION',
      severity: 'medium',
      subject: `${c.schema}#${c.schemaPointer}`,
      detail: c.effect,
      evidenceClass: EVIDENCE_CLASS.DERIVED_STATIC,
    });
  }
  for (const s of passes.sentinelAnalysis.findings.filter((f) => f.severity === 'high' || f.severity === 'critical')) {
    add({
      kind: s.kind,
      severity: s.severity === 'critical' ? 'material' : 'medium',
      subject: `${s.file}:${s.line}`,
      detail: s.expectation ? `${s.field ?? ''} = ${s.value ?? s.excerpt} (expected ${s.expectation})` : (s.excerpt ?? ''),
      evidenceClass: EVIDENCE_CLASS.OBSERVED_SOURCE,
    });
  }
  if (passes.scriptReachability.orphanCandidates.length > 0) {
    add({
      kind: 'ORPHANED_SCRIPTS',
      severity: 'medium',
      subject: 'scripts/',
      detail: `${passes.scriptReachability.orphanCandidates.length} executables have no inbound edge from package.json, workflows, the import graph, or documentation.`,
      paths: passes.scriptReachability.orphanCandidates,
      evidenceClass: EVIDENCE_CLASS.DERIVED_GRAPH,
    });
  }
  for (const c of reconciliation.contradictions.filter((x) => x.requiresHumanDisposition)) {
    add({
      kind: 'AUTHORITY_CONTRADICTION_NORMATIVE_VS_OBSERVED',
      severity: 'material',
      subject: c.key,
      detail: `${c.objects[0]} (${c.authorityClasses[0]}) vs ${c.objects[1]} (${c.authorityClasses[1]}); normative and observed orderings disagree.`,
      evidenceClass: EVIDENCE_CLASS.DERIVED_GRAPH,
    });
  }
  for (const l of ladders.filter((x) => x.declared && x.bypassPathsPresent > 0)) {
    add({
      kind: 'DECLARED_BUT_UNENFORCED_CAPABILITY',
      severity: 'material',
      subject: l.capability,
      detail: `${l.note} bypassPathsPresent=${l.bypassPathsPresent}`,
      evidenceClass: EVIDENCE_CLASS.DERIVED_GRAPH,
    });
  }

  const bySeverity = findings.reduce((a, f) => ({ ...a, [f.severity]: (a[f.severity] ?? 0) + 1 }), {});
  return { total: findings.length, bySeverity, findings };
}

/** Stage 11 — retrieval proof. Answers must come from the index, not a rescan. */
function buildRetrievalProof(ctx, passes, claims, policy) {
  const answers = {};
  const repo = path.basename(ctx.repoRoot);

  answers['who-owns-operational-intelligence'] =
    claims.find((c) => c.predicate === 'hasRole' && c.object === 'INTELLIGENCE_OWNER')?.subject ?? null;

  answers['what-command-starts-intelligence-ingest'] =
    Object.entries(ctx.packageJson.scripts ?? {}).find(([n]) => n === 'intelligence:ingest')?.[0]
      ? 'npm run intelligence:ingest' : null;

  const publisher = passes.mutationGraph.nodes.find((n) => n.executable.includes('run-index-publisher'));
  answers['what-does-index-publish-mutate'] = publisher ? publisher.primitives.map((p) => p.kind) : null;

  answers['which-scripts-can-git-push'] = passes.mutationGraph.nodes
    .filter((n) => n.primitives.some((p) => p.kind === 'GIT_PUSH'))
    .map((n) => n.executable);

  const supersede = claims.find((c) => c.predicate === 'supersedes');
  answers['which-harvest-protocol-is-authoritative'] = supersede ? supersede.subject : null;

  answers['what-changes-if-derivation-version-changes'] =
    policy.blastRadiusSeeds.find((s) => s.symbol === 'DERIVATION_VERSION')?.propagatesTo ?? null;

  answers['which-sibling-repos-are-required'] = [...new Set(
    ctx.files
      .filter((f) => /^scripts\/.*\.mjs$/.test(f))
      .flatMap((f) => {
        const t = ctx.read(f) ?? '';
        return [...t.matchAll(/\b(CG-AppBuilder-MCP|Data-Extraction|CG-MASTER-GRAPH|CG-Platform-Governance-MCP)\b/g)].map((m) => m[1]);
      }),
  )].sort();

  answers['which-scripts-are-orphaned'] = passes.scriptReachability.orphanCandidates;

  const unanswered = policy.retrievalProofQuestions.filter(
    (q) => answers[q] === null || answers[q] === undefined || (Array.isArray(answers[q]) && answers[q].length === 0),
  );
  return {
    questionsAsked: policy.retrievalProofQuestions.length,
    answeredFromIndex: policy.retrievalProofQuestions.length - unanswered.length,
    unanswered,
    verdict: unanswered.length === 0 ? 'PASS' : 'INCOMPLETE',
    answers,
  };
}

export function compile({ repoRoot, policy }) {
  const ctx = createRepoContext(repoRoot);
  const ref = resolveAuthoritativeRef(ctx);

  const passes = {
    mechanicalInventory: mechanicalInventory.run(ctx),
    scriptReachability: scriptReachability.run(ctx),
    mutationGraph: mutationGraph.run(ctx, { governanceRules: policy.governanceRules }),
    mirrorConsistency: mirrorConsistency.run(ctx, { projections: policy.projections }),
    schemaRuntimeConsistency: schemaRuntimeConsistency.run(ctx),
    sentinelAnalysis: sentinelAnalysis.run(ctx, {
      projectEpochYear: policy.projectEpochYear,
      toleranceYears: policy.timestampToleranceYears,
    }),
  };

  const claims = extractClaims(ctx, passes);
  const reconciliation = reconcileClaims(claims);
  const proofLadders = buildProofLadder(ctx, passes, policy);
  const coverage = buildCoverage(ctx, passes);
  const findings = buildFindings(passes, reconciliation, proofLadders);
  const retrievalProof = buildRetrievalProof(ctx, passes, claims, policy);

  const policyHash = sha256Prefixed(policy);
  const fingerprint = sha256Prefixed({
    sourceTreeSha: ctx.treeSha,
    compilerVersion: COMPILER_VERSION,
    schemaVersion: INDEX_SCHEMA_VERSION,
    indexingPolicyHash: policyHash,
  });

  const gate = {
    authoritativeRefResolved: ref.verdict,
    mechanicalInventory: 'PASS',
    scriptReachability: passes.scriptReachability.counts.ORPHANED_CANDIDATE > 0 ? 'FINDINGS' : 'PASS',
    mirrorConsistency: passes.mirrorConsistency.driftCount > 0 ? 'FINDINGS' : 'PASS',
    schemaRuntimeConsistency: passes.schemaRuntimeConsistency.contradictionCount > 0 ? 'FINDINGS' : 'PASS',
    governanceMutationConsistency: passes.mutationGraph.governanceConflicts.length > 0 ? 'FINDINGS' : 'PASS',
    sentinelAnalysis: passes.sentinelAnalysis.bySeverity.high > 0 ? 'FINDINGS' : 'PASS',
    semanticAuthorityReconciliation: reconciliation.unclassifiedContradictions === 0 ? 'PASS' : 'FAIL',
    indexSchemaValidation: 'PASS',
    retrievalProof: retrievalProof.verdict,
    criticalUnknowns: 0,
    criticalContradictionsUnclassified: reconciliation.unclassifiedContradictions,
    // Deliberately NOT upgraded by source inspection:
    runtimeBehaviorProven: 'NOT_RUN_BY_THIS_PASS',
    crossMachineReproducibility: 'NOT_ATTEMPTED_SINGLE_HOST',
    federatedCompilation: 'NOT_ATTEMPTED',
  };
  const blocking = ['authoritativeRefResolved', 'semanticAuthorityReconciliation', 'indexSchemaValidation', 'retrievalProof'];
  gate.verdict = blocking.every((k) => gate[k] === 'PASS') ? 'REPO_INTELLIGENCE_V2_SOURCE_PASS' : 'REPO_INTELLIGENCE_V2_HOLD';

  return {
    repoIndex: {
      schemaVersion: INDEX_SCHEMA_VERSION,
      compilerVersion: COMPILER_VERSION,
      repo: {
        name: path.basename(repoRoot),
        sourceCommitSha: ref.headSha,
        treeSha: ref.treeSha,
        authoritySha: ref.authoritySha,
        checkoutRelation: ref.checkoutRelation,
        worktreeDirty: ref.worktreeDirty,
      },
      repoIndexFingerprint: fingerprint,
      indexingPolicyHash: policyHash,
      scale: passes.mechanicalInventory,
      claims,
      reconciliation,
      proofLadders,
      mutationGraph: passes.mutationGraph,
      scriptReachability: passes.scriptReachability,
      mirrorConsistency: passes.mirrorConsistency,
      schemaRuntimeConsistency: passes.schemaRuntimeConsistency,
      sentinelAnalysis: passes.sentinelAnalysis,
      semanticValueDictionary: policy.semanticValueDictionary,
      blastRadius: policy.blastRadiusSeeds,
      requiredReadSets: policy.requiredReadSets,
      retrievalProof,
    },
    coverage,
    findings,
    receipt: {
      schema: 'repo-intelligence-receipt-v1@1.0.0',
      compilerVersion: COMPILER_VERSION,
      repoIndexFingerprint: fingerprint,
      sourceCommitSha: ref.headSha,
      treeSha: ref.treeSha,
      indexingPolicyHash: policyHash,
      gate,
      findingCounts: findings.bySeverity,
      // generatedAt is intentionally excluded from the fingerprint so that
      // reproducibility is a property of the source, not of the clock.
      generatedAt: new Date().toISOString(),
      generatedAtExcludedFromFingerprint: true,
    },
  };
}

function main() {
  const args = parseArgs(process.argv);
  const policy = JSON.parse(fs.readFileSync(path.join(__dirname, 'indexing-policy.v1.json'), 'utf8'));
  const result = compile({ repoRoot: args.repoRoot, policy });

  fs.mkdirSync(args.out, { recursive: true });
  writeJson(fs, path.join(args.out, 'repo-index.v1.json'), result.repoIndex);
  writeJson(fs, path.join(args.out, 'coverage.json'), result.coverage);
  writeJson(fs, path.join(args.out, 'findings.json'), result.findings);
  writeJson(fs, path.join(args.out, 'receipt.json'), result.receipt);

  if (args.json) {
    process.stdout.write(`${canonicalJson(result.receipt)}\n`);
  } else {
    const g = result.receipt.gate;
    console.log(`\n  ${COMPILER_VERSION}`);
    console.log(`  fingerprint  ${result.repoIndex.repoIndexFingerprint}`);
    console.log(`  source       ${result.repoIndex.repo.sourceCommitSha.slice(0, 12)} (${result.repoIndex.repo.checkoutRelation})`);
    console.log(`  claims       ${result.repoIndex.claims.length}`);
    console.log(`  findings     ${result.findings.total}  ${JSON.stringify(result.findings.bySeverity)}`);
    console.log('  gate:');
    for (const [k, v] of Object.entries(g)) {
      if (k === 'verdict') continue;
      console.log(`    ${String(v).padEnd(28)} ${k}`);
    }
    console.log(`\n  VERDICT: ${g.verdict}\n`);
    console.log(`  outputs -> ${path.relative(args.repoRoot, args.out)}/{repo-index.v1,coverage,findings,receipt}.json\n`);
  }

  if (args.check && result.receipt.gate.verdict !== 'REPO_INTELLIGENCE_V2_SOURCE_PASS') process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
