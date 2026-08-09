# Commercial Glazing Scope Intelligence Spine v1 — Cross-Agent Coordination

Parent milestone: `commercial-glazing-scope-intelligence-spine-v1`
Branch: `work/commercial-glazing-scope-intelligence-spine-v1`
Role: coordination ledger only. No product implementation belongs here.

## Canonical branch family
- Computer Estimator: `feat/commercial-glazing-scope-candidates-v1`
- Computer Estimator MCP: `feat/commercial-glazing-scope-candidates-v1`
- Revu: `feat/revu-window-door-markup-validation-v1`
- Human Estimator MCP: `feat/commercial-glazing-scope-review-intelligence-v1`
- Data Extraction: `feat/historical-commercial-glazing-scope-evidence-v1`
- Governance: `feat/commercial-glazing-agent-governance-v1`
- AppBuilder: `feat/commercial-glazing-agent-orchestration-v1`
- Bid Composer: `feat/commercial-glazing-remodel-scope-consumer-v1`
- Proposal Generator: `feat/commercial-glazing-new-construction-scope-consumer-v1`

## Routing invariant
- REMODEL → Bid Composer.
- NEW_CONSTRUCTION → Proposal Generator.

## Agent invariant
AI agent is an operator, not commercial authority. Read/propose broadly; controlled writes require Governance authorization; commercial release is human-only in v1.

## Do not forget during build
1. Keep this file and `work-progress/projects/commercial-glazing-scope-intelligence-spine-v1.md` aligned.
2. Record per-repo commit SHA, tests, blockers, receipts and next action as live work begins.
3. Do not place executable implementation code in Cross-Agent.
4. Preserve the same parent milestone across every repo lane.
5. Beacon Hill / CG-2036-26 is the preferred first new-construction regression anchor once plans are accessible.
6. Master Graph is advisory/read-only in this wave; approved durable learning gets a later authority milestone.

## Integration order
1. CE live candidate smoke.
2. CE MCP exposure.
3. Revu fixture + single-sheet markup/read-back.
4. Human Estimator review packet.
5. Historical bid-sheet/plan evidence pilot.
6. Governance + AppBuilder agent dry-run.
7. Beacon Hill reviewed truth set.
8. New-construction consumer proof.
9. Remodel consumer proof.
10. Formal production/autonomy review.

## Terminal state for skeleton phase
`SKELETON_AND_CONCEPT_BUILD — LIVE_VERIFICATION_PENDING`
