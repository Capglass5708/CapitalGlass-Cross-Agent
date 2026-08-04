#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ingestChatGptFindings } from "../harvest/lib/ingest-chatgpt-findings-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const FINDINGS = "/mnt/c/Users/Wesley/Downloads/chat-thread-autopsy-findings-from-current-chat-v1.md";

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`ok - ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`not ok - ${name}`);
    console.error(`  ${error.message}`);
  }
}

test("ingest ChatGPT findings extracts 8 seed packets", () => {
  if (!fs.existsSync(FINDINGS)) {
    console.log("skip - findings file not at Downloads path");
    return;
  }
  const harvestId = "harvest-test-chatgpt-ingest-v1";
  const runDir = path.join(REPO_ROOT, "artifacts/agent-runs", harvestId);
  if (fs.existsSync(runDir)) fs.rmSync(runDir, { recursive: true, force: true });

  const result = ingestChatGptFindings({
    repoRoot: REPO_ROOT,
    inputPath: FINDINGS,
    harvestId,
    gitHead: "c".repeat(40),
  });

  assert.equal(result.ok, true, result.errors?.join("; "));
  assert.equal(result.seedCount, 8);
  assert.ok(fs.existsSync(path.join(runDir, "harvest-manifest-v1.json")));
  assert.ok(fs.existsSync(path.join(runDir, "thread-autopsy-bundle.json")));
  assert.equal(
    fs.readdirSync(path.join(runDir, "seed-packets")).filter((f) => f.endsWith(".json")).length,
    8,
  );

  const manifest = JSON.parse(fs.readFileSync(path.join(runDir, "harvest-manifest-v1.json"), "utf8"));
  assert.equal(manifest.ingestionLane, "CHATGPT_VISIBLE_CONTEXT");
  assert.equal(manifest.retrievalResult, "INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT");

  fs.rmSync(runDir, { recursive: true, force: true });
});

console.log(`\n# chatgpt ingest tests ${passed + failed} pass ${passed} fail ${failed}`);
process.exit(failed > 0 ? 1 : 0);
