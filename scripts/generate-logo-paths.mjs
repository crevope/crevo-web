#!/usr/bin/env node
/**
 * Generate the SVG path data for the wordmark text "revo" rendered in
 * Plus Jakarta Sans Bold (weight 700) at the exact size, position and
 * letter-spacing the brand system uses.
 *
 * Why we precompute paths instead of using <text> in SVG:
 *   - <text> in SVG depends on the font being available at render time.
 *     Standalone .svg files opened in a browser fall back to system-ui
 *     when Plus Jakarta Sans isn't installed, which means the wordmark
 *     looks different on every machine. Bad for brand consistency.
 *   - <text>"revo"</text> tells search engines "revo" is a meaningful
 *     word in our content — pollutes signals when the brand is "Crevo".
 *     Replacing with a <path> + aria-label="Crevo" gives the correct
 *     semantic without leaking text.
 *
 * How to regenerate (e.g. if the font changes or the wordmark needs a
 * different size / spacing):
 *
 *   1. Edit the constants below.
 *   2. node scripts/generate-logo-paths.mjs
 *   3. Copy the printed `d="..."` value into:
 *        - src/shared/ui/Logo.tsx (wordmark variant)
 *        - public/logo.svg
 *        - public/brand/wordmark-*.svg (6 variants)
 *
 * Requires: opentype.js (devDependency) + the static Bold TTF in
 * ../Plus_Jakarta_Sans/static/PlusJakartaSans-Bold.ttf (the source
 * folder where the OFL distribution lives, NOT the project's runtime
 * variable font — they produce identical glyphs at wght=700 but the
 * static file is simpler to consume from a script).
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import opentype from 'opentype.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Wordmark parameters (must match Logo.tsx + public/brand/*.svg) ─────────
const TEXT = 'revo'
const FONT_SIZE = 44
const X = 60
const Y = 52
const LETTER_SPACING = -0.025 // em (matches CSS letter-spacing semantics)
const DECIMALS = 2 // path coordinate precision

// ─── Resolve font path ──────────────────────────────────────────────────────
// Default looks for the source distribution one level above the project so
// the script works without copying the TTF into the repo. Override with the
// FONT env var if your layout differs.
const DEFAULT_FONT_PATH = resolve(
  __dirname,
  '..',
  '..',
  'Plus_Jakarta_Sans',
  'static',
  'PlusJakartaSans-Bold.ttf',
)
const FONT_PATH = process.env.FONT ?? DEFAULT_FONT_PATH

if (!existsSync(FONT_PATH)) {
  console.error(`[generate-logo-paths] Font file not found at: ${FONT_PATH}`)
  console.error('Set FONT=/path/to/PlusJakartaSans-Bold.ttf to override.')
  process.exit(1)
}

// ─── Generate ───────────────────────────────────────────────────────────────
const buf = readFileSync(FONT_PATH)
// opentype.parse needs an ArrayBuffer slice positioned at the file bytes
const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
const font = opentype.parse(arrayBuffer)

const path = font.getPath(TEXT, X, Y, FONT_SIZE, {
  letterSpacing: LETTER_SPACING,
})

const d = path.toPathData(DECIMALS)
const bbox = path.getBoundingBox()

console.log('─────────────────────────────────────────────────────────────')
console.log(`Text          : "${TEXT}"`)
console.log(`Font          : ${FONT_PATH.split(/[/\\]/).slice(-1)[0]}`)
console.log(`Font size     : ${FONT_SIZE}`)
console.log(`Position (x,y): (${X}, ${Y})`)
console.log(`Letter-spacing: ${LETTER_SPACING}em`)
console.log(
  `Bounding box  : x ${bbox.x1.toFixed(2)}–${bbox.x2.toFixed(2)}, y ${bbox.y1.toFixed(2)}–${bbox.y2.toFixed(2)}`,
)
console.log(`Path length   : ${d.length} characters`)
console.log('─────────────────────────────────────────────────────────────')
console.log()
console.log('d="' + d + '"')
console.log()
