# 📱 Android App Version Management

## Version Numbers Explained

Your Android app has **TWO** version numbers:

### 1. **versionCode** (Integer)
- **What**: Internal version number for Google Play Store
- **Format**: `1, 2, 3, 4...` (always increases)
- **Used for**: Google Play knows which version is newer
- **Example**: `versionCode 2`

### 2. **versionName** (String)
- **What**: User-visible version (what users see)
- **Format**: `"1.0.0"`, `"1.1.0"`, `"2.0.0"`, etc.
- **Used for**: Display in app settings, Play Store listing
- **Example**: `versionName "1.1.0"`

---

## 📍 Where to Change Versions

**File**: `android/app/build.gradle`

**Location**: Lines 10-11

```gradle
defaultConfig {
    applicationId "com.cleanshift.app"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 2          // ← Change this (always increase by 1)
    versionName "1.1.0"    // ← Change this (user-visible)
    testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    ...
}
```

---

## 🔢 Version Naming Convention

### Semantic Versioning: `MAJOR.MINOR.PATCH`

**Example**: `1.2.3`
- **1** = Major version (big changes, breaking changes)
- **2** = Minor version (new features, improvements)
- **3** = Patch version (bug fixes, small tweaks)

### When to Increase:

| Change Type | Example | Version Change |
|-------------|---------|----------------|
| **Major Update** | Complete redesign, new architecture | `1.0.0` → `2.0.0` |
| **New Features** | Added FCM notifications | `1.0.0` → `1.1.0` |
| **Bug Fixes** | Fixed notification badge | `1.1.0` → `1.1.1` |

---

## 📊 Current Version History

| Version Code | Version Name | Date | Changes |
|--------------|--------------|------|---------|
| 1 | 1.0.0 | Jan 7, 2025 | Initial release |
| 2 | 1.1.0 | Jan 8, 2025 | FCM notifications, fixed UI bugs |

---

## 🔄 How to Update Version

### For Every New APK Build:

1. **Open**: `android/app/build.gradle`

2. **Increase versionCode** (always +1):
   ```gradle
   versionCode 2  // Was 1, now 2
   ```

3. **Update versionName** (based on changes):
   ```gradle
   versionName "1.1.0"  // Was "1.0.0"
   ```

4. **Save** the file

5. **Rebuild APK**:
   ```bash
   ./build-native-simple.sh
   npx cap open android
   # Build → Build APK
   ```

---

## 📝 Version Update Checklist

For each release:

- [ ] Decide version number based on changes
- [ ] Update `versionCode` (+1)
- [ ] Update `versionName` (e.g., `1.1.0`)
- [ ] Rebuild APK
- [ ] Test on device
- [ ] Document changes in version history

---

## 🎯 Current Version (After This Update)

```gradle
versionCode 2
versionName "1.1.0"
```

**Changes in 1.1.0**:
- ✅ FCM push notifications (lock screen)
- ✅ Fixed horizontal scrolling
- ✅ Fixed shift details "Loading..." issue
- ✅ Hidden notification buttons in mobile app
- ✅ Auto-clear notification badge

---

## 🚀 Quick Command

To check current version in APK:

```bash
# After building APK
aapt dump badging android/app/build/outputs/apk/debug/app-debug.apk | grep version
```

Output:
```
versionCode='2' versionName='1.1.0'
```

---

## 📌 Important Rules:

1. ⚠️ **NEVER decrease versionCode** (always increase)
2. ⚠️ **versionCode must be unique** for each build
3. ✅ **versionName can be any string** (but follow semantic versioning)
4. ✅ **Always update BOTH** before building new APK

---

## 🎉 You're All Set!

Your app is now at **Version 1.1.0** (versionCode 2).

Next time you make changes:
- Small fixes → `1.1.1` (versionCode 3)
- New features → `1.2.0` (versionCode 4)
- Major update → `2.0.0` (versionCode 5)

