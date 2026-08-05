#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const REGISTRY_PATH = path.join(REPO_ROOT, "registry/advancement-harvest-ids.v1.json");

function sha256Json(value) {
  return `sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`;
}

const harvestArg = process.argv.find((a) => a.startsWith("--harvest-id="));
const outArg = process.argv.find((a) => a.startsWith("--out="));

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
let harvests = registry.harvests;

if (harvestArg) {
  const harvestId = harvestArg.split("=").slice(1).join("=");
  harvests = harvests.filter((h) => h.harvestSlug === harvestId);
  if (harvests.length === 0) {
    console.error(`Unknown harvest-id: ${harvestId}`);
    process.exit(1);
  }
}

const refs = {
  schemaVersion: "advancement-lineage-refs-v1@1.0.0",
  exportedAt: new Date().toISOString(),
  workPackageId: "cross-agent-advancement-lineage-export-v1",
  registryPath: "registry/advancement-harvest-ids.v1.json",
  harvests: harvests.map((h) => ({
    harvestSlug: h.harvestSlug,
    harvestNodeId: h.harvestNodeId,
    stableId: h.stableId,
    sourcePath: h.sourcePath,
    findingsFile: h.findingsFile,
    lineageRole: "OBSERVED_HARVEST",
    graphLane: "suite-advancement",
    note: "Export only — compile in CG-MASTER-GRAPH",
  })),
};

refs.contentHash = sha256Json({ harvests: refs.harvests });

const outPath = path.resolve(
  outArg?.split("=").slice(1).join("=") ??
    path.join(REPO_ROOT, "artifacts/advancement-lineage-refs-latest.json"),
);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(refs, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      verdict: "PASS",
      harvestCount: refs.harvests.length,
      outPath,
      contentHash: refs.contentHash,
    },
    null,
    2,
  ),
);
