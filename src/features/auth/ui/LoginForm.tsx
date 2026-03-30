'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Checkbox } from '@/shared/ui/checkbox'
import { loginSchema, type LoginInput } from '../lib/authSchemas'
import { useAuthStore } from '../model/useAuthStore'

const inputCls =
  'w-full px-5 py-3 rounded-lg border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0A192F] dark:text-[#F1F5F9] text-[0.95rem] placeholder-gray-400 dark:placeholder-[#64748B] focus:outline-none focus:border-[#0A192F] dark:focus:border-[#D4AF37] focus:ring-[3px] focus:ring-[#0A192F]/10 dark:focus:ring-[#D4AF37]/15 transition-all'

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [showPass, setShowPass] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginInput) => {
    try {
      await login(values.email, values.password)
      router.push('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Credenciales incorrectas')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Email</label>
        <input
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          className={inputCls}
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1">
            <i className="fa-solid fa-circle-exclamation" /> {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Contraseña</label>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            placeholder="Tu contraseña"
            autoComplete="current-password"
            className={`${inputCls} pr-12`}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPass(p => !p)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <i className={`fa-regular ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} />
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-1">
            <i className="fa-solid fa-circle-exclamation" /> {errors.password.message}
          </p>
        )}
      </div>

      {/* Remember + Forgot */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox />
          <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">Recordarme</span>
        </label>
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-[#0A192F] dark:text-[#D4AF37] hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 cursor-pointer rounded-lg bg-[#0A192F] text-[#D4AF37] font-bold text-base hover:bg-[#112240] hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Iniciando sesión...</>
          ) : (
            <><span>Iniciar Sesión</span><i className="fa-solid fa-arrow-right text-sm" /></>
          )}
        </button>
      </div>
    </form>
  )
}
