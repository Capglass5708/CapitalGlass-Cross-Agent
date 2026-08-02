# Decision Log

Record final decisions that should guide future agents.

| Date | Decision | Why | Owner / source | Related file |
| --- | --- | --- | --- | --- |
| 2026-08-02 | Cross-Agent is the human ledger; L: master index is the machine-readable front door | Prevents chat-only knowledge loss and keeps implementation out of the meeting repo | Wesley / Cross-Agent cleanup | `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md` |

## Agent Fast Path

**Decision ID:** `CAD-20260802-cross-agent-ledger-machine-front-door`  
**Authority:** CG-Platform-Governance-MCP (registry-approved)  
**Rule:** Cross-Agent is the human ledger — coordination notes and decisions live here; seeding engines live in CG-AppBuilder-MCP only.  
**Machine front door:** `L:\Capital-Glass-Intelligence-Hub\MASTER_INDEX.md` for retrieval; Z canonical cache for promoted compacts.  
**Do not:** treat chat transcripts, host-local caches, or Supabase pointer artifacts as canonical note bodies.
