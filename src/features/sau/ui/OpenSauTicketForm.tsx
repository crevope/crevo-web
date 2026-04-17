'use client'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import { sanitizeUserText } from '@/shared/lib/sanitize'
import { openSauTicketSchema, type OpenSauTicketInput } from '../lib/sauSchemas'
import { SAU_CATEGORY_LABELS, SAU_CATEGORY_DESCRIPTIONS, SAU_SLA_DAYS } from '../lib/sauConstants'
import { sauRepository } from '../api/sauRepository'
import type { SauTicketView } from '../model/types'

const fieldCls =
  'h-auto px-4 py-3 rounded-lg border-gray-200 dark:border-[#334155] bg-brand-surface text-brand-text placeholder-gray-400 dark:placeholder-[#64748B] focus-visible:border-brand-primary dark:focus-visible:border-brand-secondary focus-visible:ring-brand-primary/20 dark:focus-visible:ring-brand-secondary/20 focus-visible:bg-brand-card'

const labelCls = 'mb-1.5 text-sm text-gray-700 dark:text-gray-300'
const errorCls = 'text-xs text-red-500 mt-1'

interface Props {
  /** Called with the fresh ticket after a successful open so the parent
   *  can swap the form for a receipt / redirect. */
  onOpened: (ticket: SauTicketView) => void
}

export function OpenSauTicketForm({ onOpened }: Readonly<Props>) {
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<OpenSauTicketInput>({
    resolver: zodResolver(openSauTicketSchema),
    defaultValues: { category: 'QUERY', subject: '', body: '', loanId: '' },
  })

  const category = watch('category')

  const onSubmit = async (values: OpenSauTicketInput) => {
    setSubmitting(true)
    try {
      const ticket = await sauRepository.open({
        category: values.category,
        subject: sanitizeUserText(values.subject),
        body: sanitizeUserText(values.body),
        loanId: values.loanId?.trim() || undefined,
      })
      toast.success(`Ticket ${ticket.ticketCode} creado. Revisa tu correo.`)
      onOpened(ticket)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No pudimos registrar tu solicitud')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="bg-brand-card rounded-lg border-gray-100 dark:border-white/6 p-6 sm:p-8 shadow-none">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label className={labelCls}>Tipo de solicitud</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={`w-full ${fieldCls}`} aria-label="Tipo de solicitud">
                  <SelectValue>{SAU_CATEGORY_LABELS[field.value]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="QUERY">{SAU_CATEGORY_LABELS.QUERY}</SelectItem>
                  <SelectItem value="SUGGESTION">{SAU_CATEGORY_LABELS.SUGGESTION}</SelectItem>
                  <SelectItem value="COMPLAINT">{SAU_CATEGORY_LABELS.COMPLAINT}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
            {SAU_CATEGORY_DESCRIPTIONS[category]}
          </p>
        </div>

        <div>
          <Label htmlFor="subject" className={labelCls}>Asunto</Label>
          <Input
            id="subject"
            type="text"
            placeholder="Ej.: No puedo ver mi contrato firmado"
            className={fieldCls}
            {...register('subject')}
          />
          {errors.subject && <p className={errorCls}>{errors.subject.message}</p>}
        </div>

        <div>
          <Label htmlFor="body" className={labelCls}>Descripción</Label>
          <Textarea
            id="body"
            rows={6}
            placeholder="Cuéntanos qué pasó, qué esperabas y qué estás viendo. Incluye fechas, montos o referencias si las tienes."
            className={`${fieldCls} resize-none`}
            {...register('body')}
          />
          {errors.body && <p className={errorCls}>{errors.body.message}</p>}
        </div>

        <div>
          <Label htmlFor="loanId" className={labelCls}>
            ID del préstamo <span className="text-gray-400 font-normal">— opcional</span>
          </Label>
          <Input
            id="loanId"
            type="text"
            placeholder="UUID del préstamo si aplica"
            className={`${fieldCls} font-mono`}
            {...register('loanId')}
          />
          {errors.loanId && <p className={errorCls}>{errors.loanId.message}</p>}
        </div>

        <div className="pt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
            Responderemos tu caso en un plazo máximo de <strong>{SAU_SLA_DAYS} días calendario</strong>{' '}
            conforme a la Circular SBS G-184-2015. Te notificaremos por correo y en la app cuando
            tengamos una respuesta.
          </p>
          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Enviando...</>
            ) : (
              <>Enviar solicitud <Send className="h-4 w-4" aria-hidden="true" /></>
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}
