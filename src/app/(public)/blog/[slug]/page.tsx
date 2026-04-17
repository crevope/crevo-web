import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, Tag } from 'lucide-react'
import { AuthHeader } from '@/shared/ui/auth-header'
import { CURRENT_YEAR } from '@/shared/lib/constants'
import { buildMetadata } from '@/shared/seo/buildMetadata'
import { JsonLd } from '@/shared/seo/JsonLd'
import { breadcrumbSchema } from '@/shared/seo/schemas/breadcrumb'
import { SITE, SITE_URL } from '@/shared/config/seo'
import { formatDate } from '@/shared/lib/utils'
import { getPostBySlug, listPostSlugs } from '@/features/blog/lib/loader'

interface Props {
  params: Promise<{ slug: string }>
}

/**
 * Pre-render every post at build time. `generateStaticParams` reads the
 * filesystem once per build, so adding a new `.md` file + redeploying is
 * all an editor needs to ship a post.
 */
export async function generateStaticParams() {
  const slugs = await listPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) {
    return buildMetadata({
      title: 'Artículo no encontrado',
      description: 'El artículo que buscas no existe o fue removido.',
      path: `/blog/${slug}`,
      index: false,
    })
  }
  return buildMetadata({
    title: post.ogTitle ?? post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: post.tags,
  })
}

export const revalidate = 3600
export const experimental_ppr = true

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    // Triggers Next's 404 UI — cleaner than a custom empty state here.
    notFound()
  }

  const breadcrumb = breadcrumbSchema([
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ])

  // BlogPosting JSON-LD — unlocks rich results for news / article
  // carousels on Google and improves the share preview on LinkedIn.
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: post.author,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
    inLanguage: SITE.lang,
  }

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] min-h-screen flex flex-col text-gray-800 dark:text-[#F1F5F9] antialiased">
      <JsonLd id="ld-breadcrumb" data={breadcrumb} />
      <JsonLd id="ld-article" data={articleJsonLd} />
      <AuthHeader />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#00E5FF] transition-colors"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          Todos los artículos
        </Link>

        <header>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {post.readingMinutes} min de lectura
            </span>
            <span aria-hidden>·</span>
            <span>Por {post.author}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#0A192F] dark:text-white tracking-tight mb-5 leading-tight">
            {post.title}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {post.description}
          </p>
          {post.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2 mt-5">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#00E5FF]/10 text-xs font-medium text-[#0A192F] dark:text-[#00E5FF]"
                >
                  <Tag className="h-3 w-3" aria-hidden="true" />
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </header>

        {/* The blog-prose class styles headings, lists, links, tables
            and code blocks so the loader doesn't need to emit inline
            styles; lives in globals.css alongside `.legal-prose`. */}
        <article className="blog-prose" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

        <section className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-white/6 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-[#0A192F] dark:text-white mb-3 tracking-tight">
            ¿Te sirvió este artículo?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 max-w-xl mx-auto leading-relaxed">
            Prueba el simulador y descubre cuánto podrías recibir sin compromiso ni huella
            crediticia.
          </p>
          <Link
            href="/simulador"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#0A192F] hover:bg-[#112240] text-[#D4AF37] text-sm font-medium transition-colors"
          >
            Abrir simulador
          </Link>
        </section>
      </main>

      <footer className="border-t border-gray-100 dark:border-white/5 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
        © {CURRENT_YEAR} Crevo
      </footer>
    </div>
  )
}
