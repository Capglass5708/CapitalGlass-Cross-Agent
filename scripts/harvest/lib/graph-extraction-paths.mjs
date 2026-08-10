import path from "node:path";
import { fileURLToPath } from "node:url";
import { REPO_ROOT } from "./paths.mjs";
import { resolveGraphRepoRoot } from "./graph-repo-resolution-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Canonical graph authority repo.
 * Prefer CG_MASTER_GRAPH_ROOT / CG_REPOS_ROOT / sibling resolution over host-hardcoded paths.
 */
export function graphRepoRoot() {
  const resolved = resolveGraphRepoRoot(REPO_ROOT);
  if (resolved.ok) return resolved.graphRepoRoot;
  // Backward-compatible fallback for callers that only check filesystem existence.
  return path.resolve(REPO_ROOT, "../CG-MASTER-GRAPH");
}

export function graphRepoRootResolved(options = {}) {
  return resolveGraphRepoRoot(REPO_ROOT, options);
}

export function graphExtractionPath(runDir) {
  return path.join(runDir, "graph-extraction.json");
}

export function graphExtractionValidationPath(runDir) {
  return path.join(runDir, "graph-extraction-validation-result.json");
}

export const GRAPH_EXTRACTION_LIB = path.join(__dirname, "graph-extraction-builder-lib.mjs");
