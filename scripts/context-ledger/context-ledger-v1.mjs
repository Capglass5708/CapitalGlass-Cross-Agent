#!/usr/bin/env node
/**
 * context-ledger CLI -- the surface an INDEPENDENT verifier drives.
 *
 *   capture   one source through the complete real path
 *   lookup    resolve an observation by entryHash or contentHash (cold process)
 *   restore   reconstruct the EXACT admitted bytes
 *   verify    chain / entry / payload integrity, read-only
 *   cas       compare-and-swap probe on an isolated copy
 *   quarantine  read the refusal register
 *   keycheck  report whether key material of the right SHAPE is reachable
 *
 * No subcommand requires the caller to touch ledger internals. Producing a PASS
 * by hand-driving the append primitive is explicitly not a proof of this
 * pipeline, so the pipeline is drivable without it.
 *
 * Key material is taken ONLY from the environment. It is never accepted as an
 * argument -- an argv secret is visible in the process table to every user on
 * the machine -- and is never printed, written or hashed by anything here.
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import {
  captureOneSource, lookupByEntryHash, lookupByContentHash, restoreAdmittedBytes,
  verifyEntry, verifyChain, casProbe, quarantineStatus, resolveProductionKey,
  vaultLayout, ensureVault, KEY_ENV_NAME, KEY_REF, KEY_ENV_CANDIDATES,
} from './lib/estate-api.mjs';
import { CAPTURE_MODE, KEY_AUTHORITY } from './lib/capture.mjs';
import { SshRsyncTransport } from './lib/transport.mjs';
import {
  selectTransport, TRANSPORT_ID, STORAGE_AUTHORITY_STATE,
} from './lib/transport-selector.mjs';
import {
  MountedRemoteTransport, resolveMountAuthority, MOUNT_AUTHORITY,
  DEFAULT_OBJECT_PREFIX, loadReplicationPolicy,
} from './lib/mount-transport.mjs';
import { verifyBothLegs, verifyLegReadback, loadEntryCold } from './lib/replication-verify.mjs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sha256Prefixed } from './lib/canonical.mjs';

/**
 * Destinations are resolved from configuration + LIVE mount authority, never
 * from a path baked into the code. A hardcoded destination cannot notice that
 * the share stopped being mounted, which is precisely the failure that writes
 * into a fallback directory and reports success.
 */
/**
 * Destinations come from the POLICY CONTRACT, not from constants here.
 *
 * Hardcoding a mountpoint would mean the code and the authorisation could drift
 * apart, and the code would win. Reading the policy makes the grant and the
 * behaviour the same object.
 */
const POLICY = loadReplicationPolicy();
const POLICY_ROLE = { primary: 'primary', backup: 'backup' };
const destByRole = (role) => POLICY.destinations.find((d) => d.role === role);
const MOUNTS = {
  primary: process.env.CG_CONTEXT_LEDGER_PRIMARY_MOUNT || destByRole('primary').mountpoint,
  backup: process.env.CG_CONTEXT_LEDGER_BACKUP_MOUNT || destByRole('backup').mountpoint,
};

const DEFAULT_VAULT = path.join(os.homedir(), '.capital-glass', 'context-ledger', 'estate-capture-v1');

function arg(name, fallback = null) {
  const hit = process.argv.slice(3).find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}
const flag = (name) => process.argv.slice(3).includes(`--${name}`);
const emit = (o, code = 0) => { console.log(JSON.stringify(o, null, 2)); process.exit(code); };

/**
 * Replication over the live mounted shares. Both legs are required and each is
 * a distinct destination on a distinct host; neither substitutes for the other.
 */
function mountLegs() {
  // Bound to policy destinations by id, so the namespace, the expected backing
  // share and the enforcement all come from the contract.
  return {
    primary: MountedRemoteTransport.forPolicyDestination(destByRole('primary').id, { policy: POLICY }),
    backup: MountedRemoteTransport.forPolicyDestination(destByRole('backup').id, { policy: POLICY }),
  };
}

/**
 * The canonical storage authority, as currently adjudicated.
 *
 * It is CONFLICTED: a demoted staging folder and a claimed DSM WORM share
 * carry the same name on the same host, and the claim has not been confirmed
 * by live authenticated observation. Until that is settled the selector
 * refuses to build a live adapter, which is what keeps production storage
 * unmutated by construction rather than by intention.
 *
 * See artifacts/agent-runs/CG_IMMUTABLE_CONTEXT_STORAGE_AUTHORITY_V1/
 *     integration-verdict-OPERATOR_ACTION_REQUIRED-v1.json
 */
function currentStorageAuthority(role) {
  return {
    state: STORAGE_AUTHORITY_STATE.CONFLICTED,
    authorityId: null,
    host: role === 'backup' ? null : 'cg-server',
    objectRoot: null,
    role,
  };
}

/**
 * Declared transport -> selector -> implemented adapter. The selector refuses
 * an unimplemented, unknown, misconfigured or authority-less selection instead
 * of falling back, so an unproven transport can never look like a success.
 */
function selectorLegs(transportId) {
  const pick = (role) => selectTransport({
    transportId, role,
    storageAuthority: currentStorageAuthority(role),
    requireNativeProduction: true,
  }).adapter;
  return { primary: pick('primary'), backup: pick('backup') };
}

async function main() {
  const cmd = process.argv[2];
  const vaultBase = arg('vault-base', DEFAULT_VAULT);

  if (cmd === 'keycheck') {
    const k = resolveProductionKey();
    // Presence and shape only. No value, no digest, no comparison.
    return emit({
      acceptedEnvNames: KEY_ENV_CANDIDATES,
      keyRef: k.keyRef, keyVersion: k.keyVersion,
      usable: k.usable, authority: k.authority, sourcedFrom: k.sourcedFrom, reason: k.reason,
      remedyIfUnavailable: `Run under 'doppler run -- <command>' so ${KEY_ENV_NAME} is injected into the environment.`,
    }, k.usable ? 0 : 3);
  }

  if (cmd === 'capture') {
    const absPath = arg('source');
    if (!absPath || !existsSync(absPath)) return emit({ error: 'SOURCE_NOT_FOUND', source: absPath }, 2);
    const k = resolveProductionKey();
    if (!k.usable) {
      return emit({
        verdict: 'OPERATOR_ACTION_REQUIRED',
        code: 'ENCRYPTION_KEY_AUTHORITY_UNAVAILABLE',
        reason: k.reason, acceptedEnvNames: KEY_ENV_CANDIDATES,
        remedy: `Run under 'doppler run --' so ${KEY_ENV_NAME} is injected.`,
      }, 3);
    }
    // --legs=mount replicates over the live mounted shares; the default
    // ssh-rsync adapter refuses, which yields the truthful lower durability
    // state rather than a fabricated one.
    // --legs=mount keeps the live mounted route available for the lower,
    // truthful durability state. Everything else goes through the selector,
    // which refuses while storage authority is CONFLICTED.
    const legs = arg('legs', null);
    const { primary, backup } = legs === 'mount'
      ? mountLegs()
      : selectorLegs(legs ?? TRANSPORT_ID.FILESTATION_HTTPS);
    const r = await captureOneSource({
      absPath, vaultBase, key: k.key, keyRef: k.keyRef, keyVersion: k.keyVersion,
      keyAuthority: KEY_AUTHORITY.PRODUCTION, mode: CAPTURE_MODE.REAL,
      primary, backup,
      sourceSystem: arg('source-system', 'documents'),
      sourceClass: arg('source-class', 'single-source'),
      sourceRootId: arg('source-root-id', null),
      relativePath: arg('relative-path', null),
      workPackageId: arg('wp', null),
    });
    const { plaintext, ...safe } = r;                  // never echo content
    return emit({
      keyAuthority: KEY_AUTHORITY.PRODUCTION, keySourcedFrom: k.sourcedFrom, keyRef: k.keyRef, keyVersion: k.keyVersion,
      ...safe,
    }, r.terminal === 'ARCHIVED' || r.terminal === 'QUARANTINED_SECRET' ? 0 : 1);
  }

  if (cmd === 'mount-authority') {
    const legs = { primary: arg('primary-mount', MOUNTS.primary), backup: arg('backup-mount', MOUNTS.backup) };
    const out = {};
    for (const [leg, mp] of Object.entries(legs)) out[leg] = resolveMountAuthority(mp);
    return emit({
      policy: {
        schemaVersion: POLICY.schemaVersion,
        destinations: POLICY.destinations.map((d) => ({ id: d.id, mountpoint: d.mountpoint, unc: d.windowsUnc, namespace: d.objectPrefix, role: d.role })),
      },
      legs: out,
      // Both, independently. One verified mount is not a verified destination pair.
      bothVerified: Object.values(out).every((a) => a.authority === MOUNT_AUTHORITY.VERIFIED),
      note: 'Mount authority proves the destination is a real mounted remote surface. It proves nothing about replication and nothing about immutability.',
    }, Object.values(out).every((a) => a.authority === MOUNT_AUTHORITY.VERIFIED) ? 0 : 1);
  }

  if (cmd === 'replication-verify') {
    const entryHash = arg('entry-hash');
    if (!entryHash) return emit({ error: 'PROVIDE_--entry-hash' }, 2);

    // This command reads NOTHING itself. It spawns one fresh process per leg so
    // neither read can be served from state the other created -- page cache, a
    // reused buffer or an open handle. A single process doing both reads would
    // let one leg silently answer for both while every assertion stayed true.
    const legScript = fileURLToPath(new URL('./verify-leg-v1.mjs', import.meta.url));
    const entry = loadEntryCold(vaultLayout(vaultBase).vaultRoot, entryHash);
    const expected = arg('expected-ciphertext-hash', entry.found ? entry.entry?.encryption?.ciphertextHash : null);
    const legs = { primary: arg('primary-mount', MOUNTS.primary), backup: arg('backup-mount', MOUNTS.backup) };

    const results = {};
    for (const [legName, mountpoint] of Object.entries(legs)) {
      const argv = [legScript, `--leg=${legName}`, `--mount=${mountpoint}`, `--entry-hash=${entryHash}`, `--vault-base=${vaultBase}`];
      if (expected) argv.push(`--expected-ciphertext-hash=${expected}`);
      try {
        results[legName] = JSON.parse(execFileSync(process.execPath, argv, { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }));
      } catch (e) {
        // A non-zero exit still carries a full JSON verdict on stdout.
        try { results[legName] = JSON.parse(String(e.stdout ?? '')); }
        catch { results[legName] = { leg: legName, REPLICATION: 'NOT_PROVEN', reasons: [`LEG_PROCESS_FAILED:${e?.message ?? 'ERR'}`] }; }
      }
    }

    const pids = Object.values(results).map((r) => r.process?.pid).filter(Boolean);
    const bothVerified = Object.values(results).length === 2 && Object.values(results).every((r) => r.REPLICATION === 'VERIFIED');
    const byDrive = {};
    for (const r of Object.values(results)) {
      const label = (r.driveLabel ?? '').replace(':', '') || r.leg;
      byDrive[`${label}_DRIVE_REPLICATION`] = r.REPLICATION;
    }

    return emit({
      entryHash,
      expectedCiphertextHash: expected,
      readBackTopology: {
        processesUsed: pids.length,
        distinctPids: new Set(pids).size,
        // Two distinct pids is the structural claim: neither leg's read could
        // have been served by state belonging to the other.
        legsReadInSeparateProcesses: pids.length === 2 && new Set(pids).size === 2,
        pids,
      },
      legs: results,
      perLegSummary: Object.fromEntries(Object.entries(results).map(([k2, r]) => [k2, {
        driveLabel: r.driveLabel ?? null, MOUNT_AUTHORITY: r.MOUNT_AUTHORITY ?? 'NOT_PROVEN',
        OBJECT_PRESENT: r.OBJECT_PRESENT ?? 'NO', HASH_READBACK: r.HASH_READBACK ?? 'NOT_PROVEN',
        LEDGER_BINDING: r.LEDGER_BINDING ?? 'NOT_PROVEN', REPLICATION: r.REPLICATION ?? 'NOT_PROVEN',
      }])),
      ...byDrive,
      bothVerified,
      STORAGE_IMMUTABILITY_AUTHORITY: {
        status: 'NOT_PROVEN',
        concreteBlocker: 'chmod fails on drvfs, so write-once cannot be enforced by file mode on this route. This is a mechanical blocker, not an unchecked caveat.',
        reasons: ['DRVFS_CHMOD_UNSUPPORTED_WRITE_ONCE_NOT_ENFORCEABLE_BY_FILE_MODE', 'NO_WORM_SNAPSHOT_OR_OFF_BOX_RETENTION_AUTHORITY_PROVEN'],
        note: 'Stays NOT_PROVEN even when both legs are VERIFIED. Read-back proves arrival and recoverability, never immutability.',
      },
      transportSuitability: {
        route: 'drvfs',
        acceptableFor: 'single canary object and targeted read-back verification',
        notAcceptableFor: 'bulk estate replication',
        measurementStatus: 'UNMEASURED',
        measurementNote: 'Throughput for this route has never been bound to a completed measurement. Prior prose values were retracted (7df52e6). A rate may only appear here as a MeasurementRef carrying command, exitStatus and rawOutputSha256.',
      },
    }, bothVerified ? 0 : 1);
  }

  if (cmd === 'lookup') {
    const eh = arg('entry-hash');
    const ch = arg('content-hash');
    if (eh) {
      const r = lookupByEntryHash(vaultBase, eh);
      return emit(r, r.found && r.entryHashValid ? 0 : 1);
    }
    if (ch) {
      const r = lookupByContentHash(vaultBase, ch);
      return emit(r, r.found ? 0 : 1);
    }
    return emit({ error: 'PROVIDE_--entry-hash_OR_--content-hash' }, 2);
  }

  if (cmd === 'restore') {
    const ch = arg('content-hash');
    if (!ch) return emit({ error: 'PROVIDE_--content-hash' }, 2);
    // Key authority is no longer optional: the only copy at rest is encrypted,
    // so a restore without a key is not a degraded restore, it is no restore.
    const k = resolveProductionKey();
    if (!k.usable) {
      return emit({
        verdict: 'OPERATOR_ACTION_REQUIRED', code: 'ENCRYPTION_KEY_AUTHORITY_UNAVAILABLE',
        reason: k.reason, plaintextAtRest: false,
        remedy: "Run under 'doppler run --project cg-mcp --config dev --' so the evidence key is injected.",
      }, 3);
    }
    const r = restoreAdmittedBytes({ vaultBase, contentHash: ch, key: k.key });
    if (!r.restored) return emit(r, 1);

    const outPath = arg('out');
    if (outPath) writeFileSync(outPath, r.plaintext);

    const compareTo = arg('compare-to');
    let comparison = null;
    if (compareTo && existsSync(compareTo)) {
      const original = readFileSync(compareTo);
      comparison = {
        comparedTo: compareTo,
        originalSha256: sha256Prefixed(original),
        restoredSha256: r.restoredHash,
        // Both hashes here are PLAINTEXT hashes. No ciphertext hash appears in
        // this output at all, so there is nothing to accidentally compare it to.
        hashesEqual: sha256Prefixed(original) === r.restoredHash,
        originalByteLength: original.length,
        restoredByteLength: r.byteLength,
        byteLengthsEqual: original.length === r.byteLength,
        bytesIdentical: original.equals(r.plaintext),
      };
    }
    const body = {
      restored: true, scope: r.scope, contentHash: r.contentHash, restoredHash: r.restoredHash,
      hashMatches: r.hashMatches, byteLength: r.byteLength, objectPath: r.objectPath,
      remoteRetrievalProven: r.remoteRetrievalProven,
      envelopeRoundTrip: r.envelopeRoundTrip,
      storedPayload: r.storedPayload, plaintextAtRest: r.plaintextAtRest,
      writtenTo: outPath ?? null,
      comparison,
      base64: flag('stdout-base64') ? r.plaintext.toString('base64') : null,
    };
    const ok = r.hashMatches && (!comparison || (comparison.hashesEqual && comparison.byteLengthsEqual && comparison.bytesIdentical));
    return emit(body, ok ? 0 : 1);
  }

  if (cmd === 'verify') {
    const eh = arg('entry-hash');
    if (eh) { const r = verifyEntry(vaultBase, eh, { checkPayload: !flag('no-payload') }); return emit(r, r.verified ? 0 : 1); }
    const r = verifyChain(vaultBase, { checkPayload: !flag('no-payload') });
    return emit(r, r.verified ? 0 : 1);
  }

  if (cmd === 'cas') {
    const r = casProbe(vaultBase);
    return emit(r, r.staleExpectedPrevHashRefused && r.correctExpectedPrevHashAccepted ? 0 : 1);
  }

  if (cmd === 'quarantine') {
    const r = quarantineStatus(vaultBase);
    return emit(r, r.verified ? 0 : 1);
  }

  if (cmd === 'vault') {
    return emit({ ...vaultLayout(vaultBase), created: Boolean(ensureVault(vaultBase)) }, 0);
  }

  return emit({
    error: 'UNKNOWN_COMMAND',
    usage: [
      'keycheck',
      'capture   --source=<abs> [--source-system=] [--source-class=] [--vault-base=]',
      'lookup    --entry-hash=<sha256:..> | --content-hash=<sha256:..>',
      'restore   --content-hash=<sha256:..> [--out=<path>] [--compare-to=<path>] [--with-envelope] [--stdout-base64]',
      'verify    [--entry-hash=<sha256:..>] [--no-payload]',
      'cas',
      'quarantine',
      'vault',
      'mount-authority          [--primary-mount=/mnt/z] [--backup-mount=/mnt/l]',
      'replication-verify --entry-hash=<sha256:..> [--primary-mount=] [--backup-mount=]   (spawns one fresh process per leg)',
      'verify-leg-v1.mjs --leg= --mount= --entry-hash= --vault-base=   (single leg, single process)',
    ],
  }, 2);
}

main().catch((e) => { console.error(JSON.stringify({ error: e?.message ?? String(e) })); process.exit(1); });
