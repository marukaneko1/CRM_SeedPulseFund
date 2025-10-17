#!/bin/bash

echo "🔧 Adding overflow-y-auto to all dashboard pages with flex-1 pattern..."

cd /Users/marukaneko/CRM_SeedPulseFund/app/dashboard

# List of files that need flex-1 pattern fixed
FILES=(
  "accounting/page.tsx"
  "reporting/page.tsx"
  "screeners/page.tsx"
  "lp-contacts/page.tsx"
  "lp-tracker/page.tsx"
  "watching/page.tsx"
  "intermediary/page.tsx"
  "networking/page.tsx"
  "projects/page.tsx"
  "lp-portal/page.tsx"
  "real-estate/page.tsx"
  "fundraising/page.tsx"
  "pe-bankers/page.tsx"
  "accelerator/page.tsx"
  "data-rooms/page.tsx"
  "ma-pipeline/page.tsx"
  "newsletter/page.tsx"
  "investor-network/page.tsx"
  "corp-dev/page.tsx"
  "legal/page.tsx"
  "notifications/page.tsx"
  "reminders/page.tsx"
  "companies/page.tsx"
  "onboarding/page.tsx"
  "talent/page.tsx"
  "fund-performance/page.tsx"
  "pe-pipeline/page.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Check if already has overflow-y-auto
    if grep -q "overflow-y-auto" "$file"; then
      echo "✓ $file already has scrolling"
    else
      # Try to add overflow-y-auto to first div with flex-1 that doesn't have it
      if grep -q 'flex-1' "$file"; then
        # Use perl for more complex regex replacement
        perl -i -pe 's/className="([^"]*flex-1[^"]*)"/className="$1 overflow-y-auto"/ unless \/overflow-y-auto/' "$file"
        echo "✅ Added overflow-y-auto to $file"
      else
        echo "⚠️  No flex-1 found in $file"
      fi
    fi
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "🎉 All dashboard pages now have scrolling!"


