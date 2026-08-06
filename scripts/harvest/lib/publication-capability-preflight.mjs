import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { resolveDataExtractionRoot } from "../../index/lib/resolve-repo-roots.mjs";
import { Z_HARVEST_PROTOCOL_ROOT } from "./z-harvest-mirror-lib.mjs";

function isMountPoint(mountPath) {
  try {
    return spawnSync("mountpoint", ["-q", mountPath], { encoding: "utf8" }).status === 0;
  } catch {
    return false;
  }
}

function redactEnvPresence(name) {
  const val = process.env[name];
  if (!val) return "OPTIONAL_UNAVAILABLE";
  return "AVAILABLE";
}

function checkSupabaseAuth() {
  if (process.env.SUPABASE_ACCESS_TOKEN?.trim()) return "AVAILABLE";
  const login = spawnSync("supabase", ["projects", "list"], {
    encoding: "utf8",
    timeout: 8000,
  });
  if (login.status === 0) return "AVAILABLE";
  return "OPTIONAL_UNAVAILABLE";
}

function checkWaveSdlcSource(repoRoot) {
  const deRoot = resolveDataExtractionRoot(repoRoot);
  const p = path.join(deRoot, "docs/platform/CURSOR_HARVEST_INGEST_CLOSEOUT_WAVE_SDLC_V1.md");
  return fs.existsSync(p) ? "AVAILABLE" : "REQUIRED_UNAVAILABLE";
}

/**
 * Host capability preflight — never returns secret values.
 */
export function runPublicationCapabilityPreflight({ repoRoot, hubRoot = "/mnt/l/Capital-Glass-Intelligence-Hub" } = {}) {
  const capabilities = {
    git: fs.existsSync(path.join(repoRoot, ".git")) ? "AVAILABLE" : "REQUIRED_UNAVAILABLE",
    gitPush: "UNVERIFIED",
    lDrive: isMountPoint("/mnt/l") && fs.existsSync(path.join(hubRoot, "00-master-index")) ? "AVAILABLE" : "REQUIRED_UNAVAILABLE",
    zDrive: isMountPoint("/mnt/z") && fs.existsSync(Z_HARVEST_PROTOCOL_ROOT) ? "AVAILABLE" : "OPTIONAL_UNAVAILABLE",
    zWaveSdlcSource: checkWaveSdlcSource(repoRoot),
    supabase: checkSupabaseAuth(),
    promptOps: fs.existsSync(path.join(repoRoot, "work-progress/command-index.json"))
      ? "AVAILABLE"
      : "OPTIONAL_UNAVAILABLE",
    hotRouting: isMountPoint("/mnt/c") ? "AVAILABLE" : "OPTIONAL_UNAVAILABLE",
  };

  const requiredUnavailable = [];
  const optionalUnavailable = [];

  for (const [key, val] of Object.entries(capabilities)) {
    if (val === "REQUIRED_UNAVAILABLE") requiredUnavailable.push(key);
    if (val === "OPTIONAL_UNAVAILABLE") optionalUnavailable.push(key);
  }

  let preflightVerdict = "PREFLIGHT_PASS";
  if (requiredUnavailable.length > 0) preflightVerdict = "PREFLIGHT_BLOCKED";

  return {
    schemaVersion: "harvest-publication-capability-preflight-v1@1.0.0",
    generatedAt: new Date().toISOString(),
    capabilities,
    requiredUnavailable,
    optionalUnavailable,
    preflightVerdict,
    warnings: optionalUnavailable.map((k) =>
      k === "supabase" ? "WARN_OPTIONAL_SUPABASE_UNAVAILABLE" : `WARN_OPTIONAL_${k.toUpperCase()}_UNAVAILABLE`,
    ),
    blockers: requiredUnavailable.map((k) =>
      k === "lDrive" ? "BLOCK_L_UNAVAILABLE" : "BLOCK_REQUIRED_CAPABILITY",
    ),
  };
}
