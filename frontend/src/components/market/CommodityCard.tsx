import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TrendingUp, TrendingDown, Info, CheckCircle2 } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { Tooltip } from "@/components/ui/Tooltip";

interface Commodity {
    _id: string;
    name: string;
    symbol: string;
    navPrice: number;
    description?: string;
    recentHistory?: { date: string | Date; price: number }[];
    change24h?: number;
    availableSlots?: number;
    roiPercent?: number;
    cycleDays?: number;
    tpiaNumber?: number;
    gdcNumber?: number;
}

interface CommodityCardProps {
    commodity: Commodity;
    onInvest?: (commodity: Commodity) => void;
    isPurchased?: boolean;
    onTPIAClick?: (tpiaId: string) => void;
}

export const CommodityCard: React.FC<CommodityCardProps> = ({ commodity, onInvest, isPurchased = false, onTPIAClick }) => {
    const isPositive = (commodity.change24h || 0) >= 0;
    const historyData = commodity.recentHistory?.map(h => ({
        ...h,
        price: Number(h.price)
    })) || [];

    const handleCardClick = () => {
        if (isPurchased && onTPIAClick) {
            onTPIAClick(commodity._id);
        }
    };

    const slotsFilled = 10 - (commodity.availableSlots || 10);
    const progressPercent = (slotsFilled / 10) * 100;

    return (
        <div
            className={isPurchased && onTPIAClick ? 'cursor-pointer' : ''}
            onClick={handleCardClick}
        >
            <Card className="hover:shadow-xl transition-all duration-300 border-gray-200 group hover:border-amber-400 relative">
                {/* Smart Badges */}
                {!isPurchased && (
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                        {commodity.availableSlots && commodity.availableSlots <= 2 && (
                            <Badge className="bg-red-500 text-white border-0 animate-pulse text-[10px] px-2 py-0.5 font-black uppercase tracking-tighter shadow-md">
                                ⌛ ALMOST FULL
                            </Badge>
                        )}
                        {(commodity.availableSlots || 0) >= 7 && (
                            <Badge className="bg-orange-500 text-white border-0 text-[10px] px-2 py-0.5 font-black uppercase tracking-tighter shadow-md animate-bounce">
                                🔥 HOT
                            </Badge>
                        )}
                    </div>
                )}

                <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center border border-amber-100 shadow-sm group-hover:scale-110 transition-transform">
                                <span className="text-lg font-bold text-amber-700">{(commodity.symbol || "?").substring(0, 1)}</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 leading-none group-hover:text-amber-700 transition-colors">{commodity.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{commodity.symbol || "N/A"}</span>
                                    {isPurchased && commodity.tpiaNumber && (
                                        <div className="flex items-center gap-1">
                                            <div className="h-1 w-1 rounded-full bg-gray-300" />
                                            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 uppercase tracking-tighter">
                                                TPIA-{commodity.tpiaNumber} / GDC-{commodity.gdcNumber}
                                            </span>
                                        </div>
                                    )}
                                    {!isPurchased && commodity.gdcNumber && (
                                        <div className="flex items-center gap-1">
                                            <div className="h-1 w-1 rounded-full bg-gray-300" />
                                            <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 uppercase tracking-tighter">
                                                Target: GDC-{commodity.gdcNumber}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {commodity.change24h !== undefined && (
                                <Tooltip position="bottom" content="Price change of the underlying physical commodity asset since the last NAV update.">
                                    <Badge variant={isPositive ? "success" : "error"} className={`
                                        ${isPositive ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}
                                        border-0 font-mono font-medium tracking-tight cursor-help
                                    `}>
                                        {isPositive ? '+' : ''}{commodity.change24h.toFixed(2)}%
                                    </Badge>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs text-gray-500 font-medium mb-0.5">Investment</p>
                            <p className="text-2xl font-black text-gray-900 tracking-tighter">
                                ₦1,000,000
                            </p>
                        </div>
                        <div className="text-right">
                            <Tooltip position="bottom" content="Fixed return per trade cycle">
                                <div className="flex items-center space-x-1 cursor-help group-hover:scale-105 transition-transform">
                                    <p className="text-xs text-amber-700 font-black bg-amber-100 px-2 py-1 rounded-md border border-amber-200 shadow-sm">
                                        {commodity.roiPercent || 5}% / {commodity.cycleDays || 37}D
                                    </p>
                                </div>
                            </Tooltip>
                        </div>
                    </div>

                    <div className="h-16 w-full -mx-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historyData}>
                                <defs>
                                    <linearGradient id={`gradient-${commodity._id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f59e0b"} stopOpacity={0.1} />
                                        <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f59e0b"} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <YAxis domain={['dataMin', 'dataMax']} hide />
                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke={isPositive ? "#10b981" : "#f59e0b"}
                                    strokeWidth={2}
                                    fill={`url(#gradient-${commodity._id})`}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="pt-2">
                        <div className="mb-4">
                            <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-black uppercase tracking-widest">
                                <span>Cluster Status</span>
                                <span className="text-amber-600">{slotsFilled}/10 Filled</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-1000"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>

                            {/* 10-Dot Interactive Grid */}
                            <div className="flex justify-between gap-1 px-0.5">
                                {[...Array(10)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < slotsFilled
                                            ? "bg-amber-600 shadow-sm shadow-amber-200"
                                            : "bg-gray-200"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {!isPurchased && onInvest && (
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onInvest(commodity);
                                }}
                                className="w-full bg-slate-900 text-white hover:bg-amber-600 shadow-lg shadow-gray-200 transition-all active:scale-[0.98] font-bold h-10 border-0"
                            >
                                Invest Now
                            </Button>
                        )}
                        {isPurchased && (
                            <div className="w-full bg-green-50 text-green-700 py-2 rounded-lg text-center text-xs font-black border border-green-200 flex items-center justify-center gap-2 shadow-sm uppercase tracking-tighter">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Active Asset
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
