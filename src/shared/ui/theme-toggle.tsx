'use client'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from './button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const cycles = { light: 'dark', dark: 'system', system: 'light' } as const
  const icons = { light: Sun, dark: Moon, system: Monitor }
  const current = (theme as keyof typeof cycles) ?? 'system'
  const Icon = icons[current] ?? Monitor
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(cycles[current])}
      title={`Tema: ${current}`}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}
