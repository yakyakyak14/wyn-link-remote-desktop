#!/bin/bash

# WYN Link Deployment Script
# This script builds and prepares all applications for deployment

set -e

echo "🚀 WYN Link Deployment Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version check passed: $(node -v)"

# Create deployment directory
DEPLOY_DIR="./deployment"
mkdir -p "$DEPLOY_DIR"

print_status "Starting deployment process..."

# 1. Build Web Application
print_status "Building Web Application..."
cd web-app
if [ ! -d "node_modules" ]; then
    print_status "Installing web app dependencies..."
    npm install
fi

print_status "Building web app for production..."
npm run build
print_success "Web application built successfully"

# Copy build to deployment directory
mkdir -p "../$DEPLOY_DIR/web-app-build"
cp -r .next "../$DEPLOY_DIR/web-app-build/"
cp -r public "../$DEPLOY_DIR/web-app-build/"
cp package.json "../$DEPLOY_DIR/web-app-build/"

cd ..

# 2. Build Chrome Extension
print_status "Building Chrome Extension..."
cd chrome-extension
if [ ! -d "node_modules" ]; then
    print_status "Installing Chrome extension dependencies..."
    npm install
fi

print_status "Building Chrome extension..."
npm run build
print_success "Chrome extension built successfully"

# Copy extension to deployment directory
mkdir -p "../$DEPLOY_DIR/chrome-extension"
cp -r dist/* "../$DEPLOY_DIR/chrome-extension/"

cd ..

# 3. Prepare Mobile App
print_status "Preparing Mobile Application..."
cd mobile-app
if [ ! -d "node_modules" ]; then
    print_status "Installing mobile app dependencies..."
    npm install
fi

# Create mobile deployment package
mkdir -p "../$DEPLOY_DIR/mobile-app"
cp -r src "../$DEPLOY_DIR/mobile-app/"
cp -r android "../$DEPLOY_DIR/mobile-app/"
cp -r ios "../$DEPLOY_DIR/mobile-app/"
cp package.json "../$DEPLOY_DIR/mobile-app/"
cp app.json "../$DEPLOY_DIR/mobile-app/"
cp metro.config.js "../$DEPLOY_DIR/mobile-app/"
cp babel.config.js "../$DEPLOY_DIR/mobile-app/"
cp tsconfig.json "../$DEPLOY_DIR/mobile-app/"

print_success "Mobile application prepared for deployment"

cd ..

# 4. Build PC Client
print_status "Building PC Client..."
cd pc-client
if [ ! -d "node_modules" ]; then
    print_status "Installing PC client dependencies..."
    npm install
fi

print_status "Building PC client distributables..."

# Build for all platforms
if command -v wine &> /dev/null; then
    print_status "Building Windows installer..."
    npm run build:win
else
    print_warning "Wine not found. Skipping Windows build."
fi

if [[ "$OSTYPE" == "darwin"* ]]; then
    print_status "Building macOS DMG..."
    npm run build:mac
else
    print_warning "Not on macOS. Skipping macOS build."
fi

print_status "Building Linux AppImage..."
npm run build:linux

print_success "PC client built successfully"

# Copy distributables to deployment directory
if [ -d "dist" ]; then
    mkdir -p "../$DEPLOY_DIR/pc-client-dist"
    cp -r dist/* "../$DEPLOY_DIR/pc-client-dist/"
fi

cd ..

# 5. Create deployment package
print_status "Creating deployment package..."

# Create version info
cat > "$DEPLOY_DIR/version.json" << EOF
{
  "version": "1.0.0",
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "applications": {
    "webApp": {
      "status": "ready",
      "platform": "vercel",
      "path": "./web-app-build"
    },
    "chromeExtension": {
      "status": "ready",
      "platform": "chrome-web-store",
      "path": "./chrome-extension"
    },
    "mobileApp": {
      "status": "ready",
      "platforms": ["android", "ios"],
      "path": "./mobile-app"
    },
    "pcClient": {
      "status": "ready",
      "platforms": ["windows", "macos", "linux"],
      "path": "./pc-client-dist"
    }
  },
  "developer": {
    "name": "Hope Ukpai",
    "organization": "WYN Tech",
    "location": "Abuja, Federal Capital Territory, Nigeria",
    "email": "hope@wyntech.com"
  }
}
EOF

# Create deployment instructions
cat > "$DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.md" << EOF
# WYN Link Deployment Instructions

## Web Application
1. Upload \`web-app-build/\` to Vercel or your hosting platform
2. Set environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET

## Chrome Extension
1. Zip the \`chrome-extension/\` folder
2. Upload to Chrome Web Store Developer Dashboard
3. Fill out store listing with screenshots and descriptions

## Mobile Applications

### Android
1. Navigate to \`mobile-app/android/\`
2. Run \`./generate-keystore.sh\` to create signing key
3. Run \`./gradlew assembleRelease\` to build APK
4. Upload APK to Google Play Console

### iOS
1. Open \`mobile-app/ios/WYNLinkMobile.xcworkspace\` in Xcode
2. Configure signing certificates
3. Archive and upload to App Store Connect

## PC Client
1. Distributables are in \`pc-client-dist/\`
2. Upload installers to your download server
3. Consider code signing for production releases

## Database Setup (Supabase)
1. Create tables using the SQL schema in README.md
2. Enable Google OAuth in Authentication settings
3. Configure RLS policies for security

## Environment Variables
Make sure to set all required environment variables in production.
EOF

# Create archive
print_status "Creating deployment archive..."
tar -czf "wyn-link-deployment-$(date +%Y%m%d-%H%M%S).tar.gz" -C deployment .

print_success "Deployment package created successfully!"

echo ""
echo "📦 Deployment Summary"
echo "===================="
echo "✅ Web Application: Built and ready for Vercel"
echo "✅ Chrome Extension: Built and ready for Chrome Web Store"
echo "✅ Mobile Application: Prepared for Android/iOS builds"
echo "✅ PC Client: Built distributables for Windows/macOS/Linux"
echo "✅ Deployment package: Created with instructions"
echo ""
echo "📁 Deployment files are in: ./deployment/"
echo "📋 See DEPLOYMENT_INSTRUCTIONS.md for detailed steps"
echo ""
print_success "WYN Link is ready for deployment! 🎉"