# GDIP Backend API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.vault37.com/api (when deployed)
```

## Authentication
Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 📊 Trade Cycle Overview

### What is a Trade Cycle?

A **trade cycle** is a 37-day automated trading period that generates fixed returns on TPIA investments.

### Key Metrics

| Metric | Value |
|--------|-------|
| Investment Amount | ₦1,000,000 |
| Profit per Cycle | ₦50,000 |
| Return Rate | 5% per cycle |
| Cycle Duration | 37 days |
| Total Cycles | 24 |
| Total Investment Period | ~2.4 years (888 days) |

### Cycle Start Modes

**CLUSTER Mode (Default):**
- Waits for GDC to reach 10/10 TPIAs
- All TPIAs start together
- Synchronized trading

**IMMEDIATE Mode:**
- Starts immediately upon approval
- Independent cycle tracking
- No waiting period

### Returns Example

**TPM Mode (Compounding):**
```
Cycle 1:  ₦1,050,000 (₦1M + ₦50k)
Cycle 2:  ₦1,100,000 (₦1.05M + ₦50k)
...
Cycle 24: ₦2,200,000 (120% total ROI)
```

**EPS Mode (Payout):**
```
Each Cycle: ₦50,000 paid to wallet
After 24 Cycles: ₦1,200,000 total profit + ₦1,000,000 principal
```

---

## 📋 API Endpoints

### Health Check

#### GET /health
Check server status (no authentication required)

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-01-09T21:45:00.000Z",
  "environment": "development"
}
```

---

## 🔐 Authentication Endpoints

### POST /api/auth/register
Register a new user account

**Rate Limit:** 5 requests per 15 minutes

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "phone": "+2348012345678",
  "referralCode": "VAULT37ABC123" // Optional
}
```

**Validation Rules:**
- `fullName`: 2-100 characters
- `email`: Valid email format
- `password`: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- `confirmPassword`: Must match password
- `phone`: Nigerian format (+234XXXXXXXXXX or 0XXXXXXXXXXX)
- `referralCode`: Optional, must be valid if provided

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+2348012345678",
      "role": "user",
      "kycStatus": "pending",
      "mode": "TPM",
      "referralCode": "VAULT37XYZ789"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error Responses:**
- `400`: Validation error or email already exists
- `429`: Too many requests

---

### POST /api/auth/login
Login with email and password

**Rate Limit:** 5 requests per 15 minutes

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+2348012345678",
      "role": "user",
      "kycStatus": "pending",
      "mode": "TPM",
      "referralCode": "VAULT37XYZ789"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error Responses:**
- `401`: Invalid email or password (with attempts remaining)
- `403`: Account locked (after 5 failed attempts)
- `429`: Too many requests

**Account Lockout:**
- Locked for 15 minutes after 5 failed attempts
- Attempts reset on successful login

---

### User Wallet Endpoints

#### [GET] [/api/wallet](file:///api/wallet)
Get current user's wallet balance, bank accounts, and recent ledger entries.

#### [GET] [/api/users/portfolio](file:///api/users/portfolio)
Get consolidated view of user investment performance, total invested, current value, and diversification.

#### [GET] [/api/wallet/transactions](file:///api/wallet/transactions)
Get transaction history with pagination and filtering.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `type`: Filter by type (deposit, withdrawal, tpia_purchase, maturity_return)
- `status`: Filter by status (pending, completed, failed)

---

### TPIA (Trade Product Investment Asset) Endpoints

#### POST /api/tpia/purchase
Purchase a new TPIA (₦100,000). Requires available balance.

**Authentication:** Required  
**Rate Limit:** 1000 requests per 10 minutes

**Request Body:**
```json
{
  "mode": "TPM",  // Optional: "TPM" or "EPS" (defaults to user's mode)
  "commodityId": "507f1f77bcf86cd799439011",  // Optional: specific commodity
  "cycleStartMode": "IMMEDIATE"  // Optional: "CLUSTER" (default) or "IMMEDIATE"
}
```

**Cycle Start Modes:**
- **CLUSTER** (Default): Wait for GDC to reach 10/10 TPIAs before starting the 37-day cycle
  - Traditional synchronized trading
  - All TPIAs in cluster start together
  - Recommended for users who prefer group dynamics

- **IMMEDIATE**: Start 37-day cycle immediately upon approval
  - No waiting for cluster to fill
  - Independent cycle tracking
  - Faster time-to-profit
  - Ideal for early investors

**Success Response (201):**
```json
{
  "success": true,
  "message": "TPIA-1 purchase submitted successfully. Awaiting admin approval (auto-approves in 60 minutes)",
  "data": {
    "tpia": {
      "id": "507f1f77bcf86cd799439011",
      "tpiaNumber": 1,
      "gdcNumber": 10,
      "amount": 1000000,
      "profitAmount": 50000,
      "status": "pending_approval",
      "purchaseDate": "2026-01-10T10:00:00.000Z",
      "userMode": "TPM",
      "cycleStartMode": "IMMEDIATE",
      "currentCycle": 0,
      "totalCycles": 24
    },
    "transaction": {
      "id": "507f1f77bcf86cd799439012",
      "reference": "TXN-1736508000000-ABC123",
      "amount": 100000,
      "status": "pending"
    }
  }
}
```

**Error Responses:**
- `400`: Insufficient balance or validation error
- `401`: Not authenticated
- `403`: KYC not verified
- `429`: Too many requests

#### GET /api/tpia/my-tpias
Get current user's TPIAs and investment statistics.

#### GET /api/tpia/:id
Get detailed information about a specific TPIA.

#### POST /api/tpia/:id/withdraw
Request to exit the investment at the next valid Exit Window (Extended Phase only).

**Conditions:**
- TPIA must be in `EXTENDED` phase (Cycles 13-23).
- An Exit Window must be currently open (Cycles 15, 18, 21).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Withdrawal request submitted successfully. Penalties will apply.",
  "data": {
    "tpiaId": "507f1f77bcf86cd799439011",
    "status": "active",
    "withdrawalRequested": true,
    "currentCycle": 15,
    "penaltyRate": 0.40,
    "estimatedRefund": 600000
  }
}
```

---

### GDC (Global Digital Commodity) Endpoints

#### [GET] [/api/gdc](file:///api/gdc)
Get list of all GDCs (GDC-10, GDC-20, etc.) with their fill status.

#### [GET] [/api/gdc/filling](file:///api/gdc/filling)
Get GDCs currently accepting new TPIAs.

#### [GET] [/api/gdc/:number](file:///api/gdc/:number)
Get detailed information about a specific GDC cluster by its number.

---

### � Commodity Endpoints

#### [GET] [/api/commodities](file:///api/commodities)
List all active commodities.

#### [GET] [/api/commodities/:id/history](file:///api/commodities/:id/history)
Retrieve historical NAV (Net Asset Value) price points for charting.

---

### �🔔 Notifications

#### [GET] [/api/notifications](file:///api/notifications)
Retrieve current user's notifications. Supports pagination.
- **Query Params**: `page`, `limit`

#### [PATCH] [/api/notifications/:id/read](file:///api/notifications/:id/read)
Mark a specific notification as read.

#### [POST] [/api/notifications/read-all](file:///api/notifications/read-all)
Mark all user notifications as read.

---

### 🛡️ KYC (Know Your Customer)

#### [POST] [/api/users/kyc](file:///api/users/kyc)
Submit identity documents and address for verification.
- **Required**: `idType`, `idNumber`, `documentUrl`, `address`, `dateOfBirth`

---

### 📊 Admin Analytics & Reports

#### [GET] [/api/admin/dashboard](file:///api/admin/dashboard)
Get high-level system statistics (Total Users, TVL, Pending Actions).

#### [GET] [/api/admin/reports/financial](file:///api/admin/reports/financial)
Generate a financial snapshot including revenue and expected payouts.
- **Query Params**: `startDate`, `endDate`

#### [PATCH] [/api/admin/users/:id/kyc](file:///api/admin/users/:id/kyc)
Review and update a user's KYC status (`verified` or `rejected`).

---

### Admin Management

#### [PATCH] [/api/admin/deposits/:id/approve](file:///api/admin/deposits/:id/approve)
Approve a pending deposit.

#### [PATCH] [/api/admin/withdrawals/:id/approve](file:///api/admin/withdrawals/:id/approve)
Approve a pending withdrawal.

#### [GET] [/api/admin/tpia/pending](file:///api/admin/tpia/pending)
List all TPIAs awaiting approval.

#### [PATCH] [/api/admin/tpia/:id/approve](file:///api/admin/tpia/:id/approve)
Approve a pending TPIA and start the 37-day cycle.

#### [PATCH] [/api/admin/tpia/:id/reject](file:///api/admin/tpia/:id/reject)
Reject a pending TPIA and refund the user's balance.

---

### POST /api/auth/logout
Logout current user

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Note:** Client should remove tokens from storage

---

### GET /api/auth/me
Get current user profile

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phone": "+2348012345678",
      "role": "user",
      "kycStatus": "pending",
      "mode": "TPM",
      "referralCode": "VAULT37XYZ789",
      "createdAt": "2026-01-09T20:00:00.000Z",
      "wallet": {
        "balance": 0,
        "earningsBalance": 0,
        "lockedBalance": 0,
        "availableBalance": 0,
        "totalBalance": 0
      }
    }
  }
}
```

**Error Responses:**
- `401`: Not authorized (invalid/expired token)

---

### POST /api/auth/forgot-password
Request password reset (placeholder)

**Rate Limit:** 5 requests per 15 minutes

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent"
}
```

**Note:** Always returns success for security (doesn't reveal if email exists)

---

### POST /api/auth/reset-password
Reset password with token (placeholder)

**Rate Limit:** 5 requests per 15 minutes

**Request Body:**
```json
{
  "token": "reset-token-here",
  "password": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset functionality will be available soon"
}
```

---

## 🔒 Security Features

### Rate Limiting
- **Global**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes
- **Response**: `429 Too Many Requests`

### Account Lockout
- **Trigger**: 5 failed login attempts
- **Duration**: 15 minutes
- **Reset**: Automatic after duration or successful login

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

### Token Expiry
- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

---

## 📊 Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Validation Error
```json
{
  "success": false,
  "error": "\"email\" must be a valid email, \"password\" is required"
}
```

---

## 🚨 HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, POST, PUT, DELETE |
| 201 | Created | Successful resource creation (register) |
| 400 | Bad Request | Validation errors, invalid input |
| 401 | Unauthorized | Missing/invalid/expired token |
| 403 | Forbidden | Account locked, insufficient permissions |
| 404 | Not Found | Resource not found, invalid endpoint |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |

---

## 🧪 Testing with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "phone": "+2348012345678"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Profile
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## 📱 iOS Integration Example

### Swift URLSession
```swift
func register(fullName: String, email: String, password: String, phone: String) async throws -> AuthResponse {
    let url = URL(string: "http://localhost:5000/api/auth/register")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let body: [String: Any] = [
        "fullName": fullName,
        "email": email,
        "password": password,
        "confirmPassword": password,
        "phone": phone
    ]
    
    request.httpBody = try JSONSerialization.data(withJSONObject: body)
    
    let (data, response) = try await URLSession.shared.data(for: request)
    
    guard let httpResponse = response as? HTTPURLResponse,
          httpResponse.statusCode == 201 else {
        throw APIError.invalidResponse
    }
    
    return try JSONDecoder().decode(AuthResponse.self, from: data)
}
```

### Storing Tokens
```swift
// Store in Keychain (recommended)
KeychainHelper.save(accessToken, for: "accessToken")
KeychainHelper.save(refreshToken, for: "refreshToken")

// Or UserDefaults (less secure)
UserDefaults.standard.set(accessToken, forKey: "accessToken")
```

### Authenticated Requests
```swift
func getProfile(accessToken: String) async throws -> User {
    let url = URL(string: "http://localhost:5000/api/auth/me")!
    var request = URLRequest(url: url)
    request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
    
    let (data, response) = try await URLSession.shared.data(for: request)
    
    guard let httpResponse = response as? HTTPURLResponse,
          httpResponse.statusCode == 200 else {
        throw APIError.unauthorized
    }
    
    let result = try JSONDecoder().decode(ProfileResponse.self, from: data)
    return result.data.user
}
```

---

## 🌐 React/Web Integration Example

### Axios Setup
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh-token', {
            refreshToken,
          });
          localStorage.setItem('accessToken', data.data.tokens.accessToken);
          localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
          return api(error.config);
        } catch (err) {
          // Refresh failed, logout user
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Usage
```javascript
// Register
const register = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  localStorage.setItem('accessToken', data.data.tokens.accessToken);
  localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
  return data.data.user;
};

// Login
const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('accessToken', data.data.tokens.accessToken);
  localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
  return data.data.user;
};

// Get Profile
const getProfile = async () => {
  const { data } = await api.get('/auth/me');
  return data.data.user;
};
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- All monetary values will be in Naira (₦) when implemented
- Phone numbers must be Nigerian format
- Passwords are never returned in responses
- Tokens should be stored securely (Keychain on iOS, HttpOnly cookies on web)

---

**Last Updated**: January 10, 2026  
**Version**: 2.1.0  
**Phase**: 2 Week 3
