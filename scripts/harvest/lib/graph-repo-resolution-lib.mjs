import fs from "node:fs";
import path from "node:path";

import { resolveSiblingRepo } from "../../index/lib/resolve-repo-roots.mjs";

export const GRAPH_REPO_UNAVAILABLE = "GRAPH_AUTHORITY_UNAVAILABLE";

/**
 * Resolve CG-MASTER-GRAPH root without hardcoding /home/wesle paths in receipts.
 */
export function resolveGraphRepoRoot(crossAgentRoot, options = {}) {
  if (options.graphRepoRoot) {
    const explicit = options.graphRepoRoot;
    if (fs.existsSync(path.join(explicit, "package.json"))) {
      return { ok: true, graphRepoRoot: explicit, resolution: "explicit" };
    }
    return {
      ok: false,
      verdict: GRAPH_REPO_UNAVAILABLE,
      resolution: "explicit_invalid",
      graphRepoRoot: null,
    };
  }

  if (process.env.CG_MASTER_GRAPH_ROOT && fs.existsSync(path.join(process.env.CG_MASTER_GRAPH_ROOT, "package.json"))) {
    return {
      ok: true,
      graphRepoRoot: process.env.CG_MASTER_GRAPH_ROOT,
      resolution: "CG_MASTER_GRAPH_ROOT",
    };
  }

  if (process.env.CG_REPOS_ROOT) {
    const candidate = path.join(process.env.CG_REPOS_ROOT, "CG-MASTER-GRAPH");
    if (fs.existsSync(path.join(candidate, "package.json"))) {
      return { ok: true, graphRepoRoot: candidate, resolution: "CG_REPOS_ROOT" };
    }
  }

  const sibling = resolveSiblingRepo(crossAgentRoot, "CG-MASTER-GRAPH");
  if (fs.existsSync(path.join(sibling, "package.json"))) {
    return { ok: true, graphRepoRoot: sibling, resolution: "sibling" };
  }

  return {
    ok: false,
    verdict: GRAPH_REPO_UNAVAILABLE,
    resolution: "unavailable",
    graphRepoRoot: null,
  };
}

export function inferGraphEligibility(manifest) {
  const tier = manifest.threadAutopsy?.tier ?? manifest.harvestTier ?? "T1";
  if (manifest.graphEligible === false) return false;
  if (manifest.graphEligible === true) return true;
  return ["T2", "T3"].includes(tier) || (manifest.packets?.length ?? 0) > 0;
}
