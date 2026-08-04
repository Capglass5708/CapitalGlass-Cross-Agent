#!/usr/bin/env node
/**
 * Coordinate CG Master Graph publication to Intelligence Hub + AI cache.
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../");
const GRAPH_ROOT =
  process.env.CG_MASTER_GRAPH_ROOT ?? path.resolve(REPO_ROOT, "../CG-MASTER-GRAPH");

function run(cmd) {
  execSync(cmd, { cwd: GRAPH_ROOT, stdio: "inherit" });
}

console.log(`master-graph:publish-hub — graph root ${GRAPH_ROOT}`);
run("npm run validate");
run("npm run graph:publish");
run("npm run graph:publish:suite");
console.log("master-graph:publish-hub OK");
