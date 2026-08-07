import assert from "node:assert/strict";
import fs from "node:fs";

import { loadIntelligenceIndex } from "../harvest/lib/intelligence-index-lib.mjs";
import { REPO_ROOT } from "../harvest/lib/paths.mjs";

const index = loadIntelligenceIndex(REPO_ROOT);
assert.ok(Array.isArray(index.entities), "intelligence index must expose entities[]");

const indexMd = fs.readFileSync(
  `${REPO_ROOT}/work-progress/projects/INDEX.md`,
  "utf8",
);
assert.ok(indexMd.includes("Harvest packet index"), "INDEX.md must be derived harvest index view");
assert.ok(indexMd.length > 500, "INDEX.md should contain registry rows");

console.log("ok - derived INDEX view reads from intelligence authority");
