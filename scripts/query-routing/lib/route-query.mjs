export function routePatterns(route) {
  return route.keywords ?? route.matchPatterns ?? [];
}

export function routePrimaryDataset(route) {
  return route.primaryDataset ?? route.primaryDatasetId ?? null;
}

export function routeSupportingDatasets(route) {
  if (Array.isArray(route.supportingDatasets)) return route.supportingDatasets;
  const primary = routePrimaryDataset(route);
  const datasetIds = route.datasetIds ?? [];
  if (!primary) return datasetIds;
  return datasetIds.filter((id) => id !== primary);
}

function scoreRoute(query, route) {
  const q = String(query ?? "").toLowerCase();
  let score = 0;
  for (const kw of routePatterns(route)) {
    if (q.includes(String(kw).toLowerCase())) score += 1;
  }
  return score;
}

export function routeQuery(query, routing) {
  const routes = routing?.routes ?? [];
  let best = null;
  let bestScore = 0;
  for (const route of routes) {
    const s = scoreRoute(query, route);
    if (s > bestScore) {
      bestScore = s;
      best = route;
    }
  }

  if (!best || bestScore === 0) {
    const fallback = routing?.fallback ?? routing?.defaultRoute ?? {
      primaryDataset: "intelligence-hub-index",
      supportingDatasets: ["active-ledger"],
      compactOnly: true,
    };
    const primaryDataset = routePrimaryDataset(fallback);
    return {
      ok: true,
      queryClass: fallback.queryClass ?? "fallback",
      matchScore: 0,
      primaryDataset,
      supportingDatasets: routeSupportingDatasets(fallback),
      datasetIds:
        fallback.datasetIds ??
        [primaryDataset, ...routeSupportingDatasets(fallback)].filter(Boolean),
      compactOnly: fallback.compactOnly ?? true,
      routed: false,
    };
  }

  const primaryDataset = routePrimaryDataset(best);
  return {
    ok: true,
    queryClass: best.queryClass,
    matchScore: bestScore,
    primaryDataset,
    supportingDatasets: routeSupportingDatasets(best),
    datasetIds:
      best.datasetIds ??
      [primaryDataset, ...routeSupportingDatasets(best)].filter(Boolean),
    compactOnly: best.compactOnly ?? true,
    routed: true,
  };
}

export function listDatasetsForQuery(query, routing) {
  const route = routeQuery(query, routing);
  const datasets = new Set(
    route.datasetIds?.length
      ? route.datasetIds
      : [route.primaryDataset, ...(route.supportingDatasets ?? [])].filter(Boolean),
  );
  return { ok: true, route, datasets: [...datasets] };
}
