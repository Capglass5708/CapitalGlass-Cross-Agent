import fs from "node:fs";
import path from "node:path";

import { stripHashPrefix } from "./l-durable-bundle-lib.mjs";

export const Z_CACHE_RECEIPT_SCHEMA = "harvest-z-cache-publication-receipt-v1@1.0.0";

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function resolveZCacheRoot(env = process.env) {
  const candidates = [
    env.CG_AI_CACHE_AUTHORITY_ROOT?.trim(),
    env.AI_CACHE_AUTHORITY_ROOT?.trim(),
    "/mnt/z/Capital-Glass-Intelligence-Hub/AI-Cache-Authority",
    "/mnt/z/Capital-Glass-Intelligence-Hub",
  ].filter(Boolean);
  for (const root of candidates) {
    if (fs.existsSync(root)) {
      return root;
    }
  }
  return candidates[0] ?? "/mnt/z/Capital-Glass-Intelligence-Hub/AI-Cache-Authority";
}

function zHarvestCacheDir(zCacheRoot, harvestId, payloadHash) {
  const hashDir = stripHashPrefix(payloadHash);
  return path.join(zCacheRoot, "harvest-cache", harvestId, hashDir);
}

function readExistingReceipt(cacheDir) {
  const receiptPath = path.join(cacheDir, "z-cache-publication-receipt.json");
  if (!fs.existsSync(receiptPath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(receiptPath, "utf8"));
}

/**
 * Publish Z: cache products derived from L: durable identity only.
 * Does not read Git harvest directories or payload bodies.
 */
export function publishZCacheFromL(context, options = {}) {
  const { retrievalEligible, aiCacheEligible, harvestId, payloadHash, manifestHash, authoritySourceCommit, durablePath } =
    context;

  if (!retrievalEligible && !aiCacheEligible) {
    return {
      ok: true,
      status: "NOT_REQUIRED",
      verdict: "NOT_REQUIRED",
      sourcePayloadHash: payloadHash,
    };
  }

  const zCacheRoot = options.zCacheRoot ?? resolveZCacheRoot(options.env);
  const cacheDir = zHarvestCacheDir(zCacheRoot, harvestId, payloadHash);
  const existing = readExistingReceipt(cacheDir);

  if (
    existing &&
    existing.payloadHash === payloadHash &&
    existing.manifestHash === manifestHash &&
    existing.verdict === "Z_CACHE_PUBLISH_PASS"
  ) {
    return {
      ok: true,
      status: "NOOP_CURRENT",
      verdict: "NOOP_CURRENT",
      sourcePayloadHash: payloadHash,
      cacheDir,
      receiptPath: path.join(cacheDir, "z-cache-publication-receipt.json"),
    };
  }

  if (options.simulateFailure) {
    return {
      ok: false,
      status: "FAILED_REQUIRED",
      verdict: "Z_CACHE_PUBLISH_FAIL",
      error: options.simulateFailure,
      sourcePayloadHash: payloadHash,
    };
  }

  const receipt = {
    schemaVersion: Z_CACHE_RECEIPT_SCHEMA,
    harvestId,
    manifestHash,
    payloadHash,
    authoritySourceCommit,
    lDurablePath: durablePath,
    retrievalEligible,
    aiCacheEligible,
    verdict: "Z_CACHE_PUBLISH_PASS",
    generatedAt: new Date().toISOString(),
  };

  writeJson(path.join(cacheDir, "z-cache-publication-receipt.json"), receipt);
  writeJson(path.join(cacheDir, "z-cache-identity.json"), {
    harvestId,
    manifestHash,
    payloadHash,
    authoritySourceCommit,
    durablePath,
    retrievalEligible,
    aiCacheEligible,
  });

  return {
    ok: true,
    status: "CURRENT",
    verdict: "Z_CACHE_PUBLISH_PASS",
    sourcePayloadHash: payloadHash,
    cacheDir,
    receiptPath: path.join(cacheDir, "z-cache-publication-receipt.json"),
  };
}
