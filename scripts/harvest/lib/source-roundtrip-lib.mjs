import fs from "node:fs";
import path from "node:path";

import { hashFileContent } from "./hash.mjs";
import { REPO_ROOT } from "./paths.mjs";

/**
 * Parse rawRef like `artifacts/.../file.md#anchor`
 */
export function parseRawRef(rawRef) {
  const hashIdx = rawRef.indexOf("#");
  if (hashIdx === -1) {
    return { fileRel: rawRef, anchor: null };
  }
  return {
    fileRel: rawRef.slice(0, hashIdx),
    anchor: rawRef.slice(hashIdx + 1),
  };
}

function slugifyAnchor(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Extract section body for a heading anchor from markdown.
 * @param {string} content
 * @param {string} anchor
 */
export function extractSectionByAnchor(content, anchor) {
  const lines = content.split("\n");
  const anchorNorm = anchor.toLowerCase();
  let start = -1;
  let level = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^(#{2,6})\s+(.+)$/);
    if (!m) continue;
    const title = m[2].trim();
    const slug = slugifyAnchor(title);
    const idMatch = title.match(/^(EVT|HP|OUT|IM|SR|TW|DUP|OF|OG)-\d+/i);
    const idSlug = idMatch ? idMatch[0].toLowerCase() : null;
    if (slug === anchorNorm || idSlug === anchorNorm || title.toLowerCase().includes(anchorNorm)) {
      start = i;
      level = m[1].length;
      break;
    }
  }

  if (start === -1) return null;

  const chunk = [lines[start]];
  for (let i = start + 1; i < lines.length; i++) {
    const hm = lines[i].match(/^(#{2,6})\s+/);
    if (hm && hm[1].length <= level) break;
    chunk.push(lines[i]);
  }
  return chunk.join("\n").trimEnd();
}

/**
 * @param {{ rawRef: string, sourceExcerptHash: string, repoRoot?: string }} observation
 */
export function verifySourceRoundTrip(observation, repoRoot = REPO_ROOT) {
  const rawRef = observation.rawRef ?? observation.source?.rawRef;
  const sourceExcerptHash =
    observation.sourceExcerptHash ?? observation.provenance?.sourceExcerptHash;
  const { fileRel, anchor } = parseRawRef(rawRef);
  const abs = path.join(repoRoot, fileRel);
  if (!fs.existsSync(abs)) {
    return { ok: false, reason: `missing file: ${fileRel}` };
  }
  const content = fs.readFileSync(abs, "utf8");
  if (!anchor) {
    const hash = hashFileContent(content);
    return {
      ok: hash === sourceExcerptHash,
      reason: hash === sourceExcerptHash ? null : "full-file hash mismatch",
    };
  }
  const excerpt = extractSectionByAnchor(content, anchor);
  if (!excerpt) {
    return { ok: false, reason: `anchor not found: ${anchor}` };
  }
  const hash = hashFileContent(excerpt);
  return {
    ok: hash === sourceExcerptHash,
    reason: hash === sourceExcerptHash ? null : "excerpt hash mismatch",
  };
}
