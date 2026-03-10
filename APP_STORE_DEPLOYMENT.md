# Video Platform - App Store Deployment Guide

This guide walks you through publishing your video platform app on the Apple App Store and Google Play Store.

## Prerequisites

- **Node.js** 18+ and npm
- **Xcode** (for iOS development) - Install from App Store
- **Android Studio** (for Android development) - Download from Android website
- **Capacitor CLI** - Already installed (`npx cap`)
- Apple Developer Account ($99/year)
- Google Play Developer Account ($25 one-time)
- Proper environment variables configured (`.env.local`)

## Project Setup

Your project uses:
- **Framework**: Next.js 14 with React
- **Mobile Framework**: Capacitor
- **iOS Target**: iOS 13+
- **Android Target**: Android API 34+

## Phase 1: Environment Configuration

### 1. Set up `.env.local`

```bash
cp .env.example .env.local
```

Fill in all required values:
- Supabase URL and API keys
- Bunny.net CDN credentials
- App URL

### 2. Build the Web App

```bash
npm run build
```

This generates the static output in the `out` directory that will be used in mobile apps.

## Phase 2: iOS App Store Deployment

### 1. Initialize iOS Project

```bash
npx cap sync ios
npx cap open ios
```

This opens Xcode with your iOS project.

### 2. Configure App in Xcode

In Xcode:
1. Select "Discover TMJ" project in the sidebar
2. Select the "Discover TMJ" target
3. Go to **General** tab:
   - **Identity**: Verify Bundle ID (`com.discovertmj.app`)
   - **Version**: Set to your app version (e.g., 1.0.0)
   - **Build**: Set to build number (auto-incremented)
   - **Minimum Deployments**: iOS 13.0 or higher

### 3. Create Signing Certificates

**Option A: Automatic Signing (Recommended for Testing)**
1. In Xcode, go to **Signing & Capabilities**
2. Check "Automatically manage signing"
3. Choose your Team
4. Xcode will auto-create certificates

**Option B: Manual Signing (Required for App Store)**
1. Go to [Apple Developer Portal](https://developer.apple.com)
2. Create an App ID matching `com.discovertmj.app`
3. Create a Certificate (Signing Identity) - iOS App Distribution
4. Create a Provisioning Profile for App Store distribution
5. Download and import both into Xcode

### 4. Create App Store Listing

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app:
   - **Platform**: iOS
   - **Name**: "Discover TMJ"
   - **Bundle ID**: `com.discovertmj.app`
   - **SKU**: Unique identifier (e.g., `discovertmj-001`)
3. Fill in required information:
   - **Category**: Entertainment or Education
   - **Content Rating**: Complete rating questionnaire
   - **Privacy Policy**: Provide URL to your privacy policy
   - **Screenshots**: Provide at least 2 screenshots (1242x2208 or 1284x2778)
   - **App Preview**: Optional video preview (max 30 seconds)
   - **Description**: Detailed description of features
   - **Keywords**: Up to 100 characters total
   - **Support URL**: Your support website
   - **Marketing URL**: Optional

### 5. Build for App Store

In Xcode:
1. Select **Product > Archive**
2. Wait for build to complete
3. Once archived, Xcode shows "Organizer" window
4. Select your archive and click **Distribute App**
5. Choose **App Store Connect**
6. Follow the distribution wizard
7. Upload will be automatically sent to App Store Connect

### 6. Submit for Review

In App Store Connect:
1. Go to your app's Build section
2. Select the build you just uploaded
3. Go to **App Information** and fill all required fields
4. Go to **Pricing and Availability**
5. Set pricing and availability
6. Click **Submit for Review**

**Review typically takes 24-48 hours**

## Phase 3: Android App Store Deployment

### 1. Initialize Android Project

```bash
npx cap sync android
npx cap open android
```

This opens Android Studio with your project.

### 2. Configure App in Android Studio

1. In `android/app/build.gradle`, verify:
   - `applicationId` = `com.discovertmj.app`
   - `versionCode` = unique integer (incremented per release)
   - `versionName` = "1.0.0"

2. In `android/app/src/main/AndroidManifest.xml`, verify:
   - `package` = `com.discovertmj.app`

### 3. Create a Signing Keystore

Generate a signing key for production releases:

```bash
# Create keystore (only once per app)
keytool -genkey -v -keystore android/app/release-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias release-key

# When prompted:
# - Keystore password: Create a strong password
# - Key password: Same as keystore password
# - First and last name: Your name or company
# - Organizational unit: Your organization
# - Organization: Your company name
# - City, State, Country: Your location
# - Is CN correct: yes
```

**IMPORTANT**: Store the keystore file securely and backup the password!

### 4. Configure Gradle for Signing

Create or update `android/app/build.gradle.kts` to include signing config:

```gradle
android {
    // ... other config ...

    signingConfigs {
        release {
            storeFile file('release-key.keystore')
            storePassword 'your_keystore_password'
            keyAlias 'release-key'
            keyPassword 'your_key_password'
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false // Set to true for production
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 5. Build Release APK/AAB

```bash
cd android
./gradlew bundleRelease
# Output: app/release/app-release.aab
```

Or for APK (older method):
```bash
./gradlew assembleRelease
# Output: app/release/app-release.apk
```

### 6. Create Google Play Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app:
   - **Name**: "Discover TMJ"
   - **Default language**: English
   - **Category**: Entertainment or Education
   - **Content rating**: Complete questionnaire

3. Fill in store listing:
   - **Title**: "Discover TMJ" (max 50 characters)
   - **Short description**: Max 80 characters
   - **Full description**: Max 4000 characters
   - **Screenshots**: 2-8 images (1080x1920 recommended)
   - **Feature graphic**: 1024x500 PNG/JPG
   - **Video link**: Optional YouTube video
   - **Contact details**: Support email and website

### 7. Set Up Content Rating

1. In Play Console, go to **Content rating**
2. Complete the questionnaire
3. System auto-generates rating (G, PG, PG-13, etc.)

### 8. Set Up Privacy and Permissions

1. Go to **App content**
2. Declare if app contains:
   - Ads
   - In-app purchases
   - Restricted content
3. Go to **Privacy policy** and provide URL

### 9. Upload to Google Play

1. Go to **Testing > Internal testing**
2. Create internal testing release
3. Upload the AAB file:
   - Click **Create release**
   - Upload your `app-release.aab`
   - Add release notes
4. Test on internal testers' devices first

### 10. Submit to Production

Once internal testing is successful:
1. Go to **Production**
2. Create new release
3. Upload the same AAB file (or new if updates made)
4. Set pricing and availability
5. Click **Review and rollout**
6. Confirm submission

**Review typically takes 1-3 hours**

## Phase 4: Continuous Updates

### Building Future Releases

**For both platforms:**
1. Make code changes
2. Update version in `capacitor.config.ts` (if needed)
3. Update version numbers:
   - iOS: In Xcode (Version and Build)
   - Android: In `build.gradle` (versionCode and versionName)
4. Rebuild:
   ```bash
   npm run build
   npx cap sync
   ```

**For iOS updates:**
- Archive in Xcode and submit new build

**For Android updates:**
- Regenerate AAB and upload to Play Console

### Version Numbers

- **Semantic Versioning**: `MAJOR.MINOR.PATCH` (e.g., 1.2.3)
- **iOS Build Numbers**: Sequential integers (1, 2, 3, ...)
- **Android Version Codes**: Sequential integers (1, 2, 3, ...)

## Troubleshooting

### iOS Issues

**"Failed to generate signing assets"**
- Ensure valid Apple Developer account
- Check bundle ID matches provisioning profile
- Reset Xcode signing cache: Xcode > Preferences > Accounts > Manage Certificates

**"Provisioning profile doesn't include signing certificate"**
- Regenerate provisioning profile in Developer Portal
- Download and install in Xcode

### Android Issues

**"Gradle build failed"**
- Run `./gradlew clean` in android directory
- Ensure Java 11+ installed
- Check Android SDK is up to date in Android Studio

**"Keystore file not found"**
- Ensure keystore file path in `build.gradle` is correct
- Keystore should be in `android/app/` directory

### Build Failed After Environment Changes

If environment variables changed:
```bash
npm run build  # Rebuild with new env vars
npx cap sync  # Sync to mobile projects
```

## App Store Optimization (ASO)

To improve visibility in app stores:

1. **Keywords**: Use relevant search terms users might look for
2. **Description**: Include keywords naturally, highlight unique features
3. **Screenshots**: Show key features and use cases
4. **Ratings & Reviews**: Encourage users to rate and leave feedback
5. **Localization**: Add translations for different languages
6. **Updates**: Regular updates signal active development

## Key Files & Locations

- **Main Config**: `capacitor.config.ts`
- **Next.js Config**: `next.config.js`
- **iOS Project**: `ios/App/App.xcworkspace/` (open in Xcode)
- **Android Project**: `android/` (open in Android Studio)
- **Build Output**: `out/` directory

## Support

For issues with:
- **Capacitor**: https://capacitorjs.com/docs
- **Next.js**: https://nextjs.org/docs
- **App Store**: https://developer.apple.com/support
- **Google Play**: https://support.google.com/googleplay

---

**Last Updated**: 2024
**App Package**: com.discovertmj.app
**App Name**: Discover TMJ
