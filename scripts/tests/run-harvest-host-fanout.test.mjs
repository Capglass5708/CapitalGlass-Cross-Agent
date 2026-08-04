#!/usr/bin/env node
import assert from "node:assert/strict";

import {
  DEFAULT_SYNC_HOSTS,
  normalizeSyncHostId,
  parseSyncHostsInput,
  resolveHostHotCacheRoot,
} from "../harvest/lib/host-ai-cache-fanout-lib.mjs";

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`ok - ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`not ok - ${name}`);
    console.error(`  ${error.message}`);
  }
}

test("normalizeSyncHostId maps wesley_work aliases", () => {
  assert.equal(normalizeSyncHostId("wesley_work"), "WESLEY_WORK");
  assert.equal(normalizeSyncHostId("work"), "WESLEY_WORK");
  assert.equal(normalizeSyncHostId("WESLEY_WORK"), "WESLEY_WORK");
});

test("parseSyncHostsInput defaults when flag is empty", () => {
  const hosts = parseSyncHostsInput(true);
  assert.deepEqual(
    hosts,
    DEFAULT_SYNC_HOSTS.map((id) => normalizeSyncHostId(id)),
  );
});

test("parseSyncHostsInput parses explicit csv", () => {
  assert.deepEqual(parseSyncHostsInput("wesley_work,desk"), ["WESLEY_WORK", "WESLEYDESK"]);
});

test("parseSyncHostsInput returns null when disabled", () => {
  assert.equal(parseSyncHostsInput(null), null);
  assert.equal(parseSyncHostsInput(false), null);
});

test("parseSyncHostsInput rejects unknown host", () => {
  assert.throws(() => parseSyncHostsInput("unknown-host"), /unknown sync-host id/);
});

test("resolveHostHotCacheRoot returns path only when mount exists", () => {
  const root = resolveHostHotCacheRoot("RYZEN9DESK");
  if (root) {
    assert.match(root, /AI Cursur Cache/i);
  }
});

console.log(`\n# host fanout tests ${passed} pass ${failed} fail ${failed}`);
process.exit(failed > 0 ? 1 : 0);
