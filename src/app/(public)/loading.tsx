import { Loader2 } from 'lucide-react'

/**
 * Loading UI for every page inside the `(public)` route group.
 *
 * Bridges the gap between a click and the next page's first paint on public
 * surfaces — auth flow, legal pages, complaints. Auth pages are the hottest
 * path (signup / login) so a fast, branded loader here directly affects
 * perceived performance.
 */
export default function PublicLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
      <Loader2 className="h-10 w-10 animate-spin text-[#00E5FF]" aria-label="Cargando" />
    </div>
  )
}
