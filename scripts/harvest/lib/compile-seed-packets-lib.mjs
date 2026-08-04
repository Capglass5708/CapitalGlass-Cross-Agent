import fs from "node:fs";
import path from "node:path";

import { hashCanonicalJson } from "./hash.mjs";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function listSeedPackets(seedDir) {
  if (!fs.existsSync(seedDir)) return [];
  return fs
    .readdirSync(seedDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => readJson(path.join(seedDir, f)));
}

function seedToQaRecord(seed, harvestId, gitHead) {
  return {
    ihPfspId: seed.seedId,
    questionId: seed.seedId.replace(/[^A-Z0-9]/gi, "").slice(0, 12),
    canonicalQuestion: seed.retrievalQuestions[0],
    alternateQuestions: seed.retrievalQuestions.slice(1),
    shortAnswer: seed.summary,
    detailedAnswer: seed.title,
    currentStatus: seed.status === "APPROVED" ? "current" : "candidate",
    answerScope: "thread-autopsy",
    asOf: new Date().toISOString(),
    authorityRepo: seed.ownerRepo,
    authorityPath: [`artifacts/agent-runs/${harvestId}/seed-packets/${seed.seedId}.json`],
    authorityCommit: [gitHead.slice(0, 7)],
    evidenceUrls: seed.evidenceRefs,
    confidence: "partially_verified",
    keywords: [seed.kind, harvestId],
    entities: [seed.ownerRepo],
    relatedQuestionIds: [],
    supersedes: [],
    doNotAdvance: [],
    sensitiveFieldsRedacted: true,
    rawScanRequired: false,
    retrievalPriority: seed.roiRank === 1 ? "critical" : "standard",
    futureAgentInstructions: seed.futureAgentInstructions,
    promotionClass: seed.promotionClass,
    kind: seed.kind,
  };
}

function buildCatalogStub(seed, harvestId, gitHead) {
  const objectId = seed.seedId.toLowerCase();
  const contentHash = hashCanonicalJson(seed);
  return {
    envelope: {
      knowledgeDomain: "cross-agent-harvest",
      knowledgeObjectType: "harvest-thread-autopsy-seed",
      knowledgeObjectId: objectId,
      schemaVersion: "1.0.0",
      provenanceClass: "HARVEST_AUTHORITY",
      authoritySource: {
        system: "github",
        repository: "CapitalGlass-Cross-Agent",
        commit: gitHead,
        branch: "main",
        harvestId,
        seedId: seed.seedId,
      },
      cacheEligibility: "retrieval_eligible",
      createdAt: new Date().toISOString(),
      verificationState: "PARTIALLY_VERIFIED",
      bindingRule: "GIT_HARVEST_THREAD_AUTOPSY",
      defaultRetrievalEligible: true,
      supersessionState: "current",
      supersededByObjectId: null,
      retrievalTier: seed.roiRank === 1 ? "critical" : "standard",
      contentHash,
    },
    body: {
      seedId: seed.seedId,
      kind: seed.kind,
      title: seed.title,
      summary: seed.summary,
      canonicalQuestion: seed.retrievalQuestions[0],
      alternateQuestions: seed.retrievalQuestions.slice(1),
      shortAnswer: seed.summary,
      detailedAnswer: seed.title,
      retrievalQuestions: seed.retrievalQuestions,
      futureAgentInstructions: seed.futureAgentInstructions,
      evidenceRefs: seed.evidenceRefs,
      executionDeltaRefs: seed.executionDeltaRefs ?? [],
      wasteIds: seed.wasteIds ?? [],
      operatorFrictionIds: seed.operatorFrictionIds ?? [],
      roiRank: seed.roiRank ?? null,
      doNotAdvance: [],
      promotionClass: seed.promotionClass,
      status: seed.status ?? "CANDIDATE",
      authorityRepo: seed.ownerRepo,
      authorityPath: [`artifacts/agent-runs/${harvestId}/seed-packets/${seed.seedId}.json`],
      harvestId,
    },
  };
}

/**
 * Compile seed-packets/ + autopsy bundle into qa-index, catalog stubs, and manifests.
 */
export function compileSeedPackets({ repoRoot, harvestId, gitHead }) {
  const runDir = path.join(repoRoot, "artifacts/agent-runs", harvestId);
  const manifestFile = path.join(runDir, "harvest-manifest-v1.json");
  const errors = [];

  if (!fs.existsSync(manifestFile)) {
    return { ok: false, errors: [`missing manifest: ${manifestFile}`] };
  }

  const manifest = readJson(manifestFile);
  const bundlePath = path.join(runDir, "thread-autopsy-bundle.json");
  const bundle = fs.existsSync(bundlePath) ? readJson(bundlePath) : null;
  const seedDir = path.join(runDir, "seed-packets");
  const seeds = listSeedPackets(seedDir);

  if (seeds.length === 0) {
    const legacyQa = path.join(runDir, "qa-index.json");
    if (fs.existsSync(legacyQa)) {
      return {
        ok: true,
        mode: "legacy-qa-index",
        harvestId,
        seedCount: readJson(legacyQa).records?.length ?? 0,
        outputs: { qaIndexPath: legacyQa },
      };
    }
    return { ok: false, errors: ["no seed-packets/ and no legacy qa-index.json"] };
  }

  const qaRecords = seeds.map((s) => seedToQaRecord(s, harvestId, gitHead));
  const catalogStubs = seeds.map((s) => buildCatalogStub(s, harvestId, gitHead));

  const roiTop3 = (bundle?.roiBacklog ?? [])
    .slice(0, 3)
    .map((r) => ({ rank: r.rank, title: r.title, seedId: seeds.find((s) => s.roiRank === r.rank)?.seedId ?? null }));

  const retrievalQuestions = seeds.flatMap((s, i) =>
    s.retrievalQuestions.map((query, j) => ({
      retrievalId: `RQ${String(i * 10 + j + 1).padStart(2, "0")}`,
      seedId: s.seedId,
      query,
    })),
  );

  const qaIndex = {
    schemaVersion: "cross-agent-harvest-qa-index-v1@1.0.0",
    harvestId,
    chatTranscriptCoverage: bundle ? "THREAD_AUTOPSY" : "PARTIAL",
    records: qaRecords,
  };

  const seedPacketIndex = {
    schemaVersion: "harvest-seed-packet-index-v1@1.0.0",
    harvestId,
    compiledAt: new Date().toISOString(),
    sourceCommitSha: gitHead,
    seedIds: seeds.map((s) => s.seedId),
    catalogObjectType: "harvest-thread-autopsy-seed",
  };

  const seedManifest = {
    schemaVersion: "cross-agent-harvest-seed-manifest-v1@1.0.0",
    harvestId,
    subject: manifest.packets?.[0]?.packetTitle ?? harvestId,
    tier: manifest.threadAutopsy?.tier ?? bundle?.tier ?? "T2",
    seedRecordCount: seeds.length,
    retrievalQuestions,
    roiTop3,
    byKindSlice: "00-master-index/BY-KIND/thread-autopsy-index.json",
    catalogRoot: "02-catalog/knowledge-objects/cross-agent-harvest",
  };

  const catalogStubsDir = path.join(runDir, "hub-catalog-stubs");
  fs.mkdirSync(catalogStubsDir, { recursive: true });
  for (const stub of catalogStubs) {
    const fileName = `${stub.body.seedId}.json`;
    writeJson(path.join(catalogStubsDir, fileName), stub);
  }

  const qaIndexPath = path.join(runDir, "qa-index.json");
  const seedPacketIndexPath = path.join(runDir, "seed-packet-index.json");
  const seedManifestPath = path.join(runDir, "intelligence-hub-seed-manifest.json");
  const compileReceiptPath = path.join(runDir, "compile-seed-packets-receipt.json");

  writeJson(qaIndexPath, qaIndex);
  writeJson(seedPacketIndexPath, seedPacketIndex);
  writeJson(seedManifestPath, seedManifest);

  const receipt = {
    schemaVersion: "cross-agent-compile-seed-packets-receipt-v1@1.0.0",
    harvestId,
    compiledAt: new Date().toISOString(),
    sourceCommitSha: gitHead,
    seedCount: seeds.length,
    outputs: {
      qaIndexPath: `artifacts/agent-runs/${harvestId}/qa-index.json`,
      seedPacketIndexPath: `artifacts/agent-runs/${harvestId}/seed-packet-index.json`,
      intelligenceHubSeedManifestPath: `artifacts/agent-runs/${harvestId}/intelligence-hub-seed-manifest.json`,
      hubCatalogStubsDir: `artifacts/agent-runs/${harvestId}/hub-catalog-stubs`,
    },
  };
  writeJson(compileReceiptPath, receipt);

  return {
    ok: errors.length === 0,
    mode: "thread-autopsy-seed",
    harvestId,
    seedCount: seeds.length,
    errors,
    outputs: { qaIndexPath, seedPacketIndexPath, seedManifestPath, catalogStubsDir, compileReceiptPath },
    qaIndex,
    seedManifest,
    catalogStubs,
  };
}
