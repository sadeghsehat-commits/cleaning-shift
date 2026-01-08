# Rebuild Android App - Complete Guide

## Why Rebuild?
The Android app uses a **static build** of your web app. When you make changes to the code:
- ✅ **Web browser**: Vercel automatically rebuilds (works immediately)
- ❌ **Android app**: Uses old static files (needs manual rebuild)

## Step-by-Step Rebuild Process

### 1. Increment Version (Already Done ✅)
- Version updated to `1.2.0` (versionCode 4)

### 2. Clean Previous Builds
```bash
# Remove old build files
rm -rf .next
rm -rf out
rm -rf android/app/build
```

### 3. Rebuild Static Export
```bash
# Option A: Use the build script (recommended)
./build-for-mobile.sh

# OR Option B: Manual build
NEXT_CONFIG_FILE=next.config.mobile-export.js npm run build

# Verify the build succeeded
ls -la out/index.html
ls -la out/dashboard/shifts/details/index.html
```

### 4. Sync with Capacitor
```bash
# Copy static files to Android project
npx cap sync android
```

### 5. Open Android Studio
```bash
npx cap open android
```

### 6. Build APK in Android Studio
1. Wait for Gradle sync to complete
2. Go to: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. Wait for build to complete (check bottom status bar)
4. When done, click **locate** in the notification
5. The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### 7. Install on Phone
1. Transfer APK to your phone (USB, email, cloud storage)
2. On phone: Settings > Security > Enable "Install from Unknown Sources"
3. Open the APK file and install
4. **Uninstall the old version first** if it doesn't update automatically

## Troubleshooting

### If shift details still don't show:
1. **Check console logs** in Android Studio:
   - Open Logcat
   - Filter by: `chromium` or `WebView`
   - Look for errors when opening shift details

2. **Verify API calls**:
   - Check if `fetchShift()` is being called
   - Check if API returns data with `guestCount`
   - Look for CORS or network errors

3. **Clear app data**:
   - Settings > Apps > Cleaning Shift Manager > Clear Data
   - Reinstall the app

4. **Check static build**:
   ```bash
   # Verify the details page exists in static build
   ls -la out/dashboard/shifts/details/index.html
   ```

### Common Issues:

**Issue**: "Loading..." screen forever
- **Fix**: Check `out/index.html` exists and `capacitor.config.ts` has `webDir: 'out'`

**Issue**: Old version still shows
- **Fix**: Uninstall old app completely, then install new APK

**Issue**: Shift details page blank
- **Fix**: Check browser console (Chrome DevTools via USB debugging) for JavaScript errors

## Quick Rebuild Command (All-in-One)
```bash
# Clean, build, sync
rm -rf .next out android/app/build && \
npm run build:mobile && \
npx cap sync android && \
echo "✅ Ready! Now open Android Studio: npx cap open android"
```

