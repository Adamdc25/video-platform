# App Store Configuration Templates

## Android Signing Configuration Template

### File: `android/app/build.gradle`

Add this section after `android {` block (if not already present):

```gradle
android {
    // ... existing config ...

    signingConfigs {
        release {
            storeFile file('release-key.keystore')
            storePassword System.getenv("KEYSTORE_PASSWORD") ?: 'placeholder'
            keyAlias System.getenv("KEY_ALIAS") ?: 'release-key'
            keyPassword System.getenv("KEY_PASSWORD") ?: 'placeholder'
        }
    }

    buildTypes {
        debug {
            debuggable true
        }
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    // ... rest of config ...
}
```

### Generate Release Keystore

```bash
# Navigate to android/app directory
cd android/app

# Generate keystore (one-time setup)
keytool -genkey -v -keystore release-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias release-key

# Verify keystore creation
keytool -list -v -keystore release-key.keystore
```

### Build Release AAB (Recommended for Google Play)

```bash
cd android
./gradlew bundleRelease
# Output: app/release/app-release.aab
```

### Build Release APK (Alternative, older method)

```bash
cd android
./gradlew assembleRelease
# Output: app/release/app-release.apk
```

## iOS Signing Configuration Template

### Manual Signing in Xcode

1. Open Xcode project:
   ```bash
   npx cap open ios
   ```

2. In Xcode, select the "Aeon Library" project
3. Select the "Aeon Library" target
4. Go to **Signing & Capabilities** tab

5. For **Debug** configuration:
   - Check "Automatically manage signing"
   - Select your Team
   - Xcode creates a development certificate automatically

6. For **Release** configuration:
   - Uncheck "Automatically manage signing"
   - Download Distribution Certificate from Apple Developer Portal
   - Download Production Provisioning Profile
   - Select these in Xcode

### Create App Store Distribution Certificate

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Certificates**
4. Click **+** to create new certificate
5. Select **App Store and Ad Hoc** (for distribution)
6. Upload your Certificate Signing Request (CSR)
7. Download the certificate
8. Double-click to install in Keychain

### Create Production Provisioning Profile

1. In Developer Portal, navigate to **Provisioning Profiles**
2. Click **+** to create new profile
3. Select **App Store**
4. Select App ID: `com.aeonlibrary.app`
5. Select the Distribution Certificate you created
6. Name it: `Aeon Library Production`
7. Download the profile
8. Double-click to install

### Build for App Store

```bash
# In Xcode
1. Select "Aeon Library" target
2. Set version (General tab) - must be higher than last upload
3. Select "Any iOS Device (arm64)" as build destination
4. Product > Archive
5. In Organizer window, select archive > Distribute App
6. Choose App Store Connect
7. Complete the distribution wizard
```

## Environment Variables for CI/CD

Create `.env.production` for app store builds:

```bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://your-production-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
BUNNY_CDN_URL=https://your-production-cdn.b-cdn.net
NEXT_PUBLIC_APP_URL=https://discover-tmj-streaming.vercel.app

# Mobile specific
NEXT_PUBLIC_API_ENDPOINT=https://api.yourdomain.com
```

Build production version:
```bash
NODE_ENV=production npm run build
npx cap sync
```

## Version Management

### iOS Version Format

In Xcode, use:
- **Version** (CFBundleShortVersionString): `1.2.3`
- **Build** (CFBundleVersion): `10` (must increment for each upload)

App Store requires:
- Version must increment: `1.0.0` → `1.0.1` → `1.1.0` → `2.0.0`
- Build can be same for multiple versions, but new builds per day must increment

### Android Version Format

In `build.gradle`:
```gradle
versionCode 1       // Must increment for each release
versionName "1.0.0" // Semantic versioning
```

Google Play requires:
- `versionCode` must strictly increase
- `versionName` should follow semantic versioning

## Icon & Splash Screen Requirements

### iOS App Icon

- Required sizes: 1024×1024 px (primary)
- Format: PNG or JPG
- No rounded corners (iOS applies automatically)
- No transparency required
- Submit through App Store Connect (Content)

### Android App Icon

- Minimum: 512×512 px (for Play Store listing)
- For app: Provide in multiple resolutions:
  - `mipmap-mdpi`: 48×48
  - `mipmap-hdpi`: 72×72
  - `mipmap-xhdpi`: 96×96
  - `mipmap-xxhdpi`: 144×144
  - `mipmap-xxxhdpi`: 192×192
- Format: PNG with transparency
- Design should work in circular format (adaptive icons)

### Splash Screen

Both platforms use:
- Size: At least 512×512 px
- Format: PNG
- Background color: `#000000` (already configured)
- No text/UI elements needed (handled by Capacitor)

## Certificate & Key Security

⚠️ **IMPORTANT**:
- Never commit keystores to git
- Never commit certificates to git
- Use environment variables for passwords
- Backup keystores securely (offline storage recommended)
- Store passwords in password manager

### Add to `.gitignore`

```
# App Store Certificates
*.p8
*.cer
*.certSigningRequest
*.mobileprovision
*.provisionprofile

# Android Signing
android/app/release-key.keystore
android/key.properties

# Environment files
.env.local
.env.production.local
```

## Testing Before Submission

### iOS TestFlight

1. In App Store Connect, go to **TestFlight**
2. Create an external testing group
3. Add test build
4. Invite testers via email
5. Testers receive TestFlight link
6. Get feedback before App Store submission

### Android Internal Testing

1. In Google Play Console, go to **Testing > Internal Testing**
2. Create release with AAB file
3. Add internal testers (emails)
4. Share internal testing link
5. Test thoroughly before production release

## Monitoring After Launch

### App Store Analytics

iOS (App Store Connect):
- Impressions
- Units sold
- Revenue
- Crashes
- Performance metrics
- Reviews and ratings

Android (Google Play Console):
- Install events
- Uninstall events
- Rating distribution
- Crash rates
- ANR (App Not Responding) rates
- Reviews

Use these metrics to:
- Identify and fix bugs
- Improve user experience
- Plan feature updates
- Monitor app performance

---

**Last Updated**: 2024
**Package**: com.aeonlibrary.app
