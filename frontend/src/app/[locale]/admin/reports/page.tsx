"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
    FileBarChart,
    Download,
    Calendar,
    Filter,
    ChevronRight,
    ArrowRight,
    TrendingUp,
    Users,
    DollarSign,
    Package
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui";

const REPORT_IDS = ['transaction_summary', 'profit_distribution', 'user_acquisition', 'tpia_sales'] as const;

export default function AdminReportsPage() {
    const t = useTranslations('AdminReports');
    const locale = useLocale();
    const [selectedType, setSelectedType] = useState<string>(REPORT_IDS[0]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    const reportTypes = [
        { id: 'transaction_summary', name: t('types.transaction_summary.name'), icon: DollarSign, description: t('types.transaction_summary.description') },
        { id: 'profit_distribution', name: t('types.profit_distribution.name'), icon: TrendingUp, description: t('types.profit_distribution.description') },
        { id: 'user_acquisition', name: t('types.user_acquisition.name'), icon: Users, description: t('types.user_acquisition.description') },
        { id: 'tpia_sales', name: t('types.tpia_sales.name'), icon: Package, description: t('types.tpia_sales.description') },
    ];

    const generateReport = async () => {
        setLoading(true);
        try {
            const params: any = { type: selectedType };
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await api.get('/admin/reports/financial', { params });
            if (response.data.success) {
                setData(response.data.data);
                toast.success(t('messages.generateSuccess'));
            }
        } catch (error) {
            console.error("Failed to generate report", error);
            toast.error(t('messages.generateError'));
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const params: any = { type: selectedType };
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await api.get('/admin/reports/export', {
                params,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report_${selectedType}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success(t('messages.exportSuccess'));
        } catch (error) {
            console.error("Export failed", error);
            toast.error(t('messages.exportError'));
        } finally {
            setExporting(false);
        }
    };

    // Auto-generate on mount or type change for convenience
    useEffect(() => {
        generateReport();
    }, [selectedType]);

    const renderTable = () => {
        if (!data || data.length === 0) return <div className="p-8 text-center text-gray-500">{t('placeholders.noData')}</div>;

        switch (selectedType) {
            case 'transaction_summary':
                return (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">{t('table.type')}</th>
                                <th className="px-6 py-4">{t('table.count')}</th>
                                <th className="px-6 py-4">{t('table.totalAmount')}</th>
                                <th className="px-6 py-4">{t('table.successful')}</th>
                                <th className="px-6 py-4">{t('table.pending')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map((item, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 capitalize">{String(item._id || '').replace(/_/g, ' ')}</td>
                                    <td className="px-6 py-4 text-gray-900 font-medium">{item.count}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">₦{item.totalAmount ? item.totalAmount.toLocaleString(locale) : '0'}</td>
                                    <td className="px-6 py-4 text-green-600 font-medium">{item.successful}</td>
                                    <td className="px-6 py-4 text-amber-600 font-medium">{item.pending}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'user_acquisition':
                return (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">{t('table.date')}</th>
                                <th className="px-6 py-4">{t('table.newUsers')}</th>
                                <th className="px-6 py-4">{t('table.verifiedKyc')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map((item, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{new Date(item._id.year, item._id.month - 1, item._id.day).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                    <td className="px-6 py-4 text-gray-900 font-medium">{item.newUsers}</td>
                                    <td className="px-6 py-4 text-green-600 font-semibold">{item.verifiedKYC}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'profit_distribution':
                return (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">{t('table.date')}</th>
                                <th className="px-6 py-4">{t('table.totalDistributed')}</th>
                                <th className="px-6 py-4">{t('table.payoutCount')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map((item, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{new Date(item._id.year, item._id.month - 1, item._id.day).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                    <td className="px-6 py-4 font-semibold text-green-600">₦{item.totalDistributed ? item.totalDistributed.toLocaleString(locale) : '0'}</td>
                                    <td className="px-6 py-4 text-gray-900 font-medium">{item.payoutCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'tpia_sales':
                return (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">{t('table.commodity')}</th>
                                <th className="px-6 py-4">{t('table.unitsSold')}</th>
                                <th className="px-6 py-4">{t('table.totalRevenue')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map((item, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.commodityName}</td>
                                    <td className="px-6 py-4 text-gray-900 font-medium">{item.unitsSold}</td>
                                    <td className="px-6 py-4 font-semibold text-blue-600">₦{item.totalRevenue ? item.totalRevenue.toLocaleString(locale) : '0'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">{t('title')}</h2>
                    <p className="text-gray-500">{t('description')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        disabled={exporting || data.length === 0}
                        className="bg-white"
                    >
                        <Download className={`w-4 h-4 mr-2 ${exporting ? 'animate-bounce' : ''}`} />
                        {exporting ? t('buttons.exporting') : t('buttons.export')}
                    </Button>
                    <Button
                        onClick={generateReport}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {loading ? t('buttons.generating') : t('buttons.refresh')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-400" />
                                {t('settings.title')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">{t('settings.type')}</label>
                                <div className="space-y-2">
                                    {reportTypes.map((type) => {
                                        const Icon = type.icon;
                                        return (
                                            <button
                                                key={type.id}
                                                onClick={() => setSelectedType(type.id)}
                                                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${selectedType === type.id
                                                    ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200 shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`p-1.5 rounded-lg ${selectedType === type.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium">{type.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">{t('settings.dateRange')}</label>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                                            className="pl-10 text-sm"
                                            placeholder={t('settings.startDate')}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                                            className="pl-10 text-sm"
                                            placeholder={t('settings.endDate')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none">
                        <CardContent className="p-6">
                            <h4 className="font-bold mb-2">{t('settings.customReports')}</h4>
                            <p className="text-blue-100 text-sm mb-4 line-clamp-3">
                                {t('settings.customDesc')}
                            </p>
                            <Button size="sm" variant="secondary" className="w-full bg-white text-blue-600 hover:bg-blue-50">
                                {t('buttons.contact')}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Areas */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="border-none shadow-sm overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-100 p-6 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">
                                    {reportTypes.find(t => t.id === selectedType)?.name} Data
                                </CardTitle>
                                <p className="text-sm text-gray-500 mt-1">
                                    {reportTypes.find(t => t.id === selectedType)?.description}
                                </p>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-full">
                                <FileBarChart className="w-5 h-5 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            {loading ? (
                                <div className="p-12 flex flex-col items-center justify-center text-gray-400 gap-3">
                                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-sm">{t('placeholders.calculating')}</span>
                                </div>
                            ) : (
                                renderTable()
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Insights Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start justify-between group hover:shadow-md transition-all">
                            <div>
                                <p className="text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">{selectedType === 'user_acquisition' ? t('table.newUsers') : t('insights.totalImpact')}</p>
                                <h3 className="text-2xl font-bold text-emerald-900 tracking-tight">
                                    {selectedType === 'user_acquisition'
                                        ? data.reduce((acc, curr) => acc + (curr.newUsers || 0), 0).toLocaleString(locale)
                                        : `₦${data.reduce((acc, curr) => acc + (curr.totalAmount || curr.totalDistributed || curr.totalRevenue || 0), 0).toLocaleString(locale)}`
                                    }
                                </h3>
                                <div className="mt-4 flex items-center gap-1 text-emerald-600 font-medium text-sm">
                                    <span>{t('insights.summary')}</span>
                                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                            <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start justify-between group hover:shadow-md transition-all">
                            <div>
                                <p className="text-blue-600 font-bold text-xs uppercase tracking-wider mb-1">{t('insights.recordCount')}</p>
                                <h3 className="text-2xl font-bold text-blue-900 tracking-tight">{t('insights.rows', { count: data.length })}</h3>
                                <div className="mt-4 flex items-center gap-1 text-blue-600 font-medium text-sm">
                                    <span>{t('insights.download')}</span>
                                    <Download className="w-3 h-3" />
                                </div>
                            </div>
                            <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <FileBarChart className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
