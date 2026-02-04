import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Video Platform',
  description: 'Your custom video streaming platform',
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
