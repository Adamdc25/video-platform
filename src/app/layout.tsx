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
      <body className="min-h-screen bg-black text-white">
        {children}
        <PWAInstall />
        <PWAUpdateNotifier />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Inject manifest link if not already present
              if (!document.querySelector('link[rel="manifest"]')) {
                const link = document.createElement('link');
                link.rel = 'manifest';
                link.href = '/manifest.json';
                document.head.appendChild(link);
              }

              // Register service worker
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js')
                  .then(reg => console.log('Service Worker registered'))
                  .catch(err => console.error('Service Worker registration failed:', err));
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
