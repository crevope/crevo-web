'use client'
import { useEffect } from 'react'
import { X, Download } from 'lucide-react'

interface Props {
  /** Signed download URL of the image. */
  url: string
  /** Original filename for the download attribute on the action button. */
  filename?: string | null
  /** Called when the lightbox should close (backdrop click / Escape). */
  onClose: () => void
}

/**
 * Fullscreen image preview with backdrop click + Escape to close +
 * download button. Renders to document.body level via fixed positioning
 * so it overlays the entire viewport including the chat panel.
 *
 * Kept dead simple — no zoom, no swipe-between-images, no carousel.
 * Single-attachment-per-message means no need for navigation; if we
 * later support multi-attachment messages this is the right place to
 * grow the API.
 */
export function ImageLightbox({ url, filename, onClose }: Readonly<Props>) {
  // Escape closes — symmetric with the chat panel's own Escape handler
  // (which we DON'T want firing while the lightbox is open; that'd
  // close both at once). The lightbox key handler captures BEFORE the
  // panel's via stopPropagation in the listener.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      onClose()
    }
    // Capture phase so we beat the chat panel's own listener.
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  // Lock body scroll while open so the page underneath doesn't shift.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vista de imagen"
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm animate-in fade-in duration-150"
    >
      {/* Action bar — close + download. Stop click propagation so
          interacting with the buttons doesn't dismiss the dialog. */}
      <div
        className="absolute top-4 right-4 flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <a
          href={url}
          download={filename ?? 'imagen'}
          aria-label="Descargar imagen"
          className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
        </a>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Image — clicking the IMAGE itself shouldn't close (only the
          backdrop). Stop propagation here so a click on the image
          doesn't bubble up to the dialog onClick. */}
      <img
        src={url}
        alt={filename ?? ''}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded shadow-2xl"
      />
    </div>
  )
}
