# Photo Cleanup Setup

## Overview
Photos uploaded for problems and instructions are automatically deleted after 24 hours to save storage space.

## Automatic Cleanup

### Option 1: Vercel Cron Jobs (Recommended)
Add this to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/photos/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

This runs the cleanup every day at 2 AM UTC.

### Option 2: External Cron Service
Use a service like:
- **cron-job.org** - Free cron job service
- **EasyCron** - Cron job scheduler
- **GitHub Actions** - If using GitHub

Set up a cron job to call:
```
POST https://your-app.vercel.app/api/photos/cleanup
```

### Option 3: Manual Cleanup
You can manually trigger cleanup by calling:
```
POST /api/photos/cleanup
```

## How It Works
- Photos older than 24 hours are automatically removed
- Only photos with `uploadedAt` timestamp older than 1 day are deleted
- The cleanup process preserves recent photos
- Cleanup runs on both problem photos and instruction photos

## Security Note
In production, you may want to add authentication to the cleanup endpoint to prevent unauthorized access.


