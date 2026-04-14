'use client'
import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { authRepository } from '@/features/auth'
import { toast } from 'sonner'
import { AuthHeader } from '@/shared/ui/auth-header'
import { CURRENT_YEAR } from '@/shared/lib/constants'

const schema = z.object({
  newPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})
type FormValues = z.infer<typeof schema>

const inputCls =
  'w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1E293B] text-[#0A192F] dark:text-[#F1F5F9] text-sm placeholder-gray-400 dark:placeholder-[#64748B] focus:outline-none focus:border-[#00E5FF] dark:focus:border-[#00E5FF] focus:ring-2 focus:ring-[#00E5FF]/10 transition-all'

function PasswordStrength({ password }: { password: string }) {
  const len = password.length
  let level = 0
  let label = 'La contraseña debe tener al menos 8 caracteres'
  let labelCls = 'text-gray-500 dark:text-gray-400'

  if (len > 0 && len < 6) {
    level = 1; label = 'Débil — Usa más caracteres'; labelCls = 'text-red-500'
  } else if (len >= 6 && (len < 10 || !/\d/.test(password))) {
    level = 2; label = 'Media — Agrega números o símbolos'; labelCls = 'text-yellow-500'
  } else if (len >= 10 && /\d/.test(password)) {
    level = 3; label = '¡Fuerte — Excelente!'; labelCls = 'text-green-500'
  }

  const barColors = ['bg-gray-200 dark:bg-[#334155]', 'bg-red-500', 'bg-yellow-500', 'bg-green-500']

  return (
    <div className="pt-2">
      <div className="flex gap-2 mb-1">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${level >= i ? barColors[level] : 'bg-gray-200 dark:bg-[#334155]'}`}
          />
        ))}
      </div>
      <p className={`text-xs ${labelCls}`}>{label}</p>
    </div>
  )
}

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [done, setDone] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const newPassword = watch('newPassword', '')

  const onSubmit = async (values: FormValues) => {
    if (!token) { toast.error('Enlace inválido. Solicita uno nuevo.'); return }
    try {
      await authRepository.resetPassword(token, values.newPassword)
      setDone(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al restablecer la contraseña')
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto">
          <i className="fa-solid fa-triangle-exclamation text-xl text-red-500" />
        </div>
        <p className="text-gray-400 dark:text-gray-500 text-sm">Enlace inválido o expirado.</p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center w-full py-3 rounded-lg bg-[#0A192F] text-[#D4AF37] font-medium text-sm hover:bg-[#112240] transition-all"
        >
          Solicitar nuevo enlace
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center space-y-5 py-4">
        <div className="w-14 h-14 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-400">
          <i className="fa-solid fa-check text-2xl text-green-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-2">¡Contraseña actualizada!</h2>
          <p className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
            Ahora puedes iniciar sesión con tu nueva credencial.
          </p>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="w-full py-3 rounded-lg bg-[#0A192F] text-[#D4AF37] font-medium text-sm hover:bg-[#112240] transition-all"
        >
          Ir a Iniciar Sesión
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <span className="text-[#00E5FF] text-xs tracking-wider uppercase mb-2 block">
          Nueva Contraseña
        </span>
        <h2 className="text-2xl font-semibold text-[#0A192F] dark:text-white mb-2">
          Crea una nueva contraseña
        </h2>
        <p className="text-gray-400 dark:text-gray-500 text-sm leading-relaxed">
          Tu nueva contraseña debe ser diferente a las utilizadas anteriormente.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            Nueva Contraseña
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              className={`${inputCls} pr-12`}
              {...register('newPassword')}
            />
            <button
              type="button"
              onClick={() => setShowNew(p => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Mostrar/Ocultar contraseña"
            >
              <i className={`fa-regular ${showNew ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>
          )}
          <PasswordStrength password={newPassword} />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
              className={`${inputCls} pr-12`}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(p => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Mostrar/Ocultar contraseña"
            >
              <i className={`fa-regular ${showConfirm ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-lg bg-[#0A192F] text-[#D4AF37] font-medium text-sm hover:bg-[#112240] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
          ) : (
            'Guardar y Continuar'
          )}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] min-h-screen flex flex-col text-gray-800 dark:text-[#F1F5F9] antialiased overflow-x-hidden relative transition-colors duration-300">
      <AuthHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-250 flex flex-col lg:flex-row bg-white dark:bg-[#1E293B] rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-white/6 min-h-[560px]">

          {/* ── Left Hero ─────────────────────────────────────────────── */}
          <div className="hidden lg:flex flex-col justify-center items-center w-1/2 p-10 relative overflow-hidden bg-[#0A192F]">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#00E5FF] rounded-full mix-blend-multiply filter blur-3xl opacity-15 z-0" />
            <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-[#D4AF37] rounded-full mix-blend-multiply filter blur-3xl opacity-8 z-0" />

            <div className="relative z-10 w-full max-w-sm">
              <div className="bg-white/8 backdrop-blur-md rounded-lg p-5 border border-white/15 hover:-translate-y-1 transition-transform duration-500">
                <div className="flex items-center justify-between mb-5">
                  <i className="fa-solid fa-shield-halved text-[#00E5FF]" />
                  <span className="text-white/60 text-xs">Seguridad SBS</span>
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

          {/* ── Right Content ──────────────────────────────────────────── */}
          <div className="w-full lg:w-1/2 p-8 sm:p-10 flex flex-col justify-center bg-white dark:bg-[#1E293B]">
            <div className="max-w-md w-full mx-auto">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-[#00E5FF] dark:hover:text-[#00E5FF] transition-colors mb-7 group"
              >
                <i className="fa-solid fa-arrow-left mr-2 text-xs group-hover:-translate-x-1 transition-transform" />
                Volver a Iniciar Sesión
              </Link>

              <Suspense fallback={
                <div className="flex justify-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-[#00E5FF]" />
                </div>
              }>
                <ResetPasswordContent />
              </Suspense>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-6 px-4 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          © {CURRENT_YEAR} Crevo. Regulado por la SBS. Conexión segura 256-bits.
        </p>
      </footer>
    </div>
  )
}
