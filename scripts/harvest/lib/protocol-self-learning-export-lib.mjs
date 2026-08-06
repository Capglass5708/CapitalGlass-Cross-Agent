import fs from "node:fs";
import path from "node:path";

import { hashCanonicalJson } from "./hash.mjs";
import { harvestRunDir } from "./paths.mjs";

export const INPUT_SCHEMA = "harvest-protocol-self-learning-input-v1@1.0.0";
export const EXPORT_RECEIPT_SCHEMA = "harvest-protocol-self-learning-export-receipt-v1@1.0.0";

const PROTOCOL_FILE_HINT = /harvest\/protocol|harvest-manifest|validate-harvest|duplication-preflight|prompt-extraction|seed-packet|thread-autopsy|harvest:validate|harvest:sync-derived/i;

const CATEGORY_KEYWORDS = [
  ["HARVEST_SCHEMA", /schema|manifest/i],
  ["HARVEST_VALIDATOR", /validat|validator/i],
  ["PACKET_REQUIREMENT", /packet.?require|required.?packet/i],
  ["EVIDENCE_REQUIREMENT", /evidence.?require/i],
  ["DUPLICATION_PREVENTION", /duplicat/i],
  ["RETRIEVAL_PREFLIGHT", /retrieval|preflight|index/i],
  ["WASTE_LEDGER", /waste|ledger/i],
  ["OPERATOR_FRICTION_CAPTURE", /operator.?friction|friction/i],
  ["EXECUTION_DELTA", /execution.?delta/i],
  ["SEED_PACKET_QUALITY", /seed.?packet/i],
  ["PUBLICATION_TRUTH", /publication.?truth|hub.?publish/i],
  ["CLOSEOUT_HANDOFF", /closeout|handoff/i],
  ["HARVEST_ROUTING", /routing|export|lane/i],
  ["PROMPT_EXTRACTION", /prompt.?extract/i],
  ["PROMPTOPS_PROMOTION_BOUNDARY", /promptops|promotion.?bound/i],
  ["HARVEST_INDEX", /index|BY-KIND/i],
  ["HARVEST_FRESHNESS", /fresh|stale/i],
  ["HARVEST_FAILURE_CODE", /failure.?code|blocker/i],
  ["HARVEST_COMMAND", /npm run harvest/i],
  ["HARVEST_TEST", /test:harvest/i],
  ["HARVEST_ROLLBACK", /rollback|recover/i],
  ["HARVEST_VERSIONING", /version|supersed/i],
  ["HARVEST_AUTHORITY_BOUNDARY", /authority|RETRIEVAL_ONLY/i],
];

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function toSha256Prefixed(hex) {
  return `sha256:${hex}`;
}

export function inferProtocolCategory(text) {
  const hay = String(text ?? "");
  for (const [category, pattern] of CATEGORY_KEYWORDS) {
    if (pattern.test(hay)) return category;
  }
  return "OTHER_HARVEST_PROTOCOL_IMPROVEMENT";
}

function hasProtocolTarget(candidate) {
  return (
    (candidate.targetProtocolFiles?.length ?? 0) > 0 ||
    (candidate.targetSchemas?.length ?? 0) > 0 ||
    (candidate.targetValidators?.length ?? 0) > 0 ||
    (candidate.targetCommands?.length ?? 0) > 0
  );
}

function inferTargetsFromText(text, refs = []) {
  const targets = new Set();
  const hay = `${text} ${refs.join(" ")}`;
  if (/harvest-manifest/i.test(hay)) targets.add("harvest-manifest-v1.json");
  if (/validate-harvest|harvest:validate/i.test(hay)) targets.add("scripts/harvest/validate-harvest.mjs");
  if (/duplication-preflight/i.test(hay)) targets.add("scripts/harvest/run-duplication-preflight.mjs");
  if (/prompt-extraction/i.test(hay)) targets.add("scripts/harvest/lib/prompt-extraction-lib.mjs");
  if (/CHAT-THREAD-CLOSEOUT-AUTOPSY/i.test(hay)) {
    targets.add("harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md");
  }
  if (/seed-packet/i.test(hay)) targets.add("harvest/protocol/seed-packet schema");
  return [...targets];
}

function baseCandidate(packet, index) {
  const text = `${packet.title ?? packet.packetTitle ?? ""} ${packet.problem ?? packet.nextAction ?? ""}`;
  const evidenceRefs = packet.evidenceRefs ?? [];
  const targetProtocolFiles =
    packet.targetProtocolFiles ?? inferTargetsFromText(text, evidenceRefs);
  return {
    candidateId: packet.candidateId ?? `HPC-${String(index).padStart(3, "0")}`,
    category: packet.category ?? inferProtocolCategory(text),
    title: packet.title ?? packet.packetTitle ?? "Harvest protocol improvement",
    protocolProblem: packet.protocolProblem ?? packet.problem ?? packet.nextAction ?? "",
    currentProtocolBehavior: packet.currentProtocolBehavior ?? "NEEDS_VERIFICATION",
    desiredProtocolBehavior: packet.desiredProtocolBehavior ?? packet.proposedImprovement ?? packet.nextAction ?? "",
    proposedProtocolChange: packet.proposedProtocolChange ?? packet.proposedImprovement ?? packet.nextAction ?? "",
    targetProtocolFiles,
    targetSchemas: packet.targetSchemas ?? [],
    targetValidators: packet.targetValidators ?? [],
    targetCommands: packet.targetCommands ?? [],
    evidenceRefs,
    crossCheckCommands: packet.crossCheckCommands ?? [],
    risk: packet.risk ?? "UNKNOWN",
    confidence: packet.confidence ?? "LOW",
    authorityStatus: packet.authorityStatus === "CANDIDATE" ? "CANDIDATE" : "PROPOSAL",
    reviewStatus: packet.reviewStatus ?? "PENDING",
    automaticImplementationEligible: packet.automaticImplementationEligible === true,
    requiredGates: packet.requiredGates ?? ["harvest:validate", "test:harvest"],
    rollbackPlan: packet.rollbackPlan ?? "Revert feature branch; preserve L package hash",
  };
}

export function extractProtocolCandidatesFromManifest(manifest, runDir) {
  const candidates = [];
  let index = 1;

  for (const packet of manifest.protocolImprovementCandidates ?? []) {
    const c = baseCandidate(packet, index++);
    if (hasProtocolTarget(c) && (c.evidenceRefs?.length ?? 0) > 0) candidates.push(c);
  }

  for (const packet of manifest.packets ?? []) {
    const kind = `${packet.packetKind ?? ""} ${packet.packetTitle ?? ""}`;
    const isProtocolPacket =
      /protocol-upgrade|protocol_improvement|harvest.?protocol/i.test(kind) ||
      (packet.evidenceRefs ?? []).some((r) => PROTOCOL_FILE_HINT.test(r));
    if (!isProtocolPacket) continue;
    const c = baseCandidate(
      {
        ...packet,
        title: packet.packetTitle,
        problem: packet.nextAction,
        proposedImprovement: packet.nextAction,
      },
      index++,
    );
    if (hasProtocolTarget(c) && (c.evidenceRefs?.length ?? 0) > 0) candidates.push(c);
  }

  const seedDir = path.join(runDir, "seed-packets");
  if (fs.existsSync(seedDir)) {
    for (const name of fs.readdirSync(seedDir).filter((n) => n.endsWith(".json"))) {
      const seed = readJsonIfExists(path.join(seedDir, name));
      if (!seed) continue;
      const kind = String(seed.kind ?? "");
      if (!/protocol-upgrade|protocol_upgrade|harvest.?protocol/i.test(kind)) continue;
      const text = `${seed.title ?? ""} ${(seed.futureAgentInstructions?.doNot ?? []).join(" ")}`;
      const evidenceRefs = seed.evidenceRefs ?? [];
      const c = baseCandidate(
        {
          candidateId: seed.seedId,
          title: seed.title,
          problem: seed.summary ?? seed.kind,
          proposedImprovement: (seed.futureAgentInstructions?.proveBeforeClaiming ?? []).join("; "),
          evidenceRefs,
          category: inferProtocolCategory(text),
        },
        index++,
      );
      if (hasProtocolTarget(c) && evidenceRefs.length > 0) candidates.push(c);
    }
  }

  return candidates;
}

export function buildProtocolSelfLearningInput({ harvestId, runDir, options = {} }) {
  const manifest = readJsonIfExists(path.join(runDir, "harvest-manifest-v1.json"));
  if (!manifest) return { ok: false, code: "MANIFEST_MISSING", harvestId };
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

  const protocolImprovementCandidates = extractProtocolCandidatesFromManifest(manifest, runDir);
  const protocolMeta = manifest.protocolSelfLearning ?? manifest.harvestProtocol ?? {};

  const input = {
    schema: INPUT_SCHEMA,
    harvestId,
    sourceProtocolId:
      options.sourceProtocolId ??
      protocolMeta.sourceProtocolId ??
      "chat-thread-closeout-autopsy-harvest-v1",
    sourceProtocolVersion: protocolMeta.sourceProtocolVersion ?? manifest.schemaVersion ?? "1.0.0",
    sourceProtocolHash: protocolMeta.sourceProtocolHash ?? validation?.harvestManifestHash ?? "unknown",
    sourceReceipt: `artifacts/agent-runs/${harvestId}/validation-result.json`,
    observedAt: options.observedAt ?? validation?.validatedAt ?? manifest.observedAt ?? new Date().toISOString(),
    protocolImprovementCandidates,
    evidence: (manifest.packets ?? []).flatMap((p) => p.evidenceRefs ?? []).slice(0, 50),
    crossCheckCommands: [
      `npm run harvest:validate -- ${harvestId}`,
      `npm run harvest:export:protocol-self-learning -- --harvest-id=${harvestId} --json`,
    ],
    invalidationTriggers: protocolMeta.invalidationTriggers ?? [
      "harvest_manifest_hash_changes",
      "validation_receipt_missing",
      "governance_rejection",
    ],
    authority: {
      sourceOwner: "CapitalGlass-Cross-Agent",
      processingOwner: "Data-Extraction",
      approvalOwner: "CG-Platform-Governance-MCP",
      catalogRole: "RETRIEVAL_ONLY",
    },
  };

  const contentHash = toSha256Prefixed(hashCanonicalJson(input));
  input.contentHash = contentHash;

  return { ok: true, input, contentHash, manifest, validation, candidateCount: protocolImprovementCandidates.length };
}

export function exportProtocolSelfLearning({ harvestId, options = {} }) {
  const runDir = options.runDir ?? harvestRunDir(harvestId);
  const built = buildProtocolSelfLearningInput({ harvestId, runDir, options });
  if (!built.ok) return built;

  const outDir = path.join(runDir, "data-extraction-handoff");
  fs.mkdirSync(outDir, { recursive: true });

  const inputPath = path.join(outDir, "harvest-protocol-self-learning-input.json");
  fs.writeFileSync(inputPath, `${JSON.stringify(built.input, null, 2)}\n`, "utf8");

  const receipt = {
    schema: EXPORT_RECEIPT_SCHEMA,
    harvestId,
    contentHash: built.contentHash,
    candidateCount: built.candidateCount,
    exportedAt: new Date().toISOString(),
    processingOwner: "Data-Extraction",
    catalogRole: "RETRIEVAL_ONLY",
    lPublicationStatus: "NOT_RUN_BY_CROSS_AGENT",
    targetCatalog: "L:\\02-catalog\\Harvest\\Harvest Protocol Self Learning",
    automaticProtocolMutation: false,
  };
  const receiptPath = path.join(outDir, "protocol-self-learning-export-receipt.json");
  fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");

  return {
    ok: true,
    verdict: built.candidateCount ? "EXPORT_PASS" : "EXPORT_EMPTY",
    harvestId,
    contentHash: built.contentHash,
    candidateCount: built.candidateCount,
    outDir,
    inputPath,
    receiptPath,
    receipt,
  };
}
