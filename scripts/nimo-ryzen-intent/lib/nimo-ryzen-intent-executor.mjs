/**
 * Execute a catalogued NIMO→RYZEN intent through Office Admin admission + AppBuilder governed dispatch.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { appBuilderModuleUrl, CROSS_AGENT_ROOT, resolveOfficeAdminRoot } from "./sibling-authority-paths.mjs";
import { resolveNimoRyzenIntent } from "./nimo-ryzen-intent-resolver.mjs";

const { createGhWorkflowClient } = await import(
  appBuilderModuleUrl("scripts/direct-connect/m5/github-workflow-client.mjs")
);
const {
  CONTROLLER_MACHINE,
  preflightNimoRyzenControllerPlane,
  TARGET_MACHINE,
} = await import(appBuilderModuleUrl("scripts/direct-connect/lib/nimo-ryzen-controller-preflight.mjs"));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKFLOW = ".github/workflows/ryzen9desk-executor-dispatch.yml";
const APPBUILDER_GITHUB_REPO = "Capglass5708/CG-AppBuilder-MCP";

async function evaluateOfficeAdminAdmission(params) {
  const officeAdminRoot = resolveOfficeAdminRoot();
  if (!officeAdminRoot) {
    return {
      verdict: "UNKNOWN",
      ok: true,
      reasons: ["OFFICE_ADMIN_REPO_UNAVAILABLE"],
      provenance: [],
    };
  }
  const mod = await import(
    `file://${path.join(officeAdminRoot, "scripts/lib/evaluate-execution-admission.mjs")}`
  );
  return mod.evaluateExecutionAdmission({ ...params, repoRoot: officeAdminRoot });
}

function findReceiptFile(rootDir, fileName) {
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      else if (entry.name === fileName) return fullPath;
    }
  }
  return null;
}

function readReceiptJson(receiptPath) {
  if (!receiptPath) return null;
  return JSON.parse(fs.readFileSync(receiptPath, "utf8"));
}

function normalizeRepositoryEntries(repositories) {
  return (repositories ?? []).map((row) => ({
    ...row,
    name: row.name ?? row.repo ?? null,
  }));
}

function downloadReceipt(runId, outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  execSync(
    `gh run download "${runId}" --repo ${APPBUILDER_GITHUB_REPO} --dir "${outDir}"`,
    { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] },
  );
  const primaryPath = findReceiptFile(outDir, "ryzen9desk-executor-receipt.json");
  const gitInspectPath = findReceiptFile(outDir, "git-inspect-receipt.json");
  const boundedTestPath = findReceiptFile(outDir, "ryzen9desk-repo-bounded-test-receipt.json");
  const receipt = readReceiptJson(primaryPath);
  if (!receipt) {
    return { receiptPath: null, receipt: null };
  }

  const gitInspect = readReceiptJson(gitInspectPath);
  if (gitInspect?.repositories?.length) {
    receipt.repositories = normalizeRepositoryEntries(gitInspect.repositories);
  }

  const boundedTest = readReceiptJson(boundedTestPath);
  if (boundedTest) {
    receipt.boundedTest = {
      repository: boundedTest.repository ?? null,
      boundedTestKey: boundedTest.boundedTestKey ?? null,
      npmScript: boundedTest.npmScript ?? null,
      verdict: boundedTest.verdict ?? null,
    };
    if (boundedTest.testResult) {
      receipt.testResult = boundedTest.testResult;
    }
  }

  return { receiptPath: primaryPath, receipt };
}

function summarizeOutput(receipt) {
  if (!receipt) return null;
  const chunks = [];
  if (receipt.hostname) chunks.push(`hostname=${receipt.hostname}`);
  if (receipt.host?.wslHostname) chunks.push(`wslHostname=${receipt.host.wslHostname}`);
  if (receipt.repositories?.length === 1) {
    const repo = receipt.repositories[0];
    chunks.push(`repo=${repo.name ?? repo.repo} branch=${repo.branch ?? "?"}`);
  }
  if (receipt.testResult?.exitCode != null) {
    chunks.push(`testExitCode=${receipt.testResult.exitCode}`);
  }
  if (receipt.verdict) chunks.push(`verdict=${receipt.verdict}`);
  return chunks.join("; ") || null;
}

function validateExecutorReceipt(receipt, runId, resolution) {
  const errors = [];
  if (!receipt) {
    errors.push({ code: "RECEIPT_MISSING" });
    return { ok: false, errors };
  }

  if (receipt.controlHost !== CONTROLLER_MACHINE) {
    errors.push({
      code: "CONTROL_HOST_NOT_NIMO",
      actual: receipt.controlHost,
      expected: CONTROLLER_MACHINE,
    });
  }

  if (receipt.controllerAttribution?.reasonCode !== "CONTROLLER_ATTRIBUTION_VERIFIED") {
    errors.push({
      code: "CONTROLLER_ATTRIBUTION_NOT_VERIFIED",
      actual: receipt.controllerAttribution?.reasonCode ?? null,
    });
  }

  const executionHost = receipt.executionHost ?? receipt.host?.wslHostname ?? receipt.machineId;
  if (
    executionHost !== "RYZEN9DESK"
    && executionHost !== TARGET_MACHINE
    && executionHost !== "CG-RYZEN9DESK-01"
  ) {
    errors.push({ code: "EXECUTOR_NOT_RYZEN", actual: executionHost });
  }

  if (receipt.verdict && !["PASS", "CONTROLLER_ATTRIBUTION_VERIFIED", "COMPLETE"].includes(receipt.verdict)) {
    errors.push({ code: "EXECUTOR_VERDICT_NOT_PASS", actual: receipt.verdict });
  }

  if (runId && String(receipt.runId ?? "") !== String(runId)) {
    errors.push({ code: "RUN_ID_MISMATCH", receiptRunId: receipt.runId, runId });
  }

  if (resolution?.jobProfile === "git-inspect" && resolution.resolvedRepo) {
    const names = (receipt.repositories ?? []).map((r) => r.name ?? r.repo);
    if (!names.includes(resolution.resolvedRepo)) {
      errors.push({ code: "GIT_INSPECT_REPO_MISMATCH", expected: resolution.resolvedRepo, actual: names });
    }
  }

  if (resolution?.jobProfile === "repo-bounded-test") {
    const testExit = receipt.testResult?.exitCode ?? receipt.boundedTest?.testResult?.exitCode;
    if (testExit != null && testExit !== 0) {
      errors.push({ code: "BOUNDED_TEST_FAILED", exitCode: testExit });
    }
    if (receipt.boundedTest?.verdict && receipt.boundedTest.verdict !== "PASS") {
      errors.push({ code: "BOUNDED_TEST_VERDICT_NOT_PASS", actual: receipt.boundedTest.verdict });
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * @param {string} instruction natural-language operator instruction
 * @param {{ dryRun?: boolean, ref?: string, approvalRef?: string, requestedBy?: string }} options
 */
export async function executeNimoRyzenIntent(instruction, options = {}) {
  const startedAt = new Date().toISOString();
  const resolution = resolveNimoRyzenIntent(instruction);
  if (!resolution.ok) {
    return {
      ok: false,
      phase: "resolve",
      startedAt,
      completedAt: new Date().toISOString(),
      instruction,
      resolution,
    };
  }

  const officeAdminRoot = resolveOfficeAdminRoot();
  const admission = await evaluateOfficeAdminAdmission({
    controllerMachineId: CONTROLLER_MACHINE,
    targetMachineId: resolution.targetMachine,
    missionId: resolution.workPackageId,
    operation: resolution.admissionOperation,
    lifecycleState: "READY",
    repoRoot: officeAdminRoot ?? undefined,
  });

  const preflight = await preflightNimoRyzenControllerPlane();
  if (!preflight.ok) {
    return {
      ok: false,
      phase: "preflight",
      startedAt,
      completedAt: new Date().toISOString(),
      instruction,
      resolution,
      admission,
      preflight,
    };
  }

  if (admission.verdict !== "ALLOWED") {
    return {
      ok: false,
      phase: "admission",
      startedAt,
      completedAt: new Date().toISOString(),
      instruction,
      resolution,
      admission,
      preflight,
    };
  }

  if (options.dryRun) {
    return {
      ok: true,
      phase: "dry-run",
      startedAt,
      completedAt: new Date().toISOString(),
      instruction,
      resolution,
      admission,
      preflight,
      skippedDispatch: true,
    };
  }

  const workflowRef = options.ref ?? process.env.CG_NIMO_RYZEN_PROOF_REF?.trim() ?? "main";
  const client = createGhWorkflowClient({ ref: workflowRef, pollTimeoutMs: options.pollTimeoutMs ?? 300_000 });
  const dispatchInputs = {
    workPackageId: resolution.workPackageId,
    jobProfile: resolution.jobProfile,
    dispatchController: CONTROLLER_MACHINE,
    approvalRef:
      options.approvalRef
      ?? `nimo-ryzen-intent-${resolution.intentId}-${Date.now()}`,
  };
  if (resolution.resolvedRepo && resolution.jobProfile === "git-inspect") {
    dispatchInputs.repos = resolution.resolvedRepo;
  }
  if (resolution.jobProfile === "repo-bounded-test") {
    dispatchInputs.boundedTestRepo = resolution.resolvedRepo;
    dispatchInputs.boundedTestKey = resolution.boundedTestKey;
  }

  const dispatch = await client.dispatch(WORKFLOW, dispatchInputs);
  if (!dispatch.ok) {
    return {
      ok: false,
      phase: "dispatch",
      startedAt,
      completedAt: new Date().toISOString(),
      instruction,
      resolution,
      admission,
      preflight,
      dispatch,
    };
  }

  const receiptDownloadDir = path.join(
    CROSS_AGENT_ROOT,
    "artifacts/agent-runs/cg-nimo-ryzen-intent-to-execution-v1",
    "receipt-download",
    `${resolution.intentId}-${dispatch.runId}`,
  );
  const { receiptPath, receipt } = downloadReceipt(dispatch.runId, receiptDownloadDir);
  const receiptValidation = validateExecutorReceipt(receipt, dispatch.runId, resolution);
  const completedAt = new Date().toISOString();

  const operatorReceipt = {
    schemaVersion: "cg-nimo-ryzen-intent-execution-receipt-v1@1.0.0",
    requestedBy: options.requestedBy ?? "NIMO/operator",
    controlHost: receipt?.controlHost ?? CONTROLLER_MACHINE,
    targetMachine: resolution.targetMachine,
    resolvedRepo: resolution.resolvedRepo,
    operation: resolution.operation,
    admission: {
      verdict: admission.verdict,
      operation: resolution.admissionOperation,
      provenance: admission.provenance,
    },
    resolution,
    preflight: {
      reasonCode: preflight.reasonCode,
      leaseAction: preflight.leaseEnsure?.action ?? null,
      dispatchEligibility: preflight.dispatchEligibility?.verdict ?? null,
    },
    dispatch: {
      runId: dispatch.runId,
      runUrl: dispatch.runUrl,
      workflowRef,
      jobProfile: resolution.jobProfile,
    },
    executorHost: receipt?.executionHost ?? receipt?.host?.wslHostname ?? null,
    exitCode: receipt?.testResult?.exitCode ?? (receiptValidation.ok ? 0 : 1),
    stdoutStderrSummary: summarizeOutput(receipt),
    startedAt,
    completedAt,
    provenance: {
      intentCatalog: resolution.catalogAuthority,
      admissionPolicy: admission.provenance,
      executorReceiptPath: receiptPath,
    },
    receiptValidation,
    ok: receiptValidation.ok && dispatch.ok,
  };

  return {
    ok: operatorReceipt.ok,
    phase: operatorReceipt.ok ? "complete" : "receipt-validation",
    instruction,
    operatorReceipt,
    receipt,
    receiptPath,
    resolution,
    admission,
    preflight,
    dispatch,
  };
}
