# Complete Deployment Commands

## Fastest Method - Copy All at Once

Open Terminal and run these commands **one by one**:

```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
```

```bash
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
```

```bash
git add app/api/shifts/\[id\]/comments/route.ts
```

```bash
git commit -m "Fix comment notifications to use TOP UP title and include url in FCM data"
```

```bash
git push origin main
```

---

## OR: Single Line Command (All at Once)

```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee && export PATH="/usr/bin:/bin:/usr/sbin:/sbin:$PATH" && git add app/api/shifts/\[id\]/comments/route.ts && git commit -m "Fix comment notifications to use TOP UP title and include url in FCM data" && git push origin main
```

---

## Step-by-Step Explanation

### Step 1: Go to Project Directory
```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
```

### Step 2: Fix Xcode Error (Temporary)
```bash
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
```

### Step 3: Add Changed File
```bash
git add app/api/shifts/\[id\]/comments/route.ts
```

**Note:** The `\[` and `\]` are needed because the folder name contains brackets. 

### Step 4: Commit Changes
```bash
git commit -m "Fix comment notifications to use TOP UP title and include url in FCM data"
```

### Step 5: Push to GitHub
```bash
git push origin main
```

---

## Alternative: Add All Changes (If You Changed Multiple Files)

```bash
cd /Users/LUNAFELICE/Desktop/Mahdiamooyee
export PATH="/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
git add .
git commit -m "Fix comment notifications to use TOP UP title and include url in FCM data"
git push origin main
```

---

## Verify It Worked

After pushing, you should see:
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Writing objects: 100% (X/X), XXX bytes | XXX bytes/s, done.
To https://github.com/sadeghsehat-commits/cleaning-shift.git
   XXXXXX..XXXXXX  main -> main
```

---

## After Deployment

1. ✅ **Wait 1-3 minutes** for Vercel to deploy
2. 🔗 **Check status**: https://vercel.com/dashboard
3. 🌐 **Test**: https://cleaning-shift-manager.vercel.app

---

## What Changed

**File:** `app/api/shifts/[id]/comments/route.ts`

**Changes:**
- Changed notification title from "New Comment Added" to "TOP UP"
- Added `url` field to FCM notification data
- Changed FCM data type to match shift assignment notifications
- Now comment notifications will appear as push notifications

