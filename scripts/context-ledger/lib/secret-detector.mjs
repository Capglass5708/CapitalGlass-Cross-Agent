/**
 * PRE-ADMISSION SECRET DETECTOR.
 *
 * This runs BEFORE any source byte is admitted to the ledger, the spool, the
 * object store, or any storage leg. It is the only thing standing between a
 * credential sitting in a file on this machine and a credential sitting inside
 * an immutable, hash-chained, replicated archive that by design cannot be
 * edited or deleted. An immutable store is the worst possible place to learn
 * that a secret leaked: rotation fixes the credential, but the archive keeps
 * the plaintext forever.
 *
 * THE ONE RULE THIS FILE EXISTS TO ENFORCE:
 *   A matched value is NEVER logged, echoed, returned, hashed, stored, or
 *   embedded in a diagnostic, a receipt, an error message, or a test
 *   expectation. A finding carries detectorId, severity, offset, length and a
 *   constant redaction marker. Nothing else.
 *
 * Deliberately NOT included in a finding:
 *   - the value, or any prefix/suffix of it
 *   - a hash of the value. A truncated or full digest of a secret is a
 *     verification oracle: anyone holding a candidate can confirm it. It would
 *     also be genuinely useful for dedup, which is exactly why it is tempting
 *     and exactly why it is refused here.
 *   - surrounding context bytes ("the line it was on"), which is how redaction
 *     tooling usually leaks the thing it was redacting.
 *
 * DETECTION IS FAIL-CLOSED. A false positive costs one source moving to the
 * QUARANTINED_SECRET terminal state, which is explicitly accounted for and
 * fully reversible by a human. A false negative costs a permanent plaintext
 * credential in an immutable archive. The asymmetry is not close, so the
 * heuristics lean toward detection.
 *
 * Two layers, because prefixes alone are not enough:
 *   1. STRUCTURAL detectors -- issuer-assigned shapes (ghp_, AKIA..., dp.st.,
 *      PEM headers, JWTs, credential-bearing URLs). High confidence, no
 *      entropy test needed.
 *   2. CONTEXTUAL + ENTROPY detectors -- a name that means "credential"
 *      (KEY/TOKEN/SECRET/PASSWORD/...) assigned a value whose Shannon entropy
 *      says it is random rather than prose. This is what catches the vendor
 *      whose prefix we have never seen.
 */
import { createReadStream } from 'node:fs';
import { statSync } from 'node:fs';

export const VERDICT = { CLEAN: 'CLEAN', SECRET_DETECTED: 'SECRET_DETECTED' };
export const SEVERITY = { CRITICAL: 'CRITICAL', HIGH: 'HIGH', MEDIUM: 'MEDIUM' };

/** The only representation of a matched value that may ever leave this module. */
export const REDACTED = '[REDACTED]';

/**
 * Shannon entropy in bits per character.
 *
 * Prose and identifiers sit around 2.5-3.5 bits/char. Random base64 approaches
 * 6, random hex approaches 4. This separates "a random string" from "a long
 * variable name" without ever needing to know what the string means.
 */
export function shannonEntropy(str) {
  if (!str || str.length === 0) return 0;
  const freq = new Map();
  for (const ch of str) freq.set(ch, (freq.get(ch) ?? 0) + 1);
  let h = 0;
  for (const n of freq.values()) {
    const p = n / str.length;
    h -= p * Math.log2(p);
  }
  return h;
}

/** Distinct character classes present. One class (all digits, all lowercase) is rarely a credential. */
export function charClasses(str) {
  let c = 0;
  if (/[a-z]/.test(str)) c += 1;
  if (/[A-Z]/.test(str)) c += 1;
  if (/[0-9]/.test(str)) c += 1;
  if (/[^A-Za-z0-9]/.test(str)) c += 1;
  return c;
}

/**
 * Values that look like credentials but are documentation, templates or
 * deliberate fakes. Suppressing these is not weakening detection -- a template
 * placeholder is not a secret, and quarantining every README would make the
 * archive useless without making it safer.
 *
 * Note what is NOT suppressed: anything that merely *sits near* the word
 * "example". Only the value itself is judged.
 */
const PLACEHOLDER_EXACT = new Set([
  'changeme', 'change_me', 'placeholder', 'example', 'examplekey', 'redacted',
  'yourkeyhere', 'your_key_here', 'yourtokenhere', 'your_token_here', 'notasecret',
  'dummy', 'sample', 'testvalue', 'todo', 'tbd', 'none', 'null', 'undefined',
  'password', 'secret', 'token', 'apikey', 'api_key', 'xxxxxxxxxxxxxxxx',
  'akiaiosfodnn7example', 'wjalrxutnfemi_k7mdeng_bpxrficyexamplekey',
]);

const TEMPLATE_SHAPES = [
  /^\$\{[^}]*\}$/,            // ${VAR}
  /^\{\{[^}]*\}\}$/,          // {{ handlebars }}
  /^<[^>]*>$/,                // <your-token>
  /^%[A-Za-z0-9_]+%$/,        // %WINDOWS_VAR%
  /^\$[A-Za-z_][A-Za-z0-9_]*$/, // $VAR
  /^\*+$/,                    // ****
  /^\.+$/,
  /^-+$/,
  /^\[?redacted\]?$/i,
  /^(x|y|z|a|0|1|\*|\.)\1{5,}$/i,
];

const REFERENCE_SHAPES = [
  /process\.env/i,
  /os\.environ/i,
  /^env[.:]/i,
  /^doppler:/i,
  /^vault:/i,
  /^secretref:/i,
  /^\$\(/,                    // $(command substitution)
  /^sha256:/i,                // a content hash is published metadata, not a credential
  /^https?:\/\/[^:@\s]*$/i,   // a plain URL with no embedded credential
];

export function isLikelyPlaceholder(value) {
  if (!value) return true;
  const v = String(value).trim();
  if (v.length === 0) return true;
  const lower = v.toLowerCase();
  if (PLACEHOLDER_EXACT.has(lower)) return true;
  if (lower.includes('example') && lower.length <= 64) return true;
  if (lower.includes('placeholder') || lower.includes('changeme') || lower.includes('redacted')) return true;
  if (lower.includes('fake') || lower.includes('synthetic') && lower.includes('not')) return true;
  // Prefix forms too: the generic value character class stops before '}', so
  // "${VAR}" arrives here as "${VAR" and no longer matches a CLOSED template
  // shape. Without this, every templated config line reads as a credential.
  if (/^\$\{|^\{\{|^</.test(v)) return true;
  for (const re of TEMPLATE_SHAPES) if (re.test(v)) return true;
  for (const re of REFERENCE_SHAPES) if (re.test(v)) return true;
  // A single repeated character carries no entropy no matter how long it is.
  if (new Set(v).size <= 2) return true;
  return false;
}

/**
 * Entropy gate for contextual detectors.
 *
 * Length-aware: Shannon entropy of a SHORT random string systematically
 * underestimates its true randomness (a 16-char draw cannot exhibit more than
 * 16 distinct symbols), so a single fixed threshold would either miss short
 * tokens or drown in false positives on long prose.
 */
export function looksHighEntropy(value) {
  const v = String(value);
  if (v.length < 12) return false;
  if (isLikelyPlaceholder(v)) return false;
  const h = shannonEntropy(v);
  const classes = charClasses(v);
  // Long values (>=40) may be single-case hex -- a 40-char sha-like token is a
  // credential shape in its own right, so two classes is enough there.
  if (v.length >= 40) return h >= 3.2 && classes >= 2;
  // Mid-length values must MIX at least three character classes. This is what
  // rejects "the_quick_brown_fox_jumps" (lowercase + underscore, entropy 4.1)
  // while still accepting a mixed-class high-entropy token.
  if (v.length >= 16) return h >= 3.4 && classes >= 3;
  return h >= 3.8 && classes >= 3;                     // 12-15 chars
}

/**
 * Detector registry.
 *
 * `valueGroup` names which capture group holds the credential material, so the
 * reported offset/length points at the value rather than at the whole match --
 * useful for a human doing remediation, and it never requires emitting bytes.
 */
export const DETECTORS = [
  // ---- structural: private key material -------------------------------
  {
    id: 'private-key-pem-block', severity: SEVERITY.CRITICAL,
    pattern: /-----BEGIN(?: [A-Z0-9]+)* PRIVATE KEY(?: BLOCK)?-----/g,
    structural: true,
  },
  {
    id: 'putty-private-key', severity: SEVERITY.CRITICAL,
    pattern: /PuTTY-User-Key-File-\d/g, structural: true,
  },
  {
    id: 'pgp-private-key-block', severity: SEVERITY.CRITICAL,
    pattern: /-----BEGIN PGP PRIVATE KEY BLOCK-----/g, structural: true,
  },

  // ---- structural: issuer-assigned token shapes ------------------------
  {
    id: 'aws-access-key-id', severity: SEVERITY.CRITICAL,
    pattern: /\b((?:AKIA|ASIA|ABIA|ACCA|AIDA|AGPA|AIPA|ANPA|ANVA|AROA)[A-Z0-9]{16})\b/g,
    valueGroup: 1, structural: true,
  },
  {
    id: 'aws-secret-access-key', severity: SEVERITY.CRITICAL,
    pattern: /aws_?secret_?access_?key["'\s]*[:=]\s*["']?([A-Za-z0-9/+=]{40})["']?/gi,
    valueGroup: 1, structural: true,
  },
  {
    id: 'aws-session-token', severity: SEVERITY.CRITICAL,
    pattern: /aws_?session_?token["'\s]*[:=]\s*["']?([A-Za-z0-9/+=]{100,})["']?/gi,
    valueGroup: 1, structural: true,
  },
  {
    id: 'github-token', severity: SEVERITY.CRITICAL,
    pattern: /\b((?:ghp|gho|ghs|ghu|ghr)_[A-Za-z0-9]{36,})\b/g,
    valueGroup: 1, structural: true,
  },
  {
    id: 'github-fine-grained-pat', severity: SEVERITY.CRITICAL,
    pattern: /\b(github_pat_[A-Za-z0-9_]{22,})\b/g, valueGroup: 1, structural: true,
  },
  {
    id: 'github-app-jwt-or-oauth', severity: SEVERITY.HIGH,
    pattern: /\b(gh[a-z]_[A-Za-z0-9]{30,})\b/g, valueGroup: 1, structural: true,
  },
  {
    id: 'doppler-token', severity: SEVERITY.CRITICAL,
    pattern: /\b(dp\.(?:pt|st|sa|ct|scim|audit)\.[A-Za-z0-9_.-]{20,})/g,
    valueGroup: 1, structural: true,
  },
  {
    id: 'supabase-access-token', severity: SEVERITY.CRITICAL,
    pattern: /\b(sbp_[A-Fa-f0-9]{40,})\b/g, valueGroup: 1, structural: true,
  },
  {
    id: 'supabase-secret-key', severity: SEVERITY.CRITICAL,
    pattern: /\b(sb_secret_[A-Za-z0-9_-]{16,})\b/g, valueGroup: 1, structural: true,
  },
  {
    // A JWT is not decoded here. Reading the payload to decide whether it is a
    // service_role key would mean inspecting credential material to classify
    // credential material. Every three-part JWT is treated as sensitive and the
    // source is quarantined -- fail closed, learn nothing.
    id: 'jwt-token', severity: SEVERITY.HIGH,
    pattern: /\b(eyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,})/g,
    valueGroup: 1, structural: true,
  },
  {
    id: 'cloudflare-global-api-key', severity: SEVERITY.CRITICAL,
    pattern: /\b(?:cf|cloudflare)[_-]?(?:global[_-]?)?api[_-]?key["'\s]*[:=]\s*["']?([a-f0-9]{37})["']?/gi,
    valueGroup: 1, structural: true,
  },
  {
    id: 'cloudflare-api-token', severity: SEVERITY.CRITICAL,
    pattern: /\b(?:cf|cloudflare)[_-]?api[_-]?token["'\s]*[:=]\s*["']?([A-Za-z0-9_-]{40})["']?/gi,
    valueGroup: 1, structural: true,
  },
  {
    id: 'cloudflare-origin-ca-key', severity: SEVERITY.CRITICAL,
    pattern: /\b(v1\.0-[A-Za-z0-9_-]{20,}-[A-Za-z0-9_-]{20,})/g, valueGroup: 1, structural: true,
  },
  {
    id: 'railway-token', severity: SEVERITY.CRITICAL,
    pattern: /\brailway[_-]?(?:api[_-]?)?token["'\s]*[:=]\s*["']?([A-Za-z0-9-]{20,})["']?/gi,
    valueGroup: 1, structural: true,
  },
  {
    id: 'vercel-token', severity: SEVERITY.CRITICAL,
    pattern: /\bvercel[_-]?(?:api[_-]?)?token["'\s]*[:=]\s*["']?([A-Za-z0-9]{20,})["']?/gi,
    valueGroup: 1, structural: true,
  },
  {
    id: 'anthropic-api-key', severity: SEVERITY.CRITICAL,
    pattern: /\b(sk-ant-[A-Za-z0-9_-]{20,})/g, valueGroup: 1, structural: true,
  },
  {
    id: 'openai-api-key', severity: SEVERITY.CRITICAL,
    pattern: /\b(sk-(?:proj-|svcacct-|admin-)?[A-Za-z0-9_-]{20,})/g, valueGroup: 1, structural: true,
  },
  {
    id: 'google-api-key', severity: SEVERITY.CRITICAL,
    pattern: /\b(AIza[0-9A-Za-z_-]{35})\b/g, valueGroup: 1, structural: true,
  },
  {
    id: 'slack-token', severity: SEVERITY.CRITICAL,
    pattern: /\b(xox[abprs]-[A-Za-z0-9-]{10,})/g, valueGroup: 1, structural: true,
  },
  {
    id: 'stripe-secret-key', severity: SEVERITY.CRITICAL,
    pattern: /\b((?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,})\b/g, valueGroup: 1, structural: true,
  },
  {
    id: 'sendgrid-api-key', severity: SEVERITY.CRITICAL,
    pattern: /\b(SG\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,})/g, valueGroup: 1, structural: true,
  },
  {
    id: 'twilio-api-key', severity: SEVERITY.CRITICAL,
    pattern: /\b(SK[a-f0-9]{32})\b/g, valueGroup: 1, structural: true,
  },
  {
    id: 'npm-access-token', severity: SEVERITY.CRITICAL,
    pattern: /\b(npm_[A-Za-z0-9]{36})\b/g, valueGroup: 1, structural: true,
  },
  {
    id: 'pypi-upload-token', severity: SEVERITY.CRITICAL,
    pattern: /\b(pypi-AgEIcHlwaS5vcmc[A-Za-z0-9_-]{20,})/g, valueGroup: 1, structural: true,
  },

  // ---- structural: credentials embedded in locators --------------------
  {
    // scheme://user:password@host -- the password is in the URL, which is how
    // credentials end up in logs, error messages and connection dumps.
    id: 'connection-string-credentials', severity: SEVERITY.CRITICAL,
    pattern: /\b(?:postgres|postgresql|mysql|mariadb|mongodb\+srv|mongodb|redis|rediss|amqps?|ftps?|sftp|ssh|https?|smtps?|mssql|clickhouse|nats|kafka):\/\/[^\s:@/'"]{1,128}:([^\s:@/'"]{4,256})@/gi,
    valueGroup: 1, structural: true,
  },
  {
    id: 'authorization-bearer-token', severity: SEVERITY.HIGH,
    pattern: /\b[Bb]earer\s+([A-Za-z0-9\-._~+/]{20,}={0,2})/g, valueGroup: 1,
  },
  {
    id: 'authorization-basic-credentials', severity: SEVERITY.HIGH,
    pattern: /authorization["'\s]*[:=]\s*["']?\s*basic\s+([A-Za-z0-9+/]{16,}={0,2})/gi,
    valueGroup: 1, structural: true,
  },

  // ---- credential ASSIGNMENT, entropy-independent ----------------------
  {
    // The gap this closes: a real password is usually LOW entropy, so every
    // entropy-based detector is structurally blind to the most common
    // credential in any estate. "DB_PASSWORD=summer2024" scores like prose.
    //
    // The discriminator is therefore the ASSIGNMENT, not the value: a name that
    // means password, an equals or colon, and a concrete literal with no
    // whitespace. Prose discussing password formats fails on the value, and
    // template or reference shapes are rejected as descriptions.
    id: 'password-assignment', severity: SEVERITY.CRITICAL,
    pattern: /(?:^|[^A-Za-z0-9_])([A-Za-z0-9_.-]*(?:password|passwd|passphrase|pwd)[A-Za-z0-9_]*)\s*[:=]\s*(?!\s)["']?([^\s"'`,;)\]}]{6,256})["']?/gi,
    valueGroup: 2, structural: true, reject: looksLikeFormatDescription,
  },
  {
    // The same fact in JSON/YAML shape, where the name is quoted.
    id: 'password-field', severity: SEVERITY.CRITICAL,
    pattern: /["']([A-Za-z0-9_.-]*(?:password|passwd|passphrase|pwd)[A-Za-z0-9_]*)["']\s*:\s*["']([^"']{6,256})["']/gi,
    valueGroup: 2, structural: true, reject: looksLikeFormatDescription,
  },
  {
    // Database and broker URLs often carry the password as a query parameter
    // rather than in the userinfo section.
    id: 'password-query-parameter', severity: SEVERITY.CRITICAL,
    pattern: /[?&](?:password|passwd|pwd)=([^&\s"'`;)\]}]{6,256})/gi,
    valueGroup: 1, structural: true, reject: looksLikeFormatDescription,
  },

  // ---- contextual + entropy: the unknown-vendor catch -------------------
  {
    // SCREAMING_SNAKE env assignment whose NAME asserts it is a credential.
    // The name is the signal; entropy decides whether the value is real.
    id: 'env-credential-assignment', severity: SEVERITY.HIGH,
    pattern: /(?:^|[^A-Za-z0-9_])([A-Z][A-Z0-9_]{0,63}(?:KEY|TOKEN|SECRET|PASSWORD|PASSWD|CREDENTIAL|CREDENTIALS)(?:_[A-Z0-9]+)*)\s*[:=]\s*["']?([^\s"',;)\]}]{12,512})["']?/g,
    valueGroup: 2,
  },
  {
    // JSON/YAML credential-bearing field names, camelCase or snake_case.
    id: 'structured-credential-field', severity: SEVERITY.HIGH,
    pattern: /["']?((?:api[_-]?key|access[_-]?key|secret[_-]?key|private[_-]?key|client[_-]?secret|service[_-]?role[_-]?key|access[_-]?token|refresh[_-]?token|auth[_-]?token|session[_-]?token|api[_-]?secret|app[_-]?secret|password|passwd|secret)["']?\s*[:=]\s*["']([^"'\s]{12,512})["'])/gi,
    valueGroup: 2,
  },
];

/**
 * Values that are DESCRIBING a credential rather than being one.
 *
 * The distinction that matters for the password family: real passwords are
 * LOW entropy, so entropy cannot separate them from prose and the separator has
 * to be structural instead. Documentation names variables, shows regexes and
 * points at other variables; it does not usually put a concrete literal after
 * the equals sign.
 *
 * Note what this does NOT do: it never looks at surrounding text. Only the
 * VALUE is judged, so "the PASSWORD= format" is rejected because the value is
 * the word "format", not because the sentence mentions formats. That keeps the
 * existing mention-only precision intact -- every ghp_ and AKIA occurrence in
 * the vault is prose, and none of them is in valid token format.
 */
const FORMAT_DESCRIPTION_WORDS = /(?:format|pattern|prefix|suffix|assignment|regex|placeholder|example|redacted|variable|envvar|env_var|secretref|managed|omitted|elided)/i;

export function looksLikeFormatDescription(value) {
  const v = String(value === undefined || value === null ? '' : value);
  // Regex, glob or template metacharacters mean this is a SHAPE, not a value.
  if (/[\[\]{}()|^$*+?\\<>]/.test(v)) return true;
  if (FORMAT_DESCRIPTION_WORDS.test(v)) return true;
  // A bare SCREAMING_SNAKE token is the NAME of something else.
  if (/^[A-Z][A-Z0-9_]{3,}$/.test(v)) return true;
  // Dotted references: doppler.secret, vault.path, process.env.X
  if (/^[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z0-9_]+){1,}$/.test(v) && !/\d{2,}/.test(v)) return true;
  return false;
}

/**
 * Structural detectors bypass the entropy gate: an issuer prefix plus the
 * issuer's own length is stronger evidence than any statistical test. They are
 * still placeholder-suppressed so that documentation showing the SHAPE of a
 * token does not quarantine every runbook.
 */
function accept(det, value) {
  if (value === null || value === undefined) return true;    // header-only matches (PEM)
  if (isLikelyPlaceholder(value)) return false;
  // Per-detector rejection, for families where entropy is the wrong test.
  if (typeof det.reject === 'function' && det.reject(value)) return false;
  if (det.structural) return true;
  return looksHighEntropy(value);
}

/**
 * Scan a string. Returns findings only -- never the text, never a slice of it.
 * `baseOffset` lets a chunked reader report absolute file offsets.
 */
export function scanText(text, { baseOffset = 0, detectors = DETECTORS } = {}) {
  const findings = [];
  for (const det of detectors) {
    const re = new RegExp(det.pattern.source, det.pattern.flags.includes('g') ? det.pattern.flags : `${det.pattern.flags}g`);
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m[0].length === 0) { re.lastIndex += 1; continue; }
      const gi = det.valueGroup ?? 0;
      const value = gi === 0 ? m[0] : m[gi];
      if (!accept(det, value)) continue;
      // Offset/length describe WHERE, never WHAT.
      let offset = m.index;
      let length = m[0].length;
      if (gi !== 0 && typeof value === 'string') {
        const rel = m[0].indexOf(value);
        if (rel >= 0) { offset = m.index + rel; length = value.length; }
      }
      findings.push({
        detectorId: det.id,
        severity: det.severity,
        offset: baseOffset + offset,
        length,
        redacted: REDACTED,
      });
    }
  }
  findings.sort((a, b) => a.offset - b.offset || a.detectorId.localeCompare(b.detectorId));
  return findings;
}

export function summarise(findings) {
  const byDetector = {};
  for (const f of findings) byDetector[f.detectorId] = (byDetector[f.detectorId] ?? 0) + 1;
  const severities = new Set(findings.map((f) => f.severity));
  return {
    verdict: findings.length > 0 ? VERDICT.SECRET_DETECTED : VERDICT.CLEAN,
    findingCount: findings.length,
    detectorIds: Object.keys(byDetector).sort(),
    countsByDetector: byDetector,
    highestSeverity: severities.has(SEVERITY.CRITICAL) ? SEVERITY.CRITICAL
      : severities.has(SEVERITY.HIGH) ? SEVERITY.HIGH
        : severities.has(SEVERITY.MEDIUM) ? SEVERITY.MEDIUM : null,
  };
}

export function scanBuffer(buf, opts = {}) {
  const text = Buffer.isBuffer(buf) ? buf.toString('utf8') : String(buf);
  const findings = scanText(text, opts);
  return { ...summarise(findings), findings, scannedBytes: Buffer.isBuffer(buf) ? buf.length : Buffer.byteLength(text) };
}

const CHUNK_BYTES = 4 * 1024 * 1024;
const OVERLAP_BYTES = 8 * 1024;

/**
 * Streamed scan for files too large to hold twice in memory.
 *
 * Chunks OVERLAP, because a token split across a chunk boundary would be
 * invisible to both halves -- a silent false negative that scales with file
 * size, i.e. exactly on the biggest transcripts. Findings inside the overlap
 * region are deduplicated by (detectorId, absolute offset).
 *
 * Offsets are byte offsets into the decoded UTF-8 text. Chunk boundaries are
 * aligned to whole characters so a multi-byte sequence is never split.
 */
export async function scanFile(absPath, { detectors = DETECTORS } = {}) {
  const byteSize = statSync(absPath).size;
  const seen = new Set();
  const findings = [];
  let carry = '';
  let carryBase = 0;

  await new Promise((resolve, reject) => {
    const stream = createReadStream(absPath, { highWaterMark: CHUNK_BYTES, encoding: 'utf8' });
    stream.on('error', reject);
    stream.on('data', (chunk) => {
      const text = carry + chunk;
      for (const f of scanText(text, { baseOffset: carryBase, detectors })) {
        const k = `${f.detectorId}|${f.offset}|${f.length}`;
        if (seen.has(k)) continue;
        seen.add(k);
        findings.push(f);
      }
      const keep = Math.min(OVERLAP_BYTES, text.length);
      carryBase += text.length - keep;
      carry = text.slice(text.length - keep);
    });
    stream.on('end', resolve);
  });

  findings.sort((a, b) => a.offset - b.offset || a.detectorId.localeCompare(b.detectorId));
  return { ...summarise(findings), findings, scannedBytes: byteSize, byteSize };
}

/**
 * Emission guard.
 *
 * Every receipt, manifest, accounting table and register this pipeline writes
 * is scanned before it is written. The detector is useless if the artifacts
 * DESCRIBING quarantined material are themselves the leak -- which is the
 * classic way redaction systems fail.
 */
export function assertEmissionClean(value, label = 'emission') {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  const r = scanBuffer(Buffer.from(text, 'utf8'));
  if (r.verdict !== VERDICT.CLEAN) {
    const e = new Error('EMISSION_WOULD_LEAK_SECRET');
    e.label = label;
    e.detectorIds = r.detectorIds;      // ids only -- never the value
    e.findingCount = r.findingCount;
    throw e;
  }
  return { clean: true, label };
}
