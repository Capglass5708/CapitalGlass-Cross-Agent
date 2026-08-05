import fs from "node:fs";
import path from "node:path";

import { hashCanonicalJson } from "./hash.mjs";

export const PROMPT_CANDIDATE_SCHEMA = "harvest-prompt-candidate-v1@1.0.0";
export const PROMPT_HARVEST_VERDICTS = new Set([
  "PROMPT_HARVEST_COMPLETE",
  "PROMPT_HARVEST_NO_CANDIDATES",
  "PROMPT_HARVEST_PENDING_REVIEW",
  "PROMPT_HARVEST_FAILED",
]);

const SECRET_PATTERNS = [
  /password\s*[:=]/i,
  /api[_-]?key\s*[:=]/i,
  /secret\s*[:=]/i,
  /bearer\s+[a-z0-9._-]{20,}/i,
  /-----BEGIN [A-Z ]+ KEY-----/,
  /\bsk-[a-zA-Z0-9]{20,}\b/,
  /\bghp_[a-zA-Z0-9]{20,}\b/,
  /\bxox[baprs]-[a-zA-Z0-9-]{10,}\b/,
];

const TRANSIENT_PATTERNS = [
  /\b[0-9a-f]{40}\b/gi,
  /\bC:\\[^\s]+/gi,
  /\b\/mnt\/[a-z]\/[^\s]+/gi,
  /\b\/home\/[^\s]+/gi,
  /\bZ:\\[^\s]+/gi,
  /\bL:\\[^\s]+/gi,
];

const INPUT_PLACEHOLDERS = [
  ["{{repository}}", /\b[A-Za-z][A-Za-z0-9_-]+(?:-[A-Za-z0-9_-]+)*\b/g],
  ["{{workPackageId}}", /\b[a-z][a-z0-9-]+-v\d+\b/g],
  ["{{hostRole}}", /\b(?:wesley_work|wesleydesk|ryzen9desk)\b/gi],
  ["{{branch}}", /\b(?:main|master|develop|dev)\b/g],
  ["{{commitSha}}", /\b[0-9a-f]{7,40}\b/gi],
  ["{{receiptPath}}", /artifacts\/agent-runs\/[^\s]+/g],
  ["{{queryClass}}", /\b(?:preflight|closeout|deploy|harvest|ownership|authority-placement|suite-status)\b/g],
];

function readJsonIfExists(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function hashPromptContent(text) {
  return hashCanonicalJson({ body: String(text ?? "").trim() });
}

export function containsSecrets(text) {
  const body = String(text ?? "");
  return SECRET_PATTERNS.some((pattern) => pattern.test(body));
}

export function normalizeRecipeContent(text) {
  let normalized = String(text ?? "").trim();
  for (const pattern of TRANSIENT_PATTERNS) {
    normalized = normalized.replace(pattern, (match) => {
      if (/^[0-9a-f]{40}$/i.test(match)) return "{{commitSha}}";
      if (/^\/mnt\//i.test(match) || /^\/home\//i.test(match) || /^[A-Z]:\\/i.test(match)) {
        return "{{receiptPath}}";
      }
      return match;
    });
  }
  for (const [placeholder, pattern] of INPUT_PLACEHOLDERS) {
    normalized = normalized.replace(pattern, placeholder);
  }
  return normalized.replace(/\s+/g, " ").trim();
}

function inferPromptType({ kind, sourceField, actor }) {
  if (kind === "guardrail" || sourceField === "preventiveControl") return "guardrail";
  if (kind === "command" || sourceField === "command") return "execution";
  if (sourceField === "futureAgentInstructions") return "planning";
  if (sourceField === "systemFix" || kind === "repair") return "repair";
  if (actor === "user") return "investigation";
  if (sourceField === "closeout") return "closeout";
  return "execution";
}

function inferSourceType(actor, explicit) {
  if (explicit) return explicit;
  if (actor === "user") return "user_instruction";
  if (actor === "cursor" || actor === "assistant") return "cursor_agent";
  return "system_governance";
}

function buildCandidate({
  harvestId,
  sourceSha,
  sourceThreadId,
  sourceMessageRef,
  title,
  summary,
  rawContent,
  promptType,
  sourceType,
  ownerRepo = null,
  ownerMcp = null,
  queryClasses = [],
  commandIds = [],
  gateIds = [],
  guardrailIds = [],
  provenOutcome = "unknown",
  requiredInputs = [],
  expectedOutputs = [],
}) {
  const normalizedContent = normalizeRecipeContent(rawContent || summary || title);
  const normalizedContentHash = hashPromptContent(normalizedContent);
  const sourceContentHash = hashPromptContent(rawContent || summary || title);
  const secretHit = containsSecrets(`${title}\n${summary}\n${rawContent ?? ""}`);
  const idSuffix = normalizedContentHash.slice(0, 12);

  return {
    schemaVersion: PROMPT_CANDIDATE_SCHEMA,
    promptCandidateId: `prompt-candidate-${idSuffix}`,
    sourceType,
    sourceThreadId: sourceThreadId ?? null,
    sourceHarvestId: harvestId,
    sourceMessageRef: sourceMessageRef ?? null,
    title: String(title).slice(0, 200),
    summary: String(summary ?? "").slice(0, 500),
    promptType,
    queryClasses,
    ownerRepo,
    ownerMcp,
    commandIds,
    gateIds,
    guardrailIds,
    requiredInputs: requiredInputs.length ? requiredInputs : ["{{repository}}", "{{workPackageId}}"],
    expectedOutputs,
    normalizedContent,
    normalizedContentHash,
    sourceContentHash,
    promotionStatus: "candidate_only",
    duplicateOf: null,
    provenOutcome,
    containsSecrets: secretHit,
    createdAt: new Date().toISOString(),
    sourceSha: sourceSha ?? null,
    authorityLevel: "candidate",
    grantsMutationAuthority: false,
  };
}

function extractFromFutureAgentInstructions(fai, ctx) {
  if (!fai || typeof fai !== "object") return [];
  const lines = [
    fai.whenThisAppears,
    ...(fai.startAt ?? []),
    ...(fai.runPreflight ?? []),
    ...(fai.doNot ?? []),
    ...(fai.proveBeforeClaiming ?? []),
  ].filter(Boolean);
  if (!lines.length) return [];
  const rawContent = lines.join("\n");
  return [
    buildCandidate({
      ...ctx,
      title: fai.whenThisAppears ?? "Future agent instructions",
      summary: rawContent.slice(0, 300),
      rawContent,
      promptType: "planning",
      sourceType: "system_governance",
      guardrailIds: (fai.doNot ?? []).map((d) => `guardrail:${hashPromptContent(d).slice(0, 8)}`),
      expectedOutputs: fai.proveBeforeClaiming ?? [],
    }),
  ];
}

function listSeedPackets(seedDir) {
  if (!seedDir || !fs.existsSync(seedDir)) return [];
  return fs
    .readdirSync(seedDir)
    .filter((name) => name.endsWith(".json") && name !== "seed-packet-index.json")
    .map((name) => readJsonIfExists(path.join(seedDir, name)))
    .filter(Boolean);
}

export function extractPromptCandidatesFromHarvest({
  manifest,
  bundle = null,
  inventory = null,
  seeds = null,
  harvestId,
  sourceSha = null,
  sourceThreadId = null,
  seedDir = null,
  explicitMessages = null,
}) {
  const candidates = [];
  const baseCtx = {
    harvestId: harvestId ?? manifest?.harvestId,
    sourceSha: sourceSha ?? manifest?.sourceCommitSha ?? null,
    sourceThreadId: sourceThreadId ?? manifest?.promptHarvest?.sourceThreadId ?? null,
    ownerRepo: manifest?.packets?.[0]?.ownerRepo ?? null,
  };

  const seedPackets = seeds ?? listSeedPackets(seedDir);
  for (const seed of seedPackets) {
    candidates.push(
      ...extractFromFutureAgentInstructions(seed.futureAgentInstructions, {
        ...baseCtx,
        sourceMessageRef: seed.seedId,
        ownerRepo: seed.ownerRepo ?? baseCtx.ownerRepo,
        provenOutcome: seed.status === "APPROVED" ? "pass" : "unknown",
      }),
    );
    if (seed.summary) {
      candidates.push(
        buildCandidate({
          ...baseCtx,
          sourceMessageRef: seed.seedId,
          title: seed.title ?? seed.seedId,
          summary: seed.summary,
          rawContent: `${seed.title}\n${seed.summary}\n${(seed.retrievalQuestions ?? []).join("\n")}`,
          promptType: inferPromptType({ kind: seed.kind }),
          sourceType: "cursor_agent",
          ownerRepo: seed.ownerRepo ?? baseCtx.ownerRepo,
          queryClasses: seed.targetSlice ? [seed.targetSlice] : [],
        }),
      );
    }
  }

  for (const item of bundle?.roiBacklog ?? []) {
    if (!item?.systemFix && !item?.title) continue;
    candidates.push(
      buildCandidate({
        ...baseCtx,
        sourceMessageRef: `roi:${item.rank ?? item.title}`,
        title: item.title,
        summary: item.systemFix ?? item.description ?? item.title,
        rawContent: [item.title, item.systemFix, item.description].filter(Boolean).join("\n"),
        promptType: "repair",
        sourceType: "cursor_agent",
        provenOutcome: "partial",
      }),
    );
  }

  for (const move of bundle?.wrongMoves ?? []) {
    if (!move?.preventiveControl && !move?.wrongMoveId) continue;
    candidates.push(
      buildCandidate({
        ...baseCtx,
        sourceMessageRef: move.wrongMoveId,
        title: move.wrongMoveId ?? "Wrong move guardrail",
        summary: move.preventiveControl ?? move.actualExecution?.steps?.join("; "),
        rawContent: JSON.stringify({
          preventiveControl: move.preventiveControl,
          optimal: move.optimalExecution,
          actual: move.actualExecution,
        }),
        promptType: "guardrail",
        sourceType: "system_governance",
        provenOutcome: move.actualExecution?.outcome === "FAIL" ? "fail" : "unknown",
      }),
    );
  }

  for (const event of inventory?.events ?? []) {
    if (!event?.description) continue;
    const isUser = event.actor === "user";
    candidates.push(
      buildCandidate({
        ...baseCtx,
        sourceMessageRef: event.eventId,
        title: event.description.slice(0, 120),
        summary: event.stateChange ?? event.description,
        rawContent: `${event.description}\n${event.stateChange ?? ""}`,
        promptType: isUser ? "investigation" : "execution",
        sourceType: inferSourceType(event.actor),
        provenOutcome: "unknown",
      }),
    );
  }

  for (const packet of manifest?.packets ?? []) {
    if (packet.packetKind === "protocol_upgrade" || packet.futureAgentInstructions) {
      candidates.push(
        ...extractFromFutureAgentInstructions(packet.futureAgentInstructions, {
          ...baseCtx,
          sourceMessageRef: packet.packetId,
          ownerRepo: packet.ownerRepo ?? baseCtx.ownerRepo,
        }),
      );
    }
  }

  for (const msg of explicitMessages ?? manifest?.promptHarvest?.threadMessages ?? []) {
    if (!msg?.content) continue;
    candidates.push(
      buildCandidate({
        ...baseCtx,
        sourceMessageRef: msg.ref ?? msg.id ?? null,
        title: msg.title ?? msg.content.slice(0, 120),
        summary: msg.summary ?? msg.content.slice(0, 300),
        rawContent: msg.content,
        promptType: msg.promptType ?? inferPromptType({ actor: msg.actor }),
        sourceType: inferSourceType(msg.actor, msg.sourceType),
        provenOutcome: msg.provenOutcome ?? "unknown",
        commandIds: msg.commandIds ?? [],
        gateIds: msg.gateIds ?? [],
      }),
    );
  }

  const byHash = new Map();
  for (const candidate of candidates) {
    if (!byHash.has(candidate.normalizedContentHash)) {
      byHash.set(candidate.normalizedContentHash, candidate);
    }
  }
  return [...byHash.values()];
}

export function loadPromptDedupeCorpus({ repoRoot, appBuilderRoot }) {
  const corpus = {
    promptOpsHashes: new Set(),
    promptOpsIds: new Set(),
    priorCandidateHashes: new Set(),
    catalogHashes: new Set(),
    executionPacketPromptIds: new Set(),
  };

  const suiteIndexPath = path.join(
    appBuilderRoot ?? "",
    "promptops/generated/suite-prompt-index.json",
  );
  const suiteIndex = readJsonIfExists(suiteIndexPath);
  if (suiteIndex?.apps) {
    for (const app of suiteIndex.apps) {
      const reposRoot = process.env.CG_REPOS_ROOT || path.join(process.env.HOME || "", "repos");
      const manifestPath = path.join(reposRoot, app.repoFolder, app.promptManifestPath ?? "");
      const pack = readJsonIfExists(manifestPath);
      for (const prompt of pack?.prompts ?? []) {
        const hash = prompt.contentHash ?? prompt.sha256;
        if (hash) corpus.promptOpsHashes.add(hash);
        if (prompt.id) corpus.promptOpsIds.add(`${app.appKey}:${prompt.id}`);
      }
    }
  }

  const registryPath = path.join(repoRoot, "work-progress/harvest-prompt-registry.json");
  const registry = readJsonIfExists(registryPath);
  for (const record of registry?.candidates ?? []) {
    if (record.normalizedContentHash) corpus.priorCandidateHashes.add(record.normalizedContentHash);
    if (record.promotionStatus === "approved" && record.normalizedContentHash) {
      corpus.catalogHashes.add(record.normalizedContentHash);
    }
  }

  const catalogCompactPath = path.join(
    appBuilderRoot ?? "",
    "runtime/prompt-catalog/prompt-catalog.compact.latest.json",
  );
  const catalog = readJsonIfExists(catalogCompactPath);
  for (const record of catalog?.records ?? []) {
    if (record.contentHash) corpus.catalogHashes.add(record.contentHash);
    if (record.promptId) corpus.promptOpsIds.add(record.promptId);
  }

  const packetManifestPath = path.join(
    repoRoot,
    "registry/execution-packets/execution-packet-manifest.v1.json",
  );
  const packetManifest = readJsonIfExists(packetManifestPath);
  for (const packet of packetManifest?.packets ?? []) {
    for (const promptId of packet.promptIds ?? []) {
      corpus.executionPacketPromptIds.add(promptId);
    }
  }

  return corpus;
}

export function deduplicatePromptCandidates(candidates, corpus = {}, { exemptCandidateIds = [] } = {}) {
  const exempt = new Set(exemptCandidateIds);
  const report = [];
  const deduped = [];

  for (const candidate of candidates) {
    let duplicateOf = null;
    let reason = null;

    if (!exempt.has(candidate.promptCandidateId)) {
      if (corpus.promptOpsHashes?.has(candidate.normalizedContentHash)) {
        duplicateOf = "promptops:content-hash";
        reason = "promptops_manifest";
      } else if (corpus.priorCandidateHashes?.has(candidate.normalizedContentHash)) {
        duplicateOf = "harvest-prior-candidate";
        reason = "prior_harvest";
      } else if (corpus.catalogHashes?.has(candidate.normalizedContentHash)) {
        duplicateOf = "prompt-catalog";
        reason = "prompt_catalog";
      }
    }

  const internalDup = deduped.find((c) => c.normalizedContentHash === candidate.normalizedContentHash);
    if (!duplicateOf && internalDup && !exempt.has(candidate.promptCandidateId)) {
      duplicateOf = internalDup.promptCandidateId;
      reason = "same_harvest";
    }

    if (duplicateOf) {
      report.push({
        promptCandidateId: candidate.promptCandidateId,
        normalizedContentHash: candidate.normalizedContentHash,
        duplicateOf,
        reason,
      });
      deduped.push({
        ...candidate,
        promotionStatus: "duplicate",
        duplicateOf,
      });
    } else {
      deduped.push(candidate);
    }
  }

  return { candidates: deduped, report, deduplicatedCount: report.length };
}

export function applyPromotionDecisions(candidates, { bundle = null, operatorApprovals = [] } = {}) {
  const approvedIds = new Set(operatorApprovals);
  const decisions = [];

  const hasFailedProcedure =
    (bundle?.executionDeltas ?? []).some((d) => d.actualExecution?.outcome === "FAIL") ||
    (bundle?.wrongMoves ?? []).some((m) => m.actualExecution?.outcome === "FAIL");

  const promoted = candidates.map((candidate) => {
    let promotionStatus = candidate.promotionStatus;
    let reason = "default_candidate_only";

    if (candidate.containsSecrets) {
      promotionStatus = "rejected";
      reason = "contains_secrets";
    } else if (promotionStatus === "duplicate") {
      reason = "duplicate";
    } else if (approvedIds.has(candidate.promptCandidateId)) {
      promotionStatus = "approved";
      reason = "operator_approval";
    } else if (
      candidate.provenOutcome === "pass" &&
      ["execution", "verification", "closeout", "repair"].includes(candidate.promptType)
    ) {
      promotionStatus = "approved";
      reason = "proven_execution_outcome";
    } else if (hasFailedProcedure && candidate.provenOutcome === "fail") {
      promotionStatus = "candidate_only";
      reason = "failed_procedure";
    } else if (candidate.promotionStatus !== "duplicate") {
      promotionStatus = "candidate_only";
      reason = "pending_review";
    }

    decisions.push({
      promptCandidateId: candidate.promptCandidateId,
      promotionStatus,
      reason,
      grantsMutationAuthority: false,
    });

    return {
      ...candidate,
      promotionStatus,
      authorityLevel: promotionStatus === "approved" ? "approved" : "candidate",
      grantsMutationAuthority: false,
    };
  });

  return { candidates: promoted, decisions };
}

export function buildPromptCatalogDelta(approvedCandidates, { harvestId, sourceSha }) {
  return {
    schemaVersion: "harvest-prompt-catalog-delta-v1@1.0.0",
    harvestId,
    sourceSha,
    generatedAt: new Date().toISOString(),
    records: approvedCandidates.map((c) => ({
      promptId: `harvest:${c.promptCandidateId}`,
      version: "1.0.0",
      type: c.promptType,
      ownerRepo: c.ownerRepo,
      ownerMcp: c.ownerMcp,
      queryClasses: c.queryClasses,
      authorityLevel: "approved",
      sourcePath: `artifacts/agent-runs/${harvestId}/prompt-candidates.json#${c.promptCandidateId}`,
      contentHash: c.normalizedContentHash,
      requiredGateIds: c.gateIds,
      promotionStatus: c.promotionStatus,
      sourceHarvestId: harvestId,
      sourceThreadId: c.sourceThreadId,
    })),
  };
}

export function buildExecutionPacketBindingDelta(approvedCandidates, { crossAgentRoot }) {
  const manifestPath = path.join(
    crossAgentRoot,
    "registry/execution-packets/execution-packet-manifest.v1.json",
  );
  const manifest = readJsonIfExists(manifestPath);
  const bindings = [];

  for (const packet of manifest?.packets ?? []) {
    const matched = approvedCandidates.filter(
      (c) =>
        c.queryClasses.includes(packet.queryClass) ||
        (c.ownerRepo && packet.ownerRepo === c.ownerRepo),
    );
    if (!matched.length) continue;
    bindings.push({
      packetId: packet.packetId ?? packet.id,
      queryClass: packet.queryClass,
      promptIds: matched.map((c) => `harvest:${c.promptCandidateId}`),
      source: "harvest-prompt-extraction-v1",
    });
  }

  return {
    schemaVersion: "harvest-execution-packet-binding-delta-v1@1.0.0",
    generatedAt: new Date().toISOString(),
    bindings,
  };
}

export function buildPromptHarvestIndexSlice(approvedCandidates, { harvestId, sourceSha }) {
  return {
    schemaVersion: "intelligence-hub-prompt-harvest-slice-v1@1.0.0",
    harvestId,
    sourceSha,
    updatedAt: new Date().toISOString(),
    records: [...approvedCandidates, ...[]].map((c) => ({
      promptId: `harvest:${c.promptCandidateId}`,
      promptCandidateId: c.promptCandidateId,
      promptType: c.promptType,
      queryClasses: c.queryClasses,
      ownerRepo: c.ownerRepo,
      ownerMcp: c.ownerMcp,
      gateIds: c.gateIds,
      commandIds: c.commandIds,
      promotionStatus: c.promotionStatus,
      sourceHarvestId: harvestId,
      sourceThreadId: c.sourceThreadId,
      contentHash: c.normalizedContentHash,
    })),
  };
}

export function updateHarvestPromptRegistry(repoRoot, { harvestId, candidates, approved }) {
  const registryPath = path.join(repoRoot, "work-progress/harvest-prompt-registry.json");
  const existing = readJsonIfExists(registryPath) ?? {
    schemaVersion: "harvest-prompt-registry-v1@1.0.0",
    updatedAt: null,
    candidates: [],
    approvedPromptIds: [],
  };

  const byId = new Map((existing.candidates ?? []).map((c) => [c.promptCandidateId, c]));
  for (const candidate of candidates) {
    byId.set(candidate.promptCandidateId, {
      promptCandidateId: candidate.promptCandidateId,
      normalizedContentHash: candidate.normalizedContentHash,
      promotionStatus: candidate.promotionStatus,
      sourceHarvestId: harvestId,
      updatedAt: new Date().toISOString(),
    });
  }

  const approvedPromptIds = [
    ...new Set([
      ...(existing.approvedPromptIds ?? []),
      ...approved.map((c) => `harvest:${c.promptCandidateId}`),
    ]),
  ];

  const next = {
    ...existing,
    updatedAt: new Date().toISOString(),
    candidates: [...byId.values()],
    approvedPromptIds,
  };
  writeJson(registryPath, next);
  return next;
}

export function buildPromptHarvestReceipt({
  reviewed = true,
  candidates = [],
  deduplicated = 0,
  approved = [],
  rejected = [],
  candidateOnly = [],
  promptCatalogUpdated = false,
  executionPacketsUpdated = false,
  indexUpdated = false,
  supabaseSeeded = false,
  projectionReceiptIds = [],
  operatorApprovals = [],
  verdict = "PROMPT_HARVEST_NO_CANDIDATES",
}) {
  return {
    reviewed,
    operatorApprovals,
    candidatesFound: candidates.length,
    deduplicated,
    approved: approved.length,
    rejected: rejected.length,
    candidateOnly: candidateOnly.length,
    promptCatalogUpdated,
    executionPacketsUpdated,
    indexUpdated,
    supabaseSeeded,
    candidateIds: candidates.map((c) => c.promptCandidateId),
    approvedPromptIds: approved.map((c) => `harvest:${c.promptCandidateId}`),
    projectionReceiptIds,
    verdict,
  };
}

export function resolvePromptHarvestVerdict({ candidates, approved, pending, failed }) {
  if (failed) return "PROMPT_HARVEST_FAILED";
  if (!candidates.length) return "PROMPT_HARVEST_NO_CANDIDATES";
  if (pending > 0 && approved.length === 0) return "PROMPT_HARVEST_PENDING_REVIEW";
  return "PROMPT_HARVEST_COMPLETE";
}

export function runPromptHarvestPipeline({
  repoRoot,
  harvestId,
  appBuilderRoot = null,
  operatorApprovals = [],
  skipSupabase = true,
  projectToSupabase = null,
}) {
  const runDir = path.join(repoRoot, "artifacts/agent-runs", harvestId);
  const manifest = readJsonIfExists(path.join(runDir, "harvest-manifest-v1.json"));
  if (!manifest) {
    return { ok: false, verdict: "PROMPT_HARVEST_FAILED", error: "MISSING_MANIFEST" };
  }

  const bundle = readJsonIfExists(path.join(runDir, "thread-autopsy-bundle.json"));
  const inventory = readJsonIfExists(path.join(runDir, "thread-event-inventory.json"));
  const seedDir = path.join(runDir, "seed-packets");

  let failed = false;
  let candidates = [];
  try {
    candidates = extractPromptCandidatesFromHarvest({
      manifest,
      bundle,
      inventory,
      harvestId,
      sourceSha: manifest.sourceCommitSha,
      seedDir,
    });
  } catch (error) {
    failed = true;
    candidates = [];
  }

  const builderRoot =
    appBuilderRoot ??
    path.resolve(repoRoot, "..", "CG-AppBuilder-MCP");
  const approvals = operatorApprovals.length
    ? operatorApprovals
    : (manifest.promptHarvest?.operatorApprovals ?? []);
  const corpus = loadPromptDedupeCorpus({ repoRoot, appBuilderRoot: builderRoot });
  const { candidates: dedupedCandidates, report: dedupeReport, deduplicatedCount } =
    deduplicatePromptCandidates(candidates, corpus, { exemptCandidateIds: approvals });

  const { candidates: promoted, decisions } = applyPromotionDecisions(dedupedCandidates, {
    bundle,
    operatorApprovals: approvals,
  });

  const approved = promoted.filter((c) => c.promotionStatus === "approved");
  const rejected = promoted.filter((c) => c.promotionStatus === "rejected");
  const candidateOnly = promoted.filter((c) => c.promotionStatus === "candidate_only");
  const pending = promoted.filter(
    (c) => c.promotionStatus === "candidate_only" && !c.containsSecrets,
  );

  const catalogDelta = buildPromptCatalogDelta(approved, {
    harvestId,
    sourceSha: manifest.sourceCommitSha,
  });
  const bindingDelta = buildExecutionPacketBindingDelta(approved, { crossAgentRoot: repoRoot });
  const indexSlice = buildPromptHarvestIndexSlice(promoted, {
    harvestId,
    sourceSha: manifest.sourceCommitSha,
  });

  writeJson(path.join(runDir, "prompt-candidates.json"), {
    schemaVersion: "harvest-prompt-candidates-v1@1.0.0",
    harvestId,
    generatedAt: new Date().toISOString(),
    candidates: promoted,
  });
  writeJson(path.join(runDir, "prompt-deduplication-report.json"), {
    schemaVersion: "harvest-prompt-deduplication-report-v1@1.0.0",
    harvestId,
    deduplicatedCount,
    report: dedupeReport,
  });
  writeJson(path.join(runDir, "prompt-promotion-decisions.json"), {
    schemaVersion: "harvest-prompt-promotion-decisions-v1@1.0.0",
    harvestId,
    decisions,
  });
  writeJson(path.join(runDir, "prompt-catalog-delta.json"), catalogDelta);
  writeJson(path.join(runDir, "execution-packet-binding-delta.json"), bindingDelta);
  writeJson(path.join(runDir, "prompt-harvest-index-slice.json"), indexSlice);

  let promptCatalogUpdated = false;
  let executionPacketsUpdated = false;
  let indexUpdated = false;
  let supabaseSeeded = false;
  const projectionReceiptIds = [];

  if (approved.length > 0) {
    const aggregateDeltaPath = path.join(repoRoot, "work-progress/harvest-prompt-catalog-delta.json");
    const aggregate = readJsonIfExists(aggregateDeltaPath) ?? {
      schemaVersion: "harvest-prompt-catalog-delta-aggregate-v1@1.0.0",
      records: [],
    };
    const byPromptId = new Map((aggregate.records ?? []).map((r) => [r.promptId, r]));
    for (const record of catalogDelta.records) {
      byPromptId.set(record.promptId, record);
    }
    writeJson(aggregateDeltaPath, {
      ...aggregate,
      updatedAt: new Date().toISOString(),
      records: [...byPromptId.values()],
    });
    promptCatalogUpdated = true;
    executionPacketsUpdated = bindingDelta.bindings.length > 0;
    indexUpdated = true;
    updateHarvestPromptRegistry(repoRoot, { harvestId, candidates: promoted, approved });
  }

  if (!skipSupabase && approved.length > 0 && typeof projectToSupabase === "function") {
    const projection = projectToSupabase({ harvestId, approved, catalogDelta, sourceSha: manifest.sourceCommitSha });
    supabaseSeeded = projection?.ok === true;
    if (projection?.receiptId) projectionReceiptIds.push(projection.receiptId);
  }

  const verdict = resolvePromptHarvestVerdict({
    candidates: promoted,
    approved,
    pending: pending.length,
    failed,
  });

  const promptHarvest = buildPromptHarvestReceipt({
    reviewed: true,
    candidates: promoted,
    deduplicated: deduplicatedCount,
    approved,
    rejected,
    candidateOnly,
    promptCatalogUpdated,
    executionPacketsUpdated,
    indexUpdated,
    supabaseSeeded,
    projectionReceiptIds,
    operatorApprovals: approvals,
    verdict,
  });

  return {
    ok: !failed,
    verdict,
    promptHarvest,
    approved,
    candidates: promoted,
    outputs: {
      promptCandidatesPath: path.join(runDir, "prompt-candidates.json"),
      deduplicationReportPath: path.join(runDir, "prompt-deduplication-report.json"),
      promotionDecisionsPath: path.join(runDir, "prompt-promotion-decisions.json"),
      catalogDeltaPath: path.join(runDir, "prompt-catalog-delta.json"),
      bindingDeltaPath: path.join(runDir, "execution-packet-binding-delta.json"),
      indexSlicePath: path.join(runDir, "prompt-harvest-index-slice.json"),
    },
  };
}
