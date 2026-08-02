# Cross-Agent Notes Seeding

Cross-Agent Notes Seeding turns selected coordination notes in **CapitalGlass-Cross-Agent** into fast, truthful, token-efficient Cursor context. The human-readable note and its Git commit remain canonical; the agent layer receives only compact projections with source pointers.

## What this is

| Layer | Role |
| --- | --- |
| **CapitalGlass-Cross-Agent** | Human source notes, seed manifests, README, INDEX — no implementation code |
| **CG-AppBuilder-MCP** | Seeding engine, validation, compilation, Z/L publication, cache integration, retrieval |
| **CG-Platform-Governance-MCP** | Authority, provenance, duplicate prevention, promotion compliance |
| **CG-Failure-Intelligence-MCP** | Canonical fast path for known failures and repair shortcuts |
| **Z:\Capital-Glass-Intelligence-Hub\AI-Cache-Authority** | Sole canonical AI-cache release authority |
| **L:\Capital-Glass-Intelligence-Hub** | Non-authoritative compact retrieval mirror |
| **Supabase** | IDs, hashes, pointers, links, freshness, telemetry — not duplicate note bodies |

## Eligible for seeding

A note may be seeded when it:

- Lives in a committed, pushed path under this repo
- Has a declared `section` (for example `Agent Fast Path`) suitable for compact extraction
- Maps to an approved classification and target route
- Does not duplicate an existing canonical authority (FI record, governance decision, Bible body)
- Passes secret, log, and token-budget gates

## Human source vs agent compact

- **Source note** — full markdown in `work-progress/`, `decisions/`, etc. Operators edit here.
- **Agent compact** — small derived JSON with pointers (`source.path`, `commitSha`, `contentHash`, FI shortcut IDs, remediation commands). Never a competing truth body.

Full note bodies are **never** copied into the agent layer, Supabase bodies, or cache objects.

## Classifications

| Classification | Destination |
| --- | --- |
| `known_failure` | Link to existing Failure Intelligence record + shortcut — never create duplicate repair records |
| `active_action` | Compact pointer for active-work / agent startup path |
| `reusable_knowledge` | Intelligence Hub compact retrieval |
| `authority_decision` | Governance registry + gate required before agent visibility (`cross-agent-notes:governance-check`) |
| `reference_only` | Human-readable only — never injected into Cursor context |

## Lifecycle

| State | Meaning |
| --- | --- |
| `candidate` | Manifest valid; not yet promoted to Z CURRENT |
| `promoted` | Compact published on Z; L mirror and Supabase metadata verified |
| `stale` | Source `contentHash` or `commitSha` no longer matches |
| `revoked` | Explicitly withdrawn; compacts must not be served |

## How to create a seed

1. Write or update the source note with a clear section heading (for example `## Agent Fast Path`).
2. Commit and push the note in **CapitalGlass-Cross-Agent**.
3. Add `agent-notes-seeding/seeds/<seed-id>.json` using `schema/cross-agent-note-seed.schema.json`.
4. Fill `source.commitSha` and `source.contentHash` (AppBuilder `cross-agent-notes:seed --dry-run` reports expected values).
5. Add metadata row to `INDEX.json` (metadata only — no note bodies).
6. Run validation and promotion from **CG-AppBuilder-MCP** (see below).

## Validate, promote, revoke, verify

From **CG-AppBuilder-MCP**:

```powershell
npm run cross-agent-notes:seed -- --seed=<seed-id> --dry-run
npm run cross-agent-notes:seed -- --seed=<seed-id> --apply
npm run cross-agent-notes:verify -- --seed=<seed-id>
npm run cross-agent-notes:index -- --check
npm run cross-agent-notes:governance-check -- --seed=<seed-id> --dry-run
```

For `authority_decision` seeds, run **governance-check** before `--apply`. Governance APPROVE is separate from L mirror (`mirror-l`) and Supabase pointer upsert (not yet live).

- **Dry-run** — schema, source provenance, classification routing, compact budget, FI/governance gates; no writes.
- **Apply** — publish compact to Z canonical release, mirror to L, write Supabase metadata pointers, update INDEX lifecycle.
- **Verify** — re-check source freshness, Z release hash, L mirror, Supabase pointer parity.
- **Index check** — INDEX.json rows match seed manifests and promotion receipts.

## Revocation

Set `lifecycle` to `revoked` in the seed manifest and INDEX, then run verify. AppBuilder invalidates cached compacts; agents must fall back to source note via Git, not stale compacts.

## Canonical truth

The source note at its Git commit is always canonical. Z is the only cache release authority. L and Supabase are retrieval/metadata layers. Host-local caches are replicas that sync only from verified Z releases.
