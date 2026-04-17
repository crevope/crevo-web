import { ImageResponse } from 'next/og'
import { BRAND_COLORS } from '@/shared/config/seo'

/**
 * Standard PWA icon — 192×192. Required by Android (Chrome installs this on
 * the home screen) and used as a generic favicon by browsers that prefer a
 * larger PNG over the SVG variant.
 *
 * Composition: navy background filling the canvas + white mark at ~60% of
 * the canvas (centered, with comfortable padding). The mark dominates but
 * leaves enough breathing room that it never feels cropped at small sizes.
 *
 * The Next.js `iconN.tsx` convention auto-discovers this file and emits a
 * `<link rel="icon" href="/icon0" sizes="192x192" type="image/png">` in the
 * head. The same URL is referenced from the PWA manifest.
 */
export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

export default function Icon192() {
  // Mark is 64×64 in its native viewBox. We render it at 120×120 within a
  // 192×192 canvas → 62.5% of width, leaving ~36px (18%) padding on each
  // side. Visually balanced, mark reads clearly even at favicon scale.
  const MARK_SIZE = 120
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
    { ...size },
  )
}
