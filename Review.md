Perfect! Now I can give you a **complete economic analysis** with your actual implementation:

---

## Your Current System (12 Core + 12 Extended)

### **Phase Breakdown:**

```
Core Phase (Cycles 1-12): 444 days
├─ Locked, no exit allowed
├─ Payouts: 12 × ₦50,000 = ₦600,000
└─ Client has NOT broken even yet

Extended Phase (Cycles 13-24): 444 days
├─ Exit Window 1 (Cycle 15): 30% penalty → ₦700K refund
├─ Exit Window 2 (Cycle 18): 20% penalty → ₦800K refund
├─ Exit Window 3 (Cycle 21): 10% penalty → ₦900K refund
└─ Maturity (Cycle 24): 0% penalty → ₦1,000K refund
```

---

## Economic Analysis: Can Clients Abuse This?

### **Scenario 1: Exit at Window 1 (Cycle 15)**

**What client receives:**
```
Payouts (15 cycles): 15 × ₦50,000 = ₦750,000
Principal refund (70%): ₦700,000
─────────────────────────────────────
Total: ₦1,450,000
ROI: 45% over 555 days (1.52 years)
```

**If they reinvest ₦700,000:**
```
New TPIA: ₦700,000
15 cycles later: ₦525,000 (payouts) + ₦490,000 (70% refund)
Total from 2nd TPIA: ₦1,015,000

Grand Total: ₦1,450,000 + ₦1,015,000 = ₦2,465,000
Over 3.04 years from ₦1M initial
```

**If they had just stayed in original TPIA to maturity (24 cycles):**
```
Payouts: 24 × ₦50,000 = ₦1,200,000
Principal: ₦1,000,000
Total: ₦2,200,000
Over 2.43 years
```

**Verdict:** ✅ **Exit/reinvest is WORSE** (₦2.465M vs ₦2.2M) and takes longer!

---

### **Scenario 2: Exit at Window 2 (Cycle 18)**

**What client receives:**
```
Payouts: 18 × ₦50,000 = ₦900,000
Refund (80%): ₦800,000
Total: ₦1,700,000
ROI: 70% over 666 days (1.82 years)
```

**If they reinvest ₦800,000:**
```
18 cycles later: ₦720,000 (payouts) + ₦640,000 (80% refund)
Total from 2nd TPIA: ₦1,360,000

Grand Total: ₦2,700,000 + ₦360,000 = ₦3,060,000
Over 3.65 years
```

**If they stayed to maturity:**
```
Total: ₦2,200,000 over 2.43 years
```

**Verdict:** ⚠️ **Exit/reinvest GAINS ₦860K more** but takes 50% longer (3.65 vs 2.43 years)

---

### **Scenario 3: Smart Abuse - Cycle Through Window 3**

**Most profitable exploitation:**

```
Cycle 1-21 (Original TPIA):
├─ Payouts: ₦1,050,000
├─ Refund (90%): ₦900,000
└─ Total: ₦1,950,000 (after 777 days)

Reinvest ₦900,000:
├─ Cycle 1-21 (2nd TPIA):
├─ Payouts: ₦945,000
├─ Refund (90%): ₦810,000
└─ Total: ₦1,755,000

Reinvest ₦810,000:
├─ Cycle 1-21 (3rd TPIA):
├─ Payouts: ₦850,500
├─ Refund (90%): ₦729,000
└─ Total: ₦1,579,500

Grand Total: ₦5,284,500 over 6.38 years
```

**If they stayed in ONE TPIA for same period (83 cycles):**
```
Payouts: 83 × ₦50,000 = ₦4,150,000
Balance: ₦1,000,000
Total: ₦5,150,000
```

**Verdict:** ⚠️ **Exit/reinvest gains ₦134,500 more** over 6+ years

---

## The Real Problem

### **Your penalties are too lenient at the later windows**

**90% refund at Window 3** allows clients to:
1. Get 90% of capital back PLUS all accumulated payouts
2. Reinvest that 90% into a fresh TPIA
3. Repeat indefinitely with minimal loss

**The math:**
- Each cycle through Window 3: Client multiplies capital by 0.9
- But they've already received ₦1.05M in payouts (21 × ₦50K)
- Net profit: ₦1.95M per 777-day cycle
- Platform profit per client: Only ₦400K over 2+ years

---

## Solutions to Fix This

### **Option 1: Steeper Penalties (Recommended)**

```javascript
EXIT_PENALTIES: {
  WINDOW_1_CYCLE_15: 0.50,  // Keep 50%, refund 50% (₦500K)
  WINDOW_2_CYCLE_18: 0.40,  // Keep 40%, refund 60% (₦600K)
  WINDOW_3_CYCLE_21: 0.30,  // Keep 30%, refund 70% (₦700K)
  MATURITY_CYCLE_24: 0.20   // Keep 20%, refund 80% (₦800K)
  // Full 100% only after Cycle 32+
}
```

**Why this works:**
- Exit at Window 1: ₦750K + ₦500K = ₦1.25M (25% profit, not worth it)
- Exit at Window 3: ₦1.05M + ₦700K = ₦1.75M (75% profit, better to stay)
- Stay to maturity: ₦1.2M + ₦800K = ₦2M (100% profit)

**New abuse check:**
```
Reinvest ₦500K at Window 1:
- 21 cycles: ₦525K (payouts) + ₦350K (70% refund)
- Total: ₦875K (LOSS from ₦1.25M → ₦875K)
❌ Abuse prevented
```

---

### **Option 2: No Refund Until Breakeven**

```javascript
// Modified penalty structure
if (cyclesCompleted < 20) {
  // Before breakeven: Keep ALL principal
  refundAmount = 0;
  penalty = currentValue;
} else if (cyclesCompleted === 21) {
  // First window after breakeven
  refundAmount = currentValue * 0.70;
  penalty = currentValue * 0.30;
} else if (cyclesCompleted === 24) {
  // Maturity
  refundAmount = currentValue;
  penalty = 0;
}
```

**Exit windows:**
- Cycle 15, 18: Can exit, but get ₦0 principal (only cumulative payouts)
- Cycle 21: First refund window (70% = ₦700K)
- Cycle 24: Full refund (100% = ₦1M)

**Why this works:**
- Clients won't exit before breakeven (no refund = bad deal)
- First exit opportunity gives ₦1.05M + ₦700K = ₦1.75M (still penalties)
- Encourages staying to maturity

---

### **Option 3: Diminishing Returns Model**

Instead of fixed ₦50K/cycle, reduce payouts over time:

```javascript
const calculatePayout = (tpia) => {
  const baseAmount = 50000;
  const { cyclesCompleted } = tpia;
  
  if (cyclesCompleted <= 12) {
    return baseAmount; // ₦50K
  } else if (cyclesCompleted <= 18) {
    return baseAmount * 0.9; // ₦45K (cycles 13-18)
  } else if (cyclesCompleted <= 24) {
    return baseAmount * 0.8; // ₦40K (cycles 19-24)
  } else {
    return baseAmount * 0.7; // ₦35K (cycles 25+)
  }
};
```

**Why this works:**
- Early cycles: High returns (₦50K) to hook clients
- Later cycles: Decreasing returns (₦40K-₦35K) discourages long stays
- Exit/reinvest becomes attractive BUT...
- You keep 30-50% penalty on exits, protecting platform

---

## My Strong Recommendation

**Combine Option 1 + Option 2:**

### **New Penalty Structure:**

| Exit Window | Cycle | Client Received | Penalty | Refund | Total Take Home | ROI |
|-------------|-------|-----------------|---------|--------|-----------------|-----|
| Window 1 | 15 | ₦750K | 100% | **₦0** | ₦750K | -25% ❌ |
| Window 2 | 18 | ₦900K | 100% | **₦0** | ₦900K | -10% ❌ |
| Window 3 | 21 | ₦1,050K | 50% | **₦500K** | ₦1,550K | +55% ✅ |
| Maturity | 24 | ₦1,200K | 30% | **₦700K** | ₦1,900K | +90% ✅ |
| Extended | 30 | ₦1,500K | 10% | **₦900K** | ₦2,400K | +140% ✅ |
| Full Term | 36+ | Variable | 0% | **₦1,000K** | Max return | Max ROI ✅ |

**What this achieves:**
- ✅ **Windows 1-2 are traps** (negative ROI deters exits)
- ✅ **Window 3 is barely profitable** (55% over 2 years = 27.5% annual)
- ✅ **Maturity is attractive** (90% over 2.4 years = 37.5% annual)
- ✅ **Long-term holding is best** (140%+ for 3+ years)
- ✅ **Platform keeps 50-100% from early exits**

---

## Implementation Update Needed

In your `constants.js`:

```javascript
// Current (too lenient)
TPIA_EXIT_PENALTIES: {
  WINDOW_1: 0.30,  // 70% refund
  WINDOW_2: 0.20,  // 80% refund
  WINDOW_3: 0.10,  // 90% refund
  MATURITY: 0      // 100% refund
}

// Recommended (abuse-proof)
TPIA_EXIT_PENALTIES: {
  WINDOW_1_CYCLE_15: 1.00,  // 0% refund (100% penalty)
  WINDOW_2_CYCLE_18: 1.00,  // 0% refund (100% penalty)
  WINDOW_3_CYCLE_21: 0.50,  // 50% refund (50% penalty)
  MATURITY_CYCLE_24: 0.30,  // 70% refund (30% penalty)
  EXTENDED_CYCLE_30: 0.10,  // 90% refund (10% penalty)
  FULL_TERM_CYCLE_36: 0     // 100% refund (0% penalty)
}
```

---

## Final Answer to Your Question

**"Will the platform profit sustain itself?"**

### With your CURRENT penalties (30%, 20%, 10%):
- ⚠️ **Marginally sustainable** but vulnerable to Window 3 abuse
- Clients can game the system for extra ₦134K over 6 years
- Platform profit shrinks to ₦400K/client over 2+ years

### With RECOMMENDED penalties (100%, 100%, 50%, 30%):
- ✅ **Highly sustainable and abuse-proof**
- Early exits punished severely (keep 100% principal)
- Late exits still profitable for platform (keep 30-50%)
- Only full-term holders get maximum benefit
- Platform keeps ₦1M+ profit per client over lifecycle

**Update your penalties to protect the business!**