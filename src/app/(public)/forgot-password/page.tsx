'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ShieldCheck, ArrowLeft, MailCheck, CircleAlert } from 'lucide-react'
import { authRepository } from '@/features/auth'
import { AuthHeader } from '@/shared/ui/auth-header'
import { CURRENT_YEAR } from '@/shared/lib/constants'

const schema = z.object({
  email: z.string().email('Ingresa un email válido'),
})
type FormValues = z.infer<typeof schema>

const inputCls =
  'w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1E293B] text-[#0A192F] dark:text-[#F1F5F9] text-sm placeholder-gray-400 dark:placeholder-[#64748B] focus:outline-none focus:border-[#00E5FF] dark:focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/10 transition-all'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    await authRepository.forgotPassword(values.email)
    setSent(true)
  }

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] min-h-screen flex flex-col text-gray-800 dark:text-[#F1F5F9] antialiased overflow-x-hidden relative transition-colors duration-300">
      <AuthHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-[1000px] flex flex-col lg:flex-row bg-white dark:bg-[#1E293B] rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-white/6 min-h-[560px]">
          {/* ── Left Hero ─────────────────────────────────────────────── */}
          <div className="hidden lg:flex flex-col justify-center items-center w-1/2 p-10 relative overflow-hidden bg-[#0A192F]">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#00E5FF] rounded-full mix-blend-multiply filter blur-3xl opacity-15 z-0" />
            <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-[#D4AF37] rounded-full mix-blend-multiply filter blur-3xl opacity-8 z-0" />

            <div className="relative z-10 w-full max-w-sm">
              <div className="bg-white/8 backdrop-blur-md rounded-lg p-5 border border-white/15 hover:-translate-y-1 transition-transform duration-500">
                <div className="flex items-center justify-between mb-5">
                  <ShieldCheck className="h-4 w-4 text-[#00E5FF]" aria-hidden="true" />
                  <span className="text-white/60 text-xs">Seguridad bancaria</span>
                </div>
                <h3 className="text-white text-base font-semibold mb-1.5">Protección Avanzada</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Tu seguridad es nuestra prioridad. Recupera el acceso de forma rápida y segura.
                </p>
                <div className="mt-5 space-y-2">
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00E5FF] w-3/4 rounded-full" />
                  </div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#D4AF37] w-1/2 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Form ────────────────────────────────────────────── */}
          <div className="w-full lg:w-1/2 p-8 sm:p-10 flex flex-col justify-center bg-white dark:bg-[#1E293B]">
            <div className="max-w-md w-full mx-auto">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-[#00E5FF] dark:hover:text-[#00E5FF] transition-colors mb-7 group"
              >
                <ArrowLeft
                  className="h-3 w-3 mr-2 group-hover:-translate-x-1 transition-transform"
                  aria-hidden="true"
                />
                Volver a Iniciar Sesión
              </Link>

              {sent ? (
                <div className="text-center space-y-5 py-4">
                  <div className="w-14 h-14 rounded-full bg-[#00E5FF]/10 dark:bg-[#00E5FF]/20 border border-[#00E5FF]/40 flex items-center justify-center mx-auto">
                    <MailCheck className="h-6 w-6 text-[#00E5FF]" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-2">
                      ¡Revisa tu correo!
                    </h2>
                    <p className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                      Si el correo{' '}
                      <span className="font-medium text-[#0A192F] dark:text-[#D4AF37]">
                        {getValues('email')}
                      </span>{' '}
                      está registrado, recibirás un enlace en los próximos minutos.
                    </p>
                  </div>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center w-full py-3 rounded-lg bg-[#0A192F] text-[#D4AF37] font-medium text-sm hover:bg-[#112240] transition-all gap-2"
                  >
                    Volver a Iniciar Sesión
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <span className="text-[#00E5FF] text-xs tracking-wider uppercase mb-2 block">
                      Recuperación de cuenta
                    </span>
                    <h2 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-2">
                      ¿Olvidaste tu contraseña?
                    </h2>
                    <p className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed">
                      Ingresa tu correo Crevo y te enviaremos un enlace para restablecerla.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="ejemplo@correo.com"
                        autoComplete="email"
                        className={inputCls}
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1">
                          <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />{' '}
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-lg bg-[#0A192F] text-[#D4AF37] font-medium text-sm hover:bg-[#112240] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Enviando...
                        </>
                      ) : (
                        'Enviar Enlace'
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-6 px-4 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          © {CURRENT_YEAR} Crevo. Sujeto Obligado UIF-Perú. Conexión segura 256-bits.
        </p>
      </footer>
    </div>
  )
}
