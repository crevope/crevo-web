import type { MetadataRoute } from 'next'
import { SITE_URL, PRIVATE_ROUTE_PREFIXES } from '@/shared/config/seo'

/**
 * Robots.txt — tells search engine crawlers what they can and can't index.
 *
 * Strategy:
 *   - Allow everything by default (the public landing + legal pages need
 *     maximum crawl coverage).
 *   - Explicitly disallow auth flows (no SEO value, low quality content
 *     that can dilute rankings) and the entire private/authenticated app.
 *   - Reference the sitemap so crawlers find all canonical URLs in one shot.
 *
 * Lives at /robots.txt thanks to Next.js App Router file-based routing.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...PRIVATE_ROUTE_PREFIXES],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
