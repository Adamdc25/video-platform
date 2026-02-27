#!/usr/bin/env node

/**
 * Icon Generator Script for PWA
 * Generates all required icon sizes from a base image
 *
 * Usage: node scripts/generate-icons.js <input-image> [output-dir]
 * Example: node scripts/generate-icons.js logo.png
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const sizes = [
  { size: 32, name: 'icon-32x32.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 192, name: 'icon-maskable-192x192.png', maskable: true },
  { size: 512, name: 'icon-maskable-512x512.png', maskable: true },
  { size: 180, name: 'apple-icon-180x180.png' },
];

async function generateIcons(inputPath, outputDir = 'public/icons') {
  try {
    // Verify input file exists
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Input file not found: ${inputPath}`);
      process.exit(1);
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 Created directory: ${outputDir}`);
    }

    console.log(`🎨 Generating icons from: ${inputPath}`);
    console.log(`📍 Output directory: ${outputDir}\n`);

    for (const { size, name, maskable } of sizes) {
      const outputPath = path.join(outputDir, name);

      try {
        let image = sharp(inputPath).resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 1 }
        });

        if (maskable) {
          // For maskable icons, use white background so the mask shows the image
          image = sharp(inputPath).resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          });
        }

        await image.png().toFile(outputPath);
        console.log(`✅ Generated: ${name} (${size}x${size})`);
      } catch (err) {
        console.error(`❌ Failed to generate ${name}: ${err.message}`);
      }
    }

    console.log(`\n✨ All icons generated successfully!`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Review generated icons in ${outputDir}`);
    console.log(`   2. Run: npm run build`);
    console.log(`   3. Run: npm start`);
    console.log(`   4. Test PWA installation in browser`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`Usage: node scripts/generate-icons.js <input-image> [output-dir]`);
  console.log(`\nExample:`);
  console.log(`  node scripts/generate-icons.js logo.png`);
  console.log(`  node scripts/generate-icons.js logo.png public/icons`);
  console.log(`\nNote: Install sharp first with: npm install sharp`);
  process.exit(0);
}

const inputFile = args[0];
const outputDir = args[1] || 'public/icons';

generateIcons(inputFile, outputDir);
