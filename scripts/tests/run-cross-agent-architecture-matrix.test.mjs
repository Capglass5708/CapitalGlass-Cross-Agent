#!/usr/bin/env node
/**
 * Aggregate Cross-Agent architecture verification matrix.
 * Prefer this for reconciliation / currentness proof over ad-hoc suite picking.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const SUITES = [
  { id: "HARVEST_CORE", cmd: ["npm", "run", "test:harvest"] },
  { id: "GIT_RETENTION", cmd: ["npm", "run", "test:harvest:git-retention"] },
  { id: "RISK_REMEDIATION", cmd: ["npm", "run", "test:harvest:risk-remediation"] },
  { id: "PUBLICATION_HARDENING", cmd: ["npm", "run", "test:harvest:publication-hardening"] },
  { id: "LAYERED_VERDICT", cmd: ["npm", "run", "test:harvest:layered-verdict"] },
  { id: "CONTENT_FRESHNESS", cmd: ["npm", "run", "test:harvest:content-freshness"] },
  { id: "IDENTITY", cmd: ["npm", "run", "test:harvest:identity"] },
  { id: "HOT_CACHE", cmd: ["npm", "run", "test:hot-cache-dataset-registry"] },
  { id: "QUERY_ROUTING", cmd: ["npm", "run", "test:query-routing"] },
  { id: "PROTOCOL_SELF_LEARNING", cmd: ["npm", "run", "test:protocol-self-learning-export"] },
  { id: "EXPERIENCE_GRAPH", cmd: ["npm", "run", "test:experience-graph-foundation"] },
  { id: "INTELLIGENCE_CONTRACTS", cmd: ["npm", "run", "test:intelligence-contracts"] },
  { id: "INTELLIGENCE_INGEST", cmd: ["npm", "run", "test:intelligence-ingest"] },
  { id: "INTELLIGENCE_FIRST_REAL_MISSION", cmd: ["npm", "run", "test:intelligence-first-real-mission"] },
  { id: "INTELLIGENCE_VERIFICATION", cmd: ["npm", "run", "test:intelligence-verification"] },
  { id: "PHASE_B", cmd: ["npm", "run", "test:harvest:phase-b"] },
];

const results = [];
let failed = 0;

for (const suite of SUITES) {
  const started = Date.now();
  const proc = spawnSync(suite.cmd[0], suite.cmd.slice(1), {
    cwd: REPO_ROOT,
    encoding: "utf8",
    env: {
      ...process.env,
      CG_REPOS_ROOT: process.env.CG_REPOS_ROOT || path.resolve(REPO_ROOT, ".."),
      CG_APPBUILDER_MCP_ROOT:
        process.env.CG_APPBUILDER_MCP_ROOT || path.resolve(REPO_ROOT, "..", "CG-AppBuilder-MCP"),
    },
  });
  const ok = proc.status === 0;
  if (!ok) failed += 1;
  results.push({
    id: suite.id,
    ok,
    status: ok ? "PASS" : "FAIL",
    durationMs: Date.now() - started,
    exitCode: proc.status,
    stderrTail: String(proc.stderr ?? "").slice(-500),
  });
  console.log(`${ok ? "PASS" : "FAIL"} ${suite.id} (${Date.now() - started}ms)`);
  if (!ok) {
    const tail = String(proc.stdout ?? "").slice(-800);
    if (tail) console.log(tail);
  }
}

const summary = {
  schemaVersion: "cross-agent-architecture-test-matrix-v1@1.0.0",
  verdict: failed === 0 ? "PASS" : "FAIL",
  failed,
  total: SUITES.length,
  results,
  generatedAt: new Date().toISOString(),
};

console.log(JSON.stringify(summary, null, 2));
if (failed > 0) process.exit(1);
