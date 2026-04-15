import { z } from 'zod'
import {
  CLAIM_TYPES,
  CONSUMER_DOCUMENT_TYPES,
  PRODUCT_TYPES,
} from './complaintsConstants'

/**
 * Validation for the filing form. Rules encode what INDECOPI expects (all
 * consumer-identity fields mandatory) plus a conditional branch for minors
 * that enforces the guardian block.
 */

const trimmed = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} es requerido`)
    .max(max, `${label} es demasiado largo`)

// Document number: loose by design — DNI is 8 digits, CE/Passport vary, RUC
// is 11. A stricter per-type rule forces us to pick a doc type before typing,
// which hurts UX; INDECOPI just needs the number to identify the consumer.
const documentNumber = z
  .string()
  .trim()
  .min(6, 'El número de documento es demasiado corto')
  .max(20, 'El número de documento es demasiado largo')
  .regex(/^[A-Za-z0-9-]+$/, 'Solo letras, números y guiones')

// Peruvian phone: accept the most common shapes — +51 prefix optional, 9
// digits for móvil, 7–8 for fijo. The backend stores verbatim.
const phone = z
  .string()
  .trim()
  .min(6, 'Teléfono inválido')
  .max(20, 'Teléfono inválido')
  .regex(/^[0-9+\-\s()]+$/, 'Solo números y símbolos telefónicos')

export const fileComplaintSchema = z
  .object({
    consumerFirstName: trimmed(2, 80, 'Los nombres'),
    consumerLastName: trimmed(2, 80, 'Los apellidos'),

    consumerDocumentType: z.nativeEnum(CONSUMER_DOCUMENT_TYPES),
    consumerDocumentNumber: documentNumber,

    consumerEmail: z
      .string()
      .trim()
      .min(1, 'El correo es requerido')
      .email('Correo inválido')
      .max(120, 'El correo es demasiado largo'),
    consumerPhone: phone,
    consumerAddress: trimmed(5, 250, 'La dirección'),

    consumerIsMinor: z.boolean().default(false),
    guardianFullName: z.string().trim().max(160).optional().or(z.literal('')),
    guardianDocumentNumber: z.string().trim().max(20).optional().or(z.literal('')),

    productType: z.nativeEnum(PRODUCT_TYPES),
    productDescription: trimmed(5, 250, 'La descripción del producto o servicio'),
    // Allow empty string in the UI, convert to undefined before sending.
    claimedAmount: z
      .union([z.string(), z.number()])
      .optional()
      .transform((v) => {
        if (v === undefined || v === null || v === '') return undefined
        const n = typeof v === 'number' ? v : Number(v)
        return Number.isFinite(n) ? n : undefined
      })
      .refine((n) => n === undefined || n >= 0, 'El monto reclamado no puede ser negativo'),
    loanId: z.string().trim().uuid().optional().or(z.literal('')),

    claimType: z.nativeEnum(CLAIM_TYPES),
    claimDetail: trimmed(20, 2000, 'El detalle del reclamo'),
    consumerRequest: trimmed(10, 1000, 'El pedido del consumidor'),
  })
  .superRefine((data, ctx) => {
    if (data.consumerIsMinor) {
      if (!data.guardianFullName || data.guardianFullName.trim().length < 2) {
        ctx.addIssue({
          code: 'custom',
          path: ['guardianFullName'],
          message: 'Nombre del representante requerido cuando el consumidor es menor de edad',
        })
      }
      if (!data.guardianDocumentNumber || data.guardianDocumentNumber.trim().length < 6) {
        ctx.addIssue({
          code: 'custom',
          path: ['guardianDocumentNumber'],
          message: 'Documento del representante requerido cuando el consumidor es menor de edad',
        })
      }
    }
  })

export type FileComplaintInput = z.infer<typeof fileComplaintSchema>

/** Small schema for the public consulta form — code + document number. */
export const consultComplaintSchema = z.object({
  claimCode: z
    .string()
    .trim()
    .min(1, 'Ingresa el código de reclamo')
    .max(40, 'Código demasiado largo'),
  documentNumber: documentNumber,
})

export type ConsultComplaintInput = z.infer<typeof consultComplaintSchema>
