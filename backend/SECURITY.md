# VAULT37 GDIP - Security Documentation

## 🔒 Security Measures Implemented

### 1. Authentication & Authorization

#### Password Security
- **Hashing Algorithm**: bcrypt with 12 rounds (configurable)
- **Password Requirements**:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (@$!%*?&)
- **Storage**: Passwords never stored in plain text
- **Response**: Passwords excluded from all API responses

#### Account Lockout
- **Trigger**: 5 consecutive failed login attempts
- **Duration**: 15 minutes (900,000 ms)
- **Reset**: Automatic after lockout period or successful login
- **Tracking**: Login attempts stored per user

#### JWT Tokens
- **Access Token**:
  - Expiry: 15 minutes
  - Payload: user ID, email, role
  - Secret: Separate from refresh token
- **Refresh Token**:
  - Expiry: 7 days
  - Used to generate new access tokens
  - Secret: Separate from access token
- **Rotation**: New token pair generated on refresh
- **Verification**: Every protected route validates token

#### Role-Based Access Control (RBAC)
- **Roles**: user, admin, auditor, accountant
- **Middleware**: `authorize(...roles)` restricts access
- **Default**: New users assigned 'user' role

---

### 2. HTTP Security Headers (Helmet)

Helmet sets the following security headers:

| Header | Purpose |
|--------|---------|
| Content-Security-Policy | Prevents XSS attacks |
| Strict-Transport-Security | Forces HTTPS |
| X-Content-Type-Options | Prevents MIME sniffing |
| X-Frame-Options | Prevents clickjacking |
| X-XSS-Protection | Browser XSS filter |
| X-DNS-Prefetch-Control | Controls DNS prefetching |
| Expect-CT | Certificate Transparency |
| Referrer-Policy | Controls referrer information |

**Configuration**:
```javascript
{
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
}
```

---

### 3. Cross-Origin Resource Sharing (CORS)

#### Configuration
- **Allowed Origins**: Whitelist-based
  - Development: `http://localhost:3000`, `http://localhost:3001`
  - Production: Configured via `CLIENT_URL` environment variable
- **Credentials**: Enabled (allows cookies)
- **Methods**: All standard HTTP methods
- **Rejection**: Requests from unauthorized origins blocked

#### Implementation
```javascript
origin: (origin, callback) => {
  const allowedOrigins = [
    config.clientUrl,
    'http://localhost:3000',
    'http://localhost:3001',
  ];
  
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
}
```

---

### 4. Rate Limiting

#### Global Rate Limit
- **Window**: 15 minutes
- **Max Requests**: 100
- **Scope**: All API endpoints
- **Tracking**: By IP address
- **Response**: 429 Too Many Requests

#### Authentication Rate Limit
- **Window**: 15 minutes
- **Max Requests**: 5
- **Scope**: `/api/auth/register`, `/api/auth/login`, `/api/auth/forgot-password`, `/api/auth/reset-password`
- **Skip**: Successful requests don't count
- **Purpose**: Prevent brute force attacks

#### API Rate Limit
- **Window**: 15 minutes
- **Max Requests**: 50
- **Scope**: General API endpoints
- **Purpose**: Prevent API abuse

---

### 5. Data Sanitization

#### NoSQL Injection Prevention
- **Package**: `express-mongo-sanitize`
- **Method**: Removes `$` and `.` from user input
- **Replacement**: `_` character
- **Logging**: Warns when injection attempt detected

**Example**:
```javascript
// Malicious input
{ "email": { "$gt": "" } }

// Sanitized
{ "email": { "_gt": "" } }
```

#### XSS Attack Prevention
- **Method**: Escapes HTML special characters
- **Characters**: `<` → `&lt;`, `>` → `&gt;`
- **Scope**: All string inputs in request body
- **Additional**: Helmet's XSS filter

#### HTTP Parameter Pollution (HPP)
- **Package**: `hpp`
- **Method**: Prevents duplicate parameters
- **Whitelist**: `sort`, `fields`, `page`, `limit`
- **Purpose**: Prevents query manipulation

---

### 6. Input Validation

#### Joi Schema Validation
- **All endpoints**: Validated before processing
- **Validation**: Body, query, params
- **Error handling**: Detailed messages returned
- **Unknown fields**: Stripped automatically

**Example Schema**:
```javascript
{
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/regex/).required(),
  phone: Joi.string().pattern(/^(\+234|0)[789][01]\d{8}$/).required()
}
```

#### Field-Level Validation
- **Email**: Must be valid format, lowercase
- **Phone**: Nigerian format (+234XXXXXXXXXX or 0XXXXXXXXXXX)
- **Password**: Strength requirements enforced
- **Names**: Min/max length, trimmed

---

### 7. Database Security

#### Connection Security
- **URI**: Stored in environment variables
- **Credentials**: Never hardcoded
- **Connection**: Encrypted (if MongoDB Atlas)

#### Model-Level Security
- **Password field**: `select: false` by default
- **Sensitive data**: Excluded from responses
- **Indexes**: Unique constraints on email, referralCode
- **Validation**: Mongoose schema validation

#### Query Security
- **Sanitization**: All inputs sanitized before queries
- **Injection**: Prevented by Mongoose and sanitization
- **Lean queries**: Minimize data exposure

---

### 8. Error Handling

#### Production vs Development
- **Development**: Full error details + stack trace
- **Production**: Generic error messages only
- **Logging**: All errors logged server-side

#### Error Types
- **Operational**: Expected errors (validation, auth)
- **Programming**: Unexpected errors (bugs)
- **Handling**: Different strategies for each

#### Security Considerations
- **No data leakage**: Sensitive info never in errors
- **Generic messages**: Don't reveal system details
- **Status codes**: Appropriate HTTP codes

---

### 9. Environment Variables

#### Sensitive Data
All secrets stored in `.env` file:
- JWT secrets
- Database credentials
- API keys
- SMTP credentials

#### Git Protection
- `.env` in `.gitignore`
- `.env.example` provided as template
- No secrets committed to repository

#### Validation
- Required variables checked on startup
- Type validation for numbers
- Defaults for optional variables

---

### 10. Audit & Monitoring

#### Logging
- **Package**: `morgan`
- **Development**: Detailed request logs
- **Production**: Combined format
- **Errors**: Separate error log file

#### Future Enhancements
- **Audit Log Model**: Track all sensitive operations
- **User actions**: Login, logout, data changes
- **Admin actions**: Approvals, rejections
- **Immutable**: Logs cannot be modified

---

## 🚨 Security Best Practices

### For Developers

1. **Never commit secrets**
   - Use `.env` for all sensitive data
   - Check `.gitignore` includes `.env`

2. **Always validate input**
   - Use Joi schemas for all endpoints
   - Sanitize before database operations

3. **Use HTTPS in production**
   - Configure SSL/TLS certificates
   - Enable HSTS header

4. **Keep dependencies updated**
   - Run `npm audit` regularly
   - Update packages with security patches

5. **Follow principle of least privilege**
   - Grant minimum necessary permissions
   - Use RBAC for access control

### For Deployment

1. **Environment Variables**
   - Generate strong JWT secrets (min 32 characters)
   - Use different secrets for access and refresh tokens
   - Never use default/example secrets

2. **Database**
   - Use MongoDB Atlas with IP whitelist
   - Enable authentication
   - Use strong passwords

3. **Server**
   - Enable firewall
   - Disable unnecessary services
   - Keep OS and software updated

4. **Monitoring**
   - Set up error tracking (e.g., Sentry)
   - Monitor failed login attempts
   - Alert on suspicious activity

---

## 🔍 Security Testing

### Manual Tests

1. **Authentication**
   - ✅ Register with weak password → Rejected
   - ✅ Login with wrong password 5 times → Account locked
   - ✅ Use expired token → 401 Unauthorized
   - ✅ Access protected route without token → 401

2. **Rate Limiting**
   - ✅ Make 6 rapid login attempts → 429 Too Many Requests
   - ✅ Make 101 API requests → 429 Too Many Requests

3. **Input Validation**
   - ✅ Send invalid email → 400 Bad Request
   - ✅ Send XSS payload → Sanitized
   - ✅ Send NoSQL injection → Sanitized

4. **CORS**
   - ✅ Request from unauthorized origin → Blocked
   - ✅ Request from allowed origin → Allowed

### Automated Tests (Future)

- Unit tests for security functions
- Integration tests for auth flow
- Penetration testing
- Security audits

---

## 📞 Vulnerability Reporting

If you discover a security vulnerability:

1. **Do NOT** create a public GitHub issue
2. **Contact**: security@vault37.com (when available)
3. **Provide**: Detailed description and reproduction steps
4. **Wait**: For acknowledgment and fix

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet Documentation](https://helmetjs.github.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Last Updated**: January 9, 2026  
**Version**: 1.0.0  
**Status**: Production Ready 🔒
