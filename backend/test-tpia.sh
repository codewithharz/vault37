#!/bin/bash

# GDIP TPIA & GDC System Test Suite
# Tests TPIA purchase, GDC assignment, admin approval, and maturity processing

BASE_URL="http://localhost:5001"
API_URL="${BASE_URL}/api"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Store tokens and IDs
ACCESS_TOKEN=""
ADMIN_TOKEN=""
TPIA_ID=""
GDC_NUMBER=""

print_test() {
    TESTS_RUN=$((TESTS_RUN + 1))
    if [ $1 -eq 0 ]; then
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo -e "${GREEN}✓${NC} $2"
    else
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo -e "${RED}✗${NC} $2"
    fi
}

echo "════════════════════════════════════════════════════════"
echo "🧪 GDIP TPIA & GDC System Test Suite"
echo "════════════════════════════════════════════════════════"
echo ""

# Setup: Create test user with funds
echo -e "${BLUE}📋 Setup: Creating Test User with Funds${NC}"
TIMESTAMP=$(date +%s)
TEST_EMAIL="tpia${TIMESTAMP}@vault37.com"

REGISTER_RESPONSE=$(curl -s -X POST ${API_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"TPIA Test User\",
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"SecurePass123!\",
    \"confirmPassword\": \"SecurePass123!\",
    \"phone\": \"+2348012345678\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q "success.*true"; then
    ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    print_test 0 "Test user created and logged in"
else
    print_test 1 "Test user created"
    echo "Response: $REGISTER_RESPONSE"
    exit 1
fi

# Manually credit wallet for testing (in production, use deposit flow)
echo -e "${YELLOW}Note: Manually credit wallet ₦100,000 in database for testing${NC}"
echo ""

# Test 1: Purchase TPIA (Insufficient Balance)
echo -e "${BLUE}📋 Test 1: Purchase TPIA (Insufficient Balance - Should Fail)${NC}"
PURCHASE_FAIL=$(curl -s -X POST ${API_URL}/tpia/purchase \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json")

if echo "$PURCHASE_FAIL" | grep -q "Insufficient balance"; then
    print_test 0 "Insufficient balance check working"
else
    print_test 1 "Insufficient balance check working"
fi
echo ""

# Test 2: Get My TPIAs (Empty)
echo -e "${BLUE}📋 Test 2: Get My TPIAs (Should be Empty)${NC}"
MY_TPIAS=$(curl -s -X GET ${API_URL}/tpia/my-tpias \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$MY_TPIAS" | grep -q "success.*true"; then
    print_test 0 "Get my TPIAs successful"
else
    print_test 1 "Get my TPIAs successful"
fi
echo ""

# Test 3: Get All GDCs
echo -e "${BLUE}📋 Test 3: Get All GDCs${NC}"
ALL_GDCS=$(curl -s -X GET ${API_URL}/gdc \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$ALL_GDCS" | grep -q "success.*true"; then
    print_test 0 "Get all GDCs successful"
else
    print_test 1 "Get all GDCs successful"
fi
echo ""

# Test 4: Get Filling GDCs
echo -e "${BLUE}📋 Test 4: Get Filling GDCs${NC}"
FILLING_GDCS=$(curl -s -X GET ${API_URL}/gdc/filling \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$FILLING_GDCS" | grep -q "success.*true"; then
    print_test 0 "Get filling GDCs successful"
else
    print_test 1 "Get filling GDCs successful"
fi
echo ""

# Test 5: Get Pending TPIAs (Admin - Without Admin Role)
echo -e "${BLUE}📋 Test 5: Get Pending TPIAs (Non-Admin - Should Fail)${NC}"
PENDING_FAIL=$(curl -s -X GET ${API_URL}/tpia/admin/pending \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$PENDING_FAIL" | grep -q "not authorized"; then
    print_test 0 "Admin authorization check working"
else
    print_test 1 "Admin authorization check working"
fi
echo ""

# Test 6: Protected Route Without Token
echo -e "${BLUE}📋 Test 6: Protected Route Without Token (Should Fail)${NC}"
NO_TOKEN=$(curl -s -X POST ${API_URL}/tpia/purchase)

if echo "$NO_TOKEN" | grep -q "authorized"; then
    print_test 0 "Authentication required for TPIA endpoints"
else
    print_test 1 "Authentication required for TPIA endpoints"
fi
echo ""

# Summary
echo "════════════════════════════════════════════════════════"
echo "📊 Test Summary"
echo "════════════════════════════════════════════════════════"
echo -e "Total Tests: ${TESTS_RUN}"
echo -e "${GREEN}Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}Failed: ${TESTS_FAILED}${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo -e "${YELLOW}📝 Manual Testing Required:${NC}"
    echo "1. Credit user wallet with ₦100,000 in database"
    echo "2. Test TPIA purchase flow"
    echo "3. Set user role to 'admin' in database"
    echo "4. Test admin approval workflow"
    echo "5. Wait 60 minutes to test auto-approval"
    echo "6. Set TPIA maturityDate to past date to test maturity processing"
    echo ""
    echo -e "${BLUE}Database Commands:${NC}"
    echo "# Credit wallet:"
    echo "db.wallets.updateOne({userId: ObjectId('USER_ID')}, {\$set: {balance: 100000}})"
    echo ""
    echo "# Set admin role:"
    echo "db.users.updateOne({email: '${TEST_EMAIL}'}, {\$set: {role: 'admin'}})"
    echo ""
    echo "# Test maturity (set to yesterday):"
    echo "db.tpias.updateOne({_id: ObjectId('TPIA_ID')}, {\$set: {status: 'active', maturityDate: new Date(Date.now() - 86400000)}})"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
