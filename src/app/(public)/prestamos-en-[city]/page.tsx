import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Building2, Clock, MapPin, ShieldCheck, Zap } from 'lucide-react'
import { AuthHeader } from '@/shared/ui/auth-header'
import { CURRENT_YEAR } from '@/shared/lib/constants'
import { buildMetadata } from '@/shared/seo/buildMetadata'
import { JsonLd } from '@/shared/seo/JsonLd'
import { breadcrumbSchema } from '@/shared/seo/schemas/breadcrumb'
import { CITIES, findCity } from '@/features/city-landing/lib/cities'

interface Props {
  params: Promise<{ city: string }>
}

/**
 * City-specific landing pages at `/prestamos-en-{slug}`.
 *
 * Each page is a standalone SEO surface for long-tail queries like
 * "préstamos online arequipa" or "crédito rápido trujillo". Google
 * rewards topical specificity, so a dedicated page with local proof
 * points ranks materially better than a single national page that
 * mentions 15 cities in passing.
 *
 * Pre-rendered at build via `generateStaticParams` — there's no
 * runtime cost and we still get per-city `generateMetadata`.
 */

export async function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }))
}

export async function generateMetadata({ params }: Props) {
  const { city } = await params
  const data = findCity(city)
  if (!data) {
    return buildMetadata({
      title: 'Página no encontrada',
      description: 'La ciudad que buscas no existe o aún no está publicada.',
      path: `/prestamos-en-${city}`,
      index: false,
    })
  }
  return buildMetadata({
    title: `Préstamos online ${data.locativeName}`,
    description: `Solicita un préstamo online ${data.locativeName} con Crevo. De S/ 200 a S/ 2 000, aprobación en minutos y desembolso el mismo día a tu cuenta bancaria.`,
    path: `/prestamos-en-${data.slug}`,
    keywords: [
      `préstamos ${data.name.toLowerCase()}`,
      `préstamos online ${data.name.toLowerCase()}`,
      `crédito rápido ${data.name.toLowerCase()}`,
      `crevo ${data.name.toLowerCase()}`,
      `préstamos digitales ${data.name.toLowerCase()}`,
    ],
  })
}

export default async function CityLandingPage({ params }: Props) {
  const { city } = await params
  const data = findCity(city)
  if (!data) notFound()

  const breadcrumb = breadcrumbSchema([
    { name: `Préstamos ${data.locativeName}`, path: `/prestamos-en-${data.slug}` },
  ])

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] min-h-screen flex flex-col text-gray-800 dark:text-[#F1F5F9] antialiased">
      <JsonLd id="ld-breadcrumb" data={breadcrumb} />
      <AuthHeader />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-14">
        {/* Hero */}
        <section>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-xs font-semibold text-[#0A192F] dark:text-[#00E5FF] uppercase tracking-wider mb-5">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            Préstamos {data.locativeName}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#0A192F] dark:text-white tracking-tight mb-5">
            Préstamos online {data.locativeName}: de S/ 200 a S/ 2 000, el mismo día.
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
            {data.intro}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link
              href="/simulador"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#0A192F] hover:bg-[#112240] text-[#D4AF37] text-sm font-medium transition-colors"
            >
              Simular mi préstamo
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#0F172A] text-sm font-medium transition-colors"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-4">
          {data.stats.map((s) => (
            <div
              key={s.label}
              className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg p-5 text-center"
            >
              <p className="text-2xl sm:text-3xl font-semibold text-[#0A192F] dark:text-[#D4AF37] mb-1">
                {s.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          ))}
        </section>

        {/* Trust strip — copy mirrors the landing but framed locally */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Zap,
              title: 'Aprobación en minutos',
              body: 'Evaluación 100% automática. Sin visitas, sin colas, sin papeleo físico.',
            },
            {
              icon: Building2,
              title: 'Cualquier banco peruano',
              body: 'Depositamos a BCP, Interbank, BBVA, Scotiabank, BanBif y otros — tú eliges cuál al solicitar.',
            },
            {
              icon: ShieldCheck,
              title: 'TEA y TCEA transparentes',
              body: 'Ves el costo total en la Hoja Resumen antes de firmar. Sin sorpresas ni letra chica.',
            },
          ].map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg p-5"
              >
                <div className="w-9 h-9 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] flex items-center justify-center mb-3">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-[#0A192F] dark:text-white mb-1.5">
                  {f.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{f.body}</p>
              </div>
            )
          })}
        </section>

        {/* Local use cases */}
        <section>
          <h2 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-5 tracking-tight">
            Para qué usan Crevo las personas {data.locativeName}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
            No te pedimos justificar en qué vas a usar el préstamo, pero en {data.name} los usos más
            frecuentes son:
          </p>
          <ul className="space-y-2">
            {data.localUseCases.map((use) => (
              <li
                key={use}
                className="flex items-start gap-3 p-3.5 rounded-lg bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6"
              >
                <div className="w-6 h-6 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{use}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="text-center bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg p-10">
          <h2 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-3 tracking-tight">
            Listo para solicitar tu préstamo {data.locativeName}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xl mx-auto leading-relaxed">
            Crear tu cuenta toma menos de 2 minutos. Aprobación automática, firma digital y
            desembolso el mismo día a tu cuenta bancaria.
          </p>
          <Link
            href="/simulador"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#0A192F] hover:bg-[#112240] text-[#D4AF37] text-sm font-medium transition-colors"
          >
            Empezar ahora
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>

        {/* Related cities — internal linking boosts SEO */}
        <section>
          <h2 className="text-base font-semibold text-[#0A192F] dark:text-white mb-3">
            Préstamos en otras ciudades
          </h2>
          <ul className="flex flex-wrap gap-2">
            {CITIES.filter((c) => c.slug !== data.slug).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/prestamos-en-${c.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 text-sm text-gray-700 dark:text-gray-300 hover:border-[#00E5FF]/40 transition-colors"
                >
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-gray-100 dark:border-white/5 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
        © {CURRENT_YEAR} Crevo · {data.name}, Perú
      </footer>
    </div>
  )
}
