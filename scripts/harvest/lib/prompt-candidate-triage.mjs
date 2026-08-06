import fs from "node:fs";
import path from "node:path";

function tokenize(text) {
  return String(text ?? "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3);
}

function jaccard(a, b) {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (setA.size === 0 || setB.size === 0) return 0;
  let inter = 0;
  for (const t of setA) if (setB.has(t)) inter += 1;
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}

const TRIAGE_RESULTS = [
  "DUPLICATE",
  "ALREADY_IMPLEMENTED",
  "LOW_VALUE",
  "NEEDS_EVIDENCE",
  "OUT_OF_SCOPE",
  "PROMPTOPS_REVIEW",
  "PROTOCOL_CANDIDATE",
  "REJECTED",
];

/**
 * Automated triage — never approves prompts.
 */
export function triagePromptCandidates({ repoRoot, harvestId, runDir = null }) {
  const dir = runDir ?? path.join(repoRoot, "artifacts/agent-runs", harvestId);
  const promptPath = path.join(dir, "prompt-candidates.json");
  if (!fs.existsSync(promptPath)) {
    return {
      schemaVersion: "harvest-prompt-triage-report-v1@1.0.0",
      harvestId,
      generatedAt: new Date().toISOString(),
      candidates: [],
      counts: {},
      verdict: "NO_CANDIDATES",
    };
  }

  const doc = JSON.parse(fs.readFileSync(promptPath, "utf8"));
  const candidates = doc.candidates ?? [];
  const seen = new Map();
  const triaged = [];

  for (const c of candidates) {
    const entry = {
      candidateId: c.promptCandidateId,
      sourceHarvestId: c.sourceHarvestId ?? harvestId,
      evidenceRefs: [c.sourceMessageRef, c.sourceSha].filter(Boolean),
      targetUseCase: c.title,
      duplicateStatus: "NEW",
      implementationStatus: "UNKNOWN",
      evidenceQuality: (c.evidenceRefs?.length ?? 0) > 0 ? "MEDIUM" : "LOW",
      estimatedValue: "MEDIUM",
      risk: "LOW",
      triageResult: "PROMPTOPS_REVIEW",
      triageReason: "default-review",
      promptOpsApprovalStatus: "PENDING",
    };

    const key = c.normalizedContentHash ?? c.promptCandidateId;
    if (seen.has(key)) {
      entry.triageResult = "DUPLICATE";
      entry.duplicateStatus = "EXACT_DUPLICATE";
      entry.triageReason = `duplicate-of:${seen.get(key)}`;
    } else {
      seen.set(key, c.promptCandidateId);
    }

    const title = String(c.title ?? "").toLowerCase();
    const summary = String(c.summary ?? "").toLowerCase();

    if (entry.triageResult === "PROMPTOPS_REVIEW") {
      if (
        title.includes("lane c") ||
        summary.includes("z-mirror") ||
        summary.includes("protocol sync") ||
        summary.includes("harvest:sync-z-mirror")
      ) {
        entry.triageResult = "PROTOCOL_CANDIDATE";
        entry.triageReason = "harvest-protocol-operational-friction";
        entry.estimatedValue = "HIGH";
      } else if (summary.length < 40 || (c.expectedOutputs?.length ?? 0) === 0) {
        entry.triageResult = "NEEDS_EVIDENCE";
        entry.triageReason = "thin-summary-or-missing-outputs";
        entry.evidenceQuality = "LOW";
      } else if (title.includes("npm run") && summary.includes("after harvest:validate")) {
        entry.triageResult = "ALREADY_IMPLEMENTED";
        entry.triageReason = "documents-existing-command-chain";
        entry.implementationStatus = "DOCUMENTED_IN_PROTOCOL";
      } else if (jaccard(summary, "operator @ l protocol for closeout") > 0.85) {
        entry.triageResult = "DUPLICATE";
        entry.duplicateStatus = "SEMANTIC_DUPLICATE";
        entry.triageReason = "semantic-duplicate-l-protocol-sync";
      } else if (c.sourceType === "system_governance" && summary.includes("{{repository}}")) {
        entry.triageResult = "LOW_VALUE";
        entry.triageReason = "over-templated-governance-stub";
      }
    }

    triaged.push(entry);
  }

  const counts = {};
  for (const r of TRIAGE_RESULTS) counts[r] = 0;
  for (const t of triaged) counts[t.triageResult] = (counts[t.triageResult] ?? 0) + 1;

  return {
    schemaVersion: "harvest-prompt-triage-report-v1@1.0.0",
    harvestId,
    generatedAt: new Date().toISOString(),
    candidates: triaged,
    counts,
    approvedCount: 0,
    verdict: "PROMPT_TRIAGE_COMPLETE",
    automaticApproval: false,
  };
}
