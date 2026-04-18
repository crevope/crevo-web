import Link from 'next/link'
import { ArrowRight, BookOpen, Clock } from 'lucide-react'
import { LandingHeader } from '@/shared/ui/landing-header'
import { LandingFooter } from '@/shared/ui/landing-footer'
import { buildMetadata } from '@/shared/seo/buildMetadata'
import { JsonLd } from '@/shared/seo/JsonLd'
import { breadcrumbSchema } from '@/shared/seo/schemas/breadcrumb'
import { formatDate } from '@/shared/lib/utils'
import { listPosts } from '@/features/blog/lib/loader'

/**
 * Blog index.
 *
 * Runs as a Server Component so the `fs`-backed loader executes once at
 * build (or once per request in dev), caches inside Next's data layer,
 * and ships zero JS for the list itself. Each post card is a simple
 * link — no client interactivity needed.
 *
 * Revalidate on demand when new posts ship: editing a `.md` file
 * invalidates the route on Vercel's ISR; in dev every request re-reads
 * so saves are instant.
 */
export const metadata = buildMetadata({
  title: 'Blog Crevo',
  description:
    'Artículos sobre préstamos online, educación financiera, presupuesto personal e historial crediticio en el Perú.',
  path: '/blog',
  keywords: ['blog crevo', 'educación financiera perú', 'préstamos online guía'],
})

export const revalidate = 3600 // 1 hour — enough for editors to see new posts without a redeploy
// PPR opt-in deferred — see next.config.ts.

export default async function BlogIndexPage() {
  const posts = await listPosts()
  const breadcrumb = breadcrumbSchema([{ name: 'Blog', path: '/blog' }])

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] min-h-screen flex flex-col text-gray-800 dark:text-[#F1F5F9] antialiased">
      <JsonLd id="ld-breadcrumb" data={breadcrumb} />
      <LandingHeader />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-10">
        <header>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-xs font-semibold text-[#0A192F] dark:text-[#00E5FF] uppercase tracking-wider mb-5">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            Blog
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#0A192F] dark:text-white tracking-tight mb-4">
            Guías y educación financiera
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
            Artículos prácticos sobre préstamos online, historial crediticio, presupuesto y cómo
            evitar las trampas del crédito informal. Contenido escrito por el equipo de Crevo.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="text-center py-16 rounded-lg bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Estamos preparando contenido nuevo. Vuelve pronto.
            </p>
          </div>
        ) : (
          <ul className="space-y-5">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block p-6 rounded-lg bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 hover:border-[#00E5FF]/40 transition-colors"
                >
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                    <span aria-hidden>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {post.readingMinutes} min
                    </span>
                    {post.tags[0] && (
                      <>
                        <span aria-hidden>·</span>
                        <span className="text-[#0A192F] dark:text-[#D4AF37] font-medium">
                          {post.tags[0]}
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-2 group-hover:text-[#00E5FF] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                    {post.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0A192F] dark:text-[#D4AF37]">
                    Leer artículo
                    <ArrowRight
                      className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <LandingFooter />
    </div>
  )
}
