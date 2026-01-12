# GDIP - Complete Development Plan for AI

## 📋 **PROJECT OVERVIEW**

**Project Name:** GDIP (Global Digital Investment Product)  
**Classification:** Commodity-Backed Investment & Trading Platform (FinTech/WealthTech)  
**Tech Stack:** MERN Stack (MongoDB, Express.js, React, Node.js) + Tailwind CSS  
**Architecture:** Modular Monolith (upgradeable to microservices)

---

## 🎯 **SYSTEM SUMMARY**

GDIP is a commodity-backed digital asset management platform that enables users to invest in tokenized agricultural commodities through a structured, automated trading system.

### **Core Concepts:**

1. **TPIA (Tokenized Position Investment Asset)** - Digital units representing commodity ownership (₦1,000,000 each)
2. **GDC (Global Distribution Cluster)** - Groups of 10 TPIAs that trade together
3. **Trade Cycles** - 37-day automated trading periods with ~5% returns per cycle
4.### **Cycle Start Modes:**
   - **CLUSTER Mode:** Wait for GDC to fill (10/10) before starting cycles (synchronized trading)
   - **IMMEDIATE Mode:** Start 37-day cycle immediately upon approval (independent trading)

### **Flexible Exit Options:**
- **Core Phase (Cycles 1-12):** Investment is locked.
- **Extended Phase (Cycles 13-24):** Exit windows open every 3 cycles.
- **Tiered Penalties (Option C):**
  - **Cycle 15:** 40% Penalty (Returns 60%)
  - **Cycle 18:** 30% Penalty (Returns 70%)
  - **Cycle 21:** 20% Penalty (Returns 80%)
  - **Maturity:** 0% Penalty (Returns 100%)
5. **Insurance Layer** - Full asset protection via third-party insurance
6. **Dual Profit Modes:**
   - **TPM (Trade Profit Mode)** - Automatically compound earnings
   - **EPS (Earnings Payout System)** - Withdraw profits to wallet

---

## 💰 **TRADE CYCLE ECONOMICS**

### **What is a Trade Cycle?**

A **trade cycle** is a 37-day automated trading period where user investments generate returns through commodity trading activities.

### **Cycle Parameters:**

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Cycle Duration** | 37 days | Fixed period for each trading cycle |
| **Investment Amount** | ₦1,000,000 | Standard TPIA purchase price |
| **Profit per Cycle** | ₦50,000 | Fixed return per cycle |
| **Profit Rate** | 5% | Return on investment per cycle |
| **Total Cycles** | 24 (12 Core + 12 Extended) | Flexible lifecycle with exit options |
| **Total Duration** | 888 days | ~2.4 years (24 × 37 days) |
| **Core Phase** | 12 cycles | Mandatory lock-in period (~14.5 months) |
| **Extended Phase** | 12 cycles | Optional period with quarterly exit windows |

### **Returns Calculation:**

#### **Single Cycle Returns:**
```
Investment: ₦1,000,000
Profit: ₦50,000
Return Rate: 5% per cycle
Cycle Duration: 37 days
```

#### **TPM (Trade Profit Mode) - Compounding:**
```
Cycle 1:  ₦1,000,000 + ₦50,000 = ₦1,050,000
Cycle 2:  ₦1,050,000 + ₦50,000 = ₦1,100,000
Cycle 3:  ₦1,100,000 + ₦50,000 = ₦1,150,000
...
Cycle 24: ₦2,150,000 + ₦50,000 = ₦2,200,000

Total Value after 24 cycles: ₦2,200,000
Total Profit: ₦1,200,000 (120% ROI)
```

#### **EPS (Earnings Payout System) - Non-Compounding:**
```
Per Cycle Payout: ₦50,000
Total Cycles: 24
Total Profit: ₦1,200,000 (paid out incrementally)
Principal Returned: ₦1,000,000 (at maturity)
Total Return: ₦2,200,000 (120% ROI)
```

### **Cycle Start Modes:**

#### **CLUSTER Mode (Default):**
- Cycle starts when GDC reaches 10/10 TPIAs
- All TPIAs in the cluster begin trading together
- Synchronized 37-day countdown for all members
- Traditional group trading approach

#### **IMMEDIATE Mode:**
- Cycle starts immediately upon TPIA approval
- Independent 37-day countdown
- No waiting for cluster to fill
- Faster time-to-first-profit
- Ideal for early investors

### **Example Timeline:**

**CLUSTER Mode:**
```
Day 0:  Purchase TPIA
Day 1:  Admin approval (or auto-approval after 60 min)
Day ?:  Wait for 9 more TPIAs to join GDC
Day X:  GDC full (10/10) - Cycle 1 starts
Day X+37: Cycle 1 completes - Profit distributed
Day X+38: Cycle 2 starts automatically
...
Day X+851: Cycle 24 completes - Investment matures
```

**IMMEDIATE Mode:**
```
Day 0:  Purchase TPIA
Day 1:  Admin approval - Cycle 1 starts immediately
Day 38: Cycle 1 completes - Profit distributed
Day 39: Cycle 2 starts automatically
...
Day 852: Cycle 24 completes - Investment matures
```

---

## 🏗️ **SYSTEM ARCHITECTURE**

### **Backend Architecture (Modular Monolith)**

```
/backend
  /src
    /modules
      /auth          # Authentication & authorization
      /users         # User management & profiles
      /wallet        # Wallet, deposits, withdrawals
      /tpia          # TPIA creation & lifecycle
      /gdc           # Cluster management & allocation
      /trade         # Trade cycle engine
      /commodity     # Commodity types & NAV pricing
      /insurance     # Insurance policies & claims
      /admin         # Admin operations & controls
      /audit         # Immutable audit logging
      /notifications # Email/SMS notifications
    /core
      /database      # MongoDB connection & models
      /utils         # Helper functions
      /middleware    # Auth, validation, error handling
      /events        # Event emitter for inter-module communication
      /jobs          # Cron jobs & scheduled tasks
    /api
      /routes        # API route definitions
      /controllers   # Request handlers
      /validators    # Input validation schemas
  /config          # Environment configs
  /tests           # Unit & integration tests
```

### **Frontend Architecture**

```
/frontend
  /src
    /components
      /common       # Buttons, cards, modals
      /layout       # Navigation, header, footer
      /dashboard    # Dashboard widgets
      /tpia         # TPIA purchase flows
      /gdc          # Cluster visualizations
      /wallet       # Wallet management
      /admin        # Admin panel components
    /pages
      /Dashboard.jsx
      /BuyTPIA.jsx
      /GDCClusters.jsx
      /Wallet.jsx
      /Transactions.jsx
      /Profile.jsx
      /Admin.jsx
    /hooks          # Custom React hooks
    /services       # API service calls
    /context        # React context (auth, user)
    /utils          # Helper functions
    /assets         # Images, icons
```

---

## 📊 **DATABASE SCHEMA (MongoDB + Mongoose)**

### **1. Users Collection**

```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: Enum['user', 'admin', 'auditor', 'accountant'],
  kycStatus: Enum['pending', 'verified', 'rejected'],
  kycDocuments: {
    idType: String,
    idNumber: String,
    documentUrl: String
  },
  mode: Enum['TPM', 'EPS'],
  walletId: ObjectId (ref: Wallet),
  referralCode: String,
  referredBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### **2. Wallets Collection**

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  balance: Number (default: 0),
  earningsBalance: Number (default: 0),
  lockedBalance: Number (default: 0),
  ledger: [{
    type: Enum['deposit', 'withdrawal', 'tpia_purchase', 'profit', 'refund'],
    amount: Number,
    balance: Number,
    description: String,
    reference: String,
    status: Enum['pending', 'completed', 'failed'],
    createdAt: Date
  }],
  bankAccounts: [{
    bankName: String,
    accountNumber: String,
    accountName: String,
    isDefault: Boolean
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### **3. TPIAs Collection**

```javascript
{
  _id: ObjectId,
  tpiaNumber: String (unique, e.g., "TPIA-000012"),
  owner: ObjectId (ref: User),
  gdc: ObjectId (ref: GDC),
  commodity: ObjectId (ref: Commodity),
  baseAmount: Number (initial investment),
  currentValue: Number (base + compounded profits),
  insuredValue: Number,
  status: Enum['pending', 'active', 'cycling', 'matured'],
  cycleStartMode: Enum['CLUSTER', 'IMMEDIATE'] (default: 'CLUSTER'),
  currentCycle: Number (0-24, tracks current cycle progress),
  totalCycles: Number (default: 24),
  purchaseDate: Date,
  maturityDate: Date (next cycle due date),
  finalMaturityDate: Date (end of all 24 cycles),
  insurancePolicy: {
    policyNumber: String,
    insurer: String,
    certificateUrl: String,
    status: Enum['active', 'claimed', 'expired']
  },
  profitHistory: [{
    cycleId: ObjectId (ref: Cycle),
    cycleNumber: Number,
    profitAmount: Number,
    appliedMode: Enum['TPM', 'EPS'],
    date: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### **4. GDC Collection**

```javascript
{
  _id: ObjectId,
  gdcCode: String (unique, e.g., "GDC-10"),
  commodity: ObjectId (ref: Commodity),
  capacity: Number (default: 10),
  tpias: [ObjectId] (ref: TPIA, max: 10),
  status: Enum['open', 'filling', 'full', 'ready', 'cycling', 'completed'],
  currentCycle: Number (default: 0),
  totalCycles: Number (default: 24),
  warehouse: {
    name: String,
    location: String,
    certificateUrl: String
  },
  cycleHistory: [ObjectId] (ref: Cycle),
  activationDate: Date,
  completionDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **5. Cycles Collection**

```javascript
{
  _id: ObjectId,
  gdc: ObjectId (ref: GDC),
  tpia: ObjectId (ref: TPIA) (for individual TPIA cycle tracking),
  cycleNumber: Number,
  startDate: Date,
  endDate: Date (startDate + 37 days),
  status: Enum['scheduled', 'running', 'completed', 'failed'],
  commodityNAV: Number,
  profitRate: Number (default: 0.05),
  totalProfit: Number,
  tpmProfit: Number,
  epsProfit: Number,
  executionLog: String,
  createdAt: Date,
  completedAt: Date
}
```

### **6. Commodities Collection**

```javascript
{
  _id: ObjectId,
  name: String (e.g., "Rice", "Sugar"),
  type: String,
  icon: String (URL),
  navPrice: Number,
  markup: Number (percentage),
  navHistory: [{
    price: Number,
    updatedBy: ObjectId (ref: User),
    date: Date
  }],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **7. Transactions Collection**

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  wallet: ObjectId (ref: Wallet),
  type: Enum['deposit', 'withdrawal', 'tpia_purchase', 'cycle_profit'],
  amount: Number,
  status: Enum['pending', 'processing', 'completed', 'failed', 'cancelled'],
  reference: String (unique),
  paymentMethod: String,
  metadata: Object,
  approvedBy: ObjectId (ref: User),
  approvalDate: Date,
  failureReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### **8. AuditLogs Collection**

```javascript
{
  _id: ObjectId,
  action: String,
  module: String,
  user: ObjectId (ref: User),
  ipAddress: String,
  userAgent: String,
  before: Object,
  after: Object,
  metadata: Object,
  timestamp: Date
}
```

---

## 🔄 **CORE BUSINESS LOGIC FLOWS**

### **Flow 1: User Purchases TPIA**

```
1. User selects commodity type
2. User enters number of units
3. System calculates total cost
4. User confirms purchase
5. Wallet Service: Deduct amount from wallet
6. TPIA Service: Create TPIA records
7. GDC Engine: Assign TPIAs to available GDC
8. If GDC reaches 10 units:
   - Mark GDC as "full"
   - Activate insurance for all TPIAs
   - Schedule first cycle (37 days from activation)
   - Create new empty GDC for next assignments
9. Insurance Service: Link insurance certificates
10. Notification: Send confirmation email/SMS
11. Audit Log: Record transaction
```

### **Flow 2: Automated 37-Day Trade Cycle**

```
1. Cron Job triggers at cycle end date
2. Trade Engine identifies GDCs due for cycle
3. For each GDC:
   a. Fetch current commodity NAV
   b. Calculate profit (5% of insured value)
   c. For each TPIA in GDC:
      - Create profit log entry
      - If user mode = TPM:
        * Add profit to TPIA currentValue
      - If user mode = EPS:
        * Credit profit to wallet earningsBalance
   d. Update cycle history
   e. Increment GDC currentCycle
   f. If currentCycle < 24:
      * Schedule next cycle (+37 days)
   g. If currentCycle = 24:
      * Mark GDC as "completed"
      * Mark all TPIAs as "matured"
      * Return base amount to wallet
4. Send cycle completion notifications
5. Update dashboard statistics
6. Audit log all actions
```

### **Flow 3: User Withdrawal Request**

```
1. User submits withdrawal amount
2. Validate sufficient balance
3. Create withdrawal transaction (status: pending)
4. Admin receives approval notification
5. Admin reviews & approves/rejects
6. If approved:
   - Deduct from wallet balance
   - Initiate bank transfer
   - Update transaction status: completed
7. If rejected:
   - Update transaction status: cancelled
   - Notify user with reason
8. Audit log withdrawal
```

### **Flow 4: GDC Auto-Creation**

```
1. Monitor current open GDC
2. When GDC reaches 10 TPIAs:
   - Mark as "full"
   - Trigger insurance activation
   - Set activation date
   - Calculate maturity date (24 cycles × 37 days)
3. Create new GDC:
   - Generate sequential code (GDC-20, GDC-30...)
   - Set status: "open"
   - Set capacity: 10
4. Future TPIAs auto-assign to new GDC
```

---

## 🛠️ **TECHNOLOGY STACK SPECIFICATIONS**

### **Backend**

- **Runtime:** Node.js v18+
- **Framework:** Express.js v4.18+
- **Database:** MongoDB v6+ with Mongoose ODM
- **Authentication:** JWT (jsonwebtoken) + bcrypt
- **Validation:** Joi / express-validator
- **Task Scheduling:** node-cron / BullMQ + Redis
- **Email:** Nodemailer / SendGrid
- **SMS:** Twilio / Termii (Nigeria)
- **File Upload:** Multer + Cloudinary / AWS S3
- **API Documentation:** Swagger / Postman

### **Frontend**

- **Framework:** React v18+ (Vite)
- **Routing:** React Router v6
- **State Management:** Context API + useReducer (or Zustand)
- **Styling:** Tailwind CSS v3+
- **Charts:** Chart.js / Recharts
- **HTTP Client:** Axios
- **Forms:** React Hook Form + Yup validation
- **Notifications:** React Hot Toast / Sonner

### **DevOps & Deployment**

- **Version Control:** Git + GitHub
- **Containerization:** Docker (optional)
- **Hosting:**
  - Backend: Render / Railway / DigitalOcean
  - Frontend: Vercel / Netlify
  - Database: MongoDB Atlas
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry (error tracking)

---

## 📅 **DEVELOPMENT ROADMAP**

### **Phase 1: Foundation (Month 1)**

**Week 1-2: Backend Setup**

- [ ] Initialize Node.js project
- [ ] Set up Express server
- [ ] Configure MongoDB connection
- [ ] Create User model & Auth module
- [ ] Implement JWT authentication
- [ ] Build auth routes (register, login, logout)
- [ ] Add input validation middleware
- [ ] Set up error handling

**Week 3-4: Core Models & Wallet**

- [ ] Create Wallet model & service
- [ ] Build deposit/withdrawal logic (manual admin approval)
- [ ] Create Transaction model
- [ ] Implement double-entry ledger system
- [ ] Build wallet API endpoints
- [ ] Create Commodity model
- [ ] Add CRUD operations for commodities (admin)

### **Phase 2: TPIA & GDC Engine (Month 2)**

**Week 1-2: TPIA System**

- [ ] Create TPIA model
- [ ] Build TPIA creation service
- [ ] Implement purchase flow
- [ ] Add TPIA-to-wallet deduction logic
- [ ] Build TPIA listing endpoints
- [ ] Add TPIA detail view

**Week 3-4: GDC Engine**

- [ ] Create GDC model
- [ ] Build auto-assignment logic
- [ ] Implement GDC capacity checking
- [ ] Add auto-creation of new GDCs
- [ ] Build GDC status management
- [ ] Create GDC API endpoints

### **Phase 3: Trade Cycle Engine (Month 3)**

**Week 3: Portfolio Layer & Historical NAV Charts**
- [x] Implement Portfolio aggregation service
- [x] Create Portfolio API endpoint
- [x] Add Commodity NAV history tracking
- [x] Create NAV history API for charting
- [x] Establish Insurance Claim model foundation

**Week 3-4: Automation & Jobs**

- [ ] Set up node-cron / BullMQ
- [ ] Create 37-day cycle scheduler
- [ ] Implement auto-cycle execution
- [ ] Add cycle notification system
- [ ] Build manual cycle trigger (admin)
- [ ] Add cycle status monitoring

### **Phase 4: Frontend Development (Month 4)**

**Week 1: Setup & Auth**

- [ ] Initialize React + Vite project
- [ ] Set up Tailwind CSS
- [ ] Create layout components
- [ ] Build login/register pages
- [ ] Implement JWT storage & refresh
- [ ] Add protected routes

**Week 2: Dashboard & TPIA**

- [ ] Build user dashboard
- [ ] Add portfolio stats cards
- [ ] Implement Chart.js visualizations
- [ ] Create TPIA purchase page
- [ ] Add commodity selection UI
- [ ] Build transaction history table

**Week 3: Wallet & GDC**

- [ ] Create wallet management page
- [ ] Build deposit/withdrawal forms
- [ ] Add TPM/EPS mode switcher
- [ ] Create GDC cluster visualization
- [ ] Add progress bars & status indicators

**Week 4: Admin Panel**

- [ ] Build admin dashboard
- [ ] Create user management interface
- [ ] Add commodity CRUD interface
- [ ] Build approval queues (withdrawals, KYC)
- [ ] Add manual cycle trigger button
- [ ] Create reports & analytics page

### **Phase 5: Advanced Features (Month 5)**

**Week 1-2: Insurance & KYC**

- [ ] Create insurance policy linking
- [ ] Build KYC upload interface
- [ ] Add admin KYC approval workflow
- [ ] Implement document storage (Cloudinary)

**Week 3-4: Notifications & Reports**

- [ ] Set up email service (Nodemailer)
- [ ] Create email templates
- [ ] Add SMS notifications (Twilio/Termii)
- [ ] Build PDF report generation
- [ ] Add CSV export functionality

### **Phase 6: Testing & Deployment (Month 6)**

**Week 1-2: Testing**

- [ ] Write unit tests (Jest)
- [ ] Add integration tests
- [ ] Perform end-to-end testing
- [ ] Fix bugs & edge cases
- [ ] Optimize database queries

**Week 3-4: Deployment**

- [ ] Set up production environment
- [ ] Configure MongoDB Atlas
- [ ] Deploy backend to Render/Railway
- [ ] Deploy frontend to Vercel
- [ ] Set up domain & SSL
- [ ] Configure monitoring (Sentry)
- [ ] Create backup strategy
- [ ] Write API documentation

---

## 🔐 **SECURITY REQUIREMENTS**

### **Authentication & Authorization**

- JWT with 15-minute access tokens
- Refresh token rotation
- Role-based access control (RBAC)
- Password hashing with bcrypt (10+ rounds)
- Account lockout after 5 failed attempts

### **Data Protection**

- Input sanitization (prevent XSS, SQL injection)
- Rate limiting (express-rate-limit)
- CORS configuration
- Helmet.js for security headers
- Environment variables for secrets (.env)

### **Financial Security**

- Transaction signing/verification
- Withdrawal approval workflow
- Audit trail for all financial operations
- Balance reconciliation checks
- Fraud detection rules

### **Compliance**

- GDPR-compliant data handling
- KYC/AML documentation
- Audit logs (immutable)
- Data encryption at rest
- Secure file uploads

---

## 🧪 **TESTING STRATEGY**

### **Unit Tests**

- All service functions
- Utility functions
- Validation schemas

### **Integration Tests**

- API endpoint tests
- Database operations
- Inter-module communication

### **E2E Tests**

- User registration → TPIA purchase → Cycle execution
- Deposit → Withdrawal approval flow
- Admin operations

### **Manual Testing Checklist**

- [ ] User can register & login
- [ ] User can purchase TPIA
- [ ] GDC auto-fills & creates new cluster
- [ ] Cycle runs automatically after 37 days
- [ ] TPM compounds profits correctly
- [ ] EPS credits wallet correctly
- [ ] Withdrawals require admin approval
- [ ] Admin can trigger manual cycle
- [ ] All transactions logged in audit

---

## 📝 **API ENDPOINT STRUCTURE**

### **Auth Routes**

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### **User Routes**

```
GET    /api/users/profile
PUT    /api/users/profile
PATCH  /api/users/mode         # Switch TPM/EPS
POST   /api/users/kyc
```

### **Wallet Routes**

```
GET    /api/wallet
POST   /api/wallet/deposit
POST   /api/wallet/withdraw
GET    /api/wallet/transactions
GET    /api/wallet/balance
```

### **TPIA Routes**

```
GET    /api/tpias              # User's TPIAs
POST   /api/tpias/purchase
GET    /api/tpias/:id
POST   /api/tpias/:id/withdraw # Request early exit
GET    /api/tpias/:id/history  # Profit history
```

### **GDC Routes**

```
GET    /api/gdcs               # All clusters
GET    /api/gdcs/:id
GET    /api/gdcs/:id/tpias
GET    /api/gdcs/:id/cycles
```

### **Commodity Routes**

```
GET    /api/commodities
GET    /api/commodities/:id
POST   /api/commodities        # Admin only
PUT    /api/commodities/:id    # Admin only
```

### **Admin Routes**

```
GET    /api/admin/dashboard
GET    /api/admin/users
PATCH  /api/admin/users/:id/kyc
GET    /api/admin/transactions/pending
PATCH  /api/admin/transactions/:id/approve
POST   /api/admin/cycles/trigger
PUT    /api/admin/commodities/:id/nav
GET    /api/admin/reports
```

---

## 🎨 **UI/UX GUIDELINES**

### **Design System**

- **Primary Color:** Indigo (#667eea)
- **Secondary Color:** Purple (#764ba2)
- **Success:** Green (#48bb78)
- **Warning:** Orange (#ed8936)
- **Error:** Red (#f56565)
- **Neutral:** Gray scale

### **Typography**

- Headings: Bold, 24-36px
- Body: Regular, 14-16px
- Small text: 12px

### **Components**

- Cards with hover effects
- Progress bars for GDC filling
- Status badges (cycling, pending, completed)
- Data tables with sorting
- Modal dialogs for confirmations
- Toast notifications

### **Responsiveness**

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly buttons (min 44px)

---

## 🚨 **CRITICAL BUSINESS RULES**

1. **TPIA can only be purchased in multiples of ₦50,000**
2. **GDC must have exactly 10 TPIAs before cycling**
3. **Cycles run exactly every 37 days**
4. **Total lifecycle is 24 cycles (888 days / ~2.4 years)**
5. **Users can switch TPM/EPS mode anytime, applies to next cycle**
6. **Withdrawals require admin approval**
7. **All TPIAs are fully insured before first cycle**
8. **NAV updates don't affect existing TPIAs, only new purchases**
9. **Once a GDC starts cycling, no new TPIAs can be added**
10. **Matured TPIAs return base amount to wallet automatically**

---

## 📊 **PERFORMANCE TARGETS**

- API response time: < 200ms
- Database queries: < 100ms
- Page load time: < 2 seconds
- Support 10,000 concurrent users
- Handle 100,000 TPIAs simultaneously
- Process 1,000 cycles per day

---

## 🔧 **ENVIRONMENT VARIABLES**

```env
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/gdip

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=15m
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRE=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# SMS
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# File Upload
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Payment (future)
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
```

---

## 🎯 **SUCCESS METRICS**

### **Technical Metrics**

- 99.9% uptime
- Zero data loss
- < 0.1% transaction failure rate
- All cycles execute on time

### **Business Metrics**

- User registration conversion: > 60%
- TPIA purchase rate: > 40% of users
- Withdrawal approval time: < 24 hours
- Customer support response: < 2 hours

---

## 📚 **DOCUMENTATION REQUIREMENTS**

### **Developer Documentation**

- API documentation (Swagger)
- Database schema diagrams
- System architecture diagrams
- Deployment guide
- Contribution guidelines

### **User Documentation**

- User guide (how to use GDIP)
- FAQ section
- Video tutorials
- Terms & conditions
- Privacy policy

### **Admin Documentation**

- Admin user manual
- Troubleshooting guide
- Backup & recovery procedures
- Security protocols

---

## 🚀 **GETTING STARTED (Quick Commands for Cursor AI)**

### **Backend Setup**

```bash
# Initialize backend
mkdir gdip-backend && cd gdip-backend
npm init -y
npm install express mongoose dotenv bcrypt jsonwebtoken joi cors helmet express-rate-limit
npm install -D nodemon

# Create folder structure
mkdir -p src/{modules/{auth,users,wallet,tpia,gdc,trade,commodity,insurance,admin,audit},core/{database,utils,middleware,events,jobs},api/{routes,controllers,validators}}
```

### **Frontend Setup**

```bash
# Initialize frontend
npm create vite@latest gdip-frontend -- --template react
cd gdip-frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npm install axios react-router-dom chart.js react-chartjs-2 react-hook-form yup react-hot-toast
npx tailwindcss init -p
```

---

## ✅ **FINAL CHECKLIST BEFORE LAUNCH**

- [ ] All database indexes created
- [ ] All API endpoints tested
- [ ] Authentication working correctly
- [ ] TPIA purchase flow complete
- [ ] GDC auto-filling works
- [ ] Cycle automation running
- [ ] TPM/EPS modes functional
- [ ] Wallet transactions accurate
- [ ] Admin approvals working
- [ ] Email/SMS notifications sending
- [ ] Error handling comprehensive
- [ ] Security measures implemented
- [ ] Performance optimized
- [ ] Documentation complete
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Legal compliance verified
- [ ] User testing completed

---

## 🎓 **LEARNING RESOURCES**

- MongoDB University (free courses)
- Express.js documentation
- React official docs
- Tailwind CSS docs
- JWT best practices
- FinTech compliance guidelines

---

**This document serves as your complete blueprint. Use Cursor AI to implement each section systematically, following the roadmap phase by phase.**

**Start with Phase 1 backend setup, then progressively build each module.**
