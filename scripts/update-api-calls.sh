#!/bin/bash

# Script to update all API calls to use apiUrl() for mobile compatibility
# This ensures mobile app uses remote server URL instead of local /api/ routes

echo "🔧 Updating API calls for mobile compatibility..."

# Find all files with fetch('/api/ or fetch(\"/api/
find app -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "fetch(['\"]/api/" {} \; | while read file; do
    echo "Processing: $file"
    
    # Check if file already imports apiUrl
    if ! grep -q "from '@/lib/api-config'" "$file" && ! grep -q "from.*api-config" "$file"; then
        # Add import if not present
        if grep -q "^'use client';" "$file"; then
            # Client component - add import after 'use client'
            sed -i '' "/^'use client';/a\\
import { apiUrl } from '@/lib/api-config';
" "$file"
        elif grep -q "^import" "$file"; then
            # Add import after first import
            sed -i '' "/^import.*from/a\\
import { apiUrl } from '@/lib/api-config';
" "$file"
        fi
    fi
    
    # Replace fetch('/api/ with fetch(apiUrl('/api/
    sed -i '' "s|fetch(['\"]/api/|fetch(apiUrl('/api/|g" "$file"
    sed -i '' "s|fetch(\`/api/|fetch(apiUrl(\`/api/|g" "$file"
done

echo "✅ Done! All API calls updated."
echo ""
echo "⚠️  IMPORTANT: Set NEXT_PUBLIC_API_URL in your .env.local:"
echo "   NEXT_PUBLIC_API_URL=https://your-app.vercel.app"

