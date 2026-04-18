'use client'
import Link from 'next/link'
import { Suspense, useMemo, useState, use } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
import { AuthHeader } from '@/shared/ui/auth-header'
import { Button } from '@/shared/ui/button'
import { CURRENT_YEAR } from '@/shared/lib/constants'
import {
  ConsultComplaintForm,
  ComplaintDetailCard,
  type PublicComplaintView,
} from '@/features/complaints'

interface PageProps {
  params: Promise<{ code: string }>
}

/**
 * Inner component reads the query string — isolated so `useSearchParams` is
 * inside a Suspense boundary, as Next 15 requires for CSR bailout.
 */
function ConsultaBody({ claimCode }: { claimCode: string }) {
  const search = useSearchParams()
  const documentNumber = search.get('documentNumber') ?? ''
  const [complaint, setComplaint] = useState<PublicComplaintView | null>(null)
  const hasBothDefaults = Boolean(claimCode && documentNumber)

  if (complaint) {
    return (
      <div className="space-y-4">
        <Button
          type="button"
          variant="link"
          onClick={() => setComplaint(null)}
          className="px-0 h-auto text-sm text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-secondary hover:no-underline"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" /> Consultar otro reclamo
        </Button>
        <ComplaintDetailCard complaint={complaint} />
      </div>
    )
  }

  return (
    <ConsultComplaintForm
      defaultValues={{ claimCode, documentNumber }}
      autoSubmit={hasBothDefaults}
      onResult={setComplaint}
    />
  )
}

/**
 * Deep-link lookup — reached from the filing receipt's "Consultar mi reclamo"
 * CTA, which already knows both the code and the document number. We pre-fill
 * the form from the URL + query string and auto-submit so consumers see their
 * detail in one click. The form remains visible (and editable) if the lookup
 * fails, so a typo in either value is recoverable.
 */
export default function ConsultaCodePage({ params }: PageProps) {
  const { code } = use(params)

  const decodedCode = useMemo(() => {
    try {
      return decodeURIComponent(code)
    } catch {
      return code
    }
  }, [code])

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
              <ArrowLeft className="h-3 w-3" aria-hidden="true" />
              Volver al Libro de Reclamaciones
            </Link>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-semibold text-brand-text tracking-tight mb-2">
            Consultar reclamo
          </h1>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            Confirma los datos para ver el estado de tu reclamo.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-primary dark:text-brand-secondary" />
            </div>
          }
        >
          <ConsultaBody claimCode={decodedCode} />
        </Suspense>
      </main>

      <footer className="border-t border-gray-100 dark:border-white/5 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
        © {CURRENT_YEAR} Crevo ·{' '}
        <Link
          href="/terminos-y-condiciones"
          className="hover:text-brand-primary dark:hover:text-brand-secondary"
        >
          Términos
        </Link>
        {' · '}
        <Link
          href="/politica-de-privacidad"
          className="hover:text-brand-primary dark:hover:text-brand-secondary"
        >
          Privacidad
        </Link>
      </footer>
    </div>
  )
}
