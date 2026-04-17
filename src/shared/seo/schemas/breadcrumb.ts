import { SITE_URL } from '@/shared/config/seo'

interface BreadcrumbCrumb {
  name: string
  /** Path relative to SITE_URL, with leading slash. */
  path: string
}

/**
 * Schema.org `BreadcrumbList` payload — drives the breadcrumb rich snippet
 * Google shows above the URL in search results.
 *
 * Pass crumbs in display order, top → leaf. The "Inicio" root is added
 * automatically (don't include it in `crumbs`). For example, on /tarifas:
 *
 *   breadcrumbSchema([{ name: 'Tarifas', path: '/tarifas' }])
 *
 * produces a 2-step breadcrumb: Inicio → Tarifas.
 *
 * See: https://schema.org/BreadcrumbList
 */
export function breadcrumbSchema(crumbs: readonly BreadcrumbCrumb[]) {
  const items = [
    {
      '@type': 'ListItem' as const,
      position: 1,
      name: 'Inicio',
      item: SITE_URL,
    },
    ...crumbs.map((crumb, index) => ({
      '@type': 'ListItem' as const,
      position: index + 2,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  } as const
}
