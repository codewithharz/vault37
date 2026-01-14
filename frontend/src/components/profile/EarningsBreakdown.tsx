"use client";

import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface EarningsBreakdownProps {
    earnings: {
        byCommodity: { name: string; value: number; color: string }[];
        history: { month: string; amount: number }[];
    };
}

export function EarningsBreakdown({ earnings }: EarningsBreakdownProps) {
    const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#6366F1'];

    // Mock data if empty
    const pieData = earnings?.byCommodity?.length > 0 ? earnings.byCommodity : [
        { name: 'Gold', value: 4000, color: '#F59E0B' },
        { name: 'Agro', value: 2500, color: '#10B981' },
    ];

    const areaData = earnings?.history?.length > 0 ? earnings.history : [
        { month: 'Jan', amount: 1200 },
        { month: 'Feb', amount: 1800 },
        { month: 'Mar', amount: 2400 },
        { month: 'Apr', amount: 3100 },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
            {/* Earnings by Commodity */}
            <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Earnings by Commodity</h4>
                <div className="flex items-center gap-4">
                    <div className="h-40 w-40 flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 flex-1">
                        {pieData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}></div>
                                    <span className="text-gray-600">{item.name}</span>
                                </div>
                                <span className="font-semibold text-gray-900">₦{item.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Monthly Trend */}
            <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Monthly Trend</h4>
                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={areaData}>
                            <defs>
                                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, 'Earnings']}
                            />
                            <Area type="monotone" dataKey="amount" stroke="#F59E0B" fillOpacity={1} fill="url(#colorEarnings)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
