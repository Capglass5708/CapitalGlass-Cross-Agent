/**
 * Minimal JSON Schema validator for the subset these contracts actually use.
 *
 * A contract nothing validates against is a comment. All five context-ledger
 * schemas were written before the code and had never been executed against a
 * real record -- which is how the ledger writer came to emit entries that
 * violated its own schema in five separate ways without anything noticing.
 *
 * Zero dependencies on purpose: this repository has none, and adding a
 * validator dependency to prove an integrity contract would widen the trust
 * boundary of the thing being proven.
 *
 * Supported: type (single or union), const, enum, pattern, required,
 * properties, additionalProperties:false, items, minItems, minimum, maximum,
 * and format:"date-time" as a shape check. Anything else in a schema is
 * IGNORED, and ignoring is reported -- silently passing an unsupported keyword
 * would make the validator claim more than it checked.
 */
const SUPPORTED = new Set([
  '$schema', '$id', 'title', 'description', 'type', 'const', 'enum', 'pattern',
  'required', 'properties', 'additionalProperties', 'items', 'minItems',
  'minimum', 'maximum', 'format', 'default', 'examples',
]);

const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function typeOf(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (Number.isInteger(v)) return 'integer';
  if (typeof v === 'number') return 'number';
  return typeof v;                       // string | boolean | object
}

function typeMatches(value, want) {
  const t = typeOf(value);
  if (want === 'number') return t === 'number' || t === 'integer';
  if (want === 'integer') return t === 'integer';
  return t === want;
}

export function validate(value, schema, { path = '$', unsupported = new Set() } = {}) {
  const errors = [];
  if (schema === true || schema === undefined) return { valid: true, errors, unsupported: [...unsupported] };

  for (const k of Object.keys(schema)) if (!SUPPORTED.has(k)) unsupported.add(`${path}:${k}`);

  if (schema.type !== undefined) {
    const wants = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!wants.some((w) => typeMatches(value, w))) {
      errors.push({ path, code: 'TYPE_MISMATCH', expected: wants, actual: typeOf(value) });
      return { valid: false, errors, unsupported: [...unsupported] };   // further checks would be noise
    }
  }

  if (schema.const !== undefined && JSON.stringify(value) !== JSON.stringify(schema.const)) {
    errors.push({ path, code: 'CONST_MISMATCH', expected: schema.const, actual: value });
  }
  if (schema.enum !== undefined && !schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(value))) {
    errors.push({ path, code: 'ENUM_MISMATCH', allowed: schema.enum, actual: value });
  }
  if (schema.pattern !== undefined && typeof value === 'string' && !new RegExp(schema.pattern).test(value)) {
    // The offending value is reported ONLY for non-credential contracts; these
    // schemas describe metadata, and the pipeline scans every emission before
    // writing it, so a pattern error cannot become a leak channel.
    errors.push({ path, code: 'PATTERN_MISMATCH', pattern: schema.pattern });
  }
  if (schema.format === 'date-time' && typeof value === 'string' && !DATE_TIME.test(value)) {
    errors.push({ path, code: 'FORMAT_DATE_TIME_INVALID' });
  }
  if (schema.minimum !== undefined && typeof value === 'number' && value < schema.minimum) {
    errors.push({ path, code: 'MINIMUM_VIOLATED', minimum: schema.minimum, actual: value });
  }
  if (schema.maximum !== undefined && typeof value === 'number' && value > schema.maximum) {
    errors.push({ path, code: 'MAXIMUM_VIOLATED', maximum: schema.maximum, actual: value });
  }

  if (typeOf(value) === 'array') {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push({ path, code: 'MIN_ITEMS_VIOLATED', minItems: schema.minItems, actual: value.length });
    }
    if (schema.items) {
      value.forEach((item, i) => {
        const r = validate(item, schema.items, { path: `${path}[${i}]`, unsupported });
        errors.push(...r.errors);
      });
    }
  }

  if (typeOf(value) === 'object') {
    for (const req of schema.required ?? []) {
      if (!Object.prototype.hasOwnProperty.call(value, req)) {
        errors.push({ path: `${path}.${req}`, code: 'REQUIRED_PROPERTY_MISSING' });
      }
    }
    const props = schema.properties ?? {};
    for (const [k, v] of Object.entries(value)) {
      if (props[k]) {
        const r = validate(v, props[k], { path: `${path}.${k}`, unsupported });
        errors.push(...r.errors);
      } else if (schema.additionalProperties === false) {
        errors.push({ path: `${path}.${k}`, code: 'ADDITIONAL_PROPERTY_NOT_ALLOWED' });
      }
    }
  }

  return { valid: errors.length === 0, errors, unsupported: [...unsupported] };
}

export function assertValid(value, schema, label = 'document') {
  const r = validate(value, schema);
  if (!r.valid) {
    const e = new Error('SCHEMA_VALIDATION_FAILED');
    e.label = label;
    e.errors = r.errors;
    throw e;
  }
  return r;
}
