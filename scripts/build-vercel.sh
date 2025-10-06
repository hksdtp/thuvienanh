#!/bin/bash

# Vercel Build Script
# Temporarily renames API routes to exclude from static export build

set -e

echo "🚀 Starting Vercel build process..."

# 1. Rename API routes (so Next.js won't scan it)
echo "📦 Renaming API routes..."
if [ -d "app/api" ]; then
  mv app/api app/_api_excluded
  echo "✅ API routes renamed to app/_api_excluded"
fi

# 2. Rename middleware (so Next.js won't use it)
echo "📦 Renaming middleware..."
if [ -f "middleware.ts" ]; then
  mv middleware.ts _middleware.ts.excluded
  echo "✅ Middleware renamed"
fi

# 3. Copy Vercel config
echo "📝 Using Vercel config..."
cp next.config.vercel.js next.config.js
echo "✅ Config copied"

# 4. Build
echo "🔨 Building Next.js..."
npm run build

BUILD_EXIT_CODE=$?

# 5. Restore API routes (always, even if build fails)
echo "♻️  Restoring API routes..."
if [ -d "app/_api_excluded" ]; then
  mv app/_api_excluded app/api
  echo "✅ API routes restored"
fi

# 6. Restore middleware
if [ -f "_middleware.ts.excluded" ]; then
  mv _middleware.ts.excluded middleware.ts
  echo "✅ Middleware restored"
fi

if [ $BUILD_EXIT_CODE -ne 0 ]; then
  echo "❌ Build failed!"
  exit $BUILD_EXIT_CODE
fi

echo "✨ Vercel build complete!"

