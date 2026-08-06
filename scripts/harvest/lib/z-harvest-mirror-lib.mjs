import fs from "node:fs";
import path from "node:path";

import { resolveDataExtractionRoot } from "../../index/lib/resolve-repo-roots.mjs";
import { hashFileContent } from "./hash.mjs";

export const Z_HARVEST_MIRROR_RECEIPT_SCHEMA = "harvest-z-mirror-sync-receipt-v1@1.0.0";

/** Canonical repo sources → Z:\Capital-Glass-Dev\Harvest layout */
export const Z_HARVEST_PROTOCOL_SOURCES = [
  {
    source: "docs/runbooks/chat-thread-closeout-autopsy-harvest-v1.md",
    destinations: [
      "protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md",
      "protocol/chat-thread-closeout-autopsy-harvest-v1.md",
    ],
  },
  {
    source: "docs/runbooks/harvest-record-validate-sync.md",
    destinations: ["protocol/HARVEST-INGESTION-RUNBOOK-v1.md"],
  },
  {
    source: "docs/protocols/chat-thread-closeout-autopsy-harvest-chatgpt-v1.md",
    destinations: [
      "protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md",
      "protocol/chat-thread-closeout-autopsy-harvest-chatgpt-v1.md",
    ],
  },
  {
    source: "docs/harvest-z-mirror/PROMPT-EXTRACTION-AND-PROMOTION-v1.md",
    destinations: ["protocol/PROMPT-EXTRACTION-AND-PROMOTION-v1.md"],
  },
];

/** External repo sources — canonical authority lives outside Cross-Agent. */
export const Z_HARVEST_EXTERNAL_PROTOCOL_SOURCES = [
  {
    authorityRepo: "Data-Extraction",
    resolveRepoRoot: (crossAgentRoot) => resolveDataExtractionRoot(crossAgentRoot),
    source: "docs/platform/CURSOR_HARVEST_INGEST_CLOSEOUT_WAVE_SDLC_V1.md",
    destinations: ["protocol/CURSOR_HARVEST_INGEST_CLOSEOUT_WAVE_SDLC_V1.md"],
  },
];

const README_TEMPLATE = `# Capital Glass Harvest — Z: mirror authority

Git authority: \`CapitalGlass-Cross-Agent/harvest/\`  
Windows operator path: \`Z:\\\\Capital-Glass-Dev\\\\Harvest\`

## Cursor end-of-chat

At thread close, @ **one** protocol file (not the whole folder):

\`\`\`
Z:\\\\Capital-Glass-Dev\\\\Harvest\\\\protocol\\\\CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md
\`\`\`

## Protocol index

| File | Purpose |
| --- | --- |
| \`protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md\` | Thread closeout autopsy (Cursor) |
| \`protocol/HARVEST-INGESTION-RUNBOOK-v1.md\` | Record → validate → sync → publication |
| \`protocol/PROMPT-EXTRACTION-AND-PROMOTION-v1.md\` | Prompt candidate extraction + Supabase seed |
| \`protocol/chat-thread-closeout-autopsy-harvest-chatgpt-v1.md\` | ChatGPT draft lane |
| \`protocol/CURSOR_HARVEST_INGEST_CLOSEOUT_WAVE_SDLC_V1.md\` | Gated wave SDLC (canonical: Data-Extraction) |

## Sync

From WSL (CapitalGlass-Cross-Agent):

\`\`\`bash
npm run harvest:sync-z-mirror
\`\`\`

Updates this tree and \`Z:\\\\Capital-Glass-Dev\\\\Harvest\` when the Z: drive is mounted.

**Do not hand-edit mirrored protocol files** — edit git sources under \`docs/runbooks/\`, \`docs/harvest-z-mirror/\`, or \`Data-Extraction/docs/platform/\` (wave SDLC), then re-sync.

Generated: {{generatedAt}}
Source commit: {{sourceCommitSha}}
`;

function writeFileEnsuringDir(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function copyIfChanged(src, dest) {
  const next = fs.readFileSync(src, "utf8");
  if (fs.existsSync(dest)) {
    const prior = fs.readFileSync(dest, "utf8");
    if (prior === next) {
      return { dest, action: "unchanged", hash: hashFileContent(next) };
    }
  }
  writeFileEnsuringDir(dest, next);
  return { dest, action: "updated", hash: hashFileContent(next) };
}

export function resolveZHarvestRoot(env = process.env) {
  const candidates = [
    env.CG_Z_HARVEST_ROOT?.trim(),
    env.Z_HARVEST_ROOT?.trim(),
    "/mnt/z/Capital-Glass-Dev/Harvest",
    "Z:/Capital-Glass-Dev/Harvest",
  ].filter(Boolean);
  for (const root of candidates) {
    if (fs.existsSync(root)) return root;
  }
  return null;
}

/**
 * Sync protocol docs to repo harvest/ mirror and optional Z: root.
 */
export function syncZHarvestMirror({
  repoRoot,
  zHarvestRoot = null,
  env = process.env,
  sourceCommitSha = "unknown",
} = {}) {
  const repoMirrorRoot = path.join(repoRoot, "harvest");
  const zRoot = zHarvestRoot ?? resolveZHarvestRoot(env);
  const files = [];
  const errors = [];

  const protocolSourceGroups = [
    ...Z_HARVEST_PROTOCOL_SOURCES.map((entry) => ({
      ...entry,
      authorityRepo: "CapitalGlass-Cross-Agent",
      resolveSrcPath: () => path.join(repoRoot, entry.source),
    })),
    ...Z_HARVEST_EXTERNAL_PROTOCOL_SOURCES.map((entry) => ({
      ...entry,
      resolveSrcPath: () => {
        const externalRoot = entry.resolveRepoRoot(repoRoot);
        return path.join(externalRoot, entry.source);
      },
    })),
  ];

  for (const entry of protocolSourceGroups) {
    const srcPath = entry.resolveSrcPath();
    const sourceLabel = `${entry.authorityRepo}/${entry.source}`;
    if (!fs.existsSync(srcPath)) {
      errors.push(`missing source: ${sourceLabel}`);
      continue;
    }
    for (const relDest of entry.destinations) {
      const repoDest = path.join(repoMirrorRoot, relDest);
      files.push({ ...copyIfChanged(srcPath, repoDest), target: "repo-mirror", source: sourceLabel });

      if (zRoot) {
        const zDest = path.join(zRoot, relDest);
        try {
          files.push({ ...copyIfChanged(srcPath, zDest), target: "z-drive", source: sourceLabel });
        } catch (err) {
          errors.push(`z-copy-fail:${relDest}:${err.message ?? err}`);
        }
      }
    }
  }

  const readme = README_TEMPLATE.replace("{{generatedAt}}", new Date().toISOString()).replace(
    "{{sourceCommitSha}}",
    sourceCommitSha,
  );
  const repoReadme = path.join(repoMirrorRoot, "README.md");
  writeFileEnsuringDir(repoReadme, readme);
  files.push({ dest: repoReadme, action: "updated", target: "repo-mirror", hash: hashFileContent(readme) });
  if (zRoot) {
    const zReadme = path.join(zRoot, "README.md");
    try {
      writeFileEnsuringDir(zReadme, readme);
      files.push({ dest: zReadme, action: "updated", target: "z-drive", hash: hashFileContent(readme) });
    } catch (err) {
      errors.push(`z-readme-fail:${err.message ?? err}`);
    }
  }

  const receipt = {
    schemaVersion: Z_HARVEST_MIRROR_RECEIPT_SCHEMA,
    generatedAt: new Date().toISOString(),
    sourceCommitSha,
    repoMirrorRoot,
    zHarvestRoot: zRoot,
    zMounted: Boolean(zRoot),
    fileCount: files.length,
    updatedCount: files.filter((f) => f.action === "updated").length,
    files,
    errors,
    verdict: errors.length === 0 ? "Z_HARVEST_MIRROR_SYNC_PASS" : "Z_HARVEST_MIRROR_SYNC_PARTIAL",
  };

  const receiptPath = path.join(repoMirrorRoot, "z-mirror-sync-receipt.json");
  writeFileEnsuringDir(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  receipt.receiptPath = receiptPath;

  return {
    ok: errors.length === 0,
    receipt,
    zMounted: Boolean(zRoot),
  };
}
