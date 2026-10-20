import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

import { loadProfile, recordedCommand, resolveSteps } from "./profiles.mjs";

const FORBIDDEN = ["NIGHT_OWL_RECEIPT_KEY", "NIGHT_OWL_RECEIPT_KEY_PATH", "BB_HISTORY_PUSH_TOKEN"];

for (const name of FORBIDDEN) {
  if (process.env[name]) {
    process.stderr.write("SIGNING_MATERIAL_PRESENT\n");
    process.exit(3);
  }
}

const commit = process.env.CI_COMMIT || "";
const profile = process.env.CI_PROFILE || "";
if (!/^[0-9a-f]{40}$/.test(commit) || !profile) {
  process.stderr.write("CI_JOB_INCOMPLETE\n");
  process.exit(2);
}

let manifest;
let command = "";
let steps;
try {
  manifest = loadProfile("/work", profile);
  command = recordedCommand(manifest);
  steps = resolveSteps(manifest);
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exit(3);
}

const startedAt = new Date().toISOString();
let stdout = "";
let stderr = "";
let exitCode = 0;
for (const argv of steps) {
  const proc = spawnSync(argv[0], argv.slice(1), { encoding: "utf8", cwd: "/work" });
  stdout += proc.stdout || "";
  stderr += proc.stderr || "";
  exitCode = proc.status === null ? 1 : proc.status;
  if (exitCode !== 0) break;
}
const evidence = {
  schema: "night-owl-ci-evidence-v1",
  profile,
  commit,
  command,
  exitCode,
  passed: exitCode === 0,
  stdoutSha256: createHash("sha256").update(stdout).digest("hex"),
  stderrSha256: createHash("sha256").update(stderr).digest("hex"),
  startedAt,
  finishedAt: new Date().toISOString(),
};
writeFileSync("/evidence/stdout.txt", stdout);
writeFileSync("/evidence/stderr.txt", stderr);
writeFileSync("/evidence/evidence.json", `${JSON.stringify(evidence, null, 2)}\n`);
process.stdout.write(`NIGHT_OWL_CI_RESULT exit=${exitCode}\n`);
process.exit(exitCode);
