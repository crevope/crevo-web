import { ImageResponse } from 'next/og'
import { BRAND_COLORS } from '@/shared/config/seo'

/**
 * Apple touch icon (180×180). Apple devices use this when the user adds the
 * site to their home screen.
 *
 * iOS rounds the corners of touch icons automatically — we don't need to
 * apply borderRadius. The mark is centered in the available space with
 * generous padding so it reads cleanly even after iOS's corner masking.
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
        }}
      >
        <svg viewBox="0 0 64 64" width={120} height={120}>
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
