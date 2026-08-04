import path from "node:path";
import { fileURLToPath } from "node:url";
import { REPO_ROOT } from "./paths.mjs";
import { resolveGraphRepoRoot } from "./graph-repo-resolution-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Canonical graph authority repo — portable resolution (no hardcoded home paths in receipts). */
export function graphRepoRoot() {
  const resolved = resolveGraphRepoRoot(REPO_ROOT);
  if (resolved.ok) return resolved.graphRepoRoot;
  const env = process.env.CG_MASTER_GRAPH_ROOT;
  if (env) return path.resolve(env);
  return path.resolve(REPO_ROOT, "../CG-MASTER-GRAPH");
}

export function graphRepoResolution() {
  return resolveGraphRepoRoot(REPO_ROOT);
}

/** Legacy in-run path — forbidden for Git commit; use staging or pointer only. */
export function graphExtractionPath(runDir) {
  return path.join(runDir, "graph-extraction.json");
}

export function graphExtractionPointerPath(runDir) {
  return path.join(runDir, "graph-extraction-pointer-v1.json");
}

export function graphEligibilityStatusPath(runDir) {
  return path.join(runDir, "graph-eligibility-status-v1.json");
}

export function graphExtractionValidationPath(runDir) {
  return path.join(runDir, "graph-extraction-validation-result.json");
}

export const GRAPH_EXTRACTION_LIB = path.join(__dirname, "graph-extraction-builder-lib.mjs");
