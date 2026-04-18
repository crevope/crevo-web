import { apiClient } from '@/shared/api/client'
import { supabase } from '@/shared/lib/supabase'
import type { ChatAttachmentUploadUrl, ChatConversationView, ChatMessageView } from '../types'

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
   *
   * `attachment` is only populated when the user attached a file (the
   * upload flow is: requestUploadUrl → uploadAttachment → sendMessage
   * with the resulting path). Body and attachment can be sent together
   * (image with caption) or independently.
   */
  async sendMessage(
    body: string,
    attachment?: {
      path: string
      mimeType: string
      filename: string
      sizeBytes?: number
    },
  ): Promise<ChatMessageView> {
    const { data } = await apiClient.post('/chat/messages', { body, attachment })
    return data?.data as ChatMessageView
  },

  /**
   * Step 1 of the attachment flow: ask the backend for a one-shot
   * signed URL the browser can PUT a file to. The backend validates
   * MIME + size + ownership before signing. Path is opaque to the
   * caller — just needs to be passed back into sendMessage().
   */
  async requestUploadUrl(params: {
    conversationId: string
    filename: string
    mimeType: string
    sizeBytes: number
  }): Promise<ChatAttachmentUploadUrl> {
    const { data } = await apiClient.post('/chat/attachments/upload-url', params)
    return data?.data as ChatAttachmentUploadUrl
  },

  /**
   * Step 2 of the attachment flow: actually upload the file using the
   * signed URL. Uses the Supabase JS SDK helper which handles the
   * Bearer token + multipart envelope correctly. Throws on failure;
   * caller should rollback any optimistic UI.
   */
  async uploadAttachment(file: File, signed: ChatAttachmentUploadUrl): Promise<void> {
    const { error } = await supabase.storage
      .from('chat-attachments')
      .uploadToSignedUrl(signed.path, signed.token, file, {
        contentType: file.type,
      })
    if (error) {
      throw new Error(error.message || 'No se pudo subir el archivo')
    }
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
