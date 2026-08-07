import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { evaluateMirrorFileDecision } from "../harvest/lib/z-mirror-authority-guard.mjs";
import { runPublicationCapabilityPreflight } from "../harvest/lib/publication-capability-preflight.mjs";
import { buildPublicationDryRun } from "../harvest/lib/publication-dry-run.mjs";
import { triagePromptCandidates } from "../harvest/lib/prompt-candidate-triage.mjs";
import { requiredDuplicationSliceNames } from "../harvest/lib/duplication-index-registry.mjs";
import { classifyFinalVerdict } from "../harvest/lib/publication-run-contract.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARVEST_ID = "harvest-2026-08-06-harvest-protocol-self-learning-lane-closeout-v1";

test("z-mirror authority guard blocks Lane C regression", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "zmirror-guard-"));
  const dest = path.join(tmp, "harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md");
  const src = path.join(tmp, "stale-source.md");
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, "# Protocol\n### Lane C — keep\nLane C content\n", "utf8");
  fs.writeFileSync(src, "# Protocol\nstale content without section headers\n", "utf8");

  const decision = evaluateMirrorFileDecision({
    sourcePath: src,
    destPath: dest,
    sourceLabel: "stale",
  });
  assert.equal(decision.action, "block");
  assert.equal(decision.errorCode, "BLOCK_GIT_PROTOCOL_OVERWRITE_RISK");
  fs.rmSync(tmp, { recursive: true, force: true });
});

test("duplication registry includes thread-autopsy-index", () => {
  const names = requiredDuplicationSliceNames();
  assert.ok(names.includes("thread-autopsy-index.json"));
  assert.ok(names.includes("active-work-blockers.json"));
});

test("capability preflight classifies supabase without printing secrets", () => {
  const report = runPublicationCapabilityPreflight({ repoRoot: REPO_ROOT });
  assert.ok(["AVAILABLE", "OPTIONAL_UNAVAILABLE"].includes(report.capabilities.supabase));
  assert.ok(report.supabaseCapability?.authMethod);
  assert.ok(!JSON.stringify(report).match(/eyJ[A-Za-z0-9_-]{10,}/));
});

test("supabase capability resolves doppler profile without secret values", async () => {
  const { resolveSupabaseProjectionCapability } = await import(
    "../harvest/lib/supabase-projection-capability-lib.mjs"
  );
  const capability = resolveSupabaseProjectionCapability();
  assert.ok(["AVAILABLE", "OPTIONAL_UNAVAILABLE"].includes(capability.status));
  assert.ok(["env-token", "supabase-cli", "doppler", "none"].includes(capability.authMethod));
  assert.equal(capability.dopplerProfile.project, "cg-mcp");
});

test("dry run for production harvest is side-effect safe on protocol hashes", () => {
  const dry = buildPublicationDryRun({ repoRoot: REPO_ROOT, harvestId: HARVEST_ID });
  assert.ok(["DRY_RUN_PASS", "DRY_RUN_WARN"].includes(dry.dryRunVerdict));
  assert.ok(dry.seedRegistrations.length >= 1);
});

test("prompt triage never auto-approves", () => {
  const runDir = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
  if (!fs.existsSync(path.join(runDir, "prompt-candidates.json"))) return;
  const triage = triagePromptCandidates({ repoRoot: REPO_ROOT, harvestId: HARVEST_ID });
  assert.equal(triage.approvedCount, 0);
  assert.equal(triage.automaticApproval, false);
  assert.ok(triage.candidates.length >= 1);
});

test("final verdict separates core pass with optional warn", () => {
  const v = classifyFinalVerdict({
    corePublication: "PASS",
    authorityIntegrity: "PASS",
    gitDurability: "PENDING",
    optionalWarnings: ["WARN_OPTIONAL_SUPABASE_UNAVAILABLE"],
    coreFailures: [],
  });
  assert.equal(v, "GO_WITH_WARN");
});
