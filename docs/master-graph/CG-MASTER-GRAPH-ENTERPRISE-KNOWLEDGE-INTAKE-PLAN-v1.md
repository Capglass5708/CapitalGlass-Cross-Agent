# CG Master Graph Enterprise Knowledge Intake Plan v1

Plan ID: `CG-MASTER-GRAPH-ENTERPRISE-KNOWLEDGE-INTAKE-PLAN-v1`

Status: Draft foundation

Owner: `CapitalGlass-Cross-Agent`

Primary implementation repositories:

- `Capglass5708/CG-MASTER-GRAPH`
- `Capglass5708/Data-Extraction`
- `Capglass5708/CapitalGlass-Cross-Agent`

## North star

The CG Master Graph is the enterprise relationship and provenance layer for every Capital Glass endeavor.

It must connect people, customers, projects, websites, images, proposals, documents, software, repositories, RAG systems, extracted data, automated estimating, infrastructure, decisions, evidence, work packages, harvests, and outcomes without replacing the authoritative systems that own their underlying content.

The graph must eventually cover everything Capital Glass intentionally creates, operates, investigates, delivers, maintains, or learns from.

## Foundational concepts

### Endeavor

An `Endeavor` is anything Capital Glass intentionally creates, operates, investigates, delivers, or maintains.

Examples:

- Customer project
- Website
- Proposal
- Software application
- Repository
- Visual campaign
- Data extraction pipeline
- RAG corpus
- Estimating workflow
- Research investigation
- Internal standard
- Deployment
- Vendor integration

Each endeavor may connect to its purpose, owner, inputs, outputs, dependencies, evidence, decisions, source systems, files, people, customers, repositories, deployments, versions, lifecycle, and operational state.

### Artifact

An `Artifact` is a durable output or source object such as:

- PDF
- Image
- Proposal
- Website build
- Dataset
- Code release
- RAG index
- Extracted schedule
- Graph release
- Receipt
- Video
- Transcript
- Audio recording

The graph stores the identity, relationships, provenance, state, and authority pointers for an artifact. The original bytes remain in their proper storage authority.

### Knowledge Package

A `KnowledgePackage` is the atomic unit of enterprise knowledge intake.

A package may contain one file or many related artifacts, such as:

- Proposal PDF
- Estimator audio walkthrough
- Pricing spreadsheet
- Reference images
- Transcript
- Extracted observations
- Graph contribution
- Processing receipts

Knowledge packages preserve context between related source artifacts and derived outputs.

## Enterprise graph domains

The long-term graph should cover these domains:

1. Business operations
2. Products and materials
3. Documents and knowledge
4. Images and visual assets
5. Software, repositories, websites, and services
6. Data, RAG, extraction, automation, and estimating
7. Infrastructure, machines, storage, runners, and deployments
8. Governance, decisions, receipts, harvests, failures, and evidence

The initial implementation may be narrow, but the canonical model must not prevent future expansion into the full company graph.

## Primary graph contribution lanes

The graph grows primarily through two complementary contribution systems.

### Cross-Agent harvest lane

Cross-Agent harvests capture:

- Work performed
- Decisions and rationale
- Repositories and applications involved
- Validation evidence
- Blockers and failures
- Operational state changes
- Superseded knowledge
- Work-package and lifecycle transitions

### Data-Extraction source lane

Data-Extraction converts source materials into provenance-complete graph proposals.

Supported or planned source classes include:

- Documents and PDFs
- Proposals and contracts
- Plan sets and schedules
- Spreadsheets and CSV files
- Websites and HTML
- Images and visual metadata
- Audio recordings
- Videos and transcripts
- RAG corpora and chunk manifests
- Source repositories and technical documentation
- Vendor catalogs and pricing references
- Application exports and structured datasets

Neither contributor owns graph truth. CG Master Graph owns validation, identity resolution, conflict handling, versioning, and promotion into canonical graph releases.

## Shared contribution contract

Cross-Agent and Data-Extraction should use a shared versioned contribution envelope owned by `CG-MASTER-GRAPH`.

Example shape:

```json
{
  "schemaVersion": "cg-master-graph-contribution-v1",
  "contributionId": "contribution:...",
  "producer": {
    "repositoryId": "repo:data-extraction",
    "capability": "source-extraction"
  },
  "source": {},
  "observations": [],
  "claims": [],
  "relationships": [],
  "evidence": [],
  "identityCandidates": [],
  "warnings": [],
  "producerReceipt": {}
}
```

Canonical schemas should include:

```text
schemas/contribution-envelope.v1.schema.json
schemas/entity-observation.v1.schema.json
schemas/relationship-observation.v1.schema.json
schemas/source-anchor.v1.schema.json
schemas/identity-candidate.v1.schema.json
schemas/knowledge-package.v1.schema.json
```

Data-Extraction and Cross-Agent should consume pinned schema releases instead of maintaining silent divergent copies.

## Data-Extraction authority and growth

Data-Extraction is a primary graph contributor and the exclusive processing authority for the managed knowledge-intake folders.

It should own:

- Folder watchers
- File stabilization
- Fingerprinting and deduplication
- Classification
- OCR
- Transcription
- Artifact pairing
- Knowledge-package assembly
- Entity extraction
- Relationship extraction
- Source anchoring
- Confidence and uncertainty
- Identity candidates
- Graph-contribution packaging
- Processing receipts
- Human-review routing
- Retry and quarantine behavior
- Extractor versioning

Data-Extraction must mature into a measured, self-improving extraction platform.

Each run should record:

- Source type
- Extractor version
- Confidence
- Review corrections
- Missed entities
- False relationships
- Processing time
- Failure reason
- Accepted, held, and rejected contribution counts

Corrections should feed a governed improvement loop:

```text
source processed
  -> extraction result
  -> review or graph validation
  -> correction captured
  -> failure intelligence
  -> regression fixture
  -> proposed extractor change
  -> tests
  -> versioned release
  -> monitored rollout
```

Data-Extraction should maintain a corpus structure such as:

```text
corpus/
  golden/
  regression/
  failures/
  ambiguous/
  reviewed/
```

It must not silently change production extraction behavior based on unreviewed feedback.

## Synology knowledge-intake authority

The canonical source intake should live on Synology through L:.

### L: source and archive authority

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

### Z: derived intelligence and publication authority

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

L: preserves original source artifacts and durable processed packages.

Z: stores derived transcripts, normalized extraction packages, graph contributions, publication outputs, cache material, and supersession records.

## Strict audio lane

The audio lane is strictly for audio recordings.

Supported examples may include:

- Voice notes
- Estimator walkthroughs
- Planning sessions
- Design reviews
- Training sessions
- Field observations
- Customer or project conversations where recording and processing are authorized

Canonical lifecycle:

```text
AUDIO_RECEIVED
  -> WAITING_FOR_STABILITY
  -> TRANSCRIBING
  -> TRANSCRIPTION_COMPLETE
  -> EXTRACTION_COMPLETE
  -> GRAPH_PACKAGE_VALIDATED
  -> SOURCE_ARCHIVED
```

Folder movement:

```text
Incoming
  -> Processing
  -> Processed
```

Alternative outcomes:

```text
Processing -> Review
Processing -> Failed
```

The original recording must move to `Processed` only after all required outputs exist and validate:

- Source hash
- Transcript
- Normalized transcript
- Extraction package
- Graph contribution
- Processing receipt
- Manifest

The original audio remains the strongest source evidence and must not be deleted after transcription.

## Document lane

The document lane is a managed drop location for miscellaneous documents such as:

- PDF
- Word document
- Spreadsheet
- Proposal
- Contract
- Specification
- Vendor catalog
- Installation guide
- Research paper
- Scan
- Project document

Canonical lifecycle:

```text
DOCUMENT_RECEIVED
  -> WAITING_FOR_STABILITY
  -> CLASSIFIED
  -> OCR_IF_REQUIRED
  -> EXTRACTED
  -> GRAPH_PACKAGE_VALIDATED
  -> SOURCE_ARCHIVED
```

The system should detect duplicates, versions, likely project associations, likely proposal associations, and whether human review is required.

## Audio and document pairing

A document may have corresponding audio that explains, reviews, or contextualizes it.

Examples:

```text
Proposal.pdf
Proposal-Walkthrough.m4a
```

or:

```text
Specification.pdf
Specification-Review.wav
```

The graph should preserve relationships such as:

```text
AudioRecording -> EXPLAINS -> Proposal
AudioRecording -> REVIEWS -> Document
Transcript -> DERIVED_FROM -> AudioRecording
KnowledgePackage -> CONTAINS -> AudioRecording
KnowledgePackage -> CONTAINS -> Document
```

Pairing should not depend only on filenames.

A package manifest may explicitly define relationships:

```json
{
  "schemaVersion": "cg-knowledge-package-v1",
  "packageId": "knowledge-package:...",
  "packageType": "proposal-review",
  "artifacts": [
    {
      "path": "proposal.pdf",
      "role": "primary-document"
    },
    {
      "path": "discussion.m4a",
      "role": "audio-explanation",
      "relationshipTo": "proposal.pdf",
      "relationship": "EXPLAINS"
    }
  ]
}
```

When no manifest exists, Data-Extraction may propose pairing based on timestamps, folder location, filenames, project identifiers, metadata, and extracted content. Inferred pairing must carry confidence and review state.

## Processed knowledge-package structure

A successfully processed package may look like:

```text
L:\Capital-Glass-Knowledge-Intake\Packages\Processed\KP-<ID>\
  original\
    proposal.pdf
    estimator-walkthrough.m4a
    pricing.xlsx
  transcript\
    transcript.txt
    transcript.normalized.json
  extracted\
    entities.json
    relationships.json
    identity-candidates.json
  graph\
    graph-contribution.json
  receipts\
    processing-receipt.json
    validation-receipt.json
  manifest.json
```

Nothing should be moved to `Processed` until the package manifest, extraction outputs, graph contribution, and receipts agree.

## Full L: and Z: observation

The system should have persistent read access to the full mounted L: and Z: surfaces from WSL2:

```text
/mnt/l
/mnt/z
```

However, constant access must not mean unrestricted recurring full-content scans.

Observation should be governed by a central registry that defines:

- Registered roots
- Metadata-only roots
- Content-readable roots
- Allowed file types
- Exclusions
- Sensitivity class
- Retention policy
- Extraction policy

Recommended approach:

```text
filesystem events for immediate discovery
incremental reconciliation for missed events
periodic metadata inventory
content extraction only when fingerprint changes
```

The system should explicitly exclude or quarantine:

- Secrets and credential files
- Browser profiles
- Personal unrelated content
- System directories
- `.git` object databases
- `node_modules`
- Temporary Office lock files
- Database internals
- Duplicate backup trees unless intentionally registered
- Restricted folders

## Runtime authority

Code and execution authority remain in WSL2 ext4:

```text
/home/wesley/repos/Data-Extraction
/home/wesley/repos/CG-MASTER-GRAPH
/home/wesley/repos/CapitalGlass-Cross-Agent
```

L: and Z: are source, archive, cache, publication, and intelligence surfaces—not development workspaces.

## Required source anchoring

Every extracted observation should be traceable to an exact source location where possible:

- PDF page and bounding box
- Spreadsheet sheet and cell range
- Website URL and selector
- Document page and paragraph
- Image region
- Video timestamp and frame
- Audio timestamp
- Transcript line range
- Database table and record ID
- Source-code path and line range

Each observation should support states such as:

```text
observed
derived
inferred
ambiguous
conflicting
not_found
requires_human_review
```

## Identity reconciliation

Data-Extraction must propose identity candidates rather than silently create canonical entities when uncertain.

Example:

```json
{
  "observedLabel": "Rosewood Ave",
  "candidateCanonicalId": "project:rosewood-2406",
  "matchConfidence": 0.91,
  "resolutionState": "candidate"
}
```

CG Master Graph owns final identity resolution and alias management.

## Repository ownership model

### CG-MASTER-GRAPH

Owns:

- Canonical graph model
- Shared contribution schemas
- Knowledge-package schemas
- Identity rules
- Provenance requirements
- Conflict policy
- Compiler
- Release format
- Query projection contracts

### Data-Extraction

Owns:

- Source adapters
- Synology intake watchers
- File stabilization and deduplication
- OCR and transcription
- Knowledge-package building
- Source anchoring
- Entity and relationship extraction
- Confidence and uncertainty
- Extraction receipts
- Graph contribution production
- Improvement corpus and regression fixtures

### CapitalGlass-Cross-Agent

Owns:

- Harvest extraction
- Work and decision intelligence
- Contribution routing
- Human and agent review coordination
- Work-package linkage
- Improvement intake
- Failure Intelligence routing
- Publication coordination
- Agent preflight and reuse

### Synology

Owns:

- Original source artifacts
- Durable processed packages
- Long-term evidence preservation
- Intake and archive folder authority

## Program tracks

### Track A - Master Graph foundation

Work package:

```text
capital-glass-master-graph-foundation-v1
```

### Track B - Cross-Agent harvest integration

Work package:

```text
cross-agent-master-graph-harvest-contributor-v1
```

### Track C - Data-Extraction graph contributor

Work package:

```text
data-extraction-master-graph-contributor-v1
```

Target:

```text
EXTRACTION_OUTPUT_NOT_GRAPH_READY
  -> PROVENANCE_COMPLETE_GRAPH_CONTRIBUTOR
```

### Track D - L/Z continuous observation

Work package:

```text
capital-glass-lz-continuous-graph-observation-v1
```

Target:

```text
MANUAL_DOCUMENT_DISCOVERY
  -> CONTINUOUS_INCREMENTAL_GRAPH_OBSERVATION
```

### Track E - Synology knowledge-intake authority

Work package:

```text
capital-glass-knowledge-intake-data-extraction-authority-v1
```

Target:

```text
UNMANAGED_FILE_DROP
  -> GOVERNED_SELF_IMPROVING_KNOWLEDGE_INTAKE
```

All tracks converge at:

```text
SHARED_CONTRIBUTION_CONTRACT_VALIDATED
```

## First joint proof

The first proof should be bounded and should include multiple source types.

Recommended pilot:

- Rosewood plan set
- Operator or estimator audio/transcript
- Extracted schedule
- Related project evidence
- Proposal or estimate artifact

Data-Extraction should produce a connected contribution package such as:

```text
Project
  -> PlanSet
  -> Sheet
  -> Schedule
  -> Opening
  -> Product
  -> ExtractionRun
  -> EvidenceAnchor
```

Cross-Agent should add:

```text
WorkPackage
  -> Decision
  -> VerificationReceipt
  -> Application
  -> Repository
```

CG Master Graph should reconcile both into one connected, provenance-complete subgraph.

## Acceptance criteria

The program is ready for broad ingestion only when:

- Synology intake folders exist
- Data-Extraction is the exclusive processing authority for managed intake state transitions
- L: and Z: are readable from the WSL2 runtime
- Audio, Documents, and Packages lanes are operational
- Originals are preserved
- Audio and document pairings remain linked
- File stability is enforced before processing
- Durable cursors survive restart
- Unchanged files are not reprocessed
- Modified artifacts create new versions and supersession relationships
- Extractor versions are recorded
- Source anchors are complete
- Graph contributions validate against shared schemas
- Uncertain results enter Review or Quarantine
- Human corrections produce regression fixtures
- Secrets and excluded directories are not ingested
- Successful artifacts move to Processed only after all required package and receipt validation passes

## Control principle

> Synology preserves the source knowledge. Data-Extraction converts it into structured knowledge. Cross-Agent governs and enriches the process. CG Master Graph validates, connects, versions, and publishes the accepted result.
