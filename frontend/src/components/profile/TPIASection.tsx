"use client";

import { useState } from "react";
import { Filter, Grid3x3, List, ChevronDown } from "lucide-react";
import { TPIACard } from "./TPIACard";
import { TPIADetailModal } from "./TPIADetailModal";

interface TPIASectionProps {
    tpias: any[];
}

export function TPIASection({ tpias = [] }: TPIASectionProps) {
    const [selectedTPIA, setSelectedTPIA] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [commodityFilter, setCommodityFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('date');
    const [visibleLimit, setVisibleLimit] = useState(6);

    const toggleLimit = () => {
        if (visibleLimit >= tpias.length) {
            setVisibleLimit(6);
            // Optional: scroll back to top of section
        } else {
            setVisibleLimit(tpias.length);
        }
    };

    // Get unique commodities for filter
    const uniqueCommodities = Array.from(new Set(tpias.map(t => t.commodity))).filter(Boolean);

    // Apply filters
    const filteredTPIAs = tpias.filter(tpia => {
        if (statusFilter !== 'all' && tpia.status !== statusFilter) return false;
        if (commodityFilter !== 'all' && tpia.commodity !== commodityFilter) return false;
        return true;
    });

    // Apply sorting
    const sortedTPIAs = [...filteredTPIAs].sort((a, b) => {
        switch (sortBy) {
            case 'value':
                return (b.currentValue || 0) - (a.currentValue || 0);
            case 'profit':
                return (b.profit || 0) - (a.profit || 0);
            case 'date':
            default:
                return new Date(b.maturityDate || 0).getTime() - new Date(a.maturityDate || 0).getTime();
        }
    });

    const handleViewDetails = (tpia: any) => {
        setSelectedTPIA(tpia);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">My TPIAs</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {filteredTPIAs.length} of {tpias.length} TPIAs
                    </p>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                            ? 'bg-white text-amber-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                            ? 'bg-white text-amber-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Filters:</span>
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="cycling">Cycling</option>
                            <option value="matured">Matured</option>
                            <option value="pending">Pending</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Commodity Filter */}
                    <div className="relative">
                        <select
                            value={commodityFilter}
                            onChange={(e) => setCommodityFilter(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer"
                        >
                            <option value="all">All Commodities</option>
                            {uniqueCommodities.map((commodity) => (
                                <option key={commodity} value={commodity}>
                                    {commodity}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Sort */}
                    <div className="relative ml-auto">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer"
                        >
                            <option value="date">Sort by Date</option>
                            <option value="value">Sort by Value</option>
                            <option value="profit">Sort by Profit</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* TPIA Grid/List */}
            {sortedTPIAs.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Grid3x3 className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No TPIAs Found</h3>
                    <p className="text-gray-600 mb-6">
                        {tpias.length === 0
                            ? "You haven't purchased any TPIAs yet"
                            : "No TPIAs match your current filters"}
                    </p>
                    {tpias.length === 0 && (
                        <a
                            href="/dashboard/market"
                            className="inline-block px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                        >
                            Browse Marketplace
                        </a>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className={
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                            : 'space-y-4'
                    }>
                        {sortedTPIAs.slice(0, visibleLimit).map((tpia) => (
                            <TPIACard
                                key={tpia.id}
                                tpia={tpia}
                                viewMode={viewMode}
                                onViewDetails={() => handleViewDetails(tpia)}
                            />
                        ))}
                    </div>

                    {/* Pagination / Load More */}
                    {sortedTPIAs.length > 6 && (
                        <div className="flex justify-center">
                            <button
                                onClick={toggleLimit}
                                className="flex items-center gap-2 px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm text-sm font-medium"
                            >
                                {visibleLimit >= sortedTPIAs.length ? (
                                    <>
                                        Show Less <ChevronDown className="w-4 h-4 rotate-180" />
                                    </>
                                ) : (
                                    <>
                                        Show More ({sortedTPIAs.length - visibleLimit} remaining) <ChevronDown className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Detail Modal */}
            <TPIADetailModal
                tpia={selectedTPIA}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
