import { ImageResponse } from 'next/og'
import { BRAND_COLORS } from '@/shared/config/seo'

/**
 * Apple touch icon (180×180). Apple devices use this when the user adds the
 * site to their home screen. Bigger than the favicon, room to breathe.
 *
 * Generated dynamically with Satori so it stays in sync with brand colors —
 * change BRAND_COLORS once and every icon variant follows.
 */
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: BRAND_COLORS.primary,
          borderRadius: 38,
        }}
      >
        <svg viewBox="0 0 64 64" width={150} height={150}>
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
      </div>
    ),
    { ...size },
  )
}
