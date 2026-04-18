import Link from 'next/link'
import Image from 'next/image'
import {
  Zap,
  LineChart,
  Crown,
  Calculator,
  ArrowRight,
  Star,
  StarHalf,
  CirclePlay,
  ShieldCheck,
  Quote,
  Check,
  Lock,
  Landmark,
  Smartphone,
} from 'lucide-react'
import { LoanSimulator } from '@/features/simulator/ui/LoanSimulator'
import { RepresentativeExample } from '@/features/simulator/ui/RepresentativeExample'
import { FaqSection, faqJsonLd } from '@/features/faq'
import { LandingHeader } from '@/shared/ui/landing-header'
import { LandingFooter } from '@/shared/ui/landing-footer'
import { buildMetadata } from '@/shared/seo/buildMetadata'
import { JsonLd } from '@/shared/seo/JsonLd'

// SEO money page. Title leads with "Crevo" (brand awareness) + the head
// keyword "préstamos online en Perú" + qualifiers ("rápidos", "100% digital")
// that Spanish-speaking borrowers use in long-tail searches.
//
// Description is engineered for the SERP snippet (~155 chars): leads with
// the value prop (S/. 200–S/. 2,000), reinforces speed (aprobación en
// minutos) and the digital-native angle (sin papeleo).
export const metadata = buildMetadata({
  title: 'Crevo — Préstamos online rápidos y seguros en Perú',
  titleAbsolute: true, // skip "%s | Crevo" template — brand already in title
  description:
    'Mini préstamos online de S/. 200 a S/. 2,000 en Perú. 100% digital, ' +
    'aprobación en minutos, sin papeleo. Solicita tu préstamo personal ' +
    'con Crevo y recíbelo en tu cuenta bancaria el mismo día.',
  path: '/',
  keywords: [
    'préstamos online perú',
    'mini préstamos digitales',
    'préstamos rápidos perú',
    'préstamos por internet',
    'crédito rápido lima',
    'crevo préstamos',
    'préstamos personales online',
    'préstamos sin papeleo',
    'préstamos inmediatos',
    'fintech perú',
  ],
})

export default function LandingPage() {
  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] w-full min-h-screen m-0 p-0 text-gray-800 dark:text-[#F1F5F9] antialiased overflow-x-hidden flex flex-col transition-colors duration-300 ease-in-out">
      {/* ═══════════════════════════ HEADER ═══════════════════════════════════ */}
      <LandingHeader />

      {/* ═══════════════════════════ MAIN ═════════════════════════════════════ */}
      <main className="grow w-full flex flex-col pt-20">
        {/* ─── HERO ─────────────────────────────────────────────────────────── */}
        <section className="w-full flex flex-col lg:flex-row h-200">
          {/* Left Column */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-16 xl:px-24 pt-28 lg:pt-0 pb-12 lg:pb-0 z-10 relative">
            {/* Blob light */}
            <div className="absolute top-[-8%] left-[-8%] w-80 h-80 bg-[#00E5FF] rounded-full mix-blend-multiply filter blur-3xl opacity-15 z-[-1] dark:hidden" />
            {/* Blob dark */}
            <div className="absolute top-[-8%] left-[-8%] w-80 h-80 bg-[#00E5FF] rounded-full mix-blend-screen filter blur-3xl opacity-10 z-[-1] hidden dark:block" />

            <div className="max-w-2xl mx-auto lg:mx-0">
              {/* Badge light */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/25 text-[#0A192F] text-xs font-medium mb-7 dark:hidden">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                Préstamos 100% digitales • Empresa peruana
              </div>
              {/* Badge dark */}
              <div className="hidden dark:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-medium mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                Préstamos 100% digitales • Empresa peruana
              </div>

              {/* H1 light */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 text-[#0A192F] dark:hidden">
                Impulsa tus metas con <span className="text-gradient-gold">Soles</span>
              </h1>
              {/* H1 dark */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 text-white hidden dark:block">
                Impulsa tus metas con <span className="text-gradient-gold">Soles</span>
              </h1>

              {/* Subtitle light */}
              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl dark:hidden">
                Obtén liquidez inmediata con <strong>tasas transparentes</strong> y sin
                complicaciones. Gestiona tu préstamo 100% digital desde cualquier lugar del Perú.
              </p>
              {/* Subtitle dark */}
              <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed max-w-xl hidden dark:block">
                Obtén liquidez inmediata con{' '}
                <strong className="text-[#D4AF37]">tasas transparentes</strong> y sin
                complicaciones. Gestiona tu préstamo 100% digital desde cualquier lugar del Perú.
              </p>

              {/* Product pills light */}
              <div className="flex flex-wrap gap-2 mb-9 dark:hidden">
                <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600">
                  <Zap className="inline h-3 w-3 text-[#00E5FF] mr-1" aria-hidden="true" /> Crevo
                  Express
                </div>
                <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600">
                  <LineChart className="inline h-3 w-3 text-[#D4AF37] mr-1" aria-hidden="true" />{' '}
                  Crevo Flex
                </div>
                <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600">
                  <Crown className="inline h-3 w-3 text-[#D4AF37] mr-1" aria-hidden="true" /> Crevo
                  Plus
                </div>
              </div>
              {/* Product pills dark */}
              <div className="hidden dark:flex flex-wrap gap-2 mb-9">
                <div className="px-3 py-1.5 bg-[#1E293B] border border-[#334155] rounded-full text-xs font-medium text-gray-300">
                  <Zap className="inline h-3 w-3 text-[#00E5FF] mr-1" aria-hidden="true" /> Crevo
                  Express
                </div>
                <div className="px-3 py-1.5 bg-[#1E293B] border border-[#334155] rounded-full text-xs font-medium text-gray-300">
                  <LineChart className="inline h-3 w-3 text-[#D4AF37] mr-1" aria-hidden="true" />{' '}
                  Crevo Flex
                </div>
                <div className="px-3 py-1.5 bg-[#1E293B] border border-[#334155] rounded-full text-xs font-medium text-gray-300">
                  <Crown className="inline h-3 w-3 text-[#D4AF37] mr-1" aria-hidden="true" /> Crevo
                  Plus
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                {/* Simular — light */}
                <Link
                  href="#simulador"
                  className="px-7 py-3 bg-[#0A192F] text-white rounded-lg font-semibold text-base hover:bg-[#0A192F]/90 transition-all flex items-center justify-center gap-2.5 dark:hidden"
                >
                  <Calculator className="h-4 w-4 text-[#D4AF37]" aria-hidden="true" />
                  Simular préstamo (S/)
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                {/* Simular — dark */}
                <Link
                  href="#simulador"
                  className="px-7 py-3 bg-[#0A192F] text-white rounded-lg font-semibold text-base hover:opacity-90 transition-all hidden dark:flex items-center justify-center gap-2.5"
                >
                  <Calculator className="h-4 w-4 text-[#D4AF37]" aria-hidden="true" />
                  Simular préstamo (S/)
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>

                {/* Registrarme — light */}
                <Link
                  href="/register"
                  className="px-7 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium text-base hover:border-[#0A192F] hover:text-[#0A192F] transition-all flex items-center justify-center dark:hidden"
                >
                  Registrarme
                </Link>
                {/* Registrarme — dark */}
                <Link
                  href="/register"
                  className="px-7 py-3 bg-[#1E293B] border border-[#334155] text-gray-300 rounded-lg font-medium text-base hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all hidden dark:flex items-center justify-center"
                >
                  Registrarme
                </Link>
              </div>

              {/* Social proof — light. Avatars are decorative (the meaningful
                  signal is the rating + count), so alt="" is correct semantically. */}
              <div className="flex items-center gap-5 pt-5 border-t border-gray-200 dark:hidden">
                <div className="flex -space-x-2.5">
                  <Image
                    className="w-9 h-9 rounded-full border-2 border-white object-cover"
                    src="/images/avatars/avatar-1.jpg"
                    alt=""
                    width={36}
                    height={36}
                  />
                  <Image
                    className="w-9 h-9 rounded-full border-2 border-white object-cover"
                    src="/images/avatars/avatar-2.jpg"
                    alt=""
                    width={36}
                    height={36}
                  />
                  <Image
                    className="w-9 h-9 rounded-full border-2 border-white object-cover"
                    src="/images/avatars/avatar-3.jpg"
                    alt=""
                    width={36}
                    height={36}
                  />
                  <div className="w-9 h-9 rounded-full border-2 border-white bg-[#0A192F] flex items-center justify-center text-[10px] font-bold text-[#D4AF37]">
                    +1M
                  </div>
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-[#D4AF37] text-sm mb-1">
                    <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    <StarHalf className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  </div>
                  <span className="text-gray-500 text-xs">Peruanos confían en nosotros</span>
                </div>
              </div>
              {/* Social proof — dark */}
              <div className="hidden dark:flex items-center gap-5 pt-5 border-t border-[#334155]">
                <div className="flex -space-x-2.5">
                  <Image
                    className="w-9 h-9 rounded-full border-2 border-[#0F172A] object-cover"
                    src="/images/avatars/avatar-1.jpg"
                    alt=""
                    width={36}
                    height={36}
                  />
                  <Image
                    className="w-9 h-9 rounded-full border-2 border-[#0F172A] object-cover"
                    src="/images/avatars/avatar-2.jpg"
                    alt=""
                    width={36}
                    height={36}
                  />
                  <Image
                    className="w-9 h-9 rounded-full border-2 border-[#0F172A] object-cover"
                    src="/images/avatars/avatar-3.jpg"
                    alt=""
                    width={36}
                    height={36}
                  />
                  <div className="w-9 h-9 rounded-full border-2 border-[#0F172A] bg-[#D4AF37] flex items-center justify-center text-[10px] font-bold text-[#0A192F]">
                    +1M
                  </div>
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-[#D4AF37] text-sm mb-1">
                    <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    <StarHalf className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  </div>
                  <span className="text-gray-500 text-xs">Peruanos confían en nosotros</span>
                </div>
              </div>

              {/* Discover link */}
              <div className="mt-6">
                <Link
                  href="#como-funciona"
                  className="inline-flex items-center gap-2 text-[#0A192F] dark:hidden font-medium group text-sm"
                >
                  <CirclePlay
                    className="h-5 w-5 group-hover:scale-110 transition-transform text-[#00E5FF]"
                    aria-hidden="true"
                  />
                  Descubre cómo funciona
                </Link>
                <Link
                  href="#como-funciona"
                  className="hidden dark:inline-flex items-center gap-2 text-[#D4AF37] font-medium group text-sm"
                >
                  <CirclePlay
                    className="h-5 w-5 group-hover:scale-110 transition-transform text-[#00E5FF]"
                    aria-hidden="true"
                  />
                  Descubre cómo funciona
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column — Light */}
          <div className="w-full lg:w-1/2 relative flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 overflow-hidden dark:hidden bg-linear-to-br from-gray-50 to-gray-100">
            <div className="absolute top-0 right-0 w-full h-full bg-linear-to-br from-[#0A192F]/5 via-transparent to-[#00E5FF]/5 rounded-bl-[120px]" />

            <div className="relative w-full max-w-xl aspect-4/5 rounded-lg overflow-hidden shadow-md border border-gray-200/80 z-10">
              {/* `priority` because this is above-the-fold and the largest LCP
                  candidate on first paint. `sizes` matches the parent's
                  responsive width (full-width mobile → half-width desktop). */}
              <Image
                className="object-cover"
                src="/images/landing/app-light.png"
                alt="Pantalla de la app móvil de Crevo en modo claro mostrando un préstamo activo"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
              />

              {/* Security badge */}
              <div className="absolute top-5 right-5 glass-effect rounded-lg px-3 py-2.5 shadow-lg flex items-center gap-2.5 animate-[bounce_4s_ease-in-out_infinite]">
                <ShieldCheck className="h-4 w-4 text-[#00E5FF]" aria-hidden="true" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                    Seguridad bancaria
                  </p>
                  <p className="text-xs font-semibold text-gray-900">Cifrado AES-256</p>
                </div>
              </div>

              {/* Testimonial */}
              <div className="absolute bottom-12 -left-6 glass-effect rounded-lg p-4 shadow-xl max-w-64 transform -rotate-1">
                <div className="flex items-start gap-2.5">
                  <Quote className="h-5 w-5 text-[#D4AF37] mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-gray-700 leading-snug mb-2.5">
                      &quot;Solicité S/ 5,000 con Crevo Express y en 15 minutos ya estaba en mi CCI
                      del BCP.&quot;
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Image
                        src="/images/avatars/avatar-5.jpg"
                        className="w-6 h-6 rounded-full object-cover"
                        alt=""
                        width={24}
                        height={24}
                      />
                      <span className="text-xs font-medium text-gray-800">María S.</span>
                      <span className="text-xs text-gray-500">• Lima</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approval badge */}
              <div className="absolute bottom-5 right-5 glass-effect rounded-lg px-3 py-2 shadow-lg flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#00E5FF]" aria-hidden="true" />
                <span className="text-xs font-medium text-gray-900">Aprobación Inmediata</span>
              </div>
            </div>

            <p className="mt-5 text-xs text-gray-500 font-medium flex items-center justify-center gap-3 flex-wrap relative z-10">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3 w-3" aria-hidden="true" /> Datos protegidos por ley
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Landmark className="h-3 w-3" aria-hidden="true" /> Sujeto Obligado UIF-Perú
              </span>
            </p>
          </div>

          {/* Right Column — Dark */}
          <div className="w-full lg:w-1/2 relative flex-col items-center justify-center p-6 sm:p-12 lg:p-16 overflow-hidden hidden dark:flex bg-linear-to-br from-[#0F172A] to-[#1E293B]">
            <div className="absolute top-0 right-0 w-full h-full bg-linear-to-br from-[#00E5FF]/10 via-transparent to-[#D4AF37]/5 rounded-bl-[120px]" />

            <div className="relative w-full max-w-xl aspect-4/5 rounded-lg overflow-hidden shadow-md border border-white/10 z-10">
              <Image
                className="object-cover"
                src="/images/landing/app-dark.png"
                alt="Pantalla de la app móvil de Crevo en modo oscuro mostrando un préstamo activo"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                priority
              />

              <div className="absolute top-5 right-5 glass-effect-dark rounded-lg px-3 py-2.5 shadow-lg border border-white/10 flex items-center gap-2.5 animate-[bounce_4s_ease-in-out_infinite]">
                <ShieldCheck className="h-4 w-4 text-[#00E5FF]" aria-hidden="true" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                    Seguridad bancaria
                  </p>
                  <p className="text-xs font-semibold text-white">Cifrado AES-256</p>
                </div>
              </div>

              <div className="absolute bottom-12 -left-6 glass-effect-dark rounded-lg p-4 shadow-xl border border-white/10 max-w-64 transform -rotate-1">
                <div className="flex items-start gap-2.5">
                  <Quote className="h-5 w-5 text-[#D4AF37] mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-gray-200 leading-snug mb-2.5">
                      &quot;Solicité S/ 5,000 con Crevo Express y en 15 minutos ya estaba en mi CCI
                      del BCP.&quot;
                    </p>
                    <div className="flex items-center gap-1.5">
                      <Image
                        src="/images/avatars/avatar-5.jpg"
                        className="w-6 h-6 rounded-full object-cover"
                        alt=""
                        width={24}
                        height={24}
                      />
                      <span className="text-xs font-medium text-white">María S.</span>
                      <span className="text-xs text-gray-500">• Lima</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-5 right-5 glass-effect-dark rounded-lg px-3 py-2 shadow-lg border border-white/10 flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
                <span className="text-xs font-medium text-white">Aprobación Inmediata</span>
              </div>
            </div>

            <p className="mt-5 text-xs text-gray-400 font-medium flex items-center justify-center gap-3 flex-wrap relative z-10">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3 w-3" aria-hidden="true" /> Datos protegidos por ley
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Landmark className="h-3 w-3" aria-hidden="true" /> Sujeto Obligado UIF-Perú
              </span>
            </p>
          </div>
        </section>

        {/* ─── ¿POR QUÉ CREVO? ──────────────────────────────────────────────── */}
        <section
          id="por-que-crevo"
          className="w-full py-20 px-6 sm:px-10 lg:px-16 xl:px-24 bg-white dark:bg-[#0F172A] relative"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#0A192F] dark:text-white mb-3">
                ¿Por qué elegir <span className="text-gradient-gold">Crevo</span>?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
                Diseñado para peruanos que valoran su tiempo y buscan soluciones financieras
                transparentes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                <div className="w-11 h-11 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center mb-5">
                  <Smartphone className="h-5 w-5 text-[#00E5FF]" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold text-[#0A192F] dark:text-white mb-2">
                  100% Digital
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Olvídate de las colas y el papeleo. Todo el proceso, desde la solicitud hasta el
                  desembolso, se realiza desde tu celular o computadora.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                <div className="w-11 h-11 rounded-lg bg-[#0A192F]/8 dark:bg-[#D4AF37]/10 flex items-center justify-center mb-5">
                  <ShieldCheck
                    className="h-5 w-5 text-[#0A192F] dark:text-[#D4AF37]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-base font-semibold text-[#0A192F] dark:text-white mb-2">
                  Empresa Peruana Confiable
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Tus datos están protegidos con encriptación de nivel bancario. Cumplimos con la
                  Ley N° 29733 y aplicamos voluntariamente los estándares de transparencia SBS para
                  tasas y costos.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 hover:border-gray-200 dark:hover:border-white/10 transition-colors">
                <div className="w-11 h-11 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center mb-5">
                  <Zap className="h-5 w-5 text-[#D4AF37]" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold text-[#0A192F] dark:text-white mb-2">
                  Velocidad Crevo
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Aprobación en minutos. El dinero se transfiere directamente a tu CCI registrado
                  casi de inmediato.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3 PASOS ──────────────────────────────────────────────────────── */}
        <section
          id="como-funciona"
          className="w-full py-20 px-6 sm:px-10 lg:px-16 xl:px-24 bg-[#F8FAFC] dark:bg-[#1E293B] relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#0A192F] dark:text-white mb-3">
                Tu préstamo en <span className="text-gradient-gold">3 simples pasos</span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                Obtener liquidez nunca fue tan fácil y rápido.
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start relative">
              <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-1 bg-linear-to-r from-[#00E5FF] via-[#D4AF37] to-[#0A192F] dark:to-white opacity-20 z-[-1]" />

              <div className="flex flex-col items-center text-center w-full md:w-1/3 px-4 mb-10 md:mb-0 relative">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-[#0F172A] border-2 border-[#00E5FF] flex items-center justify-center mb-5 text-xl font-semibold text-[#0A192F] dark:text-white">
                  1
                </div>
                <h3 className="text-base font-semibold text-[#0A192F] dark:text-white mb-2">
                  Simula tu préstamo
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Elige el monto, el plazo y conoce exactamente cuánto pagarás. Sin letras pequeñas
                  ni comisiones ocultas.
                </p>
              </div>

              <div className="flex flex-col items-center text-center w-full md:w-1/3 px-4 mb-10 md:mb-0 relative">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-[#0F172A] border-2 border-[#D4AF37] flex items-center justify-center mb-5 text-xl font-semibold text-[#0A192F] dark:text-white">
                  2
                </div>
                <h3 className="text-base font-semibold text-[#0A192F] dark:text-white mb-2">
                  Regístrate
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Crea tu cuenta, valida tu identidad con tu DNI/CE y vincula tu cuenta bancaria
                  (CCI).
                </p>
              </div>

              <div className="flex flex-col items-center text-center w-full md:w-1/3 px-4 relative">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-[#0F172A] border-2 border-[#0A192F] dark:border-white flex items-center justify-center mb-5 text-xl font-semibold text-[#0A192F] dark:text-white">
                  3
                </div>
                <h3 className="text-base font-semibold text-[#0A192F] dark:text-white mb-2">
                  Recibe tu dinero
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Firma digitalmente tu contrato y recibe los Soles directamente en tu cuenta
                  bancaria en tiempo récord.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SIMULADOR ────────────────────────────────────────────────────── */}
        <section
          id="simulador"
          className="w-full py-20 px-6 sm:px-10 lg:px-16 xl:px-24 bg-white dark:bg-[#0F172A] relative"
        >
          <div className="max-w-4xl mx-auto bg-[#F8FAFC] dark:bg-[#1E293B] rounded-lg shadow-sm border border-gray-100 dark:border-white/6 p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-1">
                Simulador Rápido
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Calcula tu cuota en segundos
              </p>
            </div>
            <LoanSimulator />
          </div>

          {/* Ejemplo representativo exigido por SBS Res. 3274-2017 y Ley 28587.
              Se renderiza bajo el simulador para dar un caso concreto con TEA
              y TCEA incluso a usuarios que no interactúan con los controles. */}
          <div className="mt-6">
            <RepresentativeExample />
          </div>
        </section>

        {/* ─── TESTIMONIOS ──────────────────────────────────────────────────── */}
        <section
          id="testimonios"
          className="w-full py-20 px-6 sm:px-10 lg:px-16 xl:px-24 bg-[#F8FAFC] dark:bg-[#1E293B] relative"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#0A192F] dark:text-white mb-3">
                Lo que dicen nuestros <span className="text-gradient-gold">clientes</span>
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                Miles de peruanos ya han impulsado sus metas con Crevo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Testimonial 1 */}
              <div className="bg-white dark:bg-[#0F172A] p-6 rounded-lg border border-gray-100 dark:border-white/6 relative">
                <Quote
                  className="absolute top-5 right-5 h-6 w-6 text-gray-100 dark:text-white/5 scale-x-[-1]"
                  aria-hidden="true"
                />
                <div className="flex items-center gap-0.5 text-[#D4AF37] text-xs mb-3">
                  <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 relative z-10 leading-relaxed">
                  &quot;Necesitaba capital para mi bodega. Con Crevo Flex me aprobaron súper rápido
                  y pude pagar en 3 meses. El proceso es muy transparente.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/avatars/avatar-6.jpg"
                    className="w-9 h-9 rounded-full border border-gray-100 dark:border-white/10 object-cover"
                    alt=""
                    width={36}
                    height={36}
                  />
                  <div>
                    <h3 className="font-medium text-sm text-[#0A192F] dark:text-white">
                      Carmen R.
                    </h3>
                    <p className="text-xs text-gray-500">Emprendedora, Arequipa</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white dark:bg-[#0F172A] p-6 rounded-lg border border-gray-100 dark:border-white/6 relative">
                <Quote
                  className="absolute top-5 right-5 h-6 w-6 text-gray-100 dark:text-white/5 scale-x-[-1]"
                  aria-hidden="true"
                />
                <div className="flex items-center gap-0.5 text-[#D4AF37] text-xs mb-3">
                  <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 relative z-10 leading-relaxed">
                  &quot;Tuve una emergencia médica y necesitaba liquidez urgente. Crevo Express me
                  salvó. En menos de media hora ya tenía la plata en mi banco.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/avatars/avatar-3.jpg"
                    className="w-9 h-9 rounded-full border border-gray-100 dark:border-white/10 object-cover"
                    alt=""
                    width={36}
                    height={36}
                  />
                  <div>
                    <h3 className="font-medium text-sm text-[#0A192F] dark:text-white">Luis M.</h3>
                    <p className="text-xs text-gray-500">Ingeniero, Lima</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white dark:bg-[#0F172A] p-6 rounded-lg border border-gray-100 dark:border-white/6 relative">
                <Quote
                  className="absolute top-5 right-5 h-6 w-6 text-gray-100 dark:text-white/5 scale-x-[-1]"
                  aria-hidden="true"
                />
                <div className="flex items-center gap-0.5 text-[#D4AF37] text-xs mb-3">
                  <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <Star className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  <StarHalf className="inline h-3.5 w-3.5 fill-current" aria-hidden="true" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 relative z-10 leading-relaxed">
                  &quot;La app es muy fácil de usar. Puedo ver exactamente cuánto voy a pagar desde
                  el principio, sin sorpresas al final de mes.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/avatars/avatar-7.jpg"
                    className="w-9 h-9 rounded-full border border-gray-100 dark:border-white/10 object-cover"
                    alt=""
                    width={36}
                    height={36}
                  />
                  <div>
                    <h3 className="font-medium text-sm text-[#0A192F] dark:text-white">
                      Andrea V.
                    </h3>
                    <p className="text-xs text-gray-500">Diseñadora, Trujillo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
        {/* Single source of truth: same FAQS array drives the visual accordion
            AND the FAQPage JSON-LD that Google may render as rich results. */}
        <FaqSection />
        <JsonLd id="ld-faq" data={faqJsonLd()} />

        {/* ─── COMPLIANCE BADGE ─────────────────────────────────────────────── */}
        <section
          id="compliance-badge"
          className="w-full py-12 px-6 sm:px-10 lg:px-16 xl:px-24 bg-white dark:bg-[#0F172A] border-t border-gray-200 dark:border-[#334155]"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-[#0A192F]/8 dark:bg-[#D4AF37]/10 flex items-center justify-center">
                  <ShieldCheck
                    className="h-5 w-5 text-[#0A192F] dark:text-[#D4AF37]"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#0A192F] dark:text-white mb-0.5">
                    Cumplimiento normativo peruano
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    INDECOPI · ANPDP · UIF-Perú · BCRP
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-wrap justify-center">
                <div className="px-4 py-2 bg-[#F8FAFC] dark:bg-[#1E293B] rounded-lg border border-gray-200 dark:border-[#334155]">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cifrado SSL</p>
                  <p className="text-sm font-semibold text-[#0A192F] dark:text-white">256-bit</p>
                </div>
                <div className="px-4 py-2 bg-[#F8FAFC] dark:bg-[#1E293B] rounded-lg border border-gray-200 dark:border-[#334155]">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">PLAFT</p>
                  <p className="text-sm font-semibold text-[#0A192F] dark:text-white">UIF-Perú</p>
                </div>
                <div className="px-4 py-2 bg-[#F8FAFC] dark:bg-[#1E293B] rounded-lg border border-gray-200 dark:border-[#334155]">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Protección de Datos
                  </p>
                  <p className="text-sm font-semibold text-[#0A192F] dark:text-white">
                    Ley N° 29733
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════ FOOTER ═══════════════════════════════════ */}
      {/* Internal-linking value: every legal page (which Google indexes) gets
          a link from the home, and the home gets a link FROM every legal page
          via the "Volver al inicio" + cross-links — that's the link graph
          search engines reward. */}
      <LandingFooter />
    </div>
  )
}
