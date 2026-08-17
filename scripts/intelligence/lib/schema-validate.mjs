import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTRACT_DIR = path.join(__dirname, '../../../contracts/intelligence');

let ajvInstance;
const compiled = new Map();

function getAjv() {
  if (!ajvInstance) {
    ajvInstance = new Ajv({ allErrors: true, strict: false });
    addFormats(ajvInstance);
  }
  return ajvInstance;
}

function compileSchema(schemaFile) {
  if (compiled.has(schemaFile)) return compiled.get(schemaFile);
  const schema = JSON.parse(fs.readFileSync(path.join(CONTRACT_DIR, schemaFile), 'utf8'));
  const validate = getAjv().compile(schema);
  compiled.set(schemaFile, validate);
  return validate;
}

export function validateHandoffSchema(handoff) {
  const validate = compileSchema('intelligence-handoff-v1.schema.json');
  const ok = validate(handoff);
  return {
    ok,
    errors: ok ? [] : (validate.errors ?? []).map((err) => `${err.instancePath || '/'} ${err.message}`.trim()),
  };
}

export function validateEnvelopeSchema(envelope) {
  const validate = compileSchema('operational-intelligence-envelope-v1.schema.json');
  const ok = validate(envelope);
  return {
    ok,
    errors: ok ? [] : (validate.errors ?? []).map((err) => `${err.instancePath || '/'} ${err.message}`.trim()),
  };
}

export function assertNoProducerIntelligencePayload(handoff) {
  const forbidden = ['derivedObjects', 'ledger', 'relationships', 'hubPayload', 'envelopes'];
  const found = forbidden.filter((key) => handoff[key] !== undefined);
  return { ok: found.length === 0, forbiddenKeys: found };
}
