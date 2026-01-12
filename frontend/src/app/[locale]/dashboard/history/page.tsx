"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
    History,
    ArrowUpRight,
    ArrowDownLeft,
    Wallet,
    ShoppingBag,
    Calendar,
    Search,
    Filter
} from "lucide-react";
import api from "@/lib/api";
import { clsx } from "clsx";

export default function HistoryPage() {
    const t = useTranslations("History");
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [filter, setFilter] = useState("all");

    const fetchHistory = async () => {
        try {
            const response = await api.get('/wallet/transactions');
            setTransactions(response.data.data?.transactions || []);
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleExport = async () => {
        try {
            const response = await api.get('/wallet/transactions/export', {
                responseType: 'blob',
                params: {
                    type: filter !== 'all' ? filter : undefined
                }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transactions-${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export failed", error);
        }
    };

    const filteredTransactions = transactions.filter(tx => {
        if (filter === "all") return true;
        return tx.type.toLowerCase() === filter.toLowerCase();
    });

    if (loading) return <div className="p-8 text-center text-gray-500">{t("loading")}</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t("title")}</h2>
                    <p className="text-gray-500">{t("subtitle")}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <History className="h-4 w-4 text-amber-600" />
                            {t("logTitle")}
                        </h3>
                        <div className="flex items-center gap-2">
                            <select
                                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">{t("allActivities")}</option>
                                <option value="deposit">{t("deposits")}</option>
                                <option value="withdrawal">{t("withdrawals")}</option>
                                <option value="purchase">{t("investments")}</option>
                                <option value="profit">{t("maturityReturns")}</option>
                            </select>
                            <button className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                <Filter className="h-3 w-3" />
                                {t("export")}
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="px-6 py-4">{t("activity")}</th>
                                    <th className="px-6 py-4">{t("reference")}</th>
                                    <th className="px-6 py-4 text-right">{t("amount")}</th>
                                    <th className="px-6 py-4">{t("status")}</th>
                                    <th className="px-6 py-4 text-right">{t("timestamp")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((tx) => (
                                        <tr key={tx._id} className="hover:bg-amber-50/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={clsx(
                                                        "h-8 w-8 rounded-full flex items-center justify-center",
                                                        tx.type === 'deposit' ? 'bg-green-100' :
                                                            tx.type === 'withdrawal' ? 'bg-red-100' :
                                                                tx.type === 'purchase' ? 'bg-amber-100' : 'bg-blue-100'
                                                    )}>
                                                        {tx.type === 'deposit' ? <ArrowDownLeft className="h-4 w-4 text-green-600" /> :
                                                            tx.type === 'withdrawal' ? <ArrowUpRight className="h-4 w-4 text-red-600" /> :
                                                                tx.type === 'purchase' ? <ShoppingBag className="h-4 w-4 text-amber-600" /> :
                                                                    <Wallet className="h-4 w-4 text-blue-600" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 capitalize">{tx.type}</div>
                                                        <div className="text-[10px] text-gray-400 font-medium">{tx.description || t("systemActivity")}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                                {tx.reference || tx._id.substring(0, 12).toUpperCase()}
                                            </td>
                                            <td className={clsx(
                                                "px-6 py-4 text-right font-bold",
                                                tx.type === 'deposit' || tx.type === 'profit' ? 'text-green-600' : 'text-gray-900'
                                            )}>
                                                {tx.type === 'deposit' || tx.type === 'profit' ? '+' : '-'}
                                                ₦{tx.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={
                                                    tx.status === 'completed' || tx.status === 'success' ? 'success' :
                                                        tx.status === 'pending' ? 'default' : 'error'
                                                }>
                                                    {tx.status.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs text-gray-400 font-medium">
                                                {new Date(tx.createdAt).toLocaleDateString()}
                                                <br />
                                                {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                            {t("noRecords")}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
