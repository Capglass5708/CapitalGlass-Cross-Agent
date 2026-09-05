import assert from "node:assert/strict";
import test from "node:test";

import { resolveNimoRyzenIntent } from "../nimo-ryzen-intent/lib/nimo-ryzen-intent-resolver.mjs";
import { resolveMachineAlias } from "../nimo-ryzen-intent/lib/resolve-machine-alias.mjs";
import { extractRepoTokenFromInstruction } from "../nimo-ryzen-intent/lib/resolve-repo-alias.mjs";

test("ryzen9 resolves to RYZEN9DESK canonical target", () => {
  const machine = resolveMachineAlias("ryzen9");
  assert.equal(machine.ok, true);
  assert.equal(machine.registryKey, "RYZEN9DESK");
  assert.equal(machine.canonicalTargetId, "CG-RYZEN9DESK-01");
});

test("hostname on ryzen9 resolves to executor-smoke READ_ONLY", () => {
  const result = resolveNimoRyzenIntent("hostname on ryzen9");
  assert.equal(result.ok, true);
  assert.equal(result.intentId, "hostname-on-ryzen");
  assert.equal(result.jobProfile, "executor-smoke");
  assert.equal(result.executionClass, "READ_ONLY");
  assert.equal(result.targetMachine, "CG-RYZEN9DESK-01");
  assert.equal(result.controlHost, "CG-NIMO-01");
  assert.equal(result.admissionOperation, "query_machine_state");
});

test("git status in CG-AppBuilder-MCP on ryzen9 resolves git-inspect", () => {
  const result = resolveNimoRyzenIntent("git status in CG-AppBuilder-MCP on ryzen9");
  assert.equal(result.ok, true);
  assert.equal(result.intentId, "git-status-on-ryzen");
  assert.equal(result.jobProfile, "git-inspect");
  assert.equal(result.resolvedRepo, "CG-AppBuilder-MCP");
  assert.equal(result.admissionOperation, "git_inspect");
});

test("bounded test in Office Admin on ryzen9 resolves repo-bounded-test", () => {
  const result = resolveNimoRyzenIntent("run a bounded test suite in Office Admin on ryzen9");
  assert.equal(result.ok, true);
  assert.equal(result.intentId, "bounded-test-on-ryzen");
  assert.equal(result.jobProfile, "repo-bounded-test");
  assert.equal(result.resolvedRepo, "CapitalGlass-Office-Admin");
  assert.equal(result.boundedTestKey, "plaintext-gate");
  assert.equal(result.npmScript, "test:plaintext-gate");
});

test("destructive instruction is blocked", () => {
  const result = resolveNimoRyzenIntent("delete repo CG-AppBuilder-MCP on ryzen9");
  assert.equal(result.ok, false);
  assert.equal(result.reasonCode, "DESTRUCTIVE_INTENT_BLOCKED");
  assert.equal(result.executionClass, "DESTRUCTIVE");
});

test("mutating git pull is blocked until catalogued", () => {
  const result = resolveNimoRyzenIntent("git pull in CG-AppBuilder-MCP on ryzen9");
  assert.equal(result.ok, false);
  assert.equal(result.reasonCode, "MUTATING_INTENT_NOT_CATALOGUED");
});

test("repo alias extraction is deterministic", () => {
  assert.equal(
    extractRepoTokenFromInstruction("git status in CG-AppBuilder-MCP on ryzen9"),
    "CG-AppBuilder-MCP",
  );
  assert.equal(
    extractRepoTokenFromInstruction("run tests in office admin on ryzen"),
    "CapitalGlass-Office-Admin",
  );
});
