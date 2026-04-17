#!/usr/bin/env node
/**
 * Generate `app/favicon.ico` — a multi-size .ico file containing the Crevo
 * mark at 16, 32, and 48 pixels.
 *
 * Why we need a .ico in addition to icon.svg:
 *   - Browsers (and some bots) request `/favicon.ico` directly on first
 *     page load, BEFORE parsing the HTML to find <link rel="icon"> tags.
 *     Without the file we get a 404 on every cold visit — harmless but
 *     pollutes server logs and adds microseconds of latency.
 *   - The .ico bundles multiple raster sizes into one file. The browser
 *     picks the size that matches its display context (16 for tabs, 32
 *     for tab pinning, 48 for OS-level shortcuts).
 *
 * The composition matches the standard PWA icons (icon0/icon1): navy
 * background filling the canvas + white mark at ~62.5% of the canvas.
 *
 * To regenerate after a brand change:
 *   1. Edit MARK_PATH or BG/MARK_FILL below if needed.
 *   2. node scripts/generate-favicon.mjs
 *   3. Commit the new app/favicon.ico.
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Mark geometry — must stay in sync with src/shared/ui/Logo.tsx ──────────
const MARK_PATH = 'M 36 16 A 20 20 0 1 0 36 48 L 60 32 L 30 40 A 10 10 0 1 1 30 24 Z'
const BG = '#0A192F'
const MARK_FILL = '#FFFFFF'

// ─── Sizes that go inside the .ico (browser picks the closest match) ───────
const SIZES = [16, 32, 48]

// At 16px the mark looks crisper if it takes more of the canvas; at larger
// sizes we have room for padding. Returns the mark size (in canvas pixels)
// for a given canvas size.
function markSizeFor(canvas) {
  if (canvas <= 16) return Math.round(canvas * 0.78) // 12.5 → 13
  if (canvas <= 32) return Math.round(canvas * 0.72) // 23
  return Math.round(canvas * 0.66) // 32
}

function svgFor(canvasSize) {
  const markSize = markSizeFor(canvasSize)
  const offset = (canvasSize - markSize) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasSize} ${canvasSize}">
    <rect width="${canvasSize}" height="${canvasSize}" fill="${BG}"/>
    <g transform="translate(${offset} ${offset}) scale(${markSize / 64})">
      <path d="${MARK_PATH}" fill="${MARK_FILL}"/>
    </g>
  </svg>`
}

// ─── Generate ───────────────────────────────────────────────────────────────
const pngBuffers = []
for (const size of SIZES) {
  const svg = Buffer.from(svgFor(size))
  const png = await sharp(svg).png().toBuffer()
  pngBuffers.push(png)
  console.log(`✓ Rendered ${size}×${size} (${png.length} bytes)`)
}

const ico = await pngToIco(pngBuffers)
const outPath = resolve(__dirname, '..', 'src', 'app', 'favicon.ico')
writeFileSync(outPath, ico)

console.log()
console.log(`✓ Wrote ${outPath} (${ico.length} bytes, ${SIZES.length} sizes)`)
console.log()
