import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const BACKUP_ROOT = 'L:/Capital-Glass-AI-Evidence-Vault-backup';
const SSH_HOST = process.env.WESLEYDESK_SSH_HOST ?? '100.93.199.27';
const SSH_USER = process.env.WESLEYDESK_SSH_USER ?? 'cgremoteadmin';
const SSH_KEY = process.env.WESLEYDESK_SSH_KEY ?? '/tmp/wdesk-key';

function winPathToRemote(winPath) {
  return winPath.replace(/\//g, '\\');
}

export function ensureBackupRoot() {
  execSsh(`if not exist "${winPathToRemote(BACKUP_ROOT)}" mkdir "${winPathToRemote(BACKUP_ROOT)}"`);
}

export function uploadBackup(localPath, remoteRel) {
  ensureBackupRoot();
  const remote = `${BACKUP_ROOT}/${remoteRel}`.replace(/\//g, '\\');
  const remoteDir = remote.replace(/\\[^\\]+$/, '');
  execSsh(`powershell -NoProfile -Command "New-Item -ItemType Directory -Force -Path '${remoteDir.replace(/'/g, "''")}' | Out-Null"`);
  execScp(localPath, `${SSH_USER}@${SSH_HOST}:${remote.replace(/\\/g, '/')}`);
}

export function downloadBackup(remoteRel, localPath) {
  const remote = `${BACKUP_ROOT}/${remoteRel}`.replace(/\//g, '/');
  mkdirSync(path.dirname(localPath), { recursive: true });
  execScp(`${SSH_USER}@${SSH_HOST}:${remote}`, localPath);
}

export function hashRemoteBackup(remoteRel) {
  const remote = `${BACKUP_ROOT}/${remoteRel}`.replace(/\\/g, '/');
  const localTmp = path.join(
    os.tmpdir(),
    `cg-cl-hash-${createHash('sha256').update(remote).digest('hex').slice(0, 16)}.bin`,
  );
  try {
    execScp(`${SSH_USER}@${SSH_HOST}:${remote}`, localTmp);
    const data = readFileSync(localTmp);
    return `sha256:${createHash('sha256').update(data).digest('hex')}`;
  } finally {
    rmSync(localTmp, { force: true });
  }
}

export function deleteBackupMeta(relPath) {
  const remote = `${BACKUP_ROOT}/${relPath}`.replace(/\//g, '\\');
  execSsh(`if exist "${remote}" rmdir /s /q "${remote}"`);
}

function execSsh(command, { allowFailure = false } = {}) {
  try {
    execFileSync('ssh', [
      '-o', 'BatchMode=yes',
      '-o', `IdentityFile=${SSH_KEY}`,
      '-o', 'StrictHostKeyChecking=accept-new',
      `${SSH_USER}@${SSH_HOST}`,
      command,
    ], { stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    if (!allowFailure) throw err;
  }
}

function execScp(from, to) {
  execFileSync('scp', [
    '-o', 'BatchMode=yes',
    '-o', `IdentityFile=${SSH_KEY}`,
    '-o', 'StrictHostKeyChecking=accept-new',
    from,
    to,
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
}

export function sshKeyReady() {
  return existsSync(SSH_KEY);
}
