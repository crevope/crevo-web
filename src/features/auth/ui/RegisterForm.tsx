'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Checkbox } from '@/shared/ui/checkbox'
import { registerSchema, type RegisterInput } from '../lib/authSchemas'
import { useAuthStore } from '../model/useAuthStore'

const inputCls =
  'w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[#0A192F] dark:text-[#F1F5F9] text-sm placeholder-gray-400 dark:placeholder-[#64748B] focus:outline-none focus:border-[#0A192F] dark:focus:border-[#D4AF37] focus:ring-2 focus:ring-[#0A192F]/20 dark:focus:ring-[#D4AF37]/20 focus:bg-white dark:focus:bg-[#0F172A] transition-all'

export function RegisterForm() {
  const router = useRouter()
  const { register: registerUser } = useAuthStore()
  const [showPass, setShowPass] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', dni: '', phone: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (values: RegisterInput) => {
    try {
      const { confirmPassword: _, ...dto } = values
      await registerUser(dto)
      toast.success('¡Cuenta creada! Revisa tu email para verificar tu cuenta.')
      router.push('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear la cuenta')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* Row 1: Nombres + Apellidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nombres</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fa-regular fa-user text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Juan"
              className={`${inputCls} pl-10`}
              {...register('firstName')}
            />
          </div>
          {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Apellidos</label>
          <input
            type="text"
            placeholder="Pérez"
            className={inputCls}
            {...register('lastName')}
          />
          {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
        </div>
      </div>

      {/* Row 2: DNI + Teléfono */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">DNI</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fa-regular fa-id-card text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="12345678"
              maxLength={8}
              className={`${inputCls} pl-10`}
              {...register('dni')}
            />
          </div>
          {errors.dni && <p className="text-xs text-red-500 mt-1">{errors.dni.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Teléfono móvil</label>
          <div className="relative flex">
            <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1E293B] text-sm text-gray-500 dark:text-gray-400 rounded-l-lg">
              +51
            </span>
            <input
              type="tel"
              placeholder="999 123 456"
              className={`${inputCls} rounded-l-none`}
              {...register('phone')}
            />
          </div>
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      {/* Row 3: Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Correo electrónico</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fa-regular fa-envelope text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            className={`${inputCls} pl-10`}
            {...register('email')}
          />
        </div>
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
      </div>

      {/* Row 4: Password + Confirm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contraseña</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fa-solid fa-lock text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              className={`${inputCls} pl-10 pr-10`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <i className={`fa-regular ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirmar contraseña</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fa-solid fa-check-double text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className={`${inputCls} pl-10`}
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      {/* Password requirements */}
      <div className="bg-gray-50 dark:bg-[#0F172A] p-3 rounded-lg border border-gray-200 dark:border-[#334155]">
        <p className="text-xs text-gray-700 dark:text-gray-300 font-medium mb-1 flex items-center gap-1.5">
          <i className="fa-solid fa-shield-halved text-[#0A192F] dark:text-[#D4AF37]" /> Requisitos de contraseña:
        </p>
        <ul className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-2 gap-1 pl-5 list-disc">
          <li>Mínimo 8 caracteres</li>
          <li>Al menos una mayúscula</li>
          <li>Al menos un número</li>
          <li>Un carácter especial (!@#$%)</li>
        </ul>
      </div>

      {/* Terms */}
      <div className="flex items-start gap-3 pt-1">
        <Checkbox id="terms" className="mt-0.5" />
        <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 leading-tight cursor-pointer">
          He leído y acepto los{' '}
          <a href="#" className="text-[#0A192F] dark:text-[#D4AF37] hover:underline font-medium">Términos y Condiciones</a>,
          la{' '}
          <a href="#" className="text-[#0A192F] dark:text-[#D4AF37] hover:underline font-medium">Política de Privacidad</a>
          {' '}y autorizo la consulta de mi historial crediticio en la SBS.
        </label>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 cursor-pointer bg-[#0A192F] hover:bg-[#112240] hover:opacity-90 text-white font-semibold rounded-lg transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Creando cuenta...</>
          ) : (
            <>Crear Cuenta <i className="fa-solid fa-arrow-right text-sm" /></>
          )}
        </button>
      </div>
    </form>
  )
}
