import fs from "node:fs";
import path from "node:path";

import {
  validateHarvestSeedPacketSchema,
  validateThreadAutopsyBundleSchema,
} from "./schema-validate.mjs";
import { runDuplicationPreflight } from "./duplication-preflight-lib.mjs";
import { resolveGitHead } from "../../index/lib/git-head.mjs";

const TIER_ORDER = { T0: 0, T1: 1, T2: 2, T3: 3 };

function tierAtLeast(tier, minimum) {
  return (TIER_ORDER[tier] ?? -1) >= (TIER_ORDER[minimum] ?? 99);
}

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/**
 * Tier-aware thread autopsy validation.
 * Skipped when manifest.threadAutopsy is absent (legacy harvests).
 */
export function validateThreadAutopsy({
  manifest,
  runDir,
  repoRoot,
  duplicationPreflight = "strict",
  gitHead = null,
  allowRepublish = false,
} = {}) {
  const errors = [];
  const warnings = [];

  if (!manifest.threadAutopsy) {
    return {
      skipped: true,
      tier: null,
      errors,
      warnings: ["manifest.threadAutopsy absent — legacy harvest; autopsy rules not enforced"],
    };
  }

  const tier = manifest.threadAutopsy.tier;
  if (!tier || !["T0", "T1", "T2", "T3"].includes(tier)) {
    errors.push("threadAutopsy.tier must be T0, T1, T2, or T3");
    return { skipped: false, tier, errors, warnings };
  }

  if (tier === "T0") {
    warnings.push("T0 harvest should use overallHarvestVerdict NO_HARVEST_NEEDED");
    return { skipped: false, tier, errors, warnings };
  }

  const bundlePath = path.join(runDir, "thread-autopsy-bundle.json");
  if (!fs.existsSync(bundlePath)) {
    errors.push(`thread-autopsy-bundle.json missing for tier ${tier}`);
    return { skipped: false, tier, errors, warnings };
  }

  const bundle = JSON.parse(fs.readFileSync(bundlePath, "utf8"));
  const bundleSchema = validateThreadAutopsyBundleSchema(bundle);
  if (!bundleSchema.ok) {
    errors.push(...bundleSchema.errors.map((e) => `autopsy bundle schema: ${e}`));
  }

  if (bundle.harvestId && bundle.harvestId !== manifest.harvestId) {
    errors.push(`autopsy bundle harvestId ${bundle.harvestId} !== manifest ${manifest.harvestId}`);
  }

  if (bundle.tier !== tier) {
    errors.push(`autopsy bundle tier ${bundle.tier} !== manifest.threadAutopsy.tier ${tier}`);
  }

  validateWasteLedger(bundle, errors);
  validateRoiBacklog(bundle, tier, errors, warnings);
  validateDuplicationCheck(bundle, tier, errors);
  validateWrongMovesAndDeltas(bundle, errors);
  validateDoNotAdvanceMap(bundle, errors);
  validateOperatorFriction(bundle, warnings);

  if (tierAtLeast(tier, "T2")) {
    validateExecutionDeltas(bundle, errors);
    validateSeedPackets({ manifest, runDir, tier, errors, warnings });
  }

  validateManifestPacketEvidence(manifest, errors, warnings);

  const summaryPath = path.join(runDir, "HARVEST_SUMMARY.md");
  if (fs.existsSync(summaryPath)) {
    validateProseRatio(summaryPath, bundle, warnings);
  }

  const counts = manifest.threadAutopsy.counts;
  if (counts) {
    validateCountAlignment(counts, bundle, runDir, errors);
  }

  if (duplicationPreflight !== "skip" && tierAtLeast(tier, "T1")) {
    const preflight = runDuplicationPreflight({
      repoRoot,
      harvestId: manifest.harvestId,
      runDir,
      manifest,
      bundle,
      gitHead: gitHead ?? resolveGitHead(repoRoot),
      mode: "validate",
      allowRepublish,
      writeReceipt: true,
    });
    if (!preflight.ok) {
      errors.push(...preflight.errors.map((e) => `duplication preflight: ${e}`));
    }
    for (const w of preflight.warnings) {
      warnings.push(`duplication preflight: ${w}`);
    }
  }

  const registryPath = path.join(repoRoot, "work-progress/do-not-advance-registry.json");
  if (tierAtLeast(tier, "T1") && !fs.existsSync(registryPath)) {
    warnings.push("work-progress/do-not-advance-registry.json missing");
  }

  return { skipped: false, tier, errors, warnings, bundlePath };
}

function validateWasteLedger(bundle, errors) {
  if (bundle.wasteLedgerStatus === "NONE_FOUND") {
    if (!bundle.noneFoundEvidence?.trim()) {
      errors.push("wasteLedgerStatus NONE_FOUND requires noneFoundEvidence");
    }
    if (bundle.waste?.length > 0) {
      errors.push("wasteLedgerStatus NONE_FOUND but waste array is non-empty");
    }
    return;
  }

  if (bundle.wasteLedgerStatus !== "POPULATED") {
    errors.push('wasteLedgerStatus must be POPULATED or NONE_FOUND');
    return;
  }

  if (!bundle.waste?.length) {
    errors.push("wasteLedgerStatus POPULATED requires at least one waste entry");
  }

  for (const entry of bundle.waste || []) {
    if (!entry.wasteId || !entry.type || !entry.description) {
      errors.push(`waste entry incomplete: ${entry.wasteId || "?"}`);
    }
  }
}

function validateRoiBacklog(bundle, tier, errors, warnings) {
  if (!tierAtLeast(tier, "T1")) return;

  if (!bundle.roiBacklog?.length) {
    if (bundle.wasteLedgerStatus === "NONE_FOUND") {
      warnings.push("roiBacklog empty but waste NONE_FOUND — acceptable");
      return;
    }
    errors.push("roiBacklog must have at least one item for T1+");
    return;
  }

  const wasteCount = bundle.waste?.length ?? 0;
  if (wasteCount >= 3 && bundle.roiBacklog.length < 3) {
    warnings.push(`roiBacklog has ${bundle.roiBacklog.length} items but waste has ${wasteCount} — rank at least 3 when waste >= 3`);
  }

  for (const item of bundle.roiBacklog) {
    if (!item.rank || !item.title || !item.whyItPays) {
      errors.push(`roiBacklog item incomplete at rank ${item.rank ?? "?"}`);
    }
  }
}

function validateDuplicationCheck(bundle, tier, errors) {
  if (!tierAtLeast(tier, "T1")) return;
  const check = bundle.duplicationCheck;
  if (!check) {
    errors.push("duplicationCheck required for T1+");
    return;
  }
  if (check.registryConsulted !== true) {
    errors.push("duplicationCheck.registryConsulted must be true");
  }
  if (check.commandIndexConsulted !== true) {
    errors.push("duplicationCheck.commandIndexConsulted must be true");
  }
  if (!Array.isArray(check.hubSlicesConsulted) || check.hubSlicesConsulted.length === 0) {
    errors.push("duplicationCheck.hubSlicesConsulted must list consulted slices");
  }
  if (!check.preflightReceiptHash?.trim()) {
    errors.push(
      "duplicationCheck.preflightReceiptHash required — run npm run harvest:duplication-preflight",
    );
  }
  for (const slice of ["active-work-blockers.json", "thread-autopsy-index.json"]) {
    if (!check.hubSlicesConsulted?.includes(slice)) {
      errors.push(`duplicationCheck.hubSlicesConsulted must include ${slice}`);
    }
  }
}

function validateWrongMovesAndDeltas(bundle, errors) {
  const deltaIds = new Set((bundle.executionDeltas || []).map((d) => d.executionDeltaId));

  for (const wm of bundle.wrongMoves || []) {
    const hasDeltaRef = wm.executionDeltaId && deltaIds.has(wm.executionDeltaId);
    const hasEmbedded =
      wm.actualExecution?.steps?.length && wm.optimalExecution?.steps?.length;
    if (!hasDeltaRef && !hasEmbedded) {
      errors.push(
        `wrongMove ${wm.wrongMoveId} must link executionDeltaId or embed actualExecution/optimalExecution`,
      );
    }
  }
}

function validateExecutionDeltas(bundle, errors) {
  if (bundle.executionDeltas?.length > 0) {
    for (const delta of bundle.executionDeltas) {
      if (!delta.actualExecution?.steps?.length || !delta.optimalExecution?.steps?.length) {
        errors.push(`executionDelta ${delta.executionDeltaId} missing actual or optimal steps`);
      }
    }
    return;
  }

  if (bundle.wrongMoves?.length > 0) {
    errors.push("T2+ with wrongMoves requires executionDeltas or embedded execution on wrongMoves");
    return;
  }

  if (!bundle.noDeltaReason?.trim()) {
    errors.push("T2+ requires executionDeltas or noDeltaReason when no agent actions occurred");
  }
}

function validateDoNotAdvanceMap(bundle, errors) {
  for (const entry of bundle.doNotAdvanceMap || []) {
    if (!entry.awardOrVerdict || !entry.doNotClaimUntil?.length) {
      errors.push(`doNotAdvanceMap entry incomplete: ${entry.awardOrVerdict || "?"}`);
    }
    if (entry.currentStatus !== "CLOSED" && !entry.lastKnownEvidence?.length) {
      errors.push(
        `doNotAdvanceMap ${entry.awardOrVerdict}: non-CLOSED entries need lastKnownEvidence`,
      );
    }
  }
}

function validateOperatorFriction(bundle, warnings) {
  const wasteIds = new Set((bundle.waste || []).map((w) => w.wasteId));
  for (const friction of bundle.operatorFriction || []) {
    for (const wasteId of friction.linkedWasteIds || []) {
      if (!wasteIds.has(wasteId)) {
        warnings.push(`operatorFriction ${friction.frictionId} links unknown wasteId ${wasteId}`);
      }
    }
  }
}

function validateSeedPackets({ manifest, runDir, tier, errors, warnings }) {
  const seedDir = path.join(runDir, "seed-packets");
  const indexPath =
    manifest.threadAutopsy.seedPacketIndexPath &&
    !path.isAbsolute(manifest.threadAutopsy.seedPacketIndexPath)
      ? path.join(runDir, path.basename(manifest.threadAutopsy.seedPacketIndexPath))
      : path.join(runDir, "seed-packet-index.json");

  if (!fs.existsSync(seedDir)) {
    errors.push("seed-packets/ directory required for T2+");
    return;
  }

  const seedFiles = fs.readdirSync(seedDir).filter((f) => f.endsWith(".json"));
  if (seedFiles.length === 0) {
    errors.push("T2+ requires at least one seed packet in seed-packets/");
  }

  const seedIds = [];
  for (const file of seedFiles) {
    const seed = JSON.parse(fs.readFileSync(path.join(seedDir, file), "utf8"));
    const schemaResult = validateHarvestSeedPacketSchema(seed);
    if (!schemaResult.ok) {
      errors.push(...schemaResult.errors.map((e) => `seed ${file}: ${e}`));
      continue;
    }

    const fai = seed.futureAgentInstructions;
    if (!fai?.whenThisAppears || !fai.startAt?.length || !fai.doNot?.length || !fai.proveBeforeClaiming?.length) {
      errors.push(`seed ${seed.seedId}: incomplete futureAgentInstructions`);
    }
    if (!seed.retrievalQuestions || seed.retrievalQuestions.length < 2) {
      errors.push(`seed ${seed.seedId}: requires >= 2 retrievalQuestions`);
    }
    if (!seed.evidenceRefs?.length) {
      errors.push(`seed ${seed.seedId}: requires >= 1 evidenceRef`);
    }
    seedIds.push(seed.seedId);
  }

  if (fs.existsSync(indexPath)) {
    const index = readJsonIfExists(indexPath);
    if (index?.seedIds) {
      for (const id of index.seedIds) {
        if (!seedIds.includes(id)) {
          errors.push(`seed-packet-index references missing seed ${id}`);
        }
      }
    }
  } else {
    warnings.push("seed-packet-index.json missing for T2+");
  }
}

function validateManifestPacketEvidence(manifest, errors, warnings) {
  for (const packet of manifest.packets || []) {
    const verdict = packet.packetVerdict ?? "";
    if (verdict === "UNKNOWN") continue;
    if (!packet.evidenceRefs?.length) {
      errors.push(`packet ${packet.packetId} missing evidenceRefs (verdict ${verdict})`);
    }
  }
}

function validateProseRatio(summaryPath, bundle, warnings) {
  const prose = fs.readFileSync(summaryPath, "utf8");
  const proseWords = prose.split(/\s+/).filter(Boolean).length;
  const structured = JSON.stringify(bundle);
  const structuredTokens = structured.split(/\s+/).length;
  if (proseWords > structuredTokens * 2 && proseWords > 200) {
    warnings.push(
      "HARVEST_SUMMARY.md may be prose-heavy relative to structured autopsy bundle — review for HARVEST_PARTIAL risk",
    );
  }
}

function validateCountAlignment(counts, bundle, runDir, errors) {
  if (counts.waste != null && counts.waste !== (bundle.waste?.length ?? 0)) {
    errors.push(`threadAutopsy.counts.waste ${counts.waste} !== bundle waste length ${bundle.waste?.length ?? 0}`);
  }
  if (counts.roiItems != null && counts.roiItems !== (bundle.roiBacklog?.length ?? 0)) {
    errors.push(
      `threadAutopsy.counts.roiItems ${counts.roiItems} !== roiBacklog length ${bundle.roiBacklog?.length ?? 0}`,
    );
  }
  if (counts.operatorFriction != null && counts.operatorFriction !== (bundle.operatorFriction?.length ?? 0)) {
    errors.push(
      `threadAutopsy.counts.operatorFriction mismatch: ${counts.operatorFriction} vs ${bundle.operatorFriction?.length ?? 0}`,
    );
  }
  if (counts.seeds != null) {
    const seedDir = path.join(runDir, "seed-packets");
    const seedCount = fs.existsSync(seedDir)
      ? fs.readdirSync(seedDir).filter((f) => f.endsWith(".json")).length
      : 0;
    if (counts.seeds !== seedCount) {
      errors.push(`threadAutopsy.counts.seeds ${counts.seeds} !== seed-packets count ${seedCount}`);
    }
  }
}
