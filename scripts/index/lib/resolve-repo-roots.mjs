import fs from "node:fs";
import path from "node:path";

function isLegacyDrvfsRoot(repoRoot) {
  return typeof repoRoot === "string" && repoRoot.startsWith("/mnt/c/");
}

function hasPackageJson(repoRoot) {
  return fs.existsSync(path.join(repoRoot, "package.json"));
}

/** Prefer WSL ext4 sibling repos over legacy /mnt/c checkouts. */
export function resolveSiblingRepo(crossAgentRoot, dirName) {
  const envKey = dirName.replace(/-/g, "_").toUpperCase();
  const envRoot = process.env[`${envKey}_ROOT`] || process.env[`CG_${envKey}_ROOT`];

  const candidates = [
    ...(envRoot && !isLegacyDrvfsRoot(envRoot) ? [envRoot] : []),
    path.join(crossAgentRoot, "..", dirName),
    path.join("/home/wesley/repos", dirName),
    ...(envRoot && isLegacyDrvfsRoot(envRoot) ? [envRoot] : []),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (hasPackageJson(candidate)) return candidate;
  }

  return path.join(crossAgentRoot, "..", dirName);
}

export function resolveAppBuilderRoot(crossAgentRoot) {
  if (process.env.CG_APPBUILDER_MCP_ROOT && !isLegacyDrvfsRoot(process.env.CG_APPBUILDER_MCP_ROOT)) {
    return process.env.CG_APPBUILDER_MCP_ROOT;
  }
  return resolveSiblingRepo(crossAgentRoot, "CG-AppBuilder-MCP");
}

export function resolveDataExtractionRoot(crossAgentRoot) {
  if (process.env.DATA_EXTRACTION_ROOT && !isLegacyDrvfsRoot(process.env.DATA_EXTRACTION_ROOT)) {
    return process.env.DATA_EXTRACTION_ROOT;
  }
  return resolveSiblingRepo(crossAgentRoot, "Data-Extraction");
}
