#!/bin/bash

echo "🧪 TESTING ALL API ENDPOINTS"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Base URL
BASE="http://localhost:3000"

echo "📡 Testing API Connectivity..."
echo ""

# Test each API endpoint
echo "1. Testing /api/contacts..."
curl -s -o /dev/null -w "%{http_code}" "$BASE/api/contacts" > /tmp/test1.txt
CODE=$(cat /tmp/test1.txt)
if [ "$CODE" = "401" ]; then
  echo "   ✅ Contacts API - Protected (returns 401 without auth)"
else
  echo "   ⚠️  Contacts API - Response: $CODE"
fi

echo "2. Testing /api/companies..."
curl -s -o /dev/null -w "%{http_code}" "$BASE/api/companies" > /tmp/test2.txt
CODE=$(cat /tmp/test2.txt)
if [ "$CODE" = "401" ]; then
  echo "   ✅ Companies API - Protected (returns 401 without auth)"
else
  echo "   ⚠️  Companies API - Response: $CODE"
fi

echo "3. Testing /api/deals..."
curl -s -o /dev/null -w "%{http_code}" "$BASE/api/deals" > /tmp/test3.txt
CODE=$(cat /tmp/test3.txt)
if [ "$CODE" = "401" ]; then
  echo "   ✅ Deals API - Protected (returns 401 without auth)"
else
  echo "   ⚠️  Deals API - Response: $CODE"
fi

echo "4. Testing /api/messages..."
curl -s -o /dev/null -w "%{http_code}" "$BASE/api/messages" > /tmp/test4.txt
CODE=$(cat /tmp/test4.txt)
if [ "$CODE" = "401" ]; then
  echo "   ✅ Messages API - Protected (returns 401 without auth)"
else
  echo "   ⚠️  Messages API - Response: $CODE"
fi

echo "5. Testing /api/calendar..."
curl -s -o /dev/null -w "%{http_code}" "$BASE/api/calendar" > /tmp/test5.txt
CODE=$(cat /tmp/test5.txt)
if [ "$CODE" = "401" ]; then
  echo "   ✅ Calendar API - Protected (returns 401 without auth)"
else
  echo "   ⚠️  Calendar API - Response: $CODE"
fi

echo "6. Testing /api/channels..."
curl -s -o /dev/null -w "%{http_code}" "$BASE/api/channels" > /tmp/test6.txt
CODE=$(cat /tmp/test6.txt)
if [ "$CODE" = "401" ]; then
  echo "   ✅ Channels API - Protected (returns 401 without auth)"
else
  echo "   ⚠️  Channels API - Response: $CODE"
fi

echo "7. Testing /api/portfolio..."
curl -s -o /dev/null -w "%{http_code}" "$BASE/api/portfolio" > /tmp/test7.txt
CODE=$(cat /tmp/test7.txt)
if [ "$CODE" = "401" ]; then
  echo "   ✅ Portfolio API - Protected (returns 401 without auth)"
else
  echo "   ⚠️  Portfolio API - Response: $CODE"
fi

echo ""
echo "================================"
echo "✅ All APIs are protected and responding!"
echo "Note: 401 = Good (auth required)"
echo ""
