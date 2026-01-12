"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
    PieChart as PieChartIcon,
    ChevronRight,
    TrendingUp,
    Shield,
    ArrowUpRight,
    Search,
    Wallet,
    Info,
    Calendar,
    BarChart3,
    Activity
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";
import { TPIADetailsModal } from "@/components/user/TPIADetailsModal";

interface TPIA {
    id: string;
    tpiaNumber: number;
    commodity: string;
    symbol: string;
    amount: number;
    currentValue: number;
    profit: number;
    status: string;
    daysRemaining: number;
    currentCycle: number;
    totalCycles: number;
    userMode: string;
}

interface PortfolioData {
    summary: {
        totalInvested: number;
        currentValue: number;
        totalProfitEarned: number;
        overallROI: number;
        activeCount: number;
        maturedCount: number;
    };
    diversification: Array<{
        name: string;
        amount: number;
        percentage: number;
        icon: string;
        symbol: string;
    }>;
    performanceHistory: Array<{
        date: string;
        profit: number;
    }>;
    tpias: TPIA[];
}

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#6366F1', '#EC4899', '#8B5CF6'];

export default function PortfolioPage() {
    const t = useTranslations("Portfolio");
    const [data, setData] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTpia, setSelectedTpia] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const response = await api.get('/users/portfolio');
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch portfolio", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPortfolio();
    }, []);

    const handleViewDetails = async (tpiaId: string) => {
        try {
            const response = await api.get(`/tpia/${tpiaId}`);
            if (response.data.success) {
                setSelectedTpia(response.data.data.tpia);
                setIsDetailsOpen(true);
            }
        } catch (error) {
            console.error("Failed to fetch TPIA details", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Loading your portfolio...</p>
                </div>
            </div>
        );
    }

    if (!data || data.tpias.length === 0) {
        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-gray-900">{t("title")}</h2>
                    <p className="text-gray-500 font-medium">{t("subtitle")}</p>
                </div>
                <Card className="border-dashed border-2 py-20 bg-gray-50/50">
                    <CardContent className="text-center">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <PieChartIcon className="h-10 w-10 text-amber-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{t("noTPIAs")}</h3>
                        <p className="text-gray-500 mt-2 max-w-md mx-auto">
                            You haven't started your investment journey yet. Visit the marketplace to explore commodity-backed assets.
                        </p>
                        <Button className="mt-8 bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-200">
                            Explore Marketplace
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const filteredTpias = data.tpias.filter(tpia =>
        (tpia.commodity?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (tpia.tpiaNumber?.toString() || "").includes(searchQuery) ||
        (tpia.symbol?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-gray-900 drop-shadow-sm">{t("title")}</h2>
                    <p className="text-gray-500 font-semibold">{t("subtitle")}</p>
                </div>
                <div className="relative w-full md:w-64 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all shadow-sm font-medium text-sm"
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="h-full bg-gradient-to-br from-amber-500 to-amber-600 border-none text-white shadow-xl shadow-amber-100/50 hover:scale-[1.02] transition-transform cursor-default overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet className="w-16 h-16" />
                    </div>
                    <CardContent className="p-6 relative h-full flex flex-col justify-between">
                        <div>
                            <p className="text-amber-100 text-xs font-black uppercase tracking-widest">{t("totalValue")}</p>
                            <h3 className="text-3xl font-black mt-1 tracking-tight">₦{data.summary.currentValue.toLocaleString()}</h3>
                        </div>
                        <div className="flex items-center gap-1.5 mt-4 text-xs font-bold bg-white/20 w-fit px-2 py-1 rounded-lg backdrop-blur-sm">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            +{data.summary.overallROI.toFixed(1)}% Total ROI
                        </div>
                    </CardContent>
                </Card>

                <Card className="h-full hover:shadow-lg transition-all border-gray-100 bg-white group hover:border-blue-100">
                    <CardContent className="p-6 h-full flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{t("profit")}</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight group-hover:text-blue-600 transition-colors">₦{data.summary.totalProfitEarned.toLocaleString()}</h3>
                    </CardContent>
                </Card>

                <Card className="h-full hover:shadow-lg transition-all border-gray-100 bg-white group hover:border-green-100">
                    <CardContent className="p-6 h-full flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Activity className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{t("activeAssets")}</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight group-hover:text-green-600 transition-colors">{data.summary.activeCount} TPIAs</h3>
                    </CardContent>
                </Card>

                <Card className="h-full hover:shadow-lg transition-all border-gray-100 bg-white group hover:border-indigo-100">
                    <CardContent className="p-6 h-full flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                                <Shield className="h-5 w-5" />
                            </div>
                        </div>
                        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{t("insurance")}</p>
                        <h3 className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight group-hover:text-indigo-600 transition-colors">100% Protected</h3>
                    </CardContent>
                </Card>
            </div>

            {/* Insights and Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white border-gray-100 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                                    <BarChart3 className="h-4 w-4" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">{t("growth")}</h3>
                            </div>
                            <Info className="h-4 w-4 text-gray-300 cursor-help" />
                        </div>
                        <div className="h-[280px] w-full">
                            {data.performanceHistory.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.performanceHistory}>
                                        <defs>
                                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 700 }}
                                            dy={10}
                                        />
                                        <YAxis hide />
                                        <RechartsTooltip
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: 'none',
                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                padding: '12px'
                                            }}
                                            itemStyle={{ fontWeight: 800, color: '#f59e0b' }}
                                            formatter={(value: number | undefined) => [
                                                value ? `₦${value.toLocaleString()}` : '₦0',
                                                'Profit'
                                            ]}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="profit"
                                            stroke="#F59E0B"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorProfit)"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                    <Activity className="h-8 w-8 text-gray-300 mb-2" />
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                        Data Accumulating...<br />
                                        <span className="text-[10px] font-medium normal-case text-gray-400">Returns are logged at the end of each trade cycle.</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-gray-100 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                    <PieChartIcon className="h-4 w-4" />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 tracking-tight">{t("distribution")}</h3>
                            </div>
                            <Info className="h-4 w-4 text-gray-300 cursor-help" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] items-center gap-6">
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.diversification}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={95}
                                            paddingAngle={5}
                                            dataKey="amount"
                                            animationDuration={1500}
                                            cornerRadius={5}
                                        >
                                            {data.diversification.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: 'none',
                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                fontSize: '12px',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                                {data.diversification.map((item, index) => (
                                    <div key={item.name} className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <div>
                                                <p className="text-xs font-black text-gray-900 uppercase tracking-tighter leading-none">{item.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{item.symbol}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-gray-900">₦{item.amount.toLocaleString()}</p>
                                            <div className="flex items-center justify-end gap-1 mt-0.5">
                                                <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-500" style={{ width: `${item.percentage}%` }}></div>
                                                </div>
                                                <span className="text-[10px] text-amber-600 font-black">{item.percentage.toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Assets List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Active Holdings ({filteredTpias.length})</h3>
                </div>

                {filteredTpias.length === 0 ? (
                    <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed text-gray-400 font-medium">
                        No assets found matching your search.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredTpias.map((tpia) => (
                            <Card key={tpia.id} className="hover:shadow-lg transition-all border-gray-100 group overflow-hidden bg-white border-l-4 border-l-amber-500">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row p-6 items-center gap-6">
                                        <div className="flex-1 w-full space-y-4">
                                            <div className="flex items-center justify-between md:justify-start gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={tpia.status === 'active' ? 'success' : 'default'} className="px-3 py-1 font-black text-[10px] tracking-widest">
                                                        {tpia.status.toUpperCase()}
                                                    </Badge>
                                                    <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                                                        TPIA-{tpia.tpiaNumber}
                                                    </span>
                                                </div>
                                                <div className="md:hidden">
                                                    <p className="text-xl font-black text-gray-900">₦{tpia.currentValue.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center font-black text-amber-600 text-lg shadow-sm">
                                                    {tpia.symbol}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-gray-900 leading-tight group-hover:text-amber-600 transition-colors uppercase tracking-tight">{tpia.commodity}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-black">
                                                            <Calendar className="h-3 w-3" />
                                                            Next: {tpia.daysRemaining} Days
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[10px] text-blue-600 font-black">
                                                            <Shield className="h-3 w-3" />
                                                            Fully Covered
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="hidden md:block text-right w-48">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Current Value</p>
                                            <p className="text-2xl font-black text-gray-900 tracking-tight">₦{tpia.currentValue.toLocaleString()}</p>
                                            <p className="text-[10px] font-black text-green-600 flex items-center justify-end gap-1 mt-1">
                                                <ArrowUpRight className="h-3 w-3" />
                                                ROI +₦{tpia.profit.toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="w-full md:w-auto flex flex-col items-center gap-3">
                                            <div className="w-full md:w-32 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-amber-500 h-full rounded-full transition-all duration-1000 group-hover:bg-amber-600"
                                                    style={{ width: `${(tpia.currentCycle / tpia.totalCycles) * 100}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Cycle {tpia.currentCycle}/{tpia.totalCycles}</p>
                                        </div>

                                        <div className="w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-50 flex items-center justify-center">
                                            <Button
                                                onClick={() => handleViewDetails(tpia.id)}
                                                variant="outline"
                                                className="w-full md:w-auto border-2 border-gray-100 hover:border-amber-500 hover:bg-amber-50 rounded-xl px-5 py-3 group/btn"
                                            >
                                                <span className="font-black text-xs uppercase tracking-widest text-gray-600 group-hover/btn:text-amber-700">View Asset</span>
                                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover/btn:text-amber-600 group-hover/btn:translate-x-1 transition-all" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {selectedTpia && (
                <TPIADetailsModal
                    isOpen={isDetailsOpen}
                    onClose={() => setIsDetailsOpen(false)}
                    tpia={selectedTpia}
                />
            )}
        </div>
    );
}
