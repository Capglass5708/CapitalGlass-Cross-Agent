/**
 * Pass 2 — script reachability.
 * Every executable is classified by inbound edge. A script with no inbound
 * edge from package.json, a workflow, the import graph, a documented manual
 * command, or a test harness is ORPHANED_CANDIDATE — it must not blend into
 * the active architecture.
 */
export const id = 'scriptReachability';

const CLASSES = [
  'PACKAGE_ENTRYPOINT',
  'CI_ENTRYPOINT',
  'IMPORTED_LIBRARY',
  'SPAWNED_BY_PATH_REFERENCE',
  'MANUAL_DOCUMENTED_ENTRYPOINT',
  'TEST_ONLY',
  'FIXTURE_ONLY',
  'ORPHANED_TRANSITIVE',
  'ORPHANED_CANDIDATE',
];

export function run(ctx) {
  const scripts = ctx.files.filter((f) => /^scripts\/.*\.(mjs|js|sh|ps1)$/.test(f));
  const pkgScripts = ctx.packageJson.scripts ?? {};
  const pkgText = JSON.stringify(pkgScripts);

  const workflowFiles = ctx.files.filter((f) => /^\.github\/workflows\/.*\.ya?ml$/.test(f));
  const workflowText = workflowFiles.map((f) => ctx.read(f) ?? '').join('\n');

  // Documented manual commands: any fenced/inline reference in docs-class files.
  const docFiles = ctx.files.filter((f) => /^(docs|runbooks|harvest|README\.md|AGENT_START_HERE\.md)/.test(f) && /\.md$/.test(f));
  const docText = docFiles.map((f) => ctx.read(f) ?? '').join('\n');

  // Import graph across all scripts.
  const importEdges = new Map();
  for (const f of scripts) {
    const text = ctx.read(f);
    if (!text) continue;
    const re = /(?:from\s+['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"])/g;
    let m;
    while ((m = re.exec(text))) {
      const spec = m[1] ?? m[2];
      if (!spec || !spec.startsWith('.')) continue;
      const target = new URL(spec, `file:///${f}`).pathname.replace(/^\//, '');
      const normalized = target.endsWith('.mjs') || target.endsWith('.js') ? target : `${target}.mjs`;
      if (!importEdges.has(normalized)) importEdges.set(normalized, new Set());
      importEdges.get(normalized).add(f);
    }
  }

  // Path-string references: a worker spawned via path.join(ROOT, "scripts/...")
  // is a real inbound edge that the static import graph cannot see.
  const pathRefs = new Map();
  for (const f of scripts) {
    const text = ctx.read(f);
    if (!text) continue;
    for (const target of scripts) {
      if (target === f) continue;
      if (text.includes(target)) {
        if (!pathRefs.has(target)) pathRefs.set(target, new Set());
        pathRefs.get(target).add(f);
      }
    }
  }

  const firstPass = scripts.map((f) => {
    const base = f.split('/').pop();
    const importers = [...(importEdges.get(f) ?? [])];
    const inPackage = pkgText.includes(f) || pkgText.includes(base);
    const inWorkflow = workflowText.includes(f) || workflowText.includes(base);
    const inDocs = docText.includes(f) || docText.includes(base);
    const isTest = /^scripts\/tests\//.test(f);
    const isFixture = /\/(fixtures|schema)\//.test(f);
    const referencedBy = [...(pathRefs.get(f) ?? [])];

    let classification;
    if (inPackage) classification = 'PACKAGE_ENTRYPOINT';
    else if (inWorkflow) classification = 'CI_ENTRYPOINT';
    else if (importers.length > 0) classification = 'IMPORTED_LIBRARY';
    else if (referencedBy.length > 0) classification = 'SPAWNED_BY_PATH_REFERENCE';
    else if (inDocs) classification = 'MANUAL_DOCUMENTED_ENTRYPOINT';
    else if (isFixture) classification = 'FIXTURE_ONLY';
    else if (isTest) classification = 'TEST_ONLY';
    else classification = 'ORPHANED_CANDIDATE';

    return {
      path: f,
      classification,
      referencedBy,
      inboundEdges: {
        packageJson: inPackage,
        workflow: inWorkflow,
        importers: importers.length,
        pathReferences: referencedBy.length,
        documented: inDocs,
      },
    };
  });

  // Second pass: an edge from a script that is itself orphaned is not a
  // live edge. Demote to ORPHANED_TRANSITIVE so the distinction is explicit.
  const orphanSet = new Set(firstPass.filter((e) => e.classification === 'ORPHANED_CANDIDATE').map((e) => e.path));
  const entries = firstPass.map((e) => {
    if (e.classification !== 'SPAWNED_BY_PATH_REFERENCE' && e.classification !== 'MANUAL_DOCUMENTED_ENTRYPOINT') return e;
    const liveRefs = e.referencedBy.filter((r) => !orphanSet.has(r));
    if (e.classification === 'SPAWNED_BY_PATH_REFERENCE' && liveRefs.length === 0) {
      return { ...e, classification: 'ORPHANED_TRANSITIVE', note: 'only referenced by orphaned scripts' };
    }
    return e;
  });

  const counts = Object.fromEntries(CLASSES.map((c) => [c, entries.filter((e) => e.classification === c).length]));
  return {
    classes: CLASSES,
    counts,
    totalScripts: entries.length,
    orphanCandidates: entries.filter((e) => e.classification === 'ORPHANED_CANDIDATE').map((e) => e.path),
    entries,
  };
}
