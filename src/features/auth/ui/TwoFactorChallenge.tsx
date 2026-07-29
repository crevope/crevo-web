'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, KeyRound } from 'lucide-react'
import { authRepository } from '../api/authRepository'
import type { AuthUser } from '@/entities/user'
import { inputCls } from '../lib/authStyles'

const EXPIRED_MESSAGE = 'La verificación expiró, iniciá sesión de nuevo'

interface TwoFactorChallengeProps {
  challengeToken: string
  onVerified: (user: AuthUser) => void
  onCancel: () => void
}

/**
 * Second step of a 2FA-protected login: POST /auth/2fa/verify with either a
 * 6-digit TOTP code or a recovery code (`useRecoveryCode` is a UI hint only —
 * the backend always tries TOTP first regardless, see VerifyTwoFactorChallenge
 * on the backend). The challengeToken is single-purpose and short-lived
 * (5 min); on expiry the backend returns EXPIRED_MESSAGE verbatim and we
 * bounce back to the login form via onCancel.
 */
export function TwoFactorChallenge({
  challengeToken,
  onVerified,
  onCancel,
}: Readonly<TwoFactorChallengeProps>) {
  const [useRecoveryCode, setUseRecoveryCode] = useState(false)
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim().length < 6) {
      toast.error('Ingresa un código válido')
      return
    }
    setSubmitting(true)
    try {
      const { user } = await authRepository.verifyTwoFactor(
        challengeToken,
        code.trim(),
        useRecoveryCode,
      )
      onVerified(user)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Código inválido'
      toast.error(message)
      if (message === EXPIRED_MESSAGE) {
        onCancel()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {useRecoveryCode
          ? 'Ingresa uno de tus códigos de recuperación de un solo uso.'
          : 'Ingresa el código de 6 dígitos de tu app autenticadora.'}
      </p>

      <div className="space-y-1.5">
        <label
          htmlFor="tfa-code"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          {useRecoveryCode ? 'Código de recuperación' : 'Código de verificación'}
        </label>
        <input
          id="tfa-code"
          type="text"
          inputMode={useRecoveryCode ? 'text' : 'numeric'}
          maxLength={useRecoveryCode ? 9 : 6}
          value={code}
          onChange={(e) => {
            const raw = useRecoveryCode
              ? e.target.value.toUpperCase().substring(0, 9)
              : e.target.value.replace(/\D/g, '').substring(0, 6)
            setCode(raw)
          }}
          placeholder={useRecoveryCode ? 'XXXX-XXXX' : '000000'}
          autoFocus
          className={`${inputCls} text-center text-2xl font-bold tracking-[0.3em]`}
        />
      </div>

      <button
        type="submit"
        disabled={submitting || code.length < 6}
        className="w-full py-3 cursor-pointer rounded-lg bg-[#0A192F] text-[#D4AF37] font-bold text-base hover:bg-[#112240] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Verificando...
          </>
        ) : (
          'Verificar'
        )}
      </button>

      <div className="flex items-center justify-between pt-1 text-sm">
        <button
          type="button"
          onClick={() => {
            setUseRecoveryCode((v) => !v)
            setCode('')
          }}
          className="flex items-center gap-1.5 font-semibold text-[#0A192F] dark:text-[#D4AF37] hover:underline"
        >
          <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
          {useRecoveryCode ? 'Usar código de la app' : 'Usar código de recuperación'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Volver
        </button>
      </div>
    </form>
  )
}
