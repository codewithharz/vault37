#!/bin/bash

# GDIP Phase 2 Week 2 Verification Script
BASE_URL="http://localhost:5001/api"
TIMESTAMP=$(date +%s)
USER_EMAIL="user_p2_w2_$TIMESTAMP@test.com"
ADMIN_EMAIL="admin_p2_w2_$TIMESTAMP@test.com"
PASS="SecurePass123!"

echo "════════════════════════════════════════════════════════"
echo "🧪 GDIP Phase 2 Week 2 Verification"
echo "════════════════════════════════════════════════════════"

# 1. Setup: Register & Login Admin
echo -e "\n📋 Setup: Registering & Promoting Admin"
ADMIN_RESP=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\": \"P2 W2 Admin\", \"email\": \"$ADMIN_EMAIL\", \"password\": \"$PASS\", \"confirmPassword\": \"$PASS\", \"phone\": \"+2349022222222\"}")
echo "Admin Response: $ADMIN_RESP"
ADMIN_TOKEN=$(echo $ADMIN_RESP | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# Promote Admin
node -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vault37_db');
await mongoose.connection.db.collection('users').updateOne({email: '$ADMIN_EMAIL'}, {\$set: {role: 'admin', kycStatus: 'verified'}});
process.exit(0);
" --input-type module

# 2. Test: Create Two Different Commodities
echo -e "\n📋 Test 1: Create Two Commodities (Rice & Cocoa)"
COMM1_RESP=$(curl -s -X POST "$BASE_URL/commodities" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Rice $TIMESTAMP\", \"type\": \"Grain\", \"navPrice\": 80000, \"basePrice\": 70000}")
echo "Rice Comm Response: $COMM1_RESP"
COMM1_ID=$(echo $COMM1_RESP | grep -o '"_id":"[^"]*"' | tail -n1 | cut -d'"' -f4)

COMM2_RESP=$(curl -s -X POST "$BASE_URL/commodities" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Cocoa $TIMESTAMP\", \"type\": \"Bean\", \"navPrice\": 150000, \"basePrice\": 130000}")
echo "Cocoa Comm Response: $COMM2_RESP"
COMM2_ID=$(echo $COMM2_RESP | grep -o '"_id":"[^"]*"' | tail -n1 | cut -d'"' -f4)

echo "✓ Rice ID: $COMM1_ID"
echo "✓ Cocoa ID: $COMM2_ID"

# 3. Setup: Register User & Complete KYC
echo -e "\n📋 Setup: Registering & Verifying User"
USER_RESP=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\": \"P2 W2 User\", \"email\": \"$USER_EMAIL\", \"password\": \"$PASS\", \"confirmPassword\": \"$PASS\", \"phone\": \"+2349011111111\"}")
echo "User Response: $USER_RESP"
USER_TOKEN=$(echo $USER_RESP | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $USER_RESP | grep -o '"id":"[^"]*' | head -n1 | cut -d'"' -f4)

# Admin Verifies User
curl -s -X PATCH "$BASE_URL/admin/users/$USER_ID/kyc" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "verified"}' > /dev/null

# 4. Setup: Deposit Funds for User
node -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vault37_db');
await mongoose.connection.db.collection('wallets').updateOne({userId: new mongoose.Types.ObjectId('$USER_ID')}, {\$inc: {balance: 500000}});
process.exit(0);
" --input-type module
echo "✓ User verified and funded"

# 5. Test: Purchase TPIAs for both commodities
echo -e "\n📋 Test 2: Multi-Commodity Purchase & GDC Separation"
PURCH_RICE=$(curl -s -X POST "$BASE_URL/tpia/purchase" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"commodityId\": \"$COMM1_ID\"}")
echo "Rice Purchase Response: $PURCH_RICE"
TPIA_RICE_GDC=$(echo $PURCH_RICE | grep -o '"gdcNumber":[0-9]*' | cut -d: -f2)

PURCH_COCOA=$(curl -s -X POST "$BASE_URL/tpia/purchase" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"commodityId\": \"$COMM2_ID\"}")
echo "Cocoa Purchase Response: $PURCH_COCOA"
TPIA_COCOA_GDC=$(echo $PURCH_COCOA | grep -o '"gdcNumber":[0-9]*' | cut -d: -f2)

echo "✓ Rice TPIA GDC: $TPIA_RICE_GDC"
echo "✓ Cocoa TPIA GDC: $TPIA_COCOA_GDC"

if [ "$TPIA_RICE_GDC" != "$TPIA_COCOA_GDC" ]; then
    echo "✅ SUCCESS: Commodities assigned to different GDCs"
else
    echo "❌ FAILURE: Commodities sharing same GDC number"
    exit 1
fi

# 6. Test: GDC Monitoring API
echo -e "\n📋 Test 3: GDC Monitoring API"
STATS_RESP=$(curl -s -X GET "$BASE_URL/gdc/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "Stats: $STATS_RESP"

ALL_GDCS=$(curl -s -X GET "$BASE_URL/gdc" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "All GDCs count: $(echo $ALL_GDCS | grep -o '"count":[0-9]*' | cut -d: -f2)"

echo -e "\n════════════════════════════════════════════════════════"
echo "📊 Verification Complete"
echo "════════════════════════════════════════════════════════"
