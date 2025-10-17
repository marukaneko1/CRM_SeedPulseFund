#!/bin/bash

# Add scrolling to ALL dashboard pages

echo "🔧 Adding scrolling to ALL dashboard pages..."

cd /Users/marukaneko/CRM_SeedPulseFund

# Find all dashboard page.tsx files
find app/dashboard -name "page.tsx" -type f | while read -r file; do
  echo "Processing: $file"
  
  # Check if file has any of these patterns and doesn't already have overflow-y-auto
  if ! grep -q "overflow-y-auto" "$file"; then
    # Pattern 1: <div className="p-8">
    if grep -q 'className="p-8">' "$file"; then
      sed -i '' 's/className="p-8">/className="p-8 overflow-y-auto max-h-screen">/g' "$file"
      echo "  ✅ Added scrolling (pattern: p-8)"
    # Pattern 2: className="p-8 
    elif grep -q 'className="p-8 ' "$file"; then
      sed -i '' 's/className="p-8 /className="p-8 overflow-y-auto max-h-screen /g' "$file"
      echo "  ✅ Added scrolling (pattern: p-8 with space)"
    # Pattern 3: className="p-6">
    elif grep -q 'className="p-6">' "$file"; then
      sed -i '' 's/className="p-6">/className="p-6 overflow-y-auto max-h-screen">/g' "$file"
      echo "  ✅ Added scrolling (pattern: p-6)"
    # Pattern 4: className="p-6 
    elif grep -q 'className="p-6 ' "$file"; then
      sed -i '' 's/className="p-6 /className="p-6 overflow-y-auto max-h-screen /g' "$file"
      echo "  ✅ Added scrolling (pattern: p-6 with space)"
    # Pattern 5: flex-1 (like dashboard/page.tsx)
    elif grep -q 'className="flex-1' "$file" && ! grep -q 'max-h-screen' "$file"; then
      # More careful replacement for flex-1
      if grep -q 'className="flex-1 bg-white flex flex-col"' "$file"; then
        sed -i '' 's/className="flex-1 bg-white flex flex-col"/className="flex-1 bg-white flex flex-col overflow-y-auto max-h-screen"/g' "$file"
        echo "  ✅ Added scrolling (pattern: flex-1)"
      else
        echo "  ⚠️  Has flex-1 but different pattern, skipping"
      fi
    else
      echo "  ⚠️  No common pattern found, may need manual check"
    fi
  else
    echo "  ✓ Already has scrolling"
  fi
done

echo ""
echo "🎉 Scrolling setup complete for all dashboard pages!"
echo ""
echo "Test pages that should now scroll:"
echo "- http://localhost:3000/dashboard/tasks"
echo "- http://localhost:3000/dashboard/files"
echo "- http://localhost:3000/dashboard/ideas"
echo "- http://localhost:3000/dashboard/google-workspace"
echo "- http://localhost:3000/dashboard/tax-management"
echo "- http://localhost:3000/dashboard/email"
echo "- http://localhost:3000/dashboard/calendar"
echo "- And all other dashboard pages!"


