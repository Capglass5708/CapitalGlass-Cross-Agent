#!/usr/bin/env node
/**
 * Render harvest packet rows into INDEX.md generated section.
 */
import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT, manifestPath, HARVEST_ID } from "./lib/paths.mjs";

const harvestId = process.argv[2] || HARVEST_ID;
const indexPath = path.join(REPO_ROOT, "work-progress/projects/INDEX.md");
const manifest = JSON.parse(fs.readFileSync(manifestPath(harvestId), "utf8"));

const START = "<!-- HARVEST-PACKET-INDEX:START -->";
const END = "<!-- HARVEST-PACKET-INDEX:END -->";

function renderRows() {
  const lines = [
    START,
    "",
    "_Generated from `harvest-manifest-v1.json`. Do not edit manually — run `npm run harvest:render-index`._",
    "",
    "| Packet ID | State | Verdict | Owner repo | Project file | Next action |",
    "| --- | --- | --- | --- | --- | --- |",
  ];
  for (const packet of manifest.packets) {
    const fileLink = packet.projectFile.startsWith("work-progress/")
      ? `[${path.basename(packet.projectFile)}](./${path.basename(packet.projectFile)})`
      : packet.projectFile;
    lines.push(
      `| \`${packet.packetId}\` | ${packet.state} | ${packet.packetVerdict} | ${packet.ownerRepo} | ${fileLink} | ${packet.nextAction.replace(/\|/g, "/")} |`,
    );
  }
  lines.push("", END);
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
console.log("harvest:render-index OK");
