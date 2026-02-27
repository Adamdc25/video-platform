# Progressive Web App (PWA) Setup Guide

This project is configured as a Progressive Web App (PWA) with offline support, installation capabilities, and caching strategies.

## Features

- ✅ **Installable** - Users can install the app on their device's home screen
- 🔄 **Offline Support** - Cached content is available offline with an offline fallback page
- 🚀 **Fast Loading** - Service Worker caches static assets and API responses
- 📱 **Responsive** - Works seamlessly on mobile, tablet, and desktop
- 🎯 **Web App Manifest** - Complete manifest with icons, shortcuts, and metadata

## Files Overview

### Core PWA Files

- **`public/manifest.json`** - Web app manifest with metadata, icons, and app shortcuts
- **`public/sw.js`** - Service Worker handling caching strategies and offline support
- **`public/offline.html`** - Fallback page shown when user goes offline
- **`src/components/PWAInstall.tsx`** - Component that prompts users to install the app
- **`next.config.js`** - Next.js configuration with PWA headers

## Installation Prompts

### Desktop/Android
When users visit the app in Chrome or Edge, they'll see an install prompt at the bottom of the screen.

### iOS
iOS uses a different installation method:
1. User taps the Share button
2. Selects "Add to Home Screen"
3. A custom prompt guides users through the process

## Service Worker Caching Strategies

The service worker implements different caching strategies based on request type:

### 1. Network First (HTML Pages)
- Tries to fetch the latest content from the network
- Falls back to cached version if offline
- Shows offline page if neither available

### 2. Cache First (Static Assets)
- CSS, JavaScript, images are served from cache first
- Updates cache in background when online
- Provides fast loading for assets

### 3. Network First (API Calls)
- API requests try network first
- Falls back to cached responses if offline
- Useful for data that needs to be current

## Required Icons

To make the PWA fully functional, create the following icon files in `public/icons/`:

```
public/icons/
├── icon-192x192.png          # Standard icon (192x192)
├── icon-192x192-maskable.png # Maskable icon for adaptive display
├── icon-512x512.png          # Large icon (512x512)
├── icon-512x512-maskable.png # Maskable icon (512x512)
├── search-icon.png           # Icon for search shortcut
└── watchlist-icon.png        # Icon for watchlist shortcut
```

### Icon Requirements

- **Format**: PNG with transparency
- **Colors**: High contrast for both light and dark backgrounds
- **Maskable Icons**: Safe zone should be within inner 80% (192px for 192x192)
- **Minimum sizes**: 192x192 and 512x512

### How to Generate Icons

#### Option 1: Using imagemagick (if installed)
```bash
# Create a base icon first, then generate variants
convert -size 512x512 xc:none -fill '#667eea' -draw "circle 256,256 256,0" icon-512x512.png
convert icon-512x512.png -resize 192x192 icon-192x192.png
```

#### Option 2: Using online tools
- https://www.favicon-generator.org/
- https://pwabuilder.com/ (provides a complete PWA builder)
- https://realfavicongenerator.net/

#### Option 3: Using pwa-asset-generator (recommended)
```bash
npm install -g pwa-asset-generator
pwa-asset-generator logo.png public/icons/ --padding "10%" --background "#000000"
```

## Deployment Requirements

For PWA to work properly in production:

1. **HTTPS** - PWA requires HTTPS (except for localhost)
2. **Valid Manifest** - manifest.json must be valid and accessible
3. **Service Worker** - sw.js must be served with `Cache-Control: max-age=0, must-revalidate`
4. **Icons** - All referenced icons must exist

### Nginx Configuration Example
```nginx
location = /sw.js {
    add_header Cache-Control "public, max-age=0, must-revalidate";
    add_header Service-Worker-Allowed "/";
}

location = /manifest.json {
    add_header Content-Type "application/manifest+json";
}
```

### Vercel Deployment
No additional configuration needed - the `next.config.js` headers are automatically applied.

## Testing the PWA

### 1. Offline Testing
```bash
# Build and start the production server
npm run build
npm start
```

Open DevTools (F12) → Application → Service Workers and check offline mode.

### 2. Chrome DevTools Audit
1. Open DevTools
2. Go to Lighthouse tab
3. Click "Analyze page load"
4. Check the PWA score

### 3. Check if Installable
- Look for the install prompt in address bar (Chrome/Edge)
- Check that all required icons are loaded
- Verify manifest.json is valid

### 4. Simulate Different Scenarios
```javascript
// Test offline detection
navigator.onLine // returns false when offline

// Check service worker status
navigator.serviceWorker.getRegistrations()

// Trigger service worker update
navigator.serviceWorker.ready.then(reg => reg.update())
```

## Customization

### Update App Name/Color
Edit `public/manifest.json`:
```json
{
  "name": "Your App Name",
  "short_name": "App Name",
  "theme_color": "#667eea",
  "background_color": "#000000"
}
```

### Modify Cache Strategy
Edit `public/sw.js` to change caching behavior for specific resources.

### Add Custom Shortcuts
Add more shortcuts in `manifest.json` for quick access to features:
```json
{
  "shortcuts": [
    {
      "name": "Feature Name",
      "short_name": "Feature",
      "url": "/feature-path",
      "icons": [{ "src": "/icons/feature-icon.png", "sizes": "96x96" }]
    }
  ]
}
```

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure `public/sw.js` is accessible
- Try unregistering old service workers: DevTools → Application → Service Workers → Unregister

### Icons Not Showing
- Verify all icon files exist in `public/icons/`
- Check manifest.json paths are correct
- Use Chrome DevTools Network tab to verify icons load

### App Not Installable
- Ensure manifest.json is valid (use https://manifest-validator.appspot.com/)
- Verify HTTPS is enabled (localhost is exception)
- Check that 192x192 and 512x512 icons exist
- Icons must be PNG format

### Cache Not Clearing
- Clear browser cache: DevTools → Application → Storage → Clear Site Data
- Update CACHE_NAME in `public/sw.js` to force new cache

## References

- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [Google Workbox](https://developers.google.com/web/tools/workbox) (alternative service worker library)
- [PWA Builder](https://www.pwabuilder.com/)

## Next Steps

1. **Generate Icons** - Create the required icon files in `public/icons/`
2. **Test Offline** - Test the app with service worker disabled
3. **Add Screenshots** - Add screenshots to `public/screenshots/` for better installation UI
4. **Deploy** - Deploy to production with HTTPS enabled
5. **Monitor** - Check Chrome DevTools Lighthouse scores and adjust caching as needed
