/**
 * Pass 6 — impossible values and sentinels.
 * Structured detection of values that are syntactically valid but semantically
 * impossible: year-2000 timestamps, null content hashes, placeholder UUIDs,
 * localhost in production config, TODO markers in authority files.
 */
export const id = 'sentinelAnalysis';

const ALL_ZERO_HASH = /"[a-zA-Z]*[Ss]ha(?:256)?"\s*:\s*"(?:sha256:)?0{32,64}"/g;
const NULL_HASH = /"[a-zA-Z]*(?:Sha256|SHA256|Hash|hash)"\s*:\s*null/g;
const PLACEHOLDER_UUID = /"[0-9a-f]{8}-0000-0000-0000-[0-9a-f]{12}"|00000000-0000-0000-0000-000000000000/g;
const LOCALHOST = /https?:\/\/(localhost|127\.0\.0\.1)/g;
const EXAMPLE_DOMAIN = /https?:\/\/[\w.-]*example\.(com|org|net)/g;
const TODO_MARKER = /\b(TODO|FIXME|XXX|HACK)\b/g;
const ISO_TIMESTAMP = /"(\w*(?:[Aa]t|AT|[Dd]ate|DATE))"\s*:\s*"((\d{4})-\d{2}-\d{2}T[^"]*)"/g;

export function run(ctx, { projectEpochYear = 2024, toleranceYears = 1 } = {}) {
  const now = new Date();
  const maxYear = now.getUTCFullYear() + toleranceYears;
  const findings = [];

  const push = (f) => findings.push(f);

  for (const file of ctx.files) {
    const isAuthority = /^(contracts|registry|index)\//.test(file);
    const isJson = file.endsWith('.json');
    const isHistorical = /^(artifacts|archive)\//.test(file);
    const text = ctx.read(file);
    if (!text) continue;

    if (isJson) {
      ISO_TIMESTAMP.lastIndex = 0;
      let m;
      while ((m = ISO_TIMESTAMP.exec(text))) {
        const year = Number(m[3]);
        if (year < projectEpochYear || year > maxYear) {
          push({
            kind: year < projectEpochYear ? 'IMPOSSIBLE_TIMESTAMP_PAST' : 'IMPOSSIBLE_TIMESTAMP_FUTURE',
            severity: isHistorical ? 'low' : 'high',
            file,
            line: ctx.lineOf(text, m.index),
            field: m[1],
            value: m[2],
            expectation: `year within ${projectEpochYear}..${maxYear}`,
          });
        }
      }

      for (const [re, kind, sev] of [
        [NULL_HASH, 'NULL_CONTENT_HASH', 'high'],
        [ALL_ZERO_HASH, 'ALL_ZERO_HASH', 'high'],
        [PLACEHOLDER_UUID, 'PLACEHOLDER_UUID', 'medium'],
      ]) {
        re.lastIndex = 0;
        let mm;
        while ((mm = re.exec(text))) {
          push({
            kind,
            severity: isHistorical ? 'low' : sev,
            file,
            line: ctx.lineOf(text, mm.index),
            excerpt: mm[0].slice(0, 120),
          });
        }
      }
    }

    for (const [re, kind, sev] of [
      [LOCALHOST, 'LOCALHOST_ENDPOINT', 'medium'],
      [EXAMPLE_DOMAIN, 'EXAMPLE_DOMAIN', 'low'],
    ]) {
      re.lastIndex = 0;
      let mm;
      while ((mm = re.exec(text))) {
        push({ kind, severity: sev, file, line: ctx.lineOf(text, mm.index), excerpt: mm[0] });
      }
    }

    if (isAuthority) {
      TODO_MARKER.lastIndex = 0;
      let mm;
      while ((mm = TODO_MARKER.exec(text))) {
        push({
          kind: 'TODO_IN_AUTHORITY_FILE',
          severity: 'medium',
          file,
          line: ctx.lineOf(text, mm.index),
          excerpt: mm[0],
        });
      }
    }
  }

  const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of findings) bySeverity[f.severity] = (bySeverity[f.severity] ?? 0) + 1;

  return {
    findingCount: findings.length,
    bySeverity,
    byKind: findings.reduce((acc, f) => ({ ...acc, [f.kind]: (acc[f.kind] ?? 0) + 1 }), {}),
    findings: findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line),
  };
}
