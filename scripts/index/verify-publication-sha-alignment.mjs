#!/usr/bin/env node
/**
 * Post-publication gate: receipt verdict + L: BY-KIND sourceCommitSha === GITHUB_SHA.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HUB_ROOT =
  process.env.INTELLIGENCE_HUB_ROOT?.trim() ||
  process.env.CG_INTELLIGENCE_HUB_ROOT?.trim() ||
  '/mnt/l/Capital-Glass-Intelligence-Hub';

const expectedSha = process.env.GITHUB_SHA?.trim();
if (!expectedSha) {
  console.error('verify-publication-sha-alignment: GITHUB_SHA required');
  process.exit(1);
}

const receiptPath = path.join(REPO_ROOT, 'runtime/index-publication/latest.json');
if (!fs.existsSync(receiptPath)) {
  console.error(`verify-publication-sha-alignment: missing receipt ${receiptPath}`);
  process.exit(1);
}

const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
const allowedVerdicts = new Set(['PUBLISH_PASS', 'NOOP_CURRENT']);
if (!allowedVerdicts.has(receipt.verdict)) {
  console.error(`verify-publication-sha-alignment: verdict ${receipt.verdict}`);
  process.exit(1);
}

if (receipt.pinnedSha !== expectedSha) {
  console.error(
    `verify-publication-sha-alignment: receipt pinnedSha ${receipt.pinnedSha} !== ${expectedSha}`,
  );
  process.exit(1);
}

const sliceIds = ['active-work-blockers', 'active-work-open-actions'];
for (const sliceId of sliceIds) {
  const slicePath = path.join(HUB_ROOT, '00-master-index/BY-KIND', `${sliceId}.json`);
  if (!fs.existsSync(slicePath)) {
    console.error(`verify-publication-sha-alignment: missing L slice ${slicePath}`);
    process.exit(1);
  }
  const slice = JSON.parse(fs.readFileSync(slicePath, 'utf8'));
  if (slice.sourceCommitSha !== expectedSha) {
    console.error(
      `verify-publication-sha-alignment: ${sliceId} sourceCommitSha ${slice.sourceCommitSha} !== ${expectedSha}`,
    );
    process.exit(1);
  }
}

console.log(`PUBLICATION_SHA_ALIGNMENT_PASS sha=${expectedSha} verdict=${receipt.verdict}`);
