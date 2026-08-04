import fs from "node:fs";
import path from "node:path";

import { hashCanonicalJson } from "./hash.mjs";
import { compileSeedPackets } from "./compile-seed-packets-lib.mjs";
import { runDuplicationPreflight } from "./duplication-preflight-lib.mjs";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function resolveHubRoot(env = process.env) {
  const candidates = [
    env.INTELLIGENCE_HUB_ROOT?.trim(),
    env.CG_INTELLIGENCE_HUB_ROOT?.trim(),
    "/mnt/l/Capital-Glass-Intelligence-Hub",
    "/mnt/z/Capital-Glass-Intelligence-Hub",
  ].filter(Boolean);
  for (const root of candidates) {
    if (fs.existsSync(path.join(root, "00-master-index", "BY-KIND"))) {
      return root;
    }
  }
  return candidates[0] ?? "/mnt/l/Capital-Glass-Intelligence-Hub";
}

function buildLegacyKnowledgeObject(record, harvestId, gitHead, contentHash) {
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
        harvestId,
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
    body: { ...record },
  };
}

function upsertThreadAutopsyIndex({ hubRoot, harvestId, gitHead, seedManifest, manifest, publishedSeedIds }) {
  const indexPath = path.join(hubRoot, "00-master-index/BY-KIND/thread-autopsy-index.json");
  let existing = {
    schemaVersion: "intelligence-hub-thread-autopsy-index-slice-v1@1.0.0",
    sourceCommitSha: gitHead,
    updatedAt: new Date().toISOString(),
    harvestCount: 0,
    harvests: [],
    criticalSeedIds: [],
    retrievalHint:
      "Load individual seeds from 02-catalog/knowledge-objects/cross-agent-harvest/<seedId>.json",
  };
  if (fs.existsSync(indexPath)) {
    existing = { ...existing, ...readJson(indexPath) };
  }

  const harvests = (existing.harvests ?? []).filter((h) => h.harvestId !== harvestId);
  harvests.push({
    harvestId,
    subject: seedManifest.subject ?? harvestId,
    tier: seedManifest.tier ?? "T2",
    seedIds: publishedSeedIds,
    roiTop3: seedManifest.roiTop3 ?? [],
    doNotAdvanceRefs: manifest.doNotAdvance ?? [],
    catalogRoot: "02-catalog/knowledge-objects/cross-agent-harvest",
    gitAuthorityPath: `artifacts/agent-runs/${harvestId}/harvest-manifest-v1.json`,
  });

  const criticalFromRoi = (seedManifest.roiTop3 ?? [])
    .filter((r) => r.rank === 1 && r.seedId)
    .map((r) => r.seedId);
  const criticalSeedIds = [...new Set([...(existing.criticalSeedIds ?? []), ...criticalFromRoi])].filter(
    Boolean,
  );

  const slice = {
    schemaVersion: "intelligence-hub-thread-autopsy-index-slice-v1@1.0.0",
    sourceCommitSha: gitHead,
    updatedAt: new Date().toISOString(),
    harvestCount: harvests.length,
    harvests,
    criticalSeedIds,
    retrievalHint: existing.retrievalHint,
  };
  writeJson(indexPath, slice);
  return slice;
}

function writePerHarvestPointer({ hubRoot, harvestId, gitHead, seedManifest, publishedSeedIds }) {
  const slug = harvestId.replace(/^harvest-/, "").replace(/-v\d+$/, "");
  const fileName = `cross-agent-harvest-${slug}.json`;
  const pointer = {
    schemaVersion: "cross-agent-harvest-by-kind-slice-v1@1.0.0",
    harvestId,
    sourceCommitSha: gitHead,
    publishedAt: new Date().toISOString(),
    seedRecordCount: publishedSeedIds.length,
    seedIds: publishedSeedIds,
    catalogDomain: "cross-agent-harvest",
    catalogRoot: "02-catalog/knowledge-objects/cross-agent-harvest",
    subject: seedManifest.subject,
    retrievalQuestions: seedManifest.retrievalQuestions,
    threadAutopsyIndex: "00-master-index/BY-KIND/thread-autopsy-index.json",
  };
  const dest = path.join(hubRoot, "00-master-index/BY-KIND", fileName);
  writeJson(dest, pointer);
  return `00-master-index/BY-KIND/${fileName}`;
}

/**
 * Publish compiled seeds to L: Intelligence Hub catalog.
 */
export function publishHubSeed({
  repoRoot,
  harvestId,
  gitHead,
  hubRoot = null,
  allowRepublish = false,
  allowSupersedeSeedIds = [],
} = {}) {
  const HUB_ROOT = hubRoot ?? resolveHubRoot();
  const hubIndexRoot = path.join(HUB_ROOT, "00-master-index");
  if (!fs.existsSync(path.join(hubIndexRoot, "BY-KIND"))) {
    return { ok: false, errors: [`L: not mounted at ${hubIndexRoot}`] };
  }

  const runDir = path.join(repoRoot, "artifacts/agent-runs", harvestId);
  const manifest = readJson(path.join(runDir, "harvest-manifest-v1.json"));
  const bundle = readJson(path.join(runDir, "thread-autopsy-bundle.json"));

  const duplication = runDuplicationPreflight({
    repoRoot,
    harvestId,
    runDir,
    manifest,
    bundle,
    hubRoot: HUB_ROOT,
    gitHead,
    mode: "publish",
    allowRepublish: allowRepublish || Boolean(manifest.supersession?.replacesHarvestId),
    allowSupersedeSeedIds,
    writeReceipt: true,
  });
  if (!duplication.ok) {
    return { ok: false, errors: duplication.errors, duplication };
  }

  const compile =
    fs.existsSync(path.join(runDir, "qa-index.json")) &&
    fs.existsSync(path.join(runDir, "hub-catalog-stubs"))
      ? null
      : compileSeedPackets({ repoRoot, harvestId, gitHead });

  if (compile && !compile.ok) {
    return { ok: false, errors: compile.errors };
  }

  const stubsDir = path.join(runDir, "hub-catalog-stubs");
  const qaIndex = readJson(path.join(runDir, "qa-index.json"));
  const seedManifest = readJson(path.join(runDir, "intelligence-hub-seed-manifest.json"));

  const catalogDir = path.join(HUB_ROOT, "02-catalog/knowledge-objects/cross-agent-harvest");
  fs.mkdirSync(catalogDir, { recursive: true });

  const counts = { inserted: 0, updated: 0, unchanged: 0, conflicted: 0 };
  const publishedIds = [];

  const publishObject = (object, fileBaseName) => {
    const dest = path.join(catalogDir, `${fileBaseName}.json`);
    const next = `${JSON.stringify(object, null, 2)}\n`;
    if (!fs.existsSync(dest)) {
      fs.writeFileSync(dest, next, "utf8");
      counts.inserted += 1;
    } else {
      const prior = fs.readFileSync(dest, "utf8");
      if (prior === next) counts.unchanged += 1;
      else {
        fs.writeFileSync(dest, next, "utf8");
        counts.updated += 1;
      }
    }
    publishedIds.push(fileBaseName);
  };

  if (fs.existsSync(stubsDir)) {
    for (const file of fs.readdirSync(stubsDir).filter((f) => f.endsWith(".json"))) {
      const stub = readJson(path.join(stubsDir, file));
      publishObject(stub, stub.body.seedId);
    }
  } else {
    for (const record of qaIndex.records) {
      const contentHash = hashCanonicalJson(record);
      const object = buildLegacyKnowledgeObject(record, harvestId, gitHead, contentHash);
      publishObject(object, record.ihPfspId);
    }
  }

  const threadAutopsySlice = upsertThreadAutopsyIndex({
    hubRoot: HUB_ROOT,
    harvestId,
    gitHead,
    seedManifest,
    manifest,
    publishedSeedIds: publishedIds,
  });

  const perHarvestPointer = writePerHarvestPointer({
    hubRoot: HUB_ROOT,
    harvestId,
    gitHead,
    seedManifest,
    publishedSeedIds: publishedIds,
  });

  const opsDir = path.join(HUB_ROOT, "00-master-index/_operations/cross-agent-harvest-publication");
  fs.mkdirSync(opsDir, { recursive: true });

  const receipt = {
    schemaVersion: "cross-agent-harvest-hub-publication-receipt-v1@1.0.0",
    harvestId,
    generatedAt: new Date().toISOString(),
    verdict: "PUBLISH_PASS",
    sourceCommitSha: gitHead,
    contentHash: hashCanonicalJson({ qaIndex: qaIndex.records, threadAutopsySlice }),
    intelligenceHubRoot: HUB_ROOT,
    counts,
    publishedRecordIds: publishedIds,
    knowledgeObjectType: fs.existsSync(stubsDir) ? "harvest-thread-autopsy-seed" : "harvest-qa-record",
    byKindSlicePath: "00-master-index/BY-KIND/thread-autopsy-index.json",
    perHarvestPointerPath: perHarvestPointer,
    catalogPaths: publishedIds.map((id) => `02-catalog/knowledge-objects/cross-agent-harvest/${id}.json`),
  };

  writeJson(path.join(opsDir, "LATEST-harvest-publication.json"), receipt);
  writeJson(path.join(runDir, "hub-publication-receipt.json"), receipt);

  return { ok: true, receipt, counts, publishedIds, hubRoot: HUB_ROOT, duplication };
}
