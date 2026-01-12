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
        }).populate('commodityId', 'name type icon navPrice');

        // 2. Initialize metrics
        let totalInvested = 0;
        let currentValue = 0;
        let totalProfitEarned = 0;
        const diversification = {};
        const activeTPIAs = [];

        // 3. Process TPIAs
        for (const tpia of tpias) {
            const amount = tpia.amount || 0;
            totalInvested += amount;

            let accruedProfit = 0;
            if (tpia.status === TPIA_STATUS.ACTIVE && tpia.approvalDate) {
                const daysElapsed = Math.floor((new Date() - new Date(tpia.approvalDate)) / (1000 * 60 * 60 * 24));
                const progress = Math.min(daysElapsed / 37, 1);
                accruedProfit = tpia.profitAmount * progress;
            } else if ([TPIA_STATUS.MATURED, TPIA_STATUS.COMPLETED].includes(tpia.status)) {
                accruedProfit = tpia.profitAmount;
            }

            currentValue += (amount + accruedProfit);
            totalProfitEarned += accruedProfit;

            // Diversification
            const commodityName = tpia.commodityId ? tpia.commodityId.name : 'Unlinked';
            if (!diversification[commodityName]) {
                diversification[commodityName] = {
                    amount: 0,
                    count: 0,
                    icon: tpia.commodityId ? tpia.commodityId.icon : ''
                };
            }
            diversification[commodityName].amount += amount;
            diversification[commodityName].count += 1;

            activeTPIAs.push({
                id: tpia._id,
                tpiaNumber: tpia.tpiaNumber,
                commodity: commodityName,
                amount: amount,
                status: tpia.status,
                maturityDate: tpia.maturityDate,
                daysRemaining: tpia.daysUntilMaturity
            });
        }

        // Format diversification for frontend charts
        const diversificationArray = Object.keys(diversification).map(name => ({
            name,
            value: diversification[name].amount,
            count: diversification[name].count,
            icon: diversification[name].icon
        }));

        const result = {
            summary: {
                totalInvested,
                currentValue,
                totalProfitEarned,
                overallROI: totalInvested > 0 ? (totalProfitEarned / totalInvested) * 100 : 0,
                activeCount: tpias.filter(t => t.status === TPIA_STATUS.ACTIVE).length,
            },
            diversification: diversificationArray,
            tpias: activeTPIAs
        };

        return result;
    } catch (error) {
        throw error;
    }
};
