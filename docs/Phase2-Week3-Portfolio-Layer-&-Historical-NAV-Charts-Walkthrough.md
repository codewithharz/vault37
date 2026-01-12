# Walkthrough: Phase 2 Week 3 - Portfolio Layer & Historical NAV Charts

This phase expands the GDIP system with robust data aggregation for user performance tracking, historical charting capabilities, and a foundational model for insurance claims.

## Key Accomplishments

### 1. User Portfolio Aggregation
- Implemented `portfolioService.js` to unify a user's entire investment portfolio.
- Dynamically calculates:
    - **Total Invested**: Sum of all active/pending TPIAs.
    - **Current Value**: Base amount + accrued profit (pro-rated based on days elapsed in cycle).
    - **Diversification**: Real-time breakdown of asset distribution by commodity.
- Exposed via `GET /api/users/portfolio` (Protected).

### 2. Historical NAV Tracking
- Updated `commodityService.js` to maintain a persistent `navHistory` log.
- New public endpoint `GET /api/commodities/:id/history` returns the full price trajectory of an asset.
- Implemented `calculateNAVChange` for ROI insights.

### 3. Insurance Claims Model
- Created `Claim.js` to handle asset protection workflows.
- Fields include `tpiaId`, `userId`, `claimAmount`, `reason`, `status`, and `proofUrls`.
- Added constraints to ensure only one active/pending claim per TPIA.

---

## Verification Results

### Automated Tests
The `test-phase2-week3.sh` script verified all core requirements:

```bash
🧪 GDIP Phase 2 Week 3 Verification
════════════════════════════════════════════════════════

📋 Test 1: Historical NAV Tracking
✓ History Count: 2
✅ SUCCESS: NAV History tracked correctly

📋 Test 2: Portfolio Aggregation
✓ Total Invested: 200000
✅ SUCCESS: Portfolio aggregation accurate
✅ SUCCESS: Diversification data included
```

### API Responses

#### Portfolio Summary
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalInvested": 200000,
      "currentValue": 200000,
      "totalProfitEarned": 0,
      "overallROI": 0,
      "activeCount": 0
    },
    "diversification": [
      { "name": "Gold", "value": 200000, "count": 2 }
    ]
  }
}
```

#### Commodity History
```json
{
  "success": true,
  "data": {
    "name": "Gold",
    "navHistory": [
      { "price": 100000, "updatedAt": "..." },
      { "price": 105000, "updatedAt": "..." }
    ]
  }
}
```
