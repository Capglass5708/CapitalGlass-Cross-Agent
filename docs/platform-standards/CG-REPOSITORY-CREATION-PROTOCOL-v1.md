# Capital Glass Repository Creation Protocol v1

Protocol ID: `CG-REPOSITORY-CREATION-PROTOCOL-v1`

Status: Draft foundation

Owner: `CapitalGlass-Cross-Agent`

## Purpose

This protocol defines the standard method for creating, initializing, registering, and validating every new Capital Glass repository.

Its goal is to ensure that repositories begin with consistent development authority, governance, documentation, graph participation, security posture, and automation instead of relying on one-off manual setup.

## Core rule

> Every new Capital Glass repository starts in WSL2, is developed from the canonical ext4 workspace, is registered with the CG Master Graph, and passes a deterministic creation closeout before feature work begins.

## Canonical development authority

The authoritative local development root is:

```text
/home/wesley/repos
```

A new repository must be cloned to:

```text
/home/wesley/repos/<REPOSITORY-NAME>
```

The primary development copy must not live under:

```text
/mnt/c
/mnt/d
/mnt/l
/mnt/z
```

Windows and mounted storage may host editors, publication outputs, caches, receipts, backups, or operational data, but they are not the source development workspace.

## Authority roles

| Surface | Role |
|---|---|
| WSL2 ext4 | Local development authority |
| GitHub | Remote source and collaboration authority |
| Git history | Source-change and review ledger |
| L: Intelligence Hub | Retrieval and catalog authority |
| Z: AI-Cache-Authority | Publication and cache authority |
| Supabase | Queryable projection, not source truth |
| CG Master Graph | Relationship, provenance, and impact-path authority |

## Protocol phases

### Phase 0 - Intent and naming

Before repository creation, define:

- Repository name
- Human-readable title
- Purpose and scope
- Owning application, capability, or platform lane
- Visibility: private or public
- Expected technology stack
- Canonical graph ID
- Initial lifecycle state
- Whether the repository is an application, library, MCP, control-plane component, infrastructure package, experiment, or documentation authority

Recommended graph ID shape:

```text
repo:<normalized-repository-name>
```

Example:

```text
repo:cg-master-graph
```

### Phase 1 - GitHub creation

Create the repository in the Capital Glass GitHub owner with:

- Default branch: `main`
- README: enabled
- Appropriate `.gitignore`
- No license unless intentionally selected
- Private visibility by default for internal control-plane or business repositories
- Squash merging enabled
- Automatic branch deletion enabled
- Force pushes and branch deletion blocked on `main`

Do not enable broad automation or external write access before the repository has a validated foundation.

### Phase 2 - WSL2 bootstrap

Clone only from WSL2:

```bash
cd /home/wesley/repos
git clone git@github.com:Capglass5708/<REPOSITORY-NAME>.git
cd <REPOSITORY-NAME>
```

HTTPS fallback:

```bash
cd /home/wesley/repos
git clone https://github.com/Capglass5708/<REPOSITORY-NAME>.git
cd <REPOSITORY-NAME>
```

Create the foundation branch:

```bash
git switch -c feat/repository-foundation-v1
```

Open the repository from the WSL2 directory:

```bash
cursor .
```

### Phase 3 - WSL2 authority preflight

The repository must include a deterministic preflight that verifies:

- The repository root is under `/home/wesley/repos`
- The filesystem is not DrvFS
- The shell is running inside WSL2
- Git resolves the expected repository root
- Required runtimes are available
- The working tree state is reported

Minimum manual verification:

```bash
pwd
git rev-parse --show-toplevel
uname -a
stat -f -c %T .
```

Expected filesystem type:

```text
ext2/ext3
```

The preflight must fail closed when run from `/mnt/c`, `/mnt/d`, `/mnt/l`, `/mnt/z`, or another unsupported mounted workspace.

Suggested command:

```bash
npm run check:wsl2-authority
```

### Phase 4 - Standard foundation

Every repository should begin with the applicable subset of:

```text
.github/
  workflows/
  CODEOWNERS
  pull_request_template.md
docs/
scripts/
tests/
artifacts/agent-runs/
.cg/
README.md
.gitignore
package.json or equivalent project manifest
```

Required initial documents:

- Repository purpose and scope
- Ownership and authority boundaries
- Local development instructions
- Validation commands
- Deployment or publication role, if applicable
- Known exclusions and non-goals

### Phase 5 - CG Master Graph participation

Every active repository must publish:

```text
.cg/master-graph.json
```

The manifest should declare:

- Stable repository graph ID
- GitHub repository identity
- Default branch
- Lifecycle state
- Applications implemented
- Capabilities implemented
- Stable dependencies
- Authority boundaries
- Deployment classes
- Graph source paths

The repository must also be added to the central CG Master Graph repository registry.

The local repository declares itself. Harvest packets and receipts describe changing operational state.

### Phase 6 - Cross-Agent registration

CapitalGlass-Cross-Agent should receive a repository creation receipt containing:

- Repository name and graph ID
- GitHub URL
- WSL2 canonical path
- Creation timestamp
- Initial branch
- Initial commit SHA
- Owner and lifecycle
- Master Graph registration status
- Validation results
- Exceptions or deferred work

Recommended receipt path:

```text
artifacts/agent-runs/<work-package>/repository-creation-receipt-v1.json
```

### Phase 7 - Governance and CI

Before feature work begins, establish applicable checks:

- WSL2 authority validation
- Build or syntax validation
- Tests
- Linting and formatting
- Secret scanning
- Dependency checks
- Graph manifest validation
- Deterministic output checks where material
- Documentation-link validation where material

Required checks should only be added to branch protection after the workflows exist and have passed successfully.

### Phase 8 - Closeout

The repository is not considered ready merely because it exists on GitHub.

Creation closes only when the following verdict is reached:

```text
REPOSITORY_CREATED_UNVERIFIED
  -> REPOSITORY_FOUNDATION_VALIDATED
```

## Minimum acceptance criteria

- Repository exists under the correct GitHub owner
- Canonical clone exists under `/home/wesley/repos`
- Repository is confirmed to run from WSL2 ext4
- Foundation branch exists
- README and authority documentation exist
- Validation commands run successfully
- `.cg/master-graph.json` exists and validates
- Repository is registered with CG Master Graph
- Cross-Agent creation receipt exists
- No secrets are committed
- `main` protection is configured after checks are proven
- Initial foundation is committed and pushed

## Deterministic bootstrap target

A future command should automate the protocol:

```bash
cg:create-repository <REPOSITORY-NAME>
```

Potential parameters:

```bash
cg:create-repository CG-MASTER-GRAPH \
  --type control-plane \
  --visibility private \
  --stack node \
  --graph-id repo:cg-master-graph \
  --owner cross-agent
```

The command should:

1. Validate the repository name and graph ID
2. Create or verify the GitHub repository
3. Clone it into `/home/wesley/repos`
4. Confirm WSL2 ext4 authority
5. Create a foundation branch
6. Generate standard directories and documents
7. Install the WSL2 preflight
8. Generate `.cg/master-graph.json`
9. Register the repository with CG Master Graph
10. Add standard CI workflows
11. Run validation
12. Create a repository creation receipt
13. Commit and push the foundation branch
14. Report the exact closeout verdict

The command must be safe to rerun. Existing valid files should not be overwritten silently.

## Failure behavior

The protocol must fail closed for:

- Repository cloned outside the WSL2 authority root
- Duplicate graph ID
- Repository name conflict
- Missing Git remote
- Invalid graph manifest
- Secret detection
- Unresolved authority ownership
- Attempted creation on mounted Windows storage
- Non-deterministic generated foundation files

Failures should produce a receipt with:

```text
status: HOLD
reasonCode: <deterministic-code>
remediation: <exact-next-step>
```

## Suggested reason codes

```text
WSL2_AUTHORITY_NOT_CONFIRMED
REPOSITORY_OUTSIDE_CANONICAL_ROOT
DRVFS_WORKSPACE_REJECTED
GITHUB_REPOSITORY_NOT_FOUND
GRAPH_ID_CONFLICT
GRAPH_MANIFEST_INVALID
AUTHORITY_OWNER_UNRESOLVED
SECRET_SCAN_FAILED
FOUNDATION_VALIDATION_FAILED
MAIN_PROTECTION_DEFERRED
```

## Initial implementation work package

```text
capital-glass-repository-creation-protocol-v1
```

Target:

```text
MANUAL_REPOSITORY_CREATION
  -> GOVERNED_WSL2_FIRST_REPOSITORY_CREATION
```

Initial implementation should produce:

- Canonical protocol document
- WSL2 authority checker
- Repository foundation template
- Graph manifest template
- Creation receipt schema
- Dry-run bootstrap command
- One successful dogfood run using `CG-MASTER-GRAPH`

## Dogfood repository

`CG-MASTER-GRAPH` should be the first repository validated against this protocol.

Its canonical local path must be:

```text
/home/wesley/repos/CG-MASTER-GRAPH
```

Its successful bootstrap should become the first reference receipt for future repository creation.

## Control principle

> A repository is not ready when GitHub creates it. It is ready when WSL2 authority, governance, graph registration, validation, and creation evidence all agree.
