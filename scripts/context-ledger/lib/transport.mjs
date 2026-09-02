/**
 * Storage adapters. Primary and backup are SIBLINGS.
 *
 * The backup is never derived from the primary and never reads it. If the
 * Synology is failing, the backup path must not be a dependent of the thing
 * that is failing -- so each adapter is handed the spool object, independently.
 *
 * Deletes and modifications NEVER propagate between destinations. A mistake on
 * one must not be obediently reproduced on the other.
 *
 * LocalFixtureTransport exists so the worker can be proven end to end before
 * the real DSM shares exist. It must never be presented as remote success.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, renameSync, chmodSync } from 'node:fs';
import path from 'node:path';
import { sha256Prefixed, objectStorePath } from './canonical.mjs';

export class LocalFixtureTransport {
  constructor({ root, id, host = 'local-fixture', failWrite = false, corruptOnWrite = false, offline = false }) {
    Object.assign(this, { root, id, host, failWrite, corruptOnWrite, offline });
    this.kind = 'LOCAL_FIXTURE';
    this.isRealRemote = false; // never claim otherwise
  }

  put(contentHash, blob) {
    if (this.offline) { const e = new Error('REMOTE_UNREACHABLE'); e.target = this.id; throw e; }
    if (this.failWrite) { const e = new Error('TRANSFER_FAILED'); e.target = this.id; throw e; }
    const rel = objectStorePath(contentHash);
    const abs = path.join(this.root, rel);
    mkdirSync(path.dirname(abs), { recursive: true });
    if (existsSync(abs)) {
      // Write-once: identical content is a dedup hit; differing content is a
      // hard error, never an overwrite.
      const existing = readFileSync(abs);
      if (sha256Prefixed(existing) !== contentHash) {
        const e = new Error('OBJECT_STORE_IDEMPOTENCY_VIOLATION'); e.target = this.id; e.path = rel; throw e;
      }
      return { path: rel, reused: true };
    }
    const payload = this.corruptOnWrite ? Buffer.concat([blob, Buffer.from('!')]) : blob;
    const tmp = `${abs}.part-${process.pid}`;
    writeFileSync(tmp, payload);
    renameSync(tmp, abs);            // atomic publish
    try { chmodSync(abs, 0o444); } catch { /* 9p cannot chmod; verification is the real guarantee */ }
    return { path: rel, reused: false };
  }

  /** Re-hash AT the destination. Never predicted locally -- that would verify nothing. */
  verify(contentHash) {
    if (this.offline) { const e = new Error('REMOTE_UNREACHABLE'); e.target = this.id; throw e; }
    const abs = path.join(this.root, objectStorePath(contentHash));
    if (!existsSync(abs)) return { present: false, hash: null };
    return { present: true, hash: sha256Prefixed(readFileSync(abs)) };
  }

  fetch(contentHash) {
    const abs = path.join(this.root, objectStorePath(contentHash));
    if (!existsSync(abs)) { const e = new Error('REMOTE_MISSING'); e.target = this.id; throw e; }
    return readFileSync(abs);
  }
}

/**
 * Real SSH/rsync adapter -- deliberately NOT implemented yet.
 *
 * It cannot be honestly written until the restricted cg-context-ledger
 * transport exists and the probe pair passes. A stub that pretends to succeed
 * would be exactly the fabrication this project is built to prevent.
 */
export class SshRsyncTransport {
  constructor(opts) { Object.assign(this, opts); this.kind = 'SSH_RSYNC'; this.isRealRemote = true; }
  put() { throw new Error('SSH_RSYNC_TRANSPORT_SUPERSEDED_BY_CG_VAULT_SSH'); }
  verify() { throw new Error('SSH_RSYNC_TRANSPORT_SUPERSEDED_BY_CG_VAULT_SSH'); }
  fetch() { throw new Error('SSH_RSYNC_TRANSPORT_SUPERSEDED_BY_CG_VAULT_SSH'); }
}

/**
 * Constrained vault SSH transport — Docker execution plane on dedicated port.
 * Does not use DSM native non-admin SSH.
 */
export class CgVaultSshTransport {
  constructor({ id, host, port = 22222, keyPath, user = 'vault', objectRoot }) {
    Object.assign(this, { id, host, port, keyPath, user, objectRoot });
    this.kind = 'CG_VAULT_SSH';
    this.isRealRemote = true;
  }

  _sshArgs(remoteCmd) {
    return [
      'ssh', '-i', this.keyPath, '-p', String(this.port),
      '-o', 'BatchMode=yes', '-o', 'IdentitiesOnly=yes',
      '-o', 'PasswordAuthentication=no',
      `${this.user}@${this.host}`, remoteCmd,
    ];
  }

  async probe() {
    const { execFile } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const run = promisify(execFile);
    const { stdout } = await run('ssh', this._sshArgs('VAULT_SSH_PROBE').slice(1));
    if (!String(stdout).includes('VAULT_SSH_OK')) {
      throw new Error('CG_VAULT_SSH_PROBE_FAILED');
    }
    return true;
  }

  put() { throw new Error('CG_VAULT_SSH_PUT_NOT_WIRED'); }
  verify() { throw new Error('CG_VAULT_SSH_VERIFY_USE_DESTINATION_EXEC'); }
  fetch() { throw new Error('CG_VAULT_SSH_FETCH_FORBIDDEN'); }
}
