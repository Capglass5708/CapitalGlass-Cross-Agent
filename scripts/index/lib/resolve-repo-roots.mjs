import fs from "node:fs";
import path from "node:path";

/** Prefer WSL ext4 sibling repos over legacy /mnt/c checkouts. */
export function resolveSiblingRepo(crossAgentRoot, dirName) {
  const candidates = [
    process.env[`${dirName.replace(/-/g, "_").toUpperCase()}_ROOT`],
    path.join(crossAgentRoot, "..", dirName),
    path.join("/home/wesle/repos", dirName),
    path.join("/home/wesley/repos", dirName),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "package.json"))) return candidate;
  }

  return path.join(crossAgentRoot, "..", dirName);
}

export function resolveAppBuilderRoot(crossAgentRoot) {
  return process.env.CG_APPBUILDER_MCP_ROOT || resolveSiblingRepo(crossAgentRoot, "CG-AppBuilder-MCP");
}

export function resolveDataExtractionRoot(crossAgentRoot) {
  return process.env.DATA_EXTRACTION_ROOT || resolveSiblingRepo(crossAgentRoot, "Data-Extraction");
}
