import { ImageResponse } from 'next/og'

/**
 * Monochrome PWA icon — 512×512 with TRANSPARENT background.
 *
 * Why monochrome: Android 13+ (Material You) supports "themed icons" — when
 * the user enables it, the OS strips your icon's colors and applies a single
 * tint derived from their wallpaper. Your app's icon then matches the rest
 * of their visual theme instead of standing out as a fixed-color square.
 *
 * For this to work the manifest must declare an icon with `purpose:
 * "monochrome"`. The icon must:
 *   1. Have a transparent background (the OS supplies the background color).
 *   2. Be a single-color silhouette (the actual color value is irrelevant —
 *      the OS replaces it). We use white but it could be any solid fill.
 *   3. Stay inside the same safe zone as maskable icons (radius 0.4 × size)
 *      so the silhouette survives the OS's mask shape.
 *
 * Lives at /icons/monochrome-512.
 *
 * Without this entry, Android 13+ users with themed icons enabled see the
 * regular icon — Crevo would visually clash with the rest of their themed
 * apps. With it, Crevo blends into their personalized aesthetic.
 *
 * See:
 *   - https://developer.android.com/develop/ui/views/launch/icon_design_adaptive
 *   - https://web.dev/articles/maskable-icon (same safe-zone rules)
 */
export const runtime = 'nodejs'

const SIZE = 512
const MARK_SIZE = 256 // 50% of canvas — inside the safe zone

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Transparent background is critical — the OS draws its own backing
        // colored shape behind the silhouette. A solid fill here would
        // double-paint and look broken.
        background: 'transparent',
      }}
    >
      <svg viewBox="0 0 64 64" width={MARK_SIZE} height={MARK_SIZE}>
        <path
          d="M 36 16 A 20 20 0 1 0 36 48 L 60 32 L 30 40 A 10 10 0 1 1 30 24 Z"
          // Solid white — the OS will replace this color with the user's
          // theme tint when monochrome rendering is active.
          fill="#FFFFFF"
        />
      </svg>
    </div>,
    {
      width: SIZE,
      height: SIZE,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
  )
}
