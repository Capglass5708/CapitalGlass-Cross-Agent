import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

export function loadJsonFromRepo(repoRoot, relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!existsSync(absolutePath)) {
    return { ok: false, code: "FILE_MISSING", path: relativePath };
  }
  try {
    return { ok: true, value: JSON.parse(readFileSync(absolutePath, "utf8")), path: relativePath };
  } catch (error) {
    return { ok: false, code: "JSON_PARSE_ERROR", path: relativePath, error: error.message };
  }
}

export function collectQueryRoutingDatasetIds(routing) {
  const ids = new Set();
  const addRoute = (route) => {
    if (!route) return;
    if (route.primaryDataset) ids.add(route.primaryDataset);
    if (route.primaryDatasetId) ids.add(route.primaryDatasetId);
    for (const value of route.supportingDatasets ?? []) ids.add(value);
    for (const value of route.datasetIds ?? []) ids.add(value);
  };
  for (const route of routing?.routes ?? []) addRoute(route);
  addRoute(routing?.fallback);
  addRoute(routing?.defaultRoute);
  return [...ids].sort();
}

export function findMachineSpecificPaths(repoRoot, relativePaths) {
  const offenders = [];
  const patterns = [
    /\/home\/[^"\s]+/,
    /\/mnt\/[a-z]\/[^"\s]+/i,
    /[A-Z]:\\[^"\s]+/,
    /\/tmp\/[^"\s]+/,
  ];
  for (const relativePath of relativePaths) {
    const loaded = loadJsonFromRepo(repoRoot, relativePath);
    if (!loaded.ok) continue;
    const text = JSON.stringify(loaded.value);
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        offenders.push({ path: relativePath, pattern: pattern.source });
        break;
      }
    }
  }
  return offenders;
}
