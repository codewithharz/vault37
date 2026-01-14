import Transaction from '../models/Transaction.js';
import GDC from '../models/GDC.js';
import TPIA from '../models/TPIA.js';
import Cycle from '../models/Cycle.js';
import Wallet from '../models/Wallet.js';
import User from '../models/User.js';
import { GDC_STATUS, TPIA_STATUS, TPIA_CONSTANTS, TRANSACTION_TYPES, CYCLE_START_MODES } from '../config/constants.js';
import { logAdminAction } from './auditService.js';
import configService from './configService.js';
import mongoose from 'mongoose';

/**
 * Service to handle trade cycle operations
 */
class TradeService {
    /**
     * Start the first cycle for a TPIA
     * @param {Object} tpia - TPIA document
     * @param {Object} gdc - GDC document (optional)
     */
    async startTPIACycle(tpia, gdc = null) {
        if (!gdc) {
            gdc = await GDC.findOne({ gdcNumber: tpia.gdcNumber, commodityId: tpia.commodityId });
        }

        if (!gdc) throw new Error('Parent GDC not found');

        tpia.status = TPIA_STATUS.ACTIVE;
        tpia.currentCycle = 1;

        const settings = await configService.getSettings();
        const tpiaConfig = settings.tpia;

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + tpiaConfig.cycleDurationDays);

        tpia.maturityDate = endDate;

        // Create the Cycle record
        const cycle = await Cycle.create({
            gdc: gdc._id,
            tpia: tpia._id,
            cycleNumber: 1,
            startDate: startDate,
            endDate: endDate,
            status: 'running',
            profitRate: tpiaConfig.profitAmount / tpiaConfig.investmentAmount // Calculate from config
        });

        tpia.profitHistory = tpia.profitHistory || [];
        await tpia.save();

        // Update GDC if not already active
        if (gdc.status === GDC_STATUS.FILLING || gdc.status === GDC_STATUS.FULL) {
            gdc.status = GDC_STATUS.ACTIVE;
            gdc.activationDate = gdc.activationDate || startDate;
        }

        // Update GDC's next check date to this TPIA's maturity date if it's earlier
        if (!gdc.nextCycleDate || endDate < gdc.nextCycleDate) {
            gdc.nextCycleDate = endDate;
        }

        if (!gdc.cycleHistory.includes(cycle._id)) {
            gdc.cycleHistory.push(cycle._id);
        }
        await gdc.save();

        await logAdminAction({
            action: 'TPIA_CYCLE_STARTED',
            module: 'Trade',
            targetType: 'TPIA',
            targetId: tpia._id,
            newData: { cycleNumber: 1, maturityDate: tpia.maturityDate }
        });

        return tpia;
    }

    /**
     * Start the first cycle for a FULL GDC (Cluster Mode TPIAs)
     * @param {String} gdcId 
     */
    async startGDC(gdcId) {
        const gdc = await GDC.findById(gdcId);
        if (!gdc) {
            throw new Error('GDC not found');
        }

        console.log(`🚀 Starting GDC ${gdc.gdcNumber}...`);

        // Identify TPIAs that are waiting for cluster
        const tpiaIds = gdc.tpias.map(t => t.tpiaId);
        console.log(`Found ${tpiaIds.length} TPIAs in GDC`);

        const clusterTPIAs = await TPIA.find({
            _id: { $in: tpiaIds },
            cycleStartMode: CYCLE_START_MODES.CLUSTER,
            currentCycle: 0,
            status: TPIA_STATUS.ACTIVE // Already approved
        });

        for (const tpia of clusterTPIAs) {
            await this.startTPIACycle(tpia, gdc);
        }

        return gdc;
    }

    /**
     * Process completion for a single TPIA
     * @param {Object} tpia 
     * @param {Object} gdc 
     */
    async processTPIACompletion(tpia, gdc) {
        const settings = await configService.getSettings();
        const user = await User.findById(tpia.userId);
        if (!user) throw new Error('User not found');

        const cycle = await Cycle.findOne({
            tpia: tpia._id,
            cycleNumber: tpia.currentCycle,
            status: 'running'
        });

        if (!cycle) throw new Error(`Active cycle record not found for TPIA ${tpia.tpiaNumber}`);

        // Profit calculation (prefer stored amount, fallback to settings rate)
        const roiRate = settings.tpia.profitAmount / settings.tpia.investmentAmount;
        const profitAmount = tpia.profitAmount || (tpia.amount * roiRate);

        // Record in TPIA profit history
        tpia.profitHistory.push({
            cycleId: cycle._id,
            amount: profitAmount,
            date: new Date(),
            userMode: user.mode
        });

        const wallet = await Wallet.findOne({ userId: user._id });
        if (!wallet) throw new Error('Wallet not found');

        if (user.mode === 'TPM') {
            // Compound
            tpia.currentValue += profitAmount;
        } else {
            // Payout
            wallet.earningsBalance += profitAmount;

            const reference = Transaction.generateReference('cycle_profit'); // Use Transaction static first if possible, or manual
            // Note: Wallet.ledger reference is usually enough, but we want a Transaction doc now.

            // We'll use the SAME reference for both Wallet Ledger and Transaction Doc for linkage
            // But Wallet model has its own generateReference? 
            // Let's use `TXN-...` format or similar. 
            // The existing code used `CYC-${cycle._id}-${tpia._id}` which is not unique if run multiple times (idempotency check?)
            // But here we are in a flow where cycle is running.
            // Let's stick to a robust unique reference.

            const txnRef = `CPR-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

            wallet.ledger.push({
                type: TRANSACTION_TYPES.CYCLE_PROFIT,
                amount: profitAmount,
                balance: wallet.balance,
                description: `Cycle ${tpia.currentCycle} profit for ${tpia.tpiaNumber}`,
                reference: txnRef,
                status: 'completed'
            });
            await wallet.save();

            // Create Transaction Record
            await Transaction.create({
                user: user._id,
                wallet: wallet._id,
                type: 'cycle_profit',
                amount: profitAmount,
                status: 'completed',
                reference: txnRef,
                paymentMethod: 'system',
                metadata: {
                    tpiaId: tpia._id,
                    tpiaNumber: tpia.tpiaNumber,
                    cycleNumber: tpia.currentCycle,
                    gdcId: gdc._id
                }
            });
        }

        // Mark cycle completed
        cycle.status = 'completed';
        cycle.totalProfitDistributed = profitAmount;
        await cycle.save();

        // Check for Withdrawal Request first
        if (tpia.withdrawalRequested && tpia.investmentPhase === 'EXTENDED') {
            let penaltyRate = settings.exitPenalties.get(tpia.currentCycle.toString()) || 0;

            // If 0, check if previous cycle had a penalty (grace period logic)
            if (penaltyRate === 0 && tpia.currentCycle > 0) {
                penaltyRate = settings.exitPenalties.get((tpia.currentCycle - 1).toString()) || 0;
            }
            const penaltyAmount = tpia.amount * penaltyRate;
            const refundAmount = tpia.amount - penaltyAmount;

            tpia.status = TPIA_STATUS.COMPLETED;
            tpia.maturityDate = null;
            tpia.investmentPhase = 'COMPLETED';
            tpia.exitPenaltyApplied = penaltyRate > 0;
            tpia.penaltyAmount = penaltyAmount;
            tpia.returnedPrincipal = refundAmount;

            // Refund Principal
            wallet.balance += refundAmount;

            let ledgerDesc = `TPIA ${tpia.tpiaNumber} Principal Return`;
            if (penaltyRate > 0) {
                ledgerDesc += ` (Early Exit - ${penaltyRate * 100}% Penalty applied)`;
            }

            const txnRef = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

            wallet.ledger.push({
                type: TRANSACTION_TYPES.WITHDRAWAL,
                amount: refundAmount,
                balance: wallet.balance,
                description: ledgerDesc,
                reference: txnRef,
                status: 'completed'
            });
            await wallet.save();

            // Create Transaction Record
            await Transaction.create({
                user: user._id,
                wallet: wallet._id,
                type: 'refund', // or 'withdrawal' - using 'refund' as it fits 'Principal Return'
                amount: refundAmount,
                status: 'completed',
                reference: txnRef,
                paymentMethod: 'system',
                metadata: {
                    tpiaId: tpia._id,
                    tpiaNumber: tpia.tpiaNumber,
                    reason: 'Early Exit',
                    penaltyAmount: penaltyAmount,
                    cycleNumber: tpia.currentCycle
                },
                notes: ledgerDesc
            });

            await tpia.save();

            // Log for audit
            console.log(`[EXIT] TPIA ${tpia.tpiaNumber} exited at Cycle ${tpia.currentCycle}. Penalty: ${penaltyRate * 100}%. Refund: ${refundAmount}`);

            return tpia;
        }

        // Next cycle or complete
        let shouldContinue = false;

        const tpiaSpecs = settings.tpia;

        if (tpia.currentCycle < tpiaSpecs.coreCycles) {
            // In Core Phase -> Continue
            shouldContinue = true;
            tpia.investmentPhase = 'CORE';
        } else if (tpia.currentCycle < tpiaSpecs.totalCycles) {
            // In Extended Phase -> Continue
            shouldContinue = true;
            tpia.investmentPhase = 'EXTENDED';

            // Check if entering an exit window
            const cyclesInPhase = tpia.currentCycle - tpiaSpecs.coreCycles;

            if (cyclesInPhase % tpiaSpecs.exitWindowInterval === 0) {
                const windowStart = new Date();
                const windowEnd = new Date(windowStart);
                windowEnd.setDate(windowEnd.getDate() + tpiaSpecs.exitWindowDuration);

                tpia.nextExitWindowStart = windowStart;
                tpia.nextExitWindowEnd = windowEnd;
            }

        } else {
            // Reached Total Cycles -> Complete
            shouldContinue = false;
        }

        if (shouldContinue) {
            tpia.currentCycle += 1;
            const nextStartDate = new Date(cycle.endDate);
            const nextEndDate = new Date(nextStartDate);
            nextEndDate.setDate(nextEndDate.getDate() + TPIA_CONSTANTS.CYCLE_DURATION_DAYS);

            tpia.maturityDate = nextEndDate;

            const nextCycle = await Cycle.create({
                gdc: gdc._id,
                tpia: tpia._id,
                cycleNumber: tpia.currentCycle,
                startDate: nextStartDate,
                endDate: nextEndDate,
                status: 'running',
                profitRate: tpiaSpecs.profitAmount / tpiaSpecs.investmentAmount
            });

            gdc.cycleHistory.push(nextCycle._id);
            await gdc.save();
        } else {
            tpia.status = TPIA_STATUS.COMPLETED;
            tpia.maturityDate = null;
            tpia.investmentPhase = 'COMPLETED';

            // Return Principal at Maturity
            wallet.balance += tpia.amount;

            const txnRef = `MAT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

            wallet.ledger.push({
                type: TRANSACTION_TYPES.WITHDRAWAL,
                amount: tpia.amount,
                balance: wallet.balance,
                description: `TPIA ${tpia.tpiaNumber} Maturity Principal Return`,
                reference: txnRef,
                status: 'completed'
            });
            await wallet.save();

            // Create Transaction Record
            await Transaction.create({
                user: user._id,
                wallet: wallet._id,
                type: 'maturity_return',
                amount: tpia.amount,
                status: 'completed',
                reference: txnRef,
                paymentMethod: 'system',
                metadata: {
                    tpiaId: tpia._id,
                    tpiaNumber: tpia.tpiaNumber,
                    reason: 'Maturity',
                    totalCycles: tpia.currentCycle
                }
            });
        }

        await tpia.save();
        return tpia;
    }

    /**
     * Process completion of cycles for a GDC
     * @param {String} gdcId 
     */
    async processCycleCompletion(gdcId) {
        const gdc = await GDC.findById(gdcId);
        if (!gdc) throw new Error('GDC not found');

        // Find all TPIAs in this GDC that are due
        const now = new Date();
        const dueTPIAs = await TPIA.find({
            _id: { $in: gdc.tpias.map(t => t.tpiaId) },
            status: TPIA_STATUS.ACTIVE,
            maturityDate: { $lte: now }
        });

        const settings = await configService.getSettings();
        const roiRate = settings.tpia.profitAmount / settings.tpia.investmentAmount;

        let totalProfitDistributed = 0;
        for (const tpia of dueTPIAs) {
            await this.processTPIACompletion(tpia, gdc);
            totalProfitDistributed += (tpia.profitAmount || (tpia.amount * roiRate));
        }

        // Update GDC nextCycleDate to the next upcoming maturity among its active TPIAs
        const activeTPIAs = await TPIA.find({
            _id: { $in: gdc.tpias.map(t => t.tpiaId) },
            status: TPIA_STATUS.ACTIVE,
            maturityDate: { $ne: null }
        }).sort({ maturityDate: 1 });

        if (activeTPIAs.length > 0) {
            gdc.nextCycleDate = activeTPIAs[0].maturityDate;
        } else {
            // Check if all are COMPLETED
            const allCompleted = await TPIA.countDocuments({
                _id: { $in: gdc.tpias.map(t => t.tpiaId) },
                status: TPIA_STATUS.COMPLETED
            });

            if (allCompleted === gdc.tpias.length) {
                gdc.status = GDC_STATUS.COMPLETED;
                gdc.completionDate = new Date();
                gdc.nextCycleDate = null;
            } else {
                // Still waiting for some to start?
                gdc.nextCycleDate = null;
            }
        }

        await gdc.save();

        await logAdminAction({
            action: 'GDC_CYCLES_PROCESSED',
            module: 'Trade',
            targetType: 'GDC',
            targetId: gdc._id,
            newData: {
                tpiasProcessed: dueTPIAs.length,
                totalProfit: totalProfitDistributed,
                nextCheck: gdc.nextCycleDate
            }
        });

        return gdc;
    }
}

export default new TradeService();
