/**
 * Pass 3 — mutation graph.
 * Maps every mutation primitive to: executable -> entry command -> admission
 * gate -> authority -> receipt. A mutation primitive reachable without an
 * admission gate is an UNCONTROLLED_MUTATION_PRIMITIVE.
 */
export const id = 'mutationGraph';

const PRIMITIVES = [
  { kind: 'GIT_COMMIT', severity: 'high', re: /\bgit\s+commit\b/g },
  { kind: 'GIT_PUSH', severity: 'critical', re: /\bgit\s+push\b/g },
  { kind: 'GIT_CHECKOUT_BRANCH', severity: 'medium', re: /\bgit\s+checkout\s+-b\b/g },
  { kind: 'GIT_RESET', severity: 'critical', re: /\bgit\s+reset\b/g },
  { kind: 'GIT_ADD', severity: 'low', re: /\bgit\s+add\b/g },
  { kind: 'GH_PR_MUTATION', severity: 'critical', re: /\bgh\s+pr\s+(create|merge|close)\b/g },
  { kind: 'FS_WRITE', severity: 'low', re: /fs\.(writeFileSync|writeFile|appendFileSync|cpSync|renameSync)\b/g },
  { kind: 'FS_DELETE', severity: 'high', re: /fs\.(rmSync|rm|unlinkSync|unlink|rmdirSync)\b/g },
  { kind: 'DB_WRITE', severity: 'high', re: /\.(insert|update|upsert|delete)\s*\(/g },
  { kind: 'SQL_MUTATION', severity: 'high', re: /\b(INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)\b/g },
  { kind: 'HTTP_MUTATION', severity: 'medium', re: /method:\s*['"](POST|PUT|PATCH|DELETE)['"]/g },
  { kind: 'EXTERNAL_MOUNT_WRITE', severity: 'high', re: /(\/mnt\/[lz]\b|[LZ]:\\\\)/g },
  { kind: 'PROCESS_EXEC', severity: 'medium', re: /\b(execSync|execFileSync|spawnSync|exec)\s*\(/g },
];

const GATE_SIGNALS = [
  { gate: 'APPLY_FLAG', re: /--apply\b|\bapply\s*[:=]|argv\.includes\(['"]--apply/ },
  { gate: 'DRY_RUN_DEFAULT', re: /dry-?run/i },
  { gate: 'ENV_APPROVAL', re: /process\.env\.[A-Z_]*(APPROVED|ALLOW|ENABLE|LIVE)[A-Z_]*/ },
  { gate: 'MOUNT_PROBE', re: /existsSync\(['"]?\/mnt\/|test\s+-d\s+\/mnt\// },
  { gate: 'ELIGIBILITY_CHECK', re: /eligib|WriteEligibility|admission/i },
];

/**
 * A shell mutation is only real if it is handed to an executor.
 * `execSync(`git push ...`)` is a string AND an execution; a packet title
 * that says "before git push parity proven" is a string only. Discriminating
 * on execution context rather than on string-ness is what separates
 * "this script pushes" from "this script talks about pushing".
 */
const EXEC_CONTEXT = /(execSync|execFileSync|spawnSync|execa|\bexec|\bspawn)\s*\(\s*[^)]{0,40}$/;

function isExecuted(rawText, matchIndex, filePath) {
  // Shell/PowerShell files execute their own lines directly.
  if (/\.(sh|ps1)$/.test(filePath)) return true;
  const lineStart = rawText.lastIndexOf('\n', matchIndex) + 1;
  const prefix = rawText.slice(Math.max(0, matchIndex - 200), matchIndex);
  const line = rawText.slice(lineStart, matchIndex);
  // Comment lines never execute.
  if (/^\s*(\/\/|\*|#)/.test(line)) return false;
  return EXEC_CONTEXT.test(prefix) || /(execSync|execFileSync|spawnSync)\s*\(/.test(line);
}

/** Reverse-map a script path to the npm scripts that invoke it. */
function entryCommandsFor(relPath, pkgScripts) {
  const base = relPath.split('/').pop();
  return Object.entries(pkgScripts)
    .filter(([, cmd]) => cmd.includes(relPath) || cmd.includes(base))
    .map(([name]) => `npm run ${name}`);
}

export function run(ctx, { governanceRules = [] } = {}) {
  const pkgScripts = ctx.packageJson.scripts ?? {};
  const executables = ctx.files.filter((f) => /^scripts\/.*\.(mjs|js|sh|ps1)$/.test(f));
  const nodes = [];
  const mentionOnly = [];

  for (const f of executables) {
    const raw = ctx.read(f);
    if (!raw) continue;
    const found = [];
    const mentioned = [];
    for (const p of PRIMITIVES) {
      p.re.lastIndex = 0;
      let m;
      while ((m = p.re.exec(raw))) {
        const isShellPrimitive = p.kind.startsWith('GIT_') || p.kind === 'GH_PR_MUTATION';
        const hit = { kind: p.kind, severity: p.severity, line: ctx.lineOf(raw, m.index) };
        // Only shell-invoked primitives need execution-context proof; a call
        // like fs.rmSync() or .insert() is already an execution by syntax.
        if (!isShellPrimitive || isExecuted(raw, m.index, f)) found.push(hit);
        else mentioned.push(hit);
      }
    }
    if (found.length === 0) {
      if (mentioned.length > 0) mentionOnly.push({ executable: f, mentioned: [...new Map(mentioned.map((h) => [h.kind, h])).values()] });
      continue;
    }

    const gates = GATE_SIGNALS.filter((g) => g.re.test(raw)).map((g) => g.gate);
    const entryCommands = entryCommandsFor(f, pkgScripts);
    const writesReceipt = /receipt|Receipt/.test(raw);

    // Deduplicate by kind, keeping first line and highest severity.
    const byKind = new Map();
    for (const hit of found) {
      if (!byKind.has(hit.kind)) byKind.set(hit.kind, hit);
    }
    const primitives = [...byKind.values()];
    const highRisk = primitives.filter((p) => p.severity === 'critical' || p.severity === 'high');

    nodes.push({
      executable: f,
      primitives,
      highestSeverity: primitives.some((p) => p.severity === 'critical')
        ? 'critical'
        : primitives.some((p) => p.severity === 'high')
          ? 'high'
          : primitives.some((p) => p.severity === 'medium')
            ? 'medium'
            : 'low',
      entryCommands,
      admissionGates: gates,
      writesReceipt,
      mentionedNotExecuted: [...new Map(mentioned.map((h) => [h.kind, h])).values()],
      targetScope: /^scripts\/tests\//.test(f) ? 'TEST_FIXTURE_REPO' : 'REPO_UNDER_TEST',
      uncontrolled: highRisk.length > 0 && gates.length === 0 && !/^scripts\/tests\//.test(f),
    });
  }

  const uncontrolled = nodes.filter((n) => n.uncontrolled);
  const gitMutators = nodes.filter((n) => n.primitives.some((p) => p.kind.startsWith('GIT_') || p.kind === 'GH_PR_MUTATION'));

  // Governance cross-check: rules that forbid a primitive vs code that uses it.
  const governanceConflicts = [];
  for (const rule of governanceRules) {
    for (const node of gitMutators) {
      if (!rule.forbids.some((k) => node.primitives.some((p) => p.kind === k))) continue;
      const testScoped = node.targetScope === 'TEST_FIXTURE_REPO';
      governanceConflicts.push({
        rule: rule.path,
        ruleName: rule.name,
        executable: node.executable,
        primitives: node.primitives.filter((p) => rule.forbids.includes(p.kind)).map((p) => p.kind),
        admissionGates: node.admissionGates,
        targetScope: node.targetScope,
        enforcementStatus: rule.enforcementStatus,
        // A test mutating a throwaway fixture repo is not bypassing the plane
        // on the governed repo. Recorded, but not raised as a contradiction.
        disposition: testScoped ? 'TEST_SCOPED_MUTATION_ACKNOWLEDGED' : 'GOVERNANCE_MUTATION_CONTRADICTION',
      });
    }
  }

  return {
    scannedExecutables: executables.length,
    mentionOnlyExecutables: mentionOnly.length,
    mentionOnly,
    mutatingExecutables: nodes.length,
    uncontrolledMutationPrimitives: uncontrolled.length,
    gitMutatingExecutables: gitMutators.map((n) => n.executable),
    governanceConflicts: governanceConflicts.filter((c) => c.disposition === 'GOVERNANCE_MUTATION_CONTRADICTION'),
    testScopedMutations: governanceConflicts.filter((c) => c.disposition === 'TEST_SCOPED_MUTATION_ACKNOWLEDGED'),
    nodes: nodes.sort((a, b) => a.executable.localeCompare(b.executable)),
  };
}
