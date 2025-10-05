#!/bin/bash

# Test upload directly to Synology FileStation

# Step 1: Authenticate
echo "🔐 Authenticating..."
AUTH_RESPONSE=$(curl -s -X POST "http://222.252.23.248:8888/webapi/auth.cgi" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api=SYNO.API.Auth&version=3&method=login&account=haininh&passwd=Villad24@&session=FileStation&format=sid")

echo "📋 Auth response: $AUTH_RESPONSE"

# Extract session ID
SID=$(echo $AUTH_RESPONSE | jq -r '.data.sid')
echo "🔑 Session ID: ${SID:0:10}..."

# Step 2: Create a test file
echo "📝 Creating test file..."
echo "Test content $(date)" > /tmp/test-upload.txt

# Step 3: Upload file
echo "📤 Uploading file..."
UPLOAD_RESPONSE=$(curl -s -X POST "http://222.252.23.248:8888/webapi/entry.cgi" \
  -F "api=SYNO.FileStation.Upload" \
  -F "version=2" \
  -F "method=upload" \
  -F "_sid=$SID" \
  -F "path=/Marketing/Ninh/thuvienanh" \
  -F "create_parents=true" \
  -F "overwrite=true" \
  -F "file=@/tmp/test-upload.txt")

echo "📋 Upload response: $UPLOAD_RESPONSE"

# Cleanup
rm /tmp/test-upload.txt

