import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Video Platform',
    template: '%s | Video Platform',
  },
  description: 'Your custom video streaming platform - Stream, discover, and enjoy unlimited videos',
  keywords: ['video', 'streaming', 'platform', 'watch'],
  authors: [{ name: 'Video Platform Team' }],
  creator: 'Video Platform',

  // Favicon and icons
  icons: {
    icon: 'https://video-stream-cdn.b-cdn.net/Logos/Untitled%20design%20(1).png',
    shortcut: 'https://video-stream-cdn.b-cdn.net/Logos/Untitled%20design%20(1).png',
    apple: 'https://video-stream-cdn.b-cdn.net/Logos/Untitled%20design%20(1).png',
  },

  // Open Graph metadata for link previews
  openGraph: {
    type: 'website',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://video-platform.example.com',
    title: 'Video Platform',
    description: 'Your custom video streaming platform - Stream, discover, and enjoy unlimited videos',
    siteName: 'Video Platform',
    images: [
      {
        url: 'https://video-stream-cdn.b-cdn.net/Logos/Untitled%20design%20(1).png',
        width: 1200,
        height: 630,
        alt: 'Video Platform Logo',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
  },

  // Twitter Card metadata
  twitter: {
    card: 'summary_large_image',
    title: 'Video Platform',
    description: 'Your custom video streaming platform - Stream, discover, and enjoy unlimited videos',
    creator: '@VideoPlatform',
    images: ['https://video-stream-cdn.b-cdn.net/Logos/Untitled%20design%20(1).png'],
  },

  // Additional meta tags
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },

  // Mobile app meta tags
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Video Platform',
  },

  // Theme color
  themeColor: '#000000',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-black">
      <body className="min-h-screen bg-black text-white">
        {children}
      </body>
    </html>
  )
}
