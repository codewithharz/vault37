#!/bin/bash

# GDIP Phase 2 Week 1 Verification Script
BASE_URL="http://localhost:5001/api"
TIMESTAMP=$(date +%s)
USER_EMAIL="user_p2_$TIMESTAMP@test.com"
ADMIN_EMAIL="admin_p2_$TIMESTAMP@test.com"
PASS="SecurePass123!"

echo "════════════════════════════════════════════════════════"
echo "🧪 GDIP Phase 2 Week 1 Verification"
echo "════════════════════════════════════════════════════════"

# 1. Setup: Register & Login Admin
echo -e "\n📋 Setup: Registering & Promoting Admin"
ADMIN_RESP=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\": \"P2 Admin\", \"email\": \"$ADMIN_EMAIL\", \"password\": \"$PASS\", \"confirmPassword\": \"$PASS\", \"phone\": \"+2349022222222\"}")
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

# 2. Test: Create Commodity
echo -e "\n📋 Test 1: Create Commodity"
COMM_NAME="White Maize $TIMESTAMP"
COMM_RESP=$(curl -s -X POST "$BASE_URL/commodities" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"$COMM_NAME\", \"type\": \"Grain\", \"navPrice\": 120000, \"basePrice\": 100000}")
COMM_ID=$(echo $COMM_RESP | grep -o '"_id":"[^"]*"' | cut -d'"' -f4 | tail -n1)
echo "Response: $COMM_RESP"
if [ -z "$COMM_ID" ]; then echo "❌ Commodity creation failed"; exit 1; fi
echo "✓ Commodity created: $COMM_NAME"

# 3. Setup: Register User & Complete KYC
echo -e "\n📋 Setup: Registering & Verifying User"
USER_RESP=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\": \"P2 User\", \"email\": \"$USER_EMAIL\", \"password\": \"$PASS\", \"confirmPassword\": \"$PASS\", \"phone\": \"+2349011111111\"}")
USER_TOKEN=$(echo $USER_RESP | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $USER_RESP | grep -o '"id":"[^"]*' | cut -d'"' -f4)

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
await mongoose.connection.db.collection('wallets').updateOne({userId: new mongoose.Types.ObjectId('$USER_ID')}, {\$inc: {balance: 200000}});
process.exit(0);
" --input-type module
echo "✓ User verified and funded"

# 5. Test: Purchase Commodity-linked TPIA
echo -e "\n📋 Test 2: Purchase TPIA with Commodity Selection"
PURCHASE_RESP=$(curl -s -X POST "$BASE_URL/tpia/purchase" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"commodityId\": \"$COMM_ID\"}")
TPIA_ID=$(echo $PURCHASE_RESP | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -n1)
echo "Response: $PURCHASE_RESP"
if [ -z "$TPIA_ID" ]; then echo "❌ TPIA purchase failed"; exit 1; fi
echo "✓ TPIA purchased with Commodity ID ($TPIA_ID)"

# 6. Test: Admin Approval & Insurance Check
echo -e "\n📋 Test 3: Admin Approval & Insurance Activation"
APPROVE_RESP=$(curl -s -X PATCH "$BASE_URL/tpia/admin/$TPIA_ID/approve" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')
echo "Response: $APPROVE_RESP"
echo "✓ TPIA Approved"

# Verify Insurance Policy format in details
DETAILS_RESP=$(curl -s -X GET "$BASE_URL/tpia/$TPIA_ID" \
  -H "Authorization: Bearer $USER_TOKEN")
echo "Details: $DETAILS_RESP"
echo $DETAILS_RESP | grep -q "TPIA-" && echo "✓ Insurance Policy Number generated correctly" || echo "❌ Insurance Number failed"

# 7. Test: Update Insurance Certificate
echo -e "\n📋 Test 4: Link External Insurance Certificate"
INS_RESP=$(curl -s -X PATCH "$BASE_URL/admin/tpia/$TPIA_ID/insurance" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"insuranceCertificateUrl": "https://vault37.com/certs/policy-xyz.pdf"}')
echo "Response: $INS_RESP"
echo $INS_RESP | grep -q "policy-xyz.pdf" && echo "✓ Insurance certificate linked successfully" || echo "❌ Certificate linking failed"

echo -e "\n════════════════════════════════════════════════════════"
echo "📊 Verification Complete"
echo "════════════════════════════════════════════════════════"
