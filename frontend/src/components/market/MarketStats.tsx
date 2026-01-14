import React, { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/Card";
import { TrendingUp, Users, Wallet, BarChart3 } from "lucide-react";

interface Commodity {
    _id: string;
    navPrice: number;
    change24h?: number;
}

interface WalletData {
    balance: number;
    earningsBalance: number;
    lockedBalance: number;
    availableBalance: number;
}

interface MarketStatsProps {
    commodities: Commodity[];
    wallet?: WalletData | null;
}

export const MarketStats: React.FC<MarketStatsProps> = ({ commodities, wallet }) => {
    const stats = useMemo(() => {
        const totalProducts = commodities.length;
        const avgYield = 5.0; // Fixed 5%

        // Calculate Top Gainer (local logic since we have change24h now)
        const topGainer = commodities.reduce((prev, current) => {
            return (prev.change24h || 0) > (current.change24h || 0) ? prev : current;
        }, commodities[0] || { change24h: 0 });

        // Use real wallet balance instead of mock volume
        const availableBalance = wallet?.availableBalance || 0;

        return {
            totalProducts,
            avgYield,
            topGainer: topGainer?.change24h || 0,
            availableBalance
        };
    }, [commodities, wallet]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white border-none shadow-sm ring-1 ring-gray-200">
                <CardContent className="p-4 flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Available Balance</p>
                        <p className="text-xl font-bold text-gray-900">₦{stats.availableBalance.toLocaleString()}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-sm ring-1 ring-gray-200">
                <CardContent className="p-4 flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Avg. Cycle Yield</p>
                        <p className="text-xl font-bold text-gray-900">{stats.avgYield}%</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-sm ring-1 ring-gray-200">
                <CardContent className="p-4 flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Available Commodities</p>
                        <p className="text-xl font-bold text-gray-900">{stats.totalProducts}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white border-none shadow-sm ring-1 ring-gray-200">
                <CardContent className="p-4 flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                        <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Top Gainer (24h)</p>
                        <p className="text-xl font-bold text-gray-900">+{stats.topGainer.toFixed(2)}%</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
