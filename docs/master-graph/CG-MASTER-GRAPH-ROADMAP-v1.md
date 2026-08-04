# CG Master Graph Roadmap v1

Roadmap ID: `CG-MASTER-GRAPH-ROADMAP-v1`

Status: Draft foundation

Owner: `CapitalGlass-Cross-Agent`

## North star

Every meaningful Capital Glass endeavor, artifact, system, document, image, website, proposal, recording, dataset, repository, extraction, decision, and outcome should eventually be:

- Objectively discoverable
- Documented
- Connected
- Versioned
- Explainable
- Traceable to authoritative evidence

The Master Graph connects these things without replacing the systems that own the underlying content.

```text
Enterprise Knowledge Sources
            ->
Synology Knowledge Intake
            ->
Data-Extraction
       /             \
Repository EDFs   Cross-Agent Harvests
       \             /
              CG-EDF
                ->
        CG Master Graph
                ->
       Intelligence Hub
                ->
        Platform Health
```

## Authority boundaries

### CG-MASTER-GRAPH

Owns:

- Graph constitution
- Ontology and glossary
- Node and relationship registries
- Canonical IDs and aliases
- Contribution schemas
- Provenance and source-anchor contracts
- Identity resolution
- Conflict and supersession rules
- Deterministic compiler
- Canonical graph releases
- Query and projection contracts

### CapitalGlass-Cross-Agent

Owns:

- Planning and orchestration
- CG-EDF enterprise standards
- Harvest contributions
- Decisions, receipts, blockers, and lifecycle intelligence
- Discovery-pack coordination
- Review routing
- Publication coordination
- Graph-assisted agent preflight

### Data-Extraction

Owns:

- Synology intake processing
- File watchers and durable cursors
- Stabilization, hashing, and deduplication
- OCR and transcription
- Knowledge Package assembly
- Entity and relationship observations
- Source anchoring
- Confidence and uncertainty
- Identity candidates
- Graph-contribution packaging
- Extractor improvement corpus

### Synology

Owns:

- Original source artifacts
- Incoming audio and documents
- Processed Knowledge Packages
- Durable evidence preservation

## Stage 0 - Complete the planning package

Target:

```text
ARCHITECTURAL_DIRECTION_DEFINED
  -> IMPLEMENTATION_READY_PLANNING_PACKAGE
```

Complete these Cross-Agent documents:

```text
docs/master-graph/
  README.md
  CG-MASTER-GRAPH-STARTER.md
  CG-MASTER-GRAPH-ROADMAP-v1.md
  CG-MASTER-GRAPH-CONSTITUTION-v1.md
  CG-MASTER-GRAPH-DECISIONS-v1.md
  CG-MASTER-GRAPH-MVP-SCOPE-v1.md
  CG-MASTER-GRAPH-GLOSSARY-v1.md
  CG-MASTER-GRAPH-STATE-MODEL-v1.md
  CG-MASTER-GRAPH-AUTHORITY-MATRIX-v1.md
  CG-MASTER-GRAPH-SOURCE-PRIORITY-v1.md
  CG-MASTER-GRAPH-RISKS-AND-NON-GOALS-v1.md
  CG-HARVEST-TO-GRAPH-CONTRACT-v1.md
  CG-MASTER-GRAPH-ENTERPRISE-KNOWLEDGE-INTAKE-PLAN-v1.md
  CG-MASTER-GRAPH-FOUNDATION-CURSOR-OPENER-v1.md
```

Create the CG-EDF planning area:

```text
docs/enterprise-discovery/
  README.md
  CG-EDF-CONSTITUTION-v1.md
  CG-EDF-DOCUMENTATION-STANDARD-v1.md
  CG-EDF-QUESTION-LIBRARY-v1.md
  CG-EDF-DISCOVERY-PACK-STANDARD-v1.md
  CG-EDF-EVIDENCE-STANDARD-v1.md
  CG-EDF-COVERAGE-MODEL-v1.md
  CG-EDF-RECEIPT-STANDARD-v1.md
  CG-EDF-REGISTRY-v1.md
  CG-EDF-ROADMAP-v1.md
  packs/
```

## Stage 1 - Transfer canonical graph documentation

Target:

```text
PLANNING_HELD_IN_CROSS_AGENT
  -> CANONICAL_GRAPH_DOCUMENTATION_ESTABLISHED
```

Not everything should move.

Each document should be classified as:

```text
MOVE_CANONICAL
COPY_PINNED
REMAIN_CROSS_AGENT
SPLIT
```

Graph-owned documents move into `CG-MASTER-GRAPH`.

Cross-Agent-owned governance, CG-EDF, and harvest orchestration stay in Cross-Agent.

Create transfer evidence:

```text
artifacts/agent-runs/cg-master-graph-planning-transfer-v1/
  planning-transfer-manifest-v1.json
  planning-transfer-receipt-v1.json
  document-authority-map-v1.json
```

## Stage 2 - WSL2-first repository foundation

Work package:

```text
capital-glass-master-graph-foundation-v1
```

Target:

```text
CG_MASTER_GRAPH_CREATED
  -> CG_MASTER_GRAPH_FOUNDATION_VALIDATED
```

Canonical path:

```text
/home/wesley/repos/CG-MASTER-GRAPH
```

Foundation branch:

```text
feat/master-graph-foundation-v1
```

Initial structure:

```text
.cg/master-graph.json
.github/workflows/
docs/
schemas/
registry/
graph/seeds/
graph/compiled/
graph/releases/
scripts/
tests/
package.json
README.md
```

Required proof:

- WSL2 ext4 authority
- Self-registration
- Deterministic compile
- Stable content hash
- Duplicate-ID rejection
- Orphan-edge rejection
- Passing CI

## Stage 3 - Constitution, ontology, and registries

Target:

```text
GRAPH_CONTAINER_VALIDATED
  -> CANONICAL_ENTERPRISE_LANGUAGE_ESTABLISHED
```

Core concepts:

```text
Endeavor
Artifact
KnowledgePackage
Entity
Relationship
Contribution
Observation
Claim
Fact
Evidence
Authority
SourceAnchor
ExtractionRun
Harvest
Decision
Receipt
```

Create canonical registries for:

- Entity types
- Relationship types
- Aliases
- Authorities
- Lifecycle states
- Operational states
- Verification states
- Source types
- Artifact types
- Knowledge Package types

Each registry entry should include definition, stable ID, aliases, allowed relationships, version, and supersession behavior.

## Stage 4 - Shared contribution contract

Milestone:

```text
SHARED_CONTRIBUTION_CONTRACT_VALIDATED
```

Canonical schemas:

```text
contribution-envelope.v1.schema.json
entity-observation.v1.schema.json
relationship-observation.v1.schema.json
source-anchor.v1.schema.json
identity-candidate.v1.schema.json
knowledge-package.v1.schema.json
processing-receipt.v1.schema.json
discovery-receipt.v1.schema.json
```

Every contribution must identify:

- Producer
- Producer version
- Source artifact
- Source authority
- Exact source location
- Observed versus inferred classification
- Confidence
- Identity state
- Evidence
- Temporal validity
- Warnings
- Receipt

Promotion outcomes:

```text
ACCEPT
MERGE
HOLD_FOR_VERIFICATION
REJECT
SUPERSEDE
```

## Stage 5 - Data-Extraction investigation and upgrade

Work package:

```text
data-extraction-master-graph-contributor-v1
```

Target:

```text
CURRENT_EXTRACTION_CAPABILITY_UNVERIFIED
  -> PROVENANCE_COMPLETE_GRAPH_CONTRIBUTOR
```

CG-EDF should objectively determine:

- Which extractors exist
- Supported formats
- Current output contracts
- Current consumers
- Source-anchor support
- Entity extraction capability
- Relationship extraction capability
- Confidence handling
- Inference handling
- Determinism
- Corpus quality
- Backward-compatibility risks
- Missing capabilities

Likely additions:

```text
contracts/master-graph/
src/graph-contribution/
tests/graph-contribution/
corpus/golden/
corpus/regression/
corpus/failures/
corpus/ambiguous/
corpus/reviewed/
```

## Stage 6 - Synology Knowledge Intake foundation

Work package:

```text
capital-glass-knowledge-intake-data-extraction-authority-v1
```

Target:

```text
UNMANAGED_FILE_DROP
  -> GOVERNED_KNOWLEDGE_INTAKE_FOUNDATION
```

### L: source and archive folders

```text
L:\Capital-Glass-Knowledge-Intake\
  Audio\
    Incoming\
    Processing\
    Review\
    Processed\
    Failed\
  Documents\
    Incoming\
    Processing\
    Review\
    Processed\
    Failed\
  Packages\
    Incoming\
    Processing\
    Review\
    Processed\
    Failed\
  Manifests\
  Receipts\
  Quarantine\
  Registry\
```

### Z: derived intelligence folders

```text
Z:\Capital-Glass-Knowledge-Intake\
  Transcripts\
  Extraction-Packages\
  Graph-Contributions\
  AI-Cache\
  Publication-Receipts\
  Superseded\
  Index\
```

Users place files only into `Incoming`. Data-Extraction controls all later movement.

## Stage 7 - Continuous L:/Z: observation

Work package:

```text
capital-glass-lz-continuous-graph-observation-v1
```

Target:

```text
MANUAL_DOCUMENT_DISCOVERY
  -> CONTINUOUS_INCREMENTAL_GRAPH_OBSERVATION
```

Use:

- Filesystem events
- Incremental reconciliation
- Periodic metadata inventory
- Content reprocessing only when fingerprints change
- Durable cursors
- Exclusion registry
- Sensitivity and retention policies

The system may have full read access to `/mnt/l` and `/mnt/z`, but only registered roots receive content extraction.

## Stage 8 - Audio and document Knowledge Packages

Prove that a document and corresponding audio can remain connected.

Example:

```text
KP-20260804-001/
  original/
    proposal.pdf
    estimator-walkthrough.m4a
    pricing.xlsx
  transcript/
  extracted/
  graph/
  receipts/
  manifest.json
```

Required relationships:

```text
AudioRecording -> EXPLAINS -> Proposal
Transcript -> DERIVED_FROM -> AudioRecording
KnowledgePackage -> CONTAINS -> Proposal
KnowledgePackage -> CONTAINS -> AudioRecording
```

Nothing moves to `Processed` until all required artifacts and receipts validate.

## Stage 9 - CG-EDF foundation

Target:

```text
AD_HOC_DISCOVERY
  -> GOVERNED_ENTERPRISE_DISCOVERY_FRAMEWORK
```

CG-EDF becomes the objective discovery and documentation authority.

It owns:

- Question libraries
- Discovery packs
- Evidence classifications
- Discovery receipts
- Coverage metrics
- Documentation generation standards
- Unknowns and discovery backlogs

Required evidence classifications:

```text
VERIFIED
OBSERVED
DERIVED
INFERRED
UNKNOWN
NOT_APPLICABLE
```

CG-EDF does not make subjective architectural decisions. It supplies the objective evidence used to make them.

## Stage 10 - Repository EDF rollout

Each repository eventually receives:

```text
docs/edf/
  README.md
  discovery-packs/
  documentation/
  inventory/
  coverage/
  receipts/
  roadmap/
  registry/
  generated/
```

And:

```text
.cg/edf.json
```

Maturity levels:

```text
Level 0 - None
Level 1 - Registered
Level 2 - Documented
Level 3 - Harvest-aware
Level 4 - Extraction-aware
Level 5 - Self-maintaining
```

Seed Wave 1:

- CG-MASTER-GRAPH
- CapitalGlass-Cross-Agent
- Data-Extraction
- CG-AppBuilder-MCP
- CapitalGlass-BidComposer
- Proposal Generator
- Computer Estimator
- Document Center
- Visual Asset Engine
- Platform Health
- Failure Intelligence

## Stage 11 - Seed the graph

Start with existing evidence, not a blind estate scan.

Primary seed sources:

- Cross-Agent harvests
- Repository manifests
- Application bibles
- Git commits and PRs
- Receipts and work packages
- Intelligence Hub indexes
- Data-Extraction corpora
- Synology Knowledge Packages
- Platform Health state

Recommended first joint pilot:

```text
Rosewood project
  plan set
  schedule extraction
  operator audio/transcript
  proposal or estimate
  project evidence
  Cross-Agent harvest
  receipts
```

## Stage 12 - Deterministic publication

Publication path:

```text
Git graph release
  -> L: Intelligence Hub
  -> Z: AI-Cache-Authority
  -> Supabase projection
```

Required:

- Release ID
- Schema version
- Input manifest
- Deterministic hash
- Parity receipt
- Rollback pointer
- Superseded release pointer
- Bounded query support

## Stage 13 - Platform Health integration

Platform Health should display:

- Graph freshness
- Graph release parity
- Repository EDF maturity
- Discovery coverage
- Documentation coverage
- Evidence coverage
- Identity-resolution backlog
- Unknown count
- Intake queue
- Review queue
- Failed extraction count
- Stale documentation
- Unharvested completed work
- Graph contributions held or rejected

## Stage 14 - Continuous improvement

Every correction becomes evidence for improvement.

```text
Failure or correction
  -> Failure Intelligence
  -> regression fixture
  -> extractor or schema improvement
  -> tests
  -> versioned release
  -> monitored rollout
```

The system should grow through governed evidence, not silent self-modification.

## Major milestones

```text
M0  IMPLEMENTATION_READY_PLANNING_PACKAGE
M1  CANONICAL_GRAPH_DOCUMENTATION_ESTABLISHED
M2  CG_MASTER_GRAPH_FOUNDATION_VALIDATED
M3  CANONICAL_ENTERPRISE_LANGUAGE_ESTABLISHED
M4  SHARED_CONTRIBUTION_CONTRACT_VALIDATED
M5  PROVENANCE_COMPLETE_GRAPH_CONTRIBUTOR
M6  GOVERNED_KNOWLEDGE_INTAKE_FOUNDATION
M7  CONTINUOUS_INCREMENTAL_GRAPH_OBSERVATION
M8  KNOWLEDGE_PACKAGE_PIPELINE_VALIDATED
M9  GOVERNED_ENTERPRISE_DISCOVERY_FRAMEWORK
M10 REPOSITORY_EDF_SEED_WAVE_COMPLETE
M11 FIRST_ENTERPRISE_SUBGRAPH_VALIDATED
M12 DETERMINISTIC_GRAPH_PUBLICATION_PASS
M13 PLATFORM_HEALTH_GRAPH_VISIBILITY_PASS
M14 CONTINUOUS_ENTERPRISE_KNOWLEDGE_OPERATIONAL
```

## Immediate next move

The roadmap should first be held in Cross-Agent. Then complete Stage 0, create the transfer manifest, clone `CG-MASTER-GRAPH` into WSL2, create `feat/master-graph-foundation-v1`, and transfer only the documents that properly belong to the graph repository.

This keeps Cross-Agent as the enterprise planning and discovery authority while allowing `CG-MASTER-GRAPH` to become the canonical implementation and graph-contract authority.
