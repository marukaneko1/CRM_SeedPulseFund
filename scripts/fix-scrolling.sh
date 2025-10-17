#!/bin/bash

# Fix scrolling in all dashboard pages by adding overflow-y-auto max-h-screen

echo "🔧 Fixing scrolling in all dashboard pages..."

# List of pages to fix
PAGES=(
  "app/dashboard/google-workspace/page.tsx"
  "app/dashboard/tax-management/page.tsx"
  "app/dashboard/email/page.tsx"
  "app/dashboard/fundraising/page.tsx"
  "app/dashboard/surveys/page.tsx"
  "app/dashboard/networking/page.tsx"
  "app/dashboard/legal/page.tsx"
  "app/dashboard/accounting/page.tsx"
  "app/dashboard/digital-signing/page.tsx"
  "app/dashboard/reporting/page.tsx"
  "app/dashboard/lp-portal/page.tsx"
  "app/dashboard/data-rooms/page.tsx"
  "app/dashboard/deal-assist/page.tsx"
  "app/dashboard/portfolio/page.tsx"
  "app/dashboard/notifications/page.tsx"
  "app/dashboard/reminders/page.tsx"
  "app/dashboard/messages/page.tsx"
  "app/dashboard/contacts/page.tsx"
  "app/dashboard/deals/page.tsx"
  "app/dashboard/companies/page.tsx"
  "app/dashboard/screeners/page.tsx"
  "app/dashboard/watching/page.tsx"
)

for page in "${PAGES[@]}"; do
  if [ -f "$page" ]; then
    # Check if the page already has overflow-y-auto
    if grep -q 'className="p-8 overflow-y-auto max-h-screen"' "$page"; then
      echo "✓ $page already has scrolling"
    elif grep -q 'className="p-8"' "$page"; then
      # Add overflow-y-auto max-h-screen to existing p-8 className
      sed -i '' 's/className="p-8"/className="p-8 overflow-y-auto max-h-screen"/g' "$page"
      echo "✅ Fixed $page"
    else
      echo "⚠️  Skipping $page (no p-8 className found)"
    fi
  else
    echo "⚠️  File not found: $page"
  fi
done

echo ""
echo "🎉 Scrolling fix complete!"
echo ""
echo "✅ All dashboard pages now have proper scrolling!"


