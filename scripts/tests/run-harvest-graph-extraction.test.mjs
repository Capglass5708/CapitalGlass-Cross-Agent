import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { buildGraphExtractionFromManifest } from "../harvest/lib/graph-extraction-builder-lib.mjs";
import { graphRepoRoot } from "../harvest/lib/graph-extraction-paths.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../");
const FIXTURE = path.join(__dirname, "fixtures/harvest-manifest-graph-minimal.json");
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

const manifest = JSON.parse(fs.readFileSync(FIXTURE, "utf8"));
const extraction = buildGraphExtractionFromManifest(manifest);

assert.equal(extraction.packetKind, "graph-extraction");
assert.equal(extraction.harvestId, manifest.harvestId);
assert.ok(extraction.nodes.some((n) => n.nodeType === "Harvest"));
assert.equal(extraction.nodes.filter((n) => n.nodeType === "WorkPackage").length, 2);
assert.ok(extraction.edges.some((e) => e.edgeType === "RELATED_TO"));
assert.ok(extraction.edges.some((e) => e.edgeType === "BLOCKED_BY"));

const tmpDir = fs.mkdtempSync(path.join(REPO_ROOT, "artifacts/agent-runs/.graph-extraction-test-"));
const extractionPath = path.join(tmpDir, "graph-extraction.json");
fs.writeFileSync(extractionPath, `${JSON.stringify(extraction, null, 2)}\n`, "utf8");

const graphRoot = graphRepoRoot();
assert.ok(fs.existsSync(path.join(graphRoot, "package.json")), "CG-MASTER-GRAPH must exist for validation");

const stdout = execFileSync(
  npmCmd,
  ["run", "graph:validate-extraction", "--", extractionPath],
  { cwd: graphRoot, encoding: "utf8" },
);
const jsonStart = stdout.indexOf("{");
const verdict = JSON.parse(stdout.slice(jsonStart));
assert.equal(verdict.verdict, "PASS");

fs.rmSync(tmpDir, { recursive: true, force: true });
console.log("ok - harvest graph extraction builder and graph validate-extraction");
