import { spawnSync } from "node:child_process";

export const SUPABASE_CAPABILITY_SCHEMA = "harvest-supabase-projection-capability-v1@1.0.0";

export const DOPPLER_SUPABASE_PROFILE = {
  project: "cg-mcp",
  config: "dev",
};

const DOPPLER_SECRET_NAMES = [
  "MCP_SUPABASE_URL",
  "MCP_SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ACCESS_TOKEN",
];

function commandExists(command) {
  const probe = spawnSync("command", ["-v", command], { encoding: "utf8", shell: true });
  return probe.status === 0;
}

function dopplerSecretResolvable(secretName, { project, config } = DOPPLER_SUPABASE_PROFILE) {
  const proc = spawnSync(
    "doppler",
    ["secrets", "get", secretName, "--project", project, "--config", config, "--plain"],
    { encoding: "utf8", timeout: 8000 },
  );
  return proc.status === 0 && Boolean(proc.stdout?.trim());
}

function checkDirectAccessToken() {
  return Boolean(process.env.SUPABASE_ACCESS_TOKEN?.trim());
}

function checkSupabaseCliSession() {
  const proc = spawnSync("supabase", ["projects", "list"], { encoding: "utf8", timeout: 8000 });
  return proc.status === 0;
}

function checkDopplerSupabaseProfile() {
  if (!commandExists("doppler")) {
    return { available: false, resolvedSecrets: [] };
  }
  const resolvedSecrets = DOPPLER_SECRET_NAMES.filter((name) =>
    dopplerSecretResolvable(name, DOPPLER_SUPABASE_PROFILE),
  );
  const hasSqlCliAuth =
    resolvedSecrets.includes("SUPABASE_ACCESS_TOKEN") || checkDirectAccessToken() || checkSupabaseCliSession();
  const hasRestCredentials =
    resolvedSecrets.includes("MCP_SUPABASE_URL") &&
    resolvedSecrets.includes("MCP_SUPABASE_SERVICE_ROLE_KEY");
  return {
    available: hasSqlCliAuth && hasRestCredentials,
    resolvedSecrets,
  };
}

/**
 * Resolve optional Supabase projection capability without returning secret values.
 */
export function resolveSupabaseProjectionCapability() {
  const directToken = checkDirectAccessToken();
  const cliSession = checkSupabaseCliSession();
  const doppler = checkDopplerSupabaseProfile();

  let status = "OPTIONAL_UNAVAILABLE";
  let authMethod = "none";

  if (directToken) {
    status = "AVAILABLE";
    authMethod = "env-token";
  } else if (cliSession) {
    status = "AVAILABLE";
    authMethod = "supabase-cli";
  } else if (doppler.available) {
    status = "AVAILABLE";
    authMethod = "doppler";
  }

  return {
    schemaVersion: SUPABASE_CAPABILITY_SCHEMA,
    status,
    authMethod,
    dopplerProfile: DOPPLER_SUPABASE_PROFILE,
    probes: {
      directToken: directToken ? "AVAILABLE" : "OPTIONAL_UNAVAILABLE",
      supabaseCli: cliSession ? "AVAILABLE" : "OPTIONAL_UNAVAILABLE",
      dopplerCli: commandExists("doppler") ? "AVAILABLE" : "OPTIONAL_UNAVAILABLE",
      dopplerSecrets: doppler.resolvedSecrets,
    },
  };
}

export function buildDopplerWrappedCommand(innerCommand, profile = DOPPLER_SUPABASE_PROFILE) {
  return `doppler run --project ${profile.project} --config ${profile.config} -- ${innerCommand}`;
}

export function shouldWrapSupabaseCommand(capability = resolveSupabaseProjectionCapability()) {
  return capability.authMethod === "doppler";
}
