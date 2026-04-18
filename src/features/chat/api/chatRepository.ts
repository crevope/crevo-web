import { apiClient } from '@/shared/api/client'
import type { ChatConversationView, ChatMessageView } from '../types'

/**
 * REST client for the user-facing chat endpoints.
 *
 * The backend (ChatController) wraps every response in
 * `{success, message, data}`. We unwrap `data` here so callers see the
 * domain shape directly. Tolerates partial payloads — if a field is
 * missing the strict types would throw at compile time, but at runtime
 * we degrade gracefully (empty arrays, null conversations).
 */

interface ChatHydratePayload {
  conversation: ChatConversationView | null
  messages: ChatMessageView[]
}

export const chatRepository = {
  /**
   * Returns the user's open conversation + messages, or `{conversation: null, messages: []}`
   * if they don't have one yet. Single round-trip — used to hydrate the
   * widget on mount.
   */
  async getMine(): Promise<ChatHydratePayload> {
    const { data } = await apiClient.get('/chat/me')
    const payload = (data?.data ?? {}) as Partial<ChatHydratePayload>
    return {
      conversation: payload.conversation ?? null,
      messages: Array.isArray(payload.messages) ? payload.messages : [],
    }
  },

  /**
   * Idempotent: returns the existing open conversation OR creates a fresh
   * one + seeds the SYSTEM welcome message. Use this when the user has
   * no current conversation (the widget calls it the first time the
   * launcher is clicked).
   */
  async start(): Promise<ChatHydratePayload> {
    const { data } = await apiClient.post('/chat/start', {})
    const payload = (data?.data ?? {}) as Partial<ChatHydratePayload>
    return {
      conversation: payload.conversation ?? null,
      messages: Array.isArray(payload.messages) ? payload.messages : [],
    }
  },

  /**
   * Send a message from the user. Returns the persisted ChatMessageView
   * (with the canonical server-side id + createdAt). The store uses this
   * to swap out the optimistic temp message.
   */
  async sendMessage(body: string): Promise<ChatMessageView> {
    const { data } = await apiClient.post('/chat/messages', { body })
    return data?.data as ChatMessageView
  },

  /**
   * Marks all unread agent messages as read. Server returns the count
   * updated; the widget uses it to decide whether to broadcast a read
   * receipt event (only if anything actually changed).
   */
  async markRead(): Promise<{ updated: number }> {
    const { data } = await apiClient.post('/chat/read', {})
    return (data?.data ?? { updated: 0 }) as { updated: number }
  },
}
