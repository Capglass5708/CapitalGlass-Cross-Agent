/**
 * CONVERSATION READ SURFACE over admitted ledger evidence.
 *
 * The capture substrate stores conversations as opaque admitted bytes: it knows
 * a transcript is 411,542 bytes and hashes to a particular value, and nothing
 * else. That is correct for an evidence ledger and useless for intelligence.
 * This module is the read-side lens that turns those bytes back into the thing
 * a human would recognise -- a session, in order, with named speakers -- WITHOUT
 * adding a second archive. Nothing here writes. Nothing here caches plaintext to
 * disk. The ledger stays the only place raw evidence lives.
 *
 * The contract that matters downstream is ADDRESSABILITY. Every message this
 * module emits carries the coordinates needed to point at it again in the
 * original object: line number, byte offset, byte length, and the transcript's
 * own message id. "This came from transcript X" is not an answer to "show me
 * where that was decided"; a line and an offset are.
 *
 * SPEAKER ATTRIBUTION IS NOT ROLE. A Claude Code transcript labels the
 * dispatching agent's prompt to a subagent with `role: "user"`, because from the
 * subagent's side of the wire it is the user turn. Treating that as the human
 * operator speaking is the single most damaging error available here: it would
 * promote an agent's instruction to operator authority. `isSidechain` and
 * `userType` are the fields that separate them, and this module refuses to
 * collapse the distinction.
 */

const PARSER_VERSION = 'conversation-parser-v1@1.0.0';

/**
 * Source systems whose objects can carry a conversation.
 *
 * Deliberately narrow. `documents` and `waverunner` objects are artifacts ABOUT
 * conversations, not conversations, and admitting them here would manufacture
 * speakers that never spoke.
 */
export const CONVERSATION_SOURCE_SYSTEMS = Object.freeze(['claude-code']);

/** Who is actually talking, independent of the wire-level `role` field. */
export const SPEAKER_KIND = Object.freeze({
  /** A human being typed this into the top-level session. */
  HUMAN_OPERATOR: 'HUMAN_OPERATOR',
  /** An agent turn: model output. */
  AGENT: 'AGENT',
  /** An agent DISPATCHING another agent -- wire role is `user`, speaker is not. */
  AGENT_DISPATCH: 'AGENT_DISPATCH',
  /** Harness-generated content injected into the user channel. */
  SYSTEM_HARNESS: 'SYSTEM_HARNESS',
  /** Output of a tool, quoted back into the transcript. */
  TOOL: 'TOOL',
  /** Present in the transcript, attribution not resolvable. Never guessed. */
  UNATTRIBUTED: 'UNATTRIBUTED',
});

export const TRANSCRIPT_FORMAT = Object.freeze({
  CLAUDE_CODE_JSONL: 'CLAUDE_CODE_JSONL',
  UNRECOGNISED: 'UNRECOGNISED',
});

/**
 * Markers of harness-injected text arriving on the user channel.
 *
 * These are not the operator speaking even in a top-level session. A mission
 * that read `<task-notification>` as an operator decision would attribute a
 * machine's bookkeeping to a person.
 */
const HARNESS_MARKERS = [
  '<task-notification>',
  '<system-reminder>',
  '<local-command-stdout>',
  '<command-name>',
  '<user-prompt-submit-hook>',
  'Caveat: The messages below were generated',
];

/**
 * Transport/bookkeeping records that share the transcript file but are not turns.
 *
 * A live session transcript opens with `bridge-session` and a run of
 * `queue-operation` lines before the first real turn. They are session plumbing,
 * not anything anyone said, and admitting them as messages would put ordinal 1
 * on a queue event.
 */
const TRANSPORT_RECORD_TYPES = new Set([
  'bridge-session',
  'queue-operation',
  'summary',
  'file-history-snapshot',
]);

/** How far in to look for a real turn before giving up on the dialect. */
const DETECT_SCAN_LINES = 200;

/**
 * Detect the transcript dialect from the bytes, not from the file name.
 *
 * This scans a WINDOW of leading lines rather than just the first one. Reading
 * only line 1 was a real defect: every top-level session transcript begins with
 * `bridge-session` plus a run of `queue-operation` records, none of which carry
 * `uuid`/`parentUuid`, so a first-line-only probe rejected exactly the files
 * that contain the human operator -- leaving a corpus of nothing but subagent
 * sidechains and a confident report of zero operator turns.
 */
export function detectTranscriptFormat(text) {
  let seenJsonLines = 0;
  const lines = text.split('\n', DETECT_SCAN_LINES + 1);
  for (const line of lines.slice(0, DETECT_SCAN_LINES)) {
    if (!line || !line.startsWith('{')) continue;
    let probe;
    try { probe = JSON.parse(line); } catch { continue; }
    if (!probe || typeof probe !== 'object') continue;
    seenJsonLines += 1;
    if ('type' in probe && ('uuid' in probe || 'parentUuid' in probe)) {
      return TRANSCRIPT_FORMAT.CLAUDE_CODE_JSONL;
    }
    // A file that is only ever transport records is a session that produced no
    // turns; still a Claude transcript, just an empty one.
    if (TRANSPORT_RECORD_TYPES.has(probe.type) && 'sessionId' in probe) {
      return TRANSCRIPT_FORMAT.CLAUDE_CODE_JSONL;
    }
  }
  return seenJsonLines > 0 ? TRANSCRIPT_FORMAT.UNRECOGNISED : TRANSCRIPT_FORMAT.UNRECOGNISED;
}

/**
 * Flatten Anthropic content blocks to the text a reader would see.
 *
 * `thinking` blocks are dropped on purpose: they are the model's scratch work,
 * not a statement made to anyone, and mining them for "decisions" would put
 * words in an agent's mouth that it never actually said. Tool blocks are
 * flattened to a marker so the turn keeps its shape without smuggling tool
 * payloads into the conversational text.
 */
function flattenContent(content) {
  if (typeof content === 'string') return { text: content, toolUse: [], toolResult: false };
  if (!Array.isArray(content)) return { text: '', toolUse: [], toolResult: false };
  const parts = [];
  const toolUse = [];
  let toolResult = false;
  for (const block of content) {
    if (typeof block === 'string') { parts.push(block); continue; }
    if (!block || typeof block !== 'object') continue;
    switch (block.type) {
      case 'text':
        if (typeof block.text === 'string') parts.push(block.text);
        break;
      case 'tool_use':
        toolUse.push(block.name ?? 'unknown');
        break;
      case 'tool_result':
        toolResult = true;
        if (typeof block.content === 'string') parts.push(block.content);
        else if (Array.isArray(block.content)) {
          for (const c of block.content) if (c?.type === 'text' && typeof c.text === 'string') parts.push(c.text);
        }
        break;
      case 'thinking':
      case 'redacted_thinking':
        break;
      default:
        break;
    }
  }
  return { text: parts.join('\n'), toolUse, toolResult };
}

/**
 * Resolve WHO SPOKE, given the record and the session's own shape.
 *
 * The order of these tests is the whole point:
 *   1. a sidechain user turn is an agent dispatching an agent;
 *   2. harness text on the user channel is the harness;
 *   3. a tool_result on the user channel is a tool;
 *   4. only what survives all three is the human.
 *
 * Reversing 1 and 4 is how "an agent recommended X" silently becomes "the
 * operator decided X".
 */
function resolveSpeaker(rec, flat) {
  const type = rec.type;
  if (type === 'assistant') {
    return {
      kind: SPEAKER_KIND.AGENT,
      identity: rec.agentId ? `agent:${rec.agentId}` : 'agent:main-session',
      model: rec.message?.model ?? null,
    };
  }
  if (type === 'system' || type === 'attachment' || type === 'progress') {
    return { kind: SPEAKER_KIND.SYSTEM_HARNESS, identity: `harness:${type}`, model: null };
  }
  if (type === 'user') {
    if (rec.isSidechain === true) {
      return {
        kind: SPEAKER_KIND.AGENT_DISPATCH,
        identity: rec.agentId ? `dispatch-to:${rec.agentId}` : 'dispatch:unknown',
        model: null,
      };
    }
    if (flat.toolResult) {
      return { kind: SPEAKER_KIND.TOOL, identity: 'tool:result', model: null };
    }
    if (rec.isMeta === true) {
      return { kind: SPEAKER_KIND.SYSTEM_HARNESS, identity: 'harness:meta', model: null };
    }
    const t = flat.text ?? '';
    if (HARNESS_MARKERS.some((m) => t.includes(m))) {
      return { kind: SPEAKER_KIND.SYSTEM_HARNESS, identity: 'harness:injected', model: null };
    }
    if (rec.userType && rec.userType !== 'external') {
      return { kind: SPEAKER_KIND.SYSTEM_HARNESS, identity: `harness:${rec.userType}`, model: null };
    }
    return { kind: SPEAKER_KIND.HUMAN_OPERATOR, identity: 'operator:wesley', model: null };
  }
  return { kind: SPEAKER_KIND.UNATTRIBUTED, identity: null, model: null };
}

/**
 * Parse admitted bytes into an ordered, addressable conversation.
 *
 * `bytes` must be the exact plaintext the ledger admitted -- normally the
 * `plaintext` returned by `restoreAdmittedBytes`, so that every offset this
 * function reports indexes the object the ledger hashed, not a copy of it.
 *
 * Offsets are computed in BYTES, cumulatively over the raw buffer, because a
 * character offset into a UTF-8 transcript does not address anything a verifier
 * can seek to.
 */
export function parseConversation({ bytes, entry = null }) {
  const buf = Buffer.isBuffer(bytes) ? bytes : Buffer.from(String(bytes), 'utf8');
  const text = buf.toString('utf8');
  const format = detectTranscriptFormat(text);
  const base = {
    parserVersion: PARSER_VERSION,
    format,
    entryHash: entry?.entryHash ?? null,
    contentHash: entry?.contentHash ?? null,
    sourceSystem: entry?.sourceSystem ?? null,
    sourceNativeId: entry?.sourceNativeId ?? null,
    sourcePath: entry?.sourceObservation?.sourcePath ?? null,
    captureTimestamp: entry?.captureTimestamp ?? null,
    machineId: entry?.machineId ?? null,
  };
  if (format !== TRANSCRIPT_FORMAT.CLAUDE_CODE_JSONL) {
    // Refusing beats guessing: a transcript we cannot address is not evidence
    // we can cite, and half-parsed speakers are worse than none.
    return { ...base, parsed: false, reason: 'UNRECOGNISED_TRANSCRIPT_FORMAT', sessionId: null, messageCount: 0, messages: [], unparseableLines: 0 };
  }

  const messages = [];
  let byteOffset = 0;
  let unparseableLines = 0;
  let transportLines = 0;
  let ordinal = 0;
  let sessionId = entry?.sessionBinding?.sessionId ?? null;
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const lineBytes = Buffer.byteLength(line, 'utf8');
    const thisOffset = byteOffset;
    byteOffset += lineBytes + 1; // + the newline that split() removed

    if (!line.trim()) continue;
    let rec;
    try { rec = JSON.parse(line); } catch { unparseableLines += 1; continue; }
    if (!rec || typeof rec !== 'object') { unparseableLines += 1; continue; }

    if (!sessionId && typeof rec.sessionId === 'string') sessionId = rec.sessionId;

    // Transport records carry the sessionId (useful) and nothing anyone said.
    // They are counted, not numbered: giving a queue event an ordinal would
    // shift every real turn's position in the conversation.
    if (TRANSPORT_RECORD_TYPES.has(rec.type)) { transportLines += 1; continue; }

    const flat = flattenContent(rec.message?.content ?? rec.content ?? null);
    const speaker = resolveSpeaker(rec, flat);

    ordinal += 1;
    messages.push({
      ordinal,
      messageId: rec.uuid ?? null,
      parentMessageId: rec.parentUuid ?? null,
      wireRole: rec.message?.role ?? rec.type ?? null,
      recordType: rec.type ?? null,
      speakerKind: speaker.kind,
      speakerIdentity: speaker.identity,
      model: speaker.model,
      isSidechain: rec.isSidechain === true,
      agentId: rec.agentId ?? null,
      promptId: rec.promptId ?? null,
      slug: rec.slug ?? null,
      timestamp: rec.timestamp ?? null,
      cwd: rec.cwd ?? null,
      gitBranch: rec.gitBranch ?? null,
      sessionId: rec.sessionId ?? sessionId ?? null,
      text: flat.text,
      textLength: flat.text.length,
      toolUse: flat.toolUse,
      // ── addressability: these four are the "show me exactly where" answer ──
      lineNumber: i + 1,
      byteOffset: thisOffset,
      byteLength: lineBytes,
    });
  }

  return {
    ...base,
    parsed: true,
    reason: null,
    sessionId,
    messageCount: messages.length,
    unparseableLines,
    transportLines,
    messages,
  };
}

/**
 * Turn-order projection: the conversation with harness noise removed.
 *
 * Ordinals are PRESERVED from the full parse rather than renumbered, so a
 * citation stays valid whether the caller looked at the filtered or the full
 * view. Renumbering would make two different messages share ordinal 7.
 */
export function conversationalTurns(conversation) {
  return conversation.messages.filter(
    (m) =>
      (m.speakerKind === SPEAKER_KIND.HUMAN_OPERATOR ||
        m.speakerKind === SPEAKER_KIND.AGENT ||
        m.speakerKind === SPEAKER_KIND.AGENT_DISPATCH) &&
      typeof m.text === 'string' &&
      m.text.trim().length > 0
  );
}

/** Session-level facts derived from the parse, for provenance binding. */
export function conversationSummary(conversation) {
  const byKind = {};
  for (const m of conversation.messages) byKind[m.speakerKind] = (byKind[m.speakerKind] ?? 0) + 1;
  const stamped = conversation.messages.map((m) => m.timestamp).filter(Boolean).sort();
  const repos = [...new Set(conversation.messages.map((m) => m.cwd).filter(Boolean))];
  const branches = [...new Set(conversation.messages.map((m) => m.gitBranch).filter(Boolean))];
  return {
    sessionId: conversation.sessionId,
    messageCount: conversation.messageCount ?? 0,
    speakerHistogram: byKind,
    firstTimestamp: stamped[0] ?? null,
    lastTimestamp: stamped[stamped.length - 1] ?? null,
    workingDirectories: repos,
    branches,
    parserVersion: PARSER_VERSION,
  };
}

export { PARSER_VERSION };
