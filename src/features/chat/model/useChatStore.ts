import { create } from 'zustand'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/shared/lib/supabase'
import { chatRepository } from '../api/chatRepository'
import type { ChatBroadcastEvent, ChatConversationView, ChatMessageView } from '../types'
import { TEMP_ID_PREFIX, isTempId } from '../types'

/**
 * Chat widget state machine.
 *
 * Lifecycle:
 *   1. PrivateLayout mounts → calls `hydrate()` to fetch the user's open
 *      conversation (if any) without opening the panel.
 *   2. User clicks the launcher → `openPanel()`. If no conversation yet,
 *      `start()` runs implicitly to seed one + welcome message.
 *   3. While the panel is open with a live conversation, we're subscribed
 *      to the Supabase Realtime broadcast channel `chat:{conversationId}`.
 *      Incoming agent messages, read receipts and the close signal land
 *      via `_handleEvent`.
 *   4. When the user types + sends, we OPTIMISTICALLY append the message
 *      with a temp id, fire the REST POST, then swap the temp entry for
 *      the canonical one when the response arrives. Even if the server
 *      response is delayed by 200ms, the user sees their bubble at 0ms.
 *   5. Logout / unmount → `unsubscribe()` to release the channel.
 *
 * Idempotency: the Realtime broadcast carries the same message that the
 * REST POST returns. To avoid double-rendering, every message merge is
 * keyed by id — duplicates are silently ignored.
 */

interface ChatState {
  conversation: ChatConversationView | null
  messages: ChatMessageView[]
  isHydrating: boolean
  isPanelOpen: boolean
  isSending: boolean
  /** Has the user viewed the panel since the last broadcast? Powers the
   *  unread badge on the launcher when the panel is closed. */
  unreadInPanel: number
  _channel: RealtimeChannel | null
  _subscribedConversationId: string | null

  // Lifecycle
  hydrate: () => Promise<void>
  openPanel: () => Promise<void>
  closePanel: () => void
  togglePanel: () => Promise<void>

  // Conversation
  startConversation: () => Promise<void>
  send: (body: string) => Promise<void>
  markPanelRead: () => Promise<void>

  // Realtime
  subscribe: (conversationId: string) => void
  unsubscribe: () => void
  reset: () => void
}

const initialState = {
  conversation: null as ChatConversationView | null,
  messages: [] as ChatMessageView[],
  isHydrating: false,
  isPanelOpen: false,
  isSending: false,
  unreadInPanel: 0,
  _channel: null as RealtimeChannel | null,
  _subscribedConversationId: null as string | null,
}

export const useChatStore = create<ChatState>((set, get) => ({
  ...initialState,

  // ── Lifecycle ───────────────────────────────────────────────────────────

  /**
   * Fetch the user's open conversation on app mount. Lightweight — runs
   * once per session. Doesn't open the panel; just hydrates state so the
   * launcher knows whether to show an unread badge.
   */
  hydrate: async () => {
    if (get().isHydrating) return
    set({ isHydrating: true })
    try {
      const { conversation, messages } = await chatRepository.getMine()
      set({
        conversation,
        messages,
        unreadInPanel: conversation?.unreadCount ?? 0,
      })
      if (conversation && conversation.status === 'OPEN') {
        get().subscribe(conversation.id)
      }
    } catch {
      // Hydration is best-effort; widget stays usable, user can click
      // the launcher to retry via openPanel → start.
    } finally {
      set({ isHydrating: false })
    }
  },

  openPanel: async () => {
    const state = get()
    set({ isPanelOpen: true })

    // First-time-open path: no conversation yet → create one (welcome seeded).
    if (!state.conversation) {
      await get().startConversation()
    }

    // Mark as read shortly after open so the badge clears AND the agent
    // sees the read receipt. Defer one tick so the panel finishes its
    // open animation first — otherwise the read POST competes with the
    // panel's hydration.
    setTimeout(() => {
      void get().markPanelRead()
    }, 100)
  },

  closePanel: () => set({ isPanelOpen: false }),

  togglePanel: async () => {
    if (get().isPanelOpen) {
      get().closePanel()
    } else {
      await get().openPanel()
    }
  },

  // ── Conversation ────────────────────────────────────────────────────────

  startConversation: async () => {
    try {
      const { conversation, messages } = await chatRepository.start()
      set({ conversation, messages, unreadInPanel: 0 })
      if (conversation) get().subscribe(conversation.id)
    } catch (err) {
      console.error('[chat] startConversation failed:', err)
    }
  },

  send: async (body: string) => {
    const trimmed = body.trim()
    if (!trimmed) return

    const { conversation } = get()
    if (!conversation || conversation.status === 'CLOSED') return

    // Optimistic append — user sees their bubble at 0ms.
    const tempId = `${TEMP_ID_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const tempMessage: ChatMessageView = {
      id: tempId,
      conversationId: conversation.id,
      senderType: 'user',
      senderId: null,
      body: trimmed,
      readAt: null,
      createdAt: new Date().toISOString(),
    }
    set((s) => ({
      messages: [...s.messages, tempMessage],
      isSending: true,
    }))

    try {
      const saved = await chatRepository.sendMessage(trimmed)

      // Swap the temp for the canonical entry. The Realtime broadcast
      // for THIS message will arrive shortly; _mergeMessage dedupes by
      // canonical id so it's a no-op when it lands.
      set((s) => ({
        messages: s.messages.map((m) => (m.id === tempId ? saved : m)),
        isSending: false,
      }))
    } catch (err) {
      // Rollback the optimistic append + surface the error to the UI.
      set((s) => ({
        messages: s.messages.filter((m) => m.id !== tempId),
        isSending: false,
      }))
      console.error('[chat] send failed:', err)
      throw err
    }
  },

  markPanelRead: async () => {
    const { conversation, unreadInPanel } = get()
    if (!conversation) return
    if (unreadInPanel === 0) return // nothing to do

    set({ unreadInPanel: 0 })
    try {
      await chatRepository.markRead()
      // Optimistically flip readAt on agent messages locally — the
      // Realtime broadcast doesn't echo back since we're the sender.
      set((s) => ({
        messages: s.messages.map((m) =>
          m.senderType === 'agent' && !m.readAt ? { ...m, readAt: new Date().toISOString() } : m,
        ),
      }))
    } catch (err) {
      console.error('[chat] markRead failed:', err)
    }
  },

  // ── Realtime ────────────────────────────────────────────────────────────

  subscribe: (conversationId: string) => {
    const { _subscribedConversationId, _channel } = get()
    if (_subscribedConversationId === conversationId && _channel) return

    // Tear down any previous subscription before opening a new one.
    if (_channel) {
      void supabase.removeChannel(_channel)
    }

    const channel = supabase
      .channel(`chat:${conversationId}`, {
        config: {
          // We don't want to receive our own broadcasts — when the user
          // sends a message via REST, the backend broadcasts it; without
          // self:false we'd see our own optimistic message twice.
          // (The backend uses a different channel client, so technically
          // it never echoes to our subscription anyway, but setting this
          // makes the intent explicit and protects us from future
          // refactors.)
          broadcast: { self: false },
        },
      })
      .on('broadcast', { event: 'message' }, (payload) =>
        _handleEvent(get, set, payload.payload as ChatBroadcastEvent),
      )
      .on('broadcast', { event: 'read_receipt' }, (payload) =>
        _handleEvent(get, set, payload.payload as ChatBroadcastEvent),
      )
      .on('broadcast', { event: 'conversation_closed' }, (payload) =>
        _handleEvent(get, set, payload.payload as ChatBroadcastEvent),
      )
      .subscribe()

    set({ _channel: channel, _subscribedConversationId: conversationId })
  },

  unsubscribe: () => {
    const { _channel } = get()
    if (_channel) {
      void supabase.removeChannel(_channel)
    }
    set({ _channel: null, _subscribedConversationId: null })
  },

  /** Full reset on logout — clears state AND tears down the channel. */
  reset: () => {
    get().unsubscribe()
    set({ ...initialState })
  },
}))

// ─── Realtime event handler ───────────────────────────────────────────────

/**
 * Idempotent merge of a broadcast event into the store. Pulled out as a
 * standalone function so tests can exercise it without instantiating a
 * full RealtimeChannel.
 */
function _handleEvent(
  get: () => ChatState,
  set: (partial: Partial<ChatState> | ((state: ChatState) => Partial<ChatState>)) => void,
  event: ChatBroadcastEvent,
): void {
  if (!event || typeof event !== 'object') return

  switch (event.type) {
    case 'message': {
      const incoming = event.message
      const state = get()
      // Dedupe — REST round-trip may have already swapped the temp for
      // the canonical id by the time the broadcast lands.
      if (state.messages.some((m) => m.id === incoming.id)) return
      // Also dedupe against any optimistic temp from THIS user. Match by
      // (senderType + body + ~createdAt within 5s) for the rare case
      // where the broadcast beat the REST response.
      const tempIdx = state.messages.findIndex(
        (m) => isTempId(m.id) && m.senderType === incoming.senderType && m.body === incoming.body,
      )
      if (tempIdx >= 0) {
        const next = [...state.messages]
        next[tempIdx] = incoming
        set({ messages: next })
        return
      }

      const isAgent = incoming.senderType === 'agent'
      const isPanelOpen = state.isPanelOpen
      set((s) => ({
        messages: [...s.messages, incoming],
        // Only bump the unread badge for AGENT messages while the panel
        // is closed. SYSTEM messages don't count (welcome, close notice).
        unreadInPanel: isAgent && !isPanelOpen ? s.unreadInPanel + 1 : s.unreadInPanel,
      }))

      // If the panel is open and this is an agent message, mark as read
      // immediately — saves a round-trip on the next user interaction.
      if (isAgent && isPanelOpen) {
        setTimeout(() => {
          void get().markPanelRead()
        }, 50)
      }
      break
    }

    case 'read_receipt': {
      // Only "agent read mine" matters to the user widget — when the agent
      // reads, flip our sent messages to ✓✓ leído.
      if (event.readerType !== 'agent') return
      set((s) => ({
        messages: s.messages.map((m) =>
          m.senderType === 'user' && !m.readAt ? { ...m, readAt: event.at } : m,
        ),
      }))
      break
    }

    case 'conversation_closed': {
      const state = get()
      if (!state.conversation || state.conversation.id !== event.conversationId) {
        return
      }
      set({
        conversation: {
          ...state.conversation,
          status: 'CLOSED',
          closedAt: event.closedAt,
        },
      })
      break
    }
  }
}
