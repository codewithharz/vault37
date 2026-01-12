import configService from '../services/configService.js';
import User from '../models/User.js';

/**
 * Get all system settings
 * @route GET /api/settings
 * @access Admin
 */
export const getSettings = async (req, res) => {
    try {
        const settings = await configService.getSettings();
        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching settings',
            error: error.message
        });
    }
};

/**
 * Update system settings
 * @route PATCH /api/settings
 * @access Admin
 */
export const updateSettings = async (req, res) => {
    try {
        const { password, reason, confirmation, ...settings } = req.body;

        if (!password || !reason || !confirmation) {
            return res.status(400).json({
                success: false,
                message: 'Password, reason, and confirmation are required'
            });
        }

        if (confirmation !== 'CONFIRM') {
            return res.status(400).json({
                success: false,
                message: 'Confirmation string must be "CONFIRM"'
            });
        }

        if (reason.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a meaningful reason (min 10 characters)'
            });
        }

        // Verify admin password
        const user = await User.findById(req.user.id).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password. Verification failed.'
            });
        }

        const adminData = {
            id: user._id,
            email: user.email,
            action: 'UPDATE'
        };

        const updatedSettings = await configService.updateSettings(settings, adminData, reason);
        res.status(200).json({
            success: true,
            message: 'System settings updated successfully',
            data: updatedSettings
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating settings',
            error: error.message
        });
    }
};

/**
 * Reset settings to defaults
 * @route POST /api/settings/reset
 * @access Admin
 */
export const resetSettings = async (req, res) => {
    try {
        const { password, reason, confirmation } = req.body;

        if (!password || !reason || !confirmation) {
            return res.status(400).json({
                success: false,
                message: 'Password, reason, and confirmation are required'
            });
        }

        if (confirmation !== 'CONFIRM') {
            return res.status(400).json({
                success: false,
                message: 'Confirmation string must be "CONFIRM"'
            });
        }

        // Verify admin password
        const user = await User.findById(req.user.id).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password. Verification failed.'
            });
        }

        const adminData = {
            id: user._id,
            email: user.email,
            action: 'RESET'
        };

        configService.clearCache();
        const settings = configService.getFallbackSettings();
        await configService.updateSettings(settings, adminData, reason);
        res.status(200).json({
            success: true,
            message: 'Settings reset to system defaults',
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error resetting settings',
            error: error.message
        });
    }
};
