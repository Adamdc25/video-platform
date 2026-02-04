# Discover TMJ Mobile App Guide

This guide explains how to build and deploy the Discover TMJ mobile apps for iOS (App Store) and Android (Google Play).

## Prerequisites

### For Both Platforms
- Node.js 18+ installed
- A code editor (VS Code recommended)
- Your Discover TMJ web app running locally

### For iOS Development
- macOS (required for iOS development)
- Xcode 15+ (free from Mac App Store)
- Apple Developer Account ($99/year for App Store distribution)
- CocoaPods (`sudo gem install cocoapods`)

### For Android Development
- Android Studio (free, works on Mac/Windows/Linux)
- Java Development Kit (JDK) 17+
- Google Play Developer Account ($25 one-time fee)

---

## Quick Start

### 1. Build the Web App
```bash
cd video-platform
npm run build
```

This creates the `out` directory with your static web app.

### 2. Sync with Mobile Platforms
```bash
npm run cap:sync
```

This copies your web build to both iOS and Android projects.

### 3. Open in Native IDE

**For iOS:**
```bash
npm run cap:open:ios
```

**For Android:**
```bash
npm run cap:open:android
```

---

## Building for iOS (App Store)

### Step 1: Open Xcode Project
```bash
npm run cap:open:ios
```

### Step 2: Configure Signing
1. In Xcode, select the **App** target
2. Go to **Signing & Capabilities** tab
3. Select your **Team** (Apple Developer account)
4. Ensure **Automatically manage signing** is checked

### Step 3: Update Bundle Identifier
The bundle ID is set to `com.discovertmj.app`. If you need to change it:
1. Select **App** target > **General** tab
2. Update **Bundle Identifier**
3. Update `capacitor.config.ts` to match

### Step 4: Add App Icons
1. In Xcode, open `Assets.xcassets`
2. Select `AppIcon`
3. Drag your 1024x1024 app icon (see App Icons section below)

### Step 5: Archive and Submit
1. Select **Product > Archive**
2. Once complete, click **Distribute App**
3. Choose **App Store Connect**
4. Follow the upload wizard

### Step 6: App Store Connect
1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Create a new app listing
3. Fill in app details, screenshots, description
4. Submit for review

---

## Building for Android (Google Play)

### Step 1: Open Android Studio Project
```bash
npm run cap:open:android
```

### Step 2: Update App Info
1. Open `android/app/build.gradle`
2. Update `versionCode` and `versionName` for each release
3. Verify `applicationId` matches your desired package name

### Step 3: Add App Icons
1. In Android Studio, right-click `res` folder
2. Select **New > Image Asset**
3. Choose your 1024x1024 icon
4. Generate all required sizes

### Step 4: Create Signing Key (First Time Only)
```bash
cd android
keytool -genkey -v -keystore discover-tmj-release-key.keystore -alias discover-tmj -keyalg RSA -keysize 2048 -validity 10000
```

**⚠️ IMPORTANT: Save this keystore file and password securely! You'll need it for all future updates.**

### Step 5: Configure Release Signing
Add to `android/app/build.gradle`:
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('discover-tmj-release-key.keystore')
            storePassword 'YOUR_STORE_PASSWORD'
            keyAlias 'discover-tmj'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 6: Build Release APK/AAB
```bash
cd android
./gradlew bundleRelease
```

The AAB file will be at: `android/app/build/outputs/bundle/release/app-release.aab`

### Step 7: Upload to Google Play
1. Go to [play.google.com/console](https://play.google.com/console)
2. Create a new app
3. Go to **Release > Production**
4. Upload your `.aab` file
5. Fill in store listing details
6. Submit for review

---

## App Icons & Splash Screens

### Required Sizes

**App Icon (for both platforms):**
- Create a 1024x1024 PNG icon (no transparency for iOS)
- Tools: Figma, Canva, or any design app

**Splash Screen:**
- 2732x2732 for maximum compatibility
- Center your logo in the middle
- Use solid black background (#000000) to match your app

### Using Capacitor Assets Plugin
```bash
npm install @capacitor/assets --save-dev
```

Create these files:
- `resources/icon.png` (1024x1024)
- `resources/splash.png` (2732x2732)

Then run:
```bash
npx capacitor-assets generate
```

This auto-generates all required icon and splash sizes.

---

## Development Workflow

### Testing on Device

**iOS Simulator:**
```bash
npm run cap:run:ios
```

**Android Emulator:**
```bash
npm run cap:run:android
```

**Physical Device:**
1. Connect device via USB
2. Enable Developer Mode on device
3. Run: `npm run cap:run:ios` or `npm run cap:run:android`

### Live Reload During Development
In `capacitor.config.ts`, uncomment:
```typescript
server: {
  url: 'http://YOUR_LOCAL_IP:3000',
  cleartext: true,
}
```

Then run:
```bash
npm run dev  # In one terminal
npm run cap:run:ios  # In another terminal
```

---

## Common Issues & Solutions

### Issue: "App not loading" on device
- Ensure you've run `npm run build` before `npx cap sync`
- Check that your Supabase URL is accessible from mobile

### Issue: Videos not playing on iOS
- iOS requires HTTPS for media playback
- Ensure your Bunny.net CDN URL uses HTTPS

### Issue: White screen on app launch
- Run `npx cap sync` to ensure web assets are copied
- Check browser console in Safari (iOS) or Chrome DevTools (Android)

### Issue: Authentication not working
- Mobile apps may need special handling for OAuth redirects
- Consider using Supabase's in-app browser auth

---

## App Store Requirements

### iOS App Store
- Privacy Policy URL (required)
- App screenshots (6.5" iPhone, 12.9" iPad)
- App description (4000 chars max)
- Keywords (100 chars max)
- Age rating questionnaire
- App Review notes if needed

### Google Play Store
- Privacy Policy URL (required)
- Feature graphic (1024x500)
- Screenshots (min 2, recommended 8)
- Short description (80 chars)
- Full description (4000 chars)
- Content rating questionnaire
- App signing by Google Play (recommended)

---

## Updating Your App

1. Make changes to your Next.js web app
2. Run `npm run build:mobile`
3. Update version in:
   - `ios/App/App.xcodeproj` (Xcode)
   - `android/app/build.gradle` (increment versionCode)
4. Create new archive/bundle
5. Upload to App Store/Play Store

---

## Cost Summary

| Item | iOS | Android |
|------|-----|---------|
| Developer Account | $99/year | $25 one-time |
| Hardware Required | Mac | Any computer |
| Review Time | 1-3 days | Few hours to 3 days |

---

## Need Help?

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Apple Developer Docs](https://developer.apple.com/documentation/)
- [Android Developer Docs](https://developer.android.com/docs)
- [Supabase Mobile Auth Guide](https://supabase.com/docs/guides/auth)

---

## Files Created

```
video-platform/
├── capacitor.config.ts      # Capacitor configuration
├── ios/                     # iOS Xcode project
│   └── App/
│       ├── App.xcodeproj    # Open this in Xcode
│       └── App/
│           └── public/      # Web assets
└── android/                 # Android Studio project
    └── app/
        └── src/main/
            └── assets/public/  # Web assets
```

Good luck with your app launch! 🚀
