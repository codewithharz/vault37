# User Profile Page - Implementation Roadmap

> **Project**: GDIP User Profile Page  
> **Start Date**: TBD  
> **Estimated Duration**: 5 weeks  
> **Team**: Full Stack Development

---

## 📋 Phase 1: Backend API Development (Week 1)

### 1.1 User Profile Service Enhancement
- [ ] **Create `getUserProfileWithStats` service method**
  - Aggregate user data with portfolio stats
  - Calculate achievement badges
  - Include referral information
  - **Estimated**: 4 hours
  - **Files**: `backend/src/services/userService.js`

- [ ] **Implement achievement system**
  - Define achievement criteria
  - Create achievement checker utility
  - Store achievements in user model or separate collection
  - **Estimated**: 6 hours
  - **Files**: `backend/src/services/achievementService.js`, `backend/src/models/Achievement.js`

- [ ] **Create profile stats aggregation**
  - Total portfolio value
  - Active cycles count
  - Total profit earned
  - **Estimated**: 3 hours
  - **Files**: `backend/src/services/userService.js`

### 1.2 TPIA Service Enhancement
- [ ] **Add advanced filtering to `getUserTPIAs`**
  - Filter by status, commodity, phase, GDC
  - Sort by multiple fields
  - Return filter metadata (available commodities, GDCs)
  - **Estimated**: 4 hours
  - **Files**: `backend/src/services/tpiaService.js`

- [ ] **Create `getTPIADetailById` service method**
  - Populate all related data (GDC, commodity, cycles)
  - Calculate projections
  - Include exit window information
  - **Estimated**: 5 hours
  - **Files**: `backend/src/services/tpiaService.js`

- [ ] **Add profit projection calculator**
  - Estimate final value at maturity
  - Calculate remaining cycles profit
  - TPM vs EPS comparison
  - **Estimated**: 4 hours
  - **Files**: `backend/src/utils/projectionCalculator.js`

### 1.3 GDC Service Enhancement
- [ ] **Create `getUserGDCParticipation` service method**
  - Find all GDCs containing user's TPIAs
  - Aggregate user's TPIA count and value per GDC
  - Include GDC status and cycle information
  - **Estimated**: 5 hours
  - **Files**: `backend/src/services/gdcService.js`

- [ ] **Add GDC timeline data**
  - Activation dates
  - Completion dates
  - Current status
  - **Estimated**: 2 hours
  - **Files**: `backend/src/services/gdcService.js`

### 1.4 Referral Service
- [ ] **Create referral service**
  - Get referral statistics
  - List referred users (anonymized)
  - Calculate referral earnings (if applicable)
  - **Estimated**: 6 hours
  - **Files**: `backend/src/services/referralService.js`

### 1.5 Activity & Notification Services
- [ ] **Create activity feed service**
  - Aggregate user activities (purchases, cycles, transactions)
  - Sort by timestamp
  - Paginate results
  - **Estimated**: 5 hours
  - **Files**: `backend/src/services/activityService.js`

- [ ] **Enhance notification service**
  - Add unread count
  - Filter by type
  - Mark as read functionality
  - **Estimated**: 3 hours
  - **Files**: `backend/src/services/notificationService.js`

### 1.6 API Controllers & Routes
- [ ] **Create profile controller**
  - `GET /api/users/profile` - User profile with stats
  - `GET /api/users/referrals` - Referral data
  - `GET /api/users/activity` - Activity feed
  - **Estimated**: 4 hours
  - **Files**: `backend/src/controllers/profileController.js`

- [ ] **Enhance TPIA controller**
  - `GET /api/tpias` - Add query parameters for filtering
  - `GET /api/tpias/:id` - Enhanced detail endpoint
  - **Estimated**: 3 hours
  - **Files**: `backend/src/controllers/tpiaController.js`

- [ ] **Create GDC participation controller**
  - `GET /api/gdcs/user-participation` - User's GDCs
  - **Estimated**: 2 hours
  - **Files**: `backend/src/controllers/gdcController.js`

- [ ] **Add routes to Express app**
  - Register all new routes
  - Add authentication middleware
  - Add validation middleware
  - **Estimated**: 2 hours
  - **Files**: `backend/src/routes/index.js`

### 1.7 Testing
- [ ] **Write unit tests for services**
  - Test profile stats calculation
  - Test TPIA filtering
  - Test GDC participation
  - **Estimated**: 6 hours
  - **Files**: `backend/tests/services/`

- [ ] **Write integration tests for APIs**
  - Test all new endpoints
  - Test authentication
  - Test error handling
  - **Estimated**: 6 hours
  - **Files**: `backend/tests/integration/`

**Phase 1 Total Estimated Time**: ~60 hours (1.5 weeks)

---

## 📋 Phase 2: Frontend Core Components (Week 2)

### 2.1 Project Setup
- [ ] **Create profile page route**
  - Add route to Next.js app
  - Set up page layout
  - Add to navigation menu
  - **Estimated**: 2 hours
  - **Files**: `frontend/src/app/[locale]/dashboard/profile/page.tsx`

- [ ] **Create component directory structure**
  ```
  /components/profile/
    ├── ProfileHero.tsx
    ├── InvestmentOverview.tsx
    ├── TPIASection/
    │   ├── TPIAGrid.tsx
    │   ├── TPIACard.tsx
    │   ├── TPIAFilterBar.tsx
    │   └── TPIADetailModal.tsx
    ├── GDCParticipation.tsx
    ├── EarningsWallet.tsx
    ├── CycleCalendar.tsx
    ├── ReferralSection.tsx
    ├── AccountSettings.tsx
    └── ActivityFeed.tsx
  ```
  - **Estimated**: 1 hour

### 2.2 Profile Hero Component
- [ ] **Build ProfileHero component**
  - User avatar with initials or image
  - User identity section
  - Quick stats grid (6 cards)
  - Achievement badges
  - **Estimated**: 8 hours
  - **Files**: `frontend/src/components/profile/ProfileHero.tsx`

- [ ] **Create QuickStatCard component**
  - Reusable stat card
  - Icon, label, value, change indicator
  - Hover effects
  - **Estimated**: 3 hours
  - **Files**: `frontend/src/components/profile/QuickStatCard.tsx`

- [ ] **Create AchievementBadge component**
  - Badge icon and name
  - Tooltip with description
  - Locked/unlocked states
  - **Estimated**: 3 hours
  - **Files**: `frontend/src/components/profile/AchievementBadge.tsx`

### 2.3 Investment Overview Component
- [ ] **Build InvestmentOverview component**
  - Portfolio summary card
  - Asset allocation pie chart
  - Earnings timeline chart
  - Investment mode switcher
  - **Estimated**: 10 hours
  - **Files**: `frontend/src/components/profile/InvestmentOverview.tsx`

- [ ] **Integrate Recharts for visualizations**
  - Pie chart for asset allocation
  - Line chart for earnings timeline
  - Bar chart for cycle performance
  - **Estimated**: 6 hours
  - **Files**: `frontend/src/components/profile/charts/`

- [ ] **Create InvestmentModeSwitcher component**
  - Toggle between TPM and EPS
  - Confirmation modal
  - Impact calculator
  - **Estimated**: 5 hours
  - **Files**: `frontend/src/components/profile/InvestmentModeSwitcher.tsx`

### 2.4 TPIA Section Components
- [ ] **Build TPIAFilterBar component**
  - Status filter dropdown
  - Commodity filter dropdown
  - Phase filter dropdown
  - GDC filter dropdown
  - Sort dropdown
  - View toggle (grid/list/table)
  - **Estimated**: 6 hours
  - **Files**: `frontend/src/components/profile/TPIASection/TPIAFilterBar.tsx`

- [ ] **Build TPIACard component**
  - TPIA header with number and commodity
  - Status and phase badges
  - Metrics display (amount, value, profit)
  - Cycle progress bar
  - GDC information
  - Insurance info
  - Action buttons
  - **Estimated**: 8 hours
  - **Files**: `frontend/src/components/profile/TPIASection/TPIACard.tsx`

- [ ] **Build TPIAGrid component**
  - Responsive grid layout
  - Loading states
  - Empty state
  - Pagination
  - **Estimated**: 4 hours
  - **Files**: `frontend/src/components/profile/TPIASection/TPIAGrid.tsx`

- [ ] **Build TPIADetailModal component**
  - Tabbed interface (4 tabs)
  - Overview tab
  - Cycle history tab with table
  - GDC & logistics tab
  - Profit projections tab
  - **Estimated**: 12 hours
  - **Files**: `frontend/src/components/profile/TPIASection/TPIADetailModal.tsx`

### 2.5 Data Fetching & State Management
- [ ] **Create API service functions**
  - `fetchUserProfile()`
  - `fetchPortfolio()`
  - `fetchTPIAs(filters)`
  - `fetchTPIADetail(id)`
  - `fetchGDCParticipation()`
  - `fetchWallet()`
  - `fetchReferrals()`
  - `fetchActivity()`
  - **Estimated**: 6 hours
  - **Files**: `frontend/src/services/profileService.ts`

- [ ] **Set up SWR hooks**
  - `useUserProfile()`
  - `usePortfolio()`
  - `useTPIAs(filters)`
  - `useGDCParticipation()`
  - **Estimated**: 4 hours
  - **Files**: `frontend/src/hooks/useProfile.ts`

- [ ] **Create filter state management**
  - Use React state for filters
  - Persist filters in URL query params
  - **Estimated**: 3 hours
  - **Files**: `frontend/src/hooks/useTPIAFilters.ts`

**Phase 2 Total Estimated Time**: ~81 hours (2 weeks)

---

## 📋 Phase 3: Additional Sections & Features (Week 3)

### 3.1 GDC Participation Component
- [ ] **Build GDCParticipation component**
  - GDC cards grid
  - GDC timeline visualization
  - Filter by commodity
  - **Estimated**: 8 hours
  - **Files**: `frontend/src/components/profile/GDCParticipation.tsx`

- [ ] **Create GDCCard component**
  - GDC code and commodity
  - User's TPIA count in GDC
  - GDC status and cycle info
  - Total value of user's TPIAs
  - Click to view details
  - **Estimated**: 5 hours
  - **Files**: `frontend/src/components/profile/GDCCard.tsx`

### 3.2 Earnings & Wallet Component
- [ ] **Build EarningsWallet component**
  - Wallet balance card
  - Earnings breakdown charts
  - Recent transactions list
  - Quick action buttons
  - **Estimated**: 8 hours
  - **Files**: `frontend/src/components/profile/EarningsWallet.tsx`

- [ ] **Create WalletBalanceCard component**
  - Total, available, earnings, locked balances
  - Visual balance breakdown
  - Deposit/Withdraw buttons
  - **Estimated**: 4 hours
  - **Files**: `frontend/src/components/profile/WalletBalanceCard.tsx`

- [ ] **Create EarningsBreakdown component**
  - Earnings by commodity chart
  - Earnings by mode (TPM/EPS) chart
  - Monthly earnings trend
  - **Estimated**: 6 hours
  - **Files**: `frontend/src/components/profile/EarningsBreakdown.tsx`

### 3.3 Cycle Calendar Component
- [ ] **Build CycleCalendar component**
  - Interactive calendar view
  - Mark cycle completion dates
  - Highlight upcoming cycles
  - Color-coded by commodity
  - **Estimated**: 10 hours
  - **Files**: `frontend/src/components/profile/CycleCalendar.tsx`

- [ ] **Create UpcomingEvents component**
  - List of next 5 cycle completions
  - Exit window notifications
  - Maturity dates
  - **Estimated**: 4 hours
  - **Files**: `frontend/src/components/profile/UpcomingEvents.tsx`

- [ ] **Create CyclePerformanceChart component**
  - Bar chart of profit per cycle
  - Trend line
  - Comparison across commodities
  - **Estimated**: 5 hours
  - **Files**: `frontend/src/components/profile/CyclePerformanceChart.tsx`

### 3.4 Referral Section Component
- [ ] **Build ReferralSection component**
  - Referral stats cards
  - Referral code display
  - Referral history table
  - **Estimated**: 8 hours
  - **Files**: `frontend/src/components/profile/ReferralSection.tsx`

- [ ] **Create ReferralCodeCard component**
  - Large code display
  - Copy button with animation
  - Share buttons (WhatsApp, Email, Twitter)
  - QR code generator
  - **Estimated**: 6 hours
  - **Files**: `frontend/src/components/profile/ReferralCodeCard.tsx`

- [ ] **Create ReferralHistory component**
  - Table of referred users
  - Join date and status
  - Referral rewards
  - **Estimated**: 4 hours
  - **Files**: `frontend/src/components/profile/ReferralHistory.tsx`

**Phase 3 Total Estimated Time**: ~68 hours (1.7 weeks)

---

## 📋 Phase 4: Settings, Activity & Polish (Week 4)

### 4.1 Account Settings Component
- [ ] **Build AccountSettings component**
  - Personal information section
  - KYC status section
  - Security settings section
  - Bank accounts section
  - **Estimated**: 10 hours
  - **Files**: `frontend/src/components/profile/AccountSettings.tsx`

- [ ] **Create PersonalInfoForm component**
  - Editable form fields
  - Validation
  - Save changes functionality
  - **Estimated**: 5 hours
  - **Files**: `frontend/src/components/profile/PersonalInfoForm.tsx`

- [ ] **Create KYCStatusCard component**
  - Current status display
  - Upload documents button
  - Verification progress
  - **Estimated**: 4 hours
  - **Files**: `frontend/src/components/profile/KYCStatusCard.tsx`

- [ ] **Create BankAccountsManager component**
  - List of bank accounts
  - Add new account form
  - Delete account
  - Set default account
  - **Estimated**: 6 hours
  - **Files**: `frontend/src/components/profile/BankAccountsManager.tsx`

### 4.2 Activity Feed Component
- [ ] **Build ActivityFeed component**
  - Recent activity timeline
  - Activity type icons
  - Pagination/infinite scroll
  - **Estimated**: 6 hours
  - **Files**: `frontend/src/components/profile/ActivityFeed.tsx`

- [ ] **Create ActivityItem component**
  - Activity icon and description
  - Timestamp
  - Metadata display
  - **Estimated**: 3 hours
  - **Files**: `frontend/src/components/profile/ActivityItem.tsx`

- [ ] **Create NotificationCenter component**
  - Notification list
  - Unread count badge
  - Mark as read
  - Filter by type
  - **Estimated**: 6 hours
  - **Files**: `frontend/src/components/profile/NotificationCenter.tsx`

### 4.3 Animations & Micro-interactions
- [ ] **Add page transitions**
  - Fade-in on mount
  - Smooth scrolling
  - Section reveal animations
  - **Estimated**: 4 hours
  - **Files**: `frontend/src/components/profile/page.tsx`

- [ ] **Add card hover effects**
  - Scale on hover
  - Shadow transitions
  - Border glow
  - **Estimated**: 3 hours
  - **Files**: Component CSS/Tailwind

- [ ] **Add loading skeletons**
  - Skeleton for each section
  - Shimmer effect
  - **Estimated**: 4 hours
  - **Files**: `frontend/src/components/profile/Skeletons.tsx`

- [ ] **Add empty states**
  - No TPIAs illustration
  - No referrals illustration
  - No notifications illustration
  - **Estimated**: 3 hours
  - **Files**: `frontend/src/components/profile/EmptyStates.tsx`

### 4.4 Responsive Design
- [ ] **Mobile optimization**
  - Single column layout
  - Collapsible sections
  - Bottom sheet modals
  - Touch-optimized interactions
  - **Estimated**: 8 hours
  - **Files**: All component files

- [ ] **Tablet optimization**
  - Two-column grid
  - Drawer for filters
  - Expanded cards
  - **Estimated**: 4 hours
  - **Files**: All component files

- [ ] **Desktop enhancements**
  - Three-column grid
  - Sticky navigation
  - Hover interactions
  - **Estimated**: 4 hours
  - **Files**: All component files

**Phase 4 Total Estimated Time**: ~70 hours (1.75 weeks)

---

## 📋 Phase 5: Testing, Optimization & Deployment (Week 5)

### 5.1 Testing
- [ ] **Unit tests for components**
  - Test ProfileHero rendering
  - Test TPIACard with different statuses
  - Test filter functionality
  - **Estimated**: 8 hours
  - **Files**: `frontend/src/components/profile/__tests__/`

- [ ] **Integration tests**
  - Test data fetching
  - Test user interactions
  - Test modal flows
  - **Estimated**: 6 hours
  - **Files**: `frontend/src/components/profile/__tests__/`

- [ ] **E2E tests with Playwright**
  - Test complete user journey
  - Test filtering and sorting
  - Test modal interactions
  - **Estimated**: 8 hours
  - **Files**: `frontend/tests/e2e/profile.spec.ts`

- [ ] **Accessibility testing**
  - Keyboard navigation
  - Screen reader compatibility
  - ARIA labels
  - Color contrast
  - **Estimated**: 4 hours

### 5.2 Performance Optimization
- [ ] **Code splitting**
  - Lazy load heavy components
  - Dynamic imports for modals
  - **Estimated**: 3 hours

- [ ] **Image optimization**
  - Use Next.js Image component
  - Lazy load images
  - Optimize commodity icons
  - **Estimated**: 2 hours

- [ ] **Bundle size optimization**
  - Analyze bundle
  - Remove unused dependencies
  - Tree-shake libraries
  - **Estimated**: 3 hours

- [ ] **Caching strategy**
  - Configure SWR cache
  - Implement stale-while-revalidate
  - Prefetch related data
  - **Estimated**: 4 hours

### 5.3 Internationalization
- [ ] **Add translation keys**
  - Profile page strings
  - TPIA section strings
  - Error messages
  - **Estimated**: 4 hours
  - **Files**: `frontend/src/messages/en.json`, `frontend/src/messages/fr.json`

- [ ] **Test French translations**
  - Verify all strings translated
  - Test layout with longer text
  - **Estimated**: 2 hours

### 5.4 Documentation
- [ ] **Write component documentation**
  - JSDoc comments
  - Props documentation
  - Usage examples
  - **Estimated**: 4 hours

- [ ] **Update user guide**
  - Profile page features
  - How to use filters
  - How to view TPIA details
  - **Estimated**: 3 hours
  - **Files**: `docs/User-Profile-Guide.md`

- [ ] **Update API documentation**
  - Document new endpoints
  - Add request/response examples
  - **Estimated**: 3 hours
  - **Files**: `docs/API-Documentation.md`

### 5.5 Deployment
- [ ] **Backend deployment**
  - Deploy new API endpoints
  - Run database migrations (if any)
  - Test in staging
  - **Estimated**: 3 hours

- [ ] **Frontend deployment**
  - Build production bundle
  - Deploy to Vercel
  - Test in production
  - **Estimated**: 2 hours

- [ ] **Monitoring setup**
  - Add error tracking
  - Set up analytics
  - Monitor performance
  - **Estimated**: 3 hours

**Phase 5 Total Estimated Time**: ~62 hours (1.5 weeks)

---

## 📊 Summary

### Total Estimated Time
- **Phase 1 (Backend)**: 60 hours (1.5 weeks)
- **Phase 2 (Frontend Core)**: 81 hours (2 weeks)
- **Phase 3 (Additional Features)**: 68 hours (1.7 weeks)
- **Phase 4 (Polish)**: 70 hours (1.75 weeks)
- **Phase 5 (Testing & Deployment)**: 62 hours (1.5 weeks)

**Total**: ~341 hours (~8.5 weeks with 1 developer, or ~4-5 weeks with 2 developers)

### Key Milestones
- ✅ **Week 1**: Backend APIs ready
- ✅ **Week 2-3**: Core frontend components built
- ✅ **Week 4**: Additional features implemented
- ✅ **Week 5**: Polish and testing complete
- ✅ **Week 5**: Deployed to production

### Success Criteria
- [ ] All 9 sections implemented and functional
- [ ] Responsive design works on all devices
- [ ] All API endpoints tested and documented
- [ ] Page load time < 2 seconds
- [ ] Accessibility score > 90
- [ ] Zero critical bugs
- [ ] User feedback positive (>4.5/5 rating)

---

## 🎯 Next Steps

1. **Review this roadmap** with the team
2. **Assign tasks** to developers
3. **Set up project tracking** (Jira, Linear, etc.)
4. **Create design mockups** in Figma
5. **Start Phase 1** backend development
6. **Daily standups** to track progress
7. **Weekly demos** to stakeholders
8. **Iterate based on feedback**

---

**Let's build an amazing User Profile page! 🚀**
