#!/usr/bin/env node
import {
  acquirePublicationLock,
  heartbeatPublicationLock,
  releasePublicationLock,
  LOCK_SCOPES,
} from "../harvest/lib/harvest-publication-lock-lib.mjs";

function arg(name) {
  const idx = process.argv.indexOf(name);
  return idx >= 0 ? process.argv[idx + 1] : null;
}

const hubRoot = arg("--hub");
const harvestId = arg("--harvest");
const payloadHash = arg("--hash");
const scope = arg("--scope") ?? LOCK_SCOPES.PHASE_B;
const ownerId = arg("--owner") ?? `worker-${process.pid}`;
const resumeToken = arg("--resume-token");
const holdMs = Number(arg("--hold-ms") ?? "0");
const action = arg("--action") ?? "acquire";

if (!hubRoot || !harvestId || !payloadHash) {
  console.error("usage: lock-worker --hub <path> --harvest <id> --hash <sha256:...> [--scope] [--owner] [--hold-ms] [--action acquire|release|heartbeat]");
  process.exit(2);
}

if (action === "acquire") {
  const result = acquirePublicationLock({
    hubRoot,
    harvestId,
    payloadHash,
    scope,
    ownerId,
    resumeToken: resumeToken ?? undefined,
  });
  console.log(JSON.stringify(result));
  if (!result.ok) {
    process.exit(1);
  }
  if (holdMs > 0) {
    setTimeout(() => {
      releasePublicationLock({
        hubRoot,
        harvestId,
        payloadHash,
        scope,
        ownerId,
        resumeToken: result.resumeToken,
      });
      process.exit(0);
    }, holdMs);
  } else {
    process.exit(0);
  }
}

if (action === "release") {
  const result = releasePublicationLock({
    hubRoot,
    harvestId,
    payloadHash,
    scope,
    ownerId,
    resumeToken,
  });
  console.log(JSON.stringify(result));
  process.exit(result.ok ? 0 : 1);
}

if (action === "heartbeat") {
  const result = heartbeatPublicationLock({
    hubRoot,
    harvestId,
    payloadHash,
    scope,
    ownerId,
    resumeToken,
  });
  console.log(JSON.stringify(result));
  process.exit(result.ok ? 0 : 1);
}

process.exit(2);
