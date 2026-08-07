#!/usr/bin/env node
/**
 * Render harvest INDEX.md derived view from intelligence index + packet registry (not single manifest).
 */
import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "./lib/paths.mjs";
import { loadIntelligenceIndex } from "./lib/intelligence-index-lib.mjs";

const indexPath = path.join(REPO_ROOT, "work-progress/projects/INDEX.md");
const registryPath = path.join(REPO_ROOT, "work-progress/harvest-packet-registry.json");

const START = "<!-- HARVEST-PACKET-INDEX:START -->";
const END = "<!-- HARVEST-PACKET-INDEX:END -->";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function renderRows() {
  const intelligence = loadIntelligenceIndex(REPO_ROOT);
  const registry = fs.existsSync(registryPath) ? readJson(registryPath) : { packets: {} };
  const entityByPacket = new Map();
  for (const entity of intelligence.entities || []) {
    const packetId = entity.identity?.packetId ?? entity.identity?.conceptKey;
    if (packetId) entityByPacket.set(packetId, entity);
  }

  const packetIds = Object.keys(registry.packets || {}).sort();
  const lines = [
    START,
    "",
    "_**DERIVED HUMAN VIEW — NOT MACHINE AUTHORITY.**_",
    "_Source: `work-progress/harvest-intelligence-index.json` + `harvest-packet-registry.json`. Do not edit manually — run `npm run harvest:render-index`._",
    "",
    "| Packet ID | Entity | State | Verdict | Owner repo | Latest harvest | Next action |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  ];

  for (const packetId of packetIds) {
    const reg = registry.packets[packetId];
    const entity = entityByPacket.get(packetId);
    const state = reg.latestState ?? entity?.dimensions?.lifecycleState ?? "—";
    const verdict = reg.latestVerdict ?? entity?.core?.signalClass ?? "—";
    const owner = reg.latestOwnerRepo ?? entity?.dimensions?.ownerRepo ?? "—";
    const harvest = reg.latestHarvestId ?? "—";
    const entityCol = entity ? `\`${entity.entityId.slice(0, 20)}…\`` : "—";
    const projectFile = reg.latestProjectFile ?? "";
    const nextAction = projectFile
      ? `see ${path.basename(projectFile)}`
      : (entity?.core?.summary ?? "—").replace(/\|/g, "/").slice(0, 80);
    lines.push(
      `| \`${packetId}\` | ${entityCol} | ${state} | ${verdict} | ${owner} | \`${harvest}\` | ${nextAction} |`,
    );
  }

  lines.push("", `_${packetIds.length} registry packets · ${(intelligence.entities || []).length} intelligence entities_`, "", END);
  return lines.join("\n");
}

let content = fs.readFileSync(indexPath, "utf8");
const block = renderRows();

if (content.includes(START) && content.includes(END)) {
  const before = content.slice(0, content.indexOf(START));
  const after = content.slice(content.indexOf(END) + END.length);
  content = `${before}${block}${after}`;
} else {
  const marker = "\n## Harvest packet index (manifest-derived)\n\n";
  const insertAt = content.indexOf("## Active projects");
  if (insertAt === -1) {
    content = `${content}\n${marker}${block}\n`;
  } else {
    content = `${content.slice(0, insertAt)}${marker}${block}\n\n${content.slice(insertAt)}`;
  }
}

fs.writeFileSync(indexPath, content, "utf8");
console.log("harvest:render-index OK (derived from intelligence index + registry)");
