'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Check, Copy, Download, ShieldAlert, X } from 'lucide-react'

interface RecoveryCodesModalProps {
  open: boolean
  codes: string[]
  onClose: () => void
}

/**
 * Shows the 8 one-time recovery codes exactly once, right after
 * POST /auth/2fa/confirm or /auth/2fa/recovery-codes/regenerate — the
 * backend never returns the plaintext codes again. Requires the user to
 * check "ya las guardé" before the continue button unlocks, so a stray
 * click can't dismiss the codes before they're saved somewhere.
 */
export function RecoveryCodesModal({ open, codes, onClose }: Readonly<RecoveryCodesModalProps>) {
  const [saved, setSaved] = useState(false)

  if (!open) return null

  const codesText = codes.join('\n')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codesText)
    toast.success('Códigos copiados')
  }

  const handleDownload = () => {
    const blob = new Blob([codesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'crevo-codigos-recuperacion.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClose = () => {
    setSaved(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-[#0A192F] to-[#112240] rounded-t-2xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-[#D4AF37]" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-white text-base">Códigos de recuperación</p>
              <p className="text-white/70 text-xs">Guárdalos en un lugar seguro</p>
            </div>
          </div>
          {saved && (
            <button
              onClick={handleClose}
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-5">
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            Cada código sirve <strong>una sola vez</strong> para entrar si pierdes el acceso a tu
            app autenticadora. Solo se muestran <strong>ahora</strong>: no podrás volver a verlos.
          </p>

          <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-white/10 rounded-xl p-4 font-mono text-sm text-[#0A192F] dark:text-white">
            {codes.map((c) => (
              <span key={c} className="tracking-wider">
                {c}
              </span>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="h-4 w-4" aria-hidden="true" /> Copiar
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" aria-hidden="true" /> Descargar
            </button>
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={saved}
              onChange={(e) => setSaved(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#0A192F] cursor-pointer shrink-0"
            />
            <span className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Ya guardé mis códigos de recuperación en un lugar seguro.
            </span>
          </label>

          <button
            type="button"
            onClick={handleClose}
            disabled={!saved}
            className="w-full py-3 rounded-xl bg-[#0A192F] text-[#D4AF37] font-bold text-sm hover:bg-[#112240] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" aria-hidden="true" /> Entendido, continuar
          </button>
        </div>
      </div>
    </div>
  )
}
