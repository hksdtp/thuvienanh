#!/bin/bash

# Test Album Creation with Category Path
# This script tests creating albums with different subcategories

echo "🧪 Testing Album Creation with Category Path"
echo "=============================================="
echo ""

BASE_URL="http://localhost:4000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Create album for MOQ category
echo "📝 Test 1: Creating album for MOQ category..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/albums" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test MOQ Album",
    "description": "Album for MOQ fabrics",
    "category": "fabric",
    "subcategory": "moq",
    "tags": ["test", "moq"]
  }')

echo "$RESPONSE" | python3 -m json.tool

# Extract album ID and category_path
ALBUM_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)
CATEGORY_PATH=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('category_path', ''))" 2>/dev/null)

if [ -n "$ALBUM_ID" ] && [ "$CATEGORY_PATH" = "fabrics/moq" ]; then
  echo -e "${GREEN}✅ Test 1 PASSED${NC}"
  echo "   Album ID: $ALBUM_ID"
  echo "   Category Path: $CATEGORY_PATH"
else
  echo -e "${RED}❌ Test 1 FAILED${NC}"
  echo "   Expected category_path: fabrics/moq"
  echo "   Got: $CATEGORY_PATH"
fi

echo ""
echo "---"
echo ""

# Test 2: Create album for NEW category
echo "📝 Test 2: Creating album for NEW category..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/albums" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test New Fabric Album",
    "description": "Album for new fabrics",
    "category": "fabric",
    "subcategory": "new",
    "tags": ["test", "new"]
  }')

echo "$RESPONSE" | python3 -m json.tool

ALBUM_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)
CATEGORY_PATH=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('category_path', ''))" 2>/dev/null)

if [ -n "$ALBUM_ID" ] && [ "$CATEGORY_PATH" = "fabrics/new" ]; then
  echo -e "${GREEN}✅ Test 2 PASSED${NC}"
  echo "   Album ID: $ALBUM_ID"
  echo "   Category Path: $CATEGORY_PATH"
else
  echo -e "${RED}❌ Test 2 FAILED${NC}"
  echo "   Expected category_path: fabrics/new"
  echo "   Got: $CATEGORY_PATH"
fi

echo ""
echo "---"
echo ""

# Test 3: Create album for CLEARANCE category
echo "📝 Test 3: Creating album for CLEARANCE category..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/albums" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Clearance Album",
    "description": "Album for clearance fabrics",
    "category": "fabric",
    "subcategory": "clearance",
    "tags": ["test", "clearance"]
  }')

echo "$RESPONSE" | python3 -m json.tool

ALBUM_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)
CATEGORY_PATH=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('category_path', ''))" 2>/dev/null)

if [ -n "$ALBUM_ID" ] && [ "$CATEGORY_PATH" = "fabrics/clearance" ]; then
  echo -e "${GREEN}✅ Test 3 PASSED${NC}"
  echo "   Album ID: $ALBUM_ID"
  echo "   Category Path: $CATEGORY_PATH"
else
  echo -e "${RED}❌ Test 3 FAILED${NC}"
  echo "   Expected category_path: fabrics/clearance"
  echo "   Got: $CATEGORY_PATH"
fi

echo ""
echo "---"
echo ""

# Test 4: Create album for GENERAL fabric (no subcategory)
echo "📝 Test 4: Creating album for GENERAL fabric (no subcategory)..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/albums" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test General Fabric Album",
    "description": "Album for general fabrics",
    "category": "fabric",
    "tags": ["test", "general"]
  }')

echo "$RESPONSE" | python3 -m json.tool

ALBUM_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)
CATEGORY_PATH=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('category_path', ''))" 2>/dev/null)

if [ -n "$ALBUM_ID" ] && [ "$CATEGORY_PATH" = "fabrics/general" ]; then
  echo -e "${GREEN}✅ Test 4 PASSED${NC}"
  echo "   Album ID: $ALBUM_ID"
  echo "   Category Path: $CATEGORY_PATH"
else
  echo -e "${RED}❌ Test 4 FAILED${NC}"
  echo "   Expected category_path: fabrics/general"
  echo "   Got: $CATEGORY_PATH"
fi

echo ""
echo "---"
echo ""

# Test 5: Create album for EVENT category
echo "📝 Test 5: Creating album for EVENT category..."
RESPONSE=$(curl -s -X POST "$BASE_URL/api/albums" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Event Album",
    "description": "Album for events",
    "category": "event",
    "tags": ["test", "event"]
  }')

echo "$RESPONSE" | python3 -m json.tool

ALBUM_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)
CATEGORY_PATH=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('category_path', ''))" 2>/dev/null)

if [ -n "$ALBUM_ID" ] && [ "$CATEGORY_PATH" = "events" ]; then
  echo -e "${GREEN}✅ Test 5 PASSED${NC}"
  echo "   Album ID: $ALBUM_ID"
  echo "   Category Path: $CATEGORY_PATH"
else
  echo -e "${RED}❌ Test 5 FAILED${NC}"
  echo "   Expected category_path: events"
  echo "   Got: $CATEGORY_PATH"
fi

echo ""
echo "---"
echo ""

# Test 6: Verify albums in database
echo "📝 Test 6: Verifying albums in database..."
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: '100.101.50.87',
  port: 5432,
  database: 'tva',
  user: 'postgres',
  password: 'haininh1'
});

async function verifyAlbums() {
  try {
    const result = await pool.query(\`
      SELECT name, category, category_path, created_at
      FROM albums
      WHERE name LIKE 'Test%'
      ORDER BY created_at DESC
      LIMIT 10
    \`);
    
    console.log('📋 Test albums in database:');
    result.rows.forEach((album, i) => {
      console.log(\`   \${i+1}. \${album.name}\`);
      console.log(\`      category: \${album.category}\`);
      console.log(\`      category_path: \${album.category_path}\`);
      console.log('');
    });
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

verifyAlbums();
"

echo ""
echo "=============================================="
echo "🎉 Album Creation Tests Completed!"
echo "=============================================="

