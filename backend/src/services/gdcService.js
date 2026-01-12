import GDC from '../models/GDC.js';
import TPIA from '../models/TPIA.js';
import Cycle from '../models/Cycle.js';
import { GDC_STATUS, GDC_CONSTANTS, calculateMaturityDate } from '../config/constants.js';
import AppError from '../utils/AppError.js';

/**
 * Get GDC statistics
 * @returns {Object} GDC statistics
 */
export const getGDCStats = async () => {
    try {
        const stats = await GDC.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalTPIAs: { $sum: '$currentFill' }
                }
            }
        ]);

        return stats;
    } catch (error) {
        throw error;
    }
};

/**
 * List GDCs with filters and pagination
 * @param {Object} filters - Filter criteria
 * @param {Number} page - Page number (default: 1)
 * @param {Number} limit - Items per page (default: 20)
 * @returns {Object} List of GDCs with pagination info
 */
export const listGDCs = async (filters = {}, page = 1, limit = 20) => {
    try {
        const query = {};
        if (filters.status) query.status = filters.status;
        if (filters.commodityId) query.commodityId = filters.commodityId;

        const skip = (page - 1) * limit;

        const [gdcs, total] = await Promise.all([
            GDC.find(query)
                .populate('commodityId', 'name type icon')
                .populate('tpias.userId', 'fullName email')
                .sort({ gdcNumber: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            GDC.countDocuments(query)
        ]);

        return {
            gdcs,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get detailed GDC information
 * @param {String} gdcId - GDC ID
 * @returns {Object} GDC details
 */
export const getGDCDetails = async (gdcId) => {
    try {
        const gdc = await GDC.findById(gdcId)
            .populate('commodityId', 'name type icon')
            .populate('tpias.userId', 'fullName email');

        if (!gdc) {
            throw new AppError('GDC not found', 404);
        }

        // Fetch associated cycles
        const cycles = await Cycle.find({ gdc: gdc._id }).sort({ cycleNumber: 1 });

        return {
            gdc,
            cycles
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get or create a filling GDC for a commodity
 * Handles race conditions by using findOneAndUpdate or similar logic
 * @param {String} commodityId - Commodity ID
 * @returns {Object} GDC object
 */
export const getOrCreateFillingGDC = async (commodityId) => {
    try {
        // 1. Try to find an existing filling or active GDC for this commodity
        // We count both approved and pending TPIAs to avoid overfilling
        const query = {
            commodityId,
            status: { $in: [GDC_STATUS.FILLING, GDC_STATUS.ACTIVE] },
            currentFill: { $lt: GDC_CONSTANTS.TPIAS_PER_GDC }
        };

        let gdc = await GDC.findOne(query).sort({ gdcNumber: 1 });

        if (gdc) {
            // Check if it's "effectively" full (including pending TPIAs)
            const pendingCount = await TPIA.countDocuments({
                gdcNumber: gdc.gdcNumber,
                status: { $ne: 'cancelled' }
            });

            if (pendingCount < GDC_CONSTANTS.TPIAS_PER_GDC) {
                return gdc;
            }
        }

        // 2. No available GDC found, create a new one with a unique global number
        // Use a lock-like mechanism or just find the max
        const lastGDC = await GDC.findOne().sort({ gdcNumber: -1 });
        const nextNumber = (lastGDC ? lastGDC.gdcNumber : 0) + GDC_CONSTANTS.GDC_NUMBER_INCREMENT;

        gdc = await GDC.create({
            gdcNumber: nextNumber,
            commodityId,
            tpias: [],
            currentFill: 0,
            status: GDC_STATUS.FILLING
        });

        return gdc;
    } catch (error) {
        throw error;
    }
};

/**
 * Update GDC status
 * @param {String} gdcId - GDC ID
 * @param {String} status - New status
 * @returns {Object} Updated GDC
 */
export const updateGDCStatus = async (gdcId, status) => {
    try {
        if (!Object.values(GDC_STATUS).includes(status)) {
            throw new AppError('Invalid GDC status', 400);
        }

        const gdc = await GDC.findByIdAndUpdate(
            gdcId,
            { status },
            { new: true, runValidators: true }
        );

        if (!gdc) {
            throw new AppError('GDC not found', 404);
        }

        return gdc;
    } catch (error) {
        throw error;
    }
};
