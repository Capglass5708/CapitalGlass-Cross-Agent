#!/usr/bin/env node
/**
 * Pure-parser tests for the ChatGPT share-fetch lib -- no live network
 * calls. Fixture HTML approximates ChatGPT's own documented conversation
 * export shape (a mapping of node -> {message: {author, content,
 * create_time}}), the same model conversations.json exports use. This is
 * a grounded bet on share-page structure, not a verified one -- these
 * tests cover the parser's own logic and its honest failure modes, not
 * a guarantee the real page matches.
 */
import assert from 'node:assert/strict';

import {
  SHARE_URL_PATTERN,
  normalizeShareUrl,
  extractFindingsMarkdown,
} from '../harvest/lib/chatgpt-share-fetch-lib.mjs';

function buildNextDataHtml(mapping) {
  const payload = { props: { pageProps: { serverResponse: { data: { mapping } } } } };
  return `<html><head><script id="__NEXT_DATA__" type="application/json">${JSON.stringify(payload)}</script></head><body>rendered</body></html>`;
}

function msgNode(id, role, text, createTime) {
  return {
    id,
    message: {
      author: { role },
      content: { content_type: 'text', parts: [text] },
      create_time: createTime,
    },
  };
}

function testNormalizeShareUrlAcceptsBothDomains() {
  assert.equal(normalizeShareUrl('https://chatgpt.com/share/abc-123'), 'https://chatgpt.com/share/abc-123');
  assert.equal(normalizeShareUrl('https://chat.openai.com/share/abc-123/'), 'https://chat.openai.com/share/abc-123');
  assert.match('https://chatgpt.com/share/abc-123', SHARE_URL_PATTERN);
}

function testNormalizeShareUrlRejectsGarbage() {
  for (const bad of ['', 'https://chatgpt.com/c/abc-123', 'not a url', 'https://evil.example.com/share/abc']) {
    assert.throws(() => normalizeShareUrl(bad), /BLOCKED_INVALID_SHARE_URL/, `expected rejection for: ${bad}`);
  }
}

function testExtractsLastAssistantMessageByDefault() {
  const html = buildNextDataHtml({
    n1: msgNode('n1', 'user', 'first question', 100),
    n2: msgNode('n2', 'assistant', 'first answer', 101),
    n3: msgNode('n3', 'user', 'second question', 102),
    n4: msgNode('n4', 'assistant', 'FINAL COMPRESSED FINDINGS DOC', 103),
  });
  const result = extractFindingsMarkdown(html);
  assert.equal(result.ok, true);
  assert.equal(result.extractionMethod, 'NEXT_DATA_JSON');
  assert.equal(result.markdown, 'FINAL COMPRESSED FINDINGS DOC');
  assert.equal(result.assistantMessageCount, 2);
  assert.equal(result.selectedIndex, 1);
}

function testMessageIndexOverrideSelectsEarlierAssistantMessage() {
  const html = buildNextDataHtml({
    n1: msgNode('n1', 'user', 'q1', 100),
    n2: msgNode('n2', 'assistant', 'answer one', 101),
    n3: msgNode('n3', 'assistant', 'answer two', 102),
  });
  const result = extractFindingsMarkdown(html, { messageIndex: 0 });
  assert.equal(result.ok, true);
  assert.equal(result.markdown, 'answer one');
}

function testMessagesOrderedByCreateTimeNotMappingOrder() {
  // mapping keys inserted out of chronological order -- must still sort by create_time
  const html = buildNextDataHtml({
    later: msgNode('later', 'assistant', 'second', 200),
    earlier: msgNode('earlier', 'assistant', 'first', 100),
  });
  const result = extractFindingsMarkdown(html);
  assert.equal(result.markdown, 'second', 'must select the chronologically last assistant message');
}

function testNoNextDataScriptFailsHonestly() {
  const result = extractFindingsMarkdown('<html><body>plain page, no embedded data</body></html>');
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'NEXT_DATA_JSON_NOT_FOUND');
  assert.ok(result.rawTextPreview, 'must still surface a raw preview for manual recovery');
}

function testMalformedJsonFailsHonestlyNotSilently() {
  const html = '<html><head><script id="__NEXT_DATA__" type="application/json">{not valid json</script></head></html>';
  const result = extractFindingsMarkdown(html);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'NEXT_DATA_JSON_NOT_FOUND', 'malformed JSON must be treated the same as absent, never partially trusted');
}

function testValidJsonWithNoAssistantMessagesFailsHonestly() {
  const html = buildNextDataHtml({ n1: msgNode('n1', 'user', 'only a question, no answer yet', 100) });
  const result = extractFindingsMarkdown(html);
  assert.equal(result.ok, false);
  assert.equal(result.reason, 'NEXT_DATA_JSON_FOUND_BUT_NO_ASSISTANT_MESSAGES');
}

function testMessageIndexOutOfRangeFailsHonestly() {
  const html = buildNextDataHtml({ n1: msgNode('n1', 'assistant', 'only one', 100) });
  const result = extractFindingsMarkdown(html, { messageIndex: 5 });
  assert.equal(result.ok, false);
  assert.match(result.reason, /MESSAGE_INDEX_OUT_OF_RANGE/);
}

function testEmptyPageBodyFailsHonestly() {
  assert.equal(extractFindingsMarkdown('').ok, false);
  assert.equal(extractFindingsMarkdown('   ').reason, 'EMPTY_PAGE_BODY');
}

const tests = [
  ['normalizeShareUrl accepts both chatgpt.com and chat.openai.com share URLs', testNormalizeShareUrlAcceptsBothDomains],
  ['normalizeShareUrl rejects non-share URLs and garbage', testNormalizeShareUrlRejectsGarbage],
  ['extracts the last assistant message by default', testExtractsLastAssistantMessageByDefault],
  ['--message-index selects an earlier assistant message', testMessageIndexOverrideSelectsEarlierAssistantMessage],
  ['messages are ordered by create_time, not mapping key order', testMessagesOrderedByCreateTimeNotMappingOrder],
  ['no __NEXT_DATA__ script fails honestly with a raw preview, not silently', testNoNextDataScriptFailsHonestly],
  ['malformed JSON fails honestly, never partially trusted', testMalformedJsonFailsHonestlyNotSilently],
  ['valid JSON with zero assistant messages fails honestly', testValidJsonWithNoAssistantMessagesFailsHonestly],
  ['out-of-range --message-index fails honestly', testMessageIndexOutOfRangeFailsHonestly],
  ['empty page body fails honestly', testEmptyPageBodyFailsHonestly],
];

let passed = 0;
for (const [name, fn] of tests) {
  fn();
  passed += 1;
  console.log(`ok - ${name}`);
}
console.log(`\n${passed}/${tests.length} chatgpt share-fetch tests passed`);
