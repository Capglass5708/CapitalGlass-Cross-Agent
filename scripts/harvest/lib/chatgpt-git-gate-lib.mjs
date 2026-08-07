/**
 * CHATGPT_HARVEST_GIT_GATE — verify Git publication state for ChatGPT harvest drafts.
 */
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

import { hashFileContent } from "./hash.mjs";
import { REPO_ROOT } from "./paths.mjs";

export const CHATGPT_BRANCH = "chat-gpt-harvest";
export const CHATGPT_REPO = "Capglass5708/CapitalGlass-Cross-Agent";
export const OBSERVED_ARTIFACT = "chatgpt-findings-source.md";

/**
 * @param {{ harvestId: string, repoRoot?: string, expectedContentHash?: string|null, dryRun?: boolean }} options
 */
export function runChatgptGitGate(options) {
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  const harvestId = options.harvestId;
  const artifactRel = `artifacts/agent-runs/${harvestId}/${OBSERVED_ARTIFACT}`;
  const artifactPath = path.join(repoRoot, artifactRel);
  const errors = [];

  if (!fs.existsSync(artifactPath)) {
    errors.push(`artifact missing: ${artifactRel}`);
  }

  let branch = null;
  let localSha = null;
  let remoteSha = null;
  let remoteVerified = false;

  try {
    branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    errors.push("cannot read current branch");
  }

  if (branch && branch !== CHATGPT_BRANCH) {
    errors.push(`branch must be ${CHATGPT_BRANCH} (current: ${branch})`);
  }

  if (fs.existsSync(artifactPath)) {
    try {
      localSha = execSync("git rev-parse HEAD", { cwd: repoRoot, encoding: "utf8" }).trim();
      const tracked = execSync(`git ls-files --error-unmatch ${artifactRel}`, {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
      });
      if (!tracked.trim()) errors.push("artifact not tracked in git index");
    } catch {
      errors.push("artifact not committed on current branch");
    }

    if (options.expectedContentHash) {
      const actual = hashFileContent(fs.readFileSync(artifactPath, "utf8"));
      if (actual !== options.expectedContentHash) {
        errors.push("artifact content hash mismatch");
      }
    }

    if (!options.dryRun) {
      try {
        execSync(`git fetch origin ${CHATGPT_BRANCH}`, { cwd: repoRoot, stdio: "pipe" });
        remoteSha = execSync(`git rev-parse origin/${CHATGPT_BRANCH}`, {
          cwd: repoRoot,
          encoding: "utf8",
        }).trim();
        remoteVerified = remoteSha === localSha;
        if (!remoteVerified) errors.push("remote HEAD SHA != local commit SHA");
      } catch {
        errors.push("remote verification failed");
      }
    }
  }

  const verdict = errors.length === 0 ? "PASS" : "BLOCKED_GIT_PUBLICATION";
  const receipt = {
    gitPublicationReceipt: {
      gate: "CHATGPT_HARVEST_GIT_GATE",
      verdict: verdict === "PASS" ? "PASS" : "FAIL",
      publicationVerdict: verdict,
      repo: CHATGPT_REPO,
      branch: CHATGPT_BRANCH,
      harvestId,
      artifactPath: artifactRel,
      localCommitSha: localSha,
      remoteCommitSha: remoteSha,
      remoteVerified: options.dryRun ? null : remoteVerified,
      dryRun: Boolean(options.dryRun),
      errors,
    },
  };

  return { ok: verdict === "PASS", verdict, receipt, errors };
}

export function writeGitPublicationReceipt(receipt, harvestId, repoRoot = REPO_ROOT) {
  const runDir = path.join(repoRoot, "artifacts/agent-runs", harvestId);
  fs.mkdirSync(runDir, { recursive: true });
  const filePath = path.join(runDir, "gitPublicationReceipt.json");
  fs.writeFileSync(filePath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  return filePath;
}
