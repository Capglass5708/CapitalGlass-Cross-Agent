# Claude Estate Awareness — Operator Handoff

**Date:** 2026-08-18  
**Work package:** `claude-estate-awareness-v1`  
**Mission class:** docs  
**Owner repo:** `CapitalGlass-Cross-Agent` (coordination only)

## Purpose

Wesley is onboarding **Claude** as a coordination agent alongside ChatGPT and Cursor. This handoff packages estate-wide orientation so Claude can understand Capital Glass work without guessing from chat memory.

## Package location

**Canonical published path (upload from here):**

```text
Z:\Capital-Glass-Dev\Claude Start Package\
├── START_HERE.md                         ← read first
├── CLAUDE_ESTATE_AWARENESS_PACK_v1.md    ← upload this to Claude
├── claude-estate-awareness-v1.json       ← optional structured companion
├── README.md
├── MANIFEST.json
├── 2026-08-18_claude-estate-awareness.md
├── 2026-08-18_claude-estate-awareness-v1.md
└── claude-estate-awareness-seed.json
```

**Git regeneration source:** `CapitalGlass-Cross-Agent/agent-onboarding/claude/`

## Quick start (5 minutes)

1. Open Claude → Projects → New project (e.g. "Capital Glass").
2. Upload **`CLAUDE_ESTATE_AWARENESS_PACK_v1.md`** as project knowledge.
3. Paste the custom instructions from `agent-onboarding/claude/README.md`.
4. Test with: *"List our indexed blockers and which repo owns each."*

## What was investigated

| Source | Used for |
| --- | --- |
| L: `00-master-index` BY-KIND slices | Apps, platform repos, MCPs, blockers, open actions, host authority |
| `CapitalGlass-Cross-Agent` ledger | Active projects, handoff, repo roles |
| `CG-AppBuilder-MCP` | Auto v3.2 protocol, agent seeding patterns |
| `CapitalGlass-Office-Admin` MCP preflight | Secrets, host, north star overlay |
| `~/repos` estate listing | Repo inventory sanity check |

**Retrieval codes:** `INDEX_HIT` · `CACHE_MISS` · `DIRECT_CONNECT_NOT_APPLICABLE`

## Optional promotion (Cursor / AppBuilder pipeline)

After committing this package to Cross-Agent `main`:

```bash
cd ~/repos/CG-AppBuilder-MCP
npm run cross-agent-notes:seed -- --seed=claude-estate-awareness-v1 --dry-run
npm run cross-agent-notes:seed -- --seed=claude-estate-awareness-v1 --apply
```

Seed manifest: `agent-notes-seeding/seeds/claude-estate-awareness-v1.json`

## Refresh triggers

- Material `ACTIVE_WORK.md` edit
- Blocker cleared or new domain blocker indexed
- Major milestone (runner online, dev lane PASS, etc.)
- Quarterly estate review

## Do not

- Treat this pack as constitutional authority (Governance owns North Star).
- Paste secrets into Claude project knowledge.
- Ask Claude to implement in Cross-Agent — route to owner repo + Cursor.

## Next actions for Wesley

| # | Action |
| --- | --- |
| 1 | Review pack content; commit to Cross-Agent when satisfied |
| 2 | Upload pack to Claude Project |
| 3 | Add current mission project file when working a specific WP |
| 4 | Optional: run seed promotion for Intelligence Hub compact mirror |
