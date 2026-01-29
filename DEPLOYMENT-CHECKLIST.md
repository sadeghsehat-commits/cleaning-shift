# Deployment checklist

**After code changes, deploy before testing — otherwise you'll waste time debugging old builds.**

---

## Vercel build fixes (already applied)

- **next.config.js:** Removed invalid `experimental.turbo`; removed `output: 'export'` so API routes work on Vercel (static export is only used for the mobile build via `next.config.mobile-export.js`).
- **app/layout.tsx:** Replaced Google Inter font with system fonts (no Google Fonts fetch during build).

---

## 1. Web (Vercel)

```bash
git add -A
git commit -m "Your message"
git push origin main
```

- Vercel auto-deploys on `git push` (if connected).
- Wait for the build to **finish** in the Vercel dashboard.

### If you don’t see new UI (e.g. Add operator, Assign apartments)

1. **Redeploy without cache**
   - Vercel Dashboard → your project → **Deployments**
   - Open the **⋯** menu on the latest deployment → **Redeploy**
   - **Uncheck** “Use existing Build Cache”
   - Click **Redeploy** and wait until it’s **Ready**

2. **Hard refresh the site**
   - Mac: **Cmd + Shift + R**
   - Windows: **Ctrl + Shift + R**
   - Or: DevTools (F12) → right‑click refresh → **Empty Cache and Hard Reload**

3. **Use the dedicated "Assign operators" page**
   - Open: **https://your-app.vercel.app/dashboard/assign-operators** (replace with your Vercel URL)
   - Admin-only. Add operator, Assign apartments, Save.
   - If you get **404**, the new deploy is not live yet (push, redeploy, then retry).

---

## 2. Android app

```bash
cd /Users/luna/Downloads/Mahdiamooyee
npm install
./build-for-mobile.sh
npx cap sync android
```

Then in **Android Studio**: build a new APK and install it on the device.

---

## 3. Quick reference

| Change affects        | Deploy web (Vercel) | Rebuild Android |
|-----------------------|---------------------|------------------|
| API, dashboard, Users | ✅ Yes              | ✅ Yes           |
| Only API              | ✅ Yes              | ✅ Yes (uses API)|
| Docs / non-app files  | ❌ No               | ❌ No            |

**Rule:** If we changed app or API code → **deploy web + rebuild Android** before testing.

---

## 4. Login on Vercel domains (prod + previews)

- **Use the same URL** for both the app and the API. The app uses relative API calls on web, so you always hit the **current** deployment.
- **Login now works** on production (`cleaning-shift-manager.vercel.app`) and on **preview** URLs (e.g. `cleaning-shift-manager-git-main-...vercel.app`). Cookie `sameSite` is `lax` for all `*.vercel.app` origins.
- If you still **get sent back to the login page** after entering credentials:
  1. Confirm the user exists and the password is correct (e.g. create via Register if needed).
  2. Hard refresh, then try again.
  3. Try an **incognito/private** window to avoid old cookies.
  4. Check the browser console (F12) for errors when submitting login.

---

## 5. Preview works, Production / Android do not

**You see the new UI** on the preview URL (e.g. `cleaning-shift-manager-sadegh-sehats-projects.vercel.app` / `...-git-main-...`)  
**but not** on `cleaning-shift-manager.vercel.app` or in the Android app.

**Production (web):**
1. Vercel Dashboard → your project → **Deployments**.
2. Find the deployment that matches the **preview** where the new UI works (same commit/branch).
3. Open the **menu (three dots)** on that deployment → **Promote to Production** (or **Set as Production**).
4. Hard refresh `https://cleaning-shift-manager.vercel.app` (Cmd+Shift+R or Ctrl+Shift+R).

**Android:** The app serves **bundled** files from `out/`. It does **not** load the live site. You must:
1. Run `./build-for-mobile.sh` then `npx cap sync android` (see §2).
2. Build a **new APK** in Android Studio and install it on the device.  
Until you do this, the Android app will keep showing the old UI.

---

## 6. Android: "Network error" / CORS "Redirect is not allowed for preflight"

- **Cause:** The app (origin `https://localhost`) calls the Vercel API. CORS preflight (OPTIONS) must get **200 + CORS headers**; a **redirect** (e.g. trailing slash) breaks it.
- **Fix applied:** `trailingSlash: false` in `next.config.js` so `/api/auth/login` is not redirected to `/api/auth/login/`. Middleware returns 200 + CORS for OPTIONS and allows `https://localhost`.
- **Deploy:** **Push these changes**, trigger a new Vercel deploy (redeploy **without cache** if needed), then rebuild the Android app (see §2) and install a new APK. Login will keep failing until the updated config is live.
- **Fallback:** On login fetch failure, the app retries the **preview** API. If that works, it uses the preview API for the session.
- **Check:** Device has internet. After deploy, test login again.

---

## 7. Android: Notifications don’t “top up” / push not showing

- **Push registration:** The app registers FCM tokens with `POST /api/push/register` (auth required). CORS is set for Android origin `https://localhost`. If login works, registration should too.
- **List refresh:** The notifications page now **refetches** when:
  - You tap **↻ Refresh**
  - The app returns to foreground (visibility)
  - A push is received while the app is open (list updates automatically)
- **Check:** Ensure `FIREBASE_SERVICE_ACCOUNT_KEY` is set on Vercel and `google-services.json` is in `android/app/`. Rebuild Android after any change, then test.

---

## 8. PATCH /api/notifications 405 or push not arriving

**If you see `PATCH .../api/notifications 405 (Method Not Allowed)` or push still never arrives:**

1. **Deploy the latest code to Vercel**  
   The API includes `PATCH /api/notifications`, `GET /api/push/register`, `POST /api/shifts/[id]/confirm`, etc. **These are only live after deploy.**  
   - `git add -A && git commit -m "Add PATCH notifications, push register GET, confirm API" && git push origin main`  
   - Wait for the Vercel build to finish (Dashboard → Deployments → Ready).

2. **Rebuild the Android app**  
   - `./build-for-mobile.sh` → `npx cap sync android` → build APK in Android Studio, then install.  
   - The app calls the **deployed** API; the bundle comes from your local build.

3. **Check the console**  
   - You should see `📱 Push init: platform= android`, `📱 Push permission result: granted`, `📱 Push register() called, waiting for token…`, then `✅ Push registration success` and `✅ Token saved to backend`.  
   - If you see `Push permission not granted` or `❌ Push registration error`, fix permissions or Firebase setup first.
