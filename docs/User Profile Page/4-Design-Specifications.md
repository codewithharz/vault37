# User Profile Page - UI/UX Design Specifications

> **Design System**: GDIP Premium Design Language  
> **Primary Colors**: Amber/Gold (#F59E0B, #D97706)  
> **Design Philosophy**: Premium, Data-Rich, Actionable

---

## 🎨 Design Principles

### 1. **Visual Hierarchy**
- **Primary Focus**: User's total portfolio value and key metrics
- **Secondary Focus**: TPIA grid and investment details
- **Tertiary Focus**: Supporting information (referrals, settings, activity)

### 2. **Information Density**
- Balance between comprehensive data and clean design
- Use progressive disclosure (show summary, reveal details on demand)
- Avoid overwhelming users with too much information at once

### 3. **Premium Aesthetics**
- Glassmorphic cards with subtle shadows
- Smooth gradients and transitions
- High-quality icons and illustrations
- Consistent spacing and alignment

### 4. **Actionable Design**
- Every data point should lead to an action
- Clear call-to-action buttons
- Contextual actions based on data state

---

## 🎨 Color Palette

### Primary Colors
```css
--amber-50:  #FFFBEB;  /* Lightest backgrounds */
--amber-100: #FEF3C7;  /* Hover states */
--amber-200: #FDE68A;  /* Borders, dividers */
--amber-500: #F59E0B;  /* Primary buttons, accents */
--amber-600: #D97706;  /* Button hover */
--amber-700: #B45309;  /* Active states */
```

### Semantic Colors
```css
--success-50:  #ECFDF5;
--success-500: #10B981;  /* Profit, positive change */
--success-700: #047857;

--danger-50:  #FEF2F2;
--danger-500: #EF4444;   /* Loss, negative change */
--danger-700: #B91C1C;

--warning-50:  #FFF7ED;
--warning-500: #F97316;  /* Pending, attention needed */
--warning-700: #C2410C;

--info-50:  #EFF6FF;
--info-500: #3B82F6;     /* Information, neutral */
--info-700: #1D4ED8;
```

### Neutral Colors
```css
--gray-50:  #F9FAFB;   /* Page background */
--gray-100: #F3F4F6;   /* Card backgrounds */
--gray-200: #E5E7EB;   /* Borders */
--gray-300: #D1D5DB;   /* Dividers */
--gray-400: #9CA3AF;   /* Placeholder text */
--gray-500: #6B7280;   /* Secondary text */
--gray-600: #4B5563;   /* Body text */
--gray-700: #374151;   /* Headings */
--gray-900: #111827;   /* Primary text */
```

---

## 📐 Typography

### Font Family
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Courier New', monospace; /* For numbers */
```

### Font Sizes
```css
--text-xs:   0.75rem;  /* 12px - Labels, captions */
--text-sm:   0.875rem; /* 14px - Body text, descriptions */
--text-base: 1rem;     /* 16px - Default body */
--text-lg:   1.125rem; /* 18px - Subheadings */
--text-xl:   1.25rem;  /* 20px - Card titles */
--text-2xl:  1.5rem;   /* 24px - Section headings */
--text-3xl:  1.875rem; /* 30px - Page title */
--text-4xl:  2.25rem;  /* 36px - Hero numbers */
--text-5xl:  3rem;     /* 48px - Large display */
```

### Font Weights
```css
--font-normal:    400;
--font-medium:    500;
--font-semibold:  600;
--font-bold:      700;
--font-extrabold: 800;
```

### Line Heights
```css
--leading-tight:  1.25;  /* Headings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.75; /* Descriptions */
```

---

## 📏 Spacing System

### Base Unit: 4px (0.25rem)

```css
--space-1:  0.25rem;  /* 4px */
--space-2:  0.5rem;   /* 8px */
--space-3:  0.75rem;  /* 12px */
--space-4:  1rem;     /* 16px */
--space-5:  1.25rem;  /* 20px */
--space-6:  1.5rem;   /* 24px */
--space-8:  2rem;     /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Component Spacing
- **Card Padding**: 24px (space-6)
- **Section Margin**: 48px (space-12)
- **Grid Gap**: 24px (space-6)
- **Button Padding**: 12px 24px (space-3 space-6)

---

## 🎴 Component Designs

### 1. Profile Hero Banner

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  [Avatar]  John Doe ✓                                       │
│            Investor · Member since Jan 2024                 │
│            Referral: VAULT37ABC123 [Copy]                   │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ ₦2.5M    │ │   15     │ │    8     │ │ ₦500K    │      │
│  │ Portfolio│ │  TPIAs   │ │  Active  │ │  Profit  │      │
│  │  Value   │ │          │ │  Cycles  │ │          │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│                                                             │
│  🏆 🎯 ⭐ 💎 [Achievement Badges]                           │
└─────────────────────────────────────────────────────────────┘
```

#### Specifications
- **Height**: Auto (min 280px)
- **Background**: Linear gradient from amber-50 to white
- **Avatar Size**: 80px × 80px
- **Avatar Border**: 3px solid amber-500
- **Stat Cards**: 4 columns on desktop, 2 on tablet, 1 on mobile
- **Card Background**: White with subtle shadow
- **Card Border Radius**: 12px
- **Achievement Badges**: 40px × 40px, grayscale if locked

---

### 2. Quick Stat Card

#### Visual Design
```
┌─────────────────────┐
│  [Icon]             │
│                     │
│  ₦2,500,000        │
│  Portfolio Value    │
│                     │
│  +12.5% ↗          │
└─────────────────────┘
```

#### Specifications
- **Size**: 200px × 140px (flexible)
- **Background**: White
- **Border**: 1px solid gray-200
- **Border Radius**: 12px
- **Shadow**: 0 1px 3px rgba(0,0,0,0.1)
- **Hover**: Scale 1.02, shadow increase
- **Icon Size**: 32px × 32px
- **Icon Color**: Amber-500
- **Number Font**: Mono, 2xl, bold
- **Label Font**: sm, medium, gray-600
- **Change Indicator**: sm, semibold, success-500 or danger-500

---

### 3. TPIA Card

#### Visual Design
```
┌──────────────────────────────────────────┐
│ TPIA-000123        [Rice Icon]    Active │
│ Rice                              Core   │
│                                          │
│ Base: ₦1,000,000  Current: ₦1,250,000  │
│ Profit: +₦250,000 (+25%)                │
│                                          │
│ ████████░░░░░░░░  Cycle 8/24 (33%)     │
│                                          │
│ GDC-10 · 10/10 · Lagos Warehouse        │
│ Insurance: TPIA-000123-XXXXXXXXXXXXX     │
│                                          │
│ Next Cycle: Jan 20, 2026 (7 days)      │
│                                          │
│ [View Details]  [Download Statement]    │
└──────────────────────────────────────────┘
```

#### Specifications
- **Size**: 360px × 420px (flexible)
- **Background**: White with glassmorphic effect
- **Border**: 1px solid gray-200
- **Border Radius**: 16px
- **Shadow**: 0 4px 6px rgba(0,0,0,0.05)
- **Hover**: Border color amber-500, shadow increase
- **Header**: Flex row, space-between
- **TPIA Number**: text-lg, font-bold, gray-900
- **Commodity Icon**: 32px × 32px
- **Status Badge**: Rounded pill, colored background
- **Progress Bar**: Height 8px, rounded, amber-500 fill
- **Action Buttons**: Full width, stacked, 8px gap

---

### 4. TPIA Detail Modal

#### Layout
```
┌────────────────────────────────────────────────────┐
│  TPIA-000123 Details                          [×]  │
├────────────────────────────────────────────────────┤
│  [Overview] [Cycle History] [GDC] [Projections]   │
├────────────────────────────────────────────────────┤
│                                                    │
│  [Tab Content Area]                                │
│                                                    │
│  - Overview: All TPIA details in grid             │
│  - Cycle History: Table with chart                │
│  - GDC: Warehouse info, insurance cert            │
│  - Projections: Calculator and charts             │
│                                                    │
└────────────────────────────────────────────────────┘
```

#### Specifications
- **Width**: 800px (max-width: 90vw)
- **Height**: 600px (max-height: 85vh)
- **Background**: White
- **Border Radius**: 20px
- **Shadow**: 0 20px 25px rgba(0,0,0,0.15)
- **Tabs**: Underline style, amber-500 active
- **Content Padding**: 32px
- **Scrollable**: Content area only

---

### 5. Investment Overview Section

#### Layout
```
┌─────────────────────────────────────────────────────┐
│  Investment Overview                                │
├─────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────────────┐│
│  │ Portfolio Summary│  │  Asset Allocation        ││
│  │                  │  │                          ││
│  │ Total: ₦2.5M    │  │  [Pie Chart]             ││
│  │ Profit: ₦500K   │  │                          ││
│  │ ROI: 25%        │  │  Rice: 40%               ││
│  │                  │  │  Sugar: 30%              ││
│  │ [Growth Chart]   │  │  Wheat: 30%              ││
│  └──────────────────┘  └──────────────────────────┘│
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Earnings Timeline                           │  │
│  │  [Line Chart showing monthly profits]        │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Investment Mode: TPM ⚡                      │  │
│  │  [Switch to EPS] [Learn More]                │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

#### Specifications
- **Grid**: 2 columns on desktop, 1 on mobile
- **Card Spacing**: 24px gap
- **Chart Colors**: Amber-500, Emerald-500, Blue-500
- **Chart Height**: 300px
- **Mode Switcher**: Prominent, with icon

---

### 6. TPIA Filter Bar

#### Layout
```
┌────────────────────────────────────────────────────────┐
│ [Status ▼] [Commodity ▼] [Phase ▼] [GDC ▼] [Sort ▼]  │
│                                         [Grid] [List]  │
└────────────────────────────────────────────────────────┘
```

#### Specifications
- **Height**: 56px
- **Background**: Gray-50
- **Border**: 1px solid gray-200
- **Border Radius**: 12px
- **Padding**: 12px 16px
- **Dropdowns**: Min-width 140px
- **View Toggle**: Icon buttons, amber-500 active

---

### 7. GDC Card

#### Visual Design
```
┌─────────────────────────────────┐
│ GDC-10                    [Icon]│
│ Rice Commodity                  │
│                                 │
│ You own 3/10 TPIAs              │
│ Total Value: ₦3,000,000        │
│                                 │
│ Status: Cycling                 │
│ Current Cycle: 8/24             │
│ Next Cycle: Jan 20, 2026        │
│                                 │
│ [View GDC Details]              │
└─────────────────────────────────┘
```

#### Specifications
- **Size**: 320px × 280px
- **Background**: White
- **Border**: 1px solid gray-200
- **Border Radius**: 12px
- **Highlight**: Left border 4px amber-500 if user has TPIAs

---

### 8. Wallet Balance Card

#### Visual Design
```
┌──────────────────────────────────────┐
│  My Wallet                           │
│                                      │
│  ₦650,000                           │
│  Total Balance                       │
│                                      │
│  ┌─────────┐ ┌─────────┐           │
│  │Available│ │Earnings │           │
│  │₦500,000 │ │₦150,000 │           │
│  └─────────┘ └─────────┘           │
│                                      │
│  Locked: ₦3,000,000 (in TPIAs)     │
│                                      │
│  [Deposit] [Withdraw]                │
└──────────────────────────────────────┘
```

#### Specifications
- **Size**: 400px × 320px
- **Background**: Gradient from amber-50 to white
- **Border Radius**: 16px
- **Shadow**: 0 4px 6px rgba(0,0,0,0.05)
- **Balance Font**: 4xl, bold, mono
- **Sub-balances**: Grid 2 columns

---

### 9. Referral Code Card

#### Visual Design
```
┌────────────────────────────────────┐
│  Your Referral Code                │
│                                    │
│  ┌──────────────────────────────┐ │
│  │  VAULT37ABC123               │ │
│  │                         [📋] │ │
│  └──────────────────────────────┘ │
│                                    │
│  Share via:                        │
│  [WhatsApp] [Email] [Twitter]      │
│                                    │
│  [QR Code]                         │
└────────────────────────────────────┘
```

#### Specifications
- **Size**: 360px × 380px
- **Code Display**: 
  - Font: Mono, 2xl, bold
  - Background: Gray-100
  - Padding: 16px
  - Border: 2px dashed amber-500
- **QR Code**: 200px × 200px, centered

---

## 🎭 Animations & Transitions

### Page Load
```css
/* Fade in from bottom */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.profile-section {
  animation: fadeInUp 0.5s ease-out;
  animation-fill-mode: both;
}

/* Stagger children */
.profile-section:nth-child(1) { animation-delay: 0.1s; }
.profile-section:nth-child(2) { animation-delay: 0.2s; }
.profile-section:nth-child(3) { animation-delay: 0.3s; }
```

### Card Hover
```css
.card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--amber-500);
}
```

### Button Press
```css
.button {
  transition: all 0.15s ease;
}

.button:active {
  transform: scale(0.95);
}
```

### Modal Entry
```css
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal {
  animation: modalSlideIn 0.3s ease-out;
}
```

### Loading Skeleton
```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f3f4f6 0%,
    #e5e7eb 50%,
    #f3f4f6 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

---

## 📱 Responsive Breakpoints

### Mobile (< 768px)
- Single column layout
- Stack all cards vertically
- Full-width buttons
- Bottom sheet for modals
- Simplified charts (smaller, fewer data points)
- Collapsible sections with accordions

### Tablet (768px - 1024px)
- Two-column grid for stats
- Side-by-side charts
- Drawer for filters
- Modal width: 90vw

### Desktop (> 1024px)
- Three-column grid for stats
- Full-width charts
- Sticky filter bar
- Modal width: 800px
- Hover interactions enabled

---

## 🎯 Interaction Patterns

### 1. **Copy to Clipboard**
```
User clicks copy button
→ Button icon changes to checkmark
→ Success toast: "Copied to clipboard!"
→ Icon reverts after 2 seconds
```

### 2. **Filter Application**
```
User selects filter
→ Loading skeleton appears
→ Data fetches in background
→ Results fade in
→ URL updates with query params
```

### 3. **Modal Opening**
```
User clicks "View Details"
→ Backdrop fades in
→ Modal slides in from center
→ Focus trapped inside modal
→ Escape key closes modal
```

### 4. **Mode Switching**
```
User clicks "Switch to EPS"
→ Confirmation modal appears
→ Shows impact calculator
→ User confirms
→ Loading state
→ Success message
→ UI updates to reflect new mode
```

---

## 🎨 Empty States

### No TPIAs
```
┌────────────────────────────────┐
│                                │
│        [Illustration]          │
│                                │
│   No investments yet!          │
│   Start your wealth journey    │
│                                │
│   [Browse Marketplace]         │
└────────────────────────────────┘
```

### No Referrals
```
┌────────────────────────────────┐
│                                │
│        [Illustration]          │
│                                │
│   Share your code and          │
│   grow together!               │
│                                │
│   [Copy Referral Code]         │
└────────────────────────────────┘
```

---

## ✅ Design Checklist

### Visual Design
- [ ] Consistent color usage
- [ ] Proper typography hierarchy
- [ ] Adequate spacing and alignment
- [ ] High-quality icons and illustrations
- [ ] Smooth transitions and animations

### User Experience
- [ ] Clear information hierarchy
- [ ] Intuitive navigation
- [ ] Accessible to all users
- [ ] Fast loading times
- [ ] Responsive on all devices

### Interactions
- [ ] Hover states for all interactive elements
- [ ] Loading states for async operations
- [ ] Error states with helpful messages
- [ ] Success confirmations
- [ ] Keyboard navigation support

### Accessibility
- [ ] ARIA labels for screen readers
- [ ] Keyboard navigation
- [ ] Color contrast ratio > 4.5:1
- [ ] Focus indicators
- [ ] Alt text for images

---

**This design system ensures a premium, cohesive, and delightful user experience! 🎨**
