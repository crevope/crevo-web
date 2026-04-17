import { NextResponse } from 'next/server'
import { listPosts } from '@/features/blog/lib/loader'
import { SITE, SITE_URL } from '@/shared/config/seo'

/**
 * Blog RSS 2.0 feed — lets readers subscribe via any feed reader and
 * gives syndication services (Feedly, aggregators, Google News Publisher
 * Center) a canonical source.
 *
 * Runs on every request but the posts loader is backed by Next's cache
 * so the cost is a single in-memory read plus XML serialization.
 */

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export const revalidate = 3600

export async function GET() {
  const posts = await listPosts()
  const now = new Date().toUTCString()

  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`
      const pubDate = new Date(post.publishedAt).toUTCString()
      return `
    <item>
      <title>${xmlEscape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${xmlEscape(post.description)}</description>
      <author>noreply@crevo.pe (${xmlEscape(post.author)})</author>
      ${post.tags.map((t) => `<category>${xmlEscape(t)}</category>`).join('\n      ')}
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(SITE.name)} — Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Guías y educación financiera sobre préstamos online en Perú.</description>
    <language>${SITE.lang}</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
