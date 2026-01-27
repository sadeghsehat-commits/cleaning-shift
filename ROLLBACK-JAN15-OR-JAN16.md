# Rollback to January 15 or 16 (when app was working)

## Recommendation

- **Try Jan 16 first** — that’s when you said the website and Android app were working.
- **Use Jan 15 only if** Jan 16 still fails after you’ve cleared caches and reinstalled the Android app.

---

## Why rollback can “not work” even after you roll back

1. **Website (browser)**  
   The browser may still use **cached old JavaScript**.  
   → Use **Incognito/Private** or **“Empty cache and hard reload”** when testing.

2. **Android app loading from web (Vercel)**  
   The WebView can cache old JS.  
   → **Clear app data + cache** or **uninstall and reinstall** the app, then test again.

3. **Android app using bundled files (Capacitor)**  
   Vercel rollback **does not** change what’s inside the APK. The app uses whatever was built into it.  
   → You must **reset the repo** to the chosen date, **rebuild the app**, then **build a new APK**.

---

## Commits to use

| When | Commit | Description |
|------|--------|-------------|
| **Jan 16** (preferred) | `c2d071c` | Fix auto-login – last Jan 15 commit, likely what was live on Jan 16 |
| **Jan 15** (earlier) | `42564a4` | Fix notifications API – before the extra debug logs |

---

## Option A: Only Vercel rollback (website + app that loads from web)

1. In **Vercel** → **Deployments** → find the deployment from **Jan 16** (or Jan 15).
2. **⋯** → **Promote to Production** (or **Rollback**), so Production serves that deployment.
3. **Website:**  
   - Open the site in **Incognito** (or clear cache + hard reload).  
   - Check that the deployment date/commit matches what you chose.
4. **Android (if it loads from Vercel):**  
   - **Clear app data + cache** or **reinstall** the app.  
   - Open the app and test again.

---

## Option B: Reset repo + rebuild Android app (needed if app uses bundled build)

Your Android app bundles the built web app. To actually run “Jan 15/16” code inside the APK, you must reset the repo, rebuild, and create a new APK.

### 1. Reset repo to chosen date

**Jan 16 (recommended):**
```bash
cd /Users/luna/Downloads/Mahdiamooyee
git fetch origin
git checkout c2d071c
```

**Jan 15 (if you prefer):**
```bash
cd /Users/luna/Downloads/Mahdiamooyee
git fetch origin
git checkout 42564a4
```

### 2. Rebuild web app and sync to Android

The Android app uses the **static export** in `out/`. Use the mobile build script:

```bash
npm install
bash ./build-for-mobile.sh
npx cap sync android
```

(`build-for-mobile.sh` uses `next.config.mobile-export.js` and produces `out/`. If that script fails, use `npm run build` then `npx cap sync android` as a fallback — but the app expects the static export.)

### 3. Build a new APK

- Open **Android Studio** → open the `android` folder.
- **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
- Install the new APK on your device and test.

### 4. (Optional) Make this the new “main” for Vercel

If you want Vercel Production to also serve this old version:

```bash
git checkout -b rollback-jan16   # or rollback-jan15
git push origin rollback-jan16
```

Then in Vercel, either:

- Point Production to the `rollback-jan16` branch, or  
- Merge `rollback-jan16` into `main` and push, so the next deployment is this code.

---

## Summary

- Prefer **Jan 16** (`c2d071c`); use **Jan 15** (`42564a4`) only if Jan 16 still doesn’t work.
- **Website:** Vercel rollback + **Incognito / clear cache**.
- **Android (loads from web):** Same + **clear app data / reinstall**.
- **Android (bundled):** **Reset repo** → **rebuild** → **new APK**; optionally update Vercel as above.
