# CG Master Graph Starter

## Canonical repository

- Repository: `Capglass5708/CG-MASTER-GRAPH`
- Visibility: private
- Default branch: `main`

## WSL2-first authority

CG Master Graph must begin and operate from the canonical WSL2 repository workspace.

The authoritative local development path is:

```text
/home/wesley/repos/CG-MASTER-GRAPH
```

Windows filesystem clones under `C:\`, `D:\`, `L:\`, or `Z:\` are not accepted as the primary working copy. L: and Z: may be used later for publication, cache, receipts, releases, or backups, but not as the source development workspace.

Clone and open it from WSL2:

```bash
cd /home/wesley/repos
git clone git@github.com:Capglass5708/CG-MASTER-GRAPH.git
cd CG-MASTER-GRAPH
git switch -c feat/master-graph-foundation-v1
cursor .
```

HTTPS fallback:

```bash
cd /home/wesley/repos
git clone https://github.com/Capglass5708/CG-MASTER-GRAPH.git
cd CG-MASTER-GRAPH
git switch -c feat/master-graph-foundation-v1
cursor .
```

Before implementation, verify the workspace:

```bash
pwd
git rev-parse --show-toplevel
uname -a
```

Required result:

```text
/home/wesley/repos/CG-MASTER-GRAPH
```

A startup or CI preflight should fail if the repository is being run from `/mnt/c`, `/mnt/d`, `/mnt/l`, `/mnt/z`, or another DrvFS path.

## Purpose

CG Master Graph is the canonical schema, registry, compiler, release, and publication control plane for relationships across Capital Glass applications, repositories, capabilities, authorities, infrastructure, projects, evidence, work packages, agents, and business workflows.

It does not replace application-owned databases, Git history, Synology project authority, the Intelligence Hub, or AI Cache Authority. It records relationships, provenance, lineage, state transitions, and impact paths across those systems.

## Ownership boundaries

### CG-MASTER-GRAPH owns

- Graph schemas
- Stable node and edge identifiers
- Repository participation contract
- Authority and provenance model
- Central entity and alias registries
- Deterministic graph compiler and validator
- Canonical graph release format
- Projection and publication contracts

### CapitalGlass-Cross-Agent owns

- Harvest orchestration
- Graph extraction from harvest packets
- Agent retrieval and preflight use
- Intelligence Hub and AI-cache publication coordination
- Cross-agent handoffs and graph-assisted reuse

### Participating repositories own

- A small local graph manifest
- Stable declarations about repository identity, applications, capabilities, dependencies, and authority boundaries
- Harvest and receipt artifacts that provide evidence for changing operational state

## Repository participation model

Every participating repository should eventually publish:

```text
.cg/master-graph.json
```

The manifest should remain small and structural. It declares what the repository is, what it implements, what it depends on, and which authority boundaries apply.

## Harvest-to-graph model

Harvests are expected to become the primary evidence feed into the graph.

```text
Chat / agent run / investigation
  -> harvest packet
  -> graph extraction packet
  -> schema validation
  -> authority and conflict checks
  -> deterministic graph compile
  -> canonical graph release
  -> L: Intelligence Hub
  -> Z: AI-Cache-Authority
  -> Supabase query projection
```

Each material harvest should eventually emit:

```text
graph-extraction.json
```

Recommended contract:

```text
packetKind: graph-extraction
schemaVersion: cg-master-graph-extraction-v1
```

A harvest proposes graph knowledge. It does not automatically declare company truth. The compiler promotes or holds each mutation based on provenance, source authority, verification state, and conflict rules.

## Initial graph spine

```text
Application
  -> Repository
  -> Capability
  -> Authority
  -> Deployment
  -> Machine
  -> Storage
  -> Evidence
```

Initial edge families include:

- `OWNS`
- `IMPLEMENTS`
- `DEPENDS_ON`
- `PRODUCES`
- `CONSUMES`
- `DEPLOYS`
- `RUNS_ON`
- `MOUNTED_AT`
- `STORED_IN`
- `AUTHORITY_FOR`
- `PROJECTS_FROM`
- `CACHED_FROM`
- `DERIVED_FROM`
- `VERIFIED_BY`
- `BLOCKED_BY`
- `SUPERSEDES`
- `AFFECTS`
- `RELATED_TO`
- `CURRENT_FOR`

Every accepted edge must carry provenance.

## Initial repository structure

```text
CG-MASTER-GRAPH/
  .github/workflows/
  docs/
  schemas/
  registry/
  graph/seeds/
  graph/compiled/
  graph/releases/
  scripts/
  package.json
  README.md
```

Initialize from WSL2:

```bash
cd /home/wesley/repos/CG-MASTER-GRAPH
npm init -y
mkdir -p docs schemas registry graph/seeds graph/compiled graph/releases scripts .github/workflows
```

Suggested first files:

```text
README.md
docs/CG-MASTER-GRAPH-CHARTER-v1.md
docs/AUTHORITY-MODEL-v1.md
docs/REPOSITORY-PARTICIPATION-v1.md
schemas/repository-manifest.v1.schema.json
schemas/graph-extraction.v1.schema.json
schemas/node.v1.schema.json
schemas/edge.v1.schema.json
schemas/provenance.v1.schema.json
registry/repositories.v1.json
registry/applications.v1.json
registry/authorities.v1.json
registry/aliases.v1.json
```

## Deterministic command surface

```bash
npm run graph:collect
npm run graph:validate
npm run graph:compile
npm run graph:publish
npm run graph:verify
```

Identical inputs must produce an identical release hash.

Participating repositories validate only their local contribution. They do not independently mutate the central Supabase graph projection.

## Publication authority flow

```text
WSL2 Git workspace
  -> CG Master Graph compiler
  -> canonical Git release and receipt
  -> L: Intelligence Hub retrieval/catalog authority
  -> Z: AI-Cache-Authority publication/cache authority
  -> Supabase query projection
```

Large graph databases, embeddings, raw chats, and rendered exports should not be committed to normal Git history. Git retains schemas, registries, small deterministic releases, hashes, receipts, and publication pointers.

## Initial work packages

### Foundation

```text
capital-glass-master-graph-foundation-v1
```

Target:

```text
UNVERIFIED -> CG_MASTER_GRAPH_FOUNDATION_VALIDATED
```

### Repository participation

```text
cg-master-graph-repository-participation-v1
```

Target:

```text
UNREGISTERED_ESTATE -> ALL_ACTIVE_REPOSITORIES_DISCOVERABLE
```

## Control principle

> Every repository declares itself. Every harvest proposes new knowledge. Every receipt proves state. Only the CG Master Graph compiler promotes the combined result.
