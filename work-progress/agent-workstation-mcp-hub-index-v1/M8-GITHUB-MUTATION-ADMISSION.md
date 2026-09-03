# M8 GitHub mutation admission

> **Superseded in scope by** [`PLATFORM-INTEGRATION-ARCHITECTURE.md`](./PLATFORM-INTEGRATION-ARCHITECTURE.md).  
> M8 is one layer in the existing AppBuilder spine — not a standalone Git helper.

## Quick reference

- **Front door:** `execution-context:resolve` — not `agent_runtime_resolve()`
- **Repo lease:** `lane0:admit` — per target repo
- **Remote mutation:** M8 GitHub Plane — raw `git push` is unauthorized transport
- **Milestone:** `sdlc:milestone:status -- --milestone CG_AGENT_RUNTIME_DETERMINISM_V1`

See `registry/agent-runtime/authority/github-mutation-policy.v1.json` for operation classification and capability mapping.

