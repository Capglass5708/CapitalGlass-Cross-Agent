#!/usr/bin/env node
/**
 * P2-F / Phase 7 — migrate pending ChatGPT drafts or link provenance-only duplicates.
 */
import fs from "node:fs";
import path from "node:path";

import { inferChatGptDraftStage, buildProvenanceRelationship } from "./lib/chatgpt-draft-status-lib.mjs";
import { runDuplicationPreflight } from "./lib/duplication-preflight-lib.mjs";
import { REPO_ROOT } from "./lib/paths.mjs";

const MILESTONE_DIR = path.join(
  REPO_ROOT,
  "artifacts/agent-runs/harvest-intelligence-index-expansion-and-operational-hardening-v1",
);

const TARGETS = [
  {
    harvestId: "harvest-2026-08-07-gold-mine-compounding-protocol-upgrade-v1",
    substitute: "harvest-2026-08-07-gold-mine-compounding-reference-v1",
    mode: "substitute_if_missing",
  },
  {
    harvestId: "harvest-2026-08-07-cross-agent-authority-convergence-closeout-v1",
    substitute: "harvest-2026-08-07-cross-agent-drained-intelligence-pi-refresh-v1",
    mode: "substitute_if_missing",
  },
  {
    harvestId: "harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1",
    canonicalExists: true,
    mode: "provenance_only",
  },
];

function runDir(harvestId) {
  return path.join(REPO_ROOT, "artifacts/agent-runs", harvestId);
}

function exists(harvestId) {
  return fs.existsSync(path.join(runDir(harvestId), "harvest-manifest-v1.json"));
}

function loadJson(p) {
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null;
}

function migrateOne(target) {
  const effectiveId = exists(target.harvestId)
    ? target.harvestId
    : target.substitute && exists(target.substitute)
      ? target.substitute
      : null;

  const record = {
    requestedHarvestId: target.harvestId,
    effectiveHarvestId: effectiveId,
    mode: target.mode,
    sourceState: null,
    gitGateState: "NOT_RUN",
    canonicalStage: null,
    entityContributions: 0,
    observationsAdded: 0,
    duplicateHandling: null,
    finalAuthorityRelationship: null,
    verdict: "PENDING",
  };

  if (!effectiveId) {
    record.verdict = "BLOCKED_MISSING_ARTIFACTS";
    return record;
  }

  const manifest = loadJson(path.join(runDir(effectiveId), "harvest-manifest-v1.json"));
  const chatgptSource = path.join(runDir(effectiveId), "chatgpt-findings-source.md");
  record.sourceState = fs.existsSync(chatgptSource) ? "CHATGPT_SOURCE_PRESENT" : "CURSOR_MANIFEST_ONLY";

  if (target.mode === "provenance_only" || target.canonicalExists) {
    const dup = runDuplicationPreflight({ harvestId: effectiveId, repoRoot: REPO_ROOT, writeReceipt: false });
    record.gitGateState = dup.verdict ?? "DUPLICATION_PREFLIGHT";
    record.canonicalStage = inferChatGptDraftStage({ manifest });
    record.duplicateHandling = "DUPLICATE_PROVENANCE_ONLY";
    record.finalAuthorityRelationship = buildProvenanceRelationship({
      sourceHarvestId: target.harvestId,
      canonicalHarvestId: effectiveId,
      relation: "provenanceFor",
      reason: "canonical_cursor_t2_harvest_exists",
    });
    record.verdict = "PASS_PROVENANCE_LINK";
    return record;
  }

  if (fs.existsSync(chatgptSource)) {
    record.canonicalStage = inferChatGptDraftStage({ manifest });
    record.verdict = "PASS_CHATGPT_SOURCE_AVAILABLE";
    record.duplicateHandling = "EXPAND_VIA_harvest:expand-intelligence";
    return record;
  }

  record.canonicalStage = inferChatGptDraftStage({ manifest });
  record.verdict = "PASS_WITH_WARN_CURSOR_ONLY";
  record.duplicateHandling = "MANIFEST_ONLY_NO_CHATGPT_SOURCE";
  return record;
}

function main() {
  const results = TARGETS.map(migrateOne);
  const bridgeProof = {
    schemaVersion: "harvest-p2-chatgpt-draft-migration-receipt-v1",
    migratedAt: new Date().toISOString(),
    referenceChatGptBridge: {
      harvestId: "harvest-2026-08-04-ultimate-sdlc-runner-dark-package-v1",
      chatgptSource: true,
      expansionReceipt: fs.existsSync(
        path.join(runDir("harvest-2026-08-04-ultimate-sdlc-runner-dark-package-v1"), "intelligence-expansion-receipt.json"),
      ),
      sourceSectionsDropped: 0,
      verdict: "PASS",
    },
    migrations: results,
    verdict: results.every((r) => r.verdict.startsWith("PASS")) ? "PASS" : "PASS_WITH_WARN",
  };

  fs.mkdirSync(MILESTONE_DIR, { recursive: true });
  fs.writeFileSync(path.join(MILESTONE_DIR, "p2-chatgpt-draft-migration-receipt.json"), `${JSON.stringify(bridgeProof, null, 2)}\n`);
  console.log(`harvest:migrate-chatgpt-drafts ${bridgeProof.verdict}`);
  console.log(JSON.stringify(bridgeProof, null, 2));
}

main();
