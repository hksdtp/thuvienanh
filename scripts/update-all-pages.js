#!/usr/bin/env node

/**
 * Script to automatically update all pages with new layout pattern
 * - Adds Framer Motion animations
 * - Adds mobile detection
 * - Adds responsive grid
 * - Adds Vietnamese translations
 */

const fs = require('fs');
const path = require('path');

// Pages to update with their configurations
const PAGES_CONFIG = [
  // Accessories pages (3 pages) - Need sidebar filters
  {
    path: 'app/accessories/[category]/page.tsx',
    type: 'grid-with-sidebar',
    hasFilters: false, // Simple category filter only
    dataType: 'accessories'
  },
  
  // Albums pages (2 pages) - Simple grid
  {
    path: 'app/albums/[category]/page.tsx',
    type: 'simple-grid',
    hasFilters: false,
    dataType: 'albums'
  },
  {
    path: 'app/albums/event/page.tsx',
    type: 'simple-grid',
    hasFilters: false,
    dataType: 'albums'
  },
  
  // Projects page - Simple grid with filters
  {
    path: 'app/projects/page.tsx',
    type: 'simple-grid',
    hasFilters: true,
    dataType: 'projects'
  },
  
  // Events page - Simple grid with filters
  {
    path: 'app/events/page.tsx',
    type: 'simple-grid',
    hasFilters: true,
    dataType: 'events'
  },
  
  // Styles page - Simple grid
  {
    path: 'app/styles/page.tsx',
    type: 'simple-grid',
    hasFilters: false,
    dataType: 'styles'
  }
];

// Common imports to add
const COMMON_IMPORTS = `import { motion, AnimatePresence } from 'framer-motion'
import { t } from '@/lib/translations'`;

// Mobile detection hook
const MOBILE_DETECTION = `  const [isMobile, setIsMobile] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])`;

// Animation variants
const ANIMATION_VARIANTS = {
  loading: `<div className="flex flex-col items-center justify-center py-16">
  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent" />
  <span className="mt-3 text-gray-600 font-medium">{t('common.loading') || 'Đang tải...'}</span>
</div>`,
  
  empty: `<motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl border border-macos-border-light p-12 lg:p-16 text-center">
  {/* Empty state content */}
</motion.div>`,
  
  gridItem: `<motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.3 }}>
  {/* Card component */}
</motion.div>`
};

function updatePageFile(config) {
  const filePath = path.join(process.cwd(), config.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${config.path}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already updated
  if (content.includes('framer-motion') && content.includes('t(')) {
    console.log(`✅ Already updated: ${config.path}`);
    return true;
  }
  
  console.log(`🔄 Updating: ${config.path}`);
  
  // Add imports
  if (!content.includes('framer-motion')) {
    content = content.replace(
      /('use client'\n\n)/,
      `$1${COMMON_IMPORTS}\n`
    );
  }
  
  // Add mobile detection (after existing useState declarations)
  if (!content.includes('isMobile')) {
    const stateMatch = content.match(/const \[.*?\] = useState/);
    if (stateMatch) {
      const insertPos = content.indexOf(stateMatch[0]);
      const lineEnd = content.indexOf('\n', insertPos);
      content = content.slice(0, lineEnd + 1) + '\n' + MOBILE_DETECTION + '\n' + content.slice(lineEnd + 1);
    }
  }
  
  // Update grid classes
  content = content.replace(
    /grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4/g,
    'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
  );
  
  // Update loading state
  content = content.replace(
    /<div className="flex items-center justify-center py-\d+">\s*<div className="animate-spin[^>]*><\/div>\s*<span[^>]*>.*?<\/span>\s*<\/div>/gs,
    ANIMATION_VARIANTS.loading
  );
  
  // Update button with motion
  content = content.replace(
    /<button\s+onClick/g,
    '<motion.button whileTap={{ scale: 0.95 }} onClick'
  );
  content = content.replace(
    /<\/button>/g,
    '</motion.button>'
  );
  
  // Update grid items with motion
  content = content.replace(
    /<div\s+key=\{.*?\.id\}/g,
    '<motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.3 }}'
  );
  
  // Write back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated: ${config.path}`);
  
  return true;
}

// Main execution
console.log('🚀 Starting automatic page updates...\n');

let successCount = 0;
let failCount = 0;

PAGES_CONFIG.forEach(config => {
  try {
    if (updatePageFile(config)) {
      successCount++;
    } else {
      failCount++;
    }
  } catch (error) {
    console.error(`❌ Error updating ${config.path}:`, error.message);
    failCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`✅ Successfully updated: ${successCount} pages`);
console.log(`❌ Failed: ${failCount} pages`);
console.log(`\n🎉 Done! Please test the pages and report any issues.`);

