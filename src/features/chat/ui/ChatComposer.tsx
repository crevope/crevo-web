'use client'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useChatStore } from '../model/useChatStore'

const MAX_LEN = 4000

interface Props {
  /** When true, the composer is disabled and shows a closed-conversation banner. */
  isClosed: boolean
}

/**
 * Auto-growing textarea + send button. Keyboard contract matches WhatsApp:
 *   - Enter         → send
 *   - Shift+Enter   → newline
 *   - Cmd/Ctrl+Enter on long messages also sends (some users habitually do this)
 *
 * Disabled while the previous send is in flight; if the send fails we
 * restore the typed text so the user doesn't lose it.
 */
export function ChatComposer({ isClosed }: Readonly<Props>) {
  const send = useChatStore((s) => s.send)
  const isSending = useChatStore((s) => s.isSending)
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Auto-grow up to a max height so multi-line drafts are visible.
  // Resets to the natural single-row height after send.
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`
  }, [value])

  if (isClosed) {
    return (
      <div className="border-t border-gray-200 dark:border-[#334155] px-4 py-3 bg-gray-50 dark:bg-[#0F172A]">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Esta conversación se cerró. Vuelve a abrir el chat para iniciar una nueva.
        </p>
      </div>
    )
  }

  const handleSend = async () => {
    const trimmed = value.trim()
    if (!trimmed || isSending) return

    // Clear immediately so the user can keep typing while the previous
    // message lands. If send fails we restore via catch.
    setValue('')
    try {
      await send(trimmed)
    } catch {
      setValue(trimmed)
      toast.error('No pudimos enviar tu mensaje. Inténtalo de nuevo.')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const remaining = MAX_LEN - value.length
  const overLimit = remaining < 0

  return (
    <div className="border-t border-gray-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] px-3 py-2.5">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu mensaje…"
          rows={1}
          maxLength={MAX_LEN + 100} // soft cap; visual warning kicks in at MAX_LEN
          aria-label="Mensaje al soporte"
          className="flex-1 resize-none rounded-lg border border-gray-200 dark:border-[#334155] bg-white dark:bg-[#0A192F] px-3 py-2 text-sm text-[#0A192F] dark:text-[#F1F5F9] placeholder-gray-400 dark:placeholder-[#64748B] focus:outline-none focus:border-[#0A192F] dark:focus:border-[#D4AF37] focus:ring-2 focus:ring-[#0A192F]/10 dark:focus:ring-[#D4AF37]/15 transition-colors leading-snug"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!value.trim() || isSending || overLimit}
          aria-label="Enviar mensaje"
          className="shrink-0 h-9 w-9 rounded-lg bg-[#0A192F] text-[#D4AF37] flex items-center justify-center hover:bg-[#112240] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {/* Soft remaining-chars hint, only when close to / over the limit. */}
      {value.length > MAX_LEN - 200 && (
        <p
          className={`mt-1 text-[10px] text-right ${overLimit ? 'text-red-500' : 'text-gray-400'}`}
        >
          {overLimit
            ? `${Math.abs(remaining)} caracteres sobre el límite`
            : `${remaining} caracteres restantes`}
        </p>
      )}
    </div>
  )
}
