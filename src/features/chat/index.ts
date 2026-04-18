// Public surface of the chat feature. The private layout imports just
// `ChatWidget` and the store; everything else is internal.
export { ChatWidget } from './ui/ChatLauncher'
export { useChatStore } from './model/useChatStore'
export type {
  ChatConversationView,
  ChatMessageView,
  ChatSenderType,
  ChatConversationStatus,
} from './types'
