import type { CSSProperties } from 'react'

interface LogoProps {
  /** `mark` = standalone monogram (the Forward-Arrow C alone, square).
   *  `wordmark` = mark integrated as the "C" of "Crevo", followed by "revo"
   *  text — reads as one word, no redundancy. Default 'wordmark'. */
  variant?: 'mark' | 'wordmark'
  /** Pixel height. The wordmark variant scales width proportionally. Default 40. */
  size?: number
  /** Mark color. Defaults to `currentColor` so the logo inherits from the
   *  parent's CSS color — wrap with Tailwind `text-brand-primary
   *  dark:text-white` (or similar) and the logo follows the theme
   *  automatically. Pass an explicit hex/keyword for fixed colors. */
  markColor?: string
  /** "revo" text color (wordmark only). Defaults to `markColor` (mono).
   *  Set differently for two-tone variants — e.g. navy mark + gold revo. */
  textColor?: string
  className?: string
  /** Hide from screen readers when used decoratively next to brand text. */
  decorative?: boolean
}

/**
 * The Crevo brand mark — "Forward-Arrow C".
 *
 * The mark fuses the two brand pillars into a single geometric shape:
 *   - C body = *crédito* (containment, trust, value)
 *   - Forward-pointing tip = *veloz* (direction, motion, immediacy)
 *
 * The wordmark variant uses the mark AS the "C" of "Crevo", with "revo"
 * text immediately after. Reads as one word, no double-C redundancy.
 *
 * Color is theme-aware by default: both the mark and "revo" inherit from
 * the parent's CSS `color`, so `<div className="text-brand-primary
 * dark:text-white"><Logo /></div>` auto-switches navy ↔ white between
 * light and dark themes. Override with `markColor` / `textColor` props
 * when you need fixed values (OG image rendering, brand guidelines, etc.).
 */
export function Logo({
  variant = 'wordmark',
  size = 40,
  markColor = 'currentColor',
  textColor,
  className,
  decorative = false,
}: Readonly<LogoProps>) {
  const a11yProps = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'img' as const, 'aria-label': 'Crevo' }

  const finalTextColor = textColor ?? markColor

  if (variant === 'mark') {
    return (
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...a11yProps}
      >
        <Mark color={markColor} />
      </svg>
    )
  }

  // ── Wordmark composition: mark + "revo" ─────────────────────────────────
  //
  // The mark's bounding box is 64×64; visible body fills (4, 12)–(60, 52),
  // visual height ≈ 40, with the arrow tip at (60, 32).
  //
  // Two deliberate proportion choices for hierarchy:
  //
  //   1. SIZE: text font-size is 44 (cap-height ≈ 31), notably smaller than
  //      the mark's visible height (40). The mark "rises above" the text
  //      and reads as the primary brand element — the wordmark "revo" is
  //      the supporting context.
  //
  //   2. SPACING: text starts at x=60, exactly where the arrow tip lives.
  //      The 'r' glyph's natural left-side bearing (~3 units of internal
  //      padding) places its visible stem at x≈63, so the arrow tip just
  //      brushes the leading edge of the "r". Reads as a single word, no
  //      "icon + label" gap.
  //
  // Baseline at y=52 — same as the mark's visible bottom — so the entire
  // wordmark sits on a single optical baseline.
  const aspectRatio = 160 / 64 // wordmark viewBox is 0 0 160 64
  const totalWidth = size * aspectRatio
  const textStyle: CSSProperties = {
    fontFamily: 'var(--font-sans), "Plus Jakarta Sans", system-ui, sans-serif',
    fontSize: 44,
    fontWeight: 700,
    letterSpacing: '-0.025em',
    fill: finalTextColor,
  }

  return (
    <svg
      viewBox="0 0 160 64"
      width={totalWidth}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...a11yProps}
    >
      <Mark color={markColor} />
      <text x={60} y={52} style={textStyle}>
        revo
      </text>
    </svg>
  )
}

/**
 * Just the inner SVG geometry of the mark. Single filled path — no overlay,
 * no separate arrow shape. The C body and the arrow blade share a continuous
 * outline, which is what makes the mark feel integrated rather than apilado.
 */
function Mark({ color }: { color: string }) {
  return (
    <path
      d="M 36 16 A 20 20 0 1 0 36 48 L 60 32 L 30 40 A 10 10 0 1 1 30 24 Z"
      fill={color}
    />
  )
}
