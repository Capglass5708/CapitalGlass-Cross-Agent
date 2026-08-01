# Project Files

This folder holds one durable Markdown file per project, Cursor project, or work package.

Purpose: give agents a repeatable place to capture the valuable information for each separate build effort without burying everything inside one long ledger.

## Required startup rule

Every agent starting a new project file must read these first:

1. `work-progress/WORKSPACE_CONTEXT.md`
2. `work-progress/ACTIVE_WORK.md`
3. This file: `work-progress/projects/README.md`

## What belongs here

Create a project file here when work has a project ID, Cursor project ID, work package ID, or distinct mission that will need durable notes.

Examples:

- `north-star-compounding-proof-v1`
- `north-star-compounding-vertical-pilot-v1`
- `platform-governance-phase4-registries-v1`
- `bible-authority-gate`
- `scraper-data-extraction-synology-library-v1`

## Filename pattern

Use:

```text
YYYY-MM-DD_<project-or-work-package-id>.md
```

Examples:

```text
2026-08-01_north-star-compounding-proof-v1.md
2026-08-01_scraper-data-extraction-synology-library-v1.md
```

Use lowercase, hyphens, and clear IDs. Do not use spaces.

## Do not store here

Do not place these in this repo or folder:

- implementation code
- app source files
- MCP server code
- database migrations
- secrets or credentials
- raw database dumps
- copied Bible content
- long raw logs
- generated build artifacts

Link to the owning repo, commit, PR, artifact path, or verification file instead.

## Required project file template

Each project file should use this structure:

```md
# Project: <project-or-work-package-id>

## Summary

<One short explanation of what this project is doing and why it matters.>

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | <id if available> |
| Work package | <work-package-id if available> |
| Date opened | <YYYY-MM-DD> |
| Source | Wesley / ChatGPT / Cursor / Agent name |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | <repo if applicable> |
| Execution repo | <repo if applicable> |
| Status | Planned / Active / Blocked / Complete / Pushed |

## Repositories involved

| Repo | Role |
| --- | --- |
| <repo> | <role> |

## Authority / ownership rule

<State which repo owns authority and which repo only executes/supports.>

## Valuable decisions

| Date/time | Decision | Reason |
| --- | --- | --- |
| <timestamp> | <decision> | <why> |

## Delivered / reported complete

- <item>

## Evidence / artifact paths

| Artifact | Path / link | Status |
| --- | --- | --- |
| <artifact> | <path> | <PASS/BLOCKED/etc.> |

## Verification

| Command / check | Result | Notes |
| --- | --- | --- |
| <command> | <result> | <notes> |

## Blockers / warnings

| Blocker | Owner repo | Required action |
| --- | --- | --- |
| <blocker> | <repo> | <fix> |

## Commits / PRs

| Repo | Commit / PR | Status |
| --- | --- | --- |
| <repo> | <sha or PR> | <local/pushed/merged> |

## Next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | <action> | <repo> | <status> |

## Reusable lessons

- <lesson future agents should know>

## Update log

### <YYYY-MM-DD HH:mm CT> — <source>

- <valuable update>
```

## Cursor paste intake rule

When Wesley pastes Cursor output into ChatGPT, ChatGPT must extract the valuable parts and update the relevant project file.

Capture:

- project ID / Cursor project ID
- work package ID
- timestamp
- repo(s) involved
- files changed, if relevant
- commits and push status
- verification commands and results
- blockers and warnings
- decisions made
- next action
- reusable lessons for future agents

Discard:

- repeated filler
- long unneeded command output
- secrets or credentials
- full source code
- Bible content copies
- database dumps

## Required ledger update

After creating or materially updating a project file, also update:

```text
work-progress/ACTIVE_WORK.md
```

Add a timestamped ledger entry or update the current active status so future agents can find the project file.

## Commit rule

Commit the meeting repo change with a clear message, for example:

```text
docs: add <project-id> project file
```

or

```text
docs: update <project-id> project notes
```
