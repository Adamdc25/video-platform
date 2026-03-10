# Mobile Build Guide - Next.js to Capacitor

This guide explains how to properly build your Next.js application for mobile using Capacitor.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    Video Platform                            │
│                  (Next.js React App)                         │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │         Capacitor Framework                             │ │
│  │   (Bridges web app to native code)                      │ │
│  ├─────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  ┌────────────────┐         ┌────────────────┐         │ │
│  │  │   iOS Native   │         │ Android Native │         │ │
│  │  │   (Xcode)      │         │ (Android Studio)         │ │
│  │  ├────────────────┤         ├────────────────┤         │ │
│  │  │ • WebView      │         │ • WebView      │         │ │
│  │  │ • Native APIs  │         │ • Native APIs  │         │ │
│  │  │ • Plugins      │         │ • Plugins      │         │ │
│  │  │ • Resources    │         │ • Resources    │         │ │
│  │  └────────────────┘         └────────────────┘         │ │
│  │         ↑                          ↑                    │ │
│  └────────────────────────────────────────────────────────┘ │
│         ↓                          ↓                         │
│    app-release.ipa           app-release.aab                 │
│  (App Store format)    (Google Play format)                  │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

## Build Process Step-by-Step

### 1. Next.js Build

```bash
npm run build
```

This produces:
- `.next/` - Server-side rendered files
- `out/` - Static HTML/CSS/JS (used by Capacitor)
- `public/` - Static assets

Capacitor uses the `out/` directory for the mobile app's web content.

### 2. Capacitor Sync

```bash
npx cap sync
```

This copies the built web app into:
- `ios/App/public/` (for iOS WebView)
- `android/app/src/main/assets/public/` (for Android WebView)

The native apps load this content in a WebView and execute it like a native app.

### 3. Native Compilation

**iOS**:
```bash
npx cap open ios
# Then in Xcode: Product > Archive
```

**Android**:
```bash
cd android
./gradlew bundleRelease
```

## Complete Build Workflow

### Full Production Build

```bash
#!/bin/bash

# 1. Build Next.js
npm run build

# 2. Sync to Capacitor
npx cap sync

# 3. iOS (in Xcode)
npx cap open ios
# → In Xcode: Product > Archive > Distribute > App Store Connect

# 4. Android
cd android
./gradlew bundleRelease
# → Upload android/app/release/app-release.aab to Google Play
```

### Using the Release Script

```bash
npm run release:build
# Or for specific platform:
npm run release:ios
npm run release:android
npm run release:both
```

## Configuration Files

### `capacitor.config.ts`

Main Capacitor configuration:

```typescript
{
  appId: 'com.discovertmj.app',      // Unique package identifier
  appName: 'Discover TMJ',           // Display name
  webDir: 'out',                     // Capacitor uses this directory
  server: {
    url: 'https://discover-tmj...',  // Can point to URL or local
    androidScheme: 'https'           // Protocol scheme
  },
  plugins: {
    SplashScreen: {...},             // Splash screen config
    StatusBar: {...},                // iOS status bar config
    Keyboard: {...}                  // Keyboard handling
  }
}
```

**Key point**: `webDir: 'out'` tells Capacitor where your built web app is.

### `next.config.js`

Next.js configuration for mobile:

```javascript
const nextConfig = {
  images: {
    unoptimized: true,    // Required for static export
    domains: [...]        // Allowed image domains
  },
  typescript: {
    ignoreBuildErrors: true  // Handle this carefully
  }
}

module.exports = withPWA(nextConfig)  // PWA for offline support
```

**Important**: `unoptimized: true` is required because Capacitor doesn't have a Node.js server to generate optimized images.

## Handling Environment Variables

### Development Build

```bash
# .env.local used automatically
npm run build
npm run build:mobile
```

### Production Build

```bash
# Create .env.production with production values
cat > .env.production << EOF
NEXT_PUBLIC_SUPABASE_URL=https://prod-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-key
BUNNY_CDN_URL=https://prod-cdn.b-cdn.net
EOF

# Build with production environment
NODE_ENV=production npm run build
npx cap sync
```

### Environment Variable Rules

- **`NEXT_PUBLIC_*`** - Available in browser (embedded in app)
- **Other variables** - Server-only (NOT available in app)
- **For mobile**: Most values should be `NEXT_PUBLIC_`
- **Secrets**: Never put API secrets in `NEXT_PUBLIC_` (they'll be in the app!)

## Testing Before Submission

### 1. Local Testing

```bash
# Build and run on emulator
npm run build:mobile

# iOS
npm run cap:run:ios
# Opens on iOS Simulator

# Android
npm run cap:run:android
# Opens on Android Emulator
```

### 2. Device Testing

```bash
# iOS: Connect device via USB
npm run cap:run:ios

# Android: Enable USB debugging, connect device
npm run cap:run:android
```

### 3. Test Checklist

- [ ] App launches without crash
- [ ] All pages load correctly
- [ ] Video playback works
- [ ] Network calls work
- [ ] Offline mode works (if PWA enabled)
- [ ] Touch interactions responsive
- [ ] Form inputs work
- [ ] Back button works correctly
- [ ] App doesn't use debugger/console
- [ ] App respects system font sizes
- [ ] Status bar colors correct
- [ ] Keyboard appears/hides correctly

## Performance Optimization

### 1. Bundle Size

Check bundle size:
```bash
npm run build
# Look at build output for bundle sizes
```

Optimize:
- Code splitting (Next.js auto-enabled)
- Image optimization (use `next/image` when possible)
- Remove unused dependencies
- Enable minification

### 2. Mobile-Specific Optimizations

In `next.config.js`:

```javascript
const nextConfig = {
  // Only serve static files
  experimental: {
    staticGenerationTimeout: 120 // Increase for large pages
  },

  // Aggressive caching
  headers: [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        }
      ]
    }
  ]
}
```

### 3. Lazy Load Modules

```typescript
// pages/watch/[slug].tsx
import dynamic from 'next/dynamic'

const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
  loading: () => <div>Loading player...</div>
})

export default function WatchPage() {
  return <VideoPlayer />
}
```

## Troubleshooting

### White Screen on App Launch

**Possible causes**:
1. WebView can't find content (check `webDir` in capacitor.config.ts)
2. Environment variables missing
3. CORS issue with API requests
4. JavaScript error in app

**Solutions**:
```bash
# Rebuild and sync
npm run build
npx cap sync

# Check logs
npm run cap:run:ios -- --verbose
npm run cap:run:android -- --verbose
```

### API Requests Failing on Device

**Possible causes**:
1. CORS not configured
2. HTTPS requirement
3. Environment variables not set
4. DNS issues

**Solutions**:
```typescript
// Add to next.config.js
{
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: '*' },
          { key: 'Access-Control-Allow-Headers', value: '*' }
        ]
      }
    ]
  }
}
```

### Large App Bundle

**Solutions**:
1. Remove unused dependencies: `npm prune`
2. Enable code splitting for routes
3. Compress images
4. Use lazy loading for features
5. Remove console.log statements

```bash
# Analyze bundle
npm install --save-dev webpack-bundle-analyzer
```

### Video Playback Issues on Mobile

**Solutions**:
1. Ensure video URLs are HTTPS
2. Check video codec compatibility
3. Test with native `<video>` tag
4. Verify CORS headers on CDN

```html
<!-- Test native video support -->
<video width="320" height="240" controls>
  <source src="movie.mp4" type="video/mp4">
  Your browser does not support HTML5 video.
</video>
```

## Version Management Best Practices

### Semantic Versioning

```
MAJOR.MINOR.PATCH (e.g., 1.2.3)

MAJOR: Breaking changes, major features
MINOR: New features, backwards compatible
PATCH: Bug fixes, small improvements
```

### Incrementing Versions

```bash
# Update version in package.json
{
  "version": "1.2.3"
}

# iOS: Xcode > General tab
Version: 1.2.3
Build: 123 (always increment)

# Android: android/app/build.gradle
versionCode 123     // Always increment
versionName "1.2.3" // Semantic versioning
```

## Release Checklist

Before each app store submission:

- [ ] Version numbers incremented correctly
- [ ] All env variables set for production
- [ ] Build succeeds without warnings
- [ ] Tested on real devices (not just simulators)
- [ ] Performance acceptable (< 3s startup)
- [ ] No hardcoded secrets in code
- [ ] Console logs removed
- [ ] Offline mode tested (PWA)
- [ ] Error handling works
- [ ] Videos play correctly
- [ ] Forms submit correctly
- [ ] App icon and splash screen updated (if needed)

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Next.js Build Output](https://nextjs.org/docs/app/api-reference/next-config-js)
- [Static Export Guide](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports)
- [PWA Configuration](https://nextjs.org/docs/pages/building-your-application/deploying/progressive-web-apps)

---

**Last Updated**: 2024
**App**: Discover TMJ
**Framework**: Next.js 14 + Capacitor
