'use client'

interface Props {
  /** Screen-reader-only label describing who is typing. */
  label: string
}

/**
 * Three-dots-bouncing bubble shown at the bottom of the chat thread when
 * the OTHER party is composing a message. Visually mirrors an incoming
 * agent message (left-aligned, pale background) so it reads as "almost
 * a message, not yet sent" rather than as a status banner.
 *
 * The dots use Tailwind's animate-bounce with staggered animation-delays
 * to produce the classic chat-bubble pulse. `aria-live="polite"` so
 * screen readers announce when the indicator appears.
 */
export function TypingIndicator({ label }: Readonly<Props>) {
  return (
    <div className="flex justify-start" role="status" aria-live="polite" aria-label={label}>
      <div className="bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-[#334155] rounded-2xl rounded-bl-sm px-3.5 py-2.5 inline-flex items-center gap-1">
        <Dot delay="0ms" />
        <Dot delay="150ms" />
        <Dot delay="300ms" />
      </div>
    </div>
  )
}

function Dot({ delay }: Readonly<{ delay: string }>) {
  return (
    <span
      aria-hidden="true"
      className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
      style={{ animationDelay: delay, animationDuration: '1s' }}
    />
  )
}
