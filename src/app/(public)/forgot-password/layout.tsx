import { buildMetadata } from '@/shared/seo/buildMetadata'

// page.tsx is `'use client'` (form state, react-hook-form), so it can't
// export `metadata` directly. Wrapping it in a server-component layout lets
// us still set the noindex headers + a sensible browser-tab title.
export const metadata = buildMetadata({
  title: 'Recuperar contraseña',
  description: 'Recupera el acceso a tu cuenta de Crevo. Te enviaremos un enlace seguro a tu correo.',
  path: '/forgot-password',
  index: false,
})

export default function ForgotPasswordLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
