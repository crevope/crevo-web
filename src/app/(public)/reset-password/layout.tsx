import { buildMetadata } from '@/shared/seo/buildMetadata'

// noindex: password reset is a single-use, token-bound flow.
export const metadata = buildMetadata({
  title: 'Restablecer contraseña',
  description: 'Define una nueva contraseña para tu cuenta de Crevo.',
  path: '/reset-password',
  index: false,
})

export default function ResetPasswordLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children
}
