import fs from "node:fs";
import path from "node:path";

import { validateGoldMineEvidenceProjectionSchema, validateGoldMineEvidenceProjectionV2Schema } from "./schema-validate.mjs";

const ORDINAL_ONLY_RE = /^(GOLD|HP|OUT|OG|TW|OF|ED|EVT)-\d{3,4}$/i;
const SHA40_RE = /^[0-9a-f]{40}$/i;
const DIGEST_LIKE_RE = /^(sha256:|digest:|candidateDigest:|contentHash:|[0-9a-f]{64})/i;

const SIGNAL_CLASSES = new Set([
  "PROBLEM_SIGNAL",
  "RESOLUTION_SIGNAL",
  "ADOPTION_SIGNAL",
  "PERFORMANCE_SIGNAL",
  "OPERATOR_FRICTION_SIGNAL",
  "AGENT_FRICTION_SIGNAL",
  "OBSERVABILITY_GAP",
  "BUSINESS_WORKFLOW_SIGNAL",
  "SUCCESS_PATTERN",
]);

const BUSINESS_IMPACTS = new Set([
  "PLATFORM_INTERNAL",
  "OPERATOR_PRODUCTIVITY",
  "ESTIMATING",
  "DOCUMENT_PROCESSING",
  "BID_TURNAROUND",
  "PROPOSAL_QUALITY",
  "DATA_QUALITY",
  "CUSTOMER_DELIVERY",
  "BUSINESS_RELIABILITY",
]);

const EVIDENCE_ERAS = new Set([
  "PRE_IMPLEMENTATION",
  "IMPLEMENTATION_WAVE",
  "POST_IMPLEMENTATION",
  "UNKNOWN",
]);

const IMPLEMENTATION_STATES = new Set([
  "OBSERVED_OPEN",
  "IMPLEMENTED_IN_THREAD",
  "VERIFIED_FIXED",
  "ADOPTED",
  "PARTIAL",
  "BLOCKED",
  "UNKNOWN",
]);

const NOVELTY_VALUES = new Set([
  "NEW",
  "KNOWN_EXISTING",
  "RECURRENCE",
  "REGRESSION",
  "RESOLUTION_EVIDENCE",
  "UNKNOWN_PENDING_DEDUP",
]);

const EFFECTIVENESS_VALUES = new Set([
  "PROVEN_EFFECTIVE",
  "PARTIAL",
  "NO_OBSERVABLE_EFFECT_YET",
  "INEFFECTIVE",
  "REGRESSED",
]);

const COVERAGE_STATES = new Set(["OBSERVED", "NOT_OBSERVED", "UNKNOWN"]);

function isStableRef(value) {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (ORDINAL_ONLY_RE.test(trimmed)) return false;
  if (SHA40_RE.test(trimmed)) return true;
  if (DIGEST_LIKE_RE.test(trimmed)) return true;
  if (trimmed.includes("@") && trimmed.length > 20) return true;
  if (trimmed.includes("/") || trimmed.includes(":")) return true;
  return trimmed.length >= 16;
}

function warnRef(warnings, context, field, value) {
  if (!value) return;
  if (!isStableRef(value)) {
    warnings.push(
      `gold-mine projection ${context}: ${field} "${value}" looks ordinal-only — use digest/hash/workPackageId`,
    );
  }
}

/**
 * Warn-only Gold Mine v1.1 projection validation.
 * @param {{ runDir: string; manifest: object; tier?: string }} opts
 */
export function validateGoldMineEvidenceProjection({ runDir, manifest, tier }) {
  const warnings = [];
  const projectionPath = path.join(runDir, "gold-mine-evidence-projections-v1.json");

  const goldMineMeta = manifest.goldMineHarvest ?? {};
  if (goldMineMeta.noSuppressionDeclared !== true) {
    warnings.push(
      "goldMineHarvest.noSuppressionDeclared not true — confirm distinct improvement signals were not suppressed",
    );
  }

  if (!fs.existsSync(projectionPath)) {
    if (tier && ["T2", "T3"].includes(tier)) {
      warnings.push(
        "gold-mine-evidence-projections-v1.json missing for T2+ v1.1 harvest — Gold Mine ingest will lack structured projections",
      );
    }
    return { skipped: false, warnings, projectionPath: null, projectionCount: 0 };
  }

  let projectionDoc;
  try {
    projectionDoc = JSON.parse(fs.readFileSync(projectionPath, "utf8"));
  } catch (err) {
    warnings.push(`gold-mine-evidence-projections-v1.json unreadable: ${err.message}`);
    return { skipped: false, warnings, projectionPath, projectionCount: 0 };
  }

  const schemaResult = validateGoldMineEvidenceProjectionSchema(projectionDoc);
  if (!schemaResult.ok) {
    for (const err of schemaResult.errors) {
      warnings.push(`gold-mine projection schema (warn-only): ${err}`);
    }
  }

  if (projectionDoc.harvestId && manifest.harvestId && projectionDoc.harvestId !== manifest.harvestId) {
    warnings.push(
      `gold-mine projection harvestId ${projectionDoc.harvestId} !== manifest ${manifest.harvestId}`,
    );
  }

  if (projectionDoc.sourceCommitSha && !SHA40_RE.test(projectionDoc.sourceCommitSha)) {
    warnings.push("gold-mine projection sourceCommitSha is not a 40-char SHA");
  }

  validateCorpusBias(projectionDoc.corpusBias, warnings);
  validateProductCoverage(projectionDoc.productWorkflowCoverage, warnings);

  const projections = projectionDoc.projections ?? [];
  if (projections.length === 0) {
    warnings.push("gold-mine projections array is empty — expected at least one classified signal for v1.1 reference harvest");
  }

  for (const p of projections) {
    const ctx = p.projectionId || "?";
    if (!p.signalClass || !SIGNAL_CLASSES.has(p.signalClass)) {
      warnings.push(`gold-mine projection ${ctx}: invalid or missing signalClass`);
    }
    if (p.businessImpact && !BUSINESS_IMPACTS.has(p.businessImpact)) {
      warnings.push(`gold-mine projection ${ctx}: invalid businessImpact ${p.businessImpact}`);
    }
    if (p.evidenceEra && !EVIDENCE_ERAS.has(p.evidenceEra)) {
      warnings.push(`gold-mine projection ${ctx}: invalid evidenceEra ${p.evidenceEra}`);
    }
    if (p.implementationState && !IMPLEMENTATION_STATES.has(p.implementationState)) {
      warnings.push(`gold-mine projection ${ctx}: invalid implementationState ${p.implementationState}`);
    }
    if (p.novelty && !NOVELTY_VALUES.has(p.novelty)) {
      warnings.push(`gold-mine projection ${ctx}: invalid novelty ${p.novelty}`);
    }
    if (!p.evidenceRefs?.length) {
      warnings.push(`gold-mine projection ${ctx}: missing evidenceRefs`);
    }

    warnRef(warnings, ctx, "candidateDigestRef", p.candidateDigestRef);
    warnRef(warnings, ctx, "implementationDigestRef", p.implementationDigestRef);
    warnRef(warnings, ctx, "workPackageId", p.workPackageId);

    for (const field of ["resolves", "supersedes", "adopts", "validatesExisting", "contradicts", "regresses"]) {
      for (const ref of p[field] ?? []) {
        warnRef(warnings, ctx, field, ref);
      }
    }

    if (
      p.signalClass === "RESOLUTION_SIGNAL" &&
      p.implementationState &&
      !["VERIFIED_FIXED", "ADOPTED", "PARTIAL"].includes(p.implementationState)
    ) {
      warnings.push(
        `gold-mine projection ${ctx}: RESOLUTION_SIGNAL should pair with VERIFIED_FIXED|ADOPTED|PARTIAL implementationState`,
      );
    }
    if (p.signalClass === "PROBLEM_SIGNAL" && p.implementationState === "VERIFIED_FIXED") {
      warnings.push(
        `gold-mine projection ${ctx}: PROBLEM_SIGNAL with VERIFIED_FIXED — use RESOLUTION_SIGNAL or split problem/resolution`,
      );
    }
  }

  return {
    skipped: false,
    warnings,
    projectionPath,
    projectionCount: projections.length,
    schemaOk: schemaResult.ok,
  };
}

/**
 * Warn-only Gold Mine v2 projection validation (P1 expansion).
 * @param {{ runDir: string; manifest: object }} opts
 */
export function validateGoldMineEvidenceProjectionV2({ runDir, manifest }) {
  const warnings = [];
  const projectionPath = path.join(runDir, "gold-mine-evidence-projections-v2.json");
  if (!fs.existsSync(projectionPath)) {
    return { skipped: true, warnings, projectionPath: null, projectionCount: 0 };
  }

  let projectionDoc;
  try {
    projectionDoc = JSON.parse(fs.readFileSync(projectionPath, "utf8"));
  } catch (err) {
    warnings.push(`gold-mine-evidence-projections-v2.json unreadable: ${err.message}`);
    return { skipped: false, warnings, projectionPath, projectionCount: 0 };
  }

  const schemaResult = validateGoldMineEvidenceProjectionV2Schema(projectionDoc);
  if (!schemaResult.ok) {
    for (const err of schemaResult.errors) {
      warnings.push(`gold-mine projection v2 schema (warn-only): ${err}`);
    }
  }

  if (projectionDoc.harvestId && manifest.harvestId && projectionDoc.harvestId !== manifest.harvestId) {
    warnings.push(
      `gold-mine projection v2 harvestId ${projectionDoc.harvestId} !== manifest ${manifest.harvestId}`,
    );
  }

  const expansionReceiptPath = path.join(runDir, "intelligence-expansion-receipt.json");
  if (fs.existsSync(expansionReceiptPath)) {
    try {
      const receipt = JSON.parse(fs.readFileSync(expansionReceiptPath, "utf8"));
      if (receipt.sourceSectionsDropped > 0) {
        warnings.push(
          `intelligence expansion dropped ${receipt.sourceSectionsDropped} sections — lossless contract violated`,
        );
      }
    } catch {
      warnings.push("intelligence-expansion-receipt.json unreadable");
    }
  }

  return {
    skipped: false,
    warnings,
    projectionPath,
    projectionCount: (projectionDoc.projections ?? []).length,
    schemaOk: schemaResult.ok,
  };
}

function validateCorpusBias(corpusBias, warnings) {
  if (!corpusBias) {
    warnings.push("gold-mine projection missing corpusBias — required for v1.1 corpus coverage reporting");
    return;
  }
  if (!corpusBias.corpusBiasWarning?.trim()) {
    warnings.push("corpusBias.corpusBiasWarning empty — state SDLC vs product observation bias explicitly");
  }
  if (!Array.isArray(corpusBias.underObservedDomains) || corpusBias.underObservedDomains.length === 0) {
    warnings.push("corpusBias.underObservedDomains empty — list product domains not observed in thread");
  }
  const dist = corpusBias.evidenceDomainDistribution;
  if (!dist || typeof dist !== "object") {
    warnings.push("corpusBias.evidenceDomainDistribution missing");
    return;
  }
  const total = Object.values(dist).reduce((a, b) => a + (Number(b) || 0), 0);
  if (total <= 0) {
    warnings.push("corpusBias.evidenceDomainDistribution has zero weight — populate from thread evidence");
  }
}

function validateProductCoverage(coverage, warnings) {
  if (!coverage) {
    warnings.push("gold-mine projection missing productWorkflowCoverage matrix");
    return;
  }
  for (const [key, value] of Object.entries(coverage)) {
    if (!COVERAGE_STATES.has(value)) {
      warnings.push(`productWorkflowCoverage.${key} invalid state: ${value}`);
    }
  }
}

/**
 * Warn on outcome packets missing effectiveness (from manifest packets).
 * @param {object} manifest
 * @param {string[]} warnings
 */
export function validateOutcomePackets(manifest, warnings) {
  for (const packet of manifest.packets ?? []) {
    if (packet.packetKind !== "outcome") continue;
    const eff = packet.effectiveness ?? packet.outcomeEffectiveness;
    if (!eff || !EFFECTIVENESS_VALUES.has(eff)) {
      warnings.push(
        `outcome packet ${packet.packetId}: missing or invalid effectiveness enum`,
      );
    }
    if (!packet.beforeState || !packet.afterState) {
      warnings.push(`outcome packet ${packet.packetId}: missing beforeState or afterState`);
    }
  }
}

export { EFFECTIVENESS_VALUES };
