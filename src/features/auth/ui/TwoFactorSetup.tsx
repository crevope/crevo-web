'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import QRCode from 'qrcode'
import { Loader2, Copy, ShieldCheck, X } from 'lucide-react'
import { authRepository } from '../api/authRepository'
import { inputCls } from '../lib/authStyles'

interface TwoFactorSetupProps {
  open: boolean
  onClose: () => void
  onConfirmed: (recoveryCodes: string[]) => void
}

/**
 * Modal: opt-in TOTP setup for the client profile's Security section.
 * POST /auth/2fa/setup on open (generates a pending secret + otpauth URI),
 * renders the QR (client-side via the `qrcode` package) + the secret for
 * manual entry, then POST /auth/2fa/confirm with a 6-digit code. A wrong
 * code does NOT close the modal — the user can retry (spec: "permite
 * reintentar").
 */
export function TwoFactorSetup({ open, onClose, onConfirmed }: Readonly<TwoFactorSetupProps>) {
  const [loading, setLoading] = useState(false)
  const [qrDataUri, setQrDataUri] = useState<string | null>(null)
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!open) return
    setCode('')
    setQrDataUri(null)
    setSecret('')
    setLoading(true)
    authRepository
      .setupTwoFactor()
      .then(async ({ otpauthUri, secret: pendingSecret }) => {
        setSecret(pendingSecret)
        try {
          const dataUri = await QRCode.toDataURL(otpauthUri)
          setQrDataUri(dataUri)
        } catch {
          // QR render failed client-side — manual entry with `secret` still works.
        }
      })
      .catch((err: unknown) => {
        toast.error(
          err instanceof Error ? err.message : 'No se pudo iniciar la configuración de 2FA',
        )
        onClose()
      })
      .finally(() => setLoading(false))
  }, [open, onClose])

  if (!open) return null

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim().length !== 6) {
      toast.error('Ingresa el código de 6 dígitos')
      return
    }
    setConfirming(true)
    try {
      const { recoveryCodes } = await authRepository.confirmTwoFactor(code.trim())
      onConfirmed(recoveryCodes)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Código inválido')
      setCode('')
    } finally {
      setConfirming(false)
    }
  }

  const handleCopySecret = async () => {
    await navigator.clipboard.writeText(secret)
    toast.success('Secreto copiado')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-[#0A192F] to-[#112240] rounded-t-2xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-[#D4AF37]" aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold text-white text-base">Activar 2FA</p>
              <p className="text-white/70 text-xs">Autenticación de dos factores</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center gap-3 text-gray-400 py-10">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              <span className="text-sm">Generando código...</span>
            </div>
          ) : (
            <>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Escanea este código QR con Google Authenticator, Authy u otra app compatible.
              </p>

              {qrDataUri && (
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element -- data: URI, next/image doesn't optimize these */}
                  <img
                    src={qrDataUri}
                    alt="Código QR para configurar 2FA"
                    width={200}
                    height={200}
                    className="rounded-lg border border-gray-200 dark:border-white/10"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  ¿No puedes escanear? Ingresa este código manualmente
                </label>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0F172A] text-left"
                >
                  <span className="font-mono text-sm text-[#0A192F] dark:text-white tracking-wider break-all">
                    {secret}
                  </span>
                  <Copy className="h-4 w-4 text-gray-400 shrink-0" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={handleConfirm} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Código de verificación
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                    placeholder="000000"
                    autoFocus
                    className={`${inputCls} text-center text-2xl font-bold tracking-[0.4em]`}
                  />
                </div>
                <button
                  type="submit"
                  disabled={confirming || code.length !== 6}
                  className="w-full py-3 rounded-lg bg-[#0A192F] text-[#D4AF37] font-bold text-sm hover:bg-[#112240] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                >
                  {confirming ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Verificando...
                    </>
                  ) : (
                    'Activar 2FA'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
