#!/usr/bin/env node
/**
 * Publish harvest Q&A seed records to L: Intelligence Hub catalog.
 * Requires clean git worktree and mounted INTELLIGENCE_HUB_ROOT.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashCanonicalJson } from "./lib/hash.mjs";
import { resolveGitHead } from "../index/lib/git-head.mjs";
const HARVEST_ID = "harvest-project-folder-synology-primary-chat-v1";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HUB_ROOT =
  process.env.INTELLIGENCE_HUB_ROOT?.trim() ||
  process.env.CG_INTELLIGENCE_HUB_ROOT?.trim() ||
  "/mnt/l/Capital-Glass-Intelligence-Hub";
const WORK_PACKAGE = "complete-project-folder-synology-intelligence-publication-v1";
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const OUT_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", WORK_PACKAGE);

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function writeJson(p, value) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function buildKnowledgeObject(record, gitHead, contentHash) {
  const objectId = record.ihPfspId.toLowerCase();
  return {
    envelope: {
      knowledgeDomain: "cross-agent-harvest",
      knowledgeObjectType: "harvest-qa-record",
      knowledgeObjectId: objectId,
      schemaVersion: "1.0.0",
      provenanceClass: "HARVEST_AUTHORITY",
      authoritySource: {
        system: "github",
        repository: "CapitalGlass-Cross-Agent",
        commit: gitHead,
        branch: "main",
        harvestId: HARVEST_ID,
        ihPfspId: record.ihPfspId,
      },
      cacheEligibility: "retrieval_eligible",
      createdAt: new Date().toISOString(),
      verificationState: record.confidence === "verified" ? "VERIFIED" : "PARTIALLY_VERIFIED",
      bindingRule: "GIT_HARVEST_CANONICAL_HUB_PROJECTS",
      defaultRetrievalEligible: true,
      supersessionState: record.currentStatus === "current" ? "current" : "historical",
      supersededByObjectId: null,
      retrievalTier: record.retrievalPriority === "critical" ? "critical" : "standard",
      contentHash,
    },
    body: {
      ihPfspId: record.ihPfspId,
      questionId: record.questionId,
      canonicalQuestion: record.canonicalQuestion,
      alternateQuestions: record.alternateQuestions,
      shortAnswer: record.shortAnswer,
      detailedAnswer: record.detailedAnswer,
      currentStatus: record.currentStatus,
      answerScope: record.answerScope,
      asOf: record.asOf,
      authorityRepo: record.authorityRepo,
      authorityPath: record.authorityPath,
      authorityCommit: record.authorityCommit,
      evidenceUrls: record.evidenceUrls,
      confidence: record.confidence,
      keywords: record.keywords,
      entities: record.entities,
      relatedQuestionIds: record.relatedQuestionIds,
      supersedes: record.supersedes,
      doNotAdvance: record.doNotAdvance,
      sensitiveFieldsRedacted: record.sensitiveFieldsRedacted,
      rawScanRequired: record.rawScanRequired,
      retrievalPriority: record.retrievalPriority,
    },
  };
}

function main() {
  const gitHead = resolveGitHead(REPO_ROOT);
  const hubIndexRoot = path.join(HUB_ROOT, "00-master-index");
  if (!fs.existsSync(path.join(hubIndexRoot, "BY-KIND"))) {
    console.error(`publish-intelligence-hub-seed FAIL — L: not mounted at ${hubIndexRoot}`);
    process.exit(1);
  }

  const qaIndex = readJson(path.join(RUN_DIR, "qa-index.json"));
  const seedManifest = readJson(path.join(RUN_DIR, "intelligence-hub-seed-manifest.json"));
  const compact = readJson(path.join(RUN_DIR, "compact-retrieval-records.json"));

  if (qaIndex.records.length !== 22) {
    console.error(`publish-intelligence-hub-seed FAIL — expected 22 records, got ${qaIndex.records.length}`);
    process.exit(1);
  }

  const catalogDir = path.join(HUB_ROOT, "02-catalog/knowledge-objects/cross-agent-harvest");
  fs.mkdirSync(catalogDir, { recursive: true });

  const counts = { inserted: 0, updated: 0, unchanged: 0, rejected: 0, conflicted: 0 };
  const publishedIds = [];

  for (const record of qaIndex.records) {
    const contentHash = hashCanonicalJson(record);
    const object = buildKnowledgeObject(record, gitHead, contentHash);
    const dest = path.join(catalogDir, `${record.ihPfspId}.json`);
    const next = `${JSON.stringify(object, null, 2)}\n`;

    if (!fs.existsSync(dest)) {
      fs.writeFileSync(dest, next, "utf8");
      counts.inserted += 1;
    } else {
      const prior = fs.readFileSync(dest, "utf8");
      if (prior === next) {
        counts.unchanged += 1;
      } else {
        const priorObj = JSON.parse(prior);
        if (
          priorObj.envelope?.authoritySource?.commit &&
          priorObj.envelope.authoritySource.commit !== gitHead &&
          priorObj.body?.shortAnswer !== record.shortAnswer
        ) {
          counts.conflicted += 1;
        }
        fs.writeFileSync(dest, next, "utf8");
        counts.updated += 1;
      }
    }
    publishedIds.push(record.ihPfspId);
  }

  const byKindSlice = {
    schemaVersion: "cross-agent-harvest-by-kind-slice-v1@1.0.0",
    harvestId: HARVEST_ID,
    workPackageId: WORK_PACKAGE,
    sourceCommitSha: gitHead,
    publishedAt: new Date().toISOString(),
    seedRecordCount: qaIndex.records.length,
    ihPfspIds: publishedIds,
    catalogDomain: "cross-agent-harvest",
    catalogRoot: "02-catalog/knowledge-objects/cross-agent-harvest",
    compactRecordIds: compact.records.map((r) => r.recordId),
    chatTranscriptCoverage: qaIndex.chatTranscriptCoverage,
    subject: "Synology-primary project-folder program — contract through production stabilization",
    retrievalQuestions: seedManifest.retrievalQuestions,
  };

  const byKindPath = path.join(HUB_ROOT, "00-master-index/BY-KIND/cross-agent-harvest-project-folder-synology.json");
  writeJson(byKindPath, byKindSlice);

  const opsDir = path.join(HUB_ROOT, "00-master-index/_operations/cross-agent-harvest-publication");
  fs.mkdirSync(opsDir, { recursive: true });

  const receipt = {
    schemaVersion: "cross-agent-harvest-hub-publication-receipt-v1@1.0.0",
    workPackageId: WORK_PACKAGE,
    harvestId: HARVEST_ID,
    generatedAt: new Date().toISOString(),
    verdict: "PUBLISH_PASS",
    sourceCommitSha: gitHead,
    contentHash: hashCanonicalJson({ qaIndex: qaIndex.records, byKindSlice }),
    intelligenceHubRoot: HUB_ROOT,
    counts,
    publishedRecordIds: publishedIds,
    byKindSlicePath: "00-master-index/BY-KIND/cross-agent-harvest-project-folder-synology.json",
    catalogPaths: publishedIds.map((id) => `02-catalog/knowledge-objects/cross-agent-harvest/${id}.json`),
  };

  writeJson(path.join(opsDir, "LATEST-harvest-publication.json"), receipt);
  writeJson(path.join(OUT_DIR, "hub-publication-receipt.json"), receipt);

  console.log(`publish-intelligence-hub-seed PUBLISH_PASS sha=${gitHead}`);
  console.log(`  inserted=${counts.inserted} updated=${counts.updated} unchanged=${counts.unchanged}`);
  console.log(`  receipt: ${path.join(OUT_DIR, "hub-publication-receipt.json")}`);
}

main();
