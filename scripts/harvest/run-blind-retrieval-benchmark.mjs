#!/usr/bin/env node
/**
 * Blind retrieval benchmark — query-only; expected ID compared after retrieval.
 */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '../..');
const HARVEST_ID = 'harvest-project-folder-synology-primary-chat-v1';
const RUN_DIR = join(REPO_ROOT, 'artifacts/agent-runs', HARVEST_ID);

const FIXTURES = [
  {
    query: 'Where do new project folder binaries live on Synology?',
    expectedRecordId: 'current-state-synology-primary-v1',
    forbiddenHistorical: true,
  },
  {
    query: 'What is forbidden during project folder stabilization?',
    expectedRecordId: 'current-state-synology-primary-v1',
    forbiddenHistorical: true,
  },
];

function loadCompactRecords() {
  const path = join(RUN_DIR, 'compact-retrieval-records.json');
  if (!existsSync(path)) return [];
  const data = JSON.parse(readFileSync(path, 'utf8'));
  return data.records ?? data ?? [];
}

function blindRetrieve(query, records) {
  const tokens = query.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 3);
  const scored = records
    .filter((r) => r.currentState !== false)
    .map((record) => {
      const hay = [
        record.shortAnswer,
        record.question,
        record.answer,
        record.authority,
        JSON.stringify(record.facts ?? {}),
        ...(record.tags ?? []),
      ]
        .join(' ')
        .toLowerCase();
      const score = tokens.reduce((acc, t) => acc + (hay.includes(t) ? 1 : 0), 0);
      return { recordId: record.recordId ?? record.id, score, record };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 5);
}

function main() {
  const records = loadCompactRecords();
  const results = [];
  for (const fixture of FIXTURES) {
    const topK = blindRetrieve(fixture.query, records);
    const top = topK[0] ?? null;
    const match = top?.recordId === fixture.expectedRecordId;
    results.push({
      query: fixture.query,
      returnedId: top?.recordId ?? null,
      expectedRecordId: fixture.expectedRecordId,
      topK: topK.map((r) => ({ recordId: r.recordId, score: r.score })),
      pass: match,
    });
    if (records.length > 0) {
      assert.equal(match, true, `blind retrieval failed for query: ${fixture.query}`);
    }
  }

  const report = {
    schemaVersion: 'cross-agent-harvest-blind-retrieval-benchmark-v1@1.0.0',
    harvestId: HARVEST_ID,
    testedAt: '2026-08-03T00:00:00.000Z',
    blindQueryOnly: true,
    recordCount: records.length,
    results,
    verdict:
      records.length === 0
        ? 'SKIP_NO_FIXTURE_DATA'
        : results.every((r) => r.pass)
          ? 'PREPUBLICATION_BLIND_RETRIEVAL_FIXTURE_PASS'
          : 'PREPUBLICATION_BLIND_RETRIEVAL_FIXTURE_FAIL',
    postPublicationRequired: true,
    note:
      'Does not prove post-publication Intelligence Hub acceptance. Rerun against L: after workflow_dispatch publication without expected improvement IDs.',
  };
  console.log(JSON.stringify(report, null, 2));
  if (report.verdict === 'FAIL') process.exit(1);
}

main();
