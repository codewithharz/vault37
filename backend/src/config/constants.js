/**
 * GDIP Platform Constants
 * Configurable values for TPIA and GDC system
 */

// TPIA Configuration
export const TPIA_CONSTANTS = {
    // Investment amount (can be changed via env)
    INVESTMENT_AMOUNT: parseInt(process.env.TPIA_INVESTMENT_AMOUNT) || 1000000, // ₦1,000,000

    // Profit amount (can be changed via env)
    PROFIT_AMOUNT: parseInt(process.env.TPIA_PROFIT_AMOUNT) || 50000, // ₦50,000

    // Cycle duration in days
    CYCLE_DURATION_DAYS: parseInt(process.env.TPIA_CYCLE_DAYS) || 37,

    // Admin approval window (in minutes)
    ADMIN_APPROVAL_WINDOW_MIN: parseInt(process.env.TPIA_APPROVAL_MIN) || 30,
    ADMIN_APPROVAL_WINDOW_MAX: parseInt(process.env.TPIA_APPROVAL_MAX) || 60,

    // Auto-approve after max window
    AUTO_APPROVE_ENABLED: process.env.TPIA_AUTO_APPROVE !== 'false', // Default: true

    // Total lifecycle in cycles (can be changed via env)
    TOTAL_CYCLES: parseInt(process.env.TPIA_TOTAL_CYCLES) || 24,

    // Core (Mandatory) Investment Phase
    CORE_CYCLES: parseInt(process.env.TPIA_CORE_CYCLES) || 12,

    // Extended (Optional) Investment Phase
    EXTENDED_CYCLES: parseInt(process.env.TPIA_EXTENDED_CYCLES) || 12,

    // Exit Window Configuration
    EXIT_WINDOW_INTERVAL: parseInt(process.env.TPIA_EXIT_WINDOW_INTERVAL) || 3, // Every 3 cycles
    EXIT_WINDOW_DURATION_DAYS: parseInt(process.env.TPIA_EXIT_WINDOW_DURATION) || 14, // 2 weeks
    EXIT_PENALTIES: {
        15: 0.40, // Cycle 15 Exit: 40% Penalty (60% Return)
        18: 0.30, // Cycle 18 Exit: 30% Penalty (70% Return)
        21: 0.20, // Cycle 21 Exit: 20% Penalty (80% Return)
        24: 0.00  // Cycle 24 Exit: 0% Penalty (Full Maturity)
    }
};

// GDC Configuration
export const GDC_CONSTANTS = {
    // TPIAs per GDC
    TPIAS_PER_GDC: parseInt(process.env.GDC_SIZE) || 10,

    // GDC number increment
    GDC_NUMBER_INCREMENT: parseInt(process.env.GDC_INCREMENT) || 10,
};

// Platform Profit Economics (Arbitrage Model)
export const PLATFORM_ECONOMICS = {
    // Expected monthly arbitrage margin (e.g., 12.5%)
    MONTHLY_MARGIN_PERCENT: parseFloat(process.env.PLATFORM_ARBITRAGE_MARGIN) || 10.5,

    // Helper to get cycle yield based on 37-day cycle
    // (Margin * (CycleDays / 30))
    get CYCLE_YIELD_MULTIPLIER() {
        const cycleDays = TPIA_CONSTANTS.CYCLE_DURATION_DAYS || 37;
        return (this.MONTHLY_MARGIN_PERCENT / 100) * (cycleDays / 30);
    }
};

// Report Types
export const REPORT_TYPES = {
    TRANSACTION_SUMMARY: 'transaction_summary',
    PROFIT_DISTRIBUTION: 'profit_distribution',
    USER_ACQUISITION: 'user_acquisition',
    TPIA_SALES: 'tpia_sales',
    COMMODITY_PERFORMANCE: 'commodity_performance',
    CYCLE_LOGS: 'cycle_logs'
};

// Transaction Types
export const TRANSACTION_TYPES = {
    DEPOSIT: 'deposit',
    WITHDRAWAL: 'withdrawal',
    TPIA_PURCHASE: 'tpia_purchase',
    CYCLE_PROFIT: 'cycle_profit',
    REFUND: 'refund',
    MATURITY_RETURN: 'maturity_return',
};

// TPIA Status
export const TPIA_STATUS = {
    PENDING_APPROVAL: 'pending_approval', // Waiting for admin approval
    ACTIVE: 'active',                     // Approved, cycle running
    MATURED: 'matured',                   // 37 days completed
    COMPLETED: 'completed',               // Profit distributed
    CANCELLED: 'cancelled',               // Admin rejected
};

// GDC Status
export const GDC_STATUS = {
    FILLING: 'filling',  // 0-9 TPIAs
    FULL: 'full',        // 10 TPIAs
    ACTIVE: 'active',    // Cycle running
    COMPLETED: 'completed', // All cycles done
};

// User Modes
export const USER_MODES = {
    TPM: 'TPM', // Total Profit Mode - All returns to main balance
    EPS: 'EPS', // Earnings Profit Separation - Principal to balance, profit to earnings
};

// Cycle Start Modes
export const CYCLE_START_MODES = {
    CLUSTER: 'CLUSTER',     // Wait for GDC to be full
    IMMEDIATE: 'IMMEDIATE', // Start 37-day timer upon approval
};

// Helper Functions
export const calculateMaturityDate = (purchaseDate) => {
    const maturity = new Date(purchaseDate);
    // Maturity is after 24 cycles of 37 days each
    maturity.setDate(maturity.getDate() + (TPIA_CONSTANTS.CYCLE_DURATION_DAYS * TPIA_CONSTANTS.TOTAL_CYCLES));
    return maturity;
};

export const calculateAutoApprovalTime = (purchaseDate) => {
    const autoApprove = new Date(purchaseDate);
    autoApprove.setMinutes(autoApprove.getMinutes() + TPIA_CONSTANTS.ADMIN_APPROVAL_WINDOW_MAX);
    return autoApprove;
};

export const isWithinApprovalWindow = (purchaseDate) => {
    const now = new Date();
    const elapsed = (now - new Date(purchaseDate)) / (1000 * 60); // minutes
    return elapsed <= TPIA_CONSTANTS.ADMIN_APPROVAL_WINDOW_MAX;
};

export const shouldAutoApprove = (purchaseDate) => {
    if (!TPIA_CONSTANTS.AUTO_APPROVE_ENABLED) return false;
    const now = new Date();
    const elapsed = (now - new Date(purchaseDate)) / (1000 * 60); // minutes
    return elapsed >= TPIA_CONSTANTS.ADMIN_APPROVAL_WINDOW_MAX;
};
