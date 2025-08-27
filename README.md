# WYN Link - Remote Desktop Application

A comprehensive remote desktop control application that allows secure access to computers from anywhere in the world. Built with modern web technologies and cross-platform compatibility.

## 🚀 Features

- **Cross-Platform Support**: Web app, Chrome extension, Android, iOS, and PC client
- **Secure Authentication**: Google OAuth integration with 4-digit PIN protection
- **Real-time Control**: WebRTC-based desktop sharing and remote control
- **Access Control**: Full and partial access modes with app/folder restrictions
- **One-time Sessions**: Secure session codes that expire automatically
- **Multi-device Support**: Connect from mobile, tablet, or desktop
- **System Integration**: Native system tray and notification support

## 📱 Applications

### 1. Web Application (Next.js)
- **Location**: `web-app/`
- **Technology**: Next.js, React, TypeScript, Tailwind CSS
- **Features**: Session management, authentication, remote desktop viewer
- **Database**: Supabase integration
- **Deployment**: Vercel-ready

### 2. Chrome Extension
- **Location**: `chrome-extension/`
- **Technology**: Vanilla JavaScript, Chrome APIs
- **Features**: Desktop capture, screen sharing, session hosting
- **Permissions**: Desktop capture, notifications, storage
- **Build**: Webpack bundling

### 3. Mobile Application (React Native)
- **Location**: `mobile-app/`
- **Technology**: React Native, TypeScript
- **Platforms**: Android & iOS
- **Features**: Remote control, touch gestures, session joining
- **Authentication**: Google OAuth, deep linking

### 4. PC Client (Electron)
- **Location**: `pc-client/`
- **Technology**: Electron, Node.js
- **Platforms**: Windows, macOS, Linux
- **Features**: Desktop hosting, system tray, session management
- **Distribution**: Installer packages (NSIS, DMG, AppImage)

### 5. Shared Utilities
- **Location**: `shared/`
- **Technology**: TypeScript
- **Purpose**: Common types, authentication helpers, WebRTC utilities
- **Usage**: Shared across all applications

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Java 11+ (for Android keystore generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wyn-link
   ```

2. **Install dependencies for all projects**
   ```bash
   # Web application
   cd web-app && npm install && cd ..
   
   # Chrome extension
   cd chrome-extension && npm install && cd ..
   
   # Mobile application
   cd mobile-app && npm install && cd ..
   
   # PC client
   cd pc-client && npm install && cd ..
   
   # Shared utilities
   cd shared && npm install && cd ..
   ```

3. **Environment Configuration**
   
   Create `.env.local` files in each project directory:
   
   **Web App** (`web-app/.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://dormyjrizsmstzzhtolu.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

## 🚀 Running the Applications

### Web Application
```bash
cd web-app
npm run dev
# Access at http://localhost:3000
```

### Chrome Extension
```bash
cd chrome-extension
npm run build
# Load unpacked extension from chrome-extension/dist/ in Chrome
```

### Mobile Application
```bash
cd mobile-app

# Android
npm run android

# iOS (macOS only)
npm run ios
```

### PC Client
```bash
cd pc-client
npm run dev
# Or for production build
npm run build:win  # Windows
npm run build:mac  # macOS
npm run build:linux  # Linux
```

## 📦 Building for Production

### Android APK Generation

1. **Generate Release Keystore**
   ```bash
   cd mobile-app/android
   ./generate-keystore.sh
   ```

2. **Build Release APK**
   ```bash
   cd mobile-app
   npm run build:android
   # APK will be in android/app/build/outputs/apk/release/
   ```

### iOS App Store Build
```bash
cd mobile-app
npm run build:ios
# Follow Xcode archive and upload process
```

### Chrome Extension Package
```bash
cd chrome-extension
npm run build
# Package the dist/ folder for Chrome Web Store
```

### PC Client Distributables
```bash
cd pc-client
npm run dist
# Installers will be in dist/ folder
```

## 🔐 Security Configuration

### Keystore Details (Android)
- **Key Alias**: wynlinkaccess
- **Developer**: Hope Ukpai
- **Organization**: WYN Tech
- **Location**: Abuja, Federal Capital Territory, Nigeria
- **Country Code**: NG
- **Validity**: 10,000 days

### Supabase Configuration
- **Project ID**: dormyjrizsmstzzhtolu
- **Project Name**: WYN_Link_Remote_App
- **Authentication**: Google OAuth enabled
- **Database**: PostgreSQL with RLS policies

## 🌐 Deployment

### Web Application
- **Platform**: Vercel
- **Domain**: Custom domain supported
- **Environment**: Production environment variables required

### Mobile Applications
- **Android**: Google Play Store
- **iOS**: Apple App Store
- **Requirements**: Developer accounts and app store compliance

### Chrome Extension
- **Platform**: Chrome Web Store
- **Requirements**: Developer account and extension review

### PC Client
- **Distribution**: Direct download
- **Platforms**: Windows, macOS, Linux
- **Code Signing**: Recommended for production

## 📱 Deep Linking

The application supports deep linking across all platforms:

- **Web**: `https://wynlink.com/join/SESSION_CODE?pin=PIN`
- **Mobile**: `wynlink://join/SESSION_CODE?pin=PIN`
- **PC**: `wynlink://join/SESSION_CODE?pin=PIN`

## 🔧 Architecture

### WebRTC Implementation
- **Signaling**: Socket.io server
- **STUN/TURN**: Public STUN servers (configurable)
- **Codecs**: VP8/VP9 for video, Opus for audio
- **Data Channels**: Mouse/keyboard events, file transfer

### Database Schema
```sql
-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code VARCHAR(8) UNIQUE NOT NULL,
  pin VARCHAR(4) NOT NULL,
  host_user_id UUID REFERENCES auth.users(id),
  access_level VARCHAR(10) CHECK (access_level IN ('full', 'partial')),
  allowed_apps TEXT[],
  allowed_paths TEXT[],
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session participants
CREATE TABLE session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  user_id UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test across platforms
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Developer

**Hope Ukpai**
- Organization: WYN Tech
- Location: Abuja, Federal Capital Territory, Nigeria
- Email: hope@wyntech.com

## 🆘 Support

For support and bug reports:
- Email: support@wyntech.com
- GitHub Issues: Create an issue in this repository

## 🔄 Version History

- **v1.0.0**: Initial release with full cross-platform support
  - Web application with session management
  - Chrome extension for desktop hosting
  - React Native mobile apps (Android/iOS)
  - Electron PC client
  - Supabase backend integration
  - Google OAuth authentication

---

**Note**: This is a comprehensive remote desktop solution. Ensure you comply with local laws and regulations regarding remote access software in your jurisdiction.