"use client";

import { Card, CardContent, CardHeader } from "../ui/Card";
import { DollarSign, Users, Activity, TrendingUp } from "lucide-react";

export interface DashboardStats {
    users: { total: number };
    investments: { totalInvested: number; activeTPIAs: number; activeGDCs: number };
    finances: { tvl: number; profitDistributed: number };
}

import { useTranslations } from "next-intl";

export function DashboardMetrics({ data, isLoading }: { data?: DashboardStats, isLoading?: boolean }) {
    const t = useTranslations("AdminMetrics");

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6 h-24 bg-gray-100 rounded-xl">
                            <div />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const stats = [
        {
            name: t('totalUsers'),
            value: data?.users?.total.toLocaleString() || '0',
            icon: Users,
            change: t('platformWide'),
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            name: t('tvl'),
            value: `₦${(data?.finances?.tvl || 0).toLocaleString()}`,
            icon: DollarSign,
            change: t('allAssets'),
            color: 'text-green-600',
            bg: 'bg-green-50'
        },
        {
            name: t('activeTPIAs'),
            value: data?.investments?.activeTPIAs.toLocaleString() || '0',
            icon: Activity,
            change: t('runningCycles'),
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        {
            name: t('totalInvested'),
            value: `₦${(data?.investments?.totalInvested || 0).toLocaleString()}`,
            icon: TrendingUp,
            change: t('cumulative'),
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.name}>
                    <CardContent className="p-6 flex items-center justify-between space-y-0">
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                            <p className="text-xs text-gray-400 flex items-center mt-1">
                                {stat.change}
                            </p>
                        </div>
                        <div className={`h-10 w-10 ${stat.bg} ${stat.color} rounded-full flex items-center justify-center`}>
                            <stat.icon className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
