# `registry/agent-runtime/` — canonical MCP / agent-workstation index

This directory is the **logical authority** for the agent runtime estate: which MCPs exist,
which roles and workstations require them, their canonical IDs, transport and launcher
expectations, capability membership, and required/optional status.

It is a registry. It is **not** a control plane — nothing here probes, proves, repairs, or
dispatches. `CG-AppBuilder-MCP` realizes and proves this index.

## Direction of truth

```
CapitalGlass-Cross-Agent        (this directory — logical authority)
        │
        ▼
CG-AppBuilder-MCP               (harvest, preflight, live probe, conformance, receipts)
        │
        ▼
machine-local realization       (/etc/capital-glass/, ~/.capital-glass/, %ProgramData%\CapitalGlass\)
        │
        ▼
Intelligence Hub on L:          (published read-optimized copy — generated, never source)
        │
        ▼
~/.claude.json, ~/.cursor/mcp.json   (generated outputs — never authority)
```

The last line matters most. Those config files are **outputs**. Deriving the health
denominator from them — as the estate did until this index existed — means deriving truth
from generated state, the same error class as deriving health from a cached provider snapshot.

## Files

| File | Contents |
|---|---|
| `mcp-estate.v1.json` | One record per MCP: canonical id, transport, launcher expectation, required/optional, `healthClass`, canonical read-only probe, credential shape contract |
| `agent-runtime-profiles.v1.json` | Workstations and agent roles, and which MCPs they require |
| `capability-bindings.v1.json` | Capability → MCP membership |

## Health classes

| Class | Obligation |
|---|---|
| `OPERATIONAL` | Must reach `LIVE_VERIFIED` — a canonical read-only MCP call actually succeeded |
| `AUTHORIZATION_ONLY` | Must reach `AUTH_READY`. Never claims operational health |
| `NOT_GOVERNED` | Outside both denominators |

A structurally complete credential is **not** health. A grant can be complete and still point
at a revoked token, a wrong audience, insufficient scopes, or a dead provider — so
`AUTH_READY` never satisfies operational health.

Three verdicts are reported separately, so a green headline cannot conceal an unauthenticated
connector:

- `MCP_OPERATIONAL_HEALTH_PASS` — every `OPERATIONAL` surface is `LIVE_VERIFIED`
- `MCP_AUTHORIZATION_READINESS_PASS` — every `AUTHORIZATION_ONLY` surface is at least `AUTH_READY`
- `MCP_ESTATE_READY_PASS` — both of the above

## Classification changes are declared, never quiet

Reclassifying a surface downward legitimately shrinks the operational denominator, which
would turn a red gate green. That is the last obvious way to game the verdict, so it is
closed explicitly.

A downgrade (`OPERATIONAL` → anything weaker, or `AUTHORIZATION_ONLY` → `NOT_GOVERNED`)
requires a `classificationChange` block on the record:

```json
"classificationChange": {
  "previousClass": "OPERATIONAL",
  "newClass": "AUTHORIZATION_ONLY",
  "rationale": "why this surface no longer claims operational health",
  "changeId": "approved migration id",
  "receiptRef": "work-progress/agent-workstation-mcp-hub-index-v1/receipts/<id>.json",
  "declaredAt": "<iso8601>"
}
```

`run-agent-runtime-index-conformance.test.mjs` in `CG-AppBuilder-MCP` fails on an undeclared
downgrade. A downgrade also requires its own dedicated PR here — it must never ride along
inside an unrelated change.

## `reviewState` — seeded is not ratified

Records are seeded by
`CG-AppBuilder-MCP/scripts/agent-runtime/harvest-mcp-estate-seed-v1.mjs`, which reads
today's realized state. Harvesting reproduces today's drift, so **every seeded record is
marked `SEEDED_UNREVIEWED` and is not yet authority.** Ratification is a human review that
flips a record to `REVIEWED`.

Known conditions that must be resolved during ratification:

- an `OPERATIONAL` record must declare a `canonicalProbe`; several seeded records have none
- `requiredMcps` is empty on every profile record by design
- `capability-bindings.v1.json` is deliberately empty

## Secrets

Credential contracts carry key **names and expected shape only** — never values. The harvest
sets `secretValuesRead: false` and nothing in this directory may ever hold a secret.
