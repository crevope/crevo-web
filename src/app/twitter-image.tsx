/**
 * Twitter card image. Twitter accepts both 1200×630 (summary_large_image) and
 * 1200×600. We reuse the OG image — same composition works on both networks
 * and Vercel caches the rendered output.
 */
export { default, size, contentType, alt } from './opengraph-image'
