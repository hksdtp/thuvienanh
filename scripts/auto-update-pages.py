#!/usr/bin/env python3
"""
Auto-update all pages with responsive layout and animations
"""

import re
import os

# Files to update
FILES = [
    'app/albums/[category]/page.tsx',
    'app/albums/event/page.tsx',
    'app/projects/page.tsx',
    'app/events/page.tsx',
    'app/styles/page.tsx',
]

def add_mobile_detection(content):
    """Add mobile detection state and useEffect"""
    if 'isMobile' in content:
        return content
    
    # Find first useState
    match = re.search(r'(const \[.*?\] = useState.*?\n)', content)
    if match:
        insert_pos = match.end()
        mobile_code = '''  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

'''
        content = content[:insert_pos] + mobile_code + content[insert_pos:]
    
    return content

def update_loading_state(content):
    """Replace loading spinner with animated version"""
    pattern = r'<div className="flex items-center justify-center py-\d+">\s*<div className="animate-spin[^>]*></div>\s*<span[^>]*>.*?</span>\s*</div>'
    replacement = '''<div className="flex flex-col items-center justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent" />
          <span className="mt-3 text-gray-600 font-medium">{t('common.loading') || 'Đang tải...'}</span>
        </div>'''
    
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    return content

def update_empty_state(content):
    """Add motion to empty state"""
    content = re.sub(
        r'<div className="bg-white rounded-xl',
        r'<motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-xl',
        content
    )
    # Close motion.div for empty states
    content = re.sub(
        r'</div>\s*\)\s*:\s*\(',
        r'</motion.div>) : (',
        content,
        count=1
    )
    return content

def update_grid_classes(content):
    """Update grid responsive classes"""
    content = re.sub(
        r'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
        content
    )
    return content

def update_grid_items(content):
    """Add motion to grid items"""
    # Replace div with motion.div for grid items
    content = re.sub(
        r'<div\s+key=\{(\w+)\.id\}\s+className="animate-slideUp[^"]*"[^>]*>',
        r'<motion.div key={\1.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05, duration: 0.3 }}>',
        content
    )
    
    # Find closing divs for grid items and replace with motion.div
    # This is tricky, so we'll do a simple replacement
    lines = content.split('\n')
    in_grid_item = False
    result = []
    
    for line in lines:
        if '<motion.div key=' in line and 'initial={{ opacity: 0' in line:
            in_grid_item = True
            result.append(line)
        elif in_grid_item and re.match(r'\s*</div>\s*$', line):
            # Check if this is the closing div for grid item
            result.append(line.replace('</div>', '</motion.div>'))
            in_grid_item = False
        else:
            result.append(line)
    
    return '\n'.join(result)

def update_buttons(content):
    """Add motion to buttons"""
    content = re.sub(
        r'<button\s+',
        r'<motion.button whileTap={{ scale: 0.95 }} ',
        content
    )
    content = re.sub(
        r'</button>',
        r'</motion.button>',
        content
    )
    return content

def update_container_padding(content):
    """Update container padding to be responsive"""
    content = re.sub(
        r'className="max-w-7xl mx-auto px-6 py-8"',
        r'className="px-4 lg:px-8 py-6 lg:py-8"',
        content
    )
    return content

def add_search_animation(content):
    """Wrap search bar in motion.div"""
    # Find search bar div
    pattern = r'(<div className="mb-6[^"]*">\s*<div className="relative[^>]*>)'
    replacement = r'<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">\n          <div className="relative">'
    
    content = re.sub(pattern, replacement, content)
    return content

def process_file(filepath):
    """Process a single file"""
    if not os.path.exists(filepath):
        print(f"⚠️  File not found: {filepath}")
        return False
    
    print(f"🔄 Processing: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already updated
    if 'motion.div' in content and 'isMobile' in content:
        print(f"✅ Already updated: {filepath}")
        return True
    
    # Apply transformations
    content = add_mobile_detection(content)
    content = update_loading_state(content)
    content = update_empty_state(content)
    content = update_grid_classes(content)
    content = update_grid_items(content)
    content = update_buttons(content)
    content = update_container_padding(content)
    content = add_search_animation(content)
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Updated: {filepath}")
    return True

def main():
    print("🚀 Auto-updating pages with responsive layout and animations...\n")
    
    success = 0
    failed = 0
    
    for filepath in FILES:
        try:
            if process_file(filepath):
                success += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ Error processing {filepath}: {e}")
            failed += 1
    
    print(f"\n📊 Summary:")
    print(f"✅ Successfully updated: {success} files")
    print(f"❌ Failed: {failed} files")
    print(f"\n🎉 Done! Please test the pages.")

if __name__ == '__main__':
    main()

