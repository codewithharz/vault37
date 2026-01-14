# User Profile Page - Comprehensive Brainstorming Document

> **Status**: Planning Phase  
> **Priority**: 🔴 High - Major Feature Update  
> **Target**: Create a premium, data-rich user profile page that showcases the full power of the GDIP platform

---

## 🎯 Vision & Objectives

### Primary Goal
Create a **comprehensive User Profile page** that serves as the ultimate dashboard for users to:
- View their complete investment journey and achievements
- Track all TPIAs categorized by commodity, GDC, cycle status, and phase
- Monitor earnings, growth, and platform engagement
- Access personal information, referral stats, and account security
- Celebrate milestones and visualize their wealth-building progress

### Key Differentiators
- **Data-Rich**: Every metric that matters, beautifully visualized
- **Premium UX**: Modern, glassmorphic design with smooth animations
- **Actionable Insights**: Not just data display, but actionable intelligence
- **Investment Story**: Tell the user's journey from first TPIA to wealth accumulation

---

## 📊 Page Structure & Sections

### **Section 1: Profile Hero Banner**
**Purpose**: Create an impressive first impression with user identity and key stats

#### Components:
1. **User Avatar & Identity**
   - Large profile picture or initials avatar
   - Full name with verified badge (if KYC verified)
   - User role badge (Investor, Premium Investor, etc.)
   - Member since date
   - Referral code display with copy button

2. **Quick Stats Cards** (4-6 cards in a grid)
   - Total Portfolio Value (with % change)
   - Total TPIAs Owned
   - Active Cycles Running
   - Total Profit Earned (All-Time)
   - Current Investment Mode (TPM/EPS) with toggle
   - KYC Status with action button

3. **Achievement Badges**
   - First Investment
   - 5 TPIAs Milestone
   - 10 TPIAs Milestone
   - First Matured TPIA
   - Top Performer (if applicable)
   - Verified Investor

#### Data Sources:
```javascript
// Backend API: GET /api/users/profile
{
  user: {
    fullName, email, phone, role, kycStatus,
    referralCode, createdAt, mode, address
  },
  stats: {
    totalPortfolioValue,
    totalTPIAs,
    activeCycles,
    totalProfitEarned,
    totalInvested
  },
  achievements: [...]
}
```

---

### **Section 2: Investment Overview Dashboard**
**Purpose**: High-level view of investment performance

#### Components:
1. **Portfolio Summary Card**
   - Total Invested: ₦X,XXX,XXX
   - Current Value: ₦X,XXX,XXX
   - Total Profit: ₦X,XXX,XXX
   - Overall ROI: XX%
   - Growth chart (last 6 months)

2. **Asset Allocation Pie Chart**
   - Breakdown by commodity type
   - Interactive hover with percentages
   - Click to filter TPIAs by commodity

3. **Earnings Timeline**
   - Monthly profit distribution chart
   - TPM vs EPS earnings comparison
   - Projected earnings for next 3-6 months

4. **Investment Mode Switcher**
   - Current mode: TPM or EPS
   - Visual explanation of each mode
   - Switch mode button with confirmation modal
   - Impact calculator (show difference in returns)

#### Data Sources:
```javascript
// Backend API: GET /api/portfolio
{
  summary: { totalInvested, currentValue, totalProfitEarned, overallROI },
  diversification: [{ name, amount, percentage, count }],
  performanceHistory: [{ date, profit }]
}
```

---

### **Section 3: My TPIAs - The Core Feature**
**Purpose**: Comprehensive view of all user TPIAs with advanced filtering and categorization

#### **3.1 TPIA Filter & Sort Bar**
- **Filter by Status**: All, Active, Cycling, Matured, Pending
- **Filter by Commodity**: All, Rice, Sugar, Wheat, etc.
- **Filter by Phase**: All, Core Phase, Extended Phase, Matured
- **Filter by GDC**: Dropdown of all GDCs user is part of
- **Sort by**: Purchase Date, Value, Profit, Maturity Date, Cycle Progress
- **View Toggle**: Grid View / List View / Table View

#### **3.2 TPIA Cards (Grid View)**
Each card displays:
- **Header**:
  - TPIA Number (e.g., TPIA-000012)
  - Commodity icon and name
  - Status badge (Active, Cycling, Matured)
  - Phase badge (Core/Extended)
  
- **Main Content**:
  - Base Amount: ₦1,000,000
  - Current Value: ₦1,250,000 (+25%)
  - Total Profit: ₦250,000
  - Progress bar: Cycle 8/24 (33%)
  - Next cycle date or maturity date
  
- **Cycle Information**:
  - Current cycle number
  - Days until next cycle
  - Investment phase (Core 1-12 or Extended 13-24)
  - Exit window status (if in extended phase)
  
- **GDC Information**:
  - GDC Code (e.g., GDC-10)
  - GDC fill status (10/10)
  - Warehouse location
  
- **Insurance & Logistics**:
  - Insurance policy number
  - Insurance status badge
  - Download certificate button
  
- **Actions**:
  - View Full Details button
  - Download TPIA Statement
  - Request Withdrawal (if in exit window)

#### **3.3 TPIA Detail Modal**
When user clicks "View Details", show comprehensive modal:

**Tab 1: Overview**
- All basic TPIA information
- Purchase date and approval date
- Maturity date and final maturity date
- Current cycle details
- Investment mode applied

**Tab 2: Cycle History**
- Table of all completed cycles
- Cycle number, date, profit amount, mode applied
- Cumulative profit chart
- Download cycle history CSV

**Tab 3: GDC & Logistics**
- Full GDC details
- Warehouse information
- Insurance certificate viewer/download
- Commodity NAV chart (historical pricing)

**Tab 4: Profit Projections**
- Estimated future value at maturity
- Breakdown of remaining cycles
- TPM vs EPS comparison calculator
- Exit window information (if applicable)

#### Data Sources:
```javascript
// Backend API: GET /api/tpias (user's TPIAs)
[{
  _id, tpiaNumber, commodityId, amount, currentValue,
  status, currentCycle, totalCycles, maturityDate,
  profitHistory: [{ cycleNumber, amount, date, mode }],
  gdc: { gdcCode, status, warehouse },
  insurancePolicyNumber, userMode,
  investmentPhase, nextExitWindowStart, nextExitWindowEnd
}]
```

---

### **Section 4: GDC Participation Overview**
**Purpose**: Show all GDCs the user is part of

#### Components:
1. **GDC Cards Grid**
   - GDC Code and commodity type
   - User's TPIAs in this GDC (e.g., "You own 3/10 TPIAs")
   - GDC status and current cycle
   - Next cycle date
   - Total value of user's TPIAs in this GDC
   - Click to view full GDC details

2. **GDC Timeline**
   - Visual timeline of all GDCs user has participated in
   - Show activation dates, completion dates
   - Highlight currently active GDCs

#### Data Sources:
```javascript
// Backend API: GET /api/gdcs/user-participation
[{
  gdcCode, commodityId, status, currentCycle,
  userTPIACount, userTotalValue, nextCycleDate,
  activationDate, warehouse
}]
```

---

### **Section 5: Earnings & Wallet Summary**
**Purpose**: Financial overview and wallet management

#### Components:
1. **Wallet Balance Card**
   - Total Balance
   - Available Balance
   - Earnings Balance (EPS mode)
   - Locked Balance (in TPIAs)
   - Quick actions: Deposit, Withdraw

2. **Earnings Breakdown**
   - Total Earnings (All-Time)
   - Earnings by Commodity
   - Earnings by Mode (TPM vs EPS)
   - Monthly earnings trend

3. **Recent Transactions**
   - Last 10 transactions
   - Filter by type: All, Deposits, Withdrawals, Profits, Purchases
   - Link to full transaction history

#### Data Sources:
```javascript
// Backend API: GET /api/wallet
{
  balance, earningsBalance, lockedBalance,
  ledger: [{ type, amount, date, reference }]
}
```

---

### **Section 6: Cycle Calendar & Timeline**
**Purpose**: Visual representation of all cycles and important dates

#### Components:
1. **Interactive Calendar**
   - Mark all cycle completion dates
   - Highlight next cycle dates
   - Show maturity dates
   - Color-coded by commodity or TPIA

2. **Upcoming Events**
   - Next 5 cycle completions
   - Upcoming exit windows
   - Maturity dates in next 90 days

3. **Cycle Performance Chart**
   - Bar chart showing profit per cycle
   - Trend line for average profit
   - Comparison across different commodities

---

### **Section 7: Referral & Growth**
**Purpose**: Referral program engagement

#### Components:
1. **Referral Stats**
   - Total referrals
   - Active referrals (with TPIAs)
   - Referral earnings (if applicable)
   - Referral leaderboard position

2. **Referral Code Card**
   - Large display of referral code
   - Copy button
   - Share buttons (WhatsApp, Email, Twitter)
   - QR code for easy sharing

3. **Referral History**
   - List of referred users (anonymized)
   - Their join date and status
   - Referral rewards earned

#### Data Sources:
```javascript
// Backend API: GET /api/users/referrals
{
  referralCode,
  totalReferrals,
  activeReferrals,
  referralEarnings,
  referredUsers: [{ joinDate, status, earnings }]
}
```

---

### **Section 8: Account Settings & Security**
**Purpose**: Personal information and security management

#### Components:
1. **Personal Information**
   - Full name, email, phone
   - Address information
   - Date of birth
   - Edit profile button

2. **KYC Status**
   - Current verification status
   - Documents uploaded
   - Verification date (if verified)
   - Upload/resubmit documents

3. **Security Settings**
   - Password change
   - Two-factor authentication (future)
   - Login history
   - Active sessions

4. **Bank Accounts**
   - Linked bank accounts
   - Add new bank account
   - Set default account for withdrawals

#### Data Sources:
```javascript
// Backend API: GET /api/users/profile
{
  fullName, email, phone, address, dateOfBirth,
  kycStatus, kycDocuments,
  bankAccounts: [{ bankName, accountNumber, accountName, isDefault }]
}
```

---

### **Section 9: Activity Feed & Notifications**
**Purpose**: Keep user informed of all activities

#### Components:
1. **Recent Activity Timeline**
   - TPIA purchases
   - Cycle completions
   - Deposits/Withdrawals
   - Profile updates
   - KYC status changes

2. **Notification Center**
   - Unread notifications count
   - Notification types: Cycle completion, Exit window, Maturity, System
   - Mark as read/unread
   - Notification preferences

#### Data Sources:
```javascript
// Backend API: GET /api/notifications
[{
  type, title, message, date, isRead, metadata
}]
```

---

## 🎨 UI/UX Design Principles

### Visual Design
1. **Premium Glassmorphic Cards**
   - Frosted glass effect with backdrop blur
   - Subtle gradients and shadows
   - Smooth border radius and spacing

2. **Color Scheme**
   - Primary: Amber/Gold (#F59E0B, #D97706)
   - Success: Emerald (#10B981)
   - Warning: Orange (#F97316)
   - Danger: Red (#EF4444)
   - Neutral: Gray scale for backgrounds

3. **Typography**
   - Headings: Bold, large, clear hierarchy
   - Body: Readable, consistent spacing
   - Numbers: Monospace for financial data

4. **Icons & Illustrations**
   - Lucide React icons throughout
   - Custom commodity icons
   - Achievement badge illustrations

### Interactions & Animations
1. **Smooth Transitions**
   - Fade-in on scroll
   - Slide-in for modals
   - Hover effects on cards
   - Loading skeletons

2. **Micro-interactions**
   - Button press feedback
   - Copy confirmation
   - Toggle switches
   - Progress bar animations

3. **Responsive Design**
   - Mobile-first approach
   - Tablet optimization
   - Desktop full experience
   - Adaptive layouts

---

## 🔧 Technical Implementation

### Frontend Structure
```
/app/[locale]/dashboard/profile/
  ├── page.tsx                 # Main profile page
  ├── components/
  │   ├── ProfileHero.tsx
  │   ├── InvestmentOverview.tsx
  │   ├── TPIAGrid.tsx
  │   ├── TPIACard.tsx
  │   ├── TPIADetailModal.tsx
  │   ├── GDCParticipation.tsx
  │   ├── EarningsWallet.tsx
  │   ├── CycleCalendar.tsx
  │   ├── ReferralSection.tsx
  │   ├── AccountSettings.tsx
  │   └── ActivityFeed.tsx
```

### Backend API Endpoints
```
GET  /api/users/profile           # User profile + stats
GET  /api/users/referrals         # Referral data
GET  /api/portfolio               # Portfolio summary
GET  /api/tpias                   # User's TPIAs
GET  /api/tpias/:id               # Single TPIA details
GET  /api/gdcs/user-participation # User's GDCs
GET  /api/wallet                  # Wallet data
GET  /api/notifications           # User notifications
GET  /api/users/activity          # Activity feed
```

### State Management
- Use React Context for user data
- Local state for UI interactions
- SWR or React Query for data fetching
- Optimistic updates for better UX

---

## 📱 Responsive Breakpoints

### Mobile (< 768px)
- Single column layout
- Stacked cards
- Simplified TPIA cards
- Bottom navigation for tabs
- Collapsible sections

### Tablet (768px - 1024px)
- Two-column grid
- Expanded TPIA cards
- Side-by-side charts
- Drawer navigation

### Desktop (> 1024px)
- Three-column grid
- Full TPIA cards with all details
- Side-by-side comparisons
- Sticky navigation
- Expanded charts and visualizations

---

## 🚀 Implementation Phases

### Phase 1: Core Profile (Week 1)
- [ ] Profile hero banner
- [ ] Investment overview dashboard
- [ ] Basic TPIA grid with filtering
- [ ] Wallet summary

### Phase 2: TPIA Deep Dive (Week 2)
- [ ] Advanced TPIA filtering and sorting
- [ ] TPIA detail modal with tabs
- [ ] Cycle history visualization
- [ ] GDC participation overview

### Phase 3: Earnings & Analytics (Week 3)
- [ ] Earnings breakdown
- [ ] Cycle calendar
- [ ] Performance charts
- [ ] Projected earnings calculator

### Phase 4: Social & Settings (Week 4)
- [ ] Referral section
- [ ] Activity feed
- [ ] Account settings
- [ ] Notification center

### Phase 5: Polish & Optimization (Week 5)
- [ ] Animations and micro-interactions
- [ ] Mobile optimization
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Testing and bug fixes

---

## 🎯 Success Metrics

### User Engagement
- Time spent on profile page
- Number of TPIA detail views
- Filter usage frequency
- Modal interactions

### Business Impact
- Increased user retention
- Higher TPIA purchase conversion
- Referral program engagement
- User satisfaction scores

---

## 🔐 Security & Privacy

### Data Protection
- Only show user's own data
- Secure API endpoints with JWT
- Sanitize all user inputs
- Encrypt sensitive information

### Privacy Controls
- Option to hide certain stats
- Control over referral visibility
- Data export functionality
- Account deletion option

---

## 📝 Content & Messaging

### Empty States
- "No TPIAs yet? Start your investment journey!"
- "No referrals yet? Share your code and earn together!"
- "No notifications? You're all caught up!"

### Success Messages
- "Profile updated successfully!"
- "Mode switched to TPM/EPS"
- "Referral code copied!"

### Error Handling
- Graceful fallbacks for missing data
- Clear error messages
- Retry mechanisms
- Support contact information

---

## 🌟 Future Enhancements

### Advanced Features
- [ ] Social sharing of achievements
- [ ] Comparison with platform averages
- [ ] Investment recommendations
- [ ] Personalized insights and tips
- [ ] Gamification elements
- [ ] Portfolio rebalancing suggestions
- [ ] Tax reporting tools
- [ ] Export portfolio to PDF

### Integrations
- [ ] Email digest of profile summary
- [ ] SMS notifications for important events
- [ ] WhatsApp integration for updates
- [ ] Calendar sync for cycle dates

---

## 📚 Related Documentation

- [GDIP - Complete Development Plan](/Users/harz/Documents/backUps/Vault37/docs/GDIP - Complete Development Plan for AI.md)
- [GDIP - Detailed User Stories](/Users/harz/Documents/backUps/Vault37/docs/GDIP - Detailed User Stories & Acceptance Criteria.md)
- [Feature Guide - Flexible Cycles](/Users/harz/Documents/backUps/Vault37/docs/Feature-Guide-Flexible-Cycles.md)
- [Backend Task Tracker](/Users/harz/Documents/backUps/Vault37/docs/GDIP Backend Development - Task Tracker.md)

---

## 🎨 Design Inspiration

### Reference Platforms
- **Robinhood**: Clean portfolio view, easy-to-read stats
- **Coinbase**: Asset breakdown, transaction history
- **Wealthfront**: Investment timeline, goal tracking
- **Stripe Dashboard**: Premium card design, data visualization
- **Linear**: Smooth animations, modern UI

### Design Elements to Incorporate
- Glassmorphism for depth
- Gradient accents for visual interest
- Smooth transitions for polish
- Clear data hierarchy
- Actionable insights, not just data dumps

---

## ✅ Next Steps

1. **Review this document** with the team
2. **Prioritize features** based on user needs
3. **Create wireframes** for key sections
4. **Design mockups** in Figma
5. **Set up component structure** in frontend
6. **Implement backend APIs** for profile data
7. **Build iteratively** following the phased approach
8. **Test thoroughly** on all devices
9. **Gather user feedback** and iterate
10. **Launch and monitor** engagement metrics

---

**Let's build the most comprehensive and beautiful user profile page in the commodity investment space! 🚀**
