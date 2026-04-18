'use client'
import { useEffect, useRef, useState, type KeyboardEvent, type ChangeEvent } from 'react'
import { Send, Loader2, Smile, Paperclip, X as XIcon, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useChatStore } from '../model/useChatStore'
import { chatRepository } from '../api/chatRepository'
import { EmojiPicker } from './EmojiPicker'
import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
  isImageMime,
  type ChatAttachmentMimeType,
} from '../types'

const MAX_LEN = 4000
/** Hard cap on auto-grow: 4 visible rows. After this, scroll appears. */
const MAX_VISIBLE_ROWS = 4
/** File picker `accept` string — comma-joined MIME list. */
const ACCEPT_ATTRIBUTE = ALLOWED_ATTACHMENT_MIME_TYPES.join(',')

/** Local state for the staged (selected but not yet sent) attachment. */
interface StagedAttachment {
  file: File
  /** URL.createObjectURL preview — revoked when staged or sent. */
  localUrl: string
}

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
  const conversation = useChatStore((s) => s.conversation)
  const [value, setValue] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [staged, setStaged] = useState<StagedAttachment | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Revoke any in-flight blob URL when the staged attachment changes or
  // the component unmounts. Avoids the URL leaking memory across many
  // attach-then-cancel cycles.
  useEffect(() => {
    return () => {
      if (staged?.localUrl) URL.revokeObjectURL(staged.localUrl)
    }
  }, [staged])

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
    if ((!trimmed && !staged) || isSending || isUploading) return
    if (!conversation) return

    // Clear locally so the user can keep typing while the previous
    // message lands. If send fails we restore via catch.
    setValue('')
    const stagedSnapshot = staged
    setStaged(null)

    try {
      // Upload-then-send when there's an attachment.
      let attachmentForSend:
        | { path: string; mimeType: string; filename: string; sizeBytes: number; localUrl: string }
        | undefined
      if (stagedSnapshot) {
        setIsUploading(true)
        try {
          const signed = await chatRepository.requestUploadUrl({
            conversationId: conversation.id,
            filename: stagedSnapshot.file.name,
            mimeType: stagedSnapshot.file.type,
            sizeBytes: stagedSnapshot.file.size,
          })
          await chatRepository.uploadAttachment(stagedSnapshot.file, signed)
          attachmentForSend = {
            path: signed.path,
            mimeType: stagedSnapshot.file.type,
            filename: stagedSnapshot.file.name,
            sizeBytes: stagedSnapshot.file.size,
            localUrl: stagedSnapshot.localUrl,
          }
        } finally {
          setIsUploading(false)
        }
      }

      await send(trimmed, attachmentForSend)
    } catch {
      // Restore typed text + staged attachment on failure so the user
      // can retry without losing context.
      setValue(trimmed)
      setStaged(stagedSnapshot)
      toast.error('No pudimos enviar tu mensaje. Inténtalo de nuevo.')
    }
  }

  const handleFilePicked = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Always reset the input so re-picking the same file fires onChange again.
    e.target.value = ''
    if (!file) return

    // Local validation — backend re-validates so this is a friendliness layer.
    if (!ALLOWED_ATTACHMENT_MIME_TYPES.includes(file.type as ChatAttachmentMimeType)) {
      toast.error('Solo se aceptan imágenes (PNG, JPG, WebP, GIF) y PDF.')
      return
    }
    if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
      const maxMb = Math.round(MAX_ATTACHMENT_SIZE_BYTES / (1024 * 1024))
      toast.error(`El archivo supera el límite de ${maxMb} MB.`)
      return
    }

    // Free any previous staged blob URL before staging a new one.
    if (staged?.localUrl) URL.revokeObjectURL(staged.localUrl)
    setStaged({ file, localUrl: URL.createObjectURL(file) })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const remaining = MAX_LEN - value.length
  const overLimit = remaining < 0
  const sendDisabled = (!value.trim() && !staged) || isSending || isUploading || overLimit

  return (
    <div className="border-t border-gray-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] px-3 py-2.5">
      {/* Staged-attachment preview row. Images use a thumbnail; PDFs
          use a generic document icon (rendering a PDF page thumb would
          require pdf.js which is heavy + overkill). Click X to discard. */}
      {staged && (
        <div className="mb-2 inline-flex items-start gap-2 rounded-lg border border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1E293B] p-1.5 max-w-full">
          {isImageMime(staged.file.type) ? (
            <img
              src={staged.localUrl}
              alt={staged.file.name}
              className="h-14 w-14 rounded object-cover shrink-0"
            />
          ) : (
            <div className="h-14 w-14 rounded bg-red-500/10 flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6 text-red-500" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0 flex-1 pr-1 py-0.5">
            <p
              className="text-xs text-[#0A192F] dark:text-[#F1F5F9] truncate"
              title={staged.file.name}
            >
              {staged.file.name}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              {(staged.file.size / 1024).toFixed(0)} KB
              {isUploading && ' · subiendo…'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (staged.localUrl) URL.revokeObjectURL(staged.localUrl)
              setStaged(null)
            }}
            disabled={isUploading}
            aria-label="Quitar archivo"
            className="shrink-0 h-6 w-6 rounded hover:bg-gray-200 dark:hover:bg-[#334155] flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Hidden file input — opened programmatically by the paperclip button. */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          onChange={handleFilePicked}
          className="hidden"
          aria-hidden="true"
        />

        {/* Paperclip — file picker trigger. */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isSending}
          aria-label="Adjuntar archivo"
          className="shrink-0 h-9 w-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#0A192F] hover:bg-gray-100 dark:text-gray-400 dark:hover:text-[#D4AF37] dark:hover:bg-[#1E293B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Paperclip className="h-4 w-4" aria-hidden="true" />
        </button>

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
          disabled={sendDisabled}
          aria-label="Enviar mensaje"
          className="shrink-0 h-9 w-9 rounded-lg bg-[#0A192F] text-[#D4AF37] flex items-center justify-center hover:bg-[#112240] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSending || isUploading ? (
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
