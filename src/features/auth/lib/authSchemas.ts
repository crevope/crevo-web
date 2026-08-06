import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'Mínimo 2 caracteres').max(50),
    lastName: z.string().min(2, 'Mínimo 2 caracteres').max(50),
    dni: z
      .string()
      .length(8, 'El DNI debe tener exactamente 8 dígitos')
      .regex(/^\d+$/, 'Solo números'),
    // Móvil peruano: 9 dígitos empezando en 9. Antes esto era min(9).max(12) y
    // por eso entró a producción un número con el prefijo +51 pegado adelante.
    // El backend normaliza el +51 (ver el VO Phone), pero el formulario debe
    // pedir el formato limpio: es más claro para quien lo llena.
    phone: z
      .string()
      .length(9, 'El celular debe tener exactamente 9 dígitos')
      .regex(/^9\d{8}$/, 'Debe empezar en 9 y contener solo números'),
    // The backend re-validates the date and the age (see BirthDate); this only
    // surfaces the error on the field without a round trip.
    birthDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ingresa tu fecha de nacimiento')
      .refine((v) => {
        const d = new Date(`${v}T00:00:00Z`)
        return !Number.isNaN(d.getTime()) && d.getTime() <= Date.now()
      }, 'La fecha no es válida')
      .refine((v) => {
        const [y, m, d] = v.split('-').map(Number)
        const today = new Date()
        let age = today.getUTCFullYear() - y!
        const monthDiff = today.getUTCMonth() + 1 - m!
        const dayDiff = today.getUTCDate() - d!
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age -= 1
        return age >= 21
      }, 'Debes tener al menos 21 años para registrarte'),
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({
        message:
          'Debes aceptar los Términos, la Política de Privacidad y la consulta a centrales de riesgo para crear tu cuenta',
      }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
