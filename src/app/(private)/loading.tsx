import { Loader2 } from 'lucide-react'

/**
 * Loading UI for every page inside the `(private)` route group.
 *
 * Next.js swaps this in during route transitions (and when a server component
 * is still awaiting data) so the user sees an instant response after a click
 * instead of the previous page frozen for ~200 ms. The layout chrome —
 * sidebar, header, brand typography — is already painted by the group's
 * `layout.tsx`, so we only fill the content area.
 *
 * Kept deliberately minimal: a centered spinner on the brand accent color.
 * Per-page skeletons can override this with their own `loading.tsx` at the
 * segment level when the shape of the page is predictable (e.g. a list of
 * cards) and a skeleton would feel more responsive than a spinner.
 */
export default function PrivateLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#00E5FF]" aria-label="Cargando" />
    </div>
  )
}
