import { ImageResponse } from 'next/og'
import { BRAND_COLORS, SITE } from '@/shared/config/seo'

/**
 * Default Open Graph image (1200×630) — appears as the preview card on
 * Facebook, WhatsApp, LinkedIn, Discord, Slack, etc. when crevo.pe is shared.
 *
 * Per-page OG images can override this by exporting their own
 * `opengraph-image.tsx` in the page's route segment.
 *
 * NOTE on Satori (the renderer behind ImageResponse): every <div> with more
 * than one child MUST have explicit `display: 'flex'` (or 'none'). HTML
 * elements like <br> are not supported — use multiple flex rows instead.
 */
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = `${SITE.name} — ${SITE.tagline}`

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: `linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primaryHover} 60%, ${BRAND_COLORS.primary} 100%)`,
          padding: 80,
          position: 'relative',
        }}
      >
        {/* Decorative glow blob — gold (top-right) */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: 200,
            background: BRAND_COLORS.secondary,
            opacity: 0.12,
            filter: 'blur(80px)',
          }}
        />
        {/* Decorative glow blob — cyan (bottom-left) */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: -120,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: 200,
            background: BRAND_COLORS.accent,
            opacity: 0.10,
            filter: 'blur(80px)',
          }}
        />

        {/* Top: brand mark + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <svg viewBox="0 0 64 64" width={88} height={88}>
            <rect width="64" height="64" rx="14" fill={BRAND_COLORS.primary} />
            <path
              d="M 46 22 A 18 18 0 1 0 46 42"
              stroke={BRAND_COLORS.secondary}
              strokeWidth={7}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 50 18 L 38 32 L 46 32 L 30 46 L 50 30 L 42 30 Z"
              fill={BRAND_COLORS.accent}
            />
          </svg>
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: BRAND_COLORS.white,
            }}
          >
            {SITE.name}
          </span>
        </div>

        {/* Middle: hero copy. Built as flex columns so Satori can lay it out. */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 28,
          }}
        >
          {/* Title row 1 */}
          <div
            style={{
              display: 'flex',
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: BRAND_COLORS.white,
            }}
          >
            Préstamos online
          </div>

          {/* Title row 2 — gold + white */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 18,
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
            }}
          >
            <span style={{ color: BRAND_COLORS.secondary }}>rápidos y seguros</span>
            <span style={{ color: BRAND_COLORS.white, opacity: 0.9 }}>en Perú</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              color: BRAND_COLORS.white,
              opacity: 0.7,
              marginTop: 16,
            }}
          >
            S/. 200 — S/. 2,000 · 100% digital · Aprobación en minutos
          </div>
        </div>

        {/* Bottom: domain pill + locale */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 24px',
              borderRadius: 999,
              background: 'rgba(0, 229, 255, 0.10)',
              border: `1px solid ${BRAND_COLORS.accent}33`,
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 8,
                height: 8,
                borderRadius: 4,
                background: BRAND_COLORS.accent,
              }}
            />
            <span
              style={{
                fontSize: 24,
                color: BRAND_COLORS.accent,
                fontWeight: 600,
              }}
            >
              crevo.pe
            </span>
          </div>

          <span
            style={{
              fontSize: 22,
              color: BRAND_COLORS.white,
              opacity: 0.5,
              fontWeight: 500,
            }}
          >
            Fintech regulada · Lima, Perú
          </span>
        </div>
      </div>
    ),
    { ...size },
  )
}
