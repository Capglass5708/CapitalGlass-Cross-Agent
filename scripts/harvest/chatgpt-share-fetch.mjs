#!/usr/bin/env node
/**
 * Fetch a ChatGPT share link and stage its compressed findings message as
 * chatgpt-findings-source.md input, via the existing
 * chatgpt-closeout-from-download.mjs orchestrator -- this script only
 * replaces the manual "download a file, drop it in chat" step with
 * "paste one URL." Everything downstream (publish, git-gate, ingest,
 * duplication preflight) is unchanged, reused as-is.
 *
 * A low-confidence or failed extraction never writes anything and never
 * proceeds to --apply -- see chatgpt-share-fetch-lib.mjs.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

import { normalizeShareUrl, fetchShareHtml, extractFindingsMarkdown } from './lib/chatgpt-share-fetch-lib.mjs';
import { resolveHarvestIdFromProcessArgv } from './lib/resolve-harvest-id.mjs';
import { REPO_ROOT } from './lib/paths.mjs';

function parseArgs(argv) {
  let url = null;
  let messageIndex;
  let apply = false;
  let json = false;
  for (const arg of argv) {
    if (arg.startsWith('--url=')) url = arg.slice('--url='.length);
    else if (arg.startsWith('--message-index=')) messageIndex = Number(arg.slice('--message-index='.length));
    else if (arg === '--apply') apply = true;
    else if (arg === '--json') json = true;
  }
  return { url, messageIndex, apply, json };
}

async function main() {
  const { url, messageIndex, apply, json } = parseArgs(process.argv.slice(2));
  if (!url) {
    console.error('harvest:chatgpt-share-fetch FAIL — --url=<https://chatgpt.com/share/...> required');
    process.exit(1);
  }

  let normalizedUrl;
  try {
    normalizedUrl = normalizeShareUrl(url);
  } catch (err) {
    console.error(`harvest:chatgpt-share-fetch FAIL — ${err.message}`);
    process.exit(1);
  }

  const { harvestId } = resolveHarvestIdFromProcessArgv({ allowReferenceDefault: false });

  let html;
  try {
    html = await fetchShareHtml(normalizedUrl);
  } catch (err) {
    console.error(`harvest:chatgpt-share-fetch FAIL — ${err.message}`);
    process.exit(1);
  }

  const result = extractFindingsMarkdown(html, { messageIndex: Number.isNaN(messageIndex) ? undefined : messageIndex });

  if (!result.ok) {
    console.error(`harvest:chatgpt-share-fetch FAIL — extraction did not find a structured assistant message (${result.reason})`);
    console.error('This share page\'s structure was not recognized. Nothing was written or published.');
    if (result.rawTextPreview) {
      console.error('\nBest-effort raw text preview (for manual recovery only, NOT written anywhere):\n');
      console.error(result.rawTextPreview);
      console.error('\nTo recover manually: save the page content yourself and use the existing');
      console.error(`  npm run harvest:chatgpt-closeout-from-download -- --input=<file> --harvest-id=${harvestId} [--apply]`);
    }
    process.exit(1);
  }

  if (json) {
    console.log(JSON.stringify({
      harvestId,
      url: normalizedUrl,
      extractionMethod: result.extractionMethod,
      assistantMessageCount: result.assistantMessageCount,
      selectedIndex: result.selectedIndex,
      markdownLength: result.markdown.length,
      applied: apply,
    }, null, 2));
  } else {
    console.log(`harvest:chatgpt-share-fetch — ${harvestId}`);
    console.log(`  extraction: ${result.extractionMethod}, message ${result.selectedIndex + 1}/${result.assistantMessageCount} (assistant turns)`);
    console.log(`  ${result.markdown.length} chars extracted`);
    console.log('\n--- preview (first 800 chars) ---\n');
    console.log(result.markdown.slice(0, 800));
    console.log('\n--- end preview ---\n');
  }

  if (!apply) {
    console.log('harvest:chatgpt-share-fetch DRY_RUN — nothing written. Pass --apply to stage and publish through the existing pipeline.');
    process.exit(0);
  }

  const stagingPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'chatgpt-share-fetch-')), 'chatgpt-findings-source.md');
  fs.writeFileSync(stagingPath, result.markdown, 'utf8');

  console.log(`harvest:chatgpt-share-fetch staged ${stagingPath} — handing off to chatgpt-closeout-from-download.mjs`);
  execSync(
    `node scripts/harvest/chatgpt-closeout-from-download.mjs --input=${JSON.stringify(stagingPath)} --harvest-id=${harvestId} --apply`,
    { cwd: REPO_ROOT, stdio: 'inherit' }
  );
}

main().catch((err) => {
  console.error(`harvest:chatgpt-share-fetch FAIL — ${err.message}`);
  process.exit(1);
});
