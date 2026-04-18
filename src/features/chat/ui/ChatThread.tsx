'use client'
import { useEffect, useRef } from 'react'
import { Loader2, MessageCircle } from 'lucide-react'
import type { ChatMessageView } from '../types'
import { ChatBubble } from './ChatBubble'
import { TypingIndicator } from './TypingIndicator'

interface Props {
  messages: ChatMessageView[]
  isLoading?: boolean
  /** When true, renders a "Soporte está escribiendo…" bubble at the
   *  end of the thread. Driven by the agent typing in their inbox. */
  isAgentTyping?: boolean
}

/**
 * Day separator label: "Hoy" / "Ayer" / "DD MMM" for everything older.
 * We compare by local date components so messages sent at 23:59 and 00:01
 * render under different day labels (matching WhatsApp's convention).
 */
function dayLabel(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (sameDay(d, today)) return 'Hoy'
  if (sameDay(d, yesterday)) return 'Ayer'
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
}

export function ChatThread({
  messages,
  isLoading = false,
  isAgentTyping = false,
}: Readonly<Props>) {
  const endRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll to bottom on every message addition AND when the typing
  // indicator appears, so the user sees "Soporte escribiendo…" without
  // a manual scroll. Smooth behavior reads as movement, not as a jump.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, isAgentTyping])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        <span className="sr-only">Cargando conversación</span>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 text-gray-500 dark:text-gray-400">
        <MessageCircle
          className="h-10 w-10 mb-3 text-gray-300 dark:text-gray-600"
          aria-hidden="true"
        />
        <p className="text-sm">Escribe tu primer mensaje y te respondemos lo antes posible.</p>
      </div>
    )
  }

  // Precompute which messages should be preceded by a day separator. We
  // do this in a single pass before the JSX (rather than carrying state
  // through the map callback) because the React Compiler flags closure
  // mutation as `react-hooks/immutability`. Pure derivation = clean.
  const showSeparatorAt = new Array<boolean>(messages.length)
  let lastDayKey = ''
  for (let i = 0; i < messages.length; i++) {
    const dayKey = new Date(messages[i].createdAt).toDateString()
    showSeparatorAt[i] = dayKey !== lastDayKey
    lastDayKey = dayKey
  }

  return (
    <ol className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50 dark:bg-[#0A192F]">
      {messages.map((m, i) => (
        <div key={m.id}>
          {showSeparatorAt[i] && (
            <li aria-hidden="true" className="flex justify-center py-2">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 bg-white dark:bg-[#1E293B] px-2.5 py-0.5 rounded-full border border-gray-200 dark:border-[#334155]">
                {dayLabel(m.createdAt)}
              </span>
            </li>
          )}
          <ChatBubble message={m} />
        </div>
      ))}
      {isAgentTyping && (
        <li className="pt-1">
          <TypingIndicator label="Soporte está escribiendo" />
        </li>
      )}
      <div ref={endRef} />
    </ol>
  )
}
