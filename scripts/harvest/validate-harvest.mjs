#!/usr/bin/env node
/**
 * Validate harvest authority: manifest, derived views, registry, INDEX section.
 */
import fs from "node:fs";
import path from "node:path";
import { hashCanonicalJson } from "./lib/hash.mjs";
import { validateManifestSchema } from "./lib/schema-validate.mjs";
import { validateThreadAutopsy } from "./lib/validate-thread-autopsy.mjs";
import {
  validateGoldMineEvidenceProjection,
  validateOutcomePackets,
} from "./lib/validate-gold-mine-evidence-projection.mjs";
import { REPO_ROOT, harvestRunDir, manifestPath } from "./lib/paths.mjs";
import { resolveHarvestIdFromProcessArgv } from "./lib/resolve-harvest-id.mjs";

const { harvestId } = resolveHarvestIdFromProcessArgv({ allowReferenceDefault: true });
const runDir = harvestRunDir(harvestId);
const manifestFile = manifestPath(harvestId);

const FORBIDDEN_KEY_RE = /(token|secret|password|authorization|bearer|apiKey|privateKey)/i;
const HOLD_VERDICTS = new Set(["HOLD", "BLOCKED", "CONTRACT_PASS_HOSTED_DEV_HOLD"]);
const PASS_LIKE = new Set(["PASS", "COMPLETE", "HARVEST_COMPLETE"]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function scanForbidden(value, pathParts = []) {
  const issues = [];
  if (value && typeof value === "object") {
    if (Array.isArray(value)) {
      value.forEach((item, i) => issues.push(...scanForbidden(item, [...pathParts, String(i)])));
    } else {
      for (const [key, val] of Object.entries(value)) {
        const keyPath = [...pathParts, key].join(".");
        if (FORBIDDEN_KEY_RE.test(key)) {
          issues.push(`forbidden key at ${keyPath}`);
        }
        issues.push(...scanForbidden(val, [...pathParts, key]));
      }
    }
  } else if (typeof value === "string" && FORBIDDEN_KEY_RE.test(value) && value.length > 20) {
    issues.push(`suspicious string at ${pathParts.join(".")}`);
  }
  return issues;
}

function indexHasPacketRow(indexContent, projectFile) {
  const base = path.basename(projectFile);
  return indexContent.includes(base) || indexContent.includes(projectFile);
}

function extractGeneratedSection(indexContent) {
  const start = indexContent.indexOf("<!-- HARVEST-PACKET-INDEX:START -->");
  const end = indexContent.indexOf("<!-- HARVEST-PACKET-INDEX:END -->");
  if (start === -1 || end === -1) return null;
  return indexContent.slice(start, end);
}

function main() {
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(manifestFile)) {
    const result = {
      schemaVersion: "cross-agent-harvest-validation-result-v1@1.0.0",
      harvestId,
      validatedAt: new Date().toISOString(),
      verdict: "FAIL",
      harvestManifestHash: null,
      errorCount: 1,
      warningCount: 0,
      errors: ["harvest-manifest-v1.json missing"],
      warnings: [],
    };
    fs.mkdirSync(runDir, { recursive: true });
    fs.writeFileSync(path.join(runDir, "validation-result.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
    console.error("harvest:validate FAIL");
    process.exit(1);
  }

  const manifest = readJson(manifestFile);
  const manifestHash = hashCanonicalJson(manifest);

  const schemaResult = validateManifestSchema(manifest);
  if (!schemaResult.ok) {
    errors.push(...schemaResult.errors.map((e) => `schema: ${e}`));
  }

  const packetIndexPath = path.join(runDir, "packet-index.json");
  const receiptPath = path.join(runDir, "receipt.json");
  const coveragePath = path.join(runDir, "coverage.json");
  const registryPath = path.join(REPO_ROOT, "work-progress/harvest-packet-registry.json");
  const boundaryPath = path.join(REPO_ROOT, "work-progress/owner-repo-boundary-index.json");
  const verdictRegistryPath = path.join(REPO_ROOT, "work-progress/harvest-verdict-registry.json");
  const indexPath = path.join(REPO_ROOT, "work-progress/projects/INDEX.md");

  errors.push(...scanForbidden(manifest));

  if (!manifest.packets?.length) {
    errors.push("manifest has no packets");
  }

  for (const packet of manifest.packets || []) {
    for (const field of ["packetId", "ownerRepo", "state", "packetVerdict", "nextAction", "projectFile", "ownerIndexingStatus"]) {
      if (!packet[field]) errors.push(`packet ${packet.packetId || "?"} missing ${field}`);
    }
    const projectAbs = path.join(REPO_ROOT, packet.projectFile);
    if (!fs.existsSync(projectAbs)) {
      errors.push(`projectFile missing: ${packet.projectFile}`);
    }
    if (HOLD_VERDICTS.has(packet.packetVerdict) || packet.state === "HOLD") {
      if (!packet.doNotAdvance?.length) {
        errors.push(`HOLD/BLOCKED packet ${packet.packetId} missing doNotAdvance`);
      }
    }
    if (HOLD_VERDICTS.has(packet.packetVerdict) && PASS_LIKE.has(packet.state)) {
      errors.push(`packet ${packet.packetId} HOLD verdict with PASS-like state`);
    }
    const compactPath = path.join(runDir, "compact-records", `${packet.packetId}.json`);
    if (!fs.existsSync(compactPath)) {
      errors.push(`compact record missing: ${packet.packetId}`);
    }
  }

  if (!fs.existsSync(packetIndexPath)) {
    errors.push("packet-index.json missing — run harvest:sync-derived");
  } else {
    const packetIndex = readJson(packetIndexPath);
    if (packetIndex.packets?.length !== manifest.packets.length) {
      errors.push("packet-index packet count mismatch with manifest");
    }
    for (const packet of manifest.packets) {
      const derived = packetIndex.packets.find((p) => p.id === packet.packetId);
      if (!derived) errors.push(`packet-index missing packet ${packet.packetId}`);
      else if (derived.verdict !== packet.packetVerdict || derived.state !== packet.state) {
        errors.push(`packet-index drift for ${packet.packetId}`);
      }
    }
  }

  if (!fs.existsSync(receiptPath)) {
    errors.push("receipt.json missing");
  } else {
    const receipt = readJson(receiptPath);
    if (receipt.harvestManifestHash !== manifestHash) {
      errors.push("receipt harvestManifestHash mismatch — run harvest:sync-derived");
    }
    if (receipt.sourceCommitSha !== manifest.sourceCommitSha) {
      errors.push("receipt sourceCommitSha mismatch");
    }
  }

  if (!fs.existsSync(coveragePath)) errors.push("coverage.json missing");
  if (!fs.existsSync(registryPath)) errors.push("harvest-packet-registry.json missing");
  else {
    const registry = readJson(registryPath);
    for (const packet of manifest.packets) {
      if (!registry.packets?.[packet.packetId]) {
        errors.push(`registry missing packet ${packet.packetId}`);
      }
    }
  }

  if (!fs.existsSync(boundaryPath)) errors.push("owner-repo-boundary-index.json missing");
  else {
    const boundary = readJson(boundaryPath);
    const registry = fs.existsSync(registryPath) ? readJson(registryPath) : { packets: {} };
    const registryIds = Object.keys(registry.packets || {}).sort();
    const boundaryIds = (boundary.packets || []).map((p) => p.packetId).sort();
    if (registryIds.length && JSON.stringify(boundaryIds) !== JSON.stringify(registryIds)) {
      errors.push("owner-repo-boundary-index packet IDs must match harvest-packet-registry authority");
    }
    for (const packet of manifest.packets) {
      const entry = (boundary.packets || []).find((p) => p.packetId === packet.packetId);
      if (!entry) {
        errors.push(`owner boundary missing manifest packet ${packet.packetId}`);
      } else if (entry.ownerRepo !== packet.ownerRepo) {
        errors.push(`owner boundary ownerRepo drift for ${packet.packetId}`);
      }
    }
  }
  if (!fs.existsSync(verdictRegistryPath)) errors.push("harvest-verdict-registry.json missing");

  const indexContent = fs.readFileSync(indexPath, "utf8");
  const generated = extractGeneratedSection(indexContent);
  if (!generated) {
    errors.push("INDEX.md missing HARVEST-PACKET-INDEX markers — run harvest:render-index");
  } else {
    for (const packet of manifest.packets) {
      if (!generated.includes(packet.packetId)) {
        errors.push(`INDEX generated section missing packet ${packet.packetId}`);
      }
    }
  }

  for (const packet of manifest.packets) {
    if (!indexHasPacketRow(indexContent, packet.projectFile)) {
      warnings.push(`INDEX.md may lack row for ${packet.projectFile} outside generated section`);
    }
  }

  if (!manifest.supersededClaims?.length) {
    warnings.push("no supersededClaims in manifest");
  }

  const autopsyResult = validateThreadAutopsy({
    manifest,
    runDir,
    repoRoot: REPO_ROOT,
    allowRepublish: process.argv.includes("--allow-republish"),
  });
  if (!autopsyResult.skipped) {
    errors.push(...autopsyResult.errors);
    warnings.push(...autopsyResult.warnings);
  } else {
    warnings.push(...autopsyResult.warnings);
  }

  const goldMineResult = validateGoldMineEvidenceProjection({
    runDir,
    manifest,
    tier: autopsyResult.tier ?? manifest.threadAutopsy?.tier,
  });
  warnings.push(...goldMineResult.warnings);
  validateOutcomePackets(manifest, warnings);

  const graphExtractionPath = path.join(runDir, "graph-extraction.json");
  const graphValidationPath = path.join(runDir, "graph-extraction-validation-result.json");
  if (!fs.existsSync(graphExtractionPath)) {
    errors.push("graph-extraction.json missing — run harvest:sync-derived");
  } else {
    const extraction = readJson(graphExtractionPath);
    if (extraction.harvestId !== harvestId) {
      errors.push("graph-extraction harvestId mismatch");
    }
    if (!fs.existsSync(graphValidationPath)) {
      errors.push("graph-extraction-validation-result.json missing");
    } else {
      const graphVal = readJson(graphValidationPath);
      if (graphVal.verdict !== "PASS") {
        errors.push(`graph extraction validation ${graphVal.verdict}`);
      }
    }
  }

  const pass = errors.length === 0;
  writeResult(errors, warnings, pass, manifestHash, schemaResult.ok, autopsyResult);
  process.exit(pass ? 0 : 1);
}

function writeResult(errors, warnings, pass = false, manifestHash = null, schemaOk = true, autopsyResult = null) {
  const result = {
    schemaVersion: "cross-agent-harvest-validation-result-v1@1.0.0",
    harvestId,
    validatedAt: new Date().toISOString(),
    verdict: pass ? "PASS" : "FAIL",
    harvestManifestHash: manifestHash,
    schemaValidation: schemaOk ? "PASS" : "FAIL",
    threadAutopsyValidation: autopsyResult?.skipped
      ? "SKIPPED"
      : autopsyResult?.errors?.length
        ? "FAIL"
        : "PASS",
    threadAutopsyTier: autopsyResult?.tier ?? null,
    goldMineProjectionValidation: "WARN_ONLY",
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings,
  };
  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(path.join(runDir, "validation-result.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
  if (pass) console.log("harvest:validate PASS");
  else {
    console.error("harvest:validate FAIL");
    for (const e of errors) console.error(`  - ${e}`);
  }
}

main();
