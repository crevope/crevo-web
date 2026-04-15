'use client'
import Link from 'next/link'
import { useState } from 'react'
import { AuthHeader } from '@/shared/ui/auth-header'
import { Button } from '@/shared/ui/button'
import { CURRENT_YEAR } from '@/shared/lib/constants'
import {
  ConsultComplaintForm,
  ComplaintDetailCard,
  type PublicComplaintView,
} from '@/features/complaints'

/**
 * Public lookup entry point. Blank form — the deep-link variant lives at
 * `/libro-de-reclamaciones/consulta/[code]` and pre-fills the code from the
 * URL plus the document number from the query string.
 */
export default function ConsultaIndexPage() {
  const [complaint, setComplaint] = useState<PublicComplaintView | null>(null)

  return (
    <div className="bg-brand-surface min-h-screen flex flex-col text-gray-800 dark:text-brand-text antialiased">
      <AuthHeader />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <div className="mb-8">
          <Button
            asChild
            variant="link"
            className="px-0 h-auto text-sm text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-secondary hover:no-underline mb-5"
          >
            <Link href="/libro-de-reclamaciones">
              <i className="fa-solid fa-arrow-left text-xs" />
              Volver al Libro de Reclamaciones
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-semibold text-brand-text tracking-tight mb-2">
            Consultar reclamo
          </h1>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            Ingresa el <strong>código de reclamo</strong> que te entregamos al presentarlo y el{' '}
            <strong>número de documento</strong> que usaste como consumidor.
          </p>
        </div>

        {complaint ? (
          <div className="space-y-4">
            <Button
              type="button"
              variant="link"
              onClick={() => setComplaint(null)}
              className="px-0 h-auto text-sm text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-secondary hover:no-underline"
            >
              <i className="fa-solid fa-arrow-left text-xs" /> Consultar otro reclamo
            </Button>
            <ComplaintDetailCard complaint={complaint} />
          </div>
        ) : (
          <ConsultComplaintForm onResult={setComplaint} />
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
