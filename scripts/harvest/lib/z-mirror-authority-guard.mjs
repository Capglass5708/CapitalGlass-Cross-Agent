import fs from "node:fs";
import path from "node:path";

import { hashFileContent } from "./hash.mjs";

const LANE_C_MARKER = /Lane C/i;
const GIT_PROTOCOL_REL_PREFIX = "harvest/protocol/";

/**
 * Count authority markers used to detect protocol regression (Lane C sections).
 */
export function countProtocolAuthorityMarkers(content) {
  const text = String(content ?? "");
  return {
    laneCSections: (text.match(/### Lane C/g) ?? []).length,
    laneCMentions: (text.match(LANE_C_MARKER) ?? []).length,
    bytes: Buffer.byteLength(text, "utf8"),
  };
}

/**
 * Decide whether a mirror copy is allowed without regressing Git-owned protocol authority.
 */
export function evaluateMirrorFileDecision({
  sourcePath,
  destPath,
  sourceLabel,
  direction = "source-to-dest",
}) {
  const relDest = destPath.replace(/\\/g, "/");
  const isGitProtocolDest = relDest.includes(GIT_PROTOCOL_REL_PREFIX);
  const decision = {
    sourcePath,
    destPath,
    sourceLabel,
    direction,
    action: "allow",
    reason: "no-guard-triggered",
    sourceHash: null,
    destHash: null,
    sourceMarkers: null,
    destMarkers: null,
  };

  if (!fs.existsSync(sourcePath)) {
    decision.action = "block";
    decision.reason = "BLOCK_Z_SOURCE_INCOMPLETE";
    decision.errorCode = "BLOCK_Z_SOURCE_INCOMPLETE";
    return decision;
  }

  const sourceContent = fs.readFileSync(sourcePath, "utf8");
  decision.sourceHash = hashFileContent(sourceContent);
  decision.sourceMarkers = countProtocolAuthorityMarkers(sourceContent);

  if (!fs.existsSync(destPath)) {
    decision.action = "allow";
    decision.reason = "dest-missing-create";
    return decision;
  }

  const destContent = fs.readFileSync(destPath, "utf8");
  decision.destHash = hashFileContent(destContent);
  decision.destMarkers = countProtocolAuthorityMarkers(destContent);

  if (sourceContent === destContent) {
    decision.action = "noop";
    decision.reason = "identical-content";
    return decision;
  }

  if (!isGitProtocolDest) {
    decision.action = "allow";
    decision.reason = "non-git-protocol-dest";
    return decision;
  }

  if (
    (decision.destMarkers.laneCSections > 0 &&
      decision.sourceMarkers.laneCSections < decision.destMarkers.laneCSections) ||
    (decision.destMarkers.laneCMentions > 0 &&
      decision.sourceMarkers.laneCMentions < decision.destMarkers.laneCMentions &&
      decision.sourceMarkers.laneCSections < decision.destMarkers.laneCSections)
  ) {
    decision.action = "block";
    decision.reason = "BLOCK_GIT_PROTOCOL_OVERWRITE_RISK";
    decision.errorCode = "BLOCK_GIT_PROTOCOL_OVERWRITE_RISK";
    return decision;
  }

  if (direction === "mirror-to-git") {
    decision.action = "block";
    decision.reason = "BLOCK_AUTHORITY_UNAVAILABLE";
    decision.errorCode = "BLOCK_AUTHORITY_UNAVAILABLE";
    return decision;
  }

  decision.action = "allow";
  decision.reason = "git-protocol-safe-update";
  return decision;
}

export function collectGitProtocolHashes(repoRoot) {
  const protocolDir = path.join(repoRoot, "harvest/protocol");
  const files = {};
  if (!fs.existsSync(protocolDir)) return files;
  for (const name of fs.readdirSync(protocolDir).filter((f) => f.endsWith(".md"))) {
    const filePath = path.join(protocolDir, name);
    const content = fs.readFileSync(filePath, "utf8");
    files[name] = {
      hash: hashFileContent(content),
      markers: countProtocolAuthorityMarkers(content),
    };
  }
  return files;
}
