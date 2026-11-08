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

/**
 * Convierte a Date respetando el día que dice el string.
 *
 * `new Date('2026-08-31')` se interpreta como medianoche UTC, que en Lima
 * (UTC-5) es el 30 a las 19:00 — la cuota se mostraba un día antes de su
 * vencimiento. Las fechas sin hora (`YYYY-MM-DD`, como `installments.due_date`)
 * son días de calendario, no instantes: se construyen en horario local.
 */
export function parseDate(date: string | Date): Date {
  if (date instanceof Date) return date
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!dateOnlyMatch) return new Date(date)
  return new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parseDate(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parseDate(date))
}

export function formatRelativeDate(date: string | Date): string {
  const diff = Math.floor((Date.now() - parseDate(date).getTime()) / 1000)
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
