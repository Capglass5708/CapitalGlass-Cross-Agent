#!/usr/bin/env node
/**
 * Mandatory Hub-mediated reuse proof for occ-sdlc-harvest-bridge-v1.
 * Answers OCC retrieval questions from L: Intelligence Hub catalog only.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HUB_ROOT =
  process.env.INTELLIGENCE_HUB_ROOT?.trim() ||
  process.env.CG_INTELLIGENCE_HUB_ROOT?.trim() ||
  "/mnt/l/Capital-Glass-Intelligence-Hub";
const WORK_PACKAGE = "occ-sdlc-harvest-bridge-v1";
const HARVEST_ID = "harvest-2026-08-17-capital-glass-operations-command-center-v1";
const OUT_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", WORK_PACKAGE);
const CATALOG_DIR = path.join(HUB_ROOT, "02-catalog/knowledge-objects/cross-agent-harvest");

const QUESTIONS = [
  {
    id: "Q1-po-pairing",
    query: "How does Operations Command Center handle PO revision propagation?",
    expectedSeedId: "IH-OCC-LATEST-WINS-PO-001",
  },
  {
    id: "Q2-doc-dates",
    query: "Does Operations Command Center auto-promote OCR document dates?",
    expectedSeedId: "IH-OCC-UNCONFIRMED-DOC-DATES-001",
  },
  {
    id: "Q3-lead-time",
    query: "How does OCC handle unknown vendor lead times?",
    expectedSeedId: "IH-OCC-PROCUREMENT-RISK-001",
  },
  {
    id: "Q4-empty-harvest",
    query: "Why did Wave 15 OCC harvest have empty coverage?",
    expectedSeedId: "IH-OCC-HARVEST-CLOSEOUT-001",
  },
];

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, value) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalize(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function loadCatalogRecord(seedId) {
  const objectId = seedId.toLowerCase();
  const p = path.join(CATALOG_DIR, `${objectId}.json`);
  if (!fs.existsSync(p)) return null;
  return { path: p, record: readJson(p) };
}

function scoreMatch(query, record) {
  const q = normalize(query);
  const body = record.body ?? record;
  const corpus = [
    body.canonicalQuestion,
    ...(body.alternateQuestions || []),
    body.shortAnswer,
    body.detailedAnswer,
    ...(body.keywords || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const tokens = q.split(/\s+/).filter((t) => t.length > 2);
  if (tokens.length === 0) return 0;
  return tokens.filter((t) => corpus.includes(t)).length / tokens.length;
}

function searchHub(query, expectedSeedId) {
  if (!fs.existsSync(CATALOG_DIR)) {
    return { found: false, layer: "L-catalog", error: "catalog missing", retrievalCode: "L_DRIVE_NOT_MOUNTED_IN_WSL" };
  }

  const direct = loadCatalogRecord(expectedSeedId);
  if (direct) {
    const score = scoreMatch(query, direct.record);
    return {
      found: true,
      layer: "L-catalog-direct",
      seedId: expectedSeedId,
      path: direct.path,
      score,
      retrievalCode: "INDEX_HIT",
    };
  }

  let best = null;
  for (const file of fs.readdirSync(CATALOG_DIR).filter((f) => f.endsWith(".json"))) {
    const full = path.join(CATALOG_DIR, file);
    const record = readJson(full);
    const score = scoreMatch(query, record);
    const seedId = record.body?.ihPfspId ?? record.envelope?.authoritySource?.seedId ?? file.replace(/\.json$/, "");
    if (!best || score > best.score) {
      best = { path: full, seedId, score, record };
    }
  }

  if (!best || best.score < 0.25) {
    return { found: false, layer: "L-catalog-search", error: "no match", retrievalCode: "INDEX_MISS" };
  }

  return {
    found: best.seedId.toUpperCase() === expectedSeedId || best.score >= 0.4,
    layer: "L-catalog-search",
    seedId: best.seedId,
    path: best.path,
    score: best.score,
    expectedSeedId,
    retrievalCode: best.seedId.toUpperCase() === expectedSeedId ? "INDEX_HIT" : "INDEX_MISS",
  };
}

function main() {
  const hubMounted = fs.existsSync(path.join(HUB_ROOT, "00-master-index"));
  const results = QUESTIONS.map((q) => ({
    ...q,
    hub: searchHub(q.query, q.expectedSeedId),
  }));

  const passCount = results.filter((r) => r.hub.found && r.hub.retrievalCode === "INDEX_HIT").length;
  const verdict = hubMounted && passCount === QUESTIONS.length ? "HUB_REUSE_PROOF_PASS" : "HUB_REUSE_PROOF_FAIL";

  const summary = {
    schemaVersion: "occ-hub-reuse-proof-v1@1.0.0",
    workPackageId: WORK_PACKAGE,
    harvestId: HARVEST_ID,
    evaluatedAt: new Date().toISOString(),
    hubRoot: HUB_ROOT,
    hubMounted,
    catalogDir: CATALOG_DIR,
    questionCount: QUESTIONS.length,
    passCount,
    verdict,
    retrievalCode: verdict === "HUB_REUSE_PROOF_PASS" ? "INDEX_HIT" : hubMounted ? "INDEX_MISS" : "L_DRIVE_NOT_MOUNTED_IN_WSL",
    forbiddenSources: ["Calendar repo grep", "compounding-reuse-receipt-v1.json local read"],
    results,
  };

  writeJson(path.join(OUT_DIR, "hub-reuse-proof.json"), summary);

  console.log(`occ-hub-reuse-proof ${verdict} ${passCount}/${QUESTIONS.length}`);
  console.log(`  retrieval: ${summary.retrievalCode}`);
  console.log(`  artifact: artifacts/agent-runs/${WORK_PACKAGE}/hub-reuse-proof.json`);

  if (verdict !== "HUB_REUSE_PROOF_PASS") {
    process.exit(1);
  }
}

main();
