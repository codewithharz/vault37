import express from 'express';
import {
    getWallet,
    initializeDeposit,
    handlePaystackCallback,
    requestWithdrawal,
    getTransactionHistory,
    exportTransactions,
    addBankAccount,
    setDefaultBankAccount,
} from '../controllers/walletController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import audit from '../middleware/auditMiddleware.js';
import {
    depositRequestSchema,
    withdrawalRequestSchema,
    bankAccountSchema,
    transactionQuerySchema,
} from '../validators/walletValidators.js';

const router = express.Router();

// Paystack callback (public - called by Paystack)
// This must be above router.use(protect) because Paystack redirects via browser
router.get('/paystack/callback', handlePaystackCallback);

// All wallet routes below require authentication
router.use(protect);

// Wallet operations
router.get('/', getWallet);
router.post('/deposit', audit('Wallet'), validate(depositRequestSchema), initializeDeposit);
router.post('/withdraw', audit('Wallet'), validate(withdrawalRequestSchema), requestWithdrawal);

// Transaction history
router.get('/transactions', validate(transactionQuerySchema, 'query'), getTransactionHistory);
router.get('/transactions/export', exportTransactions);

// Bank account management
router.post('/bank-account', audit('Wallet'), validate(bankAccountSchema), addBankAccount);
router.patch('/bank-account/:id/default', audit('Wallet'), setDefaultBankAccount);

export default router;
