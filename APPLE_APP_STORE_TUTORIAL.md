# Apple App Store Submission - Complete Step-by-Step Tutorial

This is a beginner-friendly guide to get your app on the Apple App Store. Follow each step exactly as written.

## Phase 1: Prerequisites (30 mins)

### Step 1.1: Verify You Have Everything

You'll need:
- ✅ Apple Developer Account (you have this)
- Mac computer with Xcode installed
- Your Next.js project (you have this)
- Internet connection

### Step 1.2: Install Xcode (if not already installed)

Check if Xcode is installed:
```bash
xcode-select --print-path
```

If it shows a path, skip to Step 1.3.

If not, install it:
1. Open App Store
2. Search for "Xcode"
3. Click Install (this takes 30-60 minutes)
4. Wait for installation to complete

### Step 1.3: Accept Xcode License

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
```

### Step 1.4: Install Capacitor iOS

```bash
cd /home/user/video-platform
npm install
```

This was already done, but verify everything is installed.

---

## Phase 2: Create App in App Store Connect (15 mins)

### Step 2.1: Log into App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Sign in with your Apple Developer Account
3. Click **My Apps** in the top left

### Step 2.2: Create New App

1. Click the **+** (plus icon) in the top left
2. Select **New App**
3. Choose:
   - **Platform**: iOS (select this checkbox)
   - **Name**: "Aeon Library"
   - **Primary Language**: English
   - **Bundle ID**: Select **Create new Bundle ID**

### Step 2.3: Create Bundle ID

A Bundle ID uniquely identifies your app. Follow exactly:

1. In the Bundle ID dropdown, select **Create new Bundle ID**
2. A form appears with fields:
   - **App Name**: "Aeon Library"
   - **Bundle ID Suffix**: Leave the prefix as-is, for suffix enter: `app`

   *(This creates `com.aeonlibrary.app` which matches your config)*

3. Click **Continue**

### Step 2.4: Complete App Setup

Fill in these fields:

- **SKU**: Enter `DISCOVERTMJ001` (unique identifier for Apple's system)
- **Full Bundle ID**: Should show `com.aeonlibrary.app` (auto-filled)
- Click **Create**

**You should now see your app in "My Apps"**

---

## Phase 3: Create Signing Certificates (20 mins)

This allows Apple to verify that the app build is from you.

### Step 3.1: Access Developer Portal

1. In App Store Connect, click your user icon (top right) → **Certificates, IDs & Profiles**
2. This opens https://developer.apple.com/account

### Step 3.2: Create Certificate Signing Request (CSR)

On your Mac:

1. Open **Keychain Access** (Applications → Utilities → Keychain Access)
2. Top menu: **Keychain Access** → **Certificate Assistant** → **Request a Certificate from a Certificate Authority**
3. Fill in:
   - **User Email Address**: Your Apple developer account email
   - **Common Name**: "Aeon Library"
   - **CA Email Address**: Leave blank
   - **Request is**: Select "Saved to disk"
4. Click **Continue**
5. Save the file (it creates `CertificateSigningRequest.certSigningRequest`)
6. Click **Done**

### Step 3.3: Create Distribution Certificate

1. Back in Developer Portal, go to **Certificates** (left sidebar)
2. Click **+** (plus icon) to create new certificate
3. Select **App Store and Ad Hoc**
4. Click **Continue**
5. Click **Choose File** and select the CSR you just created
6. Click **Continue**
7. Click **Download** to download the certificate
8. **Double-click the downloaded `.cer` file** to install it (Keychain opens automatically)

**Success**: You should see the certificate in Keychain with "Aeon Library" in its name.

---

## Phase 4: Create Provisioning Profile (15 mins)

This tells Apple which devices can run your app during testing.

### Step 4.1: Create App ID

1. In Developer Portal, go to **Identifiers** (left sidebar)
2. Click **+** (plus icon)
3. Select **App IDs**
4. Choose **App**
5. Register new App ID:
   - **Description**: "Aeon Library App"
   - **Bundle ID**: Select "Explicit" and enter `com.aeonlibrary.app`
   - **Capabilities**: Scroll down and enable:
     - Network Extension (if you need it - usually not for video apps)
     - Push Notifications (optional)
   - Click **Continue**
6. Click **Register**

### Step 4.2: Create Provisioning Profile

1. In Developer Portal, go to **Profiles** (left sidebar)
2. Click **+** (plus icon) to create new profile
3. Select **App Store**
4. Click **Continue**
5. Select App ID: Choose `com.aeonlibrary.app`
6. Click **Continue**
7. Select Certificate: Choose the "Aeon Library" certificate you created
8. Click **Continue**
9. Name: Enter `Aeon Library Production`
10. Click **Continue**
11. Click **Download** to download the profile
12. **Double-click the `.mobileprovision` file** to install it

**Success**: The provisioning profile is installed and ready to use.

---

## Phase 5: Configure Xcode Project (20 mins)

### Step 5.1: Open Project in Xcode

```bash
cd /home/user/video-platform
npm run build
npx cap sync
npx cap open ios
```

This opens your iOS project in Xcode.

### Step 5.2: Select Project and Team

In Xcode:

1. In the left sidebar, click **Aeon Library** (the blue project icon at top)
2. In the main panel, under **PROJECT** section (not TARGETS), select **Aeon Library**
3. Go to the **General** tab
4. Scroll down to **Signing & Capabilities**

### Step 5.3: Configure Signing

1. Make sure **Automatically manage signing** is **CHECKED**
2. Click the **Team** dropdown
3. Select your Apple Developer Team
4. Xcode automatically configures the rest

*If it shows an error, uncheck "Automatically manage signing" and manually select the certificates you created.*

### Step 5.4: Verify Bundle ID

1. Still in **General** tab
2. Find **Identity** section
3. **Bundle Identifier** should show: `com.aeonlibrary.app`
4. **Version**: Set to `1.0.0`
5. **Build**: Set to `1`

**These are important for submission!**

### Step 5.5: Configure for Release

1. In Xcode, go to **Product** menu → **Scheme** → **Edit Scheme**
2. Select **Run** on the left
3. Under **Build Configuration**, select **Release**
4. Click **Close**

---

## Phase 6: Create App Preview Images (30 mins)

App Store needs screenshots. You'll take 2-5 screenshots of your app.

### Step 6.1: Take Screenshots

Option A (Recommended): Use iPhone Simulator
1. In Xcode, select **Product** → **Run** (this opens the app in simulator)
2. Once app loads, press **Cmd + S** to take screenshot
3. Screenshots save to Desktop
4. Take 2-5 screenshots showing:
   - App home page
   - Main features
   - Video player
   - Any unique features

Option B: Use Real iPhone
1. Build the app on your real iPhone (connect via USB)
2. Use iPhone's **Volume Up + Side Button** to screenshot
3. Upload from iPhone to Mac

### Step 6.2: Resize Screenshots

App Store requires specific sizes. For iPhone:
- **iPhone 6.7" (latest)**: 1284 × 2778 px
- **iPhone 5.5"**: 1242 × 2208 px

Use Preview on Mac:
1. Open a screenshot with Preview
2. **Tools** → **Adjust Size**
3. Set to 1284 × 2778
4. Save

**Tip**: Use an online tool like [Resize Image](https://resizeimage.net) or [Pixlr](https://pixlr.com) if Preview is difficult.

### Step 6.3: Optional - Add Text Overlays

Make screenshots more engaging:
1. Use **Keynote**, **Photoshop**, or free tool like **Canva** (https://canva.com)
2. Add text like:
   - "Stream your favorite videos"
   - "Watch your content"
3. Export as PNG
4. Resize to 1284 × 2778

---

## Phase 7: Add App Store Metadata (30 mins)

### Step 7.1: Back to App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click **My Apps** → **Aeon Library**

### Step 7.2: Fill in App Information

Click **App Information** section:

1. **Name**: "Aeon Library" (50 chars max)
2. **Subtitle**: "Watch Your Content" (30 chars max - optional)
3. **Bundle ID**: Should auto-fill with `com.aeonlibrary.app`
4. Click **Save** if anything changed

### Step 7.3: Write Description

Click **Pricing and Availability**:

1. **Price Tier**: Select "Free"
2. **Regions**: Select all regions (or just where you want to distribute)
3. Click **Save**

### Step 7.4: Fill in App Description

Click **App Privacy** (or look for **Privacy & Compliance**):

1. **Privacy Policy URL**: If you don't have one, create a simple one at [iubenda.com](https://www.iubenda.com) (free option available)
2. Click **Save**

### Step 7.5: Add App Description & Keywords

Back in your app, click **Manage App Information** or find **Description** section:

1. **Description** (4000 chars max):
   ```
   Aeon Library is your go-to platform for streaming premium video content.

   Features:
   - Stream high-quality videos
   - Create your watchlist
   - Stream anywhere, anytime
   - Smooth playback on all devices

   Watch your favorite content now!
   ```

2. **Keywords** (100 chars max total):
   ```
   video streaming, watch tv, entertainment, movies, videos
   ```

3. Click **Save**

### Step 7.6: Add Support Information

Look for **Support URL** and **Marketing URL**:

1. **Support URL**: If you have a website, use it. Otherwise use your portfolio or GitHub
2. **Marketing URL**: Your website or social media link
3. Click **Save**

### Step 7.7: Set App Rating

Look for **Age Rating Questionnaire**:

1. Click **Edit** next to Content Rating
2. Answer the questions honestly:
   - Violence? No
   - Alcohol/Tobacco? No
   - Profanity? No
   - Sexual Content? No
   - etc.
3. System auto-generates rating (usually 4+ or 12+)
4. Click **Save**

---

## Phase 8: Upload App Screenshots (15 mins)

### Step 8.1: Find Versions Section

In App Store Connect, click **Aeon Library** → Look for **Versions** or **App Store** tab.

### Step 8.2: Add Screenshots

Look for **Screenshots** section (for iPhone):

1. Click **+** to add screenshot
2. Make sure size is correct (1284 × 2778 for latest iPhone)
3. Upload your resized screenshots
4. Drag to reorder if you want
5. Optionally add text below each screenshot explaining what it shows

### Step 8.3: Add App Preview (Optional)

Look for **App Preview**:
- This is a 15-30 second video showing your app in action
- You can skip this for now (screenshots are enough)

### Step 8.4: Save

Click **Save** for all changes.

---

## Phase 9: Build for App Store (30 mins)

### Step 9.1: Clean Previous Builds

In Xcode:
1. Top menu: **Product** → **Clean Build Folder** (hold Shift while clicking)
2. Wait for it to complete

### Step 9.2: Build the Archive

1. **Product** → **Archive**
2. Xcode starts building (takes 2-5 minutes)
3. When done, **Organizer** window opens automatically
4. You should see your build listed

### Step 9.3: Review Build Details

In the Organizer:
1. Find your archive (should be latest date)
2. Click **Validate App** to check for errors
3. If errors appear, read them carefully and fix in the code
4. If no errors, proceed to Step 9.4

### Step 9.4: Distribute to App Store

1. In Organizer, with your archive selected, click **Distribute App**
2. **Distribution Method**: Select **App Store Connect**
3. Click **Next**
4. **Signing Method**: Select **Automatically manage signing**
5. Click **Next**
6. **Review Information**: Should show bundle ID and version
7. Click **Next**
8. **Submission**: Select **Upload**
9. Click **Next**
10. Xcode uploads your app to App Store Connect (takes 2-5 minutes)

**Success message**: "Successfully uploaded for review"

---

## Phase 10: Finalize & Submit (10 mins)

### Step 10.1: Verify Upload

1. Go back to https://appstoreconnect.apple.com
2. Click **Aeon Library**
3. Look for **Build** section (should show your new build)

### Step 10.2: Set Build for Testing

1. Click on your latest build
2. Should see test information
3. Click **Save** if anything changed

### Step 10.3: Agree to Terms

Look for checkboxes to verify:
- ☑ Export Compliance
- ☑ Content Rights
- ☑ Advertising Identifier
- ☑ Third-party Content

For most apps, select:
- **Export Compliance**: "No"
- **Content Rights**: "Yes, our app is compliant"
- **Advertising Identifier (IDFA)**: "No" (unless using ads)
- **Third-party Content**: "No" (unless using third-party content)

Click **Save**

### Step 10.4: Submit for Review

1. Look for **Submit for Review** button (usually at bottom of page)
2. You might see a checklist to verify:
   - ✓ Version number filled
   - ✓ Screenshots uploaded
   - ✓ Description filled
   - ✓ Build selected
   - ✓ Age rating completed
   - ✓ Pricing set
3. If all green, click **Submit for Review**

**That's it! Your app is submitted.**

---

## Phase 11: Wait & Monitor (1-3 days)

### Step 11.1: Watch Status

1. In App Store Connect, watch the status:
   - **Waiting for Review** (1-2 hours)
   - **In Review** (12-48 hours)
   - **Ready for Sale** (approved!) or **Rejected** (needs fixes)

### Step 11.2: If Approved ✅

Email comes from Apple saying your app is approved.
Your app is now in the App Store!

### Step 11.3: If Rejected ❌

1. Email explains why
2. Fix the issues
3. Create a new version with updated build number
4. Re-upload and resubmit

Common reasons:
- App crashes on startup (test on real device!)
- Incomplete features (remove placeholder text)
- Misleading screenshots or description
- Missing privacy policy

---

## Troubleshooting

### "Provisioning profile doesn't match certificate"

**Solution**:
1. In Xcode: **Accounts** → **Manage Certificates**
2. Click **+** to add the certificate you created earlier
3. Uncheck "Automatically manage signing"
4. Manually select the certificate

### "Archive failed - Couldn't sign the app"

**Solution**:
1. Check that bundle ID is exactly `com.aeonlibrary.app`
2. Uncheck and recheck "Automatically manage signing"
3. Make sure certificate is in Keychain (check Keychain Access app)

### "Build failed during archiving"

**Solution**:
1. Check Xcode console for error messages
2. Run **Product** → **Clean Build Folder**
3. Try building to simulator first: **Product** → **Run**
4. If simulator works, try archive again

### "App crashes when I run it"

**Solution**:
1. Check that `.env.local` has all variables filled
2. Check browser console in Xcode: **Debug** → **Open System Log**
3. Look for red error messages
4. Fix errors and rebuild

### Certificates or Profiles showing as "Expires Soon"

**Solution**:
1. In Developer Portal, delete old ones
2. Create new certificates and provisioning profiles
3. Update Xcode signing configuration

---

## What Happens Next?

Once approved:

1. **Your app appears in App Store** (search for "Aeon Library")
2. **Users can download for free** (it's free tier)
3. **You get a link to share**: App Store link in your app's page
4. **Monitor in App Store Connect**:
   - Downloads
   - Crashes
   - Reviews
   - Ratings

---

## Important Notes

⚠️ **Bundle ID**: Don't change it after submitting - it's permanent.

⚠️ **Version Numbers**: Each new upload must have higher version numbers:
- Current: 1.0.0 → Next update: 1.0.1 or 1.1.0

⚠️ **Build Numbers**: Each archive must have different build number:
- First: 1
- Second: 2
- Third: 3
- (Always increasing integers)

⚠️ **Never commit `.env.local`**: It has secrets - keep it local only.

---

## Summary

You've now:
1. ✅ Created app in App Store Connect
2. ✅ Created signing certificates
3. ✅ Created provisioning profile
4. ✅ Configured Xcode project
5. ✅ Took and prepared screenshots
6. ✅ Added app description and metadata
7. ✅ Built and uploaded to App Store
8. ✅ Submitted for review

**Timeline**: 3-4 hours total (mostly waiting for Xcode to build)

**Review Time**: 1-3 days typically

Once approved, your app is live on the App Store! 🎉

---

**Questions?** Refer to:
- Official Apple Guide: https://developer.apple.com/app-store-submission/
- This document: APP_STORE_DEPLOYMENT.md
- Debugging help: Search for the specific error message + "Xcode"

Good luck! 🚀
