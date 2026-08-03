import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, "../../..");

export const HARVEST_ID = "harvest-2026-08-03-cross-thread-platform-state-v1";

export function harvestRunDir(harvestId = HARVEST_ID) {
  return path.join(REPO_ROOT, "artifacts/agent-runs", harvestId);
}

export function manifestPath(harvestId = HARVEST_ID) {
  return path.join(harvestRunDir(harvestId), "harvest-manifest-v1.json");
}
