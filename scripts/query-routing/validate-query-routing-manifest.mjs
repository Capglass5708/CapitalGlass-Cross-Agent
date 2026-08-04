#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

function readJson(relativePath) {
  const absolutePath = path.join(REPO_ROOT, relativePath);
  if (!existsSync(absolutePath)) {
    return { ok: false, code: "FILE_MISSING", path: relativePath };
  }
  try {
    return { ok: true, value: JSON.parse(readFileSync(absolutePath, "utf8")), path: relativePath };
  } catch (error) {
    return { ok: false, code: "JSON_PARSE_ERROR", path: relativePath, error: error.message };
  }
}

function validateManifest(manifest, schema, schemaPath) {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const valid = validate(manifest);
  return {
    ok: valid,
    errors: valid ? [] : validate.errors ?? [],
    schemaPath,
  };
}

export function validateQueryRoutingManifest({
  manifestPath = "registry/query-routing/query-routing-manifest.v1.json",
  schemaPath = "registry/query-routing/schemas/query-routing-manifest.v1.schema.json",
} = {}) {
  const schemaLoaded = readJson(schemaPath);
  if (!schemaLoaded.ok) return { gateVerdict: "QUERY_ROUTING_SCHEMA_MISSING", ...schemaLoaded };

  const manifestLoaded = readJson(manifestPath);
  if (!manifestLoaded.ok) return { gateVerdict: "QUERY_ROUTING_MANIFEST_MISSING", ...manifestLoaded };

  const result = validateManifest(manifestLoaded.value, schemaLoaded.value, schemaPath);
  if (!result.ok) {
    return {
      gateVerdict: "QUERY_ROUTING_SCHEMA_INVALID",
      manifestPath,
      errors: result.errors,
    };
  }

  return {
    gateVerdict: "QUERY_ROUTING_AUTHORITY_PASS",
    manifestPath,
    schemaPath,
    routeCount: manifestLoaded.value.routes?.length ?? 0,
  };
}

function main() {
  const json = process.argv.includes("--json");
  const manifestArg = process.argv.find((a) => a.startsWith("--manifest="));
  const manifestPath = manifestArg?.slice("--manifest=".length);

  const receipt = validateQueryRoutingManifest(
    manifestPath ? { manifestPath } : undefined,
  );

  if (json) {
    console.log(JSON.stringify(receipt, null, 2));
  } else {
    console.log(receipt.gateVerdict);
    if (receipt.errors?.length) {
      for (const err of receipt.errors) {
        console.error(`${err.instancePath || "/"} ${err.message}`);
      }
    }
  }

  process.exit(receipt.gateVerdict.endsWith("_PASS") ? 0 : 1);
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main();
}
