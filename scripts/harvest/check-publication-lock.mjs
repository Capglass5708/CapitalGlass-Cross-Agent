#!/usr/bin/env node
import process from "node:process";

import {
  acquirePublicationLock,
  LOCK_SCOPES,
  readPublicationLock,
  TARGET_VERDICT,
} from "./lib/harvest-publication-lock-lib.mjs";

function parseArgs(argv) {
  const args = {
    hubRoot: null,
    harvestId: null,
    payloadHash: null,
    scope: LOCK_SCOPES.PHASE_B,
    ownerId: `cli-${process.pid}`,
    json: false,
  };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--json") args.json = true;
    else if (token === "--hub") args.hubRoot = argv[++i];
    else if (token === "--harvest") args.harvestId = argv[++i];
    else if (token === "--hash") args.payloadHash = argv[++i];
    else if (token === "--scope") args.scope = argv[++i];
    else if (token === "--owner") args.ownerId = argv[++i];
  }
  return args;
}

const args = parseArgs(process.argv);
if (!args.hubRoot || !args.harvestId || !args.payloadHash) {
  console.error(
    "usage: harvest:check-publication-lock --hub <path> --harvest <id> --hash <sha256:...> [--scope PHASE_B_PUBLICATION|PHASE_C_POINTER] [--json]",
  );
  process.exit(2);
}

const acquired = acquirePublicationLock({
  hubRoot: args.hubRoot,
  harvestId: args.harvestId,
  payloadHash: args.payloadHash,
  scope: args.scope,
  ownerId: args.ownerId,
});

const payload = {
  targetVerdict: TARGET_VERDICT,
  acquire: acquired,
  current: readPublicationLock(args.hubRoot, args.harvestId, args.payloadHash, args.scope),
};

if (args.json) {
  console.log(JSON.stringify(payload, null, 2));
} else {
  console.log(`harvest:check-publication-lock ${acquired.verdict}`);
}

process.exit(acquired.ok ? 0 : 1);
