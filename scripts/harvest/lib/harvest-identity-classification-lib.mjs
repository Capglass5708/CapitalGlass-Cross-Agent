import fs from "node:fs";
import path from "node:path";

export const IDENTITY_CLASSES = {
  REAL_HARVEST: "REAL_HARVEST",
  SYNTHETIC_TEST_FIXTURE: "SYNTHETIC_TEST_FIXTURE",
  HISTORICAL_READ_ONLY: "HISTORICAL_READ_ONLY",
  UNKNOWN_IDENTITY: "UNKNOWN_IDENTITY",
};

export const PUBLICATION_ELIGIBILITY = {
  PRODUCTION: "PRODUCTION",
  TEST_ONLY: "TEST_ONLY",
  READ_ONLY: "READ_ONLY",
  BLOCKED: "BLOCKED",
};

/** Approved roots for synthetic test fixtures (repo-relative). */
export const SYNTHETIC_FIXTURE_ROOTS = [
  "scripts/tests/fixtures/",
  "scripts/tests/.tmp/",
];

function normalizeRel(p) {
  return p.replace(/\\/g, "/").replace(/^\.\//, "");
}

export function isUnderSyntheticFixtureRoot(repoRoot, runDir) {
  const rel = normalizeRel(path.relative(repoRoot, runDir));
  return SYNTHETIC_FIXTURE_ROOTS.some((root) => rel.startsWith(root));
}

/**
 * Classify harvest identity for publication policy enforcement.
 */
export function classifyHarvestIdentity({
  repoRoot,
  harvestId,
  manifest = null,
  runDir = null,
}) {
  const resolvedRunDir =
    runDir ?? path.join(repoRoot, "artifacts/agent-runs", harvestId);

  if (!fs.existsSync(resolvedRunDir)) {
    return {
      identityClass: IDENTITY_CLASSES.UNKNOWN_IDENTITY,
      publicationEligibility: PUBLICATION_ELIGIBILITY.BLOCKED,
      harvestId,
      runDir: resolvedRunDir,
      reasons: ["run_dir_missing"],
    };
  }

  const manifestPath = path.join(resolvedRunDir, "harvest-manifest-v1.json");
  let loadedManifest = manifest;
  if (!loadedManifest && fs.existsSync(manifestPath)) {
    loadedManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  }

  if (loadedManifest?.syntheticFixture === true && loadedManifest?.publicationEligibility === "TEST_ONLY") {
    if (!isUnderSyntheticFixtureRoot(repoRoot, resolvedRunDir)) {
      return {
        identityClass: IDENTITY_CLASSES.UNKNOWN_IDENTITY,
        publicationEligibility: PUBLICATION_ELIGIBILITY.BLOCKED,
        harvestId,
        runDir: resolvedRunDir,
        reasons: ["synthetic_fixture_outside_approved_root"],
      };
    }
    return {
      identityClass: IDENTITY_CLASSES.SYNTHETIC_TEST_FIXTURE,
      publicationEligibility: PUBLICATION_ELIGIBILITY.TEST_ONLY,
      harvestId,
      runDir: resolvedRunDir,
      reasons: [],
    };
  }

  if (loadedManifest?.historicalReadOnly === true) {
    return {
      identityClass: IDENTITY_CLASSES.HISTORICAL_READ_ONLY,
      publicationEligibility: PUBLICATION_ELIGIBILITY.READ_ONLY,
      harvestId,
      runDir: resolvedRunDir,
      reasons: [],
    };
  }

  if (loadedManifest?.harvestId || loadedManifest?.missionClass) {
    return {
      identityClass: IDENTITY_CLASSES.REAL_HARVEST,
      publicationEligibility: PUBLICATION_ELIGIBILITY.PRODUCTION,
      harvestId: loadedManifest.harvestId ?? harvestId,
      runDir: resolvedRunDir,
      reasons: [],
    };
  }

  return {
    identityClass: IDENTITY_CLASSES.UNKNOWN_IDENTITY,
    publicationEligibility: PUBLICATION_ELIGIBILITY.BLOCKED,
    harvestId,
    runDir: resolvedRunDir,
    reasons: ["manifest_missing_or_unclassified"],
  };
}

export function allowsLegacyPublication(classification) {
  return classification.identityClass === IDENTITY_CLASSES.SYNTHETIC_TEST_FIXTURE;
}
