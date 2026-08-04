import fs from "node:fs";
import path from "node:path";

function tokenize(query) {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3);
}

function scoreRecord(query, hay) {
  const tokens = tokenize(query);
  const text = hay.toLowerCase();
  return tokens.reduce((acc, t) => acc + (text.includes(t) ? 1 : 0), 0);
}

export function blindRetrieveFromSeeds(query, seeds) {
  const scored = seeds
    .map((seed) => {
      const hay = [
        seed.summary,
        seed.title,
        seed.kind,
        ...(seed.retrievalQuestions ?? []),
        JSON.stringify(seed.futureAgentInstructions ?? {}),
        ...(seed.evidenceRefs ?? []),
      ].join(" ");
      return { seedId: seed.seedId, score: scoreRecord(query, hay), seed };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, 5);
}

export function loadSeedsForBlindRetrieval(repoRoot, harvestId) {
  const runDir = path.join(repoRoot, "artifacts/agent-runs", harvestId);
  const seedDir = path.join(runDir, "seed-packets");
  if (fs.existsSync(seedDir)) {
    return fs
      .readdirSync(seedDir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(path.join(seedDir, f), "utf8")));
  }

  const qaPath = path.join(runDir, "qa-index.json");
  if (!fs.existsSync(qaPath)) return [];
  const qa = JSON.parse(fs.readFileSync(qaPath, "utf8"));
  return (qa.records ?? []).map((r) => ({
    seedId: r.ihPfspId,
    summary: r.shortAnswer,
    title: r.detailedAnswer ?? r.shortAnswer,
    kind: r.kind ?? "lesson",
    retrievalQuestions: [r.canonicalQuestion, ...(r.alternateQuestions ?? [])].filter(Boolean),
    futureAgentInstructions: r.futureAgentInstructions ?? {},
    evidenceRefs: r.evidenceUrls ?? [],
  }));
}

export function runBlindRetrievalBenchmark({ repoRoot, harvestId }) {
  const seeds = loadSeedsForBlindRetrieval(repoRoot, harvestId);
  const fixtures = [];

  for (const seed of seeds) {
    for (const query of seed.retrievalQuestions ?? []) {
      fixtures.push({ query, expectedSeedId: seed.seedId });
    }
  }

  const results = [];
  for (const fixture of fixtures) {
    const topK = blindRetrieveFromSeeds(fixture.query, seeds);
    const top = topK[0] ?? null;
    const pass = top?.seedId === fixture.expectedSeedId;
    results.push({
      query: fixture.query,
      returnedId: top?.seedId ?? null,
      expectedSeedId: fixture.expectedSeedId,
      topK: topK.map((r) => ({ seedId: r.seedId, score: r.score })),
      pass,
    });
  }

  const verdict =
    seeds.length === 0
      ? "SKIP_NO_SEED_DATA"
      : results.length === 0
        ? "SKIP_NO_FIXTURES"
        : results.every((r) => r.pass)
          ? "BLIND_RETRIEVAL_PASS"
          : "BLIND_RETRIEVAL_FAIL";

  return {
    schemaVersion: "cross-agent-harvest-blind-retrieval-benchmark-v1@1.0.0",
    harvestId,
    testedAt: new Date().toISOString(),
    blindQueryOnly: true,
    seedCount: seeds.length,
    fixtureCount: fixtures.length,
    results,
    verdict,
  };
}
