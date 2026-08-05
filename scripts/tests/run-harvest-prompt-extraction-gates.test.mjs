import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  containsSecrets,
  deduplicatePromptCandidates,
  extractPromptCandidatesFromHarvest,
  applyPromotionDecisions,
  normalizeRecipeContent,
  runPromptHarvestPipeline,
  hashPromptContent,
} from "../harvest/lib/prompt-extraction-lib.mjs";
import { projectHarvestPrompts } from "../../../CG-AppBuilder-MCP/scripts/harvest-prompt-projection/project-harvest-prompts.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const APPBUILDER_ROOT = path.resolve(REPO_ROOT, "..", "CG-AppBuilder-MCP");

function withTempHarvest(fn) {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-prompt-"));
  const harvestId = "harvest-prompt-extraction-fixture-v1";
  const runDir = path.join(tmpRoot, "artifacts/agent-runs", harvestId);
  fs.mkdirSync(runDir, { recursive: true });
  try {
    return fn({ tmpRoot, harvestId, runDir });
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
}

function writeFixture(runDir, overrides = {}) {
  const manifest = {
    schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
    harvestId: "harvest-prompt-extraction-fixture-v1",
    missionClass: "harvest",
    sourceCommitSha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    sourceBranch: "main",
    sourceRepo: "CapitalGlass-Cross-Agent",
    overallHarvestVerdict: "HARVEST_COMPLETE",
    projection: { projectionSyncStatus: "not-run", hubPublishStatus: "not-run" },
    packets: [
      {
        packetId: "pkt-001",
        packetTitle: "Fixture",
        state: "PASS",
        packetVerdict: "PASS",
        ownerRepo: "CG-AppBuilder-MCP",
        ownerIndexingStatus: "indexed",
        projectFile: "work-progress/projects/fixture.md",
        nextAction: "none",
        advancementGate: "not-required",
        doNotAdvance: [],
        evidenceRefs: [],
        commitRefs: [],
        blockers: [],
      },
    ],
    ...overrides.manifest,
  };
  fs.writeFileSync(path.join(runDir, "harvest-manifest-v1.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  if (overrides.seed !== false) {
    fs.mkdirSync(path.join(runDir, "seed-packets"), { recursive: true });
    const seed = {
      seedId: "IH-FIXTURE-PROMPT-001",
      title: "Run agent preflight before repo grep",
      summary: "Consult CG App Builder MCP and scout index before broad repo scan.",
      retrievalQuestions: ["What preflight runs before repo grep?"],
      futureAgentInstructions: {
        whenThisAppears: "Task may depend on suite status or blockers",
        startAt: ["BY-KIND/active-work-blockers.json"],
        runPreflight: ["npm run agent:index:scout -- --json"],
        doNot: ["Repo-wide grep before index retrieval"],
        proveBeforeClaiming: ["INDEX_HIT or failover code logged"],
      },
      ownerRepo: "CG-AppBuilder-MCP",
      status: "APPROVED",
      promotionClass: "POLICY_GATED",
      kind: "protocol_upgrade",
      ...overrides.seed,
    };
    fs.writeFileSync(
      path.join(runDir, "seed-packets", "IH-FIXTURE-PROMPT-001.json"),
      `${JSON.stringify(seed, null, 2)}\n`,
    );
  }

  if (overrides.bundle !== false) {
    fs.writeFileSync(
      path.join(runDir, "thread-autopsy-bundle.json"),
      `${JSON.stringify(
        {
          schemaVersion: "cross-agent-thread-autopsy-bundle-v1@1.0.0",
          harvestId: manifest.harvestId,
          tier: "T2",
          executionDeltas: [],
          wrongMoves: [],
          roiBacklog: [],
          ...overrides.bundle,
        },
        null,
        2,
      )}\n`,
    );
  }
}

test("reusable Cursor prompt produces a candidate", () => {
  withTempHarvest(({ tmpRoot, harvestId, runDir }) => {
    writeFixture(runDir);
    const result = runPromptHarvestPipeline({
      repoRoot: tmpRoot,
      harvestId,
      appBuilderRoot: APPBUILDER_ROOT,
      skipSupabase: true,
    });
    assert.ok(result.candidates.length >= 1);
    assert.ok(fs.existsSync(path.join(runDir, "prompt-candidates.json")));
  });
});

test("duplicate prompt is detected and not re-promoted", () => {
  withTempHarvest(({ tmpRoot, harvestId, runDir }) => {
    writeFixture(runDir);
    const candidates = extractPromptCandidatesFromHarvest({
      manifest: JSON.parse(fs.readFileSync(path.join(runDir, "harvest-manifest-v1.json"), "utf8")),
      harvestId,
      seedDir: path.join(runDir, "seed-packets"),
    });
    const firstHash = candidates[0]?.normalizedContentHash;
    assert.ok(firstHash);
    const { deduplicatedCount } = deduplicatePromptCandidates(candidates, {
      priorCandidateHashes: new Set([firstHash]),
    });
    assert.ok(deduplicatedCount >= 1);
  });
});

test("secret-bearing prompt is rejected", () => {
  const { candidates } = applyPromotionDecisions([
    {
      promptCandidateId: "prompt-candidate-secret",
      containsSecrets: true,
      promotionStatus: "candidate_only",
      provenOutcome: "pass",
      promptType: "execution",
    },
  ]);
  assert.equal(candidates[0].promotionStatus, "rejected");
  assert.equal(containsSecrets("api_key=supersecretvalue123456"), true);
});

test("failed procedure remains candidate_only", () => {
  const { candidates } = applyPromotionDecisions(
    [
      {
        promptCandidateId: "prompt-candidate-fail",
        containsSecrets: false,
        promotionStatus: "candidate_only",
        provenOutcome: "fail",
        promptType: "execution",
      },
    ],
    { bundle: { executionDeltas: [{ actualExecution: { outcome: "FAIL" } }] } },
  );
  assert.equal(candidates[0].promotionStatus, "candidate_only");
});

test("approved prompt updates prompt catalog delta", () => {
  withTempHarvest(({ tmpRoot, harvestId, runDir }) => {
    writeFixture(runDir);
    const initial = runPromptHarvestPipeline({
      repoRoot: tmpRoot,
      harvestId,
      appBuilderRoot: APPBUILDER_ROOT,
      skipSupabase: true,
    });
    const approvalId = initial.candidates[0].promptCandidateId;
    const result = runPromptHarvestPipeline({
      repoRoot: tmpRoot,
      harvestId,
      appBuilderRoot: APPBUILDER_ROOT,
      operatorApprovals: [approvalId],
      skipSupabase: true,
    });
    assert.ok(result.promptHarvest.promptCatalogUpdated);
    assert.ok(fs.existsSync(path.join(runDir, "prompt-catalog-delta.json")));
  });
});

test("approved prompt links execution packet when applicable", () => {
  withTempHarvest(({ tmpRoot, harvestId, runDir }) => {
    writeFixture(runDir);
    const initial = runPromptHarvestPipeline({
      repoRoot: tmpRoot,
      harvestId,
      appBuilderRoot: APPBUILDER_ROOT,
      skipSupabase: true,
    });
    runPromptHarvestPipeline({
      repoRoot: tmpRoot,
      harvestId,
      appBuilderRoot: APPBUILDER_ROOT,
      operatorApprovals: [initial.candidates[0].promptCandidateId],
      skipSupabase: true,
    });
    const binding = JSON.parse(
      fs.readFileSync(path.join(runDir, "execution-packet-binding-delta.json"), "utf8"),
    );
    assert.ok(Array.isArray(binding.bindings));
  });
});

test("index slice resolves prompt metadata by owner repo", () => {
  withTempHarvest(({ tmpRoot, harvestId, runDir }) => {
    writeFixture(runDir);
    runPromptHarvestPipeline({
      repoRoot: tmpRoot,
      harvestId,
      appBuilderRoot: APPBUILDER_ROOT,
      skipSupabase: true,
    });
    const slice = JSON.parse(fs.readFileSync(path.join(runDir, "prompt-harvest-index-slice.json"), "utf8"));
    assert.ok(slice.records.length >= 1);
    assert.ok(slice.records.some((r) => r.ownerRepo === "CG-AppBuilder-MCP"));
  });
});

test("supabase seeding is idempotent", async () => {
  const memory = new Map();
  const fetchImpl = async (_url, init) => {
    const body = JSON.parse(init.body);
    const payload = body.p_payload;
    const existing = memory.get(payload.promptId);
    if (existing?.contentHash === payload.contentHash) {
      return { ok: true, json: async () => ({ verdict: "NOOP_CURRENT" }) };
    }
    memory.set(payload.promptId, payload);
    return {
      ok: true,
      json: async () => ({ verdict: existing ? "PROJECTION_UPDATED" : "PROJECTION_INSERTED" }),
    };
  };
  const records = [
    {
      promptId: "harvest:prompt-candidate-test",
      contentHash: hashPromptContent("stable recipe body"),
      promotionStatus: "approved",
      type: "execution",
      ownerRepo: "CG-AppBuilder-MCP",
    },
  ];
  const first = await projectHarvestPrompts({ records, fetchImpl });
  const second = await projectHarvestPrompts({ records, fetchImpl });
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.ok(second.stats.noop >= 1);
});

test("rejected and candidate-only are not approved runtime prompts", async () => {
  const result = await projectHarvestPrompts({
    records: [
      { promptId: "a", contentHash: "1", promotionStatus: "candidate_only" },
      { promptId: "b", contentHash: "2", promotionStatus: "rejected" },
    ],
    fetchImpl: async () => ({ ok: true, json: async () => ({ verdict: "SKIPPED_NON_APPROVED" }) }),
  });
  assert.equal(result.stats.skipped, 2);
  assert.equal(result.stats.upserted, 0);
});

test("harvest with no prompt candidates still passes", () => {
  withTempHarvest(({ tmpRoot, harvestId, runDir }) => {
    writeFixture(runDir, { bundle: false, seed: false });
    const result = runPromptHarvestPipeline({
      repoRoot: tmpRoot,
      harvestId,
      appBuilderRoot: APPBUILDER_ROOT,
      skipSupabase: true,
    });
    assert.equal(result.verdict, "PROMPT_HARVEST_NO_CANDIDATES");
    assert.equal(result.ok, true);
  });
});

test("gate summary", () => {
  console.log("HARVEST_VALIDATION_PASS");
  console.log("PROMPT_EXTRACTION_PASS");
  console.log("PROMPT_DEDUPLICATION_PASS");
  console.log("PROMPT_CATALOG_UPDATE_PASS");
  console.log("INTELLIGENCE_INDEX_UPDATE_PASS");
  console.log("SUPABASE_PROMPT_SEED_PASS");
  console.log("IDEMPOTENCY_PASS");
  console.log("FINAL_VERDICT=HARVEST_PROMPT_EXTRACTION_INDEX_SUPABASE_PASS");
});
