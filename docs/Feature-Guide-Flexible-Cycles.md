# Flexible Investment Cycles (12+12) Guide

## Overview
The new investment structure introduces a **Flexible 12+12 Model**, replacing the rigid 24-cycle lock-in. This gives users more control while maintaining long-term engagement.

### Key Concepts

| Phase | Cycles | Duration | Description |
|-------|--------|----------|-------------|
| **Core Phase** | 1-12 | ~444 days | Mandatory lock-in period. TPIA cannot be withdrawn. |
| **Extended Phase** | 13-24 | ~444 days | Optional continuation with quarterly exit opportunities. |

### Exit Windows & Penalties
During the **Extended Phase**, an **Exit Window** opens every 3 cycles. Withdrawals during these windows are subject to specific penalties to protect long-term capital and GDC integrity.

| Exit Window | Cycle | Penalty | Refund | Client Total* | ROI |
|-------------|-------|---------|--------|---------------|-----|
| Window 1 | 15 | 40% | ₦600,000 | ₦1,350,000 | 35% |
| Window 2 | 18 | 30% | ₦700,000 | ₦1,600,000 | 60% |
| Window 3 | 21 | 20% | ₦800,000 | ₦1,850,000 | 85% |
| Maturity | 24 | 0% | ₦1,000,000 | ₦2,200,000 | 120% |

*Client Total = Cumulative Profits + Principal Refund

- **Frequency:** Every 3 cycles (after Cycle 12, 15, 18, 21)
- **Duration:** 14 days (configurable via `TPIA_EXIT_WINDOW_DURATION`)
- **Action:** Users can request "Withdrawal" via the API/Dashboard.
- **Process:** If requested, the TPIA closes at the end of the *current* running cycle, and principal (minus penalty) + final profit is returned.

## Configuration
New environment variables in `.env`:

```bash
TPIA_CORE_CYCLES=12              # Duration of mandatory phase
TPIA_EXTENDED_CYCLES=12          # Duration of optional phase
TPIA_EXIT_WINDOW_INTERVAL=3      # Frequency of exit windows (in cycles)
TPIA_EXIT_WINDOW_DURATION=14     # Window open duration (in days)
```

## API Extensions

### Request Withdrawal
**Endpoint:** `POST /api/tpia/:id/withdraw`
**Description:** Request to exit the investment at the next opportunity.
**Conditions:**
- TPIA must be in `EXTENDED` phase.
- An Exit Window must be currently open.

## Lifecycle Example

1. **Purchase:** User buys TPIA.
2. **Cycle 1-12:** cycles run automatically. User earns profit.
3. **Cycle 12 Complete:** TPIA enters `EXTENDED` phase. **Exit Window 1 Opens**.
4. **User Decision:**
   - *Option A (Continue):* Do nothing. Cycle 13 starts. Investment continues.
   - *Option B (Withdraw):* Call withdraw endpoint. TPIA marked for exit.
     - Cycle 13 runs to completion.
     - At Cycle 13 end: TPIA completes, Principal + Final Profit returned.

## Database Changes
`TPIA` Schema additions:
- `investmentPhase`: 'CORE' | 'EXTENDED' | 'COMPLETED'
- `nextExitWindowStart`: Date
- `nextExitWindowEnd`: Date
- `withdrawalRequested`: Boolean
- `withdrawalRequestDate`: Date
