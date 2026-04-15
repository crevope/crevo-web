import Link from 'next/link'
import type { ReactNode } from 'react'
import { LEGAL_LINKS } from '../lib/legalConstants'

interface LegalPageLayoutProps {
  title: string
  version: string
  effectiveDate: string  // ISO YYYY-MM-DD; rendered as-is in the header
  intro?: string
  /**
   * Path of the current page (e.g. `/terminos-y-condiciones`). When provided,
   * it's hidden from the "Otros documentos legales" footer so we don't render
   * a self-link. Optional — if omitted all links render.
   */
  currentHref?: string
  /**
   * Wraps children in `<article class="legal-prose">` so long-form legal copy
   * picks up the shared typography. Defaults to `true` — set to `false` for
   * pages that ship their own layout (e.g. the Tariff page, which uses cards
   * and tables and would fight with prose spacing/color rules).
   */
  proseWrap?: boolean
  children: ReactNode
}

/**
 * Shared chrome for every legal page (T&C, Privacy, Cookies). Keeps typography,
 * version banner and inter-document links consistent so we never end up with
 * three slightly different "look-and-feels" for legal copy.
 */
export function LegalPageLayout({
  title,
  version,
  effectiveDate,
  intro,
  currentHref,
  proseWrap = true,
  children,
}: LegalPageLayoutProps) {
  const otherLinks = currentHref ? LEGAL_LINKS.filter((l) => l.href !== currentHref) : LEGAL_LINKS
  return (
    <main className="min-h-screen bg-white dark:bg-[#0F172A] text-[#0A192F] dark:text-[#F1F5F9]">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12 lg:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#0A192F] dark:hover:text-[#D4AF37] mb-8"
        >
          <i className="fa-solid fa-arrow-left" />
          Volver al inicio
        </Link>

        <header className="mb-10 pb-6 border-b border-gray-200 dark:border-[#334155]">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">{title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
            <span>Versión <strong className="font-semibold text-[#0A192F] dark:text-[#D4AF37]">{version}</strong></span>
            <span aria-hidden>•</span>
            <span>Vigente desde {effectiveDate}</span>
          </div>
          {intro && (
            <p className="mt-6 text-base text-gray-600 dark:text-gray-300 leading-relaxed">{intro}</p>
          )}
        </header>

        {proseWrap ? (
          <article className="legal-prose">{children}</article>
        ) : (
          <div>{children}</div>
        )}

        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-[#334155]">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Otros documentos legales</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {otherLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-[#0A192F] dark:text-[#D4AF37] hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </footer>
      </div>
    </main>
  )
}
