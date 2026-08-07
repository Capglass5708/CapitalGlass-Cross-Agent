import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARVEST_ID = "harvest-2026-08-07-record-propagates-id-fixture-v1";

test("record-harvest propagates harvest id to child sync-derived", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "harvest-record-id-"));
  const runDir = path.join(tmpRoot, "artifacts/agent-runs", HARVEST_ID);
  fs.mkdirSync(runDir, { recursive: true });

  const manifest = {
    schemaVersion: "cross-agent-harvest-manifest-v1@1.0.0",
    harvestId: HARVEST_ID,
    workPackageId: HARVEST_ID,
    updatedAt: new Date().toISOString(),
    missionClass: "fix",
    overallHarvestVerdict: "HARVEST_COMPLETE",
    retrievalResult: "INDEX_HIT",
    cacheResult: "CACHE_MISS",
    sourceCommitSha: "fixture0000000000000000000000000000000000",
    sourceBranch: "main",
    sourceRepo: "CapitalGlass-Cross-Agent",
    projection: { projectionSyncStatus: "recordingOnly", hubPublishStatus: "not-published" },
    ledgerLineage: { ledgerPath: "work-progress/ACTIVE_WORK.md" },
    doNotAdvance: [],
    supersededClaims: [],
    packets: [
      {
        packetId: "record-id-propagation-fixture-v1",
        ownerRepo: "CapitalGlass-Cross-Agent",
        state: "COMPLETE",
        packetVerdict: "PASS",
        nextAction: "fixture",
        projectFile: "work-progress/projects/INDEX.md",
        ownerIndexingStatus: "indexed",
        evidenceRefs: [],
        doNotAdvance: [],
        advancementGate: "not-required",
        commitRefs: [],
      },
    ],
  };
  fs.writeFileSync(path.join(runDir, "harvest-manifest-v1.json"), JSON.stringify(manifest, null, 2));

  const spyScript = path.join(tmpRoot, "scripts/harvest/sync-derived.mjs");
  fs.mkdirSync(path.dirname(spyScript), { recursive: true });
  fs.writeFileSync(
    spyScript,
    `import fs from "node:fs";
const out = process.env.HARVEST_ID || process.argv.find(a => a.startsWith("--harvest-id="))?.split("=")[1] || "missing";
fs.writeFileSync(${JSON.stringify(path.join(tmpRoot, "child-harvest-id.txt"))}, out);
console.log("spy ok");
`,
    "utf8",
  );

  const recordScript = `#!/usr/bin/env node
import { execSync } from "node:child_process";
import { resolveHarvestIdFromProcessArgv } from "./lib/resolve-harvest-id.mjs";
const { harvestId } = resolveHarvestIdFromProcessArgv();
execSync("node scripts/harvest/sync-derived.mjs --harvest-id=" + harvestId, {
  cwd: ${JSON.stringify(tmpRoot)},
  stdio: "inherit",
  env: { ...process.env, HARVEST_ID: harvestId },
});
`;
  fs.mkdirSync(path.join(tmpRoot, "scripts/harvest/lib"), { recursive: true });
  fs.copyFileSync(
    path.join(REPO_ROOT, "scripts/harvest/lib/resolve-harvest-id.mjs"),
    path.join(tmpRoot, "scripts/harvest/lib/resolve-harvest-id.mjs"),
  );
  fs.copyFileSync(path.join(REPO_ROOT, "scripts/harvest/lib/paths.mjs"), path.join(tmpRoot, "scripts/harvest/lib/paths.mjs"));
  const pathsContent = fs.readFileSync(path.join(tmpRoot, "scripts/harvest/lib/paths.mjs"), "utf8").replace(
    /export const REPO_ROOT = .+;/,
    `export const REPO_ROOT = ${JSON.stringify(tmpRoot)};`,
  );
  fs.writeFileSync(path.join(tmpRoot, "scripts/harvest/lib/paths.mjs"), pathsContent);
  fs.writeFileSync(path.join(tmpRoot, "scripts/harvest/record-spy.mjs"), recordScript);

  execSync(`node scripts/harvest/record-spy.mjs --harvest-id=${HARVEST_ID}`, {
    cwd: tmpRoot,
    stdio: "pipe",
    env: { ...process.env, HARVEST_ID: HARVEST_ID },
  });

  const childId = fs.readFileSync(path.join(tmpRoot, "child-harvest-id.txt"), "utf8").trim();
  assert.equal(childId, HARVEST_ID);
});
