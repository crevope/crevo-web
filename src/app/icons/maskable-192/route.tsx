import { ImageResponse } from 'next/og'
import { BRAND_COLORS } from '@/shared/config/seo'

/**
 * Maskable PWA icon — 192×192.
 *
 * "Maskable" means the icon is designed to survive being CROPPED into any
 * shape (circle, squircle, rounded square, etc.) by the operating system.
 * Android Pixel + Samsung One UI etc. all apply different mask shapes to
 * adaptive icons on the home screen.
 *
 * The W3C spec defines a SAFE ZONE: a circle with radius 0.4 × icon size,
 * centered in the canvas. Anything outside this circle MAY be cropped, so
 * the brand mark must fit comfortably inside it.
 *
 * Composition:
 *   - 192×192 navy canvas (filled edge-to-edge so any mask shape blends).
 *   - Mark at ~96×96 (50% of canvas) → comfortably inside the 153.6 px
 *     safe-zone circle, with margin for shape variation.
 *
 * Lives at /icons/maskable-192 (route handler — manifest references this
 * URL). NOT exposed via <link rel="icon"> in the head; the browser only
 * needs the standard icon, the manifest covers the home-screen install.
 *
 * See: https://web.dev/articles/maskable-icon
 */
export const runtime = 'nodejs'

const SIZE = 192
const MARK_SIZE = 96 // 50% of canvas — guaranteed inside the safe zone

export async function GET() {
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
    {
      width: SIZE,
      height: SIZE,
      // The manifest references this URL with `purpose: 'maskable'` — the
      // ImageResponse Content-Type is image/png by default which is what
      // Android expects.
      headers: {
        // Cache aggressively at the edge — the icon never changes within a
        // deploy. Vercel auto-busts on every deploy.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  )
}
