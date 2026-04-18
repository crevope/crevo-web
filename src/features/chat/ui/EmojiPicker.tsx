'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * Curated emoji set for support-chat usage. Deliberately small (~60 emojis
 * in 5 categories) instead of pulling a 4000-emoji library — the bundle
 * delta of `emoji-picker-react` (~70KB gz) isn't worth it for a fintech
 * support widget where the practical vocabulary is tiny.
 *
 * The order within each category roughly tracks usage frequency in
 * customer-service contexts (Crevo's audience: PE consumer fintech).
 */
const EMOJI_GROUPS: Record<string, string[]> = {
  Comunes: ['😊', '😀', '😅', '🤗', '🙂', '😉', '😌', '🤔', '😎', '🥲', '😂', '🙃', '😬', '😢'],
  Reacciones: ['👍', '👎', '👌', '🙏', '💪', '👏', '🙌', '🤝', '✅', '❌', '⚠️', '❗', '❓'],
  Comunicación: ['💬', '📧', '📞', '✍️', '📝', '👀', '💡', '📌', '🔔'],
  Finanzas: ['💰', '💸', '💳', '📊', '📈', '📉', '💼', '💵', '🏦'],
  Otros: ['🎉', '🎁', '❤️', '✨', '🚀', '⭐', '🔥', '💯', '🌟'],
}

interface Props {
  /** Called when the user picks an emoji. The composer should insert it
   *  at the textarea's current selection. The picker stays open so users
   *  can pick multiple emojis in a row — close it via outside click /
   *  Escape / the same trigger button. */
  onSelect: (emoji: string) => void
  /** Called when the picker should close (outside click, Escape). */
  onClose: () => void
}

/**
 * Floating emoji picker positioned above the composer. Anchors to its
 * parent (the composer's emoji button), which means the parent must be
 * `position: relative`.
 *
 * Closes on:
 *   - Escape key (anywhere)
 *   - Click outside the picker
 *
 * Stays open when the user picks an emoji, so emoji-strings like "✅✅"
 * are easy. The composer also updates the textarea selection so the
 * cursor sits AFTER the inserted emoji.
 */
export function EmojiPicker({ onSelect, onClose }: Readonly<Props>) {
  const ref = useRef<HTMLDivElement | null>(null)
  // Track the currently active category tab. Defaults to "Comunes" since
  // that covers ~80% of natural usage.
  const [activeCategory, setActiveCategory] = useState<string>(Object.keys(EMOJI_GROUPS)[0])

  // Click outside → close. Mousedown (not click) so the close fires
  // before the outside element gets its own click handler — matters
  // when the outside thing is the emoji-trigger button which would
  // otherwise immediately reopen us.
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [onClose])

  // Escape closes — symmetric with the panel's own Escape close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const emojis = EMOJI_GROUPS[activeCategory] ?? []

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Selector de emojis"
      className="
        absolute bottom-full left-0 mb-2 z-50
        w-[280px] bg-white dark:bg-[#0F172A]
        border border-gray-200 dark:border-[#334155] rounded-xl shadow-xl
        overflow-hidden
        animate-in fade-in slide-in-from-bottom-2 duration-150
      "
    >
      {/* Category tabs */}
      <div className="flex border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1E293B]">
        {Object.keys(EMOJI_GROUPS).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`
              flex-1 py-1.5 text-[11px] font-medium transition-colors
              ${
                activeCategory === cat
                  ? 'text-[#0A192F] dark:text-[#D4AF37] border-b-2 border-[#0A192F] dark:border-[#D4AF37] -mb-px'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="p-2 grid grid-cols-7 gap-1 max-h-[200px] overflow-y-auto">
        {emojis.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onSelect(e)}
            aria-label={`Insertar ${e}`}
            className="h-8 w-8 flex items-center justify-center rounded-md text-xl hover:bg-gray-100 dark:hover:bg-[#1E293B] transition-colors"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  )
}
