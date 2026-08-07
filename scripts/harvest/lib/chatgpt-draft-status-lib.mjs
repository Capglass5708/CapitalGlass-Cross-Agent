/**
 * ChatGPT harvest draft lifecycle stages (P2-F).
 */
export const CHATGPT_DRAFT_STAGES = [
  "DRAFT_READY",
  "DRAFT_READY_DOWNLOAD",
  "CHATGPT_SOURCE_PUBLISHED",
  "CURSOR_SCAFFOLDED",
  "VALIDATED",
  "PUBLISHED",
  "OPERATIONAL",
  "DUPLICATE_PROVENANCE_ONLY",
];

/**
 * @param {string} stage
 */
export function isKnownChatGptDraftStage(stage) {
  return CHATGPT_DRAFT_STAGES.includes(stage);
}

/**
 * Infer draft stage from harvest manifest / receipts.
 * @param {{ manifest?: object, gitGateReceipt?: object, validationResult?: object }} input
 */
export function inferChatGptDraftStage(input) {
  const manifest = input.manifest ?? {};
  const verdict = manifest.overallHarvestVerdict ?? manifest.chatgptVerdict ?? null;
  const git = input.gitGateReceipt?.verdict ?? null;

  if (manifest.duplicateProvenanceOnly === true) return "DUPLICATE_PROVENANCE_ONLY";
  if (verdict === "OPERATIONAL") return "OPERATIONAL";
  if (verdict === "HARVEST_COMPLETE" || verdict === "VALIDATED") return "VALIDATED";
  if (manifest.sourceLane === "CHATGPT" && git === "PASS") return "CHATGPT_SOURCE_PUBLISHED";
  if (git === "PASS") return "CHATGPT_SOURCE_PUBLISHED";
  if (verdict === "DRAFT_READY_DOWNLOAD") return "DRAFT_READY_DOWNLOAD";
  if (verdict === "DRAFT_READY" || verdict === "DRAFT_READY_FOR_CURSOR_VALIDATION") return "DRAFT_READY";
  if (manifest.packets?.length) return "CURSOR_SCAFFOLDED";
  return "DRAFT_READY";
}

/**
 * @param {object} link
 */
export function buildProvenanceRelationship(link) {
  return {
    type: link.relation ?? "provenanceFor",
    targetHarvestId: link.canonicalHarvestId,
    sourceHarvestId: link.sourceHarvestId,
    reason: link.reason ?? "canonical_harvest_exists",
    classification: "DUPLICATE_PROVENANCE_ONLY",
  };
}
