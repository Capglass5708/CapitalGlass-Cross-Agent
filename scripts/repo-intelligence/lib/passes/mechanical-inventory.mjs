/** Pass 1 — scale and shape. Decides what a downstream agent must NOT scan. */
export const id = 'mechanicalInventory';

export function run(ctx) {
  const byDir = {};
  for (const f of ctx.files) {
    const top = f.includes('/') ? f.split('/')[0] : '<root>';
    byDir[top] = (byDir[top] ?? 0) + 1;
  }
  const total = ctx.files.length;
  const sorted = Object.entries(byDir).sort((a, b) => b[1] - a[1]);
  const dominant = sorted.filter(([, n]) => n / total > 0.2).map(([d, n]) => ({
    directory: d,
    files: n,
    shareOfRepo: Number((n / total).toFixed(4)),
  }));
  const stubs = sorted.filter(([d, n]) => n <= 1 && d !== '<root>').map(([d]) => d);

  return {
    totalTrackedFiles: total,
    byDirectory: Object.fromEntries(sorted),
    dominantDirectories: dominant,
    stubDirectories: stubs,
    scanGuidance: dominant.length
      ? `Do not scan ${dominant.map((d) => d.directory).join(', ')} exhaustively — ${dominant
          .map((d) => `${Math.round(d.shareOfRepo * 100)}%`)
          .join('/')} of the repo and machine-generated.`
      : 'No single directory dominates.',
  };
}
