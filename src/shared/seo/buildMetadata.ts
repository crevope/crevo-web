import type { Metadata } from 'next'
import {
  SITE_URL,
  SITE,
  OG_IMAGE_URL,
  OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_ALT,
} from '@/shared/config/seo'

interface BuildMetadataInput {
  /** Short page title — gets appended with " | Crevo" via the root template.
   *  Use `titleAbsolute: true` if you want full control (e.g. the home page). */
  title: string
  /** Long-form description (~150–160 chars optimal for SERP snippets). */
  description: string
  /** Path relative to the canonical origin, with leading slash. Used to set
   *  alternates.canonical AND openGraph.url. */
  path: string
  /** Whether the page should be exposed to search engines. Default true.
   *  Set false on auth flows, dynamic personal views, etc. */
  index?: boolean
  /** Skip the "%s | Crevo" template — render `title` exactly as given.
   *  Use for the home page where the brand name leads the title. */
  titleAbsolute?: boolean
  /** OG/Twitter title override (defaults to the SEO title with brand suffix). */
  socialTitle?: string
  /** OG/Twitter description override (defaults to the SEO description). */
  socialDescription?: string
  /** Per-page keywords stacked on top of the global seed list. */
  keywords?: readonly string[]
}

/**
 * Builds a consistent per-page metadata object that:
 *   - Sets a canonical URL so duplicate-content variants (utm tags, /amp,
 *     trailing slashes) all consolidate ranking signal on one URL.
 *   - Mirrors title + description into Open Graph and Twitter cards so the
 *     preview when shared matches what's in Google.
 *   - Toggles indexability cleanly via a single `index: false` for auth and
 *     personal-data pages.
 *
 * Page metadata MERGES with the root layout's defaults (icons, themeColor,
 * verification, etc.) — this helper only sets per-page fields.
 */
export function buildMetadata({
  title,
  description,
  path,
  index = true,
  titleAbsolute = false,
  socialTitle,
  socialDescription,
  keywords,
}: BuildMetadataInput): Metadata {
  const canonicalUrl = `${SITE_URL}${path}`
  const finalSocialTitle = socialTitle ?? (titleAbsolute ? title : `${title} | ${SITE.name}`)
  const finalSocialDescription = socialDescription ?? description

  return {
    title: titleAbsolute ? { absolute: title } : title,
    description,
    keywords: keywords ? [...keywords] : undefined,
    alternates: { canonical: path },
    robots: index
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        }
      : {
          index: false,
          follow: false,
          googleBot: { index: false, follow: false },
        },
    openGraph: {
      type: 'website',
      locale: SITE.locale,
      siteName: SITE.name,
      title: finalSocialTitle,
      description: finalSocialDescription,
      url: canonicalUrl,
      // Explicit images — see comment in src/app/layout.tsx for the
      // rationale (Facebook flags inferred og:image; LinkedIn scrapes
      // the page for <img> when the meta tag is absent).
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
    twitter: {
      card: 'summary_large_image',
      title: finalSocialTitle,
      description: finalSocialDescription,
      images: [
        {
          url: OG_IMAGE_URL,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: OG_IMAGE_ALT,
        },
      ],
    },
  }
}
