import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next';
import { Plus_Jakarta_Sans, Geist } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/shared/ui/sonner'
import Script from 'next/script'
import './globals.css'
import { cn } from "@/shared/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Crevo — Mini préstamos para Perú',
  description: 'Préstamos rápidos y seguros de S/. 200 a S/. 2,000. Aprobación en minutos.',
  keywords: ['préstamos', 'fintech', 'Perú', 'mini préstamos', 'crédito rápido'],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${geist.variable} font-(family-name:--font-sans)`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        <Script src="https://checkout.culqi.com/js/v4" strategy="lazyOnload" />
        <Analytics />
      </body>
    </html>
  )
}
