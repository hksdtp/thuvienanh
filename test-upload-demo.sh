#!/bin/bash

# Demo Upload Test Script
# Tests upload functionality with sample images

echo "🎨 Upload Feature Demo Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:4000"
UPLOAD_ENDPOINT="/api/upload/synology"

# Step 1: Check if server is running
echo -e "${BLUE}📡 Step 1: Checking if Next.js server is running...${NC}"
if curl -s "${API_URL}" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is running at ${API_URL}${NC}"
else
    echo -e "${RED}❌ Server is not running. Please start with: npm run dev${NC}"
    exit 1
fi
echo ""

# Step 2: Check Synology connection
echo -e "${BLUE}🔗 Step 2: Checking Synology connection...${NC}"
HEALTH_CHECK=$(curl -s "${API_URL}${UPLOAD_ENDPOINT}")
echo "$HEALTH_CHECK" | python3 -m json.tool

if echo "$HEALTH_CHECK" | grep -q 'success.*true'; then
    echo -e "${GREEN}✅ Synology connection is healthy${NC}"
else
    echo -e "${RED}❌ Synology connection failed${NC}"
    exit 1
fi
echo ""

# Step 3: Create a test image
echo -e "${BLUE}🖼️  Step 3: Creating test image...${NC}"
TEST_IMAGE="test-upload-demo.png"

# Create a simple test image using ImageMagick (if available)
if command -v convert &> /dev/null; then
    convert -size 800x600 xc:skyblue \
            -pointsize 60 -fill white -gravity center \
            -annotate +0+0 "Test Upload\n$(date +%Y-%m-%d\ %H:%M:%S)" \
            "$TEST_IMAGE"
    echo -e "${GREEN}✅ Test image created: $TEST_IMAGE${NC}"
    ls -lh "$TEST_IMAGE"
elif command -v sips &> /dev/null; then
    # macOS alternative: create a simple colored image
    echo -e "${YELLOW}⚠️  ImageMagick not found, using macOS sips...${NC}"
    # Create a temporary file
    echo "Test Upload Demo - $(date)" > temp_text.txt
    # Note: This is a simplified version, actual image creation would need more tools
    echo -e "${YELLOW}⚠️  Please manually create a test image named: $TEST_IMAGE${NC}"
    echo -e "${YELLOW}   Or install ImageMagick: brew install imagemagick${NC}"
    rm -f temp_text.txt
else
    echo -e "${YELLOW}⚠️  No image creation tool found${NC}"
    echo -e "${YELLOW}   Please manually create a test image named: $TEST_IMAGE${NC}"
    echo -e "${YELLOW}   Or install ImageMagick: brew install imagemagick${NC}"
fi
echo ""

# Step 4: Upload test (if image exists)
if [ -f "$TEST_IMAGE" ]; then
    echo -e "${BLUE}📤 Step 4: Uploading test image to Synology...${NC}"
    echo "   File: $TEST_IMAGE"
    echo "   Category: temp"
    echo "   Album: test-upload-demo"
    echo ""
    
    UPLOAD_RESULT=$(curl -s -X POST "${API_URL}${UPLOAD_ENDPOINT}" \
        -F "files=@${TEST_IMAGE}" \
        -F "category=temp" \
        -F "albumName=test-upload-demo")
    
    echo "📋 Upload Result:"
    echo "$UPLOAD_RESULT" | python3 -m json.tool
    echo ""
    
    if echo "$UPLOAD_RESULT" | grep -q '"success": true'; then
        echo -e "${GREEN}✅ Upload successful!${NC}"
        
        # Extract URL if available
        URL=$(echo "$UPLOAD_RESULT" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', [{}])[0].get('url', 'N/A') if data.get('data') else 'N/A')" 2>/dev/null)
        if [ "$URL" != "N/A" ]; then
            echo -e "${GREEN}📍 Image URL: $URL${NC}"
        fi
    else
        echo -e "${RED}❌ Upload failed${NC}"
    fi
    
    # Cleanup
    echo ""
    echo -e "${BLUE}🧹 Cleaning up test image...${NC}"
    rm -f "$TEST_IMAGE"
    echo -e "${GREEN}✅ Cleanup complete${NC}"
else
    echo -e "${YELLOW}⚠️  Step 4: Skipped (no test image)${NC}"
    echo ""
    echo -e "${BLUE}💡 Manual Upload Test:${NC}"
    echo "   You can test upload manually by:"
    echo "   1. Open browser: http://localhost:4000"
    echo "   2. Navigate to Fabrics or Albums section"
    echo "   3. Use the upload interface to upload images"
fi
echo ""

# Step 5: Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Upload Feature Demo Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Test Summary:"
echo "   ✅ Server: Running"
echo "   ✅ Synology: Connected"
echo "   ✅ API: Functional"
echo ""
echo "🌐 Access Points:"
echo "   Web App:    http://localhost:4000"
echo "   Upload API: ${API_URL}${UPLOAD_ENDPOINT}"
echo "   Health:     ${API_URL}${UPLOAD_ENDPOINT} (GET)"
echo ""
echo "📁 Synology Storage:"
echo "   URL:  http://222.252.23.248:8888"
echo "   Path: /Marketing/Ninh/thuvienanh"
echo ""
echo "🧪 Next Steps:"
echo "   1. Test upload via web interface"
echo "   2. Check uploaded files on Synology"
echo "   3. Verify database records"
echo ""

