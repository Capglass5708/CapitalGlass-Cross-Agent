import fs from "node:fs";
import path from "node:path";

import { hashCanonicalJson } from "./hash.mjs";
import { resolveHubRoot } from "./publish-hub-seed-lib.mjs";

const REQUIRED_HUB_SLICES = [
  "active-work-blockers.json",
  "thread-autopsy-index.json",
];

const SEMANTIC_DUPLICATE_THRESHOLD = 0.65;

function readJsonSafe(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function tokenize(text) {
  return String(text ?? "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3);
}

function jaccardSimilarity(a, b) {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function listSeedPackets(runDir) {
  const seedDir = path.join(runDir, "seed-packets");
  if (!fs.existsSync(seedDir)) return [];
  return fs
    .readdirSync(seedDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => readJsonSafe(path.join(seedDir, f)))
    .filter(Boolean);
}

function loadCatalogSeeds(hubRoot) {
  const catalogDir = path.join(hubRoot, "02-catalog/knowledge-objects/cross-agent-harvest");
  if (!fs.existsSync(catalogDir)) return [];
  const seeds = [];
  for (const file of fs.readdirSync(catalogDir).filter((f) => f.endsWith(".json"))) {
    const obj = readJsonSafe(path.join(catalogDir, file));
    if (!obj) continue;
    const body = obj.body ?? obj;
    const seedId = body.seedId ?? body.ihPfspId ?? path.basename(file, ".json");
    const retrievalQuestions = body.retrievalQuestions ?? [
      body.canonicalQuestion,
      ...(body.alternateQuestions ?? []),
    ].filter(Boolean);
    seeds.push({
      seedId,
      file,
      retrievalQuestions,
      contentHash: obj.envelope?.contentHash ?? null,
      harvestId: obj.envelope?.authoritySource?.harvestId ?? body.harvestId ?? null,
    });
  }
  return seeds;
}

function loadThreadAutopsyIndex(hubRoot) {
  return readJsonSafe(
    path.join(hubRoot, "00-master-index/BY-KIND/thread-autopsy-index.json"),
  );
}

function consultSources({ repoRoot, hubRoot }) {
  const sources = {
    registry: null,
    commandIndex: null,
    hubSlices: [],
    errors: [],
  };

  const registryPath = path.join(repoRoot, "work-progress/harvest-packet-registry.json");
  const commandIndexPath = path.join(repoRoot, "work-progress/command-index.json");
  sources.registry = readJsonSafe(registryPath);
  sources.commandIndex = readJsonSafe(commandIndexPath);
  if (!sources.registry) sources.errors.push("harvest-packet-registry.json unreadable");
  if (!sources.commandIndex) sources.errors.push("command-index.json unreadable");

  const byKind = path.join(hubRoot, "00-master-index/BY-KIND");
  for (const sliceName of REQUIRED_HUB_SLICES) {
    const slicePath = path.join(byKind, sliceName);
    const doc = readJsonSafe(slicePath);
    sources.hubSlices.push({
      name: sliceName,
      path: slicePath,
      readable: Boolean(doc),
      contentHash: doc ? hashCanonicalJson(doc) : null,
      doc,
    });
    if (!doc) sources.errors.push(`hub slice missing: ${sliceName}`);
  }

  const optionalSlices = ["do-not-advance.json", "active-work-open-actions.json"];
  for (const sliceName of optionalSlices) {
    const slicePath = path.join(byKind, sliceName);
    const doc = readJsonSafe(slicePath);
    if (doc) {
      sources.hubSlices.push({
        name: sliceName,
        path: slicePath,
        readable: true,
        contentHash: hashCanonicalJson(doc),
        doc,
      });
    }
  }

  return sources;
}

function findHarvestCollisions({ harvestId, manifest, threadAutopsyIndex }) {
  const collisions = [];
  const subject =
    manifest.packets?.[0]?.packetTitle ??
    manifest.threadAutopsy?.subject ??
    harvestId;

  for (const harvest of threadAutopsyIndex?.harvests ?? []) {
    if (harvest.harvestId === harvestId) continue;
    const sameSubject =
      harvest.subject &&
      subject &&
      harvest.subject.toLowerCase().trim() === subject.toLowerCase().trim();
    if (sameSubject) {
      collisions.push({
        type: "harvest-subject",
        existingHarvestId: harvest.harvestId,
        subject: harvest.subject,
      });
    }
  }

  return collisions;
}

function findPublishedHarvestRepublishBlock({ harvestId, gitHead, threadAutopsyIndex, allowRepublish }) {
  if (allowRepublish) return null;
  const existing = (threadAutopsyIndex?.harvests ?? []).find((h) => h.harvestId === harvestId);
  if (!existing) return null;
  const indexSha = threadAutopsyIndex?.sourceCommitSha;
  if (indexSha && indexSha !== gitHead) {
    return {
      type: "harvest-id-republish",
      harvestId,
      existingSourceCommitSha: indexSha,
      nextSourceCommitSha: gitHead,
      message:
        "harvest already published on L: with different sourceCommitSha — set manifest.supersession or use --allow-republish",
    };
  }
  return null;
}

function findSeedIdCollisions({ seeds, catalogSeeds, allowSupersedeIds = new Set() }) {
  const collisions = [];
  const catalogById = new Map(catalogSeeds.map((s) => [s.seedId, s]));

  for (const seed of seeds) {
    const existing = catalogById.get(seed.seedId);
    if (!existing) continue;
    if (allowSupersedeIds.has(seed.seedId)) continue;
    const supersedes = seed.supersedes ?? [];
    if (supersedes.includes(seed.seedId) || supersedes.includes(existing.seedId)) continue;
    collisions.push({
      type: "seed-id",
      seedId: seed.seedId,
      existingFile: existing.file,
      existingHarvestId: existing.harvestId,
    });
  }
  return collisions;
}

function findSemanticDuplicates({ seeds, catalogSeeds }) {
  const duplicates = [];
  const catalogQuestions = catalogSeeds.flatMap((s) =>
    (s.retrievalQuestions ?? []).map((q) => ({ seedId: s.seedId, query: q })),
  );

  for (const seed of seeds) {
    for (const query of seed.retrievalQuestions ?? []) {
      for (const existing of catalogQuestions) {
        if (existing.seedId === seed.seedId) continue;
        const score = jaccardSimilarity(query, existing.query);
        if (score >= SEMANTIC_DUPLICATE_THRESHOLD) {
          duplicates.push({
            type: "semantic-retrieval",
            seedId: seed.seedId,
            query,
            existingSeedId: existing.seedId,
            existingQuery: existing.query,
            score: Number(score.toFixed(3)),
          });
        }
      }
    }
  }
  return duplicates;
}

function findPacketRegistryOverlaps({ manifest, registry, harvestId }) {
  const overlaps = [];
  if (!registry?.packets) return overlaps;

  for (const packet of manifest.packets ?? []) {
    const prior = registry.packets[packet.packetId];
    if (!prior) continue;
    if (prior.latestHarvestId === harvestId) continue;
    overlaps.push({
      type: "packet-registry",
      packetId: packet.packetId,
      priorHarvestId: prior.latestHarvestId,
      priorVerdict: prior.latestVerdict,
    });
  }
  return overlaps;
}

function validateConsultationClaims({ bundle, sources }) {
  const errors = [];
  const check = bundle?.duplicationCheck;
  if (!check) return errors;

  if (check.registryConsulted && !sources.registry) {
    errors.push("duplicationCheck claims registryConsulted but registry unreadable");
  }
  if (check.commandIndexConsulted && !sources.commandIndex) {
    errors.push("duplicationCheck claims commandIndexConsulted but command-index unreadable");
  }

  const consultedNames = new Set(check.hubSlicesConsulted ?? []);
  const requiredReadable = REQUIRED_HUB_SLICES.filter((name) => consultedNames.has(name));
  for (const name of requiredReadable) {
    const slice = sources.hubSlices.find((s) => s.name === name);
    if (!slice?.readable) {
      errors.push(`duplicationCheck lists ${name} but slice unreadable on L:`);
    }
  }

  for (const name of REQUIRED_HUB_SLICES) {
    if (!consultedNames.has(name)) {
      errors.push(`duplicationCheck.hubSlicesConsulted must include ${name}`);
    }
  }

  return errors;
}

/**
 * Automated duplication preflight — consults registry, command-index, and L: hub slices.
 */
export function runDuplicationPreflight({
  repoRoot,
  harvestId,
  runDir,
  manifest = null,
  bundle = null,
  hubRoot = resolveHubRoot(),
  gitHead = null,
  mode = "validate",
  allowRepublish = false,
  allowSupersedeSeedIds = [],
  writeReceipt = true,
} = {}) {
  const errors = [];
  const warnings = [];
  const runDirResolved = runDir ?? path.join(repoRoot, "artifacts/agent-runs", harvestId);
  manifest = manifest ?? readJsonSafe(path.join(runDirResolved, "harvest-manifest-v1.json"));
  bundle = bundle ?? readJsonSafe(path.join(runDirResolved, "thread-autopsy-bundle.json"));

  if (!manifest) {
    return { ok: false, verdict: "HARVEST_MISSING", errors: ["harvest-manifest-v1.json missing"] };
  }

  const sources = consultSources({ repoRoot, hubRoot });
  errors.push(...sources.errors);

  const threadAutopsyIndex = loadThreadAutopsyIndex(hubRoot);
  const catalogSeeds = loadCatalogSeeds(hubRoot);
  const seeds = listSeedPackets(runDirResolved);

  const harvestCollisions = findHarvestCollisions({
    harvestId: manifest.harvestId ?? harvestId,
    manifest,
    threadAutopsyIndex,
  });
  const republishBlock = findPublishedHarvestRepublishBlock({
    harvestId: manifest.harvestId ?? harvestId,
    gitHead,
    threadAutopsyIndex,
    allowRepublish: allowRepublish || Boolean(manifest.supersession?.replacesHarvestId),
  });
  const seedIdCollisions = findSeedIdCollisions({
    seeds,
    catalogSeeds,
    allowSupersedeIds: new Set(allowSupersedeSeedIds),
  });
  const semanticDuplicates = findSemanticDuplicates({ seeds, catalogSeeds });
  const packetOverlaps = findPacketRegistryOverlaps({
    manifest,
    registry: sources.registry,
    harvestId: manifest.harvestId ?? harvestId,
  });

  if (bundle) {
    if (mode !== "preflight") {
      errors.push(...validateConsultationClaims({ bundle, sources }));
      const claimedHash = bundle.duplicationCheck?.preflightReceiptHash;
      if (!claimedHash && mode === "validate") {
        errors.push("duplicationCheck.preflightReceiptHash missing — run harvest:duplication-preflight first");
      }
    }
  }

  if (republishBlock) errors.push(republishBlock.message);
  if (harvestCollisions.length > 0) {
    errors.push(
      `duplicate harvest subject already indexed: ${harvestCollisions.map((c) => c.existingHarvestId).join(", ")}`,
    );
  }
  if (seedIdCollisions.length > 0 && mode === "publish") {
    errors.push(
      ...seedIdCollisions.map(
        (c) => `seedId ${c.seedId} already on L: (${c.existingFile}) — add supersedes or --allow-supersede-seed`,
      ),
    );
  } else if (seedIdCollisions.length > 0) {
    warnings.push(
      ...seedIdCollisions.map((c) => `seedId ${c.seedId} already on L: — publish will block without supersession`),
    );
  }
  if (semanticDuplicates.length > 0) {
    errors.push(
      ...semanticDuplicates.map(
        (d) =>
          `semantic duplicate retrieval (${d.score}): ${d.seedId} "${d.query}" ~ ${d.existingSeedId} "${d.existingQuery}"`,
      ),
    );
  }
  if (packetOverlaps.length > 0) {
    warnings.push(
      ...packetOverlaps.map(
        (o) => `packet ${o.packetId} already in registry under ${o.priorHarvestId} — confirm supersession intent`,
      ),
    );
  }

  const duplicateWorkRequired =
    packetOverlaps.length > 0 || harvestCollisions.length > 0 || semanticDuplicates.length > 0;
  if (duplicateWorkRequired && bundle && !(bundle.duplicateWork?.length > 0)) {
    errors.push(
      "duplicateWork[] required when preflight detects registry/subject/semantic overlap — record what was duplicated and why",
    );
  }

  const receipt = {
    schemaVersion: "cross-agent-harvest-duplication-preflight-receipt-v1@1.0.0",
    harvestId: manifest.harvestId ?? harvestId,
    generatedAt: new Date().toISOString(),
    mode,
    hubRoot,
    sourcesConsulted: {
      registryPath: "work-progress/harvest-packet-registry.json",
      registryReadable: Boolean(sources.registry),
      commandIndexPath: "work-progress/command-index.json",
      commandIndexReadable: Boolean(sources.commandIndex),
      hubSliceNames: sources.hubSlices.filter((s) => s.readable).map((s) => s.name),
      hubSliceHashes: Object.fromEntries(
        sources.hubSlices.filter((s) => s.contentHash).map((s) => [s.name, s.contentHash]),
      ),
    },
    findings: {
      harvestCollisions,
      republishBlock,
      seedIdCollisions,
      semanticDuplicates,
      packetOverlaps,
    },
    verdict:
      errors.length > 0 ? "DUPLICATE_BLOCKED" : warnings.length > 0 ? "PASS_WITH_WARNINGS" : "PASS",
    errorCount: errors.length,
    warningCount: warnings.length,
  };
  receipt.contentHash = hashCanonicalJson({
    harvestId: receipt.harvestId,
    sourcesConsulted: receipt.sourcesConsulted,
    findings: receipt.findings,
    verdict: receipt.verdict,
  });

  if (writeReceipt && runDirResolved) {
    const receiptPath = path.join(runDirResolved, "duplication-preflight-receipt.json");
    fs.mkdirSync(runDirResolved, { recursive: true });
    fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
    receipt.receiptPath = receiptPath;
  }

  if (bundle?.duplicationCheck?.preflightReceiptHash && mode !== "preflight") {
    if (bundle.duplicationCheck.preflightReceiptHash !== receipt.contentHash) {
      errors.push(
        "duplicationCheck.preflightReceiptHash stale — re-run harvest:duplication-preflight and update bundle",
      );
      receipt.verdict = "DUPLICATE_BLOCKED";
    }
  }

  return {
    ok: errors.length === 0,
    verdict: errors.length > 0 ? "DUPLICATE_BLOCKED" : receipt.verdict,
    receipt,
    errors,
    warnings,
    sources,
  };
}

export function attachPreflightHashToBundle(bundle, preflight) {
  if (!bundle.duplicationCheck) bundle.duplicationCheck = {};
  bundle.duplicationCheck.preflightReceiptHash = preflight.receipt.contentHash;
  bundle.duplicationCheck.checkedAt = preflight.receipt.generatedAt;
  bundle.duplicationCheck.hubSlicesConsulted = preflight.receipt.sourcesConsulted.hubSliceNames;
  bundle.duplicationCheck.registryConsulted = preflight.receipt.sourcesConsulted.registryReadable;
  bundle.duplicationCheck.commandIndexConsulted =
    preflight.receipt.sourcesConsulted.commandIndexReadable;
  return bundle;
}
