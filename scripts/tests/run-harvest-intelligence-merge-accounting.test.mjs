import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  emptyIntelligenceIndex,
  mergeManifestIntoIntelligenceIndex,
  loadIntelligenceIndex,
  entityIdFromConcept,
} from "../harvest/lib/intelligence-index-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

function fixtureManifest(harvestId) {
  return {
    harvestId,
    workPackageId: harvestId,
    updatedAt: new Date().toISOString(),
    sourceCommitSha: "abc",
    packets: [
      {
        packetId: "merge-accounting-fixture-packet-v1",
        ownerRepo: "CapitalGlass-Cross-Agent",
        state: "COMPLETE",
        packetVerdict: "PASS",
        nextAction: "fixture next",
        projectFile: "work-progress/projects/INDEX.md",
        ownerIndexingStatus: "indexed",
        evidenceRefs: ["EVT-001"],
      },
    ],
  };
}

test("merge is idempotent and deletedEntities stays 0", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intel-merge-"));
  const harvestId = "harvest-2026-08-07-merge-accounting-fixture-v1";
  const manifest = fixtureManifest(harvestId);

  const first = mergeManifestIntoIntelligenceIndex(manifest, { repoRoot: tmpRoot });
  assert.equal(first.receipt.deletedEntities, 0);
  assert.equal(first.receipt.newEntities, 1);
  assert.equal(first.receipt.observationsAdded, 1);

  const second = mergeManifestIntoIntelligenceIndex(manifest, { repoRoot: tmpRoot });
  assert.equal(second.receipt.deletedEntities, 0);
  assert.equal(second.receipt.newEntities, 0);
  assert.equal(second.receipt.observationsAdded, 0);
  assert.equal(second.receipt.entitiesAfter, first.receipt.entitiesAfter);

  const index = loadIntelligenceIndex(tmpRoot);
  assert.equal(index.entities.length, 1);
  assert.equal(index.entities[0].observations.length, 1);
});

test("recurrence adds observation to same entity", () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "intel-obs-"));
  const packetId = "recurrence-fixture-packet-v1";
  const conceptEntityId = entityIdFromConcept(packetId);
  const packet = {
    packetId,
    ownerRepo: "CapitalGlass-Cross-Agent",
    state: "COMPLETE",
    packetVerdict: "PASS",
    nextAction: "fixture next",
    projectFile: "work-progress/projects/INDEX.md",
    ownerIndexingStatus: "indexed",
    evidenceRefs: [],
  };

  mergeManifestIntoIntelligenceIndex(
    { ...fixtureManifest("harvest-2026-08-07-recurrence-a-v1"), packets: [packet] },
    { repoRoot: tmpRoot },
  );
  mergeManifestIntoIntelligenceIndex(
    { ...fixtureManifest("harvest-2026-08-07-recurrence-b-v1"), packets: [packet] },
    { repoRoot: tmpRoot },
  );

  const index = loadIntelligenceIndex(tmpRoot);
  assert.equal(index.entities.length, 1);
  assert.equal(index.entities[0].entityId, conceptEntityId);
  assert.equal(index.entities[0].observations.length, 2);
});

test("emptyIntelligenceIndex has expected schema", () => {
  const index = emptyIntelligenceIndex();
  assert.equal(index.schemaVersion, "harvest-intelligence-index-v1");
  assert.deepEqual(index.entities, []);
});
