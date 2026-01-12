import cron from 'node-cron';
import GDC from '../models/GDC.js';
import tradeService from '../services/tradeService.js';
import { GDC_STATUS } from '../config/constants.js';

/**
 * Process cycles that are due for completion
 * Runs every hour
 */
export const startCycleProcessingJob = () => {
    // Run every hour at the top of the hour
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('🔄 Checking for due trade cycles...');
            const now = new Date();
            const dueGDCs = await GDC.find({
                status: GDC_STATUS.ACTIVE,
                nextCycleDate: { $lte: now }
            });

            if (dueGDCs.length > 0) {
                console.log(`📡 Found ${dueGDCs.length} GDCs due for cycle completion`);
                for (const gdc of dueGDCs) {
                    try {
                        await tradeService.processCycleCompletion(gdc._id);
                    } catch (err) {
                        console.error(`❌ Failed processing cycle for GDC ${gdc.gdcNumber}:`, err.message);
                    }
                }
            } else {
                console.log('ℹ️  No GDCs due for cycle completion');
            }
        } catch (error) {
            console.error('❌ Cycle processing job failed:', error.message);
        }
    });

    console.log('⏰ Trade cycle processing job scheduled (hourly)');
};

/**
 * Auto-start FULL GDCs (first cycle)
 * Runs every 10 minutes
 */
export const startGDCAutoActivationJob = () => {
    cron.schedule('*/10 * * * *', async () => {
        try {
            const fullGDCs = await GDC.find({ status: GDC_STATUS.FULL });

            if (fullGDCs.length > 0) {
                console.log(`📡 Found ${fullGDCs.length} FULL GDCs to activate`);
                for (const gdc of fullGDCs) {
                    try {
                        await tradeService.startGDC(gdc._id);
                    } catch (err) {
                        console.error(`❌ Failed activating GDC ${gdc.gdcNumber}:`, err.message);
                    }
                }
            }
        } catch (error) {
            console.error('❌ GDC auto-activation job failed:', error.message);
        }
    });

    console.log('⏰ GDC auto-activation job scheduled (every 10 minutes)');
};

/**
 * Start all Trade jobs
 */
export const startTradeJobs = () => {
    startCycleProcessingJob();
    startGDCAutoActivationJob();
};
