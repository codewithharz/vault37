# User Profile Page - Architecture & Data Flow

## 📐 Component Hierarchy

```
ProfilePage
│
├── ProfileHero
│   ├── UserAvatar
│   ├── UserIdentity
│   │   ├── FullName + VerifiedBadge
│   │   ├── RoleBadge
│   │   ├── MemberSince
│   │   └── ReferralCode
│   ├── QuickStatsGrid
│   │   ├── PortfolioValueCard
│   │   ├── TotalTPIAsCard
│   │   ├── ActiveCyclesCard
│   │   ├── TotalProfitCard
│   │   ├── InvestmentModeCard
│   │   └── KYCStatusCard
│   └── AchievementBadges
│
├── InvestmentOverview
│   ├── PortfolioSummaryCard
│   │   ├── MetricsDisplay
│   │   └── GrowthChart
│   ├── AssetAllocationChart
│   │   └── InteractivePieChart
│   ├── EarningsTimeline
│   │   └── MonthlyProfitChart
│   └── InvestmentModeSwitcher
│       └── ModeComparisonCalculator
│
├── MyTPIAsSection
│   ├── TPIAFilterBar
│   │   ├── StatusFilter
│   │   ├── CommodityFilter
│   │   ├── PhaseFilter
│   │   ├── GDCFilter
│   │   ├── SortDropdown
│   │   └── ViewToggle
│   ├── TPIAGrid (or List/Table)
│   │   └── TPIACard[]
│   │       ├── TPIAHeader
│   │       ├── TPIAMetrics
│   │       ├── CycleProgress
│   │       ├── GDCInfo
│   │       ├── InsuranceInfo
│   │       └── ActionButtons
│   └── TPIADetailModal
│       ├── OverviewTab
│       ├── CycleHistoryTab
│       ├── GDCLogisticsTab
│       └── ProfitProjectionsTab
│
├── GDCParticipation
│   ├── GDCCardsGrid
│   │   └── GDCCard[]
│   └── GDCTimeline
│
├── EarningsWalletSection
│   ├── WalletBalanceCard
│   │   ├── BalanceDisplay
│   │   └── QuickActions
│   ├── EarningsBreakdown
│   │   ├── ByCommodityChart
│   │   └── ByModeChart
│   └── RecentTransactions
│       └── TransactionList
│
├── CycleCalendarSection
│   ├── InteractiveCalendar
│   ├── UpcomingEvents
│   └── CyclePerformanceChart
│
├── ReferralSection
│   ├── ReferralStatsCards
│   ├── ReferralCodeCard
│   │   ├── CodeDisplay
│   │   ├── CopyButton
│   │   ├── ShareButtons
│   │   └── QRCode
│   └── ReferralHistory
│
├── AccountSettingsSection
│   ├── PersonalInformation
│   ├── KYCStatus
│   ├── SecuritySettings
│   └── BankAccounts
│
└── ActivityFeed
    ├── RecentActivityTimeline
    └── NotificationCenter
```

---

## 🔄 Data Flow Architecture

```mermaid
graph TB
    subgraph Frontend
        A[Profile Page] --> B[Profile Hero]
        A --> C[Investment Overview]
        A --> D[My TPIAs Section]
        A --> E[GDC Participation]
        A --> F[Earnings & Wallet]
        A --> G[Cycle Calendar]
        A --> H[Referral Section]
        A --> I[Account Settings]
        A --> J[Activity Feed]
    end

    subgraph Backend APIs
        K[/api/users/profile]
        L[/api/portfolio]
        M[/api/tpias]
        N[/api/tpias/:id]
        O[/api/gdcs/user-participation]
        P[/api/wallet]
        Q[/api/users/referrals]
        R[/api/notifications]
        S[/api/users/activity]
    end

    subgraph Database
        T[(Users)]
        U[(TPIAs)]
        V[(GDCs)]
        W[(Wallets)]
        X[(Commodities)]
        Y[(Cycles)]
        Z[(Notifications)]
    end

    B --> K
    C --> L
    D --> M
    D --> N
    E --> O
    F --> P
    H --> Q
    J --> R
    J --> S

    K --> T
    L --> U
    L --> X
    M --> U
    M --> X
    M --> V
    N --> U
    N --> Y
    O --> V
    O --> U
    P --> W
    Q --> T
    R --> Z
    S --> T
    S --> U
    S --> W
```

---

## 📊 Data Models & Relationships

### User Profile Data Structure
```typescript
interface UserProfileData {
  // User Identity
  user: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
    role: 'user' | 'admin' | 'auditor' | 'accountant';
    kycStatus: 'pending' | 'verified' | 'rejected';
    mode: 'TPM' | 'EPS';
    referralCode: string;
    referredBy?: string;
    createdAt: Date;
    address?: {
      street: string;
      city: string;
      state: string;
      country: string;
    };
    dateOfBirth?: Date;
  };

  // Quick Stats
  stats: {
    totalPortfolioValue: number;
    totalTPIAs: number;
    activeCycles: number;
    totalProfitEarned: number;
    totalInvested: number;
    activeTPIAs: number;
    maturedTPIAs: number;
  };

  // Achievements
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: Date;
  }>;
}
```

### Portfolio Data Structure
```typescript
interface PortfolioData {
  summary: {
    totalInvested: number;
    currentValue: number;
    totalProfitEarned: number;
    overallROI: number;
    activeCount: number;
    maturedCount: number;
  };

  diversification: Array<{
    name: string;
    amount: number;
    count: number;
    percentage: number;
    icon: string;
    symbol: string;
  }>;

  performanceHistory: Array<{
    date: string;
    profit: number;
  }>;

  tpias: Array<{
    id: string;
    tpiaNumber: string;
    commodity: string;
    symbol: string;
    amount: number;
    currentValue: number;
    profit: number;
    status: string;
    maturityDate: Date;
    daysRemaining: number;
    currentCycle: number;
    totalCycles: number;
    insurancePolicyNumber: string;
    userMode: 'TPM' | 'EPS';
  }>;
}
```

### TPIA Detail Data Structure
```typescript
interface TPIADetail {
  _id: string;
  tpiaNumber: string;
  userId: string;
  commodityId: {
    _id: string;
    name: string;
    type: string;
    icon: string;
    symbol: string;
    navPrice: number;
  };
  gdcId: {
    _id: string;
    gdcCode: string;
    status: string;
    currentCycle: number;
    warehouse: {
      name: string;
      location: string;
      certificateUrl: string;
    };
  };
  amount: number;
  currentValue: number;
  status: 'pending' | 'active' | 'cycling' | 'matured';
  cycleStartMode: 'CLUSTER' | 'IMMEDIATE';
  currentCycle: number;
  totalCycles: number;
  purchaseDate: Date;
  approvalDate: Date;
  maturityDate: Date;
  finalMaturityDate: Date;
  insurancePolicyNumber: string;
  insuranceStatus: 'active' | 'claimed' | 'expired';
  userMode: 'TPM' | 'EPS';
  investmentPhase: 'CORE' | 'EXTENDED' | 'COMPLETED';
  nextExitWindowStart?: Date;
  nextExitWindowEnd?: Date;
  withdrawalRequested: boolean;
  profitHistory: Array<{
    cycleNumber: number;
    amount: number;
    date: Date;
    mode: 'TPM' | 'EPS';
  }>;
}
```

### GDC Participation Data Structure
```typescript
interface GDCParticipation {
  gdcCode: string;
  commodityId: {
    name: string;
    icon: string;
    symbol: string;
  };
  status: 'open' | 'filling' | 'full' | 'ready' | 'cycling' | 'completed';
  currentCycle: number;
  totalCycles: number;
  userTPIACount: number;
  userTotalValue: number;
  totalTPIAs: number;
  capacity: number;
  nextCycleDate?: Date;
  activationDate?: Date;
  completionDate?: Date;
  warehouse: {
    name: string;
    location: string;
  };
}
```

### Wallet Data Structure
```typescript
interface WalletData {
  balance: number;
  earningsBalance: number;
  lockedBalance: number;
  totalBalance: number;
  ledger: Array<{
    type: 'deposit' | 'withdrawal' | 'tpia_purchase' | 'profit' | 'refund';
    amount: number;
    balance: number;
    description: string;
    reference: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: Date;
  }>;
  bankAccounts: Array<{
    bankName: string;
    accountNumber: string;
    accountName: string;
    isDefault: boolean;
  }>;
}
```

### Referral Data Structure
```typescript
interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  referralEarnings: number;
  leaderboardPosition?: number;
  referredUsers: Array<{
    joinDate: Date;
    status: 'active' | 'inactive';
    hasTPIA: boolean;
    earnings: number;
  }>;
}
```

---

## 🎯 API Endpoint Specifications

### 1. GET /api/users/profile
**Purpose**: Fetch user profile data with stats and achievements

**Response**:
```json
{
  "success": true,
  "data": {
    "user": { /* User object */ },
    "stats": { /* Stats object */ },
    "achievements": [ /* Achievement array */ ]
  }
}
```

### 2. GET /api/portfolio
**Purpose**: Fetch portfolio summary and performance data

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": { /* Summary metrics */ },
    "diversification": [ /* Asset allocation */ ],
    "performanceHistory": [ /* Monthly profits */ ],
    "tpias": [ /* TPIA summaries */ ]
  }
}
```

### 3. GET /api/tpias
**Purpose**: Fetch all user TPIAs with filtering

**Query Parameters**:
- `status`: Filter by status
- `commodity`: Filter by commodity ID
- `phase`: Filter by investment phase
- `gdc`: Filter by GDC ID
- `sort`: Sort field
- `order`: Sort order (asc/desc)

**Response**:
```json
{
  "success": true,
  "data": {
    "tpias": [ /* TPIA array */ ],
    "total": 15,
    "filters": {
      "commodities": [ /* Available commodities */ ],
      "gdcs": [ /* Available GDCs */ ]
    }
  }
}
```

### 4. GET /api/tpias/:id
**Purpose**: Fetch detailed TPIA information

**Response**:
```json
{
  "success": true,
  "data": {
    "tpia": { /* Full TPIA object */ },
    "gdc": { /* GDC details */ },
    "commodity": { /* Commodity details */ },
    "projections": {
      "estimatedFinalValue": 2200000,
      "remainingCycles": 16,
      "estimatedProfit": 800000
    }
  }
}
```

### 5. GET /api/gdcs/user-participation
**Purpose**: Fetch all GDCs user is part of

**Response**:
```json
{
  "success": true,
  "data": {
    "gdcs": [ /* GDC participation array */ ],
    "total": 5
  }
}
```

### 6. GET /api/wallet
**Purpose**: Fetch wallet balance and transaction history

**Query Parameters**:
- `limit`: Number of transactions to return
- `type`: Filter by transaction type

**Response**:
```json
{
  "success": true,
  "data": {
    "balance": 500000,
    "earningsBalance": 150000,
    "lockedBalance": 3000000,
    "ledger": [ /* Transaction array */ ],
    "bankAccounts": [ /* Bank account array */ ]
  }
}
```

### 7. GET /api/users/referrals
**Purpose**: Fetch referral data and statistics

**Response**:
```json
{
  "success": true,
  "data": {
    "referralCode": "VAULT37ABC123",
    "totalReferrals": 12,
    "activeReferrals": 8,
    "referralEarnings": 50000,
    "referredUsers": [ /* Referred user array */ ]
  }
}
```

### 8. GET /api/notifications
**Purpose**: Fetch user notifications

**Query Parameters**:
- `unread`: Filter unread notifications
- `type`: Filter by notification type
- `limit`: Number of notifications

**Response**:
```json
{
  "success": true,
  "data": {
    "notifications": [ /* Notification array */ ],
    "unreadCount": 5,
    "total": 50
  }
}
```

### 9. GET /api/users/activity
**Purpose**: Fetch user activity timeline

**Query Parameters**:
- `limit`: Number of activities
- `type`: Filter by activity type

**Response**:
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "type": "tpia_purchase",
        "description": "Purchased TPIA-000123",
        "amount": 1000000,
        "timestamp": "2026-01-13T10:30:00Z",
        "metadata": { /* Additional data */ }
      }
    ],
    "total": 100
  }
}
```

---

## 🔐 Security Considerations

### Authentication
- All endpoints require valid JWT token
- User can only access their own profile data
- Admin endpoints separated with role-based access

### Data Privacy
- Sensitive information (bank accounts) encrypted
- KYC documents stored securely
- Referral data anonymized for privacy

### Rate Limiting
- Profile endpoint: 100 requests/hour
- TPIA endpoints: 200 requests/hour
- Wallet endpoint: 50 requests/hour

---

## ⚡ Performance Optimization

### Caching Strategy
- Cache user profile data for 5 minutes
- Cache portfolio summary for 2 minutes
- Real-time updates for wallet balance
- Invalidate cache on data mutations

### Lazy Loading
- Load TPIA details on demand
- Paginate transaction history
- Infinite scroll for activity feed
- Load charts only when visible

### Data Fetching
- Use SWR for automatic revalidation
- Prefetch related data
- Optimistic updates for better UX
- Background refresh for stale data

---

## 📱 Responsive Design Strategy

### Mobile (< 768px)
- Stack all sections vertically
- Simplified TPIA cards
- Collapsible sections
- Bottom sheet modals
- Touch-optimized interactions

### Tablet (768px - 1024px)
- Two-column grid layout
- Side-by-side charts
- Drawer for filters
- Expanded card details

### Desktop (> 1024px)
- Three-column grid layout
- Full-width charts
- Sticky navigation
- Hover interactions
- Keyboard shortcuts

---

**This architecture ensures a scalable, performant, and user-friendly profile page! 🚀**
