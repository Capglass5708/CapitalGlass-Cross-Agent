import fs from "node:fs";
import path from "node:path";

import { REPO_ROOT } from "./paths.mjs";
import { resolveHubRoot } from "./publish-hub-seed-lib.mjs";
import {
  collectChatgptDrafts,
  buildChatgptDraftIndex,
  writeGitDraftIndex,
  GIT_INDEX_PATH,
} from "./chatgpt-draft-collect-lib.mjs";

function writeJsonAtomic(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temp = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temp, filePath);
}

function hubCatalogRel(catalogRoot, harvestId, fileName) {
  return `${catalogRoot}/${harvestId}/${fileName}`.replace(/\\/g, "/");
}

function copyFileSafe(sourcePath, destPath) {
  const content = fs.readFileSync(sourcePath);
  fs.writeFileSync(destPath, content);
}

export function stageChatgptDraftsOnL({ hubRoot = resolveHubRoot(), dryRun = false } = {}) {
  const byKindDir = path.join(hubRoot, "00-master-index", "BY-KIND");
  if (!fs.existsSync(byKindDir)) {
    throw new Error(`L: Intelligence Hub not mounted or missing BY-KIND at ${hubRoot}`);
  }

  const drafts = collectChatgptDrafts();
  const draftIndex = buildChatgptDraftIndex(drafts);
  const catalogRoot = draftIndex.lStaging.catalogRoot;
  const indexSliceRel = draftIndex.lStaging.indexSlice;
  const lCatalogRoot = path.join(hubRoot, catalogRoot);
  const staged = [];
  const skipped = [];

  for (const draft of draftIndex.drafts) {
    const sourcePath = path.join(REPO_ROOT, draft.draftPath);
    if (!fs.existsSync(sourcePath)) {
      skipped.push({ harvestId: draft.harvestId, reason: "source_missing" });
      draft.lStagingStatus = "source_missing";
      continue;
    }

    const destDir = path.join(lCatalogRoot, draft.harvestId);
    const destMarkdown = path.join(destDir, draft.draftFileName);
    const lDraftRel = hubCatalogRel(catalogRoot, draft.harvestId, draft.draftFileName);
    const stagingRecordRel = hubCatalogRel(catalogRoot, draft.harvestId, "draft-staging-record.json");

    if (!dryRun) {
      fs.mkdirSync(destDir, { recursive: true });
      copyFileSafe(sourcePath, destMarkdown);
      writeJsonAtomic(path.join(destDir, "draft-staging-record.json"), {
        schemaVersion: "chatgpt-draft-staging-record-v1@1.0.0",
        stagedAt: new Date().toISOString(),
        harvestId: draft.harvestId,
        lane: draft.lane,
        protocol: draft.protocol,
        draftFileName: draft.draftFileName,
        contentHash: draft.contentHash,
        draftVerdict: draft.draftVerdict,
        cursorStage: draft.cursorStage,
        sourceDraftPath: draft.draftPath,
        sourceCommitSha: draft.lastCommitSha,
        sourceCommittedAt: draft.lastCommittedAt,
        lDraftPath: lDraftRel,
        authorityNote:
          "Staging copy for T2 batch assessment — not scout truth or operational hub authority.",
      });
    }

    draft.lStagingStatus = dryRun ? "dry_run" : "staged";
    draft.lStagingPath = lDraftRel;
    draft.lStagingRecordPath = stagingRecordRel;
    staged.push({
      harvestId: draft.harvestId,
      lane: draft.lane,
      lDraftPath: lDraftRel,
      contentHash: draft.contentHash,
    });
  }

  draftIndex.counts.onL = draftIndex.drafts.filter((d) => d.lStagingStatus === "staged").length;
  draftIndex.lStaging.lastStagedAt = new Date().toISOString();
  draftIndex.lStaging.hubRoot = hubRoot;
  draftIndex.lStaging.stagedCount = staged.length;

  const hubIndexSlice = {
    schemaVersion: "intelligence-hub-chatgpt-draft-staging-index-slice-v1@1.0.0",
    generatedAt: draftIndex.generatedAt,
    sourceBranch: draftIndex.sourceBranch,
    sourceCommitSha: draftIndex.sourceCommitSha,
    authorityNote: draftIndex.authorityNote,
    batchAssessmentProtocol: draftIndex.batchAssessmentProtocol,
    catalogRoot,
    catalogIndexPath: `${catalogRoot}/chatgpt-draft-index.json`,
    draftCount: draftIndex.drafts.length,
    stagedCount: staged.length,
    skippedCount: skipped.length,
    drafts: draftIndex.drafts.map((d) => ({
      harvestId: d.harvestId,
      lane: d.lane,
      protocol: d.protocol,
      draftVerdict: d.draftVerdict,
      cursorStage: d.cursorStage,
      contentHash: d.contentHash,
      lDraftPath: d.lStagingPath ?? null,
      lStagingStatus: d.lStagingStatus,
      lastCommittedAt: d.lastCommittedAt,
      batchDisposition: d.batchDisposition,
    })),
  };

  if (!dryRun) {
    writeGitDraftIndex(draftIndex);
    writeJsonAtomic(path.join(hubRoot, indexSliceRel), hubIndexSlice);
    writeJsonAtomic(path.join(lCatalogRoot, "chatgpt-draft-index.json"), draftIndex);
  }

  const receipt = {
    schemaVersion: "chatgpt-draft-l-staging-receipt-v1@1.0.0",
    generatedAt: new Date().toISOString(),
    dryRun,
    hubRoot,
    catalogRoot,
    indexSlicePath: indexSliceRel,
    gitDraftIndexPath: path.relative(REPO_ROOT, GIT_INDEX_PATH).replace(/\\/g, "/"),
    sourceBranch: draftIndex.sourceBranch,
    sourceCommitSha: draftIndex.sourceCommitSha,
    stagedCount: staged.length,
    skippedCount: skipped.length,
    staged,
    skipped,
    verdict: dryRun ? "DRY_RUN" : staged.length > 0 ? "STAGED" : "NO_DRAFTS",
  };

  return receipt;
}
