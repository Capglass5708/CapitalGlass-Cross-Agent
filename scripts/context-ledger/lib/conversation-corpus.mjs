/**
 * CONVERSATION CORPUS -- the only supported way to read conversations out of
 * the evidence ledger.
 *
 * Two problems this exists to solve.
 *
 * FIRST, COST. `restoreAdmittedBytes` and `lookupByContentHash` each call
 * `scanEntries`, which parses every entry file in the vault. That is the right
 * shape for a verifier answering one question from a cold process, and the
 * wrong shape for an extractor answering seventeen thousand. Calling the
 * per-entry API in a loop is O(n^2) and turns a two-minute extraction into an
 * afternoon. This module scans ONCE and indexes, then serves lookups from the
 * index -- while decrypting through exactly the same crypto path, so the bytes
 * an extractor sees are the bytes the ledger admitted, not a faster
 * approximation of them.
 *
 * SECOND, QUARANTINE. Sources refused for carrying secret material are recorded
 * in a SEPARATE register that deliberately withholds the content hash and never
 * stores a payload. There is therefore no path from a register entry to bytes --
 * quarantined material is structurally unreachable from here, not merely
 * filtered out. Structure is the real guarantee; the explicit intersection check
 * in `assertQuarantineIsolation` exists so the guarantee is OBSERVED rather than
 * assumed, and so a future change that started admitting refused sources would
 * fail loudly instead of leaking quietly.
 *
 * Read-only by construction: nothing in this file writes to the vault.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

import { scanEntries } from './ledger.mjs';
import { decryptObject } from './crypto.mjs';
import { objectStorePath, sha256Prefixed } from './canonical.mjs';
import { vaultLayout } from './estate-api.mjs';
import { quarantineRoots, readQuarantineRegister, verifyQuarantineRegister } from './quarantine.mjs';
import { CONVERSATION_SOURCE_SYSTEMS, parseConversation, conversationSummary } from './conversation.mjs';

export const CORPUS_VERSION = 'conversation-corpus-v1@1.0.0';

/**
 * Open the corpus: one vault scan, one register read, one isolation assertion.
 *
 * The key is required to READ but not to ENUMERATE. Listing which conversations
 * exist is metadata already sitting in cleartext in the ledger entries;
 * recovering what was said in them is not. Keeping those two capabilities
 * separate means an inventory or an idempotency check can run without key
 * authority at all.
 */
export function openConversationCorpus({ vaultBase, key = null, sourceSystems = CONVERSATION_SOURCE_SYSTEMS }) {
  const layout = vaultLayout(vaultBase);
  const entries = scanEntries(layout.vaultRoot);
  const q = quarantineRoots(vaultBase);
  const register = existsSync(q.registerRoot) ? readQuarantineRegister(q.registerRoot) : [];

  const allowed = new Set(sourceSystems);
  const conversational = entries.filter((e) => allowed.has(e.sourceSystem));

  // contentHash -> the observations that saw those exact bytes. One transcript
  // mirrored into the Windows tree and the WSL tree is two observations of one
  // object; deduplicating by contentHash is what stops the extractor from
  // publishing the same decision three times because the file was copied.
  const byContentHash = new Map();
  for (const e of conversational) {
    if (!byContentHash.has(e.contentHash)) byContentHash.set(e.contentHash, []);
    byContentHash.get(e.contentHash).push(e);
  }
  const byEntryHash = new Map(conversational.map((e) => [e.entryHash, e]));

  const isolation = assertQuarantineIsolation({ conversationalEntries: conversational, register, registerRoot: q.registerRoot });

  return {
    corpusVersion: CORPUS_VERSION,
    vaultBase,
    layout,
    keyAvailable: Boolean(key),
    totalLedgerEntries: entries.length,
    conversationalEntryCount: conversational.length,
    distinctObjectCount: byContentHash.size,
    quarantine: isolation,

    /** Distinct conversation OBJECTS, each with its observation list. */
    listObjects() {
      return [...byContentHash.entries()].map(([contentHash, obs]) => ({
        contentHash,
        observationCount: obs.length,
        // The canonical observation is the earliest-sequenced one. Picking
        // deterministically matters: it is what makes a replay produce the same
        // provenance for the same bytes instead of whichever copy sorted first
        // on this particular filesystem.
        canonical: obs.slice().sort((a, b) => a.seq - b.seq)[0],
        observations: obs,
      }));
    },

    getEntry(entryHash) {
      return byEntryHash.get(entryHash) ?? null;
    },

    /**
     * Restore the admitted plaintext for an object.
     *
     * Verifies the stored ciphertext hash before decrypting and the recovered
     * plaintext hash after, exactly as `restoreAdmittedBytes` does. A restore
     * that skipped either check would be returning bytes nobody can vouch for.
     */
    restore(contentHash) {
      const obs = byContentHash.get(contentHash);
      if (!obs || obs.length === 0) return { restored: false, reason: 'NO_LEDGER_ENTRY_FOR_THAT_CONTENT_HASH', contentHash };
      const entry = obs[0];
      const ciphertextHash = entry.encryption?.ciphertextHash ?? null;
      if (!ciphertextHash) return { restored: false, reason: 'ENTRY_RECORDS_NO_CIPHERTEXT_ADDRESS', contentHash };
      const objectPath = path.join(layout.spoolRoot, objectStorePath(ciphertextHash));
      if (!existsSync(objectPath)) return { restored: false, reason: 'ENCRYPTED_OBJECT_NOT_PRESENT_IN_LOCAL_SPOOL', contentHash };
      const stored = readFileSync(objectPath);
      if (sha256Prefixed(stored) !== ciphertextHash) return { restored: false, reason: 'STORED_OBJECT_CIPHERTEXT_HASH_MISMATCH', contentHash };
      if (!key) return { restored: false, reason: 'KEY_AUTHORITY_REQUIRED_PLAINTEXT_IS_NOT_AT_REST', contentHash, objectPresent: true };
      let plaintext;
      try { plaintext = decryptObject({ blob: stored, key, aad: {} }); }
      catch { return { restored: false, reason: 'AUTHENTICATED_DECRYPTION_FAILED', contentHash }; }
      const restoredHash = sha256Prefixed(plaintext);
      if (restoredHash !== contentHash) return { restored: false, reason: 'RESTORED_PLAINTEXT_HASH_MISMATCH', contentHash };
      return { restored: true, plaintext, contentHash, restoredHash, hashMatches: true, byteLength: plaintext.length, plaintextAtRest: false };
    },

    /** Restore + parse in one step, carrying the ledger entry into provenance. */
    loadConversation(contentHash) {
      const r = this.restore(contentHash);
      if (!r.restored) return { loaded: false, reason: r.reason, contentHash };
      const obs = byContentHash.get(contentHash);
      const canonical = obs.slice().sort((a, b) => a.seq - b.seq)[0];
      const conversation = parseConversation({ bytes: r.plaintext, entry: canonical });
      return {
        loaded: true,
        contentHash,
        byteLength: r.byteLength,
        observationCount: obs.length,
        conversation,
        summary: conversationSummary(conversation),
      };
    },
  };
}

/**
 * Prove refused material is not reachable from the conversation corpus.
 *
 * Checks three things that fail for different reasons:
 *   - the register verifies as an intact chain (nothing rewritten after the
 *     fact to turn a refusal into a capture);
 *   - no register entry carries a content hash or an encryption envelope, so
 *     there is no address to fetch even if someone tried;
 *   - no conversational ledger entry shares a source identity with a refused
 *     source.
 *
 * The third is the one people expect and the second is the one that actually
 * makes the leak impossible.
 */
export function assertQuarantineIsolation({ conversationalEntries, register, registerRoot }) {
  const verification = registerRoot && existsSync(registerRoot)
    ? verifyQuarantineRegister(registerRoot)
    : { verified: true, count: 0, violations: [] };

  const refusedPaths = new Set(register.map((r) => r.sourcePath).filter(Boolean));
  const refusedRelative = new Set(register.map((r) => r.relativePath).filter(Boolean));
  const refusedNativeIds = new Set(register.map((r) => r.sourceNativeId).filter(Boolean));

  const violations = [];
  for (const r of register) {
    if (r.contentHash !== undefined) violations.push({ code: 'REGISTER_ENTRY_CARRIES_CONTENT_HASH', refusalId: r.refusalId });
    if (r.encryption !== undefined) violations.push({ code: 'REGISTER_ENTRY_CARRIES_ENCRYPTION_ENVELOPE', refusalId: r.refusalId });
    if (r.payloadCaptured !== false) violations.push({ code: 'REGISTER_ENTRY_CLAIMS_PAYLOAD_CAPTURED', refusalId: r.refusalId });
  }
  for (const e of conversationalEntries) {
    const sp = e.sourceObservation?.sourcePath;
    const rp = e.sourceObservation?.relativePath;
    if (sp && refusedPaths.has(sp)) violations.push({ code: 'QUARANTINED_SOURCE_PATH_REACHABLE_IN_CORPUS', entryHash: e.entryHash });
    if (rp && refusedRelative.has(rp)) violations.push({ code: 'QUARANTINED_RELATIVE_PATH_REACHABLE_IN_CORPUS', entryHash: e.entryHash });
    if (e.sourceNativeId && refusedNativeIds.has(e.sourceNativeId)) violations.push({ code: 'QUARANTINED_NATIVE_ID_REACHABLE_IN_CORPUS', entryHash: e.entryHash });
  }

  return {
    registerEntryCount: register.length,
    registerChainVerified: verification.verified !== false && (verification.violations?.length ?? 0) === 0,
    registerVerificationViolations: verification.violations ?? [],
    conversationalEntriesChecked: conversationalEntries.length,
    // Structural fact, restated as data so a downstream receipt can carry it:
    // there is no address in the register that resolves to bytes.
    payloadReachableFromRegister: false,
    violations,
    isolated: violations.length === 0 && (verification.violations?.length ?? 0) === 0,
  };
}
