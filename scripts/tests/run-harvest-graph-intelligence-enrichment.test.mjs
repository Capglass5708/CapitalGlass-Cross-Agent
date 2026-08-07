import assert from "node:assert/strict";

import {
  buildGraphExtractionFromManifest,
  enrichGraphExtractionWithIntelligence,
} from "../harvest/lib/graph-extraction-builder-lib.mjs";
import { loadIntelligenceIndex } from "../harvest/lib/intelligence-index-lib.mjs";
import { REPO_ROOT } from "../harvest/lib/paths.mjs";

const manifest = {
  harvestId: "harvest-graph-enrichment-fixture-v1",
  updatedAt: "2026-08-07T00:00:00.000Z",
  overallHarvestVerdict: "HARVEST_COMPLETE",
  missionClass: "investigate",
  sourceCommitSha: "a082553e210c4606d8efca321bdbead847c8ab62",
  packets: [
    {
      packetId: "fixture-packet-v1",
      packetTitle: "Fixture",
      state: "ACTIVE",
      packetVerdict: "PASS",
      ownerRepo: "CapitalGlass-Cross-Agent",
      ownerIndexingStatus: "INDEXED",
    },
  ],
};

const base = buildGraphExtractionFromManifest(manifest);
const intelligenceIndex = loadIntelligenceIndex(REPO_ROOT);
const enriched = enrichGraphExtractionWithIntelligence(base, intelligenceIndex);

assert.ok(
  enriched.nodes.some((n) => n.nodeType === "IntelligenceEntity"),
  "graph enrichment should add intelligence entity nodes",
);
assert.ok(
  enriched.edges.some((e) => e.edgeType === "ENRICHES" || e.edgeType === "OBSERVED_BY"),
  "graph enrichment should add intelligence edges",
);

console.log("ok - graph extraction enriched from intelligence index");
