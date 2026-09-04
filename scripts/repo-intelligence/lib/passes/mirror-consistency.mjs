/**
 * Pass 4 — mirror/source consistency.
 * Any file declared as a generated mirror must have a formal relationship to
 * its source. A projection ahead of its source is SOURCE_PROJECTION_DRIFT —
 * the failure mode where the "generated" copy silently became authoritative.
 */
export const id = 'mirrorConsistency';

const VERSION_RE = /(?:^#.*?\bv(\d+(?:\.\d+)*)\s*$|version[":\s]+v?(\d+(?:\.\d+)*))/im;

function declaredVersion(text) {
  if (!text) return null;
  const head = text.split('\n').slice(0, 5).join('\n');
  const m = VERSION_RE.exec(head);
  return m ? (m[1] ?? m[2]) : null;
}

function cmpVersion(a, b) {
  if (!a || !b) return 0;
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

/** Pairs are discovered by basename match across a declared projection root. */
export function run(ctx, { projections = [] } = {}) {
  const pairs = [];
  for (const spec of projections) {
    const projectionFiles = ctx.files.filter((f) => f.startsWith(spec.projectionRoot) && f.endsWith('.md'));
    for (const projection of projectionFiles) {
      const base = projection.split('/').pop();
      const source = spec.sourceRoots
        .map((root) => ctx.files.find((f) => f.startsWith(root) && f.split('/').pop().toLowerCase() === base.toLowerCase()))
        .find(Boolean);
      const projText = ctx.read(projection);
      if (!source) {
        pairs.push({
          projection,
          source: null,
          mode: spec.mode,
          expectedRelation: spec.expectedRelation,
          actualRelation: 'SOURCE_MISSING',
          projectionVersion: declaredVersion(projText),
          sourceVersion: null,
          projectionLines: projText ? projText.split('\n').length : 0,
          sourceLines: 0,
        });
        continue;
      }
      const srcText = ctx.read(source);
      const pv = declaredVersion(projText);
      const sv = declaredVersion(srcText);
      const projLines = projText ? projText.split('\n').length : 0;
      const srcLines = srcText ? srcText.split('\n').length : 0;
      const versionCmp = cmpVersion(pv, sv);
      let actualRelation = 'NORMALIZED_CONTENT_EQUAL';
      if (projText !== srcText) {
        actualRelation = versionCmp > 0 ? 'PROJECTION_AHEAD_OF_SOURCE' : versionCmp < 0 ? 'SOURCE_AHEAD_OF_PROJECTION' : 'DRIFT';
      }
      pairs.push({
        projection,
        source,
        mode: spec.mode,
        expectedRelation: spec.expectedRelation,
        actualRelation,
        sourceVersion: sv,
        projectionVersion: pv,
        sourceLines: srcLines,
        projectionLines: projLines,
        lineDelta: projLines - srcLines,
      });
    }
  }
  const drifted = pairs.filter((p) => p.actualRelation !== p.expectedRelation);
  return {
    pairsChecked: pairs.length,
    driftCount: drifted.length,
    projectionAheadOfSource: pairs.filter((p) => p.actualRelation === 'PROJECTION_AHEAD_OF_SOURCE').length,
    sourceMissing: pairs.filter((p) => p.actualRelation === 'SOURCE_MISSING').length,
    pairs: pairs.sort((a, b) => a.projection.localeCompare(b.projection)),
  };
}
