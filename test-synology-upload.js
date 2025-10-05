// Test script to upload image to Synology via API
const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    // Create a simple test image file
    const testImagePath = path.join(__dirname, 'test-upload.png');
    
    // Create a 1x1 pixel PNG (smallest valid PNG)
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 dimensions
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
      0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41, // IDAT chunk
      0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
      0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
      0x42, 0x60, 0x82
    ]);
    
    fs.writeFileSync(testImagePath, pngBuffer);
    console.log('✅ Created test image:', testImagePath);
    
    // Read the file
    const fileBuffer = fs.readFileSync(testImagePath);
    const blob = new Blob([fileBuffer], { type: 'image/png' });
    const file = new File([blob], 'test-upload.png', { type: 'image/png' });
    
    // Create FormData
    const formData = new FormData();
    formData.append('albumId', '39c884d0-9a91-485e-9a1e-883c8f666133'); // Album Database Success
    formData.append('files', file);
    
    console.log('📤 Uploading to API...');
    
    // Upload via API
    const response = await fetch('http://localhost:4000/api/albums/upload-synology', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    console.log('\n📊 Response:', JSON.stringify(result, null, 2));
    
    // Cleanup
    fs.unlinkSync(testImagePath);
    console.log('\n✅ Cleaned up test image');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

testUpload();

