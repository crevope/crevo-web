import { buildMetadata } from '@/shared/seo/buildMetadata'

// noindex: email verification is a token-bound, single-use flow.
export const metadata = buildMetadata({
  title: 'Verificar correo electrónico',
  description: 'Verifica tu dirección de correo para activar tu cuenta de Crevo.',
  path: '/verify-email',
  index: false,
})

export default function VerifyEmailLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
