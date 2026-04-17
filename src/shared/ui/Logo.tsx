interface LogoProps {
  /** `mark` = standalone monogram (the Forward-Arrow C alone, square).
   *  `wordmark` = mark integrated as the "C" of "Crevo", followed by "revo"
   *  rendered as outlined paths. Default 'wordmark'. */
  variant?: 'mark' | 'wordmark'
  /** Pixel height. The wordmark variant scales width proportionally. Default 40. */
  size?: number
  /** Mark color. Defaults to `currentColor` so the logo inherits from the
   *  parent's CSS color — wrap with Tailwind `text-brand-primary
   *  dark:text-white` (or similar) and the logo follows the theme
   *  automatically. Pass an explicit hex/keyword for fixed colors. */
  markColor?: string
  /** "revo" path color (wordmark only). Defaults to `markColor` (mono).
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
 * The wordmark variant uses the mark AS the "C" of "Crevo", followed by
 * "revo" rendered as **outlined SVG paths** (not live `<text>`). This is
 * intentional — see WORDMARK_TEXT_PATH_D for rationale.
 *
 * Color is theme-aware by default: both the mark and "revo" inherit from
 * the parent's CSS `color`, so `<div className="text-brand-primary
 * dark:text-white"><Logo /></div>` auto-switches navy ↔ white between
 * light and dark themes. Override with `markColor` / `textColor` props
 * when you need fixed values (sidebars, OG image rendering, etc.).
 *
 * Accessibility / SEO: the SVG carries `role="img"` + `aria-label="Crevo"`,
 * so screen readers announce the brand name correctly and Google sees
 * "Crevo" as the image's accessible name. NO live text leaks into the DOM.
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

  // ── Wordmark composition: mark + outlined "revo" ────────────────────────
  //
  // Two deliberate proportion choices for hierarchy:
  //
  //   1. SIZE: text path drawn at font-size 44 (cap-height ≈ 31), notably
  //      smaller than the mark's visible height (40). The mark "rises
  //      above" the text and reads as the primary brand element.
  //
  //   2. SPACING: text starts at x=60 (origin of the leftmost glyph), so
  //      the visible "r" stem at x≈63 sits right where the mark's arrow
  //      tip terminates. Reads as one word, not "icon + label".
  //
  // The path data was extracted from PlusJakartaSans-Bold.ttf at the exact
  // settings above by scripts/generate-logo-paths.mjs. To regenerate after
  // a font/size change, run that script and paste the new `d=""` value here.
  const aspectRatio = 160 / 64
  const totalWidth = size * aspectRatio

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
      <path d={WORDMARK_TEXT_PATH_D} fill={finalTextColor} />
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

/**
 * Outlined glyph paths for "revo" in Plus Jakarta Sans Bold (wght 700) at
 * font-size 44, starting at (60, 52) with letter-spacing -0.025em.
 *
 * Why outlined paths instead of an SVG `<text>` element:
 *
 *   1. CONSISTENCY: <text> depends on Plus Jakarta Sans being available
 *      wherever the SVG renders. Standalone .svg files opened on machines
 *      without the font fall back to system-ui, breaking visual identity.
 *      A path renders identically everywhere.
 *
 *   2. SEO: <text>"revo"</text> tells crawlers "revo" is meaningful text
 *      in the page. That's signal pollution — the brand is "Crevo", not
 *      "revo". With the path, the only semantic exposed is the SVG's
 *      aria-label="Crevo" — exactly what we want indexed.
 *
 *   3. NO FOUT: the wordmark looks correct on first paint, before any
 *      web font has loaded.
 *
 * Generated by scripts/generate-logo-paths.mjs.
 */
const WORDMARK_TEXT_PATH_D =
  'M68.45 52L62.68 52L62.68 28.06L68.10 28.06L68.10 33.39L67.66 32.60Q68.49 29.91 70.27 28.86Q72.06 27.80 74.56 27.80L74.56 27.80L75.97 27.80L75.97 32.90L73.90 32.90Q71.44 32.90 69.94 34.42Q68.45 35.94 68.45 38.67L68.45 38.67L68.45 52ZM89.39 52.53L89.39 52.53Q85.70 52.53 82.92 50.86Q80.15 49.18 78.61 46.32Q77.07 43.46 77.07 39.99L77.07 39.99Q77.07 36.38 78.63 33.59Q80.20 30.79 82.90 29.16Q85.61 27.54 88.95 27.54L88.95 27.54Q91.77 27.54 93.90 28.46Q96.04 29.38 97.53 31.01Q99.03 32.64 99.82 34.73Q100.61 36.82 100.61 39.24L100.61 39.24Q100.61 39.86 100.55 40.52Q100.48 41.18 100.30 41.66L100.30 41.66L81.82 41.66L81.82 37.26L97.05 37.26L94.32 39.33Q94.72 37.30 94.12 35.72Q93.53 34.14 92.19 33.21Q90.84 32.29 88.95 32.29L88.95 32.29Q87.15 32.29 85.74 33.19Q84.33 34.09 83.61 35.83Q82.88 37.57 83.06 40.03L83.06 40.03Q82.88 42.23 83.65 43.93Q84.42 45.62 85.94 46.54Q87.46 47.47 89.44 47.47L89.44 47.47Q91.42 47.47 92.80 46.63Q94.19 45.80 94.98 44.39L94.98 44.39L99.64 46.68Q98.94 48.39 97.44 49.71Q95.95 51.03 93.90 51.78Q91.86 52.53 89.39 52.53ZM115.75 52L110.64 52L101.23 28.06L107.52 28.06L114.34 46.90L112.01 46.90L118.87 28.06L125.16 28.06L115.75 52ZM138.50 52.53L138.50 52.53Q134.98 52.53 132.09 50.90Q129.21 49.27 127.52 46.46Q125.82 43.64 125.82 40.03L125.82 40.03Q125.82 36.42 127.52 33.61Q129.21 30.79 132.07 29.16Q134.93 27.54 138.50 27.54L138.50 27.54Q142.02 27.54 144.88 29.16Q147.74 30.79 149.43 33.59Q151.12 36.38 151.12 40.03L151.12 40.03Q151.12 43.64 149.41 46.46Q147.69 49.27 144.83 50.90Q141.97 52.53 138.50 52.53ZM138.50 47.25L138.50 47.25Q140.43 47.25 141.91 46.32Q143.38 45.40 144.24 43.75Q145.10 42.10 145.10 40.03L145.10 40.03Q145.10 37.92 144.24 36.31Q143.38 34.71 141.91 33.76Q140.43 32.82 138.50 32.82L138.50 32.82Q136.52 32.82 135.02 33.76Q133.52 34.71 132.67 36.31Q131.81 37.92 131.81 40.03L131.81 40.03Q131.81 42.10 132.67 43.75Q133.52 45.40 135.02 46.32Q136.52 47.25 138.50 47.25Z'
