import assert from "node:assert/strict";

import {
  buildHarvestIntelligenceRankedViews,
  buildHarvestIntelligenceHubSlice,
} from "../harvest/lib/harvest-intelligence-retrieval-lib.mjs";
import { loadIntelligenceIndex } from "../harvest/lib/intelligence-index-lib.mjs";
import { REPO_ROOT } from "../harvest/lib/paths.mjs";

const index = loadIntelligenceIndex(REPO_ROOT);
const before = index.entities.length;
const views = buildHarvestIntelligenceRankedViews({ index });
assert.equal(views.entityCountBefore, before);
assert.equal(views.entityCountAfter, before);
assert.equal(views.entitiesDeleted, 0);

const slice = buildHarvestIntelligenceHubSlice({ index });
assert.ok(slice.rows.length >= before, "slice must include entity pointers");
const sample = slice.rows.find((r) => r.entityId);
assert.ok(sample?.entityAuthorityRef.includes("harvest-intelligence-index.json"));

console.log("ok - ranked views are non-destructive derived subsets");
