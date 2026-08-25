/**
 * Graph-aware mission-context queries (Wesley's unified-loop proposal, item
 * 6): preflight shouldn't return only flat keyword-matched facts, it should
 * be able to answer real questions against the knowledge graph. This module
 * is honest about what's actually queryable today: the raw intelligence
 * index (work-progress/harvest-intelligence-index.json) already carries a
 * real relationships[] array and real supersededBy/lifecycleState fields per
 * entity — this walks those for real, rather than fabricating graph data
 * that doesn't exist. The OP-00A pipeline's richer relationship-edge
 * vocabulary (ENABLES, REQUIRES_EVIDENCE, PREVENTS, ...) is a separate,
 * intentionally-distinct store (see operational-intelligence-envelope-v1.md's
 * "reuse primitives, not product meaning" boundary) that this repo doesn't
 * have a local, queryable mirror of yet — so a query for "what enables this
 * capability" answers truthfully from whatever edges exist in the raw index
 * today (currently mostly `observedIn`, from every /goldmine run), and is
 * structurally ready to answer richer questions the moment richer edge types
 * are written into the same index.
 */
import fs from 'node:fs';
import path from 'node:path';

function loadJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function matchesAny(text, needles) {
  if (!needles || needles.length === 0) return true;
  const haystack = String(text ?? '').toLowerCase();
  return needles.some((needle) => haystack.includes(String(needle).toLowerCase()));
}

/** The raw entity/relationship authority — richer than the compact harvest-intelligence.json slice. */
export function loadRawIntelligenceEntities(repoRoot) {
  const index = loadJsonSafe(path.join(repoRoot, 'work-progress/harvest-intelligence-index.json'));
  return index?.entities ?? [];
}

/**
 * What knowledge was recently corrected or superseded? A real field on every
 * raw entity, never surfaced by the compact bundle until now.
 */
export function queryRecentlyCorrectedOrSuperseded(entities, needles = []) {
  return entities
    .filter((e) => e.supersededBy != null || (e.lifecycleState && e.lifecycleState !== 'active'))
    .filter((e) => matchesAny(`${e.identity?.conceptKey} ${e.dimensions?.ownerRepo}`, needles))
    .slice(0, 15)
    .map((e) => ({
      entityId: e.entityId,
      conceptKey: e.identity?.conceptKey ?? null,
      ownerRepo: e.dimensions?.ownerRepo ?? null,
      lifecycleState: e.lifecycleState ?? null,
      supersededBy: e.supersededBy ?? null,
    }));
}

/**
 * What relationships does this concept actually have in the graph? Real
 * traversal over entity.relationships[] — answers "what enables this
 * capability", "what is this required by", etc. for whatever edge types the
 * matched entities actually carry.
 */
export function queryRelationshipGraph(entities, { concepts = [], repos = [] } = {}) {
  const needles = [...concepts, ...repos];
  const matched = entities.filter((e) =>
    matchesAny(`${e.identity?.conceptKey} ${e.dimensions?.ownerRepo}`, needles),
  );

  return matched.slice(0, 15).map((e) => ({
    entityId: e.entityId,
    conceptKey: e.identity?.conceptKey ?? null,
    edges: (e.relationships ?? []).map((r) => ({ type: r.type, target: r.target })),
  }));
}

/** Evidence flagged by name but not yet resolved into a governed entity. */
export function queryUnmodeledEvidence(harvestRows, needles = []) {
  return harvestRows
    .filter((r) => r.retrievalClass === 'UNMODELED_QUEUE_POINTER')
    .filter((r) => needles.length === 0 || matchesAny(r.conceptKey, needles))
    .slice(0, 15)
    .map((r) => ({ queueId: r.queueId, conceptKey: r.conceptKey, lifecycleState: r.lifecycleState }));
}

const DECISION_ROW_PATTERN = /^\|(.+)\|\s*$/;

/** Parses decisions/DECISION_LOG.md's table — the real, human-authored governance record. */
export function parseDecisionLog(repoRoot) {
  const filePath = path.join(repoRoot, 'decisions/DECISION_LOG.md');
  let text;
  try {
    text = fs.readFileSync(filePath, 'utf8');
  } catch {
    return [];
  }

  const lines = text.split('\n').filter((line) => DECISION_ROW_PATTERN.test(line));
  const rows = lines
    .map((line) => line.slice(1, -1).split('|').map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 6 && !/^-+$/.test(cells[0]) && cells[0] !== 'Date');

  return rows.map(([date, decisionId, decision, why, owner, relatedFile]) => ({
    date,
    decisionId: decisionId.replace(/`/g, ''),
    decision,
    why,
    owner,
    relatedFile: relatedFile.replace(/`/g, ''),
  }));
}

/** What decisions govern this subsystem? */
export function queryGoverningDecisions(decisions, needles = []) {
  return decisions
    .filter((d) => matchesAny(`${d.decision} ${d.why} ${d.relatedFile} ${d.owner}`, needles))
    .slice(0, 15);
}
