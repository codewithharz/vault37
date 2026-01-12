import TPIA from '../models/TPIA.js';
import Commodity from '../models/Commodity.js';
import { TPIA_STATUS } from '../config/constants.js';

/**
 * Get unified portfolio for a user
 * @param {String} userId - User ID
 * @returns {Object} Portfolio data
 */
export const getUserPortfolio = async (userId) => {
    try {
        // 1. Get all user TPIAs (excluding cancelled)
        const tpias = await TPIA.find({
            userId,
            status: { $ne: TPIA_STATUS.CANCELLED }
        }).populate('commodityId', 'name type icon symbol navPrice');

        // 2. Initialize metrics
        let totalInvested = 0;
        let currentValue = 0;
        let totalProfitEarned = 0;
        const diversification = {};
        const activeTPIAs = [];

        // Month-by-month performance tracking
        const performanceMap = {};

        // 3. Process TPIAs
        for (const tpia of tpias) {
            const amount = tpia.amount || 0;
            totalInvested += amount;

            // Calculate accrued profit for current running cycle
            let accruedProfit = 0;
            if (tpia.status === TPIA_STATUS.ACTIVE && tpia.approvalDate) {
                const daysElapsed = Math.floor((new Date() - new Date(tpia.approvalDate)) / (1000 * 60 * 60 * 24));
                const progress = Math.min(daysElapsed / 37, 1);
                accruedProfit = tpia.profitAmount * progress;
            }

            // Add profits from completed cycles
            const completedCyclesProfit = tpia.profitHistory ?
                tpia.profitHistory.reduce((sum, h) => sum + (h.amount || 0), 0) : 0;

            const totalTpiaProfit = accruedProfit + completedCyclesProfit;
            currentValue += (amount + totalTpiaProfit);
            totalProfitEarned += totalTpiaProfit;

            // Process History for Growth Chart
            if (tpia.profitHistory && tpia.profitHistory.length > 0) {
                tpia.profitHistory.forEach(h => {
                    const date = new Date(h.date);
                    const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
                    if (!performanceMap[monthYear]) performanceMap[monthYear] = 0;
                    performanceMap[monthYear] += h.amount;
                });
            }

            // Diversification
            const commodity = tpia.commodityId;
            const commodityName = commodity ? commodity.name : 'Unknown';
            if (!diversification[commodityName]) {
                diversification[commodityName] = {
                    name: commodityName,
                    amount: 0,
                    count: 0,
                    icon: commodity ? commodity.icon : '',
                    symbol: commodity ? commodity.symbol : ''
                };
            }
            diversification[commodityName].amount += amount;
            diversification[commodityName].count += 1;

            activeTPIAs.push({
                id: tpia._id,
                tpiaNumber: tpia.tpiaNumber,
                commodity: commodityName,
                symbol: commodity ? commodity.symbol : '',
                amount: amount,
                currentValue: amount + totalTpiaProfit,
                profit: totalTpiaProfit,
                status: tpia.status,
                maturityDate: tpia.maturityDate,
                daysRemaining: tpia.daysUntilMaturity,
                currentCycle: tpia.currentCycle,
                totalCycles: tpia.totalCycles,
                insurancePolicyNumber: tpia.insurancePolicyNumber,
                userMode: tpia.userMode
            });
        }

        // Format diversification for frontend
        const diversificationArray = Object.values(diversification).map(d => ({
            ...d,
            percentage: totalInvested > 0 ? (d.amount / totalInvested) * 100 : 0
        }));

        // Format performance history for charts (last 6-12 months)
        const performanceHistory = Object.keys(performanceMap)
            .map(date => ({ date, profit: performanceMap[date] }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const result = {
            summary: {
                totalInvested,
                currentValue,
                totalProfitEarned,
                overallROI: totalInvested > 0 ? (totalProfitEarned / totalInvested) * 100 : 0,
                activeCount: tpias.filter(t => t.status === TPIA_STATUS.ACTIVE).length,
                maturedCount: tpias.filter(t => t.status === TPIA_STATUS.MATURED).length,
            },
            diversification: diversificationArray,
            performanceHistory,
            tpias: activeTPIAs
        };

        return result;
    } catch (error) {
        throw error;
    }
};
