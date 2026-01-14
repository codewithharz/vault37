"use client";

import { DollarSign, TrendingUp, Lock } from "lucide-react";

interface WalletBalanceCardProps {
    wallet: any;
}

export function WalletBalanceCard({ wallet }: WalletBalanceCardProps) {
    const totalBalance = wallet?.balance || 0;
    const earningsBalance = wallet?.earningsBalance || 0;
    const lockedBalance = wallet?.lockedBalance || 0;
    const availableBalance = totalBalance - lockedBalance;

    return (
        <div>
            {/* Total Balance */}
            <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Total Balance</p>
                <p className="text-3xl font-bold text-gray-900 font-mono">
                    ₦{totalBalance.toLocaleString()}
                </p>
            </div>

            {/* Balance Breakdown */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <p className="text-xs text-gray-600">Available</p>
                    </div>
                    <p className="text-lg font-bold text-emerald-600 font-mono">
                        ₦{availableBalance.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-amber-600" />
                        <p className="text-xs text-gray-600">Earnings</p>
                    </div>
                    <p className="text-lg font-bold text-amber-600 font-mono">
                        ₦{earningsBalance.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Locked Balance */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-gray-600" />
                        <p className="text-sm text-gray-600">Locked in TPIAs</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 font-mono">
                        ₦{lockedBalance.toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
