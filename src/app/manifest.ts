import type { MetadataRoute } from 'next'
import { SITE, BRAND_COLORS } from '@/shared/config/seo'

/**
 * Web App Manifest — describes the site as installable on mobile.
 *
 * Even if we don't push the "install app" prompt aggressively, having a
 * valid manifest:
 *   - Lets users add Crevo to their phone's home screen with a proper icon.
 *   - Powers the Lighthouse PWA audit (signal Google uses for ranking).
 *   - Sets the correct theme color for Android browser chrome.
 *
 * Lives at /manifest.webmanifest.
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
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
