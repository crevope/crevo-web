import type { CSSProperties } from 'react'
import { BRAND_COLORS } from '@/shared/config/seo'

interface LogoProps {
  /** `mark` = standalone monogram (square). `wordmark` = monogram + "Crevo" text. */
  variant?: 'mark' | 'wordmark'
  /** Pixel size of the mark (height for wordmark). Default 40. */
  size?: number
  /** Override mark colors. Defaults to brand palette. */
  className?: string
  /** Color of the "Crevo" text in wordmark variant. Use `currentColor` to
   *  inherit from parent (recommended for theme switching). */
  textColor?: string
  /** Hide from screen readers when used decoratively next to brand text. */
  decorative?: boolean
}

/**
 * The Crevo brand mark.
 *
 * Design: rounded-square navy container, bold gold "C" arc, cyan lightning
 * bolt emerging from the C's opening. Reinforces the three brand values:
 *   - navy = trust (regulated fintech)
 *   - gold = premium identity
 *   - cyan = speed / digital-native
 *
 * The mark is implemented as inline SVG so it stays crisp at every size and
 * picks up CSS transitions naturally. For static contexts (OG images, email
 * templates, partners) use /public/logo-mark.svg or /public/logo.svg.
 */
export function Logo({
  variant = 'mark',
  size = 40,
  className,
  textColor = 'currentColor',
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
        <Mark />
      </svg>
    )
  }

  // Wordmark: mark + "Crevo" text.
  // Width is computed so the SVG scales nicely; text is rendered with a real
  // font tag so it picks up the page's font-family when used inline.
  const markSize = size
  const gap = size * 0.32
  const textHeight = size * 0.7
  const textWidth = textHeight * 2.6 // approximate width for "Crevo" at the chosen weight
  const totalWidth = markSize + gap + textWidth
  const textStyle: CSSProperties = {
    fontFamily: 'var(--font-sans), "Plus Jakarta Sans", system-ui, sans-serif',
    fontSize: textHeight,
    fontWeight: 700,
    letterSpacing: '-0.02em',
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
        <Mark />
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
 * Just the inner SVG geometry of the mark. Reusable in <symbol> embeds,
 * the wordmark variant, and OG image rendering.
 */
function Mark() {
  return (
    <>
      {/* Navy rounded-square background */}
      <rect width="64" height="64" rx="14" fill={BRAND_COLORS.primary} />

      {/* Gold C — large arc (sweep=0, large=1) tracing the left ¾ of a
          circle centered at ~(31, 32) with radius 18. Opens on the right. */}
      <path
        d="M 46 22 A 18 18 0 1 0 46 42"
        stroke={BRAND_COLORS.secondary}
        strokeWidth={7}
        fill="none"
        strokeLinecap="round"
      />

      {/* Cyan lightning bolt at the C's opening — six-vertex zig-zag.
          The bolt sits where the C is "open", visually emerging from it. */}
      <path
        d="M 50 18 L 38 32 L 46 32 L 30 46 L 50 30 L 42 30 Z"
        fill={BRAND_COLORS.accent}
      />
    </>
  )
}
