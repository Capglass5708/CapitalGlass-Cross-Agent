import fs from "node:fs";
import path from "node:path";

import intentCatalog from "../../../registry/nimo-ryzen-intent/nimo-ryzen-intent-catalog.v1.json" with { type: "json" };
import {
  appBuilderModuleUrl,
  readAppBuilderJson,
  resolveAppBuilderRoot,
} from "./sibling-authority-paths.mjs";

const { validateRepoName } = await import(appBuilderModuleUrl("scripts/executor/lib/git-inspect.mjs"));
const { resolveOwnerRepoRoot } = await import(
  appBuilderModuleUrl("scripts/federated-repo-index/lib/canonical-repo-root.mjs")
);

function normalizeRepoToken(value) {
  return String(value ?? "").trim().toLowerCase();
}

function buildRepoIndex({ catalog = intentCatalog, authority } = {}) {
  const githubAuthority = authority ?? readAppBuilderJson("registry/github-preservation/github-authority-contract.v1.json");
  const byToken = new Map();
  const add = (token, folderName) => {
    if (!token || !folderName) return;
    byToken.set(normalizeRepoToken(token), folderName);
  };

  for (const [alias, folder] of Object.entries(catalog.repoAliases ?? {})) {
    add(alias, folder);
  }

  for (const row of githubAuthority.canonicalRepos ?? []) {
    add(row.folderName, row.folderName);
    add(row.githubRepoKey, row.folderName);
    add(row.recordId, row.folderName);
  }

  return byToken;
}

/**
 * Extract a repo folder name mentioned in operator instruction text.
 */
export function extractRepoTokenFromInstruction(instruction, options = {}) {
  const byToken = buildRepoIndex(options);
  const lower = String(instruction ?? "").toLowerCase();
  const matches = [...byToken.keys()]
    .filter((token) => token.length >= 3 && lower.includes(token))
    .sort((a, b) => b.length - a.length);
  if (matches.length === 0) return null;
  return byToken.get(matches[0]);
}

/**
 * Resolve repo alias to canonical folder name and optional local path.
 */
export function resolveRepoAlias(input, options = {}) {
  const folderName = extractRepoTokenFromInstruction(input, options)
    ?? (() => {
      const byToken = buildRepoIndex(options);
      const key = normalizeRepoToken(input);
      return byToken.get(key) ?? null;
    })();

  if (!folderName) {
    return { ok: false, reasonCode: "REPO_ALIAS_UNKNOWN", token: input };
  }

  const security = validateRepoName(folderName);
  if (!security.ok) {
    return { ok: false, reasonCode: security.reason, token: folderName };
  }

  let localPath = null;
  let pathExists = false;
  try {
    localPath = resolveOwnerRepoRoot(folderName, { localRepoRoot: resolveAppBuilderRoot() });
    pathExists = fs.existsSync(localPath);
  } catch {
    // path resolution is optional for intent resolution
  }

  return {
    ok: true,
    folderName,
    localPath,
    pathExists,
    token: input,
  };
}
