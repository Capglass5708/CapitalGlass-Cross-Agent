/**
 * Lossless ChatGPT findings → intelligence expansion (P1-A).
 */
import fs from "node:fs";
import path from "node:path";

import { hashFileContent, sha256Hex } from "./hash.mjs";
import { extractSectionByAnchor } from "./source-roundtrip-lib.mjs";
import {
  entityIdFromConcept,
  observationIdFrom,
  loadIntelligenceIndex,
  saveIntelligenceIndex,
} from "./intelligence-index-lib.mjs";
import { REPO_ROOT } from "./paths.mjs";
import { upsertUnmodeledEntry, loadUnmodeledQueue, saveUnmodeledQueue } from "./unmodeled-intelligence-queue-lib.mjs";

const KNOWN_NARRATIVE_SECTIONS = new Set([
  "retrieval preface",
  "executive summary",
  "executive top 5 roi",
  "top 5 immediate roi",
  "top 5 systemic leverage and shared root causes",
  "top 5 strategic compounding",
  "domain highlights",
  "systemic patterns and cross-repository opportunities",
  "concepts detected / implant candidates",
  "automation candidates",
  "token-reduction opportunities",
  "consolidated improvements",
  "rejected or low-value ideas",
  "unknowns and required cursor verification",
  "improvement hub packet drafts",
  "master graph contribution proposal",
  "exact next actions for cursor",
  "final summary",
  "harvest verdict and tier rationale",
  "retrieval preflight",
  "thread event inventory",
  "product workflow coverage",
  "corpus bias",
  "future agent instructions",
]);

function slugifyAnchor(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * @param {string} content
 * @returns {Array<{ level: number, title: string, anchor: string, body: string, startLine: number }>}
 */
export function parseMarkdownSections(content) {
  const lines = content.split("\n");
  const sections = [];
  let current = null;

  const flush = () => {
    if (!current) return;
    current.body = current.bodyLines.join("\n").trimEnd();
    delete current.bodyLines;
    sections.push(current);
    current = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const hm = line.match(/^(#{2,6})\s+(.+)$/);
    if (hm) {
      flush();
      const title = hm[2].trim();
      const idMatch = title.match(/^(EVT|HP|OUT|ED|TW|DUP|OF|OG|IM|SR)-(\d+)/i);
      const anchor = idMatch ? `${idMatch[1].toLowerCase()}-${idMatch[2]}` : slugifyAnchor(title);
      current = {
        level: hm[1].length,
        title,
        anchor,
        bodyLines: [],
        startLine: i + 1,
      };
      continue;
    }
    if (current) current.bodyLines.push(line);
  }
  flush();
  return sections;
}

function classifySection(section) {
  const idMatch = section.title.match(/^(EVT|HP|OUT|ED|TW|DUP|OF|OG|IM|SR)-(\d+)/i);
  if (idMatch) {
    return { kind: "structured", prefix: idMatch[1].toUpperCase(), code: `${idMatch[1].toUpperCase()}-${idMatch[2]}` };
  }
  const titleLower = section.title.toLowerCase();
  if (KNOWN_NARRATIVE_SECTIONS.has(titleLower)) {
    return { kind: "narrative", prefix: "NARRATIVE" };
  }
  if (/^a\.\d+/i.test(section.title) || /^b\.\d+/i.test(section.title)) {
    return { kind: "narrative", prefix: "NARRATIVE" };
  }
  return { kind: "extension", prefix: "UNKNOWN" };
}

function signalClassForPrefix(prefix, body) {
  switch (prefix) {
    case "EVT":
      return "BUSINESS_WORKFLOW_SIGNAL";
    case "IM":
      if (/failure|blocked|warn/i.test(body)) return "OPERATOR_FRICTION_SIGNAL";
      if (/pattern|standard|automation/i.test(body)) return "SUCCESS_PATTERN";
      return "ADOPTION_SIGNAL";
    case "HP":
      return "PROBLEM_SIGNAL";
    case "OUT":
      return "RESOLUTION_SIGNAL";
    case "SR":
      return "PROBLEM_SIGNAL";
    default:
      return "BUSINESS_WORKFLOW_SIGNAL";
  }
}

function sectionExcerptForHash(section) {
  const hashes = "#".repeat(section.level);
  if (!section.body) return `${hashes} ${section.title}`;
  return `${hashes} ${section.title}\n${section.body}`.trimEnd();
}

function conceptKeyFromSection(section, classification) {
  if (classification.code) return classification.code;
  return `section:${slugifyAnchor(section.title)}`;
}

/**
 * @param {object} params
 */
export function expandIntelligenceFromSource(params) {
  const {
    harvestId,
    sourceRelPath,
    repoRoot = REPO_ROOT,
    sourceCommitSha = null,
    manifest = null,
  } = params;

  const absSource = path.join(repoRoot, sourceRelPath);
  const content = fs.readFileSync(absSource, "utf8");
  const sections = parseMarkdownSections(content);

  const receipt = {
    schemaVersion: "harvest-intelligence-expansion-receipt-v1",
    harvestId,
    expandedAt: new Date().toISOString(),
    sourceRelPath,
    sourceFileHash: hashFileContent(content),
    sourceSectionsTotal: sections.length,
    sourceSectionsDropped: 0,
    structuredSections: 0,
    narrativeSections: 0,
    extensionSections: 0,
    projectionsEmitted: 0,
    entitiesTouched: 0,
    unmodeledAdded: 0,
    extensionsPreserved: 0,
    verdict: "PASS",
  };

  const projections = [];
  const expansionEntities = [];
  const extensions = [];
  const queue = loadUnmodeledQueue(repoRoot);

  for (const section of sections) {
    if (!section.body && section.title.length < 3) {
      receipt.sourceSectionsDropped += 1;
      continue;
    }

    const classification = classifySection(section);
    const conceptKey = conceptKeyFromSection(section, classification);
    const rawRef = `${sourceRelPath}#${section.anchor}`;
    const excerpt =
      extractSectionByAnchor(content, section.anchor) ?? sectionExcerptForHash(section);
    const sourceExcerptHash = hashFileContent(excerpt);
    const entityId = entityIdFromConcept(conceptKey);
    const observationId = observationIdFrom(harvestId, section.anchor);

    const observation = {
      observationId,
      harvestId,
      workPackageId: harvestId,
      observedAt: new Date().toISOString(),
      source: {
        lane: "CHATGPT",
        rawRef,
        ordinalRef: section.anchor,
      },
      provenance: {
        sourceExcerptHash,
        sourceFileHash: receipt.sourceFileHash,
      },
      snapshot: {
        signalClass: signalClassForPrefix(classification.prefix, section.body),
        summary: section.title,
        bodyExcerpt: (section.body || "").slice(0, 500),
      },
    };

    if (classification.kind === "structured") {
      receipt.structuredSections += 1;
      const projectionId = `proj:${sha256Hex(`${harvestId}:${conceptKey}`).slice(0, 32)}`;
      projections.push({
        projectionId,
        packetId: conceptKey,
        signalClass: signalClassForPrefix(classification.prefix, section.body),
        lifecycleHint: classification.prefix === "OUT" ? "RESOLVED_OBSERVED" : "UNKNOWN",
        summary: section.title,
        evidenceRefs: [rawRef],
        extensions: {
          sectionPrefix: classification.prefix,
          sectionAnchor: section.anchor,
        },
      });
      expansionEntities.push({
        entityId,
        conceptKey,
        observation,
        dimensions: { sectionType: classification.prefix },
      });
    } else if (classification.kind === "narrative") {
      receipt.narrativeSections += 1;
      expansionEntities.push({
        entityId,
        conceptKey,
        observation,
        dimensions: { sectionType: "NARRATIVE" },
      });
    } else {
      receipt.extensionSections += 1;
      receipt.extensionsPreserved += 1;
      extensions.push({
        anchor: section.anchor,
        title: section.title,
        rawRef,
        sourceExcerptHash,
        body: section.body,
      });
      upsertUnmodeledEntry(
        queue,
        {
          proposedType: `SECTION:${section.anchor}`,
          sourceFinding: section.title,
          rawRef,
          sourceExcerptHash,
          inferredRelationships: [],
          confidence: "medium",
        },
        harvestId,
      );
      receipt.unmodeledAdded += 1;
    }
  }

  if (receipt.sourceSectionsDropped > 0) {
    receipt.verdict = "FAIL_SECTIONS_DROPPED";
  }

  receipt.projectionsEmitted = projections.length;
  receipt.entitiesTouched = expansionEntities.length;

  const projectionDoc = {
    schemaVersion: "gold-mine-evidence-projection-v2@1.0.0",
    harvestId,
    sourceCommitSha,
    projections,
    extensions: {
      narrativeSectionCount: receipt.narrativeSections,
      preservedUnknownSections: extensions,
    },
    corpusBias: extractCorpusBias(sections),
    productWorkflowCoverage: extractProductWorkflowCoverage(sections),
    futureAgentInstructions: extractFutureAgentInstructions(sections),
  };

  return {
    receipt,
    projectionDoc,
    expansionEntities,
    queue,
    sections,
  };
}

function sectionByTitleIncludes(sections, needle) {
  return sections.find((s) => s.title.toLowerCase().includes(needle.toLowerCase()));
}

function extractCorpusBias(sections) {
  const sec = sectionByTitleIncludes(sections, "corpus bias");
  if (!sec) return null;
  return {
    corpusBiasWarning: sec.body.slice(0, 500) || null,
    underObservedDomains: [],
    evidenceDomainDistribution: {},
  };
}

function extractProductWorkflowCoverage(sections) {
  const sec = sectionByTitleIncludes(sections, "product workflow");
  if (!sec) return null;
  const states = {};
  for (const key of [
    "computerEstimator",
    "humanEstimator",
    "documentCenter",
    "planSetProcessing",
    "ocrParser",
    "revuBluebeam",
    "bidComposer",
    "proposals",
    "vae",
    "scraper",
    "crossAppHandoffs",
    "operatorReentry",
  ]) {
    states[key] = /OBSERVED/i.test(sec.body) ? "OBSERVED" : "UNKNOWN";
  }
  return states;
}

function extractFutureAgentInstructions(sections) {
  const sec = sectionByTitleIncludes(sections, "future agent");
  if (!sec) return [];
  return sec.body
    .split("\n")
    .map((l) => l.replace(/^[-*]\s+/, "").trim())
    .filter(Boolean);
}

/**
 * Merge expansion entities into intelligence index (non-destructive).
 */
export function mergeExpansionIntoIntelligenceIndex(expansionEntities, harvestId, repoRoot = REPO_ROOT) {
  const index = loadIntelligenceIndex(repoRoot);
  const byId = new Map((index.entities || []).map((e) => [e.entityId, structuredClone(e)]));
  let newEntities = 0;
  let enrichedEntities = 0;
  let observationsAdded = 0;

  for (const item of expansionEntities) {
    let entity = byId.get(item.entityId);
    if (!entity) {
      entity = {
        entityId: item.entityId,
        identity: { conceptKey: item.conceptKey },
        dimensions: item.dimensions ?? {},
        observations: [],
        relationships: [],
        extensions: {},
      };
      byId.set(item.entityId, entity);
      newEntities += 1;
    } else {
      enrichedEntities += 1;
      entity.dimensions = { ...entity.dimensions, ...item.dimensions };
    }
    const exists = (entity.observations || []).some((o) => o.observationId === item.observation.observationId);
    if (!exists) {
      entity.observations = [...(entity.observations || []), item.observation];
      observationsAdded += 1;
    }
  }

  index.entities = [...byId.values()];
  saveIntelligenceIndex(index, repoRoot);
  return { newEntities, enrichedEntities, observationsAdded, entitiesAfter: index.entities.length };
}

export function writeExpansionArtifacts(runDir, result) {
  fs.mkdirSync(runDir, { recursive: true });
  const receiptPath = path.join(runDir, "intelligence-expansion-receipt.json");
  const projectionPath = path.join(runDir, "gold-mine-evidence-projections-v2.json");
  fs.writeFileSync(receiptPath, `${JSON.stringify(result.receipt, null, 2)}\n`, "utf8");
  fs.writeFileSync(projectionPath, `${JSON.stringify(result.projectionDoc, null, 2)}\n`, "utf8");
  return { receiptPath, projectionPath };
}
