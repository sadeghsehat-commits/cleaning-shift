// Node.js script to create simple PNG icons
// Run: node create-simple-icons.js
const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#6366f1';
  ctx.fillRect(0, 0, size, size);
  
  // Simple icon (brush/cleaning symbol)
  ctx.fillStyle = '#ffffff';
  const centerX = size / 2;
  const centerY = size / 2;
  const handleWidth = size / 20;
  
  // Handle
  ctx.fillRect(centerX - handleWidth/2, centerY - size/3, handleWidth, size/1.5);
  
  // Bristles
  const bristleCount = 8;
  for (let i = 0; i < bristleCount; i++) {
    const y = centerY - size/4 + (i * size / (bristleCount * 2));
    ctx.fillRect(centerX - handleWidth/2 - size/6, y, size/6, size/40);
    ctx.fillRect(centerX + handleWidth/2, y, size/6, size/40);
  }
  
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`icon-${size}x${size}.png`, buffer);
  console.log(`Created icon-${size}x${size}.png`);
});

console.log('All icons created!');
