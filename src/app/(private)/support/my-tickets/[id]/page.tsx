'use client'
import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { sauRepository, SauTicketDetailCard, type SauTicketView } from '@/features/sau'

interface Props {
  params: Promise<{ id: string }>
}

/**
 * Single SAU ticket detail. The backend enforces owner-or-admin access —
 * consumers only see their own tickets; an attempt to read someone else's
 * returns 404 (intentional — avoids enumerating valid ticket ids).
 */
export default function TicketDetailPage({ params }: Props) {
  const { id } = use(params)
  const [ticket, setTicket] = useState<SauTicketView | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    sauRepository
      .getOne(id)
      .then((t) => {
        if (cancelled) return
        setTicket(t)
      })
      .catch((err) => {
        if (cancelled) return
        setNotFound(true)
        // Don't toast a 404 — the page itself communicates the state.
        if (err instanceof Error && !/no encontrad/i.test(err.message)) {
          toast.error(err.message)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link
        href="/support/my-tickets"
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-secondary transition-colors"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden="true" />
        Volver a mis tickets
      </Link>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2
            className="h-8 w-8 animate-spin text-brand-primary dark:text-brand-secondary"
            aria-label="Cargando ticket"
          />
        </div>
      ) : notFound || !ticket ? (
        <div className="p-10 text-center rounded-lg bg-brand-card border border-gray-100 dark:border-white/6">
          <h2 className="text-lg font-semibold text-brand-text mb-2">Ticket no encontrado</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No pudimos mostrar este ticket. Puede que el enlace sea incorrecto o que ya no tengas
            acceso a él.
          </p>
        </div>
      ) : (
        <SauTicketDetailCard ticket={ticket} />
      )}
    </div>
  )
}
