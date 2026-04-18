import { buildMetadata } from '@/shared/seo/buildMetadata'

// Indexable landing for the consultation flow ("¿cómo consulto el estado de
// mi reclamo?"). The deep-link variant /consulta/[code] is noindex (it shows
// personal complaint data) and overrides this via its own layout.
export const metadata = buildMetadata({
  title: 'Consulta tu reclamo',
  description:
    'Consulta el estado de un reclamo o queja presentado ante Crevo. Ingresa tu código de seguimiento para ver el detalle y la respuesta.',
  path: '/libro-de-reclamaciones/consulta',
})

export default function ConsultaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
