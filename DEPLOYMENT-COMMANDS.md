# Deployment Commands Guide

## Quick Reference

### Deploy to GitHub + Vercel (Web Browser)
```bash
# 1. Add all changes
git add .

# 2. Commit with a message
git commit -m "Your commit message here"

# 3. Push to GitHub (triggers Vercel deployment automatically)
git push origin main
```

### Build for Android App (No Deployment Needed)
```bash
# 1. Build static files
./build-for-mobile.sh

# 2. Sync with Capacitor
npx cap sync android

# 3. Open Android Studio
npx cap open android
```

---

## Detailed Steps

### For Web Browser (Vercel Deployment)

**Step 1: Check what changed**
```bash
git status
```

**Step 2: Add files to staging**
```bash
# Add all changes
git add .

# OR add specific files
git add app/dashboard/shifts/details/page.tsx
git add lib/api-config.ts
```

**Step 3: Commit changes**
```bash
git commit -m "Description of what you changed"
```

**Examples of good commit messages:**
```bash
git commit -m "Fix shift details page for mobile app"
git commit -m "Add guest count display in shift details"
git commit -m "Update Android version to 1.2.0"
git commit -m "Fix navigation to use static routes in mobile"
```

**Step 4: Push to GitHub**
```bash
git push origin main
```

**Step 5: Wait for Vercel**
- Vercel automatically deploys when you push to GitHub
- Check deployment status: https://vercel.com/dashboard
- Usually takes 1-3 minutes

---

### For Android App (Local Build Only)

**Step 1: Build static export**
```bash
./build-for-mobile.sh
```

**Step 2: Sync with Capacitor**
```bash
npx cap sync android
```

**Step 3: Open Android Studio**
```bash
npx cap open android
```

**Step 4: Build APK in Android Studio**
- Wait for Gradle sync
- Build > Build Bundle(s) / APK(s) > Build APK(s)
- APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## When to Deploy vs Build

### Deploy to Vercel/GitHub When:
- ✅ You change API routes (`app/api/...`)
- ✅ You change server-side code
- ✅ You want web browser users to see changes
- ✅ You update environment variables
- ✅ You fix bugs that affect the web version

### Build Android App When:
- ✅ You change client-side pages (`app/dashboard/...`)
- ✅ You change components (`components/...`)
- ✅ You change styling or UI
- ✅ You fix mobile-specific issues
- ✅ You update the Android version number

### Both When:
- ✅ You change shared code that affects both web and mobile
- ✅ You update API routes AND client code
- ✅ You want changes in both places

---

## Complete Workflow Example

### Scenario: Fix shift details page

**1. Deploy to Vercel (for web browser)**
```bash
git add app/dashboard/shifts/details/page.tsx
git commit -m "Fix shift details page layout"
git push origin main
# Wait for Vercel deployment (1-3 minutes)
```

**2. Build Android app (for mobile)**
```bash
./build-for-mobile.sh
npx cap sync android
npx cap open android
# Build APK in Android Studio
```

---

## Troubleshooting

### If `git push` fails:
```bash
# Pull latest changes first
git pull origin main

# If there are conflicts, resolve them, then:
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

### If Vercel deployment fails:
1. Check Vercel dashboard: https://vercel.com/dashboard
2. Look at build logs for errors
3. Fix errors in code
4. Commit and push again

### If Android build fails:
```bash
# Clean and rebuild
rm -rf .next out android/app/build
./build-for-mobile.sh
npx cap sync android
```

---

## Quick Commands Cheat Sheet

```bash
# === GITHUB + VERCEL (Web) ===
git add . && git commit -m "Your message" && git push origin main

# === ANDROID APP (Mobile) ===
./build-for-mobile.sh && npx cap sync android && npx cap open android

# === BOTH (Web + Mobile) ===
git add . && git commit -m "Your message" && git push origin main && \
./build-for-mobile.sh && npx cap sync android
```

---

## Important Notes

1. **Vercel auto-deploys** when you push to GitHub (main branch)
2. **Android app is static** - no deployment needed, just local build
3. **API calls** from Android app go to Vercel (already deployed)
4. **Always test** web version after Vercel deployment
5. **Always rebuild** Android app after code changes

