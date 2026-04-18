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
 *
 * Each category exposes a representative `icon` emoji used as the tab
 * label (matches the iOS / Android emoji keyboard mental model the user
 * already has, and avoids the cramped-text-tab problem of name labels
 * in a 280px popover).
 */
interface EmojiCategory {
  id: string
  label: string
  icon: string
  emojis: string[]
}

const EMOJI_GROUPS: EmojiCategory[] = [
  {
    id: 'common',
    label: 'Comunes',
    icon: '😊',
    emojis: ['😊', '😀', '😅', '🤗', '🙂', '😉', '😌', '🤔', '😎', '🥲', '😂', '🙃', '😬', '😢'],
  },
  {
    id: 'reactions',
    label: 'Reacciones',
    icon: '👍',
    emojis: ['👍', '👎', '👌', '🙏', '💪', '👏', '🙌', '🤝', '✅', '❌', '⚠️', '❗', '❓'],
  },
  {
    id: 'comm',
    label: 'Comunicación',
    icon: '💬',
    emojis: ['💬', '📧', '📞', '✍️', '📝', '👀', '💡', '📌', '🔔'],
  },
  {
    id: 'finance',
    label: 'Finanzas',
    icon: '💰',
    emojis: ['💰', '💸', '💳', '📊', '📈', '📉', '💼', '💵', '🏦'],
  },
  {
    id: 'other',
    label: 'Otros',
    icon: '🎉',
    emojis: ['🎉', '🎁', '❤️', '✨', '🚀', '⭐', '🔥', '💯', '🌟'],
  },
]

interface Props {
  /** Called when the user picks an emoji. The composer should insert it
   *  at the textarea's current selection. The picker stays open so users
   *  can pick multiple emojis in a row — close it via outside click /
   *  Escape / the same trigger button. */
  onSelect: (emoji: string) => void
  /** Called when the picker should close (outside click, Escape). */
  onClose: () => void
}

export function EmojiPicker({ onSelect, onClose }: Readonly<Props>) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [activeCategoryId, setActiveCategoryId] = useState<string>(EMOJI_GROUPS[0].id)

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const active = EMOJI_GROUPS.find((g) => g.id === activeCategoryId) ?? EMOJI_GROUPS[0]

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Selector de emojis"
      className="
        absolute bottom-full left-0 mb-2 z-50
        w-[280px] bg-white dark:bg-[#0F172A]
        border border-gray-200 dark:border-[#334155] rounded-md shadow-xl
        overflow-hidden
        animate-in fade-in slide-in-from-bottom-2 duration-150
      "
    >
      {/* Category tabs — emoji icons instead of text labels.
          Matches the iOS / Android keyboard pattern (each tab is a
          representative glyph) and avoids the cramped-text problem
          a 280px popover has with 5 Spanish category names. */}
      <div className="flex border-b border-gray-200 dark:border-[#334155] bg-gray-50 dark:bg-[#1E293B]">
        {EMOJI_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setActiveCategoryId(g.id)}
            aria-label={g.label}
            title={g.label}
            className={`
              flex-1 py-2 text-base flex items-center justify-center transition-colors
              ${
                activeCategoryId === g.id
                  ? 'bg-white dark:bg-[#0F172A] border-b-2 border-[#0A192F] dark:border-[#D4AF37] -mb-px'
                  : 'opacity-60 hover:opacity-100 hover:bg-white/50 dark:hover:bg-[#0F172A]/50'
              }
            `}
          >
            <span aria-hidden="true">{g.icon}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="p-2 grid grid-cols-7 gap-1 max-h-[200px] overflow-y-auto">
        {active.emojis.map((e) => (
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
