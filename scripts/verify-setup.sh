#!/bin/bash
# Verify setup and configuration
# Usage: ./scripts/verify-setup.sh

echo "🔍 Verifying TVA Setup..."
echo ""

# Check Node.js
echo "1️⃣ Checking Node.js..."
if command -v node &> /dev/null; then
    echo "   ✅ Node.js: $(node --version)"
else
    echo "   ❌ Node.js not found"
fi

# Check npm
echo "2️⃣ Checking npm..."
if command -v npm &> /dev/null; then
    echo "   ✅ npm: $(npm --version)"
else
    echo "   ❌ npm not found"
fi

# Check .env.local
echo "3️⃣ Checking .env.local..."
if [ -f .env.local ]; then
    echo "   ✅ .env.local exists"
    echo "   📋 Synology URL: $(grep SYNOLOGY_BASE_URL .env.local | cut -d'=' -f2)"
else
    echo "   ❌ .env.local not found"
fi

# Check database connection
echo "4️⃣ Checking database..."
if [ -f .env.local ]; then
    source .env.local
fi

# Try to connect to database
if command -v psql &> /dev/null; then
    echo "   ✅ psql installed"
    # Add database connection test here if needed
else
    echo "   ⚠️  psql not installed (optional)"
fi

# Check Docker
echo "5️⃣ Checking Docker..."
if command -v docker &> /dev/null; then
    echo "   ✅ Docker: $(docker --version)"
    if docker ps &> /dev/null; then
        echo "   ✅ Docker daemon running"
        if docker ps | grep -q postgres; then
            echo "   ✅ PostgreSQL container running"
        else
            echo "   ⚠️  PostgreSQL container not running"
        fi
    else
        echo "   ⚠️  Docker daemon not running"
    fi
else
    echo "   ⚠️  Docker not installed"
fi

# Check key files
echo "6️⃣ Checking key files..."
files=(
    "lib/synology.ts"
    "lib/synologyUrlHelper.ts"
    "lib/imageCompression.ts"
    "lib/database.ts"
    "components/FileUpload.tsx"
    "app/api/synology/photos/route.ts"
    "database/migrations/001_add_synology_fields.sql"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file missing"
    fi
done

echo ""
echo "🎯 Setup verification complete!"

