import asyncHandler from '../utils/asyncHandler.js';
import * as gdcService from '../services/gdcService.js';

/**
 * @desc    Get all GDCs
 * @route   GET /api/gdc
 * @access  Private/Admin
 */
export const getGDCs = asyncHandler(async (req, res) => {
    const { status, commodityId, page = 1, limit = 20 } = req.query;
    const result = await gdcService.listGDCs({ status, commodityId }, page, limit);

    res.status(200).json({
        success: true,
        data: result,
    });
});

/**
 * @desc    Get GDC details
 * @route   GET /api/gdc/:id
 * @access  Private/Admin
 */
export const getGDCDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = await gdcService.getGDCDetails(id);

    res.status(200).json({
        success: true,
        data,
    });
});

/**
 * @desc    Get GDC statistics
 * @route   GET /api/gdc/stats
 * @access  Private/Admin
 */
export const getGDCStats = asyncHandler(async (req, res) => {
    const stats = await gdcService.getGDCStats();

    res.status(200).json({
        success: true,
        data: stats,
    });
});

/**
 * @desc    Update GDC status (Admin)
 * @route   PATCH /api/gdc/:id/status
 * @access  Private/Admin
 */
export const updateGDCStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const gdc = await gdcService.updateGDCStatus(id, status);

    res.status(200).json({
        success: true,
        message: 'GDC status updated successfully',
        data: gdc,
    });
});
