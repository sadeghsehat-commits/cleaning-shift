# Icon Generation Instructions

To generate the required icons for the PWA, you have two options:

## Option 1: Online Tool (Recommended)
1. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload your app icon (should be at least 512x512 pixels)
3. Download the generated icons
4. Place them in the `public/icons/` directory with these names:
   - icon-72x72.png
   - icon-96x96.png
   - icon-128x128.png
   - icon-144x144.png
   - icon-152x152.png
   - icon-192x192.png
   - icon-384x384.png
   - icon-512x512.png

## Option 2: Using ImageMagick (if installed)
```bash
# Create a base icon (512x512) first, then resize:
convert base-icon.png -resize 72x72 public/icons/icon-72x72.png
convert base-icon.png -resize 96x96 public/icons/icon-96x96.png
convert base-icon.png -resize 128x128 public/icons/icon-128x128.png
convert base-icon.png -resize 144x144 public/icons/icon-144x144.png
convert base-icon.png -resize 152x152 public/icons/icon-152x152.png
convert base-icon.png -resize 192x192 public/icons/icon-192x192.png
convert base-icon.png -resize 384x384 public/icons/icon-384x384.png
convert base-icon.png -resize 512x512 public/icons/icon-512x512.png
```

## Temporary Placeholder
For now, we'll create placeholder icons. Replace them with your actual app icon later.

