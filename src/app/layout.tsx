import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'

import { ToastProvider } from '@/components/ui/toast'
import { platform } from '@/config/platform'
import './globals.css'

const sans = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' })
/** Serif editorial para títulos: da el carácter; la interfaz sigue en Geist. */
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', variable: '--font-instrument-serif', display: 'swap' })

export const metadata: Metadata = {
  title: { default: platform.name, template: `%s · ${platform.name}` },
  description: platform.tagline,
  icons: {
    // Logotipo del Dr. Francisco Antonio Ramos Narváez (FARN), recortado en círculo con fondo transparente.
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // El sitio público agrega `reveal-on` a <html> antes de hidratar (ver RevealBootstrap); no es un error.
    <html lang="es-MX" className={`${sans.variable} ${mono.variable} ${serif.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <ToastProvider>{children}</ToastProvider>
        {/* Vercel sirve el script de analíticas solo en sus servidores; fuera de Vercel daría un 404. */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  )
}
