import path from "node:path";

import { validateGraphPointerCompact } from "./graph-extraction-staging-lib.mjs";
import { validateGitHarvestRetention } from "./harvest-git-retention-lib.mjs";
import { validateMetadataChurn } from "./harvest-metadata-churn-lib.mjs";
import {
  buildPrDiffContentPairs,
  extractHarvestIdFromPath,
  governedChanges,
  isRealHarvestRunId,
  listChangedFiles,
  resolveDiffRefs,
} from "./harvest-pr-diff-lib.mjs";

const FORBIDDEN_NEW_BASENAMES = new Set([
  "thread-autopsy-bundle.json",
  "thread-event-inventory.json",
  "graph-extraction.json",
  "operational-publication-receipt.json",
  "phase-b-receipt.json",
  "phase-c-receipt.json",
  "lock.json",
]);

const ABSOLUTE_PATH_PATTERNS = [
  /^[A-Za-z]:\\/,
  /^\\\\/,
  /^\/mnt\/[a-z]\//i,
  /^\/home\//,
  /^\/Users\//,
];

function isAddedOrModified(status) {
  return status === "A" || status === "M" || status.startsWith("R");
}

function scanAddedLinesForAbsolutePaths(content) {
  const hits = [];
  if (!content) return hits;
  for (const line of content.split("\n")) {
    if (!line.startsWith("+") || line.startsWith("+++")) continue;
    const body = line.slice(1);
    for (const pattern of ABSOLUTE_PATH_PATTERNS) {
      if (pattern.test(body)) {
        hits.push(body.trim().slice(0, 120));
        break;
      }
    }
  }
  return hits;
}

function tryParseJson(content) {
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export function validatePrGovernance({
  repoRoot,
  baseRef = null,
  headRef = "HEAD",
}) {
  const refs = resolveDiffRefs({ repoRoot, baseRef, headRef });
  const changes = listChangedFiles({ repoRoot, ...refs });
  const governed = governedChanges(changes);
  const failures = [];
  const warnings = [];
  const harvestIds = new Set();

  for (const change of governed) {
    const rel = change.path;
    if (!isAddedOrModified(change.status)) continue;

    const baseName = path.basename(rel);
    if (FORBIDDEN_NEW_BASENAMES.has(baseName)) {
      failures.push(`PR_DIFF_FORBIDDEN_PAYLOAD:${rel}`);
    }
    if (rel.includes("/seed-packets/") || rel.includes("/compact-records/")) {
      failures.push(`PR_DIFF_FORBIDDEN_PAYLOAD_DIR:${rel}`);
    }

    const harvestId = extractHarvestIdFromPath(rel);
    if (harvestId) harvestIds.add(harvestId);

    if (baseName === "graph-extraction-pointer-v1.json" || baseName.endsWith("-pointer-v1.json")) {
      const content = buildPrDiffContentPairs({
        repoRoot,
        baseRef: refs.baseRef,
        headRef: refs.headRef,
        files: [rel],
      }).afterContent[rel];
      const pointer = tryParseJson(content);
      if (pointer) {
        const check = validateGraphPointerCompact(pointer);
        if (!check.ok) {
          for (const f of check.failures) failures.push(`PR_DIFF_GRAPH_BOUNDARY:${rel}:${f}`);
        }
      }
    }
  }

  const jsonFiles = governed
    .filter((c) => isAddedOrModified(c.status) && c.path.endsWith(".json"))
    .map((c) => c.path);

  if (jsonFiles.length > 0) {
    const { beforeContent, afterContent } = buildPrDiffContentPairs({
      repoRoot,
      baseRef: refs.baseRef,
      headRef: refs.headRef,
      files: jsonFiles,
    });
    const churn = validateMetadataChurn({
      repoRoot,
      files: jsonFiles,
      beforeContent,
      afterContent,
    });
    if (!churn.ok) {
      failures.push(...churn.failures.map((f) => `PR_DIFF_METADATA:${f}`));
    }
  }

  for (const harvestId of harvestIds) {
    if (!isRealHarvestRunId(harvestId)) {
      warnings.push(`PR_DIFF_RETENTION_SKIPPED:mission_run_dir:${harvestId}`);
      continue;
    }
    const mode = changes.some(
      (c) =>
        c.path.startsWith(`artifacts/agent-runs/${harvestId}/`) &&
        (c.status === "A" || c.status === "M"),
    )
      ? "new"
      : "historical";
    const retention = validateGitHarvestRetention({
      repoRoot,
      harvestId,
      mode: mode === "new" ? "new" : "historical",
      stage: "pre-commit",
    });
    if (!retention.ok) {
      for (const f of retention.failures ?? []) {
        failures.push(`PR_DIFF_RETENTION:${harvestId}:${f}`);
      }
    }
  }

  return {
    ok: failures.length === 0,
    verdict: failures.length === 0 ? "PR_GOVERNANCE_PASS" : "PR_GOVERNANCE_BLOCKED",
    baseRef: refs.baseRef,
    headRef: refs.headRef,
    governedChangeCount: governed.length,
    failures,
    warnings,
  };
}
