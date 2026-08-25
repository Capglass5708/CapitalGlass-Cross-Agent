#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  loadEvidenceManifest,
  previewGoldMine,
  lastGoldMineReceipt,
  runGoldMineProtocol,
} from './lib/goldmine-protocol-v1.mjs';

function parseArgs(argv) {
  const args = { evidence: null, preview: false, status: null, json: false };
  for (const arg of argv) {
    if (arg === '--preview') args.preview = true;
    else if (arg === '--json') args.json = true;
    else if (arg.startsWith('--evidence=')) args.evidence = arg.slice('--evidence='.length);
    else if (arg.startsWith('--status=')) args.status = arg.slice('--status='.length);
  }
  return args;
}

function printReceipt(receipt, json) {
  if (json) {
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    return;
  }
  process.stdout.write(`${receipt.verdict}\n`);
  if (receipt.verdict === 'GOLD_MINE_PREVIEW') {
    process.stdout.write(`${receipt.evidenceItemsHarvested} evidence items would be harvested\n`);
    process.stdout.write(`packets: ${receipt.packetIds.join(', ')}\n`);
    return;
  }
  process.stdout.write(`${receipt.evidenceItemsHarvested} evidence items harvested\n`);
  process.stdout.write(`${receipt.newKnowledgeNodes} new intelligence objects\n`);
  process.stdout.write(`${receipt.existingNodesReinforced} existing objects reinforced\n`);
  process.stdout.write(`${receipt.newRelationships} new relationships\n`);
  process.stdout.write(`${receipt.supersessions} supersessions\n`);
  process.stdout.write(`${receipt.contradictionsRequiringReview} contradictions requiring review\n`);
  process.stdout.write(`Graph dividend: ${receipt.graphDividend}\n`);
  process.stdout.write(`Index refresh: ${receipt.indexRefresh}\n`);
  process.stdout.write(`Hub publication: ${receipt.hubPublication}\n`);
  if (receipt.note) process.stdout.write(`${receipt.note}\n`);
  process.stdout.write(`Provenance receipt: ${receipt.receiptPath}\n`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.status) {
    const receipt = lastGoldMineReceipt(args.status);
    if (!receipt) {
      console.error(`No Gold Mine receipt found for harvestId '${args.status}'`);
      process.exit(1);
    }
    printReceipt(receipt, args.json);
    process.exit(0);
  }

  if (!args.evidence) {
    console.error('Usage: npm run goldmine -- --evidence=<path> [--preview] [--json]');
    console.error('       npm run goldmine -- --status=<harvestId> [--json]');
    process.exit(2);
  }

  let manifest;
  try {
    manifest = loadEvidenceManifest(args.evidence);
  } catch (error) {
    console.error(`${error.code ?? 'EVIDENCE_ERROR'}: ${error.message}`);
    process.exit(2);
    return;
  }

  if (args.preview) {
    printReceipt(previewGoldMine(manifest), args.json);
    process.exit(0);
    return;
  }

  const receipt = await runGoldMineProtocol(manifest);
  printReceipt(receipt, args.json);
  process.exit(receipt.verdict === 'GOLD_MINE_COMPLETE' || receipt.verdict === 'GOLD_MINE_PARTIAL' ? 0 : 1);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  main();
}
