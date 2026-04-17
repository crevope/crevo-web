import Link from 'next/link'
import { Zap, ShieldCheck, HandCoins, Landmark, Scale, Rocket } from 'lucide-react'
import { AuthHeader } from '@/shared/ui/auth-header'
import { CURRENT_YEAR } from '@/shared/lib/constants'
import { buildMetadata } from '@/shared/seo/buildMetadata'
import { JsonLd } from '@/shared/seo/JsonLd'
import { breadcrumbSchema } from '@/shared/seo/schemas/breadcrumb'

/**
 * About page — boost for E-E-A-T signals in Google's YMYL (Your Money
 * Your Life) classification. For any fintech that wants to rank for
 * branded and generic queries, a clear "who we are / what we do / why
 * you should trust us" page materially moves the needle. Also serves as
 * the canonical place we link from footer / emails when users ask who
 * is actually behind the site.
 *
 * Content is deliberately narrative — no hype, no stock-photo founders.
 * Each section answers a question a cautious consumer asks silently
 * before handing over their DNI: who regulates you, where's your money
 * coming from, what's your track record, can I reach a human.
 */
export const metadata = buildMetadata({
  title: 'Sobre Crevo',
  description:
    'Crevo es una fintech peruana de mini préstamos digitales. Conoce nuestra misión, regulación, compromisos con el cliente y cómo contactar a nuestro equipo.',
  path: '/sobre-nosotros',
  keywords: [
    'sobre crevo',
    'crevo fintech peru',
    'quien está detrás de crevo',
    'empresa crevo',
    'misión crevo',
  ],
})

const VALUES = [
  {
    icon: Zap,
    title: 'Rapidez sin atajos',
    body: 'La evaluación automatizada devuelve una respuesta en minutos, pero detrás hay un modelo de scoring auditado y un proceso KYC serio. La velocidad no es un atajo — es el resultado de operar 100% digital.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparencia total',
    body: 'Antes de firmar ves TEA, TCEA, todas las comisiones y el IGV desglosado en la Hoja Resumen. No cobramos nada que no esté en el contrato. Publicamos nuestras tarifas vigentes en /tarifas todo el día.',
  },
  {
    icon: Scale,
    title: 'Juego limpio en cobranzas',
    body: 'Cumplimos la Ley 27598 al pie de la letra: horarios, límites de contacto y trato digno están auditados. Si te endeudas con nosotros puedes confiar en que nunca seremos el acreedor que te acosa.',
  },
  {
    icon: HandCoins,
    title: 'Educación financiera como default',
    body: 'Cada préstamo incluye un recordatorio claro del costo total y acceso a /learn con contenido práctico sobre historial crediticio, presupuesto y prepago. El mejor cliente es el que puede decidir con información.',
  },
]

const COMMITMENTS = [
  'Aprobación en minutos con respuesta clara (no "pendiente" indefinido).',
  'Hoja Resumen descargable antes de firmar — SBS Res. 3274-2017.',
  'Sin penalidad por prepago, parcial o total, en ningún producto.',
  'Libro de Reclamaciones virtual con respuesta en máximo 15 días hábiles.',
  'Datos personales cifrados y protegidos según Ley 29733.',
]

export default function AboutPage() {
  const breadcrumb = breadcrumbSchema([{ name: 'Sobre nosotros', path: '/sobre-nosotros' }])

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] min-h-screen flex flex-col text-gray-800 dark:text-[#F1F5F9] antialiased">
      <JsonLd id="ld-breadcrumb" data={breadcrumb} />
      <AuthHeader />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-16">
        {/* Hero */}
        <section>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-xs font-semibold text-[#0A192F] dark:text-[#00E5FF] uppercase tracking-wider mb-5">
            <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
            Nuestra historia
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#0A192F] dark:text-white tracking-tight mb-6">
            Crédito justo para el Perú que no entra al banco.
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            Crevo nace de una convicción sencilla: 7 de cada 10 peruanos no califican para un
            préstamo bancario, y sin embargo tienen la misma urgencia — una emergencia médica, un
            proveedor por pagar, un ciclo universitario que empieza. Construimos la fintech que
            habríamos querido usar nosotros mismos: digital de punta a punta, con precios claros y
            cobranza civilizada.
          </p>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-8 tracking-tight">
            Cómo operamos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {VALUES.map((v) => {
              const Icon = v.icon
              return (
                <article
                  key={v.title}
                  className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg p-6"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF] mb-4">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0A192F] dark:text-white mb-2">
                    {v.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {v.body}
                  </p>
                </article>
              )
            })}
          </div>
        </section>

        {/* Regulatory posture */}
        <section
          className="rounded-lg overflow-hidden border border-white/10"
          style={{ background: 'linear-gradient(135deg, #0A192F 0%, #1A365D 100%)' }}
        >
          <div className="p-8 sm:p-10">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                <Landmark className="h-6 w-6 text-[#D4AF37]" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3 tracking-tight">
                  Regulación y compliance
                </h2>
                <p className="text-white/75 text-sm sm:text-base leading-relaxed mb-5">
                  Crevo opera como empresa peruana sujeto obligado ante la Unidad de Inteligencia
                  Financiera (UIF-Perú) del SBS en materia de prevención del lavado de activos y
                  financiamiento del terrorismo, conforme a la Ley N° 27693 y el D. Leg. 1531.
                  Aunque no somos una entidad del sistema financiero supervisado prudencialmente por
                  la SBS, adoptamos voluntariamente los estándares de transparencia de la SBS Res.
                  3274-2017 (Hoja Resumen, TEA/TCEA publicadas) y respetamos los topes de tasa de
                  interés compensatoria que publica el BCRP cada semestre.
                </p>
                <p className="text-white/60 text-xs sm:text-sm leading-relaxed">
                  También cumplimos con el Código de Protección y Defensa del Consumidor (Ley
                  29571), la Ley de Protección de Datos Personales (Ley 29733) y la Ley 27598 sobre
                  gestión de cobranza.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Commitments */}
        <section>
          <h2 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-6 tracking-tight">
            Lo que te prometemos
          </h2>
          <ul className="space-y-3">
            {COMMITMENTS.map((c) => (
              <li
                key={c}
                className="flex items-start gap-3 p-4 rounded-lg bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6"
              >
                <div className="w-6 h-6 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{c}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Contact CTA */}
        <section className="text-center bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg p-10">
          <h2 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-3 tracking-tight">
            ¿Tienes preguntas o quieres contactar al equipo?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-2xl mx-auto leading-relaxed">
            Respondemos consultas por correo en menos de 24 horas hábiles. Si eres cliente Crevo
            también puedes abrir un ticket SAU desde tu cuenta.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:hola@crevo.pe"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#0A192F] hover:bg-[#112240] text-[#D4AF37] text-sm font-medium transition-colors"
            >
              hola@crevo.pe
            </a>
            <Link
              href="/preguntas-frecuentes"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#0F172A] text-sm font-medium transition-colors"
            >
              Ver preguntas frecuentes
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 dark:border-white/5 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
        © {CURRENT_YEAR} Crevo · Perú
      </footer>
    </div>
  )
}
