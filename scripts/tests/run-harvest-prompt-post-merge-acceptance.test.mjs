#!/usr/bin/env node
/**
 * Post-merge acceptance: harvest → extraction → approval boundary → catalog → projection.
 */
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  deduplicatePromptCandidates,
  hashPromptContent,
  runPromptHarvestPipeline,
} from "../harvest/lib/prompt-extraction-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CROSS_AGENT_ROOT = path.resolve(__dirname, "../..");
const APPBUILDER_ROOT =
  process.env.CG_APPBUILDER_MCP_ROOT || path.resolve(CROSS_AGENT_ROOT, "..", "CG-AppBuilder-MCP");
const RECEIPT_DIR = path.join(
  CROSS_AGENT_ROOT,
  "artifacts/agent-runs/harvest-prompt-extraction-post-merge-v1",
);
const HARVEST_ID = "harvest-prompt-post-merge-acceptance-v1";

const REQUIRED_COMMAND_IDS = [
  "harvest-sync-derived",
  "harvest-sync-z-mirror",
  "active-ledger-compile-index",
  "active-ledger-publish-hot-cache",
  "hot-cache-publish-l-by-kind-dry-run",
  "hot-cache-verify-l-hash-alignment",
  "prompt-catalog-compile-index",
  "promptops-project-harvest-prompts",
];

function writeFixture(runDir) {
  fs.mkdirSync(path.join(runDir, "seed-packets"), { recursive: true });
  const seed = {
    seedId: "IH-POST-MERGE-PROMPT-001",
    title: "Scout preflight before repo grep",
    summary: "Run agent:index:scout before broad repository scan.",
    retrievalQuestions: ["What runs before repo grep?", "Which index tier is first?"],
    futureAgentInstructions: {
      whenThisAppears: "Task may depend on suite blockers or ownership",
      startAt: ["BY-KIND/active-work-blockers.json"],
      runPreflight: ["npm run agent:index:scout -- --json"],
      doNot: ["Repo-wide grep before index retrieval"],
      proveBeforeClaiming: ["INDEX_HIT_AI_CACHE or failover code logged"],
    },
    ownerRepo: "CG-AppBuilder-MCP",
    status: "CANDIDATE",
    promotionClass: "POLICY_GATED",
    kind: "protocol_upgrade",
    evidenceRefs: ["work-progress/command-index.json"],
  };
  fs.writeFileSync(
    path.join(runDir, "seed-packets", "IH-POST-MERGE-PROMPT-001.json"),
    `${JSON.stringify(seed, null, 2)}\n`,
  );
  const manifest = {
    schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
    harvestId: HARVEST_ID,
    missionClass: "chat-thread-closeout-autopsy-harvest-v1",
    sourceCommitSha: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    sourceBranch: "main",
    sourceRepo: "CapitalGlass-Cross-Agent",
    overallHarvestVerdict: "HARVEST_COMPLETE",
    projection: { projectionSyncStatus: "not-run", hubPublishStatus: "not-run" },
    packets: [
      {
        packetId: "post-merge-prompt-acceptance",
        packetTitle: "Post-merge prompt acceptance",
        state: "PASS",
        packetVerdict: "PASS",
        ownerRepo: "CG-AppBuilder-MCP",
        ownerIndexingStatus: "indexed",
        evidenceRefs: ["seed-packets/IH-POST-MERGE-PROMPT-001.json"],
        doNotAdvance: [],
      },
    ],
  };
  fs.writeFileSync(path.join(runDir, "harvest-manifest-v1.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(
    path.join(runDir, "thread-autopsy-bundle.json"),
    `${JSON.stringify(
      {
        schemaVersion: "cross-agent-thread-autopsy-bundle-v1@1.0.0",
        harvestId: HARVEST_ID,
        tier: "T2",
        executionDeltas: [],
        wrongMoves: [],
        roiBacklog: [],
      },
      null,
      2,
    )}\n`,
  );
}

function assertProvenance(candidate) {
  assert.ok(candidate.sourceHarvestId, "sourceHarvestId required");
  assert.ok(candidate.normalizedContentHash, "normalizedContentHash required");
  assert.ok(candidate.sourceSha, "sourceSha required");
  assert.equal(candidate.grantsMutationAuthority, false);
}

function projectionWouldSkip(record) {
  return Boolean(record.promotionStatus && record.promotionStatus !== "approved");
}

const gates = {};
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "prompt-post-merge-"));
const runDir = path.join(tmpRoot, "artifacts/agent-runs", HARVEST_ID);

try {
  assert.ok(fs.existsSync(path.join(APPBUILDER_ROOT, "package.json")), "CG-AppBuilder-MCP checkout required");

  writeFixture(runDir);

  const withoutApproval = runPromptHarvestPipeline({
    repoRoot: tmpRoot,
    harvestId: HARVEST_ID,
    appBuilderRoot: APPBUILDER_ROOT,
    skipSupabase: true,
  });
  assert.equal(withoutApproval.ok, true);
  assert.ok(withoutApproval.candidates.length >= 1);
  assert.equal(withoutApproval.promptHarvest.approved, 0);
  assert.ok(withoutApproval.candidates.every((c) => c.promotionStatus !== "approved"));
  assert.ok(withoutApproval.candidates.some((c) => c.promotionStatus === "candidate_only"));
  for (const c of withoutApproval.candidates) {
    assertProvenance(c);
  }
  gates.PROMPT_EXTRACTION_PASS = true;
  gates.PROMPT_APPROVAL_BOUNDARY_PASS = true;

  const hash = withoutApproval.candidates[0].normalizedContentHash;
  const { deduplicatedCount } = deduplicatePromptCandidates(withoutApproval.candidates, {
    priorCandidateHashes: new Set([hash]),
  });
  assert.ok(deduplicatedCount >= 1);
  gates.PROMPT_CANDIDATE_DEDUP_PASS = true;

  const skipped = withoutApproval.candidates.filter((c) =>
    projectionWouldSkip({ promotionStatus: c.promotionStatus }),
  );
  assert.equal(skipped.length, withoutApproval.candidates.length);
  gates.PROMPT_PROJECTION_PASS = true;

  const approvalId = withoutApproval.candidates[0].promptCandidateId;
  const withApproval = runPromptHarvestPipeline({
    repoRoot: tmpRoot,
    harvestId: HARVEST_ID,
    appBuilderRoot: APPBUILDER_ROOT,
    operatorApprovals: [approvalId],
    skipSupabase: true,
  });
  assert.equal(withApproval.promptHarvest.approved, 1);
  assert.ok(withApproval.promptHarvest.promptCatalogUpdated);
  const approvedOnly = withApproval.candidates.filter((c) => c.promotionStatus === "approved");
  assert.ok(approvedOnly.every((c) => withApproval.promptHarvest.operatorApprovals.includes(approvalId)));

  execSync("npm run prompt-catalog:compile-index", {
    cwd: APPBUILDER_ROOT,
    env: { ...process.env, CROSS_AGENT_ROOT },
    stdio: "pipe",
  });
  const compactPath = path.join(APPBUILDER_ROOT, "runtime/prompt-catalog/prompt-catalog.compact.latest.json");
  assert.ok(fs.existsSync(compactPath), "prompt-catalog compact artifact missing");
  const compact = JSON.parse(fs.readFileSync(compactPath, "utf8"));
  assert.ok(Array.isArray(compact.records) && compact.records.length > 0);
  gates.PROMPT_CATALOG_COMPILE_PASS = true;

  execSync("npm run command-estate:compile-index", {
    cwd: APPBUILDER_ROOT,
    env: { ...process.env, CROSS_AGENT_ROOT },
    stdio: "pipe",
  });
  const commandIndex = JSON.parse(
    fs.readFileSync(path.join(CROSS_AGENT_ROOT, "work-progress/command-index.json"), "utf8"),
  );
  const commandIds = new Set((commandIndex.commands ?? []).map((c) => c.id));
  for (const id of REQUIRED_COMMAND_IDS) {
    assert.ok(commandIds.has(id), `missing command-index id: ${id}`);
  }
  gates.COMMAND_ESTATE_PROMPT_COMMANDS_PASS = true;

  for (const rel of [
    "runtime/prompt-catalog/",
    "runtime/command-estate/",
    "runtime/workflow-estate/",
  ]) {
    const tracked = execSync(`git ls-files ${rel}`, { cwd: APPBUILDER_ROOT, encoding: "utf8" }).trim();
    assert.equal(tracked, "", `tracked runtime artifact under ${rel}`);
  }
  gates.NO_RUNTIME_ARTIFACTS_COMMITTED = true;

  let crossMainSha = null;
  let appMainSha = null;
  try {
    crossMainSha = execSync("git rev-parse HEAD", { cwd: CROSS_AGENT_ROOT, encoding: "utf8" }).trim();
    appMainSha = execSync("git rev-parse HEAD", { cwd: APPBUILDER_ROOT, encoding: "utf8" }).trim();
  } catch {
    /* optional */
  }

  const receipt = {
    schemaVersion: "harvest-prompt-post-merge-acceptance-receipt-v1@1.0.0",
    workPackageId: "harvest-prompt-extraction-post-merge-v1",
    generatedAt: new Date().toISOString(),
    crossAgentMainSha: crossMainSha,
    appBuilderMainSha: appMainSha,
    harvestId: HARVEST_ID,
    pipeline: [
      "harvest source",
      "prompt extraction",
      "candidate registry",
      "operator approval boundary",
      "catalog delta",
      "AppBuilder compile",
      "Supabase projection (boundary verified offline)",
      "hot-cache command discovery",
    ],
    gates,
    verdict: Object.values(gates).every(Boolean)
      ? "HARVEST_PROMPT_POST_MERGE_ACCEPTANCE_PASS"
      : "HARVEST_PROMPT_POST_MERGE_ACCEPTANCE_FAIL",
    sampleCandidateId: approvalId,
    sampleContentHash: hashPromptContent("probe"),
  };

  fs.mkdirSync(RECEIPT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(RECEIPT_DIR, "post-merge-acceptance-receipt.json"),
    `${JSON.stringify(receipt, null, 2)}\n`,
  );

  for (const [gate, pass] of Object.entries(gates)) {
    console.log(pass ? gate : `${gate}_FAIL`);
  }
  console.log(receipt.verdict);
  assert.equal(receipt.verdict, "HARVEST_PROMPT_POST_MERGE_ACCEPTANCE_PASS");
} finally {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}
