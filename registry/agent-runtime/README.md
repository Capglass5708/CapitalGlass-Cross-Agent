# Agent runtime registry — logical authority only

Cross-Agent owns **identity and contracts** for Capital Glass agent workstations. Physical machine values live in Office Admin; evaluation and admission live in **CG-AppBuilder-MCP**.

## This is NOT the control plane

The AI-wide execution spine already exists in AppBuilder:

| Layer | Location |
| --- | --- |
| Agent-neutral kernel | `packages/agent-protocol-kernel/` |
| Worldview / authority DAG | `scripts/worldview/` + `execution-context:resolve` |
| Repo/worktree admission | `lane0:admit` |
| GitHub mutation | M8 Feature + GitHub Plane |
| Milestone derivation | `sdlc:milestone:status` |

This registry **feeds** that spine — especially the proposed `agentRuntime` worldview lane.

See `work-progress/agent-workstation-mcp-hub-index-v1/PLATFORM-INTEGRATION-ARCHITECTURE.md`.

## Integration contract

`authority/platform-integration.v1.json`

## Compile (Hub failover mirror)

```bash
npm run index:compile-agent-runtime
npm run index:determinism-gate
```

Hub publication: WESLEYDESK GHA only.

## Work package

`agent-workstation-mcp-hub-index-v1`

## Estate index records (migrated into the nested manifests)

`authority/mcps/manifest.v1.json` carries, alongside the authority object's own `servers[]`, the
estate index that the AppBuilder provers read: `records[]` (one per MCP: canonical id,
transport, launcher expectation, required/optional, `healthClass`, canonical read-only probe,
credential shape contract), `seededFrom`, `secretValuesRead: false` and `estateIndex.counts`.
`authority/machines/manifest.v1.json` carries `workstations[]` and `agentRoles[]` alongside
`authorizedRoles[]`.

Those keys are **generated, never hand-edited**, from the migration source under
`work-progress/agent-workstation-mcp-hub-index-v1/migration-source/` by CG-AppBuilder-MCP:

```bash
npm run agent-runtime:materialize-authority -- --cross-agent-root <this checkout>
npm run agent-runtime:materialize-authority:check -- --cross-agent-root <this checkout>   # drift gate
```

The generator preserves every authority key verbatim, reads no wall clock
(`provenance.generatedAt` is the AppBuilder source commit's committer date) and is
byte-identical on regeneration. Every record stays `SEEDED_UNREVIEWED` until a human review
ratifies it; materializing is not ratification. Prove with
`npm run agent-runtime:conformance` and `npm run agent-runtime:preconditions`
(`CG_CROSS_AGENT_ROOT` pointing here).
