import asyncHandler from '../utils/asyncHandler.js';
import * as portfolioService from '../services/portfolioService.js';

/**
 * @desc    Get user portfolio summary
 * @route   GET /api/users/portfolio
 * @access  Private
 */
export const getUserPortfolio = asyncHandler(async (req, res) => {
    const portfolio = await portfolioService.getUserPortfolio(req.user.id);

    res.status(200).json({
        success: true,
        data: portfolio || {},
    });
});
