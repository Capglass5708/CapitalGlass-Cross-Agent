#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REGISTRY = join(dirname(fileURLToPath(import.meta.url)), "../../registry/contract-authority/scraper-de-contract-registry.v1.json");
const TAXONOMY = join(dirname(fileURLToPath(import.meta.url)), "../../registry/contract-authority/scraper-de-rejection-taxonomy.v1.json");
const POLICY = join(dirname(fileURLToPath(import.meta.url)), "../../registry/contract-authority/scraper-de-state-transition-policy.v1.json");

function load(path) {
  if (!existsSync(path)) throw new Error(`Missing: ${path}`);
  return JSON.parse(readFileSync(path, "utf8"));
}

function main() {
  const registry = load(REGISTRY);
  const taxonomy = load(TAXONOMY);
  const policy = load(POLICY);
  const errors = [];
  if (registry.contractMode !== "pointer-only") errors.push("contractMode must be pointer-only");
  if (!registry.contracts?.length) errors.push("contracts empty");
  for (const c of registry.contracts) {
    if (!c.authorityRepo || !c.authorityPath) errors.push(`invalid contract ${c.contractId}`);
  }
  if (!taxonomy.codes?.length) errors.push("taxonomy empty");
  if (!policy.layers?.runtimeConsumer) errors.push("policy missing runtimeConsumer");
  const verdict = errors.length ? "BLOCKED" : "PASS";
  console.log(JSON.stringify({ verdict, gateId: "SCRAPER_DE_CONTRACTS_LOCKED_V1", errors }, null, 2));
  process.exit(errors.length ? 1 : 0);
}

main();
