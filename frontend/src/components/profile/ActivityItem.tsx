"use client";

import { Activity, TrendingUp, ShoppingCart, Wallet } from "lucide-react";

interface ActivityItemProps {
    activity: {
        type: string;
        description: string;
        amount: number;
        timestamp: Date;
        metadata?: any;
    };
}

export function ActivityItem({ activity }: ActivityItemProps) {
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'tpia_purchase':
                return <ShoppingCart className="w-4 h-4 text-blue-600" />;
            case 'deposit':
                return <TrendingUp className="w-4 h-4 text-emerald-600" />;
            case 'withdrawal':
                return <Wallet className="w-4 h-4 text-amber-600" />;
            case 'cycle_profit':
                return <TrendingUp className="w-4 h-4 text-emerald-600" />;
            default:
                return <Activity className="w-4 h-4 text-gray-600" />;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'tpia_purchase':
                return 'bg-blue-50';
            case 'deposit':
                return 'bg-emerald-50';
            case 'withdrawal':
                return 'bg-amber-50';
            case 'cycle_profit':
                return 'bg-emerald-50';
            default:
                return 'bg-gray-50';
        }
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - new Date(date).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">
                        {formatTimeAgo(activity.timestamp)}
                    </p>
                    {activity.metadata?.tpiaNumber && (
                        <>
                            <span className="text-xs text-gray-300">•</span>
                            <p className="text-xs text-gray-500 font-mono">
                                {activity.metadata.tpiaNumber}
                            </p>
                        </>
                    )}
                </div>
            </div>
            {activity.amount > 0 && (
                <p className={`text-sm font-bold ${activity.type === 'withdrawal' ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                    {activity.type === 'withdrawal' ? '-' : '+'}₦{activity.amount.toLocaleString()}
                </p>
            )}
        </div>
    );
}
