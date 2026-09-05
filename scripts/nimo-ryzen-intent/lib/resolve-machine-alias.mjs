import intentCatalog from "../../../registry/nimo-ryzen-intent/nimo-ryzen-intent-catalog.v1.json" with { type: "json" };

import { readAppBuilderJson } from "./sibling-authority-paths.mjs";

function normalizeToken(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}

/**
 * Resolve operator machine tokens (e.g. ryzen9) to canonical machine registry keys.
 * Machine registry authority lives in CG-AppBuilder-MCP — never guessed here.
 */
export function resolveMachineAlias(input, { catalog = intentCatalog, registry } = {}) {
  const machineRegistry = registry ?? readAppBuilderJson("registry/canonical-machine-identity-registry-v1.json");
  const token = normalizeToken(input);
  if (!token) {
    return { ok: false, reasonCode: "MACHINE_ALIAS_EMPTY" };
  }

  const catalogKey = catalog.machineAliases?.[token.replace(/-/g, "")] ?? catalog.machineAliases?.[token];
  const registryKey = catalogKey ?? Object.keys(machineRegistry.machines ?? {}).find((key) => {
    const row = machineRegistry.machines[key];
    const aliases = (row.aliases ?? []).map(normalizeToken);
    return (
      normalizeToken(key) === token
      || normalizeToken(row.canonicalId) === token
      || aliases.includes(token)
      || aliases.includes(token.replace(/-/g, ""))
    );
  });

  if (!registryKey || !machineRegistry.machines?.[registryKey]) {
    return { ok: false, reasonCode: "MACHINE_ALIAS_UNKNOWN", token: input };
  }

  const machine = machineRegistry.machines[registryKey];
  const canonicalTarget =
    machine.aliases?.find((a) => a.startsWith("CG-")) ?? machine.canonicalId ?? registryKey;

  return {
    ok: true,
    registryKey,
    canonicalId: machine.canonicalId ?? registryKey,
    canonicalTargetId: canonicalTarget,
    machineRole: machine.machineRole ?? null,
    displayName: machine.displayName ?? registryKey,
    token: input,
  };
}

/**
 * Returns true when instruction text names the RYZEN executor target.
 */
export function instructionNamesRyzenTarget(instruction, { catalog = intentCatalog } = {}) {
  const lower = String(instruction ?? "").toLowerCase();
  const tokens = [
    ...Object.keys(catalog.machineAliases ?? {}),
    "ryzen9desk",
    "cg-ryzen9desk-01",
    "ryzen",
  ];
  return tokens.some((t) => lower.includes(t.toLowerCase()));
}
