# 🔧 Fix: out/index.html Not Created - Simple Solution

## Problem

Even with `output: 'export'` enabled, `out/index.html` is not being created.

## Most Likely Cause

**Dynamic routes** like `app/dashboard/apartments/[id]/edit/page.tsx` prevent static export.

Next.js requires `generateStaticParams()` for dynamic routes, but these are client components that can't export that function.

## ✅ Solution: Temporarily Move Dynamic Routes

**Step 1: Move dynamic route folders**

```bash
# Create backup
mkdir -p .dynamic-backup

# Move dynamic routes
mv "app/dashboard/apartments/[id]" .dynamic-backup/apartments-id 2>/dev/null || true

# Check if there are other dynamic routes
find app -type d -name "\[*\]" -exec mv {} .dynamic-backup/ \;
```

**Step 2: Build**

```bash
npm run build
```

**Step 3: Verify**

```bash
ls -la out/index.html
# Should exist now!
```

**Step 4: Restore dynamic routes**

```bash
# Restore
mv .dynamic-backup/* app/dashboard/apartments/ 2>/dev/null || true
rm -rf .dynamic-backup
```

---

## Alternative: Use Build Script

The `build-mobile.sh` script should handle this automatically:

```bash
bash build-mobile.sh
```

This script:
- Moves API routes (already done - they're deleted)
- Builds with static export
- Restores everything

---

## Quick Test

Try this now:

```bash
# 1. Move dynamic routes
mkdir -p .dynamic-backup
mv "app/dashboard/apartments/[id]" .dynamic-backup/apartments-id 2>/dev/null || echo "Already moved or doesn't exist"

# 2. Build
npm run build

# 3. Check
ls -la out/index.html

# If it exists, restore:
mv .dynamic-backup/apartments-id "app/dashboard/apartments/[id]" 2>/dev/null || true
rm -rf .dynamic-backup
```

---

The dynamic routes will work via client-side routing after the app loads, but Next.js can't statically generate them during build.

