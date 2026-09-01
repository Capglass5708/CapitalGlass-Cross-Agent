/**
 * Replication over a live mounted remote surface, with mount authority
 * resolved from the KERNEL at write time.
 *
 * THE FAILURE THIS EXISTS TO PREVENT: a network share fails to mount, the
 * mountpoint reverts to an ordinary empty local directory, the writer happily
 * creates files in it, every exit code is 0, the path exists, and the receipt
 * says replicated. Nothing about that sequence is detectable from the writer's
 * side. So the destination is not trusted because it is configured, or because
 * the path exists, or because a previous run worked -- it is re-resolved
 * against /proc/self/mountinfo immediately before every write, and refused
 * unless the kernel agrees it is a real mount of a real remote surface.
 *
 * The decisive check is st_dev: a genuine mount has a different device number
 * from its parent directory. A failed-mount fallback directory does not. That
 * single comparison is what separates "the share is mounted" from "there is a
 * directory here with the right name".
 *
 * TWO CLAIMS THAT MUST NOT MERGE:
 *   read-back proves the bytes ARRIVED and can be RECOVERED intact.
 *   It does not prove they cannot be CHANGED.
 * On drvfs, chmod fails outright, so write-once cannot be enforced by file
 * mode on this route at all. Both legs reading back perfectly still leaves
 * STORAGE_IMMUTABILITY_AUTHORITY at NOT_PROVEN, and this module reports that
 * mechanically rather than leaving it to a human to remember.
 *
 * PERFORMANCE: this route is NOT a bulk estate replication path and must not be
 * scheduled as one. It is correct for a canary object and for targeted
 * verification only.
 *
 * No throughput figure is stated here. Earlier revisions carried throughput and
 * small-file figures that were never measured; they were retracted in 7df52e6,
 * where the exact values are preserved under retractedValues. They are not
 * repeated here: a source comment restating a fabricated number is precisely how
 * it propagated. The unsuitability of this route rests on two
 * OBSERVED facts that need no rate: a 28 MB / 626-blob metadata scan exceeded a
 * 120s timeout, and chmod is unsupported here so POSIX mode cannot enforce
 * write-once. The retracted numbers were decorative -- they were never
 * load-bearing for the conclusion, which is exactly why stating them was pure
 * risk.
 */
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, renameSync, readdirSync, chmodSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { sha256Prefixed, objectStorePath } from './canonical.mjs';

export const MOUNT_AUTHORITY = { VERIFIED: 'VERIFIED', NOT_PROVEN: 'NOT_PROVEN' };

/**
 * Filesystem types that represent a genuinely remote surface. ext4/overlay/
 * tmpfs are deliberately absent: a local directory is never a replication
 * destination no matter what it is called.
 */
export const REMOTE_FSTYPES = new Set(['9p', 'cifs', 'smb3', 'smbfs', 'nfs', 'nfs4', 'drvfs', 'fuse.sshfs']);

export const DEFAULT_OBJECT_PREFIX = 'capital-glass-context-ledger/objects';

/**
 * THE REPLICATION POLICY IS DATA, AND IT IS ENFORCED HERE.
 *
 * L: and Z: are live business shares. The operator's grant is narrow -- only
 * encrypted, content-addressed Immutable Context objects, only into dedicated
 * namespaces, only through this adapter -- and a narrow grant recorded as a
 * comment is not a control. It stops existing the moment someone refactors
 * around it, and it cannot be reproduced next session without an operator
 * repeating themselves.
 *
 * So the grant lives in contracts/context-ledger/replication-namespace-policy-v1.json
 * and this adapter REFUSES anything it does not permit. Every check below
 * answers a question the caller could otherwise get wrong silently:
 *
 *   which share      -> destination allowlist, matched on mountpoint AND on the
 *                       backing source the kernel reports;
 *   which directory  -> the path must sit under the declared namespace, so a
 *                       bug cannot write next to real business data;
 *   which path       -> the path must BE the content address of these bytes;
 *   which bytes      -> long enough to be an envelope, and not predominantly
 *                       printable, because ciphertext never is.
 *
 * The plaintext check is deliberately about the BYTES rather than the caller's
 * declaration. An adapter that trusts a payloadClass parameter is trusting the
 * component most likely to be wrong.
 */
export const POLICY_PATH = fileURLToPath(new URL('../../../contracts/context-ledger/replication-namespace-policy-v1.json', import.meta.url));

let policyCache = null;
export function loadReplicationPolicy(policyPath = POLICY_PATH) {
  if (policyCache && policyCache.path === policyPath) return policyCache.policy;
  const policy = JSON.parse(readFileSync(policyPath, 'utf8'));
  policyCache = { path: policyPath, policy };
  return policy;
}
export function resetPolicyCache() { policyCache = null; }

export function policyDestinationFor(mountpoint, policy = loadReplicationPolicy()) {
  const resolved = path.resolve(mountpoint);
  return policy.destinations.find((d) => path.resolve(d.mountpoint) === resolved) ?? null;
}

/** Printable-byte ratio over the leading sample. Ciphertext is ~35%; text is >95%. */
export function printableRatio(buf, sampleBytes = 4096) {
  const head = buf.subarray(0, Math.min(sampleBytes, buf.length));
  if (head.length === 0) return 0;
  let printable = 0;
  for (const b of head) if (b === 9 || b === 10 || b === 13 || (b >= 32 && b < 127)) printable += 1;
  return printable / head.length;
}

/**
 * Full policy admission for one write. Returns the decision rather than
 * throwing, so a caller can report WHICH rule refused without catching.
 */
export function evaluateReplicationWrite({ mountpoint, relPath, contentHash, blob, mountAuthority, policy = loadReplicationPolicy() }) {
  const refuse = (code, detail = {}) => ({ permitted: false, code, ...detail });

  const dest = policyDestinationFor(mountpoint, policy);
  if (!dest) return refuse('REPLICATION_DESTINATION_NOT_IN_POLICY', { mountpoint });

  if (mountAuthority && dest.expectedMountSource && mountAuthority.source !== dest.expectedMountSource) {
    return refuse('REPLICATION_MOUNT_IDENTITY_MISMATCH', {
      expectedSource: dest.expectedMountSource, observedSource: mountAuthority.source ?? null,
    });
  }
  if (mountAuthority && Array.isArray(dest.expectedFstype) && mountAuthority.fstype
      && !dest.expectedFstype.includes(mountAuthority.fstype)) {
    return refuse('REPLICATION_MOUNT_IDENTITY_MISMATCH', { expectedFstype: dest.expectedFstype, observedFstype: mountAuthority.fstype });
  }

  const normalised = String(relPath).replace(/\\/g, '/').replace(/^\/+/, '');
  const prefix = `${dest.objectPrefix.replace(/\/+$/, '')}/`;
  if (!normalised.startsWith(prefix) || normalised.includes('../')) {
    return refuse('REPLICATION_PATH_OUTSIDE_DEDICATED_NAMESPACE', { namespace: dest.objectPrefix, attempted: normalised });
  }

  const expected = path.posix.join(dest.objectPrefix, objectStorePath(contentHash));
  if (normalised !== expected) {
    return refuse('REPLICATION_PATH_NOT_CONTENT_ADDRESSED', { expected, attempted: normalised });
  }
  if (sha256Prefixed(blob) !== contentHash) {
    return refuse('REPLICATION_PAYLOAD_HASH_MISMATCH', { address: contentHash });
  }

  const minBytes = policy.rules?.minimumEnvelopeBytes?.value ?? 28;
  if (blob.length < minBytes) {
    return refuse('REPLICATION_PAYLOAD_TOO_SHORT_FOR_ENVELOPE', { byteLength: blob.length, minimum: minBytes });
  }
  const maxRatio = policy.rules?.maxPrintableRatio?.value ?? 0.85;
  const ratio = printableRatio(blob);
  if (ratio > maxRatio) {
    return refuse('REPLICATION_PAYLOAD_LOOKS_LIKE_PLAINTEXT', { printableRatio: Number(ratio.toFixed(3)), maximum: maxRatio });
  }

  return { permitted: true, destinationId: dest.id, namespace: dest.objectPrefix, relPath: normalised, printableRatio: Number(ratio.toFixed(3)) };
}

/** Parse /proc/self/mountinfo. The kernel's view, not a config file's opinion. */
export function readMountInfo(procPath = '/proc/self/mountinfo') {
  let raw;
  try { raw = readFileSync(procPath, 'utf8'); } catch { return []; }
  const rows = [];
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    const sep = line.indexOf(' - ');
    if (sep === -1) continue;
    const left = line.slice(0, sep).split(' ');
    const right = line.slice(sep + 3).split(' ');
    rows.push({
      mountId: left[0], parentId: left[1], majorMinor: left[2], rootWithinFs: left[3],
      mountPoint: unescapeMountField(left[4]), mountOptions: left[5],
      fstype: right[0], source: unescapeMountField(right[1]), superOptions: right[2] ?? '',
    });
  }
  return rows;
}

/** mountinfo escapes space, tab, newline and backslash as octal. */
function unescapeMountField(v) {
  return String(v ?? '').replace(/\\(\d{3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)));
}

/**
 * Resolve one destination's mount authority, live.
 *
 * Returns VERIFIED only when every independent check agrees. Each reason is
 * reported separately so a failure says WHICH assumption was wrong -- "not
 * mounted" and "mounted but not a remote fstype" need different fixes.
 */
export function resolveMountAuthority(mountpoint, { procPath = '/proc/self/mountinfo' } = {}) {
  const observedAt = new Date().toISOString();
  const reasons = [];
  const out = {
    mountpoint, observedAt,
    exists: false, isDirectory: false, isMountpoint: false,
    fstype: null, source: null, superOptions: null, mountOptions: null,
    windowsPath: null, remoteFstype: false, readable: false, entryCount: null,
    authority: MOUNT_AUTHORITY.NOT_PROVEN, reasons,
  };

  let st;
  try { st = statSync(mountpoint); out.exists = true; } catch {
    reasons.push('MOUNTPOINT_DOES_NOT_EXIST');
    return out;
  }
  out.isDirectory = st.isDirectory();
  if (!out.isDirectory) { reasons.push('MOUNTPOINT_IS_NOT_A_DIRECTORY'); return out; }

  // THE decisive check. A failed mount leaves an ordinary directory whose
  // device number is its parent's; a real mount has its own.
  try {
    const parent = statSync(path.dirname(path.resolve(mountpoint)));
    out.isMountpoint = st.dev !== parent.dev;
    out.deviceId = st.dev;
    out.parentDeviceId = parent.dev;
  } catch { out.isMountpoint = false; }
  if (!out.isMountpoint) reasons.push('NOT_A_MOUNTPOINT_DEVICE_MATCHES_PARENT');

  const resolved = path.resolve(mountpoint);
  const row = readMountInfo(procPath).find((r) => r.mountPoint === resolved);
  if (!row) reasons.push('NO_MOUNTINFO_ROW_FOR_MOUNTPOINT');
  else {
    out.fstype = row.fstype;
    out.source = row.source;
    out.superOptions = row.superOptions;
    out.mountOptions = row.mountOptions;
    out.remoteFstype = REMOTE_FSTYPES.has(row.fstype);
    if (!out.remoteFstype) reasons.push(`FSTYPE_NOT_A_REMOTE_SURFACE:${row.fstype}`);
    // WSL drvfs carries the Windows-side mapping in its super options; keeping
    // it makes the backing share identifiable in the receipt.
    const m = /(?:^|;)path=([^;]*)/.exec(row.superOptions ?? '');
    if (m) out.windowsPath = m[1];
    if (/aname=drvfs/.test(row.superOptions ?? '')) out.driverName = 'drvfs';
  }

  try { out.entryCount = readdirSync(mountpoint).length; out.readable = true; } catch (e) {
    out.readable = false;
    reasons.push(`MOUNTPOINT_NOT_READABLE:${e?.code ?? 'ERR'}`);
  }

  out.authority = (out.isMountpoint && out.remoteFstype && out.readable && reasons.length === 0)
    ? MOUNT_AUTHORITY.VERIFIED : MOUNT_AUTHORITY.NOT_PROVEN;
  return out;
}

/**
 * Replication leg over a mounted remote surface.
 *
 * Authority is re-resolved on EVERY put and EVERY verify. Resolving once at
 * construction would mean a share that dropped mid-run keeps being written to a
 * fallback directory for the rest of the run.
 */
export class MountedRemoteTransport {
  constructor({ mountpoint, id, host, objectPrefix = DEFAULT_OBJECT_PREFIX, procPath = '/proc/self/mountinfo', policy = null, enforcePolicy = true }) {
    Object.assign(this, { mountpoint, id, host, objectPrefix, procPath, enforcePolicy });
    this.kind = 'DRVFS_MOUNT';
    this.isRealRemote = true;      // a real remote surface, verified per operation
    this.writeOnceEnforceableByMode = null;   // learned on first write, never assumed
    this.policy = policy;
  }

  /**
   * Bind this transport to an authorised destination from the policy file, so
   * the namespace comes from the contract rather than from a caller argument.
   */
  static forPolicyDestination(destinationId, { policy = loadReplicationPolicy(), procPath = '/proc/self/mountinfo' } = {}) {
    const dest = policy.destinations.find((d) => d.id === destinationId);
    if (!dest) { const e = new Error('REPLICATION_DESTINATION_NOT_IN_POLICY'); e.destinationId = destinationId; throw e; }
    const t = new MountedRemoteTransport({
      mountpoint: dest.mountpoint, id: dest.id, host: dest.host,
      objectPrefix: dest.objectPrefix, procPath, policy,
    });
    t.policyDestination = dest;
    return t;
  }

  activePolicy() { return this.policy ?? loadReplicationPolicy(); }

  /** Path relative to the MOUNT ROOT, so a receipt is self-contained. */
  relPath(contentHash) { return path.posix.join(this.objectPrefix, objectStorePath(contentHash)); }
  absPath(contentHash) { return path.join(this.mountpoint, this.relPath(contentHash)); }

  authority() { return resolveMountAuthority(this.mountpoint, { procPath: this.procPath }); }

  assertAuthority(op) {
    const a = this.authority();
    if (a.authority !== MOUNT_AUTHORITY.VERIFIED) {
      const e = new Error('MOUNT_AUTHORITY_NOT_PROVEN');
      e.target = this.id; e.op = op; e.mountpoint = this.mountpoint; e.reasons = a.reasons;
      throw e;
    }
    return a;
  }

  put(contentHash, blob) {
    const authority = this.assertAuthority('put');

    // Policy admission BEFORE anything is created. A refusal must leave the
    // share exactly as it was, including creating no directories.
    if (this.enforcePolicy) {
      const decision = evaluateReplicationWrite({
        mountpoint: this.mountpoint, relPath: this.relPath(contentHash),
        contentHash, blob, mountAuthority: authority, policy: this.activePolicy(),
      });
      if (!decision.permitted) {
        const e = new Error(decision.code);
        e.target = this.id; e.mountpoint = this.mountpoint; e.detail = decision;
        throw e;
      }
      this.lastPolicyDecision = decision;
    }

    const abs = this.absPath(contentHash);
    mkdirSync(path.dirname(abs), { recursive: true });

    if (existsSync(abs)) {
      // Write-once by CONTENT, which is the guarantee that survives a
      // filesystem unable to enforce read-only modes.
      const existing = readFileSync(abs);
      if (sha256Prefixed(existing) !== contentHash) {
        const e = new Error('OBJECT_STORE_IDEMPOTENCY_VIOLATION'); e.target = this.id; e.path = this.relPath(contentHash); throw e;
      }
      return { path: this.relPath(contentHash), reused: true, mountAuthority: authority };
    }

    const tmp = `${abs}.part-${process.pid}-${Date.now()}`;
    writeFileSync(tmp, blob);
    renameSync(tmp, abs);                         // atomic publish
    try { chmodSync(abs, 0o444); this.writeOnceEnforceableByMode = true; } catch {
      // drvfs cannot chmod. Recorded rather than swallowed: it is the concrete
      // mechanical reason immutability is unproven on this route.
      this.writeOnceEnforceableByMode = false;
    }
    return { path: this.relPath(contentHash), reused: false, mountAuthority: authority, writeOnceEnforceableByMode: this.writeOnceEnforceableByMode };
  }

  /** Re-hash AT the destination, after re-proving the destination is real. */
  verify(contentHash) {
    this.assertAuthority('verify');
    const abs = this.absPath(contentHash);
    if (!existsSync(abs)) return { present: false, hash: null };
    const bytes = readFileSync(abs);
    return { present: true, hash: sha256Prefixed(bytes), byteLength: bytes.length };
  }

  fetch(contentHash) {
    this.assertAuthority('fetch');
    const abs = this.absPath(contentHash);
    if (!existsSync(abs)) { const e = new Error('REMOTE_MISSING'); e.target = this.id; throw e; }
    return readFileSync(abs);
  }

  /**
   * Immutability is a SEPARATE authority from replication and is reported
   * separately. Two legs reading back perfectly says the bytes are recoverable;
   * it says nothing about whether they can be overwritten tomorrow.
   */
  immutabilityAuthority() {
    return {
      status: 'NOT_PROVEN',
      writeOnceEnforceableByMode: this.writeOnceEnforceableByMode,
      reasons: [
        'DRVFS_CHMOD_UNSUPPORTED_WRITE_ONCE_NOT_ENFORCEABLE_BY_FILE_MODE',
        'NO_WORM_SNAPSHOT_OR_OFF_BOX_RETENTION_AUTHORITY_EVALUATED_ON_THIS_ROUTE',
      ],
      note: 'Read-back proves arrival and recoverability. It never proves immutability.',
    };
  }
}

/**
 * Fixture that behaves EXACTLY like the mounted transport, including the
 * authority refusal, but against a synthetic mountinfo file. It exists so the
 * refusal path -- the branch that matters -- is provable without a real share,
 * and so a failed-mount fallback can be simulated deliberately.
 */
export function syntheticMountInfo(entries) {
  return entries.map((e, i) =>
    `${30 + i} 1 0:${40 + i} / ${e.mountPoint} rw,relatime - ${e.fstype} ${e.source} ${e.superOptions ?? 'rw'}`).join('\n');
}
