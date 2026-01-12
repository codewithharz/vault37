import mongoose from 'mongoose';
import SystemSettings from '../models/SystemSettings.js';
import { TPIA_CONSTANTS, GDC_CONSTANTS, PLATFORM_ECONOMICS } from '../config/constants.js';

class ConfigService {
    constructor() {
        this.cache = null;
        this.lastFetch = 0;
        this.TTL = 60 * 1000; // 1 minute cache
    }

    async getSettings() {
        const now = Date.now();
        if (this.cache && (now - this.lastFetch < this.TTL)) {
            return this.cache;
        }

        // Ensure database is connected before proceeding
        if (mongoose.connection.readyState !== 1) {
            console.log('⏳ Waiting for MongoDB connection to stabilize...');
            for (let i = 0; i < 50; i++) { // Wait up to 5 seconds
                if (mongoose.connection.readyState === 1) break;
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        try {
            const settings = await SystemSettings.getSettings();
            this.cache = settings.toObject();
            this.lastFetch = now;
            return this.cache;
        } catch (error) {
            console.error('Error fetching system settings, falling back to constants:', error);
            return this.getFallbackSettings();
        }
    }

    getFallbackSettings() {
        return {
            tpia: {
                investmentAmount: TPIA_CONSTANTS.INVESTMENT_AMOUNT,
                profitAmount: TPIA_CONSTANTS.PROFIT_AMOUNT,
                cycleDurationDays: TPIA_CONSTANTS.CYCLE_DURATION_DAYS,
                autoApproveEnabled: TPIA_CONSTANTS.AUTO_APPROVE_ENABLED,
                approvalWindowMin: TPIA_CONSTANTS.ADMIN_APPROVAL_WINDOW_MIN,
                approvalWindowMax: TPIA_CONSTANTS.ADMIN_APPROVAL_WINDOW_MAX,
                totalCycles: TPIA_CONSTANTS.TOTAL_CYCLES,
                coreCycles: TPIA_CONSTANTS.CORE_CYCLES,
                extendedCycles: TPIA_CONSTANTS.EXTENDED_CYCLES,
                exitWindowInterval: TPIA_CONSTANTS.EXIT_WINDOW_INTERVAL,
                exitWindowDuration: TPIA_CONSTANTS.EXIT_WINDOW_DURATION,
            },
            gdc: {
                tpiasPerGdc: GDC_CONSTANTS.TPIAS_PER_GDC,
            },
            economics: {
                monthlyMarginPercent: PLATFORM_ECONOMICS.MONTHLY_MARGIN_PERCENT,
            },
            exitPenalties: TPIA_CONSTANTS.EXIT_PENALTIES,
        };
    }

    async updateSettings(newSettings, adminData = null, reason = null) {
        try {
            const settings = await SystemSettings.getSettings();

            // Store a snapshot of changes if needed, or just specific fields
            const changes = {};

            // Deep merge or specific updates
            if (newSettings.tpia) {
                Object.assign(settings.tpia, newSettings.tpia);
                changes.tpia = newSettings.tpia;
            }
            if (newSettings.gdc) {
                Object.assign(settings.gdc, newSettings.gdc);
                changes.gdc = newSettings.gdc;
            }
            if (newSettings.economics) {
                Object.assign(settings.economics, newSettings.economics);
                changes.economics = newSettings.economics;
            }
            if (newSettings.exitPenalties) {
                // Map handling in Mongoose
                for (const [cycle, penalty] of Object.entries(newSettings.exitPenalties)) {
                    settings.exitPenalties.set(cycle, penalty);
                }
                changes.exitPenalties = newSettings.exitPenalties;
            }

            // Add log entry if provided
            if (adminData && reason) {
                settings.logs.push({
                    adminId: adminData.id,
                    adminEmail: adminData.email,
                    action: adminData.action || 'UPDATE',
                    reason: reason,
                    changes: changes,
                    timestamp: new Date()
                });
            }

            await settings.save();
            this.cache = settings.toObject();
            this.lastFetch = Date.now();
            return this.cache;
        } catch (error) {
            console.error('Error updating system settings:', error);
            throw error;
        }
    }

    clearCache() {
        this.cache = null;
        this.lastFetch = 0;
    }
}

export default new ConfigService();
