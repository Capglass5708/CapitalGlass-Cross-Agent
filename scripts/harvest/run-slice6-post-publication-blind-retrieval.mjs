#!/usr/bin/env node
/**
 * Slice 6 post-publication blind retrieval — query L: only; never use IMP-0001..0004 in queries.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveGitHead } from '../index/lib/git-head.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const HUB_ROOT =
  process.env.INTELLIGENCE_HUB_ROOT?.trim() ||
  process.env.CG_INTELLIGENCE_HUB_ROOT?.trim() ||
  '/mnt/l/Capital-Glass-Intelligence-Hub';
const OUT_PATH = path.join(
  REPO_ROOT,
  'artifacts/agent-runs/three-way-agent-improvement-intelligence-v1/post-publication-blind-retrieval-v1.json',
);

const FORBIDDEN_QUERY_TOKENS = ['IMP-0001', 'IMP-0002', 'IMP-0003', 'IMP-0004'];

const FIXTURES = [
  {
    query: 'What blocks three way improvement intelligence from becoming operational?',
    expectAny: ['three-way', 'slice6', 'publication', 'operational', 'blind retrieval'],
  },
  {
    query: 'Which coordination repo owns the improvement intelligence merge publication gates?',
    expectAny: ['cross-agent', 'capitalglass-cross-agent', 'slice6', 'publication'],
  },
  {
    query: 'What is the current slice six hub publication status after merge?',
    expectAny: ['slice6', 'publication', 'merged', 'hub', 'publish'],
  },
];

function readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function loadHubCorpus() {
  const files = [];
  const indexRoot = path.join(HUB_ROOT, '00-master-index');
  const candidates = [
    path.join(indexRoot, 'BY-KIND/active-work-blockers.json'),
    path.join(indexRoot, 'BY-KIND/active-work-ledger.json'),
    path.join(indexRoot, 'active-work-ledger/LATEST.json'),
    path.join(indexRoot, 'INDEX.json'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) files.push({ path: p, text: fs.readFileSync(p, 'utf8') });
  }
  const sliceDir = path.join(REPO_ROOT, 'work-progress/intelligence-hub-slices');
  if (fs.existsSync(sliceDir)) {
    for (const name of fs.readdirSync(sliceDir)) {
      const p = path.join(sliceDir, name);
      if (fs.statSync(p).isFile() && name.endsWith('.json')) {
        files.push({ path: p, text: fs.readFileSync(p, 'utf8') });
      }
    }
  }
  return files;
}

function scoreQuery(query, corpus) {
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3);
  let best = { score: 0, path: null, hits: [] };
  for (const doc of corpus) {
    const hay = doc.text.toLowerCase();
    const hits = tokens.filter((t) => hay.includes(t));
    const score = hits.length / Math.max(tokens.length, 1);
    if (score > best.score) best = { score, path: doc.path, hits };
  }
  return best;
}

function main() {
  if (!fs.existsSync(path.join(HUB_ROOT, '00-master-index'))) {
    console.error(`L: hub not mounted at ${HUB_ROOT}`);
    process.exit(1);
  }

  for (const fixture of FIXTURES) {
    for (const forbidden of FORBIDDEN_QUERY_TOKENS) {
      if (fixture.query.includes(forbidden)) {
        console.error(`forbidden token in query: ${forbidden}`);
        process.exit(1);
      }
    }
  }

  const corpus = loadHubCorpus();
  const results = FIXTURES.map((fixture) => {
    const match = scoreQuery(fixture.query, corpus);
    const hay = corpus.map((c) => c.text.toLowerCase()).join('\n');
    const expectHit = fixture.expectAny.some((term) => hay.includes(term.toLowerCase()));
    const pass = match.score >= 0.25 && expectHit;
    return {
      query: fixture.query,
      topScore: match.score,
      topPath: match.path,
      tokenHits: match.hits,
      expectAny: fixture.expectAny,
      pass,
    };
  });

  const verdict = results.every((r) => r.pass)
    ? 'POST_PUBLICATION_BLIND_RETRIEVAL_PASS'
    : 'POST_PUBLICATION_BLIND_RETRIEVAL_FAIL';

  const report = {
    schemaVersion: 'three-way-slice6-post-publication-blind-retrieval-v1@1.0.0',
    programId: 'three-way-agent-improvement-intelligence-v1',
    generatedAt: new Date().toISOString(),
    gitHead: resolveGitHead(REPO_ROOT),
    hubRoot: HUB_ROOT,
    blindQueryOnly: true,
    forbiddenQueryTokens: FORBIDDEN_QUERY_TOKENS,
    corpusFileCount: corpus.length,
    results,
    verdict,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report, null, 2));
  if (verdict !== 'POST_PUBLICATION_BLIND_RETRIEVAL_PASS') process.exit(1);
}

main();
