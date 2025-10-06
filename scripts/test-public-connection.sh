#!/bin/bash

# ============================================
# Script Test Public Database Connection
# ============================================
# Kiểm tra xem database có thể kết nối từ internet không
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Database Public Connection Test${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Get public IP
echo -e "${BLUE}[1/5] Getting your public IP...${NC}"
PUBLIC_IP=$(curl -s ifconfig.me)
if [ -z "$PUBLIC_IP" ]; then
    echo -e "${RED}✗ Cannot get public IP${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Your public IP: ${PUBLIC_IP}${NC}"
echo ""

# Database config
DB_HOST="${1:-$PUBLIC_IP}"
DB_PORT="${2:-5499}"
DB_USER="${3:-postgres}"
DB_NAME="${4:-Ninh96}"

echo -e "${YELLOW}Testing connection to:${NC}"
echo -e "  Host: ${DB_HOST}"
echo -e "  Port: ${DB_PORT}"
echo -e "  User: ${DB_USER}"
echo -e "  Database: ${DB_NAME}"
echo ""

# Test 1: Check if port is open
echo -e "${BLUE}[2/5] Testing if port is open...${NC}"
if command -v nc &> /dev/null; then
    if nc -zv -w 5 "$DB_HOST" "$DB_PORT" 2>&1 | grep -q "succeeded"; then
        echo -e "${GREEN}✓ Port ${DB_PORT} is open${NC}"
    else
        echo -e "${RED}✗ Port ${DB_PORT} is closed or filtered${NC}"
        echo -e "${YELLOW}Possible issues:${NC}"
        echo -e "  1. Router port forwarding not configured"
        echo -e "  2. Firewall blocking the port"
        echo -e "  3. PostgreSQL not listening on public interface"
        exit 1
    fi
elif command -v telnet &> /dev/null; then
    timeout 5 telnet "$DB_HOST" "$DB_PORT" 2>&1 | grep -q "Connected" && \
        echo -e "${GREEN}✓ Port ${DB_PORT} is open${NC}" || \
        echo -e "${RED}✗ Port ${DB_PORT} is closed${NC}"
else
    echo -e "${YELLOW}⚠ nc or telnet not found, skipping port test${NC}"
fi
echo ""

# Test 2: Check PostgreSQL connection
echo -e "${BLUE}[3/5] Testing PostgreSQL connection...${NC}"
if command -v psql &> /dev/null; then
    echo -e "${YELLOW}Enter PostgreSQL password:${NC}"
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL connection successful${NC}"
        
        # Get version
        VERSION=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT version();" 2>/dev/null | head -1)
        echo -e "${GREEN}  Version: ${VERSION}${NC}"
    else
        echo -e "${RED}✗ PostgreSQL connection failed${NC}"
        echo -e "${YELLOW}Possible issues:${NC}"
        echo -e "  1. Wrong username or password"
        echo -e "  2. pg_hba.conf not allowing remote connections"
        echo -e "  3. Database does not exist"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ psql not found, skipping PostgreSQL test${NC}"
    echo -e "${YELLOW}Install: brew install postgresql (macOS) or apt install postgresql-client (Linux)${NC}"
fi
echo ""

# Test 3: Check SSL/TLS
echo -e "${BLUE}[4/5] Checking SSL/TLS support...${NC}"
if command -v psql &> /dev/null; then
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SHOW ssl;" 2>/dev/null | grep -q "on"; then
        echo -e "${GREEN}✓ SSL is enabled${NC}"
    else
        echo -e "${YELLOW}⚠ SSL is not enabled (not recommended for production)${NC}"
    fi
fi
echo ""

# Test 4: Generate connection strings
echo -e "${BLUE}[5/5] Generating connection strings...${NC}"
echo ""
echo -e "${YELLOW}For Vercel Environment Variables:${NC}"
echo -e "${GREEN}DATABASE_URL=postgresql://${DB_USER}:[PASSWORD]@${DB_HOST}:${DB_PORT}/${DB_NAME}${NC}"
echo -e "${GREEN}POSTGRES_HOST=${DB_HOST}${NC}"
echo -e "${GREEN}POSTGRES_PORT=${DB_PORT}${NC}"
echo -e "${GREEN}POSTGRES_USER=${DB_USER}${NC}"
echo -e "${GREEN}POSTGRES_PASSWORD=[YOUR-PASSWORD]${NC}"
echo -e "${GREEN}POSTGRES_DB=${DB_NAME}${NC}"
echo ""

# Summary
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}Test Summary${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}✓ Public IP: ${PUBLIC_IP}${NC}"
echo -e "${GREEN}✓ Port ${DB_PORT} is accessible${NC}"
echo -e "${GREEN}✓ PostgreSQL is responding${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "1. Copy the connection strings above"
echo -e "2. Go to Vercel Dashboard > Settings > Environment Variables"
echo -e "3. Add all the variables"
echo -e "4. Redeploy your application"
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}Done! 🎉${NC}"
echo -e "${BLUE}============================================${NC}"

