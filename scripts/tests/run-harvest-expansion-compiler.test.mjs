import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  expandIntelligenceFromSource,
  parseMarkdownSections,
} from "../harvest/lib/expand-intelligence-lib.mjs";
import { REPO_ROOT } from "../harvest/lib/paths.mjs";

const sampleSource = path.join(
  REPO_ROOT,
  "artifacts/agent-runs/harvest-2026-08-04-ultimate-sdlc-runner-dark-package-v1/chatgpt-findings-source.md",
);

assert.ok(fs.existsSync(sampleSource), "fixture chatgpt-findings-source.md missing");

const content = fs.readFileSync(sampleSource, "utf8");
const sections = parseMarkdownSections(content);
assert.ok(sections.length > 20, "expected many sections from reference fixture");

const harvestId = "harvest-2026-08-04-ultimate-sdlc-runner-dark-package-v1";
const result = expandIntelligenceFromSource({
  harvestId,
  sourceRelPath: `artifacts/agent-runs/${harvestId}/chatgpt-findings-source.md`,
});

assert.equal(result.receipt.sourceSectionsDropped, 0, "lossless expansion must not drop sections");
assert.ok(result.receipt.projectionsEmitted > 0, "structured IM/EVT sections should emit projections");
assert.ok(result.expansionEntities.length > 0, "entities should be produced");

const evtSections = sections.filter((s) => /^EVT-/i.test(s.title));
assert.ok(evtSections.length >= 3, "fixture should include EVT sections");
assert.ok(
  result.projectionDoc.projections.some((p) => p.packetId?.startsWith("IM-") || p.packetId?.startsWith("EVT-")),
  "projections should include IM or EVT packet ids",
);

console.log("ok - expansion compiler preserves all sections and emits projections");
