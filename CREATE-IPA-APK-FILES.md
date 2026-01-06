# 📱 Create .ipa and .apk Files - Step by Step

## ✅ Build Complete!

Your static export is ready. Now create the installable app files.

---

## 🍎 Step 1: Create iOS App (.ipa file)

### 1.1 Open iOS Project
```bash
npm run ios
```
This opens Xcode with your iOS project.

### 1.2 Configure Signing in Xcode

1. **Select the project** "CleanShift" in the left sidebar
2. **Select the target** "App" under TARGETS
3. Go to **"Signing & Capabilities"** tab:
   - ✅ Check **"Automatically manage signing"**
   - Select your **Team** (Apple Developer account)
   - If you don't have one, you can use a free Apple ID for testing

### 1.3 Build for Device

**Option A: Install Directly on iPhone (Testing)**
1. Connect your iPhone via USB
2. Select your device from the device dropdown (top bar)
3. Click **Play** button (▶️) or press `Cmd + R`
4. The app installs on your iPhone

**Option B: Create .ipa File (Distribution)**
1. Select **"Any iOS Device (arm64)"** from device dropdown
2. Go to **Product → Archive**
3. Wait for archive to complete
4. The **Organizer** window opens
5. Select your archive → Click **"Distribute App"**
6. Choose distribution method:
   - **Ad Hoc**: For testing on specific devices (up to 100)
   - **App Store Connect**: For App Store submission
   - **Development**: For development testing
7. Follow wizard → Export .ipa file

**File location:** Xcode shows the location after export

---

## 🤖 Step 2: Create Android App (.apk file)

### 2.1 Open Android Project
```bash
npm run android
```
This opens Android Studio with your Android project.

### 2.2 Wait for Gradle Sync
- First time may take a few minutes
- Wait for "Gradle sync completed" message

### 2.3 Create Keystore (First Time Only)

1. Go to **Build → Generate Signed Bundle / APK**
2. Click **"Create new..."**
3. Fill in:
   - **Key store path**: Choose location (e.g., `~/cleanshift-keystore.jks`)
   - **Password**: Create strong password (SAVE IT!)
   - **Key alias**: `cleanshift-key`
   - **Key password**: Same or different
   - **Validity**: 25 years
   - **Certificate info**: Your details
4. Click **OK**

**⚠️ IMPORTANT:** Save the keystore file and password! You'll need it for future updates.

### 2.4 Generate APK

**For Testing (Debug APK):**
```bash
cd android
./gradlew assembleDebug
```
Location: `android/app/build/outputs/apk/debug/app-debug.apk`

**For Distribution (Release APK):**
1. **Build → Generate Signed Bundle / APK**
2. Select **APK** (not Android App Bundle)
3. Select your keystore file
4. Enter passwords
5. Select **release** build variant
6. Click **Finish**

**File location:** `android/app/build/outputs/apk/release/app-release.apk`

---

## 📱 Step 3: Install on Phones

### iOS (.ipa file)

**Method 1: Xcode**
- Window → Devices and Simulators
- Select device → Click "+" → Choose .ipa file

**Method 2: Finder (macOS)**
- Connect iPhone via USB
- Open Finder → Select iPhone
- Drag and drop .ipa file

**Method 3: 3uTools or similar**
- Use third-party tool to install .ipa

### Android (.apk file)

**Method 1: Direct Transfer**
- Transfer .apk to phone (USB, email, cloud)
- Open file on phone
- Allow "Install from Unknown Sources" if prompted
- Tap "Install"

**Method 2: ADB**
```bash
adb install app-release.apk
```

**Method 3: Android Studio**
- Connect phone via USB
- Enable USB Debugging
- Click **Run** (▶️) in Android Studio

---

## 🔔 Step 4: Configure Push Notifications

### iOS Push Notifications

1. **In Xcode:**
   - Select project → Target → **Signing & Capabilities**
   - Click **"+ Capability"**
   - Add **"Push Notifications"**

2. **Configure APNs:**
   - You need an Apple Developer account ($99/year)
   - Create APNs certificate in Apple Developer portal
   - Configure your backend to send APNs notifications

### Android Push Notifications

1. **Add Firebase:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create project or use existing
   - Add Android app to project
   - Download `google-services.json`
   - Place in `android/app/`

2. **Configure FCM:**
   - Get FCM server key from Firebase
   - Update your backend to send FCM notifications

---

## ⚙️ Important Configuration

### API Server URL

Make sure your mobile app knows where your API server is:

**Set environment variable:**
```bash
export NEXT_PUBLIC_API_URL=https://your-app.vercel.app
```

**Or update `lib/api-config.ts`:**
```typescript
return process.env.NEXT_PUBLIC_API_URL || 'https://your-app.vercel.app';
```

---

## ✅ Success Checklist

- [ ] Build completed successfully (`./build-native-simple.sh`)
- [ ] `out/` directory exists with `index.html`
- [ ] Capacitor synced (`npx cap sync`)
- [ ] iOS project opens in Xcode (`npm run ios`)
- [ ] Android project opens in Android Studio (`npm run android`)
- [ ] .ipa file created in Xcode
- [ ] .apk file created in Android Studio
- [ ] Apps install on phones
- [ ] Push notifications configured

---

## 🐛 Troubleshooting

### iOS: "No signing certificate"
- Add Apple Developer account: Xcode → Preferences → Accounts
- Enable "Automatically manage signing"

### Android: Gradle sync fails
- Check internet connection
- Try: File → Invalidate Caches / Restart
- Check Android SDK is installed

### Apps don't connect to API
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify API server is accessible from phone
- Check CORS settings on API server

---

## 🎉 You're Done!

Once you have the .ipa and .apk files:
- ✅ Install on phones
- ✅ Configure push notifications
- ✅ Test all features
- ✅ Distribute to users

**Push notifications will work once the native apps are installed!** 🔔

