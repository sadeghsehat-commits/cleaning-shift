# 📱 Quick Start - Build iOS & Android Apps

## 🚀 Fastest Way to Create Installable Apps

### Step 1: Build for Mobile
```bash
./build-mobile.sh
```

This script:
- ✅ Builds your web app as static files
- ✅ Excludes API routes (they stay on your server)
- ✅ Syncs with Capacitor
- ✅ Creates `out/` directory with all files

### Step 2: Build iOS App (.ipa file)

```bash
npm run ios
```

**In Xcode:**
1. Select your **Team** in Signing & Capabilities
2. Connect iPhone or select simulator
3. **Product → Archive** (for .ipa file)
4. **Distribute App** → Choose method → Export .ipa

**File location:** After archiving, Xcode will show the location

### Step 3: Build Android App (.apk file)

```bash
npm run android
```

**In Android Studio:**
1. Wait for Gradle sync
2. **Build → Generate Signed Bundle / APK**
3. Choose **APK** → Select keystore → **release** → Build

**File location:** `android/app/build/outputs/apk/release/app-release.apk`

---

## 📋 What You Get

- **iOS**: `.ipa` file (like WhatsApp installer)
- **Android**: `.apk` file (like WhatsApp installer)

Both files can be installed directly on phones!

---

## ⚙️ Important Configuration

### API Server URL

Your mobile app needs to know where your API server is. 

**Before building, set this environment variable:**
```bash
export NEXT_PUBLIC_API_URL=https://your-app.vercel.app
```

Or update `lib/api-config.ts`:
```typescript
return process.env.NEXT_PUBLIC_API_URL || 'https://your-app.vercel.app';
```

---

## 🎯 Complete Workflow

```bash
# 1. Set API URL (one time)
export NEXT_PUBLIC_API_URL=https://your-app.vercel.app

# 2. Build for mobile
./build-mobile.sh

# 3. Build iOS
npm run ios
# Then in Xcode: Archive → Distribute

# 4. Build Android  
npm run android
# Then in Android Studio: Generate Signed APK
```

---

## 📖 More Details

See **BUILD-MOBILE-APPS.md** for:
- Detailed step-by-step instructions
- Troubleshooting
- Customization options
- Distribution methods

---

**That's it!** You now have installable app files like WhatsApp! 🎉

