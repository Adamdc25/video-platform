const CACHE_NAME = 'video-platform-v1'
const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache static assets but don't require them to succeed
      ASSETS_TO_CACHE.forEach((url) => {
        cache.add(url).catch(() => {
          console.log('Failed to cache:', url)
        })
      })
      return Promise.resolve()
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  const url = new URL(event.request.url)
  const isNavigate = event.request.mode === 'navigate'

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if available
      if (response) {
        return response
      }

      // Otherwise try to fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache if not a success response
          if (!response || response.status !== 200 || response.type === 'error') {
            return response
          }

          // Cache HTML pages and certain assets
          if (
            isNavigate ||
            url.pathname.startsWith('/icons/') ||
            url.pathname.startsWith('/_next/static/')
          ) {
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }

          return response
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (isNavigate) {
            return new Response(
              '<html><body><h1>You are offline</h1><p>This page is not available offline.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            )
          }
          return new Response('Resource not available offline', {
            headers: { 'Content-Type': 'text/plain' },
          })
        })
    })
  )
})
