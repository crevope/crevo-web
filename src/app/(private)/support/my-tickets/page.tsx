'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ArrowLeft, ChevronRight, FolderOpen, Plus } from 'lucide-react'
import { formatDate } from '@/shared/lib/utils'
import { Skeleton } from '@/shared/ui/skeleton'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import {
  sauRepository,
  SauStatusBadge,
  SAU_CATEGORY_LABELS,
  type SauTicketView,
} from '@/features/sau'

/**
 * List of the current user's SAU tickets, newest first. The backend
 * paginates with limit/offset but 50 per page is generous for a consumer
 * view (an individual borrower is very unlikely to open that many in a
 * year); we load the default page and expose a simple "load more" CTA
 * only when the page is full, to keep the UI simple.
 */
export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<SauTicketView[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    let cancelled = false
    sauRepository
      .mine({ limit: 50, offset: 0 })
      .then((list) => {
        if (cancelled) return
        setTickets(list)
        setHasMore(list.length === 50)
      })
      .catch((err) => {
        if (cancelled) return
        toast.error(err instanceof Error ? err.message : 'No pudimos cargar tus tickets')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const next = await sauRepository.mine({ limit: 50, offset: tickets.length })
      setTickets((prev) => [...prev, ...next])
      setHasMore(next.length === 50)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No pudimos cargar más tickets')
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/support"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-secondary transition-colors"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          Volver a Soporte
        </Link>
        <Link
          href="/support"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-medium transition-colors"
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          Nueva solicitud
        </Link>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-brand-text tracking-tight mb-2">
          Mis tickets
        </h1>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
          Historial de consultas, sugerencias y reclamos que has enviado al equipo de atención al
          usuario.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="bg-brand-card rounded-lg border-gray-100 dark:border-white/6 p-5 shadow-none space-y-3"
            >
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </Card>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <Card className="bg-brand-card rounded-lg border-gray-100 dark:border-white/6 p-10 text-center shadow-none">
          <div className="w-14 h-14 rounded-full bg-brand-surface flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Todavía no has abierto ningún ticket de soporte.
          </p>
          <Button asChild className="bg-brand-primary hover:bg-brand-primary-hover text-white">
            <Link href="/support">Abrir una solicitud</Link>
          </Button>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/support/my-tickets/${ticket.id}`}
                className="group block p-5 rounded-lg bg-brand-card border border-gray-100 dark:border-white/6 hover:border-brand-primary/40 dark:hover:border-brand-secondary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-sm font-semibold text-brand-text truncate">
                        {ticket.subject}
                      </h3>
                      <SauStatusBadge status={ticket.status} />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                      {SAU_CATEGORY_LABELS[ticket.category]} · Recibido el{' '}
                      {formatDate(ticket.filedAt)}
                    </p>
                    <code className="font-mono text-[10px] text-gray-400 dark:text-gray-500">
                      {ticket.ticketCode}
                    </code>
                  </div>
                  <ChevronRight
                    className="h-4 w-4 text-gray-300 dark:text-gray-600 mt-1 shrink-0 group-hover:translate-x-1 transition-transform"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
                className="border-gray-200 dark:border-[#334155]"
              >
                {loadingMore ? 'Cargando...' : 'Cargar más'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
