'use client'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { Check, CircleCheck, Copy, ArrowRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import type { FiledComplaintReceipt } from '../api/complaintsRepository'

interface Props {
  receipt: FiledComplaintReceipt
  /** Document number the consumer used when filing — passed through so the
   *  "Consultar" link can pre-fill the second factor and open the public
   *  lookup straight to the detail view. */
  documentNumber: string
}

export function ComplaintFiledReceiptCard({ receipt, documentNumber }: Props) {
  const [copied, setCopied] = useState(false)

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(receipt.claimCode)
      setCopied(true)
      toast.success('Código copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('No pudimos copiar el código. Copia manualmente.')
    }
  }

  const filedAt = new Date(receipt.filedAt).toLocaleString('es-PE', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Lima',
  })
  const slaDeadline = new Date(receipt.slaDeadline).toLocaleDateString('es-PE', {
    dateStyle: 'long',
    timeZone: 'America/Lima',
  })

  const consultHref =
    `/libro-de-reclamaciones/consulta/${encodeURIComponent(receipt.claimCode)}` +
    `?documentNumber=${encodeURIComponent(documentNumber)}`

  return (
    <Card className="bg-brand-card rounded-lg border-gray-100 dark:border-white/6 p-8 sm:p-10 text-center shadow-none">
      <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-5">
        <Check className="h-7 w-7 text-green-600 dark:text-green-400" aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-semibold text-brand-text mb-2">Reclamo registrado</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
        Guarda este código y consérvalo junto con el número de documento que usaste al presentar tu
        reclamo — son los dos datos que necesitas para hacer seguimiento.
      </p>

      {/* Code card — uses brand-primary (navy) as the strong callout surface */}
      <div className="mt-8 inline-flex flex-col items-center gap-2 px-6 py-5 rounded-xl bg-brand-primary text-white">
        <span className="text-xs uppercase tracking-wider text-white/50">Código de reclamo</span>
        <code className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-brand-secondary">
          {receipt.claimCode}
        </code>
        <Button
          type="button"
          onClick={copyCode}
          size="sm"
          variant="ghost"
          className="mt-1 bg-white/10 hover:bg-white/20 text-white/90 hover:text-white"
        >
          {copied ? (
            <CircleCheck className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? 'Copiado' : 'Copiar código'}
        </Button>
      </div>

      {/* Meta */}
      <dl className="mt-8 max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        <Card className="bg-brand-surface rounded-lg p-4 border-gray-100 dark:border-white/5 shadow-none">
          <dt className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
            Presentado
          </dt>
          <dd className="text-sm text-brand-text font-medium">{filedAt}</dd>
        </Card>
        <Card className="bg-brand-surface rounded-lg p-4 border-gray-100 dark:border-white/5 shadow-none">
          <dt className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
            Plazo de respuesta
          </dt>
          <dd className="text-sm text-brand-text font-medium">{slaDeadline}</dd>
        </Card>
      </dl>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          asChild
          size="lg"
          className="bg-brand-secondary hover:bg-brand-secondary-hover text-brand-primary font-semibold"
        >
          <Link href={consultHref}>
            Consultar mi reclamo <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="border-gray-200 dark:border-[#334155] text-gray-700 dark:text-gray-300 hover:bg-brand-surface"
        >
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </Card>
  )
}
