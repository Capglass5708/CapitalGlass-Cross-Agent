import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  syncZHarvestMirror,
} from "../harvest/lib/z-harvest-mirror-lib.mjs";
import { restoreRepoSnapshot, snapshotRepoPaths } from "./lib/preserve-worktree.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

test("syncZHarvestMirror copies protocol sources to repo harvest/ mirror", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "z-harvest-mirror-"));
  const srcProtocol = path.join(tmpRoot, "harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md");
  fs.mkdirSync(path.dirname(srcProtocol), { recursive: true });
  fs.writeFileSync(srcProtocol, "# Harvest protocol fixture\n### Lane C — test\n", "utf8");

  const srcPrompt = path.join(tmpRoot, "harvest/protocol/PROMPT-EXTRACTION-AND-PROMOTION-v1.md");
  fs.writeFileSync(srcPrompt, "# Prompt extraction fixture\n", "utf8");

  const srcRunbook = path.join(tmpRoot, "harvest/protocol/HARVEST-INGESTION-RUNBOOK-v1.md");
  fs.writeFileSync(srcRunbook, "# Runbook fixture\n", "utf8");

  const srcChatgpt = path.join(tmpRoot, "harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md");
  fs.writeFileSync(srcChatgpt, "# ChatGPT lane fixture\n", "utf8");

  const result = syncZHarvestMirror({
    repoRoot: tmpRoot,
    zHarvestRoot: null,
    sourceCommitSha: "fixture-sha",
    requireZPublication: false,
  });

  try {
    assert.equal(result.ok, true);
    assert.equal(result.receipt.verdict, "Z_HARVEST_REPO_MIRROR_PASS");

    const protocolDest = path.join(
      tmpRoot,
      "harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md",
    );
    assert.ok(fs.existsSync(protocolDest), "repo mirror protocol file missing");

    const readme = path.join(tmpRoot, "harvest/README.md");
    assert.ok(fs.existsSync(readme));
    assert.ok(fs.readFileSync(readme, "utf8").includes("fixture-sha"));
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
});

test("syncZHarvestMirror on real repo writes harvest/ protocol tree", () => {
  const mirrorPaths = ["harvest/README.md", "harvest/z-mirror-sync-receipt.json", "harvest/protocol"];
  const snapshot = snapshotRepoPaths(REPO_ROOT, mirrorPaths);
  try {
    const result = syncZHarvestMirror({
      repoRoot: REPO_ROOT,
      zHarvestRoot: null,
      sourceCommitSha: "test-head",
      requireZPublication: false,
    });
    assert.ok(result.receipt.fileCount > 0);
    assert.ok(
      fs.existsSync(
        path.join(REPO_ROOT, "harvest/protocol/PROMPT-EXTRACTION-AND-PROMOTION-v1.md"),
      ),
    );
    assert.ok(
      fs.existsSync(
        path.join(REPO_ROOT, "harvest/protocol/CURSOR_HARVEST_INGEST_CLOSEOUT_WAVE_SDLC_V1.md"),
      ),
      "Data-Extraction wave SDLC mirror missing",
    );
    assert.equal(result.ok, true, result.receipt.errors.join("; "));
    assert.equal(result.receipt.verdict, "Z_HARVEST_REPO_MIRROR_PASS");
  } finally {
    restoreRepoSnapshot(REPO_ROOT, snapshot);
  }
});

test("syncZHarvestMirror fails closed when Z publication required but unmounted", () => {
  const mirrorPaths = ["harvest/README.md", "harvest/z-mirror-sync-receipt.json", "harvest/protocol"];
  const snapshot = snapshotRepoPaths(REPO_ROOT, mirrorPaths);
  try {
    const result = syncZHarvestMirror({
      repoRoot: REPO_ROOT,
      zHarvestRoot: null,
      sourceCommitSha: "test-head",
      requireZPublication: true,
      env: {
        ...process.env,
        CG_Z_HARVEST_MOUNT: "/mnt/z-not-mounted-for-test",
        CG_Z_HARVEST_ROOT: "/mnt/z-not-mounted-for-test/Capital-Glass-Dev/Harvest",
      },
    });
    assert.equal(result.ok, false);
    assert.equal(result.receipt.verdict, "Z_HARVEST_MIRROR_SYNC_BLOCKED");
    assert.ok(result.receipt.errors.some((e) => e.startsWith("Z_MOUNT_MISSING")));
  } finally {
    restoreRepoSnapshot(REPO_ROOT, snapshot);
  }
});
