import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { resolveDataExtractionRoot } from "../../index/lib/resolve-repo-roots.mjs";
import { hashFileContent } from "./hash.mjs";

export const Z_HARVEST_MIRROR_RECEIPT_SCHEMA = "harvest-z-mirror-sync-receipt-v1@1.0.0";

export const Z_HARVEST_EXPECTED_MOUNT = "/mnt/z";
export const Z_HARVEST_PROTOCOL_ROOT = "/mnt/z/Capital-Glass-Dev/Harvest";
export const L_HARVEST_EXPECTED_MOUNT = "/mnt/l";
export const L_HUB_INDEX_ROOT = "/mnt/l/Capital-Glass-Intelligence-Hub/00-master-index";

export const Z_HARVEST_WAVE_SDLC_REL = "protocol/CURSOR_HARVEST_INGEST_CLOSEOUT_WAVE_SDLC_V1.md";

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

## Publication modes

| Command | Z required | L required | Verdict on success | Exit |
| --- | --- | --- | --- | --- |
| \`npm run harvest:sync-z-mirror\` | yes (\`/mnt/z\` mount + protocol dir) | no (warnings only) | \`Z_HARVEST_MIRROR_SYNC_PASS\` | 0 |
| \`npm run harvest:sync-z-mirror -- --repo-mirror-only\` | no | no | \`Z_HARVEST_REPO_MIRROR_PASS\` | 0 |
| Z unavailable (default mode) | — | — | \`Z_HARVEST_MIRROR_SYNC_BLOCKED\` | 1 |

L: hub index findings are **warnings** for z-mirror; they do not block Z publication.
\`harvest:sync-derived\` uses repository-only mode (\`requireZPublication: false\`).

Receipt: \`harvest/z-mirror-sync-receipt.json\` — check \`verdict\`, \`errors\`, \`warnings\`, \`mountAuthority\`.

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

function isMountPoint(mountPath) {
  try {
    const result = spawnSync("mountpoint", ["-q", mountPath], { encoding: "utf8" });
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Assess expected WSL mount points for Z: harvest publication and optional L: hub.
 */
export function assessHarvestMountAuthority(env = process.env) {
  const zMount = env.CG_Z_HARVEST_MOUNT?.trim() || Z_HARVEST_EXPECTED_MOUNT;
  const lMount = env.CG_L_HUB_MOUNT?.trim() || L_HARVEST_EXPECTED_MOUNT;
  const zHarvestRoot = env.CG_Z_HARVEST_ROOT?.trim() || Z_HARVEST_PROTOCOL_ROOT;
  const zProtocolDir = path.join(zHarvestRoot, "protocol");

  return {
    z: {
      mountpoint: zMount,
      mounted: isMountPoint(zMount),
      harvestRoot: zHarvestRoot,
      harvestProtocolDir: fs.existsSync(zProtocolDir),
      harvestProtocolDirPath: zProtocolDir,
    },
    l: {
      mountpoint: lMount,
      mounted: isMountPoint(lMount),
      hubIndexDir: fs.existsSync(L_HUB_INDEX_ROOT),
      hubIndexPath: L_HUB_INDEX_ROOT,
    },
  };
}

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
  const authority = assessHarvestMountAuthority(env);
  if (!authority.z.mounted) {
    return null;
  }
  if (!fs.existsSync(authority.z.harvestRoot)) {
    return null;
  }
  return authority.z.harvestRoot;
}

/**
 * Sync protocol docs to repo harvest/ mirror and Z: root when mounted.
 * @param {object} opts
 * @param {boolean} [opts.requireZPublication=true] — fail closed when Z: is not mounted/published
 */
export function syncZHarvestMirror({
  repoRoot,
  zHarvestRoot = null,
  env = process.env,
  sourceCommitSha = "unknown",
  requireZPublication = true,
} = {}) {
  const repoMirrorRoot = path.join(repoRoot, "harvest");
  const mountAuthority = assessHarvestMountAuthority(env);
  const zRoot = zHarvestRoot ?? resolveZHarvestRoot(env);
  const files = [];
  const errors = [];
  const warnings = [];

  if (!mountAuthority.l.mounted) {
    warnings.push(`L_MOUNT_MISSING: ${mountAuthority.l.mountpoint} not mounted (optional for z-mirror)`);
  } else if (!mountAuthority.l.hubIndexDir) {
    warnings.push(`L_HUB_INDEX_MISSING: ${L_HUB_INDEX_ROOT} (optional for z-mirror)`);
  }

  if (requireZPublication) {
    if (!mountAuthority.z.mounted) {
      errors.push(`Z_MOUNT_MISSING: ${mountAuthority.z.mountpoint} is not an active mount`);
    }
    if (!mountAuthority.z.harvestProtocolDir) {
      errors.push(
        `Z_HARVEST_TARGET_MISSING: ${mountAuthority.z.harvestProtocolDirPath} does not exist`,
      );
    }
    if (!zRoot) {
      errors.push("Z_HARVEST_ROOT_UNRESOLVED: Z: harvest root unavailable after mount checks");
    }
  }

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

  const zDriveFiles = files.filter((f) => f.target === "z-drive");
  if (requireZPublication && zRoot && errors.length === 0 && zDriveFiles.length === 0) {
    errors.push("Z_PUBLICATION_MISSING: no protocol files written to Z: harvest mirror");
  }

  const waveSdlcZPath = zRoot ? path.join(zRoot, Z_HARVEST_WAVE_SDLC_REL) : null;
  if (requireZPublication && zRoot && errors.length === 0 && !fs.existsSync(waveSdlcZPath ?? "")) {
    errors.push(`Z_WAVE_SDLC_MISSING: ${waveSdlcZPath}`);
  }

  const blockingZ = errors.some((e) => e.startsWith("Z_"));
  let verdict;
  if (requireZPublication && blockingZ) {
    verdict = "Z_HARVEST_MIRROR_SYNC_BLOCKED";
  } else if (errors.length > 0) {
    verdict = "Z_HARVEST_MIRROR_SYNC_PARTIAL";
  } else if (requireZPublication) {
    verdict = "Z_HARVEST_MIRROR_SYNC_PASS";
  } else {
    verdict = "Z_HARVEST_REPO_MIRROR_PASS";
  }

  const receipt = {
    schemaVersion: Z_HARVEST_MIRROR_RECEIPT_SCHEMA,
    generatedAt: new Date().toISOString(),
    sourceCommitSha,
    repoMirrorRoot,
    zHarvestRoot: zRoot,
    zMounted: mountAuthority.z.mounted,
    requireZPublication,
    mountAuthority,
    fileCount: files.length,
    updatedCount: files.filter((f) => f.action === "updated").length,
    zDriveFileCount: zDriveFiles.length,
    files,
    warnings,
    errors,
    verdict,
  };

  const receiptPath = path.join(repoMirrorRoot, "z-mirror-sync-receipt.json");
  writeFileEnsuringDir(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  receipt.receiptPath = receiptPath;

  const ok =
    errors.length === 0 && (!requireZPublication || (mountAuthority.z.mounted && zDriveFiles.length > 0));

  return {
    ok,
    receipt,
    zMounted: mountAuthority.z.mounted,
  };
}
