'use client'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'
import {
  Loader2,
  User,
  IdCard,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCheck,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'
import { Checkbox } from '@/shared/ui/checkbox'
import { registerSchema, type RegisterInput } from '../lib/authSchemas'
import { useAuthStore } from '../model/useAuthStore'
import { legalRepository, LEGAL_DOCUMENT_TYPES, LEGAL_VERSIONS, LEGAL_URLS } from '@/features/legal'

const inputCls =
  'w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-[#0A192F] dark:text-[#F1F5F9] text-sm placeholder-gray-400 dark:placeholder-[#64748B] focus:outline-none focus:border-[#0A192F] dark:focus:border-[#D4AF37] focus:ring-2 focus:ring-[#0A192F]/20 dark:focus:ring-[#D4AF37]/20 focus:bg-white dark:focus:bg-[#0F172A] transition-all'

export function RegisterForm() {
  const router = useRouter()
  const { register: registerUser } = useAuthStore()
  const [showPass, setShowPass] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dni: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false as unknown as true,
    },
  })

  const onSubmit = async (values: RegisterInput) => {
    try {
      const { confirmPassword: _, acceptTerms: __, ...dto } = values
      await registerUser(dto)

      // Record the three legal acceptances bundled in the registration checkbox.
      // Best-effort: the user is already registered; if these fail we still proceed
      // (the auditMiddleware on the backend logs the failure).
      legalRepository
        .acceptMany([
          { documentType: LEGAL_DOCUMENT_TYPES.TERMS, documentVersion: LEGAL_VERSIONS.TERMS },
          { documentType: LEGAL_DOCUMENT_TYPES.PRIVACY, documentVersion: LEGAL_VERSIONS.PRIVACY },
          {
            documentType: LEGAL_DOCUMENT_TYPES.CREDIT_BUREAU_AUTH,
            documentVersion: LEGAL_VERSIONS.CREDIT_BUREAU_AUTH,
          },
        ])
        .catch(() => {
          /* swallow — do not block the post-register flow */
        })

      toast.success('¡Cuenta creada! Revisa tu email para verificar tu cuenta.')
      router.push('/dashboard')
    } catch (err: unknown) {
      const mensaje = err instanceof Error ? err.message : 'Error al crear la cuenta'

      // "Ya existe una cuenta con este email/DNI" se muestra DEBAJO del campo
      // que corresponde, no sólo como toast: un toast se pierde y no dice cuál
      // de los dos campos hay que corregir.
      //
      // La existencia se comprueba al enviar, a propósito. Validarla mientras
      // se escribe exigiría un endpoint que responda "este DNI ya está
      // registrado" a cualquiera, y eso permite enumerar: con una lista de DNI
      // —que en Perú circulan— se podría averiguar quién tiene un préstamo acá.
      // Ser cliente de una financiera es información privada.
      const campo = /email|correo/i.test(mensaje) ? 'email' : /dni/i.test(mensaje) ? 'dni' : null

      if (campo) {
        setError(campo, { type: 'server', message: mensaje }, { shouldFocus: true })
      }
      toast.error(mensaje)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Row 1: Nombres + Apellidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Nombres
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Juan"
              className={`${inputCls} pl-10`}
              {...register('firstName')}
            />
          </div>
          {errors.firstName && (
            <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Apellidos
          </label>
          <input type="text" placeholder="Pérez" className={inputCls} {...register('lastName')} />
          {errors.lastName && (
            <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Row 2: DNI + Teléfono */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            DNI
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IdCard className="h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Teléfono móvil
          </label>
          <div className="relative flex">
            <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1E293B] text-sm text-gray-500 dark:text-gray-400 rounded-l-lg">
              +51
            </span>
            <input
              type="tel"
              placeholder="999 123 456"
              maxLength={9}
              inputMode="numeric"
              className={`${inputCls} rounded-l-none`}
              {...register('phone')}
            />
          </div>
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      {/* Row 3: Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Correo electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            </div>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              className={`${inputCls} pl-10 pr-10`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPass}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showPass ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Confirmar contraseña
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CheckCheck className="h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className={`${inputCls} pl-10`}
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {/* Password requirements */}
      <div className="bg-gray-50 dark:bg-[#0F172A] p-3 rounded-lg border border-gray-200 dark:border-[#334155]">
        <p className="text-xs text-gray-700 dark:text-gray-300 font-medium mb-1 flex items-center gap-1.5">
          <ShieldCheck
            className="h-3.5 w-3.5 text-[#0A192F] dark:text-[#D4AF37]"
            aria-hidden="true"
          />{' '}
          Requisitos de contraseña:
        </p>
        <ul className="text-xs text-gray-500 dark:text-gray-400 grid grid-cols-2 gap-1 pl-5 list-disc">
          <li>Mínimo 8 caracteres</li>
          <li>Al menos una mayúscula</li>
          <li>Al menos un número</li>
          <li>Un carácter especial (!@#$%)</li>
        </ul>
      </div>

      {/* Terms */}
      <div className="pt-1">
        <div className="flex items-start gap-3">
          <Controller
            name="acceptTerms"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="terms"
                className="mt-0.5"
                checked={!!field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            )}
          />
          <label
            htmlFor="terms"
            className="text-sm text-gray-600 dark:text-gray-400 leading-snug cursor-pointer"
          >
            He leído y acepto los{' '}
            <a
              href={LEGAL_URLS.TERMS}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0A192F] dark:text-[#D4AF37] hover:underline font-medium"
            >
              Términos y Condiciones
            </a>
            , la{' '}
            <a
              href={LEGAL_URLS.PRIVACY}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0A192F] dark:text-[#D4AF37] hover:underline font-medium"
            >
              Política de Privacidad
            </a>{' '}
            y autorizo a Crevo a consultar mi historial crediticio en las centrales de riesgo
            (Equifax, Sentinel u otras) para evaluar mis solicitudes de préstamo.
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-xs text-red-500 mt-1.5 ml-7">{errors.acceptTerms.message}</p>
        )}
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 cursor-pointer bg-[#0A192F] hover:bg-[#112240] hover:opacity-90 text-white font-semibold rounded-lg transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creando cuenta...
            </>
          ) : (
            <>
              Crear Cuenta <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
