# VAULT37 GDIP Backend API

Secure, optimized backend API for the GDIP (Global Digital Investment Product) platform - a commodity-backed digital asset management system.

## 🚀 Features

- **Enterprise-Grade Security**
  - Helmet.js for HTTP security headers
  - CORS with whitelist configuration
  - Rate limiting (5 login attempts per 15 minutes)
  - Account lockout after failed attempts
  - NoSQL injection prevention
  - XSS protection
  - HTTP Parameter Pollution prevention
  - Password hashing with bcrypt (12 rounds)
  - JWT authentication with refresh tokens

- **Performance Optimized**
  - MongoDB connection pooling
  - Response compression
  - Efficient database indexes
  - Lean queries
  - Request size limits

- **Production Ready**
  - Graceful shutdown handling
  - Comprehensive error handling
  - Audit logging
  - Environment-based configuration
  - Input validation with Joi

## 📋 Prerequisites

- Node.js v18 or higher
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd /Users/harz/Documents/backUps/Vault37/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the following:
   - `JWT_ACCESS_SECRET` - Strong secret for access tokens
   - `JWT_REFRESH_SECRET` - Strong secret for refresh tokens
   - `MONGODB_URI` - Your MongoDB connection string

## 🚦 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh-token` | Refresh access token | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password | No |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |

## 🔐 Security Features

### Rate Limiting
- **Global**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes
- **Account lockout**: 5 failed login attempts = 15-minute lockout

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

### JWT Tokens
- **Access Token**: 15-minute expiry
- **Refresh Token**: 7-day expiry
- Tokens include user ID, email, and role

## 🗄️ Database Models

### User
- Full name, email, password (hashed)
- Phone number (Nigerian format)
- Role (user, admin, auditor, accountant)
- KYC status and documents
- Mode (TPM/EPS)
- Referral system
- Login attempt tracking
- Account lockout mechanism

### Wallet
- User reference
- Multiple balance types (balance, earnings, locked)
- Ledger system for transaction history
- Bank account storage

### Transaction
- User and wallet references
- Type, amount, status
- Unique reference generation
- Approval workflow
- Metadata storage

## 📝 Environment Variables

See `.env.example` for all available configuration options.

### Required Variables
```env
MONGODB_URI=mongodb://localhost:27017/vault37_db
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
```

### Optional Variables
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
```

## 🧪 Testing with Postman

1. **Register a new user**
   ```
   POST http://localhost:5000/api/auth/register
   Content-Type: application/json

   {
     "fullName": "John Doe",
     "email": "john@example.com",
     "password": "SecurePass123!",
     "confirmPassword": "SecurePass123!",
     "phone": "+2348012345678"
   }
   ```

2. **Login**
   ```
   POST http://localhost:5000/api/auth/login
   Content-Type: application/json

   {
     "email": "john@example.com",
     "password": "SecurePass123!"
   }
   ```

3. **Access protected route**
   ```
   GET http://localhost:5000/api/auth/me
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```

## 📂 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # MongoDB connection
│   │   └── env.js           # Environment config
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   ├── auth.js          # JWT verification
│   │   ├── errorHandler.js  # Global error handler
│   │   ├── security.js      # Security middleware
│   │   └── validate.js      # Joi validation
│   ├── models/
│   │   ├── User.js
│   │   ├── Wallet.js
│   │   └── Transaction.js
│   ├── routes/
│   │   └── authRoutes.js
│   ├── utils/
│   │   ├── AppError.js      # Custom error class
│   │   ├── asyncHandler.js  # Async wrapper
│   │   └── tokenManager.js  # JWT utilities
│   ├── validators/
│   │   └── authValidators.js
│   ├── app.js               # Express app config
│   └── server.js            # Server entry point
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔧 Development

### Code Style
- ES6+ modules
- Async/await for asynchronous operations
- Descriptive variable and function names
- Comprehensive error handling

### Best Practices
- All passwords hashed before storage
- Sensitive data excluded from responses
- Input validation on all endpoints
- Proper HTTP status codes
- Detailed error messages (dev) vs generic (prod)

## 🚨 Error Handling

The API uses a centralized error handling system:

- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/expired token)
- **403**: Forbidden (locked account, insufficient permissions)
- **404**: Not Found
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error

## 📊 Monitoring

Check server health:
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-01-09T21:45:00.000Z",
  "environment": "development"
}
```

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📄 License

UNLICENSED - Private and Confidential

---

**Built with security and performance in mind** 🔒⚡
