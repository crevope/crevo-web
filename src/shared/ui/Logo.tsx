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
  // The mark's bounding box is 64×64, but the visible C body fills (4, 12)
  // to (60, 52) — visual height ≈ 40, with the arrow tip at (60, 32).
  //
  // We position "revo" so its cap-height (~40 units in viewBox) aligns with
  // the mark's visible top/bottom (y=12 to y=52). For Plus Jakarta Sans
  // Bold, cap-height ≈ 0.71 of font-size, so font-size = 40 / 0.71 ≈ 56.
  //
  // The "r" begins at x=68 — 8 units past the arrow tip at x=60 — so the
  // arrow visually leads INTO the rest of the word without colliding with
  // the "r"'s vertical stem.
  const aspectRatio = 184 / 64 // wordmark viewBox is 0 0 184 64
  const totalWidth = size * aspectRatio
  const textStyle: CSSProperties = {
    fontFamily: 'var(--font-sans), "Plus Jakarta Sans", system-ui, sans-serif',
    fontSize: 56,
    fontWeight: 700,
    letterSpacing: '-0.025em',
    fill: finalTextColor,
  }

  return (
    <svg
      viewBox="0 0 184 64"
      width={totalWidth}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...a11yProps}
    >
      <Mark color={markColor} />
      <text x={68} y={52} style={textStyle}>
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
