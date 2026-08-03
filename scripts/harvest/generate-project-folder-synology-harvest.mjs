#!/usr/bin/env node
/**
 * One-shot generator for harvest-project-folder-synology-primary-chat-v1 supplementary artifacts.
 * Run from Cross-Agent root: node scripts/harvest/generate-project-folder-synology-harvest.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashCanonicalJson } from "./lib/hash.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const HARVEST_ID = "harvest-project-folder-synology-primary-chat-v1";
const RUN_DIR = path.join(REPO_ROOT, "artifacts/agent-runs", HARVEST_ID);
const AS_OF = "2026-08-03T21:00:00.000Z";

function writeJson(rel, value) {
  const p = path.join(RUN_DIR, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  return p;
}

const evidenceLedger = [
  { evidenceId: "E001", repo: "CapitalGlass-Documents", path: "docs/PROJECT_FOLDER_SYNOLOGY_PRIMARY_CONTRACT.md", commitSha: "d8826e84d9409739baee413aa937849bb57469d9", type: "contract", verdict: "CONTRACT_AUTHORITY", verifiedAt: AS_OF },
  { evidenceId: "E002", repo: "CapitalGlass-Documents", path: "docs/PROJECT_FOLDER_SYNOLOGY_PRIMARY_DEV_ENVIRONMENT_CONTRACT.md", commitSha: "d8826e84d9409739baee413aa937849bb57469d9", type: "contract", verdict: "DEV_CONTRACT", verifiedAt: AS_OF },
  { evidenceId: "E003", repo: "CapitalGlass-Documents", path: "docs/PROJECT_FOLDER_SYNOLOGY_PRIMARY_PRODUCTION_PROMOTION_CONTRACT.md", commitSha: "e0d9d8c6ad007a855ea6404aa69dda1a9df11c9c", type: "contract", verdict: "PROMOTION_CONTRACT", verifiedAt: AS_OF },
  { evidenceId: "E004", repo: "CapitalGlass-Documents", path: "workers/office-project-folder-provision/scripts/run-service.mjs", commitSha: "e3fe6ec6af7fb7eb8328ada1f515fd01d71de3f9", type: "implementation", verdict: "CANONICAL_WORKER", verifiedAt: AS_OF },
  { evidenceId: "E005", repo: "CapitalGlass-Documents", path: "supabase/migrations/20260803140000_project_folder_synology_primary_support_tables.sql", commitSha: "e3fe6ec6af7fb7eb8328ada1f515fd01d71de3f9", type: "migration", verdict: "CANONICAL_MIGRATION", verifiedAt: AS_OF },
  { evidenceId: "E006", repo: "CapitalGlass-Documents", path: "artifacts/agent-runs/project-folder-synology-primary-v1/production-route-probe.json", commitSha: "e3486a1", type: "probe", verdict: "ROUTES_PASS", verifiedAt: AS_OF },
  { evidenceId: "E007", repo: "CapitalGlass-Cross-Agent", path: "artifacts/agent-runs/project-folder-synology-primary-v1-dev-hosted-environment/receipt.json", commitSha: "8ecf43e", type: "receipt", verdict: "DEV_ENVIRONMENT_ACCEPTED", verifiedAt: AS_OF },
  { evidenceId: "E008", repo: "CapitalGlass-Cross-Agent", path: "artifacts/agent-runs/project-folder-synology-primary-v1-dev-reproducibility-hardening/receipt.json", commitSha: "4f22aca", type: "receipt", verdict: "PROMOTION_CANDIDATE_READY", verifiedAt: AS_OF },
  { evidenceId: "E009", repo: "CapitalGlass-Cross-Agent", path: "artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json", commitSha: "5ca89f5", type: "receipt", verdict: "PRODUCTION_PROMOTION_PASS", verifiedAt: AS_OF },
  { evidenceId: "E010", repo: "CapitalGlass-Cross-Agent", path: "artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/gate-results.json", commitSha: "5ca89f5", type: "gates", verdict: "P1_TO_P10_ALL_PASS", verifiedAt: AS_OF },
  { evidenceId: "E011", repo: "CapitalGlass-Cross-Agent", path: "artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/canary-receipt.json", commitSha: "5ca89f5", type: "canary", verdict: "PASS", verifiedAt: AS_OF },
  { evidenceId: "E012", repo: "CapitalGlass-Cross-Agent", path: "artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/rollback-receipt.json", commitSha: "5ca89f5", type: "rollback", verdict: "ROLLBACK_READY", verifiedAt: AS_OF },
  { evidenceId: "E013", repo: "CapitalGlass-Documents", path: ".github/workflows/deploy-production.yml", commitSha: "5a436d1d357e774da68abe7dc6a6d539d5f233fc", type: "ci", verdict: "VERCEL_CLI_PIN_OUTDATED", verifiedAt: AS_OF },
  { evidenceId: "E014", repo: "CapitalGlass-Documents", path: "pull/91", commitSha: "5a436d1d357e774da68abe7dc6a6d539d5f233fc", type: "pr", verdict: "MERGED", verifiedAt: AS_OF },
];

const timeline = [
  { eventId: "T01", date: "2026-08-03", stateBefore: "none", action: "Synology-primary contract committed", stateAfter: "CONTRACT_AUTHORITY", authority: "E001", superseded: [], restrictions: [] },
  { eventId: "T02", date: "2026-08-03", stateBefore: "CONTRACT_ONLY", action: "Dev environment contract", stateAfter: "DEV_CONTRACT", authority: "E002", superseded: [], restrictions: ["production HALTED"] },
  { eventId: "T03", date: "2026-08-03", stateBefore: "HOSTED_DEV_HOLD", action: "Vercel BLOCKED + staging schema gaps", stateAfter: "DEPLOY_BLOCKED", authority: "E007", superseded: ["CONTRACT_PASS_HOSTED_DEV_HOLD"], restrictions: ["no production"] },
  { eventId: "T04", date: "2026-08-03", stateBefore: "DEPLOY_BLOCKED", action: "Commit identity + TS fixes; dev deploy 7c0b76f", stateAfter: "DEV_DEPLOYED", authority: "E007", superseded: ["T03"], restrictions: ["production HALTED"] },
  { eventId: "T05", date: "2026-08-03", stateBefore: "DEV_DEPLOYED", action: "Separate dev Supabase; dev worker installed", stateAfter: "DEV_WORKER_OPERATIONAL", authority: "E007", superseded: [], restrictions: [] },
  { eventId: "T06", date: "2026-08-03", stateBefore: "DEV_WORKER_OPERATIONAL", action: "G1–G10 dev acceptance", stateAfter: "DEV_ENVIRONMENT_ACCEPTED", authority: "E007", superseded: ["HOLD"], restrictions: ["production HALTED"] },
  { eventId: "T07", date: "2026-08-03", stateBefore: "DEV_ACCEPTED", action: "Reproducibility hardening to e3fe6ec", stateAfter: "PROMOTION_CANDIDATE_READY", authority: "E008", superseded: ["7c0b76f-only candidate"], restrictions: [] },
  { eventId: "T08", date: "2026-08-03", stateBefore: "CANDIDATE_READY", action: "Production promotion scaffold", stateAfter: "PRODUCTION_PROMOTION_HOLD", authority: "E009", superseded: [], restrictions: ["await operator approval"] },
  { eventId: "T09", date: "2026-08-03", stateBefore: "PRODUCTION_PROMOTION_HOLD", action: "Operator approval Wesley", stateAfter: "AUTHORIZED_PREFLIGHT", authority: "E009", superseded: ["R3_OPERATOR_APPROVAL false"], restrictions: [] },
  { eventId: "T10", date: "2026-08-03", stateBefore: "f16b4ff production", action: "PR #91 merge; dark deploy 5a436d1", stateAfter: "PROD_ROUTES_LIVE", authority: "E006", superseded: ["405 routes"], restrictions: ["flag false"] },
  { eventId: "T11", date: "2026-08-03", stateBefore: "schema unverified", action: "Migration drift check prd PASS", stateAfter: "PROD_SCHEMA_READY", authority: "E005", superseded: [], restrictions: ["flag false"] },
  { eventId: "T12", date: "2026-08-03", stateBefore: "no prod worker", action: "Install production worker WESLEYDESK", stateAfter: "PROD_WORKER_INSTALLED", authority: "E009", superseded: ["worker missing"], restrictions: ["stopped then started"] },
  { eventId: "T13", date: "2026-08-03", stateBefore: "flag false", action: "Enable prd flag; redeploy", stateAfter: "PROD_FLAG_ACTIVE", authority: "E009", superseded: [], restrictions: [] },
  { eventId: "T14", date: "2026-08-03", stateBefore: "no prod canary", action: "PROD-SYNOLOGY-CANARY-20260803 E2E", stateAfter: "CANARY_PASS", authority: "E011", superseded: [], restrictions: [] },
  { eventId: "T15", date: "2026-08-03", stateBefore: "promotion in progress", action: "P1–P10 all PASS; closeout 5ca89f5", stateAfter: "PRODUCTION_PROMOTION_PASS", authority: "E010", superseded: ["PRODUCTION_PROMOTION_HOLD"], restrictions: [] },
  { eventId: "T16", date: "2026-08-03", stateBefore: "ACTIVE", action: "24h stabilization declared", stateAfter: "STABILIZATION_OBSERVE_ONLY", authority: "work-progress/projects/project-folder-synology-primary-v1-production-promotion.md", superseded: [], restrictions: ["no historical migration", "no SharePoint Slice 4", "no storage expansion"] },
  { eventId: "T17", date: "2026-08-03", stateBefore: "ACTIVE", action: "Deferred hardening backlog queued", stateAfter: "POST_STABILIZATION_QUEUE", authority: "work-progress/projects/project-folder-synology-primary-v1-production-promotion.md", superseded: [], restrictions: ["after stabilization only"] },
];

const contradictions = [
  { id: "C01", claimA: "d8826e8 is contract authority only", claimB: "e3fe6ec/e0d9d8c are build/promotion artifacts", relationship: "complementary", classification: "current", winner: "both valid roles", explanation: "Contract defines behavior; e3fe6ec implements; e0d9d8c adds promotion docs", evidence: ["E001", "E004", "E003"] },
  { id: "C02", claimA: "candidate e3fe6ec", claimB: "deployed merge 5a436d1", relationship: "superseded-deploy", classification: "current", winner: "5a436d1 deployed; app tree equivalent to e3fe6ec", explanation: "PR #91 merge commit includes docs-only delta vs e3fe6ec", evidence: ["E014", "E004"] },
  { id: "C03", claimA: "claim/complete returned 405 at f16b4ff", claimB: "routes return 401 without auth at 5a436d1+", relationship: "superseded", classification: "historical→current", winner: "401 live routes", explanation: "Dark deploy landed synology provision routes", evidence: ["E006"] },
  { id: "C04", claimA: "shared Supabase blocked dev isolation", claimB: "mazvavlshjshwklcvxaw dev / wvidyxufvcrtezzkwwse prod", relationship: "superseded", classification: "historical→current", winner: "separate projects", explanation: "Dev lane uses distinct Supabase ref", evidence: ["E007", "E009"] },
  { id: "C05", claimA: "WESLEYDESK worker missing", claimB: "both workers Running", relationship: "superseded", classification: "historical→current", winner: "workers operational", explanation: "Dev and prod NSSM services installed", evidence: ["E009", "E007"] },
  { id: "C06", claimA: "production HALTED / flag off", claimB: "PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=true prd", relationship: "superseded", classification: "historical→current", winner: "production ACTIVE", explanation: "Authorized promotion completed 2026-08-03", evidence: ["E009"] },
  { id: "C07", claimA: "PRODUCTION_PROMOTION_HOLD", claimB: "PRODUCTION_PROMOTION_PASS", relationship: "superseded", classification: "historical→current", winner: "PASS", explanation: "Operator-approved execution completed", evidence: ["E009", "E010"] },
  { id: "C08", claimA: "entire Document Center on Synology", claimB: "project-folder Synology-primary scope only", relationship: "scope-clarification", classification: "current", winner: "project-folder workflow only", explanation: "Vercel hosts app; Supabase metadata; Synology stores new project folder trees; SharePoint unchanged for document binaries", evidence: ["E001", "E003"] },
  { id: "C09", claimA: "production not touched in dev phase", claimB: "authorized production promotion executed", relationship: "temporal", classification: "both valid at time", winner: "production touched after approval", explanation: "Earlier non-touch statements applied before promotion authorization", evidence: ["E009"] },
  { id: "C10", claimA: "dev acceptance at e3fe6ec/7c0b76f", claimB: "production acceptance at 5a436d1", relationship: "environment-specific", classification: "current", winner: "both", explanation: "Separate evidence commits per environment", evidence: ["E007", "E009"] },
  { id: "C11", claimA: "route probe at promotion time", claimB: "Cross-Agent closeout is operational proof", relationship: "layered-evidence", classification: "current", winner: "both", explanation: "Probe proves routes; closeout proves full lifecycle", evidence: ["E006", "E011"] },
];

function qa(ihPfspId, id, q, alts, short, detail, status, scope, paths, commits, keywords, entities, related = [], supersedes = [], dna = [], priority = "high") {
  return {
    ihPfspId,
    questionId: id,
    canonicalQuestion: q,
    alternateQuestions: alts,
    shortAnswer: short,
    detailedAnswer: detail,
    currentStatus: status,
    answerScope: scope,
    asOf: AS_OF,
    authorityRepo: "CapitalGlass-Cross-Agent",
    authorityPath: paths,
    authorityCommit: commits,
    evidenceUrls: paths.map((p) => `CapitalGlass-Cross-Agent/${p}`),
    confidence: "verified",
    keywords,
    entities,
    relatedQuestionIds: related,
    supersedes,
    doNotAdvance: dna,
    sensitiveFieldsRedacted: true,
    rawScanRequired: false,
    retrievalPriority: priority,
  };
}

const qaRecords = [
  qa("IH-PFSP-001", "Q001", "Where are new project folders stored?", ["project folder location", "synology root production", "where are folders stored"], "Production new-project folders are created under L:\\Capital-Glass-Projects\\ on CG-WESLEYDESK-01.", "Synology-primary provisioning writes physical folders beneath the canonical production root L:\\Capital-Glass-Projects\\. Dev uses L:\\Capital-Glass-Projects-Dev\\. Metadata and jobs live in production Supabase wvidyxufvcrtezzkwwse.", "current", "production", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json"], ["5ca89f5"], ["synology", "root", "L drive"], ["production", "synology", "worker"]),
  qa("IH-PFSP-002", "Q017", "Where does Document Center save project files?", ["document center project files", "where does DC save files"], "New project folder trees are provisioned on Synology L: by the office worker; Document Center on Vercel orchestrates jobs only.", "Physical project-folder binaries for new projects land under L:\\Capital-Glass-Projects\\ (prod) via the provision worker. Document Center does not store folder trees on Vercel or in Supabase bytes.", "current", "production", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json"], ["5ca89f5"], ["document center", "save", "files"], ["production", "document-center"]),
  qa("IH-PFSP-003", "Q013", "Is the whole Document Center hosted on Synology?", ["document center on synology", "is DC on synology"], "No — Vercel hosts the app; Supabase holds metadata; Synology holds new project folder binaries.", "Scope is project-folder provisioning workflow only, not entire Document Center relocation.", "current", "architecture", ["docs/PROJECT_FOLDER_SYNOLOGY_PRIMARY_CONTRACT.md"], ["d8826e8"], ["architecture", "scope"], ["architecture"]),
  qa("IH-PFSP-004", "Q018", "What remains on Vercel?", ["what stays on vercel", "vercel hosts what"], "Vercel hosts the CapitalGlass-Documents application, API routes, and feature flags.", "Project-folder claim/complete/reconcile HTTP routes run on Vercel; binary folder creation is delegated to the WESLEYDESK worker.", "current", "architecture", ["artifacts/agent-runs/project-folder-synology-primary-v1/production-route-probe.json"], ["e3486a1"], ["vercel", "architecture"], ["vercel"]),
  qa("IH-PFSP-005", "Q019", "What remains in Supabase?", ["supabase role", "what is in supabase"], "Supabase holds project_folder_provision_jobs, metadata, and canonical project identity — not folder binaries.", "Production ref wvidyxufvcrtezzkwwse stores queue rows and job state; dev uses mazvavlshjshwklcvxaw.", "current", "architecture", ["supabase/migrations/20260803140000_project_folder_synology_primary_support_tables.sql"], ["e3fe6ec"], ["supabase", "metadata"], ["supabase"]),
  qa("IH-PFSP-006", "Q020", "Which machine creates the folders?", ["which host creates folders", "wesleydesk worker host"], "CG-WESLEYDESK-01 via NSSM services.", "Both dev and production provision workers run on WESLEYDESK with separate roots and Supabase refs.", "current", "operations", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json"], ["5ca89f5"], ["wesleydesk", "machine"], ["worker"]),
  qa("IH-PFSP-007", "Q005", "What worker handles production?", ["production service name", "production worker service"], "CapitalGlass-Office-ProjectFolder-Provision on CG-WESLEYDESK-01.", "NSSM service running node run-service.mjs with prd config. Identity CG-WESLEYDESK-01.", "current", "production", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json"], ["5ca89f5"], ["worker", "nssm"], ["worker"]),
  qa("IH-PFSP-008", "Q006", "What worker handles dev?", ["dev service", "dev worker name"], "CapitalGlass-Office-ProjectFolder-Provision-Dev with identity CG-WESLEYDESK-01-dev.", "Separate service, dev root, dev Supabase, dev token.", "current", "dev", ["artifacts/agent-runs/project-folder-synology-primary-v1-dev-hosted-environment/receipt.json"], ["8ecf43e"], ["dev", "worker"], ["dev"]),
  qa("IH-PFSP-009", "Q021", "What is the production Synology root?", ["production synology root", "L drive production root"], "L:\\Capital-Glass-Projects\\", "Canonical production root enforced by worker validateConfig; traversal and alternate drives rejected.", "current", "production", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json"], ["5ca89f5"], ["root", "production"], ["synology"]),
  qa("IH-PFSP-010", "Q022", "What is the dev Synology root?", ["dev synology root", "L drive dev root"], "L:\\Capital-Glass-Projects-Dev\\", "Dev lane root isolated from production; used for G1–G10 acceptance and regression.", "current", "dev", ["artifacts/agent-runs/project-folder-synology-primary-v1-dev-hosted-environment/receipt.json"], ["8ecf43e"], ["root", "dev"], ["synology"]),
  qa("IH-PFSP-011", "Q007", "Are dev and production isolated?", ["dev prod separation", "are dev and production isolated"], "Yes — separate Supabase projects, roots, workers, and Doppler configs.", "Dev: mazvavlshjshwklcvxaw, L:\\Capital-Glass-Projects-Dev\\. Prod: wvidyxufvcrtezzkwwse, L:\\Capital-Glass-Projects\\.", "current", "both", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json"], ["5ca89f5"], ["isolation", "dev", "prod"], ["isolation"]),
  qa("IH-PFSP-012", "Q023", "Which Supabase project is production?", ["production supabase ref", "prod supabase project"], "wvidyxufvcrtezzkwwse", "Production Document Center and project-folder jobs use the production Supabase project ref wvidyxufvcrtezzkwwse.", "current", "production", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json"], ["5ca89f5"], ["supabase", "production"], ["supabase"]),
  qa("IH-PFSP-013", "Q024", "Which Supabase project is dev?", ["dev supabase ref", "dev supabase project"], "mazvavlshjshwklcvxaw", "Dev hosted environment uses separate Supabase project mazvavlshjshwklcvxaw.", "current", "dev", ["artifacts/agent-runs/project-folder-synology-primary-v1-dev-hosted-environment/receipt.json"], ["8ecf43e"], ["supabase", "dev"], ["supabase"]),
  qa("IH-PFSP-014", "Q002", "What SHA is live in production?", ["production deploy sha", "documents version", "live application sha"], "Promotion landed at 5a436d1; live /api/version may advance (e.g. 0f84735) as descendant commits deploy.", "Authorized promotion application merge SHA is 5a436d1 (PR #91). Current production alias may show later docs-only commits that remain descendants of the promotion merge. Candidate app source remains e3fe6ec.", "current", "production", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json"], ["5ca89f5"], ["sha", "5a436d1", "e3fe6ec"], ["production", "vercel"]),
  qa("IH-PFSP-015", "Q003", "Why is deployed SHA 5a436d1 instead of e3fe6ec?", ["merge sha vs candidate", "why not e3fe6ec deployed"], "PR #91 merged to main producing merge commit 5a436d1; application source matches e3fe6ec plus docs.", "e3fe6ec is the reproducible application candidate. e0d9d8c added promotion contract docs only. 5a436d1 is the merge commit deployed to production.", "current", "lineage", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json"], ["5ca89f5"], ["lineage", "e3fe6ec", "5a436d1"], ["git"]),
  qa("IH-PFSP-016", "Q025", "Which PR promoted the feature?", ["promotion pr", "pr 91", "what were p1-p10", "production canary"], "CapitalGlass-Documents PR #91 merged at 5a436d1; P1–P10 ALL PASS.", "PR #91 feat(project-folders): Synology-primary production promotion candidate e3fe6ec. Canary PROD-SYNOLOGY-CANARY-20260803 PASS; gate-results.json documents P1–P10.", "current", "lineage", ["pull/91", "artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/gate-results.json"], ["5a436d1"], ["pr", "91", "p1", "p10"], ["github", "verification"]),
  qa("IH-PFSP-017", "Q004", "Is Synology-primary operational in production?", ["is production live", "can we use synology folders", "can wesley test now", "should folder be manually created"], "Yes — for new production projects only, during stabilization observe-only.", "PRODUCTION_PROMOTION_PASS; flag true; worker Running; canary PASS. Create a new production project to test; worker creates folders — do not manually create folders.", "current", "production", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json", "artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/canary-receipt.json"], ["5ca89f5"], ["operational", "production"], ["production"]),
  qa("IH-PFSP-018", "Q008", "Is historical migration active?", ["migrate existing projects", "are existing projects migrated", "is historical migration active"], "No — frozen; not started.", "Stabilization forbids historical project migration. New projects only.", "current", "policy", ["work-progress/projects/project-folder-synology-primary-v1-production-promotion.md"], ["5ca89f5"], ["historical", "migration"], ["migration"], [], ["historical migration active"], ["historical migration", "SharePoint Slice 4"], "critical"),
  qa("IH-PFSP-019", "Q009", "Is SharePoint mirroring active for project folders?", ["sharepoint slice 4", "is sharepoint still used for project folders", "sharepoint mirroring project folders"], "No — SharePoint Slice 4 not started; frozen for project-folder workflow.", "Synology-primary project-folder workflow does not create SharePoint mirror. Unrelated SharePoint document binary workflows for Document Center remain unchanged.", "current", "policy", ["docs/PROJECT_FOLDER_SYNOLOGY_PRIMARY_PRODUCTION_PROMOTION_CONTRACT.md"], ["e0d9d8c"], ["sharepoint", "mirror"], ["sharepoint"], [], [], ["SharePoint Slice 4", "storage expansion"], "critical"),
  qa("IH-PFSP-020", "Q010", "What is stabilization mode?", ["24 hour window", "what must be monitored during stabilization", "what changes are forbidden during stabilization", "what hardening work comes next"], "Observe-only for 24 hours; no storage expansion.", "Monitor queue, worker, folders, cross-contamination, DC errors, SharePoint mirror attempts. Post-stabilization hardening backlog: Vercel CLI pin, CI fixes, queue dedup, Doppler on WESLEYDESK, Platform Health metrics.", "current", "operations", ["work-progress/projects/project-folder-synology-primary-v1-production-promotion.md"], ["5ca89f5"], ["stabilization"], ["operations"], [], [], ["start hardening", "expand storage"], "critical"),
  qa("IH-PFSP-021", "Q011", "Is rollback available?", ["how to rollback", "was rollback executed"], "Yes — ROLLBACK_READY; not executed.", "Flag off, sync Vercel, stop worker, optional promote f16b4ff deployment. Rollback receipt proves readiness only.", "current", "rollback", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/rollback-receipt.json"], ["5ca89f5"], ["rollback"], ["rollback"]),
  qa("IH-PFSP-022", "Q016", "Where is detailed evidence?", ["evidence location", "which commits prove the work", "git authority versus intelligence hub", "are physical paths exposed in api"], "Git harvest at artifacts/agent-runs/harvest-project-folder-synology-primary-chat-v1/ is canonical; L: and Supabase are validated projections.", "Receipt, gates, canary, rollback under production-promotion; harvest manifest owns Q&A index. Paths are server-enforced; clients cannot override roots.", "current", "evidence", ["artifacts/agent-runs/harvest-project-folder-synology-primary-chat-v1/harvest-manifest-v1.json"], ["5066731"], ["evidence", "authority"], ["evidence"], [], [], [], "critical"),
];

const compactRetrieval = {
  schemaVersion: "cross-agent-harvest-compact-retrieval-v1@1.0.0",
  harvestId: HARVEST_ID,
  asOf: AS_OF,
  records: [
    {
      recordId: "current-state-synology-primary-v1",
      currentState: true,
      retrievalPriority: "critical",
      rawScanRequired: false,
      shortAnswer: "Synology-primary project-folder provisioning is LIVE in production for new projects only.",
      facts: {
        live: true,
        productionUrl: "https://documents.capitalglasstxapps.com",
        promotionDeploySha: "5a436d1",
        candidateSha: "e3fe6ec",
        currentLiveShaNote: "Descendant commits (e.g. 0f84735) may be live; promotion merge remains authority",
        flag: "PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=true (prd)",
        worker: "CapitalGlass-Office-ProjectFolder-Provision RUNNING on CG-WESLEYDESK-01",
        productionRoot: "L:\\Capital-Glass-Projects\\",
        devRoot: "L:\\Capital-Glass-Projects-Dev\\",
        productionSupabase: "wvidyxufvcrtezzkwwse",
        devSupabase: "mazvavlshjshwklcvxaw",
        metadataSystemOfRecord: "Supabase production",
        physicalFilesSystemOfRecord: "Synology L: for new project folders",
        frozen: ["historical migration", "SharePoint Slice 4", "storage expansion during stabilization"],
        monitoring: ["queue depth", "worker health", "unexpected folders", "dev/prod contamination", "DC errors"],
        doNotAdvance: ["historical migration", "SharePoint Slice 4", "storage expansion", "production config changes during stabilization"],
        stabilization: "24h observe-only active",
        evidence: "artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json",
      },
    },
  ],
};

const commands = [
  { commandId: "CMD001", name: "check migration drift prd", command: "doppler run -p cg-documents -c prd -- npm run check:project-folder-synology-migration", host: "WSL dev machine", repo: "CapitalGlass-Documents", mutationClass: "verification", approval: "none", authority: "E005" },
  { commandId: "CMD002", name: "probe production routes", command: "node scripts/probe-project-folder-provision-routes.mjs --expect-live", host: "WSL", repo: "CapitalGlass-Documents", mutationClass: "verification", approval: "none", authority: "E006" },
  { commandId: "CMD003", name: "sync flag to Vercel", command: "doppler run -p cg-shared -c prd -- node scripts/sync-hybrid-worker-vercel.mjs", host: "WSL", repo: "CapitalGlass-Documents", mutationClass: "production mutation", approval: "operator", authority: "E009" },
  { commandId: "CMD004", name: "rollback flag off", command: "doppler secrets set PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=false --project cg-documents --config prd", host: "WSL", repo: "Doppler", mutationClass: "rollback", approval: "operator", authority: "E012" },
  { commandId: "CMD005", name: "stop production worker", command: "Stop-Service CapitalGlass-Office-ProjectFolder-Provision", host: "WESLEYDESK Admin PowerShell", repo: "OS", mutationClass: "service control", approval: "operator", authority: "E012" },
  { commandId: "CMD006", name: "worker config tests", command: "npm run test:project-folder-worker-config", host: "WSL", repo: "CapitalGlass-Documents", mutationClass: "verification", approval: "none", authority: "E004" },
  { commandId: "CMD007", name: "harvest validate", command: "npm run harvest:validate -- harvest-project-folder-synology-primary-chat-v1", host: "WSL", repo: "CapitalGlass-Cross-Agent", mutationClass: "verification", approval: "none", authority: "harvest-manifest-v1.json" },
];

const retrievalQuestions = [
  { retrievalId: "RQ01", ihPfspId: "IH-PFSP-001", query: "Where are new project folders stored?" },
  { retrievalId: "RQ02", ihPfspId: "IH-PFSP-002", query: "Where does Document Center save project files?" },
  { retrievalId: "RQ03", ihPfspId: "IH-PFSP-003", query: "Is the whole Document Center hosted on Synology?" },
  { retrievalId: "RQ04", ihPfspId: "IH-PFSP-004", query: "What remains on Vercel?" },
  { retrievalId: "RQ05", ihPfspId: "IH-PFSP-005", query: "What remains in Supabase?" },
  { retrievalId: "RQ06", ihPfspId: "IH-PFSP-006", query: "Which machine creates the folders?" },
  { retrievalId: "RQ07", ihPfspId: "IH-PFSP-007", query: "What worker service handles production?" },
  { retrievalId: "RQ08", ihPfspId: "IH-PFSP-008", query: "What worker handles dev?" },
  { retrievalId: "RQ09", ihPfspId: "IH-PFSP-009", query: "What is the production Synology root?" },
  { retrievalId: "RQ10", ihPfspId: "IH-PFSP-010", query: "What is the dev Synology root?" },
  { retrievalId: "RQ11", ihPfspId: "IH-PFSP-011", query: "Are dev and production isolated?" },
  { retrievalId: "RQ12", ihPfspId: "IH-PFSP-012", query: "Which Supabase project is production?" },
  { retrievalId: "RQ13", ihPfspId: "IH-PFSP-013", query: "Which Supabase project is dev?" },
  { retrievalId: "RQ14", ihPfspId: "IH-PFSP-014", query: "What SHA is live in production?" },
  { retrievalId: "RQ15", ihPfspId: "IH-PFSP-015", query: "Why is deployed SHA 5a436d1 instead of candidate e3fe6ec?" },
  { retrievalId: "RQ16", ihPfspId: "IH-PFSP-016", query: "Which PR promoted the feature?" },
  { retrievalId: "RQ17", ihPfspId: "IH-PFSP-017", query: "Can Wesley test the feature now?" },
  { retrievalId: "RQ18", ihPfspId: "IH-PFSP-018", query: "Is historical migration active?" },
  { retrievalId: "RQ19", ihPfspId: "IH-PFSP-019", query: "Is SharePoint still used for project folders?" },
  { retrievalId: "RQ20", ihPfspId: "IH-PFSP-020", query: "What is the current stabilization mode?" },
  { retrievalId: "RQ21", ihPfspId: "IH-PFSP-021", query: "Was rollback executed?" },
  { retrievalId: "RQ22", ihPfspId: "IH-PFSP-022", query: "Where is the detailed evidence?" },
  { retrievalId: "RQ23", ihPfspId: "IH-PFSP-016", query: "What were P1–P10?" },
  { retrievalId: "RQ24", ihPfspId: "IH-PFSP-022", query: "What is Git authority versus Intelligence Hub?" },
];

const ihPfspMapping = qaRecords.map((r) => ({
  ihPfspId: r.ihPfspId,
  questionId: r.questionId,
  canonicalQuestion: r.canonicalQuestion,
  hubCatalogPath: `02-catalog/knowledge-objects/cross-agent-harvest/${r.ihPfspId}.json`,
}));

const benchmark = {
  schemaVersion: "cross-agent-harvest-retrieval-benchmark-v1@1.1.0",
  harvestId: HARVEST_ID,
  testedAt: AS_OF,
  seedRecordCount: 22,
  questionsTested: 24,
  retrievalLayer: "intelligence-hub-L-catalog",
  retrievalQuestions,
  exactAnswerAccuracy: null,
  authorityCitationCoverage: null,
  currentVsHistoricalAccuracy: null,
  doNotAdvanceCompliance: null,
  ownerBoundaryCompliance: null,
  rawScanRequiredRate: null,
  fileReductionEstimate: 0.85,
  tokenReductionEstimate: 0.8,
  verdict: "PENDING_HUB_RUN",
};

writeJson("evidence-ledger.json", { schemaVersion: "cross-agent-harvest-evidence-ledger-v1@1.0.0", harvestId: HARVEST_ID, entries: evidenceLedger });
writeJson("decision-timeline.json", { schemaVersion: "cross-agent-harvest-decision-timeline-v1@1.0.0", harvestId: HARVEST_ID, events: timeline });
writeJson("contradiction-resolution.json", { schemaVersion: "cross-agent-harvest-contradiction-resolution-v1@1.0.0", harvestId: HARVEST_ID, records: contradictions });
writeJson("qa-index.json", { schemaVersion: "cross-agent-harvest-qa-index-v1@1.0.0", harvestId: HARVEST_ID, chatTranscriptCoverage: "PARTIAL", records: qaRecords });
writeJson("compact-retrieval-records.json", compactRetrieval);
writeJson("command-extract.json", { schemaVersion: "cross-agent-harvest-command-extract-v1@1.0.0", harvestId: HARVEST_ID, commands });
writeJson("retrieval-benchmark.json", benchmark);
writeJson("intelligence-hub-seed-manifest.json", {
  schemaVersion: "cross-agent-harvest-intelligence-hub-seed-v1@1.0.0",
  harvestId: HARVEST_ID,
  workPackageId: "complete-project-folder-synology-intelligence-publication-v1",
  seedRecordCount: 22,
  retrievalQuestionCount: 24,
  catalogDomain: "cross-agent-harvest",
  gitAuthorityCommit: "5066731c2a245a45cf1bd76b3c4d7ff2b7c4c523",
  mapping: ihPfspMapping,
  retrievalQuestions,
  byKindSlice: "00-master-index/BY-KIND/cross-agent-harvest-project-folder-synology.json",
});

console.log("Generated supplementary harvest artifacts in", RUN_DIR);
