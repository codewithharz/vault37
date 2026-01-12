"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
    Wallet as WalletIcon,
    ArrowUpRight,
    ArrowDownLeft,
    History,
    Plus,
    Minus,
    Search
} from "lucide-react";
import { DepositModal, WithdrawModal } from "../../../../components/user/WalletModals";

interface Transaction {
    _id: string;
    amount: number;
    type: 'deposit' | 'withdrawal' | 'investment' | 'payout' | 'dividend' | 'referral';
    status: 'pending' | 'completed' | 'failed' | 'reversed';
    reference: string;
    createdAt: string;
    description?: string;
}

interface WalletData {
    balance: number;
}

export default function WalletPage() {
    const t = useTranslations("Wallet");
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

    useEffect(() => {
        const fetchWalletData = async () => {
            try {
                const [walletRes, transRes] = await Promise.all([
                    api.get('/wallet'),
                    api.get('/wallet/transactions')
                ]);

                if (walletRes.data.success) {
                    setWallet(walletRes.data.data);
                }
                if (transRes.data.success) {
                    setTransactions(transRes.data.data.transactions || []);
                }
            } catch (error) {
                console.error("Failed to fetch wallet data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWalletData();
    }, []);

    const getStatusColor = (status: Transaction['status']) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'failed': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getTypeIcon = (type: Transaction['type']) => {
        switch (type) {
            case 'deposit': return <Plus className="h-4 w-4 text-green-600" />;
            case 'withdrawal': return <Minus className="h-4 w-4 text-red-600" />;
            case 'investment': return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
            case 'payout':
            case 'dividend': return <ArrowDownLeft className="h-4 w-4 text-purple-600" />;
            default: return <History className="h-4 w-4 text-gray-600" />;
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading Wallet...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t("title")}</h2>
                    <p className="text-gray-500">{t("subtitle")}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsDepositOpen(true)}
                        className="bg-amber-600 hover:bg-amber-700 text-white flex gap-2"
                    >
                        <Plus className="h-4 w-4" /> {t("deposit")}
                    </Button>
                    <Button
                        onClick={() => setIsWithdrawOpen(true)}
                        variant="outline"
                        className="flex gap-2"
                    >
                        <Minus className="h-4 w-4" /> {t("withdraw")}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 bg-gradient-to-br from-amber-600 to-amber-700 text-white border-none">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <WalletIcon className="h-6 w-6 text-white" />
                            </div>
                            <Badge className="bg-white/20 text-white border-transparent">Primary Wallet</Badge>
                        </div>
                        <p className="text-amber-100 text-sm font-medium">{t("balance")}</p>
                        <h3 className="text-3xl font-bold mt-1">₦{wallet?.balance.toLocaleString() || '0'}</h3>
                        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-medium text-amber-100">
                            <span>Vault37 Secure Ledger</span>
                            <span>Active</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between py-4">
                        <h3 className="text-lg font-bold text-gray-900">{t("transactions")}</h3>
                        <div className="relative w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-9 pr-4 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {transactions.length === 0 ? (
                            <div className="py-12 text-center text-gray-500">
                                <History className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                                <p>{t("noTransactions")}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600 font-medium border-y border-gray-100 uppercase text-[10px] tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3">{t("type")}</th>
                                            <th className="px-6 py-3">{t("amount")}</th>
                                            <th className="px-6 py-3">{t("status")}</th>
                                            <th className="px-6 py-3">{t("date")}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transactions.map((tx) => (
                                            <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                            {getTypeIcon(tx.type)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 capitalize">{tx.type}</p>
                                                            <p className="text-[10px] text-gray-500 truncate w-24" title={tx.reference}>{tx.reference}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-900 text-base">
                                                    ₦{tx.amount.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge className={getStatusColor(tx.status)}>
                                                        {tx.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 text-xs text-right">
                                                    {new Date(tx.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <DepositModal
                isOpen={isDepositOpen}
                onClose={() => setIsDepositOpen(false)}
            />

            <WithdrawModal
                isOpen={isWithdrawOpen}
                onClose={() => setIsWithdrawOpen(false)}
                balance={wallet?.balance || 0}
            />
        </div>
    );
}
