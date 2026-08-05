import fs from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "./paths.mjs";
import { hashFileContent } from "./hash.mjs";
import { collectChatgptDrafts, gitBranch, gitHead } from "./chatgpt-draft-collect-lib.mjs";

export const SOURCE_BRANCH = "chat-gpt-harvest";
export const CATALOG_REL = "02-catalog/chatgpt-draft-staging";
export const BRANCH_FOLDER = "chat-gpt-harvest";
export const MANIFEST_NAME = "branch-owned-manifest.json";
export const RECEIPT_NAME = "move-receipt-latest.json";
export const PASS_VERDICT = "CHATGPT_HARVEST_DETERMINISTIC_MOVE_TO_L_PASS";
export const FAIL_VERDICT = "CHATGPT_HARVEST_DETERMINISTIC_MOVE_TO_L_FAIL";

function writeJsonAtomic(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temp = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temp, filePath);
}

export function resolveLDriveRoot(env = process.env) {
  const candidates = [
    env.CG_L_DRIVE_ROOT?.trim(),
    env.L_DRIVE_ROOT?.trim(),
    "/mnt/l",
  ].filter(Boolean);
  for (const root of candidates) {
    if (fs.existsSync(root)) return root;
  }
  return candidates[0] ?? "/mnt/l";
}

export function resolveChatgptHarvestDestinationRoot(lDriveRoot = resolveLDriveRoot()) {
  return path.join(lDriveRoot, CATALOG_REL, BRANCH_FOLDER);
}

function relPosix(fromRoot, filePath) {
  return path.relative(fromRoot, filePath).replace(/\\/g, "/");
}

function hashFileOnDisk(filePath) {
  return hashFileContent(fs.readFileSync(filePath));
}

function moveFileDeterministic(sourcePath, destPath) {
  const content = fs.readFileSync(sourcePath);
  const sourceHash = hashFileContent(content);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, content);
  const destHash = hashFileOnDisk(destPath);
  if (destHash !== sourceHash) {
    throw new Error(`destination hash mismatch for ${destPath}`);
  }
  fs.unlinkSync(sourcePath);
  if (fs.existsSync(sourcePath)) {
    throw new Error(`source still present after move: ${sourcePath}`);
  }
  return { sourceHash, destHash };
}

function buildOwnedEntry(draft, destRoot, lDriveRoot) {
  const destRel = `${BRANCH_FOLDER}/${draft.harvestId}/${draft.draftFileName}`;
  const destPath = path.join(destRoot, draft.harvestId, draft.draftFileName);
  return {
    harvestId: draft.harvestId,
    lane: draft.lane,
    protocol: draft.protocol,
    draftFileName: draft.draftFileName,
    sourcePath: draft.draftPath,
    destinationPath: relPosix(lDriveRoot, destPath),
    destinationRel: `${CATALOG_REL}/${destRel}`,
    destPath,
  };
}

export function moveChatgptHarvestToL({
  lDriveRoot = resolveLDriveRoot(),
  requireBranch = true,
  dryRun = false,
} = {}) {
  const branch = gitBranch();
  if (requireBranch && branch !== SOURCE_BRANCH) {
    throw new Error(`must run on branch ${SOURCE_BRANCH} (current: ${branch})`);
  }

  const destRoot = resolveChatgptHarvestDestinationRoot(lDriveRoot);
  const sourceCommitSha = gitHead();
  const drafts = collectChatgptDrafts();
  const moved = [];
  const skipped = [];
  const failures = [];
  const operations = [];

  for (const draft of drafts) {
    const entry = buildOwnedEntry(draft, destRoot, lDriveRoot);
    const sourcePath = path.join(REPO_ROOT, draft.draftPath);
    const op = {
      harvestId: draft.harvestId,
      sourcePath: draft.draftPath,
      destinationPath: entry.destinationPath,
      destinationRel: entry.destinationRel,
      contentHash: draft.contentHash,
      status: "pending",
    };

    try {
      if (fs.existsSync(sourcePath)) {
        if (dryRun) {
          op.status = "dry_run_would_move";
          op.contentHash = hashFileOnDisk(sourcePath);
          skipped.push({ harvestId: draft.harvestId, reason: "dry_run" });
        } else {
          const { sourceHash, destHash } = moveFileDeterministic(sourcePath, entry.destPath);
          op.status = "moved";
          op.contentHash = sourceHash;
          op.destinationHash = destHash;
          moved.push({
            harvestId: draft.harvestId,
            sourcePath: draft.draftPath,
            destinationPath: entry.destinationPath,
            contentHash: sourceHash,
          });
        }
      } else if (fs.existsSync(entry.destPath)) {
        const destHash = hashFileOnDisk(entry.destPath);
        op.status = "skipped_already_on_l";
        op.destinationHash = destHash;
        if (destHash !== draft.contentHash) {
          op.status = "hash_mismatch_on_l";
          failures.push({
            harvestId: draft.harvestId,
            reason: "destination_hash_mismatch",
            expectedHash: draft.contentHash,
            actualHash: destHash,
          });
        } else {
          skipped.push({
            harvestId: draft.harvestId,
            reason: "already_on_l",
            destinationPath: entry.destinationPath,
          });
        }
      } else {
        op.status = "skipped_source_and_dest_missing";
        skipped.push({
          harvestId: draft.harvestId,
          reason: "source_and_dest_missing",
          sourcePath: draft.draftPath,
        });
      }
    } catch (error) {
      op.status = "failed";
      op.error = error.message;
      failures.push({
        harvestId: draft.harvestId,
        reason: error.message,
        sourcePath: draft.draftPath,
        destinationPath: entry.destinationPath,
      });
    }

    operations.push(op);
  }

  const ownedFiles = drafts.map((draft) => {
    const entry = buildOwnedEntry(draft, destRoot, lDriveRoot);
    const destPath = entry.destPath;
    const onDisk = fs.existsSync(destPath);
    return {
      harvestId: draft.harvestId,
      draftFileName: draft.draftFileName,
      destinationRel: entry.destinationRel,
      contentHash: onDisk ? hashFileOnDisk(destPath) : draft.contentHash,
      presentOnL: onDisk,
    };
  });

  const manifest = {
    schemaVersion: "chatgpt-harvest-branch-owned-manifest-v1@1.0.0",
    sourceBranch: SOURCE_BRANCH,
    sourceCommitSha,
    updatedAt: new Date().toISOString(),
    destinationRoot: relPosix(lDriveRoot, destRoot),
    destinationRel: `${CATALOG_REL}/${BRANCH_FOLDER}`,
    ownedFiles,
  };

  const verdict =
    failures.length === 0 && !dryRun
      ? PASS_VERDICT
      : dryRun
        ? "DRY_RUN"
        : FAIL_VERDICT;

  const receipt = {
    schemaVersion: "chatgpt-harvest-deterministic-move-receipt-v1@1.0.0",
    generatedAt: new Date().toISOString(),
    dryRun,
    sourceBranch: branch,
    sourceCommitSha,
    lDriveRoot,
    destinationRoot: manifest.destinationRoot,
    destinationRel: manifest.destinationRel,
    windowsPath: `L:\\${CATALOG_REL.replace(/\//g, "\\")}\\${BRANCH_FOLDER}\\`,
    movedCount: moved.length,
    skippedCount: skipped.length,
    failureCount: failures.length,
    operations,
    moved,
    skipped,
    failures,
    verdict,
  };

  if (!dryRun && failures.length === 0) {
    writeJsonAtomic(path.join(destRoot, MANIFEST_NAME), manifest);
    writeJsonAtomic(path.join(destRoot, RECEIPT_NAME), receipt);
  }

  return receipt;
}
