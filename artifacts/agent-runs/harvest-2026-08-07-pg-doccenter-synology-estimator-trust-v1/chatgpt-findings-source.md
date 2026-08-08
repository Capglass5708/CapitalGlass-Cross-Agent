# ChatGPT Findings Source — `harvest-2026-08-07-pg-doccenter-synology-estimator-trust-v1`

## 1. Final summary + verdict

**Mission:** `chat-thread-closeout-autopsy-harvest-chatgpt-v1`  
**Lane:** `CHAT_CONTEXT_ONLY`  
**Protocol:** v2.1  
**Execution mode:** `DRAFT_FILE`  
**Source:** visible conversation + attached protocol only  
**Harvest tier:** T2  
**Start verdict:** `UNHARVESTED_THREAD`  
**Artifact verdict before Git gate:** `DRAFT_READY`  
**Closeout target:** `CHATGPT_SOURCE_PUBLISHED` after remote Git verification; never `HARVEST_COMPLETE` in ChatGPT.

This thread contains durable evidence across two tightly coupled but distinct Proposal Generator lanes:

1. **Synology / Document Center → Proposal Generator report-trust spine** — the operator repeatedly clarified this was the original active work. The thread records 13 canonical Reports subfolders, Wave 0 Document Center intake, PG Waves A–C, stale General Elevation re-apply, production binding proof, and a later hosted report-trust PASS on the unified candidate head.
2. **Estimator-trust closure** — a separate lane discovered and partially repaired harness, preview pricing, editable-workspace persistence, hydration, deployment, and pilot-reset defects. The thread ends with report-trust green while estimator-trust remains open because native client persistence and reload hydration still fail in production.

The most important compounding lesson is that **success/failure must remain scoped to the work package**. Report-trust PASS did not imply estimator-trust PASS, and estimator failures did not justify reopening the already-proven Document Center/Synology architecture.

## 2. Harvest tier rationale

T2 is appropriate because the thread contains multiple durable system lessons, cross-repo authority transitions, deployment truth issues, operator/agent friction, verified successes, unresolved product defects, and concrete candidates for Gold Mine classification. It is more than a simple closeout note, but it does not require a new architecture synthesis beyond observed evidence.

## 3. Retrieval preflight

Per the attached ChatGPT harvest protocol, pasted retrieval/cache labels are not authoritative in this lane unless executed by ChatGPT in-session.

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN_BEFORE_GIT_GATE
```

The thread contains user-pasted strings such as `INDEX_HIT_AI_CACHE`, but these are treated as thread evidence, not as ChatGPT-verified retrieval state.

## 4. Thread event inventory

### EVT-001 — Active Proposal Generator state initially framed as estimator-trust closure
The operator supplied PG repo state: `origin/main` at `36f43fbe`, production at `e8349a97` on `work/synology-proposal-report-trust-spine-v1-wave-abc`, Bible handoff stale, report-trust Waves A–C in production, and estimator-trust closure still unproven.

### EVT-002 — Estimator-trust hosted gate failed with three distinct signals
The production E2E run showed baseline UI/server `$5,545.44`, first edit UI/server `$10,957.94` only after `persistVia=server-sync`, preview in-session `$0.00`, and a harness failure caused by reading Pricing DOM while still on `/preview` after cache clear/reload.

### EVT-003 — First recovery classification separated harness vs product defects
The thread separated H1 harness navigation, P1 native editable-workspace persistence, and P2 Preview working-price authority rather than treating the failure as a single test bug.

### EVT-004 — Operator corrected the active historical thread back to Document Center / Synology / Reports
The operator explicitly stated that the work being resumed was the Document Center/Synology/Reports effort. Git cross-check then re-established the report-trust work as the newer production line and identified the estimator lane as orthogonal follow-on work.

### EVT-005 — Document Center / Synology Wave 0 state re-established
The thread identified the upstream path: 13 canonical `01 - Estimating/05 - Reports` discipline subfolders, recursive Reports-tree intake, path-authoritative classification, loose-file policy, and Beacon Hill 7/7 proof harness. The report trust package was recognized as a cross-repo pipeline rather than PG-only maintenance.

### EVT-006 — PG report-trust Waves A–C recognized as production branch work
The production branch was described as carrying verify-population, single-parser convergence, stale General Elevation re-apply, production readback/binding proof, and report population receipts. `main` remained behind.

### EVT-007 — Estimator recovery Waves A–C implemented on top of report-trust production base
The recovery branch `work/pg-estimator-trust-closure-recovery-v1` was based on `e8349a97`, preserving report-trust history. Commits addressed H1 harness navigation/selector, P2 derived pricing summary sync, and P1 persist signature/stale-write retry/materialization behavior. Unit tests and proposal rollup gate passed, while hosted proof remained pending.

### EVT-008 — Vercel deployment status initially appeared failed
The thread observed GitHub/Vercel failures on the recovery head and correctly avoided running hosted closure against stale production.

### EVT-009 — Deployment root cause was identity, not build
The operator later reported that `f872be05` was blocked by an unverified commit author, not code/build failure. A–C were rebased with `Capital Glass Agent <wesley@capitalglasstx.com>` producing `eb3e92bd`; staging and production checks became successful.

### EVT-010 — GitHub “production success” was not sufficient production truth
Despite GitHub success, the deployment target was `null` and the live domain still served `e8349a97`. An explicit `vercel promote` was required. The operator then verified `https://proposal.capitalglasstxapps.com/api/version` returned `eb3e92bd`.

### EVT-011 — Report-trust production proof passed on the unified candidate head
The operator ran `proof:beacon-hill-wave-abc:production-http:doppler` and reported `PASS @ eb3e92bd`, establishing that Synology / Document Center → PG population/binding had not regressed after estimator recovery changes.

### EVT-012 — Estimator-trust remained open after deployment
Hosted estimator closure still failed: first edit required `server-sync`; after cache clear/reload `/pricing`, UI was `$0.00` while server stayed `$10,957.94`; Preview after reload/reset fell back to `$5,545.44`; approval stage was blocked because the pilot remained already approved.

### EVT-013 — Wave D scope narrowed to three remaining concerns
The next work was correctly narrowed to P1 native client PUT convergence, P2 durable reload hydration, and H2 deterministic pilot approval reset. Report-trust architecture was explicitly out of scope unless a regression was observed.

## 5. Harvest packets

### HP-001 — Active-milestone lane drift
- **kind:** failure-pattern
- **goldMineSignalClass:** `AGENT_FRICTION_SIGNAL`
- **implementationState:** `OBSERVED_OPEN`
- **novelty:** `RECURRENCE`
- **evidenceRefs:** `EVT-001`, `EVT-004`
- **finding:** The conversation drifted from the operator’s Document Center/Synology/report-trust work into estimator-trust closure. The operator had to explicitly correct the active work package.
- **durable lesson:** Agent context should lock the active milestone/work package and distinguish adjacent orthogonal lanes before proposing next actions.

### HP-002 — Production branch / main / Bible authority split
- **kind:** failure-pattern
- **goldMineSignalClass:** `OPERATOR_FRICTION_SIGNAL`
- **implementationState:** `OBSERVED_OPEN`
- **novelty:** `RECURRENCE`
- **evidenceRefs:** `EVT-001`, `EVT-006`, `EVT-007`
- **finding:** Production report-trust work existed ahead of `main`, while the Bible handoff was stale. This increased branch archaeology and context confusion.
- **durable lesson:** Production, Git main, and Bible authority should converge immediately after gated closure, but not before proof.

### HP-003 — Synology Reports discipline-folder intake succeeded as an upstream trust boundary
- **kind:** lesson
- **goldMineSignalClass:** `SUCCESS_PATTERN`
- **implementationState:** `ADOPTED`
- **novelty:** `RESOLUTION_EVIDENCE`
- **evidenceRefs:** `EVT-005`, `EVT-011`
- **finding:** Recursive subfolder discovery + path-authoritative classification + DC versioning formed a reliable upstream boundary for PG report population.
- **durable lesson:** Preserve the Document Center as intake/version authority; downstream PG verification should consume versioned DC sources rather than rediscovering Synology independently.

### HP-004 — Report-trust and estimator-trust must have independent closure verdicts
- **kind:** lesson
- **goldMineSignalClass:** `SUCCESS_PATTERN`
- **implementationState:** `ADOPTED`
- **novelty:** `NEW`
- **evidenceRefs:** `EVT-011`, `EVT-012`, `EVT-013`
- **finding:** The thread correctly retained report-trust PASS while estimator-trust remained FAIL/BLOCKED.
- **durable lesson:** Cross-cutting deployments should run regression proofs per trust spine and preserve independent verdicts instead of collapsing application health to one label.

### HP-005 — Vercel commit-author verification can block deploy before build semantics matter
- **kind:** failure-pattern
- **goldMineSignalClass:** `AGENT_FRICTION_SIGNAL`
- **implementationState:** `VERIFIED_FIXED`
- **novelty:** `RESOLUTION_EVIDENCE`
- **evidenceRefs:** `EVT-008`, `EVT-009`
- **finding:** Recovery code was initially classified as deploy-failed, but the root cause was an unverified commit author. Rebase with an approved identity cleared the blocker.
- **durable lesson:** Add commit-author/identity preflight before waiting on Vercel deploy checks.

### HP-006 — Vercel status success did not prove live production alias
- **kind:** failure-pattern
- **goldMineSignalClass:** `OBSERVABILITY_GAP`
- **implementationState:** `VERIFIED_FIXED`
- **novelty:** `NEW`
- **evidenceRefs:** `EVT-010`
- **finding:** GitHub displayed production success while the deploy was effectively preview (`target: null`) and the canonical domain still served the old SHA.
- **durable lesson:** Production closeout must verify the live alias and runtime version (`/api/version`) rather than trusting provider check labels alone.

### HP-007 — Native editable-workspace pricing persistence remains broken in hosted production
- **kind:** failure-pattern
- **goldMineSignalClass:** `PROBLEM_SIGNAL`
- **implementationState:** `BLOCKED`
- **novelty:** `REGRESSION`
- **evidenceRefs:** `EVT-002`, `EVT-007`, `EVT-012`
- **finding:** Code/unit improvements did not produce hosted native convergence; first edit still required authorized `server-sync` after the 30-second client window.
- **durable lesson:** Successful local/unit state-machine behavior is insufficient; hosted persistence must prove the ordinary client PUT path and revision lifecycle.

### HP-008 — Durable server pricing is lost/ignored during browser reload hydration
- **kind:** failure-pattern
- **goldMineSignalClass:** `PROBLEM_SIGNAL`
- **implementationState:** `BLOCKED`
- **novelty:** `REGRESSION`
- **evidenceRefs:** `EVT-012`
- **finding:** Server remained `$10,957.94`, but after local cache clear `/pricing` UI became `$0.00` and Preview returned to `$5,545.44`.
- **durable lesson:** When local cache is absent and current editable-workspace pricing is valid, server editable workspace must outrank zero/default/history fallback state.

### HP-009 — E2E fixture approval state is nondeterministic
- **kind:** failure-pattern
- **goldMineSignalClass:** `AGENT_FRICTION_SIGNAL`
- **implementationState:** `OBSERVED_OPEN`
- **novelty:** `NEW`
- **evidenceRefs:** `EVT-012`, `EVT-013`
- **finding:** The 360 Power pilot remained approved from prior runs; the revoke helper did not leave a verified unapproved precondition.
- **durable lesson:** Stateful hosted E2E fixtures require explicit reset + readback verification before testing lifecycle transitions.

### HP-010 — Authorized server-sync fallback was useful diagnostic scaffolding but cannot define closure
- **kind:** lesson
- **goldMineSignalClass:** `SUCCESS_PATTERN`
- **implementationState:** `ADOPTED`
- **novelty:** `NEW`
- **evidenceRefs:** `EVT-002`, `EVT-012`
- **finding:** The fallback kept the flow moving enough to reveal Preview/hydration defects while still exposing `persistVia=server-sync` as failure evidence.
- **durable lesson:** Recovery helpers are valuable when they are explicitly labeled and closure rules forbid them from masquerading as native success.

### HP-011 — Production regression proof protected the already-closed report-trust spine
- **kind:** lesson
- **goldMineSignalClass:** `SUCCESS_PATTERN`
- **implementationState:** `ADOPTED`
- **novelty:** `RESOLUTION_EVIDENCE`
- **evidenceRefs:** `EVT-011`, `EVT-013`
- **finding:** After estimator changes and deployment, the Beacon Hill production HTTP proof was rerun before proceeding.
- **durable lesson:** Shared-state changes should rerun the closest upstream/downstream trust proof before declaring unrelated architecture broken.

### HP-012 — Recovery branch ancestry preserved report-trust authority while adding estimator fixes
- **kind:** lesson
- **goldMineSignalClass:** `SUCCESS_PATTERN`
- **implementationState:** `ADOPTED`
- **novelty:** `NEW`
- **evidenceRefs:** `EVT-007`, `EVT-011`
- **finding:** Estimator recovery was based on the report-trust production head rather than stale `main`, keeping one linear candidate history.
- **durable lesson:** When production is ahead of main, urgent recovery should branch from the proven production authority and reconcile main only after proof.

### HP-013 — Bible refresh was intentionally withheld until full trust closure
- **kind:** lesson
- **goldMineSignalClass:** `SUCCESS_PATTERN`
- **implementationState:** `ADOPTED`
- **novelty:** `KNOWN_EXISTING`
- **evidenceRefs:** `EVT-001`, `EVT-007`, `EVT-012`
- **finding:** The thread repeatedly held `main` and Bible updates until hosted estimator closure could prove the intended state.
- **durable lesson:** Documentation authority should not be refreshed to an intermediate failed runtime state unless recording a formal failure handoff.

## 6. Execution deltas

### ED-001 — Report-trust authority advanced beyond stale main
- **before:** `main` at `36f43fbe`; production/report trust at `e8349a97`; Bible stale.
- **after:** unified recovery candidate built on report-trust production lineage and eventually deployed at `eb3e92bd`.
- **evidence:** operator-provided Git/deploy reports in thread.

### ED-002 — Estimator harness/product fixes implemented but not fully proven
- **before:** wrong-route Pricing assertion, ambiguous Preview cover selector, stale derived summary, weak persist retry semantics.
- **after:** Waves A–C implemented with unit tests and rollup gate PASS.
- **residual:** hosted client persistence and reload hydration still failed.

### ED-003 — Deployment classification refined
- **before:** Vercel checks interpreted as deploy failure.
- **after:** root cause identified as commit-author verification, then separate production-alias promotion gap discovered.

### ED-004 — Live production truth established by version endpoint
- **before:** provider status did not guarantee canonical domain version.
- **after:** live `/api/version` reported `eb3e92bd` after explicit promote.

### ED-005 — Report-trust retained PASS while estimator-trust stayed open
- **before:** risk of conflating the two lanes.
- **after:** production report proof PASS and estimator E2E FAIL were retained as independent truths.

## 7. Observed improvement outcomes

### OUT-001 — Synology/DC → PG report-trust production closure held through estimator changes
- **beforeState:** report-trust production line existed but needed protection while estimator recovery modified shared PG state.
- **afterState:** Beacon Hill Wave ABC production HTTP proof reported PASS at `eb3e92bd`.
- **measurableChange:** report-trust regression check remained green after new recovery commits and production promotion.
- **proof:** operator-reported hosted proof command/result.
- **remainingResidual:** `main`/Bible reconciliation still gated on estimator closure.
- **improvementProven:** true

### OUT-002 — Deployment identity blocker resolved
- **beforeState:** Vercel checks failed on `f872be05`.
- **afterState:** rebased recovery commits used approved `Capital Glass Agent <wesley@capitalglasstx.com>` identity; checks succeeded on `eb3e92bd`.
- **measurableChange:** staging + production status changed from failure to success.
- **proof:** operator-provided deploy report.
- **remainingResidual:** deploy status alone still did not promote canonical production alias.
- **improvementProven:** true

### OUT-003 — Production alias truth repaired
- **beforeState:** GitHub “production success” had `target: null`; live domain still served `e8349a97`.
- **afterState:** explicit `vercel promote`; `/api/version` returned `eb3e92bd`.
- **measurableChange:** canonical live domain moved to the intended recovery SHA.
- **proof:** runtime version endpoint reported in thread.
- **remainingResidual:** automated alias-binding verification absent.
- **improvementProven:** true

### OUT-004 — Harness navigation/Preview selector improved
- **beforeState:** test queried Pricing DOM while on `/preview`; in-session cover reader logged `$0.00`.
- **afterState:** route fix + `proposal-cover-working-value` contract; later hosted run showed Preview in-session `$10,957.94`.
- **measurableChange:** in-session Preview working value matched edited server/UI total.
- **proof:** later hosted estimator run.
- **remainingResidual:** reload/reset Preview still reverted to baseline.
- **improvementProven:** true

### OUT-005 — Client persistence recovery code implemented but hosted product outcome not proven
- **beforeState:** persist signature/revision behavior identified as weak.
- **afterState:** unit tests/gates passed after signature timing, stale-write retry, payload materialization, and conflict handling changes.
- **measurableChange:** 19/19 targeted tests PASS; hosted first edit still `server-sync`.
- **proof:** operator-provided unit and hosted results.
- **remainingResidual:** native client convergence fails in production.
- **improvementProven:** false

### OUT-006 — Reload hydration fix remains incomplete
- **beforeState:** Preview/summary authority inconsistent.
- **afterState:** in-session Preview improved, but cleared-cache reload still produced Pricing `$0.00` and Preview baseline `$5,545.44` against server `$10,957.94`.
- **measurableChange:** partial improvement only.
- **proof:** hosted Wave D precondition run.
- **remainingResidual:** server editable-workspace authority is lost/ignored during hydration.
- **improvementProven:** false

## 8. Waste ledger

### TW-001 — Cross-lane context drift
Time/attention was spent on estimator-trust recommendations while the operator intended to resume the Document Center/Synology/report-trust thread. A durable active-work-package lock would reduce this re-entry cost.

### TW-002 — Branch archaeology caused by stale main/Bible
Production, main, and handoff state differed, requiring repeated reconstruction of which branch actually carried report-trust authority.

### TW-003 — Vercel failure label initially hid identity root cause
The deployment problem was not a build failure. A commit-author preflight could have prevented an unnecessary deployment-debug branch.

### TW-004 — “Production success” label required manual second verification
Provider status suggested success while the canonical domain remained on the old SHA, leading to an additional promote/debug cycle.

### TW-005 — Full hosted E2E reached a stale approval fixture
The flow later blocked on already-approved state. Deterministic reset should happen before expensive product stages.

### TW-006 — Client persist failure currently waits 30 seconds before diagnostic fallback
The fallback is useful, but absent instrumentation means repeated hosted runs spend time waiting without exposing the suppression/failure reason.

## 9. Duplication detector

### DUP-001 — Report-trust vs estimator-trust work package conflation
- **stableIdentity:** `synology-proposal-report-trust-spine-v1` vs `pg-estimator-trust-closure-recovery-v1`
- **classification:** `NEEDS_REGISTRY_LOOKUP_FIRST`
- **note:** These are not duplicates; they are adjacent trust spines. Future harvest/Gold Mine logic must not merge them based only on “Proposal Generator trust” wording.

### DUP-002 — Repeated persistence defect discussion
- **stableIdentity:** `pg-pricing-editable-workspace-persist-v1` / hosted native persistence failure
- **classification:** `NEEDS_REGISTRY_LOOKUP_FIRST`
- **note:** Multiple observations are recurrence/resolution evidence for the same underlying candidate, not new independent candidates unless root cause materially changes.

### DUP-003 — Repeated authority drift observations
- **stableIdentity:** work-package authority split (`main`, production branch, Bible handoff)
- **classification:** `NEEDS_REGISTRY_LOOKUP_FIRST`
- **note:** Preserve separate evidence for Git drift, Bible staleness, and production alias drift; deduplicate only exact same mechanism.

## 10. Operator friction

### OF-001 — Repeated need to restate the active lane
The operator had to correct that the current historical work was Document Center/Synology/Reports rather than general PG/estimator maintenance.

### OF-002 — Live authority was distributed across `main`, production branch, recovery branch, and Bible
This made “where are we?” expensive to answer and increased risk of acting on stale authority.

### OF-003 — Deployment provider status did not equal canonical-domain status
The operator had to discover and run `vercel promote` manually after a misleading production-success signal.

### OF-004 — Commit author identity blocked deployment
The branch had to be rebased solely to use a verified author identity.

### OF-005 — Stateful E2E pilot required manual reasoning about prior approval
Previous test runs polluted the next run’s lifecycle preconditions.

## 11. Observability gaps

### OG-001 — Native client persist failure reason is not exposed
- **whatWeNeededToKnow:** Why the ordinary editable-workspace PUT does not converge within 30 seconds.
- **whyItWasNotObservable:** E2E only observed timeout/fallback, not exact persist trigger, suppression, request status, revision, or retry outcome.
- **workflow:** Proposal Generator Mark Up Report → editable workspace.
- **missingMetricOrReceipt:** persistence attempt log with pricing signature, expected/returned `updatedAt`, HTTP status, retry/suppression reason.
- **recommendedInstrumentation:** bounded structured persist telemetry keyed by project + attempt, excluding sensitive payloads.
- **goldMineSignalClass:** `OBSERVABILITY_GAP`

### OG-002 — Reload hydration authority transition is not observable
- **whatWeNeededToKnow:** Where server `$10,957.94` becomes browser `$0.00` / Preview `$5,545.44`.
- **whyItWasNotObservable:** No stage receipt reports local cache presence, server pricing, selected hydration source, merge result, or fallback reason.
- **workflow:** editable-workspace GET → hydration merge → Pricing/Preview.
- **missingMetricOrReceipt:** hydration authority trace.
- **recommendedInstrumentation:** structured pre/post merge totals + authority source + rejection/fallback reason.
- **goldMineSignalClass:** `OBSERVABILITY_GAP`

### OG-003 — Vercel status lacked canonical alias truth
- **whatWeNeededToKnow:** Whether `proposal.capitalglasstxapps.com` actually served the target commit.
- **whyItWasNotObservable:** “Production success” represented a deploy with `target: null`.
- **workflow:** GitHub/Vercel production deploy.
- **missingMetricOrReceipt:** canonical alias target SHA/URL and runtime `/api/version` match.
- **recommendedInstrumentation:** deployment closeout gate requiring live alias + version equality.
- **goldMineSignalClass:** `OBSERVABILITY_GAP`

### OG-004 — Approval revoke helper did not prove postcondition
- **whatWeNeededToKnow:** Whether 360 Power was definitely unapproved before the approval test.
- **whyItWasNotObservable:** helper could return without a verified readback.
- **workflow:** estimator-trust E2E setup.
- **missingMetricOrReceipt:** approval GET → revoke result → GET verification.
- **recommendedInstrumentation:** explicit setup receipt and fail-fast on residual approval.
- **goldMineSignalClass:** `OBSERVABILITY_GAP`

### OG-005 — No single PG authority receipt combined Git, deploy, alias, report proof, and estimator proof
- **whatWeNeededToKnow:** The exact authoritative candidate state without reconstructing several reports.
- **whyItWasNotObservable:** each layer emitted separate status.
- **workflow:** PG closeout.
- **missingMetricOrReceipt:** consolidated trust-spine closeout receipt.
- **recommendedInstrumentation:** one generated read-only closeout manifest referencing each independent proof rather than collapsing verdicts.
- **goldMineSignalClass:** `OBSERVABILITY_GAP`

## 12. Success patterns

### SUCCESS_PATTERN-001 — Use production proof after shared-state changes
After deploying estimator changes, rerunning Beacon Hill report-trust proof protected the upstream/downstream report spine from accidental regression.

### SUCCESS_PATTERN-002 — Do not promote `main` or Bible before hosted closure
The thread consistently withheld Git/Bible authority promotion while estimator behavior remained unproven.

### SUCCESS_PATTERN-003 — Branch recovery from proven production authority
Basing estimator recovery on `e8349a97` preserved report-trust A–C and enabled one linear candidate head.

### SUCCESS_PATTERN-004 — Recovery fallback remained visible in verdicts
`server-sync` enabled deeper diagnosis without being accepted as native persistence success.

### SUCCESS_PATTERN-005 — Operator correction + Git cross-check restored correct lane quickly
When the conversation drifted, explicit operator correction followed by Git inspection prevented further work on the wrong historical package.

## 13. ROI backlog

All distinct candidates are surfaced; low-value/deferred items are retained for operator/Data-Extraction review rather than suppressed.

### ROI-001 — Native editable-workspace persistence observability + hosted convergence
- **operatorValue:** high
- **businessValue:** high
- **platformValue:** high
- **agentValue:** high
- **reliabilityValue:** high
- **automationLeverage:** high
- **estimatedComplexity:** medium
- **blastRadius:** medium
- **confidence:** high
- **evidenceDiversity:** high (unit + hosted + repeated runs)
- **rootCauseLeverage:** high
- **goldMineSignalClass:** `PROBLEM_SIGNAL`
- **novelty:** `REGRESSION`
- **businessImpact:** estimator edits can appear correct in-session but fail durable persistence.

### ROI-002 — Server-authoritative reload hydration invariant
- **operatorValue:** high
- **businessValue:** high
- **platformValue:** high
- **agentValue:** medium
- **reliabilityValue:** high
- **automationLeverage:** high
- **estimatedComplexity:** medium
- **blastRadius:** high
- **confidence:** high
- **evidenceDiversity:** medium
- **rootCauseLeverage:** high
- **goldMineSignalClass:** `PROBLEM_SIGNAL`
- **novelty:** `REGRESSION`
- **businessImpact:** persisted estimator pricing can disappear from the working UI/Preview after cache reset/reload.

### ROI-003 — Canonical Vercel alias/version deployment gate
- **operatorValue:** high
- **businessValue:** medium
- **platformValue:** high
- **agentValue:** high
- **reliabilityValue:** high
- **automationLeverage:** high
- **estimatedComplexity:** low
- **blastRadius:** low
- **confidence:** high
- **evidenceDiversity:** medium
- **rootCauseLeverage:** high
- **goldMineSignalClass:** `OBSERVABILITY_GAP`
- **novelty:** `NEW`
- **businessImpact:** prevents false production-closeout claims when canonical domain still serves an older SHA.

### ROI-004 — Commit-author identity preflight for Vercel-bound branches
- **operatorValue:** medium
- **businessValue:** low
- **platformValue:** medium
- **agentValue:** high
- **reliabilityValue:** medium
- **automationLeverage:** high
- **estimatedComplexity:** low
- **blastRadius:** low
- **confidence:** high
- **evidenceDiversity:** low
- **rootCauseLeverage:** medium
- **goldMineSignalClass:** `AGENT_FRICTION_SIGNAL`
- **novelty:** `RESOLUTION_EVIDENCE`
- **businessImpact:** avoids deploy/rebase delay caused by unverified author metadata.

### ROI-005 — Deterministic hosted E2E pilot reset with verified approval postcondition
- **operatorValue:** medium
- **businessValue:** medium
- **platformValue:** medium
- **agentValue:** high
- **reliabilityValue:** high
- **automationLeverage:** high
- **estimatedComplexity:** low
- **blastRadius:** low
- **confidence:** high
- **evidenceDiversity:** low
- **rootCauseLeverage:** medium
- **goldMineSignalClass:** `AGENT_FRICTION_SIGNAL`
- **novelty:** `NEW`
- **businessImpact:** reduces false E2E failures and repeated manual pilot cleanup.

### ROI-006 — Active-work-package / lane lock in agent handoff
- **operatorValue:** high
- **businessValue:** low
- **platformValue:** medium
- **agentValue:** high
- **reliabilityValue:** medium
- **automationLeverage:** medium
- **estimatedComplexity:** low
- **blastRadius:** low
- **confidence:** high
- **evidenceDiversity:** medium
- **rootCauseLeverage:** medium
- **goldMineSignalClass:** `AGENT_FRICTION_SIGNAL`
- **novelty:** `RECURRENCE`
- **businessImpact:** reduces context-recovery time and wrong-lane execution.

### ROI-007 — Consolidated PG trust-spine closeout manifest
- **operatorValue:** medium
- **businessValue:** low
- **platformValue:** high
- **agentValue:** high
- **reliabilityValue:** medium
- **automationLeverage:** high
- **estimatedComplexity:** medium
- **blastRadius:** low
- **confidence:** medium
- **evidenceDiversity:** high
- **rootCauseLeverage:** medium
- **goldMineSignalClass:** `OBSERVABILITY_GAP`
- **novelty:** `NEW`
- **businessImpact:** reduces manual reconstruction of report-trust, estimator-trust, Git, and deploy states.

### ROI-008 — Post-closeout automatic fast-forward/Bible freshness workflow
- **operatorValue:** medium
- **businessValue:** low
- **platformValue:** medium
- **agentValue:** high
- **reliabilityValue:** medium
- **automationLeverage:** high
- **estimatedComplexity:** medium
- **blastRadius:** medium
- **confidence:** medium
- **evidenceDiversity:** medium
- **rootCauseLeverage:** medium
- **goldMineSignalClass:** `OPERATOR_FRICTION_SIGNAL`
- **novelty:** `KNOWN_EXISTING`
- **businessImpact:** reduces stale-main/stale-handoff drift after a proven production closure.

### ROI-009 — Mandatory report-trust regression proof for shared PG workspace changes
- **operatorValue:** medium
- **businessValue:** medium
- **platformValue:** medium
- **agentValue:** medium
- **reliabilityValue:** high
- **automationLeverage:** medium
- **estimatedComplexity:** low
- **blastRadius:** low
- **confidence:** high
- **evidenceDiversity:** medium
- **rootCauseLeverage:** medium
- **goldMineSignalClass:** `SUCCESS_PATTERN`
- **novelty:** `ADOPTION_SIGNAL`
- **businessImpact:** protects the Synology/DC→PG report spine while unrelated Proposal Generator state logic evolves.

### ROI-010 — Preserve independent trust-spine verdicts in dashboards/ledgers
- **operatorValue:** medium
- **businessValue:** medium
- **platformValue:** high
- **agentValue:** high
- **reliabilityValue:** high
- **automationLeverage:** medium
- **estimatedComplexity:** medium
- **blastRadius:** medium
- **confidence:** high
- **evidenceDiversity:** medium
- **rootCauseLeverage:** medium
- **goldMineSignalClass:** `SUCCESS_PATTERN`
- **novelty:** `NEW`
- **businessImpact:** prevents a green report spine from hiding estimator failures or vice versa.

## 14. Product-workflow coverage

| Domain | Coverage | Thread evidence |
| --- | --- | --- |
| Computer Estimator | NOT_OBSERVED | No direct CE workflow evidence |
| Human Estimator | NOT_OBSERVED | PG estimator UX observed, but not Human Estimator app/MCP |
| Document Center | OBSERVED | Reports subfolder intake, DC source/version authority |
| plan-set processing | NOT_OBSERVED | No plan-set/OCR lane execution in this thread |
| OCR/parser | NOT_OBSERVED | Report parser authority discussed, but no OCR workflow observed |
| Revu/Bluebeam | NOT_OBSERVED | No direct use |
| Bid Composer | NOT_OBSERVED | No direct use |
| proposals | OBSERVED | PG Preview, pricing, approval, issued output, drift |
| VAE | NOT_OBSERVED | No direct use |
| Scraper | NOT_OBSERVED | No direct use |
| cross-app handoffs | OBSERVED | Synology/DC → PG report population |
| operator re-entry | OBSERVED | Operator repeatedly restored active milestone/authority |
| manual intervention | OBSERVED | `vercel promote`, context correction, hosted proof sequencing |

## 15. Corpus bias note

`corpusBiasNote: Thread evidence is Proposal Generator / Document Center SDLC-and-trust-spine heavy; most non-PG product workflows are under-observed.`

`underObservedDomains: [Computer Estimator, Human Estimator, plan-set processing, OCR/parser, Revu/Bluebeam, Bid Composer, VAE, Scraper]`

No claim of estate-wide optimization is supported by this thread.

## 16. Do-not-advance guards

1. Do not claim `HARVEST_COMPLETE`, `OPERATIONAL`, `FULLY_SEEDED`, or index/cache publication from ChatGPT.
2. Do not merge or write `main` from this harvest lane.
3. Do not publish to Z/L Hub, Supabase, or Data-Extraction Lane C from ChatGPT.
4. Do not treat report-trust PASS as estimator-trust PASS.
5. Do not reopen Document Center/Synology architecture merely because estimator persistence/hydration is failing.
6. Do not accept `persistVia=server-sync` as native estimator persistence closure.
7. Do not refresh PG Bible/handoff to a final closed state before hosted estimator closure.
8. Do not suppress low-value/deferred Gold Mine evidence; deduplicate true duplicates only.
9. Treat user-pasted retrieval/index labels as unverified thread evidence in this lane.

## 17. Seed packet candidates

```json
{
  "seedId": "IH-THREAD-PG-REPORT-TRUST-SPINE-SUCCESS",
  "kind": "lesson",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How was the Synology Document Center to Proposal Generator report trust spine proven?",
    "What regression proof should run after Proposal Generator workspace changes?"
  ],
  "evidenceRefs": ["EVT-005", "EVT-011", "SUCCESS_PATTERN-001"],
  "futureAgentInstructions": "Preserve DC as intake/version authority, rerun Beacon Hill production report proof after shared PG state changes, and keep report-trust verdict independent from estimator-trust."
}
```

```json
{
  "seedId": "IH-THREAD-VERCEL-PRODUCTION-ALIAS-TRUTH",
  "kind": "failure-pattern",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why can a Vercel production success check still leave the canonical domain on an old SHA?",
    "How should agents verify Proposal Generator production deployment truth?"
  ],
  "evidenceRefs": ["EVT-010", "OG-003", "OUT-003"],
  "futureAgentInstructions": "Do not treat provider check labels as canonical production proof. Verify alias target and /api/version; promote explicitly when required."
}
```

```json
{
  "seedId": "IH-THREAD-PG-EDITABLE-WORKSPACE-PERSIST-FAILURE",
  "kind": "failure-pattern",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why does Proposal Generator pricing fall back to server-sync instead of native editable-workspace persistence?",
    "Which persistence telemetry is needed to diagnose stale-write and suppression behavior?"
  ],
  "evidenceRefs": ["EVT-012", "HP-007", "OG-001"],
  "futureAgentInstructions": "Instrument native persist trigger, signature, expected/returned updatedAt, HTTP result, retry, suppression, and successful revision acknowledgement. Require persistVia=client for closure."
}
```

```json
{
  "seedId": "IH-THREAD-PG-RELOAD-HYDRATION-AUTHORITY",
  "kind": "failure-pattern",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why does PG show zero or baseline pricing after local cache clear when server editable workspace has the edited total?",
    "What should be authoritative during Proposal Generator reload hydration?"
  ],
  "evidenceRefs": ["EVT-012", "HP-008", "OG-002"],
  "futureAgentInstructions": "When local cache is absent and server editable-workspace pricing is valid, preserve server pricing through normalization/merge and log any fallback that replaces it."
}
```

```json
{
  "seedId": "IH-THREAD-PG-E2E-PILOT-RESET",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How should the 360 Power estimator-trust pilot be reset before approval testing?",
    "Why did the approval step fail after earlier estimator stages?"
  ],
  "evidenceRefs": ["EVT-012", "HP-009", "OG-004"],
  "futureAgentInstructions": "Make hosted E2E setup deterministic: GET current approval, revoke if needed, verify response, GET again, and fail setup if the pilot remains approved."
}
```

```json
{
  "seedId": "IH-THREAD-ACTIVE-WORK-PACKAGE-LANE-LOCK",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How can agents avoid confusing report-trust work with estimator-trust work in Proposal Generator?",
    "What context should be locked at chat re-entry?"
  ],
  "evidenceRefs": ["EVT-004", "HP-001", "OF-001"],
  "futureAgentInstructions": "At re-entry, state active workPackageId, authoritative branch/SHA, independent adjacent lanes, and explicit out-of-scope systems before recommending execution."
}
```

## 18. Future-agent instructions

1. On re-entry, identify the exact work package before proposing changes:
   - `synology-proposal-report-trust-spine-v1` = report intake/population/binding trust.
   - `pg-estimator-trust-closure-recovery-v1` = pricing persistence/hydration/approval/issued-drift trust.
2. Treat the report-trust production proof as closed evidence unless a new regression is observed.
3. For estimator closure, require native `persistVia=client` for both edits; `server-sync` is diagnostic fallback only.
4. Verify canonical production via the live domain/version endpoint, not provider check naming alone.
5. Preserve valid server editable-workspace pricing through local-cache reset and hydration.
6. Reset hosted E2E approval state deterministically before testing approval lifecycle.
7. Keep `main`/Bible reconciliation gated behind full hosted closure, then converge authority promptly.
8. If generating Gold Mine candidates, preserve all distinct signals regardless of apparent value; use digest/candidate identity during dedup.

## 19. Publication truth table

| Layer | State (ChatGPT closeout) |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | `PENDING_GIT_GATE_AT_ARTIFACT_BUILD` |
| `CHATGPT_HARVEST_GIT_GATE` | `PENDING_REMOTE_VERIFICATION` |
| L: draft staging (Action move) | `not-run` |
| Cursor ingest | `not-run` |
| `harvest:validate` | `not-run` |
| L: Hub catalog (operator publish) | `not-run` |
| Z: AI cache | `not-run` |
| Supabase projection | `not-run` |
| Lane C export / Data-Extraction | `not-run` |
| Freshness gate | `not-run` |
| Automatic protocol mutation | `false` |

```text
Publication: NOT_RUN_BY_CURSOR
projection.hubPublishStatus: not-run
```

## 20. gitPublicationReceipt

The exact content-addressed Git commit SHA cannot be self-embedded into the file that creates that same SHA. Per protocol, the authoritative `gitPublicationReceipt` is emitted in the ChatGPT closeout response immediately after remote branch verification. This artifact records the required repo/branch/path contract:

```json
{
  "gitPublicationReceipt": {
    "gate": "CHATGPT_HARVEST_GIT_GATE",
    "verdict": "PENDING_AT_FILE_CREATION",
    "repo": "Capglass5708/CapitalGlass-Cross-Agent",
    "branch": "chat-gpt-harvest",
    "harvestId": "harvest-2026-08-07-pg-doccenter-synology-estimator-trust-v1",
    "artifactPath": "artifacts/agent-runs/harvest-2026-08-07-pg-doccenter-synology-estimator-trust-v1/chatgpt-findings-source.md",
    "receiptLocation": "ChatGPT closeout response after remote verification"
  }
}
```

## 21. Cursor handoff command

Run only after ChatGPT reports `CHATGPT_SOURCE_PUBLISHED` with a verified remote SHA:

```bash
git fetch origin chat-gpt-harvest && git checkout chat-gpt-harvest && git pull --ff-only origin chat-gpt-harvest

npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-07-pg-doccenter-synology-estimator-trust-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-07-pg-doccenter-synology-estimator-trust-v1

npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-07-pg-doccenter-synology-estimator-trust-v1
npm run harvest:sync-derived -- harvest-2026-08-07-pg-doccenter-synology-estimator-trust-v1
npm run harvest:validate -- harvest-2026-08-07-pg-doccenter-synology-estimator-trust-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-07-pg-doccenter-synology-estimator-trust-v1
npm run test:harvest
# operator only after validation:
# npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-07-pg-doccenter-synology-estimator-trust-v1
```

---

**Protocol boundary reminder:** ChatGPT compresses and Git-stages this evidence. Cursor owns ingest/validation/canonicalization; operator/estate automation owns publication beyond Git staging.