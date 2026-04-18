import { ImageResponse } from 'next/og'
import { BRAND_COLORS } from '@/shared/config/seo'

/**
 * Standard PWA icon — 512×512. Required by Android, used as the splash
 * screen image when the user opens the installed PWA, and as the highest-
 * resolution favicon source for browsers and OS icon picker dialogs.
 *
 * Same composition as icon0 (192×192), scaled up. Mark at ~62.5% of the
 * canvas with comfortable navy padding.
 */
export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export default function Icon512() {
  const MARK_SIZE = 320 // 62.5% of 512
  return new ImageResponse(
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
    </div>,
    { ...size },
  )
}
