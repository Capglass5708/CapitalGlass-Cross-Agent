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
