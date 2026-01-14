"use client";

import { useState, useEffect } from "react";
import { Building2, Package, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import { GDCCard } from "./GDCCard";

interface GDCData {
    _id: string;
    gdcNumber: number;
    commodityId: {
        name: string;
        icon: string;
        symbol: string;
    };
    status: string;
    currentCycle: number;
    totalCycles: number;
    currentFill: number;
    capacity: number;
    userTPIACount: number;
    userTotalValue: number;
    nextCycleDate?: Date;
    warehouse?: {
        name: string;
        location: string;
    };
}

export function GDCParticipation() {
    const [gdcData, setGdcData] = useState<GDCData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGDCData = async () => {
            try {
                const response = await api.get('/gdc/user-participation');
                setGdcData(response.data.data.gdcs || []);
            } catch (error) {
                console.error("Failed to fetch GDC data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGDCData();
    }, []);

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

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (gdcData.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">GDC Participation</h3>
                </div>
                <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">No GDC participation yet</p>
                    <p className="text-sm text-gray-500 mt-1">Purchase a TPIA to join a GDC cluster</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">GDC Participation</h3>
                </div>
                <span className="text-sm font-semibold text-gray-600">
                    {gdcData.length} Cluster{gdcData.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['All', 'Agro', 'Solid Minerals', 'Energy'].map((filter) => (
                    <button
                        key={filter}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${true ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    // onClick={() => setFilter(filter.toLowerCase())} // TODO: Implement state
                    >
                        {filter}
                    </button>
                ))}
            </div>

            <div className="space-y-4 max-h-[720px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {gdcData.map((gdc) => (
                    <GDCCard key={gdc._id} gdc={gdc} />
                ))}
            </div>
        </div>
    );
}
