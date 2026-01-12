"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
    TrendingUp,
    ArrowUpRight,
    BarChart3,
    PieChart as PieChartIcon,
    Calendar,
    Target
} from "lucide-react";
import api from "@/lib/api";

const COLORS = ['#d97706', '#1e40af', '#10b981', '#ef4444', '#8b5cf6'];

export default function GrowthPage() {
    const t = useTranslations("Growth");
    const [loading, setLoading] = useState(true);
    const [portfolioData, setPortfolioData] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchGrowthData = async () => {
            try {
                const response = await api.get('/users/portfolio');
                const data = response.data.data;
                setPortfolioData(data);

                // Simulate growth chart data based on current value/invested
                // In a real app, the backend would provide time-series data
                const invested = data.summary.totalInvested;
                const current = data.summary.currentValue;

                const mockHistory = [
                    { name: 'Month 1', value: invested * 0.95 },
                    { name: 'Month 2', value: invested },
                    { name: 'Month 3', value: invested * 1.05 },
                    { name: 'Month 4', value: current * 0.98 },
                    { name: 'Current', value: current }
                ];
                setChartData(mockHistory);
            } catch (error) {
                console.error("Failed to fetch growth data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGrowthData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">{t("loading") || "Loading Analytics..."}</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">{t("title")}</h2>
                    <p className="text-gray-500">{t("subtitle")}</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="success" className="py-1 px-3">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{portfolioData?.summary?.overallROI.toFixed(1)}% {t("allTime")}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-amber-600" />
                                {t("portfolioGrowth")}
                            </h3>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#9ca3af"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `₦${(value / 1000).toLocaleString()}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => [`₦${value.toLocaleString()}`, t("portfolioValue")]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#d97706"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <PieChartIcon className="h-4 w-4 text-amber-600" />
                            {t("earningsByCommodity")}
                        </h3>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={portfolioData?.diversification || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {(portfolioData?.diversification || []).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-2">
                            {(portfolioData?.diversification || []).map((item: any, index: number) => (
                                <div key={item.name} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="font-bold text-gray-900">₦{item.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <Target className="h-4 w-4 text-amber-600" />
                            {t("calculator")}
                        </h3>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="text-sm text-gray-500 mb-1">{t("estimatedValue")} (6 Months)</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    ₦{(portfolioData?.summary?.currentValue * 1.48).toLocaleString()}
                                </div>
                                <div className="text-xs text-green-600 font-semibold flex items-center mt-1">
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                    {t("projectedProfitDesc")} (+48%)
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 italic">
                                {t("calcNote")}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-amber-600" />
                            {t("projectedReturns")}
                        </h3>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { label: t('next30'), amount: portfolioData?.summary?.totalInvested * 0.08, color: 'text-amber-600' },
                                { label: t('next90'), amount: portfolioData?.summary?.totalInvested * 0.24, color: 'text-amber-700' },
                                { label: t('yearly'), amount: portfolioData?.summary?.totalInvested * 0.96, color: 'text-gray-900' }
                            ].map((row) => (
                                <div key={row.label} className="flex items-center justify-between p-3 border-b border-gray-50 last:border-0">
                                    <span className="text-sm text-gray-600">{row.label}</span>
                                    <span className={`text-sm font-bold ${row.color}`}>₦{row.amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
