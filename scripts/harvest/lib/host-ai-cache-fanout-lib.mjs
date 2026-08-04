import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

/** Default hosts when operator passes --sync-hosts without a value. */
export const DEFAULT_SYNC_HOSTS = ["wesley_work", "wesleydesk"];

const HOST_ID_ALIASES = {
  wesley_work: "WESLEY_WORK",
  work: "WESLEY_WORK",
  wesleywork: "WESLEY_WORK",
  WESLEY_WORK: "WESLEY_WORK",
  wesleydesk: "WESLEYDESK",
  desk: "WESLEYDESK",
  WESLEYDESK: "WESLEYDESK",
  ryzen9desk: "RYZEN9DESK",
  ryzen9: "RYZEN9DESK",
  RYZEN9DESK: "RYZEN9DESK",
};

const HOST_HOT_CACHE_CANDIDATES = {
  WESLEY_WORK: ["/mnt/d/AI Cursur Cache", "D:/AI Cursur Cache", "D:\\AI Cursur Cache"],
  WESLEYDESK: ["/mnt/s/AI Cursur Cache", "S:/AI Cursur Cache", "S:\\AI Cursur Cache"],
  RYZEN9DESK: ["/mnt/c/AI Cursur Cache", "C:/AI Cursur Cache", "C:\\AI Cursur Cache"],
};

const HOST_MACHINE_ROLES = {
  WESLEY_WORK: "wesley_work",
  WESLEYDESK: "wesleydesk",
  RYZEN9DESK: "ryzen9desk",
};

function filterPlatformCandidates(candidates) {
  return candidates.filter((candidate) => {
    const value = String(candidate).replace(/\\/g, "/");
    if (process.platform === "win32") {
      return !value.startsWith("/mnt/");
    }
    return !/^[A-Za-z]:\//.test(value);
  });
}

export function normalizeSyncHostId(raw) {
  const key = String(raw ?? "").trim();
  if (!key) return null;
  const normalized = HOST_ID_ALIASES[key] ?? HOST_ID_ALIASES[key.toLowerCase()] ?? null;
  if (normalized) return normalized;
  const upper = key.toUpperCase().replace(/-/g, "_");
  return HOST_ID_ALIASES[upper] ?? (HOST_HOT_CACHE_CANDIDATES[upper] ? upper : null);
}

/**
 * Parse --sync-hosts=wesley_work,wesleydesk or a pre-split array.
 * Returns null when fanout is disabled.
 */
export function parseSyncHostsInput(input) {
  if (input === null || input === undefined || input === false) return null;
  if (input === true || input === "") {
    return [...DEFAULT_SYNC_HOSTS].map((id) => normalizeSyncHostId(id)).filter(Boolean);
  }
  const tokens = Array.isArray(input)
    ? input
    : String(input)
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
  const hostIds = [];
  for (const token of tokens) {
    const hostId = normalizeSyncHostId(token);
    if (!hostId) {
      throw new Error(`unknown sync-host id: ${token}`);
    }
    if (!hostIds.includes(hostId)) hostIds.push(hostId);
  }
  return hostIds;
}

export function resolveHostHotCacheRoot(hostId) {
  const candidates = HOST_HOT_CACHE_CANDIDATES[hostId] ?? [];
  for (const candidate of filterPlatformCandidates(candidates)) {
    const resolved = path.resolve(candidate);
    if (existsSync(resolved)) {
      return resolved.replace(/\\/g, "/");
    }
  }
  return null;
}

function runJsonCommand(cmd, cwd, env = {}) {
  const stdout = execSync(cmd, {
    cwd,
    env: { ...process.env, ...env },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return JSON.parse(stdout);
}

/**
 * After Z: canonical publish, fan out Z release + hot routing index to named host cache roots.
 * Z remains sole writer; host roots are read-through replicas (D:/S:/C:).
 */
export function fanoutHostAiCache({
  appBuilderRoot,
  hubRoot,
  syncHosts,
  dryRun = false,
  skipZReleaseSync = false,
  skipHotRouting = false,
} = {}) {
  const hostIds = parseSyncHostsInput(syncHosts);
  if (!hostIds?.length) {
    return { ok: true, skipped: true, code: "SYNC_HOSTS_DISABLED", hosts: [] };
  }

  const hosts = [];
  let hardFailure = null;

  for (const hostId of hostIds) {
    const hotCacheRoot = resolveHostHotCacheRoot(hostId);
    const machineRole = HOST_MACHINE_ROLES[hostId] ?? null;
    const hostResult = {
      hostId,
      machineRole,
      hotCacheRoot,
      zReleaseSync: { ok: false, code: "SKIP" },
      hotRouting: { ok: false, code: "SKIP" },
    };

    if (!hotCacheRoot) {
      hostResult.skipped = true;
      hostResult.code = "HOST_CACHE_ROOT_UNAVAILABLE";
      hostResult.ok = true;
      hosts.push(hostResult);
      continue;
    }

    if (dryRun) {
      hostResult.ok = true;
      hostResult.dryRun = true;
      hostResult.planned = [
        skipZReleaseSync ? null : `ai-cache-z-master:sync-host --host ${hostId}`,
        skipHotRouting ? null : `publish-hot-routing-index --host=${hostId}`,
      ].filter(Boolean);
      hosts.push(hostResult);
      continue;
    }

    if (!skipZReleaseSync) {
      try {
        const sync = runJsonCommand(
          `npm run ai-cache-z-master:sync-host -- --host ${hostId} --apply --verify --attest --json`,
          appBuilderRoot,
          {
            INTELLIGENCE_HUB_ROOT: hubRoot,
            CG_BIBLE_TRUTH_HOST: hostId,
            CG_WSL_MACHINE_ROLE: machineRole ?? "",
            CG_AUTHORITY_CACHE_ROOT: hotCacheRoot,
          },
        );
        hostResult.zReleaseSync = sync.sync ?? sync;
        if (hostResult.zReleaseSync.ok === false && hostResult.zReleaseSync.code !== "Z_UNREACHABLE") {
          hardFailure = { hostId, stage: "z-release-sync", result: hostResult.zReleaseSync };
        }
      } catch (err) {
        hostResult.zReleaseSync = { ok: false, code: "SYNC_HOST_EXEC_FAIL", error: String(err.message ?? err) };
        hardFailure = { hostId, stage: "z-release-sync", result: hostResult.zReleaseSync };
      }
    } else {
      hostResult.zReleaseSync = { ok: true, code: "SKIP" };
    }

    if (!skipHotRouting && !hardFailure) {
      try {
        const hotRouting = runJsonCommand(
          `npm run intelligence-hub:publish-hot-routing-index -- --json --host=${hostId} --hot-root='${hotCacheRoot}'`,
          appBuilderRoot,
          {
            INTELLIGENCE_HUB_ROOT: hubRoot,
            CG_BIBLE_TRUTH_HOST: hostId,
            CG_WSL_MACHINE_ROLE: machineRole ?? "",
            CG_AUTHORITY_CACHE_ROOT: hotCacheRoot,
          },
        );
        hostResult.hotRouting = hotRouting;
        if (hotRouting.ok === false) {
          hardFailure = { hostId, stage: "hot-routing", result: hotRouting };
        }
      } catch (err) {
        hostResult.hotRouting = { ok: false, code: "HOT_ROUTING_EXEC_FAIL", error: String(err.message ?? err) };
        hardFailure = { hostId, stage: "hot-routing", result: hostResult.hotRouting };
      }
    }

    hostResult.ok = !hardFailure || hardFailure.hostId !== hostId;
    hosts.push(hostResult);
    if (hardFailure) break;
  }

  const attempted = hosts.filter((h) => !h.skipped);
  const synced = attempted.filter((h) => h.zReleaseSync?.ok !== false);
  return {
    ok: !hardFailure,
    code: hardFailure ? "HOST_FANOUT_FAIL" : "HOST_FANOUT_PASS",
    hostCount: hostIds.length,
    attemptedCount: attempted.length,
    syncedCount: synced.length,
    hosts,
    hardFailure,
  };
}
