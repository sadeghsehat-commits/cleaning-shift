# How to Use Translations in Your Components

## Step-by-Step Guide

### Example: Let's translate a simple component

**BEFORE (without translations):**
```typescript
export default function MyPage() {
  return (
    <div>
      <h1>Shifts</h1>
      <button>Create New Shift</button>
      <p>No shifts found</p>
    </div>
  );
}
```

**AFTER (with translations):**
```typescript
'use client';  // Don't forget this for client components!

import { useI18n } from '@/contexts/I18nContext';  // Step 1: Import

export default function MyPage() {
  const { t } = useI18n();  // Step 2: Get translations

  return (
    <div>
      <h1>{t.shifts.title}</h1>                    {/* Step 3: Use t.xxx instead of hardcoded text */}
      <button>{t.shifts.createNew}</button>
      <p>{t.shifts.noShifts}</p>
    </div>
  );
}
```

## Detailed Steps:

### Step 1: Import the hook
At the top of your component file, add:
```typescript
import { useI18n } from '@/contexts/I18nContext';
```

### Step 2: Use the hook inside your component
```typescript
const { t } = useI18n();
```

### Step 3: Replace hardcoded text with `t.xxx`

Instead of writing:
- `"Shifts"` → use `{t.shifts.title}`
- `"Loading..."` → use `{t.common.loading}`
- `"Save"` → use `{t.common.save}`
- `"Delete"` → use `{t.common.delete}`

## Available Translation Categories:

### Common buttons/actions:
- `t.common.loading` - "Loading..."
- `t.common.save` - "Save"
- `t.common.cancel` - "Cancel"
- `t.common.delete` - "Delete"
- `t.common.edit` - "Edit"
- `t.common.view` - "View"
- `t.common.confirm` - "Confirm"

### Navigation:
- `t.nav.home` - "Home"
- `t.nav.shifts` - "Shifts"
- `t.nav.apartments` - "Apartments"
- `t.nav.users` - "Users"
- `t.nav.notifications` - "Notifications"

### Dashboard:
- `t.dashboard.title` - "Calendar"
- `t.dashboard.shiftsFor` - "Shifts for"
- `t.dashboard.noShifts` - "No shifts scheduled for this date"
- `t.dashboard.apartmentOwner` - "Apartment Owner"
- `t.dashboard.createdBy` - "Created by"
- `t.dashboard.scheduledTime` - "Scheduled Time"
- `t.dashboard.operator` - "Operator"

### Shifts:
- `t.shifts.title` - "Shifts"
- `t.shifts.createNew` - "Create New Shift"
- `t.shifts.edit` - "Edit Shift"
- `t.shifts.deleteConfirm` - "Are you sure you want to delete this shift?"
- `t.shifts.selectOwner` - "Select owner"

### Instructions:
- `t.instructions.title` - "Instruction Photos"
- `t.instructions.addInstruction` - "Add Instruction"
- `t.instructions.description` - "Description"
- `t.instructions.descriptionPlaceholder` - "Enter instruction description..."

### Problems:
- `t.problems.reportProblem` - "Report Problem"
- `t.problems.problemDescription` - "Problem Description"
- `t.problems.issue` - "Issue"
- `t.problems.forgottenItem` - "Forgotten Item"

### Status:
- `t.status.scheduled` - "Scheduled"
- `t.status.inProgress` - "In Progress"
- `t.status.completed` - "Completed"
- `t.status.confirmed` - "Confirmed"

## Real Example from Your Code:

Let's look at what I already changed in `app/dashboard/page.tsx`:

**Before:**
```typescript
return <div>Loading...</div>;
```

**After:**
```typescript
const { t } = useI18n();
return <div>{t.common.loading}</div>;
```

**Before:**
```typescript
<h1>Calendar</h1>
<p>View and manage cleaning shifts</p>
```

**After:**
```typescript
<h1>{t.dashboard.title}</h1>
<p>{t.dashboard.calendar}</p>
```

**Before:**
```typescript
<h2>Shifts for {format(selectedDate, 'dd/MM/yyyy')}</h2>
```

**After:**
```typescript
<h2>{t.dashboard.shiftsFor} {format(selectedDate, 'dd/MM/yyyy')}</h2>
```

## Important Notes:

1. **Only works in Client Components**: Make sure your component file starts with `'use client';` at the top

2. **The hook must be inside the component function**:
   ```typescript
   export default function MyComponent() {
     const { t } = useI18n();  // ✅ Correct - inside function
     // ...
   }
   
   const { t } = useI18n();  // ❌ Wrong - outside function
   export default function MyComponent() {
     // ...
   }
   ```

3. **Use curly braces for dynamic content**:
   ```typescript
   <h1>{t.shifts.title}</h1>  // ✅ Correct
   <h1>t.shifts.title</h1>    // ❌ Wrong - will show literal text
   ```

4. **For attributes**:
   ```typescript
   <button title={t.common.save}>{t.common.save}</button>
   <input placeholder={t.shifts.selectOwner} />
   ```

## Where to Add More Translations:

If you need a translation that doesn't exist, add it to all 4 language files:

1. `/messages/en.ts` - Add the English version
2. `/messages/ar.ts` - Add the Arabic translation
3. `/messages/uk.ts` - Add the Ukrainian translation
4. `/messages/it.ts` - Add the Italian translation

Then use it in your component with `t.yourCategory.yourKey`.

## Need Help?

Look at `app/dashboard/page.tsx` - I've already translated it as a complete example you can follow!



