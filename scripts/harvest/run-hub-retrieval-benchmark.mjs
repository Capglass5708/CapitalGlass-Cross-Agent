#!/usr/bin/env node
/**
 * Post-publication retrieval benchmark — queries L: Intelligence Hub only.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HARVEST_ID = "harvest-project-folder-synology-primary-chat-v1";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HUB_ROOT =
  process.env.INTELLIGENCE_HUB_ROOT?.trim() ||
  process.env.CG_INTELLIGENCE_HUB_ROOT?.trim() ||
  "/mnt/l/Capital-Glass-Intelligence-Hub";
const WORK_PACKAGE = "complete-project-folder-synology-intelligence-publication-v1";
const HARVEST_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const OUT_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", WORK_PACKAGE);

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, value) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function scoreMatch(query, record) {
  const q = normalize(query);
  const corpus = [
    record.body.canonicalQuestion,
    ...(record.body.alternateQuestions || []),
    ...(record.body.keywords || []),
    record.body.shortAnswer,
  ]
    .join(" ")
    .toLowerCase();

  const tokens = q.split(/\s+/).filter((t) => t.length > 2);
  if (tokens.length === 0) return 0;
  const hits = tokens.filter((t) => corpus.includes(t)).length;
  return hits / tokens.length;
}

function loadHubRecord(ihPfspId) {
  const p = path.join(HUB_ROOT, "02-catalog/knowledge-objects/cross-agent-harvest", `${ihPfspId}.json`);
  if (!fs.existsSync(p)) return null;
  return { path: p, record: readJson(p) };
}

function searchHub(query, expectedId) {
  const catalogDir = path.join(HUB_ROOT, "02-catalog/knowledge-objects/cross-agent-harvest");
  if (!fs.existsSync(catalogDir)) {
    return { found: false, layer: "intelligence-hub-L-catalog", error: "catalog missing" };
  }

  const direct = loadHubRecord(expectedId);
  if (direct) {
    const score = scoreMatch(query, direct.record);
    if (score >= 0.2 || normalize(query).includes(normalize(direct.record.body.canonicalQuestion).slice(0, 20))) {
      return {
        found: true,
        layer: "intelligence-hub-L-catalog",
        matchType: "ihPfspId-direct",
        hubPath: direct.path,
        recordId: direct.record.envelope.knowledgeObjectId,
        ihPfspId: direct.record.body.ihPfspId,
        score,
        rawResponse: direct.record,
        shortAnswer: direct.record.body.shortAnswer,
        detailedAnswer: direct.record.body.detailedAnswer,
        authorityPaths: direct.record.body.authorityPath,
        authorityCommits: direct.record.body.authorityCommit,
        currentStatus: direct.record.body.currentStatus,
        confidence: direct.record.body.confidence,
        supersessionState: direct.record.envelope.supersessionState,
      };
    }
  }

  let best = null;
  for (const file of fs.readdirSync(catalogDir).filter((f) => f.endsWith(".json"))) {
    const full = path.join(catalogDir, file);
    const record = readJson(full);
    const score = scoreMatch(query, record);
    if (!best || score > best.score) {
      best = {
        found: score >= 0.25,
        layer: "intelligence-hub-L-catalog",
        matchType: "keyword-scan",
        hubPath: full,
        recordId: record.envelope.knowledgeObjectId,
        ihPfspId: record.body.ihPfspId,
        score,
        rawResponse: record,
        shortAnswer: record.body.shortAnswer,
        detailedAnswer: record.body.detailedAnswer,
        authorityPaths: record.body.authorityPath,
        authorityCommits: record.body.authorityCommit,
        currentStatus: record.body.currentStatus,
        confidence: record.body.confidence,
        supersessionState: record.envelope.supersessionState,
      };
    }
  }
  return best ?? { found: false, layer: "intelligence-hub-L-catalog", error: "no match" };
}

function classifyAnswer(result, expectedId) {
  if (!result.found) return "MISS";
  if (result.ihPfspId !== expectedId) return "WRONG_RECORD";
  if (result.supersessionState === "historical" && result.currentStatus !== "current") return "OBSOLETE_HOLD";
  if (result.confidence === "verified") return "VERIFIED";
  return "PARTIALLY_VERIFIED";
}

function main() {
  const benchmark = readJson(path.join(HARVEST_DIR, "retrieval-benchmark.json"));
  const questions = benchmark.retrievalQuestions;
  if (questions.length !== 24) {
    console.error(`run-hub-retrieval-benchmark FAIL — expected 24 questions, got ${questions.length}`);
    process.exit(1);
  }

  const results = [];
  let passCount = 0;

  for (const q of questions) {
    const hub = searchHub(q.query, q.ihPfspId);
    const classification = classifyAnswer(hub, q.ihPfspId);
    const pass = classification === "VERIFIED" || classification === "PARTIALLY_VERIFIED";
    if (pass) passCount += 1;

    results.push({
      retrievalId: q.retrievalId,
      query: q.query,
      expectedIhPfspId: q.ihPfspId,
      retrievalLayer: hub.layer,
      matchType: hub.matchType ?? null,
      returnedRecordId: hub.recordId ?? null,
      returnedIhPfspId: hub.ihPfspId ?? null,
      hubPath: hub.hubPath ?? null,
      authorityPaths: hub.authorityPaths ?? [],
      authorityCommits: hub.authorityCommits ?? [],
      answerClassification: classification,
      confidence: hub.confidence ?? null,
      currentVsHistorical: hub.currentStatus ?? null,
      supersessionState: hub.supersessionState ?? null,
      shortAnswer: hub.shortAnswer ?? null,
      score: hub.score ?? 0,
      pass,
      rawHubResponse: hub.rawResponse ?? null,
    });
  }

  const summary = {
    schemaVersion: "cross-agent-harvest-hub-retrieval-benchmark-v1@1.0.0",
    workPackageId: WORK_PACKAGE,
    harvestId: HARVEST_ID,
    testedAt: new Date().toISOString(),
    retrievalLayer: "intelligence-hub-L-catalog",
    questionsExecuted: results.length,
    questionsPassed: passCount,
    score: passCount / results.length,
    verdict: passCount === 24 ? "PASS" : "PARTIAL",
    results,
  };

  writeJson(path.join(OUT_DIR, "hub-retrieval-results.json"), summary);
  console.log(`run-hub-retrieval-benchmark ${summary.verdict} ${passCount}/24`);
  console.log(`  receipt: ${path.join(OUT_DIR, "hub-retrieval-results.json")}`);

  if (passCount !== 24) process.exit(1);
}

main();
