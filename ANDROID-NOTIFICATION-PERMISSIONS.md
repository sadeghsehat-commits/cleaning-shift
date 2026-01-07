# 🔔 Fix Android Notification Permission Issue

## Problem

Android shows: **"At your request, Android is blocking this app's notifications from appearing on this device"**

This happens because:
1. Android blocked notifications at some point (maybe when you first opened the app)
2. The app cannot request permissions again until you manually enable them

## ✅ Solution: Enable Notifications Manually

### On Your Android Phone

1. **Open Settings**
2. **Apps → CleanShift** (or **Settings → Notifications → CleanShift**)
3. Tap **"Notifications"**
4. **Turn ON** the toggle for "All CleanShift notifications"
5. Close settings and reopen the CleanShift app

### After Enabling

Once you enable notifications:
- The app will be able to send push notifications
- You'll receive alerts when:
  - A new shift is assigned (operators)
  - Shift time changes
  - Unavailability requests (admins)
  - Other important events

## 🔧 Alternative: Clear App Data (Full Reset)

If the toggle doesn't work, you can reset the app:

1. **Settings → Apps → CleanShift**
2. Tap **"Storage"**
3. Tap **"Clear Data"**
4. Uninstall and reinstall the APK
5. When you open the app, Android will ask for notification permission again

⚠️ **Warning:** Clearing data will log you out.

## 📱 Why This Happens

Android remembers when you:
- Denied notification permission
- Disabled notifications manually
- Blocked notifications in any way

The app **cannot override** this setting — only the user can re-enable it in Settings.

---

**After enabling notifications in Settings, the app will work normally! 🚀**

