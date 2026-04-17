import { z } from 'zod'

/**
 * Zod schema for the "open ticket" form.
 *
 * Length bounds mirror the backend validations so users see the same
 * constraints client- and server-side:
 *   - subject: 5..200 chars (short headline for the admin queue)
 *   - body:   20..5000 chars (enough room for a full description, capped
 *             to keep the admin inbox readable and prevent accidental
 *             paste bombs).
 */
export const openSauTicketSchema = z.object({
  category: z.enum(['QUERY', 'SUGGESTION', 'COMPLAINT']),
  subject: z
    .string()
    .trim()
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(200, 'El asunto no puede superar los 200 caracteres'),
  body: z
    .string()
    .trim()
    .min(20, 'Describe tu caso con al menos 20 caracteres')
    .max(5000, 'El mensaje no puede superar los 5 000 caracteres'),
  // Optional — backend accepts a UUID; we leave empty string as unset.
  loanId: z.string().trim().optional(),
})

export type OpenSauTicketInput = z.infer<typeof openSauTicketSchema>
