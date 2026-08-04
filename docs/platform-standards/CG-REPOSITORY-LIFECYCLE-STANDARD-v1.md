# Capital Glass Repository Lifecycle Standard v1

Standard ID: `CG-REPOSITORY-LIFECYCLE-STANDARD-v1`

Owner: `CapitalGlass-Cross-Agent`

Status: Draft foundation

## Purpose

This standard defines the governed lifecycle for every Capital Glass repository from creation through retirement.

It unifies repository creation, development, verification, harvesting, publication, operations, and archival under one consistent control model.

## Core lifecycle

```text
CREATE
  -> DEVELOP
  -> VERIFY
  -> HARVEST
  -> PUBLISH
  -> OPERATE
  -> RETIRE
```

A repository may move backward to an earlier phase when defects, drift, authority conflicts, or failed acceptance require rework.

## Platform-wide principles

1. WSL2 ext4 is the canonical local development authority.
2. GitHub is the remote source and collaboration authority.
3. Every active repository participates in the CG Master Graph.
4. Every material mission produces evidence and a closeout verdict.
5. Claims are not promoted to truth without provenance and verification.
6. Generated outputs must be deterministic where material.
7. Production or publication state must never be inferred from code completion alone.
8. Retirement preserves history, lineage, ownership, and replacement paths.

## Protocol family

### 1. Repository Creation Protocol

Canonical protocol:

```text
CG-REPOSITORY-CREATION-PROTOCOL-v1
```

Purpose:

- Create the GitHub repository
- Clone it into `/home/wesley/repos`
- Confirm WSL2 ext4 authority
- Establish the repository foundation
- Register the repository with CG Master Graph
- Add governance and validation
- Produce a repository creation receipt

Entry state:

```text
REPOSITORY_NOT_CREATED
```

Exit state:

```text
REPOSITORY_FOUNDATION_VALIDATED
```

### 2. Repository Development Protocol

Proposed protocol ID:

```text
CG-REPOSITORY-DEVELOPMENT-PROTOCOL-v1
```

Purpose:

- Define work packages before material changes
- Use bounded feature branches
- Resolve authority and ownership before implementation
- Enforce repository and cross-repository scope boundaries
- Record decisions, assumptions, and deferred work
- Prevent duplicate work through Intelligence Hub and Master Graph preflight

Minimum development preflight:

- WSL2 authority confirmed
- Working tree and branch reported
- Current repository authority loaded
- Existing related work searched
- Active blockers checked
- Required repositories and dependencies identified
- Work package and acceptance criteria declared

Exit state:

```text
IMPLEMENTATION_COMPLETE_UNVERIFIED
```

### 3. Testing and Verification Protocol

Proposed protocol ID:

```text
CG-TESTING-VERIFICATION-PROTOCOL-v1
```

Purpose:

- Separate code completion from verified behavior
- Define local, integration, staging, production, and operator gates
- Require receipts for all material acceptance claims
- Detect regressions, drift, and unsupported assumptions

Verification layers:

```text
STATIC_VALIDATED
LOCAL_RUNTIME_VALIDATED
INTEGRATION_VALIDATED
STAGING_VALIDATED
PRODUCTION_VALIDATED
OPERATOR_ACCEPTED
```

A repository or capability must not skip layers without a documented exception.

### 4. Harvest and Intelligence Protocol

Proposed protocol ID:

```text
CG-HARVEST-INTELLIGENCE-PROTOCOL-v1
```

Purpose:

- Convert completed work into reusable intelligence
- Capture decisions, evidence, failures, blockers, and relationships
- Emit graph extraction packets
- Prevent future agents from repeating completed investigation
- Publish bounded, evidence-backed current-state knowledge

Required outputs for material work:

- Human-readable harvest
- Machine-readable closeout receipt
- Graph extraction packet
- Failure Intelligence packet when applicable
- Supersession links when prior claims are outdated

Exit state:

```text
INTELLIGENCE_HARVESTED
```

### 5. Publication and Deployment Protocol

Proposed protocol ID:

```text
CG-PUBLICATION-DEPLOYMENT-PROTOCOL-v1
```

Purpose:

- Promote validated code, data, graph releases, documents, or applications
- Preserve release identity and provenance
- Verify target-environment behavior
- Publish parity receipts across authoritative surfaces
- Provide deterministic rollback and supersession paths

Publication path where applicable:

```text
Git authority
  -> deployment or release artifact
  -> L: retrieval/catalog publication
  -> Z: AI-cache/publication authority
  -> Supabase or operational projection
```

Exit state examples:

```text
PUBLICATION_PASS
DEPLOYMENT_PASS
PRODUCTION_PROMOTION_PASS
```

### 6. Operational Monitoring Protocol

Proposed protocol ID:

```text
CG-OPERATIONAL-MONITORING-PROTOCOL-v1
```

Purpose:

- Monitor live availability, freshness, drift, security, and operational health
- Surface repository and capability state through Platform Health
- Detect stale graph, index, deployment, runner, storage, or authority state
- Create bounded remediation work packages
- Feed operational failures into Failure Intelligence

Operational states:

```text
OPERATIONAL
DEGRADED
BLOCKED
STALE
DRIFTED
OFFLINE
UNKNOWN
```

Operational claims require current evidence and expiration rules.

### 7. Repository Retirement and Archival Protocol

Proposed protocol ID:

```text
CG-REPOSITORY-RETIREMENT-ARCHIVAL-PROTOCOL-v1
```

Purpose:

- Retire repositories without losing lineage or operational knowledge
- Identify replacements, consumers, and migration obligations
- Remove active credentials, deployments, runners, and automation safely
- Preserve final releases, harvests, receipts, and graph relationships
- Mark the repository as historical rather than deleting its existence

Required retirement checks:

- No active production dependency remains unresolved
- Replacement or terminal disposition is recorded
- Secrets and deployment credentials are revoked
- Scheduled workflows and runners are disabled
- Final harvest and retirement receipt are published
- CG Master Graph lifecycle changes to `archived` or `retired`
- Intelligence Hub and AI cache point to the final valid state

Exit state:

```text
REPOSITORY_RETIRED_WITH_LINEAGE_PRESERVED
```

## Lifecycle state model

Suggested canonical states:

```text
planned
created
foundation_validated
active_development
implementation_complete_unverified
verification_in_progress
validated
published
operational
degraded
superseded
retirement_planned
retired
archived
```

Every repository should expose its current lifecycle state in:

```text
.cg/master-graph.json
```

Operational state and lifecycle state must remain separate. For example, a repository can be `active_development` while its production deployment is `operational`.

## Required evidence chain

Every material lifecycle transition should identify:

- Repository graph ID
- Work package ID
- Source branch
- Commit SHA
- Actor or agent
- Timestamp
- Previous state
- New state
- Acceptance criteria
- Validation commands
- Evidence paths
- Exceptions
- Superseded claims
- Publication or deployment references

## Cross-Agent responsibilities

CapitalGlass-Cross-Agent is responsible for:

- Owning this lifecycle standard and protocol registry
- Coordinating harvest and closeout contracts
- Tracking repository lifecycle transitions
- Publishing relationship and state updates to CG Master Graph
- Supporting agent preflight and duplicate-work prevention
- Routing failures to Failure Intelligence
- Producing estate-wide lifecycle status for Platform Health

Cross-Agent does not replace the implementation authority of each repository.

## CG Master Graph responsibilities

CG Master Graph should record:

- Repository identity and lifecycle state
- Applications and capabilities implemented
- Dependencies and consumers
- Authority boundaries
- Deployments and infrastructure relationships
- Evidence supporting state transitions
- Replacement and supersession relationships
- Retirement lineage

The graph must preserve historical transitions rather than overwriting them destructively.

## Platform Health responsibilities

Platform Health should eventually display:

- Repositories by lifecycle phase
- Repositories missing creation receipts
- Repositories without valid graph manifests
- Work marked complete but not harvested
- Validated work not published
- Published systems without current operational evidence
- Degraded or drifted repositories
- Retirement candidates and unresolved consumers

## Protocol implementation order

Recommended sequence:

1. Repository Creation Protocol
2. Repository Development Protocol
3. Testing and Verification Protocol
4. Harvest and Intelligence Protocol
5. Publication and Deployment Protocol
6. Operational Monitoring Protocol
7. Retirement and Archival Protocol

The creation protocol and CG Master Graph dogfood run should establish the reusable contract patterns for the remaining protocols.

## Initial program work package

```text
capital-glass-repository-lifecycle-standard-v1
```

Target:

```text
FRAGMENTED_REPOSITORY_PRACTICES
  -> GOVERNED_END_TO_END_REPOSITORY_LIFECYCLE
```

Initial acceptance:

- This umbrella lifecycle standard exists
- The Repository Creation Protocol is linked as the first implemented protocol
- Stable IDs exist for the remaining six protocols
- Lifecycle states are defined
- Evidence requirements are defined
- Cross-Agent and CG Master Graph responsibilities are separated
- `CG-MASTER-GRAPH` is designated as the first creation-protocol dogfood repository
- Follow-on implementation work packages can be created without redefining the overall lifecycle

## Control principle

> A Capital Glass repository is governed from the moment it is proposed until the moment it is retired, and every material transition must be supported by evidence, authority, and preserved lineage.
