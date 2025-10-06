#!/bin/bash

# Add generateStaticParams to all dynamic routes

FILES=(
  "app/accessories/[category]/page.tsx"
  "app/projects/[id]/page.tsx"
  "app/events/[id]/page.tsx"
  "app/collections/[id]/page.tsx"
  "app/albums/[category]/page.tsx"
)

for file in "${FILES[@]}"; do
  echo "Processing $file..."
  
  # Check if file already has generateStaticParams
  if grep -q "generateStaticParams" "$file"; then
    echo "  ✓ Already has generateStaticParams"
    continue
  fi
  
  # Find the line with "export default function"
  line_num=$(grep -n "export default function" "$file" | head -1 | cut -d: -f1)
  
  if [ -z "$line_num" ]; then
    echo "  ✗ Could not find 'export default function'"
    continue
  fi
  
  # Insert generateStaticParams before the export default function
  insert_line=$((line_num - 1))
  
  # Create temp file with the insertion
  {
    head -n "$insert_line" "$file"
    echo ""
    echo "// Required for static export - returns empty array for client-side rendering"
    echo "export function generateStaticParams() {"
    echo "  return []"
    echo "}"
    echo ""
    tail -n +"$((insert_line + 1))" "$file"
  } > "$file.tmp"
  
  mv "$file.tmp" "$file"
  echo "  ✓ Added generateStaticParams"
done

echo "Done!"

