/**
 * Renders a `<script type="application/ld+json">` block with structured data.
 *
 * Plain synchronous component — safe to import from Server Components,
 * Client Components, barrels and async layouts alike. Does NOT read
 * request headers, which is what would otherwise force the module
 * graph into a server-only island and break any consumer that shares
 * a barrel with a client component (e.g. `features/legal/index.ts`).
 *
 * Security:
 *   - We serialize with JSON.stringify and escape `<` to defang any
 *     `</script>` injection from user-controlled fields.
 *   - Our CSP keeps `'unsafe-inline'` on `script-src` as a fallback
 *     (src/proxy.ts), so inline JSON-LD is whitelisted without a
 *     per-request nonce. Nonce support can be added later by taking
 *     the nonce as a prop and having Server Component callers read
 *     `headers().get('x-nonce')` themselves.
 */
interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[]
  /** Optional id — useful when multiple JSON-LD blocks live on the same
   *  page so debug tools can address them individually. */
  id?: string
}

export function JsonLd({ data, id }: Readonly<JsonLdProps>) {
  const safeJson = JSON.stringify(data).replace(/</g, '\\u003c')
  return (
    <script
      type="application/ld+json"
      id={id}
      // dangerouslySetInnerHTML is the standard way to emit raw JSON-LD in
      // React. The escape above prevents the only XSS vector (closing the
      // script tag from inside a string field).
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  )
}
