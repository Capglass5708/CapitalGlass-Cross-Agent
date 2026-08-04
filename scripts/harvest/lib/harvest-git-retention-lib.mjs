import fs from "node:fs";
import path from "node:path";

export const TARGET_VERDICT = "HARVEST_GIT_RETENTION_PASS";

export const GIT_RETENTION_VERDICTS = {
  PASS: "GIT_RETENTION_PASS",
  WARNING_HISTORICAL: "GIT_RETENTION_WARNING_HISTORICAL",
  BLOCKED_FILE_BUDGET: "BLOCKED_GIT_FILE_BUDGET",
  BLOCKED_PAYLOAD_DUPLICATION: "BLOCKED_GIT_PAYLOAD_DUPLICATION",
  BLOCKED_RUNTIME_ARTIFACT: "BLOCKED_GIT_RUNTIME_ARTIFACT",
  BLOCKED_LOCAL_PATH: "BLOCKED_GIT_LOCAL_PATH",
  BLOCKED_SECRET_PATTERN: "BLOCKED_GIT_SECRET_PATTERN",
  BLOCKED_POINTER_TOO_LARGE: "BLOCKED_GIT_POINTER_TOO_LARGE",
  BLOCKED_IDENTITY_MISMATCH: "BLOCKED_GIT_IDENTITY_MISMATCH",
};

const MANIFEST_FILENAME = "harvest-manifest-v1.json";
const GIT_POINTER_FILENAME = "harvest-publication-pointer-v1.json";
const SUMMARY_FILENAME = "HARVEST_SUMMARY.md";
const GOVERNANCE_RECEIPT_PATTERN = /^harvest-governance-receipt-v1\.json$/;

const REQUIRED_NEW_HARVEST_FILES = new Set([MANIFEST_FILENAME, GIT_POINTER_FILENAME]);
const OPTIONAL_NEW_HARVEST_FILES = new Set([SUMMARY_FILENAME]);

const FORBIDDEN_FILENAMES = new Set([
  "thread-autopsy-bundle.json",
  "thread-event-inventory.json",
  "phase-b-receipt.json",
  "phase-c-receipt.json",
  "lock.json",
  "stale-lock-recovery-receipt.json",
]);

const FORBIDDEN_DIR_NAMES = new Set([
  "seed-packets",
  "seed_packets",
  "qa-index",
  "runtime",
  "locks",
]);

const FORBIDDEN_FILENAME_PATTERNS = [
  /thread-autopsy/i,
  /seed-packet/i,
  /compact-record/i,
  /transcript/i,
  /phase-b-receipt/i,
  /phase-c-receipt/i,
  /\.lock$/i,
];

const SECRET_PATTERNS = [
  /service[_-]?role[_-]?key/i,
  /supabase[_-]?service/i,
  /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]+\./,
  /sk-[a-zA-Z0-9]{20,}/,
  /-----BEGIN (RSA |EC )?PRIVATE KEY-----/,
];

const ABSOLUTE_PATH_PATTERNS = [
  /^[A-Za-z]:\\/,
  /^\\\\/,
  /^\/mnt\/[a-z]\//i,
  /^\/home\//,
  /^\/Users\//,
];

const MAX_POINTER_BYTES = 16_384;
const MAX_SUMMARY_BYTES = 32_768;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function walkStrings(value, hits = []) {
  if (typeof value === "string") {
    hits.push(value);
    return hits;
  }
  if (value === null || typeof value !== "object") return hits;
  if (Array.isArray(value)) {
    for (const item of value) walkStrings(item, hits);
    return hits;
  }
  for (const child of Object.values(value)) walkStrings(child, hits);
  return hits;
}

function harvestRunDir(repoRoot, harvestId) {
  return path.join(repoRoot, "artifacts/agent-runs", harvestId);
}

function isHistoricalLegacyTree(runDir) {
  if (!fs.existsSync(runDir)) return false;
  const entries = fs.readdirSync(runDir, { withFileTypes: true });
  for (const entry of entries) {
    if (FORBIDDEN_FILENAMES.has(entry.name)) return true;
    if (FORBIDDEN_DIR_NAMES.has(entry.name)) return true;
    for (const pattern of FORBIDDEN_FILENAME_PATTERNS) {
      if (pattern.test(entry.name)) return true;
    }
  }
  return false;
}

export function validateGitHarvestRetention({
  repoRoot,
  harvestId,
  manifest = null,
  pointer = null,
  mode = "new",
  stage = "full",
}) {
  const failures = [];
  const warnings = [];
  const runDir = harvestRunDir(repoRoot, harvestId);

  if (!fs.existsSync(runDir) && mode === "new" && stage !== "pre-commit") {
    failures.push("GIT_RETENTION:run_dir_missing");
    return {
      ok: false,
      verdict: GIT_RETENTION_VERDICTS.BLOCKED_FILE_BUDGET,
      failures,
      warnings,
    };
  }

  if (!fs.existsSync(runDir) && stage === "pre-commit") {
    if (pointer) {
      // pointer-only validation allowed before run dir exists
    } else {
      return { ok: true, verdict: GIT_RETENTION_VERDICTS.PASS, failures, warnings };
    }
  }

  if (fs.existsSync(runDir) && isHistoricalLegacyTree(runDir) && mode !== "new") {
    warnings.push("GIT_RETENTION_WARNING_HISTORICAL:legacy_tree_detected");
  }

  if (fs.existsSync(runDir)) {
    const entries = fs.readdirSync(runDir, { withFileTypes: true });
    const fileNames = entries.filter((e) => e.isFile()).map((e) => e.name);
    const dirNames = entries.filter((e) => e.isDirectory()).map((e) => e.name);

    for (const dirName of dirNames) {
      failures.push(`BLOCKED_GIT_RUNTIME_ARTIFACT:directory:${dirName}`);
    }

    if (mode === "new") {
      const allowed = new Set([...REQUIRED_NEW_HARVEST_FILES, ...OPTIONAL_NEW_HARVEST_FILES]);
      let governanceReceiptCount = 0;
      for (const name of fileNames) {
        if (GOVERNANCE_RECEIPT_PATTERN.test(name)) {
          governanceReceiptCount += 1;
          continue;
        }
        if (!allowed.has(name)) {
          failures.push(`BLOCKED_GIT_FILE_BUDGET:unexpected_file:${name}`);
        }
      }
      if (governanceReceiptCount > 1) {
        failures.push("BLOCKED_GIT_FILE_BUDGET:multiple_governance_receipts");
      }
      if (stage !== "pre-commit") {
        for (const required of REQUIRED_NEW_HARVEST_FILES) {
          if (!fileNames.includes(required)) {
            failures.push(`BLOCKED_GIT_FILE_BUDGET:missing_required:${required}`);
          }
        }
      } else {
        for (const name of fileNames) {
          if (!allowed.has(name) && !GOVERNANCE_RECEIPT_PATTERN.test(name)) {
            failures.push(`BLOCKED_GIT_FILE_BUDGET:unexpected_file:${name}`);
          }
        }
      }
    }

    for (const name of fileNames) {
      if (FORBIDDEN_FILENAMES.has(name)) {
        failures.push(`BLOCKED_GIT_RUNTIME_ARTIFACT:${name}`);
      }
      for (const pattern of FORBIDDEN_FILENAME_PATTERNS) {
        if (pattern.test(name)) {
          failures.push(`BLOCKED_GIT_PAYLOAD_DUPLICATION:${name}`);
        }
      }
    }
  }

  if (pointer) {
    const serialized = JSON.stringify(pointer);
    if (Buffer.byteLength(serialized, "utf8") > MAX_POINTER_BYTES) {
      failures.push("BLOCKED_GIT_POINTER_TOO_LARGE");
    }
    const forbiddenEmbedded = [
      "threadAutopsyBundle",
      "threadEventInventory",
      "seedPackets",
      "autopsy",
      "compactRecords",
      "evidenceRecords",
      "commandRecords",
      "transcript",
      "snapshotBody",
      "snapshot_body",
    ];
    for (const key of forbiddenEmbedded) {
      if (pointer[key] !== undefined) {
        failures.push(`BLOCKED_GIT_PAYLOAD_DUPLICATION:pointer_field:${key}`);
      }
    }
    for (const str of walkStrings(pointer)) {
      for (const pattern of ABSOLUTE_PATH_PATTERNS) {
        if (pattern.test(str)) {
          failures.push(`BLOCKED_GIT_LOCAL_PATH:${str.slice(0, 80)}`);
        }
      }
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.test(str)) {
          failures.push(`BLOCKED_GIT_SECRET_PATTERN:${pattern}`);
        }
      }
    }
  }

  if (manifest && pointer) {
    if (manifest.payloadHash && pointer.payloadHash && manifest.payloadHash !== pointer.payloadHash) {
      failures.push("BLOCKED_GIT_IDENTITY_MISMATCH:payload_hash");
    }
    if (manifest.manifestHash && pointer.manifestHash && manifest.manifestHash !== pointer.manifestHash) {
      failures.push("BLOCKED_GIT_IDENTITY_MISMATCH:manifest_hash");
    }
  }

  const summaryPath = path.join(runDir, SUMMARY_FILENAME);
  if (fs.existsSync(summaryPath)) {
    const size = fs.statSync(summaryPath).size;
    if (size > MAX_SUMMARY_BYTES) {
      failures.push("BLOCKED_GIT_FILE_BUDGET:summary_too_large");
    }
  }

  if (failures.length > 0) {
    return {
      ok: false,
      verdict: failures[0].startsWith("BLOCKED_GIT_POINTER")
        ? GIT_RETENTION_VERDICTS.BLOCKED_POINTER_TOO_LARGE
        : failures[0].includes("SECRET")
          ? GIT_RETENTION_VERDICTS.BLOCKED_SECRET_PATTERN
          : failures[0].includes("LOCAL_PATH")
            ? GIT_RETENTION_VERDICTS.BLOCKED_LOCAL_PATH
            : failures[0].includes("IDENTITY")
              ? GIT_RETENTION_VERDICTS.BLOCKED_IDENTITY_MISMATCH
              : failures[0].includes("PAYLOAD")
                ? GIT_RETENTION_VERDICTS.BLOCKED_PAYLOAD_DUPLICATION
                : failures[0].includes("RUNTIME")
                  ? GIT_RETENTION_VERDICTS.BLOCKED_RUNTIME_ARTIFACT
                  : GIT_RETENTION_VERDICTS.BLOCKED_FILE_BUDGET,
      failures,
      warnings,
    };
  }

  return {
    ok: true,
    verdict:
      warnings.length > 0
        ? GIT_RETENTION_VERDICTS.WARNING_HISTORICAL
        : GIT_RETENTION_VERDICTS.PASS,
    failures,
    warnings,
  };
}
