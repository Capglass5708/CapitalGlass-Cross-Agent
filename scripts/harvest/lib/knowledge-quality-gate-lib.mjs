import fs from "node:fs";
import path from "node:path";

import { blindRetrieveFromSeeds } from "./blind-retrieval-lib.mjs";
import { validateHarvestSeedPacketSchema } from "./schema-validate.mjs";

export const QUALITY_RECEIPT_SCHEMA = "harvest-knowledge-quality-receipt-v1@1.0.0";
export const QUALITY_EVIDENCE_SCHEMA = "harvest-knowledge-quality-evidence-v1@1.0.0";
export const QUALITY_RECEIPT_FILENAME = "harvest-knowledge-quality-receipt-v1.json";
export const QUALITY_EVIDENCE_FILENAME = "knowledge-quality-evidence-v1.json";

export const REPRESENTATION_TYPES = new Set([
  "decision",
  "result",
  "failure",
  "mistake",
  "correction",
  "blocker",
  "command",
  "evidence",
  "repeated_work",
  "faster_path",
  "future_action",
  "protocol_improvement",
  "do_not_advance",
]);

export const CONFIDENCE_LEVELS = new Set([
  "VERIFIED",
  "PARTIALLY_VERIFIED",
  "OPERATOR_ASSERTED",
  "INFERRED",
  "UNKNOWN",
  "CONFLICTED",
]);

export const HUMAN_REVIEW_REASONS = new Set([
  "authority_model_change",
  "cross_repo_ownership_change",
  "security_policy_change",
  "destructive_migration_guidance",
  "unresolved_factual_conflict",
  "architecture_decision_without_operator_approval",
]);

const GENERIC_KEYWORDS = new Set([
  "harvest",
  "publication",
  "agent",
  "thread",
  "knowledge",
  "quality",
  "index",
  "git",
  "supabase",
]);

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function listSeedPackets(runDir) {
  const seedDir = path.join(runDir, "seed-packets");
  if (!fs.existsSync(seedDir)) return [];
  return fs
    .readdirSync(seedDir)
    .filter((name) => name.endsWith(".json") && name !== "seed-packet-index.json")
    .map((name) => JSON.parse(fs.readFileSync(path.join(seedDir, name), "utf8")));
}

function section(status, extra = {}) {
  return { status, ...extra };
}

export function isTestOnlyBypass(manifest) {
  const policy = manifest.publicationPolicy ?? {};
  return policy.syntheticFixture === true && policy.publicationEligibility === "TEST_ONLY";
}

export function assertKnowledgeQualityForStaging({ manifest, runDir }) {
  if (isTestOnlyBypass(manifest)) {
    return { bypassed: true, verdict: "TEST_ONLY_BYPASS", publicationEligibility: "TEST_ONLY" };
  }

  const receiptPath = path.join(runDir, QUALITY_RECEIPT_FILENAME);
  if (!fs.existsSync(receiptPath)) {
    throw new Error("BLOCKED_KNOWLEDGE_QUALITY:missing_receipt");
  }

  const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
  if (receipt.knowledgeVerdict !== "KNOWLEDGE_QUALITY_PASS") {
    throw new Error(`BLOCKED_KNOWLEDGE_QUALITY:${receipt.knowledgeVerdict}`);
  }
  if (receipt.publicationEligibility !== "DURABLE_PUBLICATION_READY") {
    throw new Error(`BLOCKED_KNOWLEDGE_QUALITY:${receipt.publicationEligibility}`);
  }
  if (receipt.harvestId !== manifest.harvestId) {
    throw new Error("BLOCKED_KNOWLEDGE_QUALITY:harvest_id_mismatch");
  }

  return { bypassed: false, receipt };
}

function validateEvidenceSchema(evidence) {
  const failures = [];
  if (!evidence || evidence.schemaVersion !== QUALITY_EVIDENCE_SCHEMA) {
    failures.push("KNOWLEDGE_EVIDENCE_SCHEMA_INVALID");
  }
  return failures;
}

function validateThreadCoverage(evidence, inventoryEvents) {
  const failures = [];
  const material = (evidence.materialEvents ?? []).filter((event) => event.material !== false);
  const inventoryIds = new Set((inventoryEvents ?? []).map((event) => event.id));
  const materialById = new Map(material.map((event) => [event.eventId, event]));
  let covered = 0;

  for (const invEvent of inventoryEvents ?? []) {
    const event = materialById.get(invEvent.id);
    if (!event) {
      failures.push(`THREAD_COVERAGE_HOLD:uncovered_inventory_event:${invEvent.id}`);
      continue;
    }
    const reps = new Set(event.representations ?? []);
    if (reps.size === 0) {
      failures.push(`THREAD_COVERAGE_HOLD:no_representation:${event.eventId}`);
      continue;
    }
    for (const rep of reps) {
      if (!REPRESENTATION_TYPES.has(rep)) {
        failures.push(`THREAD_COVERAGE_HOLD:invalid_representation:${event.eventId}:${rep}`);
      }
    }
    covered += 1;
  }

  for (const event of material) {
    if (!inventoryIds.has(event.eventId)) {
      failures.push(`THREAD_COVERAGE_HOLD:unknown_event:${event.eventId}`);
    }
  }

  const ratio = (inventoryEvents ?? []).length === 0
    ? 1
    : covered / (inventoryEvents ?? []).length;
  const status = failures.length === 0 && ratio === 1 ? "PASS" : "HOLD";
  return {
    failures,
    section: section(status, {
      materialEvents: (inventoryEvents ?? []).length,
      coveredEvents: covered,
      coverageRatio: ratio,
    }),
    verdict: status === "PASS" ? null : "THREAD_COVERAGE_HOLD",
  };
}

function validateDecisionIntegrity(evidence) {
  const failures = [];
  for (const decision of evidence.decisions ?? []) {
    const required = [
      "decision",
      "reason",
      "alternativesRejected",
      "consequences",
      "authority",
      "evidenceRefs",
    ];
    for (const field of required) {
      if (
        decision[field] === undefined ||
        decision[field] === null ||
        (Array.isArray(decision[field]) && decision[field].length === 0 && field !== "alternativesRejected")
      ) {
        if (field === "alternativesRejected" && !Array.isArray(decision.alternativesRejected)) {
          failures.push(`DECISION_INTEGRITY_HOLD:missing_${field}:${decision.id ?? "unknown"}`);
        } else if (field !== "alternativesRejected") {
          failures.push(`DECISION_INTEGRITY_HOLD:missing_${field}:${decision.id ?? "unknown"}`);
        }
      }
    }
    if (!Array.isArray(decision.alternativesRejected)) {
      failures.push(`DECISION_INTEGRITY_HOLD:missing_alternativesRejected:${decision.id ?? "unknown"}`);
    }
  }
  const status = failures.length === 0 ? "PASS" : "HOLD";
  return {
    failures,
    section: section(status, { decisionCount: (evidence.decisions ?? []).length }),
    verdict: status === "PASS" ? null : "DECISION_INTEGRITY_HOLD",
  };
}

function validateUserCorrections(evidence) {
  const failures = [];
  for (const correction of evidence.corrections ?? []) {
    const required = [
      "incorrectAgentClaim",
      "operatorCorrection",
      "correctedTruth",
      "futureAgentRule",
      "affectedRecords",
    ];
    for (const field of required) {
      if (!correction[field] || (Array.isArray(correction[field]) && correction[field].length === 0)) {
        failures.push(`USER_CORRECTION_MISSING:${field}:${correction.id ?? "unknown"}`);
      }
    }
  }
  const materialCorrections = (evidence.corrections ?? []).filter((entry) => entry.material !== false);
  const status = failures.length === 0 ? "PASS" : "HOLD";
  return {
    failures,
    section: section(status, { correctionCount: materialCorrections.length }),
    verdict: status === "PASS" ? null : "USER_CORRECTION_MISSING",
  };
}

function validateEvidenceCoverage(evidence) {
  const failures = [];
  let verified = 0;
  const claims = evidence.durableClaims ?? [];
  for (const claim of claims) {
    if (!CONFIDENCE_LEVELS.has(claim.confidence)) {
      failures.push(`EVIDENCE_COVERAGE_HOLD:invalid_confidence:${claim.id ?? "unknown"}`);
      continue;
    }
    if (claim.confidence === "VERIFIED" && !(claim.evidenceRefs?.length > 0)) {
      failures.push(`EVIDENCE_COVERAGE_HOLD:verified_without_evidence:${claim.id ?? "unknown"}`);
    }
    if (claim.confidence === "CONFLICTED" && !claim.reconciliation) {
      failures.push(`EVIDENCE_COVERAGE_HOLD:conflicted_without_reconciliation:${claim.id ?? "unknown"}`);
    }
    if (claim.confidence === "VERIFIED" || claim.confidence === "PARTIALLY_VERIFIED") {
      verified += 1;
    }
  }
  const ratio = claims.length === 0 ? 1 : verified / claims.length;
  const status = failures.length === 0 ? "PASS" : "HOLD";
  return {
    failures,
    section: section(status, {
      claimCount: claims.length,
      verifiedClaimRatio: ratio,
    }),
    verdict: status === "PASS" ? null : "EVIDENCE_COVERAGE_HOLD",
  };
}

function validateContradictions(evidence) {
  const failures = [];
  for (const item of evidence.contradictions ?? []) {
    if (!(item.claims?.length >= 2)) {
      failures.push(`CONTRADICTION_UNRESOLVED:missing_claims:${item.id ?? "unknown"}`);
    }
    if (!item.reconciliation?.trim()) {
      failures.push(`CONTRADICTION_UNRESOLVED:missing_reconciliation:${item.id ?? "unknown"}`);
    }
    if (!item.authority?.trim()) {
      failures.push(`CONTRADICTION_UNRESOLVED:missing_authority:${item.id ?? "unknown"}`);
    }
    if (item.resolved === false) {
      failures.push(`CONTRADICTION_UNRESOLVED:unresolved:${item.id ?? "unknown"}`);
    }
  }
  const status = failures.length === 0 ? "PASS" : "HOLD";
  return {
    failures,
    section: section(status, { contradictionCount: (evidence.contradictions ?? []).length }),
    verdict: status === "PASS" ? null : "CONTRADICTION_UNRESOLVED",
  };
}

function validateMistakes(evidence) {
  const failures = [];
  for (const mistake of evidence.mistakes ?? []) {
    const required = [
      "attemptedAction",
      "whyItSeemedReasonable",
      "actualOutcome",
      "rootCause",
      "optimalFirstMove",
      "preventiveControl",
    ];
    for (const field of required) {
      if (!mistake[field]?.trim?.() && !mistake[field]) {
        failures.push(`SEED_QUALITY_HOLD:mistake_missing_${field}:${mistake.id ?? "unknown"}`);
      }
    }
  }
  return failures;
}

function validateSeedQuality(seeds, evidence) {
  const failures = validateMistakes(evidence);
  for (const seed of seeds) {
    const schema = validateHarvestSeedPacketSchema(seed);
    if (!schema.ok) {
      failures.push(`SEED_QUALITY_HOLD:schema:${seed.seedId}`);
    }
    const questions = seed.retrievalQuestions ?? [];
    if (questions.length < 2) {
      failures.push(`SEED_QUALITY_HOLD:retrieval_questions:${seed.seedId}`);
    }
    const instructions = seed.futureAgentInstructions ?? {};
    const startAt = Array.isArray(instructions.startAt)
      ? instructions.startAt
      : instructions.startAt
        ? [instructions.startAt]
        : [];
    if (startAt.length === 0 || !instructions.runPreflight?.length || !instructions.doNot?.length) {
      failures.push(`SEED_QUALITY_HOLD:future_agent_instructions:${seed.seedId}`);
    }
    if (!instructions.proveBeforeClaiming?.length) {
      failures.push(`SEED_QUALITY_HOLD:prove_before_claiming:${seed.seedId}`);
    }
    if (!seed.summary?.trim() && !seed.detailedAnswer?.trim()) {
      failures.push(`SEED_QUALITY_HOLD:missing_answer:${seed.seedId}`);
    }
    if (!seed.title?.trim()) {
      failures.push(`SEED_QUALITY_HOLD:missing_title:${seed.seedId}`);
    }
  }
  const status = failures.length === 0 ? "PASS" : "HOLD";
  return {
    failures,
    section: section(status, { seedCount: seeds.length }),
    verdict: status === "PASS" ? null : "SEED_QUALITY_HOLD",
  };
}

function isGenericRetrievalQuestion(question, threadTerms) {
  const tokens = question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 3);
  if (tokens.length === 0) return true;
  const threadHits = tokens.filter((token) => threadTerms.has(token)).length;
  const genericHits = tokens.filter((token) => GENERIC_KEYWORDS.has(token)).length;
  return threadHits === 0 && genericHits >= Math.max(1, Math.ceil(tokens.length / 2));
}

function validateBlindRetrieval(evidence, seeds, manifest) {
  const failures = [];
  const threadTerms = new Set();
  for (const event of evidence.materialEvents ?? []) {
    for (const token of String(event.summary ?? "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)) {
      if (token.length > 4) threadTerms.add(token);
    }
  }
  for (const packet of manifest.packets ?? []) {
    for (const token of String(packet.packetTitle ?? "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)) {
      if (token.length > 4) threadTerms.add(token);
    }
  }

  for (const fixture of evidence.blindRetrieval ?? []) {
    if (!fixture.question?.trim()) {
      failures.push("RETRIEVAL_QUALITY_HOLD:missing_question");
      continue;
    }
    if (fixture.genericKeywordOnly === true || isGenericRetrievalQuestion(fixture.question, threadTerms)) {
      failures.push(`RETRIEVAL_QUALITY_HOLD:generic_question:${fixture.question}`);
      continue;
    }
    if (!fixture.expectedSeedId) {
      failures.push("RETRIEVAL_QUALITY_HOLD:missing_expected_seed");
      continue;
    }
    const top = blindRetrieveFromSeeds(fixture.question, seeds)[0];
    if (!top || top.seedId !== fixture.expectedSeedId) {
      failures.push(`RETRIEVAL_QUALITY_HOLD:retrieval_miss:${fixture.question}`);
    }
  }

  if ((evidence.blindRetrieval ?? []).length === 0) {
    failures.push("RETRIEVAL_QUALITY_HOLD:no_blind_retrieval_fixtures");
  }

  const status = failures.length === 0 ? "PASS" : "HOLD";
  return {
    failures,
    section: section(status, { fixtureCount: (evidence.blindRetrieval ?? []).length }),
    verdict: status === "PASS" ? null : "RETRIEVAL_QUALITY_HOLD",
  };
}

function validateHumanReview(evidence, manifest) {
  const failures = [];
  const review = evidence.humanReview ?? { required: false, reasons: [] };
  const reasons = new Set(review.reasons ?? []);

  for (const reason of reasons) {
    if (!HUMAN_REVIEW_REASONS.has(reason)) {
      failures.push(`HUMAN_REVIEW_GATE_HOLD:invalid_reason:${reason}`);
    }
  }

  if (review.required !== true && reasons.size > 0) {
    failures.push("HUMAN_REVIEW_GATE_HOLD:reasons_without_required_flag");
  }

  const unresolvedConflicts = (evidence.contradictions ?? []).filter((item) => item.resolved === false);
  if (unresolvedConflicts.length > 0 && !review.required) {
    failures.push("HUMAN_REVIEW_REQUIRED:unresolved_conflicts");
  }

  const needsReview =
    review.required === true ||
    (manifest.packets ?? []).some((packet) => packet.humanReviewRequired === true);

  const status =
    failures.length === 0 && (!needsReview || review.required === true) ? "PASS" : "HOLD";
  return {
    failures,
    section: section(needsReview && review.required !== true ? "HOLD" : status === "PASS" ? "PASS" : "HOLD", {
      required: needsReview,
      status: needsReview ? (review.required ? "REQUIRED" : "NOT_SATISFIED") : "NOT_REQUIRED",
      reasons: [...reasons],
    }),
    verdict:
      failures.length > 0 || (needsReview && review.required !== true)
        ? "HUMAN_REVIEW_REQUIRED"
        : null,
  };
}

export function validateKnowledgeQuality({ manifest, runDir, structuralVerdict = "HARVEST_STRUCTURAL_PASS" }) {
  const failures = [];
  const harvestId = manifest.harvestId;

  if (isTestOnlyBypass(manifest)) {
    return {
      schemaVersion: QUALITY_RECEIPT_SCHEMA,
      harvestId,
      threadCoverage: section("PASS", { materialEvents: 0, coveredEvents: 0, coverageRatio: 1 }),
      decisionIntegrity: section("PASS"),
      userCorrections: section("PASS", { correctionCount: 0 }),
      evidenceCoverage: section("PASS", { verifiedClaimRatio: 1 }),
      contradictionResolution: section("PASS"),
      seedQuality: section("PASS"),
      blindRetrieval: section("PASS"),
      humanReview: section("NOT_REQUIRED", { required: false, status: "NOT_REQUIRED" }),
      structuralVerdict,
      knowledgeVerdict: "KNOWLEDGE_QUALITY_PASS",
      publicationEligibility: "TEST_ONLY",
      failures: [],
      generatedAt: new Date().toISOString(),
      testOnlyBypass: true,
    };
  }

  const evidencePath = path.join(runDir, QUALITY_EVIDENCE_FILENAME);
  const evidence = readJsonIfExists(evidencePath);
  failures.push(...validateEvidenceSchema(evidence));
  if (!evidence) {
    failures.push("KNOWLEDGE_EVIDENCE_MISSING");
  } else if (evidence.harvestId !== harvestId) {
    failures.push("KNOWLEDGE_EVIDENCE_HARVEST_ID_MISMATCH");
  }

  const inventory = readJsonIfExists(path.join(runDir, "thread-event-inventory.json"));
  const seeds = listSeedPackets(runDir);

  const checks = evidence
    ? [
        validateThreadCoverage(evidence, inventory?.events),
        validateDecisionIntegrity(evidence),
        validateUserCorrections(evidence),
        validateEvidenceCoverage(evidence),
        validateContradictions(evidence),
        validateSeedQuality(seeds, evidence),
        validateBlindRetrieval(evidence, seeds, manifest),
        validateHumanReview(evidence, manifest),
      ]
    : [];

  for (const check of checks) {
    failures.push(...check.failures);
  }

  const primaryVerdict =
    checks.map((check) => check.verdict).find(Boolean) ??
    (failures.length > 0 ? "KNOWLEDGE_QUALITY_HOLD" : null);

  const knowledgeVerdict = primaryVerdict ? primaryVerdict : "KNOWLEDGE_QUALITY_PASS";
  const publicationEligibility =
    knowledgeVerdict === "KNOWLEDGE_QUALITY_PASS" && structuralVerdict === "HARVEST_STRUCTURAL_PASS"
      ? "DURABLE_PUBLICATION_READY"
      : knowledgeVerdict;

  return {
    schemaVersion: QUALITY_RECEIPT_SCHEMA,
    harvestId,
    threadCoverage: checks[0]?.section ?? section("HOLD", { materialEvents: 0, coveredEvents: 0, coverageRatio: 0 }),
    decisionIntegrity: checks[1]?.section ?? section("HOLD"),
    userCorrections: checks[2]?.section ?? section("HOLD", { correctionCount: 0 }),
    evidenceCoverage: checks[3]?.section ?? section("HOLD", { verifiedClaimRatio: 0 }),
    contradictionResolution: checks[4]?.section ?? section("HOLD"),
    seedQuality: checks[5]?.section ?? section("HOLD"),
    blindRetrieval: checks[6]?.section ?? section("HOLD"),
    humanReview: checks[7]?.section ?? section("HOLD", { required: false, status: "NOT_REQUIRED" }),
    structuralVerdict,
    knowledgeVerdict,
    publicationEligibility,
    failures,
    generatedAt: new Date().toISOString(),
  };
}

export function writeKnowledgeQualityReceipt(runDir, receipt) {
  const receiptPath = path.join(runDir, QUALITY_RECEIPT_FILENAME);
  fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  return receiptPath;
}
