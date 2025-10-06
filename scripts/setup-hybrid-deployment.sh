#!/bin/bash

# ============================================
# Setup Hybrid Deployment
# Frontend: Vercel | Backend: VPS
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Hybrid Deployment Setup${NC}"
echo -e "${BLUE}Frontend: Vercel | Backend: VPS${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Step 1: Create API client
echo -e "${BLUE}[1/6] Creating API client...${NC}"

mkdir -p lib

cat > lib/api-client.ts << 'EOF'
// API Client for Frontend (Vercel)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || 'API Error')
  }
  
  return response.json()
}

// Fabrics API
export const fabricsApi = {
  getAll: () => apiFetch<any[]>('/api/fabrics'),
  getById: (id: string) => apiFetch<any>(`/api/fabrics/${id}`),
  create: (data: any) => apiFetch<any>('/api/fabrics', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiFetch<any>(`/api/fabrics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiFetch<void>(`/api/fabrics/${id}`, {
    method: 'DELETE',
  }),
}

// Projects API
export const projectsApi = {
  getAll: () => apiFetch<any[]>('/api/projects'),
  getById: (id: string) => apiFetch<any>(`/api/projects/${id}`),
}

// Collections API
export const collectionsApi = {
  getAll: () => apiFetch<any[]>('/api/collections'),
  getById: (id: string) => apiFetch<any>(`/api/collections/${id}`),
}

// Albums API
export const albumsApi = {
  getAll: () => apiFetch<any[]>('/api/albums'),
  getById: (id: string) => apiFetch<any>(`/api/albums/${id}`),
}
EOF

echo -e "${GREEN}✓ API client created: lib/api-client.ts${NC}"
echo ""

# Step 2: Create Vercel config
echo -e "${BLUE}[2/6] Creating Vercel config...${NC}"

cat > next.config.vercel.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
}

module.exports = nextConfig
EOF

echo -e "${GREEN}✓ Vercel config created: next.config.vercel.js${NC}"
echo ""

# Step 3: Create middleware for CORS
echo -e "${BLUE}[3/6] Creating CORS middleware...${NC}"

cat > middleware.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }
  
  // Add CORS headers to all responses
  const response = NextResponse.next()
  
  response.headers.set(
    'Access-Control-Allow-Origin',
    process.env.ALLOWED_ORIGIN || '*'
  )
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  )
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  )
  
  return response
}

export const config = {
  matcher: '/api/:path*',
}
EOF

echo -e "${GREEN}✓ CORS middleware created: middleware.ts${NC}"
echo ""

# Step 4: Create vercel.json
echo -e "${BLUE}[4/6] Creating vercel.json...${NC}"

cat > vercel.json << 'EOF'
{
  "buildCommand": "cp next.config.vercel.js next.config.js && next build",
  "outputDirectory": "out",
  "framework": "nextjs"
}
EOF

echo -e "${GREEN}✓ Vercel config created: vercel.json${NC}"
echo ""

# Step 5: Update package.json scripts
echo -e "${BLUE}[5/6] Updating package.json scripts...${NC}"

# Backup package.json
cp package.json package.json.backup

# Add build:vercel script if not exists
if ! grep -q "build:vercel" package.json; then
    # Use node to update package.json
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.scripts['build:vercel'] = 'cp next.config.vercel.js next.config.js && next build';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    "
    echo -e "${GREEN}✓ Added build:vercel script${NC}"
else
    echo -e "${YELLOW}⚠ build:vercel script already exists${NC}"
fi
echo ""

# Step 6: Create .env.vercel.example
echo -e "${BLUE}[6/6] Creating .env.vercel.example...${NC}"

cat > .env.vercel.example << 'EOF'
# ============================================
# VERCEL ENVIRONMENT VARIABLES
# ============================================
# Set these in Vercel Dashboard:
# Settings > Environment Variables
# ============================================

# API URL (VPS backend)
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Or use IP if no domain
# NEXT_PUBLIC_API_URL=http://your-vps-ip:4000
EOF

echo -e "${GREEN}✓ Created: .env.vercel.example${NC}"
echo ""

# Summary
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}Setup Complete! 🎉${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}Files created:${NC}"
echo -e "  ✓ lib/api-client.ts"
echo -e "  ✓ next.config.vercel.js"
echo -e "  ✓ middleware.ts"
echo -e "  ✓ vercel.json"
echo -e "  ✓ .env.vercel.example"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo -e "${GREEN}1. Update components to use API client:${NC}"
echo -e "   ${BLUE}import { fabricsApi } from '@/lib/api-client'${NC}"
echo -e "   ${BLUE}const fabrics = await fabricsApi.getAll()${NC}"
echo ""
echo -e "${GREEN}2. Set environment variable on VPS:${NC}"
echo -e "   ${BLUE}echo 'ALLOWED_ORIGIN=https://thuvienanh.vercel.app' >> .env${NC}"
echo ""
echo -e "${GREEN}3. Deploy frontend to Vercel:${NC}"
echo -e "   ${BLUE}vercel --prod${NC}"
echo -e "   Or connect GitHub repo on Vercel dashboard"
echo ""
echo -e "${GREEN}4. Set environment variable on Vercel:${NC}"
echo -e "   ${BLUE}NEXT_PUBLIC_API_URL=https://your-vps-domain.com${NC}"
echo ""
echo -e "${GREEN}5. Deploy backend to VPS:${NC}"
echo -e "   ${BLUE}npm run build${NC}"
echo -e "   ${BLUE}pm2 restart thuvienanh-api${NC}"
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${YELLOW}Documentation:${NC}"
echo -e "  📖 docs/HYBRID_DEPLOYMENT_VERCEL_VPS.md"
echo -e "${BLUE}============================================${NC}"

