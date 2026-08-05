import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

import { REPO_ROOT } from "./paths.mjs";
import { hashFileContent } from "./hash.mjs";

export const RUNS_ROOT = path.join(REPO_ROOT, "artifacts/agent-runs");
export const GIT_INDEX_PATH = path.join(REPO_ROOT, "work-progress/chatgpt-draft-index.json");

export const DRAFT_FILES = [
  { file: "chatgpt-findings-source.md", lane: "OBSERVED", protocol: "chat-thread-closeout-autopsy-harvest-chatgpt-v1" },
  {
    file: "system-advancement-findings-source.md",
    lane: "ADVANCEMENT",
    protocol: "chat-thread-system-advancement-harvest-chatgpt-v1",
  },
];

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

export function gitBranch() {
  const fromGh = process.env.GITHUB_REF_NAME?.trim();
  if (fromGh) return fromGh;
  try {
    return execSync("git branch --show-current", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

export function gitHead() {
  return execSync("git rev-parse HEAD", { cwd: REPO_ROOT, encoding: "utf8" }).trim();
}

export function gitFileLog(relPath) {
  try {
    const out = execSync(`git log -1 --format=%H%x09%cI -- ${JSON.stringify(relPath)}`, {
      cwd: REPO_ROOT,
      encoding: "utf8",
    }).trim();
    const [commitSha, committedAt] = out.split("\t");
    return { commitSha: commitSha || null, committedAt: committedAt || null };
  } catch {
    return { commitSha: null, committedAt: null };
  }
}

function inferVerdictFromMarkdown(content) {
  const m = content.match(/Output verdict:\s*`?([A-Z0-9_]+)`?/i);
  return m?.[1] ?? "UNKNOWN";
}

function classifyCursorStage(runDir) {
  const manifestPath = path.join(runDir, "harvest-manifest-v1.json");
  const validationPath = path.join(runDir, "validation-result.json");
  if (!fs.existsSync(manifestPath)) return "DRAFT_ONLY";
  const manifest = readJsonSafe(manifestPath);
  const validation = readJsonSafe(validationPath);
  if (validation?.verdict === "PASS" && manifest?.projection?.hubPublishStatus === "published") {
    return "PUBLISHED";
  }
  if (validation?.verdict === "PASS") return "VALIDATED";
  if (manifest) return "CURSOR_PARTIAL";
  return "DRAFT_ONLY";
}

export function collectChatgptDrafts() {
  const drafts = [];
  if (!fs.existsSync(RUNS_ROOT)) return drafts;

  for (const entry of fs.readdirSync(RUNS_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith("harvest-")) continue;
    const harvestId = entry.name;
    const runDir = path.join(RUNS_ROOT, harvestId);

    for (const spec of DRAFT_FILES) {
      const draftPath = path.join(runDir, spec.file);
      if (!fs.existsSync(draftPath)) continue;

      const content = fs.readFileSync(draftPath, "utf8");
      const relPath = path.relative(REPO_ROOT, draftPath).replace(/\\/g, "/");
      const git = gitFileLog(relPath);

      drafts.push({
        harvestId,
        lane: spec.lane,
        protocol: spec.protocol,
        draftFileName: spec.file,
        draftPath: relPath,
        contentHash: hashFileContent(content),
        draftVerdict: inferVerdictFromMarkdown(content),
        cursorStage: classifyCursorStage(runDir),
        batchDisposition: "queued",
        lStagingStatus: "pending",
        lastCommitSha: git.commitSha,
        lastCommittedAt: git.committedAt,
        manifestPath: fs.existsSync(path.join(runDir, "harvest-manifest-v1.json"))
          ? `artifacts/agent-runs/${harvestId}/harvest-manifest-v1.json`
          : null,
      });
    }
  }

  drafts.sort((a, b) => (b.lastCommittedAt ?? "").localeCompare(a.lastCommittedAt ?? ""));
  return drafts;
}

export function buildChatgptDraftIndex(drafts) {
  return {
    schemaVersion: "chatgpt-draft-index-v1@1.0.0",
    generatedAt: new Date().toISOString(),
    sourceBranch: gitBranch(),
    sourceCommitSha: gitHead(),
    batchAssessmentProtocol: "chatgpt-draft-batch-assessment-t2-v1",
    defaultTier: "T2",
    authorityNote:
      "Draft markdown on L is staging for assessment — not scout truth or operational hub authority.",
    counts: {
      total: drafts.length,
      observed: drafts.filter((d) => d.lane === "OBSERVED").length,
      advancement: drafts.filter((d) => d.lane === "ADVANCEMENT").length,
      draftOnly: drafts.filter((d) => d.cursorStage === "DRAFT_ONLY").length,
      cursorPartial: drafts.filter((d) => d.cursorStage === "CURSOR_PARTIAL").length,
      validated: drafts.filter((d) => d.cursorStage === "VALIDATED").length,
      published: drafts.filter((d) => d.cursorStage === "PUBLISHED").length,
      onL: drafts.filter((d) => d.lStagingStatus === "staged").length,
    },
    drafts,
    lStaging: {
      catalogRoot: "02-catalog/chatgpt-draft-staging/chat-gpt-harvest",
      destinationRel: "02-catalog/chatgpt-draft-staging/chat-gpt-harvest",
      moveCommand: "npm run harvest:move-chatgpt-harvest-to-l",
      stageCommandAlias: "npm run harvest:stage-chatgpt-drafts-on-l",
    },
    nextBatchAssessor: {
      workPackageId: "chatgpt-draft-batch-assessment-t2-v1",
      suggestedHarvestIdPattern: "harvest-YYYY-MM-DD-chatgpt-draft-batch-<theme>-v1",
      openerProtocol: "docs/protocols/chatgpt-draft-batch-assessment-t2-v1.md",
      collectCommand: "npm run harvest:collect-chatgpt-drafts -- --json",
      moveCommand: "npm run harvest:move-chatgpt-harvest-to-l",
      stageCommand: "npm run harvest:stage-chatgpt-drafts-on-l",
    },
  };
}

export function writeGitDraftIndex(index) {
  fs.mkdirSync(path.dirname(GIT_INDEX_PATH), { recursive: true });
  fs.writeFileSync(GIT_INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  return GIT_INDEX_PATH;
}
