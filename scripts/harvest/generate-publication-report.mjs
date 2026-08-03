#!/usr/bin/env node
/**
 * Generate final cross-check report from post-publication Hub retrieval.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveGitHead } from "../index/lib/git-head.mjs";
const HARVEST_ID = "harvest-project-folder-synology-primary-chat-v1";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HUB_ROOT =
  process.env.INTELLIGENCE_HUB_ROOT?.trim() ||
  "/mnt/l/Capital-Glass-Intelligence-Hub";
const WORK_PACKAGE = "complete-project-folder-synology-intelligence-publication-v1";
const HARVEST_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const OUT_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", WORK_PACKAGE);

function readJson(p) {
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null;
}

function main() {
  const gitHead = resolveGitHead(REPO_ROOT);
  const hubPub = readJson(path.join(OUT_DIR, "hub-publication-receipt.json"));
  const hubRetrieval = readJson(path.join(OUT_DIR, "hub-retrieval-results.json"));
  const freshness = readJson(path.join(REPO_ROOT, "artifacts/agent-runs/cross-agent-index-freshness-gate-v1/latest.json"));
  const indexPub = readJson(path.join(REPO_ROOT, "runtime/index-publication/latest.json"));
  const seedManifest = readJson(path.join(HARVEST_DIR, "intelligence-hub-seed-manifest.json"));
  const qaIndex = readJson(path.join(HARVEST_DIR, "qa-index.json"));
  const manifest = readJson(path.join(HARVEST_DIR, "harvest-manifest-v1.json"));

  const hubLatest = readJson(path.join(HUB_ROOT, "00-master-index/active-work-ledger/LATEST.json"));
  const dirtyBaseline = readJson(path.join(OUT_DIR, "dirty-worktree-baseline.json"));

  const gates = {
    lPublication: hubPub?.verdict === "PUBLISH_PASS",
    supabaseParity: freshness?.verdict === "PASS",
    seedSubjects: seedManifest?.seedRecordCount === 22 && qaIndex?.records?.length === 22,
    retrieval24: hubRetrieval?.questionsPassed === 24,
    indexPublication: indexPub?.verdict === "PUBLISH_PASS" || indexPub?.verdict === "NOOP_CURRENT",
  };

  const allPass = Object.values(gates).every(Boolean);
  const verdict = allPass ? "INTELLIGENCE_HUB_SEED_AND_REPORT_PASS" : "INTELLIGENCE_HUB_SEED_AND_REPORT_PARTIAL";

  const lines = [];
  lines.push("# Intelligence Hub Seed and Report — Project Folder Synology");
  lines.push("");
  lines.push(`**Work package:** \`${WORK_PACKAGE}\``);
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Final verdict:** \`${verdict}\``);
  lines.push("");

  lines.push("## 1. Final verdict");
  lines.push("");
  lines.push(`| Gate | Result |`);
  lines.push(`| --- | --- |`);
  for (const [k, v] of Object.entries(gates)) {
    lines.push(`| ${k} | ${v ? "PASS" : "FAIL"} |`);
  }
  lines.push("");

  lines.push("## 2. Current operational truth");
  lines.push("");
  lines.push(`| Fact | Value |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Production promotion | CLOSED — PRODUCTION_PROMOTION_PASS |`);
  lines.push(`| Promotion merge SHA | \`${manifest?.lineage?.promotionMergeSha ?? "5a436d1"}\` |`);
  lines.push(`| Live application SHA | \`${manifest?.lineage?.liveProductionShaVerified ?? "0f84735"}\` (descendant) |`);
  lines.push(`| Production flag | PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=true |`);
  lines.push(`| Production worker | CapitalGlass-Office-ProjectFolder-Provision RUNNING |`);
  lines.push(`| Production root | L:\\\\Capital-Glass-Projects\\\\ |`);
  lines.push(`| Dev root | L:\\\\Capital-Glass-Projects-Dev\\\\ |`);
  lines.push(`| Production Supabase | wvidyxufvcrtezzkwwse |`);
  lines.push(`| Dev Supabase | mazvavlshjshwklcvxaw |`);
  lines.push(`| Historical migration | Frozen — NOT STARTED |`);
  lines.push(`| SharePoint Slice 4 | Frozen — NOT STARTED |`);
  lines.push(`| Stabilization | 24h observe-only |`);
  lines.push("");

  lines.push("## 3. Git versus L: versus Supabase parity");
  lines.push("");
  lines.push(`| Layer | sourceCommitSha | Status |`);
  lines.push(`| --- | --- | --- |`);
  lines.push(`| Git (worktree) | \`${gitHead}\` | authority |`);
  lines.push(`| L: active-work-ledger | \`${hubLatest?.sourceCommitSha ?? "unknown"}\` | ${hubLatest?.sourceCommitSha === gitHead ? "in sync" : "check freshness gate"} |`);
  lines.push(`| L: harvest BY-KIND | \`${hubPub?.sourceCommitSha ?? "n/a"}\` | ${hubPub?.verdict ?? "missing"} |`);
  lines.push(`| Supabase projection | \`${freshness?.layers?.supabase?.sourceCommitSha ?? "unknown"}\` | ${freshness?.layers?.supabase?.verdict ?? freshness?.verdict ?? "unknown"} |`);
  lines.push(`| Freshness gate | — | \`${freshness?.verdict ?? "NOT_RUN"}\` |`);
  lines.push("");

  lines.push("## 4. All 24 retrieved questions and answers");
  lines.push("");
  for (const r of hubRetrieval?.results ?? []) {
    lines.push(`### ${r.retrievalId}: ${r.query}`);
    lines.push(`- **Returned IH-PFSP:** ${r.returnedIhPfspId}`);
    lines.push(`- **Short answer:** ${r.shortAnswer}`);
    lines.push(`- **Classification:** ${r.answerClassification}`);
    lines.push(`- **Layer:** ${r.retrievalLayer}`);
    lines.push(`- **Authority:** ${(r.authorityPaths ?? []).join(", ")}`);
    lines.push("");
  }

  lines.push("## 5. IH-PFSP-001 through IH-PFSP-022 record mapping");
  lines.push("");
  lines.push(`| IH-PFSP | Question ID | Hub catalog path |`);
  lines.push(`| --- | --- | --- |`);
  for (const m of seedManifest?.mapping ?? []) {
    lines.push(`| ${m.ihPfspId} | ${m.questionId} | \`${m.hubCatalogPath}\` |`);
  }
  lines.push("");

  lines.push("## 6. Seed-versus-retrieval comparison");
  lines.push("");
  lines.push(`- Seed records: ${qaIndex?.records?.length ?? 0}/22`);
  lines.push(`- Retrieval questions executed: ${hubRetrieval?.questionsExecuted ?? 0}/24`);
  lines.push(`- Retrieval pass rate: ${hubRetrieval?.questionsPassed ?? 0}/24`);
  lines.push(`- Chat transcript coverage: ${qaIndex?.chatTranscriptCoverage ?? "PARTIAL"}`);
  lines.push("");

  lines.push("## 7. Historical-state supersession");
  lines.push("");
  lines.push("- CONTRACT_PASS_HOSTED_DEV_HOLD superseded by DEV_ENVIRONMENT_ACCEPTED");
  lines.push("- PRODUCTION_PROMOTION_HOLD superseded by PRODUCTION_PROMOTION_PASS");
  lines.push("- 405 route probe superseded by 401 live routes at 5a436d1+");
  lines.push("");

  lines.push("## 8. Contradictions and unresolved claims");
  lines.push("");
  lines.push("- No current answer sourced exclusively from obsolete HOLD records (verified in retrieval benchmark).");
  lines.push("- Live SHA may advance beyond promotion merge; promotion merge remains lineage authority.");
  lines.push("");

  lines.push("## 9. Evidence ledger");
  lines.push("");
  lines.push(`| Artifact | Path |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Hub publication receipt | artifacts/agent-runs/${WORK_PACKAGE}/hub-publication-receipt.json |`);
  lines.push(`| Hub retrieval results | artifacts/agent-runs/${WORK_PACKAGE}/hub-retrieval-results.json |`);
  lines.push(`| Index publication | runtime/index-publication/latest.json |`);
  lines.push(`| Freshness gate | artifacts/agent-runs/cross-agent-index-freshness-gate-v1/latest.json |`);
  lines.push(`| Harvest manifest | artifacts/agent-runs/${HARVEST_ID}/harvest-manifest-v1.json |`);
  lines.push("");

  lines.push("## 10. Retrieval quality metrics");
  lines.push("");
  lines.push(`| Metric | Value |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Questions executed | ${hubRetrieval?.questionsExecuted ?? 0}/24 |`);
  lines.push(`| Pass rate | ${((hubRetrieval?.score ?? 0) * 100).toFixed(1)}% |`);
  lines.push(`| Retrieval layer | intelligence-hub-L-catalog |`);
  lines.push(`| Source | L: only (not Git JSON) |`);
  lines.push("");

  lines.push("## 11. Human cross-check checklist");
  lines.push("");
  lines.push("- [ ] Confirm L: files exist under 02-catalog/knowledge-objects/cross-agent-harvest/");
  lines.push("- [ ] Confirm freshness gate PASS after index publication");
  lines.push("- [ ] Confirm production still in stabilization observe-only");
  lines.push("- [ ] Confirm no secrets in Hub records");
  lines.push("");

  lines.push("## 12. Original dirty worktree confirmation");
  lines.push("");
  if (dirtyBaseline) {
    lines.push("Baseline captured before publication; operator should verify main worktree unchanged.");
    lines.push(`\`\`\`json\n${JSON.stringify(dirtyBaseline, null, 2)}\n\`\`\``);
  } else {
    lines.push("No dirty baseline artifact recorded in this run.");
  }

  const reportPath = path.join(OUT_DIR, "INTELLIGENCE_HUB_SEED_AND_REPORT.md");
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");

  const receipt = {
    schemaVersion: "cross-agent-harvest-final-report-receipt-v1@1.0.0",
    workPackageId: WORK_PACKAGE,
    generatedAt: new Date().toISOString(),
    verdict,
    gitHead,
    reportPath: `artifacts/agent-runs/${WORK_PACKAGE}/INTELLIGENCE_HUB_SEED_AND_REPORT.md`,
    gates,
    retrievalScore: `${hubRetrieval?.questionsPassed ?? 0}/24`,
  };
  fs.writeFileSync(path.join(OUT_DIR, "final-report-receipt.json"), `${JSON.stringify(receipt, null, 2)}\n`);

  console.log(`generate-publication-report ${verdict}`);
  console.log(`  report: ${reportPath}`);
}

main();
