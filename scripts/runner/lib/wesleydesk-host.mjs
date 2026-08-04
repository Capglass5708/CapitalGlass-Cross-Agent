/**
 * WESLEYDESK index-publication runner — host identity (paths only; no secrets).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROFILE_PATH = path.join(__dirname, '..', 'wesleydesk.machine.json');

export const WORK_PACKAGE_ID = 'cross-agent-index-auto-publisher-activation-v1';
export const ARTIFACT_DIR = path.join(
  path.resolve(__dirname, '../../..'),
  'artifacts/agent-runs',
  WORK_PACKAGE_ID,
);

export function loadWesleydeskProfile() {
  return JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf8'));
}

export function resolveWindowsComputerName() {
  const r = spawnSync('cmd.exe', ['/c', 'echo %COMPUTERNAME%'], { encoding: 'utf8' });
  return (r.stdout ?? '').replace(/\r/g, '').trim();
}

export function profileMatchesWesleydesk(profile, env = process.env) {
  const winName = (env.CG_WINDOWS_COMPUTER_NAME ?? resolveWindowsComputerName()).toUpperCase();
  const names = (profile.windowsComputerNames ?? []).map((n) =>
    String(n).replace(/[`']/g, '').trim().toUpperCase(),
  );
  if (!winName) return false;
  return names.some((n) => winName === n || winName.includes(n) || n.includes(winName));
}

export function pathReadable(p) {
  try {
    return Boolean(p) && fs.existsSync(p) && fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

export function resolveReposRoot(profile, env = process.env) {
  const candidates = [
    env.CG_REPOS_ROOT?.trim(),
    env.HOME ? path.join(env.HOME, 'repos') : null,
    profile.reposRoot,
    '/home/wesley/repos',
    '/home/wesle/repos',
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (pathReadable(candidate)) return candidate;
  }
  return profile.reposRoot;
}

export function assertWesleydeskHost(env = process.env) {
  const profile = loadWesleydeskProfile();
  const ok = profileMatchesWesleydesk(profile, env);
  return {
    ok,
    profile,
    identity: {
      profile,
      windowsComputerName: env.CG_WINDOWS_COMPUTER_NAME?.trim() || resolveWindowsComputerName(),
      wslHostname: os.hostname(),
      wslUser: env.USER ?? os.userInfo().username,
      wslDistro: env.CG_WSL_DISTRO ?? profile.wslDistroDefault,
      tailscaleName: profile.tailscaleName ?? null,
      machineRole: profile.machineRole,
      hostMatchesWesleydesk: ok,
    },
  };
}
