/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: [
      'video-stream-cdn.b-cdn.net',
      'lpckyltaeuyztvudxyyv.supabase.co',
    ],
  },
}

module.exports = nextConfig
