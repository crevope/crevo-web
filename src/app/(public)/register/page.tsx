import Link from 'next/link'
import { RegisterForm } from '@/features/auth'
import { AuthHeader } from '@/shared/ui/auth-header'
import { CURRENT_YEAR } from '@/shared/lib/constants'

export default function RegisterPage() {
  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] min-h-screen flex flex-col text-gray-800 dark:text-[#F1F5F9] antialiased overflow-x-hidden relative transition-colors duration-300">
      <AuthHeader cta={{ label: 'Iniciar sesión', href: '/login' }} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 flex items-center justify-center">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white dark:bg-[#1E293B] rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-white/6">

          {/* ── Left Hero ─────────────────────────────────────────────── */}
          <div className="hidden lg:flex flex-col justify-between bg-[#0A192F] p-10 text-white relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#00E5FF] rounded-full mix-blend-multiply filter blur-3xl opacity-15 z-0" />
            <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-[#D4AF37] rounded-full mix-blend-multiply filter blur-3xl opacity-8 z-0" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] text-[13px] font-medium mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
                Préstamos 100% digitales • Regulado por SBS
              </div>

              <h1 className="text-[33px] font-bold mb-4 leading-tight">
                Gestiona tus préstamos en{' '}
                <span className="bg-linear-to-r from-[#D4AF37] to-[#FFD700] bg-clip-text text-transparent">Soles</span>.
              </h1>
              <p className="text-gray-300 text-md mb-8 max-w-md">
                Únete a miles de peruanos que confían en Crevo para alcanzar sus metas financieras con procesos rápidos y seguros.
              </p>

              <div className="space-y-4 mt-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                    <i className="fa-solid fa-check text-sm text-[#00E5FF]" />
                  </div>
                  <span className="text-gray-200 font-medium">Aprobación en minutos en S/</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                    <i className="fa-solid fa-shield-halved text-sm text-[#00E5FF]" />
                  </div>
                  <span className="text-gray-200 font-medium">Seguridad bancaria 256-bit</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                    <i className="fa-solid fa-headset text-sm text-[#00E5FF]" />
                  </div>
                  <span className="text-gray-200 font-medium">Soporte local 24/7</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-10">
              <div className="flex -space-x-2.5 mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-9 h-9 rounded-full border-2 border-[#0A192F] object-cover" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg" alt="Usuario" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-9 h-9 rounded-full border-2 border-[#0A192F] object-cover" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" alt="Usuario" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-9 h-9 rounded-full border-2 border-[#0A192F] object-cover" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" alt="Usuario" />
                <div className="w-9 h-9 rounded-full border-2 border-[#0A192F] bg-[#D4AF37] text-[#0A192F] flex items-center justify-center text-xs font-bold">
                  +1M
                </div>
              </div>
              <p className="text-[13px] text-gray-300">Más de 1 millón de peruanos satisfechos</p>
            </div>
          </div>

          {/* ── Right Form ────────────────────────────────────────────── */}
          <div className="p-8 sm:p-10 flex flex-col justify-center bg-white dark:bg-[#1E293B]">
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#0A192F] dark:text-white mb-1">Crear tu cuenta</h2>
              <p className="text-sm text-gray-400 dark:text-gray-500">Comienza tu viaje financiero hoy mismo.</p>
            </div>

            <RegisterForm />

            <div className="mt-5 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/login" className="text-[#0A192F] dark:text-[#D4AF37] font-medium hover:underline ml-1">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-5 px-4 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2">
          <i className="fa-solid fa-lock" />
          © {CURRENT_YEAR} Crevo. Conexión segura 256-bits • Regulado por SBS
        </p>
      </footer>
    </div>
  )
}
