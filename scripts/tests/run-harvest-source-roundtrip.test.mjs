import assert from "node:assert/strict";

import { expandIntelligenceFromSource } from "../harvest/lib/expand-intelligence-lib.mjs";
import { verifySourceRoundTrip } from "../harvest/lib/source-roundtrip-lib.mjs";
import { REPO_ROOT } from "../harvest/lib/paths.mjs";

const harvestId = "harvest-2026-08-04-ultimate-sdlc-runner-dark-package-v1";
const result = expandIntelligenceFromSource({
  harvestId,
  sourceRelPath: `artifacts/agent-runs/${harvestId}/chatgpt-findings-source.md`,
});

const observations = result.expansionEntities.map((e) => e.observation);
assert.ok(observations.length > 0, "need observations for round-trip");

let checked = 0;
let failed = 0;
for (const obs of observations) {
  if (!obs.source?.rawRef?.includes("#")) continue;
  const verdict = verifySourceRoundTrip(obs, REPO_ROOT);
  checked += 1;
  if (!verdict.ok) failed += 1;
}

assert.ok(checked > 5, "should verify multiple anchored observations");
assert.equal(failed, 0, "all anchored observations must round-trip");

console.log(`ok - source round-trip verified for ${checked} observations`);
