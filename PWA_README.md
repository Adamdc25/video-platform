# Progressive Web App (PWA) Implementation

This document explains the PWA setup for the Video Platform and how to use it.

## What is a PWA?

A Progressive Web App (PWA) is a web application that uses modern web capabilities to deliver an app-like experience. PWAs are:

- **Installable** - Users can install the app on their device without app stores
- **Offline-capable** - Works even when there's no internet connection
- **App-like** - Has its own window and doesn't show the browser UI
- **Fast** - Uses service workers for caching and optimized performance
- **Secure** - Served over HTTPS and uses secure APIs

## Features Implemented

### 1. Service Worker (`public/sw.js`)

The service worker provides:

- **Offline Support** - Caches essential files and serves cached content when offline
- **Background Sync** - Can sync data in the background (ready for implementation)
- **Push Notifications** - Receives and displays push notifications (ready for implementation)
- **Network-First Strategy** - Try network first, fall back to cache for images and scripts
- **Cache Management** - Automatically updates caches and cleans up old versions

### 2. Web Manifest (`public/manifest.json`)

Defines app metadata:

- App name and short name
- App icon in various sizes
- Display mode (standalone - no browser UI)
- Color scheme and theme
- App screenshots for installation prompts
- Categories and orientation

### 3. Metadata & Meta Tags (`src/app/layout.tsx`)

Adds necessary meta tags:

- Viewport configuration for responsive design
- Apple web app configuration
- App icons for different platforms
- Mobile web app capabilities

### 4. Offline Fallback Page (`public/offline.html`)

Provides user-friendly offline experience:

- Styled offline message
- Retry button
- Home navigation option
- Automatic reload when connection restored

### 5. PWA Configuration (`next.config.js`)

Next.js PWA integration with:

- Automatic service worker registration
- Asset caching
- Frontend navigation caching
- Offline page fallback
- Production-only activation

## Development & Testing

### Build the PWA

```bash
npm run build
npm start
```

### Test in Chrome

1. Open DevTools (F12)
2. Go to **Application** tab
3. Check **Manifest** - Should show all app metadata
4. Check **Service Workers** - Should show registered worker
5. Check **Storage/Cache** - Should show cached assets

### Test Installation

1. Visit your app in Chrome on mobile or desktop
2. Look for "Install" button in address bar (or menu)
3. Click to install
4. App should appear in your applications menu

### Test Offline Mode

1. Build and run: `npm run build && npm start`
2. Open DevTools > Network
3. Check "Offline" checkbox
4. Navigate the app - offline.html should appear
5. Close DevTools and check back online - should reload automatically

### Test on Device

```bash
# Get your local IP
ipconfig getifaddr en0  # macOS
hostname -I             # Linux

# Visit https://<YOUR_IP>:3000 (may need to handle HTTPS locally)
```

## Service Worker Lifecycle

### Installation Phase
- Service worker downloads and parses
- Install event fires
- Caches essential files in `CACHE_NAME`
- **Skip waiting** - Immediately activate

### Activation Phase
- Old caches are cleaned up
- Claims all controlled clients
- Ready to handle requests

### Fetch Phase
- Intercepts all network requests
- Serves from cache if available
- Falls back to network if needed
- Caches successful responses

## Caching Strategy

The service worker uses a **Network-First with Cache Fallback** strategy:

```
User Request
    ↓
Try Network (fetch)
    ├─→ Success → Cache it (for images/scripts) → Return
    ├─→ Failure → Check Cache
    │         ├─→ Found → Return cached
    │         └─→ Not Found → Serve offline.html
```

Files cached:
- `/api/*` endpoints
- Images (`.png`, `.jpg`, `.jpeg`, `.svg`, `.gif`, `.webp`)
- Stylesheets (`.css`)
- Scripts (`.js`)

## Extending the PWA

### Add Push Notifications

1. Request notification permission:

```typescript
if ('Notification' in window && 'serviceWorker' in navigator) {
  if (Notification.permission === 'granted') {
    // Already granted
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
}
```

2. Subscribe to push:

```typescript
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: 'YOUR_PUBLIC_VAPID_KEY'
});
```

### Add Background Sync

Register a sync event in your component:

```typescript
if ('serviceWorker' in navigator && 'SyncManager' in window) {
  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register('sync-videos');
}
```

Handle in service worker:

```javascript
self.addEventListener('sync', event => {
  if (event.tag === 'sync-videos') {
    event.waitUntil(syncVideos());
  }
});
```

### Customize Caching

Edit `public/sw.js` to:

- Add more files to `urlsToCache`
- Change caching strategy (Cache-first, Stale-while-revalidate, etc.)
- Add specific handling for API endpoints

## Browser Support

PWA features work on:

- ✅ Chrome 40+
- ✅ Edge 79+
- ✅ Firefox 44+
- ✅ Safari 11.1+ (limited support)
- ✅ Android browsers (excellent support)
- ⚠️ IE 11 (no PWA support)

## Security Considerations

1. **HTTPS Required** - PWAs must be served over HTTPS (except localhost)
2. **Service Worker Scope** - Limits to same directory or below
3. **Cache Management** - Old caches automatically deleted
4. **Sandboxing** - Service worker runs in separate context

## Performance Impact

- First load: +2-5ms (manifest/icon check)
- Subsequent loads: +50-200ms faster (cached assets)
- Offline performance: Instant (from cache)
- Cache size: ~5-50MB depending on content

## Troubleshooting

### PWA not installing
- Check manifest.json is valid (no syntax errors)
- Verify service worker registers (DevTools > Application > Service Workers)
- Ensure at least one icon is valid PNG
- Clear cache and hard refresh (Ctrl+Shift+R)

### Icons not showing
- Verify icon files exist in `public/icons/`
- Check file names match manifest.json
- Ensure images are valid PNG format
- Check browser console for 404 errors

### Offline page not showing
- Clear service worker (DevTools > Service Workers > Unregister)
- Clear cache (DevTools > Storage > Cache Storage)
- Rebuild: `npm run build`
- Restart dev server
- Hard refresh and go offline again

### Service worker not updating
- Check `sw.js` modification timestamp
- Use Shift+Click on browser reload to force refresh
- Unregister old service worker in DevTools

## Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Manifest Spec](https://w3c.github.io/manifest/)
- [next-pwa Documentation](https://github.com/shadowwalker/next-pwa)
- [Web.dev - PWA](https://web.dev/progressive-web-apps/)

## Next Steps

1. ✅ Generate and add icon files (see `PWA_ICONS_GUIDE.md`)
2. Update manifest.json with real app metadata
3. Test on multiple devices and browsers
4. Add push notification support (optional)
5. Implement background sync for video uploads (optional)
6. Monitor PWA analytics and user engagement

## Notes

- PWAs are disabled in development mode (process.env.NODE_ENV === 'development')
- Service worker automatically updates in production
- Cache revalidates on each app start
- Offline.html is a fallback, actual pages are cached when visited

---

For icon generation, see `PWA_ICONS_GUIDE.md`
