# 🚀 Deploy Logout Fix to Vercel

## Current Status

The logout CORS fix is **saved locally** but **not pushed to GitHub/Vercel yet**.

## ✅ What Needs to Be Done

Run these commands in your **Mac Terminal** (not in Cursor):

```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee

# Add the logout fix
git add app/api/auth/logout/route.ts ANDROID-NOTIFICATION-PERMISSIONS.md FIX-ANDROID-NOTIFICATIONS-BLOCKED.md

# Commit
git commit -m "Add CORS to logout API for mobile app"

# Push to GitHub (this triggers Vercel deployment)
git push origin main
```

## ✅ After Push

1. **Check GitHub**: Go to `https://github.com/sadeghsehat-commits/cleaning-shift`
   - You should see a new commit: "Add CORS to logout API for mobile app"

2. **Check Vercel**: Go to `https://vercel.com/sadegh-sehats-projects/cleaning-shift-manager/deployments`
   - A new deployment should start automatically
   - Wait until it shows **"Ready"** (green dot)

3. **Test Logout**: Open the Android app and try logout
   - It should now work correctly

---

## 📱 About Android Notifications

### Why Android Doesn't Ask for Permission

Android **won't ask** for notification permission on reinstall if:
1. You previously denied it multiple times
2. The permission was blocked at the system level
3. The app didn't request permission correctly on first launch

### Solution: Request Permission from Inside the App

Since Android doesn't automatically ask, you need to **trigger the permission request from within the app**:

1. **Open the CleanShift app**
2. **Login** to your account
3. **Go to the Notifications page** in the app (if it has one)
4. **Or** go to **Settings → Apps → CleanShift → Permissions → Notifications** and manually enable

### Alternative: Factory Reset Notification Permissions

If the above doesn't work, you can reset **all** app permissions:

```bash
# Via ADB (if you have it installed):
adb shell pm reset-permissions com.cleanshift.app
```

Or:
1. **Settings → Apps → See all apps**
2. **Tap the three dots (⋮) → Reset app preferences**
3. **Confirm**
4. **Uninstall and reinstall** CleanShift
5. Android should now ask for permissions again

---

**First priority: Run the git commands above to deploy the logout fix! 🚀**

