# CAPITAL GLASS — CLAUDE FULL-ESTATE PLATFORM INTEGRATION V1

**Work package:** `claude-full-estate-platform-integration-v1`  
**Terminal stamp:** `CAPITAL_GLASS_CLAUDE_FULL_ESTATE_INTEGRATION_V1_PROVEN`  
**Mission class:** investigate → fix (phased)  
**Owner repo:** `CG-AppBuilder-MCP` (execution) + `CapitalGlass-Cross-Agent` (coordination)  
**Published folder:** `Z:\Capital-Glass-Dev\Claude Start Package`  
**Status:** **DISCOVERY_PHASE_0** — charter placed; parity not proven

---

## Mission

Integrate Claude into the Capital Glass software and intelligence estate as a **first-class agent execution surface**, so Claude can be used throughout the platform in substantially the same way Cursor is used today.

The target operator experience is that Capital Glass work should **not** depend on whether the human happens to launch the mission from Cursor or Claude.

Claude should be able to understand the estate, retrieve authoritative context, enter approved repositories, run established protocols, use Capital Glass MCP and platform services, interact with GitHub through approved paths, consume Platform Intelligence, publish findings to the Intelligence Hub, participate in WaveRunner and Night Owl sessions, preserve receipts, continue prior operations, and respect exactly the same governance boundaries as other Capital Glass agents.

**This is not a request to build a parallel Claude-specific Capital Glass platform.**

**Integrate Claude into the existing one.**

---

## Governing outcome

Work toward:

```text
CAPITAL_GLASS_CLAUDE_FULL_ESTATE_INTEGRATION_V1_PROVEN
```

The final state should support the conceptual equivalence:

```text
Cursor → Capital Glass Platform
Claude → Capital Glass Platform
```

with the **Capital Glass platform** remaining the authority in both cases.

Claude is another **execution/client surface** — not another source of truth.

---

## Begin with discovery, not implementation assumptions

Investigate the Capital Glass estate and determine how Cursor currently obtains the capabilities that make it useful across the platform.

Follow those capabilities from the operator surface all the way through their **actual authorities**.

Pay particular attention to how the estate currently handles:

- repository discovery
- repository authorization
- workspace and worktree selection
- Git branch management
- GitHub identity and operations
- agent admission
- execution-context admission
- control-plane preflight
- Platform Intelligence
- repository registries
- application Bible intelligence
- AI Cache and retrieval
- Intelligence Hub access
- Intelligence Hub publication
- MCP discovery and invocation
- WaveRunner / WaveRunner 2.0
- Night Owl
- Luna agents
- multi-agent execution
- receipts
- immutable milestone evidence
- failure intelligence
- continuation/resume
- mechanism-performance intelligence
- runtime/machine discovery
- Windows versus Linux/WSL execution
- Ryzen/remote execution
- environment and secrets resolution
- Supabase, GitHub, Railway, Vercel
- SharePoint or document surfaces where already integrated
- Bluebeam/Revu execution where authorized
- STOP/HOLD behavior
- human review
- promotion to canonical state

**Do not assume Cursor itself is the authority for any of these.**

Determine what underlying Capital Glass service, MCP, registry, protocol, configuration, runtime, or control plane Cursor is actually using.

Then make that capability available to Claude through the appropriate existing platform boundary.

---

## Integration philosophy

Prefer:

```text
Claude → existing Capital Glass interface → existing authority
```

rather than:

```text
Claude → new Claude-only implementation
```

If Cursor has a behavior that is currently implemented through an **IDE-specific workaround** rather than a durable platform capability, identify that clearly.

Where appropriate, move that capability behind a **platform-neutral interface** so both Cursor and Claude can use it.

Treat this effort as an opportunity to **remove accidental Cursor coupling** from the Capital Glass estate.

**Do not break the existing Cursor workflow while doing so.**

---

## Claude platform identity

Establish a durable way for Capital Glass systems to understand that an operation originated from Claude.

Claude-originated operations should carry enough identity to distinguish:

- human operator
- client surface
- agent
- session
- work package
- repository
- machine/runtime
- protocol
- model/agent tier where relevant

Avoid embedding Claude-specific assumptions into downstream business logic.

The platform should be able to recognize a Claude session while continuing to process it through common Capital Glass contracts.

Think in terms of:

```text
clientSurface = CLAUDE
```

rather than creating a separate Claude universe.

---

## Repository access across the estate

Claude should work with the same authorized Capital Glass repositories that other approved agents can work with.

Discover the existing repository registry and authorization mechanisms. Integrate Claude with those rather than maintaining a separate repository list.

Claude should be able to determine:

- what repositories exist
- which are canonical
- current authoritative branches
- current SHAs
- whether a repository is safe to mutate
- whether there is outstanding local work
- whether another agent/session owns a write lane
- required preflight and validation gates
- platform/runtime requirements
- recovery paths

Cross-repository work must preserve existing ownership boundaries. Claude must not mutate a repository merely because it can see it.

---

## Git and GitHub parity

Give Claude the ability to participate in the established Git/GitHub workflow through the same governed mechanisms used elsewhere in Capital Glass.

Authorized lifecycle coverage:

- read repository state
- create bounded worktrees
- create branches
- make commits
- run validation
- push authorized branches
- inspect pull requests
- create pull requests
- review CI results
- respond to gate failures
- reconcile branches
- produce merge-ready evidence
- read publication state

Claude must **not** receive a blanket bypass around branch protection, review, control-plane admission, or existing GitHub governance.

Protect existing worktrees and material local changes. **Current-or-newer code** remains more important than cosmetic cleanliness.

---

## MCP parity

Discover every Capital Glass MCP or equivalent platform service that materially contributes to Cursor's ability to operate.

Classify which are:

- control-plane interfaces
- execution interfaces
- intelligence interfaces
- document interfaces
- application-specific interfaces
- machine/runtime interfaces

Make Claude capable of discovering and using the appropriate interfaces **without duplicated MCP implementations**.

Claude must respect MCP authorization, schemas, contracts, receipts, and failure behavior exactly as other agents do.

Where an MCP capability is currently tied to Cursor assumptions, identify and remove the client-specific coupling where safe.

---

## Platform Intelligence parity

Claude must use Platform Intelligence before expensive raw discovery.

Preserve the existing retrieval philosophy:

- trusted indexes first
- currentness/provenance awareness
- direct connection where applicable
- cache reuse where trustworthy
- raw scans only when required

Claude must emit the same retrieval/currentness codes used elsewhere (`INDEX_HIT`, `CACHE_HIT`, `DIRECT_CONNECT_HIT`, etc.) — not invent its own telemetry vocabulary.

---

## Intelligence Hub parity

Claude must consume and publish through canonical Intelligence Hub interfaces:

- resolve the Hub correctly by platform/runtime
- read approved intelligence
- publish governed findings
- bind evidence to sessions/work packages/SHAs
- participate in overnight/Night Owl session folders
- publish failure intelligence
- publish mechanism-performance intelligence
- create closeout evidence

**No direct ad hoc writes** merely to make Claude work.

Preserve staging → ingestion → publication → canonical intelligence boundaries.

**Fail closed** if Hub authority cannot be established.

---

## Application Bible and domain intelligence

Claude must use the same authoritative application/domain knowledge surfaces other agents use.

Understand constitutional/reference material versus generated intelligence.

**Do not copy Bible content into Claude-specific stores.** Shared intelligence, not replicated intelligence.

---

## WaveRunner integration

Claude must participate in existing WaveRunner execution — not a Claude-only orchestration protocol.

Investigate how WaveRunner defines missions, assigns workers, establishes work packages, tracks waves, records receipts, handles failures, determines continuation, and validates completion.

Make Claude usable as an approved agent/runtime within those mechanisms where compatible.

---

## Night Owl integration

Night Owl must be **client-neutral**.

Claude must be able to receive:

```text
Run the Night Owl Protocol regarding <MILESTONE>
```

and enter the same protocol defined for the Capital Glass estate.

Mandatory mode-selection gate:

- `NIGHT_OWL_RESEARCH`
- `NIGHT_OWL_BUILD`
- `NIGHT_OWL_COMPOUND`

Standard lifecycle:

```text
mode → session identity → target admission → Night Owl branch → matched Hub session
→ four Luna workers → bounded waves → checkpoints → closeout → unification manifest
```

**Do not create `CLAUDE_NIGHT_OWL`.** There is one Night Owl protocol.

---

## Multi-agent integration

Claude must operate with Capital Glass multi-agent patterns:

- supervise where authorized
- act as worker, investigator, verifier
- participate in Luna-first execution
- consume durable receipts from other agents
- continue existing sessions without restarting discovery

Preserve session and experiment identities across agent handoffs.

---

## Continuation and durable memory

Claude must not repeatedly rediscover the estate from scratch.

Integrate with existing durable continuation mechanisms using receipts, Hub intelligence, Platform Intelligence, and session artifacts — **not** an opaque Claude-only memory system.

---

## Runtime and machine parity

Claude must understand and use the authorized runtime estate:

- local Linux / WSL execution
- Windows interactive execution
- Ryzen execution
- GPU availability
- remote runners
- network-mounted authoritative storage

Request/dispatch work through established mechanisms — not hard-coded machine names in domain logic.

**Default dev/agent path: WSL2 Ubuntu bash on ext4 (`/home/wesley/repos`) — not Windows PowerShell/CMD.**

---

## Secrets and authentication

Do not scatter new credentials across repositories.

Use existing secret/configuration authorities (Doppler, IT Vault policy). Keep credentials out of source, logs, Hub artifacts, receipts, and prompts.

New trust relationships must be explicit platform capabilities with documented scope.

---

## Receipts and provenance

Claude work must be as auditable as any other Capital Glass agent work.

Use established receipt formats. **No separate Claude receipt universe.**

Record: operator, **client surface**, work package, session, agent, repository, branch, SHAs, tests, artifacts, upstream intelligence, disposition, publication status.

---

## Failure intelligence

Claude failures feed the same Failure Intelligence system used by Cursor and other agents.

---

## Execution intelligence

Feed measurable mechanism/speed results into the existing mechanism-performance intelligence system. Do not hard-code conclusions.

---

## Human operator experience

Existing high-level commands must remain recognizable:

- *Investigate the estimating spine.*
- *Run WaveRunner regarding &lt;milestone&gt;.*
- *Run Night Owl regarding &lt;milestone&gt;.*
- *Continue the previous operation.*
- *Check Platform Intelligence first.*
- *Use Ryzen for this lane.*
- *Prepare this for merge.*

Claude translates operator intents into existing Capital Glass platform mechanisms.

---

## Client-neutral platform interfaces

Identify capabilities accidentally available only because Cursor provides them. Extract to durable Capital Glass interfaces supporting Cursor, Claude, and future client surfaces.

---

## Safety and authority

Claude does **not** receive broader authority because this mission seeks feature parity.

Preserve: control-plane admission, target-repo admission, production locks, human promotion gates, branch protection, immutable PASS evidence, canonical-source rules, write ownership, one-active-writer policies, STOP/HOLD, rollback/recovery.

If Cursor succeeds only by bypassing a boundary, identify that as **technical debt** — do not reproduce the bypass.

---

## Do not regress Cursor

Claude integration is **additive**. Run parity/regression proof across both client surfaces when generalizing a capability.

---

## Integration coverage matrix

Maintain `CLAUDE_INTEGRATION_COVERAGE_MATRIX_V1.json` in this folder.

For each capability determine Claude status:

`DISCOVERED` | `CONNECTED` | `PROVEN` | `BLOCKED` | `NOT_APPLICABLE`

**Do not claim full-estate parity from a few happy-path examples.**

See Phase 0 discovery report: `CLAUDE_INTEGRATION_DISCOVERY_PHASE0_V1.md`

---

## Proof strategy (phased)

1. Read-only discovery and intelligence retrieval
2. Controlled repository interaction
3. Governed mutation in safe fixture / bounded work package
4. Git/GitHub lifecycle
5. Hub publication
6. Continuation
7. WaveRunner participation
8. Night Owl participation
9. Cross-repository mission

Prefer existing fixtures. **No production mutation merely to demonstrate capability.**

---

## Final acceptance

Do not close merely because Claude can open repositories or run shell commands.

Produce an explicit final capability matrix and receipts showing which integrations are genuinely proven.

A successful closeout demonstrates Claude can:

- enter through governed admission
- retrieve trusted intelligence
- understand repository and application authority
- work safely in authorized repositories
- use Capital Glass MCP capabilities
- interact with Git/GitHub through approved paths
- consume and publish Intelligence Hub evidence
- participate in WaveRunner and Night Owl
- operate with multi-agent workflows
- use runtime/machine dispatch where authorized
- continue from durable evidence
- produce standard receipts and closeouts
- preserve governance and human promotion boundaries

**Most importantly:** Claude and Cursor consume the **same Capital Glass platform** — not two independent versions.

At closeout, identify remaining capability differences explicitly and rank by ROI.

---

## Related documents (this folder)

| Document | Role |
| --- | --- |
| `CLAUDE_INTEGRATION_DISCOVERY_PHASE0_V1.md` | Initial estate discovery — Cursor→authority tracing |
| `CLAUDE_INTEGRATION_COVERAGE_MATRIX_V1.json` | Machine-readable parity matrix |
| `CLAUDE_ESTATE_AWARENESS_PACK_v1.md` | Phase 0 onboarding (awareness only — not full parity) |
| `CLAUDE_WSL_EXECUTION_POLICY.md` | WSL-not-Windows-shell execution policy |
| `CLAUDE_SETUP_CHECKLIST.md` | Operator setup for Claude Project knowledge |

---

## Agent Fast Path

- **Charter:** this file
- **Matrix:** `CLAUDE_INTEGRATION_COVERAGE_MATRIX_V1.json`
- **Discovery:** `CLAUDE_INTEGRATION_DISCOVERY_PHASE0_V1.md`
- **Phase 0 status:** awareness pack exists; full platform parity **not proven**
- **Next:** establish `clientSurface=CLAUDE` in receipts; platform-neutral CLI/MCP admission bridge
- **Owner execution:** `CG-AppBuilder-MCP`; coordination: `CapitalGlass-Cross-Agent`
