import fs from "node:fs";
import path from "node:path";

import { hashCanonicalJson } from "./hash.mjs";
import { harvestRunDir } from "./paths.mjs";

export const INPUT_SCHEMA = "waverunner-self-improvement-harvest-input-v1@1.0.0";
export const EXPORT_RECEIPT_SCHEMA = "waverunner-self-improvement-export-receipt-v1@1.0.0";

const WAVERUNNER_TOPIC_KEYWORDS = [
  ["WAVE_SIZING", /wave.?siz|milestone.?wave|fragment/i],
  ["PROMPT_FRAGMENTATION", /prompt.?fragment|split.?prompt|multi.?prompt/i],
  ["EXECUTION_MODE_CLASSIFICATION", /execution.?mode|classif/i],
  ["MISSING_GATE", /missing.?gate|gate.?missing/i],
  ["LATE_GATE", /late.?gate|gate.?late/i],
  ["BASELINE_DRIFT", /baseline.?drift|dirty.?tree|origin.?parity/i],
  ["AUTHORITY_DRIFT", /authority.?drift|z.?authority|canonical/i],
  ["TOKEN_WASTE", /token.?wast|context.?bloat/i],
  ["REPEATED_DISCOVERY", /repeated.?discover|re-?grep|re-?scan/i],
  ["CLOSEOUT_QUALITY", /closeout|harvest.?quality/i],
  ["RECOVERY_AUTOMATION", /recover|rollback|replay/i],
  ["PIPELINE_PERFORMANCE", /perf|slow|latency/i],
  ["PROMPT_COMPILER", /compile.?prompt|prompt.?compil/i],
  ["STOP_CONDITION", /stop.?condition|blocked/i],
  ["HARVEST_QUALITY", /harvest|autopsy|seed/i],
  ["ROUTING", /routing|handoff|export/i],
];

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function toSha256Prefixed(hex) {
  return `sha256:${hex}`;
}

export function inferCategory(text) {
  const hay = String(text ?? "");
  for (const [category, pattern] of WAVERUNNER_TOPIC_KEYWORDS) {
    if (pattern.test(hay)) return category;
  }
  return "OTHER_WAVERUNNER_IMPROVEMENT";
}

export function slugCandidateId(prefix, index, title) {
  const slug = String(title ?? "candidate")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${prefix}-${String(index).padStart(3, "0")}-${slug || "item"}`;
}

export function extractCandidatesFromManifest(manifest, runDir) {
  const candidates = [];
  let index = 1;

  for (const packet of manifest.improvementCandidates ?? []) {
    candidates.push({
      candidateId: packet.candidateId ?? slugCandidateId("WC", index++, packet.title),
      category: packet.category ?? inferCategory(`${packet.title} ${packet.problem}`),
      title: packet.title ?? "Untitled improvement",
      problem: packet.problem ?? packet.packetTitle ?? "",
      rootCause: packet.rootCause ?? "NEEDS_VERIFICATION",
      proposedImprovement: packet.proposedImprovement ?? packet.nextAction ?? "",
      targetRepository: packet.targetRepository ?? packet.ownerRepo ?? "UNKNOWN",
      targetComponent: packet.targetComponent ?? "WaveRunner",
      expectedBenefit: packet.expectedBenefit ?? "UNKNOWN",
      risk: packet.risk ?? "UNKNOWN",
      confidence: packet.confidence ?? "LOW",
      evidenceRefs: packet.evidenceRefs ?? [],
      crossCheckCommands: packet.crossCheckCommands ?? [],
      authorityStatus: packet.authorityStatus === "CANDIDATE" ? "CANDIDATE" : "PROPOSAL",
      reviewStatus: packet.reviewStatus ?? "PENDING",
    });
  }

  for (const packet of manifest.packets ?? []) {
    const text = `${packet.packetTitle} ${packet.nextAction} ${(packet.evidenceRefs ?? []).join(" ")}`;
    const category = inferCategory(text);
    if (category === "OTHER_WAVERUNNER_IMPROVEMENT" && !manifest.waverunnerExport?.includeGenericPackets) {
      continue;
    }
    candidates.push({
      candidateId: slugCandidateId("HP", index++, packet.packetTitle),
      category,
      title: packet.packetTitle ?? packet.packetId,
      problem: packet.nextAction ?? "Recorded harvest packet",
      rootCause: "NEEDS_VERIFICATION",
      proposedImprovement: packet.nextAction ?? "",
      targetRepository: packet.ownerRepo ?? "UNKNOWN",
      targetComponent: "WaveRunner",
      expectedBenefit: "UNKNOWN",
      risk: "UNKNOWN",
      confidence: "LOW",
      evidenceRefs: packet.evidenceRefs ?? [],
      crossCheckCommands: [],
      authorityStatus: "PROPOSAL",
      reviewStatus: "PENDING",
    });
  }

  const seedDir = path.join(runDir, "seed-packets");
  if (fs.existsSync(seedDir)) {
    for (const name of fs.readdirSync(seedDir).filter((n) => n.endsWith(".json"))) {
      const seed = readJsonIfExists(path.join(seedDir, name));
      if (!seed) continue;
      const text = `${seed.kind} ${seed.title ?? ""} ${(seed.retrievalQuestions ?? []).join(" ")}`;
      candidates.push({
        candidateId: seed.seedId ?? slugCandidateId("SEED", index++, name),
        category: inferCategory(text),
        title: seed.title ?? seed.kind ?? name,
        problem: seed.futureAgentInstructions?.whenThisAppears ?? seed.kind ?? "",
        rootCause: "NEEDS_VERIFICATION",
        proposedImprovement: (seed.futureAgentInstructions?.proveBeforeClaiming ?? []).join("; ") || "Review seed packet",
        targetRepository: "CapitalGlass-Cross-Agent",
        targetComponent: "IntelligenceHub",
        expectedBenefit: "Improved agent retrieval and wave execution",
        risk: "UNKNOWN",
        confidence: "MEDIUM",
        evidenceRefs: seed.evidenceRefs ?? [],
        crossCheckCommands: [],
        authorityStatus: "CANDIDATE",
        reviewStatus: "PENDING",
      });
    }
  }

  return candidates;
}

export function buildWaverunnerHarvestInput({ harvestId, runDir, options = {} }) {
  const manifest = readJsonIfExists(path.join(runDir, "harvest-manifest-v1.json"));
  if (!manifest) {
    return { ok: false, code: "MANIFEST_MISSING", harvestId };
  }
  if (manifest.harvestId !== harvestId) {
    return { ok: false, code: "HARVEST_ID_MISMATCH", expected: harvestId, actual: manifest.harvestId };
  }

  const validation = readJsonIfExists(path.join(runDir, "validation-result.json"));
  if (!options.allowUnvalidated) {
    if (!validation || validation.verdict !== "PASS") {
      return {
        ok: false,
        code: "VALIDATION_REQUIRED",
        message: "harvest:validate PASS required before export",
        validationVerdict: validation?.verdict ?? null,
      };
    }
  }

  const milestoneId =
    options.milestoneId ??
    manifest.waverunnerHandoff?.milestoneId ??
    manifest.milestoneId ??
    harvestId;
  const waveId = options.waveId ?? manifest.waverunnerHandoff?.waveId ?? milestoneId;
  const executionMode =
    options.executionMode ?? manifest.waverunnerHandoff?.executionMode ?? "MILESTONE_WAVE";

  const linkedCloseout = manifest.waverunnerHandoff?.closeoutPath
    ? readJsonIfExists(manifest.waverunnerHandoff.closeoutPath)
    : readJsonIfExists(path.join(runDir, "sdlc-intelligence-harvest.json"));

  const improvementCandidates = extractCandidatesFromManifest(manifest, runDir);

  const input = {
    schema: INPUT_SCHEMA,
    harvestId,
    milestoneId,
    waveId,
    executionMode,
    observedAt: new Date().toISOString(),
    source: {
      repository: manifest.sourceRepo ?? "CapitalGlass-Cross-Agent",
      branch: manifest.sourceBranch ?? "main",
      startSha: manifest.waverunnerHandoff?.startSha ?? manifest.sourceCommitSha ?? "0000000000000000000000000000000000000000",
      finalSha: manifest.sourceCommitSha ?? "0000000000000000000000000000000000000000",
      receiptPath: `artifacts/agent-runs/${harvestId}/validation-result.json`,
      closeoutPath: manifest.waverunnerHandoff?.closeoutPath ?? `artifacts/agent-runs/${harvestId}/sdlc-intelligence-harvest.json`,
      machine: options.machine ?? process.env.CG_MACHINE_ID ?? "unknown",
      environment: options.environment ?? process.env.CG_ENVIRONMENT ?? "unknown",
    },
    authority: {
      sourceOwner: "CapitalGlass-Cross-Agent",
      processingOwner: "Data-Extraction",
      approvalOwner: "CG-Platform-Governance-MCP",
      catalogRole: "RETRIEVAL_ONLY",
    },
    claims: {
      verifiedTruths: linkedCloseout?.verifiedTruths ?? [],
      derivedConclusions: linkedCloseout?.derivedConclusions ?? [],
      recommendations: linkedCloseout?.futureCreationOpportunities ?? linkedCloseout?.recommendedNextWave
        ? [linkedCloseout.recommendedNextWave]
        : [],
      assumptions: linkedCloseout?.unknowns ?? [],
      unknowns: linkedCloseout?.unknowns ?? [],
    },
    improvementCandidates,
    gateResults: [
      validation ? { gate: "harvest:validate", verdict: validation.verdict } : null,
      readJsonIfExists(path.join(runDir, "duplication-preflight-receipt.json"))
        ? { gate: "harvest:duplication-preflight", verdict: "PASS" }
        : null,
    ].filter(Boolean),
    evidence: (manifest.packets ?? []).flatMap((p) => p.evidenceRefs ?? []),
    crossCheckCommands: linkedCloseout?.crossCheckInstructions ?? [],
    duplicateHints: manifest.waverunnerHandoff?.duplicateHints ?? [],
    invalidationTriggers: manifest.waverunnerHandoff?.invalidationTriggers ?? [
      "source_commit_changes",
      "validation_receipt_missing",
      "governance_rejection",
    ],
    supersedes: manifest.waverunnerHandoff?.supersedes ?? [],
  };

  const contentHash = toSha256Prefixed(hashCanonicalJson(input));
  input.contentHash = contentHash;

  return { ok: true, input, contentHash, manifest, validation };
}

export function exportWaverunnerSelfImprovement({ harvestId, options = {} }) {
  const runDir = options.runDir ?? harvestRunDir(harvestId);
  const built = buildWaverunnerHarvestInput({ harvestId, runDir, options });
  if (!built.ok) return built;

  const outDir = path.join(runDir, "data-extraction-handoff");
  fs.mkdirSync(outDir, { recursive: true });

  const inputPath = path.join(outDir, "waverunner-self-improvement-harvest-input.json");
  fs.writeFileSync(inputPath, `${JSON.stringify(built.input, null, 2)}\n`, "utf8");

  const closeoutMdPath = path.join(outDir, "source-closeout.md");
  const closeoutJson = readJsonIfExists(path.join(runDir, "sdlc-intelligence-harvest.json"));
  const closeoutBody = closeoutJson
    ? `# Source closeout\n\n\`\`\`json\n${JSON.stringify(closeoutJson, null, 2)}\n\`\`\`\n`
    : `# Source closeout\n\nNo linked SDLC intelligence harvest in run dir.\n`;
  fs.writeFileSync(closeoutMdPath, closeoutBody, "utf8");

  const evidenceIndex = {
    schema: "waverunner-source-evidence-index-v1@1.0.0",
    harvestId,
    evidence: built.input.evidence,
    candidateCount: built.input.improvementCandidates.length,
    generatedAt: new Date().toISOString(),
  };
  const evidencePath = path.join(outDir, "source-evidence-index.json");
  fs.writeFileSync(evidencePath, `${JSON.stringify(evidenceIndex, null, 2)}\n`, "utf8");

  const receipt = {
    schema: EXPORT_RECEIPT_SCHEMA,
    harvestId,
    contentHash: built.contentHash,
    inputPath: path.relative(path.dirname(runDir), inputPath).replace(/\\/g, "/"),
    exportedAt: new Date().toISOString(),
    candidateCount: built.input.improvementCandidates.length,
    processingOwner: "Data-Extraction",
    catalogRole: "RETRIEVAL_ONLY",
    lPublicationStatus: "NOT_RUN_BY_CROSS_AGENT",
  };
  const receiptPath = path.join(outDir, "export-receipt.json");
  fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");

  return {
    ok: true,
    verdict: "EXPORT_PASS",
    harvestId,
    contentHash: built.contentHash,
    outDir,
    inputPath,
    receiptPath,
    receipt,
    candidateCount: built.input.improvementCandidates.length,
  };
}
