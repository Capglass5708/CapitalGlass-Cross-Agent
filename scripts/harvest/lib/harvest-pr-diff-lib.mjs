import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/** Paths governed by harvest authority retention on every PR. */
export const GOVERNED_PATH_PREFIXES = [
  "artifacts/agent-runs/",
  "artifacts/index/",
  "runtime/",
  "work-progress/",
  "docs/master-graph/",
  "graph/",
];

const GOVERNED_EXACT = new Set(["package.json"]);

export function isGovernedPath(relPath) {
  const normalized = relPath.replace(/\\/g, "/");
  if (GOVERNED_EXACT.has(normalized)) return true;
  return GOVERNED_PATH_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export function resolveDiffRefs({ repoRoot, baseRef = null, headRef = "HEAD" }) {
  let base = baseRef;
  if (!base) {
    try {
      base = execFileSync("git", ["merge-base", "HEAD", "origin/main"], {
        cwd: repoRoot,
        encoding: "utf8",
      }).trim();
    } catch {
      base = execFileSync("git", ["rev-parse", "origin/main"], {
        cwd: repoRoot,
        encoding: "utf8",
      }).trim();
    }
  }
  const head = headRef === "HEAD"
    ? execFileSync("git", ["rev-parse", "HEAD"], { cwd: repoRoot, encoding: "utf8" }).trim()
    : headRef;
  return { baseRef: base, headRef: head };
}

export function listChangedFiles({ repoRoot, baseRef, headRef }) {
  const out = execFileSync("git", ["diff", "--name-status", `${baseRef}..${headRef}`], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  const changes = [];
  for (const line of out.split("\n")) {
    if (!line.trim()) continue;
    const parts = line.split("\t");
    const status = parts[0];
    if (status.startsWith("R") && parts.length >= 3) {
      changes.push({ status, from: parts[1], path: parts[2] });
      continue;
    }
    changes.push({ status, path: parts[1] });
  }
  return changes;
}

export function readFileAtRef(repoRoot, ref, relPath) {
  try {
    return execFileSync("git", ["show", `${ref}:${relPath}`], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
}

export function readWorkingTreeFile(repoRoot, relPath) {
  const abs = path.join(repoRoot, relPath);
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, "utf8");
}

/**
 * Build before/after pairs for metadata churn validation on PR diff.
 */
export function buildPrDiffContentPairs({ repoRoot, baseRef, headRef, files }) {
  const beforeContent = {};
  const afterContent = {};
  for (const rel of files) {
    const before = readFileAtRef(repoRoot, baseRef, rel);
    const after = readWorkingTreeFile(repoRoot, rel);
    if (before !== null) beforeContent[rel] = before;
    if (after !== null) afterContent[rel] = after;
  }
  return { beforeContent, afterContent };
}

export function extractHarvestIdFromPath(relPath) {
  const match = relPath.match(/^artifacts\/agent-runs\/([^/]+)\//);
  return match ? match[1] : null;
}

export function governedChanges(changes) {
  return changes.filter((c) => isGovernedPath(c.path) || (c.from && isGovernedPath(c.from)));
}
