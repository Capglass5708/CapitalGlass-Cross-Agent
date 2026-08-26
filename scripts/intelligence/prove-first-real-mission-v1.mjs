#!/usr/bin/env node
/**
 * Phase 2 (compounding-intelligence-v2-live-integration-proof): the first
 * genuine, non-fixture, non-ephemeral material mission run through the
 * shared-dev Hub ingest pipeline, using real evidence from the completed
 * mcp-estate-remediation-v1 mission (three real commits: CG-AppBuilder-MCP
 * 0b389796, Computer-Estimator 049c4392, CapitalGlass-BidComposer 80a11671).
 *
 * Requires CROSS_AGENT_INTELLIGENCE_HUB_PROJECTION_APPROVED=1 and
 * INTELLIGENCE_HUB_LIVE_WRITES=true to actually write live; otherwise runs
 * as a structural-only dry pass (same as every other gated path in this repo).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildAuthorityFingerprintV1, sha256FileHash } from './lib/closeout-verify.mjs';
import { buildCorrelationBlock, computeMarkerSetHash } from './lib/correlation-markers-v1.mjs';
import { HANDOFF_SCHEMA } from './lib/constants.mjs';
import { runIntelligenceIngest } from './lib/ingest-pipeline-v1.mjs';
import { evaluateFirstRealMissionHarness } from './lib/first-real-mission-harness-v1.mjs';
import { resolveSharedDevHubWriteEligibility } from './lib/supabase-intelligence-store-v1.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const WORK_PACKAGE_ID = 'mcp-estate-remediation-v1';
const COMMIT_SHA = '0b389796e7f2d0fe7b75393a8213135648f72a91';

const closeout = {
  workPackageId: WORK_PACKAGE_ID,
  primaryRepo: 'CG-AppBuilder-MCP',
  task: 'MCP estate remediation: diagnose and fix Claude Code MCP registration and runtime defects across five servers, register six previously-broken servers live, and correct a governed MCP registry authority drift for revu-mcp.',
  missionClass: 'fix',
  outcome: 'PASS',
  hostMode: 'wsl',
  topology: 'single',
  confidence: 'HIGH',
  cheapSingleAgentOk: false,
  cheapestRedo:
    'Re-run the raw MCP protocol probe (initialize -> notifications/initialized -> tools/list -> tools/call) against any newly registered server before trusting `claude mcp list` alone.',
  deterministicFirst: true,
  mixedMissions: false,
  aiCacheHit: false,
  chatSummary:
    'Root cause of the Claude Code MCP registration failures was an unsupported cwd field in stdio server entries, not dotted tool names as first suspected -- disproven by a direct protocol probe after operator correction. Also root-caused a tsx path-alias resolution failure to a process.cwd() dependency, fixed the Human Estimator production-query client path to canonically reference CG-AppBuilder-MCP, fixed a Computer Estimator venv/dependency-version defect, and corrected a governed registry authority drift for revu-mcp with a new adversarially-tested reconciliation guard.',
  nextAction:
    'Rotate the GitHub MCP Doppler-sourced credential (WC-MCP-003) and determine/provision the correct Cloudflare Workers/D1/KV/R2 API token scope (WC-MCP-004); both require operator decision.',
  blockers: [
    'GitHub MCP confirmed credential defect -- Bad credentials, gh CLI works independently, requires operator credential rotation',
    'Cloudflare MCP confirmed scope/authority defect on the Workers/D1/KV/R2 operational path -- requires operator scope decision',
  ],
  correction:
    'Corrected the false root-cause theory that Claude Code rejects dotted MCP tool names; the real defect was the unsupported cwd field.',
};

async function main() {
  const runDir = path.join(REPO_ROOT, 'artifacts/agent-runs', WORK_PACKAGE_ID);
  fs.mkdirSync(runDir, { recursive: true });

  closeout.correlation = buildCorrelationBlock({
    closeout,
    producerRepo: 'CG-AppBuilder-MCP',
    capabilityIds: [],
  });
  closeout.correlation.markerSetHash = computeMarkerSetHash(closeout.correlation.markers);

  const closeoutRel = `artifacts/agent-runs/${WORK_PACKAGE_ID}/session-closeout-v3.2.json`;
  const closeoutPath = path.join(REPO_ROOT, closeoutRel);
  fs.writeFileSync(closeoutPath, `${JSON.stringify(closeout, null, 2)}\n`);

  const closeoutHash = sha256FileHash(closeoutPath);
  const authorityFingerprint = buildAuthorityFingerprintV1({
    repo: 'CG-AppBuilder-MCP',
    workPackageId: WORK_PACKAGE_ID,
    missionClass: 'fix',
    material: true,
    commitSha: COMMIT_SHA,
    closeoutHash,
    bibleHashAfter: null,
  });

  const handoff = {
    schema: HANDOFF_SCHEMA,
    workPackageId: WORK_PACKAGE_ID,
    closeoutRef: closeoutRel,
    closeoutHash,
    authorityFingerprint,
    source: {
      repo: 'CG-AppBuilder-MCP',
      closeoutPath: closeoutRel,
      closeoutHash,
      authorityFingerprint,
      commitSha: COMMIT_SHA,
    },
    mission: {
      missionClass: 'fix',
      material: true,
      startedAt: '2026-08-25T20:58:19.000Z',
      closedAt: '2026-08-25T22:27:48.000Z',
    },
    producer: {
      system: 'CG-AppBuilder-MCP',
      role: 'EVIDENCE_PRODUCER',
    },
    consumer: {
      system: 'CapitalGlass-Cross-Agent',
      role: 'INTELLIGENCE_PROCESSOR',
    },
    observedAt: new Date().toISOString(),
  };

  const handoffPath = path.join(runDir, 'handoff.json');
  fs.writeFileSync(handoffPath, `${JSON.stringify(handoff, null, 2)}\n`);

  const eligibility = resolveSharedDevHubWriteEligibility();
  const mode = eligibility.executable ? 'shared-dev-hub' : 'dry-run';

  const receipt = await runIntelligenceIngest({
    handoff,
    handoffPath,
    mode,
    repoRoot: REPO_ROOT,
    outputRoot: runDir,
    writeEligibility: eligibility,
  });

  const harness = evaluateFirstRealMissionHarness(receipt);

  const outPath = path.join(runDir, 'first-real-mission-proof-receipt.json');
  fs.writeFileSync(outPath, `${JSON.stringify({ eligibility, mode, receipt, harness }, null, 2)}\n`);

  console.log(JSON.stringify({ eligibility, mode, verdict: receipt.verdict, harnessState: harness.state, harnessChecks: harness.checks, outPath }, null, 2));

  process.exit(harness.pass || mode !== 'shared-dev-hub' ? 0 : 1);
}

main().catch((error) => {
  console.error('prove-first-real-mission FAIL:', error.stage ?? '', error.message, JSON.stringify(error.details ?? {}));
  process.exit(1);
});
