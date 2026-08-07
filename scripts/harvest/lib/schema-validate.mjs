import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_DIR = path.join(__dirname, "../schema");
const MANIFEST_SCHEMA_PATH = path.join(SCHEMA_DIR, "harvest-manifest-v1.schema.json");
const AUTOPSY_BUNDLE_SCHEMA_PATH = path.join(SCHEMA_DIR, "thread-autopsy-bundle-v1.schema.json");
const SEED_PACKET_SCHEMA_PATH = path.join(SCHEMA_DIR, "harvest-seed-packet-v1.schema.json");
const GOLD_MINE_PROJECTION_SCHEMA_PATH = path.join(
  SCHEMA_DIR,
  "gold-mine-evidence-projection-v1.schema.json",
);
const GOLD_MINE_PROJECTION_V2_SCHEMA_PATH = path.join(
  SCHEMA_DIR,
  "gold-mine-evidence-projection-v2.schema.json",
);

let ajvInstance;
const compiledValidators = new Map();

function getAjv() {
  if (!ajvInstance) {
    ajvInstance = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajvInstance);
  }
  return ajvInstance;
}

function validateAgainstSchemaFile(schemaPath, data, label) {
  const ajv = getAjv();
  let validate = compiledValidators.get(schemaPath);
  if (!validate) {
    const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
    validate = ajv.compile(schema);
    compiledValidators.set(schemaPath, validate);
  }
  const valid = validate(data);
  if (valid) {
    return { ok: true, errors: [] };
  }
  const errors = (validate.errors || []).map(
    (err) => `${label}${err.instancePath || "/"} ${err.message}`.trim(),
  );
  return { ok: false, errors };
}

export function validateManifestSchema(manifest) {
  return validateAgainstSchemaFile(MANIFEST_SCHEMA_PATH, manifest, "manifest ");
}

export function validateThreadAutopsyBundleSchema(bundle) {
  return validateAgainstSchemaFile(AUTOPSY_BUNDLE_SCHEMA_PATH, bundle, "bundle ");
}

export function validateHarvestSeedPacketSchema(seed) {
  return validateAgainstSchemaFile(SEED_PACKET_SCHEMA_PATH, seed, "seed ");
}

export function validateGoldMineEvidenceProjectionSchema(doc) {
  return validateAgainstSchemaFile(GOLD_MINE_PROJECTION_SCHEMA_PATH, doc, "goldMine ");
}

export function validateGoldMineEvidenceProjectionV2Schema(doc) {
  return validateAgainstSchemaFile(GOLD_MINE_PROJECTION_V2_SCHEMA_PATH, doc, "goldMineV2 ");
}
