import {
  classifyHarvestIdentity,
  allowsLegacyPublication,
  IDENTITY_CLASSES,
} from "./harvest-identity-classification-lib.mjs";

export const LEGACY_BLOCK_VERDICT = "BLOCKED_LEGACY_REAL_HARVEST";

/**
 * Fail closed before any legacy publication writes unless identity is synthetic test fixture.
 */
export function guardLegacyPublication({
  repoRoot,
  harvestId,
  manifest = null,
  runDir = null,
  pipeline = "legacy",
}) {
  if (pipeline !== "legacy") {
    return { ok: true, pipeline, skipped: true };
  }

  const classification = classifyHarvestIdentity({
    repoRoot,
    harvestId,
    manifest,
    runDir,
  });

  if (allowsLegacyPublication(classification)) {
    return {
      ok: true,
      pipeline: "legacy",
      classification,
      verdict: "LEGACY_SYNTHETIC_ALLOWED",
    };
  }

  const identityClass = classification.identityClass;
  const blocked =
    identityClass === IDENTITY_CLASSES.REAL_HARVEST ||
    identityClass === IDENTITY_CLASSES.UNKNOWN_IDENTITY ||
    identityClass === IDENTITY_CLASSES.HISTORICAL_READ_ONLY;

  if (blocked) {
    return {
      ok: false,
      verdict: LEGACY_BLOCK_VERDICT,
      pipeline: "legacy",
      classification,
      errors: [
        `legacy publication blocked for identityClass=${identityClass}`,
        "Use canonical real-harvest command: harvest:publish-intelligence-full --pipeline=phase-b-v2 --payload-hash=<sha256:...>",
        ...classification.reasons,
      ],
      recovery: {
        canonicalPath: "harvest:publish-intelligence-full --pipeline=phase-b-v2",
        forbidden: "legacy pipeline for real harvest identities",
      },
    };
  }

  return {
    ok: true,
    pipeline: "legacy",
    classification,
    verdict: "LEGACY_ALLOWED",
  };
}
