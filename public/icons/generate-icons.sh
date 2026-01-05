#!/bin/bash
# Simple script to create placeholder icons using ImageMagick or sips (macOS)

SIZES=(72 96 128 144 152 192 384 512)
COLOR="#6366f1"

for size in "${SIZES[@]}"; do
    if command -v convert &> /dev/null; then
        convert -size ${size}x${size} xc:"$COLOR" "icon-${size}x${size}.png"
    elif command -v sips &> /dev/null; then
        # macOS native tool
        sips -s format png --setProperty formatOptions 100 -z $size $size /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericDocumentIcon.icns --out "icon-${size}x${size}.png" 2>/dev/null || \
        convert -size ${size}x${size} xc:"$COLOR" "icon-${size}x${size}.png"
    else
        echo "Please install ImageMagick or use the HTML generator (create-icons.html)"
        exit 1
    fi
done

echo "Icons generated!"
