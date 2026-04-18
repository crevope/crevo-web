'use client'
import { Check, CheckCheck, Info } from 'lucide-react'
import type { ChatMessageView } from '../types'
import { isTempId } from '../types'

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

  return (
    <li
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
      aria-label={isUser ? 'Mi mensaje' : 'Mensaje de soporte'}
    >
      <div
        className={`
          max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-snug whitespace-pre-wrap break-words
          ${
            isUser
              ? 'bg-[#0A192F] text-white rounded-br-sm dark:bg-[#1E293B]'
              : 'bg-white text-[#0A192F] rounded-bl-sm border border-gray-200 dark:bg-[#0F172A] dark:text-[#F1F5F9] dark:border-[#334155]'
          }
        `}
      >
        <p>{message.body}</p>
        <div
          className={`
            mt-1 flex items-center gap-1 justify-end text-[10px]
            ${isUser ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'}
          `}
        >
          <span>{formatTime(message.createdAt)}</span>
          {/* Read receipt — only on the user's own messages */}
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
  )
}
