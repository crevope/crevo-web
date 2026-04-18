'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Loader2,
  Check,
  TriangleAlert,
  CircleAlert,
  RotateCw,
  ArrowLeft,
  MailCheck,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authRepository } from '@/features/auth'
import { toast } from 'sonner'
import { AuthHeader } from '@/shared/ui/auth-header'
import { CURRENT_YEAR } from '@/shared/lib/constants'

const resendSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
})
type ResendFormValues = z.infer<typeof resendSchema>

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResendFormValues>({ resolver: zodResolver(resendSchema) })

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token de verificación no encontrado.')
      return
    }
    authRepository
      .verifyEmail(token)
      .then((res) => {
        setStatus('success')
        setMessage(res.message || '¡Email verificado con éxito!')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'El enlace expiró o es inválido.')
      })
  }, [token])

  const onResend = async (values: ResendFormValues) => {
    try {
      await authRepository.resendVerification(values.email)
      toast.success('Si el correo está registrado, recibirás un nuevo enlace.')
    } catch {
      toast.error('Error al reenviar. Intenta de nuevo.')
    }
  }

  if (status === 'loading') {
    return (
      <div className="text-center space-y-5 py-4">
        <div className="w-14 h-14 rounded-full bg-[#00E5FF]/10 flex items-center justify-center mx-auto border border-[#00E5FF]/30">
          <Loader2 className="h-6 w-6 animate-spin text-[#00E5FF]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-1">
            Verificando tu email
          </h2>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Por favor espera un momento...</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="text-center space-y-5 py-4">
        <div className="w-14 h-14 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-400">
          <Check className="h-6 w-6 text-green-500" aria-hidden="true" />
        </div>
        <div>
          <span className="text-[#00E5FF] text-xs tracking-wider uppercase mb-2 block">
            Verificación exitosa
          </span>
          <h2 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-2">
            ¡Email verificado!
          </h2>
          <p className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
            {message}
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full py-3 rounded-lg bg-[#0A192F] text-[#D4AF37] font-medium text-sm hover:bg-[#112240] transition-all"
        >
          Ir al Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5 py-2">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto border border-red-400">
          <TriangleAlert className="h-6 w-6 text-red-500" aria-hidden="true" />
        </div>
        <div>
          <span className="text-red-500 text-xs tracking-wider uppercase mb-2 block">
            Error de verificación
          </span>
          <h2 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-1">
            Enlace inválido
          </h2>
          <p className="text-gray-400 dark:text-gray-500 text-sm">{message}</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onResend)}
        className="bg-gray-50 dark:bg-[#0F172A] rounded-lg p-5 border border-gray-100 dark:border-white/6 space-y-3"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          ¿Quieres que te enviemos un nuevo enlace?
        </p>
        <div>
          <input
            type="email"
            placeholder="tucorreo@ejemplo.com"
            autoComplete="email"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1E293B] text-[#0A192F] dark:text-[#F1F5F9] text-sm placeholder-gray-400 dark:placeholder-[#64748B] focus:outline-none focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/10 transition-all"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1">
              <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" /> {errors.email.message}
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
            <>
              <RotateCw className="h-3 w-3" aria-hidden="true" /> Reenviar email de verificación
            </>
          )}
        </button>
      </form>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-[#00E5FF] dark:hover:text-[#00E5FF] transition-colors group"
        >
          <ArrowLeft
            className="h-3 w-3 mr-2 group-hover:-translate-x-1 transition-transform"
            aria-hidden="true"
          />
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] min-h-screen flex flex-col text-gray-800 dark:text-[#F1F5F9] antialiased overflow-x-hidden relative transition-colors duration-300">
      <AuthHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-[1000px] flex flex-col lg:flex-row bg-white dark:bg-[#1E293B] rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-white/6 min-h-[560px]">
          {/* ── Left Hero ─────────────────────────────────────────────── */}
          <div className="hidden lg:flex flex-col justify-center items-center w-1/2 p-10 relative overflow-hidden bg-[#0A192F]">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#00E5FF] rounded-full mix-blend-multiply filter blur-3xl opacity-15 z-0" />
            <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-[#D4AF37] rounded-full mix-blend-multiply filter blur-3xl opacity-8 z-0" />

            <div className="relative z-10 w-full max-w-sm text-center">
              <div className="w-16 h-16 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex items-center justify-center mx-auto mb-5">
                <MailCheck className="h-6 w-6 text-[#00E5FF]" aria-hidden="true" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">Verifica tu Email</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Confirma tu correo para activar tu cuenta y gestionar tus préstamos en Soles.
              </p>

              <div className="space-y-2 text-left">
                <div className="flex items-center gap-3 bg-white/8 rounded-lg px-3 py-2.5 border border-white/15">
                  <ShieldCheck className="h-4 w-4 text-[#00E5FF]" aria-hidden="true" />
                  <span className="text-white/70 text-sm">Cuenta protegida y verificada</span>
                </div>
                <div className="flex items-center gap-3 bg-white/8 rounded-lg px-3 py-2.5 border border-white/15">
                  <Zap className="h-4 w-4 text-[#D4AF37]" aria-hidden="true" />
                  <span className="text-white/70 text-sm">Acceso inmediato al dashboard</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Content ──────────────────────────────────────────── */}
          <div className="w-full lg:w-1/2 p-8 sm:p-10 flex flex-col justify-center bg-white dark:bg-[#1E293B]">
            <div className="max-w-md w-full mx-auto">
              <Suspense
                fallback={
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-10 w-10 animate-spin text-[#00E5FF]" />
                  </div>
                }
              >
                <VerifyEmailContent />
              </Suspense>
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
