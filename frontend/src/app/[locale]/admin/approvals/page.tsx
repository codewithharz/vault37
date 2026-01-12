"use client";

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import api from '@/lib/api';
import {
    CheckCircle,
    XCircle,
    Clock,
    ArrowDownLeft,
    ArrowUpRight,
    ShieldCheck,
    Eye,
    FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { toast } from "sonner";
import { clsx } from "clsx";


export default function ApprovalsPage() {
    const t = useTranslations("AdminApprovals");
    const tCommon = useTranslations("Common");
    const locale = useLocale();

    const [deposits, setDeposits] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [kycs, setKycs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('deposits');

    // Modal State
    const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string; type: 'deposit' | 'withdrawal' | 'kyc'; } | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [documentModal, setDocumentModal] = useState<{ open: boolean; url: string; title: string; } | null>(null);

    const fetchApprovals = async () => {
        try {
            setLoading(true);
            const [depRes, withRes, kycRes] = await Promise.all([
                api.get('/admin/deposits/pending'),
                api.get('/admin/withdrawals/pending'),
                api.get('/admin/kyc/pending')
            ]);
            setDeposits(depRes.data.data.deposits);
            setWithdrawals(withRes.data.data.withdrawals);
            setKycs(kycRes.data.data.users);
        } catch (error) {
            console.error('Error fetching approvals:', error);
            toast.error(t('messages.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    // Approval Handlers
    const handleApprove = async (id: string, type: 'deposit' | 'withdrawal' | 'kyc') => {
        try {
            if (type === 'kyc') {
                await api.patch(`/admin/users/${id}/kyc`, { status: 'verified', comments: 'Documents verified by admin' });
            } else {
                await api.patch(`/admin/${type}s/${id}/approve`, { notes: 'Approved by admin' });
            }
            toast.success(t('messages.approveSuccess', { type: t(`tabs.${type}`) }));
            fetchApprovals();
        } catch (error) {
            toast.error(t('messages.approveFailed', { type: t(`tabs.${type}`) }));
        }
    };

    // Rejection Logic
    const openRejectModal = (id: string, type: 'deposit' | 'withdrawal' | 'kyc') => {
        setRejectModal({ open: true, id, type });
        setRejectReason('');
    };

    const handleConfirmReject = async () => {
        if (!rejectModal || !rejectReason.trim()) return;

        try {
            if (rejectModal.type === 'kyc') {
                await api.patch(`/admin/users/${rejectModal.id}/kyc`, { status: 'rejected', comments: rejectReason });
            } else {
                await api.patch(`/admin/${rejectModal.type}s/${rejectModal.id}/reject`, { reason: rejectReason });
            }
            toast.success(t('messages.rejectSuccess', { type: t(`tabs.${rejectModal.type}`) }));
            setRejectModal(null);
            fetchApprovals();
        } catch (error) {
            toast.error(t('messages.rejectFailed', { type: t(`tabs.${rejectModal.type}`) }));
        }
    };

    const viewDocument = (url: string, title: string) => {
        const fullUrl = url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${url}`;
        setDocumentModal({ open: true, url: fullUrl, title });
    };

    const TabButton = ({ id, label, icon: Icon, count, color }: any) => (
        <button
            onClick={() => setActiveTab(id)}
            className={clsx(
                "px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2 flex-1 justify-center",
                activeTab === id
                    ? `border-${color}-600 text-${color}-600 bg-${color}-50`
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
        >
            <Icon className="w-4 h-4" />
            {label}
            {count > 0 && <span className={`ml-2 px-2 py-0.5 rounded-full bg-${color}-100 text-${color}-700 text-xs`}>{count}</span>}
        </button>
    );

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
                <Card className="h-96 animate-pulse bg-gray-50">{null}</Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t('title')}</h2>
                <p className="text-gray-500">{t('description')}</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    <TabButton id="deposits" label={t('tabs.deposits')} icon={ArrowDownLeft} count={deposits.length} color="blue" />
                    <TabButton id="withdrawals" label={t('tabs.withdrawals')} icon={ArrowUpRight} count={withdrawals.length} color="orange" />
                    <TabButton id="kyc" label={t('tabs.kyc')} icon={ShieldCheck} count={kycs.length} color="purple" />
                </div>

                <div className="p-0">
                    {/* Deposits Table */}
                    {activeTab === 'deposits' && (
                        <div className="overflow-x-auto">
                            {deposits.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4 opacity-20" />
                                    <p>{t('noData.deposits')}</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 text-left">{t('table.user')}</th>
                                            <th className="px-6 py-4 text-left">{t('table.amount')}</th>
                                            <th className="px-6 py-4 text-left">{t('table.reference')}</th>
                                            <th className="px-6 py-4 text-right">{t('table.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {deposits.map((dep) => (
                                            <tr key={dep._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{dep.user?.fullName}</div>
                                                    <div className="text-xs text-gray-500">{dep.user?.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-green-700">₦{dep.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-xs font-mono text-gray-500">{dep.reference}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => openRejectModal(dep._id, 'deposit')} className="text-red-600 border-red-200 hover:bg-red-50">{tCommon('reject')}</Button>
                                                        <Button size="sm" onClick={() => handleApprove(dep._id, 'deposit')} className="bg-green-600 hover:bg-green-700 text-white">{tCommon('approve')}</Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Withdrawals Table */}
                    {activeTab === 'withdrawals' && (
                        <div className="overflow-x-auto">
                            {withdrawals.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4 opacity-20" />
                                    <p>{t('noData.withdrawals')}</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 text-left">{t('table.user')}</th>
                                            <th className="px-6 py-4 text-left">{t('table.amount')}</th>
                                            <th className="px-6 py-4 text-left">{t('table.bankDetails')}</th>
                                            <th className="px-6 py-4 text-right">{t('table.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {withdrawals.map((withd) => (
                                            <tr key={withd._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{withd.user?.fullName}</div>
                                                    <div className="text-xs text-gray-500">{withd.user?.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-red-700">₦{withd.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="font-medium">{withd.metadata?.bankAccount?.bankName}</div>
                                                    <div className="text-xs text-gray-500">{withd.metadata?.bankAccount?.accountNumber}</div>
                                                    <div className="text-xs text-gray-400">{withd.metadata?.bankAccount?.accountName}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => openRejectModal(withd._id, 'withdrawal')} className="text-red-600 border-red-200 hover:bg-red-50">{tCommon('reject')}</Button>
                                                        <Button size="sm" onClick={() => handleApprove(withd._id, 'withdrawal')} className="bg-green-600 hover:bg-green-700 text-white">{tCommon('approve')}</Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* KYC Table */}
                    {activeTab === 'kyc' && (
                        <div className="overflow-x-auto">
                            {kycs.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4 opacity-20" />
                                    <p>{t('noData.kyc')}</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 text-left">{t('table.user')}</th>
                                            <th className="px-6 py-4 text-left">{t('table.document')}</th>
                                            <th className="px-6 py-4 text-left">{t('table.submitted')}</th>
                                            <th className="px-6 py-4 text-right">{t('table.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {kycs.map((user) => (
                                            <tr key={user._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{user.fullName}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                    <div className="text-xs text-gray-400">{user.phone}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium capitalize">{user.kycDocuments?.idType?.replace('_', ' ')}</div>
                                                    <div className="text-xs text-gray-500 mb-1">{user.kycDocuments?.idNumber}</div>
                                                    {user.kycDocuments?.documentUrl && (
                                                        <button
                                                            onClick={() => viewDocument(user.kycDocuments.documentUrl, `${user.fullName}'s ${user.kycDocuments.idType}`)}
                                                            className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 font-medium"
                                                        >
                                                            <Eye className="w-3 h-3" /> {t('table.viewId')}
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-500">
                                                    {new Date(user.kycDocuments?.submittedAt).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => openRejectModal(user._id, 'kyc')} className="text-red-600 border-red-200 hover:bg-red-50">{tCommon('reject')}</Button>
                                                        <Button size="sm" onClick={() => handleApprove(user._id, 'kyc')} className="bg-green-600 hover:bg-green-700 text-white">{tCommon('approve')}</Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Rejection Modal */}
            <Modal
                isOpen={!!rejectModal}
                onClose={() => setRejectModal(null)}
                title={rejectModal ? t('modals.reject.title', { type: rejectModal.type === 'kyc' ? 'KYC' : t(`tabs.${rejectModal.type}`) }) : ''}
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        {t('modals.reject.description')}
                    </p>
                    <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                        placeholder={t('modals.reject.reasonPlaceholder')}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setRejectModal(null)}>{tCommon('cancel')}</Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={!rejectReason.trim()}
                            onClick={handleConfirmReject}
                        >
                            {t('modals.reject.confirm')}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Document Preview Modal */}
            <Modal
                isOpen={!!documentModal}
                onClose={() => setDocumentModal(null)}
                title={documentModal?.title || t('modals.documentPreview.title')}
                className="max-w-4xl"
            >
                <div className="flex justify-center bg-gray-100 rounded-lg p-4 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={documentModal?.url}
                        alt="Document"
                        className="max-h-[80vh] object-contain"
                        onError={(e) => (e.currentTarget.src = '/placeholder-document.png')}
                    />
                </div>
                <div className="mt-4 flex justify-end">
                    <a
                        href={documentModal?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                    >
                        <FileText className="w-4 h-4" /> {t('modals.documentPreview.openOriginal')}
                    </a>
                </div>
            </Modal>
        </div>
    );
}
