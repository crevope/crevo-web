'use client'
import { FileText, Download } from 'lucide-react'
import { ImageOff } from 'lucide-react'

interface Props {
  url: string | null | undefined
  filename: string | null | undefined
  sizeBytes?: number | null
  /** Affects the color scheme — agent-side bubbles use a different palette
   *  so the file card matches the bubble background. */
  variant: 'user' | 'agent' | 'system'
}

/**
 * Renders a non-image attachment (currently PDF) as a click-to-open
 * file card inside a chat bubble. Browser PDF viewers are surprisingly
 * good, so "open in new tab" is the simplest and most reliable UX —
 * no need to embed a PDF.js viewer inline.
 *
 * When url is null (signing failed server-side), the card is disabled
 * and shows a placeholder so the bubble doesn't look broken.
 */
export function AttachmentFileCard({ url, filename, sizeBytes, variant }: Readonly<Props>) {
  const display = filename || 'Archivo'
  const size = typeof sizeBytes === 'number' ? `${(sizeBytes / 1024).toFixed(0)} KB` : ''

  const baseClasses =
    'mx-3 mt-2 flex items-center gap-2.5 rounded-lg px-2.5 py-2 max-w-[280px] transition-colors'
  const toneClasses =
    variant === 'user'
      ? 'bg-white/10 hover:bg-white/15 text-white'
      : 'bg-black/5 hover:bg-black/10 text-[#0A192F] dark:bg-white/5 dark:hover:bg-white/10 dark:text-[#F1F5F9]'

  if (!url) {
    return (
      <div className={`${baseClasses} ${toneClasses} opacity-70 cursor-not-allowed`} role="status">
        <div className="h-9 w-9 rounded bg-red-500/20 flex items-center justify-center shrink-0">
          <ImageOff className="h-4 w-4 text-red-400" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate">{display}</p>
          <p className="text-[10px] opacity-70">Archivo no disponible</p>
        </div>
      </div>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={filename ?? undefined}
      aria-label={`Abrir ${display}`}
      className={`${baseClasses} ${toneClasses}`}
    >
      <div className="h-9 w-9 rounded bg-red-500/20 flex items-center justify-center shrink-0">
        <FileText className="h-4 w-4 text-red-400" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate" title={display}>
          {display}
        </p>
        {size && <p className="text-[10px] opacity-70">{size}</p>}
      </div>
      <Download className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
    </a>
  )
}
