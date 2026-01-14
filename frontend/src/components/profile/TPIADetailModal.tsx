"use client";

import { useState } from "react";
import { X, TrendingUp, Calendar, Package, Shield, Download } from "lucide-react";

interface TPIADetailModalProps {
    tpia: any;
    isOpen: boolean;
    onClose: () => void;
}

export function TPIADetailModal({ tpia, isOpen, onClose }: TPIADetailModalProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'projections'>('overview');

    if (!isOpen || !tpia) return null;

    const profitPercentage = tpia.amount > 0
        ? ((tpia.profit / tpia.amount) * 100).toFixed(1)
        : '0.0';

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'history', label: 'Cycle History' },
        { id: 'projections', label: 'Projections' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white md:rounded-2xl shadow-2xl w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-lg flex items-center justify-center text-xl md:text-2xl">
                            {tpia.symbol || '📦'}
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{tpia.tpiaNumber}</h2>
                            <p className="text-xs md:text-sm text-gray-600">{tpia.commodity} TPIA</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-4 md:px-6 shrink-0 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 md:px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${activeTab === tab.id
                                ? 'text-amber-600'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Value Summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-600 mb-1">Base Amount</p>
                                    <p className="text-2xl font-bold text-gray-900">₦{tpia.amount?.toLocaleString()}</p>
                                </div>
                                <div className="bg-emerald-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-600 mb-1">Current Value</p>
                                    <p className="text-2xl font-bold text-emerald-600">₦{tpia.currentValue?.toLocaleString()}</p>
                                </div>
                                <div className="bg-amber-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-600 mb-1">Total Profit</p>
                                    <p className="text-2xl font-bold text-amber-600">+₦{tpia.profit?.toLocaleString()}</p>
                                    <p className="text-xs text-gray-600 mt-1">+{profitPercentage}% ROI</p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">TPIA Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Status</span>
                                            <span className="text-sm font-semibold text-gray-900 capitalize">{tpia.status}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Current Cycle</span>
                                            <span className="text-sm font-semibold text-gray-900">{tpia.currentCycle} / {tpia.totalCycles}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Days Remaining</span>
                                            <span className="text-sm font-semibold text-gray-900">{tpia.daysRemaining || 0} days</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Investment Mode</span>
                                            <span className="text-sm font-semibold text-gray-900">{tpia.userMode || 'TPM'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">Dates</h3>
                                    <div className="space-y-3">
                                        {tpia.maturityDate && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Maturity Date</span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {new Date(tpia.maturityDate).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Insurance */}
                            {tpia.insurancePolicyNumber && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <Shield className="w-5 h-5 text-emerald-600 shrink-0" />
                                            <div>
                                                <p className="font-semibold text-gray-900">Insurance Protected</p>
                                                <p className="text-sm text-gray-600 break-all">Policy: {tpia.insurancePolicyNumber}</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 w-full sm:w-auto">
                                            <Download className="w-4 h-4" />
                                            Certificate
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Cycle Completion History</h3>
                            <div className="bg-gray-50 rounded-xl p-6 text-center">
                                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">Cycle history coming soon</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    View detailed profit history for each completed cycle
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'projections' && (
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Profit Projections</h3>
                            <div className="space-y-4">
                                <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-xl p-6">
                                    <p className="text-sm text-gray-600 mb-2">Estimated Final Value at Maturity</p>
                                    <p className="text-3xl font-bold text-amber-600 mb-4">
                                        ₦{((tpia.currentValue || 0) * 1.5).toLocaleString()}
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Remaining Cycles</p>
                                            <p className="font-semibold text-gray-900">{tpia.totalCycles - tpia.currentCycle}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Estimated Profit</p>
                                            <p className="font-semibold text-emerald-600">
                                                +₦{((tpia.currentValue || 0) * 0.5).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                    * Projections are estimates based on current performance and may vary
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-3 p-4 md:p-6 border-t border-gray-200 bg-gray-50 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full md:w-auto px-6 py-3 md:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        Close
                    </button>
                    <button className="w-full md:w-auto px-6 py-3 md:py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Download Statement
                    </button>
                </div>
            </div>
        </div>
    );
}
