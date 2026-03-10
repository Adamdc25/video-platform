#!/bin/bash

# Video Platform Release Build Script
# This script prepares the app for submission to Apple App Store and Google Play Store

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="Discover TMJ"
APP_ID="com.discovertmj.app"
PLATFORMS=()

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}App Store Release Builder${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "App: $APP_NAME"
echo "Package: $APP_ID"
echo ""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --ios)
      PLATFORMS+=("ios")
      shift
      ;;
    --android)
      PLATFORMS+=("android")
      shift
      ;;
    --all)
      PLATFORMS=("ios" "android")
      shift
      ;;
    --version)
      VERSION="$2"
      shift 2
      ;;
    --help)
      echo "Usage: ./scripts/build-release.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --ios              Build iOS release"
      echo "  --android          Build Android release"
      echo "  --all              Build both iOS and Android"
      echo "  --version VERSION  Set version string (e.g., 1.0.0)"
      echo "  --help             Show this help message"
      echo ""
      echo "Examples:"
      echo "  ./scripts/build-release.sh --ios"
      echo "  ./scripts/build-release.sh --all --version 1.0.0"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# If no platforms specified, ask user
if [ ${#PLATFORMS[@]} -eq 0 ]; then
  echo "Which platform(s) do you want to build for?"
  echo "1) iOS only"
  echo "2) Android only"
  echo "3) Both (iOS and Android)"
  echo ""
  read -p "Enter choice (1-3): " choice

  case $choice in
    1)
      PLATFORMS=("ios")
      ;;
    2)
      PLATFORMS=("android")
      ;;
    3)
      PLATFORMS=("ios" "android")
      ;;
    *)
      echo -e "${RED}Invalid choice${NC}"
      exit 1
      ;;
  esac
fi

# Verify environment
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js not found${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
  echo -e "${RED}✗ npm not found${NC}"
  exit 1
fi
echo -e "${GREEN}✓ npm found: $(npm --version)${NC}"

# Check for iOS build requirements
if [[ " ${PLATFORMS[@]} " =~ " ios " ]]; then
  if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}✗ Xcode not found. iOS builds require Xcode${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Xcode found${NC}"
fi

# Check for Android build requirements
if [[ " ${PLATFORMS[@]} " =~ " android " ]]; then
  if ! command -v gradle &> /dev/null && [ ! -f "android/gradlew" ]; then
    echo -e "${RED}✗ Gradle not found. Android builds require Gradle${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Gradle found${NC}"
fi

echo ""

# Step 1: Verify environment variables
echo -e "${YELLOW}Step 1/5: Verifying environment variables...${NC}"

if [ ! -f ".env.local" ]; then
  echo -e "${RED}✗ .env.local not found${NC}"
  echo "Please create .env.local from .env.example"
  exit 1
fi

if grep -q "your-" .env.local; then
  echo -e "${RED}✗ .env.local contains placeholder values${NC}"
  echo "Please update all placeholder values in .env.local"
  exit 1
fi

echo -e "${GREEN}✓ Environment variables configured${NC}"
echo ""

# Step 2: Clean and install dependencies
echo -e "${YELLOW}Step 2/5: Installing dependencies...${NC}"

if [ ! -d "node_modules" ]; then
  npm install
else
  echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

echo ""

# Step 3: Build Next.js app
echo -e "${YELLOW}Step 3/5: Building Next.js application...${NC}"

npm run build

if [ ! -d "out" ]; then
  echo -e "${RED}✗ Build failed - output directory not created${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Next.js build successful${NC}"
echo ""

# Step 4: Sync with Capacitor
echo -e "${YELLOW}Step 4/5: Syncing with Capacitor...${NC}"

npx cap sync

echo -e "${GREEN}✓ Capacitor sync complete${NC}"
echo ""

# Step 5: Build for platforms
echo -e "${YELLOW}Step 5/5: Building release artifacts...${NC}"
echo ""

# iOS Build
if [[ " ${PLATFORMS[@]} " =~ " ios " ]]; then
  echo -e "${YELLOW}Building iOS release...${NC}"

  if [ -z "$VERSION" ]; then
    read -p "Enter iOS version (e.g., 1.0.0): " VERSION
  fi

  echo "To complete iOS release:"
  echo "1. Open Xcode:"
  echo "   npx cap open ios"
  echo ""
  echo "2. In Xcode:"
  echo "   - Update Version to: $VERSION"
  echo "   - Update Build number to a unique integer"
  echo "   - Ensure signing certificates are configured"
  echo ""
  echo "3. Build and archive:"
  echo "   - Product > Archive"
  echo ""
  echo "4. Distribute to App Store:"
  echo "   - Select archive in Organizer"
  echo "   - Distribute App > App Store Connect"
  echo ""
  echo -e "${GREEN}✓ iOS project ready for Xcode${NC}"
  echo ""
fi

# Android Build
if [[ " ${PLATFORMS[@]} " =~ " android " ]]; then
  echo -e "${YELLOW}Building Android release...${NC}"

  if [ -z "$VERSION" ]; then
    read -p "Enter Android version (e.g., 1.0.0): " VERSION
  fi

  # Check if keystore exists
  if [ ! -f "android/app/release-key.keystore" ]; then
    echo -e "${YELLOW}Release keystore not found. Creating one...${NC}"

    read -s -p "Enter keystore password: " KEYSTORE_PASSWORD
    echo ""
    read -s -p "Confirm keystore password: " KEYSTORE_PASSWORD_CONFIRM
    echo ""

    if [ "$KEYSTORE_PASSWORD" != "$KEYSTORE_PASSWORD_CONFIRM" ]; then
      echo -e "${RED}Passwords don't match${NC}"
      exit 1
    fi

    cd android/app
    keytool -genkey -v -keystore release-key.keystore \
      -keyalg RSA -keysize 2048 -validity 10000 \
      -alias release-key \
      -storepass "$KEYSTORE_PASSWORD" \
      -keypass "$KEYSTORE_PASSWORD" \
      -dname "CN=Discover TMJ,O=Discover TMJ,L=,ST=,C=US"

    cd ../..
    echo -e "${GREEN}✓ Release keystore created${NC}"
  else
    echo -e "${GREEN}✓ Release keystore found${NC}"
  fi

  echo ""
  echo "To build Android release:"
  echo "1. Update version in android/app/build.gradle:"
  echo "   versionCode: increment by 1"
  echo "   versionName: \"$VERSION\""
  echo ""
  echo "2. Build release AAB:"
  echo "   cd android"
  echo "   ./gradlew bundleRelease"
  echo ""
  echo "3. Output file:"
  echo "   android/app/release/app-release.aab"
  echo ""
  echo "4. Upload to Google Play Console"
  echo ""
  echo -e "${GREEN}✓ Android project ready for release${NC}"
  echo ""
fi

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Release Build Preparation Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Next steps:"
echo "1. Review the platform-specific instructions above"
echo "2. Complete signing configuration"
echo "3. Test on real devices"
echo "4. Submit to app stores"
echo ""
echo "For detailed instructions, see:"
echo "  - APP_STORE_DEPLOYMENT.md (full guide)"
echo "  - APP_STORE_CONFIG.md (configuration details)"
echo "  - APP_STORE_CHECKLIST.md (submission checklist)"
echo ""
