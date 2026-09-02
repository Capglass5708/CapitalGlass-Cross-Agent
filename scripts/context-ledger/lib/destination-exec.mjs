/**
 * Destination-side hash execution.
 *
 * THE DEFECT THIS EXISTS TO PREVENT:
 *
 *   write through FileStation -> download through FileStation -> hash locally
 *
 * That is not independent verification. It proves the transport is
 * self-consistent, which a symmetric read/write bug also satisfies. The same
 * objection applies to SCP write/read symmetry and to hashing a drvfs mount
 * from the WSL side: in every case the bytes are measured by the same layer
 * that placed them.
 *
 * Independent verification means the hash is computed AT the destination host,
 * by a mechanism outside the application's replication path, and only the
 * DIGEST travels back.
 *
 * Every executor here is IMPLEMENTED_UNPROVEN: the interface and the
 * fail-closed path exist, but nothing has been exercised against a canonical
 * destination because no canonical destination has been adjudicated. Nothing
 * in this module authenticates to, or mutates, production storage.
 */

export const DESTINATION_HASH_CAPABILITY = {
  IMPLEMENTED_UNPROVEN: 'IMPLEMENTED_UNPROVEN',
  NOT_AVAILABLE: 'NOT_AVAILABLE',
  PROVEN: 'PROVEN',
};

export const EXEC_REFUSAL = {
  MECHANISM_READS_BACK_THROUGH_TRANSPORT: 'MECHANISM_READS_BACK_THROUGH_TRANSPORT',
  DESTINATION_EXECUTION_NOT_AUTHORIZED: 'DESTINATION_EXECUTION_NOT_AUTHORIZED',
  MECHANISM_NOT_IN_REGISTRY: 'MECHANISM_NOT_IN_REGISTRY',
  ALLOWLIST_EXPANSION_REQUIRED: 'ALLOWLIST_EXPANSION_REQUIRED',
  STORAGE_AUTHORITY_NOT_PROVEN: 'STORAGE_AUTHORITY_NOT_PROVEN',
};

export const EXEC_MECHANISM = {
  CG_VAULT_SSH_VAULT_SHA256: 'CG_VAULT_SSH_VAULT_SHA256',
  SSH_REMOTE_SHA256SUM: 'SSH_REMOTE_SHA256SUM',
  DSM_API_REMOTE_HASH: 'DSM_API_REMOTE_HASH',
  TRANSPORT_READBACK: 'TRANSPORT_READBACK',
};

export const MECHANISM_REGISTRY = Object.freeze({
  [EXEC_MECHANISM.CG_VAULT_SSH_VAULT_SHA256]: {
    id: EXEC_MECHANISM.CG_VAULT_SSH_VAULT_SHA256,
    independentOfTransport: true,
    description: 'VAULT_SHA256 via constrained CG Vault SSH execution plane.',
    requiredEnv: ['CG_VAULT_SSH_HOST', 'CG_VAULT_SSH_PORT', 'CG_VAULT_SSH_KEY'],
    currentAllowlistState: 'ALLOWLISTED_VAULT_SHA256_DISPATCHER',
    dsmNativeSsh: false,
  },
  [EXEC_MECHANISM.SSH_REMOTE_SHA256SUM]: {
    id: EXEC_MECHANISM.SSH_REMOTE_SHA256SUM,
    independentOfTransport: true,
    description: 'Run sha256sum on the destination host over SSH; only the digest returns.',
    requiresAllowlistedCommand: 'sha256sum',
    currentAllowlistState: 'NOT_ALLOWLISTED',
    note: 'The restricted cg-context-ledger SSH policy allowlists rsync only. Broadening it is a separate authority decision and is NOT performed here.',
  },
  [EXEC_MECHANISM.DSM_API_REMOTE_HASH]: {
    id: EXEC_MECHANISM.DSM_API_REMOTE_HASH,
    independentOfTransport: true,
    description: 'Ask DSM to compute the digest server-side; only the digest returns.',
    requiredEnv: ['SYNOLOGY_SERVICE_USERNAME', 'SYNOLOGY_SERVICE_PASSWORD'],
    currentAuthorizationState: 'NOT_AUTHORIZED_FOR_THIS_MISSION',
  },
  [EXEC_MECHANISM.TRANSPORT_READBACK]: {
    id: EXEC_MECHANISM.TRANSPORT_READBACK,
    independentOfTransport: false,
    description: 'Download through the replication transport and hash locally.',
    refusalReason: 'Measures the bytes with the same layer that wrote them; a symmetric fault is invisible.',
  },
});

function refuse(code, detail = {}) {
  const e = new Error(code);
  Object.assign(e, detail, { refusal: code });
  return e;
}

export function mechanismDescriptor(mechanismId) {
  return MECHANISM_REGISTRY[mechanismId] ?? null;
}

/** The guard. Call before trusting any hash as destination-side evidence. */
export function assertIndependentOfTransport(mechanismId) {
  const m = mechanismDescriptor(mechanismId);
  if (!m) throw refuse(EXEC_REFUSAL.MECHANISM_NOT_IN_REGISTRY, { mechanismId });
  if (!m.independentOfTransport) {
    throw refuse(EXEC_REFUSAL.MECHANISM_READS_BACK_THROUGH_TRANSPORT, {
      mechanismId, reason: m.refusalReason,
    });
  }
  return true;
}

/**
 * Interface every executor satisfies. hashAt returns exactly the record the
 * mission requires -- and nothing that would let a caller mistake a local
 * measurement for a destination one.
 */
export class DestinationHashExecutor {
  constructor({ mechanismId, executionHost, storageAuthority }) {
    assertIndependentOfTransport(mechanismId);
    this.mechanismId = mechanismId;
    this.executionHost = executionHost;
    this.storageAuthority = storageAuthority;
    this.capability = DESTINATION_HASH_CAPABILITY.IMPLEMENTED_UNPROVEN;
  }

  /** @returns {Promise<{path,sha256,bytes,executionHost,executionMechanism,timestamp,exitStatus}>} */
  // eslint-disable-next-line no-unused-vars
  async hashAt(remoteRelPath) {
    throw new Error('DESTINATION_HASH_EXECUTOR_ABSTRACT');
  }

  /** Shape the result so every field the receipt needs is present or explicitly null. */
  static record({ path, sha256, bytes, executionHost, executionMechanism, exitStatus }) {
    return {
      path, sha256, bytes,
      executionHost, executionMechanism,
      timestamp: new Date().toISOString(),
      exitStatus,
      measuredAtDestination: true,
      viaReplicationTransport: false,
    };
  }
}

export class CgVaultSshHashExecutor extends DestinationHashExecutor {
  constructor(opts) { super({ ...opts, mechanismId: EXEC_MECHANISM.CG_VAULT_SSH_VAULT_SHA256 }); }

  async hashAt(remoteRelPath) {
    const { execFile } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const run = promisify(execFile);
    const host = process.env.CG_VAULT_SSH_HOST ?? this.executionHost;
    const port = process.env.CG_VAULT_SSH_PORT ?? '22222';
    const key = process.env.CG_VAULT_SSH_KEY;
    const user = process.env.CG_VAULT_SSH_USER ?? 'vault';
    if (!key) throw refuse(EXEC_REFUSAL.DESTINATION_EXECUTION_NOT_AUTHORIZED, { detail: 'CG_VAULT_SSH_KEY missing' });
    const { stdout, stderr } = await run('ssh', [
      '-i', key, '-p', String(port), '-o', 'BatchMode=yes', '-o', 'IdentitiesOnly=yes',
      `${user}@${host}`, `VAULT_SHA256 ${remoteRelPath}`,
    ]);
    const fields = {};
    for (const line of String(stdout).split('\n')) {
      if (line.includes('=')) {
        const [k, v] = line.split('=', 2);
        fields[k.trim()] = v.trim();
      }
    }
    if (!fields.hash) {
      throw refuse(EXEC_REFUSAL.DESTINATION_EXECUTION_NOT_AUTHORIZED, {
        stderrPrefix: String(stderr).slice(0, 120),
      });
    }
    return DestinationHashExecutor.record({
      path: fields.path ?? remoteRelPath,
      sha256: `sha256:${fields.hash}`,
      bytes: Number(fields.size ?? 0),
      executionHost: host,
      executionMechanism: this.mechanismId,
      exitStatus: 0,
    });
  }
}

export class DsmApiDestinationHashExecutor extends DestinationHashExecutor {
  constructor(opts) { super({ ...opts, mechanismId: EXEC_MECHANISM.DSM_API_REMOTE_HASH }); }

  async hashAt(remoteRelPath) {
    throw refuse(EXEC_REFUSAL.DESTINATION_EXECUTION_NOT_AUTHORIZED, {
      mechanismId: this.mechanismId,
      remoteRelPath,
      detail: 'Authenticating to production DSM is not authorized for this mission.',
    });
  }
}

/**
 * Resolve an executor for a role. Generic with respect to the eventual
 * authority decision: it takes whatever authority it is given and refuses
 * while that authority is not PROVEN.
 */
export function resolveDestinationHashExecutor({ role, storageAuthority, mechanismId, env = process.env } = {}) {
  if (!storageAuthority || storageAuthority.state !== 'PROVEN') {
    throw refuse(EXEC_REFUSAL.STORAGE_AUTHORITY_NOT_PROVEN, {
      role, authorityState: storageAuthority?.state ?? null,
    });
  }
  assertIndependentOfTransport(mechanismId);
  const common = { executionHost: storageAuthority.host, storageAuthority };
  if (mechanismId === EXEC_MECHANISM.CG_VAULT_SSH_VAULT_SHA256) return new CgVaultSshHashExecutor(common);
  if (mechanismId === EXEC_MECHANISM.SSH_REMOTE_SHA256SUM) {
    throw refuse(EXEC_REFUSAL.ALLOWLIST_EXPANSION_REQUIRED, {
      mechanismId,
      detail: 'DSM native SSH sha256sum superseded by CG_VAULT_SSH_VAULT_SHA256.',
    });
  }
  if (mechanismId === EXEC_MECHANISM.DSM_API_REMOTE_HASH) return new DsmApiDestinationHashExecutor(common);
  throw refuse(EXEC_REFUSAL.MECHANISM_NOT_IN_REGISTRY, { mechanismId });
}

/** Current mission-wide status for the Phase 0E gate. */
export function destinationHashCapabilityStatus() {
  return {
    PRIMARY_DESTINATION_HASH_EXECUTION: DESTINATION_HASH_CAPABILITY.IMPLEMENTED_UNPROVEN,
    BACKUP_DESTINATION_HASH_EXECUTION: DESTINATION_HASH_CAPABILITY.IMPLEMENTED_UNPROVEN,
    blockers: [
      'CG_VAULT_SSH_VAULT_SHA256: requires constrained vault SSH service on dedicated port',
      'DSM native SSH sha256sum: refused — use CG Vault SSH execution plane',
      'No canonical destination has been adjudicated, so nothing can be exercised',
    ],
  };
}
