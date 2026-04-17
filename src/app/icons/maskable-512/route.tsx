import { ImageResponse } from 'next/og'
import { BRAND_COLORS } from '@/shared/config/seo'

/**
 * Maskable PWA icon — 512×512. Same composition as maskable-192, scaled up
 * for hi-DPI displays and the Android splash screen.
 *
 * Mark at 256×256 (50% of canvas) — well within the safe zone (radius 0.4 ×
 * 512 = 204.8). See ../maskable-192/route.tsx for the full rationale.
 */
export const runtime = 'nodejs'

const SIZE = 512
const MARK_SIZE = 256

export async function GET() {
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
        }}
      >
        <svg viewBox="0 0 64 64" width={MARK_SIZE} height={MARK_SIZE}>
          <path
            d="M 36 16 A 20 20 0 1 0 36 48 L 60 32 L 30 40 A 10 10 0 1 1 30 24 Z"
            fill={BRAND_COLORS.white}
          />
        </svg>
      </div>
    ),
    {
      width: SIZE,
      height: SIZE,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  )
}
