import type { CSSProperties } from 'react'
import { BRAND_COLORS } from '@/shared/config/seo'

interface LogoProps {
  /** `mark` = standalone monogram (square). `wordmark` = monogram + "Crevo" text. */
  variant?: 'mark' | 'wordmark'
  /** Pixel size of the mark (height for wordmark). Default 40. */
  size?: number
  /** Override the mark's fill. Defaults to brand navy. Use 'currentColor'
   *  if you want it to inherit from a parent for theme switching. */
  color?: string
  /** Color of the "Crevo" text in wordmark variant. Use `currentColor` to
   *  inherit from parent. */
  textColor?: string
  className?: string
  /** Hide from screen readers when used decoratively next to brand text. */
  decorative?: boolean
}

/**
 * The Crevo brand mark — "Forward-Arrow C".
 *
 * Concept: a single geometric path that fuses the two brand pillars into one
 * shape — the C represents *crédito* (containment, trust, value), and the
 * sharp tip extending forward is *veloz* (direction, motion, immediacy).
 *
 * Construction:
 *   - Implicit circle centered at (24, 32) with outer radius 20 / inner 10
 *     (radial stroke = 10, bold but not heavy).
 *   - Opening at angle ±53.13° (chosen so cos=3/5, sin=4/5 yield integer
 *     coordinates — keeps the path crisp at any rasterization).
 *   - Arrow tip at (60, 32): centered vertically, fully forward-pointing.
 *     The bottom terminal of the C "uncurls" into the blade rather than
 *     having an arrow glued on top.
 *   - Top terminal is a clean radial cut (slanted line) that mirrors the
 *     inner-bottom edge of the blade, balancing the silhouette.
 *
 * Renders as inline SVG so it stays crisp at every size (favicon → OG
 * image) and picks up CSS transitions naturally. For static contexts
 * (email templates, partner sites) use /public/logo-mark.svg or
 * /public/logo.svg.
 */
export function Logo({
  variant = 'mark',
  size = 40,
  color = BRAND_COLORS.primary,
  textColor = 'currentColor',
  className,
  decorative = false,
}: Readonly<LogoProps>) {
  const a11yProps = decorative
    ? { 'aria-hidden': true as const }
    : { role: 'img' as const, 'aria-label': 'Crevo' }

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
        <Mark color={color} />
      </svg>
    )
  }

  // Wordmark: mark + "Crevo" text. Width is computed so the SVG scales
  // proportionally; text is rendered with `currentColor` so it picks up
  // theme switches automatically.
  const markSize = size
  const gap = size * 0.32
  const textHeight = size * 0.7
  const textWidth = textHeight * 2.55 // approximate width for "Crevo" Bold
  const totalWidth = markSize + gap + textWidth
  const textStyle: CSSProperties = {
    fontFamily: 'var(--font-sans), "Plus Jakarta Sans", system-ui, sans-serif',
    fontSize: textHeight,
    fontWeight: 700,
    letterSpacing: '-0.025em',
    fill: textColor,
  }

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${markSize}`}
      width={totalWidth}
      height={markSize}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...a11yProps}
    >
      <g>
        <Mark color={color} />
      </g>
      <text
        x={markSize + gap}
        y={markSize * 0.72}
        style={textStyle}
      >
        Crevo
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
