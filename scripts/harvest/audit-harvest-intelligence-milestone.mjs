#!/usr/bin/env node
import { auditHarvestIntelligenceMilestone } from "./lib/harvest-intelligence-milestone-audit-lib.mjs";

const { metrics, outPath } = auditHarvestIntelligenceMilestone();
console.log(`harvest:audit-intelligence-milestone ${metrics.verdict}`);
console.log(`  receipt=${outPath}`);
process.exit(metrics.verdict === "PASS" ? 0 : 1);
