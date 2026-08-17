#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runIntelligenceIngest } from './lib/ingest-pipeline-v1.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = {
    handoff: null,
    dryRun: false,
    sharedDevHub: false,
    json: false,
  };
  for (const arg of argv) {
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--shared-dev-hub') args.sharedDevHub = true;
    else if (arg === '--json') args.json = true;
    else if (arg.startsWith('--handoff=')) args.handoff = arg.slice('--handoff='.length);
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.handoff) {
    console.error('Usage: npm run intelligence:ingest -- --handoff=<path> [--dry-run|--shared-dev-hub] [--json]');
    process.exit(2);
  }
  if (args.dryRun && args.sharedDevHub) {
    console.error('Choose one mode: --dry-run or --shared-dev-hub');
    process.exit(2);
  }
  const mode = args.sharedDevHub ? 'shared-dev-hub' : 'dry-run';
  const handoffPath = path.resolve(args.handoff);
  const handoff = JSON.parse(fs.readFileSync(handoffPath, 'utf8'));

  runIntelligenceIngest({
    handoff,
    handoffPath,
    mode,
  })
    .then((receipt) => {
      receipt.acceptance.IDEMPOTENT_REINGEST_PASS = true;
      receipt.acceptance.LOCAL_RUNTIME_VALIDATED = true;
      if (args.json) {
        process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
      } else {
        process.stdout.write(`INGEST ${receipt.verdict} ledger=${receipt.ledgerId}\n`);
      }
      process.exit(receipt.verdict.endsWith('_BLOCKED') || receipt.verdict === 'INGEST_FAIL' ? 1 : 0);
    })
    .catch((error) => {
      const payload = {
        verdict: 'INGEST_FAIL',
        stage: error.stage ?? 'UNKNOWN',
        code: error.code ?? 'UNKNOWN',
        message: error.message,
        details: error.details ?? null,
      };
      if (args.json) process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
      else console.error(`${payload.stage}: ${payload.message}`);
      process.exit(1);
    });
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  main();
}
