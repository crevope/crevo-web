'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AuthHeader } from '@/shared/ui/auth-header'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { CURRENT_YEAR } from '@/shared/lib/constants'
import {
  FileComplaintForm,
  ComplaintFiledReceiptCard,
  type FiledComplaintReceipt,
} from '@/features/complaints'

/**
 * Public Libro de Reclamaciones page. Mounted at `/libro-de-reclamaciones` and
 * required by D.S. N° 011-2011-PCM — any consumer, logged in or not, must be
 * able to file a complaint. When filing succeeds we swap in the receipt card
 * and hold on to the document number so the "Consultar" CTA can deep-link with
 * it pre-filled.
 */
export default function LibroDeReclamacionesPage() {
  const [receipt, setReceipt] = useState<FiledComplaintReceipt | null>(null)
  const [documentNumber, setDocumentNumber] = useState<string>('')

  // Scroll to top when the receipt renders so the confirmation is in view.
  useEffect(() => {
    if (receipt) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [receipt])

  const handleFiled = (r: FiledComplaintReceipt, docNumber: string) => {
    setDocumentNumber(docNumber)
    setReceipt(r)
  }

  return (
    <div className="bg-brand-surface min-h-screen flex flex-col text-gray-800 dark:text-brand-text antialiased">
      <AuthHeader />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        {/* Page intro */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/5 dark:bg-brand-secondary/10 text-xs font-semibold text-brand-primary dark:text-brand-secondary uppercase tracking-wider mb-4">
            <i className="fa-solid fa-book" />
            Libro de Reclamaciones
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-brand-text tracking-tight mb-3">
            Presenta un reclamo o queja
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Conforme al <strong>D.S. N° 011-2011-PCM</strong> y al Código de Protección y Defensa del
            Consumidor (<strong>Ley N° 29571</strong>). Te responderemos por correo en un plazo
            máximo de <strong>15 días hábiles</strong>.
          </p>
        </div>

        {/* Body — swap between form and receipt */}
        {receipt ? (
          <ComplaintFiledReceiptCard receipt={receipt} documentNumber={documentNumber} />
        ) : (
          <>
            {/* Consulta shortcut */}
            <Card className="mb-6 p-4 rounded-lg bg-brand-card border-gray-100 dark:border-white/6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-none">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-primary/5 dark:bg-brand-secondary/10 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-magnifying-glass text-sm text-brand-primary dark:text-brand-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-text">
                    ¿Ya presentaste un reclamo?
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Consulta su estado con tu código y número de documento.
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                className="border-gray-200 dark:border-[#334155] text-gray-700 dark:text-gray-300 hover:bg-brand-surface"
              >
                <Link href="/libro-de-reclamaciones/consulta">Consultar reclamo</Link>
              </Button>
            </Card>

            <FileComplaintForm onFiled={handleFiled} />
          </>
        )}
      </main>

      <footer className="border-t border-gray-100 dark:border-white/5 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
        © {CURRENT_YEAR} Crevo ·{' '}
        <Link href="/terminos-y-condiciones" className="hover:text-brand-primary dark:hover:text-brand-secondary">Términos</Link>{' · '}
        <Link href="/politica-de-privacidad" className="hover:text-brand-primary dark:hover:text-brand-secondary">Privacidad</Link>
      </footer>
    </div>
  )
}
