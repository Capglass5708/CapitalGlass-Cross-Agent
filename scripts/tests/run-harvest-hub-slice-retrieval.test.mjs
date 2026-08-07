import assert from "node:assert/strict";

import { buildHarvestIntelligenceHubSlice } from "../harvest/lib/harvest-intelligence-retrieval-lib.mjs";
import { loadIntelligenceIndex } from "../harvest/lib/intelligence-index-lib.mjs";
import { REPO_ROOT } from "../harvest/lib/paths.mjs";

const index = loadIntelligenceIndex(REPO_ROOT);
const slice = buildHarvestIntelligenceHubSlice({ index });
assert.equal(slice.derivedView, true);
assert.equal(slice.machineAuthority, false);

for (const row of slice.rows.filter((r) => r.entityId)) {
  const entity = index.entities.find((e) => e.entityId === row.entityId);
  assert.ok(entity, `slice row must resolve to entity authority: ${row.entityId}`);
  if (row.rawRef) {
    assert.ok(row.entityAuthorityRef, "indexed row must retain authority pointer");
  }
}

console.log("ok - hub slice resolves indexed entities without raw scan");
