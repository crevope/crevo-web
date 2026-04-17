'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Headphones, ListChecks, ShieldCheck } from 'lucide-react'
import { OpenSauTicketForm, type SauTicketView } from '@/features/sau'

/**
 * SAU landing (consumer-facing) — open a new ticket and link out to the
 * history view. Mounted at `/support` (private routes are English per the
 * repo convention); the UI copy still reads "Soporte" since the product
 * is Spanish-speaking.
 *
 * On successful submission we bounce to the just-created ticket's detail
 * page so the user sees their code + SLA deadline immediately — same
 * pattern as the public Libro de Reclamaciones flow.
 */
export default function SupportPage() {
  const router = useRouter()

  const handleOpened = (ticket: SauTicketView) => {
    router.push(`/support/my-tickets/${ticket.id}`)
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Intro */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/5 dark:bg-brand-secondary/10 text-xs font-semibold text-brand-primary dark:text-brand-secondary uppercase tracking-wider mb-4">
          <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
          Soporte al usuario
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-brand-text tracking-tight mb-2">
          ¿En qué podemos ayudarte?
        </h1>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
          Envíanos una consulta, sugerencia o reclamo relacionado con tu cuenta Crevo. Conforme a la{' '}
          <strong>Circular SBS G-184-2015</strong>, nuestro equipo de atención al usuario responderá
          tu caso en un plazo máximo de <strong>30 días calendario</strong>.
        </p>
      </div>

      {/* Shortcut to existing tickets */}
      <Link
        href="/support/my-tickets"
        className="block p-4 rounded-lg bg-brand-card border border-gray-100 dark:border-white/6 hover:border-brand-primary/40 dark:hover:border-brand-secondary/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-primary/5 dark:bg-brand-secondary/10 flex items-center justify-center shrink-0">
            <ListChecks
              className="h-4 w-4 text-brand-primary dark:text-brand-secondary"
              aria-hidden="true"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-brand-text">Ver mis tickets</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Revisa el estado y respuestas de las solicitudes que enviaste antes.
            </p>
          </div>
        </div>
      </Link>

      <OpenSauTicketForm onOpened={handleOpened} />

      {/* Regulatory note — SAU complements (does not replace) Libro de Reclamaciones. */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-brand-surface border border-gray-100 dark:border-white/6">
        <ShieldCheck
          className="h-4 w-4 text-brand-primary dark:text-brand-secondary mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          El SAU es un canal interno de atención (Circular SBS G-184-2015) y es complementario —{' '}
          <strong>no reemplaza</strong> el{' '}
          <Link
            href="/libro-de-reclamaciones"
            className="text-brand-primary dark:text-brand-secondary hover:underline"
          >
            Libro de Reclamaciones de INDECOPI
          </Link>
          . Si tu caso es un reclamo formal sobre el producto puedes presentarlo por ambos canales.
        </p>
      </div>
    </div>
  )
}
