# ChatGPT ingest test fixture

Lane: CHAT_CONTEXT_ONLY — synthetic fixture for `run-chatgpt-findings-ingest.test.mjs`.

## B.20 Thread Event Inventory

| Event ID | What happened | Actor | Evidence | State change |
| --- | --- | --- | --- | --- |
| EVT-001 | Operator drafted ingest fixture | operator | turn-1 | drafted |

```json
{
  "seedId": "IH-THREAD-INGEST-TEST-001",
  "kind": "lesson",
  "title": "ChatGPT ingest fixture seed",
  "summary": "Minimal seed for automated chatgpt findings ingest test",
  "retrievalQuestions": [
    "How does harvest ingest ChatGPT markdown findings?",
    "What npm command ingests ChatGPT thread autopsy findings?"
  ],
  "evidenceRefs": ["findings.md", "EVT-001"]
}
```
