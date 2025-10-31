const fs = require('fs');
const path = require('path');

// Create a simple SVG logo
const logoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Blue background -->
  <rect width="200" height="200" fill="#1e40af" rx="20"/>
  
  <!-- White text -->
  <text x="100" y="120" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="white" text-anchor="middle">TVA</text>
</svg>`;

const logoPath = path.join(__dirname, '../public/logo.svg');
fs.writeFileSync(logoPath, logoSvg);
console.log('✅ Logo created at:', logoPath);

// Create placeholder project images
const placeholderSvg = (text) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <!-- Gradient background -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#grad)"/>
  
  <!-- Text -->
  <text x="400" y="300" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">${text}</text>
</svg>`;

const imagesDir = path.join(__dirname, '../public/placeholders');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const placeholders = [
  'Mành Rèm Dự Án',
  'Mành Rèm Nhà Dân',
  'Công Trình 1',
  'Công Trình 2',
  'Công Trình 3',
];

placeholders.forEach((text, index) => {
  const filePath = path.join(imagesDir, `placeholder-${index + 1}.svg`);
  fs.writeFileSync(filePath, placeholderSvg(text));
  console.log(`✅ Placeholder ${index + 1} created`);
});

console.log('✅ All images created successfully!');

