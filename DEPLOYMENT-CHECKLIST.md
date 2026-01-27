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
- **Hard refresh** the site (Ctrl+Shift+R / Cmd+Shift+R) or use incognito to avoid cache.

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
