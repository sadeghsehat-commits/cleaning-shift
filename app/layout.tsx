import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import BackButtonHandler from '@/components/BackButtonHandler'
import { I18nProvider } from '@/contexts/I18nContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cleaning Shift Management',
  description: 'Professional cleaning shift management system',
  manifest: '/manifest.json',
  themeColor: '#6366f1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CleanShift',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'CleanShift',
    title: 'Cleaning Shift Management',
    description: 'Professional cleaning shift management system',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <I18nProvider>
          {children}
          <Toaster position="top-center" />
          <ServiceWorkerRegistration />
          <BackButtonHandler />
        </I18nProvider>
      </body>
    </html>
  )
}
