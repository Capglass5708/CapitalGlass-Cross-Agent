import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

export function resolveGitHead(repoRoot = REPO_ROOT) {
  return execSync("git rev-parse HEAD", { cwd: repoRoot, encoding: "utf8" }).trim();
}

export function resolveGitHeadShort(repoRoot = REPO_ROOT, length = 7) {
  return resolveGitHead(repoRoot).slice(0, length);
}
