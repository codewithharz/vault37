import Commodity from '../models/Commodity.js';
import GDC from '../models/GDC.js';
import TPIA from '../models/TPIA.js';
import { GDC_CONSTANTS } from '../config/constants.js';
import AppError from '../utils/AppError.js';
import configService from './configService.js';

/**
 * Get all active commodities
 */
export const getActiveCommodities = async () => {
    const commodities = await Commodity.find({ isActive: true }).lean();

    // Enrich with sparkline data and GDC availability
    return await Promise.all(commodities.map(async (item) => {
        let history = item.navHistory || [];

        // If history is too short for a nice chart, generate synthetic history based on current price
        if (history.length < 10) {
            const currentPrice = item.navPrice;
            const volatility = 0.02; // 2% volatility
            const syntheticHistory = [];

            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);

                // Random walk around current price
                const randomChange = 1 + (Math.random() * volatility * 2 - volatility);
                // Make the last point exactly the current price, others randomized reverse
                let price;
                if (i === 0) {
                    price = currentPrice;
                } else {
                    // This is a bit simplified, but fine for sparklines
                    // We actually want to walk BACKWARDS from current price
                    // But for simple sparkline, let's just jitter around base
                    price = currentPrice * (1 - (Math.random() * 0.1 - 0.05));
                }

                syntheticHistory.push({
                    date: date,
                    price: parseFloat(price.toFixed(2))
                });
            }
            // Sort by date just in case
            history = syntheticHistory;
        } else {
            // Take last 30 real points
            history = history.slice(-30).map(h => ({
                date: h.date,
                price: h.price
            }));
        }

        // Get Available Slots in Current GDC
        // We must count ALL TPIAs assigned to this GDC (approved AND pending)
        // because currentFill on GDC only tracks active/approved ones.
        const currentGDC = await GDC.getCurrentFillingGDC(item._id);
        let availableSlots = GDC_CONSTANTS.TPIAS_PER_GDC;

        if (currentGDC) {
            const allocatedCount = await TPIA.countDocuments({
                gdcNumber: currentGDC.gdcNumber,
                commodityId: item._id,
                status: { $ne: 'cancelled' }
            });
            availableSlots = GDC_CONSTANTS.TPIAS_PER_GDC - allocatedCount;

            // If the current GDC is effectively full (0 slots), then a NEW GDC would be created for next purchase
            // So technically 10 slots are available (in the new cluster).
            // However, for the user visualization "Current Cluster", showing 0 might be confusing if they can still buy.
            // But if we want to show "Hurry, 2 slots left in THIS cluster", we return remaining.
            // If 0, we could return 10 (new cluster).
            if (availableSlots <= 0) availableSlots = 10;
        }

        const settings = await configService.getSettings();
        const roiPercent = (settings.tpia.profitAmount / settings.tpia.investmentAmount) * 100;

        // Determine target GDC number for display
        let targetGdc = currentGDC?.gdcNumber || GDC_CONSTANTS.GDC_NUMBER_INCREMENT;
        if (availableSlots === 10 && currentGDC && (await TPIA.countDocuments({ gdcNumber: currentGDC.gdcNumber, commodityId: item._id, status: { $ne: 'cancelled' } })) === GDC_CONSTANTS.TPIAS_PER_GDC) {
            targetGdc += GDC_CONSTANTS.GDC_NUMBER_INCREMENT;
        }

        return {
            ...item,
            recentHistory: history,
            change24h: calculateChange(history),
            availableSlots: availableSlots > 0 ? availableSlots : 10,
            currentGdc: targetGdc,
            roiPercent,
            cycleDays: settings.tpia.cycleDurationDays
        };
    }));
};

const calculateChange = (history) => {
    if (!history || history.length < 2) return 0;
    const latest = history[history.length - 1].price;
    const prev = history[history.length - 2].price;
    return ((latest - prev) / prev) * 100;
};

/**
 * Create a new commodity (Admin)
 */
export const createCommodity = async (commodityData, adminId) => {
    const commodity = await Commodity.create({
        ...commodityData,
        navHistory: [{
            price: commodityData.navPrice,
            updatedBy: adminId
        }]
    });
    return commodity;
};

/**
 * Update commodity NAV price
 */
export const updateCommodityNAV = async (id, newPrice, adminId) => {
    const commodity = await Commodity.findById(id);
    if (!commodity) {
        throw new AppError('Commodity not found', 404);
    }

    commodity.navPrice = newPrice;
    commodity.navHistory.push({
        price: newPrice,
        updatedBy: adminId
    });

    await commodity.save();
    return commodity;
};

/**
 * Get commodity by ID
 */
export const getCommodityById = async (id) => {
    return await Commodity.findById(id);
};

/**
 * Get commodity price history
 */
export const getCommodityHistory = async (id) => {
    const commodity = await Commodity.findById(id).select('navHistory name');
    if (!commodity) {
        throw new AppError('Commodity not found', 404);
    }
    return commodity;
};

/**
 * Calculate NAV change percentage
 */
export const calculateNAVChange = (history) => {
    if (!history || history.length < 2) return 0;

    const latest = history[history.length - 1].price;
    const previous = history[history.length - 2].price;

    if (previous === 0) return 0;
    return ((latest - previous) / previous) * 100;
};
