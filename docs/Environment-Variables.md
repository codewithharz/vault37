# GDIP Backend - Environment Variables

## Required Variables

These variables **must** be set for the application to run:

### Database
```env
MONGODB_URI=mongodb://localhost:27017/vault37_db
```
- **Description**: MongoDB connection string
- **Development**: `mongodb://localhost:27017/vault37_db`
- **Production**: MongoDB Atlas connection string
- **Format**: `mongodb://[username:password@]host[:port]/database[?options]`

### JWT Secrets
```env
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
```
- **Description**: Secret keys for signing JWT tokens
- **Requirements**: 
  - Minimum 32 characters
  - Use different secrets for access and refresh tokens
  - Use cryptographically random strings
- **Generate**: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **⚠️ CRITICAL**: Never use default/example secrets in production

---

## Optional Variables

These variables have defaults but can be customized:

### Server Configuration
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
```

#### NODE_ENV
- **Description**: Application environment
- **Values**: `development`, `production`, `test`
- **Default**: `development`
- **Impact**: 
  - Development: Detailed error messages, stack traces
  - Production: Generic error messages, no stack traces

#### PORT
- **Description**: Server port number
- **Default**: `5000`
- **Range**: 1024-65535
- **Note**: Ports below 1024 require root privileges

#### CLIENT_URL
- **Description**: Frontend application URL (for CORS)
- **Default**: `http://localhost:3000`
- **Production**: Your deployed frontend URL
- **Multiple**: Add to CORS whitelist in `src/middleware/security.js`

---

### JWT Configuration
```env
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

#### JWT_ACCESS_EXPIRE
- **Description**: Access token expiration time
- **Default**: `15m` (15 minutes)
- **Format**: Time string (e.g., `60`, `2h`, `7d`)
- **Recommendation**: 15-30 minutes for security

#### JWT_REFRESH_EXPIRE
- **Description**: Refresh token expiration time
- **Default**: `7d` (7 days)
- **Format**: Time string (e.g., `60`, `2h`, `7d`)
- **Recommendation**: 7-30 days

---

### Security Configuration
```env
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900000
```

#### BCRYPT_ROUNDS
- **Description**: Number of bcrypt hashing rounds
- **Default**: `12`
- **Range**: 10-14
- **Impact**: Higher = more secure but slower
- **Note**: Each increment doubles processing time

#### MAX_LOGIN_ATTEMPTS
- **Description**: Failed login attempts before lockout
- **Default**: `5`
- **Recommendation**: 3-5 attempts

#### LOCKOUT_DURATION
- **Description**: Account lockout duration in milliseconds
- **Default**: `900000` (15 minutes)
- **Format**: Milliseconds
- **Examples**: 
  - 5 minutes: `300000`
  - 15 minutes: `900000`
  - 30 minutes: `1800000`

---

### Rate Limiting
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
```

#### RATE_LIMIT_WINDOW_MS
- **Description**: Time window for rate limiting in milliseconds
- **Default**: `900000` (15 minutes)
- **Format**: Milliseconds

#### RATE_LIMIT_MAX_REQUESTS
- **Description**: Maximum requests per window (global)
- **Default**: `100`
- **Recommendation**: 50-200 depending on expected traffic

#### AUTH_RATE_LIMIT_MAX
- **Description**: Maximum auth requests per window
- **Default**: `5`
- **Recommendation**: 3-5 to prevent brute force

---

### Email Configuration (Optional - For Future Use)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@vault37.com
```

#### SMTP_HOST
- **Description**: SMTP server hostname
- **Examples**: 
  - Gmail: `smtp.gmail.com`
  - SendGrid: `smtp.sendgrid.net`
  - Mailgun: `smtp.mailgun.org`

#### SMTP_PORT
- **Description**: SMTP server port
- **Default**: `587`
- **Common Ports**:
  - 587: TLS (recommended)
  - 465: SSL
  - 25: Unencrypted (not recommended)

#### SMTP_USER
- **Description**: SMTP authentication username
- **Format**: Usually your email address

#### SMTP_PASS
- **Description**: SMTP authentication password
- **Gmail**: Use App Password, not account password
- **Security**: Never commit to version control

#### EMAIL_FROM
- **Description**: Default sender email address
- **Format**: `name@domain.com` or `"Name" <name@domain.com>`

---

### SMS Configuration (Optional - For Future Use)
```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

#### TWILIO_ACCOUNT_SID
- **Description**: Twilio account identifier
- **Source**: Twilio Console

#### TWILIO_AUTH_TOKEN
- **Description**: Twilio authentication token
- **Source**: Twilio Console
- **Security**: Never commit to version control

#### TWILIO_PHONE_NUMBER
- **Description**: Twilio phone number for sending SMS
- **Format**: E.164 format (e.g., `+1234567890`)

---

### File Upload Configuration (Optional - For Future Use)
```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

#### CLOUDINARY_CLOUD_NAME
- **Description**: Cloudinary cloud name
- **Source**: Cloudinary Dashboard

#### CLOUDINARY_API_KEY
- **Description**: Cloudinary API key
- **Source**: Cloudinary Dashboard

#### CLOUDINARY_API_SECRET
- **Description**: Cloudinary API secret
- **Source**: Cloudinary Dashboard
- **Security**: Never commit to version control

---

## Environment Setup

### Development
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update required variables:
   - `MONGODB_URI`: Your local MongoDB or Atlas connection
   - `JWT_ACCESS_SECRET`: Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `JWT_REFRESH_SECRET`: Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

3. Optionally customize other variables

### Production

1. **Never commit `.env` file**
   - Ensure `.env` is in `.gitignore`
   - Use environment variables in hosting platform

2. **Set environment variables in hosting platform**:
   - **Render**: Dashboard → Environment → Environment Variables
   - **Railway**: Dashboard → Variables
   - **Heroku**: Dashboard → Settings → Config Vars
   - **DigitalOcean**: App Platform → Settings → Environment Variables

3. **Generate strong secrets**:
   ```bash
   # Generate JWT secrets
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **Use MongoDB Atlas**:
   - Create cluster at mongodb.com
   - Whitelist IP addresses
   - Create database user
   - Get connection string

---

## Security Best Practices

### ✅ DO
- Use different secrets for development and production
- Generate cryptographically random secrets
- Use environment variables for all secrets
- Rotate secrets periodically
- Use MongoDB Atlas with IP whitelist in production
- Enable 2FA on third-party services (Twilio, Cloudinary)

### ❌ DON'T
- Commit `.env` file to version control
- Use default/example secrets in production
- Share secrets in plain text (email, Slack, etc.)
- Use the same secret for access and refresh tokens
- Hardcode secrets in source code

---

## Validation

The application validates required environment variables on startup:

```javascript
// Required in production
if (config.nodeEnv === 'production') {
  const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI'];
  const missing = required.filter((key) => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

---

## Example Configurations

### Local Development
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/vault37_db
JWT_ACCESS_SECRET=dev-access-secret-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-change-in-production
```

### Production (Render/Railway)
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://vault37.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/vault37_db?retryWrites=true&w=majority
JWT_ACCESS_SECRET=<64-char-random-hex>
JWT_REFRESH_SECRET=<64-char-random-hex>
BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
```

---

## Troubleshooting

### Error: Missing required environment variables
- **Cause**: Required variables not set
- **Solution**: Set `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `MONGODB_URI`

### Error: MongoDB connection failed
- **Cause**: Invalid `MONGODB_URI` or MongoDB not running
- **Solution**: 
  - Check MongoDB is running: `mongod --version`
  - Verify connection string format
  - Check network connectivity

### Error: Invalid token
- **Cause**: JWT secret changed or token expired
- **Solution**: 
  - Login again to get new token
  - Don't change JWT secrets in production without migration plan

---

**Last Updated**: January 9, 2026  
**Version**: 1.0.0
