'use client'
import { useState } from 'react'
import { Check, CheckCheck, Info, ImageOff } from 'lucide-react'
import type { ChatMessageView } from '../types'
import { isTempId } from '../types'
import { ImageLightbox } from './ImageLightbox'

interface Props {
  message: ChatMessageView
}

/**
 * Format a timestamp the way WhatsApp does in chat bubbles: just hour:minute
 * for messages from today, with the day prepended for older ones (the
 * thread renders day separators above so we don't repeat the date here).
 */
function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

export function ChatBubble({ message }: Readonly<Props>) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // SYSTEM messages are centered, neutral, no avatar — they're meta-events
  // (welcome, "esta conversación se cerró"), not actual conversation lines.
  if (message.senderType === 'system') {
    return (
      <li className="my-3 flex justify-center">
        <div className="max-w-[85%] inline-flex items-start gap-2 rounded-lg bg-gray-100 dark:bg-[#1E293B] px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#00E5FF]" aria-hidden="true" />
          <span className="leading-snug">{message.body}</span>
        </div>
      </li>
    )
  }

  const isUser = message.senderType === 'user'
  const pending = isTempId(message.id)
  const seen = Boolean(message.readAt)
  const hasAttachment = Boolean(message.attachmentPath)
  const hasBody = Boolean(message.body)

  return (
    <>
      <li
        className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
        aria-label={isUser ? 'Mi mensaje' : 'Mensaje de soporte'}
      >
        <div
          className={`
            max-w-[85%] rounded-2xl text-sm leading-snug whitespace-pre-wrap break-words overflow-hidden
            ${
              isUser
                ? 'bg-[#0A192F] text-white rounded-br-sm dark:bg-[#1E293B]'
                : 'bg-white text-[#0A192F] rounded-bl-sm border border-gray-200 dark:bg-[#0F172A] dark:text-[#F1F5F9] dark:border-[#334155]'
            }
          `}
        >
          {/* Attachment image — flush to the bubble edges (no padding) so
              it reads as part of the bubble shape. Click → lightbox. */}
          {hasAttachment && (
            <button
              type="button"
              onClick={() => message.attachmentUrl && setLightboxOpen(true)}
              disabled={!message.attachmentUrl}
              aria-label="Ver imagen completa"
              className="block w-full max-w-[280px]"
            >
              {message.attachmentUrl ? (
                <img
                  src={message.attachmentUrl}
                  alt={message.attachmentFilename ?? ''}
                  className="block w-full h-auto max-h-[280px] object-cover"
                />
              ) : (
                // Signed URL failed (rare — backend logs it). Render a
                // placeholder so the bubble doesn't look broken.
                <div className="flex items-center justify-center gap-2 h-[120px] bg-gray-200 dark:bg-[#334155] text-gray-500 text-xs">
                  <ImageOff className="h-4 w-4" aria-hidden="true" />
                  <span>Imagen no disponible</span>
                </div>
              )}
            </button>
          )}

          {/* Body — padded only when present. When there's no body and
              just an attachment, we still need the time stamp + receipt
              line, so the padding goes there. */}
          {hasBody && (
            <p className={hasAttachment ? 'px-3.5 pt-2' : 'px-3.5 pt-2'}>{message.body}</p>
          )}

          {/* Time + receipt rail — same padding regardless of attachment. */}
          <div
            className={`
              flex items-center gap-1 justify-end text-[10px] px-3.5 pb-1.5
              ${hasBody ? 'pt-1' : 'pt-1.5'}
              ${isUser ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'}
            `}
          >
            <span>{formatTime(message.createdAt)}</span>
            {isUser &&
              (pending ? (
                <span aria-label="Enviando" title="Enviando">
                  <Check className="h-3 w-3 opacity-50" />
                </span>
              ) : seen ? (
                <span aria-label="Leído" title="Leído">
                  <CheckCheck className="h-3 w-3 text-[#00E5FF]" />
                </span>
              ) : (
                <span aria-label="Enviado" title="Enviado">
                  <Check className="h-3 w-3" />
                </span>
              ))}
          </div>
        </div>
      </li>
      {lightboxOpen && message.attachmentUrl && (
        <ImageLightbox
          url={message.attachmentUrl}
          filename={message.attachmentFilename}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}
