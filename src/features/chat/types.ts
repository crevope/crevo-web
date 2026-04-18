/**
 * Wire format for the chat feature. Mirrors the JSON shapes returned by
 * crevo-backend's ChatController (toUserJSON variants for the user-facing
 * widget) and the broadcast event union emitted by SupabaseChatBroadcaster.
 *
 * Dates arrive as ISO 8601 strings over the wire; we keep them as strings
 * here and parse to Date on demand at render time (avoids a re-serialization
 * step in the store).
 */

export type ChatSenderType = 'user' | 'agent' | 'system'
export type ChatConversationStatus = 'OPEN' | 'CLOSED'

/** From `ChatConversation.toUserJSON()`. */
export interface ChatConversationView {
  id: string
  status: ChatConversationStatus
  isAssigned: boolean
  lastMessageAt: string | null
  lastMessageSender: ChatSenderType | null
  lastMessagePreview: string | null
  unreadCount: number
  createdAt: string
  closedAt: string | null
}

/** From `ChatMessage.toUserJSON()`. */
export interface ChatMessageView {
  id: string
  conversationId: string
  senderType: ChatSenderType
  senderId: string | null
  body: string
  readAt: string | null
  createdAt: string
}

// ─── Broadcast event union (mirrors backend IChatBroadcaster) ────────────────

export interface ChatBroadcastMessageEvent {
  type: 'message'
  message: ChatMessageView
}

export interface ChatBroadcastReadReceiptEvent {
  type: 'read_receipt'
  conversationId: string
  readerType: 'user' | 'agent'
  at: string
}

export interface ChatBroadcastConversationClosedEvent {
  type: 'conversation_closed'
  conversationId: string
  closedAt: string
}

export type ChatBroadcastEvent =
  | ChatBroadcastMessageEvent
  | ChatBroadcastReadReceiptEvent
  | ChatBroadcastConversationClosedEvent

// ─── Helpers shared across UI ────────────────────────────────────────────────

/**
 * Optimistic-message marker. We append a fake message with a temporary id
 * the moment the user hits Send, so the bubble appears instantly.
 * The real backend response REPLACES this entry by matching on
 * (clientTempId === temp prefix) → swap into the canonical ChatMessageView
 * with its real id + createdAt.
 */
export const TEMP_ID_PREFIX = 'temp-'

export function isTempId(id: string): boolean {
  return id.startsWith(TEMP_ID_PREFIX)
}
