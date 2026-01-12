import Commodity from '../models/Commodity.js';
import AppError from '../utils/AppError.js';

/**
 * Get all active commodities
 */
export const getActiveCommodities = async () => {
    return await Commodity.find({ isActive: true });
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
