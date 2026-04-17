import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/shared/config/seo'
import { listPosts } from '@/features/blog/lib/loader'
import { CITIES } from '@/features/city-landing/lib/cities'

/**
 * sitemap.xml — canonical list of every URL we want indexed, with hints about
 * change frequency and relative priority.
 *
 * Priority guidance (Google ignores absolute values; uses them only for
 * RELATIVE comparison within OUR sitemap):
 *   1.0 = home (the entry point — most important)
 *   0.9 = tarifas, simulador (transactional intent — high SEO value)
 *   0.8 = libro-de-reclamaciones, preguntas-frecuentes, blog posts (top-tier
 *         informational)
 *   0.7 = sobre-nosotros, blog index (supporting content)
 *   0.5 = legal pages (compliance content, low conversion value)
 *
 * Blog posts are read from disk at build so every published article
 * automatically shows up in the sitemap without a code change.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/simulador`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/tarifas`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    {
      url: `${SITE_URL}/preguntas-frecuentes`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/libro-de-reclamaciones`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    {
      url: `${SITE_URL}/sobre-nosotros`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
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

  // Blog posts — each one surfaces as its own entry. `lastModified` uses
  // the frontmatter `publishedAt` so search engines know when the
  // content is fresh; when we add an `updatedAt` field later, swap here.
  const posts = await listPosts()
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  // City landing pages — one entry per supported city. These target
  // long-tail "préstamos {ciudad}" queries so each gets its own
  // higher-than-legal priority to nudge crawl frequency.
  const cityEntries: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url: `${SITE_URL}/prestamos-en-${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticEntries, ...postEntries, ...cityEntries]
}
