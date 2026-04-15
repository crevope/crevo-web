'use client'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { consultComplaintSchema, type ConsultComplaintInput } from '../lib/complaintsSchemas'
import { complaintsRepository, type PublicComplaintView } from '../api/complaintsRepository'

interface Props {
  /** Pre-fill values (e.g. when linked from the receipt card with `?documentNumber=…`). */
  defaultValues?: Partial<ConsultComplaintInput>
  /** Fires when the backend returns the complaint — page swaps to the detail view. */
  onResult: (complaint: PublicComplaintView) => void
  /** If true, auto-submit as soon as both fields are present (used after deep-link). */
  autoSubmit?: boolean
}

const fieldBrandCls =
  'h-auto px-4 py-3 rounded-lg border-gray-200 dark:border-[#334155] bg-brand-surface text-brand-text placeholder-gray-400 dark:placeholder-[#64748B] focus-visible:border-brand-primary dark:focus-visible:border-brand-secondary focus-visible:ring-brand-primary/20 dark:focus-visible:ring-brand-secondary/20 focus-visible:bg-brand-card'

const labelCls = 'mb-1.5 text-sm text-gray-700 dark:text-gray-300'
const errorCls = 'text-xs text-red-500 mt-1'

export function ConsultComplaintForm({ defaultValues, onResult, autoSubmit }: Props) {
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConsultComplaintInput>({
    resolver: zodResolver(consultComplaintSchema),
    defaultValues: {
      claimCode: defaultValues?.claimCode ?? '',
      documentNumber: defaultValues?.documentNumber ?? '',
    },
  })

  const onSubmit = async (values: ConsultComplaintInput) => {
    setSubmitting(true)
    try {
      const view = await complaintsRepository.consult(
        values.claimCode.trim(),
        values.documentNumber.trim(),
      )
      onResult(view)
    } catch (err) {
      // Backend returns a generic 404 to prevent enumeration — mirror that here.
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : 'No encontramos un reclamo con esos datos. Revisa el código y el documento.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Auto-submit once on mount when invoked with both values pre-filled.
  // Guarded by a ref so React Strict Mode's double-invoke doesn't fire the
  // lookup twice against the (rate-limited) backend.
  const autoSubmittedRef = useRef(false)
  useEffect(() => {
    if (autoSubmittedRef.current) return
    if (autoSubmit && defaultValues?.claimCode && defaultValues?.documentNumber) {
      autoSubmittedRef.current = true
      void handleSubmit(onSubmit)()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card className="bg-brand-card rounded-lg border-gray-100 dark:border-white/6 p-6 sm:p-8 shadow-none">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label htmlFor="claimCode" className={labelCls}>Código de reclamo</Label>
          <Input
            id="claimCode"
            type="text"
            autoComplete="off"
            placeholder="CRV-YYYYMMDD-XXXXXXXX"
            className={`${fieldBrandCls} font-mono tracking-wider`}
            {...register('claimCode')}
          />
          {errors.claimCode && <p className={errorCls}>{errors.claimCode.message}</p>}
        </div>

        <div>
          <Label htmlFor="documentNumber" className={labelCls}>Número de documento</Label>
          <Input
            id="documentNumber"
            type="text"
            autoComplete="off"
            placeholder="El mismo que usaste al presentar el reclamo"
            className={fieldBrandCls}
            {...register('documentNumber')}
          />
          {errors.documentNumber && <p className={errorCls}>{errors.documentNumber.message}</p>}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
            Pedimos ambos datos para proteger la privacidad del reclamante — un código por sí solo
            no alcanza para consultar el expediente.
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg"
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Consultando...</>
          ) : (
            <>Consultar reclamo <i className="fa-solid fa-magnifying-glass text-sm" /></>
          )}
        </Button>
      </form>
    </Card>
  )
}
