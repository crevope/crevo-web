import { SITE_URL, SITE } from '@/shared/config/seo'

/**
 * Schema.org `WebSite` payload — establishes crevo.pe as the canonical
 * website entity Google can attach knowledge graph data to.
 *
 * We deliberately omit `potentialAction.SearchAction` because we don't
 * have a site-wide search page; declaring one without a real endpoint
 * would tell Google to render a sitelinks search box that 404s when
 * users use it. Add it back if/when /search exists.
 *
 * The `publisher` is referenced by @id to the Organization schema so
 * Google understands these two entities are linked (one-graph view of
 * the brand).
 *
 * See: https://schema.org/WebSite
 */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    name: SITE.name,
    alternateName: `${SITE.name} Perú`,
    url: SITE_URL,
    inLanguage: SITE.lang,
    description: SITE.description,
    publisher: { '@id': `${SITE_URL}#organization` },
  } as const
}
