# Shift Details Page Not Loading — Fix Checklist

## Why it breaks

The shift details page was hitting **React Error #310** (hooks used after conditional returns).  
That’s fixed in code. The live site can still **serve old cached JavaScript** from a previous Vercel build, so you keep seeing "Loading..." or "Application error".

---

## What was fixed

1. **`app/dashboard/shifts/details/page.tsx`**
   - All hooks (`useI18n`, `useState`, etc.) run **before** any conditional logic.
   - No `if (!shiftId) return` (or similar) before hooks.
   - Loading / no-ID / not-found handled in **JSX** (ternary), not early returns.
   - Handlers guard with `if (!shiftId) return` before using `shiftId`.

2. **`build-for-mobile.sh`**
   - Merge conflict resolved; uses script directory + nvm.

---

## Deploy the fix (do all steps)

### 1. Commit and push

```bash
cd /Users/luna/Downloads/Mahdiamooyee

# Resolve merge state (keep our version of build-for-mobile)
git add build-for-mobile.sh
git status   # ensure no other conflicts

# Commit shift-details + build script fixes
git add app/dashboard/shifts/details/page.tsx
git commit -m "Fix shift details page: hooks before returns, resolve build script conflict"

# Push to GitHub
git push origin main
```

### 2. Vercel: redeploy **without** cache

Pushing alone can reuse the **existing build cache**. You must redeploy without it:

1. Open **[Vercel Dashboard](https://vercel.com/dashboard)** → your **cleaning-shift-manager** project.
2. Go to **Deployments**.
3. Open the **⋯** menu on the **latest** deployment (the one from your push).
4. Click **Redeploy**.
5. **Uncheck** “Use existing Build Cache”.
6. Click **Redeploy** again.

Wait for the deployment to finish (green checkmark).

### 3. Hard-refresh when testing

- **Chrome:** DevTools (F12) → right‑click refresh → **Empty cache and hard reload**.
- Or use an **Incognito** window.

Then open:

**https://cleaning-shift-manager.vercel.app/dashboard/shifts/details?id=695ea299f8549eac18d74e43**

---

## If it still fails

- Confirm the **latest** deployment in Vercel is the one you just redeployed (check commit hash).
- Try a different browser or device.
- In DevTools → **Console**, check for **React #310** or other errors and share them.
