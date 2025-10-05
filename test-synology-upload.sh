#!/bin/bash

# Synology NAS config
NAS_URL="http://222.252.23.248:8888"
USERNAME="haininh"
PASSWORD="Villad24@"

echo "=== Testing Synology Upload ==="
echo ""

# Step 1: Login
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "${NAS_URL}/webapi/auth.cgi" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api=SYNO.API.Auth&version=6&method=login&account=${USERNAME}&passwd=${PASSWORD}&session=FileStation&format=sid")

echo "Login response: $LOGIN_RESPONSE"
echo ""

# Extract SID
SID=$(echo $LOGIN_RESPONSE | jq -r '.data.sid')
echo "SID: $SID"
echo ""

if [ "$SID" == "null" ] || [ -z "$SID" ]; then
  echo "❌ Login failed!"
  exit 1
fi

# Step 2: Create test file
echo "2. Creating test file..."
TEST_FILE="/tmp/synology-test-$(date +%s).txt"
echo "Test upload at $(date)" > "$TEST_FILE"
echo "Created: $TEST_FILE"
echo ""

# Step 3: Upload file to /Marketing/Ninh/thuvienanh
echo "3. Uploading file to /Marketing/Ninh/thuvienanh..."
UPLOAD_RESPONSE=$(curl -s -X POST "${NAS_URL}/webapi/entry.cgi" \
  -H "Cookie: id=$SID" \
  -F "api=SYNO.FileStation.Upload" \
  -F "version=2" \
  -F "method=upload" \
  -F "path=/Marketing/Ninh/thuvienanh" \
  -F "overwrite=true" \
  -F "file=@${TEST_FILE}")

echo "Upload response: $UPLOAD_RESPONSE"
echo ""

# Check result
SUCCESS=$(echo $UPLOAD_RESPONSE | jq -r '.success')
if [ "$SUCCESS" == "true" ]; then
  echo "✅ Upload successful!"
else
  ERROR_CODE=$(echo $UPLOAD_RESPONSE | jq -r '.error.code')
  echo "❌ Upload failed with error code: $ERROR_CODE"
  
  # Common error codes
  case $ERROR_CODE in
    400) echo "   → No such account or incorrect password" ;;
    401) echo "   → Account disabled" ;;
    402) echo "   → Permission denied" ;;
    403) echo "   → 2-step verification code required" ;;
    404) echo "   → Not found" ;;
    408) echo "   → File already exists" ;;
    599) echo "   → No such task of the file operation" ;;
    1800) echo "   → There is no Content-Length information in the HTTP header" ;;
    1801) echo "   → Wait too long, no date can be received from client" ;;
    1802) echo "   → No filename information in the last part of file content" ;;
    1803) echo "   → Upload connection is cancelled" ;;
    1804) echo "   → Failed to upload too big file to FAT file system" ;;
    1805) echo "   → Can't overwrite or skip the existed file" ;;
    *) echo "   → Unknown error" ;;
  esac
fi
echo ""

# Step 4: Logout
echo "4. Logging out..."
curl -s -X POST "${NAS_URL}/webapi/auth.cgi" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api=SYNO.API.Auth&version=3&method=logout&session=FileStation&_sid=$SID" > /dev/null

echo "Done!"

