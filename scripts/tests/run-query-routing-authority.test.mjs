#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { listDatasetsForQuery, routeQuery } from "../query-routing/lib/route-query.mjs";
import { validateQueryRoutingManifest } from "../query-routing/validate-query-routing-manifest.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

function loadJson(relativePath) {
  return JSON.parse(readFileSync(path.join(REPO_ROOT, relativePath), "utf8"));
}

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

test("canonical manifest validates against schema", () => {
  const receipt = validateQueryRoutingManifest();
  assert.equal(receipt.gateVerdict, "QUERY_ROUTING_AUTHORITY_PASS");
  assert.ok(receipt.routeCount >= 10);
});

test("match-patterns fixture validates against schema", () => {
  const receipt = validateQueryRoutingManifest({
    manifestPath:
      "registry/query-routing/fixtures/query-routing-manifest.match-patterns.v1.fixture.json",
  });
  assert.equal(receipt.gateVerdict, "QUERY_ROUTING_AUTHORITY_PASS");
});

test("keywords manifest routes bulk git pull query deterministically", () => {
  const routing = loadJson("registry/query-routing/query-routing-manifest.v1.json");
  const query = "can I safely pull every repo";
  const routed = routeQuery(query, routing);
  assert.equal(routed.queryClass, "repository-health");
  assert.equal(routed.primaryDataset, "git-estate");
  assert.ok(routed.supportingDatasets.includes("authority-estate"));
  assert.ok(routed.routed);

  const listed = listDatasetsForQuery(query, routing);
  assert.ok(listed.datasets.includes("git-estate"));
  assert.ok(listed.datasets.includes("command-estate"));
});

test("match-patterns fixture resolves the same bulk pull route", () => {
  const routing = loadJson(
    "registry/query-routing/fixtures/query-routing-manifest.match-patterns.v1.fixture.json",
  );
  const query = "can I safely pull every repo";
  const routed = routeQuery(query, routing);
  assert.equal(routed.queryClass, "repository-health");
  assert.equal(routed.primaryDataset, "git-estate");
  assert.deepEqual(routed.datasetIds, [
    "git-estate",
    "active-ledger",
    "authority-estate",
    "command-estate",
  ]);
});

test("keywords and match-patterns forms agree on authority-placement query", () => {
  const keywordsRouting = loadJson("registry/query-routing/query-routing-manifest.v1.json");
  const patternsRouting = loadJson(
    "registry/query-routing/fixtures/query-routing-manifest.match-patterns.v1.fixture.json",
  );
  const query = "who owns document layer owner placement";
  const keywordsRoute = routeQuery(query, keywordsRouting);
  const patternsRoute = routeQuery(query, patternsRouting);
  assert.equal(keywordsRoute.queryClass, "authority-placement");
  assert.equal(patternsRoute.queryClass, "authority-placement");
  assert.equal(keywordsRoute.primaryDataset, "authority-estate");
  assert.equal(patternsRoute.primaryDataset, "authority-estate");
});

test("fallback uses intelligence-hub-index when no route matches", () => {
  const routing = loadJson("registry/query-routing/query-routing-manifest.v1.json");
  const routed = routeQuery("zzzz-no-route-token-zzzz", routing);
  assert.equal(routed.routed, false);
  assert.equal(routed.primaryDataset, "intelligence-hub-index");
  assert.ok(routed.supportingDatasets.includes("active-ledger"));
});

test("mission-intelligence route resolves without colliding with the existing preflight route", () => {
  const routing = loadJson("registry/query-routing/query-routing-manifest.v1.json");

  const missionQuery = "what related missions and prior failures inform this intelligence preflight";
  const missionRouted = routeQuery(missionQuery, routing);
  assert.equal(missionRouted.queryClass, "mission-intelligence");
  assert.equal(missionRouted.primaryDataset, "mission-intelligence");
  assert.ok(missionRouted.routed);

  // "preflight" alone is a different, pre-existing concept (infra readiness ->
  // all-systems-go) from intelligence.preflight()'s mission-context retrieval.
  // A bare "preflight" query must keep resolving to the original route.
  const infraQuery = "are we all systems go, any blockers before I start";
  const infraRouted = routeQuery(infraQuery, routing);
  assert.equal(infraRouted.queryClass, "preflight");
  assert.equal(infraRouted.primaryDataset, "all-systems-go");
});

test("mission-intelligence dataset is registered so the router never resolves an unknown dataset", () => {
  const routing = loadJson("registry/query-routing/query-routing-manifest.v1.json");
  const registry = loadJson("registry/datasets/hot-cache-dataset-registry.v1.json");
  const registeredIds = new Set(registry.datasets.map((d) => d.datasetId));
  const missionRoute = routing.routes.find((r) => r.queryClass === "mission-intelligence");
  assert.ok(missionRoute, "mission-intelligence route must exist");
  assert.ok(registeredIds.has(missionRoute.primaryDataset));
  for (const id of missionRoute.supportingDatasets ?? []) {
    assert.ok(registeredIds.has(id), `supporting dataset '${id}' must be registered`);
  }
});

test("defaultRoute alias resolves in match-patterns fixture", () => {
  const routing = loadJson(
    "registry/query-routing/fixtures/query-routing-manifest.match-patterns.v1.fixture.json",
  );
  const routed = routeQuery("xyzzy totally unknown query fragment", routing);
  assert.equal(routed.primaryDataset, "intelligence-hub-index");
  assert.ok(routed.datasetIds.includes("active-ledger"));
});

console.log(`\nquery-routing authority tests: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
