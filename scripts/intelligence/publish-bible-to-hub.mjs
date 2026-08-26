#!/usr/bin/env node
/**
 * npm run intelligence:bible-hub-publish -- --repo=<name> --repo-path=<path> [--app-key=<key>] [--check-freshness-only]
 *
 * Requires CROSS_AGENT_INTELLIGENCE_HUB_PROJECTION_APPROVED=1 and
 * INTELLIGENCE_HUB_LIVE_WRITES=true to actually publish; otherwise builds the
 * manifest and reports what would happen without writing.
 */
import path from 'node:path';

import {
  buildBibleProjectionManifest,
  publishBibleProjection,
  checkBibleHubFreshness,
} from './lib/bible-hub-projection-v1.mjs';
import { createLiveIntelligenceHubStore, resolveSharedDevHubWriteEligibility } from './lib/supabase-intelligence-store-v1.mjs';

function parseArgs(argv) {
  const args = { repo: null, repoPath: null, appKey: null, checkFreshnessOnly: false, json: argv.includes('--json') };
  for (const arg of argv) {
    if (arg.startsWith('--repo=')) args.repo = arg.slice('--repo='.length);
    else if (arg.startsWith('--repo-path=')) args.repoPath = arg.slice('--repo-path='.length);
    else if (arg.startsWith('--app-key=')) args.appKey = arg.slice('--app-key='.length);
    else if (arg === '--check-freshness-only') args.checkFreshnessOnly = true;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.repo || !args.repoPath) {
    console.error('Usage: publish-bible-to-hub.mjs --repo=<name> --repo-path=<path> [--app-key=<key>] [--check-freshness-only] [--json]');
    process.exit(2);
  }
  const repoPath = path.resolve(args.repoPath);
  const eligibility = resolveSharedDevHubWriteEligibility();

  if (args.checkFreshnessOnly) {
    if (!eligibility.executable) {
      console.error(`freshness check requires live credentials: ${eligibility.reason}`);
      process.exit(1);
    }
    const store = await createLiveIntelligenceHubStore();
    if (store.kind !== 'live') {
      console.error(`Hub store unavailable: ${JSON.stringify(store.env)}`);
      process.exit(1);
    }
    const result = await checkBibleHubFreshness({ authorityRepository: args.repo, repoPath, store });
    if (args.json) console.log(JSON.stringify(result, null, 2));
    else console.log(`bible-hub-freshness ${result.verdict} checked=${result.checkedCount} stale=${result.staleCount} missing=${result.missingCount}`);
    process.exit(result.ok && result.verdict === 'ALL_CURRENT' ? 0 : 1);
  }

  const manifest = await buildBibleProjectionManifest({ appKey: args.appKey, authorityRepository: args.repo, repoPath });
  if (!manifest.ok) {
    console.error(`bible-hub-publish FAIL — ${manifest.reason}`);
    process.exit(1);
  }

  if (!eligibility.executable) {
    console.log(JSON.stringify({ verdict: 'BIBLE_HUB_PROJECTION_STRUCTURAL_ONLY', reason: eligibility.reason, domainCount: manifest.knowledgeObjects.length, appKey: manifest.appKey, authorityRepository: manifest.authorityRepository, authorityCommit: manifest.authorityCommit }, null, 2));
    process.exit(0);
  }

  const store = await createLiveIntelligenceHubStore();
  if (store.kind !== 'live') {
    console.error(`Hub store unavailable: ${JSON.stringify(store.env)}`);
    process.exit(1);
  }
  const result = await publishBibleProjection({ manifest, store });
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else console.log(`bible-hub-publish ${result.verdict} domains=${result.domainCount} repo=${result.authorityRepository}@${result.authorityCommit}`);
  process.exit(result.ok ? 0 : 1);
}

main().catch((error) => {
  console.error('bible-hub-publish FAIL:', error.message);
  process.exit(1);
});
