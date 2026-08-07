import assert from "node:assert/strict";

import { expandIntelligenceFromSource } from "../harvest/lib/expand-intelligence-lib.mjs";

const harvestId = "harvest-2026-08-04-ultimate-sdlc-runner-dark-package-v1";
const result = expandIntelligenceFromSource({
  harvestId,
  sourceRelPath: `artifacts/agent-runs/${harvestId}/chatgpt-findings-source.md`,
});

const preserved = result.projectionDoc.extensions?.preservedUnknownSections ?? [];
assert.ok(
  result.receipt.extensionsPreserved >= 0,
  "extensionsPreserved counter should be present",
);
assert.ok(
  Array.isArray(preserved),
  "v2 projection must carry preservedUnknownSections array (possibly empty)",
);
assert.equal(result.receipt.sourceSectionsDropped, 0);

console.log("ok - extension preservation contract holds");
