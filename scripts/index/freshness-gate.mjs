#!/usr/bin/env node
/**
 * Fail-closed gate: Git HEAD, Supabase projection, and L: LATEST must share sourceCommitSha.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolveGitHead } from "./lib/git-head.mjs";
import { resolveAppBuilderRoot } from "./lib/resolve-repo-roots.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const APP_BUILDER_ROOT = resolveAppBuilderRoot(REPO_ROOT);
const HUB_ROOT =
  process.env.INTELLIGENCE_HUB_ROOT?.trim() ||
  process.env.CG_INTELLIGENCE_HUB_ROOT?.trim() ||
  "/mnt/l/Capital-Glass-Intelligence-Hub";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function probeSupabase() {
  const cmd =
    `doppler run --project cg-mcp --config dev -- npm run cross-agent-ledger:drift-probe -- --repo=${REPO_ROOT} --json`;
  let out = "";
  try {
    out = execSync(cmd, { cwd: APP_BUILDER_ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (err) {
    out = `${err.stdout ?? ""}${err.stderr ?? ""}`;
  }
  const start = out.indexOf("{");
  const end = out.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("drift-probe produced no JSON");
  return JSON.parse(out.slice(start, end + 1));
}

function readHubSha() {
  const latestPath = path.join(HUB_ROOT, "00-master-index/active-work-ledger/LATEST.json");
  if (!fs.existsSync(latestPath)) {
    return { available: false, sourceCommitSha: null, path: latestPath };
  }
  const latest = readJson(latestPath);
  return { available: true, sourceCommitSha: latest.sourceCommitSha, path: latestPath };
}

/**
 * Honest hot-cache (Z: intelligence-hub-index bundle) freshness layer.
 * FRESH = bundle present and aligned with git HEAD.
 * STALE = bundle present but sourceCommitSha != git HEAD.
 * NOT_CHECKED = bundle does not exist yet (never published).
 * UNAVAILABLE = Z: mount/authority unreachable, or the resolver itself errored.
 */
async function readHotCacheLayer(gitHead) {
  try {
    const libDir = path.join(APP_BUILDER_ROOT, "scripts/intelligence-hub/index-freshness/lib");
    const zMasterLib = path.join(APP_BUILDER_ROOT, "scripts/ai-cache-z-master/lib/ai-cache-z-paths.mjs");
    const { resolveZAiCacheAuthorityState } = await import(pathToFileURL(zMasterLib).href);
    const { resolveZIndexPaths } = await import(pathToFileURL(path.join(libDir, "paths.mjs")).href);

    const authority = resolveZAiCacheAuthorityState(process.env);
    if (!authority.ok) {
      return { verdict: "UNAVAILABLE", reason: authority.reason ?? "Z_AUTHORITY_UNREACHABLE" };
    }
    const zPaths = resolveZIndexPaths(process.env, authority.zAiCacheRoot);
    if (!fs.existsSync(zPaths.bundlePath)) {
      return {
        verdict: "NOT_CHECKED",
        reason: "hot-cache index bundle has never been published for this repo",
        bundlePath: zPaths.bundlePath,
      };
    }
    const bundle = readJson(zPaths.bundlePath);
    return {
      verdict: bundle.sourceCommitSha === gitHead ? "FRESH" : "STALE",
      sourceCommitSha: bundle.sourceCommitSha ?? null,
      bundlePath: zPaths.bundlePath,
      generatedAt: bundle.generatedAt ?? null,
    };
  } catch (err) {
    return { verdict: "UNAVAILABLE", reason: String(err.message ?? err) };
  }
}

async function main() {
  const gitHead = resolveGitHead(REPO_ROOT);
  const hub = readHubSha();
  const drift = probeSupabase();
  const supabaseSha = drift?.drift?.supabase?.sourceCommitSha ?? null;
  const hotCache = await readHotCacheLayer(gitHead);

  const issues = [];
  if (!hub.available) issues.push(`L: LATEST missing: ${hub.path}`);
  if (hub.available && hub.sourceCommitSha !== gitHead) {
    issues.push(`L: sourceCommitSha ${hub.sourceCommitSha} !== git ${gitHead}`);
  }
  if (drift.verdict !== "IN_SYNC") issues.push(`Supabase drift verdict: ${drift.verdict}`);
  if (supabaseSha && supabaseSha !== gitHead) {
    issues.push(`Supabase sourceCommitSha ${supabaseSha} !== git ${gitHead}`);
  }
  if (drift.gitHead && drift.gitHead !== gitHead) {
    issues.push(`drift-probe gitHead ${drift.gitHead} !== local git ${gitHead}`);
  }
  if (hotCache.verdict === "STALE") {
    issues.push(`hot cache (Z: intelligence-hub-index) sourceCommitSha ${hotCache.sourceCommitSha} !== git ${gitHead}`);
  }

  const receipt = {
    schemaVersion: "cross-agent-index-freshness-gate-v1@1.0.0",
    generatedAt: new Date().toISOString(),
    verdict: issues.length === 0 ? "PASS" : "FAIL",
    gitHead,
    layers: {
      git: { sourceCommitSha: gitHead },
      supabase: {
        sourceCommitSha: supabaseSha,
        verdict: drift.verdict,
        inSync: supabaseSha === gitHead && drift.verdict === "IN_SYNC",
      },
      intelligenceHub: {
        sourceCommitSha: hub.sourceCommitSha,
        available: hub.available,
        inSync: hub.sourceCommitSha === gitHead,
        path: hub.path,
      },
      hotCache,
    },
    issues,
  };

  const outDir = path.join(REPO_ROOT, "artifacts/agent-runs/cross-agent-index-freshness-gate-v1");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "latest.json");
  fs.writeFileSync(outPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");

  if (issues.length > 0) {
    console.error("index:freshness-gate FAIL");
    for (const issue of issues) console.error(`  - ${issue}`);
    console.error(`  receipt: ${outPath}`);
    process.exit(1);
  }

  console.log(`index:freshness-gate PASS gitHead=${gitHead}`);
  console.log(`  receipt: ${outPath}`);
}

main().catch((err) => {
  console.error(`index:freshness-gate FAIL — ${err.message ?? err}`);
  process.exit(1);
});
