#!/bin/bash

# Script to verify all updated pages
# Checks for common issues and patterns

echo "🔍 Verifying all updated pages..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
PASS=0
FAIL=0
WARN=0

# Files to check
FILES=(
  "app/fabrics/moq/page.tsx"
  "app/fabrics/new/page.tsx"
  "app/fabrics/clearance/page.tsx"
  "app/collections/page.tsx"
  "app/accessories/[category]/page.tsx"
  "app/albums/[category]/page.tsx"
  "app/albums/event/page.tsx"
  "app/projects/page.tsx"
  "app/events/page.tsx"
  "app/styles/page.tsx"
)

# Check function
check_file() {
  local file=$1
  local checks_passed=0
  local checks_failed=0
  
  echo "📄 Checking: $file"
  
  # Check 1: Has Framer Motion import
  if grep -q "import.*motion.*from 'framer-motion'" "$file"; then
    echo "  ✅ Framer Motion imported"
    ((checks_passed++))
  else
    echo -e "  ${RED}❌ Missing Framer Motion import${NC}"
    ((checks_failed++))
  fi
  
  # Check 2: Has translations import
  if grep -q "import.*t.*from '@/lib/translations'" "$file"; then
    echo "  ✅ Translations imported"
    ((checks_passed++))
  else
    echo -e "  ${YELLOW}⚠️  Missing translations import${NC}"
    ((WARN++))
  fi
  
  # Check 3: Has mobile detection
  if grep -q "isMobile.*useState" "$file"; then
    echo "  ✅ Mobile detection present"
    ((checks_passed++))
  else
    echo -e "  ${RED}❌ Missing mobile detection${NC}"
    ((checks_failed++))
  fi
  
  # Check 4: Has mobile useEffect
  if grep -q "checkMobile.*window.innerWidth" "$file"; then
    echo "  ✅ Mobile useEffect present"
    ((checks_passed++))
  else
    echo -e "  ${RED}❌ Missing mobile useEffect${NC}"
    ((checks_failed++))
  fi
  
  # Check 5: Has motion.div for animations
  if grep -q "motion.div" "$file"; then
    echo "  ✅ Motion animations present"
    ((checks_passed++))
  else
    echo -e "  ${YELLOW}⚠️  No motion.div found${NC}"
    ((WARN++))
  fi
  
  # Check 6: Has motion.button
  if grep -q "motion.button" "$file"; then
    echo "  ✅ Motion buttons present"
    ((checks_passed++))
  else
    echo -e "  ${YELLOW}⚠️  No motion.button found${NC}"
    ((WARN++))
  fi
  
  # Check 7: Has responsive grid classes
  if grep -q "grid-cols-2.*sm:grid-cols-2.*md:grid-cols-3" "$file"; then
    echo "  ✅ Responsive grid classes"
    ((checks_passed++))
  else
    echo -e "  ${YELLOW}⚠️  Grid classes may not be responsive${NC}"
    ((WARN++))
  fi
  
  # Check 8: No syntax errors (basic check)
  if grep -q "export default function" "$file"; then
    echo "  ✅ Valid function export"
    ((checks_passed++))
  else
    echo -e "  ${RED}❌ Missing default export${NC}"
    ((checks_failed++))
  fi
  
  # Summary for this file
  echo "  📊 Checks: $checks_passed passed, $checks_failed failed"
  echo ""
  
  if [ $checks_failed -eq 0 ]; then
    ((PASS++))
    return 0
  else
    ((FAIL++))
    return 1
  fi
}

# Run checks on all files
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    check_file "$file"
  else
    echo -e "${RED}❌ File not found: $file${NC}"
    echo ""
    ((FAIL++))
  fi
done

# Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 FINAL SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Files passed: $PASS${NC}"
echo -e "${RED}❌ Files failed: $FAIL${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARN${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}🎉 All checks passed!${NC}"
  exit 0
else
  echo -e "${RED}⚠️  Some checks failed. Please review the output above.${NC}"
  exit 1
fi

