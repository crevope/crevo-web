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
  /** May be empty string when the message is attachment-only. */
  body: string
  readAt: string | null
  createdAt: string

  // Attachment metadata (Phase 2 — images only). All fields null when
  // the message has no attachment.
  attachmentPath?: string | null
  attachmentMimeType?: string | null
  attachmentFilename?: string | null
  attachmentSizeBytes?: number | null
  /** Signed download URL — server-side TTL ~1h. Null on server-side
   *  signing failure (UI shows a placeholder). Re-fetched whenever the
   *  conversation is hydrated. */
  attachmentUrl?: string | null
}

/** Phase 1 attachment whitelist — kept in sync with backend. */
export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const
export type ChatAttachmentMimeType = (typeof ALLOWED_ATTACHMENT_MIME_TYPES)[number]
export const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024

/** Response shape from POST /chat/attachments/upload-url. */
export interface ChatAttachmentUploadUrl {
  path: string
  signedUrl: string
  token: string
  expiresIn: number
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

/** Symmetric to conversation_closed — agent re-opened a CLOSED thread.
 *  Widget flips status back to OPEN so the composer re-enables. */
export interface ChatBroadcastConversationReopenedEvent {
  type: 'conversation_reopened'
  conversationId: string
  reopenedAt: string
}

/**
 * Transient "X is typing" signal. Emitted client→client directly via
 * Supabase Realtime (no backend involvement, no DB row), debounced on
 * the sender, auto-cleared after 5s on the receiver in case the
 * "stopped" event is lost.
 */
export interface ChatBroadcastTypingEvent {
  type: 'typing'
  conversationId: string
  senderType: 'user' | 'agent'
  isTyping: boolean
  at: string
}

export type ChatBroadcastEvent =
  | ChatBroadcastMessageEvent
  | ChatBroadcastReadReceiptEvent
  | ChatBroadcastConversationClosedEvent
  | ChatBroadcastConversationReopenedEvent
  | ChatBroadcastTypingEvent

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
