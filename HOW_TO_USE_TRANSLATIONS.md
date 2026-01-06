# How to Use Translations - Simple Guide

## ❓ What You Need to Do

When you want to translate text in any component file, you need to do **2 simple things**:

### Step 1: Add this line at the TOP of your file (with other imports)
```typescript
import { useI18n } from '@/contexts/I18nContext';
```

### Step 2: Add this line INSIDE your component function
```typescript
const { t } = useI18n();
```

### Step 3: Replace hardcoded text with `{t.xxx.xxx}`

## 📝 Real Example:

Let's say you have a file `app/dashboard/shifts/page.tsx` and you see this code:

**BEFORE (without translations):**
```typescript
'use client';

import { useEffect, useState } from 'react';
// ... other imports

export default function ShiftsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  return (
    <div>
      <h1>Shifts</h1>
      <button>Create New Shift</button>
      <p>Loading...</p>
    </div>
  );
}
```

**AFTER (with translations):**
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';  // 👈 STEP 1: Add this import

export default function ShiftsPage() {
  const router = useRouter();
  const { t } = useI18n();  // 👈 STEP 2: Add this line
  
  return (
    <div>
      <h1>{t.shifts.title}</h1>                    {/* 👈 STEP 3: Replace "Shifts" */}
      <button>{t.shifts.createNew}</button>        {/* 👈 STEP 3: Replace "Create New Shift" */}
      <p>{t.common.loading}</p>                    {/* 👈 STEP 3: Replace "Loading..." */}
    </div>
  );
}
```

## 🎯 Where to Do This:

**Do this in ANY component file that has text you want to translate:**

- ✅ `app/dashboard/shifts/page.tsx`
- ✅ `app/dashboard/shifts/new/page.tsx`
- ✅ `app/dashboard/shifts/[id]/page.tsx`
- ✅ `app/dashboard/shifts/[id]/edit/page.tsx`
- ✅ `app/dashboard/apartments/page.tsx`
- ✅ `app/dashboard/notifications/page.tsx`
- ✅ `app/dashboard/users/page.tsx`
- ✅ ANY other component file with text!

## 📋 Quick Reference:

### Common replacements:
- `"Loading..."` → `{t.common.loading}`
- `"Save"` → `{t.common.save}`
- `"Cancel"` → `{t.common.cancel}`
- `"Delete"` → `{t.common.delete}`
- `"Edit"` → `{t.common.edit}`
- `"Create New Shift"` → `{t.shifts.createNew}`
- `"Shifts"` → `{t.shifts.title}`
- `"Home"` → `{t.nav.home}`

## ⚠️ Important Rules:

1. **Your component MUST start with `'use client';`** at the very top
2. **The `const { t } = useI18n();` line must be INSIDE the component function**, not outside
3. **Use curly braces `{ }` around the translation**, like `{t.common.loading}` not `t.common.loading`

## 🎨 Example I Already Did for You:

Look at `app/dashboard/page.tsx` - I've already translated it! Open that file and you'll see exactly how it works.



