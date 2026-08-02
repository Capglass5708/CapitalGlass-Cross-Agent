# Capital Glass SDLC Command Desk

## Purpose

This section is the planning and mission-definition front door for governed AI execution across the Capital Glass suite.

Wesley and ChatGPT develop the human plan here. A compiler and trusted runner in the owning control-plane repositories convert that plan into a validated mission package, execute allowed phases, collect evidence, and submit closeout to Governance.

## Permanent boundary

> Cross-Agent requests, describes, approves, observes, and records work. It does not own application code, arbitrary shell execution, deployment logic, secrets, or protocol authority.

- `CapitalGlass-Cross-Agent`: plans, manifests, queue state, handoffs, status, evidence references.
- `CG-Platform-Governance-MCP`: schemas, lifecycle rules, evidence requirements, authorization, completion verdict.
- `CG-AppBuilder-MCP` or future `CG-SDLC-Runner`: plan compilation, command resolution, execution, locking, retries, receipt production.
- Owning application repositories: real implementation, tests, migrations, and deployment commands.
- Supabase: structured operational projection and event history.
- L: fast retrieval compacts and mission context packs.
- Z: durable releases, receipts, evidence, and shared authority copies.

## End-to-end flow

`IDEA -> PLAN_DRAFT -> PLAN_APPROVED -> MISSION_COMPILED -> PREFLIGHT -> IMPLEMENTATION -> TESTING -> REVIEW -> DEPLOYMENT -> LIVE_ACCEPTANCE -> GOVERNANCE_CLOSEOUT -> COMPLETE`

Failure and pause states include `BLOCKED`, `REROUTED`, `FAILED_RETRYABLE`, `FAILED_PERMANENT`, and `OPERATOR_ACTION_REQUIRED`.

## What belongs here

- Human-readable plans
- Machine-readable mission manifests
- Acceptance and evidence contracts
- Registered command-profile references
- Approval records
- Execution status projections
- Handoffs and recovery instructions
- Links and hashes for receipts in owning repositories, L:, and Z:

## What does not belong here

- PowerShell, Bash, Node, deployment, or migration implementations
- Arbitrary command strings embedded in plans
- Secrets or credentials
- App source code or copied test suites
- Database implementation or MCP server code
- Large raw logs or copied Bible content

## Safety rule

Mission files reference allowlisted command IDs, never raw shell commands.

Example:

```yaml
commandProfile: proposal-generator.verify-rollup
```

The trusted runner resolves that ID to an exact repository, working directory, command, timeout, mutation class, approval requirement, and receipt contract.

## Intelligence inputs

Every material mission should compile context from:

1. Relevant chat distillations and operator truth
2. Application Bible sections and authority hashes
3. Active ledger state and related project files
4. Prior closeouts and Failure Intelligence
5. L: retrieval indexes and compact context
6. Z: durable evidence, releases, and Governance receipts
7. Live repository, PR, CI, database, and deployment state when required

Execution must not rely on chat memory alone.

## Initial rollout

- Phase 0: schemas, templates, lifecycle, storage authority, example mission
- Phase 1: Governance validation
- Phase 2: AppBuilder read-only plan compiler and dry-run planner
- Phase 3: controlled single-repository execution pilot
- Phase 4: multi-repo execution, deployment gates, Platform Health, and Supabase projection

Work package: `cross-agent-sdlc-command-desk-v1`
