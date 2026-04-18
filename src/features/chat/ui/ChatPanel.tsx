'use client'
import { useEffect } from 'react'
import { X, Headphones } from 'lucide-react'
import { useChatStore } from '../model/useChatStore'
import { ChatThread } from './ChatThread'
import { ChatComposer } from './ChatComposer'

/**
 * Slide-up panel anchored to the bottom-right corner. Renders only when
 * `isPanelOpen` is true; the launcher controls the open/close state.
 *
 * Sized to feel like a familiar chat client: ~380px wide on desktop,
 * fullscreen on mobile (so the composer is always within thumb reach).
 *
 * Accessibility:
 *   - role="dialog" + aria-modal=false (we don't trap focus; users can
 *     still interact with the rest of the page).
 *   - Escape closes.
 *   - Focus moves to the composer when the panel opens (handled by the
 *     composer's autoFocus prop on mount inside the panel).
 */
export function ChatPanel() {
  const isPanelOpen = useChatStore((s) => s.isPanelOpen)
  const conversation = useChatStore((s) => s.conversation)
  const messages = useChatStore((s) => s.messages)
  const isHydrating = useChatStore((s) => s.isHydrating)
  const isAgentTyping = useChatStore((s) => s.isAgentTyping)
  const closePanel = useChatStore((s) => s.closePanel)
  const markPanelRead = useChatStore((s) => s.markPanelRead)

  // Mark the conversation as read whenever the panel is open AND new
  // messages arrive. The store's _handleEvent already auto-calls this
  // when an agent message lands while the panel is open, but we double
  // up here to cover the edge case of the user opening the panel after
  // unread messages were already in state.
  useEffect(() => {
    if (!isPanelOpen) return
    void markPanelRead()
  }, [isPanelOpen, messages.length, markPanelRead])

  // Escape to close
  useEffect(() => {
    if (!isPanelOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isPanelOpen, closePanel])

  if (!isPanelOpen) return null

  const isClosed = conversation?.status === 'CLOSED'

  return (
    <div
      role="dialog"
      aria-label="Chat de soporte"
      aria-modal="false"
      className="
        fixed inset-x-0 bottom-0 z-50 sm:inset-x-auto sm:bottom-6 sm:right-6
        flex flex-col
        bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#334155]
        rounded-t-2xl sm:rounded-2xl shadow-2xl
        h-[80vh] sm:h-[600px] sm:w-[380px] max-h-[700px]
        animate-in slide-in-from-bottom-4 duration-200
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 bg-[#0A192F] text-white rounded-t-2xl">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-full bg-[#D4AF37] flex items-center justify-center shrink-0">
            <Headphones className="h-4 w-4 text-[#0A192F]" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Soporte Crevo</p>
            <p className="text-[11px] text-gray-300 truncate">
              {isClosed ? 'Conversación cerrada' : 'Disponible 24/7 · Respondemos pronto'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={closePanel}
          aria-label="Cerrar chat"
          className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors shrink-0"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Thread (grows to fill) */}
      <ChatThread
        messages={messages}
        isLoading={isHydrating && messages.length === 0}
        isAgentTyping={isAgentTyping}
      />

      {/* Composer */}
      <ChatComposer isClosed={isClosed} />
    </div>
  )
}
