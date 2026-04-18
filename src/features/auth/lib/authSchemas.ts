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
    phone: z.string().min(9, 'Teléfono inválido').max(12),
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
