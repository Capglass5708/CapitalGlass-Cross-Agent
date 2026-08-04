import fs from "node:fs";
import path from "node:path";
import { hashCanonicalJson, hashFileContent, sha256Hex } from "./hash.mjs";

export const IDENTITY_SCHEMA_VERSION = "harvest-publication-identity-v1@1.0.0";
export const INVENTORY_SCHEMA_VERSION = "harvest-durable-payload-inventory-v1@1.0.0";

/** Top-level manifest keys excluded from manifestHash. */
export const MANIFEST_VOLATILE_TOP_LEVEL_KEYS = new Set([
  "generatedAt",
  "createdAt",
  "updatedAt",
  "operationalAt",
  "checkedAt",
  "compiledAt",
  "publishedAt",
  "durationMs",
  "runId",
  "receiptCommit",
  "projection",
  "ledgerLineage",
  "supersededClaims",
  "commitEvidence",
  "cacheResult",
  "retrievalResult",
]);

/** Nested keys stripped anywhere in manifest tree before hashing. */
export const MANIFEST_VOLATILE_NESTED_KEYS = new Set([
  "generatedAt",
  "createdAt",
  "updatedAt",
  "operationalAt",
  "checkedAt",
  "compiledAt",
  "publishedAt",
  "durationMs",
  "runId",
  "receiptCommit",
  "hubPublishStatus",
  "projectionSyncStatus",
  "hubPublishReceiptRef",
  "hubPublishBlocker",
  "hotRoutingStatus",
  "cacheStatus",
  "zCacheStatus",
  "supabaseProjectionStatus",
]);

const ABSOLUTE_PATH_PATTERN = /^(\/|[A-Za-z]:\\)/;

export const DURABLE_ARTIFACT_SPECS = [
  { logicalPath: "harvest-manifest-v1.json", required: true, tierMin: "T0", glob: false },
  { logicalPath: "thread-autopsy-bundle.json", required: false, tierMin: "T1", glob: false },
  { logicalPath: "thread-event-inventory.json", required: false, tierMin: "T1", glob: false },
  { logicalPath: "code-touch-summary.json", required: false, tierMin: "T1", glob: false },
  { logicalPath: "seed-packets/*.json", required: false, tierMin: "T2", glob: true },
  { logicalPath: "compact-records/*.json", required: false, tierMin: "T1", glob: true },
  { logicalPath: "validation-result.json", required: false, tierMin: "T0", glob: false },
  { logicalPath: "thread-autopsy-validation-result.json", required: false, tierMin: "T1", glob: false },
  { logicalPath: "duplication-preflight-receipt.json", required: false, tierMin: "T1", glob: false },
];

const TIER_ORDER = { T0: 0, T1: 1, T2: 2, T3: 3 };

export function toSha256Prefixed(hex) {
  return `sha256:${hex}`;
}

export function normalizeToLogicalPath(filePath, harvestId) {
  if (!filePath || typeof filePath !== "string") {
    return filePath;
  }
  const normalized = filePath.replace(/\\/g, "/");
  const marker = `artifacts/agent-runs/${harvestId}/`;
  const idx = normalized.indexOf(marker);
  if (idx >= 0) {
    return normalized.slice(idx + marker.length);
  }
  if (ABSOLUTE_PATH_PATTERN.test(normalized)) {
    const base = path.basename(normalized);
    return base;
  }
  return normalized.replace(/^\.\//, "");
}

function stripVolatileValue(value, { nested = false } = {}) {
  if (value === null || typeof value !== "object") {
    if (typeof value === "string" && ABSOLUTE_PATH_PATTERN.test(value)) {
      return null;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .map((item) => stripVolatileValue(item, { nested: true }))
      .filter((item) => item !== null && item !== undefined);
  }
  const out = {};
  for (const [key, child] of Object.entries(value)) {
    if (nested && MANIFEST_VOLATILE_NESTED_KEYS.has(key)) {
      continue;
    }
    const stripped = stripVolatileValue(child, { nested: true });
    if (stripped === null || stripped === undefined) {
      continue;
    }
    if (typeof stripped === "string" && ABSOLUTE_PATH_PATTERN.test(stripped)) {
      continue;
    }
    out[key] = stripped;
  }
  return out;
}

export function stripManifestForHash(manifest) {
  const clone = structuredClone(manifest);
  const harvestId = clone.harvestId;
  for (const key of MANIFEST_VOLATILE_TOP_LEVEL_KEYS) {
    delete clone[key];
  }
  if (clone.threadAutopsy && typeof clone.threadAutopsy === "object") {
    if (clone.threadAutopsy.bundlePath) {
      clone.threadAutopsy.bundlePath = normalizeToLogicalPath(clone.threadAutopsy.bundlePath, harvestId);
    }
    if (clone.threadAutopsy.seedPacketIndexPath) {
      clone.threadAutopsy.seedPacketIndexPath = normalizeToLogicalPath(
        clone.threadAutopsy.seedPacketIndexPath,
        harvestId,
      );
    }
  }
  for (const packet of clone.packets ?? []) {
    if (packet.projectFile && ABSOLUTE_PATH_PATTERN.test(packet.projectFile)) {
      packet.projectFile = normalizeToLogicalPath(packet.projectFile, harvestId);
    }
  }
  return stripVolatileValue(clone, { nested: false });
}

export function computeManifestHash(manifest) {
  return toSha256Prefixed(hashCanonicalJson(stripManifestForHash(manifest)));
}

function tierAtLeast(actual, minimum) {
  return (TIER_ORDER[actual] ?? 0) >= (TIER_ORDER[minimum] ?? 0);
}

function expandArtifactSpec(spec, runDir) {
  if (!spec.glob) {
    return [{ logicalPath: spec.logicalPath, absPath: path.join(runDir, spec.logicalPath) }];
  }
  const dir = path.dirname(spec.logicalPath);
  const pattern = path.basename(spec.logicalPath);
  const absDir = path.join(runDir, dir);
  if (!fs.existsSync(absDir)) {
    return [];
  }
  return fs
    .readdirSync(absDir)
    .filter((name) => {
      if (pattern === "*.json") {
        return name.endsWith(".json");
      }
      return name === pattern;
    })
    .map((name) => ({
      logicalPath: dir === "." ? name : `${dir}/${name}`,
      absPath: path.join(absDir, name),
    }));
}

export function buildDurablePayloadInventory({ manifest, runDir, harvestTier }) {
  const harvestId = manifest.harvestId;
  const artifacts = [];
  const effectiveTier = harvestTier ?? inferHarvestTier(manifest);

  for (const spec of DURABLE_ARTIFACT_SPECS) {
    if (!tierAtLeast(effectiveTier, spec.tierMin)) {
      continue;
    }
    let required = spec.required;
    if (spec.logicalPath === "thread-autopsy-bundle.json" && manifest.threadAutopsy) {
      required = true;
    }
    if (spec.logicalPath === "seed-packets/*.json" && manifest.threadAutopsy?.counts?.seeds > 0) {
      required = true;
    }
    const entries = expandArtifactSpec(spec, runDir);
    if (entries.length === 0) {
      if (required) {
        throw new Error(`MISSING_DURABLE_ARTIFACT:${spec.logicalPath}`);
      }
      continue;
    }
    for (const entry of entries) {
      if (!fs.existsSync(entry.absPath)) {
        if (spec.required) {
          throw new Error(`MISSING_DURABLE_ARTIFACT:${entry.logicalPath}`);
        }
        continue;
      }
      const content = fs.readFileSync(entry.absPath, "utf8");
      artifacts.push({
        logicalPath: entry.logicalPath,
        contentHash: toSha256Prefixed(hashFileContent(content)),
        retentionClass: "L_DURABLE",
        required,
      });
    }
  }

  artifacts.sort((a, b) => a.logicalPath.localeCompare(b.logicalPath));

  const inventoryBody = {
    schemaVersion: INVENTORY_SCHEMA_VERSION,
    harvestId,
    artifacts,
  };
  const payloadHash = toSha256Prefixed(hashCanonicalJson(inventoryBody));

  return { ...inventoryBody, payloadHash };
}

export function computePayloadHash(inventory) {
  const { payloadHash: _ignored, ...body } = inventory;
  return toSha256Prefixed(hashCanonicalJson(body));
}

export function inferHarvestTier(manifest) {
  const tier = manifest.threadAutopsy?.tier ?? manifest.harvestTier ?? manifest.tier;
  if (tier && TIER_ORDER[tier] !== undefined) {
    return tier;
  }
  if (manifest.missionClass?.includes("autopsy")) {
    return "T2";
  }
  return "T1";
}

export function defaultRequiredLayers({ retrievalEligible, aiCacheEligible }) {
  const layers = ["L", "SUPABASE"];
  if (retrievalEligible) {
    layers.push("RETRIEVAL_VERIFY");
  }
  if (aiCacheEligible) {
    layers.push("Z");
  }
  layers.push("GIT_POINTER");
  return [...new Set(layers)];
}

export function buildPublicationIdentity({ manifest, runDir, options = {} }) {
  const harvestTier = options.harvestTier ?? inferHarvestTier(manifest);
  const inventory = buildDurablePayloadInventory({ manifest, runDir, harvestTier });
  const manifestHash = computeManifestHash(manifest);
  const payloadHash = computePayloadHash(inventory);
  const retrievalEligible = options.retrievalEligible ?? harvestTier !== "T0";
  const aiCacheEligible = options.aiCacheEligible ?? ["T2", "T3"].includes(harvestTier);

  return {
    schemaVersion: IDENTITY_SCHEMA_VERSION,
    harvestId: manifest.harvestId,
    harvestTier,
    manifestHash,
    payloadHash,
    authoritySourceCommit: manifest.sourceCommitSha,
    requiredLayers: options.requiredLayers ?? defaultRequiredLayers({ retrievalEligible, aiCacheEligible }),
    retrievalEligible,
    aiCacheEligible,
    supersedes: options.supersedes ?? [],
  };
}

export function deriveLegacyPublicationIdentity({ manifest, runDir, options = {} }) {
  const warnings = [];
  if (!manifest.sourceCommitSha) {
    warnings.push("MISSING_AUTHORITY_SOURCE_COMMIT");
  }
  if (!manifest.threadAutopsy?.tier) {
    warnings.push("INFERRED_HARVEST_TIER");
  }
  if (manifest.projection?.hubPublishStatus === "published") {
    warnings.push("LEGACY_PUBLICATION_STATUS_PRESENT_NOT_USED_FOR_IDENTITY");
  }
  if (!options.supersedes?.length) {
    warnings.push("NO_SUPERSESSION_LINEAGE_DECLARED");
  }

  let identity;
  try {
    identity = buildPublicationIdentity({ manifest, runDir, options });
  } catch (error) {
    return {
      status: "LEGACY_IDENTITY_BLOCKED",
      warnings,
      error: error.message,
    };
  }

  return {
    status: "LEGACY_IDENTITY_DERIVED",
    warnings,
    identity,
    inventory: buildDurablePayloadInventory({
      manifest,
      runDir,
      harvestTier: identity.harvestTier,
    }),
  };
}
