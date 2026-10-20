import assert from "node:assert/strict";
import test from "node:test";

test("cross-agent local-actions profile smoke", () => {
  assert.equal(process.env.CI_PROFILE, "cross-agent");
});
