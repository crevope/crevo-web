import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/shared/config/seo'

/**
 * sitemap.xml — canonical list of every URL we want indexed, with hints about
 * change frequency and relative priority.
 *
 * Priority guidance (Google ignores absolute values; uses them only for
 * RELATIVE comparison within OUR sitemap):
 *   1.0 = home (the entry point — most important)
 *   0.9 = tarifas (transactional intent — high SEO value for "tarifas crevo")
 *   0.8 = libro de reclamaciones (regulated, must surface on direct queries)
 *   0.5 = legal pages (compliance content, low conversion value)
 *
 * changeFrequency is also a hint, not a contract. We use:
 *   - "weekly" for content that may change with TEA/BCRP updates (tarifas)
 *   - "yearly" for legal docs that change rarely
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/tarifas`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/libro-de-reclamaciones`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/terminos-y-condiciones`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/politica-de-privacidad`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/politica-de-cookies`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/politica-de-cobranza`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/derechos-del-usuario`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]
}
