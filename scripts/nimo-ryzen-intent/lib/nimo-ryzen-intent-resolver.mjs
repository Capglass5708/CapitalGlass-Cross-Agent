import intentCatalog from "../../../registry/nimo-ryzen-intent/nimo-ryzen-intent-catalog.v1.json" with { type: "json" };

import { instructionNamesRyzenTarget, resolveMachineAlias } from "./resolve-machine-alias.mjs";
import { extractRepoTokenFromInstruction, resolveRepoAlias } from "./resolve-repo-alias.mjs";

const DESTRUCTIVE_PATTERNS = [
  /\bdelete\b.*\brepo\b/i,
  /\brm\s+-rf\b/i,
  /\bgit\s+reset\s+--hard\b/i,
  /\bdrop\s+database\b/i,
  /\buninstall\b.*\bwsl\b/i,
];

const MUTATING_PATTERNS = [
  /\bgit\s+pull\b/i,
  /\bgit\s+push\b/i,
  /\bgit\s+commit\b/i,
  /\bdeploy\b/i,
  /\bnpm\s+run\s+deploy\b/i,
  /\bapply\b.*\bmutation\b/i,
];

function matchesAny(text, patterns) {
  return patterns.some((re) => re.test(text));
}

function scoreIntent(intent, instruction) {
  const lower = String(instruction ?? "").toLowerCase();
  const hits = (intent.patterns ?? []).filter((pattern) => new RegExp(pattern, "i").test(lower));
  if (hits.length === 0) return 0;
  return hits.length;
}

function pickBoundedTestKey(repoFolder, intent, instruction, catalog = intentCatalog) {
  const scripts = catalog.boundedTestScripts?.[repoFolder] ?? {};
  const lower = String(instruction ?? "").toLowerCase();
  for (const [key, npmScript] of Object.entries(scripts)) {
    if (lower.includes(key.replace(/-/g, " ")) || lower.includes(key)) {
      return { boundedTestKey: key, npmScript };
    }
  }
  const fallback = intent.defaultBoundedTestKey ?? Object.keys(scripts)[0] ?? null;
  if (!fallback) return { boundedTestKey: null, npmScript: null };
  return { boundedTestKey: fallback, npmScript: scripts[fallback] ?? null };
}

/**
 * Resolve operator natural-language instruction to a catalogued executor plan.
 * Never returns arbitrary shell — only allowlisted job profiles and parameters.
 */
export function resolveNimoRyzenIntent(instruction, options = {}) {
  const catalog = options.catalog ?? intentCatalog;
  const text = String(instruction ?? "").trim();
  if (!text) {
    return { ok: false, reasonCode: "INSTRUCTION_EMPTY" };
  }

  if (!instructionNamesRyzenTarget(text, { catalog })) {
    return { ok: false, reasonCode: "RYZEN_TARGET_NOT_NAMED", instruction: text };
  }

  if (matchesAny(text, DESTRUCTIVE_PATTERNS)) {
    return {
      ok: false,
      reasonCode: "DESTRUCTIVE_INTENT_BLOCKED",
      executionClass: "DESTRUCTIVE",
      instruction: text,
    };
  }

  if (matchesAny(text, MUTATING_PATTERNS)) {
    return {
      ok: false,
      reasonCode: "MUTATING_INTENT_NOT_CATALOGUED",
      executionClass: "MUTATING",
      instruction: text,
    };
  }

  const machine = resolveMachineAlias("ryzen9", { catalog });
  if (!machine.ok) {
    return { ok: false, reasonCode: machine.reasonCode, instruction: text };
  }

  const ranked = (catalog.intents ?? [])
    .map((intent) => ({ intent, score: scoreIntent(intent, text) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) {
    return { ok: false, reasonCode: "INTENT_NOT_CATALOGUED", instruction: text };
  }

  const { intent } = ranked[0];
  let resolvedRepo = null;
  let boundedTestKey = null;
  let npmScript = null;

  if (intent.requiresRepo) {
    const repoFolder = extractRepoTokenFromInstruction(text, { catalog });
    if (!repoFolder) {
      return { ok: false, reasonCode: "REPO_NOT_RESOLVED", intentId: intent.id, instruction: text };
    }
    const repo = resolveRepoAlias(repoFolder, { catalog });
    if (!repo.ok) {
      return { ok: false, reasonCode: repo.reasonCode, intentId: intent.id, instruction: text };
    }
    resolvedRepo = repo.folderName;

    if (intent.jobProfile === "repo-bounded-test") {
      const picked = pickBoundedTestKey(resolvedRepo, intent, text, catalog);
      if (!picked.boundedTestKey || !picked.npmScript) {
        return {
          ok: false,
          reasonCode: "BOUNDED_TEST_SCRIPT_NOT_CATALOGUED",
          intentId: intent.id,
          resolvedRepo,
          instruction: text,
        };
      }
      boundedTestKey = picked.boundedTestKey;
      npmScript = picked.npmScript;
    }
  }

  return {
    ok: true,
    reasonCode: "INTENT_RESOLVED",
    instruction: text,
    intentId: intent.id,
    targetMachine: catalog.targetMachineCanonicalId ?? machine.canonicalTargetId,
    targetMachineRegistryKey: machine.registryKey,
    controlHost: catalog.controllerMachineId ?? "CG-NIMO-01",
    resolvedRepo,
    operation: intent.operationLabel,
    admissionOperation: intent.admissionOperation,
    executionClass: intent.executionClass,
    jobProfile: intent.jobProfile,
    workPackageId: catalog.defaultWorkPackageId ?? "ryzen9desk-managed-executor-v1",
    boundedTestKey,
    npmScript,
    catalogAuthority: "registry/nimo-ryzen-intent/nimo-ryzen-intent-catalog.v1.json",
  };
}
