#!/bin/bash

# Test script for Synology Photos Upload API
# Usage: bash scripts/test-photos-upload.sh

API_URL="http://localhost:3000/api/synology/photos-upload"
FOLDER_ID=49

echo "🚀 Synology Photos Upload API Test"
echo "===================================================="
echo ""

# Test 1: Connection test
echo "🔍 Test 1: Testing API connection..."
echo ""

RESPONSE=$(curl -s "${API_URL}?folderId=${FOLDER_ID}")
echo "📊 Response:"
echo "$RESPONSE" | jq '.'
echo ""

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
if [ "$SUCCESS" = "true" ]; then
  echo "✅ Connection test PASSED!"
else
  echo "❌ Connection test FAILED!"
  exit 1
fi

echo ""
echo "===================================================="
echo ""

# Test 2: Upload test
echo "📤 Test 2: Testing image upload..."
echo ""

# Create a temporary test image (1x1 pixel PNG)
TEST_IMAGE="/tmp/test-upload-$(date +%s).png"
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > "$TEST_IMAGE"

echo "📸 Uploading test image: $TEST_IMAGE"
echo "📁 Target folder ID: $FOLDER_ID"
echo ""

UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL" \
  -F "files=@${TEST_IMAGE}" \
  -F "folderId=${FOLDER_ID}")

echo "📊 Upload response:"
echo "$UPLOAD_RESPONSE" | jq '.'
echo ""

UPLOAD_SUCCESS=$(echo "$UPLOAD_RESPONSE" | jq -r '.success')
if [ "$UPLOAD_SUCCESS" = "true" ]; then
  echo "✅ Upload test PASSED!"
  echo ""
  echo "📋 Uploaded file details:"
  echo "$UPLOAD_RESPONSE" | jq -r '.data[] | "  Name: \(.filename)\n  Success: \(.success)\n  ID: \(.data.id // "N/A")\n  Synology ID: \(.data.synologyId // "N/A")\n  Folder ID: \(.data.folderId // "N/A")\n  URL: \(.data.url // "N/A")"'
else
  echo "❌ Upload test FAILED!"
  ERROR=$(echo "$UPLOAD_RESPONSE" | jq -r '.error // "Unknown error"')
  echo "   Error: $ERROR"
  rm -f "$TEST_IMAGE"
  exit 1
fi

# Cleanup
rm -f "$TEST_IMAGE"

echo ""
echo "===================================================="
echo ""
echo "🎉 ALL TESTS PASSED!"
echo ""
echo "✅ Synology Photos Upload API is working correctly!"
echo "✅ Images are being uploaded to folder ID: $FOLDER_ID (/Web/taothu)"

