#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const coveragePath = path.resolve(
  __dirname,
  "../../artifacts/agent-runs/harvest-2026-08-03-cross-thread-platform-state-v1/coverage.json",
);
const coverage = JSON.parse(fs.readFileSync(coveragePath, "utf8"));
console.log(`gradeAfter=${coverage.gradeAfter} score=${coverage.overallCoverageScore}`);
