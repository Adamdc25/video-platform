# PWA Icons Setup Guide

This guide explains how to generate and configure icons for the Video Platform PWA.

## Icon Requirements

Your PWA requires icons in various sizes for different platforms:

### Required Icon Sizes

- **72x72** - Small app launcher
- **96x96** - Small tile
- **128x128** - Tile
- **144x144** - Medium tile
- **152x152** - iPad icon
- **192x192** - Android home screen
- **384x384** - Splash screen
- **512x512** - Large splash screen
- **192x192 (maskable)** - Adaptive icon for Android 8+
- **512x512 (maskable)** - Adaptive icon for Android 8+
- **32x32** - Favicon
- **180x180** - Apple touch icon

### Apple-specific Icons

- **180x180** - Apple touch icon (apple-icon-180x180.png)

## How to Generate Icons

### Option 1: Using Online Tools

1. **PWA Image Generator** (https://www.pwabuilder.com/imageGenerator)
   - Upload a 512x512 PNG image
   - It will generate all required sizes automatically
   - Download and place in `public/icons/`

2. **Favicon Generator** (https://realfavicongenerator.net/)
   - Upload your logo/image
   - Select sizes
   - Download the generated files

### Option 2: Using ImageMagick (Command Line)

If you have ImageMagick installed, you can generate icons from a base image:

```bash
# Assuming you have a base image at public/icons/icon-base.png

convert public/icons/icon-base.png -resize 72x72 public/icons/icon-72x72.png
convert public/icons/icon-base.png -resize 96x96 public/icons/icon-96x96.png
convert public/icons/icon-base.png -resize 128x128 public/icons/icon-128x128.png
convert public/icons/icon-base.png -resize 144x144 public/icons/icon-144x144.png
convert public/icons/icon-base.png -resize 152x152 public/icons/icon-152x152.png
convert public/icons/icon-base.png -resize 192x192 public/icons/icon-192x192.png
convert public/icons/icon-base.png -resize 384x384 public/icons/icon-384x384.png
convert public/icons/icon-base.png -resize 512x512 public/icons/icon-512x512.png
convert public/icons/icon-base.png -resize 32x32 public/icons/icon-32x32.png
convert public/icons/icon-base.png -resize 180x180 public/icons/apple-icon-180x180.png
```

### Option 3: Using Node.js Script

Create a script to generate icons programmatically:

```bash
npm install sharp
```

Create `scripts/generate-icons.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [32, 72, 96, 128, 144, 152, 192, 384, 512];
const inputPath = 'public/icons/icon-base.png';

async function generateIcons() {
  for (const size of sizes) {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      })
      .png()
      .toFile(`public/icons/icon-${size}x${size}.png`);

    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Apple icon
  await sharp(inputPath)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    })
    .png()
    .toFile('public/icons/apple-icon-180x180.png');

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
```

## Icon Directory Structure

After generation, your `public/icons/` directory should look like:

```
public/
├── icons/
│   ├── icon-32x32.png
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   ├── icon-maskable-192x192.png
│   ├── icon-maskable-512x512.png
│   └── apple-icon-180x180.png
├── images/
│   ├── screenshot-540x720.png
│   └── screenshot-1280x720.png
├── manifest.json
├── sw.js
├── offline.html
└── robots.txt
```

## Screenshots for App Store

You should also create PWA screenshots for app stores:

- **540x720** - Mobile portrait (for app stores)
- **1280x720** - Desktop/tablet landscape

Place these in `public/images/` as referenced in `manifest.json`

## Testing Your PWA

1. **Generate a build:**
   ```bash
   npm run build
   npm run start
   ```

2. **Check in Chrome DevTools:**
   - Open Chrome DevTools (F12)
   - Go to Application tab
   - Check "Manifest" to verify it loads correctly
   - Check "Service Workers" to see if registered

3. **Test Installation:**
   - Look for the "Install" button in address bar
   - Click it to install the PWA
   - It should appear in your applications menu

4. **Test Offline Mode:**
   - Build and start the app
   - Open DevTools > Network
   - Set throttling to "Offline"
   - Navigate the app - you should see the offline page or cached content

## Maskable Icons

Maskable icons are adaptive icons for Android 8+. They should have:
- Safe zone: Center 80x80 for a 192x192 icon
- Full space of 192x192 can be used but expect it to be masked
- Background should extend to edges for proper masking

## Next Steps

1. Replace placeholder icon files with your actual brand icons
2. Test the PWA installation on different devices
3. Verify offline functionality
4. Consider adding push notifications (optional)
5. Monitor PWA analytics

## Troubleshooting

**Icon not showing:**
- Ensure icon files are in correct format (PNG)
- Check file names match manifest.json
- Clear browser cache and service worker

**PWA won't install:**
- Verify manifest.json is valid (use jsonlint.com)
- Check that service worker registers successfully
- Ensure icons are accessible and properly named

**Service Worker issues:**
- Check DevTools > Application > Service Workers
- Look for errors in Console
- Verify sw.js file exists in public folder
