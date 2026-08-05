#!/usr/bin/env node
/**
 * Orchestrated e2e proof for scraper-data-extraction-improvements-v1 (fixture-based).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");
const NODE = process.env.NODE_BIN || process.execPath;
const DE_ROOT = join(REPO_ROOT, "..", "Data-Extraction");
const SCRAPER_ROOT = join(REPO_ROOT, "..", "Scraper", "ui-capture");
const MG_ROOT = join(REPO_ROOT, "..", "CG-MASTER-GRAPH");
const RUN_DIR = join(REPO_ROOT, "artifacts", "agent-runs", "scraper-data-extraction-improvements-v1");
const BUILD_OUT = join(SCRAPER_ROOT, "artifacts", "handoff-e2e-proof");

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8" });
  return { ok: r.status === 0, stdout: r.stdout, stderr: r.stderr, status: r.status };
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function main() {
  const results = [];
  const packageId = "PKG-E2E-PROOF-V1";

  const build = run(NODE, ["scripts/package-build.mjs", "--package", packageId, "--out", BUILD_OUT], SCRAPER_ROOT);
  results.push({ step: "scraper-package-build", ok: build.ok, detail: build.stdout || build.stderr });

  const verify = run(
    NODE,
    ["scripts/package-verify.mjs", "--package", packageId, "--dir", join(BUILD_OUT, "outbound", packageId)],
    SCRAPER_ROOT,
  );
  results.push({ step: "scraper-package-verify", ok: verify.ok, detail: verify.stdout || verify.stderr });

  const deTest = run("npm", ["run", "test:scraper-handoff"], DE_ROOT);
  results.push({ step: "de-handoff-tests", ok: deTest.ok });

  const norm = run(NODE, ["scripts/observations-normalize.mjs", "--fixture", "synology-office-admin-v1"], DE_ROOT);
  results.push({ step: "observations-normalize", ok: norm.ok, detail: norm.stdout || norm.stderr });

  const contrib = run(NODE, ["scripts/graph-contribution-build.mjs", "--fixture", "synology-office-admin-v1"], DE_ROOT);
  results.push({ step: "graph-contribution-build", ok: contrib.ok, detail: contrib.stdout || contrib.stderr });

  const envelopePath = join(DE_ROOT, "artifacts", "graph-contribution", "synology-office-admin-v1", "contribution-envelope.json");
  let mgValidate = { ok: false };
  if (existsSync(envelopePath)) {
    mgValidate = run(NODE, ["scripts/graph-validate-contribution.mjs", envelopePath], MG_ROOT);
  }
  results.push({ step: "graph-validate-contribution", ok: mgValidate.ok, detail: mgValidate.stdout || mgValidate.stderr });

  const allOk = results.every((r) => r.ok);
  const report = {
    schemaVersion: "scraper-de-e2e-proof-report-v1",
    workPackageId: "scraper-data-extraction-improvements-v1",
    verdict: allOk ? "PASS" : "BLOCKED",
    gateId: "SCRAPER_DATA_EXTRACTION_GRAPH_PIPELINE_VALIDATED_V1",
    recordedAt: new Date().toISOString(),
    results,
    lineage: {
      packageId,
      contributionEnvelope: existsSync(envelopePath) ? envelopePath : null,
    },
  };
  writeJson(join(RUN_DIR, "e2e-proof-report.json"), report);
  writeJson(join(RUN_DIR, "mission-closure-receipt.json"), {
    schemaVersion: "scraper-de-mission-closure-receipt-v1",
    missionId: "scraper-data-extraction-improvements-v1",
    harvestVerdict: allOk ? "COMPLETE" : "BLOCKED",
    operationalVerdict: allOk ? "SCRAPER_DATA_EXTRACTION_GRAPH_PIPELINE_VALIDATED_V1" : "BLOCKED",
    recordedAt: report.recordedAt,
    e2eProofReport: "artifacts/agent-runs/scraper-data-extraction-improvements-v1/e2e-proof-report.json",
  });
  console.log(JSON.stringify(report, null, 2));
  process.exit(allOk ? 0 : 1);
}

main();
