#!/bin/bash

# GDIP Phase 2 Week 3 Verification Script
BASE_URL="http://localhost:5001/api"
TIMESTAMP=$(date +%s)
USER_EMAIL="user_p2_w3_$TIMESTAMP@test.com"
ADMIN_EMAIL="admin_p2_w3_$TIMESTAMP@test.com"
PASS="SecurePass123!"

echo "════════════════════════════════════════════════════════"
echo "🧪 GDIP Phase 2 Week 3 Verification"
echo "════════════════════════════════════════════════════════"

# 1. Setup Admin
echo -e "\n📋 Setup: Registering & Promoting Admin"
ADMIN_RESP=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\": \"P2 W3 Admin\", \"email\": \"$ADMIN_EMAIL\", \"password\": \"$PASS\", \"confirmPassword\": \"$PASS\", \"phone\": \"+2349022222222\"}")
ADMIN_TOKEN=$(echo $ADMIN_RESP | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

node -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vault37_db');
await mongoose.connection.db.collection('users').updateOne({email: '$ADMIN_EMAIL'}, {\$set: {role: 'admin', kycStatus: 'verified'}});
process.exit(0);
" --input-type module

# 2. Setup Commodity & Add History
echo -e "\n📋 Test 1: Historical NAV Tracking"
COMM_RESP=$(curl -s -X POST "$BASE_URL/commodities" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Gold $TIMESTAMP\", \"type\": \"Metal\", \"navPrice\": 100000, \"basePrice\": 90000}")
COMM_ID=$(echo $COMM_RESP | grep -o '"_id":"[^"]*"' | tail -n1 | cut -d'"' -f4)

# Create a price update to generate history
curl -s -X PATCH "$BASE_URL/commodities/$COMM_ID/nav" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"navPrice": 105000}' > /dev/null

HISTORY_RESP=$(curl -s -X GET "$BASE_URL/commodities/$COMM_ID/history")
echo "✓ History Count: $(echo $HISTORY_RESP | grep -o '"price":' | wc -l)"

if echo $HISTORY_RESP | grep -q "105000"; then
    echo "✅ SUCCESS: NAV History tracked correctly"
else
    echo "❌ FAILURE: NAV History mismatch"
    exit 1
fi

# 3. Setup User & Purchase TPIAs
echo -e "\n📋 Setup: User & PortFolio Data"
USER_RESP=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\": \"P2 W3 Portfolio User\", \"email\": \"$USER_EMAIL\", \"password\": \"$PASS\", \"confirmPassword\": \"$PASS\", \"phone\": \"+2349033333333\"}")
USER_TOKEN=$(echo $USER_RESP | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $USER_RESP | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

# Admin Verifies User
curl -s -X PATCH "$BASE_URL/admin/users/$USER_ID/kyc" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "verified"}' > /dev/null

# Fund user wallet
node -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vault37_db');
await mongoose.connection.db.collection('wallets').updateOne({userId: new mongoose.Types.ObjectId('$USER_ID')}, {\$inc: {balance: 300000}});
process.exit(0);
" --input-type module

# Purchase 2 TPIAs
curl -s -X POST "$BASE_URL/tpia/purchase" -H "Authorization: Bearer $USER_TOKEN" -H "Content-Type: application/json" -d "{\"commodityId\": \"$COMM_ID\"}" > /dev/null
curl -s -X POST "$BASE_URL/tpia/purchase" -H "Authorization: Bearer $USER_TOKEN" -H "Content-Type: application/json" -d "{\"commodityId\": \"$COMM_ID\"}" > /dev/null

# 4. Test: Portfolio API
echo -e "\n📋 Test 2: Portfolio Aggregation"
PORTFOLIO_RESP=$(curl -s -X GET "$BASE_URL/users/portfolio" -H "Authorization: Bearer $USER_TOKEN")
echo "Portfolio Response: $PORTFOLIO_RESP"

TOTAL_INVESTED=$(echo $PORTFOLIO_RESP | grep -o '"totalInvested":[0-9]*' | cut -d: -f2)
echo "✓ Total Invested: $TOTAL_INVESTED"

if [ "$TOTAL_INVESTED" -eq 200000 ]; then
    echo "✅ SUCCESS: Portfolio aggregation accurate"
else
    echo "❌ FAILURE: Portfolio total mismatch ($TOTAL_INVESTED)"
    exit 1
fi

# 5. Test Diversification
DIVERSIFICATION=$(echo $PORTFOLIO_RESP | grep -o '"diversification":\[[^]]*\]')
if [[ $DIVERSIFICATION == *"Gold"* ]]; then
    echo "✅ SUCCESS: Diversification data included"
else
    echo "❌ FAILURE: Diversification data missing"
    exit 1
fi

echo -e "\n════════════════════════════════════════════════════════"
echo "📊 Phase 2 Week 3 Verification Complete"
echo "════════════════════════════════════════════════════════"
