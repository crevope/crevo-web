import type { MetadataRoute } from 'next'
import { SITE, BRAND_COLORS } from '@/shared/config/seo'

/**
 * Web App Manifest — describes the site as installable on mobile.
 *
 * Powers:
 *   - Add-to-home-screen on iOS / Android with the correct icon and name.
 *   - Standalone display mode (no browser chrome) when launched from home.
 *   - Splash screen on Android (uses the 512 icon + theme color).
 *   - Lighthouse PWA audit (a ranking signal for Google).
 *
 * Lives at /manifest.webmanifest.
 *
 * Icon strategy — covers every install path:
 *   - SVG (`/icon.svg`): scalable, picked by browsers that prefer vectors.
 *   - 192/512 PNG (`purpose: 'any'`): minimum required by Android. The 192
 *     is for the home screen; the 512 powers the splash screen and the
 *     OS icon picker.
 *   - 192/512 PNG (`purpose: 'maskable'`): adaptive-icon variants for
 *     Android Pixel / Samsung One UI etc. that crop into circle/squircle.
 *     Mark sits inside the W3C safe zone (radius 0.4 × size) so any mask
 *     shape preserves the brand.
 *   - 512 PNG (`purpose: 'monochrome'`): silhouette on transparent for
 *     Android 13+ Material You themed icons. The OS tints it to match the
 *     user's wallpaper colors so Crevo blends into a personalized theme
 *     instead of standing out with a fixed-color square.
 *   - 180×180 PNG (`/apple-icon`): iOS home-screen icon. Safari uses the
 *     `<link rel="apple-touch-icon">` head tag (auto-emitted by Next.js
 *     from app/apple-icon.tsx); this entry covers manifest-aware browsers
 *     that ignore the link.
 *
 * `app/favicon.ico` covers legacy `/favicon.ico` requests separately
 * (Next.js auto-serves it from the file convention) — it bundles 16/32/48
 * raster sizes for browsers that fetch the .ico before reading <link> tags.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.shortDescription}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: '/',
    display: 'standalone',
    background_color: BRAND_COLORS.surface,
    theme_color: BRAND_COLORS.primary,
    lang: SITE.lang,
    orientation: 'portrait',
    categories: ['finance', 'business'],
    icons: [
      // Scalable vector — preferred when the browser supports it.
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      // Standard rasters — Android home screen + browser favicons.
      {
        src: '/icon0',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon1',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      // Maskable — adaptive icons on Android. Mark within the safe zone
      // so circle/squircle masks never crop the brand.
      {
        src: '/icons/maskable-192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/maskable-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      // Monochrome — Android 13+ Material You themed icons. Transparent
      // background; the OS tints the silhouette with the user's theme color.
      {
        src: '/icons/monochrome-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'monochrome',
      },
      // iOS home-screen icon.
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
