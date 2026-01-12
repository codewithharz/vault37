import cron from 'node-cron';
import { autoApprovePendingTPIAs, processMaturedTPIAs } from '../services/tpiaService.js';

/**
 * Auto-approve TPIAs after 60 minutes
 * Runs every 5 minutes
 */
export const startAutoApprovalJob = () => {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        try {
            console.log('🔄 Running auto-approval job...');
            const approved = await autoApprovePendingTPIAs();

            if (approved.length > 0) {
                console.log(`✅ Auto-approved ${approved.length} TPIA(s)`);
            } else {
                console.log('ℹ️  No TPIAs to auto-approve');
            }
        } catch (error) {
            console.error('❌ Auto-approval job failed:', error.message);
        }
    });

    console.log('⏰ Auto-approval job scheduled (every 5 minutes)');
};

/**
 * Process matured TPIAs
 * Runs daily at midnight
 */
export const startMaturityJob = () => {
    // Run daily at midnight (00:00)
    cron.schedule('0 0 * * *', () => {
        try {
            console.log('🔄 Running maturity processing job...');
            const processed = processMaturedTPIAs();

            if (processed.length > 0) {
                console.log(`✅ Processed ${processed.length} matured TPIA(s)`);
            } else {
                console.log('ℹ️  No matured TPIAs to process');
            }
        } catch (error) {
            console.error('❌ Maturity processing job failed:', error.message);
        }
    });

    console.log('⏰ Maturity processing job scheduled (daily at midnight)');
};

/**
 * Start all TPIA jobs
 */
export const startTPIAJobs = () => {
    startAutoApprovalJob();
    startMaturityJob();
    console.log('✅ All TPIA jobs started');
};
