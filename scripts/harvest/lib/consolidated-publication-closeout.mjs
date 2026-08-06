import fs from "node:fs";
import path from "node:path";

import { classifyFinalVerdict } from "./publication-run-contract.mjs";

export function buildConsolidatedPublicationCloseout({
  harvestId,
  runId,
  milestoneId,
  waveId,
  startedAt,
  completedAt,
  sourceCommitSha,
  retrieval = {},
  capabilityPreflight,
  dryRun,
  transaction,
  corePublication,
  optionalProjections,
  duplication,
  promptTriage,
  authorityIntegrity,
  postPublicationIntegrity,
  gitDurability,
  tests = {},
  warnings = [],
  blockers = [],
}) {
  const optionalWarnings = warnings.filter((w) => w.startsWith("WARN_"));
  const coreFailures = blockers.filter((b) => b.startsWith("BLOCK_"));

  const finalVerdict = classifyFinalVerdict({
    corePublication: corePublication?.status ?? "FAIL",
    authorityIntegrity: authorityIntegrity?.verdict ?? "PASS",
    gitDurability: gitDurability?.gitDurabilityStatus ?? "PENDING",
    optionalWarnings,
    coreFailures,
  });

  return {
    schemaVersion: "harvest-consolidated-publication-closeout-v1@1.0.0",
    harvestId,
    runId,
    milestoneId,
    waveId,
    startedAt,
    completedAt,
    sourceCommitSha,
    authoritySnapshot: {
      gitProtocolAuthority: "CapitalGlass-Cross-Agent/harvest/protocol",
      lCatalogRole: "RETRIEVAL_AND_PROPOSAL",
      zRole: "APPROVED_RELEASE_MIRROR",
      supabaseRole: "DERIVED_PROJECTION",
    },
    retrieval,
    capabilityPreflight,
    dryRun,
    transaction,
    corePublication,
    optionalProjections,
    duplication,
    promptTriage,
    authorityIntegrity,
    postPublicationIntegrity,
    gitDurability,
    tests,
    warnings,
    blockers,
    remainingActions: blockers.length
      ? blockers.map((b) => `resolve:${b}`)
      : optionalWarnings.map((w) => `review:${w}`),
    finalVerdict,
  };
}

export function writeConsolidatedCloseout({ repoRoot, harvestId, runId, closeout }) {
  const dir = path.join(repoRoot, "artifacts/agent-runs", harvestId, runId);
  fs.mkdirSync(dir, { recursive: true });
  const jsonPath = path.join(dir, "consolidated-publication-closeout.json");
  fs.writeFileSync(jsonPath, `${JSON.stringify(closeout, null, 2)}\n`, "utf8");

  const md = buildHumanSummary(closeout);
  const mdPath = path.join(dir, "publication-closeout.md");
  fs.writeFileSync(mdPath, md, "utf8");

  return { jsonPath, mdPath };
}

function buildHumanSummary(closeout) {
  const c = closeout;
  return `# Publication closeout — ${c.harvestId}

**Run:** ${c.runId}  
**Final verdict:** ${c.finalVerdict}  
**Milestone:** ${c.milestoneId} / ${c.waveId}

## Core publication
- Validated: ${c.corePublication?.validated ?? "unknown"}
- L published: ${c.corePublication?.lPublication ?? "unknown"}
- Indexed: ${c.corePublication?.indexUpdate ?? "unknown"}
- Blind retrieval: ${c.corePublication?.blindRetrieval ?? "unknown"}
- Freshness: ${c.corePublication?.freshness ?? "unknown"}

## Optional projections
- Z mirror: ${c.optionalProjections?.zMirror ?? "unknown"}
- Supabase: ${c.optionalProjections?.supabase ?? "unknown"}
- Prompt harvest: ${c.optionalProjections?.promptHarvest ?? "unknown"}

## Authority integrity
- Verdict: ${c.authorityIntegrity?.verdict ?? c.postPublicationIntegrity?.verdict ?? "unknown"}
- Git protocol regression: ${(c.postPublicationIntegrity?.regressions ?? []).length} issue(s)

## PromptOps
- Candidates triaged: ${c.promptTriage?.candidates?.length ?? 0}
- Approved: ${c.promptTriage?.approvedCount ?? 0} (automatic approval forbidden)

## Git durability
- Status: ${c.gitDurability?.gitDurabilityStatus ?? "unknown"}
- Branch: ${c.gitDurability?.branch ?? "n/a"}
- Commit: ${c.gitDurability?.commitSha ?? "n/a"}

## Remaining actions
${(c.remainingActions ?? []).map((a) => `- ${a}`).join("\n") || "- none"}
`;
}
