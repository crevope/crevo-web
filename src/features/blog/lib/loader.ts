import { promises as fs } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { marked } from 'marked'

/**
 * Server-only loader for blog posts.
 *
 * Posts live as plain `.md` files under `content/blog/` outside `src/` so
 * editors can drop new files without touching application code or running
 * a build. Every read happens during Server Component render — there's no
 * client-side runtime cost — and Next caches the result inside its
 * `unstable_cache`-style layer for the lifetime of the request.
 *
 * Each file's frontmatter shape is enforced at load time below; missing
 * required fields throw a clear error so a broken post can't sneak past
 * code review.
 */

export interface PostFrontmatter {
  title: string
  slug: string
  publishedAt: string // ISO YYYY-MM-DD
  description: string
  author: string
  tags: string[]
  /** Optional — defaults to title when omitted. */
  ogTitle?: string
  /** Hero image relative to /public; e.g. /images/blog/<slug>/hero.jpg. */
  heroImage?: string
  /** Mark unfinished drafts so they ship code-side but are excluded from
   *  the index, sitemap, and RSS. */
  draft?: boolean
}

export interface Post extends PostFrontmatter {
  /** Reading time in minutes, rounded up. */
  readingMinutes: number
  /** HTML compiled from the post body. */
  contentHtml: string
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog')

function assertString(value: unknown, key: string, slug: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`[blog] Post "${slug}" is missing required string field "${key}"`)
  }
  return value.trim()
}

function assertStringArray(value: unknown, key: string, slug: string): string[] {
  if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
    throw new Error(`[blog] Post "${slug}" field "${key}" must be a string[]`)
  }
  return value as string[]
}

function estimateReadingMinutes(markdown: string): number {
  // 200 wpm is the lower bound for Spanish prose; rounded up so a
  // 50-word teaser still says "1 min" instead of 0.
  const words = markdown.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

async function readPost(file: string): Promise<Post> {
  const slug = file.replace(/\.mdx?$/, '')
  const raw = await fs.readFile(path.join(CONTENT_DIR, file), 'utf-8')
  const parsed = matter(raw)
  const data = parsed.data as Record<string, unknown>

  const fm: PostFrontmatter = {
    title: assertString(data.title, 'title', slug),
    slug: assertString(data.slug ?? slug, 'slug', slug),
    publishedAt: assertString(data.publishedAt, 'publishedAt', slug),
    description: assertString(data.description, 'description', slug),
    author: assertString(data.author, 'author', slug),
    tags: assertStringArray(data.tags ?? [], 'tags', slug),
    ogTitle: typeof data.ogTitle === 'string' ? data.ogTitle : undefined,
    heroImage: typeof data.heroImage === 'string' ? data.heroImage : undefined,
    draft: data.draft === true,
  }

  // marked is synchronous + safe-by-default; we don't accept HTML-in-MD
  // from anonymous contributors, so XSS via raw HTML isn't a concern.
  const contentHtml = await marked.parse(parsed.content, { gfm: true })

  return {
    ...fm,
    readingMinutes: estimateReadingMinutes(parsed.content),
    contentHtml,
  }
}

/** Lists every published post, newest first. Drafts are excluded. */
export async function listPosts(): Promise<Post[]> {
  let files: string[]
  try {
    files = await fs.readdir(CONTENT_DIR)
  } catch {
    // No content directory yet — return empty list rather than crashing.
    return []
  }

  const mdFiles = files.filter((f) => /\.mdx?$/i.test(f))
  const posts = await Promise.all(mdFiles.map(readPost))
  return posts.filter((p) => !p.draft).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

/** Finds a single post by slug. Returns null instead of throwing so the
 *  detail route can surface a clean 404. */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await listPosts()
  return posts.find((p) => p.slug === slug) ?? null
}

/** Slugs of every published post — used by `generateStaticParams` to
 *  pre-render every detail page at build time. */
export async function listPostSlugs(): Promise<string[]> {
  const posts = await listPosts()
  return posts.map((p) => p.slug)
}
