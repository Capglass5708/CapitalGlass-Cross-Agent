import path from "node:path";
import { fileURLToPath } from "node:url";
import { REPO_ROOT } from "./paths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Canonical graph authority repo (override with CG_MASTER_GRAPH_ROOT). */
export function graphRepoRoot() {
  const env = process.env.CG_MASTER_GRAPH_ROOT;
  if (env) return path.resolve(env);
  return path.resolve(REPO_ROOT, "../CG-MASTER-GRAPH");
}

export function graphExtractionPath(runDir) {
  return path.join(runDir, "graph-extraction.json");
}

export function graphExtractionValidationPath(runDir) {
  return path.join(runDir, "graph-extraction-validation-result.json");
}

export const GRAPH_EXTRACTION_LIB = path.join(__dirname, "graph-extraction-builder-lib.mjs");
