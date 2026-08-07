#!/usr/bin/env node
/**
 * Project optional Supabase derived views for a harvest (thread autopsy + prompt metadata).
 * Uses Doppler cg-mcp/dev when direct Supabase auth is not in the environment.
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveAppBuilderRoot } from "../index/lib/resolve-repo-roots.mjs";
import { resolveHubRoot } from "./lib/publish-hub-seed-lib.mjs";
import {
  buildDopplerWrappedCommand,
  resolveSupabaseProjectionCapability,
  shouldWrapSupabaseCommand,
} from "./lib/supabase-projection-capability-lib.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function parseJsonFromOutput(stdout) {
  const text = String(stdout ?? "").trim();
  try {
    return JSON.parse(text);
  } catch {
    const lines = text.split(/\r?\n/);
    for (let i = lines.length - 1; i >= 0; i -= 1) {
      const candidate = lines.slice(i).join("\n").trim();
      if (!candidate.startsWith("{")) continue;
      try {
        return JSON.parse(candidate);
      } catch {
        // keep scanning upward for a valid JSON block
      }
    }
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new Error(`no JSON object in process output: ${text.slice(0, 200)}`);
  }
}

function parseArgs(argv) {
  const args = { harvestId: null, json: false, dryRun: false };
  for (const arg of argv) {
    if (arg === "--json") args.json = true;
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg.startsWith("--harvest-id=")) args.harvestId = arg.slice("--harvest-id=".length);
  }
  if (!args.harvestId) throw new Error("--harvest-id is required");
  return args;
}

function runScript(appBuilderRoot, scriptRel, scriptArgs, env, wrap) {
  const scriptPath = path.join(appBuilderRoot, scriptRel);
  const inner = `node ${JSON.stringify(scriptPath)} ${scriptArgs.join(" ")}`.trim();
  const cmd = wrap ? buildDopplerWrappedCommand(inner) : inner;
  return execSync(cmd, {
    cwd: appBuilderRoot,
    env: { ...process.env, ...env },
    encoding: "utf8",
    shell: true,
  });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const capability = resolveSupabaseProjectionCapability();
  if (capability.status !== "AVAILABLE") {
    const result = {
      verdict: "SUPABASE_CAPABILITY_UNAVAILABLE",
      capability,
      harvestId: args.harvestId,
    };
    if (args.json) console.log(JSON.stringify(result, null, 2));
    else console.error("Supabase projection capability unavailable");
    process.exit(2);
  }

  if (args.dryRun) {
    const result = {
      verdict: "SUPABASE_PROJECTION_DRY_RUN_READY",
      capability,
      harvestId: args.harvestId,
    };
    if (args.json) console.log(JSON.stringify(result, null, 2));
    else console.log(`Supabase projection ready via ${capability.authMethod}`);
    return;
  }

  const appBuilderRoot = resolveAppBuilderRoot(REPO_ROOT);
  const hubRoot = resolveHubRoot();
  const wrap = shouldWrapSupabaseCommand(capability);

  const threadStdout = runScript(
    appBuilderRoot,
    "scripts/intelligence-hub/thread-autopsy/project-supabase.mjs",
    [`--harvest-id=${args.harvestId}`, "--apply", "--json"],
    { INTELLIGENCE_HUB_ROOT: hubRoot, CAPITALGLASS_CROSS_AGENT_ROOT: REPO_ROOT },
    wrap,
  );
  const promptStdout = runScript(
    appBuilderRoot,
    "scripts/harvest-prompt-projection/project-harvest-prompts.mjs",
    ["--json"],
    { CROSS_AGENT_ROOT: REPO_ROOT },
    wrap,
  );

  const result = {
    verdict: "SUPABASE_PROJECTION_COMPLETE",
    capability,
    harvestId: args.harvestId,
    threadAutopsy: parseJsonFromOutput(threadStdout),
    harvestPrompts: parseJsonFromOutput(promptStdout),
  };
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else console.log(`Supabase projection complete (${capability.authMethod})`);
}

main();
