import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { DRAFT_FILES } from "../harvest/lib/chatgpt-draft-collect-lib.mjs";
import { SOURCE_BRANCH } from "../harvest/lib/chatgpt-harvest-deterministic-move-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const PROTOCOL_DIR = path.join(REPO_ROOT, "harvest/protocol");

const CHATGPT_PROTOCOL_FILES = [
  "CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md",
  "CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md",
  "CHATGPT-DRAFT-BATCH-ASSESSMENT-T2-V1.md",
  "CHATGPT-HARVEST-GIT-PUBLICATION-CONTRACT-V1.md",
  "system-advancement-quality-gate.md",
];

const REQUIRED_MARKERS = [
  "CHATGPT_HARVEST_GIT_GATE",
  "chat-gpt-harvest",
  "Capglass5708/CapitalGlass-Cross-Agent",
  "CHATGPT_SOURCE_PUBLISHED",
  "BLOCKED_GIT_PUBLICATION",
];

function readProtocol(name) {
  const filePath = path.join(PROTOCOL_DIR, name);
  assert.ok(fs.existsSync(filePath), `missing protocol file: ${name}`);
  return fs.readFileSync(filePath, "utf8");
}

test("ChatGPT protocol files exist on main harvest/protocol", () => {
  for (const name of CHATGPT_PROTOCOL_FILES) {
    assert.ok(fs.existsSync(path.join(PROTOCOL_DIR, name)), `missing ${name}`);
  }
});

test("shared Git contract is referenced by lane protocols", () => {
  const contract = readProtocol("CHATGPT-HARVEST-GIT-PUBLICATION-CONTRACT-V1.md");
  assert.ok(contract.includes("Operational authority invariant"));
  assert.ok(contract.includes("CHATGPT_HARVEST_GIT_GATE"));

  for (const name of [
    "CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md",
    "CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md",
    "CHATGPT-DRAFT-BATCH-ASSESSMENT-T2-V1.md",
  ]) {
    const content = readProtocol(name);
    assert.ok(
      content.includes("CHATGPT-HARVEST-GIT-PUBLICATION-CONTRACT-V1"),
      `${name} must reference shared Git contract`,
    );
    assert.ok(
      content.includes("CHATGPT_HARVEST_GIT_GATE"),
      `${name} must mention CHATGPT_HARVEST_GIT_GATE`,
    );
  }
});

test("all ChatGPT lane protocols agree on Git staging constants", () => {
  const laneProtocols = [
    "CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md",
    "CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md",
    "CHATGPT-DRAFT-BATCH-ASSESSMENT-T2-V1.md",
    "CHATGPT-HARVEST-GIT-PUBLICATION-CONTRACT-V1.md",
  ];
  for (const name of laneProtocols) {
    const content = readProtocol(name);
    for (const marker of REQUIRED_MARKERS) {
      assert.ok(content.includes(marker), `${name} missing marker: ${marker}`);
    }
  }

  const qualityGate = readProtocol("system-advancement-quality-gate.md");
  assert.ok(qualityGate.includes("CHATGPT_HARVEST_GIT_GATE"));
  assert.ok(qualityGate.includes("chat-gpt-harvest"));
});

test("autopsy and advancement protocols forbid HARVEST_COMPLETE in ChatGPT", () => {
  for (const name of [
    "CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md",
    "CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md",
  ]) {
    const content = readProtocol(name);
    const hasForbidden =
      content.includes("Forbidden in ChatGPT") || content.includes("forbidden in ChatGPT");
    assert.ok(hasForbidden, `${name} must forbid ChatGPT HARVEST_COMPLETE claims`);
    assert.ok(
      content.includes("HARVEST_COMPLETE"),
      `${name} must name HARVEST_COMPLETE verdict boundary`,
    );
  }
});

test("DRAFT_FILE allows designated artifact writes (not blanket repo-write ban)", () => {
  const autopsy = readProtocol("CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md");
  assert.ok(autopsy.includes("DRAFT_FILE"));
  assert.ok(
    autopsy.includes("designated") || autopsy.includes("chatgpt-findings-source.md"),
    "autopsy must authorize designated artifact path",
  );
  assert.ok(
    !autopsy.match(/DRAFT_FILE.*Repo edits, validation claims/s),
    "autopsy must not blanket-forbid repo edits without designated-artifact exception",
  );

  const contract = readProtocol("CHATGPT-HARVEST-GIT-PUBLICATION-CONTRACT-V1.md");
  assert.ok(contract.includes("DRAFT_FILE write boundary"));
});

test("operational authority invariant: main defines behavior not chat-gpt-harvest branch alone", () => {
  const autopsy = readProtocol("CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md");
  assert.ok(autopsy.includes("Operational authority invariant"));
  assert.ok(autopsy.includes("No protocol is operational because it exists on `chat-gpt-harvest`"));
});

test("draft collect lib protocol ids match harvest/protocol uppercase files", () => {
  for (const spec of DRAFT_FILES) {
    const protocolFile = `${spec.protocol}.md`;
    assert.ok(
      fs.existsSync(path.join(PROTOCOL_DIR, protocolFile)),
      `collect lib protocol ${spec.protocol} missing file ${protocolFile}`,
    );
  }
});

test("GitHub workflow exists for chatgpt-harvest move to L", () => {
  const workflowPath = path.join(REPO_ROOT, ".github/workflows/chatgpt-harvest-move-to-l.yml");
  assert.ok(fs.existsSync(workflowPath));
  const workflow = fs.readFileSync(workflowPath, "utf8");
  assert.ok(workflow.includes("chat-gpt-harvest"));
  assert.ok(workflow.includes("harvest:move-chatgpt-harvest-to-l"));
});

test("move lib rejects wrong branch when requireBranch true", async () => {
  const { moveChatgptHarvestToL } = await import(
    "../harvest/lib/chatgpt-harvest-deterministic-move-lib.mjs"
  );
  try {
    moveChatgptHarvestToL({ requireBranch: true });
    assert.fail("expected branch guard error on main");
  } catch (error) {
    assert.ok(String(error.message).includes(SOURCE_BRANCH));
  }
});
