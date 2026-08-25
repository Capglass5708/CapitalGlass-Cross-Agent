#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runIntelligencePreflight, writePreflightReceipt } from './lib/preflight-v1.mjs';

function parseArgs(argv) {
  const args = { mission: null, repos: [], concepts: [], json: false, noReceipt: false };
  for (const arg of argv) {
    if (arg === '--json') args.json = true;
    else if (arg === '--no-receipt') args.noReceipt = true;
    else if (arg.startsWith('--mission=')) args.mission = arg.slice('--mission='.length);
    else if (arg.startsWith('--repos=')) args.repos = arg.slice('--repos='.length).split(',').filter(Boolean);
    else if (arg.startsWith('--concepts=')) args.concepts = arg.slice('--concepts='.length).split(',').filter(Boolean);
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = await runIntelligencePreflight({ mission: args.mission, repos: args.repos, concepts: args.concepts });

  let receiptPath = null;
  if (!args.noReceipt) {
    receiptPath = writePreflightReceipt(result);
  }

  if (args.json) {
    process.stdout.write(`${JSON.stringify({ ...result, receiptPath }, null, 2)}\n`);
  } else {
    process.stdout.write(`${result.outcome}\n`);
    if (result.indexVersion) process.stdout.write(`  indexVersion: ${result.indexVersion}\n`);
    if (result.bundle) {
      process.stdout.write(`  activeBlockers: ${result.bundle.activeBlockers.length}\n`);
      process.stdout.write(`  knownFailures: ${result.bundle.knownFailures.length}\n`);
      process.stdout.write(`  successPatterns: ${result.bundle.successPatterns.length}\n`);
      process.stdout.write(`  relatedMissions: ${result.bundle.relatedMissions.length}\n`);
      process.stdout.write(`  unresolvedContradictions: ${result.bundle.unresolvedContradictions.length}\n`);
    }
    if (receiptPath) process.stdout.write(`  receipt: ${receiptPath}\n`);
  }
  process.exit(result.outcome === 'ALL_HUB_PLANES_UNAVAILABLE' ? 1 : 0);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  main();
}
