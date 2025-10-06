#!/bin/bash

# ============================================
# Script Export Database cho Vercel Migration
# ============================================
# Script này giúp export database hiện tại
# để import vào cloud database (Supabase/Neon)
# ============================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database configuration
DB_HOST="${POSTGRES_HOST:-222.252.23.248}"
DB_PORT="${POSTGRES_PORT:-5499}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-Ninh96}"
DB_PASSWORD="${POSTGRES_PASSWORD:-Demo1234}"

# Output files
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR="./database/backups"
SCHEMA_FILE="${OUTPUT_DIR}/schema_${TIMESTAMP}.sql"
DATA_FILE="${OUTPUT_DIR}/data_${TIMESTAMP}.sql"
FULL_FILE="${OUTPUT_DIR}/full_backup_${TIMESTAMP}.sql"

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Database Export Script${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}Database Info:${NC}"
echo -e "  Host: ${DB_HOST}"
echo -e "  Port: ${DB_PORT}"
echo -e "  User: ${DB_USER}"
echo -e "  Database: ${DB_NAME}"
echo ""

# Function to export schema only
export_schema() {
    echo -e "${BLUE}[1/3] Exporting schema...${NC}"
    
    PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --schema-only \
        --no-owner \
        --no-acl \
        -f "$SCHEMA_FILE"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Schema exported: ${SCHEMA_FILE}${NC}"
    else
        echo -e "${RED}✗ Failed to export schema${NC}"
        exit 1
    fi
}

# Function to export data only
export_data() {
    echo -e "${BLUE}[2/3] Exporting data...${NC}"
    
    PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --data-only \
        --no-owner \
        --no-acl \
        -f "$DATA_FILE"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Data exported: ${DATA_FILE}${NC}"
    else
        echo -e "${RED}✗ Failed to export data${NC}"
        exit 1
    fi
}

# Function to export full backup
export_full() {
    echo -e "${BLUE}[3/3] Exporting full backup...${NC}"
    
    PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-owner \
        --no-acl \
        -f "$FULL_FILE"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Full backup exported: ${FULL_FILE}${NC}"
    else
        echo -e "${RED}✗ Failed to export full backup${NC}"
        exit 1
    fi
}

# Check if pg_dump is installed
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}Error: pg_dump not found!${NC}"
    echo -e "${YELLOW}Please install PostgreSQL client tools:${NC}"
    echo -e "  macOS: brew install postgresql"
    echo -e "  Ubuntu: sudo apt-get install postgresql-client"
    echo -e "  Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

# Test connection
echo -e "${BLUE}Testing database connection...${NC}"
PGPASSWORD="$DB_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -c "SELECT 1" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Cannot connect to database!${NC}"
    echo -e "${YELLOW}Please check:${NC}"
    echo -e "  1. Database is running"
    echo -e "  2. Host and port are correct"
    echo -e "  3. Username and password are correct"
    echo -e "  4. Firewall allows connection"
    exit 1
fi

echo -e "${GREEN}✓ Connection successful${NC}"
echo ""

# Export database
export_schema
export_data
export_full

# Show file sizes
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}Export completed successfully!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${YELLOW}Exported files:${NC}"
ls -lh "$SCHEMA_FILE" "$DATA_FILE" "$FULL_FILE" | awk '{print "  " $9 " (" $5 ")"}'
echo ""

# Show next steps
echo -e "${BLUE}============================================${NC}"
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "1. ${GREEN}Create cloud database${NC} (Supabase/Neon/Vercel Postgres)"
echo -e "   - Supabase: https://supabase.com"
echo -e "   - Neon: https://neon.tech"
echo -e "   - Vercel: https://vercel.com/dashboard/stores"
echo ""
echo -e "2. ${GREEN}Import database${NC} using:"
echo -e "   ${BLUE}psql \"postgresql://user:pass@host:port/db\" -f ${FULL_FILE}${NC}"
echo ""
echo -e "3. ${GREEN}Set environment variables${NC} on Vercel:"
echo -e "   - Copy values from ${BLUE}.env.vercel.example${NC}"
echo -e "   - Paste to Vercel Dashboard > Settings > Environment Variables"
echo ""
echo -e "4. ${GREEN}Redeploy${NC} on Vercel"
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}Done! 🎉${NC}"
echo -e "${BLUE}============================================${NC}"

