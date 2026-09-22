# CG-AppBuilder-MCP investigation report

**Work package:** `cg-appbuilder-mcp-investigation-report-v1`  
**Date:** 2026-09-22  
**Subject repo:** `Capglass5708/CG-AppBuilder-MCP` @ `20789c3` (main, 2026-09-21, "Merge #737")  
**Owner repo for all fixes:** `CG-AppBuilder-MCP` — this file only describes work; nothing was changed in the subject repo.  
**Mode:** read-only inspection (static review, local builds/tests on scratch copies, GitHub Actions run history)

---

## 1. Scope and method

Five parallel read-only audits, with the High/Critical items spot-checked by hand:

| Lane | Covered |
| --- | --- |
| MCP servers | `services/*`, `mcp-server/suite-control-plane`, `mcp/knowledge-index`, `.mcp.json`, Dockerfiles, Railway/pm2 config |
| Security | Committed secrets, Supabase migrations (RLS, grants, SECURITY DEFINER), HTTP auth, workflow injection, Docker |
| Repo hygiene | Committed generated output, `.gitignore`, npm scripts, `scripts/`, `docs/`, root clutter, agent docs |
| CI/CD | 44 files in `.github/workflows`, required-check registry, last ~100 `main` runs |
| Packages / tests / deps | `packages/*`, `apps/admin-ui`, `schemas/`, `contracts/`, `registry/`, `npm audit`, test runs |
| GitHub state | Branch protection, branches, open PRs/issues, file commit history (GitHub API) |

**Repo at a glance:** 14,035 tracked files (~378 MB working tree), 2,079 npm scripts, 4,210 files under `scripts/`, 873 under `docs/`, 44 workflows, 18 separate lockfiles, 7 MCP servers + 1 REST API.

Secret values are **not** reproduced in this report — only file locations.

---

## 2. Priority summary (do these first)

| # | Sev | Item | Section |
| --- | --- | --- | --- |
| 1 | **Critical** | Cloudflare API token + Resend API key committed in plaintext env dumps — **rotate now** | 3.1 |
| 2 | **Critical** | Platform-intelligence MCP OAuth issues tokens to anyone typing a company email; open client registration | 3.2 |
| 3 | High | Required checks `closeout` and `audit` red on 6/6 recent `main` runs — every PR blocked by external drift | 5.1 |
| 4 | High | Supabase SECURITY DEFINER RPCs likely executable by `anon`/`authenticated` | 3.3 |
| 5 | High | Reflected XSS on OAuth consent page | 3.4 |
| 6 | High | admin-ui production deps: 1 critical (`next`) + 4 high advisories | 7.1 |
| 7 | High | `POST /scaffold-artifacts/:id/commit-local` always throws (`require` in ESM) | 4.1 |
| 8 | High | Platform-intelligence Docker image build broken by `.dockerignore` | 4.2 |
| 9 | High | No lint or aggregate test in CI; `npm test` covers 14 of 524 test scripts | 6.3 |
| 10 | High | 35 npm scripts point at files that don't exist | 6.4 |
| 11 | High | `main` has no branch protection — "required" checks aren't enforced | 7A.1 |
| 12 | Medium | 1,236 branches, 48 open PRs (many stale), bot index PRs never landing | 7A.3–7A.4 |

---

## 3. Security

### 3.1 Critical — committed third-party API keys
- `CLOUDFLARE_API_TOKEN` and `RESEND_API_KEY` values are present in full inside process-environment dumps:
  - `artifacts/runs/cursor-wide-cheapest-redo-governance-v1/startup-retrieval-receipt-v1.json` (and `-v2.json`), lines 180, 248
  - `artifacts/runs/z-drive-pre-session-gate-hardening-v1/startup-retrieval-receipt-v1.json` (and `-v2.json`), lines 215, 284
- The same env blocks also leak Windows user paths, a key-folder path, a Cursor conversation ID and an `IGCCSVC_DB` blob. `DOPPLER_TOKEN` *was* redacted — the receipt writer uses a denylist that missed these keys. `artifacts/runs/auto-v32-env-decontamination-v1/startup-retrieval-receipt-v*.json` has the same shape.
- **Action:** rotate both keys; change the receipt writer to an **allowlist** of env names; remove the files and purge from history; add a secret-scanning gate (e.g. gitleaks) to CI.

### 3.2 Critical — platform-intelligence OAuth has no real authentication
- `services/cursor-platform-intelligence-mcp/src/http-server.ts:281-309` + `src/oauth/broker.ts:220-232`: `POST /oauth/authorize` mints a code for any email ending `@capitalglasstx.com` / `@capitalglasstxapps.com` — no password, SSO or mailbox proof. The embedded provider is the default (`oauth/config.ts:60`).
- `/oauth/register` (`http-server.ts:206`, `broker.ts:54-66`) accepts arbitrary `redirect_uris`, so an outsider can complete the whole flow and get a Bearer token for `/mcp`.
- `PLATFORM_INTELLIGENCE_OAUTH_AUTO_APPROVE_SUBJECT` skips even the form (`http-server.ts:237-259`).
- `authCodes`/`clients` maps are never pruned (`broker.ts:28-29`) — unbounded memory.
- **Action:** use the `entra` provider (or real IdP) in production; allowlist redirect URIs / restrict DCR; never set auto-approve remotely; TTL + cap on in-memory state.

### 3.3 High — Supabase RPC grants
- SECURITY DEFINER functions in `public` only `REVOKE ... FROM PUBLIC`; Supabase default privileges grant EXECUTE directly to `anon`/`authenticated`, so those stay callable:
  - `upsert_execution_packet_projection` (`supabase/migrations/20260805140000_execution_packet_projections_v1.sql:68,104`) — writes agent execution packets (prompt-injection path into agents)
  - `upsert_harvest_prompt_projection` (`20260806000000_harvest_prompt_projections_v1.sql:69,139`)
  - `prune_debug_events` (`20260417180000_live_site_debug.sql:90,106`)
  - `get_execution_packet`, `get_approved_harvest_prompt` (read)
- `codeintel`/`knowledge` functions do this correctly (`FROM PUBLIC, anon, authenticated`).
- **Action:** add explicit revokes; verify live with `has_function_privilege('anon', ...)`.

### 3.4 High — reflected XSS on consent page
- `cursor-platform-intelligence-mcp/src/http-server.ts:263-279` interpolates `client_id`, `redirect_uri`, `state`, `code_challenge`, `scope` into HTML unescaped, before client validation. **Action:** escape all values; validate client/redirect first.

### 3.5 Medium
- **56 tables without RLS**, including PostgREST-exposed `registry`, `codeintel`, and `platform_api.oauth_clients` / `glass.oauth_clients` (holding `client_secret`). Currently protected by grants only. Enable RLS as defense in depth.
- **Workflow input injection on self-hosted desktop runners:** free-text `workflow_dispatch` inputs spliced into `run:` — `ryzen9desk-executor-dispatch.yml:206`, `wesleydesk-executor-dispatch.yml:73`, `wesleywork-executor-dispatch.yml:88`, `direct-connect-execution-route.yml:55-56`, `propagate-suite-ci-fixes.yml:52,65`, `catalog-capability-gate.yml:29`, `doppler-oidc-runtime.yml:73,103`. `publish-ryzen-readiness.yml:27` splices `$GITHUB_TOKEN` into a `powershell.exe -Command` string. Pass via `env:` and quote.
- **Tag-pinned third-party actions in the secrets workflow:** `dopplerhq/cli-action@v3`, `dopplerhq/secrets-fetch-action@v2.0.0` (`doppler-oidc-runtime.yml:60,89`) in a job with `id-token: write`.
- **Shell-interpolated git calls** in platform-intelligence: `queries/git-authority.ts:221`, `queries/repository-availability.ts:113`; traversal check at `:218` uses `startsWith(root)` without separator. Use `execFileSync` with arg arrays.
- **Webhook bodies read fully before auth, no size cap:** `mcp-api/src/lib/stream.ts:3-13` via `preParsing` in `routes/railwayWebhooks.ts:38-41`, `routes/webhooks.ts:133`.

### 3.6 Low
- Non-constant-time secret compares: `mcp-api/src/middleware/requireAdmin.ts:18-19`, `routes/runner.ts:20`, `routes/runnerDebug.ts:20`, `routes/railwayWebhooks.ts:153`.
- Unauthenticated `/metrics`, `/build-info`, `/internal/version` (`routes/health.ts`); token endpoint returns `String(err)` (`http-server.ts:326`).
- ~26 GitHub actions tag-pinned (`checkout@v4`, `upload-artifact@v4`, `setup-node@v4`); `direct-connect-execution-route.yml:47` has a truncated 39-char SHA. Several workflows lack top-level `permissions:`.
- Views granted to `anon` without `security_invoker` (`20260714200000_platform_intelligence_relation_evidence_v1e.sql:83-84`) — latent (no schema USAGE for anon found).
- Diagnostic probe allowlist includes tenant wildcards `*.vercel.app`, `*.up.railway.app`, `*.supabase.co` (`cursor-diagnostic-mcp/src/config.ts:26-28`).
- Internal network data committed: private LAN IPs (hundreds of occurrences), Tailscale addresses and tailnet hostname, internal Railway hostnames.
- Docker base images float (`node:22-alpine`); pin by digest. (Images correctly run non-root.)
- ~90 `execSync` calls with template strings under `scripts/` (operator-input only).

**Checked clean:** no committed `.env`; fixture JWTs/keys are test-only; `doppler.yaml`/`.mcp.json` contain no secrets; all `USING(true)` policies are `TO service_role`; all SECURITY DEFINER functions set `search_path`; no `pull_request_target`; mcp-api routes have auth preHandlers and webhook signatures are verified constant-time.

---

## 4. MCP servers and services

### 4.0 Inventory

| Server | Purpose | Transport | Tools | Tests |
| --- | --- | --- | --- | --- |
| `services/mcp-api` | Fastify REST backend (not MCP itself) | HTTP :3001 (Railway, pm2) | 142 routes | vitest, 34 files |
| `cg-github-plane-mcp` | GitHub compile/verify/merge plane | stdio (`.mcp.json`) | 16 | none in service |
| `cg-feature-plane-mcp` | Feature plan F0–F7 | stdio (`.mcp.json`) | 5 | none; **no lockfile** |
| `cursor-mcp-server` | Cursor proxy to mcp-api + bridges | stdio | 144 | none |
| `cursor-diagnostic-mcp` | Allowlisted probes, health, preflight | stdio | 29 | smoke scripts only |
| `cursor-platform-intelligence-mcp` | Codeintel/registry, remote OAuth | stdio + Streamable HTTP :8080 | 23 | 1 orphan test (2/4 fail) |
| `cursor-suite-wiring-mcp` | Suite wiring knowledge | stdio | 17 | none |
| `mcp-server/suite-control-plane` | Suite repos, gates, pipelines | stdio (unregistered) | 20 | node:test, 10/11 pass |
| `estimating-knowledge-bridge`, `health-healing-bridge` | Libraries imported via `../../` | — | — | none |

### 4.1 High — `commit-local` route always fails
`services/mcp-api/src/lib/with-routing-enforcement.ts:9` calls `require()` in an ESM package (`"type": "module"`) → `ReferenceError: require is not defined`; the relative path also resolves to the wrong directory. Caller: `routes/scaffoldArtifacts.ts:1108`. Use `await import()` with the correct path and add a test.

### 4.2 High — platform-intelligence image build broken
`.dockerignore` excludes `artifacts` and re-includes only `packages/app-wiring-core`, `services/mcp-api`, one docs JSON; `Dockerfile.platform-intelligence-mcp:40-47` COPYs ~8 paths under `artifacts/`. Add a per-Dockerfile ignore file or re-include those paths.

### 4.3 Medium
- **mcp-api image missing runtime files:** `knowledge-context-engine/src` (`lib/knowledgeContextService.ts:19-20`, `lib/knowledgeContextEngine.ts:9,33`) and `scripts/wsl/lib/...` (`lib/requireCheckoutMutationLease.ts:10`) are not copied by `Dockerfile.mcp-api`.
- **`.mcp.json` servers don't start from a clean checkout** (`ERR_MODULE_NOT_FOUND`): it runs `index.mjs` directly instead of the dependency-installing launcher (`scripts/lib/mcp-plane-service-launch.mjs`); `mcp:build` omits both plane servers and suite-control-plane.
- **Blocking sync child processes with no timeout** in stdio servers: `github-plane-core/src/github-actuator.mjs:60`, `runtime-identity.mjs:16`, `suite-control-plane/src/lib/gate-runner.mjs:42`, and five copies of bridge `invoke()` in cursor-mcp-server (`intelligence-hub-tools.ts:16`, `sdlc-protocol-cursor-tools.ts:16`, `estate-resolution-tools.ts:16`, `write-path-mcp-tools.ts:17`, `gcc-mcp-tools.ts:17`).
- **Platform-intelligence test tests a local copy** of `derivePublicationPhase` instead of the real one (`publication-health-invariant.test.ts:87`); no test script; tests compiled into dist/image.

### 4.4 Low
- Stateless `/mcp` handler never closes server/transport (`http-server.ts:363-370`).
- Repos-root fallback loop always returns the first candidate (`cursor-platform-intelligence-mcp/src/config.ts:41-51`).
- No fetch timeout in `cursor-mcp-server/src/apiClient.ts:72,114`.
- Hardcoded Windows paths (`C:/Developer/repos`, `C:/Cursor Projects`, `Z:/TEMP L DRIVE`, `L:\`) across diagnostic, suite-wiring, mcp-api, suite-control-plane.
- Duplication: MCP-root resolution ×3, `MCP_APP_KEY_TO_REGISTRY` ×2, bridge `invoke()` ×5, `run.mjs` launchers ×4 — consolidate into `packages/app-wiring-core`.
- Version drift: MCP SDK 1.30.0 (github-plane) vs 1.29.0 elsewhere; `jose` ^5 vs ^6; plane servers use deprecated `server.tool` (move to `registerTool`).
- suite-control-plane is not registered in any MCP config; `mcp/knowledge-index/cg-m8-plane-mcp-registration.v1.json` duplicates `.mcp.json` and is referenced only from a doc.
- Tests/tools write receipts into the repo tree (`suite-control-plane/src/lib/pipeline-smoke.mjs:36-61`, `gate-runner.mjs:49-55`) — write to a temp dir under test.

---

## 5. CI/CD

### 5.1 High — required checks permanently red
- `closeout` (closeout-gate.yml) and `audit` (mcp-contract-audit.yml, "PromptOps gate") failed 6/6 recent `main` runs including HEAD. Log: committed `promptops/generated/suite-prompt-index.json` `lastIndexedSha` ≠ live sibling-repo SHA.
- Both are `REQUIRED_BEFORE_MERGE` (`registry/github-plane/check-policy.v1.json:17-19`), so any push to a pilot repo blocks every PR here until the daily index publication or a manual re-commit.
- Both check out sibling repos at moving `main` with `CG_WORKSPACE_CHECKOUT_TOKEN`, and carry stale hardcoded branch refs (closeout-gate.yml:25-26, mcp-contract-audit.yml:62).
- **Action:** make the check hermetic (validate against SHAs pinned in the committed index), downgrade live drift to a warning, drop stale refs.

### 5.2 High — `verify.sh` broken
`ROOT="$(dirname "$0")"` is relative, so the second `cd` fails; runs `npm run build` without install for three packages; not referenced by any workflow. Fix (`ROOT="$(cd "$(dirname "$0")" && pwd)"`, `npm ci`) or delete.

### 5.3 Medium
- Self-hosted desktop lanes (WesleyDesk, Ryzen9Desk, WesleyWork) hardcode `/home/wesley/repos`, `/mnt/l`, `Z:\`; hot-cache publication has 14 cancelled + 1 queued ~21h (runner offline); ryzen9desk dispatch failed 2/2 today. Add runner-health preflight; stop auto-dispatch to offline runners.
- Duplicate gate runs: validate-main.yml:106-115 re-runs four gates that each have their own workflow; `mcp:contract-audit` and `test:platform-intelligence-contract` run in 3 workflows.
- 35/41 workflows have no `timeout-minutes`; 29 have no `concurrency` group.
- Node 20 in 4 workflows vs 22 elsewhere; `engines: >=20`; no `.nvmrc`.

### 5.4 Low
- Dead paths: `if: false` job (`wsl-mcp-drift-check.yml:24`); `CI: 'true'` hard-set makes the full closeout profile unreachable (`closeout-gate.yml:54-61`).
- `.yml.template` files live in `.github/workflows` (inert but confusing).
- `npm ci || npm install` fallback hides lockfile drift (validate-main.yml:38, mcp-contract-audit.yml:50).
- Uneven npm caching; `estate-intelligence-auto-refresh.yml:30` runs on every push to main with no path filter and `cancel-in-progress: false`.
- Check-policy registry keeps `CI`, `test:m8`, `M8 GitHub Plane` which no job here emits (contradicts its own identity rule); `promptops` is NON_BLOCKING yet runs blocking inside `audit`/`closeout`.

---

## 6. Repo hygiene and maintainability

### 6.1 High — generated evidence is 88% of the repo
`artifacts/` = 6,973 files / 332.7 MB (of which `artifacts/agent-runs/` 284 MB across 473 run dirs). Largest: `runtime/token-usage/latest.json` 2.7 MB; a 2.5 MB recovery `.bundle.tar.gz`; four byte-identical 2.29 MB Supabase advisor reports. 190 duplicate-file groups. `.gitignore` is 199 lines, 106 of them one-off paths; no directory-level rules for `runtime/`, `outbound/`, `_lane-artifacts/`, `index/`, `tmp-*`. Add directory rules with allowlist exceptions, enforce evidence lifecycle archival, cap run-dir size.

### 6.2 High — 276 tracked files match `.gitignore`
250 in `artifacts/agent-runs`, 10 in `.agent-handoff/` (documented as gitignored scratch), 4 in `.agent-reports/`, 35 epoch-timestamped test-output dirs. `git rm --cached` + explicit negations for intended fixtures.

### 6.3 High — no lint / aggregate tests in CI
524 `test*` npm scripts; `npm test` reaches 14. No workflow runs `eslint`, `npm run lint` or `npm test`. 722 test files spread across `scripts/tests` (654), `services/mcp-api` (34), `apps/admin-ui` (9), etc.; 122 are referenced by nothing; `tests/mcp-contract-governance.test.ts` is orphaned. Two same-named, diverged `executor-attestation-guard.test.mjs`. Add a glob-based test runner and wire lint + tests into validate-main.

### 6.4 High — 35 broken npm script targets
31 distinct missing files. `test:health-manager` references 10 missing smoke scripts; also `test:token-refresh`, `test:vercel-detector`, `test:vercel-executor`, `mcp:reboot-check`, four `integrations:push-*-knowledge`, `github-preservation:machine-acceptance`, `watch-pilot:sync-ext4`, `windows-host:terminal-flash-audit`, five `scripts/tests/*.test.mjs`. Delete/repoint and add a CI check that script targets exist.

### 6.5 Medium
- **npm script sprawl:** `package.json` 235 KB, 2,079 scripts, 192 prefixes (53 used once); 441 one-off/versioned names; 33 groups of identical commands; `diag:` vs `diagnostic:`; 56 `closeout*` scripts despite AGENTS.md "closeout freeze". Move machine/program-specific scripts into sub-package manifests.
- **`scripts/` dead tail:** 573 of 4,029 code files unreachable from any entrypoint; 306 whose basename is referenced nowhere; 1,097 carry one-off markers (`-vN`, wave, closeout, phase, pilot, probe). Archive completed-program scripts.
- **`docs/` sprawl:** 873 files; 110 loose in root; 97 self-marked superseded/deprecated still live; 37 with machine-local paths; `docs/architecture/wiring/INDEX.json` and `wiring-index.json` byte-identical (violates the repo's own "no replacement wiring index" rule).
- **Root clutter:** `tmp-glazing-push-probe.txt` ("test"), `.pr-body-sdlc-block-1-coordinating.md`, `closeout.json`, `closeout-roi-durability.json`, three `.code-workspace` files (one points at legacy `C:/Developer/repos`, one hardcodes a home dir; a generator exists), dirs with spaces (`Critique Agent/`, `Current Build/`, 32 references), 8 `health-manager.*.json` at root, one-file dirs (`agent-control/`, `verification/`).
- **Agent docs diverge:** CLAUDE.md lists five native agents but `.claude/agents/verifier.md` doesn't exist; README still describes the repo as a Supabase/MCP-API/runners control plane with PM2/Windows startup and omits `packages/`, `intelligence-hub/`, `platform-control/`, `promptops/`, etc.; README, AGENTS.md and CLAUDE.md each present a different "start here" flow.

### 6.6 Low
- ESLint: narrow rule set (intentional); `.ts` (395 files) not linted; config imports `globals` which is not a declared devDependency.

---

## 7. Packages, tests and dependencies

### 7.0 Test results obtained (scratch copies)

| Package | Result |
| --- | --- |
| app-mcp-kit | **21/31 pass, 10 fail** (hardcoded `C:/Developer/repos/...`) |
| intelligence-cert-core | 14/14 |
| estate-epoch | 5/5 |
| feature-plane-core | 7/7 |
| github-plane-core | 42/42 |
| apps/admin-ui | 17/17, `tsc --noEmit` clean |
| services/mcp-api | 139/142 (3 depend on repo-root scripts absent from the copy) |
| mcp-server/suite-control-plane | 10/11 files |
| app-wiring-core, derived-intel-core, platform-intelligence-client, mcp-contracts | build clean; no tests |

### 7.1 High
- **admin-ui prod deps vulnerable:** `next` 15.5.14 (critical), `postcss`, `sharp`, `ws`, `nanoid` (high). Upgrade `next` (`apps/admin-ui/package.json:15`), `npm audit fix`, re-test.
- **app-mcp-kit tests Windows-machine-only:** `src/test/prompt-resolver.test.ts:12-14`, `kit.test.ts:21,53`. Not run by CI. Use fixtures.
- **app-mcp-kit prod deps vulnerable** via `@modelcontextprotocol/sdk` 1.29.0: `fast-uri`, `ip-address` (high), `hono`, `@hono/node-server`, `qs` (moderate). Same SDK locked in 5 services — bump estate-wide.

### 7.2 Medium
- **No npm workspaces, 18 lockfiles:** `@types/node` at 4 patch levels, `typescript` installed 14×, CI runs `npm --prefix … ci` per package. Adopt root workspaces.
- **Packages consumed via relative `dist/`/`src/` paths** (e.g. `scripts/tests/run-intelligence-cert-spine.test.mjs:13`), failing until built by hand; deep imports bypass `exports` maps (`agent-protocol-kernel`).
- **No CI coverage** for derived-intel-core, intelligence-cert-core, platform-intelligence-client, admin-ui, agent-protocol-kernel, feature-plane-core, estate-epoch.
- **Schema validation thin:** ajv in only 4 scripts; `ajv-formats` not installed (all `date-time`/`uuid` formats silently ignored); 38 of 65 schemas unreferenced (all of `contracts/estimating-*`, `schemas/active-ledger`, `schemas/three-way-agent`); `scripts/derived-intel/gate-v1a1.mjs:20-28` only checks file existence; no registry JSON declares `$schema`. Two schemas need sibling `addSchema` to compile.

### 7.3 Low
- `typescript` as runtime dep in `derived-intel-core`.
- `packages/mcp-contracts` effectively unused (consume or delete).
- `CentralHubFreshness` defined twice in app-mcp-kit.
- app-mcp-kit publishes `dist/test`.
- admin-ui `lint` script broken (`next lint` without eslint installed); admin-ui has no deploy path (no Dockerfile/Railway/workflow) — decide maintained vs archived.

**Checked fine:** all tsconfigs `strict: true`; `main`/`exports` targets resolve after build; root prod audit 0 vulns; all lockfiles v3 and in sync.

---

## 7A. GitHub repository state (checked via GitHub API, 2026-09-22)

### 7A.1 High — `main` has no branch protection
- The branches API reports `main` as `"protected": false`. The required-check policy in `registry/github-plane/check-policy.v1.json` is therefore not enforced by GitHub itself (unless an org/repo ruleset applies — confirm in Settings → Rules).
- Consistent with this: `main` keeps receiving merges (e.g. #737 at HEAD) while the "required" `closeout` and `audit` checks are red.
- **Action:** add branch protection or a ruleset on `main` requiring the checks that actually pass (after 5.1 is fixed), blocking force-push and deletion.

### 7A.2 High — the committed API keys have been in history since early August, and a redaction pass missed them
- `cursor-wide-cheapest-redo-governance-v1/startup-retrieval-receipt-v1.json` was added in `c98de72` (2026-08-01); `z-drive-pre-session-gate-hardening-v1/startup-retrieval-receipt-v1.json` in `6ed873a` (2026-08-02).
- Commit `1b02df1` (2026-09-08, "redact artifact secrets … Scanner fails closed on JWT/Doppler shapes") touched both files but left the Cloudflare and Resend values in place — the scanner only recognizes JWT/Doppler patterns.
- With 1,236 branches, many cut after August 1, copies of these files exist on many refs; deleting the files on `main` does not remove them.
- **Action:** rotation is the real fix (history purge is secondary and costly at this branch count); widen the scanner to generic provider-key patterns (`cfut_`, `re_`, etc.) or adopt gitleaks; enable GitHub secret scanning / push protection if the plan allows it.

### 7A.3 Medium — branch sprawl: 1,236 branches
- By prefix: `recovery/` 457, `work/` 290, `feat/` 176, `chore/` 129, `fix/` 60, `mission/` 13, `docs/` 12, others.
- 91 are `chore/promptops-index-publication-*` automation branches (mostly July 2026) that were never cleaned up.
- `recovery/` branches encode machine/repo/timestamp paths (e.g. `recovery/cg-nimo-01/cg-appbuilder-mcp/.../20260913T070912Z`) and stash SHAs — a backup mechanism living in the shared remote.
- **Action:** enable "automatically delete head branches"; have the publication workflow delete its branch after merge; move recovery snapshots to tags in a separate archive repo or bundle storage; prune merged branches.

### 7A.4 Medium — 48 open PRs, most stale
- 48 open PRs; the oldest date to 2026-07-26 (#182) and ~30 have had no activity for 3+ weeks.
- Two are explicitly throwaway: #728, #729 ("[THROWAWAY - DO NOT MERGE] G5 … probe") — close them.
- Three long-lived bot PRs from `cg-derived-state-publisher[bot]` (#647, #648, #649, open since 2026-09-11, still updated daily). #648 is `promptops-index` — landing it is what the red `closeout`/`audit` gates are waiting for (see 5.1), so these bot PRs not merging is part of why `main` stays red.
- Several overlap in theme (auto-v32 #227/#228, PI publication #349/#411/#412, index-authorship retirement #572/#575), suggesting superseded work.
- **Action:** triage — merge or close each; close anything superseded by work already on `main`; set a stale-PR policy.

### 7A.5 Low — issues are not used for tracking
- One open issue (#39, 2026-07-12). Work tracking lives in docs/ledgers and PR titles instead; the findings in this report would have no home in the subject repo's tracker. Consider filing the Critical/High items as issues.

---

## 8. Suggested sequencing

1. **Today:** rotate Cloudflare + Resend keys; switch platform-intelligence OAuth off `embedded` in production (or take the remote endpoint offline); escape the consent page.
2. **Unblock merging, then enforce it:** make `closeout`/`audit` PromptOps checks hermetic; land or close the derived-state bot PRs; then turn on branch protection for `main` (7A.1).
3. **Harden data plane:** Supabase RPC revokes + verify live; RLS on exposed/oauth tables.
4. **Fix broken runtime paths:** `commit-local` ESM bug; both Dockerfiles; `.mcp.json` launchers.
5. **Make CI honest:** lint + aggregate test job + package matrix; delete 35 dead script targets; timeouts/concurrency/SHA pins; input-via-env on dispatch workflows; secret scanning.
6. **Dependency sweep:** `next` upgrade, MCP SDK bump, npm workspaces.
7. **Hygiene program:** evidence lifecycle + directory-level `.gitignore`; untrack 276 ignored files; archive dead scripts/docs; reconcile README/AGENTS/CLAUDE; triage 48 open PRs and prune 1,236 branches (7A.3–7A.4).

## 9. Inspection notes
- The subject-repo clone was shallow (depth 1); commit history for specific files was read through the GitHub API instead (section 7A). A full-history secret scan across all branches was not run.
- Not checked (needs repo-admin API access not available here): rulesets, Actions secrets/permissions settings, Dependabot/code-scanning/secret-scanning alert status, deploy keys, webhooks, collaborators.
- Running `suite-control-plane` tests locally wrote two untracked files under `artifacts/suite-control-plane/pipeline-smoke/` in the inspection sandbox clone only (see 4.4); nothing was pushed to CG-AppBuilder-MCP.
- Docker daemon unavailable; Docker findings are from static reading.
