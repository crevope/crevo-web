/**
 * Defense-in-depth text normalization for user-submitted free-form content.
 *
 * React already escapes any text we render back, so stored XSS isn't the
 * primary threat here — we apply this at submit time to:
 *
 *  1. **Normalize Unicode to NFC** so visually identical characters (é as
 *     U+00E9 vs. U+0065 + U+0301) compare equal in downstream search /
 *     dedup / uniqueness constraints. The browser usually normalizes on
 *     copy-paste, but not always when text comes from a custom keyboard or
 *     autocomplete.
 *
 *  2. **Strip bidirectional overrides** (U+202A–U+202E, U+2066–U+2069).
 *     These invisible characters flip text rendering and were the root of
 *     the Trojan Source attack class — pasting them into a complaint detail
 *     would make "Paid 500" render as "500 diaP" for the support agent.
 *
 *  3. **Strip C0/C1 control characters** except tab/newline/carriage return.
 *     Some mobile keyboards emit zero-width joiners and private-use area
 *     glyphs that corrupt logs and PDF generation.
 *
 *  4. **Collapse excessive whitespace** — trim + cap consecutive blank lines
 *     at 2 — so a user can't submit a claim with 500 blank lines that
 *     breaks our admin UI layout.
 *
 * The backend re-validates with zod against the same rules. This is
 * purely the first defensive layer — it exists so a naïve user can't
 * accidentally paste something that crashes downstream tooling, and so a
 * malicious user's attempt is visible (and expected to fail) on the server.
 */
export function sanitizeUserText(input: string): string {
  if (!input) return ''

  // NFC normalization — canonical composition.
  let out = input.normalize('NFC')

  // Strip BiDi control + format characters that don't appear in natural
  // Spanish / English text. Explicit ranges so we don't accidentally strip
  // emoji or non-Latin scripts.
  out = out.replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\u2028\u2029]/g, '')

  // Strip C0 controls (0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F) + DEL (0x7F) +
  // C1 controls (0x80-0x9F). Keep tab (0x09), LF (0x0A), CR (0x0D).
  out = out.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')

  // Collapse runs of 3+ newlines down to 2 (preserves paragraph breaks,
  // kills accidental spam).
  out = out.replace(/\n{3,}/g, '\n\n')

  // Trim leading/trailing whitespace.
  return out.trim()
}
