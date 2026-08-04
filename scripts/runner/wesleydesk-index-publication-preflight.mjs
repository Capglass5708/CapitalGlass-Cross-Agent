#!/usr/bin/env node
/**
 * WESLEYDESK Cross-Agent index publication runner preflight.
 * Used by runner-smoke workflow and operator install verification.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
  ARTIFACT_DIR,
  WORK_PACKAGE_ID,
  assertWesleydeskHost,
  pathReadable,
  resolveReposRoot,
} from './lib/wesleydesk-host.mjs';

function parseArgs(argv) {
  return { json: argv.includes('--json') };
}

function commandOk(cmd) {
  const r = spawnSync('bash', ['-lc', cmd], { encoding: 'utf8' });
  return r.status === 0;
}

function siblingRepoOk(reposRoot, dirName) {
  return fs.existsSync(path.join(reposRoot, dirName, 'package.json'));
}

function main() {
  const args = parseArgs(process.argv);
  const hostCheck = assertWesleydeskHost();
  const { profile, identity } = hostCheck;
  const reposRoot = resolveReposRoot(profile);
  const hubRoot =
    process.env.INTELLIGENCE_HUB_ROOT?.trim() ||
    profile.intelligenceHubRoot ||
    '/mnt/l/Capital-Glass-Intelligence-Hub';
  const hubIndexRoot = path.join(hubRoot, '00-master-index');
  const crossAgentRoot =
    process.env.CAPITALGLASS_CROSS_AGENT_ROOT?.trim() ||
    path.join(reposRoot, 'CapitalGlass-Cross-Agent');

  const siblingChecks = Object.fromEntries(
    (profile.requiredSiblingRepos ?? []).map((name) => [
      name,
      { path: path.join(reposRoot, name), ok: siblingRepoOk(reposRoot, name) },
    ]),
  );

  const receipt = {
    schemaVersion: 'wesleydesk-index-publication-preflight-v1@1.0.0',
    workPackageId: WORK_PACKAGE_ID,
    generatedAt: new Date().toISOString(),
    controlHosts: ['WESLEY_WORK'],
    executionHost: hostCheck.ok ? 'WESLEYDESK' : 'UNKNOWN',
    requiredRunnerLabels: profile.requiredRunnerLabels ?? [],
    githubRepository: profile.githubRepository,
    host: identity,
    checks: {
      reposRoot: { path: reposRoot, ok: pathReadable(reposRoot) },
      crossAgentRepo: {
        path: crossAgentRoot,
        ok: fs.existsSync(path.join(crossAgentRoot, 'package.json')),
      },
      intelligenceHub: {
        path: hubIndexRoot,
        ok: pathReadable(path.join(hubIndexRoot, 'BY-KIND')),
        required: true,
      },
      siblingRepos: siblingChecks,
      dopplerCli: { ok: commandOk('command -v doppler') },
      ghCli: { ok: commandOk('command -v gh') },
      node: { ok: commandOk('node --version') },
    },
    verdict: 'PASS',
  };

  if (!hostCheck.ok) {
    receipt.verdict = 'BLOCKED_WRONG_HOST';
    receipt.blocker = 'Index publication runner must run on WESLEYDESK WSL2.';
    receipt.operatorAction =
      'Open WSL on CG-WESLEYDESK-01 and run scripts/runner/install-wesleydesk-github-runner-wsl-service.sh';
  } else if (!receipt.checks.reposRoot.ok) {
    receipt.verdict = 'BLOCKED';
    receipt.blocker = `Repos root missing: ${reposRoot}`;
  } else if (!receipt.checks.intelligenceHub.ok) {
    receipt.verdict = 'BLOCKED';
    receipt.blocker = `L: Intelligence Hub index missing: ${hubIndexRoot}`;
    receipt.operatorAction = 'Mount L: in WESLEYDESK WSL before index publication.';
  } else if (Object.values(siblingChecks).some((entry) => !entry.ok)) {
    receipt.verdict = 'BLOCKED';
    receipt.blocker = 'Required sibling repos missing under repos root.';
  } else if (!receipt.checks.dopplerCli.ok) {
    receipt.verdict = 'BLOCKED';
    receipt.blocker = 'doppler CLI not available on runner host.';
  }

  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const outPath = path.join(ARTIFACT_DIR, 'wesleydesk-runner-preflight.json');
  fs.writeFileSync(outPath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');

  if (args.json) {
    console.log(JSON.stringify(receipt, null, 2));
  } else {
    console.log(`wesleydesk index publication preflight: ${receipt.verdict}`);
    console.log(`  artifact: ${outPath}`);
    if (receipt.blocker) console.log(`  blocker: ${receipt.blocker}`);
  }

  if (receipt.verdict !== 'PASS') process.exit(1);
}

main();
