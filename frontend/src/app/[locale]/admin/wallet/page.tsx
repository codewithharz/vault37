"use client";

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import api from '@/lib/api';
import {
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Eye,
    Download,
    Search,
    Filter,
    Wallet as WalletIcon,
    ShieldCheck,
    Briefcase,
    BarChart3,
    Zap
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { toast } from "sonner";
import { clsx } from "clsx";

export default function AdminWalletPage() {
    const t = useTranslations("AdminWallet");
    const tCommon = useTranslations("Common");
    const locale = useLocale();

    const [activeTab, setActiveTab] = useState('deposits');
    const [loading, setLoading] = useState(true);

    // Data states
    const [deposits, setDeposits] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);

    // Modal states
    const [approvalModal, setApprovalModal] = useState<{ open: boolean; type: 'deposit' | 'withdrawal'; transaction: any } | null>(null);
    const [rejectModal, setRejectModal] = useState<{ open: boolean; type: 'deposit' | 'withdrawal'; transaction: any } | null>(null);
    const [detailsModal, setDetailsModal] = useState<{ open: boolean; transaction: any } | null>(null);
    const [approvalNotes, setApprovalNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    // Fetch data based on active tab
    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);

            if (activeTab === 'deposits') {
                const response = await api.get('/admin/deposits/pending');
                if (response.data.success) {
                    setDeposits(response.data.data.deposits);
                }
            } else if (activeTab === 'withdrawals') {
                const response = await api.get('/admin/withdrawals/pending');
                if (response.data.success) {
                    setWithdrawals(response.data.data.withdrawals);
                }
            } else if (activeTab === 'transactions') {
                // Fetch all transactions (we'll need to add this endpoint or use wallet transactions)
                const response = await api.get('/wallet/transactions', { params: { limit: 100 } });
                if (response.data.success) {
                    setTransactions(response.data.data.transactions);
                }
            } else if (activeTab === 'statistics') {
                const response = await api.get('/admin/dashboard');
                if (response.data.success) {
                    setStats(response.data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error(t('messages.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    // Approval handlers
    const handleApprove = async () => {
        if (!approvalModal) return;

        try {
            const endpoint = approvalModal.type === 'deposit'
                ? `/admin/deposits/${approvalModal.transaction._id}/approve`
                : `/admin/withdrawals/${approvalModal.transaction._id}/approve`;

            await api.patch(endpoint, { notes: approvalNotes });

            toast.success(t('messages.approveSuccess', { type: t(`transactionTypes.${approvalModal.type}`) }));
            setApprovalModal(null);
            setApprovalNotes('');
            fetchData();
        } catch (error) {
            toast.error(t('messages.approveFailed'));
            console.error(error);
        }
    };

    const handleReject = async () => {
        if (!rejectModal || !rejectionReason.trim()) return;

        try {
            const endpoint = rejectModal.type === 'deposit'
                ? `/admin/deposits/${rejectModal.transaction._id}/reject`
                : `/admin/withdrawals/${rejectModal.transaction._id}/reject`;

            await api.patch(endpoint, { reason: rejectionReason });

            toast.success(t('messages.rejectSuccess', { type: t(`transactionTypes.${rejectModal.type}`) }));
            setRejectModal(null);
            setRejectionReason('');
            fetchData();
        } catch (error) {
            toast.error(t('messages.rejectFailed'));
            console.error(error);
        }
    };

    // Helper components
    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-800",
            completed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
            failed: "bg-red-100 text-red-800",
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}`}>
                {t(`status.${status as 'pending' | 'completed' | 'cancelled' | 'failed'}`)}
            </span>
        );
    };

    const TransactionTypeBadge = ({ type }: { type: string }) => {
        const isDeposit = type === 'deposit';
        return (
            <span className={clsx(
                "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit",
                isDeposit ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
            )}>
                {isDeposit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {t(`transactionTypes.${type as 'deposit' | 'withdrawal' | 'tpia_purchase' | 'cycle_profit'}`)}
            </span>
        );
    };

    const TabButton = ({ id, label, icon: Icon, color }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={clsx(
                "px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2 flex-1 justify-center",
                activeTab === id
                    ? `border-${color}-600 text-${color}-600 bg-${color}-50`
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
        >
            {Icon && <Icon className="w-4 h-4" />}
            {label}
        </button>
    );

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString(locale, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t('title')}</h2>
                    <p className="text-gray-500">{t('description')}</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-blue-100">
                    <WalletIcon className="w-4 h-4" />
                    {t('pendingCount', { count: deposits.length + withdrawals.length })}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    <TabButton id="deposits" label={t('tabs.deposits')} icon={TrendingUp} color="green" />
                    <TabButton id="withdrawals" label={t('tabs.withdrawals')} icon={TrendingDown} color="orange" />
                    <TabButton id="transactions" label={t('tabs.transactions')} icon={DollarSign} color="blue" />
                    <TabButton id="statistics" label={t('tabs.statistics')} icon={TrendingUp} color="purple" />
                </div>

                <div className="p-0">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500 animate-pulse">
                            {tCommon('loading')}
                        </div>
                    ) : (
                        <>
                            {/* Pending Deposits Tab */}
                            {activeTab === 'deposits' && (
                                <div className="overflow-x-auto">
                                    {deposits.length === 0 ? (
                                        <div className="p-12 text-center text-gray-500">
                                            <CheckCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                            <p>{t('noData.deposits')}</p>
                                        </div>
                                    ) : (
                                        <table className="w-full">
                                            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4 text-left">{t('table.reference')}</th>
                                                    <th className="px-6 py-4 text-left">{t('table.user')}</th>
                                                    <th className="px-6 py-4 text-left">{t('table.amount')}</th>
                                                    <th className="px-6 py-4 text-left">{t('table.date')}</th>
                                                    <th className="px-6 py-4 text-left">{t('table.paymentMethod')}</th>
                                                    <th className="px-6 py-4 text-left">{t('table.status')}</th>
                                                    <th className="px-6 py-4 text-right">{t('table.actions')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {deposits.map((deposit) => (
                                                    <tr key={deposit._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-mono text-sm text-gray-900">{deposit.reference}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-gray-900">{deposit.user?.fullName}</div>
                                                            <div className="text-xs text-gray-500">{deposit.user?.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-green-600">{formatCurrency(deposit.amount)}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {formatDate(deposit.createdAt)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {deposit.paymentMethod || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <StatusBadge status={deposit.status} />
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setRejectModal({ open: true, type: 'deposit', transaction: deposit })}
                                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                                >
                                                                    {tCommon('reject')}
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => setApprovalModal({ open: true, type: 'deposit', transaction: deposit })}
                                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                                >
                                                                    {tCommon('approve')}
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}

                            {/* Pending Withdrawals Tab */}
                            {activeTab === 'withdrawals' && (
                                <div className="overflow-x-auto">
                                    {withdrawals.length === 0 ? (
                                        <div className="p-12 text-center text-gray-500">
                                            <CheckCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                            <p>{t('noData.withdrawals')}</p>
                                        </div>
                                    ) : (
                                        <table className="w-full">
                                            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-4 text-left">{t('table.reference')}</th>
                                                    <th className="px-6 py-4 text-left">{t('table.user')}</th>
                                                    <th className="px-6 py-4 text-left">{t('table.amount')}</th>
                                                    <th className="px-6 py-4 text-left">{t('table.bankAccount')}</th>
                                                    <th className="px-6 py-4 text-left">{t('table.date')}</th>
                                                    <th className="px-6 py-4 text-left">{t('table.status')}</th>
                                                    <th className="px-6 py-4 text-right">{t('table.actions')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {withdrawals.map((withdrawal) => (
                                                    <tr key={withdrawal._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-mono text-sm text-gray-900">{withdrawal.reference}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-gray-900">{withdrawal.user?.fullName}</div>
                                                            <div className="text-xs text-gray-500">{withdrawal.user?.email}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-orange-600">{formatCurrency(withdrawal.amount)}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            {withdrawal.metadata?.bankAccount ? (
                                                                <div className="text-sm">
                                                                    <div className="font-medium text-gray-900">{withdrawal.metadata.bankAccount.bankName}</div>
                                                                    <div className="text-xs text-gray-500">{withdrawal.metadata.bankAccount.accountNumber}</div>
                                                                    <div className="text-xs text-gray-400">{withdrawal.metadata.bankAccount.accountName}</div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400">N/A</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {formatDate(withdrawal.createdAt)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <StatusBadge status={withdrawal.status} />
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setRejectModal({ open: true, type: 'withdrawal', transaction: withdrawal })}
                                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                                >
                                                                    {tCommon('reject')}
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => setApprovalModal({ open: true, type: 'withdrawal', transaction: withdrawal })}
                                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                                >
                                                                    {tCommon('approve')}
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            )}

                            {/* All Transactions Tab */}
                            {activeTab === 'transactions' && (
                                <div className="p-0">
                                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between">
                                        <div className="flex gap-2">
                                            <select
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                                onChange={(e) => {
                                                    // Filter logic would go here
                                                    fetchData();
                                                }}
                                            >
                                                <option value="">{t('filters.allTypes')}</option>
                                                <option value="deposit">{t('transactionTypes.deposit')}</option>
                                                <option value="withdrawal">{t('transactionTypes.withdrawal')}</option>
                                                <option value="tpia_purchase">{t('transactionTypes.tpia_purchase')}</option>
                                                <option value="cycle_profit">{t('transactionTypes.cycle_profit')}</option>
                                            </select>
                                            <select
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                                onChange={(e) => {
                                                    fetchData();
                                                }}
                                            >
                                                <option value="">{t('filters.allStatuses')}</option>
                                                <option value="completed">{t('status.completed')}</option>
                                                <option value="pending">{t('status.pending')}</option>
                                                <option value="cancelled">{t('status.cancelled')}</option>
                                                <option value="failed">{t('status.failed')}</option>
                                            </select>
                                        </div>
                                        <div className="relative flex-1 max-w-md">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder={t('filters.searchPlaceholder')}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                                            <Download className="w-4 h-4" /> {t('filters.exportCsv')}
                                        </Button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        {transactions.length === 0 ? (
                                            <div className="p-12 text-center text-gray-500">
                                                <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                                <p>{t('noData.transactions')}</p>
                                            </div>
                                        ) : (
                                            <table className="w-full">
                                                <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left">{t('table.date')}</th>
                                                        <th className="px-6 py-4 text-left">{t('table.reference')}</th>
                                                        <th className="px-6 py-4 text-left">{t('table.user')}</th>
                                                        <th className="px-6 py-4 text-left">{t('table.type')}</th>
                                                        <th className="px-6 py-4 text-left">{t('table.amount')}</th>
                                                        <th className="px-6 py-4 text-left">{t('table.status')}</th>
                                                        <th className="px-6 py-4 text-right">{t('table.actions')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {transactions.map((txn) => (
                                                        <tr key={txn._id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                                {formatDate(txn.createdAt)}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="font-mono text-xs text-gray-900">{txn.reference}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="font-medium text-gray-900">{txn.user?.fullName || 'System'}</div>
                                                                <div className="text-xs text-gray-500">{txn.user?.email}</div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <TransactionTypeBadge type={txn.type} />
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className={clsx(
                                                                    "font-bold",
                                                                    txn.type === 'deposit' || txn.type === 'cycle_profit' ? "text-green-600" : "text-gray-900"
                                                                )}>
                                                                    {formatCurrency(txn.amount)}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <StatusBadge status={txn.status} />
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button
                                                                    className="text-gray-400 hover:text-gray-600 p-1"
                                                                    onClick={() => setDetailsModal({ open: true, transaction: txn })}
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Statistics Tab */}
                            {activeTab === 'statistics' && stats && (
                                <div className="p-6 space-y-6 bg-gray-50/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <Card className="p-5 border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t('stats.totalDeposits')}</p>
                                                    <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(stats.finances?.totalDeposits || 0)}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{t('stats.transactions', { count: stats.finances?.depositCount || 0 })}</p>
                                                </div>
                                                <div className="p-3 bg-green-50 rounded-xl">
                                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                                </div>
                                            </div>
                                        </Card>
                                        <Card className="p-5 border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t('stats.totalWithdrawals')}</p>
                                                    <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(stats.finances?.totalWithdrawals || 0)}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{t('stats.transactions', { count: stats.finances?.withdrawalCount || 0 })}</p>
                                                </div>
                                                <div className="p-3 bg-orange-50 rounded-xl">
                                                    <TrendingDown className="w-6 h-6 text-orange-600" />
                                                </div>
                                            </div>
                                        </Card>
                                        <Card className="p-5 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t('stats.tvl')}</p>
                                                    <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(stats.finances?.tvl || 0)}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{t('stats.tvlDesc')}</p>
                                                </div>
                                                <div className="p-3 bg-blue-50 rounded-xl">
                                                    <WalletIcon className="w-6 h-6 text-blue-600" />
                                                </div>
                                            </div>
                                        </Card>
                                        <Card className="p-5 border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t('stats.lockedFunds')}</p>
                                                    <p className="text-2xl font-extrabold text-gray-900">{formatCurrency(stats.finances?.lockedFunds || 0)}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{t('stats.lockedFundsDesc')}</p>
                                                </div>
                                                <div className="p-3 bg-purple-50 rounded-xl">
                                                    <DollarSign className="w-6 h-6 text-purple-600" />
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="p-5 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t('stats.userBalances')}</p>
                                                    <p className="text-xl font-bold text-gray-800">{formatCurrency(stats.finances?.userBalances || 0)}</p>
                                                </div>
                                                <Clock className="w-5 h-5 text-gray-400" />
                                            </div>
                                        </Card>
                                        <Card className="p-5 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t('stats.userEarnings')}</p>
                                                    <p className="text-xl font-bold text-gray-800">{formatCurrency(stats.finances?.userEarnings || 0)}</p>
                                                </div>
                                                <TrendingUp className="w-5 h-5 text-green-400" />
                                            </div>
                                        </Card>
                                        <Card className="p-5 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t('stats.profitDistributed')}</p>
                                                    <p className="text-xl font-bold text-gray-800">{formatCurrency(stats.finances?.profitDistributed || 0)}</p>
                                                </div>
                                                <CheckCircle className="w-5 h-5 text-blue-400" />
                                            </div>
                                        </Card>
                                        <Card className="p-5 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{t('stats.pendingActions')}</p>
                                                    <p className="text-xl font-bold text-gray-800">{stats.queues?.pendingDeposits + stats.queues?.pendingWithdrawals || 0}</p>
                                                </div>
                                                <Filter className="w-5 h-5 text-orange-400" />
                                            </div>
                                        </Card>
                                    </div>

                                    {/* Platform Performance Section */}
                                    <div className="pt-4 pb-2 border-b border-gray-200">
                                        <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                            {t('stats.performance')} <span className="text-xs font-medium text-gray-400 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded ml-2">{t('stats.estArbitrage')}</span>
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Card className="p-6 bg-emerald-900 text-white shadow-xl relative overflow-hidden">
                                            <div className="relative z-10">
                                                <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest mb-1">{t('stats.grossRevenue')}</p>
                                                <p className="text-3xl font-black">{formatCurrency(stats.finances?.estGrossRevenue || 0)}</p>
                                                <div className="mt-4 pt-4 border-t border-emerald-800/50 flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[10px] text-emerald-400 uppercase font-bold">{t('stats.tradingYield')}</p>
                                                        <p className="text-sm font-bold text-emerald-100">{t('stats.allGdcs')}</p>
                                                    </div>
                                                    <BarChart3 className="w-10 h-10 text-emerald-700/50" />
                                                </div>
                                            </div>
                                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-800/20 rounded-full blur-3xl"></div>
                                        </Card>

                                        <Card className="p-6 bg-teal-900 text-white shadow-xl relative overflow-hidden">
                                            <div className="relative z-10">
                                                <p className="text-teal-300 text-xs font-bold uppercase tracking-widest mb-1">{t('stats.netProfit')}</p>
                                                <p className="text-3xl font-black text-teal-50">{formatCurrency(stats.finances?.estNetProfit || 0)}</p>
                                                <div className="mt-4 pt-4 border-t border-teal-800/50 flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[10px] text-teal-400 uppercase font-bold">{t('stats.bottomLine')}</p>
                                                        <p className="text-sm font-bold text-teal-100">{t('stats.afterPayouts')}</p>
                                                    </div>
                                                    <Briefcase className="w-10 h-10 text-teal-700/50" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-0 right-0 -mb-8 -mr-8 w-32 h-32 bg-teal-800/20 rounded-full blur-3xl"></div>
                                        </Card>

                                        <Card className="p-6 bg-white border border-gray-200 shadow-sm relative overflow-hidden">
                                            <div className="relative z-10">
                                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 font-mono">{t('stats.otherIncome')}</p>
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold">{t('stats.penaltyRevenue')}</p>
                                                        <p className="text-xl font-black text-orange-600">{formatCurrency(stats.finances?.penaltyRevenue || 0)}</p>
                                                    </div>
                                                    <div className="pt-2 border-t border-gray-100">
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold">{t('stats.combinedEarnings')}</p>
                                                        <p className="text-2xl font-black text-gray-900">{formatCurrency(stats.finances?.totalPlatformRevenue || 0)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <Zap className="absolute top-4 right-4 w-12 h-12 text-gray-50" />
                                        </Card>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Approval Modal */}
            {approvalModal && (
                <Modal
                    isOpen={approvalModal.open}
                    onClose={() => setApprovalModal(null)}
                    title={t('modals.approve.title', { type: t(`transactionTypes.${approvalModal.type}`) })}
                >
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            {t('modals.approve.description', { type: t(`transactionTypes.${approvalModal.type}`) })}
                            {" "}{approvalModal.type === 'deposit' ? t('modals.approve.depositNote') : t('modals.approve.withdrawalNote')}
                        </p>
                        {approvalModal?.transaction && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">{t('table.amount')}:</span>
                                        <p className="font-bold text-gray-900">{formatCurrency(approvalModal.transaction.amount)}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">{t('table.user')}:</span>
                                        <p className="font-medium text-gray-900">{approvalModal.transaction.user?.fullName}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {t('modals.approve.notesLabel')}
                            </label>
                            <textarea
                                value={approvalNotes}
                                onChange={(e) => setApprovalNotes(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={t('modals.approve.notesPlaceholder')}
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setApprovalModal(null)}>
                                {tCommon('cancel')}
                            </Button>
                            <Button
                                onClick={handleApprove}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {t('modals.approve.confirm')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Rejection Modal */}
            {rejectModal && (
                <Modal
                    isOpen={rejectModal.open}
                    onClose={() => setRejectModal(null)}
                    title={t('modals.reject.title', { type: t(`transactionTypes.${rejectModal.type}`) })}
                >
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            {t('modals.reject.description', { type: t(`transactionTypes.${rejectModal.type}`) })}
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={t('modals.reject.reasonPlaceholder')}
                            rows={3}
                        />
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setRejectModal(null)}>
                                {tCommon('cancel')}
                            </Button>
                            <Button
                                onClick={handleReject}
                                disabled={!rejectionReason.trim()}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {t('modals.reject.confirm')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Transaction Details Modal */}
            {detailsModal && (
                <Modal
                    isOpen={!!detailsModal}
                    onClose={() => setDetailsModal(null)}
                    title={t('modals.details.title')}
                >
                    <div className="space-y-6">
                        <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{t('modals.details.reference')}</p>
                                <p className="font-mono text-sm text-gray-900 bg-gray-50 px-2 py-1 rounded">{detailsModal.transaction.reference}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{t('modals.details.status')}</p>
                                <StatusBadge status={detailsModal.transaction.status} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{t('modals.details.type')}</p>
                                <TransactionTypeBadge type={detailsModal.transaction.type} />
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{t('modals.details.amount')}</p>
                                <p className="text-xl font-bold text-gray-900">{formatCurrency(detailsModal.transaction.amount)}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('modals.details.investor')}:</span>
                                <span className="font-medium text-gray-900">{detailsModal.transaction.user?.fullName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('modals.details.email')}:</span>
                                <span className="font-medium text-gray-900">{detailsModal.transaction.user?.email}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('modals.details.date')}:</span>
                                <span className="font-medium text-gray-900">{formatDate(detailsModal.transaction.createdAt)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">{t('modals.details.method')}:</span>
                                <span className="font-medium text-gray-900 uppercase">{detailsModal.transaction.paymentMethod?.replace('_', ' ')}</span>
                            </div>
                        </div>

                        {detailsModal.transaction.metadata?.bankAccount && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">{t('modals.details.bankDetails')}</p>
                                <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                                    <p className="text-sm font-bold text-orange-900">{detailsModal.transaction.metadata.bankAccount.bankName}</p>
                                    <p className="text-lg font-mono text-orange-800 tracking-tight">{detailsModal.transaction.metadata.bankAccount.accountNumber}</p>
                                    <p className="text-xs text-orange-600 font-medium">{detailsModal.transaction.metadata.bankAccount.accountName}</p>
                                </div>
                            </div>
                        )}

                        {detailsModal.transaction.failureReason && (
                            <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                                <p className="text-xs text-red-500 uppercase font-bold mb-1">{t('modals.details.rejectionReason')}</p>
                                <p className="text-sm text-red-700">{detailsModal.transaction.failureReason}</p>
                            </div>
                        )}

                        {detailsModal.transaction.notes && (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                <p className="text-xs text-blue-500 uppercase font-bold mb-1">{t('modals.details.adminNotes')}</p>
                                <p className="text-sm text-blue-700">{detailsModal.transaction.notes}</p>
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <Button variant="outline" className="w-full" onClick={() => setDetailsModal(null)}>
                                {t('modals.details.close')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
