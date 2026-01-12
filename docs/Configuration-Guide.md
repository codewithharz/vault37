# GDIP Configuration Guide

## Overview

The GDIP platform is highly configurable through environment variables, allowing you to adjust investment parameters, cycle durations, and system behavior without code changes.

## TPIA Investment Configuration

All TPIA (Trade Participation Investment Agreement) parameters can be configured via environment variables:

### Investment Economics

| Environment Variable | Default | Description | Impact |
|---------------------|---------|-------------|--------|
| `TPIA_INVESTMENT_AMOUNT` | 1000000 | Investment amount per TPIA (₦) | Base investment required from users |
| `TPIA_PROFIT_AMOUNT` | 50000 | Profit per cycle (₦) | Fixed return per 37-day cycle |
| `TPIA_CYCLE_DAYS` | 37 | Duration of each trading cycle (days) | Length of each profit cycle |
| **Penalties** | (Hardcoded) | **Logic:** Cycle 15 (40%), 18 (30%), 21 (20%) | Protects liquidity against early exits |
| `TPIA_TOTAL_CYCLES` | 24 | Total number of cycles | Complete investment lifecycle |
| `TPIA_CORE_CYCLES` | 12 | Mandatory cycles | Lock-in period duration |
| `TPIA_EXTENDED_CYCLES` | 12 | Optional cycles | Extended period duration |
| `TPIA_EXIT_WINDOW_INTERVAL` | 3 | Exit frequency | Cycles between exit windows |

### Calculated Values

The following values are **automatically calculated** from the configuration above:

| Calculated Value | Formula | Example |
|-----------------|---------|---------|
| **Profit Rate** | `TPIA_PROFIT_AMOUNT ÷ TPIA_INVESTMENT_AMOUNT` | 50,000 ÷ 1,000,000 = 0.05 (5%) |
| **Total Duration** | `TPIA_CYCLE_DAYS × TPIA_TOTAL_CYCLES` | 37 × 24 = 888 days |
| **Total Profit (EPS)** | `TPIA_PROFIT_AMOUNT × TPIA_TOTAL_CYCLES` | 50,000 × 24 = ₦1,200,000 |
| **Total ROI** | `(Total Profit ÷ Investment) × 100` | (1,200,000 ÷ 1,000,000) × 100 = 120% |

> **Note:** The profit rate is stored in Cycle records for historical tracking but is always calculated from `TPIA_PROFIT_AMOUNT` and `TPIA_INVESTMENT_AMOUNT`. If you change these values, new cycles will use the updated rate automatically.

### Approval Settings

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `TPIA_APPROVAL_MIN` | 30 | Minimum admin approval window (minutes) |
| `TPIA_APPROVAL_MAX` | 60 | Maximum admin approval window (minutes) |
| `TPIA_AUTO_APPROVE` | true | Enable auto-approval after max window |

### GDC Cluster Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `GDC_SIZE` | 10 | Number of TPIAs per GDC cluster |
| `GDC_INCREMENT` | 10 | GDC numbering increment (10, 20, 30...) |

## Configuration Examples

### Example 1: Higher Returns, Shorter Cycles

```bash
# 50% return per cycle, 30-day cycles, 20 total cycles
TPIA_INVESTMENT_AMOUNT=100000
TPIA_PROFIT_AMOUNT=50000
TPIA_CYCLE_DAYS=30
TPIA_TOTAL_CYCLES=20
```

**Result:**
- Investment: ₦100,000
- Profit per cycle: ₦50,000 (50%)
- Cycle duration: 30 days
- Total cycles: 20
- Total duration: 600 days (~1.6 years)
- Total profit (EPS): ₦1,000,000 (1000% ROI)

### Example 2: Conservative Returns, Longer Cycles

```bash
# 20% return per cycle, 45-day cycles, 30 total cycles
TPIA_INVESTMENT_AMOUNT=100000
TPIA_PROFIT_AMOUNT=20000
TPIA_CYCLE_DAYS=45
TPIA_TOTAL_CYCLES=30
```

**Result:**
- Investment: ₦100,000
- Profit per cycle: ₦20,000 (20%)
- Cycle duration: 45 days
- Total cycles: 30
- Total duration: 1,350 days (~3.7 years)
- Total profit (EPS): ₦600,000 (600% ROI)

### Example 3: Smaller Clusters, Faster Approval

```bash
# 5 TPIAs per cluster, instant auto-approval
GDC_SIZE=5
TPIA_APPROVAL_MIN=5
TPIA_APPROVAL_MAX=10
TPIA_AUTO_APPROVE=true
```

**Result:**
- Clusters fill faster (5 instead of 10)
- Auto-approval after 10 minutes
- Quicker cycle starts for CLUSTER mode

## Important Considerations

### Changing Investment Amount

⚠️ **Warning:** Changing `TPIA_INVESTMENT_AMOUNT` affects:
- User wallet balance requirements
- Minimum deposit amounts
- Transaction processing

**Recommendation:** Set this value before launch and avoid changing it for existing users.

### Changing Profit Amount

⚠️ **Warning:** Changing `TPIA_PROFIT_AMOUNT` affects:
- Expected returns calculations
- User expectations
- Financial projections

**Recommendation:** 
- Calculate carefully based on business model
- Ensure sustainability of profit distribution
- Consider market conditions

### Changing Total Cycles

⚠️ **Warning:** Changing `TPIA_TOTAL_CYCLES` affects:
- Investment maturity dates
- Long-term financial commitments
- User lifecycle expectations

**Recommendation:**
- Set this value based on business strategy
- Existing TPIAs will continue with their original cycle count
- New TPIAs will use the updated value

### Changing Cycle Duration

⚠️ **Warning:** Changing `TPIA_CYCLE_DAYS` affects:
- Profit distribution frequency
- Cash flow requirements
- User engagement patterns

**Recommendation:**
- Align with actual trading/commodity cycles
- Consider operational capacity
- Balance user expectations with business capability

## Calculating Total Returns

### Formula for Total ROI

```
Total Profit = TPIA_PROFIT_AMOUNT × TPIA_TOTAL_CYCLES
Total ROI % = (Total Profit / TPIA_INVESTMENT_AMOUNT) × 100
Total Duration (days) = TPIA_CYCLE_DAYS × TPIA_TOTAL_CYCLES
```

### Example Calculation (Default Values)

```
Investment: ₦1,000,000
Profit per Cycle: ₦50,000
Total Cycles: 24

Total Profit = ₦50,000 × 24 = ₦1,200,000
Total ROI = (₦1,200,000 / ₦1,000,000) × 100 = 120%
Total Duration = 37 days × 24 = 888 days (~2.4 years)
```

## Production Deployment Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Configure all TPIA parameters based on business model
- [ ] Test profit calculations with chosen values
- [ ] Verify GDC cluster size aligns with user acquisition projections
- [ ] Set appropriate approval windows
- [ ] Document chosen values for stakeholders
- [ ] Ensure database backups are configured
- [ ] Test cycle completion with production values

## Environment Variable Validation

The system validates environment variables on startup. If invalid values are provided:

- **Non-numeric values:** Falls back to defaults
- **Negative values:** May cause errors (validation recommended)
- **Zero values:** May cause division errors (avoid)

**Best Practice:** Always test configuration changes in development before production deployment.

## Monitoring Configuration Changes

After changing configuration:

1. **Restart the server** for changes to take effect
2. **Check server logs** for configuration values on startup
3. **Test TPIA purchase flow** to verify calculations
4. **Verify cycle completion** processes correctly
5. **Monitor profit distribution** matches expectations

## Support

For questions about configuration:
- Review this guide
- Check [API Documentation](file:///Users/harz/Documents/backUps/Vault37/docs/API-Documentation.md)
- See [Development Plan](file:///Users/harz/Documents/backUps/Vault37/docs/GDIP%20-%20Complete%20Development%20Plan%20for%20Cursor%20AI.md)
