#!/usr/bin/env node
/**
 * Exact marker intersection query — skeleton default; opt-in body retrieve.
 * Owner: CapitalGlass-Cross-Agent (semantics). No semantic search in v1.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { markerKey } from './lib/correlation-markers-v1.mjs';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function parseArgs(argv) {
  const args = {
    markers: [],
    json: false,
    expand: false,
    retrieve: 0,
    input: null,
    help: false,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--json') args.json = true;
    else if (arg === '--expand') args.expand = true;
    else if (arg.startsWith('--marker=')) args.markers.push(arg.slice('--marker='.length));
    else if (arg.startsWith('--retrieve=')) args.retrieve = Number(arg.slice('--retrieve='.length)) || 0;
    else if (arg.startsWith('--input=')) args.input = arg.slice('--input='.length);
    else if (arg === '--help' || arg === '-h') args.help = true;
  }
  return args;
}

function loadHubCompact(inputPath) {
  const resolved = path.isAbsolute(inputPath) ? inputPath : path.join(REPO_ROOT, inputPath);
  return JSON.parse(fs.readFileSync(resolved, 'utf8'));
}

function collectIndexedObjects(hubCompact) {
  return (hubCompact.objects ?? []).map((object) => ({
    objectId: object.objectId,
    kind: object.kind,
    contentHash: object.contentHash,
    correlation: object.correlation ?? null,
    markerKeys: new Set(object.correlation?.markers ?? []),
  }));
}

export function correlateByMarkers({ hubCompact, requiredMarkers, expand = false, retrieve = 0 }) {
  const required = requiredMarkers.map((entry) => entry.replace(/^marker:/, ''));
  const objects = collectIndexedObjects(hubCompact);
  const matches = objects.filter((object) => required.every((marker) => object.markerKeys.has(marker)));

  const relationshipSummary = {};
  if (expand) {
    for (const edge of hubCompact.relationships ?? []) {
      const key = edge.relationship;
      relationshipSummary[key] = (relationshipSummary[key] ?? 0) + 1;
    }
  }

  return {
    schema: 'intelligence-correlate-result-v1@1.0.0',
    query: { markers: required, mode: 'exact-intersection' },
    counts: {
      matchingObjects: matches.length,
      missions: new Set(matches.map((m) => m.correlation?.correlationId).filter(Boolean)).size,
      receipts: matches.filter((m) => m.kind === 'RECEIPT_LEVERAGE_SIGNAL').length,
    },
    matches: matches.map((object) => ({
      objectId: object.objectId,
      kind: object.kind,
      correlationId: object.correlation?.correlationId ?? null,
      markerSetHash: object.correlation?.markerSetHash ?? null,
      contentHash: object.contentHash,
    })),
    relationshipSummary: expand ? relationshipSummary : undefined,
    retrieveNext: matches.slice(0, retrieve).map((object) => ({
      objectId: object.objectId,
      contentHash: object.contentHash,
      bodyLoaded: retrieve > 0,
    })),
  };
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(
      'Usage: npm run intelligence:correlate -- --marker=capability:CACHE --marker=subject:context-compilation [--input=path] [--expand] [--retrieve=N] [--json]',
    );
    process.exit(0);
  }
  if (args.markers.length === 0) {
    console.error('At least one --marker=type:id is required');
    process.exit(1);
  }

  const inputPath =
    args.input ??
    path.join(REPO_ROOT, 'artifacts/agent-runs/capital-glass-intelligence-ingest-real-v1/dry-run-out');

  const hubCompactPath = inputPath.endsWith('hub-compact.json')
    ? inputPath
    : path.join(inputPath, 'hub-compact.json');

  if (!fs.existsSync(hubCompactPath)) {
    console.error(`Input hub compact not found: ${hubCompactPath}`);
    process.exit(1);
  }

  const hubCompact = loadHubCompact(hubCompactPath);
  const result = correlateByMarkers({
    hubCompact,
    requiredMarkers: args.markers,
    expand: args.expand,
    retrieve: args.retrieve,
  });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(
      `matchingObjects=${result.counts.matchingObjects} missions=${result.counts.missions} receipts=${result.counts.receipts}`,
    );
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
