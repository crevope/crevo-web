import { buildMetadata } from '@/shared/seo/buildMetadata'

// Indexable: this is the regulated public-facing entry to file complaints.
// Required to surface in SERPs for queries like "libro de reclamaciones crevo"
// and "reclamo crevo INDECOPI" — Code of Consumer Protection (Ley 29571)
// expects a clearly findable channel.
export const metadata = buildMetadata({
  title: 'Libro de Reclamaciones',
  description:
    'Presenta tu reclamo o queja ante Crevo a través del Libro de Reclamaciones digital, ' +
    'conforme al Código de Protección y Defensa del Consumidor (Ley 29571) y INDECOPI.',
  path: '/libro-de-reclamaciones',
  keywords: [
    'libro de reclamaciones crevo',
    'reclamo crevo',
    'queja crevo',
    'indecopi crevo',
    'libro de reclamaciones digital',
  ],
})

export default function LibroDeReclamacionesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
