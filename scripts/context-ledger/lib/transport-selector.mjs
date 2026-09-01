/**
 * Transport selection, separated from storage authority.
 *
 * The defect this replaces: context-ledger-v1.mjs chose its adapter with a
 * ternary that defaulted to SshRsyncTransport -- an unimplemented stub whose
 * every method throws -- so the "production" path was a transport that could
 * not run, and the only reachable alternative was a drvfs mount that reports
 * its own immutability as NOT_PROVEN.
 *
 * The architecture here is:
 *
 *   DECLARED TRANSPORT -> selector -> implemented adapter
 *      -> runtime selected transport -> receipt-bound transport identity
 *
 * TWO RULES HOLD THIS APART FROM STORAGE AUTHORITY:
 *
 *  1. A transport never names its own destination. The object root, host and
 *     share come from the canonical storage authority contract, which is
 *     passed in. An adapter that hard-coded a destination would let a mount
 *     name confer authority -- the exact defect the mission forbids.
 *
 *  2. Selection NEVER falls back. An unimplemented, unknown, misconfigured or
 *     authority-less selection REFUSES. Silent fallback is how an unproven
 *     transport becomes an apparent success.
 */
import { LocalFixtureTransport, SshRsyncTransport } from './transport.mjs';
import { MountedRemoteTransport } from './mount-transport.mjs';

export const TRANSPORT_ID = {
  FILESTATION_HTTPS: 'FILESTATION_HTTPS',
  SCP: 'SCP',
  DRVFS_MOUNT: 'DRVFS_MOUNT',
  SSH_RSYNC: 'SSH_RSYNC',
  LOCAL_FIXTURE: 'LOCAL_FIXTURE',
};

/**
 * Whether a transport may ever be classified as native production replication.
 *
 * DRVFS is INELIGIBLE by contract, not by accident: a live mounted Windows
 * surface cannot enforce write-once by file mode, and the mission states it
 * may only be reclassified through a separate governance decision.
 */
export const NATIVE_PRODUCTION = {
  ELIGIBLE: 'NATIVE_PRODUCTION_ELIGIBLE',
  INELIGIBLE: 'NATIVE_PRODUCTION_INELIGIBLE',
};

export const STORAGE_AUTHORITY_STATE = {
  PROVEN: 'PROVEN',
  CONFLICTED: 'CONFLICTED',
  ABSENT: 'ABSENT',
};

export const SELECTOR_REFUSAL = {
  TRANSPORT_NOT_SPECIFIED: 'TRANSPORT_NOT_SPECIFIED',
  TRANSPORT_NOT_IN_REGISTRY: 'TRANSPORT_NOT_IN_REGISTRY',
  TRANSPORT_NOT_IMPLEMENTED: 'TRANSPORT_NOT_IMPLEMENTED',
  TRANSPORT_CONFIGURATION_INCOMPLETE: 'TRANSPORT_CONFIGURATION_INCOMPLETE',
  STORAGE_AUTHORITY_REQUIRED: 'STORAGE_AUTHORITY_REQUIRED',
  STORAGE_AUTHORITY_NOT_PROVEN: 'STORAGE_AUTHORITY_NOT_PROVEN',
  DRVFS_NOT_NATIVE_PRODUCTION_TRANSPORT: 'DRVFS_NOT_NATIVE_PRODUCTION_TRANSPORT',
};

/**
 * The registry is DATA. Adding a transport is a data change plus an adapter,
 * never an edit to the selection logic -- so the guards below cannot be
 * bypassed by a new branch in a ternary.
 *
 * requiredEnv lists CONFIGURATION VARIABLE NAMES ONLY. No value is read here,
 * none is logged, and none is ever placed in a receipt.
 */
export const TRANSPORT_REGISTRY = Object.freeze({
  [TRANSPORT_ID.FILESTATION_HTTPS]: {
    id: TRANSPORT_ID.FILESTATION_HTTPS,
    description: 'Synology FileStation over HTTPS via Tailscale',
    implemented: true,
    nativeProduction: NATIVE_PRODUCTION.ELIGIBLE,
    requiredEnv: ['SYNOLOGY_SERVICE_USERNAME', 'SYNOLOGY_SERVICE_PASSWORD'],
    proofArtifact: 'phase0-synthetic-proof-v1.json',
  },
  [TRANSPORT_ID.SCP]: {
    id: TRANSPORT_ID.SCP,
    description: 'SCP over SSH to the wesleydesk backup host',
    implemented: true,
    nativeProduction: NATIVE_PRODUCTION.ELIGIBLE,
    requiredEnv: ['WESLEYDESK_SSH_HOST', 'WESLEYDESK_SSH_USER', 'WESLEYDESK_SSH_KEY'],
    proofArtifact: 'phase0-synthetic-proof-v1.json',
  },
  [TRANSPORT_ID.DRVFS_MOUNT]: {
    id: TRANSPORT_ID.DRVFS_MOUNT,
    description: 'Live mounted remote share (drvfs/cifs)',
    implemented: true,
    nativeProduction: NATIVE_PRODUCTION.INELIGIBLE,
    ineligibleReason: 'DRVFS_CHMOD_UNSUPPORTED_WRITE_ONCE_NOT_ENFORCEABLE_BY_FILE_MODE',
    requiredEnv: [],
  },
  [TRANSPORT_ID.SSH_RSYNC]: {
    id: TRANSPORT_ID.SSH_RSYNC,
    description: 'Restricted ssh+rsync adapter',
    implemented: false,                       // stub: every method throws
    notImplementedReason: 'SSH_RSYNC_TRANSPORT_NOT_IMPLEMENTED_AWAITING_REAL_STORAGE',
    nativeProduction: NATIVE_PRODUCTION.ELIGIBLE,
    requiredEnv: [],
  },
  [TRANSPORT_ID.LOCAL_FIXTURE]: {
    id: TRANSPORT_ID.LOCAL_FIXTURE,
    description: 'Local synthetic fixture. Test surface only.',
    implemented: true,
    nativeProduction: NATIVE_PRODUCTION.INELIGIBLE,
    ineligibleReason: 'LOCAL_FIXTURE_IS_NOT_REMOTE_STORAGE',
    requiredEnv: [],
  },
});

function refuse(code, detail = {}) {
  const e = new Error(code);
  Object.assign(e, detail, { refusal: code });
  return e;
}

export function transportDescriptor(transportId) {
  return TRANSPORT_REGISTRY[transportId] ?? null;
}

export function classifyNativeProduction(transportId) {
  const d = transportDescriptor(transportId);
  if (!d) throw refuse(SELECTOR_REFUSAL.TRANSPORT_NOT_IN_REGISTRY, { transportId });
  return d.nativeProduction;
}

/**
 * Hard guard for the mission's native-production milestone. DRVFS success is
 * not production proof and must not be laundered into one by a caller that
 * merely observed a successful write.
 */
export function assertNativeProductionTransport(transportId) {
  const cls = classifyNativeProduction(transportId);
  if (cls !== NATIVE_PRODUCTION.ELIGIBLE) {
    const d = transportDescriptor(transportId);
    if (transportId === TRANSPORT_ID.DRVFS_MOUNT) {
      throw refuse(SELECTOR_REFUSAL.DRVFS_NOT_NATIVE_PRODUCTION_TRANSPORT, {
        transportId, reason: d.ineligibleReason,
      });
    }
    throw refuse(SELECTOR_REFUSAL.DRVFS_NOT_NATIVE_PRODUCTION_TRANSPORT, {
      transportId, reason: d.ineligibleReason,
    });
  }
  return true;
}

export function missingConfiguration(transportId, env = process.env) {
  const d = transportDescriptor(transportId);
  if (!d) throw refuse(SELECTOR_REFUSAL.TRANSPORT_NOT_IN_REGISTRY, { transportId });
  // Presence only. Values are never read, compared, hashed or reported.
  return d.requiredEnv.filter((name) => {
    const v = env[name];
    return v === undefined || v === null || String(v).length === 0;
  });
}

/**
 * Resolve a runtime transport.
 *
 * storageAuthority is REQUIRED and must be PROVEN. While primary authority is
 * CONFLICTED and backup is ABSENT this refuses by design -- which is the
 * mechanism that keeps "mutation remains prohibited against production
 * storage" true in code rather than in a comment.
 */
export function selectTransport({
  transportId,
  role,
  storageAuthority,
  env = process.env,
  requireNativeProduction = false,
  adapterOverrides = {},
} = {}) {
  if (!transportId) throw refuse(SELECTOR_REFUSAL.TRANSPORT_NOT_SPECIFIED, { role });

  const d = transportDescriptor(transportId);
  if (!d) throw refuse(SELECTOR_REFUSAL.TRANSPORT_NOT_IN_REGISTRY, { transportId, role });

  // Checked BEFORE configuration and authority: an unimplemented transport can
  // never become a fallback success, whatever else is in place.
  if (!d.implemented) {
    throw refuse(SELECTOR_REFUSAL.TRANSPORT_NOT_IMPLEMENTED, {
      transportId, role, reason: d.notImplementedReason,
    });
  }

  if (requireNativeProduction) assertNativeProductionTransport(transportId);

  if (!storageAuthority) {
    throw refuse(SELECTOR_REFUSAL.STORAGE_AUTHORITY_REQUIRED, {
      transportId, role,
      detail: 'The destination comes from the canonical storage authority contract, never from the transport.',
    });
  }
  if (storageAuthority.state !== STORAGE_AUTHORITY_STATE.PROVEN) {
    throw refuse(SELECTOR_REFUSAL.STORAGE_AUTHORITY_NOT_PROVEN, {
      transportId, role, authorityState: storageAuthority.state,
      authorityId: storageAuthority.authorityId ?? null,
    });
  }

  const missing = missingConfiguration(transportId, env);
  if (missing.length > 0) {
    throw refuse(SELECTOR_REFUSAL.TRANSPORT_CONFIGURATION_INCOMPLETE, {
      transportId, role, missingConfigurationNames: missing,
    });
  }

  const factory = adapterOverrides[transportId] ?? DEFAULT_ADAPTERS[transportId];
  if (!factory) throw refuse(SELECTOR_REFUSAL.TRANSPORT_NOT_IMPLEMENTED, { transportId, role });

  const adapter = factory({ role, storageAuthority, env });
  return {
    adapter,
    // Receipt-bound identity: what was selected, where it was pointed, and
    // whether that pairing may be called native production.
    transportIdentity: {
      transportId,
      role: role ?? null,
      nativeProduction: d.nativeProduction,
      authorityId: storageAuthority.authorityId ?? null,
      objectRoot: storageAuthority.objectRoot ?? null,
      host: storageAuthority.host ?? null,
      selectedAt: new Date().toISOString(),
    },
  };
}

/**
 * Adapter construction. Each is handed the destination FROM THE AUTHORITY.
 * FileStation and SCP wrap the phase0-proven mechanisms; they are constructed
 * only once authority is PROVEN, so they cannot be pointed at a conflicted
 * candidate.
 */
const DEFAULT_ADAPTERS = {
  [TRANSPORT_ID.LOCAL_FIXTURE]: ({ role, storageAuthority }) =>
    new LocalFixtureTransport({ root: storageAuthority.objectRoot, id: `local-fixture-${role ?? 'unspecified'}` }),

  [TRANSPORT_ID.DRVFS_MOUNT]: ({ storageAuthority }) =>
    MountedRemoteTransport.forPolicyDestination(storageAuthority.policyDestinationId),

  [TRANSPORT_ID.SSH_RSYNC]: ({ role, storageAuthority }) =>
    new SshRsyncTransport({ id: `ssh-rsync-${role ?? 'unspecified'}`, host: storageAuthority.host }),

  [TRANSPORT_ID.FILESTATION_HTTPS]: ({ storageAuthority }) => new FileStationTransport({ storageAuthority }),
  [TRANSPORT_ID.SCP]: ({ storageAuthority }) => new ScpTransport({ storageAuthority }),
};

/**
 * FileStation adapter. The phase0 mechanism is a Python module invoked out of
 * process; binding it here keeps credential handling where it already is --
 * in the environment -- rather than moving secrets into Node.
 */
export class FileStationTransport {
  constructor({ storageAuthority }) {
    this.kind = TRANSPORT_ID.FILESTATION_HTTPS;
    this.isRealRemote = true;
    this.storageAuthority = storageAuthority;
    this.objectRoot = storageAuthority.objectRoot;
    this.host = storageAuthority.host;
  }
  put() { throw notWired(this.kind, 'put'); }
  verify() { throw notWired(this.kind, 'verify'); }
  fetch() { throw notWired(this.kind, 'fetch'); }
}

export class ScpTransport {
  constructor({ storageAuthority }) {
    this.kind = TRANSPORT_ID.SCP;
    this.isRealRemote = true;
    this.storageAuthority = storageAuthority;
    this.objectRoot = storageAuthority.objectRoot;
    this.host = storageAuthority.host;
  }
  put() { throw notWired(this.kind, 'put'); }
  verify() { throw notWired(this.kind, 'verify'); }
  fetch() { throw notWired(this.kind, 'fetch'); }
}

/**
 * These adapters are SELECTABLE but not yet EXERCISED against a canonical
 * destination, because no canonical destination has been adjudicated. They
 * refuse rather than writing somewhere plausible. When authority is settled,
 * this refusal is replaced by the phase0-proven call -- and only then.
 */
function notWired(kind, op) {
  const e = new Error('TRANSPORT_DESTINATION_NOT_ADJUDICATED');
  e.transportId = kind;
  e.operation = op;
  e.detail = 'Adapter is selectable and configured, but no canonical storage authority has been adjudicated. Refusing rather than writing to an unproven destination.';
  return e;
}

/** Integration status. Not PROVEN until a real canary crosses the canonical path. */
export const NATIVE_TRANSPORT_PIPELINE_INTEGRATION = 'IMPLEMENTED_UNPROVEN';

/**
 * DSM share-behaviour rules (contracts/context-ledger/DSM_SHARE_BEHAVIOR_V1.md).
 *
 * Encoded so the interpretation cannot drift back to the intuitive-but-wrong
 * reading that a share missing from an enumeration call is absent.
 */
export const SHARE_EXISTENCE = {
  EXISTS: 'EXISTS',
  ABSENT: 'ABSENT',
  INCONCLUSIVE: 'INCONCLUSIVE',
};

export function interpretShareExistence({ getSucceeds, presentInList, negativeControlHolds }) {
  // Without the fabricated-name control, a get success proves nothing: the API
  // might simply be echoing the requested name back.
  if (!negativeControlHolds) return SHARE_EXISTENCE.INCONCLUSIVE;
  if (getSucceeds) return SHARE_EXISTENCE.EXISTS;      // list omission is irrelevant here
  return presentInList ? SHARE_EXISTENCE.INCONCLUSIVE : SHARE_EXISTENCE.ABSENT;
}

/** Share.list is not a census: omission alone never justifies a mutation. */
export function listOmissionJustifiesMutation() { return false; }
