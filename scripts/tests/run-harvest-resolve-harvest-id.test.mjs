import assert from "node:assert/strict";
import test from "node:test";

import { resolveHarvestId, HARVEST_ID_RE } from "../harvest/lib/resolve-harvest-id.mjs";
import { REFERENCE_HARVEST_ID } from "../harvest/lib/paths.mjs";

test("resolveHarvestId fails closed without id", () => {
  assert.throws(() => resolveHarvestId([]), (err) => err.code === "BLOCKED_MISSING_HARVEST_ID");
});

test("resolveHarvestId accepts --harvest-id flag", () => {
  const id = "harvest-2026-08-07-test-fixture-v1";
  const { harvestId, source } = resolveHarvestId([`--harvest-id=${id}`]);
  assert.equal(harvestId, id);
  assert.equal(source, "flag");
  assert.match(harvestId, HARVEST_ID_RE);
});

test("resolveHarvestId accepts positional arg", () => {
  const id = "harvest-2026-08-07-positional-fixture-v1";
  const { harvestId, source } = resolveHarvestId([id]);
  assert.equal(harvestId, id);
  assert.equal(source, "positional");
});

test("resolveHarvestId accepts HARVEST_ID env", () => {
  const id = "harvest-2026-08-07-env-fixture-v1";
  const { harvestId, source } = resolveHarvestId([], { env: { HARVEST_ID: id } });
  assert.equal(harvestId, id);
  assert.equal(source, "env");
});

test("resolveHarvestId reference default only when allowed", () => {
  const { harvestId, source } = resolveHarvestId([], { allowReferenceDefault: true });
  assert.equal(harvestId, REFERENCE_HARVEST_ID);
  assert.equal(source, "reference-default");
});
