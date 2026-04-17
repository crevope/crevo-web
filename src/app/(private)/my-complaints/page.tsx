'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, FolderOpen, ArrowLeft, CircleCheck, Clock, ChevronRight } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  ComplaintDetailCard,
  complaintsRepository,
  type ComplaintView,
  CLAIM_TYPE_LABELS,
  COMPLAINT_STATUS_LABELS,
} from '@/features/complaints'

const cardCls =
  'bg-brand-card border-gray-100 dark:border-white/6 rounded-lg shadow-none'

/**
 * Authed history view — lists every complaint the current user has filed so
 * they can follow up without having to remember each claim code. Clicking a
 * row expands the full `ComplaintDetailCard`.
 */
export default function MyComplaintsPage() {
  const [complaints, setComplaints] = useState<ComplaintView[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const data = await complaintsRepository.listMine({ limit: 50 })
        if (!cancelled) setComplaints(data)
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : 'No pudimos cargar tus reclamos',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const selected = complaints.find((c) => c.id === selectedId) ?? null

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text mb-1 tracking-tight">
            Mis reclamos
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Historial de los reclamos y quejas que has presentado en el Libro de Reclamaciones.
          </p>
        </div>
        <Button
          asChild
          className="hidden sm:inline-flex bg-brand-primary hover:bg-brand-primary-hover text-white"
        >
          <Link href="/libro-de-reclamaciones">
            <Plus className="h-3 w-3" aria-hidden="true" /> Nuevo reclamo
          </Link>
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <Card className={`${cardCls} overflow-hidden p-0 gap-0`}>
          <div className="divide-y divide-gray-100 dark:divide-white/6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </Card>
      ) : complaints.length === 0 ? (
        <Card className={`${cardCls} p-16 text-center`}>
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-brand-surface flex items-center justify-center mx-auto mb-5">
            <FolderOpen className="h-9 w-9 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-brand-text mb-2">
            Aún no has presentado reclamos
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-5">
            Si tienes una disconformidad con un producto o la atención recibida, puedes presentar
            un reclamo formal desde el Libro de Reclamaciones.
          </p>
          <Button asChild className="bg-brand-primary hover:bg-brand-primary-hover text-white">
            <Link href="/libro-de-reclamaciones">
              <Plus className="h-3 w-3" aria-hidden="true" /> Presentar reclamo
            </Link>
          </Button>
        </Card>
      ) : selected ? (
        <div className="space-y-4">
          <Button
            type="button"
            variant="link"
            onClick={() => setSelectedId(null)}
            className="px-0 h-auto text-sm text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-secondary hover:no-underline"
          >
            <ArrowLeft className="h-3 w-3" aria-hidden="true" /> Volver a la lista
          </Button>
          <ComplaintDetailCard complaint={selected} />
        </div>
      ) : (
        <Card className={`${cardCls} overflow-hidden p-0 gap-0`}>
          <div className="divide-y divide-gray-100 dark:divide-white/6">
            {complaints.map((c) => {
              const isClosed = c.status === 'CLOSED'
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className="w-full flex items-start gap-4 p-5 text-left cursor-pointer hover:bg-brand-surface transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                      isClosed
                        ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                    }`}
                  >
                    {isClosed ? <CircleCheck className="h-4 w-4" aria-hidden="true" /> : <Clock className="h-4 w-4" aria-hidden="true" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-semibold text-brand-primary dark:text-brand-secondary tracking-wider">
                          {c.claimCode}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {CLAIM_TYPE_LABELS[c.claimType]} · presentado{' '}
                          {new Date(c.filedAt).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            timeZone: 'America/Lima',
                          })}
                        </p>
                      </div>
                      <Badge
                        className={`gap-1.5 ${
                          isClosed
                            ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isClosed ? 'bg-green-500' : 'bg-amber-500 animate-pulse'
                          }`}
                        />
                        {COMPLAINT_STATUS_LABELS[c.status]}
                      </Badge>
                    </div>

                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                      {c.claimDetail}
                    </p>
                  </div>

                  <ChevronRight className="h-3 w-3 text-gray-300 dark:text-gray-600 mt-3" aria-hidden="true" />
                </button>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
