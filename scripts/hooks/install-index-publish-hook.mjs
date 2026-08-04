#!/usr/bin/env node
/**
 * Install Cross-Agent post-push hook for index auto-publisher (opt-in).
 */
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const HOOK_SCRIPT = "scripts/hooks/post-push-index-publish.mjs";
const MARKER = "# capital-glass-index-auto-publisher-v1";

function main() {
  const gitDir = path.join(REPO_ROOT, ".git");
  if (!existsSync(gitDir)) {
    console.error("Not a git repository");
    process.exit(1);
  }

  const hooksDir = path.join(gitDir, "hooks");
  mkdirSync(hooksDir, { recursive: true });
  const hookPath = path.join(hooksDir, "post-push");
  const shim = `#!/usr/bin/env bash
set -euo pipefail
${MARKER}
ROOT="$(git rev-parse --show-toplevel)"
node "$ROOT/${HOOK_SCRIPT}" "$@"
`;

  let body = shim;
  if (existsSync(hookPath)) {
    const existing = readFileSync(hookPath, "utf8");
    if (existing.includes(MARKER)) {
      console.log(`post-push hook already installed: ${hookPath}`);
      process.exit(0);
    }
    body = `${existing.trimEnd()}\n\n${shim}`;
  }

  writeFileSync(hookPath, body, "utf8");
  chmodSync(hookPath, 0o755);
  console.log(`Installed index auto-publisher post-push hook: ${hookPath}`);
  console.log("Enable with: export CG_INDEX_AUTO_PUBLISH_ENABLED=1");
}

main();
