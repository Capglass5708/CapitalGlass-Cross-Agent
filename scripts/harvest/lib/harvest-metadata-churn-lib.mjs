import fs from "node:fs";
import path from "node:path";

export const METADATA_CHURN_VERDICTS = {
  PASS: "METADATA_RETENTION_PASS",
  BLOCKED_TIMESTAMP_ONLY: "BLOCKED_TIMESTAMP_ONLY_COMMIT",
  BLOCKED_SELF_PIN: "BLOCKED_SELF_PIN_COMMIT_LOOP",
  BLOCKED_RUNTIME_RECEIPT: "BLOCKED_RUNTIME_RECEIPT_IN_GIT",
  BLOCKED_INDEX_RECEIPT: "BLOCKED_INDEX_PUBLICATION_RECEIPT_IN_GIT",
};

const RUNTIME_RECEIPT_PATTERNS = [
  /^operational-publication-receipt\.json$/,
  /^phase-b-receipt\.json$/,
  /^phase-c-receipt\.json$/,
  /^duplication-preflight-receipt\.json$/,
  /^index-publication-receipt.*\.json$/,
  /^latest\.json$/,
];

const TIMESTAMP_ONLY_KEYS = new Set([
  "generatedAt",
  "updatedAt",
  "operationalAt",
  "checkedAt",
  "compiledAt",
  "publishedAt",
  "verifiedAt",
  "durationMs",
  "runId",
]);

const SELF_PIN_KEYS = new Set([
  "sourceCommitSha",
  "receiptCommit",
  "pinnedCommit",
  "manifestShaAtPublish",
  "indexSourceSha",
]);

function stripKeys(obj, keys) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((item) => stripKeys(item, keys));
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (keys.has(k)) continue;
    out[k] = stripKeys(v, keys);
  }
  return out;
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Validate staged or proposed Git changes for metadata-only churn.
 */
export function validateMetadataChurn({
  files = [],
  beforeContent = {},
  afterContent = {},
}) {
  const failures = [];
  const warnings = [];

  for (const rel of files) {
    const base = path.basename(rel);
    for (const pattern of RUNTIME_RECEIPT_PATTERNS) {
      if (pattern.test(base)) {
        failures.push(`${METADATA_CHURN_VERDICTS.BLOCKED_RUNTIME_RECEIPT}:${rel}`);
      }
    }
    if (rel.includes("index-publication-receipt")) {
      failures.push(`${METADATA_CHURN_VERDICTS.BLOCKED_INDEX_RECEIPT}:${rel}`);
    }
  }

  for (const rel of files) {
    const before = beforeContent[rel];
    const after = afterContent[rel];
    if (!before || !after) continue;

    let beforeObj;
    let afterObj;
    try {
      beforeObj = typeof before === "string" ? JSON.parse(before) : before;
      afterObj = typeof after === "string" ? JSON.parse(after) : after;
    } catch {
      continue;
    }

    const withoutTimestamps = deepEqual(
      stripKeys(beforeObj, TIMESTAMP_ONLY_KEYS),
      stripKeys(afterObj, TIMESTAMP_ONLY_KEYS),
    );
    const withTimestamps = deepEqual(beforeObj, afterObj);

    if (!withTimestamps && withoutTimestamps) {
      failures.push(`${METADATA_CHURN_VERDICTS.BLOCKED_TIMESTAMP_ONLY}:${rel}`);
    }

    const withoutPins = deepEqual(
      stripKeys(beforeObj, new Set([...TIMESTAMP_ONLY_KEYS, ...SELF_PIN_KEYS])),
      stripKeys(afterObj, new Set([...TIMESTAMP_ONLY_KEYS, ...SELF_PIN_KEYS])),
    );
    if (!withTimestamps && withoutPins && !withoutTimestamps) {
      failures.push(`${METADATA_CHURN_VERDICTS.BLOCKED_SELF_PIN}:${rel}`);
    }
  }

  const verdict =
    failures.length === 0 ? METADATA_CHURN_VERDICTS.PASS : failures[0].split(":")[0];

  return {
    ok: failures.length === 0,
    verdict,
    failures,
    warnings,
  };
}

/**
 * Scan harvest run dir for forbidden runtime receipts tracked for Git commit.
 */
export function scanHarvestRunForRuntimeReceipts(runDir) {
  const blocked = [];
  if (!fs.existsSync(runDir)) return blocked;
  for (const name of fs.readdirSync(runDir)) {
    for (const pattern of RUNTIME_RECEIPT_PATTERNS) {
      if (pattern.test(name)) {
        blocked.push(name);
      }
    }
  }
  return blocked;
}
