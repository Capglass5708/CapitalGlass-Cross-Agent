# Capital Glass Conversation Improvement Intelligence v1

Standard ID: `CG-CONVERSATION-IMPROVEMENT-INTELLIGENCE-v1`

Status: Draft foundation

Owner: `CapitalGlass-Cross-Agent`

## Purpose

Treat copied ChatGPT, Cursor, and other AI-assisted conversations as non-authoritative evidence that can be analyzed for reusable improvements to the Capital Glass estate.

This system is not a source-of-truth ledger. It is an improvement-intelligence instrument focused on:

- Token and context efficiency
- Retrieval and reuse
- Concepts and ontology
- Architecture and boundaries
- Workflow and protocol
- Speed and automation
- Reliability and failure prevention
- Documentation and discoverability
- Agent behavior
- Human experience

Its mission is:

> Analyze conversations as non-authoritative evidence, identify the highest-value reusable improvements and concepts, use broader Capital Glass intelligence to strengthen the analysis, and package user-refined outcomes for the Intelligence Hub and CG Master Graph.

## Required separation

```text
Chat Harvest
= what happened, what changed, and what was completed

Conversation Improvement Intelligence
= what should improve because of what happened
```

Operational history must not be mixed with speculative improvement recommendations.

## Operating modes

### EXTRACT

Analyze the conversation for improvements across all supported domains.

### IMPLANT

Retrieve one relevant concept, and at most two supporting concepts, from prior Capital Glass intelligence and introduce them into the current discussion as proposals.

Implanted concepts must be clearly labeled non-authoritative and require user refinement or rejection.

### DEVELOP

Track how an implanted or newly formed concept changes through discussion and package the refined result.

## Interpretation classes

Conversation material must be classified as one or more of:

```text
SIGNAL
NOISE
REPETITION
PATTERN
FAILURE
DECISION_CANDIDATE
IMPROVEMENT_CANDIDATE
CONCEPT_CANDIDATE
UNRESOLVED
```

A statement is not authoritative merely because an agent said it.

## Improvement domains

1. Token and Context Efficiency
2. Retrieval and Reuse
3. Concepts and Ontology
4. Architecture and Boundaries
5. Workflow and Protocol
6. Speed and Automation
7. Reliability and Failure Prevention
8. Documentation and Discoverability
9. Agent Behavior
10. Human Experience

Each domain may return up to five high-value findings. It must not invent weak findings to fill unused positions.

## Ranking model

The output should include:

```text
Executive Top 5 ROI
Top 5 Immediate ROI
Top 5 Systemic Leverage
Top 5 Strategic Compounding Improvements
Top 5 per Improvement Domain
```

Each improvement should be scored using:

- Impact
- Frequency
- Breadth
- Confidence
- Effort
- Risk
- Leverage
- Compounding value

The result is a `Relative ROI Score`, not a financial forecast.

Suggested base formula:

```text
Relative ROI =
(Impact x Frequency x Breadth x Confidence)
/
(Effort x Risk)
```

Leverage and compounding value should be reported separately so a strategic platform improvement is not crowded out by quick wins.

## Time horizon

Every finding should be classified as:

```text
NOW
NEXT
LATER
STRATEGIC
```

## Promotion model

Every finding should be classified as:

```text
RECORD_ONLY
WATCH_FOR_REPETITION
PROPOSE_WORK
PROPOSE_STANDARD
PROPOSE_ARCHITECTURE_DECISION
```

## Improvement types

```text
QUICK_WIN
STANDARDIZATION
AUTOMATION
ARCHITECTURE
CONCEPT_FORMALIZATION
RELIABILITY_FIX
DOCUMENTATION
AGENT_BEHAVIOR
```

## Systemic analysis

The system must analyze at three levels:

```text
Local finding
  -> cross-domain pattern
  -> strategic intervention
```

It should prefer one root-cause improvement that resolves several symptoms over multiple symptom-level recommendations.

Required systemic sections:

```text
SYSTEMIC PATTERNS
CROSS-REPOSITORY OPPORTUNITIES
SHARED ROOT CAUSES
LEVERAGE POINTS
SECOND-ORDER EFFECTS
STRATEGIC TOP 5
```

Each systemic finding should identify:

- Affected domains
- Affected repositories
- Recurring signals
- Root cause
- Recommended intervention
- Second-order benefits
- Risks and tradeoffs
- Appropriate promotion path

## Consolidation rule

Overlapping findings must be consolidated.

Example:

```text
Repeated explanations
High token use
Slow startup
Authority contradictions
```

may consolidate into:

```text
Create one compact, current authority packet and require preflight retrieval.
```

## Concept maturity lifecycle

```text
RAW_IDEA
RECURRING_PATTERN
DEFINED_CONCEPT
DISCUSSION_CANDIDATE
USER_REFINED
USER_ACCEPTED
DOCUMENTED
PUBLISHED_TO_HUB
GRAPH_CANDIDATE
GRAPH_ACCEPTED
REJECTED
```

## Concept implant behavior

The system may be asked to implant a concept from its accumulated intelligence into the active conversation.

Selection criteria:

- Relevance to the current problem
- Cross-domain reach
- Novelty compared with the current chat
- Evidence from prior use
- Compatibility with current architecture
- Expected ROI
- Compounding value
- Feasibility
- Risk of unnecessary complexity

The concept must be introduced as a proposal, for example:

> A relevant concept from prior improvement intelligence is `knowledge-package lineage`. It may help preserve the relationship between source audio, transcript, extracted observations, and graph contribution. Proposed for discussion; not yet adopted.

## Concept development packet

A refined concept should produce a machine-readable packet:

```json
{
  "schemaVersion": "cg-concept-development-v1",
  "conceptId": "concept:...",
  "origin": {
    "type": "concept-implant",
    "sourceConcepts": [],
    "conversationId": "conversation:..."
  },
  "problemAddressed": "...",
  "initialProposal": "...",
  "userRefinements": [],
  "acceptedDefinition": "...",
  "status": "USER_ACCEPTED",
  "affectedDomains": [],
  "affectedRepositories": [],
  "expectedBenefits": [],
  "risks": [],
  "documentationTargets": [],
  "graphProposal": {
    "entities": [],
    "relationships": []
  }
}
```

## Intelligence Hub packaging

Accepted improvements and refined concepts should be published as improvement intelligence, not authoritative operational state.

Recommended classification:

```text
knowledgeClass: improvement-intelligence
authorityClass: non-authoritative
verificationState: user-refined
```

Supported packet kinds may include:

```text
improvement-extract
systemic-pattern
concept-development
architecture-candidate
standard-candidate
automation-candidate
```

## CG Master Graph treatment

The graph may record that the intelligence exists and how it developed:

```text
Conversation -> PRODUCED -> ImprovementExtract
Conversation -> INTRODUCED -> Concept
PriorConcept -> INFLUENCED -> Concept
User -> REFINED -> Concept
Concept -> PROPOSES_CHANGE_TO -> Repository
Concept -> DOCUMENTED_IN -> IntelligencePacket
Improvement -> ADDRESSES -> SystemicPattern
```

The graph must not claim implementation until implementation evidence exists.

## Required output structure

```text
1. Executive Summary
2. Executive Top 5 ROI
3. Top 5 Immediate ROI
4. Top 5 Systemic Leverage
5. Top 5 Strategic Compounding Improvements
6. Domain Top 5 Findings
7. Systemic Patterns
8. Shared Root Causes
9. Cross-Repository Opportunities
10. Concepts Detected
11. Concept Implant Candidates
12. Automation Candidates
13. Token-Reduction Opportunities
14. Documentation Improvements
15. Consolidated Improvements
16. Rejected or Low-Value Ideas
17. Unknowns and Required Verification
18. Intelligence Hub Packets
19. Master Graph Contribution Proposal
20. Exact Next Actions
```

## Core principle

> Every conversation is an opportunity to improve the Capital Glass estate. The objective is not to archive discussions, but to convert recurring insights, patterns, and concepts into reusable enterprise capabilities while preserving the distinction between objective evidence, proposed improvements, and accepted standards.
