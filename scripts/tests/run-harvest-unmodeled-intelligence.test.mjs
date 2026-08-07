import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  loadUnmodeledQueue,
  saveUnmodeledQueue,
  upsertUnmodeledEntry,
  SCHEMA_EXPANSION_THRESHOLD,
} from "../harvest/lib/unmodeled-intelligence-queue-lib.mjs";

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "unmodeled-queue-"));

const queue = loadUnmodeledQueue(tmpRoot);
for (let i = 0; i < SCHEMA_EXPANSION_THRESHOLD; i++) {
  upsertUnmodeledEntry(
    queue,
    {
      proposedType: "SECTION:test-anchor",
      sourceFinding: "Unknown widget pattern",
      rawRef: "artifacts/agent-runs/test/chatgpt-findings-source.md#test-anchor",
      sourceExcerptHash: `hash-${i}`,
      confidence: "low",
    },
    `harvest-test-${i}`,
  );
}
saveUnmodeledQueue(queue, tmpRoot);

const reloaded = loadUnmodeledQueue(tmpRoot);
assert.equal(reloaded.entries.length, 1);
assert.equal(reloaded.entries[0].occurrenceCount, SCHEMA_EXPANSION_THRESHOLD);
assert.ok(
  reloaded.schemaExpansionCandidates.some((c) => c.status === "SCHEMA_EXPANSION_CANDIDATE"),
  "threshold occurrences should promote schema expansion candidate",
);

console.log("ok - unmodeled intelligence queue tracks occurrences and promotion");
