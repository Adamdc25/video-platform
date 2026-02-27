#!/usr/bin/env node

/**
 * PWA Icon Generator Helper
 *
 * This script creates placeholder PWA icons.
 * For production use, replace with actual brand icons.
 *
 * Requires: sharp (npm install sharp)
 *
 * Usage: node scripts/generate-pwa-icons.js
 */

const fs = require('fs');
const path = require('path');

console.log('📱 PWA Icon Generator');
console.log('====================\n');

const iconsDir = path.join(__dirname, '../public/icons');
const screenshotsDir = path.join(__dirname, '../public/screenshots');

// Create directories
[iconsDir, screenshotsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Check if sharp is available
try {
  const sharp = require('sharp');
  generateIconsWithSharp(sharp);
} catch (error) {
  console.log('⚠️  sharp not found. Install with: npm install --save-dev sharp');
  console.log('\nInstructions to create icons manually:\n');

  console.log('Option 1: Using online tools');
  console.log('  1. Visit: https://pwabuilder.com/');
  console.log('  2. Upload your logo/image');
  console.log('  3. Download the generated icons');
  console.log('  4. Place them in: public/icons/\n');

  console.log('Option 2: Using Figma');
  console.log('  1. Create a design in Figma');
  console.log('  2. Export as PNG for each size');
  console.log('  3. Place them in: public/icons/\n');

  console.log('Option 3: Install sharp and re-run');
  console.log('  npm install --save-dev sharp');
  console.log('  node scripts/generate-pwa-icons.js\n');

  console.log('Required icon files:');
  console.log('  - icon-192x192.png');
  console.log('  - icon-192x192-maskable.png');
  console.log('  - icon-512x512.png');
  console.log('  - icon-512x512-maskable.png');
}

async function generateIconsWithSharp(sharp) {
  try {
    // Create a simple gradient background with text for demonstration
    const createIcon = async (size, isMaskable = false) => {
      const svgString = `
        <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="${size}" height="${size}" fill="url(#grad)"/>
          <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.35}" fill="white" opacity="0.9"/>
          <text x="${size / 2}" y="${size / 2 + size * 0.08}" font-size="${size * 0.4}"
                font-weight="bold" fill="#667eea" text-anchor="middle">▶</text>
        </svg>
      `;

      const filename = isMaskable
        ? `icon-${size}x${size}-maskable.png`
        : `icon-${size}x${size}.png`;

      await sharp(Buffer.from(svgString))
        .png()
        .toFile(path.join(iconsDir, filename));

      console.log(`✅ Generated: ${filename}`);
    };

    await createIcon(192, false);
    await createIcon(192, true);
    await createIcon(512, false);
    await createIcon(512, true);

    // Create shortcut icons
    await createShortcutIcon('search-icon.png', '🔍');
    await createShortcutIcon('watchlist-icon.png', '📋');

    console.log('\n✨ PWA icons generated successfully!');
    console.log('\n⚠️  Note: These are placeholder icons.');
    console.log('Replace with your actual brand icons for production.\n');

    // Create demo screenshots
    await createDemoScreenshot();
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

async function createShortcutIcon(filename, emoji) {
  const sharp = require('sharp');
  const size = 96;

  const svgString = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="20"/>
      <text x="${size / 2}" y="${size / 2 + size * 0.15}" font-size="${size * 0.5}"
            text-anchor="middle">${emoji}</text>
    </svg>
  `;

  await sharp(Buffer.from(svgString))
    .png()
    .toFile(path.join(iconsDir, filename));

  console.log(`✅ Generated: ${filename}`);
}

async function createDemoScreenshot() {
  const sharp = require('sharp');

  // Narrow screenshot (540x720)
  const narrowSvg = `
    <svg width="540" height="720" xmlns="http://www.w3.org/2000/svg">
      <rect width="540" height="720" fill="#000000"/>
      <rect width="540" height="60" fill="#1a1a1a"/>
      <circle cx="270" cy="30" r="20" fill="#667eea"/>
      <text x="270" y="400" font-size="40" fill="#ffffff" text-anchor="middle" font-weight="bold">
        Video Platform
      </text>
      <text x="270" y="450" font-size="20" fill="#cccccc" text-anchor="middle">
        Mobile View
      </text>
      <rect x="20" y="500" width="500" height="100" fill="#1a1a1a" rx="10"/>
      <circle cx="70" cy="550" r="30" fill="#667eea"/>
      <text x="120" y="555" font-size="16" fill="#ffffff">Featured Video</text>
    </svg>
  `;

  await sharp(Buffer.from(narrowSvg))
    .png()
    .toFile(path.join(screenshotsDir, 'screenshot1.png'));

  console.log(`✅ Generated: screenshot1.png`);

  // Wide screenshot (1280x720)
  const wideSvg = `
    <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
      <rect width="1280" height="720" fill="#000000"/>
      <rect width="1280" height="60" fill="#1a1a1a"/>
      <circle cx="640" cy="30" r="20" fill="#667eea"/>
      <text x="640" y="400" font-size="50" fill="#ffffff" text-anchor="middle" font-weight="bold">
        Video Platform
      </text>
      <text x="640" y="460" font-size="24" fill="#cccccc" text-anchor="middle">
        Desktop & Tablet View
      </text>
      <rect x="40" y="500" width="300" height="150" fill="#1a1a1a" rx="10"/>
      <circle cx="90" cy="550" r="30" fill="#667eea"/>
      <text x="160" y="555" font-size="16" fill="#ffffff">Video 1</text>
    </svg>
  `;

  await sharp(Buffer.from(wideSvg))
    .png()
    .toFile(path.join(screenshotsDir, 'screenshot2.png'));

  console.log(`✅ Generated: screenshot2.png`);
}
