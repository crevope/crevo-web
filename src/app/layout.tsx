import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import localFont from 'next/font/local'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/shared/ui/sonner'
import Script from 'next/script'
import './globals.css'
import { cn } from '@/shared/lib/utils'
import { CookieConsentProvider } from '@/features/cookie-consent/lib/CookieConsentContext'
import { CookieBanner } from '@/features/cookie-consent/ui/CookieBanner'
import { ServiceWorkerRegister } from '@/shared/ui/service-worker-register'
import { JsonLd } from '@/shared/seo/JsonLd'
import { organizationSchema } from '@/shared/seo/schemas/organization'
import { websiteSchema } from '@/shared/seo/schemas/website'
import {
  SITE_URL,
  SITE,
  BRAND_COLORS,
  SEO_KEYWORDS,
  SOCIAL,
  VERIFICATION,
  OG_IMAGE_URL,
  OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_ALT,
  FB_APP_ID,
} from '@/shared/config/seo'

// Plus Jakarta Sans — the brand typeface, served locally for performance
// (no Google Fonts request, no FOUT) and licensing clarity (OFL.txt shipped
// alongside the .ttf files in src/app/fonts/).
//
// We use the variable-font files (one per axis: regular + italic) so a
// single fetch covers every weight from 200 to 800. Variable fonts also
// give us free intermediate weights (e.g. 650) if we ever want to tune
// hierarchy more precisely than the standard 400/600/700.
//
// `display: 'swap'` shows fallback text immediately and swaps in Plus
// Jakarta Sans once it loads — best CLS / LCP behavior on slow networks.
const plusJakartaSans = localFont({
  src: [
    {
      path: './fonts/PlusJakartaSans-VariableFont_wght.ttf',
      style: 'normal',
    },
    {
      path: './fonts/PlusJakartaSans-Italic-VariableFont_wght.ttf',
      style: 'italic',
    },
  ],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
})

// ─── Default metadata ────────────────────────────────────────────────────────
// Inherited by every page that doesn't override its own. Per-page metadata in
// route segments (src/app/.../page.tsx) merges with — and wins over — these.

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  // Title template: page-level metadata can set just `title: 'Tarifas'`
  // and we'll render `Tarifas | Crevo`. The default is for the home page.
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [...SEO_KEYWORDS],
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  publisher: SITE.name,

  // Tells search engines this is the canonical URL even when arrived via
  // /amp, ?utm_source=…, or any other variant. Per-page metadata can set
  // its own `alternates.canonical` to override.
  alternates: {
    canonical: '/',
  },

  // Crawler hints. Per-page can override (e.g. /login sets noindex).
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  // Open Graph (Facebook, LinkedIn, WhatsApp, Discord, Slack). We declare
  // `images` EXPLICITLY (with absolute URL + dimensions) even though
  // src/app/opengraph-image.tsx already exists — Facebook's debugger flags
  // "inferred property" when the tag is implicit, and LinkedIn falls back
  // to scraping page content for an <img> when the og:image meta is
  // missing, which produces unrelated previews (e.g. a stock-photo person
  // from the hero section instead of our branded card).
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: SITE_URL,
    images: [
      {
        url: OG_IMAGE_URL,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: OG_IMAGE_ALT,
        type: 'image/png',
      },
    ],
  },

  // Twitter card. summary_large_image gives us the big preview.
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    creator: SOCIAL.x ?? undefined,
    site: SOCIAL.x ?? undefined,
    images: [
      {
        url: OG_IMAGE_URL,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: OG_IMAGE_ALT,
      },
    ],
  },

  // Phone-number autodetection on iOS hides links and breaks layout in
  // Spanish-language tariff tables. Disable globally; we link tel: where
  // we actually want phone interaction.
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // Search Console verification. Filled in once the site is verified.
  verification: {
    google: VERIFICATION.google,
    other: VERIFICATION.bing
      ? { 'msvalidate.01': VERIFICATION.bing }
      : undefined,
  },

  // Misc <meta> tags that don't have a typed slot in Next.js Metadata.
  //
  // - mobile-web-app-capable + apple-mobile-web-app-capable: BOTH are
  //   required for full PWA install support. Chrome/Lighthouse now prefer
  //   the un-prefixed name (the apple- variant logs a deprecation warning
  //   in Chrome DevTools), but iOS Safari STILL only honors the apple-
  //   prefixed version. Emit both so every OS plays nicely.
  // - apple-mobile-web-app-status-bar-style + apple-mobile-web-app-title:
  //   iOS-only — Safari uses these when the user adds the site to their
  //   home screen. No equivalent un-prefixed alternative exists.
  // - fb:app_id: optional Facebook App linkage. Only emitted when
  //   NEXT_PUBLIC_FB_APP_ID is set in the environment. Without it the
  //   FB Sharing Debugger flags a warning, but link previews still work.
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': SITE.name,
    ...(FB_APP_ID ? { 'fb:app_id': FB_APP_ID } : {}),
  },
}

// ─── Viewport (Next 15: separated from metadata) ─────────────────────────────

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: BRAND_COLORS.white },
    { media: '(prefers-color-scheme: dark)', color: BRAND_COLORS.primary },
  ],
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={SITE.lang}
      suppressHydrationWarning
      className={cn('font-sans', plusJakartaSans.variable)}
    >
      <body className={`${plusJakartaSans.variable} font-(family-name:--font-sans)`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <CookieConsentProvider>
            {children}
            <CookieBanner />
            <Toaster richColors position="top-right" />
            <ServiceWorkerRegister />
          </CookieConsentProvider>
        </ThemeProvider>
        {/* Structured data — site-wide identity. Per-page schemas (FAQPage,
            BreadcrumbList) live in their own segments and add to this graph. */}
        <JsonLd id="ld-organization" data={organizationSchema()} />
        <JsonLd id="ld-website" data={websiteSchema()} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
