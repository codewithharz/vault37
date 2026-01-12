"use client";

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import api from '@/lib/api';
import {
    CheckCircle,
    Clock,
    TrendingUp,
    Search,
    Package,
    Users,
    Activity,
    Eye
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { toast } from "sonner";
import { clsx } from "clsx";

export default function AdminGDCPage() {
    const [gdcs, setGDCs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
    const [detailsModal, setDetailsModal] = useState<{ open: boolean; gdc: any } | null>(null);

    const t = useTranslations("AdminGDC");
    const tCommon = useTranslations("Common");
    const locale = useLocale();

    const fetchGDCs = async (page = 1) => {
        try {
            setLoading(true);
            const params: any = { page, limit: 20 };

            // Map tab to status - only add status param if not 'all'
            if (activeTab !== 'all') {
                params.status = activeTab;
            }

            const response = await api.get('/gdc', { params });

            if (response.data.success) {
                setGDCs(response.data.data.gdcs);
                setPagination(response.data.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching GDCs:', error);
            toast.error(t('toasts.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGDCs(1);
    }, [activeTab]);

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            filling: "bg-blue-100 text-blue-800",
            full: "bg-yellow-100 text-yellow-800",
            active: "bg-green-100 text-green-800",
            completed: "bg-purple-100 text-purple-800",
        };

        const labels = {
            filling: t('tabs.filling'),
            full: t('tabs.full'),
            active: t('tabs.active'),
            completed: t('tabs.completed'),
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}`}>
                {labels[status as keyof typeof labels] || status}
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
            year: 'numeric'
        });
    };

    const CycleModeBadge = ({ mode }: { mode: string }) => {
        const isImmediate = mode === 'IMMEDIATE';
        return (
            <span className={clsx(
                "px-1.5 py-0.5 rounded text-xs font-medium",
                isImmediate
                    ? "bg-orange-100 text-orange-700"
                    : "bg-indigo-100 text-indigo-700"
            )}>
                {isImmediate ? "⚡" : "🔄"}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t('title')}</h2>
                    <p className="text-gray-500">{t('description')}</p>
                </div>
                <div className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 border border-purple-100">
                    <Package className="w-4 h-4" />
                    {t('statsLabel', { total: pagination.total })}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    <TabButton id="all" label={t('tabs.all')} icon={Package} color="gray" />
                    <TabButton id="filling" label={t('tabs.filling')} icon={Clock} color="blue" />
                    <TabButton id="full" label={t('tabs.full')} icon={CheckCircle} color="yellow" />
                    <TabButton id="active" label={t('tabs.active')} icon={Activity} color="green" />
                    <TabButton id="completed" label={t('tabs.completed')} icon={CheckCircle} color="purple" />
                </div>

                <div className="p-0">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-12 text-center text-gray-500 animate-pulse">
                                {t('loading')}
                            </div>
                        ) : gdcs.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                <p>{t('noData')}</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 text-left">{t('table.gdcNumber')}</th>
                                        <th className="px-6 py-4 text-left">{t('table.commodity')}</th>
                                        <th className="px-6 py-4 text-left">{t('table.fillStatus')}</th>
                                        <th className="px-6 py-4 text-left">{t('table.cycleProgress')}</th>
                                        <th className="px-6 py-4 text-left">{t('table.status')}</th>
                                        <th className="px-6 py-4 text-right">{t('table.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {gdcs.map((gdc) => (
                                        <tr key={gdc._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900 text-lg">GDC-{gdc.gdcNumber}</div>
                                                <div className="text-xs text-gray-400">ID: {gdc._id.slice(-8)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {gdc.commodityId?.icon && (
                                                        <span className="text-2xl">{gdc.commodityId.icon}</span>
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-gray-900">{gdc.commodityId?.name || 'N/A'}</div>
                                                        <div className="text-xs text-gray-500 capitalize">{gdc.commodityId?.type || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1">
                                                        <div className="flex justify-between text-xs mb-1">
                                                            <span className="font-medium text-gray-700">{t('fill.label', { current: gdc.currentFill })}</span>
                                                            <span className="text-gray-500">{Math.round((gdc.currentFill / 10) * 100)}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className={clsx(
                                                                    "h-2 rounded-full transition-all",
                                                                    gdc.currentFill === 10 ? "bg-green-500" : "bg-blue-500"
                                                                )}
                                                                style={{ width: `${(gdc.currentFill / 10) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {t('cycle.progress', { current: gdc.currentCycle, total: gdc.totalCycles })}
                                                    </div>
                                                    {gdc.nextCycleDate && (
                                                        <div className="text-xs text-gray-500">
                                                            {t('cycle.next', { date: formatDate(gdc.nextCycleDate) })}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={gdc.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setDetailsModal({ open: true, gdc })}
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    {t('actions.viewDetails')}
                                                </Button>
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
                                    onClick={() => fetchGDCs(pagination.page - 1)}
                                >
                                    {tCommon('pagination.previous')}
                                </Button>
                                <span className="flex items-center px-4 text-sm text-gray-600">
                                    {tCommon('pagination.pageInfo', { page: pagination.page, pages: pagination.pages })}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={pagination.page === pagination.pages}
                                    onClick={() => fetchGDCs(pagination.page + 1)}
                                >
                                    {tCommon('pagination.next')}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            <Modal
                isOpen={!!detailsModal}
                onClose={() => setDetailsModal(null)}
                title={detailsModal?.gdc ? t('modals.details.title', { number: detailsModal.gdc.gdcNumber }) : ''}
            >
                {detailsModal?.gdc && (
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 block">{t('modals.details.status')}</span>
                                    <StatusBadge status={detailsModal.gdc.status} />
                                </div>
                                <div>
                                    <span className="text-gray-500 block">{t('modals.details.gdcNumber')}</span>
                                    <span className="font-mono font-bold text-lg">GDC-{detailsModal.gdc.gdcNumber}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">{t('modals.details.currentFill')}</span>
                                    <span className="font-medium">{t('fill.label', { current: detailsModal.gdc.currentFill })}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">{t('modals.details.cycleProgress')}</span>
                                    <span className="font-medium">{t('cycle.progress', { current: detailsModal.gdc.currentCycle, total: detailsModal.gdc.totalCycles })}</span>
                                </div>
                                {detailsModal.gdc.activationDate && (
                                    <div>
                                        <span className="text-gray-500 block">{t('modals.details.activated')}</span>
                                        <span className="font-medium">{formatDate(detailsModal.gdc.activationDate)}</span>
                                    </div>
                                )}
                                {detailsModal.gdc.nextCycleDate && (
                                    <div>
                                        <span className="text-gray-500 block">{t('modals.details.nextCycle')}</span>
                                        <span className="font-medium">{formatDate(detailsModal.gdc.nextCycleDate)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Commodity Info */}
                        {detailsModal.gdc.commodityId && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    {t('modals.details.linkedCommodity')}
                                </h4>
                                <div className="flex items-center gap-3">
                                    {detailsModal.gdc.commodityId.icon && (
                                        <span className="text-3xl">{detailsModal.gdc.commodityId.icon}</span>
                                    )}
                                    <div>
                                        <div className="font-medium text-gray-900">{detailsModal.gdc.commodityId.name}</div>
                                        <div className="text-sm text-gray-600 capitalize">{detailsModal.gdc.commodityId.type}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TPIAs List */}
                        {detailsModal.gdc.tpias && detailsModal.gdc.tpias.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    {t('modals.details.tpiasTitle', { count: detailsModal.gdc.tpias.length })}
                                </h4>
                                <div className="max-h-64 overflow-y-auto space-y-2">
                                    {detailsModal.gdc.tpias.map((tpia: any, idx: number) => (
                                        <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-100">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium text-gray-900">TPIA-{tpia.tpiaNumber}</div>
                                                        <CycleModeBadge mode={tpia.cycleStartMode || 'CLUSTER'} />
                                                    </div>
                                                    <div className="text-sm text-gray-600">{tpia.userId?.fullName || 'N/A'}</div>
                                                    <div className="text-xs text-gray-400">{tpia.userId?.email || 'N/A'}</div>
                                                </div>
                                                <div className="text-right text-xs text-gray-500">
                                                    <div>{t('modals.details.purchasedAt', { date: formatDate(tpia.purchaseDate) })}</div>
                                                    {tpia.approvalDate && (
                                                        <div>{t('modals.details.approvedAt', { date: formatDate(tpia.approvalDate) })}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
