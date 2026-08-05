import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  syncZHarvestMirror,
} from "../harvest/lib/z-harvest-mirror-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

test("syncZHarvestMirror copies protocol sources to repo harvest/ mirror", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "z-harvest-mirror-"));
  const srcRunbook = path.join(tmpRoot, "docs/runbooks/chat-thread-closeout-autopsy-harvest-v1.md");
  fs.mkdirSync(path.dirname(srcRunbook), { recursive: true });
  fs.writeFileSync(srcRunbook, "# Harvest protocol fixture\n", "utf8");

  const srcPrompt = path.join(tmpRoot, "docs/harvest-z-mirror/PROMPT-EXTRACTION-AND-PROMOTION-v1.md");
  fs.mkdirSync(path.dirname(srcPrompt), { recursive: true });
  fs.writeFileSync(srcPrompt, "# Prompt extraction fixture\n", "utf8");

  const result = syncZHarvestMirror({
    repoRoot: tmpRoot,
    zHarvestRoot: null,
    sourceCommitSha: "fixture-sha",
  });

  try {
    assert.equal(result.ok, false);
    assert.match(result.receipt.verdict, /PARTIAL|PASS/);

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
  const result = syncZHarvestMirror({
    repoRoot: REPO_ROOT,
    zHarvestRoot: null,
    sourceCommitSha: "test-head",
  });
  assert.ok(result.receipt.fileCount > 0);
  assert.ok(
    fs.existsSync(
      path.join(REPO_ROOT, "harvest/protocol/PROMPT-EXTRACTION-AND-PROMOTION-v1.md"),
    ),
  );
});
