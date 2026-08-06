import fs from "node:fs";
import path from "node:path";

import { hashFileContent } from "./hash.mjs";
import { collectGitProtocolHashes } from "./z-mirror-authority-guard.mjs";

function readJsonSafe(p) {
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Compare before/after publication surfaces for authority regression.
 */
export function verifyPostPublicationIntegrity({
  repoRoot,
  hubRoot,
  before,
  harvestId,
  expectedSeedIds = [],
}) {
  const after = {
    gitProtocol: collectGitProtocolHashes(repoRoot),
    threadAutopsyIndex: readJsonSafe(
      path.join(hubRoot, "00-master-index/BY-KIND/thread-autopsy-index.json"),
    ),
    lProtocol: null,
  };

  const lProtocolPath = path.join(hubRoot, "../02-catalog/Harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md");
  const altL = "/mnt/l/02-catalog/Harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md";
  const lPath = fs.existsSync(altL) ? altL : lProtocolPath;
  if (fs.existsSync(lPath)) {
    after.lProtocol = { hash: hashFileContent(fs.readFileSync(lPath, "utf8")) };
  }

  const regressions = [];
  const additions = [];

  for (const [file, beforeEntry] of Object.entries(before.gitProtocol ?? {})) {
    const afterEntry = after.gitProtocol[file];
    if (!afterEntry) {
      regressions.push({ kind: "git-protocol-deleted", file });
      continue;
    }
    if (afterEntry.markers.laneCMentions < beforeEntry.markers.laneCMentions) {
      regressions.push({
        kind: "lane-c-regression",
        file,
        before: beforeEntry.markers,
        after: afterEntry.markers,
      });
    }
    if (afterEntry.hash !== beforeEntry.hash && afterEntry.markers.laneCMentions >= beforeEntry.markers.laneCMentions) {
      additions.push({ kind: "git-protocol-updated", file });
    }
  }

  const harvests = after.threadAutopsyIndex?.harvests ?? [];
  const found = harvests.some((h) => h.harvestId === harvestId);
  if (!found) regressions.push({ kind: "missing-thread-autopsy-index-entry", harvestId });

  for (const seedId of expectedSeedIds) {
    const catalogPath = path.join(
      hubRoot,
      "02-catalog/knowledge-objects/cross-agent-harvest",
      `${seedId}.json`,
    );
    if (!fs.existsSync(catalogPath)) {
      regressions.push({ kind: "missing-seed-catalog-stub", seedId });
    } else {
      additions.push({ kind: "seed-catalog-stub", seedId });
    }
  }

  let verdict = "INTEGRITY_PASS";
  if (regressions.some((r) => r.kind.includes("regression") || r.kind.includes("deleted"))) {
    verdict = "INTEGRITY_FAIL";
  } else if (regressions.length > 0) {
    verdict = "INTEGRITY_WARN";
  }

  return {
    schemaVersion: "harvest-post-publication-integrity-v1@1.0.0",
    harvestId,
    generatedAt: new Date().toISOString(),
    before,
    after: {
      gitProtocol: after.gitProtocol,
      threadAutopsyHarvestCount: harvests.length,
      lProtocolHash: after.lProtocol?.hash ?? null,
    },
    regressions,
    additions,
    verdict,
  };
}
