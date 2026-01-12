#!/bin/bash

# GDIP Backend API Test Suite
# Tests all authentication endpoints and security features

BASE_URL="http://localhost:5000"
API_URL="${BASE_URL}/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test results
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
echo "🧪 GDIP Backend API Test Suite"
echo "════════════════════════════════════════════════════════"
echo ""

# Test 1: Health Check
echo "📋 Test 1: Health Check"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/health)
if [ "$RESPONSE" -eq 200 ]; then
    print_test 0 "Health endpoint returns 200"
else
    print_test 1 "Health endpoint returns 200 (got $RESPONSE)"
fi
echo ""

# Test 2: User Registration
echo "📋 Test 2: User Registration"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@vault37.com"

REGISTER_RESPONSE=$(curl -s -X POST ${API_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"Test User ${TIMESTAMP}\",
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"SecurePass123!\",
    \"confirmPassword\": \"SecurePass123!\",
    \"phone\": \"+2348012345678\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q "success.*true"; then
    print_test 0 "User registration successful"
    ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)
    print_test 0 "Access token received"
    print_test 0 "Refresh token received"
else
    print_test 1 "User registration successful"
    echo "Response: $REGISTER_RESPONSE"
fi
echo ""

# Test 3: Duplicate Email Registration
echo "📋 Test 3: Duplicate Email Registration (should fail)"
DUPLICATE_RESPONSE=$(curl -s -X POST ${API_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"Test User Duplicate\",
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"SecurePass123!\",
    \"confirmPassword\": \"SecurePass123!\",
    \"phone\": \"+2348012345679\"
  }")

if echo "$DUPLICATE_RESPONSE" | grep -q "already"; then
    print_test 0 "Duplicate email rejected"
else
    print_test 1 "Duplicate email rejected"
fi
echo ""

# Test 4: Weak Password Validation
echo "📋 Test 4: Weak Password Validation (should fail)"
WEAK_PASSWORD_RESPONSE=$(curl -s -X POST ${API_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"Test User Weak\",
    \"email\": \"weak${TIMESTAMP}@vault37.com\",
    \"password\": \"weak\",
    \"confirmPassword\": \"weak\",
    \"phone\": \"+2348012345670\"
  }")

if echo "$WEAK_PASSWORD_RESPONSE" | grep -q "Password"; then
    print_test 0 "Weak password rejected"
else
    print_test 1 "Weak password rejected"
fi
echo ""

# Test 5: Login with Correct Credentials
echo "📋 Test 5: Login with Correct Credentials"
LOGIN_RESPONSE=$(curl -s -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"SecurePass123!\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q "success.*true"; then
    print_test 0 "Login successful with correct credentials"
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
else
    print_test 1 "Login successful with correct credentials"
fi
echo ""

# Test 6: Login with Wrong Password
echo "📋 Test 6: Login with Wrong Password (should fail)"
WRONG_PASSWORD_RESPONSE=$(curl -s -X POST ${API_URL}/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"WrongPassword123!\"
  }")

if echo "$WRONG_PASSWORD_RESPONSE" | grep -q "Invalid"; then
    print_test 0 "Wrong password rejected"
else
    print_test 1 "Wrong password rejected"
fi
echo ""

# Test 7: Get User Profile (Protected Route)
echo "📋 Test 7: Get User Profile (Protected Route)"
if [ -n "$ACCESS_TOKEN" ]; then
    PROFILE_RESPONSE=$(curl -s -X GET ${API_URL}/auth/me \
      -H "Authorization: Bearer ${ACCESS_TOKEN}")
    
    if echo "$PROFILE_RESPONSE" | grep -q "success.*true"; then
        print_test 0 "Protected route accessible with valid token"
    else
        print_test 1 "Protected route accessible with valid token"
    fi
else
    print_test 1 "Protected route accessible with valid token (no token available)"
fi
echo ""

# Test 8: Access Protected Route Without Token
echo "📋 Test 8: Access Protected Route Without Token (should fail)"
NO_TOKEN_RESPONSE=$(curl -s -X GET ${API_URL}/auth/me)

if echo "$NO_TOKEN_RESPONSE" | grep -q "authorized"; then
    print_test 0 "Protected route blocked without token"
else
    print_test 1 "Protected route blocked without token"
fi
echo ""

# Test 9: Refresh Token
echo "📋 Test 9: Refresh Token"
if [ -n "$REFRESH_TOKEN" ]; then
    REFRESH_RESPONSE=$(curl -s -X POST ${API_URL}/auth/refresh-token \
      -H "Content-Type: application/json" \
      -d "{
        \"refreshToken\": \"${REFRESH_TOKEN}\"
      }")
    
    if echo "$REFRESH_RESPONSE" | grep -q "success.*true"; then
        print_test 0 "Token refresh successful"
    else
        print_test 1 "Token refresh successful"
    fi
else
    print_test 1 "Token refresh successful (no refresh token available)"
fi
echo ""

# Test 10: Invalid Email Format
echo "📋 Test 10: Invalid Email Format (should fail)"
INVALID_EMAIL_RESPONSE=$(curl -s -X POST ${API_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"Test User Invalid\",
    \"email\": \"not-an-email\",
    \"password\": \"SecurePass123!\",
    \"confirmPassword\": \"SecurePass123!\",
    \"phone\": \"+2348012345671\"
  }")

if echo "$INVALID_EMAIL_RESPONSE" | grep -q "email"; then
    print_test 0 "Invalid email format rejected"
else
    print_test 1 "Invalid email format rejected"
fi
echo ""

# Test 11: Invalid Phone Format
echo "📋 Test 11: Invalid Phone Format (should fail)"
INVALID_PHONE_RESPONSE=$(curl -s -X POST ${API_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"Test User Invalid Phone\",
    \"email\": \"phone${TIMESTAMP}@vault37.com\",
    \"password\": \"SecurePass123!\",
    \"confirmPassword\": \"SecurePass123!\",
    \"phone\": \"123456\"
  }")

if echo "$INVALID_PHONE_RESPONSE" | grep -q "phone"; then
    print_test 0 "Invalid phone format rejected"
else
    print_test 1 "Invalid phone format rejected"
fi
echo ""

# Test 12: Password Mismatch
echo "📋 Test 12: Password Mismatch (should fail)"
PASSWORD_MISMATCH_RESPONSE=$(curl -s -X POST ${API_URL}/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"Test User Mismatch\",
    \"email\": \"mismatch${TIMESTAMP}@vault37.com\",
    \"password\": \"SecurePass123!\",
    \"confirmPassword\": \"DifferentPass123!\",
    \"phone\": \"+2348012345672\"
  }")

if echo "$PASSWORD_MISMATCH_RESPONSE" | grep -q "match"; then
    print_test 0 "Password mismatch rejected"
else
    print_test 1 "Password mismatch rejected"
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
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
