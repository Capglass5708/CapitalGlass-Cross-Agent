/**
 * Explicit harvest ID resolution — fail closed when missing in operational mode.
 */
import { REFERENCE_HARVEST_ID } from "./paths.mjs";

const HARVEST_ID_RE = /^harvest-\d{4}-\d{2}-\d{2}-[a-z0-9-]+-v\d+$/;

/**
 * @param {string[]} argv - CLI args after node script name
 * @param {{ allowReferenceDefault?: boolean, env?: NodeJS.ProcessEnv }} [options]
 * @returns {{ harvestId: string, source: "flag"|"positional"|"env"|"reference-default" }}
 */
export function resolveHarvestId(argv = [], options = {}) {
  const env = options.env ?? process.env;
  let fromFlag = null;
  let positional = null;

  for (const arg of argv) {
    if (arg.startsWith("--harvest-id=")) {
      fromFlag = arg.slice("--harvest-id=".length).trim();
    } else if (!arg.startsWith("-") && !positional) {
      positional = arg.trim();
    }
  }

  if (fromFlag) {
    assertHarvestIdShape(fromFlag, "flag");
    return { harvestId: fromFlag, source: "flag" };
  }
  if (positional) {
    assertHarvestIdShape(positional, "positional");
    return { harvestId: positional, source: "positional" };
  }
  if (env.HARVEST_ID?.trim()) {
    const id = env.HARVEST_ID.trim();
    assertHarvestIdShape(id, "HARVEST_ID env");
    return { harvestId: id, source: "env" };
  }
  if (options.allowReferenceDefault) {
    return { harvestId: REFERENCE_HARVEST_ID, source: "reference-default" };
  }

  const err = new Error("BLOCKED_MISSING_HARVEST_ID");
  err.code = "BLOCKED_MISSING_HARVEST_ID";
  err.detail =
    "Provide --harvest-id=<id>, positional harvest id, or HARVEST_ID env. Silent historical defaults are forbidden in operational mode.";
  throw err;
}

/**
 * @param {string[]} argv
 * @param {{ allowReferenceDefault?: boolean }} [options]
 */
export function resolveHarvestIdFromProcessArgv(options = {}) {
  return resolveHarvestId(process.argv.slice(2), options);
}

function assertHarvestIdShape(harvestId, source) {
  if (!harvestId || !HARVEST_ID_RE.test(harvestId)) {
    const err = new Error(`BLOCKED_INVALID_HARVEST_ID from ${source}: ${harvestId ?? "(empty)"}`);
    err.code = "BLOCKED_INVALID_HARVEST_ID";
    throw err;
  }
}

export { HARVEST_ID_RE };
