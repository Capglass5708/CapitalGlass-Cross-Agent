import fs from "node:fs";
import path from "node:path";

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyTree(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyTree(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }
  copyFile(src, dest);
}

function removeTree(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

/**
 * Snapshot repo-relative paths so tests can restore the worktree afterward.
 */
export function snapshotRepoPaths(repoRoot, relativePaths) {
  const tempRoot = fs.mkdtempSync(path.join(repoRoot, "artifacts/agent-runs/.worktree-snapshot-"));
  const entries = [];
  for (const rel of relativePaths) {
    const abs = path.join(repoRoot, rel);
    if (!fs.existsSync(abs)) {
      entries.push({ rel, kind: "missing" });
      continue;
    }
    const backup = path.join(tempRoot, rel);
    copyTree(abs, backup);
    entries.push({ rel, kind: fs.statSync(abs).isDirectory() ? "dir" : "file" });
  }
  return { tempRoot, entries };
}

export function restoreRepoSnapshot(repoRoot, snapshot) {
  if (!snapshot) return;
  for (const entry of snapshot.entries) {
    const abs = path.join(repoRoot, entry.rel);
    removeTree(abs);
    const backup = path.join(snapshot.tempRoot, entry.rel);
    if (entry.kind === "missing") continue;
    copyTree(backup, abs);
  }
  removeTree(snapshot.tempRoot);
}

export function withRepoSnapshot(repoRoot, relativePaths, fn) {
  const snapshot = snapshotRepoPaths(repoRoot, relativePaths);
  try {
    return fn();
  } finally {
    restoreRepoSnapshot(repoRoot, snapshot);
  }
}
