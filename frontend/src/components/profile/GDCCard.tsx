"use client";

import { Package } from "lucide-react";

interface GDCCardProps {
    gdc: {
        _id: string;
        gdcNumber: number;
        commodityId: {
            name: string;
            icon: string;
        };
        status: string;
        currentCycle: number;
        totalCycles: number;
        currentFill: number;
        capacity: number;
        userTPIACount: number;
        userTotalValue: number;
        warehouse?: {
            name: string;
            location: string;
        };
    };
}

export function GDCCard({ gdc }: GDCCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
            case 'cycling':
                return 'bg-emerald-100 text-emerald-700';
            case 'filling':
                return 'bg-amber-100 text-amber-700';
            case 'completed':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-blue-100 text-blue-700';
        }
    };

    return (
        <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-2xl">
                        {gdc.commodityId?.icon || '📦'}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">GDC-{gdc.gdcNumber}</p>
                        <p className="text-sm text-gray-600">{gdc.commodityId?.name || 'Commodity'}</p>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(gdc.status)}`}>
                    {gdc.status}
                </span>
            </div>

            {/* Visual Timeline */}
            <div className="mb-4 px-2">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Start</span>
                    <span>Cycle {gdc.currentCycle}</span>
                    <span>Goal {gdc.totalCycles}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                    <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(gdc.currentCycle / gdc.totalCycles) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* User Participation */}
            <div className="bg-amber-50 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Your TPIAs</p>
                        <p className="text-lg font-bold text-gray-900">
                            {gdc.userTPIACount} / {gdc.capacity}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Total Value</p>
                        <p className="text-lg font-bold text-amber-600">
                            ₦{gdc.userTotalValue.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* GDC Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="text-gray-500">Fill Status</p>
                    <p className="font-semibold text-gray-900">
                        {gdc.currentFill} / {gdc.capacity} TPIAs
                    </p>
                </div>
                {gdc.warehouse && (
                    <div>
                        <p className="text-gray-500">Warehouse</p>
                        <p className="font-semibold text-gray-900 truncate">
                            {gdc.warehouse.name}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
