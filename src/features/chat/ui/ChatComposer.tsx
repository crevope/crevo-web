'use client'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Send, Loader2, Smile } from 'lucide-react'
import { toast } from 'sonner'
import { useChatStore } from '../model/useChatStore'
import { EmojiPicker } from './EmojiPicker'

const MAX_LEN = 4000
/** Hard cap on auto-grow: 4 visible rows. After this, scroll appears. */
const MAX_VISIBLE_ROWS = 4

interface Props {
  /** When true, the composer is disabled and shows a closed-conversation banner. */
  isClosed: boolean
}

/**
 * Auto-growing textarea + emoji picker + send button. Keyboard contract
 * matches WhatsApp: Enter sends, Shift+Enter newline. Disabled while
 * a previous send is in flight; on failure the typed text is restored.
 *
 * Height behavior:
 *   - Starts at 1 row (no scroll).
 *   - Grows row-by-row as the user types newlines / soft-wraps.
 *   - Caps at 4 rows; only then does the scrollbar appear.
 *
 * The cap is computed from the actual computed line-height + padding so
 * it adapts to font size / line-height changes without us hard-coding
 * pixel values. overflow-y is toggled per render: hidden until we hit
 * the cap, auto once we do.
 */
export function ChatComposer({ isClosed }: Readonly<Props>) {
  const send = useChatStore((s) => s.send)
  const notifyTyping = useChatStore((s) => s.notifyTyping)
  const isSending = useChatStore((s) => s.isSending)
  const [value, setValue] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Resize on every value change. See module doc above for the rationale.
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return

    const style = window.getComputedStyle(ta)
    // line-height can be "normal" → fall back to 1.2 * font-size.
    const lineHeightRaw = parseFloat(style.lineHeight)
    const lineHeight = Number.isFinite(lineHeightRaw)
      ? lineHeightRaw
      : parseFloat(style.fontSize) * 1.2
    const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)
    const maxHeight = lineHeight * MAX_VISIBLE_ROWS + paddingY

    // Reset to auto so scrollHeight reflects the true content height,
    // not the previous (possibly-larger) explicit value.
    ta.style.height = 'auto'
    const next = Math.min(ta.scrollHeight, maxHeight)
    ta.style.height = `${next}px`
    // Only show scrollbar when capped; otherwise the textarea is exactly
    // sized to content and there's nothing to scroll.
    ta.style.overflowY = ta.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [value])

  /** Insert text at the current selection without losing focus. Used by
   *  the emoji picker; could be reused later for /commands or templates. */
  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current
    if (!ta) {
      setValue((v) => v + text)
      return
    }
    const start = ta.selectionStart ?? value.length
    const end = ta.selectionEnd ?? value.length
    const next = value.slice(0, start) + text + value.slice(end)
    setValue(next)
    // Restore focus + position cursor after the inserted glyph. Defer to
    // next frame so React commits the new value before we set selection.
    requestAnimationFrame(() => {
      ta.focus()
      const cursor = start + text.length
      ta.selectionStart = ta.selectionEnd = cursor
    })
  }

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
        {/* Emoji button + popover. The wrapper is `position: relative`
            so the picker (absolute, bottom-full) anchors to it. */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setPickerOpen((p) => !p)}
            aria-label={pickerOpen ? 'Cerrar selector de emojis' : 'Abrir selector de emojis'}
            aria-expanded={pickerOpen}
            className="h-9 w-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#0A192F] hover:bg-gray-100 dark:text-gray-400 dark:hover:text-[#D4AF37] dark:hover:bg-[#1E293B] transition-colors"
          >
            <Smile className="h-4 w-4" aria-hidden="true" />
          </button>
          {pickerOpen && (
            <EmojiPicker
              onSelect={(emoji) => insertAtCursor(emoji)}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            // Fire-and-forget — store debounces internally so this is safe
            // to call on every keystroke. Only emits when value actually
            // changes (no point on focus/blur events).
            if (e.target.value.length > 0) notifyTyping()
          }}
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
