import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  validateGoldMineEvidenceProjection,
  validateOutcomePackets,
} from "../harvest/lib/validate-gold-mine-evidence-projection.mjs";
import { validateGoldMineEvidenceProjectionSchema } from "../harvest/lib/schema-validate.mjs";

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "gm-projection-"));
}

function writeJson(dir, name, value) {
  fs.writeFileSync(path.join(dir, name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const validProjection = {
  schemaVersion: "gold-mine-evidence-projection-v1@1.0.0",
  harvestId: "harvest-test-v1",
  sourceCommitSha: "a082553e210c4606d8efca321bdbead847c8ab62",
  corpusBias: {
    evidenceDomainDistribution: { sdlc: 6, governance: 4, productOperation: 1 },
    corpusBiasWarning: "SDLC-heavy — zero open candidates does not mean estate optimized",
    underObservedDomains: ["Computer Estimator", "Revu"],
  },
  productWorkflowCoverage: {
    computerEstimator: "NOT_OBSERVED",
    documentCenter: "OBSERVED",
    bidComposer: "NOT_OBSERVED",
    revuBluebeam: "NOT_OBSERVED",
    vae: "OBSERVED",
    scraper: "NOT_OBSERVED",
    crossAppHandoffs: "OBSERVED",
    operatorReentry: "OBSERVED",
  },
  projections: [
    {
      projectionId: "GMP-001",
      signalClass: "RESOLUTION_SIGNAL",
      lifecycleHint: "RESOLVED_OBSERVED",
      workPackageId: "gold-mine-full-open-population-implementation-v1",
      evidenceStrength: "high",
      businessImpact: "PLATFORM_INTERNAL",
      evidenceEra: "POST_IMPLEMENTATION",
      novelty: "RESOLUTION_EVIDENCE",
      implementationState: "VERIFIED_FIXED",
      summary: "Receipt-field false positives suppressed via constitutional contract",
      evidenceRefs: ["Data-Extraction@20e235e9f59ffbe0b3b436d902736283b93b2d67"],
    },
  ],
};

// schema valid fixture
{
  const result = validateGoldMineEvidenceProjectionSchema(validProjection);
  assert.equal(result.ok, true, result.errors?.join("; "));
  console.log("ok - gold mine projection schema accepts valid fixture");
}

// warn-only validator — valid doc
{
  const dir = tmpDir();
  writeJson(dir, "gold-mine-evidence-projections-v1.json", validProjection);
  const manifest = {
    harvestId: "harvest-test-v1",
    goldMineHarvest: { noSuppressionDeclared: true, protocolVersion: "1.1.0" },
    packets: [],
  };
  const out = validateGoldMineEvidenceProjection({ runDir: dir, manifest, tier: "T2" });
  assert.equal(out.projectionCount, 1);
  assert.equal(out.warnings.length, 0, out.warnings.join("; "));
  console.log("ok - warn-only validator passes clean v1.1 projection");
}

// missing projection on T2 warns
{
  const dir = tmpDir();
  const manifest = { harvestId: "harvest-test-v1", goldMineHarvest: {} };
  const out = validateGoldMineEvidenceProjection({ runDir: dir, manifest, tier: "T2" });
  assert.ok(out.warnings.some((w) => w.includes("missing for T2+")));
  console.log("ok - missing projection warns on T2");
}

// ordinal-only digest warns
{
  const dir = tmpDir();
  const bad = structuredClone(validProjection);
  bad.projections[0].candidateDigestRef = "GOLD-0007";
  writeJson(dir, "gold-mine-evidence-projections-v1.json", bad);
  const manifest = {
    harvestId: "harvest-test-v1",
    goldMineHarvest: { noSuppressionDeclared: true },
    packets: [],
  };
  const out = validateGoldMineEvidenceProjection({ runDir: dir, manifest, tier: "T2" });
  assert.ok(out.warnings.some((w) => w.includes("ordinal-only")));
  console.log("ok - ordinal-only candidateDigestRef emits warning");
}

// outcome packet effectiveness
{
  const warnings = [];
  validateOutcomePackets(
    {
      packets: [
        {
          packetId: "outcome-test-v1",
          packetKind: "outcome",
          beforeState: "15 open candidates",
          afterState: "0 open",
          effectiveness: "PROVEN_EFFECTIVE",
        },
        {
          packetId: "outcome-bad-v1",
          packetKind: "outcome",
          beforeState: "x",
          afterState: "y",
        },
      ],
    },
    warnings,
  );
  assert.ok(warnings.some((w) => w.includes("outcome-bad-v1")));
  console.log("ok - outcome packet missing effectiveness warns");
}

// PROBLEM + VERIFIED_FIXED mismatch warns
{
  const dir = tmpDir();
  const bad = structuredClone(validProjection);
  bad.projections[0].signalClass = "PROBLEM_SIGNAL";
  bad.projections[0].implementationState = "VERIFIED_FIXED";
  writeJson(dir, "gold-mine-evidence-projections-v1.json", bad);
  const manifest = {
    harvestId: "harvest-test-v1",
    goldMineHarvest: { noSuppressionDeclared: true },
    packets: [],
  };
  const out = validateGoldMineEvidenceProjection({ runDir: dir, manifest, tier: "T2" });
  assert.ok(out.warnings.some((w) => w.includes("PROBLEM_SIGNAL")));
  console.log("ok - problem/resolution class mismatch warns");
}
