import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.join(__dirname, "../schema/harvest-manifest-v1.schema.json");

let ajvInstance;

function getAjv() {
  if (!ajvInstance) {
    ajvInstance = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajvInstance);
  }
  return ajvInstance;
}

export function validateManifestSchema(manifest) {
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf8"));
  const ajv = getAjv();
  const validate = ajv.compile(schema);
  const valid = validate(manifest);
  if (valid) {
    return { ok: true, errors: [] };
  }
  const errors = (validate.errors || []).map(
    (err) => `${err.instancePath || "/"} ${err.message}`.trim(),
  );
  return { ok: false, errors };
}
