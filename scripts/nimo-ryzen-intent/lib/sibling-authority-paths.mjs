import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const CROSS_AGENT_ROOT = path.resolve(__dirname, "../../..");

export function resolveAppBuilderRoot() {
  const sibling = path.resolve(CROSS_AGENT_ROOT, "../CG-AppBuilder-MCP");
  if (!fs.existsSync(path.join(sibling, "package.json"))) {
    throw new Error("APPBUILDER_SIBLING_UNAVAILABLE");
  }
  return sibling;
}

export function resolveOfficeAdminRoot() {
  const sibling = path.resolve(CROSS_AGENT_ROOT, "../CapitalGlass-Office-Admin");
  if (!fs.existsSync(path.join(sibling, "package.json"))) return null;
  return sibling;
}

export function readAppBuilderJson(relPath) {
  const full = path.join(resolveAppBuilderRoot(), relPath);
  return JSON.parse(fs.readFileSync(full, "utf8"));
}

export function appBuilderModuleUrl(relPath) {
  return pathToFileURL(path.join(resolveAppBuilderRoot(), relPath)).href;
}
