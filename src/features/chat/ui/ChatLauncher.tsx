'use client'
import { MessageCircle } from 'lucide-react'
import { useChatStore } from '../model/useChatStore'
import { ChatPanel } from './ChatPanel'

/**
 * Floating action button anchored to the bottom-right + the slide-up
 * panel mounted alongside it. Always rendered on private routes; the
 * panel gates its own visibility via `useChatStore.isPanelOpen` so this
 * file just toggles the launcher and lets the panel do its own thing.
 *
 * The badge surfaces the unread count from agent messages received while
 * the panel was closed. SYSTEM messages (welcome, close notice) don't
 * count — only actual support replies.
 */
export function ChatWidget() {
  return (
    <>
      <ChatLauncherButton />
      <ChatPanel />
    </>
  )
}

function ChatLauncherButton() {
  const isPanelOpen = useChatStore((s) => s.isPanelOpen)
  const togglePanel = useChatStore((s) => s.togglePanel)
  const unreadInPanel = useChatStore((s) => s.unreadInPanel)

  // Hidden when the panel is open: it lives at the same anchor and its
  // close button serves the same purpose; rendering both is visual noise.
  if (isPanelOpen) return null

  return (
    <button
      type="button"
      onClick={() => void togglePanel()}
      aria-label={
        unreadInPanel > 0
          ? `Abrir chat de soporte (${unreadInPanel} mensajes nuevos)`
          : 'Abrir chat de soporte'
      }
      className="
        fixed bottom-5 right-5 z-40
        h-14 w-14 rounded-full
        bg-[#0A192F] text-[#D4AF37]
        flex items-center justify-center
        shadow-xl shadow-[#0A192F]/30
        hover:bg-[#112240] hover:scale-105
        active:scale-95
        transition-all duration-150
        focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/40
      "
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
      {unreadInPanel > 0 && (
        <span
          aria-hidden="true"
          className="
            absolute -top-1 -right-1
            min-w-[22px] h-[22px] px-1.5
            rounded-full bg-[#00E5FF] text-[#0A192F]
            text-[11px] font-bold
            flex items-center justify-center
            border-2 border-white dark:border-[#0F172A]
          "
        >
          {unreadInPanel > 9 ? '9+' : unreadInPanel}
        </span>
      )}
    </button>
  )
}
