# Harvest Storage, Projection, and Git Retention Boundary

**Status:** Proposal — Discussion Draft  
**Branch:** `growth-branch-1`  
**Protocol impact:** High  
**Decision required:** Yes  
**Canonical status:** Not canonical; do not enforce until approved

## 1. Purpose

This section defines where harvested intelligence is stored, which surface is authoritative for each representation, and what may be retained in Git.

The goal is to preserve complete intelligence without creating duplicate storage planes, repeated Git commits, self-referential publication loops, or competing sources of truth.

This boundary applies to every thread harvest, regardless of harvest tier, packet count, publication method, or originating agent.

## 2. Core rule

> Harvest once, publish each representation to its designated authority plane, and retain only compact coordination proof in Cross-Agent Git.

The complete harvest must not be copied into every available storage system.

Each surface has one primary responsibility:

- **L:** durable intelligence
- **Z:** AI-ready cache and compiled retrieval products
- **Supabase:** searchable projection and routing metadata
- **Cross-Agent Git:** compact coordination, lineage, and current-state proof
- **Temporary storage:** intermediate execution output

## 3. Approved storage roles

| Surface | Authoritative role | May contain complete harvest payload? |
|---|---|---:|
| **L: Intelligence Hub** | Durable authoritative harvest content, historical intelligence, normalized records, and long-term retrieval corpus | Yes |
| **Z: AI-Cache-Authority** | AI-ready cache releases, compiled retrieval views, hot indexes, and publication products derived from authoritative content | Only when required for cache operation |
| **Supabase** | Structured pointers, query projection, searchable metadata, current-state slices, retrieval routing, and synchronization status | No |
| **CapitalGlass-Cross-Agent Git** | Compact coordination proof, decisions, authority lineage, current pointers, owner boundaries, and final verdicts | No |
| **Temporary local or workflow storage** | Validation output, intermediate compilation files, logs, diagnostics, and transient publication artifacts | Temporarily only |

No surface may assume a role assigned to another surface without an explicit protocol exception.

## 4. Authority precedence

When surfaces disagree, use the following authority order.

### Content authority

```text
L: durable harvest content
    -> canonical compact Git manifest and source lineage
    -> Z: derived AI-cache representation
    -> Supabase projection
```

### Coordination authority

```text
Cross-Agent current pointer and decision record
    -> owner-repository evidence
    -> Supabase current-state projection
```

### Cache authority

```text
Z: published cache release
    -> L: source content
    -> regenerated cache output
```

Supabase must never override L: content, the canonical source commit, or the active Z: cache release.

A newer timestamp alone does not make a lower-authority record authoritative.

## 5. L: Intelligence Hub boundary

L: is the durable intelligence authority.

L: may store:

- complete normalized harvest content;
- thread-autopsy records;
- seed packets;
- durable Q&A records;
- reusable failure and recovery intelligence;
- decision and blocker intelligence;
- historical retrieval corpus;
- long-term indexes needed for durable discovery;
- publication manifests and content-addressed records.

L: must not depend on Cross-Agent Git retaining duplicate copies of its published content.

Deletion or replacement of authoritative L: content requires an explicit retention, supersession, or correction rule.

## 6. Z: AI-Cache-Authority boundary

Z: is the AI-ready cache and publication authority.

Z: may store:

- compiled retrieval views;
- hot indexes;
- AI-consumable summaries;
- cache releases;
- retrieval routing products;
- content-addressed cache bundles;
- release manifests;
- freshness metadata.

Z: content must be reproducible from an identified authority source whenever practical.

Z: must not be treated as the durable historical authority when the corresponding source content exists on L:.

A cache release must identify:

- source harvest ID;
- source manifest hash;
- source authority commit, when applicable;
- generated release ID;
- generation time;
- freshness state.

## 7. Supabase boundary

Supabase is a derived projection, query, and routing surface.

Supabase may store:

- harvest ID;
- work-package ID;
- thread ID;
- final verdict;
- current status;
- authority repository;
- authority source commit;
- manifest or content hash;
- L: publication pointer;
- Z: release or cache pointer;
- projection version;
- synchronization status;
- timestamps;
- owner repository;
- blocker;
- next action;
- packet counts and classifications;
- retrieval eligibility;
- compact searchable summaries;
- supersession relationships;
- freshness and drift state.

Supabase must not store complete duplicate copies of:

- full harvested conversations;
- full thread transcripts;
- full seed-packet collections;
- complete L: catalog records;
- complete Z: cache payloads;
- large retrieval-result sets;
- generated indexes already authoritative on L: or Z:;
- full publication logs;
- intermediate validation output;
- transient compiler output;
- repeated copies of unchanged payloads.

Supabase must never silently become the source of truth for the full harvest.

If Supabase disagrees with L:, Z:, or the canonical Git authority record, the affected projection must be marked:

```text
STALE
OUT_OF_SYNC
SOURCE_UNAVAILABLE
HASH_MISMATCH
```

as appropriate.

The projection must then be regenerated from the authoritative source. It must not resolve the disagreement by overwriting a higher-authority layer.

## 8. Cross-Agent Git boundary

CapitalGlass-Cross-Agent is the coordination and lineage authority.

For each harvest, Cross-Agent Git may retain only:

1. one compact canonical manifest or pointer;
2. one compact human-readable summary;
3. one final verdict or closeout receipt;
4. one current-state pointer;
5. decisions that affect future work;
6. owner-boundary records;
7. authority lineage;
8. small schemas or fixtures required to validate the compact record.

Cross-Agent Git must not retain recurring complete copies of:

- harvested conversations;
- full seed-packet directories;
- L: catalog mirrors;
- Z: cache mirrors;
- Supabase projection dumps;
- full retrieval results;
- generated indexes;
- repeated publication receipts;
- timestamp-only regenerated summaries;
- intermediate validation files;
- publication logs;
- cache release payloads;
- deterministically regenerable derived artifacts.

Cross-Agent must not become another Intelligence Hub, cache plane, or artifact archive.

## 9. Required compact pointer

After publication, Supabase and Cross-Agent may each retain a compact pointer equivalent to:

```json
{
  "schemaVersion": "harvest-publication-pointer-v1",
  "harvestId": "harvest-example-v1",
  "workPackageId": "example-work-package-v1",
  "verdict": "HARVEST_COMPLETE",
  "authority": {
    "repository": "CapitalGlass-Cross-Agent",
    "sourceCommit": "abc1234",
    "manifestHash": "sha256:..."
  },
  "lPublication": {
    "status": "published",
    "pointer": "00-master-index/by-harvest/harvest-example-v1.json",
    "contentHash": "sha256:..."
  },
  "zCache": {
    "status": "current",
    "releaseId": "AI-CACHE-RELEASE-...",
    "sourceManifestHash": "sha256:..."
  },
  "supabaseProjection": {
    "status": "in_sync",
    "projectionId": "...",
    "projectionVersion": 1
  },
  "retrieval": {
    "eligible": true,
    "lastVerifiedVerdict": "BLIND_RETRIEVAL_PASS"
  },
  "blocker": null,
  "nextAction": null
}
```

The pointer must reference the complete harvest stored on L: and the relevant cache release on Z:.

It must not embed either complete payload.

## 10. Required publication sequence

The required publication flow is:

```text
Validate the thread harvest
    -> establish the canonical source manifest and hash
    -> publish complete durable intelligence to L:
    -> publish or refresh the AI-ready representation on Z:
    -> upsert the compact Supabase projection
    -> verify hashes, freshness, and retrieval
    -> commit or update one compact Cross-Agent pointer
```

The compact Git pointer must be the final coordination record, not a trigger for regenerating the full publication chain.

## 11. Publication state model

A harvest may use the following states:

| State | Meaning |
|---|---|
| `STAGED_LOCAL` | Harvest exists locally but has not been durably published |
| `L_PUBLISHED` | Durable intelligence exists on L: |
| `Z_CURRENT` | Required AI-cache representation is current |
| `PROJECTION_IN_SYNC` | Supabase pointer matches the authority layers |
| `RETRIEVAL_VERIFIED` | Required retrieval verification passed |
| `OPERATIONAL` | All required layers for the harvest tier are complete |
| `OPERATIONAL_DEGRADED` | Core publication succeeded, but an optional or declared layer is unavailable |
| `OUT_OF_SYNC` | One or more derived surfaces disagree with authority |
| `BLOCKED` | A required publication or validation stage failed |

An `OPERATIONAL` verdict must identify which layers are required for that harvest tier.

A failed required layer must not be hidden beneath an unqualified `OPERATIONAL` verdict.

## 12. Idempotency

When L:, Z:, Supabase, and the compact Git pointer already represent the same unchanged harvest, a repeated publication must return:

```text
NOOP_CURRENT
```

An idempotent run must not:

- create a new Git commit;
- append a duplicate Supabase projection row;
- create a new Z: release;
- rewrite unchanged L: content;
- regenerate unchanged indexes solely to refresh timestamps;
- create additional receipts;
- change hashes without a source-content change;
- update `updatedAt` values merely because verification was repeated.

Verification time may be recorded in transient logs or a current-only operational status record without mutating canonical content.

## 13. Upsert and deduplication rules

Supabase projection records must use a deterministic identity such as:

```text
harvestId + manifestHash + projectionType
```

Projection writes must use upsert behavior.

A repeated write of unchanged authority state must update no durable content and must not append a duplicate row.

Z: releases should be content-addressed or source-hash-addressed where practical.

L: records should use deterministic harvest and record identifiers.

Cross-Agent must maintain no more than one active current pointer per harvest.

## 14. Commit-loop prevention

Publication must not create a self-referential Git loop.

The protocol must distinguish:

```json
{
  "authoritySourceCommit": "<commit containing the canonical source record>",
  "publicationRunId": "<external or workflow run identifier>",
  "receiptCommit": "<optional commit containing the compact final pointer>"
}
```

The authority source commit remains valid after the compact receipt is committed.

A receipt commit must not require regeneration of:

- the canonical harvest;
- seed packets;
- indexes;
- manifest hashes;
- L: publications;
- Z: cache releases;
- Supabase projections;

solely because the repository HEAD changed.

A commit whose only effect is to repin derived files to the immediately previous receipt commit is prohibited.

## 15. Retention classifications

Every generated artifact must declare one retention class:

| Classification | Required treatment |
|---|---|
| `GIT_CANONICAL` | Compact durable authority record committed permanently |
| `GIT_CURRENT_ONLY` | One current pointer or status record; replaced rather than accumulated |
| `L_DURABLE` | Full durable intelligence stored on L: |
| `Z_CACHE` | AI-ready or compiled cache product stored on Z: |
| `SUPABASE_PROJECTION` | Compact structured projection stored through deterministic upsert |
| `RUN_ARTIFACT` | Stored as workflow or external execution evidence |
| `EPHEMERAL` | Deleted or ignored after the run |

An artifact without a declared retention class must not be committed or published.

## 16. Temporary storage rules

Temporary local or workflow storage may contain:

- validation reports;
- full command output;
- compiler intermediates;
- debugging evidence;
- unpublished packet drafts;
- benchmark output;
- transient retrieval results.

Temporary artifacts must be:

- ignored by Git;
- removed after successful publication when no longer required;
- promoted only through an explicit retention classification;
- excluded from authority claims unless cited by a durable compact receipt.

A local copy is not automatically authoritative merely because it exists.

## 17. Failure and recovery behavior

### If L: is unavailable

- The harvest remains `STAGED_LOCAL`.
- Full durable publication is incomplete.
- Z: and Supabase must not claim current durable authority unless the applicable tier explicitly permits deferred L: publication.
- Cross-Agent may record a compact blocker pointer only.
- The complete harvest must not be committed to Cross-Agent as a substitute for L:.

### If Z: is unavailable

- L: may still hold the durable harvest.
- The harvest may be `L_PUBLISHED` but not `Z_CURRENT`.
- Supabase must show the cache state as stale, unavailable, or pending.
- The overall verdict must reflect whether Z: is required for the harvest tier.

### If Supabase is unavailable

- L: and Z: publication may still complete.
- The projection must be marked pending.
- Supabase unavailability must not trigger full payload storage in Git.

### If Cross-Agent Git is unavailable

- L: and Z: publication may complete.
- A compact pointer may remain staged until Git is available.
- No other plane should duplicate the Git coordination role unnecessarily.

## 18. Required validation gates

Before final closeout, the protocol must verify:

- every artifact has a retention classification;
- no complete L: payload is being committed to Git;
- no complete Z: cache payload is being committed to Git;
- Supabase contains pointers and projections rather than full harvest copies;
- unchanged publication returns `NOOP_CURRENT`;
- deterministic IDs prevent duplicate projection rows;
- the authority source commit remains stable after receipt creation;
- generated files do not differ only by timestamps;
- the commit will not trigger another mandatory receipt-only commit;
- layer hashes and pointers align;
- the final verdict accurately reflects required and degraded layers.

A violation must stop closeout with one of these codes:

```text
BLOCKED_HARVEST_GIT_DUPLICATION
BLOCKED_SUPABASE_PAYLOAD_DUPLICATION
BLOCKED_PUBLICATION_COMMIT_LOOP
BLOCKED_RETENTION_CLASS_MISSING
BLOCKED_AUTHORITY_CONFLICT
BLOCKED_NON_IDEMPOTENT_PUBLICATION
```

## 19. Existing duplicate content

Previously committed duplicate output must not be deleted from L: or Z: merely to make Git smaller.

Cleanup must occur through a controlled boundary-repair process that:

1. preserves the canonical harvest and authority lineage;
2. confirms the durable L: publication;
3. confirms the required Z: cache release;
4. confirms or rebuilds the Supabase pointer;
5. retains one compact Cross-Agent manifest and final pointer;
6. removes generated and duplicate files from active Git tracking;
7. adds appropriate ignore rules;
8. avoids broad Git-history rewriting unless separately approved;
9. records the cleanup decision and affected commit range;
10. verifies that retrieval still succeeds after cleanup.

## 20. Governing principle

> **L: remembers the durable intelligence.**  
> **Z: serves the AI-ready representation.**  
> **Supabase answers where it is, what state it is in, and how to route to it.**  
> **Cross-Agent records what was decided, who owns the work, and what happens next.**

### Final rule

> Harvest once. Publish complete durable intelligence to L:. Publish AI-ready products to Z:. Project compact searchable pointers into Supabase. Commit only compact coordination and lineage proof to Cross-Agent.
