import type { Metadata, Viewport } from 'next'
import './globals.css'
import PWAInstall from '@/components/PWAInstall'
import PWAUpdateNotifier from '@/components/PWAUpdateNotifier'

export const metadata: Metadata = {
  title: 'Video Platform',
  description: 'Your custom video streaming platform',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Video Platform',
  },
  formatDetection: {
    telephone: false,
  },
  icons: [
    {
      rel: 'icon',
      url: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      rel: 'apple-touch-icon',
      url: '/icons/icon-192x192.png',
      sizes: '192x192',
    },
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://video-platform.example.com',
    siteName: 'Video Platform',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-black">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Video Platform" />
      </head>
      <body className="min-h-screen bg-black text-white">
        {children}
        <PWAInstall />
        <PWAUpdateNotifier />
      </body>
    </html>
  )
}
