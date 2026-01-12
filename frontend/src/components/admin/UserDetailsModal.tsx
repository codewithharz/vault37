"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
    User as UserIcon,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Shield,
    Wallet,
    TrendingUp,
    Clock,
    Activity,
    Lock,
    Unlock,
    AlertTriangle
} from 'lucide-react';
import { clsx } from 'clsx';

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
    onUpdate?: () => void;
}

export function UserDetailsModal({ isOpen, onClose, userId, onUpdate }: UserDetailsModalProps) {
    const t = useTranslations('AdminUsers.details');
    const locale = useLocale();

    const [user, setUser] = useState<any>(null);
    const [tpias, setTpias] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Action states
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [role, setRole] = useState('');

    const forceDeleteRef = useRef(false);

    // Confirmation state
    const [confirmation, setConfirmation] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        action: () => Promise<void>;
        variant: 'danger' | 'warning' | 'primary';
        confirmText: string;
        showForceOption?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        action: async () => { },
        variant: 'primary',
        confirmText: 'Confirm'
    });

    // Reset force delete ref when modal closes
    useEffect(() => {
        if (!confirmation.isOpen) {
            forceDeleteRef.current = false;
        }
    }, [confirmation.isOpen]);

    useEffect(() => {
        if (isOpen && userId) {
            fetchUserDetails();
        } else {
            setUser(null);
            setTpias([]);
            setTransactions([]);
        }
    }, [isOpen, userId]);

    const fetchUserDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/users/${userId}`);
            if (response.data.success) {
                const { user, tpias, transactions } = response.data.data;
                setUser(user);
                setTpias(tpias);
                setTransactions(transactions);
                setRole(user.role);
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            toast.error(t('messages.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = () => {
        if (!user) return;
        const newStatus = !user.isActive;
        const actionType = newStatus ? 'activate' : 'ban';

        setConfirmation({
            isOpen: true,
            title: newStatus ? t('modals.activateTitle') : t('modals.banTitle'),
            message: newStatus
                ? t('modals.activateMessage', { name: user.fullName })
                : t('modals.banMessage', { name: user.fullName }),
            variant: newStatus ? 'primary' : 'danger',
            confirmText: newStatus ? t('actions.activate') : t('actions.ban'),
            action: async () => {
                try {
                    setIsUpdatingStatus(true);
                    const response = await api.patch(`/admin/users/${user._id}/status`, { isActive: newStatus });

                    if (response.data.success) {
                        setUser({ ...user, isActive: newStatus });
                        toast.success(t('messages.statusUpdateSuccess', { status: newStatus ? t('status.active') : t('status.banned') }));
                        if (onUpdate) onUpdate();
                    }
                } catch (error) {
                    toast.error(t('messages.statusUpdateError'));
                } finally {
                    setIsUpdatingStatus(false);
                    setConfirmation(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleRoleUpdate = (newRole: string) => {
        if (!user || newRole === user.role) return;

        setConfirmation({
            isOpen: true,
            title: t('modals.changeRoleTitle'),
            message: t('modals.changeRoleMessage', { name: user.fullName, oldRole: user.role, newRole }),
            variant: 'warning',
            confirmText: t('actions.changeRole'),
            action: async () => {
                try {
                    const response = await api.patch(`/admin/users/${user._id}/role`, { role: newRole });

                    if (response.data.success) {
                        setUser({ ...user, role: newRole });
                        setRole(newRole);
                        toast.success(t('messages.roleUpdateSuccess', { role: newRole }));
                        if (onUpdate) onUpdate();
                    }
                } catch (error) {
                    toast.error(t('messages.roleUpdateError'));
                    setRole(user.role);
                } finally {
                    setConfirmation(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleKYCUpdate = (status: 'approved' | 'rejected') => {
        if (!user) return;

        setConfirmation({
            isOpen: true,
            title: status === 'approved' ? t('modals.verifyKycTitle') : t('modals.rejectKycTitle'),
            message: status === 'approved' ? t('modals.verifyKycMessage') : t('modals.rejectKycMessage'),
            variant: status === 'approved' ? 'primary' : 'danger',
            confirmText: status === 'approved' ? t('actions.verify') : t('actions.reject'),
            action: async () => {
                try {
                    const payload: any = { status };
                    if (status === 'rejected') {
                        payload.rejectionReason = t('modals.rejectionReason');
                    }

                    const response = await api.patch(`/admin/users/${user._id}/kyc`, payload);

                    if (response.data.success) {
                        const newStatus = status === 'approved' ? 'verified' : 'rejected';
                        setUser({ ...user, kycStatus: newStatus });
                        toast.success(t('messages.kycUpdateSuccess', { status: newStatus.toUpperCase() }));
                        if (onUpdate) onUpdate();
                    }
                } catch (error: any) {
                    toast.error(error.response?.data?.message || t('messages.kycUpdateError'));
                } finally {
                    setConfirmation(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const handleDeleteUser = () => {
        if (!user) return;

        setConfirmation({
            isOpen: true,
            title: t('modals.deleteTitle'),
            message: t('modals.deleteMessage', { name: user.fullName }),
            variant: 'danger',
            confirmText: t('actions.delete'),
            showForceOption: true,
            action: async () => {
                try {
                    const isForce = forceDeleteRef.current;
                    console.log('Attempting delete. Force:', isForce); // Debug log

                    await api.delete(`/admin/users/${user._id}${isForce ? '?force=true' : ''}`);
                    toast.success(t('messages.deleteSuccess'));
                    onClose();
                    if (onUpdate) onUpdate();
                } catch (error: any) {
                    const errorMessage = error.response?.data?.message || t('messages.deleteError.generic');
                    if (errorMessage.includes("active funds") || errorMessage.includes("force delete")) {
                        toast.error(t('messages.deleteError.force'));
                    } else {
                        toast.error(errorMessage);
                    }
                } finally {
                    setConfirmation(prev => ({ ...prev, isOpen: false }));
                }
            }
        });
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t('title')}
            className="max-w-5xl"
        >
            {loading ? (
                <div className="h-96 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : user ? (
                <div className="flex flex-col h-[75vh]">
                    {/* Header Profile */}
                    <div className="flex items-start justify-between pb-6 border-b border-gray-100 mb-4 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
                                {user.fullName?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    {user.fullName}
                                    <span className={clsx(
                                        "px-2 py-0.5 rounded-full text-xs font-medium",
                                        user.kycStatus === 'verified' ? "bg-green-100 text-green-700" :
                                            user.kycStatus === 'pending' ? "bg-amber-100 text-amber-700" :
                                                "bg-red-100 text-red-700"
                                    )}>
                                        {user.kycStatus.toUpperCase()}
                                    </span>
                                    <span className={clsx(
                                        "px-2 py-0.5 rounded-full text-xs font-medium",
                                        user.isActive ? "bg-green-50 text-green-600 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
                                    )}>
                                        {user.isActive ? 'ACTIVE' : 'BANNED'}
                                    </span>
                                </h3>
                                <p className="text-gray-500 flex items-center gap-2 text-sm mt-1">
                                    <Mail className="w-4 h-4" /> {user.email}
                                    <span className="text-gray-300">|</span>
                                    <Phone className="w-4 h-4" /> {user.phone || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400">{t('labels.joined')}</p>
                            <p className="font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-6 shrink-0">
                        {[
                            { id: 'overview', label: t('tabs.overview'), icon: Activity },
                            { id: 'financials', label: t('tabs.financials'), icon: Wallet },
                            { id: 'actions', label: t('tabs.actions'), icon: Shield }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                                    activeTab === tab.id
                                        ? "border-blue-600 text-blue-600 bg-blue-50"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto pr-2 pb-2">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                                            <MapPin className="w-3 h-3" /> {t('sections.address')}
                                        </h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                                <span className="text-gray-500">{t('labels.street')}</span>
                                                <span className="font-medium text-gray-900">{user.address?.street || '-'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                                <span className="text-gray-500">{t('labels.city')}</span>
                                                <span className="font-medium text-gray-900">{user.address?.city || '-'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                                <span className="text-gray-500">{t('labels.state')}</span>
                                                <span className="font-medium text-gray-900">{user.address?.state || '-'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                                <span className="text-gray-500">{t('labels.country')}</span>
                                                <span className="font-medium text-gray-900">{user.address?.country || 'Nigeria'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
                                            <UserIcon className="w-3 h-3" /> {t('sections.account')}
                                        </h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                                <span className="text-gray-500">{t('labels.mode')}</span>
                                                <span className="font-medium text-gray-900">{user.mode} ({user.mode === 'TPM' ? t('descriptions.compounding') : t('descriptions.payout')})</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                                <span className="text-gray-500">{t('labels.referralCode')}</span>
                                                <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-xs">{user.referralCode || '-'}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                                <span className="text-gray-500">{t('labels.role')}</span>
                                                <span className="font-medium capitalize">{user.role}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-200/50 pb-2">
                                                <span className="text-gray-500">{t('labels.status')}</span>
                                                <span className={clsx("font-medium", user.isActive ? "text-green-600" : "text-red-600")}>
                                                    {user.isActive ? t('status.active') : t('status.inactive')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-gray-500" /> {t('sections.recentTransactions')}
                                    </h4>
                                    {transactions.length === 0 ? (
                                        <div className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-8 text-center">
                                            <p className="text-gray-500 text-sm">{t('noData.transactions')}</p>
                                        </div>
                                    ) : (
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left">{t('labels.date')}</th>
                                                            <th className="px-4 py-3 text-left">{t('labels.type')}</th>
                                                            <th className="px-4 py-3 text-right">{t('labels.amount')}</th>
                                                            <th className="px-4 py-3 text-right">{t('labels.status')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {transactions.map(tx => (
                                                            <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(tx.createdAt)}</td>
                                                                <td className="px-4 py-3 capitalize font-medium text-gray-900">{tx.type}</td>
                                                                <td className={clsx("px-4 py-3 text-right font-medium whitespace-nowrap", tx.type === 'deposit' ? 'text-green-600' : 'text-red-600')}>
                                                                    {tx.type === 'deposit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                                                                </td>
                                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                                    <span className={clsx(
                                                                        "px-2.5 py-1 rounded-full text-xs font-medium",
                                                                        tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                                            tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                                    )}>{tx.status}</span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'financials' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card className="bg-blue-50 border-blue-100">
                                        <div className="p-4">
                                            <p className="text-sm text-blue-600 mb-1">{t('labels.walletBalance')}</p>
                                            <p className="text-2xl font-bold text-blue-900">₦{user.wallet?.balance?.toLocaleString() || '0'}</p>
                                        </div>
                                    </Card>
                                    <Card className="bg-green-50 border-green-100">
                                        <div className="p-4">
                                            <p className="text-sm text-green-600 mb-1">{t('labels.totalEarnings')}</p>
                                            <p className="text-2xl font-bold text-green-900">₦{user.wallet?.earningsBalance?.toLocaleString() || '0'}</p>
                                        </div>
                                    </Card>
                                    <Card className="bg-amber-50 border-amber-100">
                                        <div className="p-4">
                                            <p className="text-sm text-amber-600 mb-1">{t('labels.lockedFunds')}</p>
                                            <p className="text-2xl font-bold text-amber-900">₦{user.wallet?.lockedBalance?.toLocaleString() || '0'}</p>
                                        </div>
                                    </Card>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 mb-3">{t('sections.investmentPortfolio')}</h4>
                                    {tpias.length === 0 ? (
                                        <p className="text-gray-500 text-sm italic">{t('noData.investments')}</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {tpias.map(tpia => (
                                                <div key={tpia._id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center bg-gray-50/50">
                                                    <div>
                                                        <p className="font-medium text-gray-900 flex items-center gap-2">
                                                            TPIA #{tpia.tpiaNumber}
                                                            <span className={clsx("text-xs px-2 py-0.5 rounded", tpia.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700')}>
                                                                {tpia.status.toUpperCase()}
                                                            </span>
                                                        </p>
                                                        <p className="text-sm text-gray-500">{t('descriptions.compounding')}: {tpia.currentValue ? `₦${tpia.currentValue.toLocaleString()}` : 'N/A'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-gray-900">₦{tpia.amount.toLocaleString()}</p>
                                                        <p className="text-xs text-gray-500">{t('labels.invAmount')}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'actions' && (
                            <div className="space-y-6">
                                <div className="bg-white border border-gray-200 rounded-lg p-6">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-gray-400" />
                                        {t('sections.adminActions')}
                                    </h4>

                                    <div className="space-y-6">
                                        {/* Status Toggle */}
                                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                            <div>
                                                <p className="font-medium text-gray-900">{t('labels.accountStatus')}</p>
                                                <p className="text-sm text-gray-500">
                                                    {user.isActive
                                                        ? t('descriptions.accessNormal')
                                                        : t('descriptions.accessBanned')}
                                                </p>
                                            </div>

                                            <Button
                                                variant={user.isActive ? "danger" : "primary"}
                                                onClick={handleStatusToggle}
                                                disabled={isUpdatingStatus}
                                                className={clsx(
                                                    user.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                                                )}
                                            >
                                                {user.isActive ? (
                                                    <><Lock className="w-4 h-4 mr-2" /> {t('actions.ban')}</>
                                                ) : (
                                                    <><Unlock className="w-4 h-4 mr-2" /> {t('actions.activate')}</>
                                                )}
                                            </Button>
                                        </div>

                                        {/* KYC Management */}
                                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                            <div>
                                                <p className="font-medium text-gray-900">{t('labels.kycStatus')}</p>
                                                <p className="text-sm text-gray-500">
                                                    Current status: <span className="font-medium uppercase">{user.kycStatus}</span>
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                {user.kycStatus !== 'verified' && (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleKYCUpdate('approved')}
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                        {t('actions.verify')}
                                                    </Button>
                                                )}
                                                {user.kycStatus !== 'rejected' && (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleKYCUpdate('rejected')}
                                                    >
                                                        {t('actions.reject')}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Role Manager */}
                                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                                            <div>
                                                <p className="font-medium text-gray-900">{t('labels.platformRole')}</p>
                                                <p className="text-sm text-gray-500">{t('descriptions.permissions')}</p>
                                            </div>
                                            <select
                                                value={role}
                                                onChange={(e) => handleRoleUpdate(e.target.value)}
                                                className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                                <option value="auditor">Auditor</option>
                                                <option value="accountant">Accountant</option>
                                            </select>
                                        </div>

                                        {/* Danger Zone - Delete */}
                                        <div className="pt-2">
                                            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                                                <h5 className="text-red-800 font-medium text-sm mb-2 flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4" /> {t('sections.dangerZone')}
                                                </h5>
                                                <p className="text-red-600 text-xs mb-4">
                                                    {t('descriptions.deleteWarning')}
                                                </p>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={handleDeleteUser}
                                                    className="w-full justify-center"
                                                >
                                                    {t('actions.delete')}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : null}

            {/* Confirmation Modal */}
            <Modal
                isOpen={confirmation.isOpen}
                onClose={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
                title={confirmation.title}
                className="max-w-md z-[60]"
            >
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4 text-gray-900">
                        {confirmation.variant === 'danger' && <div className="p-3 bg-red-100 rounded-full text-red-600"><AlertTriangle className="w-6 h-6" /></div>}
                        {confirmation.variant === 'warning' && <div className="p-3 bg-amber-100 rounded-full text-amber-600"><AlertTriangle className="w-6 h-6" /></div>}
                        {confirmation.variant === 'primary' && <div className="p-3 bg-blue-100 rounded-full text-blue-600"><Shield className="w-6 h-6" /></div>}
                        <h3 className="text-lg font-medium">{confirmation.title}</h3>
                    </div>

                    <p className="text-gray-500 mb-6">{confirmation.message}</p>

                    {confirmation.showForceOption && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-md">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                    onChange={(e) => {
                                        forceDeleteRef.current = e.target.checked;
                                    }}
                                />
                                <div className="text-sm">
                                    <span className="font-medium text-gray-900 block">{t('actions.forceDelete')}</span>
                                    <span className="text-gray-500">{t('modals.forceDeleteDesc')}</span>
                                </div>
                            </label>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setConfirmation(prev => ({ ...prev, isOpen: false }))}
                        >
                            {t('actions.cancel')}
                        </Button>
                        <Button
                            variant={confirmation.variant === 'danger' ? 'danger' : confirmation.variant === 'warning' ? 'danger' : 'primary'}
                            className={clsx(
                                confirmation.variant === 'warning' && "bg-amber-600 hover:bg-amber-700"
                            )}
                            onClick={confirmation.action}
                        >
                            {confirmation.confirmText}
                        </Button>
                    </div>
                </div>
            </Modal>
        </Modal>
    );
}
