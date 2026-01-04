# Google Maps API Setup Guide

## Overview

The apartment address form uses Google Maps Places API for city and address autocomplete. This feature requires a Google Maps API key.

## Is Google Maps API Free?

**Yes, Google Maps has a free tier!**

- **$200 free credit per month** (enough for most small to medium applications)
- After the free credit, you pay per request
- For autocomplete, it's typically **$2.83 per 1,000 requests**
- Most applications stay within the free tier

## How to Get a Google Maps API Key

### Step 1: Create a Google Cloud Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project (or select an existing one)

### Step 2: Enable the Required APIs

1. Go to **APIs & Services** > **Library**
2. Search for and enable:
   - **Places API** (for autocomplete)
   - **Maps JavaScript API** (for map features)

### Step 3: Create an API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy your API key
4. (Recommended) Click **Restrict Key** and:
   - Under **Application restrictions**: Select **HTTP referrers**
   - Add your domain (e.g., `localhost:3001/*` for development)
   - Under **API restrictions**: Select **Restrict key** and choose:
     - Places API
     - Maps JavaScript API

### Step 4: Add API Key to Your Project

1. Create or edit `.env.local` in the project root:
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key-here
```

2. Restart your development server:
```bash
npm run dev
```

## Troubleshooting

### Autocomplete Not Showing Suggestions

1. **Check API Key**: Make sure `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env.local`
2. **Check Browser Console**: Look for errors about Google Maps API
3. **Verify APIs Enabled**: Ensure Places API is enabled in Google Cloud Console
4. **Check Billing**: Google Cloud requires billing to be set up (even with free tier)
5. **Check API Restrictions**: Make sure your API key restrictions allow your domain

### Address Field Stays Gray/Disabled

- The address field is enabled when you type at least 2 characters in the city field
- You can type the city name manually (doesn't need to be from autocomplete)
- Once city has 2+ characters, the address field becomes enabled

### Manual Entry (Without API Key)

If you don't want to use Google Maps API:
- You can still manually type the city name
- After typing 2+ characters in city, the address field becomes enabled
- You can manually type the full address
- The CAP (postal code) field will need to be filled manually

## Cost Estimate

For a typical application:
- **City autocomplete**: ~$2.83 per 1,000 requests
- **Address autocomplete**: ~$2.83 per 1,000 requests
- **Free tier**: $200/month = ~70,000 requests/month free

Most small applications use less than 1,000 requests per month, so it's effectively free.

## Security Best Practices

1. **Restrict your API key** to specific domains
2. **Don't commit** your API key to version control
3. **Use environment variables** (`.env.local` is gitignored by default)
4. **Monitor usage** in Google Cloud Console

## Need Help?

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service)
- [Pricing Information](https://developers.google.com/maps/billing-and-pricing/pricing)



