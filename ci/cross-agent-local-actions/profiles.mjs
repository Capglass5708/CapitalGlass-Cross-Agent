import { readFileSync } from "node:fs";
import path from "node:path";

export const PROFILE_NAME = /^[a-z][a-z0-9-]{0,32}$/;
const SHELL_META = /[;&|$\x60()]/;
const PROFILES_DIR = "ci/cross-agent-local-actions/profiles";

export function loadProfile(root, profile) {
  if (!PROFILE_NAME.test(profile)) throw new Error("PROFILE_NAME");
  const file = path.join(root, PROFILES_DIR, `${profile}.json`);
  const manifest = JSON.parse(readFileSync(file, "utf8"));
  if (manifest.schema !== "night-owl-ci-profile-v1") throw new Error("PROFILE_SCHEMA");
  if (manifest.profile !== profile) throw new Error("PROFILE_MISMATCH");
  const check = Array.isArray(manifest.check) ? manifest.check : [];
  if (check.some((item) => typeof item !== "string" || !item || item.includes("..") || path.isAbsolute(item))) {
    throw new Error("PROFILE_CHECK");
  }
  if (!Array.isArray(manifest.command) || manifest.command.length === 0) throw new Error("PROFILE_COMMAND");
  if (manifest.command.some((item) => typeof item !== "string" || !item || SHELL_META.test(item))) {
    throw new Error("PROFILE_SHELL");
  }
  return { schema: manifest.schema, profile: manifest.profile, check, command: manifest.command };
}

export function resolveSteps(manifest) {
  return [
    ...manifest.check.map((file) => ["node", "--check", file]),
    manifest.command,
  ];
}

export function recordedCommand(manifest) {
  return resolveSteps(manifest).map((argv) => argv.join(" ")).join(" && ");
}
