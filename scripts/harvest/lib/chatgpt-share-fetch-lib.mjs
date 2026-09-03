/**
 * Parse a ChatGPT share-page HTML export into a chatgpt-findings-source.md
 * candidate. Extraction is layered and honest about confidence: a
 * structured hit from the page's own embedded conversation JSON is the
 * only result ever eligible for --apply. Anything less than that is
 * reported as low-confidence and never silently promoted to a real
 * publish -- see extractFindingsMarkdown's ok:false path.
 */

export const SHARE_URL_PATTERN = /^https:\/\/(chatgpt\.com|chat\.openai\.com)\/share\/[a-zA-Z0-9-]+\/?$/;

export function normalizeShareUrl(rawUrl) {
  const url = String(rawUrl ?? '').trim();
  if (!SHARE_URL_PATTERN.test(url)) {
    const err = new Error(`BLOCKED_INVALID_SHARE_URL: expected https://chatgpt.com/share/<id> or https://chat.openai.com/share/<id>, got: ${url || '(empty)'}`);
    err.code = 'BLOCKED_INVALID_SHARE_URL';
    throw err;
  }
  return url.replace(/\/$/, '');
}

// ChatGPT's own conversation export format (conversations.json) uses a
// mapping of node-id -> {message: {author, content, create_time}, parent,
// children}. A share page embedding the same data model is a grounded bet,
// not a guess pulled from nowhere -- but it is still unverified against a
// live page, so failure here must be loud, not silently swallowed.
function findMappingNode(value, seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return null;
  seen.add(value);
  if (!Array.isArray(value) && looksLikeMapping(value)) return value;
  const entries = Array.isArray(value) ? value : Object.values(value);
  for (const entry of entries) {
    const found = findMappingNode(entry, seen);
    if (found) return found;
  }
  return null;
}

function looksLikeMapping(obj) {
  const values = Object.values(obj);
  if (values.length === 0) return false;
  return values.some(
    (node) =>
      node &&
      typeof node === 'object' &&
      'message' in node &&
      node.message &&
      typeof node.message === 'object' &&
      node.message.author &&
      node.message.content
  );
}

function extractMessagesFromMapping(mapping) {
  const nodes = Object.values(mapping).filter(
    (node) => node?.message?.author?.role && Array.isArray(node.message.content?.parts)
  );
  nodes.sort((a, b) => (a.message.create_time ?? 0) - (b.message.create_time ?? 0));
  return nodes.map((node) => ({
    role: node.message.author.role,
    text: node.message.content.parts.filter((p) => typeof p === 'string').join('\n'),
  })).filter((m) => m.text.trim().length > 0);
}

function extractNextDataJson(html) {
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

/**
 * @param {string} html
 * @param {{ messageIndex?: number }} [options] messageIndex is 0-based
 *   among assistant messages only; default (undefined) = the last one.
 * @returns {{ ok: true, markdown: string, extractionMethod: 'NEXT_DATA_JSON',
 *   assistantMessageCount: number, selectedIndex: number } |
 *   { ok: false, reason: string, rawTextPreview: string|null }}
 */
export function extractFindingsMarkdown(html, options = {}) {
  if (typeof html !== 'string' || html.trim().length === 0) {
    return { ok: false, reason: 'EMPTY_PAGE_BODY', rawTextPreview: null };
  }

  const nextData = extractNextDataJson(html);
  const mapping = nextData ? findMappingNode(nextData) : null;
  const messages = mapping ? extractMessagesFromMapping(mapping) : [];
  const assistantMessages = messages.filter((m) => m.role === 'assistant');

  if (assistantMessages.length === 0) {
    return {
      ok: false,
      reason: nextData
        ? 'NEXT_DATA_JSON_FOUND_BUT_NO_ASSISTANT_MESSAGES'
        : 'NEXT_DATA_JSON_NOT_FOUND',
      rawTextPreview: stripToVisibleText(html).slice(0, 2000),
    };
  }

  const selectedIndex = options.messageIndex ?? assistantMessages.length - 1;
  const selected = assistantMessages[selectedIndex];
  if (!selected) {
    return {
      ok: false,
      reason: `MESSAGE_INDEX_OUT_OF_RANGE: requested ${selectedIndex}, found ${assistantMessages.length} assistant messages`,
      rawTextPreview: null,
    };
  }

  return {
    ok: true,
    markdown: selected.text,
    extractionMethod: 'NEXT_DATA_JSON',
    assistantMessageCount: assistantMessages.length,
    selectedIndex,
  };
}

function stripToVisibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Verified against the real domain (not a fixture): a plain server-side
// fetch, even with a full browser-like header set, currently gets 403 from
// chatgpt.com/share/* -- consistent with an edge-level bot block rather
// than a per-share-id check (403, not 404, on a syntactically valid but
// nonexistent id). Not yet confirmed against a real share id. If this
// still 403s on a real link, plain HTTP fetch cannot do this job -- the
// next step is a headless-browser fetch (this environment has Chromium
// pre-installed for Playwright), which is a real new dependency for this
// repo and a decision worth making explicitly, not silently.
export async function fetchShareHtml(url, { fetchImpl = fetch } = {}) {
  const response = await fetchImpl(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    redirect: 'follow',
  });
  if (!response.ok) {
    const hint = response.status === 403 ? ' (403 on a plain fetch is consistent with edge-level bot detection, not necessarily an invalid link -- see fetchShareHtml\'s header comment)' : '';
    const err = new Error(`BLOCKED_SHARE_FETCH_FAILED: ${response.status} ${response.statusText} for ${url}${hint}`);
    err.code = 'BLOCKED_SHARE_FETCH_FAILED';
    err.status = response.status;
    throw err;
  }
  return response.text();
}
