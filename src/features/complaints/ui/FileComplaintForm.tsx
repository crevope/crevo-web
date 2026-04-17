'use client'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
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
import { fileComplaintSchema, type FileComplaintInput } from '../lib/complaintsSchemas'
import {
  CLAIM_TYPES,
  CLAIM_TYPE_DESCRIPTIONS,
  CLAIM_TYPE_LABELS,
  CONSUMER_DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  PRODUCT_TYPES,
  PRODUCT_TYPE_LABELS,
} from '../lib/complaintsConstants'
import { complaintsRepository, type FiledComplaintReceipt } from '../api/complaintsRepository'

// Crevo brand override for shadcn Input / Textarea. Uses the stable brand
// tokens declared in globals.css so the navy (light) / gold (dark) focus
// palette and surface colors stay in sync across the whole product.
const fieldBrandCls =
  'h-auto px-4 py-3 rounded-lg border-gray-200 dark:border-[#334155] bg-brand-surface text-brand-text placeholder-gray-400 dark:placeholder-[#64748B] focus-visible:border-brand-primary dark:focus-visible:border-brand-secondary focus-visible:ring-brand-primary/20 dark:focus-visible:ring-brand-secondary/20 focus-visible:bg-brand-card'

const labelCls = 'mb-1.5 text-sm text-gray-700 dark:text-gray-300'
const errorCls = 'text-xs text-red-500 mt-1'

const sectionCardCls =
  'bg-brand-card rounded-lg border-gray-100 dark:border-white/6 p-6 sm:p-8 shadow-none'
const sectionTitleCls =
  'text-lg font-semibold text-brand-text mb-1'
const sectionDescCls =
  'text-sm text-gray-500 dark:text-gray-400 mb-6'

interface Props {
  /** Called with the server receipt after a successful filing so the page can
   *  swap to the confirmation view. The document number the consumer typed is
   *  passed alongside so the "Consultar" link in the receipt can pre-fill it
   *  without us reading the DOM. */
  onFiled: (receipt: FiledComplaintReceipt, documentNumber: string) => void
}

export function FileComplaintForm({ onFiled }: Props) {
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FileComplaintInput>({
    resolver: zodResolver(fileComplaintSchema),
    defaultValues: {
      consumerFirstName: '',
      consumerLastName: '',
      consumerDocumentType: CONSUMER_DOCUMENT_TYPES.DNI,
      consumerDocumentNumber: '',
      consumerEmail: '',
      consumerPhone: '',
      consumerAddress: '',
      consumerIsMinor: false,
      guardianFullName: '',
      guardianDocumentNumber: '',
      productType: PRODUCT_TYPES.SERVICE,
      productDescription: '',
      claimedAmount: undefined as unknown as number | undefined,
      loanId: '',
      claimType: CLAIM_TYPES.CLAIM,
      claimDetail: '',
      consumerRequest: '',
    },
  })

  const isMinor = watch('consumerIsMinor')
  const claimType = watch('claimType')

  const onSubmit = async (values: FileComplaintInput) => {
    setSubmitting(true)
    try {
      // Sanitize every free-form text field before it hits the wire.
      // The backend re-validates but we strip BiDi overrides + control
      // chars client-side so a legitimate paste doesn't surprise us later
      // when it renders in the admin queue or the confirmation email.
      const receipt = await complaintsRepository.file({
        consumerFirstName: sanitizeUserText(values.consumerFirstName),
        consumerLastName: sanitizeUserText(values.consumerLastName),
        consumerDocumentType: values.consumerDocumentType,
        consumerDocumentNumber: values.consumerDocumentNumber,
        consumerEmail: values.consumerEmail,
        consumerPhone: values.consumerPhone,
        consumerAddress: sanitizeUserText(values.consumerAddress),
        consumerIsMinor: values.consumerIsMinor,
        guardianFullName: values.guardianFullName ? sanitizeUserText(values.guardianFullName) || undefined : undefined,
        guardianDocumentNumber: values.guardianDocumentNumber?.trim() || undefined,
        productType: values.productType,
        productDescription: sanitizeUserText(values.productDescription),
        claimedAmount: values.claimedAmount,
        loanId: values.loanId?.trim() || undefined,
        claimType: values.claimType,
        claimDetail: sanitizeUserText(values.claimDetail),
        consumerRequest: sanitizeUserText(values.consumerRequest),
      })
      toast.success('Reclamo registrado correctamente. Revisa tu correo.')
      onFiled(receipt, values.consumerDocumentNumber.trim())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No pudimos registrar tu reclamo')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* ── Consumer data ──────────────────────────────────────────────── */}
      <Card className={sectionCardCls}>
        <h2 className={sectionTitleCls}>1. Datos del consumidor</h2>
        <p className={sectionDescCls}>
          Información obligatoria según el formato de la Hoja de Reclamación del INDECOPI
          (D.S. N° 011-2011-PCM).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="firstName" className={labelCls}>Nombres</Label>
            <Input id="firstName" type="text" autoComplete="given-name" className={fieldBrandCls} {...register('consumerFirstName')} />
            {errors.consumerFirstName && <p className={errorCls}>{errors.consumerFirstName.message}</p>}
          </div>
          <div>
            <Label htmlFor="lastName" className={labelCls}>Apellidos</Label>
            <Input id="lastName" type="text" autoComplete="family-name" className={fieldBrandCls} {...register('consumerLastName')} />
            {errors.consumerLastName && <p className={errorCls}>{errors.consumerLastName.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
          <div>
            <Label className={labelCls}>Tipo de documento</Label>
            <Controller
              name="consumerDocumentType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={`w-full ${fieldBrandCls}`}
                    aria-label="Tipo de documento"
                  >
                    <SelectValue>{DOCUMENT_TYPE_LABELS[field.value]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CONSUMER_DOCUMENT_TYPES).map((v) => (
                      <SelectItem key={v} value={v}>{DOCUMENT_TYPE_LABELS[v]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="docNumber" className={labelCls}>Número de documento</Label>
            <Input id="docNumber" type="text" className={fieldBrandCls} {...register('consumerDocumentNumber')} />
            {errors.consumerDocumentNumber && <p className={errorCls}>{errors.consumerDocumentNumber.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <div>
            <Label htmlFor="email" className={labelCls}>Correo electrónico</Label>
            <Input id="email" type="email" autoComplete="email" className={fieldBrandCls} {...register('consumerEmail')} />
            {errors.consumerEmail && <p className={errorCls}>{errors.consumerEmail.message}</p>}
          </div>
          <div>
            <Label htmlFor="phone" className={labelCls}>Teléfono</Label>
            <Input id="phone" type="tel" autoComplete="tel" className={fieldBrandCls} {...register('consumerPhone')} />
            {errors.consumerPhone && <p className={errorCls}>{errors.consumerPhone.message}</p>}
          </div>
        </div>

        <div className="mt-5">
          <Label htmlFor="address" className={labelCls}>Domicilio</Label>
          <Input id="address" type="text" autoComplete="street-address" className={fieldBrandCls} {...register('consumerAddress')} />
          {errors.consumerAddress && <p className={errorCls}>{errors.consumerAddress.message}</p>}
        </div>

        {/* Minor + guardian */}
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-start gap-3">
            <Controller
              name="consumerIsMinor"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="is-minor"
                  className="mt-0.5"
                  checked={!!field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              )}
            />
            <Label htmlFor="is-minor" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer font-normal leading-snug">
              El consumidor es menor de edad y presenta el reclamo a través de su padre, madre o tutor.
            </Label>
          </div>

          {isMinor && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <div>
                <Label htmlFor="guardianName" className={labelCls}>Nombre completo del representante</Label>
                <Input id="guardianName" type="text" className={fieldBrandCls} {...register('guardianFullName')} />
                {errors.guardianFullName && <p className={errorCls}>{errors.guardianFullName.message}</p>}
              </div>
              <div>
                <Label htmlFor="guardianDoc" className={labelCls}>Documento del representante</Label>
                <Input id="guardianDoc" type="text" className={fieldBrandCls} {...register('guardianDocumentNumber')} />
                {errors.guardianDocumentNumber && <p className={errorCls}>{errors.guardianDocumentNumber.message}</p>}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ── Product / service ──────────────────────────────────────────── */}
      <Card className={sectionCardCls}>
        <h2 className={sectionTitleCls}>2. Identificación del producto o servicio</h2>
        <p className={sectionDescCls}>Describe con claridad sobre qué estás presentando el reclamo.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <Label className={labelCls}>Tipo</Label>
            <Controller
              name="productType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className={`w-full ${fieldBrandCls}`} aria-label="Tipo de producto">
                    <SelectValue>{PRODUCT_TYPE_LABELS[field.value]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PRODUCT_TYPES).map((v) => (
                      <SelectItem key={v} value={v}>{PRODUCT_TYPE_LABELS[v]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="productDesc" className={labelCls}>Descripción del producto o servicio</Label>
            <Input
              id="productDesc"
              type="text"
              className={fieldBrandCls}
              placeholder="Ej.: Préstamo personal #A1B2C3D4"
              {...register('productDescription')}
            />
            {errors.productDescription && <p className={errorCls}>{errors.productDescription.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <div>
            <Label htmlFor="claimedAmount" className={labelCls}>
              Monto reclamado (S/) <span className="text-gray-400 font-normal">— opcional</span>
            </Label>
            <Input
              id="claimedAmount"
              type="number"
              step="0.01"
              min={0}
              className={fieldBrandCls}
              {...register('claimedAmount' as const)}
            />
            {errors.claimedAmount && <p className={errorCls}>{errors.claimedAmount.message as string}</p>}
          </div>
          <div>
            <Label htmlFor="loanId" className={labelCls}>
              ID del préstamo <span className="text-gray-400 font-normal">— opcional</span>
            </Label>
            <Input id="loanId" type="text" className={fieldBrandCls} placeholder="UUID si aplica" {...register('loanId')} />
            {errors.loanId && <p className={errorCls}>{errors.loanId.message}</p>}
          </div>
        </div>
      </Card>

      {/* ── Claim body ─────────────────────────────────────────────────── */}
      <Card className={sectionCardCls}>
        <h2 className={sectionTitleCls}>3. Detalle del reclamo o queja</h2>
        <p className={sectionDescCls}>
          El INDECOPI distingue entre <strong>reclamo</strong> (afecta al producto o servicio) y{' '}
          <strong>queja</strong> (se refiere a la atención recibida).
        </p>

        {/* Radio-card custom UI — allowed exception: radio controls with rich
            card content wrap a visually-hidden native radio inside the label. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          {Object.values(CLAIM_TYPES).map((v) => (
            <label
              key={v}
              className={`relative flex flex-col gap-2 p-4 rounded-lg border cursor-pointer transition-all ${claimType === v
                  ? 'border-brand-primary dark:border-brand-secondary bg-brand-surface'
                  : 'border-gray-200 dark:border-[#334155] hover:border-gray-300 dark:hover:border-[#475569]'
                }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  value={v}
                  {...register('claimType')}
                  className="accent-brand-primary dark:accent-brand-secondary"
                />
                <span className="font-semibold text-brand-text">{CLAIM_TYPE_LABELS[v]}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {CLAIM_TYPE_DESCRIPTIONS[v]}
              </p>
            </label>
          ))}
        </div>

        <div>
          <Label htmlFor="claimDetail" className={labelCls}>Detalle</Label>
          <Textarea
            id="claimDetail"
            rows={5}
            className={`${fieldBrandCls} resize-none`}
            placeholder="Explícanos qué pasó, cuándo y cómo. Incluye fechas, montos y referencias si las tienes."
            {...register('claimDetail')}
          />
          {errors.claimDetail && <p className={errorCls}>{errors.claimDetail.message}</p>}
        </div>

        <div className="mt-5">
          <Label htmlFor="consumerRequest" className={labelCls}>Pedido concreto</Label>
          <Textarea
            id="consumerRequest"
            rows={5}
            className={`${fieldBrandCls} resize-none`}
            placeholder="¿Qué solución esperas? (ej.: devolución del cobro, corrección del cronograma, disculpa formal)"
            {...register('consumerRequest')}
          />
          {errors.consumerRequest && <p className={errorCls}>{errors.consumerRequest.message}</p>}
        </div>
      </Card>

      {/* ── Submit ─────────────────────────────────────────────────────── */}
      <Card className={sectionCardCls}>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Al enviar, te entregaremos un código público de seguimiento y te responderemos en un plazo
          máximo de <strong>15 días hábiles</strong>.
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white shadow-lg"
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Registrando...</>
          ) : (
            <>Enviar reclamo <Send className="h-4 w-4" aria-hidden="true" /></>
          )}
        </Button>
      </Card>
    </form>
  )
}
