import { buildMetadata } from '@/shared/seo/buildMetadata'

// noindex: this URL embeds a complaint tracking code in the path and renders
// PERSONAL DATA (complainant name, complaint detail). Search engines must
// never cache or surface these.
//
// The path passed to canonical here is just the segment shape — we don't
// generate per-code canonicals because each is single-use and ephemeral.
export const metadata = buildMetadata({
  title: 'Detalle del reclamo',
  description:
    'Detalle de un reclamo presentado ante Crevo. Esta página requiere un código de seguimiento válido.',
  path: '/libro-de-reclamaciones/consulta',
  index: false,
})

export default function ConsultaCodeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
