/**
 * Single source of truth for SEO-relevant constants.
 *
 * Imported by:
 *   - src/app/layout.tsx          (default metadata, OG, Twitter)
 *   - src/app/sitemap.ts          (canonical URL base)
 *   - src/app/robots.ts           (sitemap reference)
 *   - src/app/manifest.ts         (PWA name, theme color)
 *   - src/app/opengraph-image.tsx (siteName, tagline)
 *   - src/app/icon.tsx            (brand colors)
 *
 * Update HERE when the company changes. Never hardcode the URL or social
 * handles in individual files.
 */

/** Canonical production URL. NO trailing slash. */
export const SITE_URL = 'https://crevo.pe' as const

/** Brand identity. Stays consistent across every <title>, OG, manifest. */
export const SITE = {
  name: 'Crevo',
  /** Title-safe descriptor. Goes after the page title in `<title>`. */
  shortDescription: 'Préstamos online en Perú',
  /** Long-form description for OG, meta description fallback. */
  description:
    'Mini préstamos online de S/. 200 a S/. 2,000 en Perú. 100% digital, ' +
    'aprobación en minutos, desembolso a tu cuenta bancaria. Regulado y seguro.',
  /** Tagline shown in OG cards. Punchy, < 60 chars. */
  tagline: 'Préstamos rápidos, seguros y 100% digitales',
  locale: 'es_PE',
  /** ISO 639-1 / IETF — used in <html lang="..."> and OG locale. */
  lang: 'es-PE',
  country: 'PE',
} as const

/** Default Open Graph image. Generated dynamically by
 *  `src/app/opengraph-image.tsx` and served at `/opengraph-image`.
 *
 *  We reference it as an ABSOLUTE URL because some social scrapers
 *  (LinkedIn especially) refuse to follow relative og:image paths or
 *  fall back to inferring images from page content when the meta tag
 *  is missing or malformed. The metadataBase auto-resolution Next.js
 *  performs only kicks in when the path looks like a file URL — for
 *  the dynamic-route convention we have to spell it out. */
export const OG_IMAGE_URL = `${SITE_URL}/opengraph-image` as const
export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630
export const OG_IMAGE_ALT = `${SITE.name} — ${SITE.tagline}`

/** Brand color tokens — kept in sync with globals.css. Used by Satori
 *  (ImageResponse) which can't read CSS variables, only literal values. */
export const BRAND_COLORS = {
  primary: '#0A192F',         // navy
  primaryHover: '#112240',
  secondary: '#D4AF37',       // gold
  secondaryHover: '#B8932D',
  accent: '#00E5FF',          // cyan
  surface: '#F8FAFC',
  text: '#0A192F',
  textMuted: '#64748B',
  white: '#FFFFFF',
} as const

/** Social handles for Schema.org `sameAs` and OG `article:author`.
 *  Add Instagram / LinkedIn / X here when accounts go live. */
export const SOCIAL = {
  facebook: 'https://www.facebook.com/crevoperu', // TODO: replace with vanity URL when set
  instagram: null as string | null,
  linkedin: null as string | null,
  x: null as string | null,
} as const

/** Keywords seed list. Used in default metadata.keywords + as content
 *  guidance. Don't go crazy — Google ignores meta keywords for ranking,
 *  but Bing still uses them lightly and they document intent for the team. */
export const SEO_KEYWORDS = [
  'préstamos online perú',
  'mini préstamos digitales',
  'crevo',
  'préstamos rápidos perú',
  'préstamos por internet',
  'crédito rápido lima',
  'fintech perú',
  'préstamos personales online',
  'préstamos sin papeleo',
  'préstamos inmediatos perú',
] as const

/** Pages exposed to search engines. KEEP IN SYNC WITH src/app/sitemap.ts.
 *  Anything not in this list is implicitly disallowed for crawlers. */
export const PUBLIC_ROUTES = [
  '/',
  '/tarifas',
  '/libro-de-reclamaciones',
  '/terminos-y-condiciones',
  '/politica-de-privacidad',
  '/politica-de-cookies',
  '/politica-de-cobranza',
  '/derechos-del-usuario',
] as const

/** Routes that must NEVER be indexed (auth flows, private app, internal
 *  tooling). robots.ts emits Disallow for these. */
export const PRIVATE_ROUTE_PREFIXES = [
  '/api/',
  '/dashboard',
  '/loans',
  '/profile',
  '/kyc',
  '/payments',
  '/notifications',
  '/request-loan',
  '/my-complaints',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
] as const

/** Search engine verification tokens. Set after registering the site in
 *  Google Search Console / Bing Webmaster Tools. */
export const VERIFICATION = {
  google: undefined as string | undefined, // TODO: set after Google Search Console verification
  bing: undefined as string | undefined,   // TODO: set after Bing Webmaster Tools verification
} as const
