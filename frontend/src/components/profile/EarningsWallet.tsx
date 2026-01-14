import { Wallet } from "lucide-react";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { EarningsBreakdown } from "./EarningsBreakdown";
import { WalletBalanceCard } from "./WalletBalanceCard";

export function EarningsWallet() {
    const { wallet } = useStore();

    // Mock transactions if not available in wallet store
    const transactions = [
        { id: 1, type: 'Payout', amount: 45000, date: '2025-12-15', status: 'Completed' },
        { id: 2, type: 'Deposit', amount: 100000, date: '2025-11-20', status: 'Completed' },
        { id: 3, type: 'Payout', amount: 32000, date: '2025-10-15', status: 'Completed' },
    ];

    return (
        <div className="bg-gradient-to-br from-amber-50 via-white to-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 rounded-lg">
                        <Wallet className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">My Wallet</h3>
                </div>
                <Link
                    href="/dashboard/wallet"
                    className="text-sm font-medium text-amber-600 hover:text-amber-700"
                >
                    View All →
                </Link>
            </div>

            <WalletBalanceCard wallet={wallet} />

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <Link
                    href="/dashboard/wallet?action=deposit"
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium text-center"
                >
                    Deposit
                </Link>
                <Link
                    href="/dashboard/wallet?action=withdraw"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium text-center"
                >
                    Withdraw
                </Link>
            </div>

            {/* Recent Transactions (Mini) */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Transactions</h4>
                <div className="space-y-3">
                    {transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{tx.type} Earnings</p>
                                <p className="text-xs text-gray-500">{tx.date}</p>
                            </div>
                            <span className={`text-sm font-mono font-bold ${tx.type === 'Payout' ? 'text-emerald-600' : 'text-gray-900'}`}>
                                {tx.type === 'Payout' ? '+' : ''}₦{tx.amount.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Earnings Visuals */}
            <EarningsBreakdown earnings={{ byCommodity: [], history: [] }} />
        </div>
    );
}
