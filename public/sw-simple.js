// Simple test service worker
console.log('[SW] Service worker loaded');

self.addEventListener('install', event => {
  console.log('[SW] Install event');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  console.log('[SW] Fetch event:', event.request.url);
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Offline - Network request failed');
    })
  );
});
