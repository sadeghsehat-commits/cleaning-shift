# 🔔 Fix: Android Notifications Permanently Blocked

## Problem

You cannot enable notifications because Android shows:
- **"At your request, Android is blocking this app's notifications from appearing on this device"**
- The toggle is **locked/grayed out** and cannot be moved

This happens when Android has **permanently blocked** notifications for the app.

## ✅ Solution: Uninstall & Reinstall

The **only way** to fix this is to completely reset the app:

### Step 1: Uninstall the App

1. **Long-press** the CleanShift app icon
2. Tap **"App info"** or **"i"**
3. Tap **"Uninstall"**
4. Confirm

### Step 2: Clear All App Data (Optional but Recommended)

If uninstall doesn't fully reset:

1. **Settings → Apps → See all apps**
2. Find **CleanShift** (even if uninstalled, it might still be listed)
3. Tap **"Storage"**
4. Tap **"Clear storage"** or **"Clear data"**
5. Confirm

### Step 3: Reinstall the APK

1. Transfer the **latest APK** to your phone:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```
2. Install it
3. **Open the app**

### Step 4: Grant Notification Permission

When you first open the app, Android will show:
- **"Allow CleanShift to send you notifications?"**
- Tap **"Allow"** ✅

If Android doesn't ask:
1. Before logging in, try to request permissions from the app's notification page
2. Or go to **Settings → Apps → CleanShift → Notifications** (should be unlocked now)

---

## 🔍 Why This Happens

Android **permanently blocks** notifications when:
- You denied notification permission multiple times
- You manually disabled notifications and then blocked them
- The app crashed or misbehaved with notifications

The block is **permanent** until you completely uninstall and reinstall the app.

## 🚀 After Reinstall

1. ✅ Notifications will be **unlocked**
2. ✅ You can enable/disable them normally
3. ✅ The app will receive push notifications

---

**Uninstall → Reinstall is the only way to unlock notifications on Android! 🔓**

