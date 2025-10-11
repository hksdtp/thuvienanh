#!/bin/bash

echo "🧪 Testing image upload to album..."

# Create a test image
echo "📸 Creating test image..."
convert -size 100x100 xc:blue test-image.jpg 2>/dev/null || {
  echo "Using ImageMagick alternative..."
  # If ImageMagick not available, create using base64
  echo "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCmAA8A/9k=" | base64 -d > test-image.jpg
}

# Upload the image
echo "📤 Uploading image to album..."
curl -X POST http://localhost:4000/api/albums/upload-filestation \
  -F "albumId=d26a20ce-0b9d-49cf-bc88-56c633b4c0f7" \
  -F "files=@test-image.jpg" \
  2>/dev/null | python3 -m json.tool

# Clean up
rm -f test-image.jpg

echo "✅ Upload test complete"
