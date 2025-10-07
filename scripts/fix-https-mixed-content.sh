#!/bin/bash

# Fix Mixed Content Error for HTTPS Deployment
# This script removes hardcoded URLs and ensures all requests use relative paths

set -e

echo "🔒 Fixing Mixed Content Error for HTTPS Deployment..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production not found!${NC}"
    echo "Creating .env.production..."
    
    cat > .env.production << 'EOF'
# Production Environment Variables
NODE_ENV=production

# Database (Internal - Server Side Only)
POSTGRES_HOST=222.252.23.248
POSTGRES_PORT=5499
POSTGRES_DB=Ninh96
POSTGRES_USER=postgres
POSTGRES_PASSWORD=Demo1234

# Synology (Internal - Server Side Only)
SYNOLOGY_BASE_URL=http://222.252.23.248:8888
SYNOLOGY_ALTERNATIVE_URL=http://222.252.23.248:6868
SYNOLOGY_USERNAME=haininh
SYNOLOGY_PASSWORD=Villad24@

# SMB (Internal - Server Side Only)
SMB_HOST=222.252.23.248
SMB_SHARE=marketing
SMB_DOMAIN=WORKGROUP
SMB_USERNAME=haininh
SMB_PASSWORD=Villad24@
SMB_PORT=445

# Next.js
NEXT_TELEMETRY_DISABLED=1

# ⚠️ DO NOT ADD NEXT_PUBLIC_* variables
# All API calls should use relative URLs (/api/...)
# All images should use proxy route (/synology-proxy?path=...)
EOF
    
    echo -e "${GREEN}✓ Created .env.production${NC}"
else
    echo -e "${YELLOW}⚠️  .env.production exists${NC}"
    
    # Check if NEXT_PUBLIC_API_URL exists
    if grep -q "NEXT_PUBLIC_API_URL" .env.production; then
        echo -e "${YELLOW}⚠️  Found NEXT_PUBLIC_API_URL in .env.production${NC}"
        echo "Commenting it out..."
        
        # Comment out NEXT_PUBLIC_API_URL
        sed -i.bak 's/^NEXT_PUBLIC_API_URL=/#NEXT_PUBLIC_API_URL=/' .env.production
        
        echo -e "${GREEN}✓ Commented out NEXT_PUBLIC_API_URL${NC}"
    else
        echo -e "${GREEN}✓ No NEXT_PUBLIC_API_URL found (good!)${NC}"
    fi
fi

echo ""
echo "📝 Current .env.production:"
echo "================================"
cat .env.production | grep -v "PASSWORD"
echo "================================"
echo ""

# Rebuild application
echo "🔨 Rebuilding application..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""
echo "🔄 Restarting PM2..."

# Check if PM2 is running
if command -v pm2 &> /dev/null; then
    pm2 restart thuvienanh || pm2 start npm --name "thuvienanh" -- start
    echo -e "${GREEN}✓ PM2 restarted${NC}"
else
    echo -e "${YELLOW}⚠️  PM2 not found. Please restart manually:${NC}"
    echo "   npm start"
fi

echo ""
echo "✅ Fix completed!"
echo ""
echo "📋 Next steps:"
echo "1. Clear browser cache (Ctrl + Shift + R)"
echo "2. Check browser console for errors"
echo "3. Verify all images load correctly"
echo ""
echo "🔍 Debug commands:"
echo "   pm2 logs thuvienanh --lines 50"
echo "   pm2 monit"
echo ""
echo "📚 For more info, see: DEPLOY_HTTPS_FIX.md"

