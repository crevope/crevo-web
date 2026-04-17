import { FAQS } from '../data/faqs'

/**
 * Builds the Schema.org `FAQPage` payload from the same FAQ data the visual
 * accordion renders. Single source of truth means the JSON-LD can never
 * drift from what the user sees — Google flags "deceptive markup" when the
 * structured data and the visible answer don't match.
 *
 * Drop the result into `<JsonLd data={faqJsonLd()} />` on any page where
 * the visible FAQ is rendered. Don't emit it on pages without the actual
 * accordion.
 *
 * See: https://developers.google.com/search/docs/appearance/structured-data/faqpage
 */
export function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } as const
}
