# Notification Cleanup Cron Jobs Setup

## Overview
This application automatically deletes old notifications:
- **Operator accounts**: Notifications older than 36 hours are deleted
- **Other accounts (Admin, Owner)**: Notifications older than 48 hours are deleted

## Automatic Cleanup
The cleanup runs automatically via Vercel Cron Jobs once per day at midnight (00:00 UTC).

**Note**: Vercel Hobby plan limits cron jobs to once per day. For more frequent cleanup (e.g., every 6 hours), use an external cron service (see below).

## Manual Testing
You can manually trigger the cleanup by calling:
```
GET /api/notifications/cleanup
```
or
```
POST /api/notifications/cleanup
```

## Vercel Configuration
The `vercel.json` file is configured to run the cleanup job once per day at midnight:
```json
{
  "crons": [
    {
      "path": "/api/notifications/cleanup",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Schedule Format
The schedule uses cron syntax: `0 0 * * *` means "every day at 00:00 UTC"

**Vercel Hobby Plan Limitation**: Cron jobs can only run once per day. For more frequent cleanup (e.g., every 6 hours), use an external cron service.

## Alternative: External Cron Service (For More Frequent Cleanup)
If you need more frequent cleanup (e.g., every 6 hours), you can use an external service:

### Option 1: cron-job.org (Free)
1. Go to https://cron-job.org
2. Create a free account
3. Add a new cron job:
   - **URL**: `https://cleaning-shift-manager.vercel.app/api/notifications/cleanup`
   - **Schedule**: Every 6 hours (or your preferred interval)
   - **Method**: POST
   - **Title**: "Notification Cleanup"

### Option 2: EasyCron (Free tier available)
1. Go to https://www.easycron.com
2. Create a free account
3. Add a new cron job with similar settings

### Option 3: GitHub Actions (If code is on GitHub)
Create `.github/workflows/cleanup-notifications.yml`:
```yaml
name: Cleanup Notifications
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cleanup
        run: |
          curl -X POST https://cleaning-shift-manager.vercel.app/api/notifications/cleanup
```

## Security (Optional)
To secure the cleanup endpoint, you can:
1. Add `CRON_SECRET` environment variable in Vercel dashboard
2. Uncomment the security check in `/app/api/notifications/cleanup/route.ts`
3. Configure your external cron service to send the secret in the Authorization header:
   ```
   Authorization: Bearer YOUR_CRON_SECRET
   ```

## Monitoring
Check Vercel logs to see cleanup results:
```bash
vercel logs --follow
```

Or view in Vercel dashboard: Project → Settings → Logs

The cleanup endpoint logs:
- Number of operator notifications deleted (36h)
- Number of other role notifications deleted (48h)
- Total notifications deleted

## How It Works
1. The cron job calls `/api/notifications/cleanup` at the scheduled time
2. The endpoint:
   - Finds all operator accounts
   - Deletes notifications for operators older than 36 hours
   - Deletes notifications for other roles (admin, owner) older than 48 hours
   - Returns a summary of deleted notifications

## Testing
To test manually, you can:
1. Call the endpoint directly: `https://cleaning-shift-manager.vercel.app/api/notifications/cleanup`
2. Check the response to see how many notifications were deleted
3. Verify in the database that old notifications are removed


