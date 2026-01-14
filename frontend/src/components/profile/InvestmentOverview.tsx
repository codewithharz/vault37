import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface InvestmentOverviewProps {
    summary: any;
    diversification: any[];
    performanceHistory: any[];
}

export function InvestmentOverview({ summary, diversification = [], performanceHistory = [] }: InvestmentOverviewProps) {
    const totalInvested = summary?.totalInvested || 0;
    const currentValue = summary?.currentValue || 0;
    const totalProfit = summary?.totalProfitEarned || 0;
    const roi = summary?.overallROI || 0;

    // Colors for pie chart
    const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#EC4899'];

    // Format performance history for chart
    const chartData = performanceHistory.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
        profit: item.profit
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Investment Overview</h2>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">Total Invested</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 font-mono">₦{totalInvested.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">Current Value</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 font-mono">₦{currentValue.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-amber-600" />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">Total Profit</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600 font-mono">₦{totalProfit.toLocaleString()}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-sm text-gray-600 font-medium">Overall ROI</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 font-mono">{roi.toFixed(1)}%</p>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Chart */}
                {chartData.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                            Performance History
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={chartData}>
                                <XAxis
                                    dataKey="date"
                                    stroke="#9CA3AF"
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    style={{ fontSize: '12px' }}
                                    tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, 'Profit']}
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="profit"
                                    stroke="#10B981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10B981', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Asset Allocation Pie Chart */}
                {diversification.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-amber-600" />
                            Asset Allocation
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={diversification}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry: any) => `${entry.name} ${entry.percentage.toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="percentage"
                                >
                                    {diversification.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any, name, props) => [
                                        `${Number(value).toFixed(1)}% (₦${props.payload.amount.toLocaleString()})`,
                                        props.payload.name
                                    ]}
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #E5E7EB',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Diversification List */}
                {diversification.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Breakdown</h3>
                        <div className="space-y-3">
                            {diversification.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        >
                                            {item.icon || '📦'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-500">{item.count} TPIAs</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">₦{item.amount.toLocaleString()}</p>
                                        <p className="text-sm text-gray-500">{item.percentage.toFixed(1)}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
