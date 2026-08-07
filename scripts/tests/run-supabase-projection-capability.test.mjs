import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDopplerWrappedCommand,
  DOPPLER_SUPABASE_PROFILE,
  resolveSupabaseProjectionCapability,
  shouldWrapSupabaseCommand,
} from "../harvest/lib/supabase-projection-capability-lib.mjs";

test("buildDopplerWrappedCommand uses cg-mcp dev profile", () => {
  const cmd = buildDopplerWrappedCommand("node script.mjs --json");
  assert.match(cmd, /^doppler run --project cg-mcp --config dev -- /);
  assert.ok(cmd.includes("node script.mjs --json"));
});

test("shouldWrapSupabaseCommand is true only for doppler auth method", () => {
  assert.equal(shouldWrapSupabaseCommand({ authMethod: "doppler" }), true);
  assert.equal(shouldWrapSupabaseCommand({ authMethod: "env-token" }), false);
  assert.equal(shouldWrapSupabaseCommand({ authMethod: "supabase-cli" }), false);
  assert.equal(shouldWrapSupabaseCommand({ authMethod: "none" }), false);
});

test("resolveSupabaseProjectionCapability never logs secret values", () => {
  const capability = resolveSupabaseProjectionCapability();
  const serialized = JSON.stringify(capability);
  assert.ok(["AVAILABLE", "OPTIONAL_UNAVAILABLE"].includes(capability.status));
  assert.ok(["env-token", "supabase-cli", "doppler", "none"].includes(capability.authMethod));
  assert.ok(!serialized.includes("SUPABASE_ACCESS_TOKEN="));
  assert.ok(!/eyJ[A-Za-z0-9_-]{20,}/.test(serialized));
  assert.equal(capability.dopplerProfile.project, DOPPLER_SUPABASE_PROFILE.project);
});

test("resolveSupabaseProjectionCapability reports probe structure", () => {
  const capability = resolveSupabaseProjectionCapability();
  assert.ok(capability.probes);
  assert.ok(Array.isArray(capability.probes.dopplerSecrets));
  assert.ok(["AVAILABLE", "OPTIONAL_UNAVAILABLE"].includes(capability.probes.directToken));
});
