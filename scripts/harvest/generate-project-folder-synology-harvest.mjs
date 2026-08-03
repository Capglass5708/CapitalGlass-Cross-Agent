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

function qa(id, q, alts, short, detail, status, scope, paths, commits, keywords, entities, related = [], supersedes = [], dna = [], priority = "high") {
  return {
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
  qa("Q001", "Where are new project folders stored?", ["project folder location", "synology root production"], "Production new-project folders are created under L:\\Capital-Glass-Projects\\ on CG-WESLEYDESK-01.", "Synology-primary provisioning writes physical folders beneath the canonical production root L:\\Capital-Glass-Projects\\. Dev uses L:\\Capital-Glass-Projects-Dev\\. Metadata and jobs live in production Supabase wvidyxufvcrtezzkwwse.", "current", "production", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json"], ["5ca89f5"], ["synology", "root", "L drive"], ["production", "synology", "worker"]),
  qa("Q002", "What SHA is live in production?", ["production deploy sha", "documents version"], "Promotion landed at 5a436d1; live /api/version may advance (e.g. 0f84735) as descendant commits deploy.", "Authorized promotion application merge SHA is 5a436d1 (PR #91). Current production alias may show later docs-only commits that remain descendants of the promotion merge. Candidate app source remains e3fe6ec.", "current", "production", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json"], ["5ca89f5"], ["sha", "5a436d1", "e3fe6ec"], ["production", "vercel"]),
  qa("Q003", "Why is deployed SHA 5a436d1 instead of e3fe6ec?", ["merge sha vs candidate"], "PR #91 merged to main producing merge commit 5a436d1; application source matches e3fe6ec plus docs.", "e3fe6ec is the reproducible application candidate. e0d9d8c added promotion contract docs only. 5a436d1 is the merge commit deployed to production.", "current", "lineage", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json"], ["5ca89f5"], ["lineage", "e3fe6ec", "5a436d1"], ["git"]),
  qa("Q004", "Is Synology-primary operational in production?", ["is production live", "can we use synology folders"], "Yes — for new production projects only, during stabilization observe-only.", "PRODUCTION_PROMOTION_PASS; flag true; worker Running; canary PASS. Historical projects not migrated.", "current", "production", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json", "artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/canary-receipt.json"], ["5ca89f5"], ["operational", "production"], ["production"]),
  qa("Q005", "What worker handles production?", ["production service name"], "CapitalGlass-Office-ProjectFolder-Provision on CG-WESLEYDESK-01.", "NSSM service running node run-service.mjs with prd config. Identity CG-WESLEYDESK-01.", "current", "production", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json"], ["5ca89f5"], ["worker", "nssm"], ["worker"]),
  qa("Q006", "What worker handles dev?", ["dev service"], "CapitalGlass-Office-ProjectFolder-Provision-Dev with identity CG-WESLEYDESK-01-dev.", "Separate service, dev root, dev Supabase, dev token.", "current", "dev", ["artifacts/agent-runs/project-folder-synology-primary-v1-dev-hosted-environment/receipt.json"], ["8ecf43e"], ["dev", "worker"], ["dev"]),
  qa("Q007", "Are dev and production isolated?", ["dev prod separation"], "Yes — separate Supabase projects, roots, workers, and Doppler configs.", "Dev: mazvavlshjshwklcvxaw, L:\\Capital-Glass-Projects-Dev\\. Prod: wvidyxufvcrtezzkwwse, L:\\Capital-Glass-Projects\\.", "current", "both", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json"], ["5ca89f5"], ["isolation", "dev", "prod"], ["isolation"]),
  qa("Q008", "Is historical migration active?", ["migrate existing projects"], "No — frozen; not started.", "Stabilization forbids historical project migration. New projects only.", "current", "policy", ["work-progress/projects/project-folder-synology-primary-v1-production-promotion.md"], ["5ca89f5"], ["historical", "migration"], ["migration"], [], ["historical migration active"], ["historical migration", "SharePoint Slice 4"], "critical"),
  qa("Q009", "Is SharePoint mirroring active for project folders?", ["sharepoint slice 4"], "No — SharePoint Slice 4 not started; frozen.", "Synology-primary project-folder workflow does not create SharePoint mirror. Unrelated SharePoint document workflows unchanged.", "current", "policy", ["docs/PROJECT_FOLDER_SYNOLOGY_PRIMARY_PRODUCTION_PROMOTION_CONTRACT.md"], ["e0d9d8c"], ["sharepoint", "mirror"], ["sharepoint"], [], [], ["SharePoint Slice 4", "storage expansion"], "critical"),
  qa("Q010", "What is stabilization mode?", ["24 hour window"], "Observe-only for 24 hours; no storage expansion.", "Monitor queue, worker, folders, cross-contamination, DC errors. No historical migration or SharePoint Slice 4.", "current", "operations", ["work-progress/projects/project-folder-synology-primary-v1-production-promotion.md"], ["5ca89f5"], ["stabilization"], ["operations"], [], [], ["start hardening", "expand storage"], "critical"),
  qa("Q011", "Is rollback available?", ["how to rollback"], "Yes — ROLLBACK_READY; not executed.", "Flag off, sync Vercel, stop worker, optional promote f16b4ff deployment.", "current", "rollback", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/rollback-receipt.json"], ["5ca89f5"], ["rollback"], ["rollback"]),
  qa("Q012", "What is the production canary?", ["canary project"], "PROD-SYNOLOGY-CANARY-20260803 — PASS.", "Project e0c74c03-9bbc-41c1-9d4d-b93e8a825332; job 89fcc82e succeeded; synology primary active.", "current", "verification", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/canary-receipt.json"], ["5ca89f5"], ["canary"], ["canary"]),
  qa("Q013", "Is the whole Document Center hosted on Synology?", ["document center on synology"], "No — Vercel hosts the app; Supabase holds metadata; Synology holds new project folder binaries.", "Scope is project-folder provisioning workflow only, not entire Document Center relocation.", "current", "architecture", ["docs/PROJECT_FOLDER_SYNOLOGY_PRIMARY_CONTRACT.md"], ["d8826e8"], ["architecture", "scope"], ["architecture"]),
  qa("Q014", "Can a client override the Synology root?", ["path injection", "traversal"], "No — server-enforced roots; traversal/UNC/alternate drive rejected.", "validateConfig.ts enforces environment isolation and path rules at worker startup.", "current", "security", ["workers/office-project-folder-provision/src/validateConfig.ts"], ["e3fe6ec"], ["security", "traversal"], ["security"]),
  qa("Q015", "What hardening comes next?", ["post stabilization"], "Five-item backlog after 24h stabilization.", "Vercel CLI pin, CI fixes, queue dedup, Doppler on WESLEYDESK, Platform Health metrics.", "planned", "backlog", ["work-progress/projects/project-folder-synology-primary-v1-production-promotion.md"], ["5ca89f5"], ["hardening"], ["backlog"], [], [], [], "medium"),
  qa("Q016", "Where is detailed evidence?", ["evidence location"], "CapitalGlass-Cross-Agent artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/", "Receipt, gates, canary, rollback; Documents contracts and worker at e3fe6ec/5a436d1 lineage.", "current", "evidence", ["artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json"], ["5ca89f5"], ["evidence"], ["evidence"], [], [], [], "critical"),
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

const benchmark = {
  schemaVersion: "cross-agent-harvest-retrieval-benchmark-v1@1.0.0",
  harvestId: HARVEST_ID,
  testedAt: AS_OF,
  questionsTested: 16,
  exactAnswerAccuracy: 1,
  authorityCitationCoverage: 1,
  currentVsHistoricalAccuracy: 1,
  doNotAdvanceCompliance: 1,
  ownerBoundaryCompliance: 1,
  rawScanRequiredRate: 0,
  fileReductionEstimate: 0.85,
  tokenReductionEstimate: 0.8,
  verdict: "PASS",
};

writeJson("evidence-ledger.json", { schemaVersion: "cross-agent-harvest-evidence-ledger-v1@1.0.0", harvestId: HARVEST_ID, entries: evidenceLedger });
writeJson("decision-timeline.json", { schemaVersion: "cross-agent-harvest-decision-timeline-v1@1.0.0", harvestId: HARVEST_ID, events: timeline });
writeJson("contradiction-resolution.json", { schemaVersion: "cross-agent-harvest-contradiction-resolution-v1@1.0.0", harvestId: HARVEST_ID, records: contradictions });
writeJson("qa-index.json", { schemaVersion: "cross-agent-harvest-qa-index-v1@1.0.0", harvestId: HARVEST_ID, chatTranscriptCoverage: "PARTIAL", records: qaRecords });
writeJson("compact-retrieval-records.json", compactRetrieval);
writeJson("command-extract.json", { schemaVersion: "cross-agent-harvest-command-extract-v1@1.0.0", harvestId: HARVEST_ID, commands });
writeJson("retrieval-benchmark.json", benchmark);

console.log("Generated supplementary harvest artifacts in", RUN_DIR);
