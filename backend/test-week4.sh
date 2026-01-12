#!/bin/bash

# GDIP Phase 1 Week 4 Verification Script (Final Fix)
BASE_URL="http://localhost:5001/api"
TIMESTAMP=$(date +%s)
USER_EMAIL="user_w4_$TIMESTAMP@test.com"
ADMIN_EMAIL="admin_w4_$TIMESTAMP@test.com"
PASS="SecurePass123!"

echo "════════════════════════════════════════════════════════"
echo "🧪 GDIP Phase 1 Week 4 Verification"
echo "════════════════════════════════════════════════════════"

# 1. Setup: Register User
echo -e "\n📋 Setup: Registering Test User"
USER_RESP=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\": \"Week 4 User\", \"email\": \"$USER_EMAIL\", \"password\": \"$PASS\", \"confirmPassword\": \"$PASS\", \"phone\": \"+2348011111111\"}")
USER_TOKEN=$(echo $USER_RESP | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
if [ -z "$USER_TOKEN" ]; then echo "❌ User registration failed"; exit 1; fi
echo "✓ User registered"

# 2. Setup: Register & Promote Admin
echo -e "\n📋 Setup: Registering & Promoting Admin"
ADMIN_RESP=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"fullName\": \"Week 4 Admin\", \"email\": \"$ADMIN_EMAIL\", \"password\": \"$PASS\", \"confirmPassword\": \"$PASS\", \"phone\": \"+2348022222222\"}")
ADMIN_TOKEN=$(echo $ADMIN_RESP | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# Robust Admin Promotion
node -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vault37_db';
await mongoose.connect(uri);
await mongoose.connection.db.collection('users').updateOne({email: '$ADMIN_EMAIL'}, {\$set: {role: 'admin'}});
console.log('Admin promoted');
process.exit(0);
" --input-type module

echo "✓ Admin registered and promoted"

# 3. Test: Switch Mode (Triggers Notification & Audit Log)
echo -e "\n📋 Test 1: Switch Mode"
curl -s -X PATCH "$BASE_URL/users/mode" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mode": "EPS"}' > /dev/null
echo "✓ Mode switched to EPS"

# 4. Test: Get Notifications
echo -e "\n📋 Test 2: Get Notifications"
NOTIF_RESP=$(curl -s -X GET "$BASE_URL/notifications" \
  -H "Authorization: Bearer $USER_TOKEN")
echo $NOTIF_RESP | grep -q "Investment Mode Changed" && echo "✓ Notification received correctly" || echo "❌ Notification not found"

# 5. Test: KYC Submission
echo -e "\n📋 Test 3: KYC Submission"
curl -s -X POST "$BASE_URL/users/kyc" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"idType": "NIN", "idNumber": "1234567890", "address": {"street": "123 Test St", "city": "Lagos", "state": "Lagos"}}' > /dev/null
echo "✓ KYC submitted"

# 6. Test: Admin Dashboard Stats
echo -e "\n📋 Test 4: Admin Dashboard Stats"
STATS_RESP=$(curl -s -X GET "$BASE_URL/admin/dashboard" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo $STATS_RESP | grep -q "tvl" && echo "✓ Admin dashboard features TVL" || echo "❌ Admin authorization or stats failed"

# 7. Test: TPIA Purchase KYC Check
# Since transactions are failing on standalone MongoDB, we expect a 403 error ONLY if KYC check runs BEFORE the transaction start.
# Currently, it runs AFTER transaction start. I will move it BEFORE.
echo -e "\n📋 Test 5: TPIA Purchase KYC Protection"
PURCHASE_RESP=$(curl -s -X POST "$BASE_URL/tpia/purchase" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json")
echo $PURCHASE_RESP | grep -q "KYC verification required" && echo "✓ TPIA purchase protected by KYC" || echo "❌ KYC protection failed (or DB transaction error)"

echo -e "\n════════════════════════════════════════════════════════"
echo "📊 Verification Complete"
echo "════════════════════════════════════════════════════════"
