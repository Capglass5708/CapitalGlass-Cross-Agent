import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  syncZHarvestMirror,
  Z_HARVEST_PROTOCOL_SOURCES,
  Z_HARVEST_EXTERNAL_PROTOCOL_SOURCES,
} from "../harvest/lib/z-harvest-mirror-lib.mjs";
import { restoreRepoSnapshot, snapshotRepoPaths } from "./lib/preserve-worktree.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

test("syncZHarvestMirror copies protocol sources to repo harvest/ mirror", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "z-harvest-mirror-"));

  for (const entry of Z_HARVEST_PROTOCOL_SOURCES) {
    const src = path.join(tmpRoot, entry.source);
    fs.mkdirSync(path.dirname(src), { recursive: true });
    const canonical = path.join(REPO_ROOT, entry.source);
    if (fs.existsSync(canonical)) {
      fs.copyFileSync(canonical, src);
    } else {
      fs.writeFileSync(src, `# fixture ${entry.source}\n`, "utf8");
    }
  }

  for (const entry of Z_HARVEST_EXTERNAL_PROTOCOL_SOURCES) {
    const externalRoot = entry.resolveRepoRoot(tmpRoot);
    const src = path.join(externalRoot, entry.source);
    fs.mkdirSync(path.dirname(src), { recursive: true });
    const canonicalRoot = entry.resolveRepoRoot(REPO_ROOT);
    const canonical = path.join(canonicalRoot, entry.source);
    if (fs.existsSync(canonical)) {
      fs.copyFileSync(canonical, src);
    } else {
      fs.writeFileSync(src, `# external fixture ${entry.source}\n`, "utf8");
    }
  }

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
