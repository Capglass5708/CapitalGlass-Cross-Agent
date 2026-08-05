# Scraper → Data Extraction → CG Master Graph Improvements

**Work package ID:** `scraper-data-extraction-improvements-v1`  
**Owning orchestration repo:** `CapitalGlass-Cross-Agent`  
**Target repositories:** `Scraper`, `Data-Extraction`, `CG-MASTER-GRAPH`  
**Branch:** `scraper-data-extraction-improvements`  
**Status:** Ready for manual trigger  

## 1. Purpose

Strengthen the complete acquisition pipeline:

```text
Source website
  → Scraper evidence acquisition
  → Data Extraction validation and normalization
  → graph contribution production
  → CG Master Graph validation and canonical promotion
```

The goal is not to collapse responsibilities. The goal is to make every handoff deterministic, attributable, replayable, quality-scored, policy-aware, and independently verifiable.

## 2. Authority boundaries

### Scraper

The Scraper is an evidence acquisition system. It may observe, capture, package, checksum, redact, and deliver evidence. It must not create canonical business truth.

### Data Extraction

Data Extraction validates Scraper packages, normalizes observations, produces extracted entities and relationships, maintains extraction lineage, and emits graph contribution envelopes. It is the only authority allowed to issue the Data Extraction ingestion acknowledgment.

### CG Master Graph

CG Master Graph validates graph contributions, rejects duplicate or orphaned records, compiles deterministically, and promotes canonical graph truth. It does not replace source systems, application databases, or the evidence corpus.

## 3. Target pipeline

```text
Source Registry
  ↓
Policy Gate
  ↓
Capture Planner
  ↓
Playwright Capture Engine
  ├── DOM
  ├── Accessibility tree
  ├── Screenshots
  ├── Network and HAR
  ├── Console and runtime errors
  ├── Interaction trace
  └── Runtime metadata
  ↓
Redaction Gate
  ↓
Artifact Hashing
  ↓
Schema Validation
  ↓
Quality Scoring
  ↓
Immutable Scraper Package
  ↓
Outbound Queue
  ↓
Data Extraction
  ├── Verify schema and hashes
  ├── Register ingestion
  ├── Normalize observations
  ├── Extract entities and relationships
  ├── Produce contribution envelope
  └── Issue acknowledgment
  ↓
CG Master Graph
  ├── Validate contribution
  ├── Reject duplicates and orphan edges
  ├── Compile deterministically
  └── Publish canonical release
```

# 4. Improvement backlog

## 4.1 Immutable capture packages

Every run must produce a new immutable capture package. A later capture of the same URL must never overwrite an earlier capture.

Recommended layout:

```text
captures/
  <source-id>/
    <capture-id>/
      manifest.json
      evidence/
        dom.html
        accessibility-tree.json
        screenshots/
        stylesheets/
        network.har
        console.jsonl
        requests.jsonl
        responses.jsonl
      integrity/
        checksums.sha256
        package-hash.json
        signature.json
      diagnostics/
        capture-log.jsonl
        errors.json
        timing.json
      handoff/
        scraper-package.json
```

Recommended identifier:

```text
cap_<source-id>_<utc-timestamp>_<content-hash-prefix>
```

### Acceptance criteria

- No capture run overwrites a previous capture.
- Every capture has a globally unique `captureId`.
- All manifest paths are package-relative.
- The package can be copied to another machine without rewriting paths.

## 4.2 SHA-256 integrity manifest

Generate SHA-256 for every artifact and a deterministic package-level hash.

Artifact record:

```json
{
  "artifactId": "artifact_dom_main",
  "path": "evidence/dom.html",
  "mediaType": "text/html",
  "byteLength": 842193,
  "sha256": "..."
}
```

### Requirements

- Hash every file after redaction and before handoff.
- Sort artifact entries deterministically before calculating the package hash.
- Data Extraction must independently recompute hashes.
- A mismatch routes the package to quarantine.

## 4.3 Formal Scraper-to-Data-Extraction contracts

Create versioned JSON Schemas for:

```text
scraper-package-v1
capture-run-v1
source-observation-v1
artifact-index-v1
navigation-event-v1
interaction-flow-v1
policy-decision-v1
integrity-manifest-v1
capture-quality-v1
```

Minimum package fields:

```json
{
  "schemaVersion": "scraper-package-v1",
  "packageId": "...",
  "captureId": "...",
  "traceId": "...",
  "source": {
    "sourceId": "...",
    "sourceType": "website",
    "requestedUrl": "...",
    "canonicalUrl": "...",
    "finalUrl": "..."
  },
  "capture": {
    "startedAt": "...",
    "completedAt": "...",
    "captureProfile": "...",
    "toolVersion": "...",
    "gitCommit": "...",
    "browser": "chromium",
    "browserVersion": "...",
    "executionEnvironment": "..."
  },
  "policy": {},
  "artifacts": [],
  "quality": {},
  "integrity": {},
  "handoff": {}
}
```

### Acceptance criteria

- Scraper validates before queueing.
- Data Extraction validates independently before ingestion.
- Unsupported schema versions are rejected with a machine-readable reason.
- Contract compatibility is checked before large batch runs.

## 4.4 Evidence-level provenance

All downstream claims must be traceable through this chain:

```text
Graph node or edge
  → contribution envelope
  → Data Extraction artifact
  → Scraper package
  → capture
  → exact evidence artifact
  → exact source region or interaction step
```

Stable identifiers:

```text
artifactId
pageObservationId
domNodeEvidenceId
screenshotId
networkResponseId
interactionStepId
```

Example lineage reference:

```json
{
  "derivedFrom": [
    {
      "captureId": "cap_...",
      "artifactId": "artifact_dom_main",
      "selector": "[data-testid='pricing-card']",
      "textRange": {
        "start": 1492,
        "end": 1738
      }
    }
  ]
}
```

## 4.5 Accessibility tree capture

Capture the browser accessibility tree for each page state.

Include:

- Roles
- Accessible names
- Descriptions
- Heading hierarchy
- Landmarks
- Form relationships
- Selected, expanded, checked, disabled, and pressed state
- Dialog, tab, menu, and navigation structures

### Why it matters

The accessibility tree often describes the user-facing interface more cleanly than raw HTML and improves downstream recognition of controls, flows, forms, state changes, and semantic regions.

## 4.6 Network and structured response capture

Capture structured network evidence where policy permits:

- HAR
- Request method and URL
- Status code
- Content type
- Timing
- Redirects
- GraphQL operation names
- REST endpoints
- JSON response bodies
- Failed requests
- Request initiator
- Cache behavior

### Security rules

- Redact cookies, authorization headers, API keys, CSRF tokens, personal data, and session values.
- Store only allowlisted response bodies.
- Enforce maximum response size.
- Mark every retained body with its policy basis.

## 4.7 Runtime diagnostics

Capture:

- Console messages
- Unhandled exceptions
- Failed network requests
- CSP violations
- Mixed-content warnings
- Browser crashes
- Navigation timing
- DOM stability timing
- Resource counts
- Page weight
- Screenshot fallback events

Supported capture outcomes:

```text
CAPTURE_COMPLETE
CAPTURE_COMPLETE_WITH_WARNINGS
CAPTURE_PARTIAL
CAPTURE_BLOCKED
CAPTURE_AUTH_REQUIRED
CAPTURE_POLICY_DENIED
CAPTURE_FAILED
```

## 4.8 Deterministic readiness detection

Replace fixed sleeps with profile-driven stability detection.

Example:

```json
{
  "readiness": {
    "waitUntil": "domcontentloaded",
    "networkIdleWindowMs": 1500,
    "domQuietWindowMs": 1000,
    "maxWaitMs": 30000,
    "requiredSelectors": [],
    "dismissOverlays": true,
    "scrollStrategy": "incremental"
  }
}
```

Record which readiness condition succeeded or failed.

## 4.9 Lazy-load scrolling

Before final capture:

1. Scroll in viewport increments.
2. Wait for DOM and network stabilization.
3. Detect new images and regions.
4. Continue until page height is stable.
5. Enforce maximum iterations, time, and page height.
6. Return to the top.
7. Capture final state.

The manifest must indicate whether the page was truncated.

## 4.10 Responsive and state variants

Support profile-selected variants:

- Desktop wide
- Laptop
- Tablet portrait
- Tablet landscape
- Mobile iOS
- Mobile Android
- Light mode
- Dark mode
- Reduced motion
- High contrast
- Anonymous state
- Authenticated state

Do not run every matrix combination by default. Profiles must specify required variants.

## 4.11 Region and state screenshots

Capture more than full-page images:

- Full page
- Above the fold
- Major semantic regions
- Dialogs and modals
- Open navigation menu
- Hover state
- Focus state
- Error state
- Empty state
- Success state

Each screenshot should include selector and bounding box metadata.

```json
{
  "artifactId": "shot_pricing_section",
  "selector": "#pricing",
  "boundingBox": {
    "x": 0,
    "y": 1920,
    "width": 1440,
    "height": 860
  }
}
```

## 4.12 Declarative interaction flows

Add a flow specification format for multi-step product journeys.

```yaml
flowId: signup-basic-v1
startUrl: https://example.com
steps:
  - action: click
    target:
      role: link
      name: Sign up
  - assert:
      urlContains: /signup
  - fill:
      label: Email
      valueFromSecret: TEST_EMAIL
  - action: click
    target:
      role: button
      name: Continue
  - capture:
      label: signup-email-submitted
```

Capture at each step:

- Before screenshot
- After screenshot
- DOM diff
- Accessibility-tree diff
- URL change
- Network calls
- Console errors
- Visible text change
- Form state
- Modal state

## 4.13 Graph-ready flow observations

The Scraper may emit observations but not canonical relationships.

```json
{
  "flowId": "flow_signup_v1",
  "steps": [
    {
      "stepId": "step_001",
      "observedAction": "activate",
      "targetRole": "link",
      "targetName": "Sign up",
      "resultingObservationId": "page_signup"
    }
  ]
}
```

Data Extraction normalizes these observations and CG Master Graph determines canonical promotion.

## 4.14 Source registry

Move source-specific configuration out of scripts.

```text
config/sources/
  mobbin.json
  pageflows.json
  vendor-example.json
```

Example:

```json
{
  "sourceId": "example",
  "baseUrl": "https://example.com",
  "sourceClass": "ui-reference-library",
  "captureProfiles": ["anonymous-pages", "member-pages"],
  "allowedPaths": ["/patterns/**"],
  "deniedPaths": ["/account/**", "/billing/**"],
  "rateLimit": {
    "requestsPerMinute": 10,
    "concurrency": 1
  },
  "authentication": {
    "mode": "stored-session",
    "secretReference": "..."
  },
  "policy": {
    "automatedAcquisition": "requires-approval",
    "assetRetention": "metadata-only",
    "modelTraining": "unknown"
  }
}
```

## 4.15 Crawl budgets and guardrails

Per source and per run enforce:

- Maximum pages
- Maximum bytes
- Maximum duration
- Maximum recursion depth
- Maximum artifacts
- Domain allowlist
- URL pattern allowlist
- Query parameter normalization
- Concurrency
- Retry ceiling
- Backoff policy
- Daily acquisition budget

## 4.16 Robots, terms, and license policy

Every capture must have a policy decision.

```json
{
  "policyDecision": "allowed",
  "robotsCheckedAt": "...",
  "robotsRule": "...",
  "termsReviewId": "...",
  "licenseClass": "...",
  "retentionClass": "...",
  "redistributionAllowed": false,
  "trainingUseAllowed": "unknown"
}
```

Machine-enforced states:

```text
UNKNOWN → block
DENIED → block
MANUAL_ONLY → block automated batch capture
APPROVED_METADATA_ONLY → retain metadata and discard protected bodies
APPROVED_FULL_CAPTURE → capture under retention rules
```

## 4.17 Explicit handoff states

Use an append-only state machine:

```text
CAPTURED
VALIDATED
PACKAGED
QUEUED
DELIVERED
DE_VALIDATED
DE_ACCEPTED
DE_REJECTED
DE_ACKNOWLEDGED
EXPIRED
QUARANTINED
```

Event record:

```json
{
  "eventId": "...",
  "packageId": "...",
  "from": "PACKAGED",
  "to": "QUEUED",
  "occurredAt": "...",
  "actor": "scraper-handoff",
  "receiptId": "..."
}
```

## 4.18 Quarantine and dead-letter lanes

Recommended queues:

```text
outbound/
acknowledged/
rejected/
quarantine/
dead-letter/
```

Quarantine conditions:

- Schema failure
- Hash mismatch
- Missing required artifact
- Unexpected authentication state
- Sensitive-data detection
- Missing policy record
- Size limit violation
- Data Extraction rejection

Retries must be bounded and visible.

## 4.19 Idempotent delivery and replay

Use a deterministic package ID derived from the canonical manifest.

```text
packageId = hash(canonical manifest)
```

Data Extraction should respond safely to replay:

```json
{
  "status": "already-ingested",
  "packageId": "...",
  "existingIngestionId": "..."
}
```

Replaying a package must not create duplicate research items or duplicate graph contributions.

## 4.20 Downstream backpressure

Before a large scrape, check:

- Data Extraction health
- Queue depth
- Oldest unacknowledged package
- Free storage
- Accepted schema versions
- Quarantine count
- Rejection rate

Pause acquisition when downstream is degraded.

## 4.21 Capture quality scoring

Each package must contain measurable checks.

```json
{
  "quality": {
    "score": 87,
    "status": "pass-with-warnings",
    "checks": {
      "navigationSucceeded": true,
      "domCaptured": true,
      "screenshotCountExpected": 3,
      "screenshotCountActual": 3,
      "networkFailures": 2,
      "consoleErrors": 0,
      "authExpected": true,
      "authObserved": true,
      "contentStabilityReached": true,
      "pageTruncated": false
    }
  }
}
```

Data Extraction may reject, quarantine, or downgrade packages below configured thresholds.

## 4.22 Strong authentication assertions

Do not infer authentication only from visible words such as “Sign in.” Use explicit source-profile assertions.

```json
{
  "authAssertions": {
    "authenticatedSelectors": ["[data-testid='user-menu']"],
    "unauthenticatedSelectors": ["form[action*='login']"],
    "authenticatedUrlPatterns": ["/dashboard"],
    "requiredCookieNames": ["session"]
  }
}
```

Never include cookie values in durable evidence.

## 4.23 Content and visual deduplication

Calculate:

- Canonical URL hash
- DOM structural hash
- Normalized text hash
- Screenshot perceptual hash
- Network payload hash
- CSS hash

Classify each observation:

```text
NEW
UNCHANGED
TEXT_CHANGED
STRUCTURE_CHANGED
VISUAL_CHANGED
FLOW_CHANGED
```

For unchanged pages, produce a compact observation package referencing the prior full capture.

## 4.24 First-class diffs

Generate changes between captures:

- Added or removed headings
- Added or removed controls
- Form changes
- Navigation changes
- Design-token changes
- DOM-tree changes
- Accessibility-tree changes
- API-schema changes
- Screenshot visual differences

Data Extraction should be able to process a change package without re-extracting an unchanged corpus.

## 4.25 Modular Scraper architecture

Refactor the current capture implementation into modules.

```text
src/
  cli/
  capture/
    browser-session.mjs
    readiness.mjs
    screenshots.mjs
    dom.mjs
    accessibility.mjs
    network.mjs
    console.mjs
  policy/
  packaging/
  handoff/
  integrity/
  profiles/
  adapters/
  validation/
```

Source adapters must extend the generic engine rather than fork it.

## 4.26 Tests and fixture applications

Add tests for:

- Argument parsing
- URL canonicalization
- Contract validation
- Redaction
- Hash determinism
- Package determinism
- Authentication assertions
- Screenshot manifests
- Replay and idempotency
- Quarantine routing
- State transitions
- Handoff receipts

Create a local fixture application containing:

- Lazy-loaded content
- Redirects
- Modal
- Login state
- API-backed cards
- Infinite scroll
- Broken image
- JavaScript error
- Responsive navigation

## 4.27 Pinned execution environment

Every capture records:

- Scraper Git commit
- Clean or dirty repository state
- Node version
- Playwright version
- Browser version
- OS or container image
- Capture profile version
- Source adapter version
- Contract version

Production captures should run in a pinned container image.

## 4.28 Correlation and observability

Carry identifiers across the entire pipeline:

```text
traceId
captureRunId
captureId
packageId
deIngestionId
researchItemId
contributionEnvelopeId
graphReleaseId
```

All logs must be structured JSONL and include `traceId` and `packageId` when known.

## 4.29 Portable paths

Durable evidence must not expose machine-specific absolute paths. Use package-relative paths and storage receipt IDs.

Bad:

```json
{
  "evidenceRoot": "L:\\Capital-Glass-Research\\..."
}
```

Preferred:

```json
{
  "artifactRoot": ".",
  "storageReceiptId": "storage_..."
}
```

## 4.30 Graceful failure and partial packaging

Browser cleanup must run in `finally`. A failed capture should still produce a diagnostic package when possible.

```json
{
  "status": "CAPTURE_FAILED",
  "failureStage": "screenshot.mobile",
  "completedArtifacts": [],
  "errors": [],
  "retryClassification": "transient"
}
```

# 5. Data Extraction improvements

## 5.1 Independent package verification

Data Extraction must:

1. Validate package schema.
2. Recompute artifact hashes.
3. Recompute package hash.
4. Verify policy compatibility.
5. Check package replay status.
6. Register ingestion before extraction.
7. Issue a signed or hashed acknowledgment after acceptance.

## 5.2 Ingestion ledger

Create an append-only ingestion ledger containing:

```text
packageId
deIngestionId
receivedAt
validatedAt
acceptedAt
acknowledgedAt
schemaVersion
qualityScore
result
rejectionReason
researchItemIds
contributionEnvelopeIds
```

## 5.3 Observation normalization layer

Normalize Scraper observations into stable intermediate records before domain extraction:

```text
PageObservation
RegionObservation
ControlObservation
FormObservation
NavigationObservation
NetworkObservation
InteractionObservation
VisualObservation
ChangeObservation
```

## 5.4 Extraction lineage

Every normalized entity and relationship must preserve:

- Source package ID
- Capture ID
- Evidence artifact ID
- Selector, text range, response path, or screenshot region
- Extractor version
- Confidence
- Transformation steps

## 5.5 Contribution envelope production

Data Extraction should emit graph contribution envelopes with:

- Proposed nodes
- Proposed edges
- Evidence references
- Confidence
- Authority class
- Deduplication keys
- Extraction version
- Source package IDs
- Research item IDs
- Validation results

Data Extraction proposes knowledge. It does not directly update canonical graph releases.

## 5.6 Rejection taxonomy

Machine-readable rejection reasons:

```text
SCHEMA_UNSUPPORTED
SCHEMA_INVALID
HASH_MISMATCH
MISSING_ARTIFACT
POLICY_MISSING
POLICY_DENIED
AUTH_STATE_MISMATCH
QUALITY_BELOW_THRESHOLD
SENSITIVE_DATA_DETECTED
PACKAGE_ALREADY_INGESTED
EXTRACTION_FAILED
CONTRIBUTION_INVALID
```

## 5.7 Incremental extraction

For change packages:

- Reuse prior normalized records.
- Re-extract only changed evidence units.
- Preserve supersession links.
- Emit additions, modifications, and removals explicitly.

# 6. CG Master Graph integration improvements

## 6.1 Contribution-only boundary

The Master Graph accepts only validated contribution envelopes, not raw Scraper packages.

## 6.2 Canonical validation

Validate:

- Schema
- Registry identifiers
- Duplicate node IDs
- Duplicate edge IDs
- Orphan edges
- Authority compatibility
- Evidence lineage
- Source package references
- Supersession and deletion semantics

## 6.3 Deterministic compile

Identical accepted contributions and registry inputs must produce identical release content hashes.

## 6.4 Publication receipt chain

A published release should reference:

```text
graphReleaseId
contentHash
contributionEnvelopeIds
deIngestionIds
packageIds
captureIds
```

This enables complete reverse lineage from canonical graph truth to source observation.

# 7. Suggested cross-repository contract locations

## CapitalGlass-Cross-Agent

```text
contracts/scraper-data-extraction/
work-packages/scraper-data-extraction-improvements.md
routing/scraper-data-extraction-v1.json
```

## Scraper

```text
contracts/outbound/
config/sources/
config/profiles/
src/capture/
src/policy/
src/packaging/
src/handoff/
src/integrity/
src/validation/
```

## Data-Extraction

```text
contracts/inbound/scraper/
scripts/scraper-handoff/
ledgers/ingestion/
extractors/observations/
exporters/graph-contribution/
```

## CG-MASTER-GRAPH

```text
schemas/contribution/
graph/extraction-inputs/
scripts/validate-contribution/
```

# 8. Implementation phases

## Phase 1 — Handoff reliability

Implement:

1. Immutable `captureId` and `packageId`.
2. SHA-256 artifact manifest.
3. JSON Schema validation.
4. Explicit package state machine.
5. Data Extraction acknowledgment storage.
6. Quarantine and dead-letter handling.
7. Idempotent replay.
8. Correlation IDs.
9. Ingestion ledger.
10. Cross-repository compatibility check.

### Exit gate

```text
SCRAPER_DE_HANDOFF_RELIABLE_V1
```

### Required proof

- A fixture package is captured twice.
- The second delivery is recognized as replay.
- Tampered evidence is rejected.
- A missing artifact is quarantined.
- A valid package receives a Data Extraction acknowledgment.

## Phase 2 — Evidence completeness

Implement:

1. Accessibility tree.
2. HAR and network metadata.
3. Console and runtime diagnostics.
4. Deterministic readiness.
5. Lazy-load scrolling.
6. Strong authentication assertions.
7. Region screenshots.
8. Redaction.
9. Quality scoring.
10. Partial-capture packaging.

### Exit gate

```text
SCRAPER_EVIDENCE_COMPLETE_V1
```

## Phase 3 — Flow intelligence

Implement:

1. Declarative flow specifications.
2. Step-by-step capture.
3. Before and after evidence.
4. DOM and accessibility diffs.
5. Network events per step.
6. Flow observation packages.
7. Flow change detection.
8. Data Extraction flow normalization.

### Exit gate

```text
SCRAPER_FLOW_INTELLIGENCE_V1
```

## Phase 4 — Scale and optimization

Implement:

1. Source adapters.
2. Crawl budgets.
3. Scheduler integration.
4. Distributed workers.
5. Backpressure.
6. Perceptual deduplication.
7. Incremental recapture.
8. Source-level analytics.
9. Cost and storage controls.

### Exit gate

```text
SCRAPER_ACQUISITION_SCALE_V1
```

# 9. Agent work packages

## WP-01 — Contract foundation

**Owner:** Cross-Agent contract agent  
**Repos:** Cross-Agent, Scraper, Data-Extraction  

Deliver:

- `scraper-package-v1.schema.json`
- `integrity-manifest-v1.schema.json`
- `capture-quality-v1.schema.json`
- `data-extraction-ingestion-ack-v1.schema.json`
- Compatibility matrix
- Contract tests

## WP-02 — Immutable packaging and hashing

**Owner:** Scraper agent  

Deliver:

- Immutable directory structure
- Deterministic IDs
- SHA-256 manifest
- Canonical package hashing
- Portable paths
- Package validation command

## WP-03 — Handoff state machine

**Owner:** Scraper and Data Extraction agents  

Deliver:

- Queue directories
- Append-only state events
- Delivery receipt
- Acceptance acknowledgment
- Rejection receipt
- Replay behavior
- Quarantine and dead-letter commands

## WP-04 — Evidence expansion

**Owner:** Scraper capture agent  

Deliver:

- Accessibility capture
- HAR capture
- Console/error capture
- Readiness engine
- Lazy loading
- Region screenshots
- Runtime metadata

## WP-05 — Policy and redaction

**Owner:** Governance agent  

Deliver:

- Source policy schema
- Robots check
- Terms review reference
- Retention class
- Redaction engine
- Sensitive-data tests
- Batch-block policy enforcement

## WP-06 — Quality and observability

**Owner:** Platform reliability agent  

Deliver:

- Capture quality score
- Structured logs
- Trace propagation
- Metrics
- Handoff health command
- Backpressure check

## WP-07 — Data Extraction normalization

**Owner:** Data Extraction agent  

Deliver:

- Ingestion ledger
- Observation types
- Lineage model
- Rejection taxonomy
- Incremental extraction support
- Contribution envelope exporter

## WP-08 — Flow intelligence

**Owner:** Flow capture agent  

Deliver:

- Flow specification schema
- Flow runner
- Step evidence
- State diffs
- Flow observation package
- Flow extraction fixtures

## WP-09 — Master Graph contribution validation

**Owner:** Master Graph agent  

Deliver:

- Contribution validation
- Evidence lineage validation
- Duplicate and orphan checks
- Release receipt references
- Deterministic compile proof

## WP-10 — End-to-end proof

**Owner:** Cross-Agent orchestrator  

Run:

```text
fixture site
→ Scraper capture
→ immutable package
→ Data Extraction validation
→ normalized observations
→ graph contribution envelope
→ Master Graph validation
→ deterministic release
```

Required proof artifacts:

- Scraper package
- Hash manifest
- Data Extraction acknowledgment
- Ingestion ledger entry
- Normalized observation bundle
- Contribution envelope
- Graph validation result
- Graph release hash
- Full lineage report

# 10. Commands to add

## Scraper

```text
npm run capture:plan
npm run capture:run
npm run capture:validate
npm run capture:quality
npm run package:build
npm run package:verify
npm run handoff:queue
npm run handoff:status
npm run handoff:retry
npm run handoff:quarantine
npm run source:policy-check
npm run source:compatibility-check
```

## Data Extraction

```text
npm run scraper-handoff:validate
npm run scraper-handoff:ingest
npm run scraper-handoff:acknowledge
npm run scraper-handoff:reject
npm run scraper-handoff:replay-check
npm run scraper-handoff:quarantine
npm run observations:normalize
npm run graph-contribution:build
npm run graph-contribution:validate
npm run de:handoff-health
```

## CG Master Graph

```text
npm run graph:contribution:validate
npm run graph:collect
npm run graph:validate
npm run graph:compile
npm run graph:publish
npm run graph:verify
```

# 11. Non-negotiable rules

1. Scraper captures evidence only.
2. Data Extraction is the ingestion and normalization authority.
3. CG Master Graph alone promotes canonical graph truth.
4. Raw credentials and secret values never enter evidence packages.
5. Absolute machine paths never enter portable manifests.
6. Every package is immutable and checksummed.
7. Every ingestion is idempotent.
8. Every canonical graph item has reverse evidence lineage.
9. Unknown or denied policy state blocks automated acquisition.
10. Failed or partial captures remain observable and auditable.
11. Batch scraping pauses when downstream health is degraded.
12. Identical inputs must produce identical package and graph hashes.

# 12. Definition of done

The work package is complete when:

- A source capture creates an immutable, schema-valid package.
- Every artifact has a verified SHA-256 hash.
- The package includes policy, quality, environment, and provenance metadata.
- Data Extraction independently validates the package.
- Replay does not duplicate ingestion.
- Invalid packages are quarantined with machine-readable reasons.
- Data Extraction emits normalized observations with evidence lineage.
- Data Extraction emits a valid graph contribution envelope.
- CG Master Graph validates and compiles the contribution deterministically.
- The graph release can be traced back to the exact capture artifacts.
- An end-to-end proof report is committed to the Cross-Agent work package.

## Final exit state

```text
SCRAPER_DATA_EXTRACTION_GRAPH_PIPELINE_VALIDATED_V1
```
