/**
 * Renders a `<script type="application/ld+json">` block with structured data.
 *
 * Server component (no client interactivity). Drop it anywhere in the tree —
 * search engines parse the JSON regardless of where the script lives, but
 * convention is to inject in the page or layout `head`/body. We render in
 * the body for simplicity (Next.js handles it the same way).
 *
 * Security: we serialize with JSON.stringify and escape `<` to defang any
 * `</script>` injection from user-controlled fields. All other characters
 * are safe inside a JSON-encoded string.
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
      // React. Escaping above prevents the only XSS vector (closing the
      // script tag from inside a string field).
      dangerouslySetInnerHTML={{ __html: safeJson }}
    />
  )
}
