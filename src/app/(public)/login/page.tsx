import Link from 'next/link'
import Image from 'next/image'
import { LoginForm } from '@/features/auth'
import { AuthHeader } from '@/shared/ui/auth-header'
import { CURRENT_YEAR } from '@/shared/lib/constants'
import { buildMetadata } from '@/shared/seo/buildMetadata'

// noindex: login pages have no SEO value (they're transactional, not
// informational) and indexing them dilutes the home page's ranking signal
// for branded queries like "iniciar sesión crevo".
export const metadata = buildMetadata({
  title: 'Iniciar sesión',
  description: 'Accede a tu cuenta de Crevo para gestionar tus préstamos, pagos y cuotas.',
  path: '/login',
  index: false,
})

export default function LoginPage() {
  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] min-h-screen flex flex-col text-gray-800 dark:text-[#F1F5F9] antialiased overflow-x-hidden relative transition-colors duration-300">
      <AuthHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-[1100px] flex flex-col lg:flex-row bg-white dark:bg-[#1E293B] rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-white/6 min-h-[640px]">

          {/* ── Left Hero ─────────────────────────────────────────────── */}
          <div className="hidden lg:flex flex-col justify-center items-center w-1/2 p-10 relative overflow-hidden bg-linear-to-br from-[#0A192F] via-[#0A192F] to-[#0A192F]/80">
            <div className="absolute top-10 left-10 w-32 h-16 bg-[#00E5FF]/15 rounded-full blur-xl" />
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-[#00E5FF]/5 rounded-full blur-3xl" />

            <div className="relative z-10 text-center text-white flex flex-col items-center">
              <div className="w-44 h-44 mb-6">
                <Image
                  className="w-full h-full object-contain"
                  src="/images/landing/login-hero.png"
                  alt="Ilustración de la app móvil de Crevo"
                  width={176}
                  height={176}
                  priority
                />
              </div>

              <h1 className="text-2xl font-semibold mb-3 leading-tight">Bienvenido de nuevo</h1>
              <p className="text-gray-300 text-sm max-w-sm mb-5 leading-relaxed">
                Gestiona tus préstamos en Soles y alcanza tus metas financieras con{' '}
                <span className="text-[#D4AF37] font-medium">Crevo</span>.
              </p>

              <div className="flex flex-wrap gap-2 justify-center mt-3">
                <div className="px-3 py-1 bg-white/8 border border-white/15 rounded-full text-xs font-medium text-white/80">
                  <i className="fa-solid fa-bolt text-[#00E5FF] mr-1" /> Crevo Express
                </div>
                <div className="px-3 py-1 bg-white/8 border border-white/15 rounded-full text-xs font-medium text-white/80">
                  <i className="fa-solid fa-chart-line text-[#D4AF37] mr-1" /> Crevo Flex
                </div>
                <div className="px-3 py-1 bg-white/8 border border-white/15 rounded-full text-xs font-medium text-white/80">
                  <i className="fa-solid fa-crown text-[#D4AF37] mr-1" /> Crevo Plus
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Form ────────────────────────────────────────────── */}
          <div className="w-full lg:w-1/2 p-8 sm:p-10 flex flex-col justify-center bg-white dark:bg-[#1E293B]">
            <div className="max-w-md w-full mx-auto">
              <div className="mb-7 mt-4 lg:mt-0">
                <h2 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-1">Iniciar Sesión</h2>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Accede a tu cuenta para gestionar tus préstamos.
                </p>
              </div>

              <LoginForm />

              <div className="text-center mt-7 pt-5 border-t border-gray-100 dark:border-white/6">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  ¿No tienes cuenta?{' '}
                  <Link href="/register" className="text-[#00E5FF] font-medium hover:underline ml-1">
                    Regístrate
                  </Link>
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                  Al continuar, aceptas nuestros{' '}
                  <Link href="/terminos-y-condiciones" className="text-[#0A192F] dark:text-[#D4AF37] font-medium hover:underline">
                    Términos de Uso
                  </Link>{' '}
                  y{' '}
                  <Link href="/politica-de-privacidad" className="text-[#0A192F] dark:text-[#D4AF37] font-medium hover:underline">
                    Política de Privacidad
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-6 px-4 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2">
          <i className="fa-solid fa-lock" />
          © {CURRENT_YEAR} Crevo. Conexión segura 256-bits • Sujeto Obligado UIF-Perú
        </p>
      </footer>
    </div>
  )
}
