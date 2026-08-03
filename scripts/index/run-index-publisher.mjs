#!/usr/bin/env node
/**
 * Automatic Cross-Agent index publisher — pinned SHA, content-hash no-op, L: mount probe.
 * Writes receipt outside Git (runtime + L: _operations).
 */
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveGitHead } from './lib/git-head.mjs';
import { resolveAppBuilderRoot, resolveDataExtractionRoot } from './lib/resolve-repo-roots.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP_BUILDER_ROOT = resolveAppBuilderRoot(REPO_ROOT);
const DATA_EXTRACTION_ROOT = resolveDataExtractionRoot(REPO_ROOT);
const HUB_ROOT =
  process.env.INTELLIGENCE_HUB_ROOT?.trim() ||
  process.env.CG_INTELLIGENCE_HUB_ROOT?.trim() ||
  '/mnt/l/Capital-Glass-Intelligence-Hub';

const PUBLICATION_RECEIPT_SCHEMA = 'cross-agent-index-publication-receipt-v1@1.0.0';

function run(cmd, cwd, env = {}) {
  console.log(`> ${cmd}`);
  execSync(cmd, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
}

function readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function computeContentHash(pinnedSha) {
  const inputs = [
    pinnedSha,
    readJsonSafe(path.join(REPO_ROOT, 'work-progress/ACTIVE_WORK.md')) ?? '',
    readJsonSafe(path.join(REPO_ROOT, 'work-progress/command-index.json')) ?? '',
  ];
  return createHash('sha256').update(JSON.stringify(inputs)).digest('hex');
}

function writeReceipt(receipt) {
  const runtimeDir = path.join(REPO_ROOT, 'runtime/index-publication');
  fs.mkdirSync(runtimeDir, { recursive: true });
  const runtimePath = path.join(runtimeDir, 'latest.json');
  fs.writeFileSync(runtimePath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');

  const hubOpsDir = path.join(
    HUB_ROOT,
    '00-master-index/_operations/cross-agent-publication',
  );
  if (fs.existsSync(path.join(HUB_ROOT, '00-master-index'))) {
    fs.mkdirSync(hubOpsDir, { recursive: true });
    fs.writeFileSync(
      path.join(hubOpsDir, 'LATEST-publication.json'),
      `${JSON.stringify(receipt, null, 2)}\n`,
      'utf8',
    );
  }

  const artifactDir = path.join(
    REPO_ROOT,
    'artifacts/agent-runs/cross-agent-index-publication-v1',
  );
  fs.mkdirSync(artifactDir, { recursive: true });
  fs.writeFileSync(path.join(artifactDir, 'latest.json'), `${JSON.stringify(receipt, null, 2)}\n`);

  return runtimePath;
}

function main() {
  const started = Date.now();
  const pinnedSha = process.env.GITHUB_SHA?.trim() || resolveGitHead(REPO_ROOT);
  const runId = process.env.GITHUB_RUN_ID ?? `local-${Date.now()}`;
  const contentHash = computeContentHash(pinnedSha);

  const prior = readJsonSafe(path.join(REPO_ROOT, 'runtime/index-publication/latest.json'));
  if (
    prior?.verdict === 'PUBLISH_PASS' &&
    prior?.pinnedSha === pinnedSha &&
    prior?.contentHash === contentHash
  ) {
    const noop = {
      schemaVersion: PUBLICATION_RECEIPT_SCHEMA,
      generatedAt: new Date().toISOString(),
      runId,
      pinnedSha,
      contentHash,
      verdict: 'NOOP_CURRENT',
      layers: prior.layers ?? {},
      freshnessGate: prior.freshnessGate ?? null,
      durationMs: Date.now() - started,
    };
    const receiptPath = writeReceipt(noop);
    console.log(`index publisher NOOP_CURRENT sha=${pinnedSha}`);
    console.log(`  receipt: ${receiptPath}`);
    return;
  }

  const hubIndexRoot = path.join(HUB_ROOT, '00-master-index');
  if (!fs.existsSync(path.join(hubIndexRoot, 'BY-KIND'))) {
    const hold = {
      schemaVersion: PUBLICATION_RECEIPT_SCHEMA,
      generatedAt: new Date().toISOString(),
      runId,
      pinnedSha,
      contentHash,
      verdict: 'PUBLICATION_HOLD',
      layers: { intelligenceHub: { mounted: false, path: hubIndexRoot } },
      freshnessGate: null,
      durationMs: Date.now() - started,
      issues: [`L: index root missing: ${hubIndexRoot}`],
    };
    writeReceipt(hold);
    console.error('index publisher PUBLICATION_HOLD — L: not mounted');
    process.exit(1);
  }

  try {
    run(
      `CROSS_AGENT_LEDGER_INGEST_APPROVED=1 doppler run --project cg-mcp --config dev -- npm run cross-agent-ledger:ingest -- --apply --repo=${REPO_ROOT}`,
      APP_BUILDER_ROOT,
    );
    run(
      `INTELLIGENCE_HUB_ROOT=${HUB_ROOT} CG_APPBUILDER_MCP_ROOT=${APP_BUILDER_ROOT} CAPITALGLASS_CROSS_AGENT_ROOT=${REPO_ROOT} npm run agent-research-library:publish-active-work-ledger -- --repo=${REPO_ROOT} --json`,
      DATA_EXTRACTION_ROOT,
    );
    run('npm run index:freshness-gate', REPO_ROOT, {
      CG_APPBUILDER_MCP_ROOT: APP_BUILDER_ROOT,
      INTELLIGENCE_HUB_ROOT: HUB_ROOT,
    });
  } catch (err) {
    const hold = {
      schemaVersion: PUBLICATION_RECEIPT_SCHEMA,
      generatedAt: new Date().toISOString(),
      runId,
      pinnedSha,
      contentHash,
      verdict: 'PUBLICATION_HOLD',
      layers: { intelligenceHub: { mounted: true, path: hubIndexRoot } },
      freshnessGate: null,
      durationMs: Date.now() - started,
      issues: [String(err.message ?? err)],
    };
    writeReceipt(hold);
    process.exit(1);
  }

  const freshness = readJsonSafe(
    path.join(REPO_ROOT, 'artifacts/agent-runs/cross-agent-index-freshness-gate-v1/latest.json'),
  );

  const receipt = {
    schemaVersion: PUBLICATION_RECEIPT_SCHEMA,
    generatedAt: new Date().toISOString(),
    runId,
    pinnedSha,
    publishedSha: pinnedSha,
    contentHash,
    verdict: 'PUBLISH_PASS',
    layers: {
      git: { sourceCommitSha: pinnedSha },
      intelligenceHub: { mounted: true, path: hubIndexRoot },
    },
    freshnessGate: freshness,
    durationMs: Date.now() - started,
  };

  const receiptPath = writeReceipt(receipt);
  console.log(`index publisher PUBLISH_PASS sha=${pinnedSha}`);
  console.log(`  receipt: ${receiptPath}`);
}

main();
