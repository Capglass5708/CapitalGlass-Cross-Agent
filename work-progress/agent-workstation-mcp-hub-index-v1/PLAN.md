# agent-workstation-mcp-hub-index-v1

## Why

The estate reported `MCP_100_PERCENT_HEALTHY` at 12/12 while its own receipt simultaneously
recorded `integrationsOverall: red` and `doctorVerdict: FAIL`. An independent JSON-RPC probe,
run twice, disagreed with the receipt: `github` listed 26 tools but returned **401 Bad
credentials** on a real call, and both supabase connectors were unauthenticated.

Two structural causes, not incidental bugs:

1. **Half the denominator was never measured.** `CG-AppBuilder-MCP/scripts/lib/mcp-health/probe-runner.mjs`
   gives 6 runtime MCPs a genuine stdio handshake but attests 6 connectors from a cached
   snapshot — `github: (cycle) => cycle.integrations?.github?.ok`. Nothing ever spoke MCP to
   the second group, so `falseGreenChecks` stayed empty while a false green sat in the receipt.
2. **The denominator was derived from generated state.** It came from `~/.cursor/mcp.json`,
   a runtime *output*. Truth cannot be derived from an artifact the system itself emits.

A third defect made the first one concrete: `mergeIntegrationEnv` layers
`~/.cursor/integrations.env` on top of `process.env`, so a stale placeholder in that file
silently overrides the good token Doppler injects via `doppler run`. Proven experimentally —
a 40-char value supplied through `process.env` lost to a 7-char file placeholder.

## What this work package establishes

`registry/agent-runtime/` as the canonical logical index, with AppBuilder realizing and
proving it. Cross-Agent owns the registry only and does not become a second control plane.

## Sequence

| # | Change | Repo | Court |
|---|---|---|---|
| 0 | Stand up `registry/agent-runtime/` | CapitalGlass-Cross-Agent | `4.0-L3` (cross-repo) |
| 3 | Credential + binary preconditions | CG-AppBuilder-MCP | L1/L2 |
| 1 | Probe connector MCPs for real | CG-AppBuilder-MCP | L1/L2 |
| 2 | Generated mission attestation | CG-AppBuilder-MCP | L1/L2 |
| 4 | OAuth grant completeness | CG-AppBuilder-MCP | L1/L2 |

Authority → preconditions → live measurement → generated attestation → OAuth classification.
Change 3 lands before Change 1 so the first red is a true red rather than noise.

## Expected consequence

**This turns the estate red before it turns it green, and that is success.** Once the six
unmeasured rows are actually measured, `github` fails until `integrations.env` is genuinely
synced and the supabase connectors report `AUTH_PENDING`. Because `mcp:doctor:gate` sits in
both closeout gates, PR #536 is blocked harder until those credentials are really fixed.

## Status

Change 0 seeded. Every record is `SEEDED_UNREVIEWED` and therefore not yet authority —
ratification is a human review, because accepting a harvest unreviewed would elevate today's
drift into tomorrow's authority.

Open conditions recorded at seed time:

- registry drift observed during this work package: `~/.claude.json` holds 27 servers against
  Cursor's 18, with `DRIFT: 10` (9 `MISSING_IN_CURSOR`, 1 `LAUNCH_DIFFERS` on `sharepoint`).
  Config-vs-config parity can report the disagreement but cannot say which side is correct —
  which is precisely the gap this index closes
- several `OPERATIONAL` records carry no `canonicalProbe` and cannot be ratified until they do
- `capability-bindings.v1.json` is intentionally empty
