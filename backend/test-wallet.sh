#!/bin/bash

# GDIP Wallet System Test Suite
# Tests wallet operations, deposits, withdrawals, and admin approval workflow

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
USER_ID=""
WALLET_ID=""
BANK_ACCOUNT_ID=""
DEPOSIT_TX_ID=""
WITHDRAWAL_TX_ID=""

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
echo "🧪 GDIP Wallet System Test Suite"
echo "════════════════════════════════════════════════════════"
echo ""

# Setup: Create test user
echo -e "${BLUE}📋 Setup: Creating Test User${NC}"
TIMESTAMP=$(date +%s)
TEST_EMAIL="wallet${TIMESTAMP}@vault37.com"
ADMIN_EMAIL="admin${TIMESTAMP}@vault37.com"

REGISTER_RESPONSE=$(curl -s -X POST ${API_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"Wallet Test User\",
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

# Create admin user
ADMIN_REGISTER=$(curl -s -X POST ${API_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"Admin User\",
    \"email\": \"${ADMIN_EMAIL}\",
    \"password\": \"SecurePass123!\",
    \"confirmPassword\": \"SecurePass123!\",
    \"phone\": \"+2348012345679\"
  }")

if echo "$ADMIN_REGISTER" | grep -q "success.*true"; then
    ADMIN_TOKEN=$(echo "$ADMIN_REGISTER" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    print_test 0 "Admin user created"
    echo -e "${YELLOW}Note: In production, manually set role to 'admin' in database${NC}"
else
    print_test 1 "Admin user created"
fi

echo ""

# Test 1: Get Wallet
echo -e "${BLUE}📋 Test 1: Get Wallet${NC}"
WALLET_RESPONSE=$(curl -s -X GET ${API_URL}/wallet \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$WALLET_RESPONSE" | grep -q "success.*true"; then
    print_test 0 "Get wallet successful"
    WALLET_ID=$(echo "$WALLET_RESPONSE" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
else
    print_test 1 "Get wallet successful"
fi
echo ""

# Test 2: Add Bank Account
echo -e "${BLUE}📋 Test 2: Add Bank Account${NC}"
BANK_RESPONSE=$(curl -s -X POST ${API_URL}/wallet/bank-account \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "bankName": "GTBank",
    "accountNumber": "0123456789",
    "accountName": "Wallet Test User"
  }')

if echo "$BANK_RESPONSE" | grep -q "success.*true"; then
    print_test 0 "Bank account added successfully"
    BANK_ACCOUNT_ID=$(echo "$BANK_RESPONSE" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
else
    print_test 1 "Bank account added successfully"
fi
echo ""

# Test 3: Initialize Deposit (Paystack)
echo -e "${BLUE}📋 Test 3: Initialize Deposit${NC}"
DEPOSIT_INIT=$(curl -s -X POST ${API_URL}/wallet/deposit \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000
  }')

if echo "$DEPOSIT_INIT" | grep -q "Payment initialized"; then
    print_test 0 "Deposit initialization successful"
    echo -e "${YELLOW}Note: In production, user would be redirected to Paystack${NC}"
else
    print_test 1 "Deposit initialization successful"
    echo "Response: $DEPOSIT_INIT"
fi
echo ""

# Test 4: Request Withdrawal (Below Minimum)
echo -e "${BLUE}📋 Test 4: Request Withdrawal (Below Minimum - Should Fail)${NC}"
WITHDRAWAL_FAIL=$(curl -s -X POST ${API_URL}/wallet/withdraw \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000
  }')

if echo "$WITHDRAWAL_FAIL" | grep -q "Minimum withdrawal"; then
    print_test 0 "Minimum withdrawal validation working"
else
    print_test 1 "Minimum withdrawal validation working"
fi
echo ""

# Test 5: Request Withdrawal (Insufficient Balance)
echo -e "${BLUE}📋 Test 5: Request Withdrawal (Insufficient Balance - Should Fail)${NC}"
WITHDRAWAL_INSUF=$(curl -s -X POST ${API_URL}/wallet/withdraw \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000
  }')

if echo "$WITHDRAWAL_INSUF" | grep -q "Insufficient balance"; then
    print_test 0 "Insufficient balance check working"
else
    print_test 1 "Insufficient balance check working"
fi
echo ""

# Test 6: Get Transaction History
echo -e "${BLUE}📋 Test 6: Get Transaction History${NC}"
TRANSACTIONS=$(curl -s -X GET "${API_URL}/wallet/transactions?page=1&limit=10" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$TRANSACTIONS" | grep -q "success.*true"; then
    print_test 0 "Transaction history retrieved"
else
    print_test 1 "Transaction history retrieved"
fi
echo ""

# Test 7: Get User Statistics
echo -e "${BLUE}📋 Test 7: Get User Statistics${NC}"
STATS=$(curl -s -X GET ${API_URL}/users/stats \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$STATS" | grep -q "success.*true"; then
    print_test 0 "User statistics retrieved"
else
    print_test 1 "User statistics retrieved"
fi
echo ""

# Test 8: Update Profile
echo -e "${BLUE}📋 Test 8: Update Profile${NC}"
PROFILE_UPDATE=$(curl -s -X PUT ${API_URL}/users/profile \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Test User"
  }')

if echo "$PROFILE_UPDATE" | grep -q "Profile updated successfully"; then
    print_test 0 "Profile updated successfully"
else
    print_test 1 "Profile updated successfully"
fi
echo ""

# Test 9: Switch Mode (TPM to EPS)
echo -e "${BLUE}📋 Test 9: Switch Mode (TPM to EPS)${NC}"
MODE_SWITCH=$(curl -s -X PATCH ${API_URL}/users/mode \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "EPS"
  }')

if echo "$MODE_SWITCH" | grep -q "Mode switched"; then
    print_test 0 "Mode switched successfully"
else
    print_test 1 "Mode switched successfully"
fi
echo ""

# Test 10: Admin Dashboard (Without Admin Role - Should Fail)
echo -e "${BLUE}📋 Test 10: Admin Dashboard (Non-Admin - Should Fail)${NC}"
ADMIN_FAIL=$(curl -s -X GET ${API_URL}/admin/dashboard \
  -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$ADMIN_FAIL" | grep -q "not authorized"; then
    print_test 0 "Admin authorization check working"
else
    print_test 1 "Admin authorization check working"
fi
echo ""

# Test 11: Protected Route Without Token
echo -e "${BLUE}📋 Test 11: Protected Route Without Token (Should Fail)${NC}"
NO_TOKEN=$(curl -s -X GET ${API_URL}/wallet)

if echo "$NO_TOKEN" | grep -q "authorized"; then
    print_test 0 "Authentication required for protected routes"
else
    print_test 1 "Authentication required for protected routes"
fi
echo ""

# Test 12: Invalid Amount Validation
echo -e "${BLUE}📋 Test 12: Invalid Amount Validation${NC}"
INVALID_AMOUNT=$(curl -s -X POST ${API_URL}/wallet/deposit \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "invalid"
  }')

if echo "$INVALID_AMOUNT" | grep -q "must be a number"; then
    print_test 0 "Amount validation working"
else
    print_test 1 "Amount validation working"
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
    echo "1. Set user role to 'admin' in database"
    echo "2. Test admin approval workflow"
    echo "3. Test Paystack callback with real payment"
    echo "4. Test withdrawal approval and wallet debit"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
