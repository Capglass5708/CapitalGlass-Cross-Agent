import { createHash } from "node:crypto";
import { canonicalJsonBytes } from "./canonical-json.mjs";

export function sha256Hex(input) {
  return createHash("sha256").update(input).digest("hex");
}

export function hashCanonicalJson(value) {
  return sha256Hex(canonicalJsonBytes(value));
}

export function hashFileContent(content) {
  return sha256Hex(content);
}
