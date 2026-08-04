#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  collectQueryRoutingDatasetIds,
  loadJsonFromRepo,
} from "../hot-cache-dataset-registry/lib/registry-authority-lib.mjs";
import { validateHotCacheDatasetRegistry } from "../hot-cache-dataset-registry/validate-hot-cache-dataset-registry.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const APPBUILDER_ROOT = path.resolve(REPO_ROOT, "../CG-AppBuilder-MCP");

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

test("dataset registry validates and resolves all query-routing dataset IDs", () => {
  const receipt = validateHotCacheDatasetRegistry({ repoRoot: REPO_ROOT });
  assert.equal(receipt.gateVerdict, "HOT_CACHE_DATASET_REGISTRY_PASS");
  assert.equal(receipt.requiredDatasetCount, 2);
});

test("missing query-routing dataset registration fails clearly", () => {
  const routing = loadJsonFromRepo(REPO_ROOT, "registry/query-routing/query-routing-manifest.v1.json");
  const registry = loadJsonFromRepo(
    REPO_ROOT,
    "registry/datasets/hot-cache-dataset-registry.v1.json",
  );
  const ids = collectQueryRoutingDatasetIds(routing.value);
  const trimmed = {
    ...registry.value,
    datasets: registry.value.datasets.filter((entry) => entry.datasetId !== "git-estate"),
  };
  const registered = new Set(trimmed.datasets.map((entry) => entry.datasetId));
  const unresolved = ids.filter((id) => !registered.has(id));
  assert.ok(unresolved.includes("git-estate"));
});

test("git-estate manifest uses folder identity without host-local observed paths", () => {
  const manifest = loadJsonFromRepo(REPO_ROOT, "registry/git-estate/git-estate-manifest.v1.json");
  assert.ok(manifest.value.records.length >= 25);
  assert.ok(manifest.value.sourceManifest?.relativePath.includes("wsl-repo-library-manifest"));
  const text = JSON.stringify(manifest.value);
  assert.equal(text.includes("/home/wesle/repos"), false);
  assert.equal(text.includes("observed"), false);
});

test("authority-estate manifest satisfies consumption gate domain floor", () => {
  const manifest = loadJsonFromRepo(
    REPO_ROOT,
    "registry/authority-estate/authority-estate-manifest.v1.json",
  );
  assert.ok(manifest.value.records.length >= 5);
  assert.ok((manifest.value.unresolvedConflicts ?? []).length >= 1);
});

test("App Builder compiles git-estate and authority-estate from clean Cross-Agent root", () => {
  if (!existsSync(path.join(APPBUILDER_ROOT, "scripts/hot-cache-platform/compile-dataset.mjs"))) {
    console.log("skip - App Builder hot-cache platform not present beside Cross-Agent");
    return;
  }

  const env = {
    ...process.env,
    CROSS_AGENT_ROOT: REPO_ROOT,
    CG_REPOS_ROOT: process.env.CG_REPOS_ROOT || "/home/wesle/repos",
    CG_WSL_MACHINE_ROLE: process.env.CG_WSL_MACHINE_ROLE || "wesley_work",
  };

  for (const datasetId of ["git-estate", "authority-estate"]) {
    const result = spawnSync(
      "node",
      ["scripts/hot-cache-platform/compile-dataset.mjs", `--dataset=${datasetId}`, "--json"],
      { cwd: APPBUILDER_ROOT, env, encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const receipt = JSON.parse(result.stdout);
    assert.ok(
      receipt.ok === true || receipt.gateVerdict?.includes("PASS"),
      JSON.stringify(receipt),
    );
  }
});

console.log(`\nhot-cache dataset registry tests: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
