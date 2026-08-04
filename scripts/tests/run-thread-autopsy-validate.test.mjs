import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateThreadAutopsy } from "../harvest/lib/validate-thread-autopsy.mjs";
import { REPO_ROOT } from "../harvest/lib/paths.mjs";

const HARVEST_ID = "harvest-2026-08-04-three-lane-suite-closeout-v1";
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);

const manifest = JSON.parse(
  fs.readFileSync(path.join(RUN_DIR, "harvest-manifest-v1.json"), "utf8"),
);
const result = validateThreadAutopsy({ manifest, runDir: RUN_DIR, repoRoot: REPO_ROOT });

assert.equal(result.skipped, false);
assert.equal(result.tier, "T2");
assert.equal(result.errors.length, 0, result.errors.join("; "));
console.log("ok - validateThreadAutopsy passes for three-lane suite closeout harvest");
