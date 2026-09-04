/**
 * Pass 5 — schema vs runtime validator contradiction.
 * A published schema that permits a value the runtime validator rejects is a
 * trap for every producer writing to the contract. Cheap to detect, expensive
 * to discover in production.
 */
export const id = 'schemaRuntimeConsistency';

/** Numeric constants asserted by code, e.g. `export const MARKER_BUDGET_MAX = 48`. */
function extractCodeConstants(ctx) {
  const consts = [];
  for (const f of ctx.files.filter((x) => /^scripts\/.*\.mjs$/.test(x))) {
    const text = ctx.read(f);
    if (!text) continue;
    const re = /(?:export\s+)?const\s+([A-Z][A-Z0-9_]*(?:MAX|MIN|LIMIT|BUDGET|SIZE|COUNT))\s*=\s*(\d+)/g;
    let m;
    while ((m = re.exec(text))) {
      consts.push({ file: f, name: m[1], value: Number(m[2]), line: ctx.lineOf(text, m.index) });
    }
  }
  return consts;
}

/** Equality assertions against those constants, e.g. `!== MARKER_BUDGET_MAX`. */
function extractEqualityGuards(ctx, constName) {
  const guards = [];
  for (const f of ctx.files.filter((x) => /^scripts\/.*\.mjs$/.test(x))) {
    const text = ctx.read(f);
    if (!text || !text.includes(constName)) continue;
    const re = new RegExp(`[!=]==?\\s*${constName}|${constName}\\s*[!=]==?`, 'g');
    let m;
    while ((m = re.exec(text))) {
      guards.push({ file: f, line: ctx.lineOf(text, m.index) });
    }
  }
  return guards;
}

function walkSchema(node, pathParts, out) {
  if (!node || typeof node !== 'object') return;
  if (typeof node.minimum === 'number' || typeof node.maximum === 'number') {
    out.push({ pointer: pathParts.join('.'), minimum: node.minimum ?? null, maximum: node.maximum ?? null, const: node.const ?? null });
  }
  for (const [k, v] of Object.entries(node)) {
    if (v && typeof v === 'object') walkSchema(v, [...pathParts, k], out);
  }
}

export function run(ctx) {
  const codeConstants = extractCodeConstants(ctx);
  const schemaFiles = ctx.files.filter((f) => /\.schema\.json$/.test(f));
  const contradictions = [];

  for (const sf of schemaFiles) {
    let schema;
    try {
      schema = JSON.parse(ctx.read(sf) ?? '{}');
    } catch {
      continue;
    }
    const ranges = [];
    walkSchema(schema, [], ranges);

    for (const range of ranges) {
      if (range.const !== null) continue;
      if (typeof range.maximum !== 'number') continue;
      // Any code constant that is strictly inside the schema's permitted range
      // AND is enforced by an equality guard contradicts the schema.
      for (const c of codeConstants) {
        const insideRange = c.value <= range.maximum && c.value >= (range.minimum ?? Number.MIN_SAFE_INTEGER);
        const narrower = c.value < range.maximum;
        if (!insideRange || !narrower) continue;
        const guards = extractEqualityGuards(ctx, c.name);
        if (guards.length === 0) continue;
        contradictions.push({
          disposition: 'CONTRACT_RUNTIME_CONTRADICTION',
          schema: sf,
          schemaPointer: range.pointer,
          schemaRange: { minimum: range.minimum, maximum: range.maximum },
          codeConstant: c.name,
          codeValue: c.value,
          codeFile: c.file,
          codeLine: c.line,
          enforcedBy: guards,
          effect: `Schema permits ${range.minimum ?? '-inf'}..${range.maximum}; runtime accepts only ${c.value}.`,
        });
      }
    }
  }

  return {
    schemasScanned: schemaFiles.length,
    codeConstantsFound: codeConstants.length,
    contradictionCount: contradictions.length,
    contradictions,
  };
}
