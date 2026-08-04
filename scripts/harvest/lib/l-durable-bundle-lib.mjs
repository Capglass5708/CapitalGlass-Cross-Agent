import fs from "node:fs";
import path from "node:path";
import { hashFileContent } from "./hash.mjs";
import { resolveHubRoot } from "./publish-hub-seed-lib.mjs";
import {
  buildPublicationIdentity,
  buildDurablePayloadInventory,
  computePayloadHash,
  INVENTORY_SCHEMA_VERSION,
} from "./publication-identity-lib.mjs";

export { resolveHubRoot };

export const RECEIPT_SCHEMA_VERSION = "harvest-l-durable-publication-receipt-v1@1.0.0";
export const BY_HARVEST_POINTER_SCHEMA = "intelligence-hub-by-harvest-pointer-v1@1.0.0";
export const COMPLETE_MARKER_FILENAME = "PUBLICATION_COMPLETE.json";
export const INVENTORY_FILENAME = "durable-file-inventory.json";
export const IDENTITY_FILENAME = "publication-identity.json";
export const PAYLOAD_DIRNAME = "payload";

export function stripHashPrefix(hash) {
  return hash.replace(/^sha256:/, "");
}

export function hubRel(...segments) {
  return segments.filter(Boolean).join("/");
}

export function bundleLayout(hubRoot, harvestId, payloadHash) {
  const hashDir = stripHashPrefix(payloadHash);
  const stagingRoot = path.join(hubRoot, "_staging", "harvests", harvestId, hashDir);
  const catalogRoot = path.join(hubRoot, "02-catalog", "harvests", harvestId, hashDir);
  const byHarvestPointer = path.join(hubRoot, "00-master-index", "BY-HARVEST", `${harvestId}.json`);
  const operationsReceipt = path.join(
    hubRoot,
    "00-master-index",
    "_operations",
    "harvest-publication",
    harvestId,
    hashDir,
    "latest-operation.json",
  );
  return {
    hashDir,
    stagingRoot,
    catalogRoot,
    stagingRel: hubRel("_staging", "harvests", harvestId, hashDir),
    catalogRel: hubRel("02-catalog", "harvests", harvestId, hashDir),
    byHarvestPointer,
    byHarvestRel: hubRel("00-master-index", "BY-HARVEST", `${harvestId}.json`),
    operationsReceipt,
    operationsRel: hubRel(
      "00-master-index",
      "_operations",
      "harvest-publication",
      harvestId,
      hashDir,
      "latest-operation.json",
    ),
    payloadStaging: path.join(stagingRoot, PAYLOAD_DIRNAME),
    payloadCatalog: path.join(catalogRoot, PAYLOAD_DIRNAME),
  };
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function copyFileEnsuringDir(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  // drvfs (WSL /mnt/l) rejects Node copyFileSync; read/write is reliable.
  const content = fs.readFileSync(src);
  fs.writeFileSync(dest, content);
}

function copyTree(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyTree(src, dest);
    } else {
      copyFileEnsuringDir(src, dest);
    }
  }
}

function removeTree(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

export function verifyInventoryAgainstPayload(bundleRoot, inventory) {
  const payloadRoot = path.join(bundleRoot, PAYLOAD_DIRNAME);
  const errors = [];
  let byteCount = 0;
  let fileCount = 0;

  for (const artifact of inventory.artifacts) {
    const absPath = path.join(payloadRoot, artifact.logicalPath);
    if (!fs.existsSync(absPath)) {
      errors.push(`MISSING:${artifact.logicalPath}`);
      continue;
    }
    const content = fs.readFileSync(absPath);
    byteCount += content.length;
    fileCount += 1;
    const actual = `sha256:${hashFileContent(content)}`;
    if (actual !== artifact.contentHash) {
      errors.push(`HASH_MISMATCH:${artifact.logicalPath}`);
    }
  }

  const { payloadHash: _ignored, ...body } = inventory;
  const expectedPayloadHash = computePayloadHash({ ...body, payloadHash: inventory.payloadHash });
  if (expectedPayloadHash !== inventory.payloadHash) {
    errors.push("INVENTORY_PAYLOAD_HASH_MISMATCH");
  }

  return {
    ok: errors.length === 0,
    errors,
    fileCount,
    byteCount,
    hashVerification: errors.length === 0 ? "PASS" : "FAIL",
  };
}

export function isBundlePublicationComplete(bundleRoot) {
  return fs.existsSync(path.join(bundleRoot, COMPLETE_MARKER_FILENAME));
}

export function readBundleMetadata(bundleRoot) {
  const inventoryPath = path.join(bundleRoot, INVENTORY_FILENAME);
  const identityPath = path.join(bundleRoot, IDENTITY_FILENAME);
  if (!fs.existsSync(inventoryPath) || !fs.existsSync(identityPath)) {
    return null;
  }
  return {
    inventory: readJson(inventoryPath),
    identity: readJson(identityPath),
  };
}

export function reconstructPayloadToDir(bundleRoot, targetDir) {
  const payloadRoot = path.join(bundleRoot, PAYLOAD_DIRNAME);
  if (!fs.existsSync(payloadRoot)) {
    throw new Error("MISSING_PAYLOAD_DIR");
  }
  removeTree(targetDir);
  copyTree(payloadRoot, targetDir);
  return targetDir;
}

function writeStagingBundle({ layout, identity, inventory, sourceRunDir }) {
  removeTree(layout.stagingRoot);
  const payloadDest = layout.payloadStaging;
  fs.mkdirSync(payloadDest, { recursive: true });

  for (const artifact of inventory.artifacts) {
    const src = path.join(sourceRunDir, artifact.logicalPath);
    const dest = path.join(payloadDest, artifact.logicalPath);
    copyFileEnsuringDir(src, dest);
  }

  writeJson(path.join(layout.stagingRoot, INVENTORY_FILENAME), inventory);
  writeJson(path.join(layout.stagingRoot, IDENTITY_FILENAME), identity);

  const verify = verifyInventoryAgainstPayload(layout.stagingRoot, inventory);
  if (!verify.ok) {
    throw new Error(`L_STAGING_HASH_FAIL:${verify.errors.join(",")}`);
  }

  return verify;
}

export function stageLDurableBundle({
  hubRoot,
  sourceRunDir,
  harvestId,
  options = {},
}) {
  const manifest = readJson(path.join(sourceRunDir, "harvest-manifest-v1.json"));
  if (manifest.harvestId !== harvestId) {
    throw new Error(`HARVEST_ID_MISMATCH:${manifest.harvestId}`);
  }

  const identity = buildPublicationIdentity({ manifest, runDir: sourceRunDir, options });
  const inventory = buildDurablePayloadInventory({
    manifest,
    runDir: sourceRunDir,
    harvestTier: identity.harvestTier,
  });

  if (inventory.payloadHash !== identity.payloadHash) {
    throw new Error("IDENTITY_PAYLOAD_HASH_MISMATCH");
  }

  const layout = bundleLayout(hubRoot, harvestId, identity.payloadHash);
  const verify = writeStagingBundle({ layout, identity, inventory, sourceRunDir });

  return {
    verdict: "L_STAGING_PASS",
    harvestId,
    manifestHash: identity.manifestHash,
    payloadHash: identity.payloadHash,
    authoritySourceCommit: identity.authoritySourceCommit,
    stagingPath: layout.stagingRel,
    stagingRoot: layout.stagingRoot,
    fileCount: verify.fileCount,
    byteCount: verify.byteCount,
    hashVerification: verify.hashVerification,
    identity,
    inventory,
  };
}

function readByHarvestPointer(layout) {
  if (!fs.existsSync(layout.byHarvestPointer)) {
    return null;
  }
  return readJson(layout.byHarvestPointer);
}

function writeByHarvestPointer(layout, identity, catalogRel) {
  writeJson(layout.byHarvestPointer, {
    schemaVersion: BY_HARVEST_POINTER_SCHEMA,
    harvestId: identity.harvestId,
    currentPayloadHash: identity.payloadHash,
    manifestHash: identity.manifestHash,
    authoritySourceCommit: identity.authoritySourceCommit,
    durablePath: catalogRel,
    supersedes: identity.supersedes ?? [],
    updatedAt: new Date().toISOString(),
  });
}

function writePublicationComplete(catalogRoot, identity, method) {
  writeJson(path.join(catalogRoot, COMPLETE_MARKER_FILENAME), {
    schemaVersion: "harvest-l-durable-publication-complete-v1@1.0.0",
    harvestId: identity.harvestId,
    payloadHash: identity.payloadHash,
    manifestHash: identity.manifestHash,
    authoritySourceCommit: identity.authoritySourceCommit,
    publicationMethod: method,
    completedAt: new Date().toISOString(),
  });
}

function writeOperationReceipt(layout, receipt) {
  writeJson(layout.operationsReceipt, receipt);
}

function promoteByDirectoryRename(layout) {
  fs.mkdirSync(path.dirname(layout.catalogRoot), { recursive: true });
  if (fs.existsSync(layout.catalogRoot)) {
    throw new Error("CATALOG_TARGET_EXISTS");
  }
  fs.renameSync(layout.stagingRoot, layout.catalogRoot);
  return "DIRECTORY_RENAME";
}

function promoteByCopyThenMarker(layout) {
  if (fs.existsSync(layout.catalogRoot)) {
    throw new Error("CATALOG_TARGET_EXISTS");
  }
  copyTree(layout.stagingRoot, layout.catalogRoot);
  removeTree(layout.stagingRoot);
  return "COPY_THEN_COMPLETE_MARKER";
}

function tryPromote(layout, preferRename = true) {
  if (preferRename) {
    try {
      return promoteByDirectoryRename(layout);
    } catch {
      if (fs.existsSync(layout.catalogRoot)) {
        throw new Error("CATALOG_TARGET_EXISTS");
      }
      return promoteByCopyThenMarker(layout);
    }
  }
  return promoteByCopyThenMarker(layout);
}

function inventoriesMatch(a, b) {
  if (a.payloadHash !== b.payloadHash) return false;
  if (a.artifacts.length !== b.artifacts.length) return false;
  const sortedA = [...a.artifacts].sort((x, y) => x.logicalPath.localeCompare(y.logicalPath));
  const sortedB = [...b.artifacts].sort((x, y) => x.logicalPath.localeCompare(y.logicalPath));
  return sortedA.every((item, idx) => {
    const other = sortedB[idx];
    return item.logicalPath === other.logicalPath && item.contentHash === other.contentHash;
  });
}

export function publishLDurableBundle({
  hubRoot,
  harvestId,
  payloadHash,
  options = {},
}) {
  const layout = bundleLayout(hubRoot, harvestId, payloadHash);

  if (!fs.existsSync(layout.stagingRoot)) {
    throw new Error("MISSING_STAGED_BUNDLE");
  }

  const metadata = readBundleMetadata(layout.stagingRoot);
  if (!metadata) {
    throw new Error("MISSING_STAGED_METADATA");
  }

  const { identity, inventory } = metadata;
  if (identity.harvestId !== harvestId) {
    throw new Error("BLOCKED_L_DURABLE_HASH_MISMATCH");
  }
  if (identity.payloadHash !== payloadHash) {
    throw new Error("BLOCKED_L_DURABLE_HASH_MISMATCH");
  }

  const stagingVerify = verifyInventoryAgainstPayload(layout.stagingRoot, inventory);
  if (!stagingVerify.ok) {
    throw new Error(`BLOCKED_L_DURABLE_HASH_MISMATCH:${stagingVerify.errors.join(",")}`);
  }

  const existingPointer = readByHarvestPointer(layout);
  if (
    existingPointer &&
    existingPointer.currentPayloadHash !== identity.payloadHash
  ) {
    const hasSupersession = (identity.supersedes ?? []).some(
      (s) => s.priorHash === existingPointer.currentPayloadHash,
    );
    if (!hasSupersession) {
      throw new Error("BLOCKED_AUTHORITY_CONFLICT");
    }
  }

  const catalogComplete = fs.existsSync(layout.catalogRoot) && isBundlePublicationComplete(layout.catalogRoot);

  if (catalogComplete) {
    const catalogMeta = readBundleMetadata(layout.catalogRoot);
    if (catalogMeta && inventoriesMatch(catalogMeta.inventory, inventory)) {
      const receipt = {
        schemaVersion: RECEIPT_SCHEMA_VERSION,
        harvestId,
        manifestHash: identity.manifestHash,
        payloadHash: identity.payloadHash,
        authoritySourceCommit: identity.authoritySourceCommit,
        stagingPath: layout.stagingRel,
        durablePath: layout.catalogRel,
        fileCount: stagingVerify.fileCount,
        byteCount: stagingVerify.byteCount,
        hashVerification: "PASS",
        publicationMethod: "NOOP",
        verdict: "NOOP_CURRENT",
        generatedAt: new Date().toISOString(),
      };
      writeOperationReceipt(layout, receipt);
      return receipt;
    }
    if (catalogMeta && catalogMeta.inventory.payloadHash !== inventory.payloadHash) {
      const hasSupersession = (identity.supersedes ?? []).some(
        (s) => s.priorHash === catalogMeta.inventory.payloadHash,
      );
      if (!hasSupersession) {
        throw new Error("BLOCKED_AUTHORITY_CONFLICT");
      }
    }
  } else if (fs.existsSync(layout.catalogRoot) && !catalogComplete) {
    throw new Error("INCOMPLETE_CATALOG_BUNDLE");
  }

  const method = tryPromote(layout, options.preferRename !== false);
  const catalogVerify = verifyInventoryAgainstPayload(layout.catalogRoot, inventory);
  if (!catalogVerify.ok) {
    throw new Error(`BLOCKED_L_DURABLE_HASH_MISMATCH:${catalogVerify.errors.join(",")}`);
  }

  writePublicationComplete(layout.catalogRoot, identity, method);
  writeByHarvestPointer(layout, identity, layout.catalogRel);

  const receipt = {
    schemaVersion: RECEIPT_SCHEMA_VERSION,
    harvestId,
    manifestHash: identity.manifestHash,
    payloadHash: identity.payloadHash,
    authoritySourceCommit: identity.authoritySourceCommit,
    stagingPath: layout.stagingRel,
    durablePath: layout.catalogRel,
    fileCount: catalogVerify.fileCount,
    byteCount: catalogVerify.byteCount,
    hashVerification: "PASS",
    publicationMethod: method,
    verdict: "L_DURABLE_PUBLISH_PASS",
    generatedAt: new Date().toISOString(),
  };
  writeOperationReceipt(layout, receipt);
  return receipt;
}

export function readByHarvestPointerFile(hubRoot, harvestId) {
  const pointerPath = path.join(hubRoot, "00-master-index", "BY-HARVEST", `${harvestId}.json`);
  if (!fs.existsSync(pointerPath)) {
    return null;
  }
  return readJson(pointerPath);
}

export function readPublishedBundle(hubRoot, harvestId) {
  const pointer = readByHarvestPointerFile(hubRoot, harvestId);
  if (!pointer) return null;
  const layout = bundleLayout(hubRoot, harvestId, pointer.currentPayloadHash);
  if (!isBundlePublicationComplete(layout.catalogRoot)) {
    return null;
  }
  const metadata = readBundleMetadata(layout.catalogRoot);
  if (!metadata) return null;
  return { layout, pointer, ...metadata };
}
