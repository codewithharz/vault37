"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    CheckCircle,
    XCircle,
    Clock,
    ShieldCheck,
    Eye,
    FileText,
    TrendingUp,
    AlertCircle,
    Search
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { toast } from "sonner";
import { clsx } from "clsx";
import { useTranslations, useLocale } from "next-intl";

export default function AdminTPIAPage() {
    const [tpias, setTPIAs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalValue: 0, pages: 1 });
    const t = useTranslations("AdminTPIA");
    const tCommon = useTranslations("Common");
    const locale = useLocale();

    // Modal State
    const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string; tpiaNumber: number } | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [detailsModal, setDetailsModal] = useState<{ open: boolean; tpia: any } | null>(null);

    const fetchTPIAs = async (status?: string, page = 1) => {
        try {
            setLoading(true);
            const params: any = { page, limit: 20 };

            // Map tab to status
            if (activeTab === 'pending') params.status = 'pending_approval';
            if (activeTab === 'active') params.status = 'active';
            if (activeTab === 'completed') params.status = 'completed';
            if (activeTab === 'cancelled') params.status = 'cancelled';

            const response = await api.get('/tpia/admin/all', { params });

            if (response.data.success) {
                setTPIAs(response.data.data.tpias);
                setPagination(response.data.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching TPIAs:', error);
            toast.error(t('toasts.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTPIAs(activeTab, 1);
    }, [activeTab]);

    // Approval Handlers
    const handleApprove = async (id: string, tpiaNumber: number) => {
        try {
            await api.patch(`/tpia/admin/${id}/approve`, { notes: 'Approved by admin' });
            toast.success(t('toasts.approveSuccess', { number: tpiaNumber }));
            fetchTPIAs(activeTab, pagination.page);
        } catch (error) {
            toast.error(t('toasts.approveFailed'));
            console.error(error);
        }
    };

    // Rejection Logic
    const openRejectModal = (id: string, tpiaNumber: number) => {
        setRejectModal({ open: true, id, tpiaNumber });
        setRejectReason('');
    };

    const handleConfirmReject = async () => {
        if (!rejectModal || !rejectReason.trim()) return;

        try {
            await api.patch(`/tpia/admin/${rejectModal.id}/reject`, { reason: rejectReason });
            toast.success(t('toasts.rejectSuccess', { number: rejectModal.tpiaNumber }));
            setRejectModal(null);
            fetchTPIAs(activeTab, pagination.page);
        } catch (error) {
            toast.error(t('toasts.rejectFailed'));
            console.error(error);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            pending_approval: "bg-yellow-100 text-yellow-800",
            active: "bg-green-100 text-green-800",
            matured: "bg-blue-100 text-blue-800",
            completed: "bg-purple-100 text-purple-800",
            cancelled: "bg-red-100 text-red-800",
        };

        const labels = {
            pending_approval: t('tabs.pending'),
            active: t('tabs.active'),
            matured: t('tabs.matured'),
            completed: t('tabs.completed'),
            cancelled: t('tabs.cancelled'),
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}`}>
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    const CycleModeBadge = ({ mode }: { mode: string }) => {
        const isImmediate = mode === 'IMMEDIATE';
        return (
            <span className={clsx(
                "px-2 py-1 rounded-full text-xs font-medium",
                isImmediate
                    ? "bg-orange-100 text-orange-800"
                    : "bg-indigo-100 text-indigo-800"
            )}>
                {isImmediate ? t('badges.immediate') : t('badges.cluster')}
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

    // Helper for dates
    const formatDate = (dateString: string, style: 'short' | 'full' = 'short') => {
        if (!dateString) return '';
        const options: Intl.DateTimeFormatOptions = style === 'short'
            ? { month: 'short', day: 'numeric', year: 'numeric' }
            : { dateStyle: 'medium', timeStyle: 'short' };

        return new Date(dateString).toLocaleString(locale, options);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t('title')}</h2>
                    <p className="text-gray-500">{t('description')}</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-blue-100">
                        <TrendingUp className="w-4 h-4" />
                        {t('statsLabel', { total: pagination.total })}
                    </div>
                    {pagination.totalValue > 0 && (
                        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-green-100">
                            <ShieldCheck className="w-4 h-4" />
                            ₦{pagination.totalValue.toLocaleString()}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    <TabButton id="all" label={t('tabs.all')} icon={FileText} color="gray" />
                    <TabButton id="pending" label={t('tabs.pending')} icon={Clock} color="yellow" />
                    <TabButton id="active" label={t('tabs.active')} icon={CheckCircle} color="green" />
                    <TabButton id="completed" label={t('tabs.completed')} icon={ShieldCheck} color="purple" />
                    <TabButton id="cancelled" label={t('tabs.cancelled')} icon={XCircle} color="red" />
                </div>

                <div className="p-0">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-12 text-center text-gray-500 animate-pulse">
                                {t('loading')}
                            </div>
                        ) : tpias.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                <p>{t('noData')}</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 text-left">{t('table.tpiaGdc')}</th>
                                        <th className="px-6 py-4 text-left">{t('table.investor')}</th>
                                        <th className="px-6 py-4 text-left">{t('table.investment')}</th>
                                        <th className="px-6 py-4 text-left">{t('table.cycleMode')}</th>
                                        <th className="px-6 py-4 text-left">{t('table.timeline')}</th>
                                        <th className="px-6 py-4 text-left">{t('table.status')}</th>
                                        <th className="px-6 py-4 text-right">{t('table.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {tpias.map((tpia) => (
                                        <tr key={tpia._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">TPIA-{tpia.tpiaNumber}</div>
                                                <div className="text-xs font-mono text-gray-500 bg-gray-100 inline-block px-1.5 py-0.5 rounded mt-1">
                                                    GDC-{tpia.gdcNumber}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{tpia.userId?.fullName}</div>
                                                <div className="text-xs text-gray-500">{tpia.userId?.email}</div>
                                                <div className="text-xs text-gray-400">{tpia.userId?.phone}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">₦{tpia.amount.toLocaleString()}</div>
                                                <div className="text-xs text-green-600 flex items-center gap-1">
                                                    {t('investmentDetails.profit', { amount: tpia.profitAmount.toLocaleString() })}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5">{t('investmentDetails.mode', { mode: tpia.userMode })}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <CycleModeBadge mode={tpia.cycleStartMode || 'CLUSTER'} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs">{t('timelineLabels.purchased', { date: formatDate(tpia.purchaseDate) })}</span>
                                                    {tpia.maturityDate && (
                                                        <span className="text-xs font-medium text-blue-600">
                                                            {t('timelineLabels.matures', { date: formatDate(tpia.maturityDate) })}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={tpia.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {tpia.status === 'pending_approval' ? (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openRejectModal(tpia._id, tpia.tpiaNumber)}
                                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                            >
                                                                {t('actions.reject')}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleApprove(tpia._id, tpia.tpiaNumber)}
                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                            >
                                                                {t('actions.approve')}
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setDetailsModal({ open: true, tpia })}
                                                        >
                                                            {t('actions.viewDetails')}
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex justify-center p-4 border-t border-gray-100">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page === 1}
                                    onClick={() => fetchTPIAs(activeTab, pagination.page - 1)}
                                >
                                    {t('pagination.previous')}
                                </Button>
                                <span className="flex items-center px-4 text-sm text-gray-600">
                                    {t('pagination.pageInfo', { page: pagination.page, pages: pagination.pages })}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page === pagination.pages}
                                    onClick={() => fetchTPIAs(activeTab, pagination.page + 1)}
                                >
                                    {t('pagination.next')}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Rejection Modal */}
            <Modal
                isOpen={!!rejectModal}
                onClose={() => setRejectModal(null)}
                title={rejectModal ? t('modals.reject.title', { number: rejectModal.tpiaNumber }) : ''}
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        {t('modals.reject.description')}
                    </p>
                    <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                        placeholder={t('modals.reject.placeholder')}
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

            {/* Details Modal */}
            <Modal
                isOpen={!!detailsModal}
                onClose={() => setDetailsModal(null)}
                title={detailsModal?.tpia ? t('modals.details.title', { number: detailsModal.tpia.tpiaNumber }) : ''}
            >
                {detailsModal?.tpia && (
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 block">{t('modals.details.status')}</span>
                                    <StatusBadge status={detailsModal.tpia.status} />
                                </div>
                                <div>
                                    <span className="text-gray-500 block">{t('modals.details.gdcCluster')}</span>
                                    <span className="font-mono font-medium">GDC-{detailsModal.tpia.gdcNumber}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">{t('modals.details.investmentAmount')}</span>
                                    <span className="font-medium">₦{detailsModal.tpia.amount.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">{t('modals.details.expectedProfit')}</span>
                                    <span className="font-medium text-green-600">+₦{detailsModal.tpia.profitAmount.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">{t('modals.details.cycleStartMode')}</span>
                                    <span className="font-medium">{detailsModal.tpia.cycleStartMode || 'CLUSTER'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">{t('modals.details.userMode')}</span>
                                    <span className="font-medium">{detailsModal.tpia.userMode}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900 border-b pb-2">{t('modals.details.timelineTitle')}</h4>
                            <div className="relative pl-4 space-y-4 border-l-2 border-gray-100">
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500" />
                                    <p className="text-sm font-medium">{t('modals.details.purchasedText')}</p>
                                    <p className="text-xs text-gray-500">{formatDate(detailsModal.tpia.purchaseDate, 'full')}</p>
                                </div>
                                {detailsModal.tpia.approvalDate && (
                                    <div className="relative">
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500" />
                                        <p className="text-sm font-medium">{t('modals.details.approved')}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatDate(detailsModal.tpia.approvalDate, 'full')}
                                            {detailsModal.tpia.approvedBy && ` ${t('modals.details.approvedBy', { name: detailsModal.tpia.approvedBy.fullName })}`}
                                        </p>
                                    </div>
                                )}
                                {detailsModal.tpia.maturityDate && (
                                    <div className="relative">
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-purple-500" />
                                        <p className="text-sm font-medium">{t('modals.details.maturesText')}</p>
                                        <p className="text-xs text-gray-500">{formatDate(detailsModal.tpia.maturityDate, 'full')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {detailsModal.tpia.insurancePolicyNumber && (
                            <div className="bg-blue-50 p-3 rounded border border-blue-100 text-blue-800 text-xs font-mono">
                                {t('modals.details.policyNumber', { number: detailsModal.tpia.insurancePolicyNumber })}
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <Button variant="outline" onClick={() => setDetailsModal(null)}>{tCommon('close')}</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
