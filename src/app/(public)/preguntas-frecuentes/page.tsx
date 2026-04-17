import Link from 'next/link'
import { ArrowRight, MessagesSquare } from 'lucide-react'
import { AuthHeader } from '@/shared/ui/auth-header'
import { CURRENT_YEAR } from '@/shared/lib/constants'
import { buildMetadata } from '@/shared/seo/buildMetadata'
import { JsonLd } from '@/shared/seo/JsonLd'
import { breadcrumbSchema } from '@/shared/seo/schemas/breadcrumb'
import { FaqSection, faqJsonLd } from '@/features/faq'

/**
 * Dedicated FAQ page.
 *
 * The landing has the same FAQ block, but a standalone URL beats it for
 * SEO in two ways: (a) deep-linkable anchors let us share single-Q&A
 * snippets on WhatsApp / emails / ad copy, and (b) Google treats a page
 * whose main topic is the FAQ as more authoritative than one where it's
 * a subsection. Same `FaqSection` component + same `faqJsonLd` — the
 * single source of truth stays in `features/faq/data/faqs.ts`.
 */
// PPR opt-in deferred — see next.config.ts.

export const metadata = buildMetadata({
  title: 'Preguntas frecuentes',
  description:
    'Respuestas claras sobre los préstamos online de Crevo: montos, tiempos de aprobación, requisitos, TEA, desembolso, seguridad, pagos anticipados y reclamos.',
  path: '/preguntas-frecuentes',
  keywords: [
    'preguntas frecuentes crevo',
    'faq préstamos online perú',
    'requisitos préstamo crevo',
    'tea crevo',
    'tiempo aprobación préstamo',
  ],
})

export default function FaqPage() {
  const breadcrumb = breadcrumbSchema([
    { name: 'Preguntas frecuentes', path: '/preguntas-frecuentes' },
  ])

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] min-h-screen flex flex-col text-gray-800 dark:text-[#F1F5F9] antialiased">
      {/* Both JSON-LD blocks surface the same 10 Q&A: the FAQPage schema
          is what Google uses for rich results in search; the breadcrumb
          adds the "Crevo › Preguntas frecuentes" trail on the SERP. */}
      <JsonLd id="ld-breadcrumb" data={breadcrumb} />
      <JsonLd id="ld-faq" data={faqJsonLd()} />
      <AuthHeader />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-12">
        {/* Hero */}
        <header>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-xs font-semibold text-[#0A192F] dark:text-[#00E5FF] uppercase tracking-wider mb-5">
            <MessagesSquare className="h-3.5 w-3.5" aria-hidden="true" />
            Preguntas frecuentes
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#0A192F] dark:text-white tracking-tight mb-4">
            Resolvemos tus dudas sobre nuestros préstamos
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
            Lo que más nos preguntan sobre montos, aprobación, tasas, seguridad y cómo funciona el
            proceso de principio a fin. ¿No encuentras tu pregunta? Escríbenos a{' '}
            <a
              href="mailto:hola@crevo.pe"
              className="text-[#0A192F] dark:text-[#D4AF37] font-medium hover:underline"
            >
              hola@crevo.pe
            </a>
            .
          </p>
        </header>

        <FaqSection />

        {/* Post-FAQ CTA — people who read the FAQ and still want more
            should have a direct path to the simulator. */}
        <section className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-3 tracking-tight">
            ¿Listo para probar cuánto puedes recibir?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-xl mx-auto leading-relaxed">
            Usa nuestro simulador — sin registro, sin huella crediticia — para ver montos, cuotas,
            TEA y TCEA antes de decidir.
          </p>
          <Link
            href="/simulador"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#0A192F] hover:bg-[#112240] text-[#D4AF37] text-sm font-medium transition-colors"
          >
            Abrir simulador
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-gray-100 dark:border-white/5 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
        © {CURRENT_YEAR} Crevo
      </footer>
    </div>
  )
}
