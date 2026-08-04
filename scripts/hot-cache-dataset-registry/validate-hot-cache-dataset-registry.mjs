#!/usr/bin/env node
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  collectQueryRoutingDatasetIds,
  findMachineSpecificPaths,
  loadJsonFromRepo,
} from "./lib/registry-authority-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

const TRACKED_AUTHORITY_PATHS = [
  "registry/datasets/hot-cache-dataset-registry.v1.json",
  "registry/git-estate/git-estate-manifest.v1.json",
  "registry/authority-estate/authority-estate-manifest.v1.json",
  "registry/query-routing/query-routing-manifest.v1.json",
];

export function validateHotCacheDatasetRegistry({
  repoRoot = REPO_ROOT,
  registryPath = "registry/datasets/hot-cache-dataset-registry.v1.json",
  routingPath = "registry/query-routing/query-routing-manifest.v1.json",
  schemaPath = "registry/datasets/schemas/hot-cache-dataset-registry.v1.schema.json",
} = {}) {
  const schemaLoaded = loadJsonFromRepo(repoRoot, schemaPath);
  if (!schemaLoaded.ok) {
    return { gateVerdict: "HOT_CACHE_DATASET_SCHEMA_MISSING", ...schemaLoaded };
  }

  const registryLoaded = loadJsonFromRepo(repoRoot, registryPath);
  if (!registryLoaded.ok) {
    return { gateVerdict: "HOT_CACHE_DATASET_REGISTRY_MISSING", ...registryLoaded };
  }

  const routingLoaded = loadJsonFromRepo(repoRoot, routingPath);
  if (!routingLoaded.ok) {
    return { gateVerdict: "QUERY_ROUTING_MANIFEST_MISSING", ...routingLoaded };
  }

  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schemaLoaded.value);
  if (!validate(registryLoaded.value)) {
    return {
      gateVerdict: "HOT_CACHE_DATASET_REGISTRY_INVALID",
      errors: validate.errors ?? [],
    };
  }

  const registeredIds = new Set(
    (registryLoaded.value.datasets ?? []).map((entry) => entry.datasetId),
  );
  const routingIds = collectQueryRoutingDatasetIds(routingLoaded.value);
  const unresolvedRoutingIds = routingIds.filter((id) => !registeredIds.has(id));

  const requiredEntries = (registryLoaded.value.datasets ?? []).filter((entry) => entry.missOk === false);
  const missingManifests = [];
  for (const entry of requiredEntries) {
    if (!entry.manifestPath) {
      missingManifests.push({ datasetId: entry.datasetId, reason: "MANIFEST_PATH_MISSING" });
      continue;
    }
    const manifestPath = path.join(repoRoot, entry.manifestPath);
    if (!existsSync(manifestPath)) {
      missingManifests.push({ datasetId: entry.datasetId, reason: "MANIFEST_FILE_MISSING", manifestPath: entry.manifestPath });
    }
  }

  const machinePaths = findMachineSpecificPaths(repoRoot, TRACKED_AUTHORITY_PATHS);

  if (unresolvedRoutingIds.length > 0) {
    return {
      gateVerdict: "QUERY_ROUTING_DATASET_UNRESOLVED",
      unresolvedRoutingIds,
      registeredCount: registeredIds.size,
      routingCount: routingIds.length,
    };
  }

  if (missingManifests.length > 0) {
    return {
      gateVerdict: "REQUIRED_DATASET_MANIFEST_MISSING",
      missingManifests,
    };
  }

  if (machinePaths.length > 0) {
    return {
      gateVerdict: "REGISTRY_MACHINE_PATH_FORBIDDEN",
      machinePaths,
    };
  }

  return {
    gateVerdict: "HOT_CACHE_DATASET_REGISTRY_PASS",
    registeredCount: registeredIds.size,
    routingCount: routingIds.length,
    requiredDatasetCount: requiredEntries.length,
  };
}

function main() {
  const json = process.argv.includes("--json");
  const receipt = validateHotCacheDatasetRegistry();
  if (json) {
    console.log(JSON.stringify(receipt, null, 2));
  } else {
    console.log(receipt.gateVerdict);
    if (receipt.unresolvedRoutingIds?.length) {
      console.error(`unresolved: ${receipt.unresolvedRoutingIds.join(", ")}`);
    }
    if (receipt.machinePaths?.length) {
      for (const offender of receipt.machinePaths) {
        console.error(`${offender.path}: ${offender.pattern}`);
      }
    }
  }
  process.exit(receipt.gateVerdict.endsWith("_PASS") ? 0 : 1);
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main();
}
