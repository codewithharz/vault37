# GDIP - Detailed User Stories & Acceptance Criteria

## 📖 **USER STORY FORMAT**

Each story follows the standard format:

```
As a [user type],
I want to [action],
So that [benefit/value].
```

**Priority Levels:**

- 🔴 **P0** - Critical (MVP blocker)
- 🟠 **P1** - High (Required for launch)
- 🟡 **P2** - Medium (Post-MVP)
- 🟢 **P3** - Low (Nice to have)

---

# 🔐 **AUTHENTICATION & USER MANAGEMENT**

## **US-001: User Registration** 🔴 P0

**As a** new visitor,  
**I want to** create an account with my email and password,  
**So that** I can access the GDIP platform and start investing.

### **Acceptance Criteria:**

- [ ] Registration form accepts: Full Name, Email, Phone, Password, Confirm Password
- [ ] Email must be unique in the system
- [ ] Password must be at least 8 characters with 1 uppercase, 1 number, 1 special character
- [ ] Phone number validated with Nigerian format (+234...)
- [ ] Password and Confirm Password must match
- [ ] User receives welcome email upon successful registration
- [ ] User automatically logged in after registration
- [ ] User redirected to dashboard after registration
- [ ] Error messages displayed for validation failures
- [ ] Account created with default role: 'user'
- [ ] Wallet automatically created and linked to user

### **Technical Notes:**

- Hash password with bcrypt (10 rounds)
- Generate JWT token immediately
- Store refresh token in httpOnly cookie
- Send welcome email template

### **Test Cases:**

1. Valid registration completes successfully
2. Duplicate email shows error
3. Weak password rejected
4. Phone format validation works
5. Welcome email received
6. User can login immediately after registration

---

## **US-002: User Login** 🔴 P0

**As a** registered user,  
**I want to** login with my email and password,  
**So that** I can access my account and investments.

### **Acceptance Criteria:**

- [ ] Login form accepts Email and Password
- [ ] Valid credentials grant access and redirect to dashboard
- [ ] Invalid credentials show clear error message
- [ ] Account locked after 5 consecutive failed attempts
- [ ] Locked account shows "Contact support" message
- [ ] "Remember me" checkbox stores session for 30 days
- [ ] JWT token generated and stored in localStorage
- [ ] Refresh token stored in httpOnly cookie
- [ ] User profile and wallet data loaded immediately
- [ ] Previous page restored if redirected from protected route

### **Technical Notes:**

- Compare password with bcrypt
- Increment failed attempts counter
- Reset counter on successful login
- Generate access token (15 min expiry)
- Generate refresh token (7 day expiry)

### **Test Cases:**

1. Valid login successful
2. Invalid password shows error
3. Non-existent email shows error
4. Account locks after 5 failures
5. Remember me extends session
6. Token refresh works before expiry

---

## **US-003: KYC Verification** 🟠 P1

**As a** registered user,  
**I want to** submit my identity documents for verification,  
**So that** I can comply with regulations and increase my transaction limits.

### **Acceptance Criteria:**

- [ ] User can upload government-issued ID (NIN, Driver's License, Passport)
- [ ] System accepts JPG, PNG, PDF files up to 5MB
- [ ] User enters ID number and type
- [ ] Documents uploaded to secure cloud storage
- [ ] User sees "Verification Pending" status
- [ ] Admin receives notification of new KYC submission
- [ ] User notified via email when status changes
- [ ] Verified users have green badge on profile
- [ ] Rejected users can resubmit with feedback

### **Technical Notes:**

- Use Cloudinary/S3 for document storage
- Encrypt sensitive data
- Store document URLs in user model
- Add KYC status enum: pending/verified/rejected

### **Test Cases:**

1. Valid document upload succeeds
2. File size limit enforced
3. File type validation works
4. Status updates correctly
5. Email notifications sent
6. Resubmission allowed after rejection

---

## **US-004: Password Recovery** 🟠 P1

**As a** user who forgot my password,  
**I want to** reset it via email,  
**So that** I can regain access to my account.

### **Acceptance Criteria:**

- [ ] "Forgot Password" link on login page
- [ ] User enters email address
- [ ] System sends reset link to email if account exists
- [ ] Same message shown whether email exists or not (security)
- [ ] Reset link expires after 1 hour
- [ ] Reset link can only be used once
- [ ] User sets new password (same validation as registration)
- [ ] User redirected to login after successful reset
- [ ] Old password no longer works

### **Technical Notes:**

- Generate random token (crypto.randomBytes)
- Store token hash and expiry in database
- Send email with reset URL
- Invalidate token after use

### **Test Cases:**

1. Reset email received
2. Valid token allows password change
3. Expired token rejected
4. Used token rejected
5. New password works
6. Old password fails

---

# 💰 **WALLET & TRANSACTIONS**

## **US-005: View Wallet Balance** 🔴 P0

**As a** user,  
**I want to** see my current wallet balance and transaction history,  
**So that** I can track my funds.

### **Acceptance Criteria:**

- [ ] Dashboard shows total wallet balance prominently
- [ ] Available balance displayed (not locked in TPIAs)
- [ ] Earnings balance shown separately (from EPS mode)
- [ ] Locked balance displayed (invested in active TPIAs)
- [ ] Balance updates in real-time after transactions
- [ ] Transaction history table shows last 50 transactions
- [ ] Transactions sortable by date, type, amount
- [ ] Filterable by type (deposit, withdrawal, purchase, profit)
- [ ] Pagination for transactions beyond 50

### **Technical Notes:**

- Calculate balances from ledger entries
- Use indexes on userId and createdAt
- Implement virtual fields for computed balances

### **Test Cases:**

1. Balance displays correctly
2. Recent transactions appear
3. Filters work correctly
4. Sorting functions properly
5. Pagination loads more records

---

## **US-006: Deposit Funds (Manual)** 🔴 P0

**As a** user,  
**I want to** request a deposit to my wallet,  
**So that** I can purchase TPIAs.

### **Acceptance Criteria:**

- [ ] User selects "Deposit" from wallet page
- [ ] User enters amount (minimum ₦10,000)
- [ ] System displays bank account details for transfer
- [ ] User uploads proof of payment
- [ ] System creates pending transaction
- [ ] Admin receives notification for approval
- [ ] User sees "Pending Approval" status
- [ ] Email sent when deposit is approved/rejected
- [ ] Balance updated immediately upon approval
- [ ] Transaction appears in history with reference number

### **Technical Notes:**

- Generate unique transaction reference
- Store payment proof in cloud storage
- Create transaction with status: pending
- Implement admin approval workflow

### **Test Cases:**

1. Deposit request created
2. Minimum amount enforced
3. Admin notification sent
4. Status updates correctly
5. Balance updates on approval
6. Email notifications work

---

## **US-007: Withdraw Funds** 🔴 P0

**As a** user,  
**I want to** withdraw money from my wallet to my bank account,  
**So that** I can access my earnings.

### **Acceptance Criteria:**

- [ ] User selects "Withdraw" from wallet page
- [ ] User enters withdrawal amount
- [ ] System validates sufficient available balance
- [ ] User selects bank account from saved accounts
- [ ] User can add new bank account if needed
- [ ] System creates withdrawal request (status: pending)
- [ ] Admin receives notification for approval
- [ ] User sees estimated processing time (24-48 hours)
- [ ] Email sent when withdrawal is approved/rejected
- [ ] Amount deducted from balance upon approval
- [ ] Transaction marked as completed when funds sent
- [ ] User can cancel pending withdrawal

### **Technical Notes:**

- Validate available balance (not locked)
- Create transaction record
- Implement admin approval queue
- Store bank account details securely

### **Test Cases:**

1. Withdrawal request created
2. Insufficient balance rejected
3. Bank account validation works
4. Admin approval workflow functions
5. Balance deducted correctly
6. Cancellation works for pending requests

---

## **US-008: Switch Earnings Mode (TPM/EPS)** 🟠 P1

**As a** user,  
**I want to** switch between TPM and EPS modes,  
**So that** I can choose whether to compound or withdraw my profits.

### **Acceptance Criteria:**

- [ ] User sees current mode on wallet page
- [ ] Toggle switch or radio buttons to change mode
- [ ] Confirmation modal explains difference between modes:
  - TPM: Profits reinvested automatically
  - EPS: Profits sent to wallet for withdrawal
- [ ] User confirms mode change
- [ ] System updates user mode in database
- [ ] Change takes effect from next cycle
- [ ] Current cycle unaffected
- [ ] Success message confirms mode change
- [ ] Dashboard displays active mode clearly

### **Technical Notes:**

- Store mode in user model
- Apply mode during cycle execution
- No retrospective changes to completed cycles

### **Test Cases:**

1. Mode switch updates database
2. Confirmation modal displays
3. Next cycle uses new mode
4. Current cycle unchanged
5. Mode indicator updates

---

# 🏦 **TPIA PURCHASE & MANAGEMENT**

## **US-009: View Available Commodities** 🔴 P0

**As a** user,  
**I want to** see all available commodity types and their prices,  
**So that** I can choose which commodity to invest in.

### **Acceptance Criteria:**

- [ ] Commodity listing page shows all active commodities
- [ ] Each commodity card displays:
  - Name (Rice, Sugar, Wheat, etc.)
  - Icon/image
  - Current NAV price per unit
  - Brief description
- [ ] Commodities visually distinguishable
- [ ] "Select" button for each commodity
- [ ] Inactive commodities not displayed to users
- [ ] Admin can see inactive commodities

### **Technical Notes:**

- Fetch only active commodities for users
- Cache commodity data (5 min TTL)
- Display most popular commodities first

### **Test Cases:**

1. Active commodities displayed
2. Inactive commodities hidden
3. Prices accurate
4. Selection works correctly

---

## **US-010: Purchase TPIA Units** 🔴 P0

**As a** user,  
**I want to** purchase TPIA units for a selected commodity,  
**So that** I can start earning returns.

### **Acceptance Criteria:**

- [ ] User selects commodity type
- [ ] User enters number of units (1-50)
- [ ] System calculates total cost (units × NAV price)
- [ ] Summary shows:
  - Commodity selected
  - Number of units
  - Price per unit
  - Total cost
  - Estimated returns per cycle (5%)
- [ ] User confirms purchase
- [ ] System validates sufficient wallet balance
- [ ] Wallet balance deducted
- [ ] TPIA units created with unique numbers
- [ ] TPIAs automatically assigned to available GDC
- [ ] Confirmation email sent with TPIA details
- [ ] User redirected to "My TPIAs" page
- [ ] Transaction recorded in wallet history

### **Technical Notes:**

- Use database transaction for atomic operation
- Generate sequential TPIA numbers
- Assign to GDC with available slots
- Create insurance policy placeholder
- Trigger GDC filling check

### **Test Cases:**

1. Valid purchase completes
2. Insufficient balance rejected
3. TPIA numbers unique
4. GDC assignment correct
5. Wallet deducted accurately
6. Email confirmation sent
7. Transaction logged

---

## **US-011: View My TPIAs** 🔴 P0

**As a** user,  
**I want to** see all my TPIA holdings,  
**So that** I can track my investments.

### **Acceptance Criteria:**

- [ ] "My TPIAs" page lists all user's TPIAs
- [ ] Each TPIA card shows:
  - TPIA number (TPIA-000012)
  - Commodity type
  - Base amount invested
  - Current value (with compounding)
  - Status (Active, Cycling, Matured)
  - Cycles completed / Total cycles
  - Next cycle date
  - Insurance status
- [ ] TPIAs sortable by date, value, status
- [ ] Filterable by commodity type and status
- [ ] Click to view detailed TPIA page
- [ ] Total portfolio value displayed at top

### **Technical Notes:**

- Efficient query with indexes
- Calculate current value on-the-fly
- Cache total portfolio value

### **Test Cases:**

1. All TPIAs displayed
2. Data accurate
3. Sorting works
4. Filtering works
5. Navigation to details works

---

## **US-012: View TPIA Details & History** 🟠 P1

**As a** user,  
**I want to** see detailed information about a specific TPIA,  
**So that** I can track its performance over time.

### **Acceptance Criteria:**

- [ ] TPIA detail page shows:
  - TPIA number and commodity
  - Purchase date and amount
  - Current value
  - Total profit earned
  - Cycles completed
  - Maturity date
  - Assigned GDC
  - Insurance certificate (downloadable)
  - Warehouse location
- [ ] Profit history table showing:
  - Cycle number
  - Date
  - Profit amount
  - Mode applied (TPM/EPS)
- [ ] Growth chart showing value over time
- [ ] Download TPIA statement button

### **Technical Notes:**

- Fetch TPIA with populated GDC and commodity
- Calculate metrics from profit history
- Generate chart data from cycle logs

### **Test Cases:**

1. All details accurate
2. Profit history complete
3. Chart displays correctly
4. Statement download works

---

# 🔄 **GDC CLUSTERS & CYCLES**

## **US-013: View GDC Clusters** 🟠 P1

**As a** user,  
**I want to** see all GDC clusters and their status,  
**So that** I understand how my TPIAs are grouped.

### **Acceptance Criteria:**

- [ ] GDC overview page shows all clusters
- [ ] Each cluster card displays:
  - GDC code (GDC-10, GDC-20, etc.)
  - Commodity type
  - Fill status (7/10 TPIAs)
  - Progress bar
  - Status badge (Open, Full, Cycling, Completed)
  - Current cycle number (if cycling)
  - Next cycle date
- [ ] User's TPIAs in cluster highlighted
- [ ] Click to view cluster details
- [ ] Filter by commodity type
- [ ] Sort by status, date, code

### **Technical Notes:**

- Show only clusters containing user's TPIAs
- Real-time progress calculation
- Color-coded status badges

### **Test Cases:**

1. Clusters displayed correctly
2. Progress bars accurate
3. User's TPIAs highlighted
4. Filtering works
5. Navigation functional

---

## **US-014: Automated 37-Day Cycle Execution** 🔴 P0

**As a** system,  
**I want to** automatically execute trade cycles every 37 days,  
**So that** users receive their profits without manual intervention.

### **Acceptance Criteria:**

- [ ] Cron job runs daily at 2 AM
- [ ] System identifies GDCs with cycles due today
- [ ] For each due GDC:
  - Fetch current commodity NAV
  - Calculate 5% profit for each TPIA
  - Apply TPM (compound) or EPS (wallet credit)
  - Create cycle record
  - Update TPIA profit history
  - Increment cycle count
  - Schedule next cycle (+37 days)
- [ ] If cycle #24 completed:
  - Mark GDC as completed
  - Mark TPIAs as matured
  - Return base amount to wallet
- [ ] All users in GDC receive email notification
- [ ] Dashboard updated with new profits
- [ ] Audit log created for each cycle
- [ ] Cycle never skipped or duplicated

### **Technical Notes:**

- Use node-cron or BullMQ
- Implement idempotency (cycle ID check)
- Handle failures with retry logic
- Log all operations
- Use database transactions

### **Test Cases:**

1. Cycle executes on correct date
2. Profit calculation accurate
3. TPM compounds correctly
4. EPS credits wallet correctly
5. Next cycle scheduled
6. Notifications sent
7. Matured TPIAs handled
8. No duplicate executions

---

## **US-015: Cycle Notifications** 🟠 P1

**As a** user,  
**I want to** receive notifications when my cycle completes,  
**So that** I know my profits have been processed.

### **Acceptance Criteria:**

- [ ] Email sent when cycle completes
- [ ] Email contains:
  - GDC code
  - Cycle number
  - Total profit earned
  - Mode applied (TPM/EPS)
  - New TPIA value (if TPM)
  - Wallet credit amount (if EPS)
  - Next cycle date
- [ ] SMS notification option (if enabled)
- [ ] In-app notification badge
- [ ] Notification history viewable

### **Technical Notes:**

- Use email template
- Queue notifications (don't block cycle execution)
- SMS integration with Twilio/Termii

### **Test Cases:**

1. Email sent successfully
2. Content accurate
3. SMS sent if enabled
4. In-app notification appears

---

# 👨‍💼 **ADMIN FEATURES**

## **US-016: Admin Dashboard Overview** 🔴 P0

**As an** admin,  
**I want to** see platform-wide statistics at a glance,  
**So that** I can monitor system health.

### **Acceptance Criteria:**

- [ ] Admin dashboard shows:
  - Total users (with growth trend)
  - Active TPIAs count
  - Total capital under management
  - Total GDCs created
  - Active cycles count
  - Pending KYC approvals
  - Pending withdrawals
  - System health indicators
- [ ] Charts showing:
  - User growth over time
  - TPIA sales trend
  - Revenue/profit distribution
- [ ] Quick action buttons
- [ ] Recent activity feed

### **Technical Notes:**

- Aggregate queries optimized
- Cache statistics (5 min TTL)
- Use indexes for performance

### **Test Cases:**

1. Statistics accurate
2. Charts display correctly
3. Data updates regularly
4. Quick actions work

---

## **US-017: Approve/Reject Deposits** 🔴 P0

**As an** admin,  
**I want to** review and approve deposit requests,  
**So that** users can fund their wallets.

### **Acceptance Criteria:**

- [ ] Pending deposits queue shows:
  - User name and email
  - Amount requested
  - Payment proof image
  - Date submitted
  - Transaction reference
- [ ] Admin can view full-size proof image
- [ ] Admin clicks "Approve" or "Reject"
- [ ] If approved:
  - Wallet balance updated
  - Transaction marked completed
  - User email notification sent
- [ ] If rejected:
  - Transaction marked rejected
  - Admin enters rejection reason
  - User email notification sent
- [ ] Audit log records admin action
- [ ] Deposit removed from queue

### **Technical Notes:**

- Transaction-safe updates
- Store admin ID who approved
- Record timestamp of action

### **Test Cases:**

1. Queue displays pending deposits
2. Approval updates balance
3. Rejection records reason
4. Notifications sent
5. Audit logged

---

## **US-018: Approve/Reject Withdrawals** 🔴 P0

**As an** admin,  
**I want to** review and approve withdrawal requests,  
**So that** users can access their funds safely.

### **Acceptance Criteria:**

- [ ] Pending withdrawals queue shows:
  - User name and email
  - Amount requested
  - Bank account details
  - Available balance
  - Date requested
- [ ] Admin can view user's transaction history
- [ ] Admin clicks "Approve" or "Reject"
- [ ] If approved:
  - Balance deducted
  - Transaction marked processing
  - Admin manually sends funds
  - Admin marks as completed
  - User email notification sent
- [ ] If rejected:
  - Balance remains unchanged
  - Admin enters rejection reason
  - User email notification sent
- [ ] Fraud detection alerts (unusual patterns)

### **Technical Notes:**

- Validate balance before approval
- Lock balance during processing
- Integrate with payment gateway (future)

### **Test Cases:**

1. Queue displays correctly
2. Balance validated
3. Approval deducts correctly
4. Rejection keeps balance
5. Notifications work

---

## **US-019: Manage Commodities** 🟠 P1

**As an** admin,  
**I want to** create, edit, and manage commodity types,  
**So that** I can offer different investment options.

### **Acceptance Criteria:**

- [ ] Admin can create new commodity with:
  - Name
  - Type
  - Icon/image upload
  - Initial NAV price
  - Markup percentage
- [ ] Admin can edit existing commodity
- [ ] Admin can activate/deactivate commodity
- [ ] Admin can update NAV price (with history log)
- [ ] Price changes don't affect existing TPIAs
- [ ] Only new purchases use new NAV
- [ ] All changes logged in audit trail

### **Technical Notes:**

- Store NAV history array
- Validate price changes (max 10% per update)
- Inactive commodities hidden from users

### **Test Cases:**

1. Commodity creation works
2. NAV update logged
3. Existing TPIAs unaffected
4. Activation/deactivation works

---

## **US-020: Manual Cycle Trigger** 🟡 P2

**As an** admin,  
**I want to** manually trigger a cycle for a specific GDC,  
**So that** I can handle exceptional situations.

### **Acceptance Criteria:**

- [ ] Admin selects GDC from list
- [ ] Admin clicks "Trigger Cycle Now"
- [ ] Confirmation modal with warning
- [ ] Admin confirms action
- [ ] Cycle executes immediately
- [ ] Normal 37-day schedule adjusted
- [ ] Audit log records manual trigger
- [ ] Admin receives execution report

### **Technical Notes:**

- Same logic as automated cycle
- Update next cycle date
- Prevent duplicate execution

### **Test Cases:**

1. Manual trigger executes
2. Schedule updates correctly
3. Audit logged
4. No duplication occurs

---

## **US-021: KYC Approval/Rejection** 🟠 P1

**As an** admin,  
**I want to** review and approve KYC submissions,  
**So that** users can be verified.

### **Acceptance Criteria:**

- [ ] KYC queue shows pending verifications
- [ ] Admin views uploaded documents
- [ ] Admin verifies:
  - Document legibility
  - Information matches account
  - Document not expired
- [ ] Admin approves or rejects
- [ ] If approved:
  - User KYC status updated to verified
  - User receives success email
  - Green verification badge appears
- [ ] If rejected:
  - Admin provides specific feedback
  - User receives rejection email with reason
  - User can resubmit
- [ ] Audit log records decision

### **Technical Notes:**

- Secure document viewing
- Store approval timestamp and admin ID

### **Test Cases:**

1. Documents viewable
2. Approval updates status
3. Rejection allows resubmission
4. Emails sent correctly

---

## **US-022: Generate Reports** 🟡 P2

**As an** admin,  
**I want to** generate various financial and operational reports,  
**So that** I can analyze platform performance.

### **Acceptance Criteria:**

- [ ] Admin selects report type:
  - Monthly profit distribution
  - User acquisition report
  - TPIA sales report
  - Commodity performance
  - Transaction summary
  - Cycle execution log
- [ ] Admin selects date range
- [ ] Report generated with:
  - Summary statistics
  - Detailed data tables
  - Charts/graphs
- [ ] Export options: PDF, CSV, Excel
- [ ] Reports saved in history
- [ ] Schedule automated reports (future)

### **Technical Notes:**

- Use aggregation pipelines
- Generate PDFs with jsPDF or Puppeteer
- CSV export with fast-csv

### **Test Cases:**

1. Reports generate correctly
2. Data accurate
3. Exports work
4. Date filters apply

---

# 🔔 **NOTIFICATIONS & COMMUNICATION**

## **US-023: Email Notifications** 🟠 P1

**As a** user,  
**I want to** receive email notifications for important events,  
**So that** I stay informed about my investments.

### **Acceptance Criteria:**

- [ ] Emails sent for:
  - Welcome (registration)
  - TPIA purchase confirmation
  - Cycle completion
  - Withdrawal approved/rejected
  - Deposit approved/rejected
  - KYC status change
  - Password reset
- [ ] Professional email templates
- [ ] Unsubscribe link included
- [ ] User can manage notification preferences
- [ ] Emails delivered within 5 minutes

### **Technical Notes:**

- Use Nodemailer or SendGrid
- Queue emails (don't block requests)
- HTML email templates

### **Test Cases:**

1. All email types send
2. Templates render correctly
3. Unsubscribe works
4. Delivery reliable

---

## **US-024: SMS Notifications (Optional)** 🟢 P3

**As a** user,  
**I want to** receive SMS notifications for critical events,  
**So that** I get immediate alerts.

### **Acceptance Criteria:**

- [ ] SMS sent for:
  - Withdrawal approved (security)
  - Cycle completion (profit credited)
  - Large deposits confirmed
- [ ] User can opt-in/out of SMS
- [ ] SMS delivered within 1 minute
- [ ] Cost-effective (only critical alerts)

### **Technical Notes:**

- Use Twilio or Termii (Nigeria)
- Queue SMS messages
- Track delivery status

### **Test Cases:**

1. SMS delivered successfully
2. Opt-out respected
3. Delivery confirmed

---

# 📊 **ANALYTICS & INSIGHTS**

## **US-025: Portfolio Analytics** 🟡 P2

**As a** user,  
**I want to** see detailed analytics of my portfolio performance,  
**So that** I can make informed investment decisions.

### **Acceptance Criteria:**

- [ ] Portfolio page shows:
  - Total invested vs current value
  - Overall ROI percentage
  - Best performing commodity
  - Average cycle return
  - Projected annual return
  - Portfolio diversification chart
- [ ] Interactive charts:
  - Portfolio growth over time
  - Profit distribution by commodity
  - TPM vs EPS earnings comparison
- [ ] Date range filters
- [ ] Downloadable portfolio report

### **Technical Notes:**

- Use Chart.js or Recharts
- Calculate metrics from transaction history
- Cache calculations

### **Test Cases:**

1. Metrics accurate
2. Charts interactive
3. Filters work
4. Report downloads

---

## **US-026: Investment Projections** 🟡 P2

**As a** user,  
**I want to** see projections of my future earnings,  
**So that** I can plan my finances.

### **Acceptance Criteria:**

- [ ] Projection calculator shows:
  - Current portfolio value
  - Projected value in 6 months, 1 year, 2 years
  - Expected total profit
  - Breakdown by commodity
- [ ] Assumes 5% per cycle (37 days)
- [ ] Factors in current mode (TPM/EPS)
- [ ] Shows growth chart visualization
- [ ] "What if" scenarios (add more TPIAs)

### **Technical Notes:**

- JavaScript calculation function
- Compound interest formula
- Interactive slider for scenarios

### **Test Cases:**

1. Projections mathematically correct
2. TPM compounds properly
3. EPS projects correctly
4. Scenarios update dynamically

---

# 🛡️ **SECURITY & COMPLIANCE**

## **US-027: Two-Factor Authentication (2FA)** 🟡 P2

**As a** user,  
**I want to** enable 2FA for my account,  
**So that** my investments are more secure.

### **Acceptance Criteria:**

- [ ] User can enable 2FA in settings
- [ ] Supports authenticator apps (Google Authenticator, Authy)
- [ ] QR code displayed for setup
- [ ] Backup codes generated
- [ ] 2FA required for:
  - Login
  - Withdrawals
  - Mode changes
- [ ] User can disable 2FA with verification
- [ ] Recovery process if device lost

### **Technical Notes:**

- Use speakeasy library
- Store secret securely
- Implement backup codes

### **Test Cases:**

1. 2FA setup works
2. Code verification successful
3. Backup codes valid
4. Recovery process works

---

## **US-028: Audit Trail Viewing** 🟢 P3

**As an** admin,  
**I want to** view comprehensive audit logs,  
**So that** I can track all system activities.

### **Acceptance Criteria:**

- [ ] Audit log page shows:
  - Timestamp
  - User
  - Action performed
  - Module/resource affected
  - IP address
  - Before/after values
- [ ] Searchable by user, action, date
- [ ] Filterable by module
- [ ] Export to CSV
- [ ] Logs immutable (cannot be deleted)
- [ ] Retention policy (7 years)

### **Technical Notes:**

- Separate audit collection
- Index on timestamp and user
- Write-only permissions

### **Test Cases:**

1. All actions logged
2. Search works
3. Export functional
4. Cannot delete logs

---

# 🎯 **ADVANCED FEATURES (POST-MVP)**

## **US-029: Referral Program** 🟢 P3

**As a** user,  
**I want to** refer friends and earn bonuses,  
**So that** I can increase my returns.

### **Acceptance Criteria:**

- [ ] User gets unique referral code
- [ ] User can share referral link
- [ ] Referee uses code during registration
- [ ] Referrer earns bonus when referee purchases first TPIA
- [ ] Bonus structure:
  - 2% of referee's first purchase
  - Credited to wallet immediately
- [ ] Referral dashboard shows:
  - Total referrals
  - Pending sign-ups
  - Total earnings
- [ ] Leaderboard of top referrers

### **Technical Notes:**

- Store referredBy in user model
- Track referral conversions
- Automatic bonus calculation

### **Test Cases:**

1. Referral code unique
2. Bonus calculated correctly
3. Dashboard accurate
4. Leaderboard updates

---

## **US-030: Mobile App Notifications** 🟢 P3

**As a** mobile app user,  
**I want to** receive push notifications,  
**So that** I get instant updates.

### **Acceptance Criteria:**

- [ ] Push notifications for:
  - Cycle completion
  - Withdrawal approved
  - Deposit confirmed
- [ ] User can enable/disable in app settings
- [ ] Notifications actionable (tap to open relevant page)
- [ ] Badge count for unread notifications

### **Technical Notes:**

- Use Firebase Cloud Messaging
- Store device tokens
- Handle iOS/Android differences

### **Test Cases:**

1. Notifications delivered
2. Actions work correctly
3. Settings respected
4. Badge updates

---

## **US-031: Auto-Invest Feature** 🟢 P3

**As a** user,  
**I want to** automatically reinvest matured TPIAs,  
**So that** I can maintain continuous growth.

### **Acceptance Criteria:**

- [ ] User enables auto-invest in settings
- [ ] When TPIA matures (after 24 cycles):
  - Base amount + all profits returned to wallet
  - System automatically purchases new TPIA
  - Same commodity type (unless unavailable)
  - Uses current NAV price
- [ ] User receives notification of reinvestment
- [ ] User can disable auto-invest anytime
- [ ] Partial reinvestment if balance insufficient

### **Technical Notes:**

- Check auto-invest flag on maturity
- Execute purchase logic automatically
- Handle commodity availability

### **Test Cases:**

1. Auto-invest executes on maturity
2. Correct commodity selected
3. Notification sent
4. Disable option works

---

## **US-032: Insurance Claim Filing** 🟢 P3

**As a** user,  
**I want to** file an insurance claim if warehouse incident occurs,  
**So that** my investment is protected.

### **Acceptance Criteria:**

- [ ] User reports incident affecting their TPIA
- [ ] User uploads evidence (photos, documents)
- [ ] System creates claim record
- [ ] Admin reviews claim
- [ ] Insurance provider notified
- [ ] Claim status tracked (pending, approved, paid, rejected)
- [ ] User compensated if approved
- [ ] Claim history viewable

### **Technical Notes:**

- Store claim documents securely
- Link claim to TPIA and insurance policy
- Workflow integration with insurer

### **Test Cases:**

1. Claim submission works
2. Documents uploaded
3. Status updates correctly
4. Compensation processed

---

# 📱 **USER EXPERIENCE ENHANCEMENTS**

## **US-033: Onboarding Tutorial** 🟡 P2

**As a** new user,  
**I want to** see a guided tutorial after registration,  
**So that** I understand how to use GDIP.

### **Acceptance Criteria:**

- [ ] Tutorial appears on first login
- [ ] Step-by-step walkthrough:
  1. Dashboard overview
  2. How to deposit funds
  3. How to buy TPIAs
  4. Understanding GDCs
  5. Choosing TPM vs EPS
- [ ] Interactive highlights on UI elements
- [ ] Skip option available
- [ ] "Don't show again" checkbox
- [ ] Accessible from help menu later

### **Technical Notes:**

- Use library like Intro.js or Shepherd.js
- Store completion status in user model

### **Test Cases:**

1. Tutorial shows for new users
2. All steps clear
3. Skip works
4. Can replay from help menu

---

## **US-034: Investment Calculator** 🟡 P2

**As a** prospective user,  
**I want to** calculate potential returns before investing,  
**So that** I can make informed decisions.

### **Acceptance Criteria:**

- [ ] Calculator on landing page (before login)
- [ ] Inputs:
  - Investment amount
  - Commodity type
  - Mode (TPM/EPS)
  - Investment duration
- [ ] Calculates and displays:
  - Total profit
  - Final value
  - Cycle-by-cycle breakdown
  - Comparison chart (TPM vs EPS)
- [ ] "Sign up to invest" CTA button

### **Technical Notes:**

- Client-side calculation
- No backend required
- Responsive design

### **Test Cases:**

1. Calculations accurate
2. TPM compounds correctly
3. EPS totals correctly
4. Chart displays properly

---

## **US-035: Dark Mode** 🟢 P3

**As a** user,  
**I want to** switch between light and dark themes,  
**So that** I can use the app comfortably at night.

### **Acceptance Criteria:**

- [ ] Toggle switch in settings/header
- [ ] Dark mode applies to all pages
- [ ] Chart colors adjusted for dark mode
- [ ] Text remains readable
- [ ] Preference saved in localStorage
- [ ] System preference detection (auto)

### **Technical Notes:**

- Use Tailwind dark mode classes
- Toggle dark class on root element
- Persist preference

### **Test Cases:**

1. Toggle switches theme
2. All pages styled correctly
3. Preference persists
4. Charts readable

---

# 🔧 **SYSTEM ADMINISTRATION**

## **US-036: User Management** 🟠 P1

**As an** admin,  
**I want to** manage user accounts,  
**So that** I can handle support requests.

### **Acceptance Criteria:**

- [ ] Admin can search users by name, email, phone
- [ ] Admin can view user profile details
- [ ] Admin can:
  - Suspend/unsuspend account
  - Reset user password
  - Update user details
  - View user's TPIAs
  - View user's transaction history
  - View user's wallet balance
- [ ] All actions logged in audit trail
- [ ] User notified of account changes

### **Technical Notes:**

- Implement search with indexes
- Soft delete for suspensions
- Generate temporary password for resets

### **Test Cases:**

1. Search finds users
2. Actions execute correctly
3. Notifications sent
4. Audit logged

---

## **US-037: System Configuration** 🟡 P2

**As an** admin,  
**I want to** configure system-wide settings,  
**So that** I can control platform behavior.

### **Acceptance Criteria:**

- [ ] Admin can configure:
  - Minimum deposit amount
  - Minimum withdrawal amount
  - Default cycle profit rate
  - Cycle duration (default 37 days)
  - TPIA maturity cycles (default 24)
  - Referral bonus percentage
  - Email templates
  - SMS templates
- [ ] Changes saved to database
- [ ] Changes apply immediately
- [ ] Configuration history maintained

### **Technical Notes:**

- Store in settings collection
- Cache settings in memory
- Validate before applying

### **Test Cases:**

1. Settings update correctly
2. Changes apply globally
3. History tracked
4. Validation works

---

## **US-038: Backup & Recovery** 🟠 P1

**As a** system administrator,  
**I want to** automated backups of the database,  
**So that** data can be recovered if needed.

### **Acceptance Criteria:**

- [ ] Daily automated backups at 3 AM
- [ ] Backups stored in secure cloud storage
- [ ] Retention policy: 30 days
- [ ] Backup includes:
  - All collections
  - Document storage references
  - Configuration data
- [ ] Admin can trigger manual backup
- [ ] Admin can restore from backup
- [ ] Backup status monitored
- [ ] Alert if backup fails

### **Technical Notes:**

- Use MongoDB Atlas automated backups
- Or custom backup script with mongodump
- Store in S3/Cloud Storage
- Test restoration quarterly

### **Test Cases:**

1. Automated backup runs daily
2. Manual backup works
3. Restoration successful
4. Alerts sent on failure

---

# 📈 **PERFORMANCE & OPTIMIZATION**

## **US-039: Database Query Optimization** 🟠 P1

**As a** developer,  
**I want to** optimize database queries,  
**So that** the platform performs well at scale.

### **Acceptance Criteria:**

- [ ] All frequently-queried fields indexed
- [ ] Compound indexes for common query patterns
- [ ] Query response time < 100ms for 95% of requests
- [ ] Use aggregation pipelines for complex queries
- [ ] Implement pagination (limit/skip)
- [ ] Cache frequently accessed data (Redis)
- [ ] Monitor slow queries
- [ ] Optimize N+1 query problems

### **Technical Notes:**

- Create indexes on userId, createdAt, status
- Use explain() to analyze queries
- Implement Redis caching layer
- Set up query monitoring

### **Test Cases:**

1. Queries under 100ms
2. Indexes utilized
3. Cache hit rate > 80%
4. No N+1 queries

---

## **US-040: Rate Limiting & Abuse Prevention** 🟠 P1

**As a** system,  
**I want to** implement rate limiting,  
**So that** the platform is protected from abuse.

### **Acceptance Criteria:**

- [ ] Rate limits per endpoint:
  - Login: 5 attempts per 15 minutes
  - API calls: 100 per minute per user
  - File uploads: 10 per hour
  - Password reset: 3 per hour
- [ ] IP-based blocking for suspicious activity
- [ ] CAPTCHA after failed login attempts
- [ ] Alert admin of potential attacks
- [ ] Graceful error messages to users
- [ ] Whitelist for admin IPs

### **Technical Notes:**

- Use express-rate-limit
- Store rate limit data in Redis
- Implement sliding window algorithm

### **Test Cases:**

1. Rate limits enforced
2. Legitimate requests unaffected
3. Abuse blocked
4. Alerts sent

---

# 🎓 **DOCUMENTATION & HELP**

## **US-041: Help Center/FAQ** 🟡 P2

**As a** user,  
**I want to** access a help center with FAQs,  
**So that** I can find answers quickly.

### **Acceptance Criteria:**

- [ ] Help center page with categories:
  - Getting Started
  - TPIA & Investments
  - Wallet & Transactions
  - GDC & Cycles
  - Account & Security
- [ ] Searchable FAQ articles
- [ ] Video tutorials embedded
- [ ] "Contact Support" button
- [ ] Related articles suggested
- [ ] Accessible from all pages

### **Technical Notes:**

- Static content in database or CMS
- Search implementation with fuzzy matching
- Embed YouTube videos

### **Test Cases:**

1. All categories accessible
2. Search finds relevant articles
3. Videos play correctly
4. Contact form works

---

## **US-042: API Documentation** 🟡 P2

**As a** developer (future partner integration),  
**I want to** access comprehensive API documentation,  
**So that** I can integrate with GDIP.

### **Acceptance Criteria:**

- [ ] Swagger/OpenAPI documentation
- [ ] All endpoints documented with:
  - Request method and URL
  - Authentication requirements
  - Request body schema
  - Response schema
  - Error codes
  - Example requests/responses
- [ ] Interactive API explorer
- [ ] Authentication guide
- [ ] Webhook documentation
- [ ] SDKs for common languages

### **Technical Notes:**

- Use Swagger UI
- Generate from code annotations
- Host at /api/docs

### **Test Cases:**

1. All endpoints documented
2. Examples accurate
3. Interactive explorer works
4. Authentication flows clear

---

# 🎉 **COMPLETION CHECKLIST**

## **MVP (Minimum Viable Product) - Must Have**

- ✅ US-001: User Registration
- ✅ US-002: User Login
- ✅ US-005: View Wallet Balance
- ✅ US-006: Deposit Funds
- ✅ US-007: Withdraw Funds
- ✅ US-009: View Commodities
- ✅ US-010: Purchase TPIA
- ✅ US-011: View My TPIAs
- ✅ US-013: View GDC Clusters
- ✅ US-014: Automated Cycle Execution
- ✅ US-016: Admin Dashboard
- ✅ US-017: Approve Deposits
- ✅ US-018: Approve Withdrawals

## **Launch Ready - Should Have**

- ⚡ US-003: KYC Verification
- ⚡ US-004: Password Recovery
- ⚡ US-008: Switch Earnings Mode
- ⚡ US-012: TPIA Details & History
- ⚡ US-015: Cycle Notifications
- ⚡ US-019: Manage Commodities
- ⚡ US-021: KYC Approval
- ⚡ US-023: Email Notifications
- ⚡ US-036: User Management
- ⚡ US-038: Backup & Recovery
- ⚡ US-039: Query Optimization
- ⚡ US-040: Rate Limiting

## **Post-Launch - Nice to Have**

- 🌟 US-020: Manual Cycle Trigger
- 🌟 US-022: Generate Reports
- 🌟 US-025: Portfolio Analytics
- 🌟 US-026: Investment Projections
- 🌟 US-027: Two-Factor Authentication
- 🌟 US-033: Onboarding Tutorial
- 🌟 US-034: Investment Calculator
- 🌟 US-041: Help Center

## **Future Enhancements**

- 💡 US-024: SMS Notifications
- 💡 US-028: Audit Trail Viewing
- 💡 US-029: Referral Program
- 💡 US-030: Mobile App Push Notifications
- 💡 US-031: Auto-Invest
- 💡 US-032: Insurance Claims
- 💡 US-035: Dark Mode
- 💡 US-037: System Configuration
- 💡 US-042: API Documentation

---

# 📊 **STORY POINTS ESTIMATION**

**Total Story Points: ~320**

- MVP Features: ~130 points (8-10 weeks)
- Launch Ready: ~110 points (6-8 weeks)
- Post-Launch: ~50 points (3-4 weeks)
- Future: ~30 points (2-3 weeks)

**Recommended Sprint Structure:**

- Sprint Duration: 2 weeks
- Velocity: 20-25 points per sprint
- MVP Timeline: 10-12 sprints (20-24 weeks / 5-6 months)

---

**This comprehensive user story document provides everything needed to guide GDIP development from concept to launch and beyond!**
