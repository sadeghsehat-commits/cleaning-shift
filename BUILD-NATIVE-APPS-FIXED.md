# 📱 Build Native Apps - Fixed Approach

## ✅ Solution for .ipa/.apk Files

Since you need native apps for push notifications, here's the working solution:

### Step 1: Build Static Export

```bash
./build-native-apps.sh
```

This script:
- ✅ Temporarily removes API routes (they stay on server)
- ✅ Uses mobile export config
- ✅ Builds static files in `out/` directory
- ✅ Syncs with Capacitor

### Step 2: Build iOS App (.ipa)

```bash
npm run ios
```

**In Xcode:**
1. Wait for project to open
2. Select your **Team** in Signing & Capabilities
3. **Product → Archive**
4. **Distribute App** → Choose method → Export .ipa

**File location:** Xcode will show after archiving

### Step 3: Build Android App (.apk)

```bash
npm run android
```

**In Android Studio:**
1. Wait for Gradle sync
2. **Build → Generate Signed Bundle / APK**
3. Choose **APK** → Select keystore → **release** → Build

**File location:** `android/app/build/outputs/apk/release/app-release.apk`

---

## 🔧 How It Works

The build process:
1. **Removes API routes** temporarily (they can't be exported statically)
2. **Creates static HTML/JS files** in `out/` directory
3. **Syncs with Capacitor** to copy files to iOS/Android projects
4. **Dynamic pages** use client-side routing (works fine in mobile apps)

**API calls** will go to your remote server (set `NEXT_PUBLIC_API_URL` environment variable).

---

## ⚙️ Configuration

### API Server URL

Before building, set your production API URL:

```bash
export NEXT_PUBLIC_API_URL=https://your-app.vercel.app
```

Or update `lib/api-config.ts`:
```typescript
return process.env.NEXT_PUBLIC_API_URL || 'https://your-app.vercel.app';
```

---

## 📱 Push Notifications

Once you have the .ipa/.apk files installed:

1. **iOS**: Configure push notifications in Xcode
   - Enable "Push Notifications" capability
   - Configure APNs (Apple Push Notification service)
   - Update your backend to send APNs notifications

2. **Android**: Configure FCM (Firebase Cloud Messaging)
   - Add Firebase to Android project
   - Configure FCM in your backend
   - Update notification handling

**Note:** Push notifications require:
- iOS: Apple Developer account + APNs certificate
- Android: Firebase project + FCM server key

---

## 🐛 Troubleshooting

### Build Fails: "out directory not found"
- Check `build-mobile.log` for errors
- Make sure API routes were moved temporarily
- Try: `rm -rf out .next` then rebuild

### Dynamic Pages Not Working
- They use client-side routing - should work fine
- Make sure API server is accessible
- Check `NEXT_PUBLIC_API_URL` is set correctly

### Capacitor Sync Fails
- Make sure `out/` directory exists
- Check `capacitor.config.ts` has correct `webDir: 'out'`
- Try: `npx cap sync --force`

---

## ✅ Success Checklist

- [ ] `./build-native-apps.sh` completes successfully
- [ ] `out/` directory created with `index.html`
- [ ] `npx cap sync` completes
- [ ] iOS project opens in Xcode (`npm run ios`)
- [ ] Android project opens in Android Studio (`npm run android`)
- [ ] Can build .ipa file in Xcode
- [ ] Can build .apk file in Android Studio

---

**Once you have the .ipa/.apk files, you can install them on phones and push notifications will work!** 🎉

