#!/usr/bin/env node
/**
 * Classify a Git/GitHub command against agent-runtime github-mutation-policy.
 * Read-only — used by admission guards and adversarial tests.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const POLICY_PATH = path.join(
  REPO_ROOT,
  "registry/agent-runtime/authority/github-mutation-policy.v1.json",
);

const RAW_PUSH = /^\s*git\s+push\b/i;
const RAW_GH_PR = /^\s*gh\s+pr\s+(create|merge|edit|close|review)\b/i;

export function loadGithubMutationPolicy(repoRoot = REPO_ROOT) {
  const abs = path.join(repoRoot, "registry/agent-runtime/authority/github-mutation-policy.v1.json");
  return JSON.parse(fs.readFileSync(abs, "utf8"));
}

export function classifyGitCommand(command, policy = loadGithubMutationPolicy()) {
  const trimmed = String(command ?? "").trim();
  if (!trimmed) {
    return { plane: "UNKNOWN", m8Required: false, authorized: false, reason: "empty_command" };
  }

  if (RAW_PUSH.test(trimmed) || RAW_GH_PR.test(trimmed)) {
    return {
      plane: "M8_GITHUB_PLANE",
      m8Required: true,
      authorized: false,
      enforcementCodes: policy.operationClassification.githubMutationM8Required.enforcementCodes,
      driftClasses: ["DRIFT_GITHUB_PLANE_BYPASS", "DRIFT_GIT_MUTATION_TRANSPORT"],
      requiredCapabilities: inferCapabilities(trimmed),
      repairClass: "RETRY_THROUGH_M8",
    };
  }

  if (/^\s*git\s+(add|commit)\b/i.test(trimmed)) {
    return {
      plane: "LOCAL_MUTATION_ADMISSION",
      m8Required: false,
      authorized: true,
      requires: ["mutation_lease", "repo_admission"],
    };
  }

  if (/^\s*git\s+(status|diff|log|show)\b/i.test(trimmed)) {
    return { plane: "LOCAL_GIT", m8Required: false, authorized: true };
  }

  if (/^\s*git\s+fetch\b/i.test(trimmed)) {
    return {
      plane: "GOVERNED_REMOTE_READ",
      m8Required: false,
      authorized: true,
      requires: ["remote_read_policy"],
    };
  }

  return { plane: "UNCLASSIFIED", m8Required: false, authorized: false, reason: "unclassified_command" };
}

function inferCapabilities(command) {
  if (RAW_PUSH.test(command)) return ["github.publish"];
  if (/^\s*gh\s+pr\s+create\b/i.test(command)) return ["github.pull-request.create"];
  if (/^\s*gh\s+pr\s+merge\b/i.test(command)) return ["github.pull-request.merge"];
  return ["github.publish"];
}

function main() {
  const command = process.argv.slice(2).join(" ");
  const result = classifyGitCommand(command);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.authorized === false && result.m8Required ? 1 : 0);
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main();
}
