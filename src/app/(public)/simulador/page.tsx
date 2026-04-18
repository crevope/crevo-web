import Link from 'next/link'
import { Calculator, Lock, ShieldCheck } from 'lucide-react'
import { LoanSimulator } from '@/features/simulator/ui/LoanSimulator'
import { RepresentativeExample } from '@/features/simulator/ui/RepresentativeExample'
import { LandingHeader } from '@/shared/ui/landing-header'
import { LandingFooter } from '@/shared/ui/landing-footer'
import { buildMetadata } from '@/shared/seo/buildMetadata'
import { JsonLd } from '@/shared/seo/JsonLd'
import { breadcrumbSchema } from '@/shared/seo/schemas/breadcrumb'

/**
 * Standalone simulator page.
 *
 * The same LoanSimulator component is anchored in the home page, but
 * giving it its own URL has three payoffs:
 *   1. SEO — "simulador de préstamos perú" and "calculadora de cuotas"
 *      are high-intent long-tail queries; a page whose main topic IS
 *      the simulator outranks a section on a general landing.
 *   2. Shareable — advisors, customer service, ads can deep-link
 *      directly to the calculator without scrolling noise.
 *   3. Analytics — we can measure simulator-page conversion separately
 *      from landing conversion and tune copy accordingly.
 */
export const metadata = buildMetadata({
  title: 'Simulador de préstamos',
  description:
    'Calcula tu préstamo Crevo al instante: monto de S/ 200 a S/ 2 000, número de cuotas, TEA y TCEA transparentes. Sin registrarte, sin afectar tu historial crediticio.',
  path: '/simulador',
  keywords: [
    'simulador de préstamos',
    'simulador préstamos online perú',
    'calculadora préstamos perú',
    'calcular cuota préstamo',
    'simulador crevo',
  ],
})

export default function SimulatorPage() {
  const breadcrumb = breadcrumbSchema([{ name: 'Simulador', path: '/simulador' }])

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] min-h-screen flex flex-col text-gray-800 dark:text-[#F1F5F9] antialiased">
      <JsonLd id="ld-breadcrumb" data={breadcrumb} />
      <LandingHeader />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-12">
        {/* Hero */}
        <header>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-xs font-semibold text-[#0A192F] dark:text-[#00E5FF] uppercase tracking-wider mb-5">
            <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
            Simulador gratuito
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#0A192F] dark:text-white tracking-tight mb-5">
            Simula tu préstamo en menos de un minuto
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
            Elige el monto, la frecuencia de pago y las cuotas. Te mostramos al instante la TEA, la
            TCEA y todas las comisiones aplicables — igual que en la Hoja Resumen. El simulador es{' '}
            <strong>100% informativo</strong> y no afecta tu historial crediticio.
          </p>
        </header>

        {/* Simulator */}
        <section id="simulador" aria-label="Simulador de préstamos">
          <LoanSimulator />
        </section>

        {/* Representative example + trust strip */}
        <section>
          <RepresentativeExample />
        </section>

        {/* Trust strip — why the simulator is safe to use */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Lock,
              title: 'Sin registro',
              body: 'No pedimos datos personales ni DNI para simular. Todo ocurre en tu navegador.',
            },
            {
              icon: ShieldCheck,
              title: 'Sin huella crediticia',
              body: 'No consultamos a Equifax ni Sentinel mientras simulas. La consulta solo ocurre si decides solicitar formalmente.',
            },
            {
              icon: Calculator,
              title: 'Cálculo oficial',
              body: 'Las tasas y comisiones son las mismas que aparecerán en tu Hoja Resumen y contrato final.',
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

        {/* CTA */}
        <section className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-3 tracking-tight">
            ¿Te convence el monto? Solicita tu préstamo en minutos.
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-xl mx-auto leading-relaxed">
            Crear tu cuenta toma menos de 2 minutos. Firma digital, evaluación automática y
            desembolso a tu cuenta bancaria el mismo día.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#0A192F] hover:bg-[#112240] text-[#D4AF37] text-sm font-medium transition-colors"
            >
              Crear mi cuenta
            </Link>
            <Link
              href="/preguntas-frecuentes"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#0F172A] text-sm font-medium transition-colors"
            >
              Ver preguntas frecuentes
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
