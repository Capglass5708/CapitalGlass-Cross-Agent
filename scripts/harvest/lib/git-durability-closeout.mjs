import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const DURABLE_CLASSES = new Set([
  "SOURCE_CHANGE",
  "SCHEMA_OR_CONTRACT",
  "DURABLE_REGISTRY",
  "DURABLE_INDEX",
  "PUBLICATION_RECEIPT",
]);

const EXCLUDED_PATTERNS = [
  /^artifacts\/agent-runs\/.*\/operational-publication-receipt\.json$/,
  /^artifacts\/agent-runs\/.*\/graph-extraction/,
  /^artifacts\/agent-runs\/.*\/prompt-candidates\.json$/,
  /^harvest\/z-mirror-sync-receipt\.json$/,
];

function classifyPath(relPath) {
  if (relPath.includes(".env") || /secret|password|token/i.test(relPath)) return "SECRET_OR_SENSITIVE";
  if (relPath.startsWith("scripts/harvest/lib/") && relPath.endsWith(".mjs")) return "SOURCE_CHANGE";
  if (relPath.startsWith("scripts/harvest/") && relPath.endsWith(".mjs")) return "SOURCE_CHANGE";
  if (relPath.startsWith("scripts/tests/")) return "SOURCE_CHANGE";
  if (relPath === "work-progress/harvest-packet-registry.json") return "DURABLE_REGISTRY";
  if (relPath === "work-progress/owner-repo-boundary-index.json") return "DURABLE_REGISTRY";
  if (relPath === "work-progress/projects/INDEX.md") return "DURABLE_INDEX";
  if (relPath.startsWith("artifacts/agent-runs/harvest-publication-reliability")) return "PUBLICATION_RECEIPT";
  if (EXCLUDED_PATTERNS.some((re) => re.test(relPath))) return "RUNTIME_ONLY";
  if (relPath.startsWith("artifacts/agent-runs/")) return "RUNTIME_ONLY";
  return "UNCLASSIFIED";
}

export function classifyGitChanges(repoRoot) {
  const raw = execSync("git status --porcelain", { cwd: repoRoot, encoding: "utf8" });
  const files = raw
    .split("\n")
    .map((l) => l.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const rel = line.slice(3).trim();
      return { status: line.slice(0, 2).trim(), path: rel, classification: classifyPath(rel) };
    });

  const included = files.filter((f) => DURABLE_CLASSES.has(f.classification));
  const excluded = files.filter((f) => !DURABLE_CLASSES.has(f.classification));
  const blocked = files.filter((f) => f.classification === "SECRET_OR_SENSITIVE" || f.classification === "UNCLASSIFIED");

  return { files, included, excluded, blocked };
}

export function buildGitDurabilityReport({ repoRoot, branch, dryRun = true, harvestId, runId }) {
  const startSha = execSync("git rev-parse HEAD", { cwd: repoRoot, encoding: "utf8" }).trim();
  const classification = classifyGitChanges(repoRoot);

  const report = {
    schemaVersion: "harvest-git-durability-report-v1@1.0.0",
    harvestId,
    runId,
    generatedAt: new Date().toISOString(),
    gitDurabilityStatus: "PENDING",
    branch: branch ?? `harvest/${harvestId}`,
    startSha,
    finalSha: startSha,
    commitSha: null,
    pushed: false,
    originParity: "not-run",
    dryRun,
    includedFiles: classification.included.map((f) => f.path),
    excludedFiles: classification.excluded.map((f) => f.path),
    blockedFiles: classification.blocked.map((f) => f.path),
  };

  if (classification.blocked.some((f) => f.classification === "SECRET_OR_SENSITIVE")) {
    report.gitDurabilityStatus = "BLOCKED";
    return report;
  }

  if (classification.included.length === 0) {
    report.gitDurabilityStatus = "NOT_REQUIRED";
    return report;
  }

  if (dryRun) {
    report.gitDurabilityStatus = "PENDING";
    return report;
  }

  return report;
}
