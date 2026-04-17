import { SITE_URL, SITE, SOCIAL } from '@/shared/config/seo'

/**
 * Schema.org `FinancialService` payload for Crevo as an entity.
 *
 * Why FinancialService instead of Organization or LocalBusiness:
 *   - It's a strict subtype of Organization, so we get all those benefits
 *     (sitelinks, knowledge panel, "About this provider" cards) PLUS the
 *     finance-specific knobs Google understands.
 *   - Lets Google know we're a financial service provider, which helps
 *     intent matching for "préstamos online perú" type queries.
 *   - Allows `currenciesAccepted`, `paymentAccepted`, and `makesOffer`
 *     fields that surface useful info in rich results.
 *
 * Address / phone are placeholders until LegalConstants gets the real
 * razón social + RUC + domicilio fiscal — same TODO already tracked in
 * the legal backlog. We still emit the schema with what we have because
 * a partial Organization is better for SEO than no Organization.
 *
 * See: https://schema.org/FinancialService
 */
export function organizationSchema() {
  const sameAs = [SOCIAL.facebook, SOCIAL.instagram, SOCIAL.linkedin, SOCIAL.x].filter(
    (u): u is string => typeof u === 'string' && u.length > 0,
  )

  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    '@id': `${SITE_URL}#organization`,
    name: SITE.name,
    legalName: SITE.name, // TODO: replace with razón social once available
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.svg`,
      width: 220,
      height: 64,
    },
    image: `${SITE_URL}/opengraph-image`,
    description: SITE.description,
    slogan: SITE.tagline,
    foundingDate: '2026', // TODO: confirm exact date
    inLanguage: SITE.lang,
    address: {
      '@type': 'PostalAddress',
      addressCountry: SITE.country,
      addressLocality: 'Lima',
      addressRegion: 'Lima',
      // TODO: streetAddress + postalCode pending domicilio fiscal
    },
    areaServed: {
      '@type': 'Country',
      name: 'Peru',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'soporte@crevo.pe',
      availableLanguage: ['Spanish'],
      areaServed: 'PE',
    },
    sameAs,
    currenciesAccepted: 'PEN',
    paymentAccepted: ['Online banking', 'Bank transfer'],
    knowsAbout: [
      'Préstamos personales online',
      'Mini préstamos digitales',
      'Crédito de consumo',
      'Educación financiera',
    ],
    makesOffer: {
      '@type': 'Offer',
      name: 'Préstamos personales online',
      description:
        'Mini préstamos digitales de S/. 200 a S/. 2,000, aprobación en minutos, ' +
        'desembolso a cuenta bancaria.',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'PEN',
        minPrice: 200,
        maxPrice: 2000,
      },
      areaServed: { '@type': 'Country', name: 'Peru' },
      eligibleCustomerType: 'http://purl.org/goodrelations/v1#Enduser',
    },
  } as const
}
