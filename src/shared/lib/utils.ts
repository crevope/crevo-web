import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatRelativeDate(date: string | Date): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diff < 60) return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  return formatDate(date)
}

export function calculateTotalWithInterest(amount: number, termDays: number, tea = 0.18): number {
  return amount * (1 + (tea / 365) * termDays)
}

/** Returns "PrimerNombre PrimerApellido" — trims compound names. */
export function shortName(firstName: string, lastName: string): string {
  const first = firstName.trim().split(/\s+/)[0] ?? firstName
  const last = lastName.trim().split(/\s+/)[0] ?? lastName
  return `${first} ${last}`
}

/**
 * Returns the last 12 hex characters of a UUID as an uppercase string,
 * suitable as a human-readable loan reference (e.g. "A4F0C2E18B3D").
 * The last segment of a UUID is always 12 pure hex chars with no dashes.
 */
export function loanRef(id: string): string {
  return id.slice(-12).toUpperCase()
}
