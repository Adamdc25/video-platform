# App Store Submission Checklist

Use this checklist to ensure your app is ready for submission to Apple App Store and Google Play Store.

## Pre-Submission Setup

### General Requirements
- [ ] App follows your company/brand guidelines
- [ ] All features are working correctly
- [ ] App has been tested on real devices (not just simulators)
- [ ] No console errors or warnings
- [ ] Performance is acceptable (loading times < 3 seconds for main features)
- [ ] App handles offline gracefully (PWA fallback configured)
- [ ] Privacy policy created and published online
- [ ] Support contact email/website prepared
- [ ] Terms of service (if applicable) prepared

### Code Quality
- [ ] No hardcoded API keys or secrets
- [ ] Environment variables properly configured
- [ ] Console logs removed from production code
- [ ] Error handling implemented for network failures
- [ ] No memory leaks detected
- [ ] App doesn't use deprecated APIs

### Content & Branding
- [ ] App name finalized: "Discover TMJ"
- [ ] App icon created (1024×1024 PNG)
- [ ] Splash screen designed (512×512 PNG)
- [ ] App description written (compelling but concise)
- [ ] Screenshots prepared (see requirements below)
- [ ] App preview video created (iOS, optional but recommended)
- [ ] All text proofread for typos

### Screenshots Requirements

#### iOS (Apple App Store)
- [ ] 2-5 screenshots per supported device
- [ ] Sizes:
  - iPhone 6.7": 1284×2778 px
  - iPhone 5.5": 1242×2208 px
  - iPad 12.9": 2732×2048 px
- [ ] Screenshots show key features
- [ ] Text overlay is clear and readable
- [ ] Include call-to-action text
- [ ] Screenshots in PNG or JPG format
- [ ] No app chrome (status bar) visible

#### Android (Google Play Store)
- [ ] 2-8 screenshots
- [ ] Size: 1080×1920 px (portrait) or 1920×1080 px (landscape)
- [ ] Format: PNG or JPG
- [ ] Show main features and user journey
- [ ] Text overlay is clear
- [ ] Include branding/logo

### Feature Graphic
- [ ] Android: 1024×500 PNG/JPG
- [ ] Shows main features or unique value proposition
- [ ] Text limited (title + subtitle max)
- [ ] High quality, no pixelation

## iOS-Specific Checklist

### Xcode Configuration
- [ ] Bundle ID set to: `com.discovertmj.app`
- [ ] Team ID selected
- [ ] Version number updated (e.g., 1.0.0)
- [ ] Build number incremented (e.g., 1)
- [ ] Minimum iOS version set (iOS 13+)
- [ ] Supported device orientations configured
- [ ] App icon added to Assets
- [ ] Launch storyboard/screen configured
- [ ] No deprecated code warnings

### App Store Connect Setup
- [ ] App created in App Store Connect
- [ ] SKU assigned (unique identifier)
- [ ] Privacy Policy URL provided
- [ ] Age Rating questionnaire completed
- [ ] Category selected (Entertainment/Education)
- [ ] Copyright information filled
- [ ] Encryption compliance answered
- [ ] Contact information provided
- [ ] Content Restrictions configured
- [ ] Version Release Notes prepared

### Testing
- [ ] Built and tested on iPhone (multiple models if possible)
- [ ] iPad compatibility tested (if supported)
- [ ] Tested on iOS 13 (minimum version)
- [ ] Tested on latest iOS version
- [ ] Touch interactions responsive
- [ ] Video playback works smoothly
- [ ] Audio works (check mute switch behavior)
- [ ] Background tasks/timers handled correctly
- [ ] App doesn't crash on launch
- [ ] App doesn't crash on navigation
- [ ] Memory usage acceptable

### Submission Preparation
- [ ] Latest code committed to git
- [ ] All dependencies installed and updated
- [ ] Build runs without warnings or errors
- [ ] Archive created successfully
- [ ] Uploaded to App Store Connect
- [ ] Build processing completed (check status in App Store Connect)
- [ ] Screenshots, description uploaded
- [ ] App Clip configured (if using features requiring it)
- [ ] Push notifications certificate installed (if using)

### Submit for Review
- [ ] All required fields completed
- [ ] No placeholder text remaining
- [ ] Release notes prepared
- [ ] Contact information correct
- [ ] Pricing and Availability set
- [ ] Version Release Notes filled
- [ ] Demo account credentials provided (if needed for review)
- [ ] Agree to terms and submit

## Android-Specific Checklist

### Android Studio Configuration
- [ ] Application ID: `com.discovertmj.app`
- [ ] Version Code incremented (e.g., 1, 2, 3...)
- [ ] Version Name set (e.g., 1.0.0)
- [ ] Min SDK Level: 24 (Android 7.0)
- [ ] Target SDK Level: 34 (latest)
- [ ] Compile SDK Level: 34
- [ ] App icon added (mipmap folders)
- [ ] AndroidManifest.xml permissions reviewed
- [ ] No deprecated dependencies

### Signing Configuration
- [ ] Release keystore created
- [ ] Keystore file backed up securely
- [ ] Keystore password saved securely
- [ ] Key alias set correctly
- [ ] Key password configured
- [ ] build.gradle signing config updated
- [ ] Gradle can build release APK/AAB without errors

### Google Play Console Setup
- [ ] App created in Google Play Console
- [ ] Title set: "Discover TMJ" (max 50 chars)
- [ ] Short description prepared (max 80 chars)
- [ ] Full description written (max 4000 chars)
- [ ] Screenshots uploaded (2-8)
- [ ] Feature graphic uploaded (1024×500)
- [ ] Category selected
- [ ] Content rating questionnaire completed
- [ ] Privacy Policy URL provided
- [ ] Contact email provided
- [ ] Website/store URL added

### Permissions & Features
- [ ] Reviewed all permissions in AndroidManifest.xml
- [ ] Only necessary permissions requested
- [ ] Permissions explained in app store listing
- [ ] Hardware features declared (if using camera, etc.)
- [ ] Target devices selected (phones, tablets, etc.)
- [ ] Supported languages configured

### Testing
- [ ] Built release APK and tested locally
- [ ] Built release AAB for Play Store
- [ ] Tested on Android 7.0 (min SDK)
- [ ] Tested on Android 13-14 (modern versions)
- [ ] Tested on multiple devices (if possible)
- [ ] Different screen sizes tested
- [ ] Video playback tested
- [ ] Audio playback tested
- [ ] Network error handling tested
- [ ] App doesn't crash on launch
- [ ] Navigation works smoothly
- [ ] Touch interactions responsive

### Pre-Launch Checklist
- [ ] Internal testing group created
- [ ] Internal testers added (your team)
- [ ] Release uploaded to internal testing
- [ ] Internal testing completed successfully
- [ ] Issues fixed based on testing feedback
- [ ] New release built
- [ ] Release notes prepared
- [ ] Pricing and Availability configured

### Submission
- [ ] AAB file ready for upload
- [ ] All app store listing details filled
- [ ] Release notes prepared
- [ ] Staged rollout percentage set (recommend 10-25% initially)
- [ ] Demo account provided (if needed)
- [ ] Content policies acknowledged
- [ ] Agreement to Google Play policies confirmed
- [ ] Submitted for review

## Post-Submission

### Monitoring
- [ ] Check review status daily
- [ ] Monitor app store analytics
- [ ] Track user reviews and ratings
- [ ] Watch for crash reports
- [ ] Monitor performance metrics
- [ ] Respond to user reviews
- [ ] Track download numbers

### If Rejected
- [ ] Read rejection reason carefully
- [ ] Note specific policy violations
- [ ] Make required changes
- [ ] Re-submit with explanation
- [ ] Check rejection guidelines for your app store

### After Approval
- [ ] Announce launch on social media
- [ ] Send to press contacts
- [ ] Update website with download links
- [ ] Notify beta testers
- [ ] Monitor initial reviews
- [ ] Plan first update (usually within 2-4 weeks)
- [ ] Gather user feedback

## Common Rejection Reasons

### iOS App Store
- Incomplete app functionality (placeholder text, broken links)
- Crashes on launch or during use
- Poor performance
- Misleading app description or screenshots
- Inappropriate content
- Violates intellectual property
- Excessive ads
- Collecting data without disclosure

### Google Play Store
- Minimum functionality not met
- Misleading content
- Behavior not matching description
- Violates Google Play policies
- Poor app quality
- Spam or repetitive content
- Unauthorized third-party data collection

## Version Update Cycle

### For Updates After Launch
- [ ] Update code with new features/fixes
- [ ] Increment version numbers:
  - iOS: Version (1.0.0 → 1.0.1 or 1.1.0)
  - iOS: Build (increment by 1)
  - Android: versionCode (increment by 1)
  - Android: versionName (follow semantic versioning)
- [ ] Test thoroughly
- [ ] Prepare release notes
- [ ] Upload to app stores
- [ ] Monitor for issues
- [ ] Plan next update based on feedback

## Resources

- [App Store Connect Help](https://help.apple.com/app-store-connect)
- [Google Play Console Help](https://support.google.com/googleplay)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://support.google.com/googleplay/android-developer/answer/12951899)
- [Capacitor Documentation](https://capacitorjs.com)

---

**Last Updated**: 2024
**App**: Discover TMJ
**Package**: com.discovertmj.app
