# Office Admin — RYZEN9DESK managed executor bootstrap (pointer)

**Work package:** `office-admin-ryzen9desk-managed-executor-bootstrap-v1`  
**Status:** `INDEXED`  
**Verdict:** `CODE_READY_FOR_RUNNER_BOOTSTRAP` (coordination boundary only)  
**Owner repo:** CapitalGlass-Office-Admin  
**Owner artifact:** `docs/runbooks/ryzen9desk-managed-executor-office-admin.md`  
**Harvested:** 2026-08-03 (`harvest-2026-08-03-cross-thread-platform-state-v1`)

---

## Cross-Agent boundary

This packet records that **Office Admin** owns endpoint/network/bootstrap policy for RYZEN9DESK executor installation. Cross-Agent does **not** duplicate Office Admin runbooks.

---

## Related suite work (owner: CG-AppBuilder-MCP)

- PR #268 merged — executor workflow and install scripts on `main`
- Runner bootstrap + `executor-smoke` — **separate AppBuilder mission**
- Cross-Agent project: [2026-08-03_ryzen9desk-managed-executor-v1.md](./2026-08-03_ryzen9desk-managed-executor-v1.md)

---

## Office Admin indexing

- **Indexed** — `CapitalGlass-Office-Admin/docs/runbooks/ryzen9desk-managed-executor-office-admin.md` (commit `820a956` on branch `feat/ryzen9desk-managed-executor-office-admin-runbook-v1`, PR #52)
- WESLEY_WORK Office Admin checkout: `/home/wesle/repos/CapitalGlass-Office-Admin` (not `/home/wesley/repos`, which is RYZEN9DESK-only on this estate)
- Runner bootstrap remains CG-AppBuilder-MCP mission

---

## Forbidden in Cross-Agent harvest

- SSH to RYZEN9DESK
- Runner registration or service install
- Claiming `MANAGED_EXECUTOR_ONLINE`

---

## MCP consultation (when indexing)

`user-office-admin-mcp` → `office.get_agent_preflight`, `office.get_endpoint_profile`, `office.get_security_rules`
