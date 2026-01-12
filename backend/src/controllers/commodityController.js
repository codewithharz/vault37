import * as commodityService from '../services/commodityService.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * @desc    Get all active commodities
 * @route   GET /api/commodities
 * @access  Public
 */
export const getActiveCommodities = asyncHandler(async (req, res) => {
    const commodities = await commodityService.getActiveCommodities();
    res.status(200).json({
        success: true,
        data: commodities,
    });
});

/**
 * @desc    Create new commodity
 * @route   POST /api/commodities
 * @access  Private/Admin
 */
export const createCommodity = asyncHandler(async (req, res) => {
    const commodity = await commodityService.createCommodity(req.body, req.user.id);
    res.status(201).json({
        success: true,
        data: commodity,
    });
});

/**
 * @desc    Update commodity NAV
 * @route   PATCH /api/commodities/:id/nav
 * @access  Private/Admin
 */
export const updateNAV = asyncHandler(async (req, res) => {
    const { navPrice } = req.body;
    if (!navPrice) {
        throw new AppError('Please provide a new NAV price', 400);
    }

    const commodity = await commodityService.updateCommodityNAV(req.params.id, navPrice, req.user.id);
    res.status(200).json({
        success: true,
        data: commodity,
    });
});

/**
 * @desc    Get commodity by ID
 * @route   GET /api/commodities/:id
 * @access  Public
 */
export const getCommodity = asyncHandler(async (req, res) => {
    const commodity = await commodityService.getCommodityById(req.params.id);
    if (!commodity) {
        throw new AppError('Commodity not found', 404);
    }
    res.status(200).json({
        success: true,
        data: commodity,
    });
});
/**
 * @desc    Get commodity price history
 * @route   GET /api/commodities/:id/history
 * @access  Public
 */
export const getCommodityHistory = asyncHandler(async (req, res) => {
    const history = await commodityService.getCommodityHistory(req.params.id);
    res.status(200).json({
        success: true,
        data: history,
    });
});
